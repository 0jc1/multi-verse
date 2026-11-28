/* APEVERSE 2.3 - lw_onboard.js : character creation, onboarding, starter package, the player's avatar + third-person walking camera.
   New game (real players) -> the creator: live 3D preview (same body pipeline as the NPCs, AV.chars.softHuman), name, body (ZtonedApe
   classic chimp / male / female), skin or fur, hair style + colour, beard / glasses / flower, top (prints incl. ZtonedApe + Giant tees),
   bottoms (jeans, chinos, elephant pants, shorts), shoes; starting city; TWO starter homes in different worlds (furnished: bed, wardrobe,
   sofa, TV, record player, rug, lamp, plant); optional tutorial missions.  Package: 10 000 credits, a car + bicycle + scooter parked at
   each starter home (hover car / hover scooter / hoverbike on Astro-9), phone, snacks and drinks.  You wake up in your home.
   Continue -> choose where to wake up (where you left off, or any home you own).  Old saves -> a one-time OPTIONAL starter package
   (one furnished home + vehicles + snacks), nothing reset.  ApePhone 🪞 Me: rename, change your look.  C (walking) = third person.
   Automated test runs open index.html#autotest: New game then starts at once with defaults, exactly as before (no creator, no package).
   Save: S.me (look), S.name, S.lw.pkg = { homes:[pid], veh:{ world: true } }.  Basic fictional weapons come with the police milestone. */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, say = LW.say, esc = LW.esc, H = AV.home;
const AUTO = LW.AUTOTEST = /autotest/.test(location.hash);
/* ---------- look -> body ---------- */
const SKINS = [0xf2d0b4, 0xe0ac69, 0xd8a47a, 0xc68642, 0xa86a3c, 0x8d5524, 0x5a3820], FURS = [0x6a4a32, 0x3a2a1e, 0x8a6a4a, 0x2a2a2e, 0xc8a070, 0x7a3a2a, 0x4a6a8a];
const HAIRC = [0x14100c, 0x2a1a10, 0x4a2c18, 0x7a5230, 0xd8b860, 0xb0b0b0, 0xd84a8a, 0x3a8ad8, 0x4ad87a], STYLES = ['short', 'messy', 'bun', 'long', 'afro', 'cap', 'bald'];
const TOPS = [['ztoned', L('ZtonedApe tee', 'Camiseta ZtonedApe'), { decal: 'ztoned', col: 0xf0ece4 }], ['giant', L('Giant Hostel tee', 'Camiseta Giant Hostel'), { decal: 'giant', col: 0xf0ece4 }], ['hawaii', L('Hawaiian shirt', 'Camisa hawaiana'), { fab: 'hawaii' }],
  ['tiedye', L('Tie-dye', 'Tie-dye'), { fab: 'tiedye' }], ['reggae', L('Reggae stripes', 'Rayas reggae'), { fab: 'reggae' }], ['tank', L('Tank top', 'Camiseta de tirantes'), { fab: 'tank', sleeveless: true }], ['plain', L('Plain tee', 'Camiseta lisa'), { col: 0x2a6ad8 }]];
const BOTS = [['denim', L('Jeans', 'Vaqueros'), { kind: 'denim', col: 0x2c3a5a }], ['twill', L('Chinos', 'Chinos'), { col: 0xc8b088 }], ['elephant', L('Elephant pants', 'Pantalón de elefantes'), { fab: 'elephant' }], ['shorts', L('Shorts', 'Pantalón corto'), { col: 0x3a3a52, shorts: true }]];
const FEET = [['sneaker', L('Sneakers', 'Zapatillas')], ['flip', L('Flip-flops', 'Chanclas')], ['boots', L('Boots', 'Botas')]];
LW.defaultMe = () => ({ name: '', body: 'ape', skin: SKINS[2], fur: FURS[0], hair: HAIRC[1], style: 'messy', beard: false, glasses: false, flower: false, top: 'ztoned', topCol: 0xf0ece4, bot: 'elephant', foot: 'flip', shoe: 0x2a2622 });
LW.lookFor = function (me) { me = Object.assign(LW.defaultMe(), me || {}); const T = (TOPS.find(t => t[0] === me.top) || TOPS[0])[2], B = (BOTS.find(b => b[0] === me.bot) || BOTS[0])[2];
  const shirt = Object.assign({}, T, T.col != null || T.fab ? {} : { col: me.topCol }); if (me.top === 'plain') shirt.col = me.topCol;
  if (me.body === 'ape') return { sp: 'chimp', fur: me.fur, skin: 0xc79a6e, dark: new THREE.Color(me.fur).multiplyScalar(.45).getHex(), nail: 0xd8b090, tip: 0xffffff, eye: 0x6a3a14, strandF: 250, shells: 12, size: 1, shadow: true,
    shirt: { o: { loose: 1.04, sleeve: .55 }, col: shirt.col == null ? 0xf0ece4 : shirt.col, fab: shirt.fab, decal: shirt.decal }, pants: { o: { loose: 1.1 }, col: B.col || 0x3a3a52, kind: B.kind || 'twill', fab: B.fab }, shoes: { o: {}, cols: [0x2a2a2c, 0xe8e4da, 0x2a2a2c, 0x5a5a62] } };
  return { sp: me.body === 'female' ? 'human_b' : 'human_a', skin: me.skin, hair: me.hair, style: me.style, beard: me.body === 'male' && me.beard, glasses: me.glasses ? 1 : undefined, flower: me.flower ? 1 : undefined, shadow: true,
    shirt, pants: B, foot: me.foot === 'flip' ? 'flip' : 'sneaker', boots: me.foot === 'boots', shoe: me.shoe };
};
LW.buildAvatar = me => { const g = AV.chars.softHuman(LW.lookFor(me)); AV.lin(g); g.userData.me = JSON.stringify(me); return g };
/* ---------- the avatar in the world + third person walking (C) ---------- */
const AVA = LW.avatar = { g: null, tp: false, stats: { builds: 0 } };
function ensureAvatar() { const me = AV.S.me || LW.defaultMe(), key = JSON.stringify(me); if (AVA.g && AVA.g.userData.me === key) return AVA.g; if (AVA.g) { AV.scene.remove(AVA.g); AV.dispose(AVA.g) } try { AVA.g = LW.buildAvatar(me); AVA.g.visible = false; AV.scene.add(AVA.g); AVA.stats.builds++ } catch (e) { console.warn('avatar', e); AVA.g = null } return AVA.g }
LW.toggleTP = on => { AVA.tp = on == null ? !AVA.tp : !!on; if (AVA.tp) ensureAvatar(); else if (AVA.g) AVA.g.visible = false; AV.toast(AVA.tp ? tr('Third person (C to switch back)', 'Tercera persona (C para volver)') : tr('First person', 'Primera persona')); return AVA.tp };
let bob = 0;
AV.frameFns.push(dt => { if (!AVA.tp || !AV.running || !AV.W) { if (AVA.g) AVA.g.visible = false; return } const riding = AV.act && AV.act.cur && AV.act.cur.id === 'ride'; const g = ensureAvatar(); if (!g) return; g.visible = !riding; if (riding) return;
  const P = AV.P, sp = Math.hypot(P.vx || 0, P.vz || 0); bob += (dt || .016) * (sp > .3 ? 9 : 0); g.position.set(P.x, (P.y || 0) + (sp > .3 ? Math.abs(Math.sin(bob)) * .04 : 0), P.z); g.rotation.y = P.yaw + Math.PI;
  const W = AV.W, f = [-Math.sin(P.yaw), -Math.cos(P.yaw)], back = 3.4; let d = back; for (let t = .8; t <= back; t += .3) { const x = P.x - f[0] * t, z = P.z - f[1] * t; if (W.surface(x, z) === null || !AV.isFree(W, x, z, .2)) { d = Math.max(.9, t - .4); break } }
  AV.cam.position.set(P.x - f[0] * d, (P.y || 0) + 1.95, P.z - f[1] * d); AV.cam.rotation.set(P.pitch - .14, P.yaw, 0) });
addEventListener('load', () => { const k0 = AV.keymap.KeyC; AV.keymap.KeyC = e => { if (AV.act && AV.act.cur && AV.act.cur.id === 'ride') return k0 && k0(e); LW.toggleTP() } });
/* ---------- creator UI ---------- */
const css = document.createElement('style'); css.textContent = '#lwOnb{position:fixed;inset:0;z-index:80;background:radial-gradient(circle at 30% 20%,#3a1a5a,#120a1e 70%);color:#fff;font:14px Georgia,serif;display:none;overflow:auto}#lwOnb .wrap{display:flex;flex-wrap:wrap;gap:16px;max-width:1180px;margin:0 auto;padding:16px}' +
  '#lwOnb .pv{flex:0 0 320px;position:sticky;top:12px;align-self:flex-start;text-align:center}#lwOnb canvas{width:300px;height:420px;border-radius:16px;background:linear-gradient(#2a1a4a,#1a1030);box-shadow:0 6px 24px #000}#lwOnb .form{flex:1 1 520px}#lwOnb h2{margin:4px 0 10px;color:#ffd23a}#lwOnb h4{margin:12px 0 6px;color:#ff8ad8}' +
  '#lwOnb button{font:13px Georgia,serif;margin:2px;padding:6px 10px;border-radius:8px;border:1px solid #6a5a8a;background:#2a1a40;color:#fff;cursor:pointer}#lwOnb button.on{background:#ff4ad2;border-color:#fff}#lwOnb .sw{width:26px;height:26px;border-radius:50%;padding:0;vertical-align:middle}#lwOnb input[type=text]{font:16px Georgia,serif;padding:6px 10px;border-radius:8px;border:1px solid #6a5a8a;background:#1a1030;color:#fff;width:240px}' +
  '#lwOnb .homes{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px}#lwOnb .home{border:1px solid #4a3a6a;border-radius:10px;padding:6px 8px;cursor:pointer;background:#1e1232}#lwOnb .home.on{border-color:#ffd23a;background:#3a2a10}#lwOnb .home small{opacity:.8}#lwOnb .go{font-size:18px;padding:10px 18px;background:#ffd23a;color:#2a1408;border:none;margin-top:12px}';
document.head.appendChild(css);
const ov = document.createElement('div'); ov.id = 'lwOnb'; document.body.appendChild(ov);
let me = null, opt = null, pv = null, mode = 'new';
const CITIES = ['ape_town', 'chiang_mai', 'pai', 'koh_tao', 'amsterdam', 'madrid', 'barcelona', 'sevilla', 'paris', 'vienna', 'tokyo', 'rio', 'oaxaca', 'astro9'];
const wn = w => (AV.worldMeta && (AV.worldMeta(w) || {}).name) || w;
/* 2.3 fix (owner's white screen): ONE preview renderer for the creator's lifetime. It used to create a new WebGLRenderer on every option
   change; dispose() does not free a WebGL context, so after ~16 changes Chrome dropped the OLDEST context = the game's own renderer. */
let pvCanvas = null;
function preview() { const cv = pvCanvas; if (!cv) return; if (!pv) { const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); R.outputEncoding = THREE.sRGBEncoding; R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setSize(300, 420, false);
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x4a3a5a, .9)); const d = new THREE.DirectionalLight(0xffe8d0, 1.1); d.position.set(2, 4, 3); sc.add(d); const cam = new THREE.PerspectiveCamera(32, 300 / 420, .1, 50); cam.position.set(0, 1.05, 4.4); cam.lookAt(0, .92, 0);
    pv = { R, sc, cam, g: null, a: 0, on: true }; const loop = () => { if (!pv || !pv.on) return; pv.a += .012; if (pv.g) pv.g.rotation.y = Math.sin(pv.a) * .9; pv.R.render(pv.sc, pv.cam); requestAnimationFrame(loop) }; loop() }
  if (pv.g) { pv.sc.remove(pv.g); AV.dispose(pv.g) } try { pv.g = LW.buildAvatar(me); pv.sc.add(pv.g); LW.stats.preview = (LW.stats.preview || 0) + 1 } catch (e) { console.warn('preview', e) } }
const sw = (k, list) => list.map(c => '<button class="sw ' + (me[k] === c ? 'on' : '') + '" data-sw="' + k + '" data-v="' + c + '" style="background:#' + c.toString(16).padStart(6, '0') + '"></button>').join('');
const opts = (k, list) => list.map(([v, n]) => '<button class="' + (me[k] === v ? 'on' : '') + '" data-o="' + k + '" data-v="' + v + '">' + esc(say(n)) + '</button>').join('');
function render() { const homes = LW.STARTER_HOMES.filter(id => H.PROPS[id]), P = H.PROPS;
  ov.innerHTML = '<div class="wrap"><div class="pv"><h2>' + (mode === 'edit' ? tr('Your look', 'Tu aspecto') : tr('Who are you?', '¿Quién eres?')) + '</h2><canvas width="300" height="420"></canvas><p><b>' + esc(me.name || tr('(no name yet)', '(sin nombre)')) + '</b></p></div><div class="form">' +
    '<h4>' + tr('Name', 'Nombre') + '</h4><input type="text" id="lwName" maxlength="20" placeholder="' + tr('Your name', 'Tu nombre') + '" value="' + esc(me.name) + '">' +
    '<h4>' + tr('Body', 'Cuerpo') + '</h4>' + opts('body', [['ape', L('ZtonedApe classic (ape)', 'ZtonedApe clásico (simio)')], ['male', L('Male', 'Hombre')], ['female', L('Female', 'Mujer')]]) +
    (me.body === 'ape' ? '<h4>' + tr('Fur', 'Pelaje') + '</h4>' + sw('fur', FURS) : '<h4>' + tr('Skin', 'Piel') + '</h4>' + sw('skin', SKINS) + '<h4>' + tr('Hair', 'Pelo') + '</h4>' + opts('style', STYLES.map(s => [s, L(s[0].toUpperCase() + s.slice(1), s)])) + '<br>' + sw('hair', HAIRC) +
      '<h4>' + tr('Extras', 'Extras') + '</h4>' + (me.body === 'male' ? '<button data-t="beard" class="' + (me.beard ? 'on' : '') + '">' + tr('Beard', 'Barba') + '</button>' : '') + '<button data-t="glasses" class="' + (me.glasses ? 'on' : '') + '">' + tr('Glasses', 'Gafas') + '</button><button data-t="flower" class="' + (me.flower ? 'on' : '') + '">' + tr('Flower', 'Flor') + '</button>') +
    '<h4>' + tr('Top', 'Arriba') + '</h4>' + opts('top', TOPS.map(t => [t[0], t[1]])) + (me.top === 'plain' ? '<br>' + sw('topCol', [0x2a6ad8, 0xd83a3a, 0x3ad87a, 0xffd23a, 0x1a1a1a, 0xf0ece4, 0xff4ad2]) : '') +
    '<h4>' + tr('Bottoms', 'Abajo') + '</h4>' + opts('bot', BOTS.map(b => [b[0], b[1]])) + '<h4>' + tr('Shoes', 'Calzado') + '</h4>' + opts('foot', FEET) +
    (mode === 'new' ? '<h4>' + tr('Start in', 'Empezar en') + '</h4>' + CITIES.filter(w => AV.worldDefs[w]).map(w => '<button data-city="' + w + '" class="' + (opt.city === w ? 'on' : '') + '">' + esc(wn(w)) + '</button>').join('') +
      '<h4>' + tr('Choose two starter homes in different worlds (furnished, yours to keep)', 'Elige dos casas iniciales en mundos distintos (amuebladas, tuyas)') + ' · ' + opt.homes.length + '/2</h4><div class="homes">' + homes.map(id => '<div class="home ' + (opt.homes.includes(id) ? 'on' : '') + '" data-h="' + id + '"><b>' + esc(say(P[id].name)) + '</b><br><small>' + esc(wn(P[id].w)) + ' · ' + esc(say(LW.PROP_CATS[P[id].cat] || LW.PROP_CATS.studio)) + '</small><br><small>' + esc(P[id].desc ? say(P[id].desc) : '') + '</small></div>').join('') + '</div>' +
      '<h4>' + tr('Starter package', 'Paquete inicial') + '</h4><small>' + tr('10 000 credits · a car, a bicycle and a scooter parked at each home (hover vehicles on alien worlds) · phone · snacks and drinks', '10 000 créditos · un coche, una bici y una moto aparcados en cada casa (vehículos flotantes en mundos alienígenas) · teléfono · snacks y bebidas') + '</small><br><label><input type="checkbox" id="lwTut" ' + (opt.tut ? 'checked' : '') + '> ' + tr('Show optional tutorial missions (Pip in Ape Town)', 'Mostrar misiones de tutorial opcionales (Pip en Ape Town)') + '</label><br>' : '') +
    '<button class="go" id="lwGo">' + (mode === 'edit' ? tr('Save my look', 'Guardar mi aspecto') : tr('Start my life in the Apeverse', 'Empezar mi vida en el Apeverse')) + '</button> <button id="lwCancel">' + tr('Back', 'Volver') + '</button> <small id="lwErr" style="color:#ff8a8a"></small></div></div>';
  ov.querySelector('#lwName').oninput = e => { me.name = e.target.value.slice(0, 20); ov.querySelector('.pv b').textContent = me.name || tr('(no name yet)', '(sin nombre)') };
  ov.querySelectorAll('[data-sw]').forEach(b => b.onclick = () => { me[b.dataset.sw] = +b.dataset.v; render() }); ov.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { me[b.dataset.o] = b.dataset.v; render() });
  ov.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { me[b.dataset.t] = !me[b.dataset.t]; render() }); ov.querySelectorAll('[data-city]').forEach(b => b.onclick = () => { opt.city = b.dataset.city; render() });
  ov.querySelectorAll('[data-h]').forEach(b => b.onclick = () => { const id = b.dataset.h, w = H.PROPS[id].w; if (opt.homes.includes(id)) opt.homes = opt.homes.filter(x => x !== id); else { opt.homes = opt.homes.filter(x => H.PROPS[x].w !== w); opt.homes.push(id); if (opt.homes.length > 2) opt.homes.shift() } render() });
  const tu = ov.querySelector('#lwTut'); if (tu) tu.onchange = e => { opt.tut = e.target.checked };
  ov.querySelector('#lwCancel').onclick = () => close(); ov.querySelector('#lwGo').onclick = () => finish();
  if (!pvCanvas) { pvCanvas = document.createElement('canvas'); pvCanvas.width = 300; pvCanvas.height = 420 } const ph = ov.querySelector('canvas'); if (ph && ph !== pvCanvas) ph.replaceWith(pvCanvas); preview() }
function close() { ov.style.display = 'none'; if (pv) { pv.on = false; try { pv.R.forceContextLoss(); pv.R.dispose() } catch (e) { } pv = null } pvCanvas = null }
LW.previewContexts = () => (pv ? 1 : 0);
/* safety net: if the game's WebGL context is ever lost, save and reload (instead of a frozen white world) */
addEventListener('load', () => { const cv = AV.R && AV.R.domElement; if (!cv) return; cv.addEventListener('webglcontextlost', e => { e.preventDefault(); LW.stats.ctxLost = (LW.stats.ctxLost || 0) + 1; try { AV.save() } catch (x) { } AV.toast && AV.toast(tr('The graphics context was lost. Your game is saved; reloading...', 'Se perdió el contexto gráfico. Tu partida está guardada; recargando...')); if (!LW.AUTOTEST) setTimeout(() => location.reload(), 1800) }) });
LW.creator = function (m, edit) { mode = edit ? 'edit' : 'new'; me = Object.assign(LW.defaultMe(), m || {}); opt = { city: 'ape_town', homes: ['at_mushroom_studio', 'cm_nimman_condo'], tut: true }; ov.style.display = 'block'; render(); return ov };
LW.creatorState = () => ({ me, opt });
function finish() { const err = ov.querySelector('#lwErr'); if (!me.name.trim()) { err.textContent = tr('Choose a name first.', 'Elige un nombre primero.'); return }
  if (mode === 'edit') { AV.S.me = Object.assign({}, me); AV.S.name = me.name.trim(); AV.save(); AV.hud && AV.hud(); close(); AV.toast('🪞 ' + tr('Looking good, ', 'Te ves genial, ') + AV.S.name + '!'); return }
  if (opt.homes.length !== 2) { err.textContent = tr('Choose two starter homes.', 'Elige dos casas iniciales.'); return }
  close(); LW.startNew(me, opt) }
/* ---------- the package ---------- */
LW.startNew = function (m, o) { const f = AV.fresh(); f.name = m.name.trim(); f.me = Object.assign({}, m); f.world = o.city; f.lw = { v: 1, rep: {}, grant: 'new', born: 1, pkg: { homes: o.homes.slice(), veh: {}, at: 1 }, tut: !!o.tut };
  const keep = AV.S; AV.S = f; f.homes = f.homes || {}; for (const id of o.homes) { f.homes[id] = { st: 'own', until: 1e9, wall: 0, floor: 0, items: [], stock: {} }; LW.furnish(id) }
  for (const [id, n] of [['water', 2], ['lw_cola', 1], ['lw_coffee_' + (LW.LOCAL[o.city] ? o.city : 'ape_town'), 1], ['lw_street_' + (LW.LOCAL[o.city] ? o.city : 'ape_town'), 2], ['crisps', 1]]) { f.items = f.items || {}; f.items[id] = (f.items[id] || 0) + n }
  const here = o.homes.find(id => H.PROPS[id].w === o.city); if (here) f.homeSpawn = here; if (!o.tut) { f.mis = { a: {}, d: { at_welcome: 1 }, last: {}, f: {} } }
  f.log.unshift({ d: 1, t: 'Starter package: 2 homes + vehicles', a: 0 }); AV.S = keep; LW.stats.started = 'creator'; AV.boot.begin(f) };
const VEHS = w => w === 'astro9' ? [['woblr', 0x7ad8ff], ['hover', 0xff4ad2], ['hoverbike', 0xffd23a]] : [['car', 0x2a6ad8], ['bicycle', 0xd83a3a], ['scooter', 0x3ad87a]];
LW.parkStarterVehicles = function (W) { const pk = AV.S.lw && AV.S.lw.pkg; if (!pk || !AV.veh || !AV.veh.rent || pk.veh[W.id]) return 0; const home = pk.homes.find(id => H.PROPS[id] && H.PROPS[id].w === W.id); if (!home) return 0;
  const door = (H.doors && H.doors[home]) || (W.places || []).find(p => p.id === 'home_' + home); if (!door) return 0; const dx = door.ox != null ? door.ox : door.x, dz = door.oz != null ? door.oz : door.z; let n = 0;
  VEHS(W.id).forEach(([kind, col], i) => { if (!AV.veh.KINDS[kind]) return; const sp = AV.safeSpot(W, dx + 3 + i * 2.6, dz + 3); try { const rec = AV.veh.rent(kind, sp[0], sp[1], AV.veh.openYaw ? AV.veh.openYaw(W, sp[0], sp[1], 0) : 0, { price: 0, col, ride: false, stand: 'owned' }); if (rec) { rec.owned = true; rec.until = 1e9; rec.model = L('Starter ' + kind, kind + ' inicial'); rec.bought = AV.S.day; n++ } } catch (e) { console.warn('starter vehicle', kind, e) } });
  pk.veh[W.id] = n || true; AV.save(); if (n) AV.toast('🔑 ' + tr('Your vehicles are parked outside your home: ', 'Tus vehículos están aparcados frente a tu casa: ') + VEHS(W.id).map(v => (AV.veh.KINDS[v[0]] || {}).icon || '').join(' ')); return n };
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); setTimeout(() => { if (AV.W === W) try { LW.parkStarterVehicles(W) } catch (e) { } }, 900);
  const S = AV.S; if (!AUTO && S.lw && !S.lw.pkg && S.lw.grant !== 'new' && !S.lw.pkgOffered) setTimeout(() => { if (AV.W === W && !AV.blocking() && !S.lw.pkgOffered) LW.packageOffer() }, 6000) } }
/* ---------- old saves: optional one-time package ---------- */
LW.packageOffer = function () { const S = AV.S; S.lw.pkgOffered = 1; AV.save(); const homes = LW.STARTER_HOMES.filter(id => H.PROPS[id] && !(S.homes || {})[id]);
  const p = AV.panel('cmp', '<h3>🎁 ' + tr('Apeverse 2.3 starter package (optional)', 'Paquete inicial de Apeverse 2.3 (opcional)') + '</h3><p>' + tr('New players now start with furnished homes and vehicles. Your money, inventory and missions stay exactly as they are. Pick one free furnished home (a car, bicycle and scooter wait outside it), plus a few snacks:', 'Los jugadores nuevos empiezan con casas amuebladas y vehículos. Tu dinero, inventario y misiones se quedan como están. Elige una casa amueblada gratis (con coche, bici y moto en la puerta) y unos snacks:') + '</p><div style="max-height:46vh;overflow:auto">' +
    homes.map(id => '<div class="lwMis"><b>' + esc(say(H.PROPS[id].name)) + '</b> · <small>' + esc(wn(H.PROPS[id].w)) + '</small><div class="lwBtns"><button data-pk="' + id + '">' + tr('This one', 'Esta') + '</button></div></div>').join('') + '</div><div class="lwBtns"><button data-close>' + tr('No thanks', 'No, gracias') + '</button></div>');
  p.querySelectorAll('[data-pk]').forEach(b => b.onclick = () => { const id = b.dataset.pk; S.homes = S.homes || {}; S.homes[id] = { st: 'own', until: 1e9, wall: 0, floor: 0, items: [], stock: {} }; LW.furnish(id); S.lw.pkg = { homes: [id], veh: {}, at: S.day, old: 1 }; AV.bag.add('water', 2, true); AV.bag.add('lw_cola', 1, true); AV.bag.add('crisps', 1, true); AV.save(); AV.closePanel('cmp');
    AV.toast('🏠 ' + say(H.PROPS[id].name) + tr(' is yours, furnished. Its door and your vehicles appear when you arrive in ', ' es tuya, amueblada. La puerta y tus vehículos aparecen al llegar a ') + wn(H.PROPS[id].w) + '.') }) };
/* ---------- start screen: New game -> creator; Continue -> where to wake up ---------- */
addEventListener('load', () => { const bN = document.getElementById('bNew'), bC = document.getElementById('bCont'); if (!bN || AUTO) return;
  bN.onclick = () => LW.creator();
  const c0 = bC.onclick; bC.onclick = () => { const found = AV.loadSave(); if (!found) return c0 && c0(); if (!LW.wakeChooser(found.s)) c0 && c0() } });
LW.wakeChooser = function (s) { const own = Object.keys(s.homes || {}).filter(id => H.PROPS[id] && s.homes[id].st === 'own'); if (!own.length) return false;
    ov.innerHTML = '<div class="wrap"><div class="form"><h2>' + tr('Where do you wake up?', '¿Dónde te despiertas?') + '</h2><button data-sp="">' + tr('Where I left off', 'Donde lo dejé') + ' · ' + esc(wn(s.world)) + '</button>' + own.map(id => '<button data-sp="' + id + '">🏠 ' + esc(say(H.PROPS[id].name)) + ' · ' + esc(wn(H.PROPS[id].w)) + '</button>').join('') + '</div></div>'; ov.style.display = 'block';
    ov.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { const id = b.dataset.sp; if (id) { s.world = H.PROPS[id].w; s.homeSpawn = id } ov.style.display = 'none'; AV.boot.begin(s) }); return true };
/* ---------- ApePhone: 🪞 Me ---------- */
addEventListener('load', () => { const PH = AV.phone; if (PH && PH.APPS && !PH.APPS.find(a => a.id === 'me')) PH.APPS.splice(2, 0, { id: 'me', ic: '🪞', n: L('Me', 'Yo'), go: () => { AV.closePanel('cmp'); LW.creator(Object.assign({}, AV.S.me || LW.defaultMe(), { name: AV.S.name || (AV.S.me || {}).name || '' }), true) }, out: true }) });
})(window.AV);
