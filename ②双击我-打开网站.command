#!/bin/bash
cd "$(dirname "$0")" || exit 1

PORT="${PORT:-8520}"
URL="http://localhost:${PORT}/"

echo "============================================"
echo "  ShuChengLin AI Archive - Local Launcher"
echo "  Browser opens automatically."
echo "  KEEP THIS WINDOW OPEN while browsing."
echo "============================================"

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo
  echo "[!] Python not found. Two options:"
  echo "    1. Install Python 3, then double-click this file again."
  echo "    2. Or visit online: https://shuchenglin-handbook.pages.dev"
  open "https://shuchenglin-handbook.pages.dev" >/dev/null 2>&1
  read -r -p "Press Enter to close this window..."
  exit 1
fi

if lsof -PiTCP:"${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo
  echo "[i] Port ${PORT} is already in use."
  echo "    Opening ${URL}"
  open "${URL}" >/dev/null 2>&1
  read -r -p "Press Enter to close this window..."
  exit 0
fi

open "${URL}" >/dev/null 2>&1
"${PYTHON_BIN}" -m http.server "${PORT}"
