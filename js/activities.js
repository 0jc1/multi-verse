/* APEVERSE - activities.js : Living Playground, Milestone 1 (activity framework) + basketball + photography.
   AV.act       : registry of activities. One activity at a time: start (from an interaction), play, exit (Esc / Leave button),
                  back to normal first-person walking. Shared HUD (title, score, timer, charge meter, hint), shared input
                  (left mouse / F hold = "action", Esc = leave; phone: hold ACTION + LEAVE buttons), progress saved in AV.S.act.
   AV.act.place : puts an activity's venue into a world from configuration (same code for every world: see PLACES).
   Basketball   : real ball flight (gravity per court, so the Astro-9 court is low-gravity), rim + backboard + floor bounces,
                  basket detection (2 pts, 3 beyond the arc), modes: casual, 60-second challenge, first-to-5 vs a court regular.
                  Shot power uses a charge meter with the ideal power marked; aim is your view (gentle aim assist near the hoop).
   Photography  : camera item (backpack) or K: clean photo mode (no HUD), filters, shutter; photos saved in this browser
                  (IndexedDB), album with download + delete. Nothing is uploaded anywhere. */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, TAU = Math.PI * 2;
const ACT = AV.act = { types: {}, cur: null };
const st = () => { const S = AV.S; S.act = S.act || {}; return S.act };
const blip = (f, d, w, v) => AV.audio && AV.audio.blip && AV.audio.blip(f, d, w, v);
ACT.stats = id => { const a = st(); return a[id] = a[id] || {} };
ACT.register = (id, def) => { ACT.types[id] = def };
ACT.busy = () => !!ACT.cur;

/* ---------- shared HUD + touch buttons ---------- */
const css = document.createElement('style');
css.textContent = '#actHud{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:30;background:rgba(20,10,40,.78);color:#fff;border:1px solid #ffd84a;border-radius:10px;padding:8px 14px;font:14px Georgia,serif;text-align:center;min-width:260px;display:none;pointer-events:auto}' +
  '#actHud b{color:#ffd84a}#actHud .meter{position:relative;height:12px;background:#333;border-radius:6px;margin:6px 0;overflow:hidden}#actHud .fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#3ad0ff,#ff4ad2)}' +
  '#actHud .zone{position:absolute;top:0;bottom:0;background:rgba(90,255,120,.75)}#actHud small{opacity:.8}#actHud button{margin:4px 3px 0;font:13px Georgia,serif}' +
  '.actTb{position:fixed;z-index:31;display:none;border-radius:50%;border:2px solid #fff;color:#fff;font:bold 15px Georgia,serif;touch-action:none}' +
  '#photoFrame{position:fixed;inset:6%;border:2px solid rgba(255,255,255,.75);border-radius:6px;z-index:29;display:none;pointer-events:none;box-shadow:0 0 0 9999px rgba(0,0,0,.18)}#photoFlash{position:fixed;inset:0;background:#fff;opacity:0;z-index:40;pointer-events:none;transition:opacity .35s}' +
  '#album .ph{display:inline-block;margin:4px;text-align:center;vertical-align:top}#album img{width:150px;border-radius:4px;display:block}';
document.head.appendChild(css);
const hud = document.createElement('div'); hud.id = 'actHud'; document.body.appendChild(hud);
const mkBtn = (id, txt, style) => { const b = document.createElement('button'); b.id = id; b.className = 'actTb'; b.textContent = txt; b.style.cssText = style; document.body.appendChild(b); return b };
const bAct = mkBtn('actGo', 'SHOOT', 'right:calc(24px + env(safe-area-inset-right,0px));bottom:calc(40px + env(safe-area-inset-bottom,0px));width:96px;height:96px;background:rgba(255,120,40,.7)');
const bExit = mkBtn('actExit', tr('Leave', 'Salir'), 'right:calc(140px + env(safe-area-inset-right,0px));bottom:calc(40px + env(safe-area-inset-bottom,0px));width:64px;height:64px;background:rgba(80,80,90,.7)');
['frame', 'flash'].forEach(k => { const d = document.createElement('div'); d.id = k === 'frame' ? 'photoFrame' : 'photoFlash'; document.body.appendChild(d) });
const HIDE = ['tE', 'tK', 'tP', 'tW', 'tU', 'tN', 'tF', 'tZ'];   // phone buttons that would clash with the activity buttons

ACT.start = function (id, opt) {
  if (ACT.cur || AV.blocking() || !AV.W) return false; const def = ACT.types[id]; if (!def) return false;
  const s = ACT.cur = Object.assign({ id, def, t0: AV.now(), W: AV.W, press: false, score: 0 }, opt || {});
  if (AV.device === 'phone') { bAct.textContent = def.btn ? tr(def.btn[0], def.btn[1]) : 'GO'; bAct.style.display = def.noAct ? 'none' : 'block'; bExit.style.display = 'block'; HIDE.forEach(k => { const e = $(k); if (e) { e.dataset.actHid = e.style.display; e.style.display = 'none' } }) }
  hud.style.display = 'block'; if (def.start) def.start(s); ACT.draw(); return true;
};
ACT.end = function (why) {
  const s = ACT.cur; if (!s) return; ACT.cur = null; try { s.def.end && s.def.end(s, why) } catch (e) { console.warn(e) }
  hud.style.display = 'none'; bAct.style.display = bExit.style.display = 'none';
  HIDE.forEach(k => { const e = $(k); if (e && e.dataset.actHid !== undefined) { e.style.display = e.dataset.actHid; delete e.dataset.actHid } }); AV.save();
};
ACT.draw = function () { const s = ACT.cur; if (!s) return; hud.innerHTML = s.def.hud(s) + '<div><button id="actLeave">' + tr('Leave (Esc)', 'Salir (Esc)') + '</button></div>'; const b = $('actLeave'); if (b) b.onclick = () => ACT.end('leave'); if (s.def.wire) s.def.wire(s) };
const press = v => { const s = ACT.cur; if (!s || AV.blocking() || s.press === v) return; s.press = v; s.def.press && s.def.press(s, v) };
/* input: capture phase, so the activity owns Esc / F / left mouse while it runs (punch + festival keys stay quiet) */
addEventListener('keydown', e => { if (!ACT.cur || AV.blocking() || e.target.tagName === 'INPUT') return; if (e.code === 'Escape') { e.stopImmediatePropagation(); ACT.end('leave') } else if (e.code === 'KeyF') { e.stopImmediatePropagation(); e.preventDefault(); if (!e.repeat) press(true) } }, true);
addEventListener('keyup', e => { if (ACT.cur && e.code === 'KeyF') press(false) }, true);
addEventListener('mousedown', e => { if (ACT.cur && e.button === 0 && document.pointerLockElement === $('c')) { e.stopImmediatePropagation(); press(true) } }, true);
addEventListener('mouseup', e => { if (ACT.cur && e.button === 0) press(false) }, true);
bAct.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); press(true) }); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => bAct.addEventListener(n, () => press(false)));
bExit.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); ACT.end('leave') });
/* activities run on REAL time (sub-stepped), so a shot takes the same seconds on a slow phone as on a fast laptop */
AV.frameFns.push((dt, t) => { const s = ACT.cur; if (!s) return; if (AV.W !== s.W) return ACT.end('world'); const now = AV.now(), rdt = Math.min(1, Math.max(0, now - (s.lastT || now))); s.lastT = now; if (s.def.update) s.def.update(s, rdt, t) });
/* the punch (punch.js) stays off while an activity runs */
if (AV.punch && AV.punch.punch) { const p0 = AV.punch.punch; AV.punch.punch = function () { if (!ACT.cur) return p0.apply(this, arguments) } }

/* ---------- venues placed from configuration, rebuilt every time you enter that world ---------- */
const PLACES = {
  chiang_mai: [{ type: 'hoops', x: 39, z: 78, ry: Math.PI / 2, name: ['Moon Muang neighbourhood court', 'Cancha del barrio Moon Muang'], col: '#3a6a8a', npc: ['Court regular Tee', 'human'] }],
  ape_town: [{ type: 'hoops', x: 24, z: 77, ry: 0, name: ['La Finca community court', 'Cancha comunitaria La Finca'], col: '#7a4a9a', npc: ['Baller Bongo Jr.', 'ape'] }],
  astro9: [{ type: 'hoops', x: 22, z: 26, ry: 0, g: 3.2, half: true, name: ['Graviton low-G court', 'Cancha de baja gravedad Graviton'], col: '#2a2a5a', npc: ['Zorb the dunker', 'alien'] }],
  vienna: [{ type: 'hoops', x: 131, z: 110, ry: 0, name: ['Donaupark street court', 'Cancha callejera Donaupark'], col: '#8a3a3a', npc: ['Lukas from the Gymnasium', 'human'] }]
};
ACT.PLACES = PLACES; ACT.venues = [];
ACT.place = function (W, p) { const def = ACT.types[p.type]; if (def && def.place) { const v = def.place(W, p); if (v) ACT.venues.push(v); return v } };
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); ACT.venues = []; (PLACES[W.id] || []).forEach(p => { try { ACT.place(W, p) } catch (e) { console.warn('activity place failed', p, e) } }); giveCamera() };

/* ======================= BASKETBALL ======================= */
const RIM_Y = 3.05, RIM_R = .23, BALL_R = .12, BOARD = { w: 1.8, y0: 2.9, y1: 3.95 };
let ballTex = null;
function ballMat() { if (!ballTex) ballTex = AV.mkc(128, (c, cv) => { c.fillStyle = '#e8702a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#2a1408'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 64); c.lineTo(128, 64); c.moveTo(64, 0); c.lineTo(64, 128); c.stroke(); c.beginPath(); c.arc(0, 64, 46, -1.2, 1.2); c.stroke(); c.beginPath(); c.arc(128, 64, 46, 1.95, 4.35); c.stroke(); for (let i = 0; i < 600; i++) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(Math.random() * 128, Math.random() * 128, 1, 1) } });
  const m = new THREE.MeshStandardMaterial({ map: ballTex, roughness: .75 }); m.userData.lin = 1; return m }
function courtTex(col, half) { return AV.mkc(512, (c) => { c.fillStyle = col; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 3000; i++) { c.fillStyle = 'rgba(255,255,255,' + (Math.random() * .05).toFixed(3) + ')'; c.fillRect(Math.random() * 512, Math.random() * 512, 2, 2) }
  c.strokeStyle = '#fff'; c.lineWidth = 5; c.strokeRect(6, 6, 500, 500); const sx = 512 / 17, sy = 512 / 11, X = a => 256 + a * sx, Y = b => 256 + b * sy;
  if (!half) { c.beginPath(); c.moveTo(256, 6); c.lineTo(256, 506); c.stroke(); c.beginPath(); c.arc(256, 256, 1.8 * sx, 0, TAU); c.stroke() }
  for (const s of half ? [1] : [1, -1]) { const hx = X(s * 7.22); c.strokeRect(Math.min(hx, X(s * 2.6)), Y(-2.45), Math.abs(hx - X(s * 2.6)) + (s > 0 ? 40 : 0), 4.9 * sy); c.beginPath(); c.arc(X(s * 2.6), 256, 1.8 * sx, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(hx, 256, 6.75 * sx, 6.75 * sy, 0, s > 0 ? Math.PI / 2 : -Math.PI / 2, s > 0 ? 3 * Math.PI / 2 : Math.PI / 2); c.stroke() } }) }
const HOOPS = ACT.hoops = {};
ACT.register('hoops', {
  btn: ['SHOOT', 'TIRAR'],
  place(W, p) {
    const g = new THREE.Group(), gy = W.surface(p.x, p.z) || 0, cr = Math.cos(p.ry || 0), sr = Math.sin(p.ry || 0), L = (a, b) => [p.x + a * cr + b * sr, p.z - a * sr + b * cr];
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(p.half ? 10 : 17, 11), new THREE.MeshStandardMaterial({ map: courtTex(p.col || '#3a6a8a', p.half), roughness: .85 })); fl.material.userData.lin = 1; fl.rotation.x = -Math.PI / 2; fl.rotation.z = p.ry || 0;
    const fc = p.half ? L(3.5, 0) : [p.x, p.z]; fl.position.set(fc[0], gy + .03, fc[1]); fl.receiveShadow = true; g.add(fl);
    const hoops = [];
    for (const s of p.half ? [1] : [1, -1]) {
      const pole = L(s * 8.3, 0), arm = L(s * 7.85, 0), bd = L(s * 7.6, 0), rim = L(s * 7.22, 0), ry = (p.ry || 0) + (s > 0 ? 0 : Math.PI);
      AV.mk(AV.G.cyl, AV.std(0x9aa0b0, .4, .6), pole[0], gy + 1.8, pole[1], .09, 3.6, .09, g); W.circles.push([pole[0], pole[1], .25]);
      const a = AV.mk(AV.G.box, AV.std(0x9aa0b0, .4, .6), arm[0], gy + 3.4, arm[1], .9, .08, .08, g); a.rotation.y = ry;
      const b = AV.mk(AV.G.box, new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: .3, transparent: true, opacity: .85 }), bd[0], gy + 3.42, bd[1], .05, 1.05, BOARD.w, g); b.rotation.y = ry;
      const sq = AV.mk(AV.G.box, AV.std(0xe83a30, .5), bd[0] - s * cr * .03, gy + 3.25, bd[1] + s * sr * .03, .02, .45, .59, g); sq.rotation.y = ry;
      const r = new THREE.Mesh(new THREE.TorusGeometry(RIM_R, .018, 6, 24), AV.std(0xff5a1a, .4, .3)); r.rotation.x = Math.PI / 2; r.position.set(rim[0], gy + RIM_Y, rim[1]); g.add(r);
      const net = new THREE.Mesh(new THREE.CylinderGeometry(RIM_R, RIM_R * .6, .42, 12, 3, true), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .7 })); net.position.set(rim[0], gy + RIM_Y - .21, rim[1]); g.add(net);
      hoops.push({ rim: new THREE.Vector3(rim[0], gy + RIM_Y, rim[1]), board: { x: bd[0], z: bd[1], nx: -s * cr, nz: s * sr }, net, ax: s });
    }
    const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 16, 12), ballMat()); ball.castShadow = true; const rack = L(p.half ? 1.2 : 0, -6.2); ball.position.set(rack[0], gy + BALL_R, rack[1]); g.add(ball);
    const ghost = new THREE.Mesh(ball.geometry, ball.material); ghost.visible = false; g.add(ghost);
    AV.lin(g); W.group.add(g);
    const v = { type: 'hoops', p, W, g, gy, hoops, ball, ghost, rack: new THREE.Vector3(rack[0], gy + BALL_R, rack[1]), grav: p.g || 9.8, L, npc: null, practiceT: AV.now() + 6 + Math.random() * 6, gball: null };
    const sp = L(p.half ? 4 : 0, 6.4); ctx2(W, p, v, sp);
    W.T.push({ x: rack[0], z: rack[1], r: 2.4, show: () => !ACT.cur, label: () => tr('🏀 Basketball: pick up the ball (', '🏀 Baloncesto: coger el balón (') + tr(p.name[0], p.name[1]) + ')', fn: () => HOOPS.menu(v) });
    W.upd.push((dt, t) => HOOPS.ambient(v, dt, t));
    { const sg = L(p.half ? -1.4 : -8.9, -5.4); AV.kit && AV.kit.sign && W.ctx && W.ctx.sign(tr(p.name[0], p.name[1]).toUpperCase(), sg[0], gy + 2.6, sg[1], (p.ry || 0) + Math.PI, 4.6, '#ffd84a', { posts: true }) }
    return v;
  },
  start(s) { const v = s.v; s.ball = v.ball; s.made = 0; s.att = 0; s.streak = 0; s.state = 'hold'; s.charge = 0; s.dir = 1; s.flight = null; s.npcScore = 0; s.turn = 'you'; s.msg = '';
    if (s.mode === 'timed') s.tEnd = AV.now() + 60; holdBall(s); AV.audio && AV.audio.blip && blip(440, .1, 'triangle', .1) },
  press(s, on) {
    if (s.state === 'hold' && on && s.turn === 'you') { s.state = 'charge'; s.charge = 0; s.dir = 1 }
    else if (s.state === 'charge' && !on) shoot(s);
  },
  update(s, dt, t) {
    const v = s.v; if (s.mode === 'timed' && AV.now() >= s.tEnd && s.state !== 'over') return finish(s);
    if (s.state === 'charge') { s.charge += s.dir * dt / 1.1; if (s.charge >= 1) { s.charge = 1; s.dir = -1 } else if (s.charge <= 0) { s.charge = 0; s.dir = 1 } }
    if (s.state === 'hold' || s.state === 'charge') { const c = AV.cam, b = s.ball; b.position.set(.22, -.22, -.55); if (b.parent !== c) c.add(b) }
    if (s.flight) stepFlight(s, s.flight, dt);
    if (s.npcShot) stepFlight(s, s.npcShot, dt);
    if (Math.floor(t * 4) !== s.drawK) { s.drawK = Math.floor(t * 4); ACT.draw() } else if (s.state === 'charge') ACT.draw();
  },
  end(s, why) { const v = s.v, b = s.ball; if (b.parent !== v.g) { v.g.add(b) } b.position.copy(v.rack); v.ghost.visible = false; s.flight = s.npcShot = null;
    const S = ACT.stats('hoops'); S.made = (S.made || 0) + s.made; S.att = (S.att || 0) + s.att; if (why === 'leave' && s.mode !== 'timed') AV.toast(tr('Basketball: ' + s.made + ' / ' + s.att + ' made. Ball back on the rack.', 'Baloncesto: ' + s.made + ' / ' + s.att + ' encestadas. Balón de vuelta.')) },
  hud(s) {
    const v = s.v, S = ACT.stats('hoops'), d = distToRim(s), ideal = idealCharge(s, d), three = d > 6.75 && !v.p.half;
    let top = '<b>🏀 ' + tr(v.p.name[0], v.p.name[1]) + (v.grav < 9 ? ' · ' + tr('low gravity', 'baja gravedad') : '') + '</b><br>';
    if (s.mode === 'timed') top += tr('60-second challenge', 'Reto de 60 segundos') + ' · <b>' + s.score + '</b> ' + tr('pts', 'pts') + ' · ' + Math.max(0, Math.ceil(s.tEnd - AV.now())) + ' s · ' + tr('best ', 'récord ') + (S.best60 || 0);
    else if (s.mode === 'npc') top += tr('First to 5 vs ', 'Primero a 5 contra ') + s.v.p.npc[0] + ' · ' + tr('you ', 'tú ') + '<b>' + s.made + '</b> – <b>' + s.npcScore + '</b> ' + (s.turn === 'you' ? tr('· your shot', '· te toca') : tr('· their shot', '· le toca'));
    else top += tr('Casual shooting', 'Tiro libre') + ' · ' + s.made + ' / ' + s.att + (s.streak > 1 ? ' · ' + tr('streak ', 'racha ') + s.streak : '');
    const meter = '<div class="meter"><div class="zone" style="left:' + Math.max(0, (ideal - .05) * 100).toFixed(1) + '%;width:10%"></div><div class="fill" style="width:' + (s.charge * 100).toFixed(1) + '%"></div></div>';
    const hint = AV.device === 'phone' ? tr('Aim with your view · hold SHOOT, release in the green', 'Apunta con la vista · mantén TIRAR y suelta en el verde') : tr('Aim at the hoop · hold click or F, release in the green · Esc leaves', 'Apunta al aro · mantén clic o F, suelta en el verde · Esc para salir');
    return top + meter + '<small>' + (s.msg ? s.msg + ' · ' : '') + d.toFixed(1) + ' m' + (three ? ' · 3 pts' : '') + ' · ' + hint + '</small>';
  }
});
function ctx2(W, p, v, sp) {   /* a court regular: challenge them, or watch them practise */
  if (!AV.beings || !p.npc) return; const k = p.npc[1] === 'alien' ? 'alien' : p.npc[1], keep = AV.beings.list; const list = AV.beings.spawn(W.ctx, [{ kind: k, x: sp[0], y: v.gy, z: sp[1], yaw: Math.atan2(v.hoops[0].rim.x - sp[0], v.hoops[0].rim.z - sp[1]), mode: 'idle', name: p.npc[0], seed: 777 + Math.round(p.x) }]);
  AV.beings.list = keep;   /* beings.spawn() replaces its "last spawned" list; keep the world's own crowd list intact */
  const b = list && list[0]; if (!b) return; v.npc = b; b.tgFixed = true;
  b.tg.label = () => tr('Challenge ' + p.npc[0] + ' (first to 5)', 'Desafiar a ' + p.npc[0] + ' (primero a 5)'); b.tg.show = () => !ACT.cur; b.tg.fn = () => HOOPS.menu(v, 'npc');
}
HOOPS.menu = function (v, pre) {
  const S = ACT.stats('hoops'), go = m => { AV.closePanel('cmp'); setTimeout(() => ACT.start('hoops', { v, mode: m }), 60) };
  if (pre) return go(pre);
  const p = AV.panel('cmp', '<b>🏀 ' + tr(v.p.name[0], v.p.name[1]) + '</b><div class="note">' + tr('Made so far: ', 'Encestadas hasta ahora: ') + (S.made || 0) + ' / ' + (S.att || 0) + ' · ' + tr('60 s record: ', 'récord 60 s: ') + (S.best60 || 0) + ' · ' + tr('wins vs regulars: ', 'victorias: ') + (S.wins || 0) + '</div><div class="grid">' +
    '<button data-m="casual">' + tr('Shoot around (casual)', 'Tirar a canasta (libre)') + '</button><button data-m="timed">' + tr('60-second challenge', 'Reto de 60 segundos') + '</button>' + (v.npc ? '<button data-m="npc">' + tr('First to 5 vs ', 'Primero a 5 contra ') + v.p.npc[0] + '</button>' : '') + '<button data-close>' + tr('Not now', 'Ahora no') + '</button></div>');
  p.querySelectorAll('[data-m]').forEach(b => b.onclick = () => go(b.dataset.m));
};
const _v = new THREE.Vector3(), _f = new THREE.Vector3();
/* the hoop you are facing (smallest angle to your view), not simply the nearest one */
function hoopFor(s) { const v = s.v, P = AV.P, fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); let best = v.hoops[0], bd = -2; for (const h of v.hoops) { const dx = h.rim.x - P.x, dz = h.rim.z - P.z, l = Math.hypot(dx, dz) || 1, dot = (dx * fx + dz * fz) / l; if (dot > bd) { bd = dot; best = h } } return best }
function distToRim(s) { const h = hoopFor(s); return Math.hypot(h.rim.x - AV.P.x, h.rim.z - AV.P.z) }
/* release point: from the player's eyes along the view (computed from AV.P, so it never lags a frame behind the camera) */
const EYE = 1.69;
function launchPos(out) { const P = AV.P, cp = Math.cos(P.pitch); _f.set(-Math.sin(P.yaw) * cp, Math.sin(P.pitch), -Math.cos(P.yaw) * cp); return out.set(P.x, P.y + EYE, P.z).addScaledVector(_f, .45).add(_v.set(0, -.12, 0)) }
const ANG = 58 * Math.PI / 180, VMIN = 4, VMAX = 14;   /* a high arc: the ball drops in steeply enough to clear the front rim */
const aimPt = h => ({ x: h.rim.x, y: h.rim.y + .02, z: h.rim.z });   /* the centre of the ring: with a 58° arc it clears both the front and the back rim */
function idealSpeed(s, from, h) { const a = aimPt(h), d = Math.hypot(a.x - from.x, a.z - from.z), dy = a.y - from.y, den = 2 * Math.cos(ANG) ** 2 * (d * Math.tan(ANG) - dy); return den > 0 ? Math.sqrt(s.v.grav * d * d / den) : VMAX }
function idealCharge(s) { const sc = Math.sqrt(s.v.grav / 9.8), p = launchPos(new THREE.Vector3()); return Math.max(0, Math.min(1, (idealSpeed(s, p, hoopFor(s)) / sc - VMIN) / (VMAX - VMIN))) }
ACT._ideal = s => idealCharge(s);   // used by tests (and could drive an "easy mode" later)
/* tests: fast-forward the running activity at a steady 60 Hz without waiting for rendered frames (logic is frame-rate independent) */
ACT._ff = secs => { const s = ACT.cur; if (!s) return; for (let i = 0; i < secs * 60 && ACT.cur === s; i++) s.def.update(s, 1 / 60, 0); s.lastT = AV.now() };
function holdBall(s) { s.state = 'hold'; s.charge = 0; const b = s.ball; AV.cam.add(b); b.position.set(.22, -.22, -.55) }
function shoot(s) {
  const v = s.v, h = hoopFor(s), b = s.ball, p0 = launchPos(new THREE.Vector3()), sc = Math.sqrt(v.grav / 9.8), speed = (VMIN + s.charge * (VMAX - VMIN)) * sc;
  AV.cam.remove(b); v.g.add(b); b.position.copy(p0);
  /* direction: your view's heading; within 12° of the hoop it snaps to the hoop (gentle assist), launch angle fixed at 52° */
  const ap = aimPt(h), yawHoop = Math.atan2(ap.x - p0.x, ap.z - p0.z), yawView = Math.atan2(-Math.sin(AV.P.yaw), -Math.cos(AV.P.yaw)); let dyaw = Math.atan2(Math.sin(yawHoop - yawView), Math.cos(yawHoop - yawView)); const yaw = Math.abs(dyaw) < .21 ? yawHoop : yawView;
  const vel = new THREE.Vector3(Math.sin(yaw) * Math.cos(ANG), Math.sin(ANG), Math.cos(yaw) * Math.cos(ANG)).multiplyScalar(speed);
  s.flight = { b, pos: b.position, vel, t: 0, h, scored: false, who: 'you', from: Math.hypot(h.rim.x - p0.x, h.rim.z - p0.z), bounces: 0 };
  s.state = 'flight'; s.att++; s.msg = ''; blip(220, .08, 'sine', .12);
}
function stepFlight(s, f, dt) {
  const v = s.v, g = v.grav, n = Math.max(4, Math.ceil(dt / .006)), h = f.h; f.t += dt;
  for (let i = 0; i < n; i++) { const d = dt / n; f.vel.y -= g * d; f.pos.addScaledVector(f.vel, d);
    /* backboard (thin vertical plate facing the court) */
    const bx = f.pos.x - h.board.x, bz = f.pos.z - h.board.z, along = bx * h.board.nx + bz * h.board.nz, lat = Math.abs(-bx * h.board.nz + bz * h.board.nx);
    if (along < BALL_R + .03 && along > -.1 && lat < BOARD.w / 2 && f.pos.y > v.gy + BOARD.y0 && f.pos.y < v.gy + BOARD.y1) { const vn = f.vel.x * h.board.nx + f.vel.z * h.board.nz; if (vn < 0) { f.vel.x -= 1.6 * vn * h.board.nx; f.vel.z -= 1.6 * vn * h.board.nz; blip(140, .07, 'square', .06) } f.pos.x += (BALL_R + .03 - along) * h.board.nx; f.pos.z += (BALL_R + .03 - along) * h.board.nz }
    /* rim (torus): push out along the normal from the closest point of the ring, damped bounce */
    const rx = f.pos.x - h.rim.x, rz = f.pos.z - h.rim.z, hl = Math.hypot(rx, rz) || 1e-4, cx = h.rim.x + rx / hl * RIM_R, cz = h.rim.z + rz / hl * RIM_R, nx = f.pos.x - cx, ny = f.pos.y - h.rim.y, nz = f.pos.z - cz, nd = Math.hypot(nx, ny, nz), mind = BALL_R + .018;
    if (nd < mind) { const ux = nx / nd, uy = ny / nd, uz = nz / nd, vn = f.vel.x * ux + f.vel.y * uy + f.vel.z * uz; if (vn < 0) { f.vel.x -= 1.55 * vn * ux; f.vel.y -= 1.55 * vn * uy; f.vel.z -= 1.55 * vn * uz; if (Math.abs(vn) > .6) blip(620, .09, 'triangle', .08) } f.pos.set(cx + ux * mind, h.rim.y + uy * mind, cz + uz * mind) }
    /* basket: crossing the rim plane downward, inside the ring */
    if (!f.scored && f.vel.y < 0 && f.pos.y < h.rim.y && f.pos.y - f.vel.y * d >= h.rim.y && hl < RIM_R - .02) { f.scored = true; scored(s, f) }
    /* floor */
    const fy = v.gy + BALL_R; if (f.pos.y < fy) { f.pos.y = fy; if (f.vel.y < -.8) { f.bounces++; blip(80 + Math.random() * 20, .07, 'sine', Math.min(.3, -f.vel.y * .04)) } f.vel.y = -f.vel.y * .7; f.vel.x *= .88; f.vel.z *= .88 }
  }
  f.b.rotation.x += dt * 6;
  if (f.scored && h.net) h.net.scale.y = 1 + Math.max(0, .35 - (f.t - f.st)) ;
  const far = Math.hypot(f.pos.x - h.rim.x, f.pos.z - h.rim.z) > 30;
  if (f.t > (f.scored ? 2.2 : 3.4) || far || (f.bounces > 3 && f.t > 1.4)) doneFlight(s, f);
}
function scored(s, f) {
  const pts = s.v.p.half ? 2 : (f.from > 6.75 ? 3 : 2); f.st = f.t; blip(1320, .18, 'sine', .07); setTimeout(() => blip(990, .25, 'sine', .05), 90);
  if (f.who === 'npc') { s.npcScore++; s.msg = s.v.p.npc[0] + tr(' scores!', ' anota!'); return }
  s.made++; s.streak++; s.score += pts; s.msg = (pts === 3 ? tr('THREE! ', '¡TRIPLE! ') : tr('Swish! ', '¡Dentro! ')) + '+' + pts; AV.vitals && AV.vitals.add(0, 2);
  if (s.streak >= 3) { cheer(); s.msg += tr(' · on fire!', ' · ¡en racha!') }
}
function doneFlight(s, f) {
  if (f.who === 'npc') { s.npcShot = null; s.v.ghost.visible = false; if (s.npcScore >= 5) return finish(s); s.turn = 'you'; holdBall(s); ACT.draw(); return }
  s.flight = null; if (!f.scored) { s.streak = 0; s.msg = s.msg || AV.pick([tr('Brick!', '¡Ladrillo!'), tr('So close.', 'Casi.'), tr('Off the rim.', 'Al aro.')]) }
  if (s.mode === 'npc') { if (s.made >= 5) return finish(s); s.turn = 'npc'; s.state = 'wait'; s.ball.visible = true; s.v.g.add(s.ball); s.ball.position.copy(s.v.rack); setTimeout(() => npcShoot(s), 700) }
  else holdBall(s);
  ACT.draw();
}
function npcShoot(s) {   /* the regular shoots from their spot; skill decides the error */
  if (ACT.cur !== s) return; const v = s.v, h = v.hoops[0], b = v.npc, from = b ? b.h.position.clone().add(_v.set(0, 2.1, 0)) : v.rack.clone().add(_v.set(0, 2, 0));
  const g = v.grav, ideal = idealSpeed(s, from, h), skill = .55, err = Math.random() < skill ? (Math.random() - .5) * .02 : (Math.random() < .5 ? -1 : 1) * (.04 + Math.random() * .08);
  const ap = aimPt(h), yaw = Math.atan2(ap.x - from.x, ap.z - from.z) + (Math.random() - .5) * .02, sp = ideal * (1 + err);
  v.ghost.visible = true; v.ghost.position.copy(from); if (b) { b.play && b.play('Wave', .2) }
  s.npcShot = { b: v.ghost, pos: v.ghost.position, vel: new THREE.Vector3(Math.sin(yaw) * Math.cos(ANG), Math.sin(ANG), Math.cos(yaw) * Math.cos(ANG)).multiplyScalar(sp), t: 0, h, scored: false, who: 'npc', from: 5, bounces: 0 };
  blip(220, .08, 'sine', .1);
}
function cheer() { [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, .2, 'triangle', .06), i * 90)) }
function finish(s) {
  const S = ACT.stats('hoops'); s.state = 'over';
  if (s.mode === 'timed') { const best = S.best60 || 0, rec = s.score > best; if (rec) S.best60 = s.score; const pay = Math.min(25, s.score); if (pay > 0) AV.txn(pay, 'Basketball challenge'); AV.toast(tr('Time! ' + s.score + ' points' + (rec ? ' — new record!' : '') + (pay ? ' +' + pay + ' credits.' : ''), '¡Tiempo! ' + s.score + ' puntos' + (rec ? ' — ¡nuevo récord!' : '') + (pay ? ' +' + pay + ' créditos.' : ''))); cheer() }
  if (s.mode === 'npc') { const win = s.made >= 5; S[win ? 'wins' : 'losses'] = (S[win ? 'wins' : 'losses'] || 0) + 1; if (win) { AV.txn(15, 'Basketball win vs ' + s.v.p.npc[0]); cheer() } AV.relate && AV.relate(s.v.p.npc[0], win ? 2 : 1);
    AV.toast(win ? tr('You win ' + s.made + '–' + s.npcScore + '! ' + s.v.p.npc[0] + ': “Rematch soon.” +15 credits.', '¡Ganas ' + s.made + '–' + s.npcScore + '! ' + s.v.p.npc[0] + ': “Revancha pronto.” +15 créditos.') : tr(s.v.p.npc[0] + ' wins ' + s.npcScore + '–' + s.made + '. “Good game!”', s.v.p.npc[0] + ' gana ' + s.npcScore + '–' + s.made + '. “¡Buen partido!”')) }
  ACT.end('finish');
}
/* ambient life: the regular practises on their own now and then (only near the player, only when you are not playing) */
HOOPS.ambient = function (v, dt, t) {
  const P = AV.P, d = Math.hypot(P.x - v.rack.x, P.z - v.rack.z); if (d > 45 || !v.npc) return;
  if (ACT.cur && ACT.cur.v === v) return;
  if (v.gball) { const f = v.gball, h = f.h, now = AV.now(); dt = Math.min(1, now - (f.lt || now)); f.lt = now; f.vel.y -= v.grav * dt; f.pos.addScaledVector(f.vel, dt); f.t += dt; if (!f.sc && f.vel.y < 0 && f.pos.y < h.rim.y && Math.hypot(f.pos.x - h.rim.x, f.pos.z - h.rim.z) < RIM_R) { f.sc = true; if (d < 20) blip(1200, .12, 'sine', .03) } if (f.pos.y < v.gy + BALL_R || f.t > 3) { v.gball = null; v.ghost.visible = false } return }
  if (AV.now() < v.practiceT) return; v.practiceT = AV.now() + 7 + Math.random() * 9;
  const h = v.hoops[0], from = v.npc.h.position.clone().add(_v.set(0, 2.1, 0)), sp = idealSpeed({ v }, from, h) * (1 + (Math.random() < .5 ? 0 : (Math.random() - .5) * .12)), yaw = Math.atan2(aimPt(h).x - from.x, aimPt(h).z - from.z);
  v.ghost.visible = true; v.ghost.position.copy(from); v.gball = { pos: v.ghost.position, vel: new THREE.Vector3(Math.sin(yaw) * Math.cos(ANG), Math.sin(ANG), Math.cos(yaw) * Math.cos(ANG)).multiplyScalar(sp), t: 0, h };
};

/* lightweight relationship counter (Milestone 4 builds on it) */
AV.relate = AV.relate || function (who, n) { const S = AV.S; S.rel = S.rel || {}; S.rel[who] = (S.rel[who] || 0) + (n || 1); return S.rel[who] };

/* ======================= PHOTOGRAPHY ======================= */
const FILTERS = [['none', ['Natural', 'Natural'], 'none'], ['warm', ['Warm film', 'Película cálida'], 'sepia(.35) saturate(1.3) contrast(1.05)'], ['mono', ['Black & white', 'Blanco y negro'], 'grayscale(1) contrast(1.15)'], ['psy', ['Psychedelic', 'Psicodélico'], 'hue-rotate(70deg) saturate(2.2) contrast(1.1)'], ['dream', ['Dreamy', 'Soñador'], 'blur(.6px) saturate(1.4) brightness(1.08)']];
let db = null; const dbOpen = () => db || (db = new Promise((res, rej) => { const r = indexedDB.open('apeverse_photos', 1); r.onupgradeneeded = () => r.result.createObjectStore('p', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) }));
const PH = AV.photo = {};
PH.list = async () => { const d = await dbOpen(); return new Promise(res => { const out = [], q = d.transaction('p').objectStore('p').openCursor(); q.onsuccess = () => { const c = q.result; if (c) { out.push(c.value); c.continue() } else res(out.sort((a, b) => b.id - a.id)) } }) };
PH.save = async rec => { const d = await dbOpen(); return new Promise((res, rej) => { const tx = d.transaction('p', 'readwrite'); tx.objectStore('p').put(rec); tx.oncomplete = () => res(rec); tx.onerror = () => rej(tx.error) }) };
PH.del = async id => { const d = await dbOpen(); return new Promise(res => { const tx = d.transaction('p', 'readwrite'); tx.objectStore('p').delete(id); tx.oncomplete = res }) };
PH.capture = async function (filter) {
  const c = $('c'); if (!(AV.gfx && AV.gfx.render())) AV.R.render(AV.scene, AV.cam);   // draw this exact frame, then copy it before the browser clears it
  const w = Math.min(1600, c.width), h = Math.round(c.height * w / c.width), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
  const f = FILTERS.find(k => k[0] === filter); if (f && f[2] !== 'none' && 'filter' in x) x.filter = f[2]; x.drawImage(c, 0, 0, w, h);
  const url = cv.toDataURL('image/jpeg', .9), W = AV.W, rec = { id: Date.now(), world: W ? W.id : '', wname: W ? W.name : '', day: AV.S.day, time: AV.S.time, filter: filter || 'none', url };
  await PH.save(rec); const S = ACT.stats('photo'); S.n = (S.n || 0) + 1; S.worlds = S.worlds || {}; S.worlds[rec.world] = 1; AV.save(); return rec;
};
PH.download = rec => { const a = document.createElement('a'); a.href = rec.url; a.download = 'apeverse_' + (rec.world || 'photo') + '_' + rec.id + '.jpg'; document.body.appendChild(a); a.click(); a.remove() };
PH.album = async function () {
  const L = await PH.list(), p = AV.panel('cmp','<b>📷 ' + tr('Photo album', 'Álbum de fotos') + '</b> · ' + L.length + tr(' photos (stored in this browser only)', ' fotos (guardadas solo en este navegador)') + '<div id="album" style="max-height:60vh;overflow:auto">' +
    (L.map(r => '<div class="ph"><img src="' + r.url + '" alt=""><small>' + r.wname + ' · ' + tr('day ', 'día ') + r.day + '</small><br><button data-dl="' + r.id + '">' + tr('Download', 'Descargar') + '</button><button data-rm="' + r.id + '">' + tr('Delete', 'Borrar') + '</button></div>').join('') || '<div class="note">' + tr('No photos yet. Press K (or use the camera in your backpack) to take one.', 'Aún no hay fotos. Pulsa K (o usa la cámara de la mochila) para hacer una.') + '</div>') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
  p.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => PH.download(L.find(r => r.id === +b.dataset.dl)));
  p.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { await PH.del(+b.dataset.rm); AV.closePanel('cmp'); PH.album() });
};
const HUDS = ['top', 'hint', 'prompt', 'fps', 'mpBadge'];
ACT.register('photo', {
  btn: ['SNAP', 'FOTO'],
  start(s) { s.filter = s.filter || 'none'; HUDS.forEach(k => { const e = $(k); if (e) { e.dataset.phHid = e.style.visibility; e.style.visibility = 'hidden' } }); $('photoFrame').style.display = 'block'; if (AV.bag && AV.bag.equip) { s.held = AV.S.bag && AV.S.bag.eq; AV.bag.equip(null) } },
  end(s) { HUDS.forEach(k => { const e = $(k); if (e && e.dataset.phHid !== undefined) { e.style.visibility = e.dataset.phHid; delete e.dataset.phHid } }); $('photoFrame').style.display = 'none'; if (s.held && AV.bag) AV.bag.equip(s.held) },
  press(s, on) { if (!on || s.busy) return; s.busy = true; hud.style.visibility = 'hidden'; $('photoFrame').style.display = 'none';
    PH.capture(s.filter).then(rec => { s.last = rec; s.n = (s.n || 0) + 1; blip(1800, .03, 'square', .08); setTimeout(() => blip(900, .05, 'square', .05), 40); const fl = $('photoFlash'); fl.style.transition = 'none'; fl.style.opacity = .85; requestAnimationFrame(() => { fl.style.transition = 'opacity .35s'; fl.style.opacity = 0 }); AV.toast(tr('📷 Saved to your album (', '📷 Guardada en tu álbum (') + rec.wname + ')') })
      .catch(e => AV.toast(tr('Could not save the photo: ', 'No se pudo guardar la foto: ') + e.message)).finally(() => { s.busy = false; hud.style.visibility = ''; if (ACT.cur === s) $('photoFrame').style.display = 'block'; ACT.draw() }) },
  hud(s) { return '<b>📷 ' + tr('Photo mode', 'Modo foto') + '</b> · ' + tr('photos this time: ', 'fotos ahora: ') + (s.n || 0) + '<br>' + FILTERS.map(f => '<button data-flt="' + f[0] + '"' + (s.filter === f[0] ? ' style="background:#ffd84a;color:#000"' : '') + '>' + tr(f[1][0], f[1][1]) + '</button>').join('') +
      '<br><button id="phSnap">' + tr('Take photo', 'Hacer foto') + '</button><button id="phAlbum">' + tr('Album', 'Álbum') + '</button><br><small>' + (AV.device === 'phone' ? tr('Frame with your view, tap SNAP', 'Encuadra con la vista y toca FOTO') : tr('Click or F = shutter · Esc leaves · the interface is never in the photo', 'Clic o F = disparar · Esc para salir · la interfaz nunca sale en la foto')) + '</small>' },
  wire(s) { hud.querySelectorAll('[data-flt]').forEach(b => b.onclick = () => { s.filter = b.dataset.flt; ACT.draw() }); const sn = $('phSnap'); if (sn) sn.onclick = () => { press(true); press(false) }; const al = $('phAlbum'); if (al) al.onclick = () => { ACT.end('album'); PH.album() } }
});
AV.keymap.KeyK = () => { if (ACT.cur && ACT.cur.id === 'photo') ACT.end('leave'); else if (!ACT.cur) ACT.start('photo') };
/* the camera lives in the backpack: Use = photo mode */
if (AV.ITEMS) AV.ITEMS.camera = { n: ['Camera', 'Cámara'], cat: 'souvenir', ic: '📷', use: 'photo', keep: true, model: 'cube', col: 0x2a2a30, say: ['Click. A memory with a filter.', 'Clic. Un recuerdo con filtro.'], price: 0 };
if (AV.bag && AV.bag.use) { const u0 = AV.bag.use; AV.bag.use = function (id) { const d = AV.ITEMS[id]; if (d && d.use === 'photo') { const p = $('inv'); if (p && p.style.display === 'block') AV.closePanel('inv'); return ACT.start('photo') } return u0.apply(this, arguments) } }
function giveCamera() { const S = AV.S; if (!AV.bag || S.camGiven) return; S.camGiven = 1; AV.bag.add('camera', 1, true); setTimeout(() => AV.toast(tr('New: a camera in your backpack. Press K (or Bag → Camera) for photo mode.', 'Nuevo: una cámara en tu mochila. Pulsa K (o Mochila → Cámara) para el modo foto.')), 2500) }
})(window.AV);
