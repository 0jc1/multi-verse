/* APEVERSE - multiplayer.js : LAN multiplayer prototype.
   Every ~120 ms the client posts its position to the relay in tools/mp_server.py and gets everyone else back.
   Players in the same world are drawn as simple apes with name tags. Nothing else is shared (NPCs, quests and
   credits stay local). Without the relay (file://, plain static server) the game silently stays single-player. */
'use strict';
(function (AV) {
const MP = AV.mp = { on: false, peers: new Map(), id: null, name: '' };
const SEND_MS = 120, RETRY_MS = 5000, URL_STATE = 'api/mp/state', URL_LEAVE = 'api/mp/leave';
const FURS = [0x6b4328, 0x3a3b3f, 0xc8581a, 0x8a6a4a, 0x2a1a10, 0xb08a5a], SHIRTS = [0xff4ad2, 0x3ad8ff, 0xffd84a, 0x7aff8a, 0xff8a3a, 0xb07aff, 0xe83a30];
let el = null, busy = false, nextSend = 0, lastWorld = null;

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
function ident() {
  let id = null; try { id = sessionStorage.getItem('apeverse_mp_id') } catch (e) { }
  if (!id) { id = 'p' + Math.random().toString(36).slice(2, 12); try { sessionStorage.setItem('apeverse_mp_id', id) } catch (e) { } }
  return id;
}
const myName = () => (AV.S && AV.S.name) || 'Guest ' + String(hash(MP.id) % 10000).padStart(4, '0');

function status() {
  if (!el) { el = document.createElement('div'); el.id = 'mp'; el.className = 'hud'; el.style.cssText = 'right:12px;bottom:10px;font-size:12px;background:rgba(10,4,20,.55);padding:4px 10px;border-radius:8px'; document.body.appendChild(el) }
  const here = [...MP.peers.values()].length;
  el.textContent = MP.on ? '● ' + AV.tr('Online', 'En línea') + ' · ' + (here ? here + AV.tr(' here', ' aquí') : AV.tr('nobody else here', 'nadie más aquí')) : '○ ' + AV.tr('Offline', 'Sin conexión');
  el.style.color = MP.on ? '#9aff9a' : '#c8c8d8';
}

/* ---------- remote avatars ---------- */
function makeAvatar(p) {
  const C = AV.chars, build = (C.classic && C.classic.npc) || C.npc, h = hash(p.id);
  const g = build(FURS[h % FURS.length], SHIRTS[(h >>> 4) % SHIRTS.length], null); AV.lin(g);
  const tag = AV.kit.tag(p.name, null, '#9aff9a'); tag.position.set(0, 2.95, 0); g.add(tag);
  g.position.set(p.x, p.y, p.z); g.rotation.y = p.yaw + Math.PI; AV.scene.add(g);
  return { g, tag, name: p.name, tx: p.x, ty: p.y, tz: p.z, tyaw: p.yaw + Math.PI, moving: false, ph: 0 };
}
function dropAvatar(id) { const a = MP.peers.get(id); if (!a) return; AV.scene.remove(a.g); AV.dispose(a.g); MP.peers.delete(id) }
function clearAvatars() { for (const id of [...MP.peers.keys()]) dropAvatar(id) }

function applyPlayers(list) {
  const W = AV.W, seen = new Set();
  for (const p of list) {
    if (p.id === MP.id || !W || p.world !== W.id) continue; seen.add(p.id);
    let a = MP.peers.get(p.id);
    if (a && a.name !== p.name) { dropAvatar(p.id); a = null }
    if (!a) { a = makeAvatar(p); MP.peers.set(p.id, a) }
    a.tx = p.x; a.ty = p.y; a.tz = p.z; a.tyaw = p.yaw + Math.PI; a.moving = p.moving;
  }
  for (const id of [...MP.peers.keys()]) if (!seen.has(id)) dropAvatar(id);
}

/* ---------- network ---------- */
function payload() {
  const P = AV.P; MP.name = myName();
  return { id: MP.id, name: MP.name, world: AV.W.id, x: P.x, y: P.y, z: P.z, yaw: P.yaw, moving: Math.hypot(P.vx, P.vz) > .5 || !P.on };
}
async function send() {
  busy = true;
  try {
    const r = await fetch(URL_STATE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    if (!MP.on) { MP.on = true; AV.toast(AV.tr('Multiplayer: connected', 'Multijugador: conectado')) }
    applyPlayers(d.players || []); nextSend = performance.now() + SEND_MS;
  } catch (e) {
    if (MP.on) AV.toast(AV.tr('Multiplayer: connection lost', 'Multijugador: conexión perdida'));
    MP.on = false; clearAvatars(); nextSend = performance.now() + RETRY_MS;
  }
  busy = false; status();
}
function leave() { if (!MP.id || !MP.on) return; try { navigator.sendBeacon(URL_LEAVE, new Blob([JSON.stringify({ id: MP.id })], { type: 'application/json' })) } catch (e) { } }

/* ---------- per frame: smooth remote players toward their last reported state, simple walk cycle ---------- */
function frame(dt) {
  if (AV.isFile || !AV.running || !AV.W) return;
  if (lastWorld !== AV.W.id) { lastWorld = AV.W.id; clearAvatars(); nextSend = 0 }
  const k = 1 - Math.exp(-10 * dt), red = AV.S.set.reduce ? .5 : 1;
  for (const a of MP.peers.values()) {
    const g = a.g, u = g.userData, dx = a.tx - g.position.x, dz = a.tz - g.position.z;
    if (Math.hypot(dx, dz) > 12) g.position.set(a.tx, a.ty, a.tz);   // teleport / unstuck: snap
    else { g.position.x += dx * k; g.position.y += (a.ty - g.position.y) * k; g.position.z += dz * k }
    g.rotation.y += Math.atan2(Math.sin(a.tyaw - g.rotation.y), Math.cos(a.tyaw - g.rotation.y)) * k;
    a.ph += dt * (a.moving ? 9 : 0); const sw = a.moving ? Math.sin(a.ph) * .6 * red : 0;
    if (u.lL) { u.lL.rotation.x += (sw - u.lL.rotation.x) * k; u.lR.rotation.x += (-sw - u.lR.rotation.x) * k; u.aL.rotation.x += (-sw * .7 - u.aL.rotation.x) * k; u.aR.rotation.x += (sw * .7 - u.aR.rotation.x) * k }
  }
}
/* a timer, not the render loop: background tabs pause rendering but keep (slowed) timers, so players don't time out */
function tick() {
  if (AV.isFile || !AV.running || !AV.W || busy || performance.now() < nextSend) return;
  if (!MP.id) { MP.id = ident(); status() }
  send();
}
AV.frameFns.push(frame);
if (!AV.isFile) setInterval(tick, SEND_MS / 2);
addEventListener('pagehide', leave);
})(window.AV);
