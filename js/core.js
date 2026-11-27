/* ============================================================
   APEVERSE V0.9 - core.js
   State + save migration, renderer, world manager, player, input.
   Everything is a plain classic script (no modules) so the game
   also works when index.html is opened by double-click.
   ============================================================ */
'use strict';
window.AV = window.AV || {};
(function (AV) {
const $ = AV.$ = id => document.getElementById(id);
const TAU = AV.TAU = Math.PI * 2;
const cl = AV.cl = (v, a, b) => Math.max(a, Math.min(b, v));
AV.pick = a => a[Math.random() * a.length | 0];
AV.rng = function (seed) { let s = seed | 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } };
AV.isFile = location.protocol === 'file:';
AV.fail = m => { const e = $('err'); e.textContent = '⚠ ' + m; e.style.display = 'block'; console.error(m) };
addEventListener('error', e => AV.fail(e.message + (e.filename ? ' (' + e.filename.split('/').pop() + ':' + e.lineno + ')' : '')));
addEventListener('unhandledrejection', e => { console.warn('Unhandled promise rejection:', e.reason) });

/* ---------------- language (en/es are complete in this build) ---------------- */
AV.ui = 'en';
AV.tr = (a, b) => AV.ui === 'es' ? (b == null ? a : b) : a;
const tr = AV.tr;
AV.device = 'desktop';

/* ---------------- save: schema v2, safe migration from V0.8 (never deletes old saves) ---------------- */
const KEY = 'apeverse_v09', OLD = ['apeverse_v08', 'apeverse_v07'];
const WMAP = { town: 'ape_town', jungle: 'verdalux' };
AV.fresh = () => ({ v: 2, money: 120, log: [{ d: 1, t: 'Starting funds', a: 120 }], job: false, rentDays: 0, name: '', day: 1, time: 540, seen: Date.now(),
  mem: { zil: { met: 0, facts: [] }, grk: { met: 0, facts: [], drums: 0 }, luma: { met: 0 }, bongo: { met: 0 } }, seed: Date.now() % 100000,
  world: 'ape_town', disc: { ape_town: 1 }, last: {}, built: {}, grow: 0, news: [], drumDay: 0, pipe: true, media: { seen: {} },
  set: { vm: .8, vs: .8, gq: 'High', sens: 1, reduce: false, lang: 'en' }, migrated: null });
AV.S = AV.fresh();
function valid(o) { return o && typeof o === 'object' && typeof o.money === 'number' && Array.isArray(o.log) }
function migrate(o) {            // V0.8 (v:1) -> V0.9 (v:2). Pure function; the old key is left untouched.
  const s = Object.assign(AV.fresh(), o); s.v = 2;
  s.world = WMAP[o.world] || o.world || 'ape_town';
  const remap = m => { const r = {}; for (const k in (m || {})) r[WMAP[k] || k] = m[k]; return r };
  s.disc = remap(o.disc); s.disc.ape_town = 1; s.last = remap(o.last);
  s.mem = Object.assign(AV.fresh().mem, o.mem || {}); s.media = o.media && typeof o.media === 'object' ? o.media : { seen: {} };
  s.set = Object.assign(AV.fresh().set, o.set || {}); s.pipe = true; return s;
}
/* M1 save safety: the key can be pointed at a sandbox (tests never touch the player's save); before the first overwrite of a session the
   previous save is copied to <key>_bak, and an unreadable / invalid main save falls back to it; an invalid state is never written. */
AV.saveKey = KEY;
AV.loadSave = function () {
  const K0 = AV.saveKey || KEY;
  for (const [k, from] of [[K0, 'v09'], [K0 + '_bak', 'v09-backup']]) { try { const r = localStorage.getItem(k); if (r) { const o = JSON.parse(r); if (valid(o)) return { s: Object.assign(AV.fresh(), o), from } } } catch (e) { console.warn(k + ' save unreadable', e) } }
  if (K0 !== KEY) return null;
  for (const k of OLD) { try { const r = localStorage.getItem(k); if (!r) continue; const o = JSON.parse(r); if (valid(o)) { const s = migrate(o); s.migrated = k; return { s, from: k } } } catch (e) { console.warn(k + ' save unreadable; kept untouched', e) } }
  return null;
};
AV.save = function () { if (!AV.running) return; const S = AV.S; if (!valid(S) || !isFinite(S.money)) { console.warn('save skipped: invalid game state'); return } S.seen = Date.now();
  try { const k = AV.saveKey || KEY; if (AV._bakFor !== k) { const prev = localStorage.getItem(k); if (prev) localStorage.setItem(k + '_bak', prev); AV._bakFor = k } localStorage.setItem(k, JSON.stringify(S)) } catch (e) { } };
AV.exportSave = () => JSON.stringify(AV.S);
AV.abs = () => AV.S.day * 1440 + AV.S.time;

/* ---------------- economy: all changes go through txn() ---------------- */
AV.txn = function (amount, why) {
  const S = AV.S; if (!Number.isFinite(amount) || !why) return false;
  if (S.money + amount < 0) { AV.toast(tr('Not enough credits.', 'No tienes suficientes créditos.')); return false }
  S.money += amount; S.log.unshift({ d: S.day, t: why, a: amount }); S.log.length = Math.min(S.log.length, 40); AV.save(); AV.hud(); return true;
};

/* ---------------- three.js basics ---------------- */
const scene = AV.scene = new THREE.Scene(), cam = AV.cam = new THREE.PerspectiveCamera(72, 1, .1, 420); cam.rotation.order = 'YXZ'; scene.add(cam);
let R = null;
try { R = AV.R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true }); R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.shadowMap.type = THREE.PCFSoftShadowMap }
catch (e) { AV.fail('WebGL unavailable: ' + e.message) }
const HS = AV.HS = new THREE.HemisphereLight(0xcfe0ff, 0x6a4a3a, .5), SUN = AV.SUN = new THREE.DirectionalLight(0xffe2b8, 1.3);
SUN.castShadow = true; SUN.shadow.mapSize.set(2048, 2048); { const c = SUN.shadow.camera; c.left = c.bottom = -45; c.right = c.top = 45; c.far = 220; SUN.shadow.bias = -0.0006 }
scene.add(HS, SUN, SUN.target); scene.fog = new THREE.Fog(0xe8b98a, 30, 170);
const MAT = {};
AV.std = (c, r = .8, m = 0, e = 0, ei = 1) => { const k = [c, r, m, e, ei].join(); if (!MAT[k]) { const x = new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, emissive: e, emissiveIntensity: ei }); x.userData.shared = true; MAT[k] = x } return MAT[k] };
AV.basic = (c, o) => { const m = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {})); return m };
const G = AV.G = { box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(1, 12, 8), cyl: new THREE.CylinderGeometry(1, 1, 1, 12), ico: new THREE.IcosahedronGeometry(1, 1),
  cone: new THREE.ConeGeometry(1, 1, 10), tor: new THREE.TorusGeometry(1, .08, 6, 24), hem: new THREE.SphereGeometry(1, 14, 7, 0, TAU, 0, Math.PI / 2), pln: new THREE.PlaneGeometry(1, 1) };   /* V0.9.2: fewer segments (characters + props were ~5k tris per ape) */
for (const k in G) G[k].userData.shared = true;
AV.mk = function (g, m, x, y, z, sx, sy, sz, par, sh) {
  const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); if (sh !== false) o.castShadow = o.receiveShadow = true; (par || scene).add(o); return o;
};
AV.mkc = (n, f) => { const c = document.createElement('canvas'); c.width = c.height = n; f(c.getContext('2d'), c); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t };
/* r128 treats hex colours as linear; convert every material colour once so hex values display as authored */
AV.lin = function (root) { root.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) { if (m.userData.lin || m.isShaderMaterial) continue; m.userData.lin = 1; if (m.color) m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear() } }) };
AV.dispose = function (root) {   // free GPU memory of a world (shared materials/geometries are kept)
  root.traverse(o => {
    if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) { if (m.userData.shared) continue; for (const k of ['map', 'emissiveMap', 'alphaMap']) if (m[k] && !(m[k].userData && m[k].userData.keep)) m[k].dispose(); m.dispose() }
    if (o.dispose && o.isInstancedMesh) o.dispose();
  });
};

/* ---------------- UI helpers ---------------- */
let tT = 0;
AV.toast = m => { const e = $('toast'); e.textContent = m; e.style.opacity = 1; clearTimeout(tT); tT = setTimeout(() => e.style.opacity = 0, 3800) };
AV.hud = function () {
  const S = AV.S, hh = Math.floor(S.time / 60) % 24, mm = Math.floor(S.time % 60), W = AV.W;
  $('top').innerHTML = '<b>' + tr('Credits', 'Créditos') + ': ' + S.money + '</b> · ' + (W ? W.name : '') + '<br>' + tr('Day', 'Día') + ' ' + S.day + ' · ' + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + '<br>' +
    (AV.careers ? AV.careers.label() : S.job ? tr('Job: café helper', 'Trabajo: ayudante de café') : tr('Unemployed', 'Sin trabajo')) + '<br>' + (S.rentDays > 0 ? tr('Rented: ', 'Alquilado: ') + S.rentDays + tr(' days left', ' días restantes') : tr('No home yet', 'Sin casa'));
};
AV.hintText = () => AV.device === 'phone' ? '' : tr('WASD move · Shift run · Space jump · E interact · P Portal Pipe · T city map · G missions · Z phone · I inventory · O settings · M mute · R unstuck · F3 FPS · Esc menu/mouse',
  'WASD mover · Shift correr · Espacio saltar · E interactuar · P Pipa-Portal · T mapa · I inventario · O ajustes · M silencio · R desbloquear · F3 FPS · Esc menú/ratón');
AV.showHint = function () {
  const el = $('hint'), esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  el.innerHTML = AV.hintText().split(' · ').filter(Boolean).map(s => {
    const m = s.match(/^(\S+(?: \/ \S+)?)\s+(.+)$/);
    return '<span class="hk">' + (m ? '<kbd>' + esc(m[1]) + '</kbd>' + esc(m[2]) : esc(s)) + '</span>';
  }).join('');
};

/* modal stack: anything that takes over input (chat, pipe, viewer, cinema, map...) */
AV.modals = [];
AV.blocking = () => AV.modals.length > 0;
AV.focus = null;   // optional () => THREE.Vector3 | null : world point the camera locks onto during a conversation (see update)
AV.pushModal = function (id, closeFn) {
  if (AV.modals.some(m => m.id === id)) return; AV.modals.push({ id, close: closeFn });
  for (const k in keys) keys[k] = 0; T.x = T.y = 0; T.jump = false; try { document.exitPointerLock() } catch (e) { }
};
AV.popModal = function (id) { const i = AV.modals.findIndex(m => m.id === id); if (i >= 0) AV.modals.splice(i, 1); if (!AV.modals.length) AV.lock() };
AV.closeTop = function () { const m = AV.modals[AV.modals.length - 1]; if (m) { m.close(); return true } return false };

/* ---------------- player ---------------- */
const P = AV.P = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, on: true };
const keys = AV.keys = {}, T = AV.T = { x: 0, y: 0, run: false, jump: false };
AV.running = false; let locked = false, drag = false;
AV.lock = function () { if (AV.device === 'phone' || !AV.running) return; try { const p = $('c').requestPointerLock(); p && p.catch && p.catch(() => { }) } catch (e) { } };
document.addEventListener('pointerlockchange', () => locked = document.pointerLockElement === $('c'));
$('c').addEventListener('mousedown', () => { if (AV.running && !AV.blocking()) { drag = true; AV.lock() } }); addEventListener('mouseup', () => drag = false);
addEventListener('mousemove', e => { if (!AV.running || AV.blocking() || !(locked || drag)) return; const k = .0023 * (AV.S.set.sens || 1); P.yaw -= e.movementX * k; P.pitch = cl(P.pitch - e.movementY * k, -1.45, 1.45) });
addEventListener('blur', () => { for (const k in keys) keys[k] = 0 });

/* ---------------- worlds: registry + lazy build + dispose ---------------- */
AV.worldDefs = {}; AV.W = null; AV.frameFns = []; AV.keymap = {};
AV.registerWorld = def => { AV.worldDefs[def.id] = def };
AV.worldMeta = id => (AV.WORLDS_DATA || []).find(w => w.id === id);
AV.isPlayable = id => !!AV.worldDefs[id];

/* a free standing spot: inside the walkable surface and not inside a collider */
AV.resolve = function (W, x, z, r) {
  for (const c of W.cols) { if (x > c[0] - r && x < c[1] + r && z > c[2] - r && z < c[3] + r) { const a = x - (c[0] - r), b = c[1] + r - x, d = z - (c[2] - r), e = c[3] + r - z, m = Math.min(a, b, d, e); if (m === a) x = c[0] - r; else if (m === b) x = c[1] + r; else if (m === d) z = c[2] - r; else z = c[3] + r } }
  for (const c of W.circles) { const dx = x - c[0], dz = z - c[1], rr = c[2] + r, d = Math.hypot(dx, dz); if (d < rr) { x = c[0] + (d ? dx / d : 1) * rr; z = c[1] + (d ? dz / d : 0) * rr } }
  return [x, z];
};
AV.isFree = function (W, x, z, m) {
  m = m == null ? .6 : m; if (W.surface(x, z) === null) return false;
  for (const c of W.cols) if (x > c[0] - m && x < c[1] + m && z > c[2] - m && z < c[3] + m) return false;
  for (const c of W.circles) if (Math.hypot(x - c[0], z - c[1]) < c[2] + m) return false;
  for (const a of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (W.surface(x + a[0] * m, z + a[1] * m) === null) return false;   // not on the very edge
  return true;
};
AV.safeSpot = function (W, x, z) {          // spiral outwards until a free spot is found
  if (AV.isFree(W, x, z)) return [x, z];
  for (let r = 1; r < 30; r += 1) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a / 16 * TAU) * r, pz = z + Math.sin(a / 16 * TAU) * r; if (AV.isFree(W, px, pz)) return [px, pz] }
  return [x, z];
};
function buildWorld(id) {
  const def = AV.worldDefs[id], meta = AV.worldMeta(id) || {}, q = { Low: 0, Medium: 1, High: 2 }[AV.S.set.gq] ?? 2;
  const group = new THREE.Group(); scene.add(group);
  const ctx = { id, group, q, cols: [], circles: [], T: [], upd: [], leave: [], rng: AV.rng(AV.S.seed * 7 + id.length * 131), seed: AV.S.seed };
  ctx.mk = (g, m, x, y, z, sx, sy, sz, sh) => AV.mk(g, m, x, y, z, sx, sy, sz, group, sh);
  /* hand-drawn psychedelic sign (world_kit.js); same signature as V0.9 */
  ctx.sign = (txt, x, y, z, ry, w, col, o) => AV.kit.sign(ctx, txt, x, y, z, ry, w, col, o);
  ctx.wall = (x0, x1, z0, z1, y0, y1, m, col) => { const o = ctx.mk(G.box, m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0); if (col !== false && y0 < 1.2) ctx.cols.push([x0, x1, z0, z1]); return o };
  /* building with a REAL door gap (walls, lintel, roof, interior light) */
  ctx.building = (x, z, w, d, h, wc, doorX, o) => {
    o = o || {}; const t = .35, x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, dw = 1.3, m = o.mat || AV.std(wc, .85), y = o.y || 0;
    ctx.wall(x0, x1, z0, z0 + t, y, y + h, m); ctx.wall(x0, x0 + t, z0, z1, y, y + h, m); ctx.wall(x1 - t, x1, z0, z1, y, y + h, m);
    ctx.wall(x0, doorX - dw, z1 - t, z1, y, y + h, m); ctx.wall(doorX + dw, x1, z1 - t, z1, y, y + h, m); ctx.wall(doorX - dw, doorX + dw, z1 - t, z1, y + 2.6, y + h, m, false);
    ctx.mk(G.box, AV.std(o.floor || 0x3a2a22, .9), x, y + .06, z, w - .4, .12, d - .4); ctx.mk(G.box, AV.std(o.roof || 0x4a3a4a, .9), x, y + h + .15, z, w + .8, .3, d + .8);
    const l = new THREE.PointLight(0xffc98a, 1.1, 16); l.position.set(x, y + h - .8, z); group.add(l);
    ctx.mk(G.box, AV.std(0xffe0a0, .4, 0, 0xffb060, 1.2), doorX, y + 2.9, z1 + .2, 2.2, .35, .1, false);
    return { x0, x1, z0, z1, h, l, doorX, y };
  };
  const inst = (() => { try { return def.build(ctx) || {} } catch (e) { scene.remove(group); AV.dispose(group); throw e } })(); AV.lin(group);
  Object.assign(inst, { id, name: inst.name || meta.name || id, group, cols: ctx.cols, circles: ctx.circles, T: ctx.T, upd: ctx.upd, leave: ctx.leave, ctx });
  if (!inst.surface) { const b = inst.bound || 60; inst.surface = (x, z) => Math.hypot(x - (inst.cx || 0), z - (inst.cz || 0)) < b ? 0 : null }
  if (!inst.arrivals) inst.arrivals = { default: { x: 0, z: 10, yaw: 0 } };
  return inst;
}
AV.fadeTo = (v, ms) => { const f = $('fade'); f.style.transition = 'opacity ' + (ms || 450) + 'ms'; f.style.opacity = v };
AV.enterWorld = function (id, arrival, opt) {
  opt = opt || {};
  if (!AV.worldDefs[id]) { AV.toast(tr('That world is still under construction.', 'Ese mundo sigue en construcción.')); return false }
  const S = AV.S, go = () => {
    try {
      const old = AV.W; if (old) { S.last[old.id] = AV.abs(); old.leave.forEach(f => { try { f() } catch (e) { console.warn(e) } }); if (AV.media) { AV.media.resetFrames(); AV.media.resetScreens() } scene.remove(old.group); AV.dispose(old.group); AV.W = null }
      if (opt.travel) { S.time += 180; while (S.time >= 1440) { S.time -= 1440; S.day++ } if (AV.dlg) AV.dlg.event('travel') }
      AV.evolve(id);
      const W = AV.W = buildWorld(id); S.world = id; S.disc[id] = 1;
      const ar = W.arrivals[arrival] || W.arrivals[W.defaultArrival] || W.arrivals.default || Object.values(W.arrivals)[0], sp = AV.safeSpot(W, ar.x, ar.z);
      P.x = sp[0]; P.z = sp[1]; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vy = P.vz = 0; P.yaw = ar.yaw || 0; P.pitch = 0; P.on = true;
      W.fog = W.fog || [30, 170]; scene.fog.near = W.fog[0]; scene.fog.far = W.fog[1]; cam.far = Math.max(420, W.fog[1] * 2.4); cam.updateProjectionMatrix();
      S.last[id] = AV.abs(); AV.hud(); AV.save();
      if (AV.audio) AV.audio.setWorld(W);
      AV.showHint();
      if (AV.onWorldEnter) AV.onWorldEnter(W);
      if (opt.done) opt.done(W);
    } catch (e) { AV.fail('World load failed (' + id + '): ' + e.message); console.error(e); if (id !== 'ape_town' && AV.worldDefs.ape_town) { AV.W = null; AV.enterWorld('ape_town', 'finca') } }
    AV.fadeTo(0);
  };
  if (opt.instant) { go() } else { AV.fadeTo(1); setTimeout(go, 470) }
  return true;
};
AV.travel = (id, arrival) => { if (AV.W && AV.W.id === id && !arrival) return false; return AV.enterWorld(id, arrival, { travel: true }) };
AV.unstuck = function () {
  const W = AV.W; if (!W) return; const a = W.arrivals[W.defaultArrival] || Object.values(W.arrivals)[0], sp = AV.safeSpot(W, a.x, a.z);
  P.x = sp[0]; P.z = sp[1]; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vy = P.vz = 0; AV.toast(tr('Unstuck: back at the arrival point.', 'Desbloqueado: de vuelta en el punto de llegada.'));
};

/* evolution: bounded rules driven by time away from a world (V0.8 behaviour, kept) */
AV.news = t => { const S = AV.S; S.news.unshift('Day ' + S.day + ': ' + t); S.news.length = Math.min(S.news.length, 8); AV.toast(t) };
AV.evolve = function (id) {
  const S = AV.S, g = S.last[id] == null ? 0 : AV.abs() - S.last[id]; if (g < 300) return;
  if (id === 'ape_town') { if (!S.built.stall) { S.built.stall = 1; AV.news(tr('While you were away, a market stall opened by the fountain.', 'Mientras estabas fuera, abrió un puesto junto a la fuente.')) } else AV.news(AV.pick(['Zil rearranged the stools again.', 'Someone hung new lanterns in the Gallery Gardens.', 'A new flower bed bloomed by the lotus canal.'])) }
  else if (id === 'verdalux') { if (S.grow < 7) { S.grow++; AV.news(tr('A new glow-tree sprouted in Verdalux while you were gone.', 'Un nuevo árbol luminoso brotó en Verdalux mientras no estabas.')) } else AV.news(tr('The Verdalux moss hummed a new rhythm.', 'El musgo de Verdalux tarareó un nuevo ritmo.')) }
  else AV.news(AV.pick(['The crowds changed while you were away.', 'New lights appeared overhead.']));
};

/* ---------------- sky / time of day (js/sky.js) ---------------- */
AV.FAC = [];   // building facade materials whose emissive follows the night
AV.nightK = 0;
function skyAt(m, dt) { if (AV.sky && AV.sky.tick) AV.sky.tick(m, dt) }

/* ---------------- interaction ---------------- */
let near = null;
AV.interact = function () { if (near && !AV.blocking()) near.fn() };
AV.nearTarget = () => near;
function findNear() {
  near = null; const W = AV.W; if (!W || AV.blocking()) return; let bd = 1e9;
  for (const t of W.T) { if (t.show && !t.show()) continue; const d = Math.hypot(t.x - P.x, t.z - P.z); if (d < t.r && d < bd && (t.y == null || Math.abs(t.y - P.y) < 4)) { bd = d; near = t } }
  const pr = $('prompt');
  if (near) { pr.style.display = 'block'; pr.textContent = (AV.device === 'phone' ? '▶ ' : 'E — ') + (typeof near.label === 'function' ? near.label() : near.label) } else pr.style.display = 'none';
}

/* ---------------- keyboard ---------------- */
addEventListener('keydown', e => {
  if (!AV.running || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return; const k = e.code;
  if (k === 'Escape') { if (!AV.closeTop()) { try { document.exitPointerLock() } catch (_) { } } return }
  if (k === 'F3') { e.preventDefault(); AV.S.set.fps = AV.S.set.fps === false; AV.save(); return }
  if (k === 'KeyP' && AV.modals.some(m => m.id === 'pipe')) { AV.keymap.KeyP(); return }
  if (AV.blocking()) return;
  keys[k] = 1;
  if (k === 'KeyE') AV.interact(); else if (k === 'KeyI') AV.toggleInv(); else if (k === 'KeyM') AV.toggleMute(); else if (k === 'KeyR') AV.unstuck();
  else if (k === 'KeyT') { if (e.shiftKey || !(AV.minimap && AV.minimap.atlas)) AV.toggleMap(); else AV.minimap.atlas() }   /* 2.3: T = full-screen city map, Shift+T = travel map */
  else if (k === 'KeyO') AV.toggleSettings(); else if (k === 'F4') { e.preventDefault(); AV.cycleQuality() } else if (k === 'KeyG') { if (AV.mis && AV.mis.journal) AV.mis.journal(); else AV.cycleQuality() }   /* 2.3: G = missions journal, F4 = graphics */
  else if (AV.keymap[k]) AV.keymap[k](e); else if (k === 'Space') e.preventDefault();
});
addEventListener('keyup', e => keys[e.code] = 0);

/* inventory + map + settings panels */
AV.panel = function (id, html, close) { const p = $(id); p.innerHTML = html; p.style.display = 'block'; AV.pushModal(id, () => AV.closePanel(id)); p.querySelectorAll('[data-close]').forEach(b => b.onclick = () => AV.closePanel(id)); return p };
AV.closePanel = id => { $(id).style.display = 'none'; AV.popModal(id) };
AV.toggleInv = function () {
  if ($('inv').style.display === 'block') return AV.closePanel('inv'); const S = AV.S;
  AV.panel('inv', '<b>' + tr('Inventory & transactions', 'Inventario y transacciones') + '</b><p>' + tr('Credits', 'Créditos') + ': ' + S.money + '</p>' + S.log.slice(0, 12).map(l => '<div>' + tr('Day', 'Día') + ' ' + l.d + ' · ' + l.t + ' · ' + (l.a > 0 ? '+' : '') + l.a + '</div>').join('') +
    (AV.quests ? AV.quests.listHtml() : '') + '<p style="font-size:12px;opacity:.7">' + tr('Portal Pipe: carried.', 'Pipa-Portal: la llevas.') + '</p><div class="row"><button data-close>' + tr('Close', 'Cerrar') + '</button><button id="expSave">' + tr('Export save', 'Exportar partida') + '</button></div>');
  $('expSave').onclick = () => { const b = new Blob([AV.exportSave()], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'apeverse_save.json'; a.click() };
};
AV.toggleMute = function () { if (AV.audio) { AV.audio.mute = !AV.audio.mute; AV.audio.applyVol(); AV.toast(AV.audio.mute ? tr('Muted', 'Silenciado') : tr('Sound on', 'Sonido activado')) } };
AV.toggleMap = function () {   // V0.8 travel map: discovered worlds, instant travel (3 h of game time)
  if ($('map').style.display === 'block') return AV.closePanel('map'); const S = AV.S; let h = '<b>' + tr('Universal Travel Map', 'Mapa universal de viaje') + '</b>';
  for (const id in AV.worldDefs) { const w = AV.worldMeta(id) || { name: id }, here = AV.W && AV.W.id === id, nu = !S.disc[id]; h += '<div style="margin:8px 0"><button data-w="' + id + '" ' + (here ? 'disabled' : '') + '>' + w.name + (here ? tr(' (you are here)', ' (estás aquí)') : nu ? tr(' ✦ new', ' ✦ nuevo') : '') + '</button></div>' }   /* V1.0: every open world is listed (new ones marked), not only visited ones */
  h += '<div style="font-size:12px;opacity:.85;margin-top:8px">' + tr('Travel takes about 3 hours of game time. Worlds change while you are away. The Portal Pipe (P) can reach every available world.', 'El viaje tarda unas 3 horas de juego. Los mundos cambian mientras no estás. La Pipa-Portal (P) llega a todos los mundos disponibles.') + '</div>' +
    (S.news || []).slice(0, 5).map(t => '<div style="font-size:12px;margin-top:4px">• ' + t + '</div>').join('') + '<button data-close style="margin-top:10px">' + tr('Close', 'Cerrar') + '</button>';
  const p = AV.panel('map', h); p.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { AV.closePanel('map'); AV.travel(b.dataset.w) });
};
AV.cycleQuality = function () { const o = ['Low', 'Medium', 'High'], S = AV.S; S.set.gq = o[(o.indexOf(S.set.gq) + 1) % 3]; AV.applyQuality(); AV.toast(tr('Graphics: ', 'Gráficos: ') + S.set.gq + tr(' (vegetation density applies when you enter a world)', ' (la densidad de vegetación se aplica al entrar en un mundo)')); AV.save() };
AV.applyQuality = function () {
  if (!R) return; const g = AV.S.set.gq; R.setPixelRatio(g === 'High' ? Math.min(devicePixelRatio || 1, 1.5) : g === 'Medium' ? Math.min(devicePixelRatio || 1, 1.15) : 1);
  R.shadowMap.enabled = g === 'High'; SUN.castShadow = g === 'High'; scene.traverse(o => { if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => m.needsUpdate = true) } }); AV.resize();
  if (AV.sky && AV.sky.quality) AV.sky.quality();
};
AV.toggleSettings = function () {
  if ($('set').style.display === 'block') return AV.closePanel('set'); const S = AV.S.set;
  const p = AV.panel('set', '<b>' + tr('Settings', 'Ajustes') + '</b>' +
    '<p>' + tr('Language', 'Idioma') + ': <button id="sEn" class="' + (AV.ui === 'en' ? 'on' : '') + '">English</button> <button id="sEs" class="' + (AV.ui === 'es' ? 'on' : '') + '">Español</button></p>' +
    '<p>' + tr('Music volume', 'Volumen de música') + ' <input id="sVm" type="range" min="0" max="1" step=".05" value="' + S.vm + '"></p>' +
    '<p>' + tr('Effects volume', 'Volumen de efectos') + ' <input id="sVs" type="range" min="0" max="1" step=".05" value="' + S.vs + '"></p>' +
    '<p>' + tr('Graphics', 'Gráficos') + ' <select id="sGq"><option>Low</option><option>Medium</option><option>High</option></select></p>' +
    '<p>' + tr('Look sensitivity', 'Sensibilidad') + ' <input id="sSens" type="range" min=".4" max="2.2" step=".1" value="' + S.sens + '"></p>' +
    '<p><label><input id="sRed" type="checkbox" ' + (S.reduce ? 'checked' : '') + '> ' + tr('Reduced motion (no head-bob, fewer flashing lights)', 'Movimiento reducido (sin vaivén, menos luces parpadeantes)') + '</label></p>' +
    '<p><label><input id="sReal" type="checkbox" ' + (S.realFlora !== false ? 'checked' : '') + '> ' + tr('Realistic plants & rocks (Medium/High; applies when you enter a world)', 'Plantas y rocas realistas (Medio/Alto; se aplica al entrar en un mundo)') + '</label></p>' +
    '<p><label><input id="sFps" type="checkbox" ' + (S.fps !== false ? 'checked' : '') + '> ' + tr('Show FPS counter (F3)', 'Mostrar contador de FPS (F3)') + '</label></p>' +
    (AV.gfx && AV.gfx.settingsHtml ? AV.gfx.settingsHtml() : '') +
    '<p style="font-size:12px;opacity:.7">' + tr('Subtitles: not applicable yet (no subtitle files were supplied).', 'Subtítulos: todavía no aplica (no se entregaron archivos de subtítulos).') + '</p><button data-close>' + tr('Close', 'Cerrar') + '</button>');
  $('sGq').value = S.gq;
  $('sEn').onclick = () => { AV.setLang('en'); AV.closePanel('set') }; $('sEs').onclick = () => { AV.setLang('es'); AV.closePanel('set') };
  $('sVm').oninput = e => { S.vm = +e.target.value; AV.audio && AV.audio.applyVol() }; $('sVs').oninput = e => { S.vs = +e.target.value; AV.audio && AV.audio.applyVol() };
  $('sGq').onchange = e => { S.gq = e.target.value; AV.applyQuality(); AV.save() }; $('sSens').oninput = e => S.sens = +e.target.value; $('sRed').onchange = e => { S.reduce = e.target.checked; AV.save() };
  $('sReal').onchange = e => { S.realFlora = e.target.checked; AV.save() }; $('sFps').onchange = e => { S.fps = e.target.checked; AV.save() };
  if (AV.gfx && AV.gfx.bindSettings) AV.gfx.bindSettings();
};
AV.setLang = function (l) { AV.ui = l; AV.S.set.lang = l; AV.hud(); AV.showHint(); AV.save(); AV.toast(l === 'es' ? 'Idioma: Español' : 'Language: English') };

/* ---------------- touch input (pointer events, multitouch, no pointer lock) ---------------- */
(function () {
  const js = $('js'), jk = $('jk'), lz = $('lz'), RR = 52; let jid = null, jc = null, lid = null, lx = 0, ly = 0;
  function jm(e) { let dx = e.clientX - jc.x, dy = e.clientY - jc.y; const l = Math.hypot(dx, dy); if (l > RR) { dx *= RR / l; dy *= RR / l } const mg = Math.hypot(dx, dy) / RR; T.x = mg < .12 ? 0 : dx / RR; T.y = mg < .12 ? 0 : dy / RR; jk.style.transform = 'translate(' + dx + 'px,' + dy + 'px)' }
  js.addEventListener('pointerdown', e => { if (jid !== null) return; jid = e.pointerId; try { js.setPointerCapture(e.pointerId) } catch (_) { } const b = js.getBoundingClientRect(); jc = { x: b.left + b.width / 2, y: b.top + b.height / 2 }; jm(e); e.preventDefault() });
  js.addEventListener('pointermove', e => { if (e.pointerId === jid) jm(e) });
  const je = e => { if (e.pointerId === jid) { jid = null; T.x = T.y = 0; jk.style.transform = '' } }; js.addEventListener('pointerup', je); js.addEventListener('pointercancel', je);
  lz.addEventListener('pointerdown', e => { if (lid !== null) return; lid = e.pointerId; lx = e.clientX; ly = e.clientY; try { lz.setPointerCapture(e.pointerId) } catch (_) { } e.preventDefault() });
  lz.addEventListener('pointermove', e => { if (e.pointerId !== lid) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; if (AV.running && !AV.blocking()) { const k = .0045 * (AV.S.set.sens || 1); P.yaw -= dx * k; P.pitch = cl(P.pitch - dy * k, -1.45, 1.45) } });
  const le = e => { if (e.pointerId === lid) lid = null }; lz.addEventListener('pointerup', le); lz.addEventListener('pointercancel', le);
  const bind = (id, dn, up) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); dn() }); if (up) ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => b.addEventListener(n, up)) };
  bind('tE', () => { if (AV.running) AV.interact() }); bind('tJ', () => T.jump = true, () => T.jump = false); if ($('tZ')) bind('tZ', () => T.sink = true, () => T.sink = false); bind('tR', () => { T.run = !T.run; $('tR').classList.toggle('on', T.run) });
  bind('tM', () => { if (AV.running) AV.toggleMap() }); bind('tI', () => { if (AV.running) AV.toggleInv() }); bind('tO', () => { if (AV.running) AV.toggleSettings() }); bind('tP', () => { if (AV.running && AV.keymap.KeyP) AV.keymap.KeyP() });
  bind('t1', () => AV.pour && AV.pour(0)); bind('t2', () => AV.pour && AV.pour(1)); bind('t3', () => AV.pour && AV.pour(2));
  document.addEventListener('touchmove', e => { if (AV.running && !(e.target.closest && e.target.closest('#log,.ov,.pnl,.holo'))) e.preventDefault() }, { passive: false });
  document.addEventListener('contextmenu', e => { if (AV.device === 'phone') e.preventDefault() });
})();

/* ---------------- loop ---------------- */
AV.resize = () => { if (!R) return; R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() }; addEventListener('resize', AV.resize);
let last = performance.now(), sav = 0; AV.now = () => performance.now() / 1000; AV.fps = 60; let fa = 0, fn = 0;
AV.startLoop = function () { last = performance.now(); requestAnimationFrame(loop) };
function loop(now) {
  requestAnimationFrame(loop); const raw = (now - last) / 1000, dt = Math.min(.05, raw); last = now; fa += raw; fn++; if (fa > 1) { AV.fps = fn / fa; fa = 0; fn = 0 }
  if (R) { R.info.autoReset = false; R.info.reset() }   // count every render pass of this frame (post-processing renders several times)
  try { update(dt); if (!(AV.gfx && AV.gfx.render())) R.render(scene, cam) } catch (e) { AV.fail('Runtime: ' + e.message); console.error(e) }
  fpsTick(raw * 1000);
}
/* on-screen frame stats (Settings > Show FPS, or F3): FPS + average ms per frame, worst frame, triangles and draw calls */
let fpsT = 0, fpsN = 0, fpsMax = 0, fpsShown = null;
function fpsTick(ms) {
  fpsT += ms; fpsN++; if (ms > fpsMax) fpsMax = ms; if (fpsT < 250) return;
  const el = $('fps'), on = AV.running && AV.S.set.fps !== false;
  if (on !== fpsShown) { el.style.display = on ? 'block' : 'none'; fpsShown = on }
  if (on && R) { const avg = fpsT / fpsN, i = R.info.render; el.textContent = Math.round(1000 / avg) + ' FPS · ' + avg.toFixed(1) + ' ms/frame\n' + tr('worst ', 'peor ') + fpsMax.toFixed(1) + ' ms · ' + (i.triangles / 1000).toFixed(0) + 'k tris · ' + i.calls + ' draws' }
  fpsT = fpsN = fpsMax = 0;
}
AV.gravityScale = 1; let hudT = 0;
function update(dt) {
  const W = AV.W; if (!W) return; const S = AV.S, t = AV.now();
  const run = keys.ShiftLeft || keys.ShiftRight || T.run; let ax = 0, az = 0, dv = null;
  if (!AV.blocking()) {
    const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - T.y, s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + T.x, sn = Math.sin(P.yaw), cs = Math.cos(P.yaw);
    /* V1.0 Living Playground: while riding a vehicle (vehicles.js) AV.drive turns throttle + steering into the velocity; no jumping */
    if (AV.drive) dv = AV.drive(dt, Math.max(-1, Math.min(1, f)), Math.max(-1, Math.min(1, s)), run);
    else { ax = -sn * f + cs * s; az = -cs * f - sn * s; const l = Math.hypot(ax, az); if (l > 1) { ax /= l; az /= l }
      P.yaw += ((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 2 * dt; if ((keys.Space || T.jump) && P.on) { P.vy = W.gravityAt && W.gravityAt(P.x, P.z) === 0 ? 2.6 : 7 * (AV.jumpMul || 1); P.on = false } }
  }
  /* V0.9.7: TRUE zero gravity where a world returns gravityAt 0 (Club Graviton): you float; Space/Jump rises, C/Sink goes down, gentle drag */
  const zeroG = !!(W.gravityAt && W.gravityAt(P.x, P.z) === 0);
  if (zeroG && !AV.blocking()) { const up = (keys.Space || T.jump ? 1 : 0) - (keys.KeyC || keys.ControlLeft || T.sink ? 1 : 0); P.vy += up * 6 * dt; P.vy *= 1 - Math.min(1, .45 * dt) }
  if (zeroG !== AV.inZeroG) { AV.inZeroG = zeroG; const zb = $('tZ'); if (zb) zb.style.display = zeroG && AV.device === 'phone' ? 'block' : 'none'; if (zeroG) AV.toast(tr('ZERO GRAVITY! Jump to float · Space / Jump rises · C / Sink goes down', '¡GRAVEDAD CERO! Salta para flotar · Espacio / Saltar sube · C / Bajar baja')) }
  /* V0.9.4: speedMul (Chiang Mai scooter) */
  if (dv) { P.vx = dv[0]; P.vz = dv[1] } else { const sp = (run ? 7.5 : 4) * (W.speedMul ? W.speedMul() : 1) * (AV.speedMul || 1),   /* 2.2: AV.speedMul / gravMul / jumpMul: item effects (effects.js) */ k = Math.min(1, (P.on ? 14 : 3) * dt); P.vx += (ax * sp - P.vx) * k; P.vz += (az * sp - P.vz) * k }
  const gs = W.gravityAt ? W.gravityAt(P.x, P.z) : 1; AV.gravityScale += (gs - AV.gravityScale) * Math.min(1, 3 * dt); if (zeroG) AV.gravityScale = 0;
  P.vy -= 22 * AV.gravityScale * (AV.gravMul || 1) * dt;
  /* move per axis so walls and cliffs slide instead of sticking */
  for (const ax2 of [0, 1]) {
    const ox = P.x, oz = P.z; if (ax2 === 0) P.x += P.vx * dt; else P.z += P.vz * dt;
    const r = AV.resolve(W, P.x, P.z, .4); P.x = r[0]; P.z = r[1];
    const sf = W.surface(P.x, P.z); if (sf === null || sf - P.y > .9) { P.x = ox; P.z = oz; if (ax2 === 0) P.vx = 0; else P.vz = 0 }
  }
  P.y += P.vy * dt; const gy = W.surface(P.x, P.z) || 0;
  { const cy = W.ceilingAt ? W.ceilingAt(P.x, P.z) : null; if (cy != null && P.y > cy) { P.y = cy; if (P.vy > 0) P.vy = -P.vy * .3 } }   // soft ceiling (zero-g dome)
  if (P.y <= gy) { P.y = gy; P.vy = 0; P.on = true } else if (P.on && P.vy <= 0 && P.y - gy < .5) { P.y = gy } else P.on = false;
  /* conversation framing: while AV.focus() returns a world point (the face of whoever you are talking to), the view eases onto it.
     Cleared automatically once the getter returns null or no modal is open. */
  if (AV.focus) {
    const f = AV.blocking() ? AV.focus() : null;
    if (!f) AV.focus = null;
    else { const dx = f.x - P.x, dy = f.y - (P.y + 1.7), dz = f.z - P.z, hd = Math.hypot(dx, dz);
      if (hd > .2) { const k = 1 - Math.exp(-7 * dt), ty = Math.atan2(-dx, -dz), tp = cl(Math.atan2(dy, hd), -1.45, 1.45);
        P.yaw += Math.atan2(Math.sin(ty - P.yaw), Math.cos(ty - P.yaw)) * k; P.pitch += (tp - P.pitch) * k } }
  }
  const bob = !S.set.reduce && Math.hypot(P.vx, P.vz) > 1 && P.on ? Math.sin(t * 9) * .04 : 0;
  cam.position.set(P.x, P.y + 1.7 + bob, P.z); cam.rotation.set(P.pitch, P.yaw, 0);
  S.time += dt * 2; if (S.time >= 1440) { S.time -= 1440; S.day++ } hudT -= dt; if (hudT <= 0) { hudT = 2; AV.hud() }
  skyAt(S.time, dt);
  for (const f of W.upd) f(dt, t); if (W.update) W.update(dt, t); for (const f of AV.frameFns) f(dt, t);
  findNear(); if ((sav += dt) > 20) { sav = 0; AV.save() }
  document.body.classList.toggle('nm', AV.modals.some(m => m.id === 'chat'));
}
addEventListener('beforeunload', () => { try { AV.save() } catch (e) { } });
})(window.AV);
