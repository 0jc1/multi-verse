#!/usr/bin/env node
/* Minimal macOS/Linux equivalent of tools/tests/run_tests.ps1: starts a static server,
   opens headless Chrome over the DevTools protocol (raw WebSocket, no dependencies),
   injects a test suite file and runs its steps one by one.
   Usage: node tools/tests/run_cdp.mjs tools/tests/suite_jlm.js [--only regex] [--out dir] [--port 8731] */
'use strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const suiteFile = args.find(a => !a.startsWith('--'));
const only = (args.find((a, i) => args[i - 1] === '--only') || '');
const outDir = args.find((a, i) => args[i - 1] === '--out') || path.join(os.tmpdir(), 'apeverse_tests');
const port = +(args.find((a, i) => args[i - 1] === '--port') || 8731);
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');
const W = 1280, H = 720;
fs.mkdirSync(outDir, { recursive: true });

/* ---------- tiny static server (http only; Range not needed for tests, audio is muted) ---------- */
const MIME = { html: 'text/html', js: 'text/javascript', json: 'application/json', css: 'text/css', png: 'image/png', mp3: 'audio/mpeg', mp4: 'video/mp4', glb: 'model/gltf-binary', hdr: 'application/octet-stream' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nope'); return }
  res.writeHead(200, { 'Content-Type': MIME[f.split('.').pop()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(port, r));

/* ---------- find Chrome ---------- */
const candidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
const browserPath = candidates.find(c => fs.existsSync(c));
if (!browserPath) { console.error('Chrome not found'); process.exit(1) }
const prof = path.join(os.tmpdir(), 'apeverse_prof_' + crypto.randomUUID().replaceAll('-', ''));
const dbg = 9333 + Math.floor(Math.random() * 500);
const br = spawn(browserPath, ['--headless=new', `--remote-debugging-port=${dbg}`, `--user-data-dir=${prof}`, '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', `--window-size=${W},${H}`, '--mute-audio', 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { br.kill() } catch (e) { } try { fs.rmSync(prof, { recursive: true, force: true }) } catch (e) { } });

/* ---------- minimal CDP client (no deps: raw WebSocket handshake) ---------- */
class CDP {
  constructor() { this.ws = null; this.id = 0; this.pending = new Map(); this.listeners = [];
    this._acc = Buffer.alloc(0); this._len = 0; this._head = 0; }
  _buf(chunk) {
    this._acc = Buffer.concat([this._acc, chunk]);
    for (;;) {
      if (!this._len) { const i = this._acc.indexOf('\r\n\r\n'); if (i < 0) return; const head = this._acc.slice(0, i).toString(); const m = head.match(/content-length: *(\d+)/i); this._len = m ? +m[1] : 0; this._head = i + 4; if (!this._len) { this._acc = this._acc.slice(this._head); continue } }
      if (this._acc.length < this._head + this._len) return;
      const payload = this._acc.slice(this._head, this._head + this._len).toString();
      this._acc = this._acc.slice(this._head + this._len); this._len = 0; this._head = 0;
      const o = JSON.parse(payload);
      if (o.id != null && this.pending.has(o.id)) { const { res, rej } = this.pending.get(o.id); this.pending.delete(o.id); o.error ? rej(new Error(o.error.message)) : res(o.result) }
      else this.listeners.forEach(l => l(o));
    }
  }
  connect(url) {
    /* ws://host:port/devtools/page/ID  ->  GET /devtools/page/ID with upgrade headers */
    const u = new URL(url);
    return new Promise((res, rej) => {
      const key = crypto.randomBytes(16).toString('base64');
      const sock = http.get({ host: u.hostname, port: u.port, path: u.pathname + u.search, headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': 13 } });
      sock.on('upgrade', (r, socket) => { this.ws = socket; this.ws.on('data', c => this._buf(c)); this.ws.on('error', e => console.error('ws', e.message)); res() });
      sock.on('response', r => rej(new Error('upgrade failed ' + r.statusCode)));
      sock.on('error', rej);
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      const payload = Buffer.from(JSON.stringify({ id, method, params }));
      const mask = crypto.randomBytes(4);
      let head;
      const len = payload.length;
      if (len < 126) head = Buffer.from([0x81, 0x80 | len]);
      else if (len < 65536) head = Buffer.from([0x81, 0x80 | 126, len >> 8, len & 255]);
      else { const b = Buffer.alloc(10); b[0] = 0x81; b[1] = 0x80 | 127; b.writeBigUInt64BE(BigInt(len), 2); head = b }
      const masked = Buffer.from(payload.map((b, i) => b ^ mask[i % 4]));
      this.ws.write(Buffer.concat([head, mask, masked]));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('CDP timeout on ' + method)) } }, 120000).unref();
    });
  }
  on(fn) { this.listeners.push(fn) }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- run ---------- */
let tgt = null;
for (let i = 0; i < 40 && !tgt; i++) { await sleep(250); try { const list = await (await fetch(`http://127.0.0.1:${dbg}/json`)).json(); tgt = list.find(t => t.type === 'page') } catch (e) { } }
if (!tgt) { console.error('debug endpoint unreachable'); process.exit(1) }
const cdp = new CDP(); await cdp.connect(tgt.webSocketDebuggerUrl);
await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
await cdp.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
await sleep(2500);
const evalJs = async (expr, timeoutSec = 120) => {
  const r = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, timeoutSec);
  if (r.exceptionDetails) throw new Error('JS exception: ' + r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || ''));
  return r.result.value;
};
const shot = async name => { const r = await cdp.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(r.data, 'base64')) };
const errors = [];
cdp.on(o => { if (o.method === 'Runtime.exceptionThrown') { const d = o.params.exceptionDetails; errors.push((d.text + ' ' + (d.exception && d.exception.description || '')).slice(0, 400)) } });

/* inject suite */
const suite = fs.readFileSync(suiteFile, 'utf8');
const runner = evalJs(suite + '\nwindow.__steps = window.APE_T ? window.APE_T.steps || window.APE_T : null; window.APE_T');
const api = await evalJs('(function(){ const s = window.__steps; if (!s) return null; return s })()', 10);
if (!api) { console.error('suite did not export APE_T'); process.exit(1) }

let pass = 0, fail = 0; const results = [];
for (const step of api.steps) {
  if (only && !new RegExp(only).test(step.name)) continue;
  const checks = [];
  const c = (name, ok, info) => checks.push({ name, ok: !!ok, info: info == null ? '' : String(info).slice(0, 160) });
  const started = Date.now();
  try {
    await evalJs(`window.__cur = ${JSON.stringify(step.name)}`);
    const fnBody = step.fn.toString();
    await evalJs(`(async () => { const c = (n, ok, info) => window.__checks.push({n, ok: !!ok, info: info == null ? '' : String(info).slice(0,160)}); window.__checks = []; const step = ${fnBody}; await step(c); })()`, 600);
    const got = await evalJs('window.__checks');
    for (const g of got) checks.push({ name: g.n, ok: g.ok, info: g.info });
    if (step.shot) await shot(step.shot);
  } catch (e) { checks.push({ name: 'step completed', ok: false, info: e.message.slice(0, 200) }) }
  const okAll = checks.every(x => x.ok);
  pass += checks.filter(x => x.ok).length; fail += checks.filter(x => !x.ok).length;
  results.push({ step: step.name, ms: Date.now() - started, checks });
  console.log((okAll ? '✔' : '✘') + ' ' + step.name + '  (' + (Date.now() - started) + ' ms)');
  for (const x of checks) console.log('   ' + (x.ok ? '  ✓ ' : '  ✗ ') + x.name + (x.info && !x.ok ? '  — ' + x.info : x.info && okAll === false && !x.ok ? '' : ''));
}
console.log('\n' + pass + ' passed, ' + fail + ' failed' + (errors.length ? ', ' + errors.length + ' console errors' : ''));
if (errors.length) { console.log('console errors:'); errors.slice(0, 12).forEach(e => console.log('  ' + e)) }
fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify({ pass, fail, errors, results }, null, 1));
br.kill(); server.close(); process.exit(fail ? 1 : 0);
