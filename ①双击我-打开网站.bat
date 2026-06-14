@echo off
cd /d "%~dp0"
echo ============================================
echo   ShuChengLin AI Archive - Local Launcher
echo   Browser opens automatically.
echo   KEEP THIS WINDOW OPEN while browsing.
echo ============================================
start "" http://localhost:8520/
python -m http.server 8520 2>nul
if errorlevel 1 py -m http.server 8520 2>nul
if errorlevel 1 (
  echo.
  echo [!] Python not found. Two options:
  echo     1. Install Python: https://www.python.org/downloads/
  echo        then double-click this file again.
  echo     2. Or visit online: https://shuchenglin-handbook.pages.dev
  pause
)