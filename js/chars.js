/* APEVERSE V0.9.3 - chars.js : Stone Ape Band 3D characters + NPC builder + dancing-crowd geometry.
   V0.9.3 rebuild: smooth sculpted bodies instead of boxes - lathe-turned torso, tapered limbs with elbows/knees,
   hands with fingers and thumb, sneakers with soles, an expressive face (brow ridge, face mask, muzzle, eyes with iris,
   pupil and highlight, nostrils, smile, ears) and a fur texture.
   Same API as before (userData.head / aL / aR / lL / lR / torso, C.animate, C.compact), so every world, NPC routine
   and animation keeps working. Look follows data/hero: gorilla bassist (olive beanie, dreads, black STONE SAMPLES tee,
   jeans, upright bass), Ztonedape (green bucket hat, tie-dye tee, green cargos, MPC, chain), orangutan saxophonist
   (green shades, Hawaiian shirt, teal pants, gold sax). */
'use strict';
(function (AV) {
const G = AV.G, std = AV.std, TAU = AV.TAU;
const C = AV.chars = {};

/* ---------------- colour helpers ---------------- */
const _a = new THREE.Color(), _b = new THREE.Color();
const shade = (hex, k) => _a.setHex(hex).multiplyScalar(k).getHex();
const mix = (hex, to, k) => _a.setHex(hex).lerp(_b.setHex(to), k).getHex();

/* ---------------- shared geometry (two detail levels) ---------------- */
const TORSO = [[0, 0], [.78, 0], [.86, .1], [.9, .35], [.95, .6], [1, .8], [.92, .92], [.6, .99], [.2, 1.02], [0, 1.03]].map(p => new THREE.Vector2(p[0], p[1]));
function geoSet(lo) {
  const s = {
    sph: new THREE.SphereGeometry(1, lo ? 10 : 16, lo ? 7 : 12), sphH: new THREE.SphereGeometry(1, lo ? 14 : 28, lo ? 9 : 20), dot: new THREE.SphereGeometry(1, lo ? 6 : 10, lo ? 4 : 7),
    torso: new THREE.LatheGeometry(TORSO, lo ? 16 : 24), taper: new THREE.CylinderGeometry(1, .82, 1, lo ? 7 : 12), cyl: new THREE.CylinderGeometry(1, 1, 1, lo ? 7 : 12),
    fing: new THREE.CylinderGeometry(1, .85, 1, lo ? 4 : 6), smile: new THREE.TorusGeometry(1, .18, lo ? 4 : 6, lo ? 8 : 16, Math.PI), box: new THREE.BoxGeometry(1, 1, 1),
    frust: new THREE.CylinderGeometry(.62, 1, 1, lo ? 10 : 24), hem: new THREE.SphereGeometry(1, lo ? 10 : 20, lo ? 5 : 10, 0, TAU, 0, Math.PI / 2), ring: new THREE.TorusGeometry(1, .22, 6, lo ? 12 : 24)
  };
  for (const k in s) s[k].userData.shared = true; return s;
}
const GH = geoSet(false), GL = geoSet(true);

/* ---------------- fur texture (grey strands; multiplies the vertex colour) ---------------- */
let FUR = null;
function furTex() {
  if (FUR) return FUR; const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'), r = AV.rng(19);
  c.fillStyle = '#e4e4e4'; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { const x = r() * 256, y = r() * 256, l = 6 + r() * 12, v = 175 + r() * 80 | 0; c.strokeStyle = 'rgba(' + v + ',' + v + ',' + v + ',.7)'; c.lineWidth = .8 + r() * 1.4; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - .5) * 4, y + l / 2, x + (r() - .5) * 5, y + l); c.stroke() }
  FUR = new THREE.CanvasTexture(cv); FUR.wrapS = FUR.wrapT = THREE.RepeatWrapping; FUR.repeat.set(3, 2); FUR.anisotropy = 4; FUR.userData = { keep: true }; return FUR;
}

let LITE = false;                                                            // set by ape(): simplified build for crowd dancers
/* part(): one mesh; role tags what it is (fur | shirt | pants | skin | fixed) for compact() and the crowd baker */
function part(par, g, m, x, y, z, sx, sy, sz, role, rot) { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); if (rot) o.rotation.set(rot[0], rot[1], rot[2]); o.castShadow = true; o.userData.role = role || 'fixed'; par.add(o); return o }

/* arm: pivot at the shoulder, hangs down -y. upper (sleeve) + elbow + forearm (fur) + hand with 4 fingers and a thumb */
function arm(par, Gx, x, y, z, len, th, upper, lower, hand, side) {
  const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); const h = len * .5, rU = upper.userData.role, rL = lower.userData.role;
  part(g, Gx.taper, upper.m, 0, -h / 2, 0, th * 1.12, h, th * 1.12, rU);
  part(g, Gx.sph, lower.m, 0, -h, 0, th * .93, th * .93, th * .93, rL);
  if (upper.m !== lower.m) part(g, Gx.ring, upper.m, 0, -h + th * .05, 0, th * .92, th * .92, th * .8, rU, [Math.PI / 2, 0, 0]);   // sleeve cuff hides the seam
  part(g, Gx.taper, lower.m, 0, -h - h / 2, 0, th * .93, h, th * .93, rL);
  part(g, Gx.sph, hand, 0, -len - th * .2, th * .08, th * 1.05, th * 1.15, th * .72, 'skin');
  if (LITE) return g;                                                        // crowd dancers: mitten hands
  for (let i = 0; i < 4; i++) part(g, Gx.fing, hand, (i - 1.5) * th * .4, -len - th * 1.1, th * .26, th * .22, th * .62, th * .24, 'skin', [.45, 0, 0]);   // short, curled fingers
  part(g, Gx.fing, hand, -side * th * .85, -len - th * .45, th * .45, th * .22, th * .6, th * .22, 'skin', [.6, 0, side * .7]);
  return g;
}
/* leg: pivot at the hip. thigh + knee + shin + sneaker (sole, upper, toe cap, laces) */
function leg(par, Gx, x, y, z, len, th, pants, shoe, sole, s, shin, foot) {   // shin: {m, role} bare lower leg (shorts); foot: 'flip' = flip-flops
  const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); const h = len * .5, sm = shin ? shin.m : pants, sr = shin ? shin.role : 'pants';
  part(g, Gx.taper, pants, 0, -h / 2, 0, th * 1.15, h, th * 1.15, 'pants'); part(g, Gx.sph, shin ? pants : pants, 0, -h, .005, th * .95, th * .95, th * .95, 'pants'); part(g, Gx.taper, sm, 0, -h - h / 2, 0, th * (shin ? .8 : .95), h, th * (shin ? .8 : .95), sr);
  if (foot === 'flip') {                                                    // bare foot on a flip-flop
    part(g, Gx.sph, shin ? shin.m : pants, 0, -len + .05 * s, .05 * s, .09 * s, .06 * s, .17 * s, shin ? shin.role : 'pants');
    part(g, Gx.box, shoe, 0, -len + .005 * s, .06 * s, .2 * s, .025 * s, .44 * s, 'fixed'); part(g, Gx.box, shoe, 0, -len + .06 * s, .04 * s, .19 * s, .03 * s, .07 * s, 'fixed');
    return g;
  }
  part(g, Gx.sph, sole, 0, -len + .02 * s, .07 * s, .14 * s, .05 * s, .26 * s, 'fixed');
  part(g, Gx.sph, shoe, 0, -len + .08 * s, .05 * s, .125 * s, .09 * s, .21 * s, 'fixed');
  if (LITE) return g;
  part(g, Gx.dot, sole, 0, -len + .06 * s, .22 * s, .1 * s, .06 * s, .09 * s, 'fixed');
  part(g, Gx.box, sole, 0, -len + .15 * s, .1 * s, .1 * s, .02 * s, .12 * s, 'fixed', [-.35, 0, 0]);
  return g;
}

/* the body. o: {fur, skin, eye, shirt(mat), sleeve(mat), pants(mat), shoe(mat), s, big, hs, arm, lod} */
function ape(o) {
  const lowQ = AV.kit && AV.kit.q && AV.kit.q() === 0;                       // Low graphics (phones): lighter meshes for every character
  const g = new THREE.Group(), s = o.s || 1, big = o.big || 1, hs = o.hs || 1, k = s * hs, Gx = o.lod || lowQ ? GL : GH; LITE = !!o.lite;
  const fur = std(o.fur, .95), furD = std(shade(o.fur, .7), .95), skin = std(o.skin, .85), muz = std(mix(o.skin, 0xfff0e0, .14), .8), lip = std(shade(o.skin, .5), .7);
  const dark = std(0x16100c, .45), white = std(0xf6f2ea, .3), iris = std(o.eye || 0x6a4020, .35), glint = std(0xffffff, .2, 0, 0xffffff, 1), sole = std(0xf4f4f0, .7);
  const sleeve = o.sleeve || fur, sleeveRole = sleeve === fur ? 'fur' : 'shirt';
  /* pelvis + torso + neck + shoulders */
  part(g, Gx.sph, o.pants, 0, 1.0 * s, 0, .34 * s * big, .2 * s, .23 * s * big, 'pants');
  const torso = part(g, Gx.torso, o.shirt, 0, 1.06 * s, 0, .4 * s * big, .9 * s, .25 * s * big, 'shirt'); torso.userData.torso = true;
  part(g, Gx.cyl, fur, 0, 1.98 * s, .01, .14 * s, .16 * s, .13 * s, 'fur');
  const shX = (.36 * big + .07) * s;
  for (const sx of [-1, 1]) part(g, Gx.sph, sleeve, sx * shX, 1.84 * s, 0, .17 * s, .15 * s, .17 * s, sleeveRole);
  /* head */
  const head = new THREE.Group(); head.position.set(0, 2.15 * s, .02); g.add(head);
  part(head, Gx.sphH, fur, 0, 0, 0, .34 * k, .33 * k, .32 * k, 'fur');
  part(head, Gx.sph, furD, 0, .1 * k, .22 * k, .27 * k, .07 * k, .12 * k, 'fur');                          // brow ridge
  part(head, Gx.sphH, skin, 0, 0, .2 * k, .24 * k, .2 * k, .14 * k, 'skin');                              // face mask
  part(head, Gx.sphH, muz, 0, -.1 * k, .26 * k, .19 * k, .14 * k, .13 * k, 'skin');                        // muzzle
  for (const sx of [-1, 1]) {
    if (!LITE) part(head, Gx.dot, dark, sx * .035 * k, -.07 * k, .385 * k, .025 * k, .014 * k, .014 * k, 'fixed');     // nostrils
    part(head, Gx.sph, white, sx * .095 * k, .035 * k, .285 * k, .062 * k, .062 * k, .062 * k, 'fixed');   // eye: sclera
    part(head, Gx.dot, iris, sx * .095 * k, .035 * k, .325 * k, .04 * k, .04 * k, .03 * k, 'fixed');       // iris
    part(head, Gx.dot, dark, sx * .095 * k, .035 * k, .348 * k, .022 * k, .022 * k, .015 * k, 'fixed');    // pupil
    part(head, Gx.dot, glint, sx * .095 * k + .016 * k, .052 * k, .36 * k, .01 * k, .01 * k, .006 * k, 'fixed');   // highlight
    part(head, Gx.sph, skin, sx * .33 * k, .02 * k, 0, .085 * k, .11 * k, .05 * k, 'skin');                // ear
    if (!LITE) part(head, Gx.dot, lip, sx * .345 * k, .02 * k, .015 * k, .05 * k, .07 * k, .03 * k, 'skin');
  }
  part(head, Gx.smile, lip, 0, -.165 * k, .362 * k, .075 * k, .05 * k, .06 * k, 'fixed', [0, 0, Math.PI]);   // smile
  /* limbs (pivot positions as in V0.9 so instruments, NPC gestures and dances still line up) */
  const A = (side) => arm(g, Gx, side * shX, 1.88 * s, 0, (o.arm || .85) * s, .145 * s * Math.sqrt(big), { m: sleeve, userData: { role: sleeveRole } }, { m: fur, userData: { role: 'fur' } }, skin, side);
  const aL = A(-1), aR = A(1);
  const lL = leg(g, Gx, -.18 * s * big, .96 * s, 0, .95 * s, .165 * s * Math.sqrt(big), o.pants, o.shoe, sole, s), lR = leg(g, Gx, .18 * s * big, .96 * s, 0, .95 * s, .165 * s * Math.sqrt(big), o.pants, o.shoe, sole, s);
  g.userData = { head, aL, aR, lL, lR, torso, s, k, Gx };
  return g;
}
function hiresTex(n, draw) { const t = AV.mkc(n, (c, cv) => { c.save(); c.scale(n / 128, n / 128); draw(c); c.restore() }); return t }
function tex(txt, bg, fg) { const t = hiresTex(256, c => { c.fillStyle = bg; c.fillRect(0, 0, 128, 128); c.fillStyle = fg; c.font = 'bold 22px Georgia'; c.textAlign = 'center'; c.fillText(txt[0], 64, 54); c.fillText(txt[1], 64, 82); c.strokeStyle = fg; c.lineWidth = 3; c.beginPath(); c.arc(64, 64, 52, 0, TAU); c.stroke() }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t }
function tie() { return hiresTex(256, c => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 128, 128); const r = AV.rng(3); for (const [cx, cy] of [[64, 64], [0, 0], [128, 0], [0, 128], [128, 128]]) { [['#e83a8a', 56], ['#3ac8e8', 42], ['#7aff6a', 28], ['#ff8a2a', 16], ['#ffe93a', 7]].forEach(q => { c.fillStyle = q[0]; c.beginPath(); for (let a = 0; a <= 40; a++) { const t = a / 40 * TAU, rr = q[1] * (1 + Math.sin(t * 6 + q[1]) * .12); c.lineTo(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr) } c.fill() }) } for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(160,60,200,.35)'; c.fillRect(r() * 128, r() * 128, 7, 3) } }) }
function floral() { return hiresTex(256, c => { c.fillStyle = '#f2c43a'; c.fillRect(0, 0, 128, 128); const r = AV.rng(5); for (let i = 0; i < 18; i++) { const x = r() * 128, y = r() * 128, R = 7 + r() * 6; c.fillStyle = i % 3 ? '#e8782a' : '#2aa890'; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * R * .6, y + Math.sin(a) * R * .6, R * .55, R * .32, a, 0, TAU); c.fill() } c.fillStyle = '#fff3c0'; c.beginPath(); c.arc(x, y, 2.6, 0, TAU); c.fill() } c.strokeStyle = 'rgba(40,110,60,.8)'; c.lineWidth = 2; for (let i = 0; i < 10; i++) { const x = r() * 128, y = r() * 128; c.beginPath(); c.ellipse(x, y, 9, 3, r() * 3, 0, TAU); c.stroke() } }) }

/* ---- gorilla bassist ---- */
C.gorilla = function () {
  const shirt = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: .9 }), logoMat = new THREE.MeshStandardMaterial({ map: tex(['STONE', 'SAMPLES'], '#161616', '#f1e7d0'), roughness: .9 });
  const g = ape({ fur: 0x3a3b3f, skin: 0x55565c, eye: 0xd9a300, shirt, pants: std(0x3d5f86, .9), shoe: std(0xe9e9e9, .6), big: 1.3, s: 1.12, hs: 1.05, arm: .95, sleeve: std(0x202020, .9) });
  const u = g.userData, s = u.s, k = u.k, Gx = u.Gx;
  const logo = new THREE.Mesh(G.pln, logoMat); logo.position.set(0, 1.52 * s, .25 * 1.3 * s * .935 + .012); logo.scale.set(.46 * s, .46 * s, 1); g.add(logo);
  part(u.head, Gx.hem, std(0x6a6b3a, 1), 0, .1 * k, -.01, .36 * k, .3 * k, .345 * k);                                          // olive beanie
  part(u.head, Gx.ring, std(0x58592f, 1), 0, .1 * k, -.01, .345 * k, .345 * k, .3 * k, 'fixed', [Math.PI / 2, 0, 0]);             // rolled brim
  for (let i = 0; i < 9; i++) { const a = Math.PI * (.62 + i * .095), x = Math.sin(a) * .3 * k, z = Math.cos(a) * .27 * k; part(u.head, Gx.taper, std(0x241a12, 1), x, -.2 * k, z, .055 * k, .5 * k, .055 * k, 'fixed', [-Math.cos(a) * .15, 0, Math.sin(a) * .15]) }   // dreads
  const beads = [0xe83a3a, 0x3ac85a, 0xf2c43a]; for (let i = 0; i < 11; i++) { const a = i / 10 * Math.PI; part(g, Gx.sph, std(beads[i % 3], .4), Math.cos(a) * .3 * s, 1.92 * s - Math.sin(a) * .26 * s, .31 * s, .05 * s, .05 * s, .05 * s) }
  /* upright bass: carved hourglass body, f-holes, fingerboard, scroll, bridge, strings, endpin */
  const bass = new THREE.Group(); bass.position.set(-.42 * s, 1.0 * s, .52 * s); g.add(bass); const wood = std(0xb65f25, .5), dark = std(0x2a1408, .6);
  const body = [[0, -.75], [.3, -.72], [.44, -.55], [.46, -.35], [.36, -.12], [.3, 0], [.34, .15], [.36, .3], [.28, .45], [.1, .52], [0, .53]].map(p => new THREE.Vector2(p[0], p[1]));
  if (!C._bassGeo) { C._bassGeo = new THREE.LatheGeometry(body, 28); C._bassGeo.userData.shared = true }
  part(bass, C._bassGeo, wood, 0, 0, 0, s, s, .36 * s);
  for (const sx of [-1, 1]) part(bass, Gx.box, dark, sx * .13 * s, -.22 * s, .13 * s, .025 * s, .26 * s, .02 * s, 'fixed', [0, 0, -sx * .12]);
  part(bass, Gx.box, dark, 0, .9 * s, .1 * s, .08 * s, 1.0 * s, .04 * s); part(bass, Gx.ring, wood, 0, 1.46 * s, .08 * s, .06 * s, .06 * s, .06 * s, 'fixed', [0, Math.PI / 2, 0]);
  part(bass, Gx.box, std(0xe8c890, .6), 0, -.3 * s, .17 * s, .2 * s, .1 * s, .02 * s); part(bass, Gx.box, dark, 0, -.55 * s, .15 * s, .1 * s, .14 * s, .03 * s);
  for (const x of [-.03, -.01, .01, .03]) part(bass, Gx.cyl, std(0xdddddd, .3), x * s, .45 * s, .135 * s, .004 * s, 1.95 * s, .004 * s);
  part(bass, Gx.cyl, std(0x888888, .3, .6), 0, -.9 * s, 0, .015 * s, .3 * s, .015 * s);
  bass.rotation.z = -.05; u.bass = bass; u.kind = 'gorilla';
  u.aL.rotation.set(-1.0, 0, -.25); u.aR.rotation.set(-.6, 0, .15); return C.compact(g);
};
/* ---- Ztonedape: chimp with bucket hat, tie-dye, cargos, MPC ---- */
C.ztone = function () {
  const shirt = new THREE.MeshStandardMaterial({ map: tie(), roughness: .85 });
  const g = ape({ fur: 0x6b4328, skin: 0xc9966a, eye: 0x5a3010, shirt, pants: std(0x4f8a3a, .9), shoe: std(0xf0e6ff, .6), big: .95, s: 1.0, hs: 1.08, arm: .8, sleeve: std(0xf0b030, .9) });
  const u = g.userData, s = u.s, k = u.k, Gx = u.Gx, hat = std(0x58c038, .85);
  part(u.head, Gx.hem, hat, 0, .13 * k, 0, .37 * k, .29 * k, .37 * k); part(u.head, Gx.frust, hat, 0, .11 * k, 0, .55 * k, .07 * k, .55 * k);   // bucket hat
  part(u.head, Gx.cyl, std(0x3a8a28, .85), 0, .16 * k, 0, .375 * k, .03 * k, .375 * k);                                                         // hat band
  for (const [lg, sx] of [[u.lL, -1], [u.lR, 1]]) part(lg, Gx.box, std(0x3f7a2e, .9), sx * .2 * s, -.3 * s, .02 * s, .08 * s, .2 * s, .2 * s);      // cargo pockets
  const mpc = new THREE.Group(); mpc.position.set(.36 * s, 1.0 * s, .32 * s); mpc.rotation.set(-.35, 0, -.15); g.add(mpc); part(mpc, Gx.box, std(0x1c1c22, .5), 0, 0, 0, .44 * s, .05 * s, .34 * s);
  for (const x of [-.12, -.04]) part(mpc, Gx.cyl, std(0xdddddd, .3, .5), x * s, .035 * s, .13 * s, .018 * s, .02 * s, .018 * s);
  const cols = [0xff4a4a, 0xffa030, 0xffe040, 0x4ae04a, 0x30b0ff, 0xb050ff]; u.pads = [];
  for (let i = 0; i < 12; i++) { const p = part(mpc, G.box, std(cols[i % 6], .4, 0, cols[i % 6], .6), -.14 * s + (i % 4) * .095 * s, .04 * s, -.08 * s + (i / 4 | 0) * .085 * s, .075 * s, .02 * s, .07 * s); u.pads.push(p) }
  const chain = new THREE.Mesh(G.tor, std(0xd9b84a, .3, .8)); chain.position.set(0, 1.84 * s, .1 * s); chain.scale.set(.26 * s, .27 * s, .3 * s); chain.rotation.x = Math.PI / 2 + .55; g.add(chain);   // lies on the chest, front hangs low
  part(g, Gx.sph, std(0xd9b84a, .3, .8), 0, 1.68 * s, .26 * s, .05 * s, .06 * s, .02 * s);                                                     // pendant
  u.mpc = mpc; u.kind = 'ztone'; u.aL.rotation.set(-.9, 0, -.1); u.aR.rotation.set(-1.0, 0, .1); return C.compact(g);
};
/* ---- orangutan saxophonist ---- */
C.orangutan = function () {
  const shirt = new THREE.MeshStandardMaterial({ map: floral(), roughness: .85 });
  const g = ape({ fur: 0xc8581a, skin: 0xa0603a, eye: 0x3a2010, shirt, pants: std(0x1f9a8a, .9), shoe: std(0x2ab8a0, .6), big: 1.15, s: 1.08, hs: 1.1, arm: .9, sleeve: std(0xf2c43a, .9) });
  const u = g.userData, s = u.s, k = u.k, Gx = u.Gx, hair = std(0xd0651e, 1);
  for (let i = -4; i <= 4; i++) part(u.head, Gx.taper, hair, i * .07 * k, .3 * k, -.04 * k, .06 * k, .26 * k, .06 * k, 'fur', [0, 0, -i * .16]);      // shaggy crown
  for (let i = 0; i < 10; i++) { const a = Math.PI * (.55 + i * .1), x = Math.sin(a) * .31 * k, z = Math.cos(a) * .28 * k; part(u.head, Gx.taper, std(0xc8581a, 1), x, -.25 * k, z, .06 * k, .5 * k, .06 * k, 'fur', [-Math.cos(a) * .12, 0, Math.sin(a) * .12]) }   // long fur
  for (const sx of [-1, 1]) part(u.head, Gx.sphH, std(0x8a4a2a, .85), sx * .24 * k, -.02 * k, .2 * k, .13 * k, .17 * k, .05 * k, 'skin', [0, sx * .5, 0]);   // cheek pads
  const lens = std(0x14a050, .15, .4, 0x083a1a, .35), frame = std(0x111111, .4);
  for (const sx of [-1, 1]) { part(u.head, Gx.sph, lens, sx * .1 * k, .045 * k, .345 * k, .085 * k, .06 * k, .02 * k); part(u.head, Gx.cyl, frame, sx * .26 * k, .05 * k, .2 * k, .01 * k, .3 * k, .01 * k, 'fixed', [Math.PI / 2, 0, 0]) }
  part(u.head, Gx.box, frame, 0, .055 * k, .35 * k, .05 * k, .015 * k, .015 * k);
  /* gold saxophone: curved tube body, U-bend, flared bell, neck + mouthpiece, keys */
  const sax = new THREE.Group(); sax.position.set(.12 * s, 1.5 * s, .52 * s); g.add(sax); const brass = std(0xe0a82a, .22, .85);
  if (!C._sax) {
    const body = new THREE.CatmullRomCurve3([[0, .45, 0], [0, .1, 0], [0, -.3, 0], [.04, -.47, .02], [.16, -.52, .03], [.25, -.4, .04], [.27, -.28, .04]].map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const neck = new THREE.CatmullRomCurve3([[0, .44, 0], [-.02, .56, -.05], [-.06, .63, -.14], [-.08, .65, -.22]].map(p => new THREE.Vector3(p[0], p[1], p[2])));
    C._sax = { body: new THREE.TubeGeometry(body, 40, .048, 10, false), neck: new THREE.TubeGeometry(neck, 12, .022, 8, false), bell: new THREE.LatheGeometry([[.05, 0], [.07, .1], [.11, .18], [.18, .24], [.19, .25]].map(p => new THREE.Vector2(p[0], p[1])), 20) };
    for (const kk in C._sax) C._sax[kk].userData.shared = true;
  }
  part(sax, C._sax.body, brass, 0, 0, 0, s, s, s); part(sax, C._sax.neck, brass, 0, 0, 0, s, s, s); part(sax, C._sax.bell, brass, .27 * s, -.29 * s, .04 * s, s, s, s);
  part(sax, Gx.cyl, std(0x111111, .4), -.08 * s, .65 * s, -.25 * s, .014 * s, .07 * s, .014 * s, 'fixed', [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 6; i++) part(sax, Gx.sph, std(0xf2d070, .2, .9), .045 * s, (.3 - i * .1) * s, .02 * s, .022 * s, .022 * s, .012 * s);
  sax.rotation.set(-.3, 0, .15); u.sax = sax; u.kind = 'orangutan'; u.aL.rotation.set(-1.1, 0, -.1); u.aR.rotation.set(-1.0, 0, .12); return C.compact(g);
};
/* generic villager (Zil / Grakk / Bongo / Luma ... keep their colours through fur, shirt and hat) */
C.npc = function (fur, shirt, hat) {
  const g = ape({ fur, skin: mix(fur, 0xe8c8a0, .55), shirt: std(shirt, .85), sleeve: std(shirt, .85), pants: std(0x3a3a52, .9), shoe: std(0x2a2a2a, .8), arm: .8 });
  if (hat) { const u = g.userData, m = std(hat, .85); part(u.head, u.Gx.hem, m, 0, .13 * u.k, 0, .37 * u.k, .26 * u.k, .37 * u.k); part(u.head, u.Gx.frust, m, 0, .11 * u.k, 0, .52 * u.k, .06 * u.k, .52 * u.k) }
  return C.compact(g);
};

/* builders shared with js/chars_human.js (human characters for Chiang Mai) */
C._kit = { part, arm, leg, GH, GL, furTex, hiresTex, shade, mix, setLite: v => { LITE = !!v } };

/* V0.9.2/0.9.3: merge each animated pivot's untextured parts into vertex-coloured meshes (fur parts get the fur texture):
   ≈ 2 draw calls per pivot instead of dozens. Pivots keep moving exactly as before; textured shirts, MPC pads and the
   breathing torso stay separate. */
C.compact = function (g) {
  const K = AV.kit; if (!K || !K.merge) return g; const u = g.userData, pivots = [g, u.head, u.aL, u.aR, u.lL, u.lR, u.bass, u.sax, u.mpc].concat(u.extra || []).filter(Boolean), skip = new Set(u.pads || []);
  if (u.torso) skip.add(u.torso);
  if (!C._mat) { C._mat = K.floraMat(0, { rough: .8 }); C._mat.userData.shared = true; C._furMat = K.floraMat(0, { rough: .95, map: furTex() }); C._furMat.userData.shared = true }
  const hexOf = m => { if (!m.color) return 0xffffff; const c = m.color.clone(); if (m.userData.lin) c.convertLinearToSRGB(); return c.getHex() };
  for (const pv of pivots) {
    const parts = [], furParts = [], gone = [];
    for (const ch of pv.children) { if (!ch.isMesh || skip.has(ch) || pivots.indexOf(ch) >= 0) continue; const m = ch.material; if (Array.isArray(m) || m.map) continue;
      ch.updateMatrix(); const glow = m.emissive && m.emissiveIntensity > .2 && (m.emissive.r + m.emissive.g + m.emissive.b) > .1 ? 1 : 0; (ch.userData.role === 'fur' ? furParts : parts).push([ch.geometry, hexOf(m), ch.matrix.clone(), glow]); gone.push(ch) }
    if (parts.length + furParts.length < 2) continue; gone.forEach(ch => pv.remove(ch));
    if (parts.length) { const mesh = new THREE.Mesh(K.merge(parts), C._mat); mesh.castShadow = true; pv.add(mesh) }
    if (furParts.length) { const mesh = new THREE.Mesh(K.merge(furParts), C._furMat); mesh.castShadow = true; pv.add(mesh) }
  }
  return g;
};

/* dancing-crowd geometry: one posed ape (arms up), baked into 3 merged geometries:
   fur (tinted per dancer), shirt (tinted per dancer) and fixed (face, eyes, hands, jeans, sneakers). Cached per detail level. */
const crowdCache = {};
C.crowdGeo = function (lo) {
  const key = lo ? 'lo' : 'hi'; if (crowdCache[key]) return crowdCache[key];
  const g = ape({ fur: 0xffffff, skin: 0xd8b088, shirt: std(0xffffff, .8), pants: std(0x3a3a52, .9), shoe: std(0x2a2a2a, .8), arm: .78, lod: lo, lite: true }); LITE = false;
  const u = g.userData; u.aL.rotation.set(-.2, 0, -2.6); u.aR.rotation.set(-.2, 0, 2.6); g.updateMatrixWorld(true);
  const sets = { fur: [], shirt: [], fixed: [] }, hexOf = m => { const c = m.color.clone(); if (m.userData.lin) c.convertLinearToSRGB(); return c.getHex() };
  g.traverse(o => { if (!o.isMesh) return; const r = o.userData.role, m = o.material, glow = m.emissive && m.emissiveIntensity > .2 && (m.emissive.r + m.emissive.g + m.emissive.b) > .1 ? 1 : 0;
    (r === 'fur' ? sets.fur : r === 'shirt' ? sets.shirt : sets.fixed).push([o.geometry, r === 'shirt' ? 0xffffff : hexOf(m), o.matrixWorld.clone(), glow]) });
  const K = AV.kit, out = { fur: K.merge(sets.fur), shirt: K.merge(sets.shirt), fixed: K.merge(sets.fixed) };
  for (const kk in out) out[kk].userData.shared = true; out.furMap = furTex(); return crowdCache[key] = out;
};

/* animation: beat-synced groove. t = seconds, beat = quarter-note counter (from audio), energy 0..1 */
C.animate = function (g, t, beat, energy, off) {
  const u = g.userData, k = u.kind, ph = (beat + (off || 0)) * Math.PI, e = energy == null ? 1 : energy, base = g.userData.baseY || 0, red = AV.S.set.reduce ? .4 : 1;
  const bounce = Math.abs(Math.sin(ph)) * .05 * e * red; g.position.y = base + bounce; u.head.rotation.z = Math.sin(ph) * .08 * e * red; u.head.rotation.x = Math.sin(ph * 2) * .05 * e * red;
  u.lL.rotation.x = Math.sin(ph) * .08 * e; u.lR.rotation.x = -Math.sin(ph) * .08 * e;
  if (u.torso) u.torso.scale.y = .9 * u.s * (1 + Math.abs(Math.sin(ph)) * .015 * e);
  if (k === 'gorilla') { u.aR.rotation.x = -.6 + Math.sin(ph * 2) * .35 * e; u.aR.rotation.z = .15; u.aL.rotation.x = -1.0 + Math.sin(ph * .25) * .25 * e; u.bass.rotation.z = -.05 + Math.sin(ph) * .03 * e * red; g.rotation.z = Math.sin(ph) * .02 * red }
  else if (k === 'ztone') { u.aR.rotation.x = -1.0 + Math.abs(Math.sin(ph * 2)) * .3 * e; u.aL.rotation.x = -.9 + Math.abs(Math.sin(ph * 2 + 1.3)) * .3 * e; u.pads.forEach((p, i) => { const on = ((Math.floor(beat * 4) + i * 3) % 7) === 0; if (!p.userData.m0) p.userData.m0 = p.material; p.material = on ? AV.std(0xffffff, .3, 0, 0xffffff, 1) : p.userData.m0 }); g.rotation.y = Math.sin(ph * .5) * .15 * red }
  else if (k === 'orangutan') { u.sax.rotation.z = .15 + Math.sin(ph * .5) * .12 * e * red; u.sax.rotation.x = -.3 + Math.sin(ph) * .06 * e; u.aL.rotation.x = -1.1 + Math.sin(ph) * .05 * e; g.rotation.z = Math.sin(ph * .5) * .05 * red }
};
})(window.AV);
