/* APEVERSE - astro9_district2.js : Worlds Reborn §5, Astro-9 metropolis district 2, south of the Central Spiral Plaza:
   ART AVENUE (living paintings that slowly change) →
     CINEMA 9 HALL (west): an indoor film hall, rows of seats, the big screen plays the owner's own films (media.js, tags astro / mv),
       "Take a seat" puts you in a seat facing the screen; the film's sound takes over the room.
     ORBIT LOUNGE (east): a quiet space-jazz club, different from Club Graviton: its own procedural jazz (swung ride cymbal, walking
       bass, soft electric-piano chords; Web Audio, no files), heard only near the lounge, the world music ducks while you're inside.
       A trio on stage, a bar with cocktails, a keys spot to sit in on the jam.
     GLASSOPY OBSERVATORY (south end): a glass dome on a platform; the telescope shows a live, slowly turning view of the sky.
   AV.astro9m2.build(ctx) -> { surface, places }; called from astro9_metro.js. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = Math.PI * 2, L = (e, s) => [e, s];
const D2 = AV.astro9m2 = {};
const AVE = [-7, 7, 112, 200], CIN = [-34, -7, 134, 168], LOU = [7, 32, 136, 164], OBS = { x: 0, z: 214, r: 17 };
const inR = (x, z, r) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];   /* inclusive: shared edges (doors, street joins) stay walkable */
D2.AVE = AVE; D2.CIN = CIN; D2.LOU = LOU; D2.OBS = OBS;
D2.surface = (x, z) => (inR(x, z, AVE) || inR(x, z, CIN) || inR(x, z, LOU) || Math.hypot(x - OBS.x, z - OBS.z) < OBS.r) ? 0 : null;
Object.assign(AV.ITEMS, {
  a9_cosmo: { n: L('Supernova spritz', 'Spritz supernova'), cat: 'drink', ic: '🍸', use: 'drink', model: 'cup', col: 0xff8ad8, fx: { type: 'drink', amt: .2 }, say: L('Fizzes in three colours. The bartender winks with all four eyes.', 'Burbujea en tres colores. El camarero guiña con sus cuatro ojos.'), price: 22 },
  a9_popcorn: { n: L('Zero-g popcorn', 'Palomitas gravedad cero'), cat: 'food', ic: '🍿', use: 'eat', model: 'sack', col: 0xffe8a0, say: L('Each kernel floats for a second before you catch it.', 'Cada palomita flota un segundo antes de que la atrapes.'), price: 8 }
});

/* ---------- Orbit Lounge jazz: a tiny procedural combo (Dm9 - G13 - Cmaj9 - A7alt), 92 BPM swing ---------- */
const A = () => AV.audio || {};
const J = D2.jazz = { on: false, gain: null, next: 0, step: 0, level: 0, bpm: 92 };
const CH = [[50, 53, 57, 60, 64], [43, 53, 57, 59, 64], [48, 52, 55, 59, 62], [45, 55, 58, 61, 65]], BASS = [[38, 41, 45, 48], [31, 35, 38, 41], [36, 40, 43, 47], [33, 37, 40, 43]];
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function jzStart() { const a = A(); if (J.on || !a.ok || !a.ctx) return; const c = a.ctx; J.gain = c.createGain(); J.gain.gain.value = 0; J.gain.connect(a.mediaBus || c.destination); J.on = true; J.next = c.currentTime + .1; J.step = 0 }
function jzStop() { if (!J.on) return; const g = J.gain, c = A().ctx; try { g.gain.setTargetAtTime(0, c.currentTime, .3); setTimeout(() => g.disconnect(), 1500) } catch (e) { } J.on = false; J.gain = null }
function note(t, f, d, type, g, out) { const c = A().ctx, o = c.createOscillator(), e = c.createGain(); o.type = type; o.frequency.value = f; e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .012); e.gain.exponentialRampToValueAtTime(.0005, t + d); o.connect(e); e.connect(out); o.start(t); o.stop(t + d + .05) }
function ride(t, g, out) { const c = A().ctx, n = c.sampleRate * .18 | 0, b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0); for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); const s = c.createBufferSource(), f = c.createBiquadFilter(), e = c.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = 6500; e.gain.value = g; s.connect(f); f.connect(e); e.connect(out); s.start(t) }
function jzSchedule() { if (!J.on) return; const c = A().ctx, beat = 60 / J.bpm; while (J.next < c.currentTime + .25) { const t = J.next, s = J.step, bar = (s >> 2) % 4, b = s % 4;
    note(t, hz(BASS[bar][b]), beat * .9, 'triangle', .5, J.gain);                                   // walking bass
    ride(t, .12, J.gain); if (b % 2 === 1) ride(t + beat * .66, .07, J.gain);                        // swung ride
    if (b === 0 || (b === 2 && Math.random() < .5)) CH[bar].forEach((m, i) => note(t + (b ? beat * .66 : 0) + i * .012, hz(m + 12), beat * 1.7, 'sine', .06, J.gain));   // comping
    if (Math.random() < .35) note(t + beat * (Math.random() < .5 ? 0 : .66), hz(CH[bar][Math.random() * 5 | 0] + 24), beat * .5, 'triangle', .05, J.gain);           // a little melody
    J.next += beat; J.step++ } }
D2.jazzLevel = () => J.level;

D2.build = function (ctx) {
  const K = AV.kit, grp = ctx.group, q = ctx.q, rng = ctx.rng, parts = [], glow = [], T = (x, z, r, label, fn, show) => { const t = { x, z, r, label, fn, show }; ctx.T.push(t); return t };
  const box = (col, x, y, z, sx, sy, sz, gl) => (gl ? glow : parts).push([K.BG.box, col, K.M(x, y, z, sx, sy, sz)]);
  const MOS = [0xff4ad2, 0x4ad8ff, 0xffd84a, 0x7aff8a, 0xc88aff, 0xff8a3a];
  const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const floor = (r, col) => { const m = new THREE.MeshStandardMaterial({ color: lin(col), roughness: .4, metalness: .35 }); m.userData.lin = 1; const f = new THREE.Mesh(new THREE.PlaneGeometry(r[1] - r[0], r[3] - r[2]), m); f.rotation.x = -Math.PI / 2; f.position.set((r[0] + r[1]) / 2, .016, (r[2] + r[3]) / 2); f.receiveShadow = true; grp.add(f) };
  floor(AVE, 0x2a2640); floor(CIN, 0x1a1020); floor(LOU, 0x24162a);
  /* a hall with real walls and one door (doorSide 'e' / 'w'), using ctx.wall so the walls collide */
  const wm = AV.std(0xe0d0e8, .6, .1);
  const hall = (r, h, side, dz) => { const [x0, x1, z0, z1] = r, t = .4, dw = 1.6, dx = side === 'e' ? x1 : x0;
    ctx.wall(x0, x1, z0, z0 + t, 0, h, wm); ctx.wall(x0, x1, z1 - t, z1, 0, h, wm);
    const far = side === 'e' ? x0 : x1; ctx.wall(far - (side === 'e' ? 0 : t), far + (side === 'e' ? t : 0), z0, z1, 0, h, wm);
    ctx.wall(dx - (side === 'e' ? t : 0), dx + (side === 'w' ? t : 0), z0, dz - dw, 0, h, wm); ctx.wall(dx - (side === 'e' ? t : 0), dx + (side === 'w' ? t : 0), dz + dw, z1, 0, h, wm); ctx.wall(dx - (side === 'e' ? t : 0), dx + (side === 'w' ? t : 0), dz - dw, dz + dw, 2.8, h, wm, false);
    box(0x2a2440, (x0 + x1) / 2, h + .15, (z0 + z1) / 2, x1 - x0 + .6, .3, z1 - z0 + .6);
    /* street facade: mosaic bands, ribbed pillars and glowing arched windows (outside face only) */
    const fx = side === 'e' ? x1 + .25 : x0 - .25, L2 = z1 - z0;
    [[.6, 0], [h - .5, 2], [3.4, 4]].forEach(([y, c]) => box(MOS[c], fx, y, (z0 + z1) / 2, .1, .22, L2, true));
    for (let z = z0 + 1; z <= z1 - 1; z += 3.2) { box(0x3a3058, fx, h / 2, z, .3, h, .5); if (Math.abs(z + 1.6 - dz) > 2.6) { box(MOS[(z | 0) % 6], fx + (side === 'e' ? .05 : -.05), 2.2, z + 1.6, .08, 1.6, 1.1, true); glow.push([new THREE.TorusGeometry(.55, .07, 5, 12, Math.PI), MOS[((z | 0) + 2) % 6], K.M(fx, 3, z + 1.6, 1, 1, 1, 0, Math.PI / 2, 0)]) } }
    glow.push([new THREE.TorusGeometry(dw + .3, .14, 6, 18, Math.PI), side === 'e' ? 0xff4ad2 : 0x7ff0ff, K.M(fx, 2.6, dz, 1, 1.1, 1, 0, Math.PI / 2, 0)]); };
  /* ---------- Art Avenue: railings + living paintings (canvas textures that slowly morph) ---------- */
  for (let z = AVE[2] + 6; z < AVE[3]; z += 2.5) for (const sx of [AVE[0], AVE[1]]) { if ((AV.astro9art && AV.astro9art.gap(sx, z)) || (AV.astro9streets && AV.astro9streets.gap(sx, z))) continue; if (z > CIN[2] && z < CIN[3] && sx < 0) continue; if (z > LOU[2] && z < LOU[3] && sx > 0) continue; box(0x8a90b0, sx, .5, z, .08, 1, .08); box(MOS[(z / 2.5 | 0) % 6], sx, 1.02, z, .1, .06, 2.5, true) }
  ctx.sign('ART AVENUE · CINEMA 9 · ORBIT LOUNGE · GLASSOPY', 0, 7.5, 119, Math.PI, 11, '#7ff0ff', { posts: true });
  const paint = [], pg = new THREE.PlaneGeometry(1, 1);
  for (let k = 0; k < 6; k++) { const side = k % 2 ? 1 : -1, z = 172 + (k >> 1) * 9, cv = document.createElement('canvas'); cv.width = cv.height = 128; const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
    const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); m.scale.set(3.2, 2.4, 1); m.position.set(side * 6.4, 2.4, z); m.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; grp.add(m);
    box(0x1a1428, side * 6.75, 2.4, z, .2, 2.9, 3.7); box(0x8a90b0, side * 6.75, .9, z, .12, 1.8, .12); paint.push({ cv, tx, k, seed: rng() * 100 });
    T(side * 5.2, z, 2, () => tr('🎨 Living painting #', '🎨 Cuadro vivo n.º ') + (k + 1), () => AV.toast(AV.pick([tr('The colours rearrange themselves while you look. The artist, Lyx, says it paints the mood of whoever watches.', 'Los colores se reordenan mientras miras. La artista, Lyx, dice que pinta el ánimo de quien la mira.'), tr('A spiral slowly unfolds into a whale, then into a city. Then back.', 'Una espiral se despliega en una ballena, luego en una ciudad. Y vuelta.'), tr('It hums very quietly. Paintings here do that.', 'Zumba muy bajito. Aquí los cuadros hacen eso.')]))) }
  const drawPaint = (p, t) => { const c = p.cv.getContext('2d'), w = 128; c.fillStyle = '#0c0818'; c.fillRect(0, 0, w, w); for (let i = 0; i < 14; i++) { const a = t * .15 + i * .7 + p.seed, r = 18 + 34 * Math.abs(Math.sin(t * .05 + i + p.k)); c.fillStyle = 'hsla(' + ((t * 8 + i * 26 + p.k * 60) % 360) + ',85%,60%,.55)'; c.beginPath(); c.arc(64 + Math.cos(a) * r, 64 + Math.sin(a * 1.3) * r, 8 + 10 * Math.abs(Math.sin(a)), 0, TAU); c.fill() } p.tx.needsUpdate = true };
  /* ---------- Cinema 9 hall (door on its east wall, onto the avenue) ---------- */
  hall(CIN, 7, 'e', 151); ctx.sign('CINEMA 9', -7.2, 7.2, 151, Math.PI / 2, 6, '#ff4ad2', {});
  const scr = AV.media && AV.media.cinemaScreen ? AV.media.cinemaScreen(ctx, CIN[0] + .7, 3.6, 151, Math.PI / 2, 12, { radius: 20, name: 'CINEMA 9 · ART AVENUE', tags: ['astro', 'mv'], shorts: true, glow: 0xff4ad2 }) : null;
  const seats = []; for (let row = 0; row < 5; row++) { const x = CIN[0] + 9 + row * 3; box(0x3a1428, x, .3, 151, .9, .6, 16, false); box(0x5a1a3a, x + .35, .75, 151, .2, .9, 16); ctx.cols.push([x - .45, x + .55, 143.5, 158.5]); for (let s = -3; s <= 3; s++) seats.push([x - .9, 151 + s * 2.2]) }
  for (const z of [CIN[2] + 2, CIN[3] - 2]) for (let x = CIN[0] + 4; x < CIN[1] - 2; x += 5) box(0xff4ad2, x, 5.5, z, .3, .3, .3, true);
  T(CIN[1] - 3, 151, 2.4, () => tr('🎬 Cinema 9: take a seat', '🎬 Cinema 9: sentarse'), () => { const s = seats[(seats.length / 2) | 0], P = AV.P; P.x = s[0]; P.z = s[1]; P.vx = P.vz = 0; P.yaw = Math.PI / 2; P.pitch = .05; AV.toast(scr && scr.list.length ? tr('Lights down. The film starts on the big screen.', 'Se apagan las luces. La película empieza en la pantalla.') : tr('No films supplied yet: the screen shows the Cinema 9 loop.', 'Aún no hay películas: la pantalla muestra el bucle de Cinema 9.')) });
  T(CIN[1] - 3, 145, 2, () => tr('🍿 Popcorn counter', '🍿 Palomitas'), () => AV.shop && AV.shop.open({ id: 'a9_popcorn', name: L('Cinema 9 snacks', 'Snacks Cinema 9'), greet: L('“Zero-g popcorn: catch it before it drifts into row three.”', '“Palomitas gravedad cero: atrápalas antes de que lleguen a la fila tres.”'), items: [['a9_popcorn', 8], ['water', 10]] }));
  /* ---------- Orbit Lounge (door on its west wall) ---------- */
  hall(LOU, 6, 'w', 150); ctx.sign('ORBIT LOUNGE · space jazz', 7.2, 6.8, 150, -Math.PI / 2, 6.5, '#7ff0ff', {});
  box(0x3a2a40, LOU[1] - 3, .35, 150, 5, .7, 12); box(0x4a3a2a, LOU[0] + 8, .55, LOU[2] + 2, 9, 1.1, .8); ctx.cols.push([LOU[1] - 5.5, LOU[1], 144, 156], [LOU[0] + 3.5, LOU[0] + 12.5, LOU[2] + 1.6, LOU[2] + 2.4]);
  for (const [tx, tz] of [[14, 146], [14, 154], [20, 150], [20, 158]]) { parts.push([K.BG.cyl, 0x1a1a22, K.M(tx, .4, tz, .7, .08, .7)]); parts.push([K.BG.cyl, 0x8a90b0, K.M(tx, .2, tz, .07, .4, .07)]); glow.push([K.BG.sph, 0x7ff0ff, K.M(tx, .55, tz, .12, .12, .12)]); ctx.circles.push([tx, tz, .8]) }
  for (let k = 0; k < 9; k++) glow.push([K.BG.sph, [0x4ad8ff, 0xc88aff, 0xffd84a][k % 3], K.M(LOU[0] + 3 + k * 2.8, 5.2, LOU[3] - 1.5, .2, .2, .2)]);
  const ll = new THREE.PointLight(0x7a6aff, 1.2, 22); ll.position.set(20, 4.5, 150); grp.add(ll);
  T(LOU[0] + 8, LOU[2] + 3.6, 2.2, () => tr('🍸 Orbit Lounge bar', '🍸 Barra del Orbit Lounge'), () => AV.shop && AV.shop.open({ id: 'a9_lounge', name: L('Orbit Lounge', 'Orbit Lounge'), greet: L('The bartender (four eyes, all half-closed, very relaxed): “Quiet night. Good music. What can I pour you?”', 'El camarero (cuatro ojos, todos entornados, muy relajado): “Noche tranquila. Buena música. ¿Qué te sirvo?”'), items: [['a9_cosmo', 22], ['a9_nebula_tea', 14], ['beer', 18]] }));
  if (AV.beings && AV.beings.spawn) { const keep = AV.beings.list; try { AV.beings.spawn(ctx, [{ kind: 'alien', x: LOU[1] - 2.5, y: .7, z: 147, yaw: -Math.PI / 2, mode: 'idle', name: 'Vel (keys)', seed: 9301 }, { kind: 'ape', x: LOU[1] - 2.5, y: .7, z: 150, yaw: -Math.PI / 2, mode: 'idle', name: 'Bassman Gorr', seed: 9302 }, { kind: 'alien', x: LOU[1] - 2.5, y: .7, z: 153, yaw: -Math.PI / 2, mode: 'idle', name: 'Tik (drums)', seed: 9303 }, { kind: 'human', x: 15, y: 0, z: 147.5, yaw: 0, mode: 'idle', seed: 9304 }, { kind: 'alien', x: 21, y: 0, z: 151.5, yaw: Math.PI, mode: 'idle', seed: 9305 }]); AV.beings.list = (keep || []).concat(AV.beings.list || []) } catch (e) { } }
  /* ---------- Glassopy Observatory ---------- */
  const om = new THREE.MeshStandardMaterial({ color: lin(0x2a2846), roughness: .35, metalness: .5 }); om.userData.lin = 1; const of = new THREE.Mesh(new THREE.CircleGeometry(OBS.r, 48), om); of.rotation.x = -Math.PI / 2; of.position.set(OBS.x, .015, OBS.z); grp.add(of);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 16, 0, TAU, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa8e0ff, transparent: true, opacity: .16, roughness: .05, metalness: .3, side: THREE.DoubleSide, depthWrite: false })); dome.position.set(OBS.x, 0, OBS.z + 2); grp.add(dome);
  glow.push([new THREE.TorusGeometry(9, .12, 6, 48), 0x7ff0ff, K.M(OBS.x, .1, OBS.z + 2, 1, 1, 1, Math.PI / 2, 0, 0)]);
  const scope = new THREE.Group(); scope.position.set(OBS.x, 0, OBS.z + 2); grp.add(scope); { const m = AV.std(0xd8dce8, .3, .6), base = new THREE.Mesh(AV.G.cyl, m); base.scale.set(.5, 1.4, .5); base.position.y = .7; scope.add(base); const tube = new THREE.Mesh(AV.G.cyl, m); tube.scale.set(.32, 3, .32); tube.position.set(0, 2, -.6); tube.rotation.x = -.7; scope.add(tube) } ctx.circles.push([OBS.x, OBS.z + 2, .8]);
  ctx.sign('THE GLASSOPY · observatory', OBS.x, 5.5, OBS.z - OBS.r + 1, Math.PI, 7, '#7ff0ff', { posts: true });
  T(OBS.x, OBS.z - .5, 2.4, () => tr('🔭 Look through the Glassopy telescope', '🔭 Mirar por el telescopio Glassopy'), () => D2.telescope());
  D2.telescope = () => { const p = AV.panel('cmp', '<b>🔭 ' + tr('Glassopy telescope', 'Telescopio Glassopy') + '</b><canvas id="a9sky" width="520" height="320" style="width:100%;border-radius:8px;background:#000"></canvas><div class="note" id="a9skyN"></div><button data-close>' + tr('Close', 'Cerrar') + '</button>'), c = p.querySelector('#a9sky').getContext('2d'), r = AV.rng(AV.S.day * 13 + 7);
    const PL = [[tr('the ringed giant Kepler-Ape b', 'el gigante anillado Kepler-Ape b'), '#e8c890', 1], [tr('the twin moons of Groove Prime', 'las lunas gemelas de Groove Prime'), '#9ad8ff', 2], [tr('the Bassline Nebula', 'la Nebulosa del Bajo'), '#ff6ad5', 0]], pick = PL[AV.S.day % 3];
    const draw = t => { if (!p.isConnected || getComputedStyle(p).display === 'none') return; c.fillStyle = '#02010a'; c.fillRect(0, 0, 520, 320); const rr = AV.rng(5);
      for (let i = 0; i < 320; i++) { const x = (rr() * 520 + t * 3) % 520, y = rr() * 320, s = rr() * 1.6; c.fillStyle = 'rgba(255,255,255,' + (.4 + .6 * Math.abs(Math.sin(t + i))).toFixed(2) + ')'; c.fillRect(x, y, s, s) }
      if (pick[2] === 0) { for (let i = 0; i < 60; i++) { c.fillStyle = 'hsla(' + (300 + i * 2) + ',90%,60%,.05)'; c.beginPath(); c.arc(260 + Math.cos(i + t * .1) * 60, 160 + Math.sin(i * 1.7) * 40, 40 + i, 0, TAU); c.fill() } }
      else { c.fillStyle = pick[1]; c.beginPath(); c.arc(260, 160, 62, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(285, 150, 62, 0, TAU); c.fill(); if (pick[2] === 1) { c.strokeStyle = 'rgba(232,200,144,.8)'; c.lineWidth = 6; c.beginPath(); c.ellipse(260, 160, 120, 26, -.25, 0, TAU); c.stroke() } else { c.fillStyle = '#e8f0ff'; c.beginPath(); c.arc(260 + Math.cos(t * .4) * 110, 160 + Math.sin(t * .4) * 30, 12, 0, TAU); c.fill() } }
      requestAnimationFrame(() => draw(t + .016)) };
    p.querySelector('#a9skyN').textContent = tr('Tonight the Glassopy is pointed at ', 'Esta noche el Glassopy apunta a ') + pick[0] + tr('. It changes every day.', '. Cambia cada día.'); draw(0); AV.vitals && AV.vitals.add(0, 3) };
  /* ---------- merge, animation, lounge jazz ---------- */
  grp.add(new THREE.Mesh(K.merge(parts), K.floraMat(0, { rough: .5, metal: .25 }))); const gm = new THREE.MeshBasicMaterial({ vertexColors: true }); gm.userData.lin = 1; grp.add(new THREE.Mesh(K.merge(glow), gm));
  let pt = 0; const LC = [(LOU[0] + LOU[1]) / 2, (LOU[2] + LOU[3]) / 2];
  ctx.upd.push((dt, t) => { if ((pt += dt) > .25) { pt = 0; paint.forEach(p => drawPaint(p, t)) } scope.rotation.y = Math.sin(t * .05) * .6;
    const P = AV.P, inside = inR(P.x, P.z, LOU), d = Math.hypot(P.x - LC[0], P.z - LC[1]), want = AV.W && AV.W.id === 'astro9' && !AV.audio.hold ? (inside ? 1 : Math.max(0, 1 - (d - 12) / 18)) : 0;
    if (want > .01 && !J.on) jzStart(); if (J.on) { J.level += (want - J.level) * Math.min(1, dt * 2); try { J.gain.gain.value = J.level * .5 * (AV.audio.mute ? 0 : 1) } catch (e) { } jzSchedule(); if (want <= .01 && J.level < .02) jzStop() } });
  ctx.leave.push(() => { jzStop(); J.level = 0 });
  if (AV.media) AV.media.extraDuck = () => AV.W && AV.W.id === 'astro9' ? Math.min(1, J.level * 1.2) : 0;
  return { places: [{ id: 'm2_ave', name: L('Art Avenue', 'Avenida del Arte'), x: 0, z: 126, yaw: Math.PI }, { id: 'm2_cinema', name: L('Cinema 9 hall', 'Sala Cinema 9'), x: -9, z: 151, yaw: Math.PI / 2 }, { id: 'm2_lounge', name: L('Orbit Lounge (space jazz)', 'Orbit Lounge (jazz espacial)'), x: 9, z: 150, yaw: -Math.PI / 2 }, { id: 'm2_obs', name: L('Glassopy Observatory', 'Observatorio Glassopy'), x: 0, z: 200, yaw: Math.PI }] };
};
addEventListener('load', () => { if (AV.act && AV.act.PLACES) AV.act.PLACES.astro9 = (AV.act.PLACES.astro9 || []).concat([{ type: 'instspot', kind: 'keys', x: 24, z: 160, name: ['Orbit Lounge jam', 'jam del Orbit Lounge'] }]) });
})(window.AV);
