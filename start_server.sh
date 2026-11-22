#!/bin/sh
# Serves Apeverse on http://localhost:8000 with the LAN multiplayer relay (needed for in-world video textures and multiplayer;
# double-clicking index.html also works, single-player with the pop-up video viewer)
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then python3 tools/mp_server.py --port 8000; else python tools/mp_server.py --port 8000; fi
