/* APEVERSE 2.2 NEW WORLDS - tokyo_shinjuku.js : TOKYO district 3 = SHINJUKU, built to the interconnected-city standard from the start.
   Continuous on foot with Harajuku: north through the forest shrine, round its hall, out of the north torii and up the same avenue;
   and one more stop on the Loop Line.  Inside, a grid of loops:
     the avenue (x -10..10) north to the north street; Yasukuni-dori (z -712..-700) crossing it; KABUKICHO north-west of the crossing:
     the Ichibangai lane (x -84..-76), cross streets K1 (z -780..-772) and K2 (z -850..-842), the north street (z -908..-900); GOLDEN GAI:
     three tiny bar lanes from Yasukuni up to K1; OMOIDE YOKOCHO along the tracks to the station's north passage + east plaza
     ("Studio Ape" screen); a south grid (Sanchome street) between the forest and Yasukuni; the west Shinjuku skyscraper skyline.
   Businesses (fictional): Game Center GIGA APE (walk-in), Don Banana discount store (walk-in), Mecha Cabaret NEON-BOT (robot show,
   20:00-24:00), Tsukemen Kaze, Capsule Hotel Hachi (sleep till 08:00), Kabukicho batting center, three Golden Gai bars, Omoide yakitori.
   Named: Hiro (Golden Gai bartender), Aoi (robot-show performer), Takeshi (batting coach).  Story: "Aoi's spare battery".
   Plugs into world_tokyo.js (TKY.sjSurf, TKY.shinjuku) and tokyo_life.js (TKY.shinjukuLife). */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]), TAU = Math.PI * 2, PI = Math.PI;
const TKY = AV.tokyo; if (!TKY || !TKY.kit) return;
const SJ = { stats: {} }; TKY.sj = SJ;
const X0 = -210, X1 = 120, Z0 = -950, Z1 = -604;
TKY.sjSurf = (x, z) => { if (x < X0 - 1 || x > X1 + 1 || z < Z0 - 1 || z > Z1) return undefined; if (x < X0 || x > X1 || z < Z0) return null; return 0 };
SJ.Z1 = Z1;

/* ======================= its own sign atlas (Tokyo's main atlas is full) ======================= */
const SG = { r: {} }; SJ.SG = SG;
const K2 = TKY.kit, F = K2.fas, JP = '"Yu Gothic", "Meiryo", "Hiragino Sans", "Noto Sans JP", sans-serif';
const SIGNS = [
  ['st_shinjuku', 1024, 128, (g, w, h) => { g.fillStyle = '#1a1a1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#3aa84a'; g.fillRect(0, h - 14, w, 14); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; K2.fit(g, '新宿  SHINJUKU  STATION', w - 80, 72, '900 #px ' + JP, 58, w / 2) }],
  ['kabuki', 1024, 160, (g, w, h) => { g.fillStyle = '#0a0a1a'; g.fillRect(0, 0, w, h); for (let x = 14; x < w; x += 24) { g.fillStyle = ['#ff4ab0', '#4ad8ff', '#ffe14a'][(x / 24 | 0) % 3]; g.beginPath(); g.arc(x, 10, 5, 0, TAU); g.arc(x, h - 10, 5, 0, TAU); g.fill() } g.shadowColor = '#ff2a6a'; g.shadowBlur = 18; g.fillStyle = '#ffd8e8'; g.textAlign = 'center'; g.textBaseline = 'middle'; K2.fit(g, '歌舞伎町 一番街', w - 100, 76, '900 #px ' + JP, 66, w / 2); g.shadowColor = '#4ad8ff'; g.fillStyle = '#c8f4ff'; K2.fit(g, 'KABUKICHO · ICHIBANGAI', w - 160, 28, '800 #px Arial, sans-serif', 128, w / 2); g.shadowBlur = 0 }],
  ['goldengai', 640, 128, F('ゴールデン街', 'GOLDEN GAI · 200 tiny bars', '#1a1a1a', '#f2c230', '#d82a2a', { serif: true })],
  ['omoide', 640, 128, F('思い出横丁', 'OMOIDE YOKOCHO · memory lane', '#3a1a10', '#ffd8a0', '#d82a2a', { serif: true })],
  ['robot', 640, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#ff2ad8', '#2ad8ff', '#ffe14a', '#2aff8a'].forEach((c, i) => gr.addColorStop(i / 3, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#0a0a1a'; g.fillRect(10, 10, w - 20, h - 20); g.shadowColor = '#ff2ad8'; g.shadowBlur = 20; g.fillStyle = '#ffb0f0'; g.textAlign = 'center'; g.textBaseline = 'middle'; K2.fit(g, 'MECHA CABARET NEON-BOT', w - 60, 52, '900 #px Arial Black, Arial, sans-serif', 64, w / 2); g.shadowColor = '#2ad8ff'; g.fillStyle = '#b0f4ff'; K2.fit(g, 'ロボットショー · 20:00 · 22:00', w - 80, 26, '800 #px ' + JP, 122, w / 2); g.shadowBlur = 0 }],
  ['giga', 640, 128, F('GIGA APE', 'GAME CENTER · ゲームセンター · 6F', '#1a0a3a', '#ffe14a', '#ff4ad2', { neon: '#ffb000', grad: ['#3a0a6a', '#0a2a6a'] })],
  ['donbanana', 640, 128, (g, w, h) => { g.fillStyle = '#ffe14a'; g.fillRect(0, 0, w, h); g.fillStyle = '#d82a2a'; g.fillRect(0, h - 22, w, 22); g.fillStyle = '#1a1a1a'; g.textAlign = 'center'; g.textBaseline = 'middle'; K2.fit(g, 'ドン・バナナ DON BANANA', w - 60, 62, '900 #px ' + JP, 52, w / 2); g.fillStyle = '#ffffff'; K2.fit(g, '激安 · EVERYTHING, ALL NIGHT', w - 80, 16, '900 #px Arial, sans-serif', h - 11, w / 2) }],
  ['tsukemen', 448, 112, F('つけ麺 風', 'TSUKEMEN KAZE', '#1a1a1a', '#f4f0e0', '#d82a2a', { serif: true })],
  ['capsule', 448, 112, F('カプセルホテル 蜂', 'CAPSULE HOTEL HACHI · ¥/night', '#f4f4f6', '#1a3a6a', '#f2c230')],
  ['batting', 640, 128, F('バッティングセンター', 'BATTING CENTER · 80-140 km/h', '#2a5a2a', '#ffffff', '#ffe14a')],
  ['gg1', 320, 96, F('Bar くらげ', 'KURAGE', '#1a2a4a', '#9ad8ff', '#9ad8ff', { neon: '#4ad8ff' })],
  ['gg2', 320, 96, F('Bar 猿ノワール', 'APE NOIR', '#1a1a1a', '#f4d84a', '#f4d84a', { serif: true })],
  ['gg3', 320, 96, F('Bar 深海', 'SHINKAI', '#0a1a2a', '#7affd8', '#7affd8', { neon: '#2affb0' })],
  ['om_tori', 448, 112, F('焼き鳥 煙', 'YAKITORI KEMURI', '#1a1a1a', '#ffd84a', '#d82a2a', { serif: true })],
  ['studioape', 640, 128, F('STUDIO APE', 'スタジオ・エイプ · 新宿東口', '#101014', '#ffffff', '#ff4ab0')],
  ['mecha', 448, 112, F('シネマ メカ', 'CINEMA MECHA · 8 screens', '#1a1a1a', '#ff4a2a', '#ff4a2a')]];
const atlas = () => K2.makeAtlas(SIGNS, SG, 2048, 1024);

/* ======================= build ======================= */
TKY.shinjuku = function (ctx, E) {
  const K = AV.kit, BG = K.BG, rng = ctx.rng, grp = ctx.group, cols = ctx.cols, circ = ctx.circles, { row, fill, box, sign, P, Gl, Gs, sh, SPECIAL, interior, bx2, IN, torii } = E;
  const Q2 = [], sign2 = (k, x, y, z, w, h, ry, dbl) => { Q2.push({ k, x, y, z, w, h, ry }); if (dbl) Q2.push({ k, x: x - Math.sin(ry) * .03, y, z: z - Math.cos(ry) * .03, w, h, ry: ry + PI }) };
  /* ---------- the forest continues north: round the hall, a north torii ---------- */
  box(P, 0xc8c0b0, -22, -14, 0, .03, -562, -544); box(P, 0xc8c0b0, 14, 22, 0, .03, -562, -544); box(P, 0xc8c0b0, -6, 6, 0, .03, -604, -560); box(P, 0xc8c0b0, -22, 22, 0, .03, -566, -560);
  for (let z = -566; z > -604; z -= 7) for (const x of [-56, -44, -30, -18, 18, 30, 44, 56]) { if (Math.abs(x) < 20 && z > -580) continue; if (Math.abs(x) < 10) continue; const xx = x + (rng() - .5) * 3; P.push([BG.cone, [0x24401e, 0x2e4a24][(rng() * 2) | 0], K.M(xx, 8, z, 2.6, 16, 2.6), 0]); box(P, 0x3a2a1e, xx - .3, xx + .3, 0, 2.4, z - .3, z + .3); circ.push([xx, z, .5]) }
  box(P, 0x4a5a3a, -60, 60, -.03, -.006, -606, -560); torii(0, -602, 1.6, PI, 'jingu'); cols.push([-62, -60, -604, -482], [60, 62, -604, -482]);
  /* ---------- ground, the avenue, Yasukuni-dori, the viaduct continues ---------- */
  box(P, 0x9a968e, X0, X1, -.03, -.005, Z0, Z1); box(P, 0x2e2f33, -10, 10, 0, .03, Z0, -612); box(P, 0x2e2f33, -200, 96, 0, .03, -712, -700);
  for (const x of [-10.1, 9.9]) { box(P, 0xb0b0ac, x, x + .2, 0, .14, Z0, -718); box(P, 0xb0b0ac, x, x + .2, 0, .14, -694, -612) } for (const z of [-712.1, -700.1]) { box(P, 0xb0b0ac, -200, -16, 0, .14, z, z + .2); box(P, 0xb0b0ac, 16, 96, 0, .14, z, z + .2) }
  for (let x = -9.5; x < 9.5; x += 1.1) { box(P, 0xe8e8e4, x, x + .55, .03, .045, -717.5, -713); box(P, 0xe8e8e4, x, x + .55, .03, .045, -699, -694.5) } for (let z = -711.5; z < -700.5; z += 1.1) { box(P, 0xe8e8e4, -15.5, -11, .03, .045, z, z + .55); box(P, 0xe8e8e4, 11, 15.5, .03, .045, z, z + .55) }
  const DECK = TKY.DECK; box(P, 0x9a9890, 99, 115, DECK - .8, DECK, Z0, Z1); for (const x of [99, 114.6]) box(P, 0x8a8880, x, x + .4, DECK, DECK + 1.1, Z0, Z1); for (const tx of TKY.TRACK) { box(P, 0x5a5048, tx - 1.3, tx + 1.3, DECK, DECK + .12, Z0, Z1); for (const s of [-.72, .72]) box(P, 0x9a9aa0, tx + s - .05, tx + s + .05, DECK + .12, DECK + .25, Z0, Z1) }
  for (let z = Z0 + 8; z < Z1; z += 16) { box(P, 0x8a8880, 100, 101.4, 0, DECK - .8, z - .7, z + .7); box(P, 0x8a8880, 112.6, 114, 0, DECK - .8, z - .7, z + .7) } box(P, 0x6a5a50, 100, 100.6, 0, DECK - .8, Z0, Z1); cols.push([100, X1 + 2, Z0, Z1]);
  /* lanes paving */
  for (const r of [[-84, -76, -908, -718], [-186, -16, -780, -772], [-158, -16, -850, -842], [-158, -16, -908, -900], [-158, -150, -908, -772], [-182, -178, -780, -718], [-170, -166, -780, -718], [-158, -154, -780, -718], [84, 90, -770, -718], [52, 90, -770, -760], [-200, -16, -660, -652], [-108, -100, -694, -660], [-200, -192, -700, -652]]) box(P, 0x7a7068, r[0], r[1], 0, .02, r[2], r[3]);
  /* ---------- the specials ---------- */
  for (const s of [['giga', 'ibW', -742, 12, 10], ['robot', 'ibE', -800, 14], ['tsukemen', 'ibE', -736, 7], ['donbanana', 'yaN', -50, 14, 11], ['capsule', 'k1S', -120, 9], ['gg1', 'ggA', -742, 4], ['gg2', 'ggB', -748, 4], ['gg3', 'ggC', -738, 4], ['om_tori', 'om', -740, 5]]) SPECIAL.push(s);
  const KB = { h0: 12, hr: 16, wmin: 5, wmax: 9, bladeP: .8, billP: .45 }, YA = { h0: 14, hr: 18, wmin: 6, wmax: 10, bladeP: .55, billP: .35 }, LOW = { h0: 8, hr: 8, wmin: 5, wmax: 8, bladeP: .45, billP: .1 };
  /* the avenue's two sides (rows stop at every cross street) */
  for (const [z0, z1] of [[-900, -850], [-842, -806], [-772, -718], [-694, -660], [-652, -612]]) row('svW', 'z', -16, z0, z1, 1, 12, YA);
  for (const [z0, z1] of [[-904, -872], [-758, -718], [-694, -612]]) row('svE', 'z', 16, z0, z1, -1, 12, YA);
  /* Yasukuni-dori: the north side leaves the three Golden Gai lanes open; a west edge lane (x -200..-192) links it to Sanchome */
  for (const [x0, x1] of [[-192, -182], [-178, -170], [-166, -158], [-154, -84], [-76, -28]]) row('yaN', 'x', -718, x0, x1, 1, 12, x1 - x0 < 12 ? LOW : YA); row('yaN', 'x', -718, 28, 76, 1, 12, YA);
  for (const [x0, x1] of [[-192, -108], [-100, -28], [28, 96]]) row('yaS', 'x', -694, x0, x1, -1, 12, YA);
  /* Kabukicho: Ichibangai (x -84..-76) + K1 (z -780..-772) + K2 (z -850..-842) + the north street (z -908..-900) + a west lane (x -158..-150) */
  for (const [z0, z1] of [[-888, -850], [-842, -780], [-772, -730]]) { row('ibW', 'z', -84, z0, z1, 1, 12, KB); row('ibE', 'z', -76, z0, z1, -1, 12, KB) }
  for (const [x0, x1] of [[-150, -96], [-64, -40]]) { row('k1N', 'x', -780, x0, x1, 1, 12, KB); row('k1N', 'x', -850, x0, x1, 1, 12, KB); row('k2S', 'x', -842, x0, x1, -1, 12, KB) }
  for (const [x0, x1] of [[-150, -96], [-64, -40]]) row('k1S', 'x', -772, x0, x1, -1, 12, KB);
  row('nS', 'x', -900, -150, -28, -1, 12, Object.assign({ gaps: [[-85, -75]] }, KB)); row('nN', 'x', -908, -158, -70, 1, 12, LOW); row('nN', 'x', -908, -26, -16, 1, 12, LOW);
  fill(-150, -96, -830, -792, 14, 20); fill(-64, -40, -830, -792, 14, 20); fill(-40, -28, -842, -806, 14, 16); fill(-150, -96, -888, -862, 14, 20); fill(-64, -28, -888, -862, 14, 20); fill(-150, -96, -760, -730, 12, 16); fill(-64, -28, -760, -730, 12, 16);
  fill(-200, -158, -950, -780, 10, 14); fill(-200, -186, -772, -730, 8, 6); fill(-200, -192, -730, -718, 8, 4); fill(-16, 16, -950, -912, 4, 2);
  /* the Mecha-Ape cinema tower (x -40..-16, z -806..-780) with a giant robot head on its roof */
  { box(P, 0x3a3e46, -40, -16, 0, 34, -806, -780); for (let y = 6; y < 33; y += 3.4) box(Gl, y % 2 > 1 ? 0xd8ecff : 0xffe2b0, -39.5, -16.5, y, y + 2, -779.95, -779.9); cols.push([-40, -16, -806, -780]); sign2('mecha', -28, 4.4, -779.8, 10, 2.5, 0);
    box(P, 0x8a9098, -34, -22, 34, 44, -800, -788); box(P, 0x5a6068, -35, -21, 40, 42, -801, -787); box(Gl, 0xff2a2a, -32, -24, 38.5, 40.5, -787.9, -787.8); box(P, 0x8a9098, -29, -27, 44, 50, -795, -793); P.push([BG.sph, 0xff4a2a, K.M(-28, 50.6, -794, .9, .9, .9), 1]); for (const s of [-1, 1]) box(P, 0x5a6068, -28 + s * 6.5 - .8, -28 + s * 6.5 + .8, 36, 42, -796, -792) }
  /* Golden Gai: three tiny lanes of two-storey bar huts between Yasukuni and K1 */
  const GH = { hut: true, wmin: 3.05, wmax: 3.8, h0: 4.8, hr: 1.2, shopP: 1, noSign: true };
  for (const [id, x0, x1] of [['ggA', -182, -178], ['ggB', -170, -166], ['ggC', -158, -154]]) { row(id, 'z', x0, -772, -730, 1, 4, GH); row(id, 'z', x1, -772, -730, -1, 4, GH) }
  for (const x of [-180, -168, -156]) for (let z = -776; z < -722; z += 2.5) box(Gl, (z | 0) % 2 ? 0xff5a3a : 0xffd0a0, x - .15, x + .15, 3.3, 3.6, z - .15, z + .15);
  sign2('goldengai', -168, 6.2, -718.2, 7, 1.4, 0, true); for (const x of [-182.5, -153.5]) box(P, 0x2a1a10, x - .2, x + .2, 0, 6, -718.4, -718); box(P, 0x2a1a10, -182.5, -153.5, 5.4, 5.8, -718.4, -718);
  /* the Kabukicho gate over Ichibangai + neon canopy */
  { for (const x of [-84.3, -75.7]) box(P, 0x2a2a3a, x - .2, x + .2, 0, 8, -718.6, -718.2); box(P, 0x2a2a3a, -85, -75, 7.6, 9.6, -718.7, -718.1); sign2('kabuki', -80, 8.6, -717.95, 9.6, 1.5, 0, true); for (let z = -722; z > -898; z -= 6) box(Gl, [0xff4ab0, 0x4ad8ff, 0xffe14a][((-z / 6) | 0) % 3], -83.6, -76.4, 6.4, 6.6, z - .15, z + .15) }
  /* Omoide Yokocho: smoky huts along the tracks; the station's north passage */
  row('om', 'z', 84, -760, -718, 1, 8, { hut: true, wmin: 3.2, wmax: 4.4, h0: 4.6, hr: 1.2, shopP: 1, noSign: true }); row('omE', 'z', 90, -760, -718, -1, 8, { hFix: 4.6, wmin: 4.5, wmax: 6, style: 'concrete', col: 0x7a5a4a, noBlade: true, gf: 4.2, shopP: .85, gen: ['g_bar', 'g_yakiniku', 'g_udon'] });
  sign2('omoide', 87, 4.8, -717.9, 5.6, 1.12, 0, true); for (let z = -722; z > -768; z -= 2.5) box(Gl, (z | 0) % 2 ? 0xff5a3a : 0xffa04a, 86.8, 87.2, 3.5, 3.9, z - .2, z + .2);
  fill(28, 76, -760, -730, 12, 14);
  /* Shinjuku station (x 52..100, z -830..-770) + its east plaza (x 16..52) + "Studio Ape" with a big screen */
  { box(P, 0xc8c4bc, 52, 100, 0, 9, -830, -770); box(Gl, 0xd8ecff, 52, 52.1, 1, 8, -826, -774); for (let z = -826; z < -774; z += 4) box(P, 0x5a5e64, 51.9, 52, 0, 8.6, z, z + .3); cols.push([52, 100, -830, -770]); sign2('st_shinjuku', 51.6, 10.4, -800, 16, 2, -PI / 2);
    box(P, 0xb8b4ac, 105.6, 108.4, DECK, DECK + 1.05, -830, -770); box(P, 0x5a5e64, 104.6, 109.4, DECK + 4.4, DECK + 4.6, -830, -770); SJ.station = [48.6, -800];
    box(P, 0x2a2e36, 16, 52, 0, 26, -872, -852); box(P, 0x101012, 18, 50, 9, 22, -851.9, -851.6); sign2('studioape', 34, 4.6, -851.8, 12, 2.4, 0); cols.push([16, 52, -872, -852]); SJ.screenAt = [34, 15.5, -851.5, 30, 12];
  }
  fill(52, 100, -872, -830, 16, 22); fill(28, 100, -950, -872, 18, 26); fill(16, 28, -950, -904, 18, 8);
  /* the south grid (Sanchome): a street between the forest edge and Yasukuni, a cross lane, the west edge lane */
  for (const [x0, x1] of [[-192, -108], [-100, -28]]) { row('s1N', 'x', -660, x0, x1, 1, 8, LOW); row('s1S', 'x', -652, x0, x1, -1, 12, LOW) } row('s2W', 'z', -108, -682, -668, 1, 8, LOW);
  fill(-192, -116, -682, -668, 8, 8); fill(-100, -28, -682, -668, 8, 8); fill(-200, -28, -640, -612, 8, 8); fill(28, 100, -682, -612, 10, 12); fill(28, 100, -612, -604, 4, 2); fill(-60, -28, -612, -604, 4, 2); fill(-200, -60, -612, -604, 6, 4); fill(-210, -200, -712, -640, 8, 4);
  /* the batting center (north of the north street, x -60..-30) */
  { const x0 = -60, x1 = -30, z0 = -935, z1 = -908; for (let x = x0; x <= x1; x += 3) box(P, 0x5a6a5a, x - .06, x + .06, 0, 9, z0, z0 + .12); for (let z = z0; z <= z1; z += 3) for (const x of [x0, x1]) box(P, 0x5a6a5a, x - .06, x + .06, 0, 9, z - .06, z + .06); box(Gs, 0xa8c8d8, x0, x1, 8.9, 9, z0, z1); box(P, 0x3a6a3a, x0, x1, .01, .04, z0, z1); for (let k = 0; k < 5; k++) { const x = x0 + 3 + k * 6; box(P, 0x8a8a8a, x - .8, x + .8, 0, 1.6, z0 + 2, z0 + 3); box(P, 0xe8e8e4, x - .4, x + .4, 0, .05, z1 - 6, z1 - 5) } sign2('batting', -45, 10.5, -908.1, 12, 2.4, 0, true); cols.push([x0, x1, z0, z1 - 3]); SJ.batting = [-45, -906] }
  fill(-158, -60, -950, -920, 10, 10); fill(-30, -16, -950, -920, 10, 10); fill(-30, -26, -920, -908, 10, 4); fill(-60, -30, -950, -935, 8, 4);
  /* the west Shinjuku skyline (scenery beyond the edge) */
  for (let k = 0; k < 9; k++) { const x = -280 - (k % 3) * 46, z = -640 - k * 34, h = 90 + ((k * 37) % 70), w = 26 + (k % 3) * 6; box(P, [0x5a6a7a, 0x6a7a8a, 0x4a5a6a][k % 3], x - w / 2, x + w / 2, 0, h, z - w / 2, z + w / 2); for (let y = 8; y < h - 4; y += 6) if ((y + k) % 3) box(Gl, 0xd8ecff, x + w / 2 + .02, x + w / 2 + .06, y, y + 2.4, z - w / 2 + 2, z + w / 2 - 2) }
  /* ---------- walk-ins ---------- */
  IN.giga = interior('giga', it => { for (let k = 0; k < 5; k++) { const f = -2.6 + k * 1.5; bx2(P, 0xf4f4f8, it, 5, 6.2, 0, 2.2, f, f + 1.1); bx2(Gl, [0xff4ad2, 0x4ad8ff, 0xffe14a, 0x7aff8a, 0xff8a2a][k], it, 4.9, 5.02, .9, 2, f + .1, f + 1) } bx2(P, 0x1a1a2a, it, 1.4, 2.6, 0, 1.6, 4, 5.4); bx2(Gl, 0xff4ad2, it, 1.35, 1.42, 1, 1.5, 4.1, 5.3); it.cust = it.F(3.6, -.4); it.drum = it.F(3, 4.6) });
  IN.donbanana = interior('donbanana', it => { for (let k = 0; k < 4; k++) { const f = -4.6 + k * 2.6; bx2(P, 0xe8e8ec, it, 2.4, it.depth - 1.2, 0, 2.2, f, f + .8); for (let j = 0; j < 8; j++) bx2(P, [0xffe14a, 0xd82a2a, 0x2a6ad8, 0x3aa85a, 0xff8ad8][(j + k) % 5], it, 2.6 + j * 1, 3.2 + j * 1, 2.2, 2.6, f + .1, f + .7) } bx2(P, 0xd82a2a, it, .8, 1.8, 0, 1.05, 3.8, 6); it.cust = it.F(1.3, 3); it.staff = it.F(1.3, 6.4) });
  for (const k of ['gg1', 'gg2', 'gg3', 'om_tori']) if (sh[k]) Object.assign(sh[k], { ownSign: true, signY: 3.2 }); for (const k of ['giga', 'robot', 'tsukemen', 'donbanana', 'capsule']) if (sh[k]) Object.assign(sh[k], { ownSign: true });
  for (const k in sh) { const s = sh[k]; if (!s.ownSign) continue; const d = SIGNS.find(x => x[0] === k); if (!d) continue; const w = Math.min(s.w - .3, k.startsWith('gg') ? 3.2 : 12); sign2(k, s.x + s.out[0] * .06, s.signY || 3.65, s.z + s.out[1] * .06, w, w * d[2] / d[1], s.yaw) }
  if (sh.robot) { const s = sh.robot; sign2('robot', s.x + s.out[0] * .3, 8, s.z + s.out[1] * .3, 11, 2.75, s.yaw); SJ.robot = [s.x + s.out[0] * 2, s.z + s.out[1] * 2] }
  /* the night-lit sign mesh for Shinjuku's own atlas */
  atlas(); const sm = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .4, roughness: .55, alphaTest: .3 }); sm.userData.lin = 1; const sMesh = new THREE.Mesh(K2.quadGeo(Q2, SG.r), sm); sMesh.name = 'sj_signs'; grp.add(sMesh); SJ.signMesh = sMesh;
  ctx.upd.push(() => { const h = (AV.S.time / 60) % 24, n = h > 19 || h < 5 ? 1 : h > 17.5 ? (h - 17.5) / 1.5 : h < 6.5 ? (6.5 - h) / 1.5 : 0; sm.emissiveIntensity = .4 + 1.1 * n; sMesh.visible = AV.P.z < -470 && AV.P.x < 250 });
  SJ.stats.signs = Q2.length; SJ.stats.atlasOver = (SG.over || []).length; SJ.stats.shops = ['giga', 'robot', 'tsukemen', 'donbanana', 'capsule', 'gg1', 'gg2', 'gg3', 'om_tori'].filter(k => sh[k]).length;
  /* ---------- map ---------- */
  const roads = [[0, -950, 0, -612, 20], [-200, -706, 96, -706, 12], [-80, -718, -80, -900, 8], [-150, -776, -16, -776, 8], [-150, -846, -16, -846, 8], [-200, -904, -16, -904, 8], [-180, -718, -180, -780, 4], [-168, -718, -168, -780, 4], [-156, -718, -156, -780, 4], [-154, -776, -154, -904, 8], [-196, -706, -196, -656, 8], [87, -718, 87, -770, 6], [52, -765, 90, -765, 6], [-200, -656, -16, -656, 8], [-104, -694, -104, -660, 6], [0, -560, 0, -604, 8]];
  const places = [['sj_crossing', 'Shinjuku: Yasukuni-dōri crossing', 'Shinjuku: cruce de Yasukuni-dōri', 0, -706, 0], ['sj_station', 'Shinjuku Station (Loop Line)', 'Estación de Shinjuku (Línea Circular)', 46, -800, -PI / 2], ['sj_plaza', 'East exit plaza (Studio Ape screen)', 'Plaza de la salida este (pantalla Studio Ape)', 34, -820, 0], ['sj_kabuki', 'Kabukichō Ichibangai', 'Kabukichō Ichibangai', -80, -760, PI],
    ['sj_goldengai', 'Golden Gai (tiny bars)', 'Golden Gai (bares diminutos)', -168, -745, PI], ['sj_omoide', 'Omoide Yokochō (memory lane)', 'Omoide Yokochō (callejón de los recuerdos)', 87, -745, PI], ['sj_mecha', 'Mecha-Ape cinema tower', 'Torre de cine Mecha-Ape', -28, -776, PI], ['sj_batting', 'Batting center', 'Centro de bateo', -45, -905, PI], ['sj_sanchome', 'Sanchōme street', 'Calle Sanchōme', -60, -656, PI / 2], ['sj_torii', 'Forest north torii', 'Torii norte del bosque', 0, -600, 0]];
  const NM = { giga: 'Game Center GIGA APE', robot: 'Mecha Cabaret NEON-BOT', tsukemen: 'Tsukemen Kaze', donbanana: 'Don Banana (discount store)', capsule: 'Capsule Hotel Hachi', gg1: 'Bar Kurage (Golden Gai)', gg2: 'Bar Ape Noir (Golden Gai)', gg3: 'Bar Shinkai (Golden Gai)', om_tori: 'Yakitori Kemuri (Omoide)' };
  for (const k in NM) { const s = sh[k]; if (s) places.push([k, NM[k], NM[k], s.x + s.out[0] * 3, s.z + s.out[1] * 3, Math.atan2(s.out[0], s.out[1]) + PI]) }
  const nav = [[[0, -544], [-14, -540], [-18, -546], [-18, -566], [0, -566]], [[0, -544], [14, -540], [18, -546], [18, -566], [0, -566]], [[0, -566], [0, -612]], [[0, -612], [-13, -618], [-13, -712]], [[0, -612], [13, -618], [13, -712]],
    [[-13, -718], [-13, -904]], [[13, -718], [13, -904]], [[-13, -904], [13, -904]], [[-196, -715], [-13, -715]], [[13, -715], [87, -715]], [[-196, -697], [-13, -697]], [[13, -697], [87, -697]], [[87, -697], [87, -715]], [[-13, -715], [-13, -697]], [[13, -715], [13, -697]],
    [[-80, -715], [-80, -904]], [[-180, -776], [-13, -776]], [[-154, -846], [-13, -846]], [[-154, -904], [-13, -904]], [[-154, -776], [-154, -904]], [[-180, -715], [-180, -776]], [[-168, -715], [-168, -776]], [[-156, -715], [-156, -776]],
    [[87, -715], [87, -765], [52, -765], [34, -765], [34, -840]], [[13, -765], [34, -765]], [[13, -820], [34, -820]], [[-196, -656], [-13, -656]], [[-104, -697], [-104, -656]], [[-196, -715], [-196, -697], [-196, -656]], [[-45, -904], [-45, -906]], [[34, -840], [13, -846]]];
  return { roads, places, nav, SJ };
};

/* ======================= life ======================= */
const I = (id, o) => { if (!AV.ITEMS[id]) AV.ITEMS[id] = o };
I('jp_tsukemen', { n: L('Tsukemen (dipping noodles)', 'Tsukemen (fideos para mojar)'), cat: 'food', ic: '🍜', use: 'eat', model: 'bowl', col: 0xd8a860, price: 10, say: L('Thick cold noodles, a thick hot broth. Dip, slurp, repeat.', 'Fideos gruesos fríos, caldo espeso caliente. Moja, sorbe, repite.') });
I('jp_battery', { n: L('Giant spare battery', 'Batería de repuesto gigante'), cat: 'misc', ic: '🔋', use: 'look', keep: false, model: 'card', col: 0x2aff8a, price: 12, say: L('Labelled “NEON-BOT · DO NOT DROP”.', 'Etiquetada “NEON-BOT · NO DEJAR CAER”.') });
I('jp_dbsnack', { n: L('Mystery snack bag (Don Banana)', 'Bolsa de snacks misteriosa (Don Banana)'), cat: 'food', ic: '🛍️', use: 'eat', model: 'sack', col: 0xffe14a, price: 3, say: L('Wasabi peas, a banana puff and something purple.', 'Guisantes de wasabi, un hojaldre de plátano y algo morado.') });
I('jp_party', { n: L('Party wig (rainbow)', 'Peluca de fiesta (arcoíris)'), cat: 'souvenir', ic: '🌈', use: 'look', keep: true, model: 'card', col: 0xff9ad8, price: 6, say: L('Itchy. Glorious.', 'Pica. Gloriosa.') });
I('jp_umeshu', { n: L('Umeshu on the rocks', 'Umeshu con hielo'), cat: 'drink', ic: '🥃', use: 'drink', fx: { type: 'drink', amt: .3 }, model: 'cup', col: 0xc8843a, price: 6, say: L('Plum wine, sweet and sour, a whole plum at the bottom.', 'Licor de ciruela, agridulce, con una ciruela entera al fondo.') });
I('jp_robotpin', { n: L('NEON-BOT pin badge', 'Chapa de NEON-BOT'), cat: 'souvenir', ic: '🤖', use: 'look', keep: true, model: 'card', col: 0xff2ad8, price: 0, say: L('It blinks. You will never turn it off.', 'Parpadea. Nunca la apagarás.') });

TKY.shinjukuLife = function (ctx, E) {
  const S = AV.S, T = E.T, st = E.st, crowd = E.crowd, IN = E.IN, sh = E.sh, staff = E.staff, front = E.front, SJx = TKY.sj, rng = ctx.rng;
  const hour = () => (S.time / 60) % 24, P = () => AV.P, here = () => AV.W && AV.W.id === 'tokyo';
  const sj = () => { const s = st(); s.sj = s.sj || { met: {}, q: {} }; return s.sj };
  const night = () => { const h = hour(); return h >= 18 || h < 4 }, showOn = () => { const h = hour(); return h >= 20 && h < 24 };
  /* people: night crowds in Kabukicho + Golden Gai drinkers, staff, touts */
  const V = ['suit', 'woman', 'man', 'tourist', 'backpacker'], nightCrowd = [];
  for (let i = 0; i < [8, 14, 20][ctx.q]; i++) { const w = crowd.add({ v: V[i % 5], x: -80 + (rng() - .5) * 4, z: -730 - rng() * 160, route: [[-80, -722], [-80, -896], [-40, -846], [-80, -776]], loop: true, speed: .9 + rng() * .4 }); w.vis = false; nightCrowd.push(w) }
  for (const k of ['tsukemen', 'capsule', 'gg1', 'gg2', 'gg3', 'om_tori']) { const s = sh[k]; if (s) staff([s.x - s.out[0] * 1.1, s.z - s.out[1] * 1.1], k.startsWith('gg') ? 'man' : 'woman', 0x1a1a1a) }
  if (IN.donbanana) staff(IN.donbanana.staff, 'man', 0xffe14a); if (IN.giga) staff(IN.giga.cust && IN.giga.F(4.4, 3.6), 'woman', 0xff4ad2);
  ctx.upd.push(() => { const on = night(); nightCrowd.forEach(w => w.vis = on) });
  /* named residents */
  const PEOPLE = {
    hiro: { n: 'Hiro', role: L('Golden Gai bartender', 'barman de Golden Gai'), v: 'man', cols: { skin: 0xe0b890, hair: 0x2a2a2a, shirt: 0x1a1a1a, pants: 0x1a1a1a }, sched: [[11, front('tsukemen', 2)], [15, [34, -820]], [19, front('gg2', 1.1)], [4, [-166, -700]]] },
    aoi: { n: 'Aoi', role: L('NEON-BOT performer', 'artista de NEON-BOT'), v: 'woman', cols: { skin: 0xf0d0b0, hair: 0x2ad8ff, shirt: 0xff2ad8, pants: 0x1a1a1a }, sched: [[12, IN.donbanana ? IN.donbanana.F(3, 0) : [-50, -714]], [17, [-60, -776]], [19.5, SJx.robot || [-70, -800]]] },
    takeshi: { n: 'Takeshi', role: L('batting coach', 'entrenador de bateo'), v: 'man', cols: { skin: 0xd8a47a, hair: 0x1a1a1a, shirt: 0x2a5a2a, pants: 0xf4f4f0 }, sched: [[10, [-44, -905]], [22, front('gg1', 1.1)]] }
  };
  const named = TKY.named, slotOf = p => { const h = hour(); let s = null; for (const e of p.sched) if (e[0] <= h && (!s || e[0] > s[0])) s = e; if (!s) s = p.sched.reduce((a, e) => e[0] > a[0] ? e : a); return s };
  for (const [id, p] of Object.entries(PEOPLE)) { const s0 = slotOf(p), at = s0[1] || p.sched.find(e => e[1])[1]; const w = crowd.add({ v: p.v, x: at[0], z: at[1], mode: 'idle', cols: p.cols }); named[id] = { p, w, slot: s0 }; named[id].t = T(w.x, w.z, 2, () => tr('Talk to ', 'Hablar con ') + p.n + ' (' + say(p.role) + ')', () => talk(id)) }
  /* ---------- shops ---------- */
  const ctr = (pt, V2, label, show) => { if (!pt) return null; Object.assign(V2, { x: pt[0], z: pt[1], reach: 5 }); return T(pt[0], pt[1], 2, () => tr(label[0], label[1]), () => AV.shop.open(V2), show || null, 'shop') };
  ctr(front('tsukemen', 1.4), { id: 'sj_tsukemen', name: L('Tsukemen Kaze', 'Tsukemen Kaze'), greet: L('“Ticket machine’s broken — just tell me. Extra-thick noodles?”', '“La máquina de tickets está rota: dímelo a mí. ¿Fideos extragruesos?”'), items: [['jp_tsukemen', 10], ['jp_beer', 6], ['jp_gyoza', 5]] }, L('🍜 Tsukemen Kaze', '🍜 Tsukemen Kaze'));
  if (IN.donbanana) ctr(IN.donbanana.cust, { id: 'sj_donbanana', name: L('Don Banana', 'Don Banana'), greet: L('The jingle never stops: ♪ Don, don, don, Don Banana ♪', 'La musiquita nunca para: ♪ Don, don, don, Don Banana ♪'), items: [['jp_dbsnack', 3], ['jp_battery', 12], ['jp_party', 6], ['jp_ramune', 2], ['pp_puffs', 3]].filter(([i]) => AV.ITEMS[i]) }, L('🛍️ Don Banana: everything, all night (walk-in)', '🛍️ Don Banana: de todo, toda la noche (entra)'));
  for (const [k, nm, greet] of [['gg1', 'Bar Kurage', L('Six seats, a jellyfish tank, the owner’s jazz records.', 'Seis asientos, un acuario de medusas, los discos de jazz del dueño.')], ['gg2', 'Bar Ape Noir', L('Film posters on the ceiling. Hiro: “What’s your poison?”', 'Carteles de cine en el techo. Hiro: “¿Qué tomas?”')], ['gg3', 'Bar Shinkai', L('Deep-sea blue light, deep-sea quiet.', 'Luz azul de las profundidades, silencio de las profundidades.')]])
    ctr(front(k, 1.1), { id: 'sj_' + k, name: L(nm, nm), greet, items: [['jp_highball', 7], ['jp_umeshu', 6], ['jp_sake', 6], ['water', 1]] }, L('🍸 ' + nm + ' (Golden Gai, 19:00-04:00)', '🍸 ' + nm + ' (Golden Gai, 19:00-04:00)'), () => { const h = hour(); return h >= 19 || h < 4 });
  ctr(front('om_tori', 1.2), { id: 'sj_omtori', name: L('Yakitori Kemuri', 'Yakitori Kemuri'), greet: L('Smoke everywhere: “Negima, tsukune, a cold beer?”', 'Humo por todas partes: “¿Negima, tsukune, una cerveza fría?”'), items: [['jp_yakitori', 6], ['jp_beer', 6], ['jp_edamame', 3]] }, L('🍢 Yakitori Kemuri (Omoide Yokochō)', '🍢 Yakitori Kemuri (Omoide Yokochō)'));
  /* the capsule hotel: sleep till 08:00 */
  { const p2 = front('capsule', 1.4); if (p2) T(p2[0], p2[1], 2, () => tr('🛏️ Capsule Hotel Hachi: sleep till 08:00 (8)', '🛏️ Capsule Hotel Hachi: dormir hasta las 08:00 (8)'), () => { if (!AV.txn(-8, 'Capsule hotel')) return; AV.fadeTo(1, 400); setTimeout(() => { if (S.time >= 8 * 60) S.day++; S.time = 8 * 60; AV.vitals && AV.vitals.add(40, 6); sj().slept = (sj().slept || 0) + 1; AV.fadeTo(0, 700); AV.toast(tr('🛏️ A pod with a TV, a fan and the hum of 200 sleepers. You wake at eight, new.', '🛏️ Una cápsula con tele, ventilador y el zumbido de 200 durmientes. Despiertas a las ocho, como nuevo.')) }, 450) }, null, 'shop') }
  /* the robot show (20:00-24:00) */
  if (SJx.robot) T(SJx.robot[0], SJx.robot[1], 2.4, () => showOn() ? tr('🤖 Mecha Cabaret NEON-BOT: the show (25)', '🤖 Mecha Cabaret NEON-BOT: el espectáculo (25)') : tr('🤖 Mecha Cabaret NEON-BOT: shows at 20:00 and 22:00', '🤖 Mecha Cabaret NEON-BOT: funciones a las 20:00 y 22:00'),
    () => { if (!showOn()) return AV.toast(tr('A robot arm waves you away: “COME BACK AT TWENTY HUNDRED.”', 'Un brazo robótico te despide: “VUELVE A LAS VEINTE HORAS.”')); const s = sj(); const free = s.q.aoi === 'done' && !s.freeShow; if (!free && !AV.txn(-25, 'Robot show')) return; if (free) s.freeShow = 1;
      AV.fadeTo(1, 400); setTimeout(() => { S.time = (S.time + 45) % 1440; s.show = (s.show || 0) + 1; AV.bag.add('jp_robotpin', 1, true); AV.vitals && AV.vitals.add(-4, 18); AV.fadeTo(0, 600); AV.toast(tr('🤖 Lasers, taiko, a giant robot riding a giant robot. Aoi waves from the top of a mecha. Absolutely nonsensical, absolutely brilliant.', '🤖 Láseres, taiko, un robot gigante montado en otro robot gigante. Aoi saluda desde lo alto de un mecha. Absurdo y brillante.')) }, 450) }, null, 'venue');
  /* the batting center */
  if (SJx.batting) T(SJx.batting[0], SJx.batting[1], 2.4, () => tr('⚾ Batting center: 20 pitches (3)', '⚾ Centro de bateo: 20 lanzamientos (3)'), () => { if (!AV.txn(-3, 'Batting center')) return; const v = AV.vitals ? AV.vitals.get().energy : 60, hits = Math.min(20, Math.round(6 + v * .08 + Math.random() * 8)), hr = hits > 15 ? 1 + (Math.random() * 2 | 0) : 0, s = sj(); s.bat = Math.max(s.bat || 0, hits); s.batN = (s.batN || 0) + 1; AV.vitals && AV.vitals.add(-6, 8); AV.toast(tr('⚾ Clang! ', '⚾ ¡Clanc! ') + hits + tr('/20 hits', '/20 golpes') + (hr ? tr(' · ' + hr + ' home run(s) — the bell rings!', ' · ' + hr + ' jonrón(es): ¡suena la campana!') : '') + tr(' (best ', ' (mejor ') + s.bat + ')') }, null, 'game');
  /* GIGA APE: rhythm drums (shared instrument activity) + a crane */
  if (IN.giga) T(IN.giga.cust[0], IN.giga.cust[1], 1.8, () => tr('🕹️ GIGA APE crane: try for a prize (2)', '🕹️ Grúa de GIGA APE: intenta ganar un premio (2)'), () => TKY.ufo && TKY.ufo(), null, 'game');
  let placed = false; ctx.upd.push(() => { if (placed || !here() || !AV.act || !AV.act.place || !IN.giga) return; placed = true; try { AV.act.place(AV.W, { type: 'instspot', kind: 'drums', x: IN.giga.drum[0], z: IN.giga.drum[1] }); SJx.stats.drums = true } catch (e) { SJx.stats.drumErr = String(e) } });
  /* the Loop Line reaches Shinjuku */
  const RD = AV.rides; SJx.loop = (to) => { if (!RD || RD.cur || !TKY.TRAIN) return false; if (!AV.txn(-2, 'Loop Line')) return false; const north = to === 'shinjuku', tx = north ? TKY.TRACK[0] : TKY.TRACK[1];
    const pts = north ? [[tx, -457], [tx, -600], [tx, -700], [tx, -800]] : [[tx, -800], [tx, -700], [tx, -600], [tx, -457]]; const ok = RD.start({ pts, veh: TKY.TRAIN, out: north ? [46, -800] : [46, -455], name: 'Loop Line', price: 2, icon: '🚃', title: tr('Loop Line', 'Línea Circular') }); if (ok) st().train = (st().train || 0) + 1; else AV.txn(2, 'refund'); return ok };
  T(48.6, -452.5, 2.2, () => tr('🚃 Loop Line: Harajuku → Shinjuku (2 credits)', '🚃 Línea Circular: Harajuku → Shinjuku (2 créditos)'), () => SJx.loop('shinjuku'), null, 'train');
  T(SJx.station[0], SJx.station[1], 2.4, () => tr('🚃 Loop Line: Shinjuku → Harajuku (2 credits)', '🚃 Línea Circular: Shinjuku → Harajuku (2 créditos)'), () => SJx.loop('harajuku'), null, 'train');
  /* the Studio Ape screen (its own small canvas) */
  { const c = document.createElement('canvas'); c.width = 384; c.height = 160; const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); mat.userData.lin = 1; const [sx, sy, sz, sw, shh] = SJx.screenAt; const m = new THREE.Mesh(new THREE.PlaneGeometry(sw, shh), mat); m.position.set(sx, sy, sz); ctx.group.add(m);
    const AD = [['STUDIO APE', 'ライブ配信中 · LIVE', '#1a0a3a', '#ff4ab0'], ['NEON-BOT', 'ロボットショー 20:00', '#0a1a3a', '#2ad8ff'], ['DON BANANA', '激安 24時間', '#ffe14a', '#d82a2a'], ['GOLDEN GAI', '今夜も · tonight too', '#1a1a1a', '#f2c230']]; let acc = 0;
    ctx.upd.push(dt => { if (!here() || AV.P.z > -600) return; acc += dt || .016; if (acc < .25) return; acc = 0; const t = AV.now(), a = AD[((t / 5) | 0) % AD.length]; const gr = g.createLinearGradient(0, 0, 384, 160); gr.addColorStop(0, a[2]); gr.addColorStop(1, a[3]); g.fillStyle = gr; g.fillRect(0, 0, 384, 160); for (let i = 0; i < 16; i++) { g.fillStyle = 'rgba(255,255,255,.15)'; const bh = (Math.sin(t * 6 + i) * .5 + .5) * 50; g.fillRect(i * 24, 160 - bh, 20, bh) } g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; K2.fit(g, a[0], 360, 56, '900 #px Arial Black, Arial, sans-serif', 64, 192); K2.fit(g, a[1], 360, 24, '700 #px ' + JP, 118, 192); tex.needsUpdate = true }) }
  /* ---------- conversations ---------- */
  const TK = AV.talk, setL = (en, es) => { const e = document.getElementById('tkL'); e && (e.textContent = tr(en, es)) }, goto = (x, z, n) => { AV.minimap && AV.minimap.setDest && AV.minimap.setDest(x, z, n) };
  function talk(id) { const o = named[id]; if (!o || !TK) return; const s = sj(); s.met[id] = (s.met[id] || 0) + 1; const q2 = s.q;
    const O = {
      hiro: [{ label: L('How many bars are in Golden Gai?', '¿Cuántos bares hay en Golden Gai?'), say: L('“Two hundred, give or take. Most seat six. Some seat four, if they like you.”', '“Doscientos, más o menos. La mayoría tiene seis asientos. Algunos cuatro, si les caes bien.”') },
        { label: L('Is there a cover charge?', '¿Hay entrada?'), say: L('“Some bars, yes. Mine, no — buy a drink, tell me a story.”', '“En algunos bares sí. En el mío no: pide algo y cuéntame una historia.”') },
        { label: L('Where do you eat?', '¿Dónde comes?'), say: L('“Tsukemen Kaze for lunch. Omoide Yokochō for the smoke.”', '“Tsukemen Kaze para comer. Omoide Yokochō por el humo.”') },
        { label: L('Show me your bar', 'Enséñame tu bar'), fn: () => { AV.closePanel('cmp'); const p2 = front('gg2', 1.1); p2 && goto(p2[0], p2[1], 'Bar Ape Noir') } }],
      aoi: [{ label: L('What’s the robot show like?', '¿Cómo es el espectáculo de robots?'), say: L('“Loud. Bright. A taiko battle on top of a mecha. You will love it or leave confused.”', '“Ruidoso. Brillante. Una batalla de taiko encima de un mecha. Te encantará o saldrás confuso.”') },
        { label: L('Is it dangerous?', '¿Es peligroso?'), say: L('“Only for the drummers. And the robots. Mostly the robots.”', '“Solo para los tamborileros. Y los robots. Sobre todo los robots.”') },
        { label: L('Where’s good tonight?', '¿Qué hay bueno esta noche?'), say: L('“The batting center at midnight. Very relaxing. Very loud.”', '“El centro de bateo a medianoche. Muy relajante. Muy ruidoso.”') },
        { label: () => !q2.aoi ? L('Need anything?', '¿Necesitas algo?') : q2.aoi === 'done' ? L('How’s the robot?', '¿Qué tal el robot?') : L('I have the battery!', '¡Tengo la batería!'), fn: () => {
          if (!q2.aoi) { q2.aoi = 'ask'; setL('“NEON-BOT’s spare battery died. Don Banana sells the giant ones — would you grab one before the show?”', '“La batería de repuesto de NEON-BOT se ha muerto. Don Banana vende las gigantes: ¿me traes una antes del espectáculo?”'); if (IN.donbanana) goto(IN.donbanana.cust[0], IN.donbanana.cust[1], 'Don Banana') }
          else if (q2.aoi === 'ask' && AV.bag.count('jp_battery') > 0) { q2.aoi = 'done'; AV.bag.remove('jp_battery'); AV.txn(20, 'Aoi: arigatō'); setL('“NEON-BOT lives! +20 — and your next show is on the house.”', '“¡NEON-BOT vive! +20, y tu próximo espectáculo corre de mi cuenta.”'); AV.quests && AV.quests.check && AV.quests.check() }
          else if (q2.aoi === 'done') setL('“Purring like a very large kitten.”', '“Ronronea como un gatito muy grande.”');
          else setL('“Don Banana on Yasukuni-dōri. Follow the jingle.”', '“Don Banana, en Yasukuni-dōri. Sigue la musiquita.”') } }],
      takeshi: [{ label: L('Any batting tips?', '¿Algún consejo de bateo?'), say: L('“Eye on the ball, hips first, and never swing at the first pitch.”', '“Mirada en la bola, primero la cadera, y nunca batees el primer lanzamiento.”') },
        { label: L('How fast are the pitches?', '¿Qué velocidad tienen?'), say: L('“Eighty to a hundred and forty. Start slow. Nobody watches anyway.”', '“De ochenta a ciento cuarenta. Empieza despacio. Nadie mira, de todas formas.”') },
        { label: L('Your favourite spot in Shinjuku?', '¿Tu sitio favorito en Shinjuku?'), say: L('“The forest at dawn, before the trains. Then here.”', '“El bosque al amanecer, antes de los trenes. Y luego aquí.”') },
        { label: L('Let me try (3)', 'Déjame probar (3)'), fn: () => { AV.closePanel('cmp'); goto(-45, -906, 'Batting center') } }]
    }[id];
    TK.open({ id: 'sj_' + id, name: o.p.n + ' · ' + say(o.p.role), first: L('“Yo! I’m ' + o.p.n + '.”', '“¡Hola! Soy ' + o.p.n + '.”'), back: L('“Back again? Shinjuku gets you.”', '“¿Otra vez aquí? Shinjuku engancha.”'), opts: O.map(x => Object.assign({}, x, { label: typeof x.label === 'function' ? x.label() : x.label, say: typeof x.say === 'function' ? x.say() : x.say })) }) }
  SJx.talk = talk;
};
})(window.AV);
