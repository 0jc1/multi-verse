/* APEVERSE 2.0 - festivals.js : M14 festivals, first slice. A weekly calendar + "Groove Dealers: Live at the Hanging Bazaar".
   - Calendar: game days have weekdays (day % 7: Mon..Sun). A festival has a world, a weekday, a window (start hour, length).
     State is themed, not a real-world date (no hardcoded false dates).  AV.fest.active(id), .next(id), .force(id, on) (preview).
   - Hanging Bazaar (Ape Town, every Saturday 18:00-03:00): lantern festoons over the Lotus Stage terrace and the bazaar lane,
     fabric canopies, the Groove Dealers poster (the owner's artwork) on two standing boards and on a big screen behind the stage,
     a "Vinyls from the Stars" stall (poster print + intergalactic vinyl), a festival crowd that dances during the headline,
     Groove Dealers headline 22:00-23:30 (replaces the Stone Ape Band late set that night; the stage music is unchanged).
     Catch 30 minutes of the headline: +2 music rep, once per festival.
   - Nothing blocks paths: decorations are overhead; boards + the stall are placed only on free ground with clearance.
   - Gig guide (AV.gigs.panel) lists upcoming festivals.  Save: optional S.fest = { seen: {} }. */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const DAYS = [L('Monday', 'lunes'), L('Tuesday', 'martes'), L('Wednesday', 'miércoles'), L('Thursday', 'jueves'), L('Friday', 'viernes'), L('Saturday', 'sábado'), L('Sunday', 'domingo')];
const FE = AV.fest = { DAYS, forced: {}, stats: { built: 0, crowd: 0, seen: 0 } };
const POSTER = 'assets/fest/groove_dealers_hanging_bazaar.jpg';
const LIST = FE.LIST = { hanging_bazaar: { w: 'ape_town', wd: 5, h: 18, len: 9 * 60, n: L('Groove Dealers: Live at the Hanging Bazaar', 'Groove Dealers: en directo en el Hanging Bazaar'), head: { h: 22, len: 90, n: L('Groove Dealers (headline)', 'Groove Dealers (cabeza de cartel)') } } };
FE.weekday = (d = AV.S.day) => ((d % 7) + 7) % 7;
FE.dayName = d => say(DAYS[FE.weekday(d)]);
/* is the festival on at absolute minute a? (a window may run past midnight into the next day) */
FE.activeAt = (id, a) => { const F = LIST[id]; if (!F) return false; if (FE.forced[id] != null) return FE.forced[id]; const d = Math.floor(a / 1440), t = a - d * 1440;
  return (FE.weekday(d) === F.wd && t >= F.h * 60) || (FE.weekday(d - 1) === F.wd && t < F.h * 60 + F.len - 1440) };
FE.active = id => FE.activeAt(id, AV.abs());
FE.headNow = id => { const F = LIST[id]; if (!F || !FE.active(id)) return false; const t = AV.S.time; return t >= F.head.h * 60 && t < F.head.h * 60 + F.head.len };
FE.next = id => { const F = LIST[id]; for (let k = 0; k < 8; k++) { const d = AV.S.day + k; if (FE.weekday(d) === F.wd && (k > 0 || AV.S.time < F.h * 60 + F.len)) return d } return null };
FE.force = (id, on) => { FE.forced[id] = on == null ? null : !!on; if (live) sync() };
const st = () => { const S = AV.S; S.fest = S.fest || { seen: {} }; S.rep = S.rep || { barrio: 0, business: 0, music: 0 }; return S };
FE.guideHtml = () => Object.entries(LIST).map(([id, F]) => { const on = FE.active(id), d = FE.next(id); return '<div class="note"><b>🎪 ' + say(F.n) + '</b><br>' + (on ? '🔴 ' + tr('ON NOW', 'AHORA') + ' · ' : '') + tr('Every ', 'Cada ') + say(DAYS[F.wd]) + ' ' + F.h + ':00–' + ((F.h * 60 + F.len) / 60 % 24) + ':00 · Ape Town · ' + tr('headline ', 'cabeza de cartel ') + F.head.h + ':00' + (!on && d != null ? '<br>' + tr('Next: day ', 'Próximo: día ') + d + (d === AV.S.day ? tr(' (today)', ' (hoy)') : '') : '') + '</div>' }).join('');

/* ---------- the poster: one texture, shared ---------- */
let ptex = null; const posterTex = () => { if (!ptex) { ptex = new THREE.TextureLoader().load(POSTER, () => { FE.stats.posterLoaded = true }); ptex.encoding = THREE.sRGBEncoding; ptex.anisotropy = 4 } return ptex };
FE.showPoster = () => AV.panel('cmp', '<b>🎪 Groove Dealers · Hanging Bazaar</b><div style="margin:6px 0"><img src="' + POSTER + '" alt="Groove Dealers poster" style="width:100%;max-width:820px;border-radius:6px;display:block"></div><div class="note">' + tr('“A funked-up odyssey from the cosmos.” Live every Saturday night at the Hanging Bazaar, Ape Town.', '“Una odisea funk desde el cosmos.” En directo cada sábado por la noche en el Hanging Bazaar, Ape Town.') + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>');
Object.assign(AV.ITEMS, {
  gd_poster: { n: L('Groove Dealers poster (Hanging Bazaar)', 'Póster de Groove Dealers (Hanging Bazaar)'), cat: 'misc', ic: '🖼️', use: 'look', keep: true, model: 'card', col: 0xffb04a, price: 25, say: L('Giraffe on vocals, Sloth MC on the decks, a lizard on drums, a flamingo on trumpet.', 'Jirafa a la voz, Sloth MC a los platos, un lagarto a la batería, un flamenco a la trompeta.'), onUse: () => setTimeout(FE.showPoster, 50) },
  gd_vinyl: { n: L('Groove Dealers "Intergalactic" vinyl', 'Vinilo "Intergalactic" de Groove Dealers'), cat: 'misc', ic: '💿', use: 'look', keep: true, model: 'card', col: 0x7a3aff, price: 40, say: L('Pressed "from the stars", says the stallholder. The sleeve smells of incense.', 'Prensado "desde las estrellas", dice el vendedor. La funda huele a incienso.') } });

/* ---------- build (once per visit, toggled by the calendar) ---------- */
let live = null;
function spotNear(W, x, z, r, avoid) { for (let d = 0; d < 10; d += .5) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
  if (W.surface(px, pz) !== null && AV.isFree(W, px, pz, r) && !W.T.some(t => Math.hypot(t.x - px, t.z - pz) < (t.r || 1) + r) && !(avoid || []).some(q => Math.hypot(q[0] - px, q[1] - pz) < q[2])) return [px, pz] } return null }
function build(W) { const ctx = W.ctx, g = new THREE.Group(); g.name = 'fest_hanging_bazaar'; W.ctx.group.add(g); const fctx = Object.assign({}, ctx, { group: g }), K = AV.kit, F = LIST.hanging_bazaar;
  const S = { g, W, ok: {}, T: [], crowd: [], acc: 0 };
  /* stage + terrace: the Lotus Stage (pond) faces north to the terrace; the tip point marks the audience */
  const tip = W.T.find(t => /Tip the band/.test(typeof t.label === 'function' ? t.label() : String(t.label))), ax = tip ? tip.x : 0, az = tip ? tip.z : 49, SX = 0, SZ = 69;
  /* lantern festoons: overhead (4.2-6 m), never collidable */
  if (K && K.lanterns) { for (const z of [az - 4, az, az + 4]) K.lanterns(fctx, [[-12, 4.6, z], [0, 5.4, z + .5], [12, 4.6, z]], { per: 9, sag: .7 }); for (const z of [88, 95]) K.lanterns(fctx, [[-10, 5, z], [0, 5.8, z + .4], [10, 5, z]], { per: 8, sag: .6 }); S.ok.lanterns = true }
  /* fabric canopies over the bazaar lane (overhead, translucent) */
  const cols = [0xff6ad5, 0xffd84a, 0x7ff0c8, 0x9a5cff, 0xff8a3a]; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), new THREE.MeshStandardMaterial({ color: cols[i], side: THREE.DoubleSide, transparent: true, opacity: .55, roughness: .9 })); m.position.set(-8 + i * 4, 6.3 + (i % 2) * .3, 91.5); m.rotation.x = -Math.PI / 2 + .12; g.add(m) }
  /* the poster on a big screen behind the stage, facing the audience */
  const pm = () => new THREE.MeshStandardMaterial({ map: posterTex(), emissive: 0xffffff, emissiveMap: posterTex(), emissiveIntensity: .55, roughness: .8 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(12, 12 * 3072 / 5504), pm()); scr.position.set(SX, 12.2, SZ + 4.2); scr.rotation.y = Math.PI; g.add(scr); const fr = new THREE.Mesh(new THREE.BoxGeometry(12.6, 12 * 3072 / 5504 + .6, .3), new THREE.MeshStandardMaterial({ color: 0x1a1022, roughness: .6 })); fr.position.set(SX, 12.2, SZ + 4.4); g.add(fr); S.ok.screen = true;
  /* two standing poster boards on free ground (terrace edge, bazaar lane), with clearance so they never block a path */
  const boards = []; for (const [x, z, ry] of [[-15, az, Math.PI / 2], [11, 97, -Math.PI / 2]]) { const sp = spotNear(W, x, z, 1.6); if (!sp) continue; const b = new THREE.Group(); b.position.set(sp[0], W.surface(sp[0], sp[1]) || 0, sp[1]); b.rotation.y = ry;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2 * 3072 / 5504), pm()); p.position.set(0, 2.1, .06); b.add(p); const back = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.4 * 3072 / 5504 + .1, .1), new THREE.MeshStandardMaterial({ color: 0x2a1a10 })); back.position.y = 2.1; b.add(back);
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.1, 1.3, .1), new THREE.MeshStandardMaterial({ color: 0x2a1a10 })); leg.position.set(s * 1.4, .6, -.02); b.add(leg) } g.add(b); boards.push({ b, x: sp[0], z: sp[1], c: [sp[0], sp[1], .5] });
    S.T.push({ x: sp[0], z: sp[1], r: 2.4, show: () => g.visible, label: () => tr('🎪 Groove Dealers poster', '🎪 Póster de Groove Dealers'), fn: FE.showPoster }) } S.boards = boards.map(b => [+b.x.toFixed(1), +b.z.toFixed(1)]);
  /* "Vinyls from the Stars" stall */
  const ss = spotNear(W, -9, 95, 2.2, boards.map(b => [b.x, b.z, 4])); if (ss) { const st0 = new THREE.Group(); st0.position.set(ss[0], W.surface(ss[0], ss[1]) || 0, ss[1]); const M = (geo, col, x, y, z, e) => { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .7, emissive: e ? col : 0, emissiveIntensity: e ? .5 : 0 })); m.position.set(x, y, z); st0.add(m); return m };
    M(new THREE.BoxGeometry(2.6, .9, 1), 0x6a3a1a, 0, .45, 0); M(new THREE.BoxGeometry(2.8, .08, 1.4), 0x9a5cff, 0, 2.3, 0, true); for (const s of [-1, 1]) M(new THREE.BoxGeometry(.08, 2.3, .08), 0x2a1a10, s * 1.3, 1.15, -.5);
    for (let k = 0; k < 4; k++) M(new THREE.CylinderGeometry(.16, .16, .02, 20), 0x111111, -.9 + k * .6, .92, 0); g.add(st0); S.stall = [+ss[0].toFixed(1), +ss[1].toFixed(1)];
    if (AV.kit && AV.kit.sign) AV.kit.sign(fctx, 'VINYLS FROM THE STARS', ss[0], (W.surface(ss[0], ss[1]) || 0) + 2.9, ss[1], 0, 3.2, '#ffd84a', {});   /* in the festival group: hidden off-nights */
    S.T.push({ x: ss[0], z: ss[1] - 1.4, r: 2, show: () => g.visible, label: () => tr('💿 Vinyls from the Stars (Hanging Bazaar stall)', '💿 Vinyls from the Stars (puesto del Hanging Bazaar)'), fn: () => AV.shop && AV.shop.open({ id: 'fest_vinyls', name: L('Vinyls from the Stars', 'Vinyls from the Stars'), greet: L('“Records from twelve galaxies. And a poster of the band, if you\'re into that.”', '“Discos de doce galaxias. Y un póster de la banda, si te va.”'), items: [['gd_vinyl', 40], ['gd_poster', 25]] }) }) }
  for (const t of S.T) W.T.push(t); FE.stats.built++; return S }
function spawnCrowd(S) { const W = S.W, q = (W.ctx && W.ctx.q) || 0, n = [4, 8, 12][q]; for (let i = 0; i < n; i++) { const sp = spotNear(W, -8 + (i % 6) * 3.2, 46 + Math.floor(i / 6) * 3, .5); if (!sp) continue;
    try { const A = AV.chars.softActor('human', 8800 + i * 17, { lod: true, shells: 0, shadow: false, crowd: true }), h = new THREE.Group(); h.add(A.root); h.position.set(sp[0], W.surface(sp[0], sp[1]) || 0, sp[1]); h.rotation.y = Math.atan2(0 - sp[0], 69 - sp[1]); S.g.add(h); S.crowd.push({ h, actor: A.actor }) } catch (e) { console.warn('fest crowd', e) } }
  FE.stats.crowd = S.crowd.length }
function sync() { const S = live; if (!S) return; const on = FE.active('hanging_bazaar'); if (on && !S.built) { Object.assign(S, build(S.W)); S.built = true } if (!S.g) return; S.g.visible = on; FE.stats.on = on;
  if (on && !S.crowd.length && Math.hypot(AV.P.x, AV.P.z - 60) < 120) spawnCrowd(S) }
function tick(dt) { const S = live; if (!S) return; S.k = (S.k || 0) - dt; if (S.k <= 0) { S.k = .5; sync() } if (!S.g || !S.g.visible) return; const head = FE.headNow('hanging_bazaar');
  for (const c of S.crowd) if (c.actor) { c.mode = head ? 'Dance' : 'Idle'; c.actor.play && c.actor.play(c.mode); c.actor.mixer && c.actor.mixer.update(dt) }
  if (head && Math.hypot(AV.P.x - 0, AV.P.z - 52) < 32) { const key = 'hb:' + (AV.S.time < 12 * 60 ? AV.S.day - 1 : AV.S.day), s = st(); if (!s.fest.seen[key]) { S.acc += dt * 2; if (S.acc >= 30) { s.fest.seen[key] = 1; s.rep.music = Math.min(100, (s.rep.music || 0) + 2); FE.stats.seen++; AV.vitals && AV.vitals.add(0, 10); AV.save(); AV.toast('🎪 ' + tr('You caught Groove Dealers at the Hanging Bazaar! +2 music rep', '¡Viste a Groove Dealers en el Hanging Bazaar! +2 reputación musical')) } } } }
FE.live = () => live;
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); live = null; if (!W || W.id !== 'ape_town' || !W.ctx) return; st();
  try { live = { W, g: null, crowd: [], built: false }; sync(); W.ctx.upd.push(dt => tick(Math.min(dt, .1))); W.ctx.leave.push(() => { live = null }); if (FE.active('hanging_bazaar')) setTimeout(() => AV.toast('🎪 ' + tr('Tonight: Groove Dealers live at the Hanging Bazaar (headline 22:00)!', 'Esta noche: ¡Groove Dealers en directo en el Hanging Bazaar (22:00)!')), 1500) } catch (e) { console.warn('festivals failed', e); FE.stats.err = String(e) } };
})(window.AV);
