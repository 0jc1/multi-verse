/* APEVERSE - punch.js : punch whoever stands in front of you.
   Keys: V, or left click while the mouse is captured. Phone: the Punch button.
   A hit knocks the NPC over backwards (away from you); they lie dazed under circling stars for a few seconds, then get back up.
   Works for named NPCs (AV.npc, incl. the stoners) and crowd beings (AV.beings). While down, their own AI is paused via `.ko`. */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$, TAU = AV.TAU;
const PU = AV.punch = { list: [] };
const UP = new THREE.Vector3(0, 1, 0), _v = new THREE.Vector3(), _a = new THREE.Vector3(), _q = new THREE.Quaternion(), _qy = new THREE.Quaternion();
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t), lerp = (a, b, k) => a + (b - a) * k;
const FALL = .42, BOUNCE = .28, DOWN = 3.4, RISE = .9, FLAT = Math.PI / 2;   // seconds / lying angle
const REACT = [['Ow! What was that for?!', '¡Ay! ¿¡Y eso por qué!?'], ['Hey! Not cool, man.', '¡Oye! Eso no mola, tío.'], ['Seeing stars over here...', 'Estoy viendo estrellas...'], ['Ugh... my jaw.', 'Uf... mi mandíbula.']];

/* ---------- first-person fist (right side, only visible while swinging) ---------- */
const mat = (c, r) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: r }); m.color.convertSRGBToLinear(); return m };
const FIST = new THREE.Group(); FIST.visible = false;
{
  const fur = mat(0x3a2a20, .95), skin = mat(0x8a6650, .7), cuff = mat(0xff6ad5, .6), cyl = new THREE.CylinderGeometry(1, 1, 1, 10), sph = new THREE.SphereGeometry(1, 12, 9);
  const seg = (m, a, b, r) => { const d = b.clone().sub(a), o = new THREE.Mesh(cyl, m); o.scale.set(r, d.length(), r); o.position.copy(a).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(UP, d.normalize()); FIST.add(o) };
  const ball = (m, x, y, z, sx, sy, sz) => { const o = new THREE.Mesh(sph, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); FIST.add(o) };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  seg(fur, V(0, 0, .04), V(.07, -.13, .42), .05); seg(cuff, V(.05, -.095, .32), V(.065, -.12, .39), .058);   // forearm + tie-dye cuff
  ball(skin, 0, 0, 0, .068, .06, .072);                                                                         // fist
  for (let k = 0; k < 4; k++) ball(fur, -.045 + k * .03, .022, -.055, .019, .017, .017);                       // knuckles
  ball(skin, -.055, -.02, -.01, .022, .02, .03);                                                               // thumb
}
const FIST_REST = [.3, -.46, -.42], FIST_HIT = [.06, -.2, -.78];

/* ---------- dizzy stars + "POW!" ---------- */
const starGeo = new THREE.OctahedronGeometry(.06, 0), starMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe14a).convertSRGBToLinear(), fog: false });
starGeo.userData.shared = true; starMat.userData.shared = true; starMat.userData.lin = 1;
function stars() { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(starGeo, starMat); const a = i / 4 * TAU; m.position.set(Math.cos(a) * .3, 0, Math.sin(a) * .3); g.add(m) } g.visible = false; return g }
let pow = null, powT = -9;
function powSprite() {
  if (pow) return pow;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const c = cv.getContext('2d');
  c.font = 'bold 84px Impact,"Arial Black",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = 14; c.strokeStyle = '#2a1238'; c.strokeText('POW!', 128, 66); c.fillStyle = '#ffd84a'; c.fillText('POW!', 128, 66);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  pow = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false })); pow.renderOrder = 999; pow.visible = false; return pow;
}

/* ---------- who is in front of you ---------- */
function pick() {
  const W = AV.W, P = AV.P, fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); let best = null, bs = 1e9;
  for (const t of W.T) {
    const who = t.npc || t.being; if (!who || who.ko) continue;
    const body = t.npc ? who.g : who.h; if (!body || !body.visible) continue;
    body.getWorldPosition(_v); const dx = _v.x - P.x, dz = _v.z - P.z, d = Math.hypot(dx, dz), sc = body.scale.y || 1;
    if (d > 1.7 + .6 * sc || Math.abs(_v.y - P.y) > 1.8) continue;
    const dot = d < .45 ? 1 : (dx * fx + dz * fz) / d; if (dot < .5) continue;
    const s = d * (2 - dot); if (s < bs) { bs = s; best = { who, body, npc: !!t.npc, dx: d > .01 ? dx / d : fx, dz: d > .01 ? dz / d : fz } }
  }
  return best;
}

/* ---------- knock down / get up ---------- */
function knock(h) {
  const W = AV.W, { who, body } = h; if (who.ko) return;
  who.ko = true;
  if (h.npc) { if (who.bub) who.bub.visible = false; if (who.tag) who.tag.visible = false } else if (who.play) who.play('Idle', .2);
  const x0 = body.position.x, z0 = body.position.z, y0 = body.position.y, r = AV.resolve(W, x0 + h.dx * .45, z0 + h.dz * .45, .3), s0 = W.surface(x0, z0), s1 = W.surface(r[0], r[1]);
  const ok = s0 != null && s1 != null && Math.abs(s1 - s0) < .4;   // slide back a little unless that would drop off a ledge
  const k = { who, body, npc: h.npc, W, x0, z0, y0, x1: ok ? r[0] : x0, z1: ok ? r[1] : z0, y1: ok ? y0 + (s1 - s0) : y0, yaw: body.rotation.y, dx: h.dx, dz: h.dz, t0: AV.now(), sc: body.scale.y || 1, stars: stars() };
  W.group.add(k.stars); PU.list.push(k);
}
function release(k) {
  const b = k.body; b.rotation.set(0, k.yaw, 0); b.position.set(k.x1, k.y1, k.z1);
  if (k.stars.parent) k.stars.parent.remove(k.stars);
  k.who.ko = false;
  if (k.npc && AV.npc && AV.npc.bark && k.who.bub) { const l = REACT[Math.random() * REACT.length | 0]; AV.npc.bark(k.who, tr(l[0], l[1])) }
}
function pose(k, now) {
  const e = now - k.t0, b = k.body; let ang, s = 1;
  if (e < FALL) { const f = e / FALL; ang = f * f * FLAT; s = ease(f) }                      // topples like a plank, speeding up
  else if (e < FALL + BOUNCE) ang = FLAT - Math.sin((e - FALL) / BOUNCE * Math.PI) * .14;    // thud + small bounce
  else if (e < FALL + BOUNCE + DOWN) ang = FLAT;
  else if (e < FALL + BOUNCE + DOWN + RISE) ang = FLAT * (1 - ease((e - FALL - BOUNCE - DOWN) / RISE));
  else return false;
  _a.set(k.dz, 0, -k.dx).normalize(); _q.setFromAxisAngle(_a, ang); _qy.setFromAxisAngle(UP, k.yaw); b.quaternion.copy(_q).multiply(_qy);
  b.position.set(lerp(k.x0, k.x1, s), lerp(k.y0, k.y1, s) + Math.sin(ang) * .2 * k.sc, lerp(k.z0, k.z1, s));
  /* stars circle above the head while lying there */
  const st = k.stars, dazed = e > FALL && e < FALL + BOUNCE + DOWN + RISE * .3, hl = 1.5 * k.sc;
  st.visible = dazed; if (dazed) { st.position.set(b.position.x + k.dx * hl * Math.sin(ang), b.position.y + hl * Math.cos(ang) + .35, b.position.z + k.dz * hl * Math.sin(ang)); st.rotation.y = e * 4; st.children.forEach((m, i) => { m.position.y = Math.sin(e * 6 + i * 1.6) * .05; m.rotation.y = e * 6 }) }
  return true;
}

/* ---------- the punch ---------- */
let swingT = -9, cool = 0, pending = null, shake = 0;
PU.punch = function () {
  if (!AV.running || AV.blocking() || !AV.W) return;
  const now = AV.now(); if (now < cool) return; cool = now + .42; swingT = now;
  if (!FIST.parent) AV.cam.add(FIST);
  pending = { at: now + .1, hit: pick(), W: AV.W };
  AV.audio && AV.audio.blip(300, .06, 'triangle', .05);   // whoosh
};
function impact(h) {
  if (h.who.ko) return;
  knock(h);
  AV.audio && AV.audio.blip(95, .25, 'sine', .45); AV.audio && AV.audio.blip(170, .06, 'square', .16);
  if (!AV.S.set.reduce) shake = .18;
  const p = powSprite(); if (!p.parent) AV.scene.add(p); h.body.getWorldPosition(p.position).y += 1.35 * (h.body.scale.y || 1); p.position.x -= h.dx * .2; p.position.z -= h.dz * .2; powT = AV.now(); p.visible = true;
}

AV.frameFns.push(dt => {
  const now = AV.now();
  if (pending && now >= pending.at) { const p = pending; pending = null; if (p.hit && p.W === AV.W && !AV.blocking()) impact(p.hit) }
  /* fist: jab out fast, pull back slower */
  const e = now - swingT; FIST.visible = e < .34;
  if (FIST.visible) { const k = e < .1 ? ease(e / .1) : 1 - ease((e - .1) / .24); FIST.position.set(lerp(FIST_REST[0], FIST_HIT[0], k), lerp(FIST_REST[1], FIST_HIT[1], k), lerp(FIST_REST[2], FIST_HIT[2], k)); FIST.rotation.set(.1 * k, .25 - .2 * k, -.3 * k) }
  /* POW! pops up, then fades */
  if (pow && pow.visible) { const f = (now - powT) / .55; if (f >= 1) pow.visible = false; else { const sc = .5 + ease(Math.min(1, f * 4)) * .5; pow.scale.set(1.1 * sc, .55 * sc, 1); pow.material.opacity = 1 - Math.max(0, f - .5) * 2; pow.position.y += dt * .4 } }
  /* a little camera kick on contact (runs after core set the camera this frame) */
  if (shake > 0) { shake = Math.max(0, shake - dt); const s = shake * .25; AV.cam.position.x += (Math.random() - .5) * s; AV.cam.position.y += (Math.random() - .5) * s }
  for (let i = PU.list.length - 1; i >= 0; i--) {
    const k = PU.list[i];
    if (k.W !== AV.W) { k.who.ko = false; PU.list.splice(i, 1); continue }   // world left: those bodies are gone
    if (!pose(k, now)) { release(k); PU.list.splice(i, 1) }
  }
});

/* ---------- input ---------- */
AV.keymap.KeyV = () => PU.punch();
$('c').addEventListener('mousedown', e => { if (e.button === 0 && document.pointerLockElement === $('c')) PU.punch() });
{ const b = $('tK'); if (b) b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); PU.punch() }) }
const hint0 = AV.hintText; AV.hintText = () => { const h = hint0(); return h ? h + tr(' · V / click punch', ' · V / clic golpear') : h };
})(window.AV);
