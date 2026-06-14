# WeChat Agent Bridge

本地微信群消息桥接服务：底层复用已配置好的 `wx-cli`，上层提供 HTTP API 和 JSONL 采集文件，让 OpenClaw 或其他 agent 能稳定读取微信群消息。

默认只允许读取群聊，服务只绑定 `127.0.0.1`。不会读取或保存 `~/.wx-cli/all_keys.json`。

## 快速启动

```bash
cd /Users/hanwuyue/Downloads/树成林手册站-开源版/wechat-agent-bridge
python3 bridge.py init
python3 bridge.py status
python3 bridge.py sessions --type group
python3 bridge.py collect --limit 200
python3 bridge.py serve --port 8765
```

本机已安装 LaunchAgent，运行副本在 `/Users/hanwuyue/.local/share/wechat-agent-bridge`，正常使用不需要手动开服务：

```bash
launchctl print gui/$(id -u)/com.hanwuyue.wechat-agent-bridge
launchctl kickstart -k gui/$(id -u)/com.hanwuyue.wechat-agent-bridge
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.hanwuyue.wechat-agent-bridge.plist
```

OpenClaw 读取：

```bash
curl 'http://127.0.0.1:8765/health'
curl 'http://127.0.0.1:8765/sessions?type=group&limit=50'
curl --get 'http://127.0.0.1:8765/messages' --data-urlencode 'chat=群名' --data-urlencode 'limit=100'
curl 'http://127.0.0.1:8765/new?limit=200&collect=1'
```

## 配置

首次 `init` 会生成 `config.json`。核心字段：

- `allowed_chat_types`: 默认 `["group"]`，只允许群聊。
- `allowed_chats`: 默认空数组，表示允许全部群聊；填群名或 username 后只允许指定群。
- `token`: 可选。填了以后，HTTP 请求需要带 `Authorization: Bearer <token>` 或 `X-Bridge-Token: <token>`。
- `data_dir`: `collect` 写入的 JSONL 目录。

## API

- `GET /health`: 检查 `wx` daemon 和会话读取状态。
- `GET /sessions?type=group&limit=50`: 列出允许访问的会话。
- `GET /messages?chat=<群名>&limit=100&since=YYYY-MM-DD&until=YYYY-MM-DD&type=text`: 读取某个群历史消息。
- `GET /new?limit=200&collect=1`: 读取增量新消息；`collect=1` 时落盘。
- `GET /collected?date=YYYY-MM-DD&chat=<群名>&limit=200`: 读取已采集 JSONL。

## 采集文件

`collect` 会写入：

```text
data/messages/YYYY-MM-DD.jsonl
data/seen.json
```

每行是一条消息 JSON，包含 `chat`、`username`、`sender`、`content`、`timestamp` 等来自 `wx` 的字段，并附加 `_id` 去重。
