#!/bin/sh
# Serves Apeverse on http://localhost:8000 (needed for in-world video textures; double-clicking index.html also works, with the pop-up video viewer)
cd "$(dirname "$0")"
echo "Apeverse V0.9 -> http://localhost:8000/index.html  (Ctrl+C to stop)"
if command -v python3 >/dev/null 2>&1; then python3 -m http.server 8000; else python -m http.server 8000; fi
