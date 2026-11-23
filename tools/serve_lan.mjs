#!/usr/bin/env node
/* Apeverse static server for laptop + phones on the same Wi-Fi (no admin rights, no dependencies).
   Usage: node tools/serve_lan.mjs [port]   (default 8095)
   Prints http://localhost:<port>/ and http://<your LAN IP>:<port>/ . The first run on Windows may show a firewall prompt:
   allow Node.js on PRIVATE networks only, or the phone cannot connect. Ctrl+C stops it.
   Serves files with HTTP Range support (video / audio seeking). /api/mp/* is not served here: multiplayer needs tools/mp_server.py. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const port = +(process.argv[2] || process.env.PORT || 8095);
const MIME = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', mjs: 'text/javascript', json: 'application/json', css: 'text/css', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', ico: 'image/x-icon',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4', mp4: 'video/mp4', webm: 'video/webm', glb: 'model/gltf-binary', gltf: 'model/gltf+json', hdr: 'application/octet-stream', bin: 'application/octet-stream', txt: 'text/plain; charset=utf-8', md: 'text/markdown; charset=utf-8', pdf: 'application/pdf', woff2: 'font/woff2' };
const server = http.createServer((req, res) => {
  let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname) } catch (e) { res.writeHead(400); return res.end() }
  if (p === '/') p = '/index.html';
  const file = path.join(root, p); if (!file.startsWith(root + path.sep) || /[\\/]\.(git|claude)([\\/]|$)/.test(file)) { res.writeHead(403); return res.end() }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found') }
    const type = MIME[path.extname(file).slice(1).toLowerCase()] || 'application/octet-stream', range = req.headers.range, h = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    if (range) { const m = /bytes=(\d*)-(\d*)/.exec(range); let a = m && m[1] ? +m[1] : 0, b = m && m[2] ? +m[2] : st.size - 1; if (!m || a >= st.size) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end() } b = Math.min(b, st.size - 1);
      res.writeHead(206, Object.assign(h, { 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Content-Length': b - a + 1 })); if (req.method === 'HEAD') return res.end(); return fs.createReadStream(file, { start: a, end: b }).pipe(res) }
    res.writeHead(200, Object.assign(h, { 'Content-Length': st.size })); if (req.method === 'HEAD') return res.end(); fs.createReadStream(file).pipe(res) }) });
server.listen(port, '0.0.0.0', () => {
  const lan = Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log('Apeverse is running:'); console.log('  this computer : http://localhost:' + port + '/'); lan.forEach(a => console.log('  phone (same Wi-Fi): http://' + a + ':' + port + '/'));
  console.log('Ctrl+C to stop.') });
