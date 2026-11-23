@echo off
rem Apeverse for this computer AND phones on the same Wi-Fi (needs Node.js). Allow Node on PRIVATE networks if Windows asks.
cd /d "%~dp0"
start "" http://localhost:8095/
node tools\serve_lan.mjs 8095
