@echo off
rem Apeverse launcher (Windows). Uses Python if it is really installed, otherwise the built-in PowerShell server.
cd /d "%~dp0"
python -c "import sys" >nul 2>nul
if %errorlevel%==0 (
  echo Apeverse -^> http://localhost:8000/index.html  ^(close this window to stop^)
  start "" http://localhost:8000/index.html
  python -m http.server 8000
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve.ps1" -Port 8000
)
