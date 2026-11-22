#!/usr/bin/env python3
"""Apeverse local server with a tiny multiplayer relay (prototype, standard library only).

Serves the game folder like `python -m http.server` and adds:
  POST /api/mp/state   body: {id, name, world, x, y, z, yaw, moving}  -> {players: [...], now}
  POST /api/mp/leave   body: {id}
  GET  /api/mp/status  -> {players: [...], now}

Player state lives in memory only and expires after a few seconds without updates.
Movement is trusted from clients: fine for a LAN prototype, not for public hosting.

Usage: python3 tools/mp_server.py [--port 8000] [--host 0.0.0.0]
"""
import argparse
import json
import math
import os
import re
import socket
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TIMEOUT = 5.0
MAX_BODY = 2048
MAX_PLAYERS = 64
ID_RE = re.compile(r'^[A-Za-z0-9_-]{4,40}$')
WORLD_RE = re.compile(r'^[a-z0-9_]{1,40}$')

players = {}
lock = threading.Lock()


def clean_name(v):
    s = ''.join(ch for ch in str(v or '') if ch.isprintable()).strip()
    return s[:24] or 'Guest'


def num(v, lim=100000.0):
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        raise ValueError('not a number')
    v = float(v)
    if not math.isfinite(v) or abs(v) > lim:
        raise ValueError('out of range')
    return round(v, 3)


def parse_state(d):
    if not isinstance(d, dict):
        raise ValueError('bad payload')
    pid, world = d.get('id'), d.get('world')
    if not isinstance(pid, str) or not ID_RE.match(pid):
        raise ValueError('bad id')
    if not isinstance(world, str) or not WORLD_RE.match(world):
        raise ValueError('bad world')
    return {
        'id': pid, 'name': clean_name(d.get('name')), 'world': world,
        'x': num(d.get('x')), 'y': num(d.get('y')), 'z': num(d.get('z')),
        'yaw': num(d.get('yaw'), 1000.0), 'moving': bool(d.get('moving')),
    }


def prune(now):
    for pid in [k for k, p in players.items() if now - p['t'] > TIMEOUT]:
        del players[pid]


def snapshot(now):
    return {'now': now, 'players': [{k: v for k, v in p.items() if k != 't'} for p in players.values()]}


def update(state):
    now = time.time()
    with lock:
        prune(now)
        if state['id'] not in players and len(players) >= MAX_PLAYERS:
            raise OverflowError('server full')
        state['t'] = now
        players[state['id']] = state
        return snapshot(now)


def leave(pid):
    with lock:
        players.pop(pid, None)


def status():
    now = time.time()
    with lock:
        prune(now)
        return snapshot(now)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):
        if not self.path.startswith('/api/mp/'):
            super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def send_json(self, code, obj):
        body = json.dumps(obj, separators=(',', ':')).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > MAX_BODY:
            raise ValueError('bad body size')
        return json.loads(self.rfile.read(n))

    def do_GET(self):
        if self.path.split('?')[0] == '/api/mp/status':
            return self.send_json(200, status())
        return super().do_GET()

    def do_POST(self):
        path = self.path.split('?')[0]
        try:
            if path == '/api/mp/state':
                return self.send_json(200, update(parse_state(self.read_json())))
            if path == '/api/mp/leave':
                d = self.read_json()
                pid = d.get('id') if isinstance(d, dict) else None
                if isinstance(pid, str):
                    leave(pid)
                return self.send_json(200, {'ok': True})
            return self.send_json(404, {'error': 'not found'})
        except OverflowError as e:
            return self.send_json(503, {'error': str(e)})
        except (ValueError, TypeError):
            return self.send_json(400, {'error': 'bad request'})


def lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return None


def main():
    ap = argparse.ArgumentParser(description='Apeverse server + multiplayer relay')
    ap.add_argument('--port', type=int, default=8000)
    ap.add_argument('--host', default='0.0.0.0')
    a = ap.parse_args()
    srv = ThreadingHTTPServer((a.host, a.port), Handler)
    srv.daemon_threads = True
    print('Apeverse (multiplayer) -> http://localhost:%d/index.html' % a.port)
    ip = lan_ip()
    if ip and a.host in ('0.0.0.0', ''):
        print('Friends on the same network: http://%s:%d/index.html' % (ip, a.port))
    print('Ctrl+C to stop.')
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.server_close()


if __name__ == '__main__':
    main()
