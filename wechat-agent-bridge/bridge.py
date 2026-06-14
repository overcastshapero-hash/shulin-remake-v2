#!/usr/bin/env python3
"""Local HTTP/JSONL bridge from wx-cli to agents."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import threading
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG = {
    "wx_bin": "wx",
    "data_dir": "./data",
    "allowed_chat_types": ["group"],
    "allowed_chats": [],
    "session_scan_limit": 50,
    "default_limit": 100,
    "max_limit": 1000,
    "token": "",
    "redact_session_summary": False,
}


class BridgeError(RuntimeError):
    def __init__(self, message: str, status: int = 500):
        super().__init__(message)
        self.status = status


def load_config(path: Path | None = None) -> dict[str, Any]:
    config = dict(DEFAULT_CONFIG)
    config_path = path or ROOT / "config.json"
    if config_path.exists():
        with config_path.open("r", encoding="utf-8") as f:
            config.update(json.load(f))
    config["data_dir"] = str((ROOT / config["data_dir"]).resolve()) if not Path(config["data_dir"]).is_absolute() else config["data_dir"]
    env_token = os.getenv("WECHAT_BRIDGE_TOKEN")
    if env_token:
        config["token"] = env_token
    return config


def write_default_config(path: Path) -> None:
    if path.exists():
        print(f"exists: {path}")
        return
    with path.open("w", encoding="utf-8") as f:
        json.dump(DEFAULT_CONFIG, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"created: {path}")


def limit_value(raw: str | None, config: dict[str, Any]) -> int:
    if raw in (None, ""):
        value = int(config["default_limit"])
    else:
        value = int(raw)
    return max(1, min(value, int(config["max_limit"])))


def wx_json(config: dict[str, Any], args: list[str], timeout: int = 90) -> dict[str, Any]:
    cmd = [str(config["wx_bin"]), *args]
    if "--json" not in cmd:
        cmd.append("--json")
    try:
        result = subprocess.run(cmd, text=True, capture_output=True, timeout=timeout, check=False)
    except FileNotFoundError as exc:
        raise BridgeError(f"wx binary not found: {config['wx_bin']}", 500) from exc
    except subprocess.TimeoutExpired as exc:
        raise BridgeError(f"wx command timed out: {' '.join(cmd)}", 504) from exc
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise BridgeError(f"wx command failed: {detail}", 502)
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise BridgeError(f"wx returned non-json output: {result.stdout[:300]}", 502) from exc
    if isinstance(data, list):
        return {"items": data}
    return data


def wx_text(config: dict[str, Any], args: list[str], timeout: int = 30) -> str:
    result = subprocess.run([str(config["wx_bin"]), *args], text=True, capture_output=True, timeout=timeout, check=False)
    return (result.stdout or result.stderr).strip()


def is_allowed_chat(item: dict[str, Any], config: dict[str, Any]) -> bool:
    allowed_types = set(config.get("allowed_chat_types") or [])
    if allowed_types and item.get("chat_type") not in allowed_types:
        return False
    allowed_chats = set(config.get("allowed_chats") or [])
    if not allowed_chats:
        return True
    return item.get("chat") in allowed_chats or item.get("username") in allowed_chats


def filter_messages(messages: list[dict[str, Any]], config: dict[str, Any]) -> list[dict[str, Any]]:
    return [m for m in messages if is_allowed_chat(m, config)]


def history_messages(data: dict[str, Any]) -> list[dict[str, Any]]:
    parent = {key: data.get(key) for key in ("chat", "chat_type", "username", "is_group") if key in data}
    rows = []
    for message in data.get("messages", []):
        item = dict(parent)
        item.update(message)
        rows.append(item)
    return rows


def sessions(config: dict[str, Any], chat_type: str | None = None, limit: int | None = None) -> dict[str, Any]:
    n = limit or int(config["default_limit"])
    data = wx_json(config, ["sessions", "--limit", str(n)])
    rows = data.get("sessions", data.get("messages", []))
    if chat_type:
        rows = [r for r in rows if r.get("chat_type") == chat_type]
    rows = [r for r in rows if is_allowed_chat(r, config)]
    if config.get("redact_session_summary"):
        for row in rows:
            row.pop("summary", None)
    return {"sessions": rows, "count": len(rows), "meta": data.get("meta", {})}


def history(config: dict[str, Any], chat: str, limit: int, since: str | None = None, until: str | None = None, msg_type: str | None = None) -> dict[str, Any]:
    if not chat:
        raise BridgeError("missing chat", 400)
    args = ["history", chat, "--limit", str(limit)]
    if since:
        args.extend(["--since", since])
    if until:
        args.extend(["--until", until])
    if msg_type:
        args.extend(["--type", msg_type])
    data = wx_json(config, args)
    messages = filter_messages(history_messages(data), config)
    if not messages:
        allowed_names = set()
        for item in sessions(config, limit=int(config["max_limit"])).get("sessions", []):
            allowed_names.add(item.get("chat"))
            allowed_names.add(item.get("username"))
        if allowed_names and chat not in allowed_names:
            raise BridgeError("chat is not allowed by config or is not a group chat", 403)
    return {"messages": messages, "count": len(messages), "meta": data.get("meta", {})}


def message_id(message: dict[str, Any]) -> str:
    stable = {
        "username": message.get("username"),
        "timestamp": message.get("timestamp"),
        "sender": message.get("sender") or message.get("sender_username"),
        "type": message.get("type"),
        "content": message.get("content"),
    }
    payload = json.dumps(stable, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]


def seen_path(config: dict[str, Any]) -> Path:
    return Path(config["data_dir"]) / "seen.json"


def load_seen(config: dict[str, Any]) -> list[str]:
    path = seen_path(config)
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else data.get("ids", [])


def save_seen(config: dict[str, Any], ids: list[str]) -> None:
    path = seen_path(config)
    path.parent.mkdir(parents=True, exist_ok=True)
    keep = ids[-50000:]
    with path.open("w", encoding="utf-8") as f:
        json.dump(keep, f, ensure_ascii=False, indent=2)
        f.write("\n")


def collect(config: dict[str, Any], limit: int) -> dict[str, Any]:
    session_data = sessions(config, chat_type="group", limit=int(config.get("session_scan_limit") or 50))
    messages: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    for row in session_data.get("sessions", []):
        chat = row.get("username") or row.get("chat")
        if not chat:
            continue
        try:
            data = wx_json(config, ["history", str(chat), "--limit", str(limit)])
        except BridgeError as exc:
            errors.append({"chat": str(row.get("chat") or chat), "error": str(exc)})
            continue
        messages.extend(filter_messages(history_messages(data), config))

    seen = load_seen(config)
    seen_set = set(seen)
    fresh: list[dict[str, Any]] = []
    for message in messages:
        mid = message_id(message)
        if mid in seen_set:
            continue
        item = dict(message)
        item["_id"] = mid
        item["_collected_at"] = datetime.now().isoformat(timespec="seconds")
        fresh.append(item)
        seen.append(mid)
        seen_set.add(mid)
    if fresh:
        out_dir = Path(config["data_dir"]) / "messages"
        out_dir.mkdir(parents=True, exist_ok=True)
        grouped: dict[str, list[dict[str, Any]]] = {}
        for item in fresh:
            day = datetime.fromtimestamp(int(item.get("timestamp") or time.time())).strftime("%Y-%m-%d")
            grouped.setdefault(day, []).append(item)
        for day, rows in grouped.items():
            with (out_dir / f"{day}.jsonl").open("a", encoding="utf-8") as f:
                for row in rows:
                    f.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
        save_seen(config, seen)
    fresh.sort(key=lambda item: int(item.get("timestamp") or 0))
    return {
        "messages": fresh,
        "count": len(fresh),
        "seen_total": len(seen),
        "scanned_sessions": len(session_data.get("sessions", [])),
        "errors": errors,
        "meta": session_data.get("meta", {}),
    }


def read_collected(config: dict[str, Any], day: str, chat: str | None, limit: int) -> dict[str, Any]:
    path = Path(config["data_dir"]) / "messages" / f"{day}.jsonl"
    rows: list[dict[str, Any]] = []
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                item = json.loads(line)
                if chat and item.get("chat") != chat and item.get("username") != chat:
                    continue
                if is_allowed_chat(item, config):
                    rows.append(item)
    rows = rows[-limit:]
    return {"messages": rows, "count": len(rows), "date": day}


def status(config: dict[str, Any]) -> dict[str, Any]:
    daemon = wx_text(config, ["daemon", "status"])
    session_data = sessions(config, chat_type=None, limit=50)
    return {
        "ok": True,
        "daemon": daemon,
        "allowed_chat_types": config.get("allowed_chat_types"),
        "allowed_chats_count": len(config.get("allowed_chats") or []),
        "sessions": {
            "count": session_data["count"],
            "groups": len([s for s in session_data["sessions"] if s.get("chat_type") == "group"]),
        },
        "data_dir": config["data_dir"],
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "WeChatAgentBridge/0.1"

    def log_message(self, fmt: str, *args: Any) -> None:
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def log_request(self, code: int | str = "-", size: int | str = "-") -> None:
        path = urlparse(self.path).path
        sys.stderr.write("[%s] %s %s %s\n" % (self.log_date_time_string(), self.command, path, code))

    @property
    def config(self) -> dict[str, Any]:
        return self.server.config  # type: ignore[attr-defined]

    def do_GET(self) -> None:
        try:
            self.authorize()
            parsed = urlparse(self.path)
            params = {k: v[-1] for k, v in parse_qs(parsed.query).items()}
            if parsed.path == "/health":
                self.reply(status(self.config))
            elif parsed.path == "/sessions":
                limit = limit_value(params.get("limit"), self.config)
                self.reply(sessions(self.config, params.get("type"), limit))
            elif parsed.path == "/messages":
                limit = limit_value(params.get("limit"), self.config)
                self.reply(history(self.config, params.get("chat", ""), limit, params.get("since"), params.get("until"), params.get("type")))
            elif parsed.path == "/new":
                limit = limit_value(params.get("limit"), self.config)
                if params.get("collect") in {"1", "true", "yes"}:
                    self.reply(collect(self.config, limit))
                else:
                    data = wx_json(self.config, ["new-messages", "--limit", str(limit)])
                    messages = filter_messages(data.get("messages", []), self.config)
                    self.reply({"messages": messages, "count": len(messages), "meta": data.get("meta", {})})
            elif parsed.path == "/collected":
                limit = limit_value(params.get("limit"), self.config)
                day = params.get("date") or datetime.now().strftime("%Y-%m-%d")
                self.reply(read_collected(self.config, day, params.get("chat"), limit))
            else:
                raise BridgeError("not found", 404)
        except BridgeError as exc:
            self.reply({"ok": False, "error": str(exc)}, exc.status)
        except Exception as exc:  # noqa: BLE001
            self.reply({"ok": False, "error": repr(exc)}, 500)

    def authorize(self) -> None:
        token = self.config.get("token") or ""
        if not token:
            return
        auth = self.headers.get("Authorization", "")
        header_token = self.headers.get("X-Bridge-Token", "")
        if auth == f"Bearer {token}" or header_token == token:
            return
        raise BridgeError("unauthorized", 401)

    def reply(self, payload: dict[str, Any], status_code: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def serve(config: dict[str, Any], host: str, port: int, poll_seconds: int) -> None:
    if poll_seconds > 0:
        def loop() -> None:
            while True:
                try:
                    collect(config, int(config["default_limit"]))
                except Exception as exc:  # noqa: BLE001
                    print(f"collect failed: {exc}", file=sys.stderr)
                time.sleep(poll_seconds)

        threading.Thread(target=loop, daemon=True).start()
    httpd = ThreadingHTTPServer((host, port), Handler)
    httpd.config = config  # type: ignore[attr-defined]
    print(f"WeChat Agent Bridge listening on http://{host}:{port}")
    httpd.serve_forever()


def main() -> int:
    parser = argparse.ArgumentParser(description="Local wx-cli bridge for agents")
    parser.add_argument("--config", default=str(ROOT / "config.json"))
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init")
    sub.add_parser("status")
    p_sessions = sub.add_parser("sessions")
    p_sessions.add_argument("--type", default="group")
    p_sessions.add_argument("--limit", type=int, default=None)
    p_history = sub.add_parser("messages")
    p_history.add_argument("chat")
    p_history.add_argument("--limit", type=int, default=None)
    p_history.add_argument("--since")
    p_history.add_argument("--until")
    p_history.add_argument("--type")
    p_collect = sub.add_parser("collect")
    p_collect.add_argument("--limit", type=int, default=None)
    p_collected = sub.add_parser("collected")
    p_collected.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"))
    p_collected.add_argument("--chat")
    p_collected.add_argument("--limit", type=int, default=None)
    p_serve = sub.add_parser("serve")
    p_serve.add_argument("--host", default="127.0.0.1")
    p_serve.add_argument("--port", type=int, default=8765)
    p_serve.add_argument("--poll-seconds", type=int, default=0)
    args = parser.parse_args()

    config_path = Path(args.config)
    if args.cmd == "init":
        write_default_config(config_path)
        return 0

    config = load_config(config_path)
    try:
        if args.cmd == "status":
            print(json.dumps(status(config), ensure_ascii=False, indent=2))
        elif args.cmd == "sessions":
            print(json.dumps(sessions(config, args.type, args.limit), ensure_ascii=False, indent=2))
        elif args.cmd == "messages":
            limit = args.limit or int(config["default_limit"])
            print(json.dumps(history(config, args.chat, limit, args.since, args.until, args.type), ensure_ascii=False, indent=2))
        elif args.cmd == "collect":
            limit = args.limit or int(config["default_limit"])
            print(json.dumps(collect(config, limit), ensure_ascii=False, indent=2))
        elif args.cmd == "collected":
            limit = args.limit or int(config["default_limit"])
            print(json.dumps(read_collected(config, args.date, args.chat, limit), ensure_ascii=False, indent=2))
        elif args.cmd == "serve":
            serve(config, args.host, args.port, args.poll_seconds)
    except BridgeError as exc:
        print(json.dumps({"ok": False, "error": str(exc), "status": exc.status}, ensure_ascii=False, indent=2), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
