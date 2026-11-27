/* APEVERSE 2 NEW WORLDS - paris_montmartre.js : PARIS district 2 = MONTMARTRE, a real hill (44 m) north of the river, one métro ride
   (line 12, Abbesses) from Saint-Germain.  Inside, every street connects:
     Boulevard de Clichy (flat, a tree-lined median, the cabaret "Le Moulin Violet" with its turning windmill) -> Rue de Steinkerque
     (souvenir shops) -> the garden on the slope with the long staircase and the funicular -> the terrace and the white basilica on the
     summit (panorama) -> Place du Tertre (painters, café terraces) -> down the winding Rue Lepic back to the boulevard; a lane along the
     basilica to the vineyard and the cabaret cottage "Au Lapin Sage".
   The ground is a terrain mesh following the hill; buildings sit on stone plinths into the slope; pedestrians follow the slope.
   Businesses (fictional): Le Moulin Violet (revue 21:00-01:00), Au Lapin Sage (chansons 21:00-02:00), La Bohème des Singes (Tertre café),
   Souvenirs de Montmartre, Beaux-Arts Pinceau (art supplies), Brasserie Le Clichy, Guitares Pigalle.  Named: Margot (painter), Théo
   (Moulin Violet doorman), Rosalie (chanson singer).  Story: "Margot's violet".  Plugs into world_paris.js / paris_life.js. */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]), TAU = Math.PI * 2, PI = Math.PI;
const PAR = AV.paris; if (!PAR) return;
const MM = { stats: {} }; PAR.mm = MM;
const X0 = -220, X1 = 220, Z0 = -790, Z1 = -408;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* the hill: 0 on the boulevard, 44 m on the summit behind the basilica */
const H = (x, z) => { const d = Math.hypot(x / 1.15, z + 705), t = clamp(1 - d / 260, 0, 1), s = t * t * (3 - 2 * t), ramp = clamp((-z - 452) / 18, 0, 1); return 44 * s * ramp };
MM.H = H;
PAR.mmSurf = (x, z) => { if (x < X0 - 1 || x > X1 + 1 || z < Z0 - 1 || z > Z1 + 1) return undefined; if (x < X0 || x > X1 || z < Z0 || z > Z1) return null; return H(x, z) };

/* ======================= signs (added to the Paris atlas at load) ======================= */
{ const NW = () => AV.nwkit, SERIF = '"Didot", "Bodoni MT", "Playfair Display", Georgia, serif';
  const peint = (top, sub, bg, fg, o) => (g, w, h) => { o = o || {}; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; if (o.neon) { g.shadowColor = o.neon; g.shadowBlur = 16 } NW().fit(g, top, w - 60, h * .5, (o.font || 'italic 700 #px ') + (o.sans ? 'Arial, sans-serif' : SERIF), sub ? h * .42 : h * .52, w / 2); g.shadowBlur = 0; if (sub) { g.fillStyle = o.subc || fg; NW().fit(g, sub, w - 80, h * .18, '600 #px Arial, sans-serif', h * .8, w / 2) } };
  const ADD = [
    ['moulin', 640, 160, (g, w, h) => { g.fillStyle = '#1a0a1e'; g.fillRect(0, 0, w, h); for (let x = 14; x < w; x += 22) { g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(x, 10, 4, 0, TAU); g.arc(x, h - 10, 4, 0, TAU); g.fill() } g.shadowColor = '#d84aff'; g.shadowBlur = 20; g.fillStyle = '#f4a8ff'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'Le Moulin Violet', w - 80, 76, 'italic 900 #px ' + SERIF, 66, w / 2); g.shadowColor = '#ff4a6a'; g.fillStyle = '#ffc8d8'; NW().fit(g, 'REVUE · FRENCH CANCAN · 21h', w - 120, 26, '800 #px Arial, sans-serif', 124, w / 2); g.shadowBlur = 0 }],
    ['lapin', 448, 112, peint('Au Lapin Sage', 'CABARET · chansons · 21h', '#f0c8c8', '#4a2a3a', { subc: '#2a5a3a' })],
    ['boheme', 640, 128, peint('La Bohème des Singes', 'crêpes · vin chaud · terrasse', '#2a1a2a', '#f2d890')],
    ['souvenir', 448, 112, peint('Souvenirs de Montmartre', 'bérets · cartes · boules à neige', '#1a3a6a', '#f4f0e0')],
    ['beauxarts', 448, 112, peint('Beaux-Arts Pinceau', 'couleurs · toiles · carnets', '#f4f0e4', '#6a2a8a', { subc: '#3a3a3a' })],
    ['guitares', 448, 112, peint('Guitares Pigalle', 'neuves · occasions · amplis', '#1a1a1a', '#f2c230', { sans: true, font: '900 #px ' })],
    ['clichy', 448, 112, peint('Brasserie Le Clichy', 'fruits de mer · steak frites', '#3a1418', '#e8c868')],
    ['funi', 448, 112, peint('FUNICULAIRE', 'Montmartre · Sacré-Singe', '#2a4a3a', '#f2d890', { sans: true, font: '900 #px ' })],
    ['pigalle', 448, 112, (g, w, h) => { g.fillStyle = '#0a0a14'; g.fillRect(0, 0, w, h); g.shadowColor = '#ff2a6a'; g.shadowBlur = 18; g.fillStyle = '#ff8aaa'; g.textAlign = 'center'; g.textBaseline = 'middle'; NW().fit(g, 'PIGALLE', w - 60, 70, '900 #px Arial Black, Arial, sans-serif', h / 2, w / 2); g.shadowBlur = 0 }],
    ['mm_plaque', 256, 80, (g, w, h) => { g.fillStyle = '#1a3a7a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8e8e8'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 14px Arial'; g.fillText('18e Arrt', w / 2, 22); NW().fit(g, 'PLACE DU TERTRE', w - 20, 24, '800 #px Arial, sans-serif', 52, w / 2) }],
    ['w_toiles', 256, 160, (g, w, h) => { g.fillStyle = '#f4f0e8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const gr = g.createLinearGradient(0, 0, 50, 70); gr.addColorStop(0, ['#4a8ad8', '#d84a6a', '#f2c230', '#3aa85a'][i]); gr.addColorStop(1, ['#f2c230', '#2a4a8a', '#d84a2a', '#8a4ad8'][i]); g.fillStyle = gr; g.fillRect(12 + i * 60, 30 + (i % 2) * 20, 50, 70); g.strokeStyle = '#8a6a3a'; g.lineWidth = 4; g.strokeRect(12 + i * 60, 30 + (i % 2) * 20, 50, 70) } }]];
  const reg = () => { if (PAR.SIGNS) { for (const s of ADD) if (!PAR.SIGNS.some(x => x[0] === s[0])) PAR.SIGNS.push(s); return true } return false };
  if (!reg()) addEventListener('load', reg) }

/* ======================= build ======================= */
PAR.montmartre = function (ctx, E) {
  const K = AV.kit, BG = K.BG, rng = ctx.rng, grp = ctx.group, cols = ctx.cols, circ = ctx.circles, { box, sign, P, Gl, Gs, sh, SPECIAL, ITF, bx2, IN, guimard } = E, NW = AV.nwkit;
  const OPEN = [], open = (x0, x1, z0, z1) => OPEN.push([x0, x1, z0, z1]);
  const boxY = (arr, hex, x0, x1, y0, y1, z0, z1) => box(arr, hex, x0, x1, y0, y1, z0, z1);
  const minH = (x0, x1, z0, z1) => Math.min(H(x0, z0), H(x1, z0), H(x0, z1), H(x1, z1), H((x0 + x1) / 2, (z0 + z1) / 2)), maxH = (x0, x1, z0, z1) => Math.max(H(x0, z0), H(x1, z0), H(x0, z1), H(x1, z1), H((x0 + x1) / 2, (z0 + z1) / 2));
  /* ---------- terrain: a vertex-coloured mesh over the hill (paving, lawns, the vineyard) ---------- */
  const GREEN = [[-60, 60, -640, -500], [40, 110, -790, -758]], LANE = [[-6, 6, -640, -500]];
  { const nx = 110, nz = 96, g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, nx, nz); g.rotateX(-PI / 2); const p = g.attributes.position, colA = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) + (X0 + X1) / 2, z = p.getZ(i) + (Z0 + Z1) / 2; p.setXYZ(i, x, H(x, z) - .03, z); const inR = r => x > r[0] && x < r[1] && z > r[2] && z < r[3];
      c.setHex(GREEN.some(inR) && !LANE.some(inR) ? (inR(GREEN[1]) ? 0x6a7a3a : 0x5a8a3a) : (z > -456 && z < -424) ? 0x5a5a5c : 0xa8a298); c.convertSRGBToLinear(); colA.set([c.r, c.g, c.b], i * 3) }
    g.setAttribute('color', new THREE.BufferAttribute(colA, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .92 })); m.receiveShadow = true; m.material.userData.lin = 1; m.name = 'mm_terrain'; grp.add(m); MM.terrain = m }
  /* ---------- the boulevard de Clichy (flat): road, tree median, Haussmann rows, the cabaret windmill ---------- */
  box(P, 0x2e2f33, X0, X1, .01, .04, -448, -432); box(P, 0x8a8a84, X0, X1, .01, .16, -441.5, -438.5); for (const z of [-448.1, -432.1]) box(P, 0xb0b0ac, X0, X1, 0, .15, z, z + .2);
  for (let x = X0 + 6; x < X1; x += 11) { const h = 8; box(P, 0x8a8268, x - .2, x + .2, 0, h * .55, -440.2, -439.8); P.push([BG.ico, 0x4a6a2e, K.M(x, h * .8, -440, 2.6, 2.2, 2.6), 0]); circ.push([x, -440, .3]) }
  open(X0, X1, -456, -424);
  const lot = (o) => L2 => { if (L2.skip) { rng(); rng(); return } const y = Math.max(0, H(L2.fx, L2.fz) - .05), h = (o.h0 || 17) + rng() * (o.hr || 3), shop = L2.isSp || rng() < (o.shopP == null ? .7 : o.shopP);
    PAR.haussmann(P, Gl, Gs, L2.fx, L2.fz, L2.yaw, L2.w, h, L2.c0[1] - L2.c0[0] > L2.c0[3] - L2.c0[2] && L2.al[0] ? L2.c0[3] - L2.c0[2] : (L2.al[0] ? L2.c0[3] - L2.c0[2] : L2.c0[1] - L2.c0[0]), { rng, y, col: o.cols ? o.cols[(rng() * o.cols.length) | 0] : [0xe8dcc0, 0xe0d4b6, 0xeee4cc][(rng() * 3) | 0], shop, lit: shop && rng() < .8, hollow: L2.isSp && L2.sp[4], village: o.village });
    if (L2.isSp) Object.assign(sh[L2.sp[0]], { signY: y + 4.15, noWin: !!o.village }); else if (shop && o.gen) sign(o.gen[(rng() * o.gen.length) | 0], L2.fx + L2.out[0] * .24, y + 4.15, L2.fz + L2.out[1] * .24, L2.w - .8, (L2.w - .8) * .232, L2.yaw) };
  for (const s of [['guitares', 'bcS', -60, 8], ['clichy', 'bcS', 60, 9], ['souvenir', 'stW', -485, 8], ['beauxarts', 'stE', -488, 8], ['boheme', 'ttN', -64, 10]]) SPECIAL.push(s);
  const ROW = (id, ax, front, a0, a1, face, depth, o) => NW.rowWalk({ id, ax, front, a0, a1, face, depth, rng, SPECIAL, SHOPS: sh, cols, gaps: o && o.gaps, wmin: (o && o.wmin) || 7, wmax: (o && o.wmax) || 11, lot: lot(o || {}) });
  const GENB = ['g_bistrot', 'g_vin', 'g_galerie', 'g_chapeau', 'g_epicerie'], VIL = [0xf0d8c0, 0xe8e0c8, 0xf4e4d0, 0xd8c8b0, 0xf0e8d8, 0xe0c8a8];
  ROW('bcS', 'x', -424, X0, X1, -1, 14, { gen: GENB }); ROW('bcN', 'x', -456, X0, -176, 1, 14, { gen: GENB, gaps: [[-221, -207]] }); ROW('bcN', 'x', -456, -164, -140, 1, 14, { gen: GENB }); ROW('bcN', 'x', -456, -100, -12, 1, 14, { gen: GENB }); ROW('bcN', 'x', -456, 12, X1, 1, 14, { gen: GENB, gaps: [[199, 221]] });
  /* Le Moulin Violet: the cabaret front + the windmill on its roof (sails turn) */
  { const x0 = -140, x1 = -100, zf = -456; box(P, 0x5a2a7a, x0, x1, 0, 13, zf - 18, zf); box(P, 0x2a0a2a, x0 + 3, x1 - 3, 0, 4.2, zf - .05, zf); for (let x = x0 + 1; x < x1; x += 1.2) { box(Gl, 0xffe08a, x - .12, x + .12, 4.6, 4.84, zf + .01, zf + .1); box(Gl, 0xffe08a, x - .12, x + .12, 12.4, 12.64, zf + .01, zf + .1) }
    box(P, 0x8a2a5a, x0 - .3, x1 + .3, 4.2, 4.5, zf, zf + 2.2); sign('moulin', -120, 7.6, zf + .08, 18, 4.5, 0); box(P, 0x3a1a2a, -124, -116, 13, 22, -470, -462); P.push([BG.cone, 0x2a1a1a, K.M(-120, 24.5, -466, 6.2, 5, 6.2, 0, PI / 4, 0), 0]); cols.push([x0, x1, zf - 18, zf]);
    const sails = new THREE.Group(); sails.position.set(-120, 19, -461.6); const sm = AV.std(0x8a2a3a, .6), lm = new THREE.MeshBasicMaterial({ color: 0xff7ad8 }); lm.userData.lin = 1;
    for (let k = 0; k < 4; k++) { const arm = new THREE.Group(); arm.rotation.z = k * PI / 2; const b = new THREE.Mesh(AV.G.box, sm); b.scale.set(.35, 9, .2); b.position.y = 4.5; arm.add(b); const pnl = new THREE.Mesh(AV.G.box, sm); pnl.scale.set(1.8, 7, .08); pnl.position.set(1.05, 5, 0); arm.add(pnl); for (let j = 0; j < 6; j++) { const l = new THREE.Mesh(AV.G.box, lm); l.scale.set(.25, .25, .1); l.position.set(1.9, 2 + j * 1.3, .1); arm.add(l) } sails.add(arm) }
    AV.lin && AV.lin(sails); grp.add(sails); MM.sails = sails; MM.moulin = [-120, -453.5];
    ctx.upd.push(dt => { if (AV.W && AV.W.id === 'paris') sails.rotation.z -= (dt || .016) * .35 }) }
  /* ---------- Rue de Steinkerque up to the garden ---------- */
  open(-12, 12, -505, -456); ROW('stW', 'z', -12, -500, -470, 1, 14, { gen: ['g_chapeau', 'g_papeterie', 'g_galerie'], wmin: 6, wmax: 9, h0: 14 }); ROW('stE', 'z', 12, -500, -470, -1, 14, { gen: ['g_chapeau', 'g_papeterie', 'g_parfum'], wmin: 6, wmax: 9, h0: 14 });
  /* ---------- the garden on the slope: lawns, the long staircase, the funicular ---------- */
  open(-60, 60, -640, -500);
  for (let z = -506; z > -640; z -= 1.2) { const y0 = H(0, z), y1 = H(0, z - 1.2); box(P, 0xd8d0c0, -4, 4, y1 - .05, Math.max(y0, y1) + .02, z - 1.2, z); box(P, 0xc0b8a8, -4, 4, Math.max(y0, y1) - .02, Math.max(y0, y1) + .03, z - .1, z) }   /* stairs */
  for (const x of [-4.2, 4.2]) for (let z = -506; z > -640; z -= 4) { const y = H(x, z), y2 = H(x, z - 4); P.push([BG.box, 0x2a2a2a, K.M(x, (y + y2) / 2 + .9, z - 2, .06, .06, Math.hypot(4, y2 - y), Math.atan2(y2 - y, 4), 0, 0), 0]); box(P, 0x2a2a2a, x - .04, x + .04, y, y + .95, z - .04, z + .04) }
  for (let z = -506; z > -640; z -= 2) { const y = H(24, z), y2 = H(24, z - 2); for (const x of [22.6, 25.4]) P.push([BG.box, 0x6a6a6e, K.M(x, (y + y2) / 2 + .1, z - 1, .1, .1, Math.hypot(2, y2 - y), Math.atan2(y2 - y, 2), 0, 0), 0]); box(P, 0x5a4a3a, 22, 26, Math.min(y, y2) - .1, Math.min(y, y2) + .05, z - 1.1, z - .9) }   /* funicular track */
  cols.push([20.5, 27.5, -634, -510]);
  const station = (z, top) => { const y = H(24, z); box(P, 0xd8d0c0, 19, 29, y, y + .2, z - 4, z + 4); box(Gs, 0xa8c8d8, 19.2, 28.8, y + .2, y + 3.4, z - 3.8, z + 3.8); box(P, 0x2a4a3a, 18.8, 29.2, y + 3.4, y + 3.7, z - 4.2, z + 4.2); sign('funi', 24, y + 4.3, z + (top ? -4.25 : 4.25), 3.2, .8, top ? PI : 0, true) };
  station(-506, false); station(-638, true); MM.funi = { bottom: [14, -506], top: [14, -644] };
  for (const [x, z] of [[-40, -520], [-30, -560], [-45, -600], [40, -530], [45, -575], [38, -615], [-20, -620], [-50, -560], [50, -610]]) { const y = H(x, z), h = 8; box(P, 0x6a5a48, x - .22, x + .22, y - .5, y + h * .5, z - .22, z + .22); P.push([BG.ico, [0x4a7a34, 0x3e6a2e][(x | 0) & 1], K.M(x, y + h * .8, z, 3, 2.5, 3), 0]); circ.push([x, z, .35]) }
  for (const x of [-60, 60]) for (let z = -640; z < -500; z += 4) { if (x > 0 && z > -621 && z < -612) continue; const y = H(x, z); box(P, 0x6a6458, x - .3, x + .3, y - .5, y + .8, z, z + 4.02) } cols.push([-61, -59.5, -640, -505], [59.5, 61, -640, -620], [59.5, 61, -612, -505]);
  /* ---------- the terrace + the white basilica on the summit ---------- */
  open(-30, 30, -680, -640); { const yb = H(0, -700) - 1.5, W2 = 0xf0ece0; box(P, 0xe8e4d8, -30, 30, H(0, -660) - .6, H(0, -660) + .02, -680, -640);
    for (const [x0, x1] of [[-30, -4.5], [4.5, 19.5], [28.5, 30]]) { const y = H((x0 + x1) / 2, -640.5); box(P, 0xe8e4d8, x0, x1, y - .5, y + 1, -641, -640); cols.push([x0, x1, -641.2, -639.8]) }
    box(P, W2, -30, 30, yb, yb + 20, -735, -682); box(P, 0xe4e0d4, -12, 12, yb, yb + 26, -686, -680); for (const x of [-8, 0, 8]) { box(P, 0x2a2a30, x - 2, x + 2, yb + 1, yb + 8, -680.05, -679.95); P.push([BG.cyl, 0x2a2a30, K.M(x, yb + 8, -680, 2, .1, 2, PI / 2, 0, 0), 0]) }
    P.push([BG.cyl, W2, K.M(0, yb + 30, -712, 11, 14, 11), 0], [BG.hem, W2, K.M(0, yb + 37, -712, 11.5, 15, 11.5), 0], [BG.cyl, W2, K.M(0, yb + 53, -712, 2.4, 4, 2.4), 0], [BG.hem, W2, K.M(0, yb + 55, -712, 2.6, 3, 2.6), 0], [BG.cone, 0xc8a040, K.M(0, yb + 59, -712, .5, 3, .5), 0]);
    for (const [x, z] of [[-20, -692], [20, -692], [-20, -726], [20, -726]]) P.push([BG.cyl, W2, K.M(x, yb + 22, z, 5, 6, 5), 0], [BG.hem, W2, K.M(x, yb + 25, z, 5.2, 7, 5.2), 0], [BG.cone, 0xc8a040, K.M(x, yb + 33, z, .25, 2, .25), 0]);
    box(P, W2, -6, 6, yb, yb + 52, -748, -736); P.push([BG.hem, W2, K.M(0, yb + 52, -742, 6.5, 6, 6.5), 0]); for (let y = yb + 8; y < yb + 18; y += 4) for (let z = -730; z < -688; z += 6) box(Gl, 0xffd8a0, -30.05, -29.95, y, y + 2.4, z, z + 1.2);
    for (const x of [-11, 11]) { box(P, 0x3a4a3a, x - 1, x + 1, yb + 26, yb + 28, -682, -680); P.push([BG.sph, 0x3a4a3a, K.M(x, yb + 29.2, -681, .9, 1.3, 1.8), 0]) }   /* the two bronze riders */
    cols.push([-30, 30, -748, -680]); MM.basilica = [0, -678]; MM.terrace = [0, -646] }
  /* ---------- Place du Tertre: painters, café terraces under red umbrellas ---------- */
  open(-90, -38, -690, -650); open(-38, -30, -680, -650);
  ROW('ttN', 'x', -690, -90, -38, 1, 12, { village: true, h0: 8, hr: 4, cols: VIL, wmin: 6, wmax: 9, gen: ['g_galerie', 'g_bistrot', 'g_epicerie'] }); ROW('ttW', 'z', -90, -690, -664, 1, 12, { village: true, h0: 8, hr: 4, cols: VIL, wmin: 6, wmax: 9, gen: ['g_galerie'] }); ROW('ttW', 'z', -90, -656, -650, 1, 12, { village: true, h0: 8, hr: 4, cols: VIL, wmin: 3, wmax: 6, gen: ['g_galerie'] });
  ROW('ttS', 'x', -650, -90, -38, -1, 12, { village: true, h0: 8, hr: 4, cols: VIL, wmin: 6, wmax: 9, gen: ['g_galerie', 'g_vin'] });
  const TT = []; for (let i = 0; i < 10; i++) { const x = -84 + (i % 5) * 9, z = -682 + ((i / 5) | 0) * 6, y = H(x, z); P.push([BG.cone, [0xc8202a, 0xf4f0e8][i % 2], K.M(x, y + 2.7, z, 1.6, .7, 1.6), 0]); box(P, 0x8a8a8a, x - .05, x + .05, y, y + 2.4, z - .05, z + .05); P.push([BG.cyl, 0xd8d8d0, K.M(x, y + .76, z, .45, .04, .45), 0]); for (const s of [-1, 1]) box(P, 0x6a4a2a, x + s * .8 - .2, x + s * .8 + .2, y + .44, y + .48, z - .2, z + .2); TT.push([x, z]); circ.push([x, z, .5]) }
  const EAS = []; for (let i = 0; i < 6; i++) { const x = -82 + i * 8, z = -662, y = H(x, z); for (const s of [-.35, .35]) P.push([BG.box, 0x8a6a4a, K.M(x + s, y + .95, z, .05, 1.9, .05, .15, 0, 0), 0]); P.push([BG.box, 0xf4f0e8, K.M(x, y + 1.45, z + .12, .9, .7, .04, .15, 0, 0), 0]); EAS.push([x, z]); circ.push([x, z, .4]) }
  MM.tables = TT; MM.easels = EAS; sign('mm_plaque', -38.2, H(-38, -655) + 3, -655, 1.6, .5, -PI / 2);
  /* ---------- Rue Lepic: the winding lane back down (L1..L4) ---------- */
  open(-176, -164, -566, -456); open(-216, -114, -568, -558); open(-216, -208, -566, -456); box(P, 0xa8a298, -216, -208, .01, .05, -456, -452); open(-126, -114, -664, -558); open(-126, -90, -664, -654);
  const LV = { village: true, h0: 9, hr: 5, cols: VIL, wmin: 6, wmax: 9, gen: ['g_bistrot', 'g_epicerie', 'g_vin', 'g_papeterie'] };
  ROW('l1W', 'z', -176, -546, -470, 1, 14, LV); ROW('l1E', 'z', -164, -546, -470, -1, 14, LV); ROW('l2N', 'x', -568, -176, -126, 1, 12, LV); ROW('l2S', 'x', -558, -164, -114, -1, 12, LV);
  ROW('l3W', 'z', -126, -650, -580, 1, 14, LV); ROW('l3E', 'z', -114, -642, -570, -1, 14, LV); ROW('l4N', 'x', -664, -126, -102, 1, 12, LV); ROW('l4S', 'x', -654, -114, -90, -1, 12, LV);
  /* ---------- the lane to the vineyard + the cabaret cottage ---------- */
  open(30, 40, -758, -640); open(30, 208, -758, -750); open(200, 208, -758, -456); open(-38, -30, -758, -680); open(-38, 40, -758, -750); open(60, 208, -620, -612); open(40, 110, -790, -758);
  for (let x = 44; x < 108; x += 2.6) for (let z = -786; z < -760; z += 1.6) { const y = H(x, z); box(P, 0x5a3a2a, x - .04, x + .04, y, y + 1.1, z - .04, z + .04); P.push([BG.ico, [0x4a7a2e, 0x5a8a34][((x + z) | 0) & 1], K.M(x, y + 1, z, .5, .4, .7), 0]) }
  cols.push([40, 110, -790, -760.5]);
  { const x0 = 60, x1 = 76, z0 = -750 + 12, y = minH(x0, x1, -750, -738) - .1; box(P, 0xf0c8c8, x0, x1, y - 3, y + 6, -750, -738); box(P, 0x8a4a3a, x0 - .5, x1 + .5, y + 6, y + 6.5, -750.6, -737.4); P.push([BG.box, 0x8a4a3a, K.M(68, y + 7.6, -744, 17, 2.4, 13, 0, 0, 0), 0]); box(P, 0x3a5a2a, x0, x0 + 5, y, y + 5, -750.05, -749.95); box(P, 0x2a1a12, 66, 69, y, y + 2.6, -750.08, -750.02); for (const x of [62.5, 72.5]) box(Gl, 0xffc890, x - .9, x + .9, y + 1, y + 2.4, -750.1, -750.05); sign('lapin', 68, y + 4, -750.12, 6, 1.5, PI); cols.push([x0, x1, -750, -738]); MM.lapin = [68, -752.5] }
  /* ---------- the métro (line 12, Abbesses): a Guimard entrance on the boulevard ---------- */
  guimard(-60, -451.8, PI); MM.metro = [-60, -454.4];
  sign('pigalle', 40, 11, -423.9, 6, 1.5, PI); sign('pigalle', -180, 11, -423.9, 6, 1.5, PI);
  /* ---------- close everything else with village blocks on the slope (8 m cells that touch no street, row or landmark) ---------- */
  const SOLIDS = [[-140, -100, -474, -456], [-30, 30, -748, -680], [60, 76, -750, -738], [20.5, 27.5, -640, -500]]; const hit = (x0, x1, z0, z1, R2) => R2.some(r => x1 > r[0] + .01 && x0 < r[1] - .01 && z1 > r[2] + .01 && z0 < r[3] - .01);
  const rowCols = cols.slice(MM._c0 || 0); let nF = 0;
  for (let x = X0; x < X1; x += 8) for (let z = Z0; z < Z1; z += 8) { const x1 = x + 8, z1 = z + 8; if (hit(x, x1, z, z1, OPEN) || hit(x, x1, z, z1, SOLIDS) || hit(x, x1, z, z1, rowCols)) continue; const y0 = minH(x, x1, z, z1) - 1, y1 = maxH(x, x1, z, z1) + 7 + rng() * 6;
    box(P, VIL[(rng() * VIL.length) | 0], x, x1, y0, y1, z, z1); box(P, 0x8a4a3a, x - .2, x1 + .2, y1, y1 + .6, z - .2, z1 + .2); if (rng() < .5) box(Gl, 0xffd8a0, x + 2, x + 3.2, y1 - 3.4, y1 - 1.8, z1 + .01, z1 + .05); cols.push([x, x1, z, z1]); nF++ }
  MM.stats.fill = nF;
  /* ---------- the walk-in: none (Montmartre's businesses are counters and terraces) — the Moulin + the Lapin are exteriors with gates ---------- */
  /* ---------- map ---------- */
  const roads = [[-212, -456, -212, -562, 8], [204, -456, 204, -754, 8], [35, -754, 204, -754, 8], [-34, -680, -34, -754, 8], [-34, -754, 35, -754, 8], [60, -616, 204, -616, 8], [X0, -440, X1, -440, 16], [0, -456, 0, -505, 12], [0, -505, 0, -640, 8], [-170, -456, -170, -562, 12], [-170, -562, -120, -562, 8], [-120, -562, -120, -660, 12], [-120, -660, -90, -660, 8], [35, -650, 35, -754, 10], [35, -754, 110, -754, 8]];
  const places = [['mm_boulevard', 'Boulevard de Clichy', 'Bulevar de Clichy', 0, -452, PI], ['mm_moulin', 'Le Moulin Violet (cabaret)', 'Le Moulin Violet (cabaret)', -120, -453, PI], ['mm_metro', 'Métro Abbesses (line 12)', 'Metro Abbesses (línea 12)', -60, -455, PI], ['mm_steps', 'The long staircase', 'La gran escalinata', 0, -570, PI], ['mm_funi', 'Funicular (bottom)', 'Funicular (abajo)', 14, -506, PI],
    ['mm_basilica', 'The white basilica (Sacré-Singe)', 'La basílica blanca (Sacré-Singe)', 0, -676, PI], ['mm_terrace', 'Terrace: view over Paris', 'Terraza: vista de París', 0, -646, 0], ['mm_tertre', 'Place du Tertre (painters)', 'Place du Tertre (pintores)', -64, -672, PI], ['mm_lepic', 'Rue Lepic', 'Rue Lepic', -170, -520, PI], ['mm_vineyard', 'The vineyard', 'El viñedo', 75, -770, PI], ['mm_lapin', 'Au Lapin Sage (cabaret)', 'Au Lapin Sage (cabaret)', 68, -753, 0]];
  for (const [k, n] of [['guitares', 'Guitares Pigalle'], ['clichy', 'Brasserie Le Clichy'], ['souvenir', 'Souvenirs de Montmartre'], ['beauxarts', 'Beaux-Arts Pinceau'], ['boheme', 'La Bohème des Singes (café)']]) { const s = sh[k]; if (s) places.push([k, n, n, s.x + s.out[0] * 3, s.z + s.out[1] * 3, Math.atan2(s.out[0], s.out[1]) + PI]) }
  const nav = [[[-212, -452], [204, -452]], [[-212, -428], [204, -428]], [[-212, -440], [204, -440]], [[0, -452], [0, -505], [0, -640], [0, -660], [-20, -666], [-34, -668], [-64, -670], [-84, -682]], [[-64, -670], [-64, -655]], [[-34, -668], [-100, -660], [-120, -660], [-120, -562], [-170, -562], [-170, -452]], [[0, -660], [35, -660], [35, -754], [204, -754], [204, -452], [204, -428]], [[-170, -562], [-212, -562], [-212, -452], [-212, -428]], [[-40, -515], [-40, -630]], [[40, -515], [40, -630]], [[-40, -515], [0, -508], [40, -515]], [[-40, -630], [0, -636], [40, -630]], [[-64, -655], [-38, -660], [-34, -668]], [[-84, -682], [-84, -664], [-64, -655]], [[-34, -668], [-34, -754], [35, -754]], [[40, -616], [204, -616]]];
  MM.stats.shops = ['guitares', 'clichy', 'souvenir', 'beauxarts', 'boheme'].filter(k => sh[k]).length;
  return { roads, places, nav, MM };
};
/* the row callback needs to know where rows start in cols (for the fill pass) */
const _mm = PAR.montmartre; PAR.montmartre = function (ctx, E) { MM._c0 = ctx.cols.length; return _mm(ctx, E) };

/* ======================= life ======================= */
const I = (id, o) => { if (!AV.ITEMS[id]) AV.ITEMS[id] = o };
I('fr_vinchaud', { n: L('Vin chaud', 'Vino caliente'), cat: 'drink', ic: '🍷', use: 'drink', fx: { type: 'drink', amt: .28 }, model: 'cup', col: 0x8a1a2a, price: 5, say: L('Mulled with orange and cinnamon, steaming on the square.', 'Especiado con naranja y canela, humeando en la plaza.') });
I('fr_globe', { n: L('Snow globe of the basilica', 'Bola de nieve de la basílica'), cat: 'souvenir', ic: '🔮', use: 'look', keep: true, model: 'card', col: 0xd8e8ff, price: 6, say: L('Shake it: snow falls on the white domes.', 'Agítala: nieva sobre las cúpulas blancas.') });
I('fr_carnet', { n: L('Sketchbook', 'Cuaderno de bocetos'), cat: 'souvenir', ic: '📓', use: 'look', keep: true, model: 'card', col: 0x3a2a1e, price: 7, say: L('Cream paper, a ribbon, the smell of a new start.', 'Papel crema, una cinta, olor a empezar de nuevo.') });
I('fr_violet', { n: L('Tube of violet paint', 'Tubo de pintura violeta'), cat: 'misc', ic: '🎨', use: 'look', keep: true, model: 'card', col: 0x7a3ad8, price: 6, say: L('Cobalt violet, the expensive one. Margot is waiting for it.', 'Violeta de cobalto, el caro. Margot lo está esperando.') });
I('fr_revue', { n: L('Moulin Violet revue programme', 'Programa de la revista del Moulin Violet'), cat: 'souvenir', ic: '🎭', use: 'look', keep: true, model: 'card', col: 0xd84aff, price: 0, say: L('Feathers, cancan, a juggling ape on a unicycle.', 'Plumas, cancán, un mono malabarista en monociclo.') });

PAR.montmartreLife = function (ctx, E) {
  const S = AV.S, T = E.T, st = E.st, crowd = E.crowd, sh = E.sh, front = E.front, MMx = PAR.mm, rng = ctx.rng, H2 = MMx.H;
  const hour = () => (S.time / 60) % 24, P = () => AV.P, here = () => AV.W && AV.W.id === 'paris';
  const mm = () => { const s = st(); s.mm = s.mm || { met: {}, q: {} }; return s.mm };
  /* the crowd walks on the slope */
  const V = ['woman', 'man', 'tourist', 'backpacker', 'suit'];
  for (const [x, z] of MMx.tables.slice(0, [5, 8, 10][ctx.q])) crowd.add({ v: V[(x | 0) & 3], x: x + .8, z, mode: 'sit', yaw: -PI / 2 });
  for (let i = 0; i < [6, 10, 14][ctx.q]; i++) crowd.add({ v: V[i % 5], x: -2 + rng() * 26, z: -652 - rng() * 6, mode: 'idle', yaw: rng() * .6 - .3 });   /* the terrace crowd looks out over Paris */
  for (const [x, z] of MMx.easels.slice(0, 4)) crowd.add({ v: 'man', x, z: z - .9, mode: 'idle', yaw: 0, cols: { skin: 0xd8a47a, hair: 0x4a2a1a, shirt: [0x2a4a8a, 0x8a2a2a, 0x1a1a1a, 0x3a6a3a][(x | 0) & 3], pants: 0x3a3a3a } });
  const sNear = []; for (const k of ['guitares', 'clichy', 'souvenir', 'beauxarts', 'boheme']) { const s = sh[k]; if (s) { const w = E.staff([s.x - s.out[0] * 1.2, s.z - s.out[1] * 1.2], 'woman', 0xf4f0e8); if (w) sNear.push(w) } }
  ctx.upd.push(() => { if (!here()) return; for (const w of crowd.list) if (w.z < -400 && w.z > -800) w.y = H2(w.x, w.z) });
  /* named residents */
  const PEOPLE = {
    margot: { n: 'Margot', role: L('painter on the Place du Tertre', 'pintora de la Place du Tertre'), v: 'woman', cols: { skin: 0xf0d0b0, hair: 0x8a2a1a, shirt: 0x6a2a8a, pants: 0x1a1a2a }, sched: [[9, [-82, -663.4]], [18, [-74, -680]], [22, [-60, -455]]] },
    theo: { n: 'Théo', role: L('doorman at Le Moulin Violet', 'portero de Le Moulin Violet'), v: 'man', cols: { skin: 0x8a5a3a, hair: 0x1a1a1a, shirt: 0x2a0a2a, pants: 0x1a1a1a }, sched: [[11, front('clichy', 2)], [16, [0, -646]], [20, [-116, -453.4]]] },
    rosalie: { n: 'Rosalie', role: L('chanson singer at Au Lapin Sage', 'cantante de chanson en Au Lapin Sage'), v: 'woman', cols: { skin: 0xf4d8c0, hair: 0x1a1a1a, shirt: 0x1a1a1a, pants: 0xc8202a }, sched: [[10, [72, -754]], [15, [-64, -672]], [20, [68, -752.5]]] }
  };
  const named = PAR.named, slotOf = p => { const h = hour(); let s = null; for (const e of p.sched) if (e[0] <= h && (!s || e[0] > s[0])) s = e; if (!s) s = p.sched.reduce((a, e) => e[0] > a[0] ? e : a); return s };
  for (const [id, p] of Object.entries(PEOPLE)) { const s0 = slotOf(p), at = s0[1] || p.sched.find(e => e[1])[1]; const w = crowd.add({ v: p.v, x: at[0], z: at[1], mode: 'idle', cols: p.cols }); named[id] = { p, w, slot: s0 }; named[id].t = T(w.x, w.z, 2, () => tr('Talk to ', 'Hablar con ') + p.n + ' (' + say(p.role) + ')', () => talk(id)) }
  /* ---------- shops ---------- */
  const ctr = (pt, V2, label, show) => { if (!pt) return null; Object.assign(V2, { x: pt[0], z: pt[1], reach: 5 }); return T(pt[0], pt[1], 2, () => tr(label[0], label[1]), () => AV.shop.open(V2), show || null, 'shop') };
  ctr(front('boheme', 1.4), { id: 'mm_boheme', name: L('La Bohème des Singes', 'La Bohème des Singes'), greet: L('“Une crêpe, un vin chaud ? The painters drink here since 1900.”', '“¿Un crep, un vino caliente? Los pintores beben aquí desde 1900.”'), items: [['fr_crepe', 4], ['fr_vinchaud', 5], ['fr_chocolat', 4], ['fr_cafe', 2]] }, L('☕ La Bohème des Singes (Tertre café)', '☕ La Bohème des Singes (café del Tertre)'));
  ctr(front('souvenir', 1.4), { id: 'mm_souvenir', name: L('Souvenirs de Montmartre', 'Souvenirs de Montmartre'), greet: L('“Berets, postcards, snow globes — Montmartre in your pocket.”', '“Boinas, postales, bolas de nieve: Montmartre en tu bolsillo.”'), items: [['fr_beret', 9], ['fr_carte', 2], ['fr_globe', 6]] }, L('🎁 Souvenirs de Montmartre', '🎁 Souvenirs de Montmartre'));
  ctr(front('beauxarts', 1.4), { id: 'mm_beauxarts', name: L('Beaux-Arts Pinceau', 'Beaux-Arts Pinceau'), greet: L('“Colours, canvases, sketchbooks. Margot buys her violet here.”', '“Colores, lienzos, cuadernos. Margot compra aquí su violeta.”'), items: [['fr_violet', 6], ['fr_carnet', 7]] }, L('🎨 Beaux-Arts Pinceau (art supplies)', '🎨 Beaux-Arts Pinceau (material de arte)'));
  ctr(front('clichy', 1.4), { id: 'mm_clichy', name: L('Brasserie Le Clichy', 'Brasserie Le Clichy'), greet: L('“Steak frites, a glass of red, and the boulevard going by.”', '“Steak frites, una copa de tinto y el bulevar pasando.”'), items: [['fr_steakfrites', 14], ['fr_croque', 7], ['fr_vin', 6]] }, L('🍽️ Brasserie Le Clichy', '🍽️ Brasserie Le Clichy'));
  ctr(front('guitares', 1.4), { id: 'mm_guitares', name: L('Guitares Pigalle', 'Guitares Pigalle'), greet: L('“Strings, picks, a boombox for the street.”', '“Cuerdas, púas, un radiocasete para la calle.”'), items: [['gd_boombox', 90], ['gd_lp_road', 25], ['gd_lp_sab', 25]].filter(([i]) => AV.ITEMS[i]) }, L('🎸 Guitares Pigalle', '🎸 Guitares Pigalle'));
  /* ---------- the funicular (both ways), the basilica, the terrace ---------- */
  const RD = AV.rides, K = AV.kit, BG = K.BG; const funiGeo = c => K.merge([[BG.box, c, K.M(0, 1.3, 0, 2.6, 2.6, 5)], [BG.box, 0xa8c8d8, K.M(0, 1.7, 0, 2.7, 1.2, 4.6)], [BG.box, 0x1a1a1a, K.M(0, .1, 0, 2.2, .3, 4.4)], [BG.box, 0xf4f0e4, K.M(0, 2.7, 0, 2.7, .2, 5.1)]]);
  const FUNI = { geo: funiGeo, col: 0x2a4a3a, v: 2.6, eng: 'electric', chase: true, chaseDist: 9, chaseH: 4, noBlock: true }; MMx.FUNI = FUNI;
  MMx.funiRide = up => { if (!RD || RD.cur) return false; if (!AV.txn(-2, 'Funicular')) return false; const pts = up ? [[24, -509], [24, -560], [24, -610], [24, -635]] : [[24, -635], [24, -585], [24, -540], [24, -509]];
    const ok = RD.start({ pts, veh: FUNI, out: up ? MMx.funi.top : MMx.funi.bottom, name: 'Funicular', price: 2, icon: '🚡', title: tr('Funicular', 'Funicular') }); if (ok) { mm().funi = (mm().funi || 0) + 1; AV.toast(tr('🚡 Ninety seconds, thirty-six metres, one métro ticket.', '🚡 Noventa segundos, treinta y seis metros, un billete de metro.')) } else AV.txn(2, 'Funicular refund'); return ok };
  T(MMx.funi.bottom[0], MMx.funi.bottom[1], 2.2, () => tr('🚡 Funicular up to the basilica (2)', '🚡 Funicular hasta la basílica (2)'), () => MMx.funiRide(true), null, 'train');
  T(MMx.funi.top[0], MMx.funi.top[1], 2.2, () => tr('🚡 Funicular down to the garden (2)', '🚡 Funicular hasta el jardín (2)'), () => MMx.funiRide(false), null, 'train');
  T(MMx.basilica[0], MMx.basilica[1], 2.6, () => tr('🕯️ The basilica: light a candle (1)', '🕯️ La basílica: encender una vela (1)'), () => { if (!AV.txn(-1, 'Candle')) return; mm().candle = (mm().candle || 0) + 1; AV.vitals && AV.vitals.add(0, 8); AV.toast(tr('🕯️ Under the great mosaic, a thousand small flames. Very quiet.', '🕯️ Bajo el gran mosaico, mil pequeñas llamas. Mucho silencio.')) }, null, 'look');
  T(MMx.terrace[0], MMx.terrace[1], 3, () => tr('🌇 The terrace: look out over Paris', '🌇 La terraza: mira París'), () => { mm().view = (mm().view || 0) + 1; AV.toast(tr('🌇 The whole city below: the river, the domes, the tower far to the west. A busker plays La Vie en rose.', '🌇 Toda la ciudad abajo: el río, las cúpulas, la torre al oeste. Un músico callejero toca La Vie en rose.')) }, null, 'look');
  T(75, -756, 2.4, () => tr('🍇 The vineyard: the city’s own vines', '🍇 El viñedo: las viñas de la ciudad'), () => AV.toast(tr('🍇 Pinot noir and gamay on the north slope. The harvest festival fills the streets every October.', '🍇 Pinot noir y gamay en la ladera norte. La fiesta de la vendimia llena las calles cada octubre.')), null, 'look');
  /* Margot's portrait (at her easel) */
  T(-82, -664.6, 1.8, () => tr('🎨 Margot’s easel: a portrait (12)', '🎨 El caballete de Margot: un retrato (12)'), () => { const q2 = mm().q, free = q2.violet === 'done' && !mm().freePortrait; if (!free && !AV.txn(-12, 'Portrait (Tertre)')) return; if (free) mm().freePortrait = 1; AV.fadeTo(1, 300); setTimeout(() => { S.time = (S.time + 25) % 1440; AV.bag.add('fr_portrait', 1, true); mm().portrait = (mm().portrait || 0) + 1; AV.fadeTo(0, 400); AV.toast(tr('🎨 Margot paints fast and talks faster. A touch of violet in your shadows.', '🎨 Margot pinta rápido y habla más rápido aún. Un toque de violeta en tus sombras.')) }, 350) }, () => { const m = named.margot; return !!m && Math.hypot(m.w.x + 82, m.w.z + 663.4) < 4 }, 'look');
  /* ---------- the two cabarets: Le Moulin Violet (21-01), Au Lapin Sage (21-02) ---------- */
  const moulinOpen = () => { const h = hour(); return h >= 21 || h < 1 }, lapinOpen = () => { const h = hour(); return h >= 21 || h < 2 }; MMx.moulinOpen = moulinOpen; MMx.lapinOpen = lapinOpen;
  T(MMx.moulin[0], MMx.moulin[1], 2.6, () => moulinOpen() ? tr('🎭 Le Moulin Violet: tonight’s revue (20)', '🎭 Le Moulin Violet: la revista de esta noche (20)') : tr('🎭 Le Moulin Violet: revue nightly from 21:00', '🎭 Le Moulin Violet: revista cada noche desde las 21:00'),
    () => { if (!moulinOpen()) return AV.toast(tr('Théo shakes his head: “Doors at nine. Come back in your best shoes.”', 'Théo niega con la cabeza: “Puertas a las nueve. Vuelve con tus mejores zapatos.”')); const s = mm(); const guest = s.guest === S.day || (s.guest === S.day - 1 && hour() < 5); if (!guest && !AV.txn(-20, 'Moulin Violet revue')) return;
      AV.fadeTo(1, 400); setTimeout(() => { S.time = (S.time + 50) % 1440; s.revue = (s.revue || 0) + 1; AV.bag.add('fr_revue', 1, true); AV.vitals && AV.vitals.add(-4, 16); AV.fadeTo(0, 600); AV.toast(tr('🎭 Feathers, a cancan line of twenty, a juggling ape on a unicycle. The whole room on its feet.', '🎭 Plumas, una fila de cancán de veinte, un mono malabarista en monociclo. Toda la sala en pie.')) }, 450) }, null, 'venue');
  ctr(MMx.lapin, { id: 'mm_lapin', name: L('Au Lapin Sage', 'Au Lapin Sage'), greet: L('Candles, wooden benches, a piano: “Assieds-toi, la chanson commence.”', 'Velas, bancos de madera, un piano: “Siéntate, la canción empieza.”'), items: [['fr_kir', 6], ['fr_vin', 6], ['fr_cidre', 4]] }, L('🎶 Au Lapin Sage: chansons + a glass (21:00-02:00)', '🎶 Au Lapin Sage: chansons + una copa (21:00-02:00)'), lapinOpen);
  T(MMx.lapin[0] + .01, MMx.lapin[1] + .01, 2, () => tr('🎶 Au Lapin Sage: closed — chansons from 21:00', '🎶 Au Lapin Sage: cerrado — chansons desde las 21:00'), () => AV.toast(tr('The shutters are closed. Rosalie sings from nine.', 'Las contraventanas están cerradas. Rosalie canta desde las nueve.')), () => !lapinOpen(), 'look');
  /* music for the district: the paris_life manager asks PAR.mmWant() after its own venues */
  PAR.mmWant = () => { const p = P(); if (moulinOpen() && Math.hypot(p.x - MMx.moulin[0], p.z - MMx.moulin[1]) < 45) return { key: 'moulin', music: { playlist: 'stone_ape_band', pos: { x: MMx.moulin[0], y: 4, z: MMx.moulin[1] - 6 }, bed: .08 } };
    if (lapinOpen() && Math.hypot(p.x - MMx.lapin[0], p.z - MMx.lapin[1]) < 35) return { key: 'lapin', music: { playlist: 'chiang_mai', pos: { x: MMx.lapin[0], y: H2(MMx.lapin[0], MMx.lapin[1]) + 2, z: MMx.lapin[1] + 4 }, bed: .05 } }; return null };
  /* ---------- the métro: line 12 between Saint-Germain and Abbesses ---------- */
  T(MMx.metro[0], MMx.metro[1], 2, () => tr('🚇 Métro line 12 to Saint-Germain (2)', '🚇 Metro línea 12 a Saint-Germain (2)'), () => PAR.metroGo && PAR.metroGo(null, [33, 109], 'Saint-Germain-des-Prés.', 12), null, 'train');
  T(34.2, 108.6, 2, () => tr('🚇 Métro line 12 to Montmartre (Abbesses) (2)', '🚇 Metro línea 12 a Montmartre (Abbesses) (2)'), () => PAR.metroGo && PAR.metroGo(null, [-60, -454.8], 'Abbesses — Montmartre.', 12), null, 'train');
  /* ---------- conversations ---------- */
  const TK = AV.talk, setL = (en, es) => { const e = document.getElementById('tkL'); e && (e.textContent = tr(en, es)) }, goto = (x, z, n) => { AV.minimap && AV.minimap.setDest && AV.minimap.setDest(x, z, n) };
  function talk(id) { const o = named[id]; if (!o || !TK) return; const s = mm(); s.met[id] = (s.met[id] || 0) + 1; const q2 = s.q;
    const O = {
      margot: [{ label: L('How long have you painted here?', '¿Cuánto llevas pintando aquí?'), say: L('“Twenty years on the same square metre. The city pays rent to me in light.”', '“Veinte años en el mismo metro cuadrado. La ciudad me paga el alquiler en luz.”') },
        { label: L('Why Montmartre?', '¿Por qué Montmartre?'), say: L('“Cheap rooms, steep streets, painters at every table. The rooms aren’t cheap anymore.”', '“Cuartos baratos, calles empinadas, pintores en cada mesa. Los cuartos ya no son baratos.”') },
        { label: L('Paint my portrait', 'Píntame un retrato'), fn: () => { AV.closePanel('cmp'); goto(-82, -664.6, 'Margot’s easel') } },
        { label: () => !q2.violet ? L('Need anything?', '¿Necesitas algo?') : q2.violet === 'done' ? L('How is the violet?', '¿Qué tal el violeta?') : L('I have your violet!', '¡Tengo tu violeta!'), fn: () => {
          if (!q2.violet) { q2.violet = 'ask'; setL('“I’m out of cobalt violet — my shadows look grey without it. Beaux-Arts Pinceau, Rue de Steinkerque. Bring me a tube?”', '“Me he quedado sin violeta de cobalto: mis sombras se ven grises sin él. Beaux-Arts Pinceau, Rue de Steinkerque. ¿Me traes un tubo?”'); const p2 = front('beauxarts', 1.4); p2 && goto(p2[0], p2[1], 'Beaux-Arts Pinceau') }
          else if (q2.violet === 'ask' && AV.bag.count('fr_violet') > 0) { q2.violet = 'done'; AV.bag.remove('fr_violet'); AV.txn(20, 'Margot: merci'); setL('“Magnifique! +20 — and your portrait is on me, any time.”', '“¡Magnífico! +20, y tu retrato corre de mi cuenta cuando quieras.”'); AV.quests && AV.quests.check && AV.quests.check() }
          else if (q2.violet === 'done') setL('“Look at that shadow under the café umbrella. Violet. Always violet.”', '“Mira esa sombra bajo la sombrilla del café. Violeta. Siempre violeta.”');
          else setL('“Beaux-Arts Pinceau, at the bottom of the steps. Cobalt violet.”', '“Beaux-Arts Pinceau, al pie de las escaleras. Violeta de cobalto.”') } }],
      theo: [{ label: L('What’s the revue like?', '¿Cómo es la revista?'), say: L('“Feathers, sequins, sixty dancers and one ape on a unicycle. Every night at nine.”', '“Plumas, lentejuelas, sesenta bailarinas y un mono en monociclo. Cada noche a las nueve.”') },
        { label: L('Is there a dress code?', '¿Hay código de vestimenta?'), say: L('“Smart. No trainers. Berets are tolerated.”', '“Elegante. Sin zapatillas. Las boinas se toleran.”') },
        { label: L('Best view in Montmartre?', '¿La mejor vista de Montmartre?'), say: L('“From the terrace at sunset. I go every day before work.”', '“Desde la terraza al atardecer. Voy cada día antes de trabajar.”') },
        { label: L('Put me on the guest list?', '¿Me pones en la lista?'), fn: () => { if (s.met.rosalie && s.met.margot) { s.guest = S.day; setL('“Friends of Margot and Rosalie are friends of mine. Tonight you’re on the list.”', '“Los amigos de Margot y Rosalie son mis amigos. Esta noche estás en la lista.”') } else setL('“Hmm. Get to know the neighbourhood first — Margot on the Tertre, Rosalie at the Lapin.”', '“Hmm. Conoce primero el barrio: Margot en el Tertre, Rosalie en el Lapin.”') } }],
      rosalie: [{ label: L('What do you sing?', '¿Qué cantas?'), say: L('“Old chansons, the ones the grandparents know by heart. The room sings the chorus.”', '“Chansons antiguas, las que los abuelos saben de memoria. La sala canta el estribillo.”') },
        { label: L('What is the Lapin Sage?', '¿Qué es el Lapin Sage?'), say: L('“A pink cottage that has had singers since before the basilica was finished.”', '“Una casita rosa que tiene cantantes desde antes de que se terminara la basílica.”') },
        { label: L('Where do you walk by day?', '¿Por dónde paseas de día?'), say: L('“The vineyard in the morning, the Tertre after lunch. Then I rest my voice.”', '“El viñedo por la mañana, el Tertre después de comer. Luego descanso la voz.”') },
        { label: L('When do you sing tonight?', '¿A qué hora cantas esta noche?'), fn: () => { AV.closePanel('cmp'); goto(MMx.lapin[0], MMx.lapin[1], 'Au Lapin Sage'); AV.toast(tr('“From nine. Sit near the piano.”', '“Desde las nueve. Siéntate cerca del piano.”')) } }]
    }[id];
    TK.open({ id: 'mm_' + id, name: o.p.n + ' · ' + say(o.p.role), first: L('“Bonjour ! Moi, c’est ' + o.p.n + '.”', '“¡Bonjour! Soy ' + o.p.n + '.”'), back: L('“Re-bonjour ! Ça grimpe, hein ?”', '“¡Hola otra vez! Sube mucho, ¿eh?”'), opts: O.map(x => Object.assign({}, x, { label: typeof x.label === 'function' ? x.label() : x.label, say: typeof x.say === 'function' ? x.say() : x.say })) }) }
  MMx.talk = talk;
};
})(window.AV);
