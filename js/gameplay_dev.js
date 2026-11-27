/* APEVERSE 2.2 (Agent 3) - gameplay_dev.js : hidden developer / testing cheats + Family Demo mode.
   DEV MODE is OFF for normal players. Turn it on with ?dev=1 in the address, or by typing  a p e d e v  during play. Then F8 (or the
   🛠 button) opens the Dev panel: +100,000 credits · unlimited credits · vehicle spawner (only kinds allowed in this world, only on free
   ground in front of you) · teleport to a world or a place · unlock all clothing · give any item · refill energy · clear effects ·
   +1 game hour · fast-forward businesses. Every cheat goes through the normal APIs (AV.txn, AV.bag, AV.veh, AV.travel) so the save stays
   valid; the save remembers that dev mode was used (S.devUsed) and money is capped at 1e9.
   FAMILY DEMO: a "👪 Family demo" button on the start screen starts a separate demo save (key apeverse_v09_family — your real save is
   never touched) with 2,500 demo credits, a welcome card, simple instructions, a big travel map to representative worlds, and adult
   content hidden: adult items are not sold or usable, adult venues' doors are hidden, intoxication visuals are off, the Portal Pipe key
   opens the travel map instead. Normal games are unchanged.  API: AV.dev, AV.family */
'use strict';
(function (AV) {
const tr = AV.tr, $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const DEV = AV.dev = { on: /[?&]dev=1\b/.test(location.search), unlimited: false, stats: { used: 0 } };
const say = a => Array.isArray(a) ? tr(a[0], a[1]) : String(a);
/* ---------- turning it on ---------- */
let typed = ''; addEventListener('keydown', e => { if (!AV.running || e.repeat || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; if (e.key.length === 1) { typed = (typed + e.key.toLowerCase()).slice(-6); if (typed === 'apedev') { DEV.enable(!DEV.on) } }
  if (e.code === 'F8' && DEV.on) { e.preventDefault(); DEV.panel() } });
DEV.enable = function (on) { DEV.on = !!on; if (AV.S) { AV.S.devUsed = AV.S.devUsed || DEV.on; AV.save() } btn(); AV.toast && AV.toast(DEV.on ? '🛠 ' + tr('Developer mode ON — F8 or 🛠 opens the cheats.', 'Modo desarrollador ACTIVADO — F8 o 🛠 abre los trucos.') : '🛠 ' + tr('Developer mode off.', 'Modo desarrollador desactivado.')) };
function btn() { let b = $('devBtn'); if (!DEV.on) { if (b) b.remove(); return } if (b) return; b = document.createElement('button'); b.id = 'devBtn'; b.textContent = '🛠'; b.title = 'Dev'; Object.assign(b.style, { position: 'fixed', right: '8px', bottom: '64px', zIndex: 40, fontSize: '20px', padding: '4px 8px', borderRadius: '10px', opacity: .8 }); b.onclick = () => DEV.panel(); document.body.appendChild(b) }
/* ---------- cheats ---------- */
const use = () => { DEV.stats.used++; if (AV.S) AV.S.devUsed = true };
DEV.money = n => { if (!DEV.on || !AV.S) return false; use(); n = Math.min(n || 100000, 1e9 - AV.S.money); return n > 0 && AV.txn(n, tr('Dev: test credits', 'Dev: créditos de prueba')) };
const txn0 = AV.txn; AV.txn = function (amount, why) { if (DEV.on && DEV.unlimited && amount < 0 && AV.S && AV.S.money + amount < 0) { AV.S.money = Math.min(1e9, AV.S.money - amount + 1000) } return txn0.apply(this, arguments) };
DEV.setUnlimited = on => { if (!DEV.on) return false; use(); DEV.unlimited = !!on; return true };
DEV.spawnVehicle = function (kind) {
  if (!DEV.on || !AV.W || !AV.veh) return false; const W = AV.W, G = AV.garage, K = AV.veh.KINDS[kind]; if (!K) return fail('Unknown vehicle kind.');
  if (G && G.allowed && !G.allowed(W.id, kind)) return fail(tr(say(K.n) + ' is not allowed in this world.', say(K.n) + ' no está permitido en este mundo.')); if (AV.act && AV.act.cur) return fail(tr('Get off first.', 'Bájate primero.'));
  const P = AV.P; let spot = null; for (const d of [3, 4.5, 6, 8]) for (const a of [0, .4, -.4, .8, -.8]) { const x = P.x - Math.sin(P.yaw + a) * d, z = P.z - Math.cos(P.yaw + a) * d; if (!spot && W.surface(x, z) !== null && Math.abs((W.surface(x, z) || 0) - P.y) < .6 && AV.isFree(W, x, z, kind === 'car' || kind === 'woblr' || kind === 'tuktuk' ? 1.6 : .9)) spot = [x, z] }
  if (!spot) return fail(tr('No free flat ground in front of you — step into the open and try again.', 'No hay suelo libre delante — sal a un sitio abierto y prueba otra vez.'));
  use(); /* through the normal vehicle API (same as a dealer purchase), so the record is valid and saved like any owned vehicle */
  const rec = AV.veh.rent(kind, spot[0], spot[1], P.yaw, { price: 0, col: [0xff4ad2, 0x4ad8ff, 0xffd84a][DEV.stats.used % 3], ride: false, stand: 'owned' }); if (!rec) return fail(tr('The vehicle could not be placed here.', 'No se pudo colocar el vehículo aquí.'));
  rec.owned = true; rec.until = 1e9; rec.dev = true; rec.bought = AV.S.day; AV.save(); AV.toast('🛠 ' + K.icon + ' ' + say(K.n) + tr(' spawned (owned, in your garage).', ' creado (tuyo, en tu garaje).')); return rec };
DEV.teleport = function (wid, placeId) { if (!DEV.on) return false; use(); if (wid && (!AV.W || AV.W.id !== wid)) { if (!AV.worldDefs[wid]) return fail('Unknown world.'); AV.travel(wid); if (placeId) DEV._after = placeId; return true } return goPlace(placeId) };
function goPlace(pid) { const W = AV.W, p = W && (W.places || []).find(q => q.id === pid); if (!p) return fail(tr('Unknown place.', 'Lugar desconocido.')); const s = AV.safeSpot(W, p.x, p.z), P = AV.P; P.x = s[0]; P.z = s[1]; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vy = P.vz = 0; if (p.yaw != null) P.yaw = p.yaw; AV.toast('🛠 ' + say(p.name)); return true }
DEV.unlockClothes = function () { if (!DEV.on || !AV.merch) return 0; use(); const C = AV.merch.cat, gs = Object.keys(AV.merch.GAR || { tee: 1 }); let n = 0; for (const d of (C.designs || []).concat(AV.merch.custom || [])) for (const g of gs) { const id = AV.merch.itemId(d.id, g); if (!AV.bag.count(id) && AV.ITEMS[id]) { AV.bag.add(id, 1, true); n++ } } AV.save(); AV.toast('🛠 ' + n + tr(' garments added to the backpack.', ' prendas añadidas a la mochila.')); return n };
DEV.give = (id, n) => { if (!DEV.on || !AV.ITEMS[id]) return false; use(); AV.bag.add(id, n || 1); return true };
DEV.energy = () => { if (!DEV.on || !AV.vitals) return false; use(); const v = AV.vitals.get(); v.energy = 100; v.vibe = Math.max(v.vibe, 70); AV.hud(); return true };
DEV.clearFx = () => { if (!DEV.on) return false; AV.fx.reset(); return true };
DEV.hour = () => { if (!DEV.on) return false; use(); AV.S.time += 60; if (AV.S.time >= 1440) { AV.S.time -= 1440; AV.S.day++ } AV.hud(); return true };
DEV.ffBiz = () => { if (!DEV.on || !AV.vent) return false; use(); for (const id in (AV.S.vent || {})) AV.vent._ff(id, 180); AV.toast('🛠 ' + tr('Businesses: +3 game hours simulated.', 'Negocios: +3 horas de juego simuladas.')); return true };
function fail(m) { AV.toast && AV.toast('⚠️ ' + m); DEV.lastErr = m; return false }
const prevE = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevE) prevE(W); if (DEV._after) { const p = DEV._after; DEV._after = null; setTimeout(() => goPlace(p), 300) } btn(); FAM.apply(W) };
DEV.panel = function () { if (!DEV.on) return; const W = AV.W, kinds = Object.keys(AV.veh ? AV.veh.KINDS : {}).filter(k => !AV.garage || !AV.garage.allowed || AV.garage.allowed(W.id, k)), worlds = Object.keys(AV.worldDefs);
  const p = AV.panel('cmp', '<b>🛠 ' + tr('Developer cheats', 'Trucos de desarrollador') + '</b><div class="note">' + tr('Testing only. Your save remembers dev mode was used.', 'Solo para pruebas. La partida recuerda que se usó el modo dev.') + '</div>' +
    '<div class="grid"><button id="dvM">+100,000 ¢</button><button id="dvU">' + (DEV.unlimited ? '✅ ' : '') + tr('Unlimited credits', 'Créditos ilimitados') + '</button><button id="dvE">⚡ ' + tr('Refill energy', 'Recargar energía') + '</button><button id="dvX">🧼 ' + tr('Clear effects', 'Quitar efectos') + '</button><button id="dvC">👕 ' + tr('Unlock clothing', 'Desbloquear ropa') + '</button><button id="dvH">⏩ +1 h</button><button id="dvB">💼 ' + tr('Fast-forward businesses', 'Avanzar negocios') + '</button></div>' +
    '<p>🚗 ' + tr('Spawn vehicle', 'Crear vehículo') + ': ' + kinds.map(k => '<button data-vk="' + k + '">' + AV.veh.KINDS[k].icon + '</button>').join('') + '</p>' +
    '<p>🎁 ' + tr('Give item', 'Dar objeto') + ': <select id="dvI">' + Object.keys(AV.ITEMS).filter(k => !/^wear_/.test(k)).sort().map(k => '<option value="' + k + '">' + esc(AV.ITEMS[k].ic + ' ' + say(AV.ITEMS[k].n)) + '</option>').join('') + '</select><button id="dvG">' + tr('Give', 'Dar') + '</button></p>' +
    '<p>🌍 ' + tr('Teleport', 'Teletransporte') + ': <select id="dvW">' + worlds.map(w => '<option' + (W && w === W.id ? ' selected' : '') + '>' + w + '</option>').join('') + '</select><button id="dvWg">' + tr('Go', 'Ir') + '</button> <select id="dvP">' + ((W && W.places) || []).filter(q => q.x != null && !q.hidden).map(q => '<option value="' + esc(q.id) + '">' + esc(say(q.name)) + '</option>').join('') + '</select><button id="dvPg">' + tr('Go', 'Ir') + '</button></p>' +
    '<div class="note" id="dvMsg"></div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
  const on = (id, f) => { const b = $(id); if (b) b.onclick = () => { const r = f(); const m = $('dvMsg'); if (m) m.textContent = r === false ? '⚠️ ' + (DEV.lastErr || 'failed') : '✔ ' + tr('done', 'hecho') + ' · ' + AV.S.money + ' ¢' } };
  on('dvM', () => DEV.money(100000)); on('dvU', () => { DEV.setUnlimited(!DEV.unlimited); DEV.panel() }); on('dvE', DEV.energy); on('dvX', DEV.clearFx); on('dvC', DEV.unlockClothes); on('dvH', DEV.hour); on('dvB', DEV.ffBiz);
  on('dvG', () => DEV.give($('dvI').value)); on('dvWg', () => { AV.closePanel('cmp'); return DEV.teleport($('dvW').value) }); on('dvPg', () => DEV.teleport(null, $('dvP').value));
  p.querySelectorAll('[data-vk]').forEach(b => b.onclick = () => { const r = DEV.spawnVehicle(b.dataset.vk); const m = $('dvMsg'); if (m) m.textContent = r ? '✔ ' + tr('spawned', 'creado') : '⚠️ ' + DEV.lastErr }) };
if (DEV.on) setTimeout(btn, 500);

/* ======================= FAMILY DEMO ======================= */
const FAM = AV.family = { KEY: 'apeverse_v09_family', stats: { hidden: 0 } };
FAM.on = () => !!(AV.S && AV.S.family);
const ADULT_RX = /adults?\b|\+18|18\+|20\+|cannabis|herb|nargila|narguile|coffeeshop|La Nube|leaf shack|pre-roll|porro|hierba|dub yard|bar gorila|Bar premises/i;
FAM.WORLDS = ['ape_town', 'chiang_mai', 'madrid', 'vienna', 'astro9', 'nimbus', 'koh_tao', 'koh_samui_jurassic', 'verdalux'];
FAM.start = function () { AV.saveKey = FAM.KEY; AV._bakFor = null; const f = AV.fresh(); f.family = true; f.money = 2500; f.log = [{ d: 1, t: tr('Family demo credits', 'Créditos de demo familiar'), a: 2500 }]; f.set = Object.assign({}, f.set || {}, { noIntox: true }); AV.boot.begin(f); setTimeout(FAM.welcome, 2500) };
FAM.welcome = function () { if (!FAM.on()) return; AV.panel('cmp', '<b>👪 ' + tr('Welcome to the Apeverse!', '¡Bienvenidos al Apeverse!') + '</b><div class="note" style="font-size:15px;line-height:1.5">' +
  tr('🚶 <b>Move</b>: W A S D (or the joystick) · <b>Run</b>: Shift<br>🖐️ <b>Talk, shop, ride</b>: walk up to something with a label and press <b>E</b><br>🗺️ <b>Travel</b>: press <b>T</b> (or the button below) to visit another world<br>🎒 <b>Backpack</b>: I · 📱 <b>Phone</b>: Z (maps, garage, music)<br>🛵 <b>Drive</b>: buy or rent a scooter at a dealer, press E next to it, W to go, Esc to get off<br>💳 You have <b>2,500 demo credits</b> to spend.',
    '🚶 <b>Moverse</b>: W A S D (o el joystick) · <b>Correr</b>: Shift<br>🖐️ <b>Hablar, comprar, montar</b>: acércate a algo con etiqueta y pulsa <b>E</b><br>🗺️ <b>Viajar</b>: pulsa <b>T</b> (o el botón de abajo)<br>🎒 <b>Mochila</b>: I · 📱 <b>Teléfono</b>: Z<br>🛵 <b>Conducir</b>: compra o alquila una moto, pulsa E a su lado, W para ir, Esc para bajar<br>💳 Tienes <b>2.500 créditos de demo</b>.') +
  '</div><div class="grid">' + FAM.WORLDS.filter(w => AV.worldDefs[w]).map(w => '<button data-fw="' + w + '">' + esc((AV.worldMeta(w) || {}).name || w) + '</button>').join('') + '</div><button data-close>' + tr('Let’s explore!', '¡A explorar!') + '</button>');
  document.querySelectorAll('#cmp [data-fw]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); AV.travel(b.dataset.fw) }) };
FAM.map = () => FAM.welcome();
/* hide adult interactions in the world; refuse adult items; no intoxication visuals; the Portal Pipe key opens the map */
FAM.apply = function (W) { if (!FAM.on() || !W) return; AV.S.set.noIntox = true; for (const t of W.T) { const l = (() => { try { return typeof t.label === 'function' ? t.label() : String(t.label) } catch (e) { return '' } })(); if (ADULT_RX.test(l) && !t.__fam) { const s0 = t.show; t.show = () => !FAM.on() && (!s0 || s0()); t.__fam = 1; FAM.stats.hidden++ } } };
FAM.hidesLabel = l => ADULT_RX.test(l);
if (AV.bag && AV.bag.use) { const u0 = AV.bag.use; AV.bag.use = function (id) { const d = AV.ITEMS[id]; if (FAM.on() && d && d.adult) return AV.toast(tr('Not available in the family demo.', 'No disponible en la demo familiar.')); return u0.apply(this, arguments) } }
{ const kp = AV.keymap.KeyP; AV.keymap.KeyP = function () { if (FAM.on()) return FAM.welcome(); return kp && kp.apply(this, arguments) } }
/* a small tips line while in the demo */
let tipT = 0; AV.frameFns.push(dt => { if (!FAM.on() || !AV.running) { const e = $('famTip'); if (e) e.remove(); return } if ((tipT -= dt) > 0) return; tipT = 1; let e = $('famTip'); if (!e) { e = document.createElement('div'); e.id = 'famTip'; Object.assign(e.style, { position: 'fixed', left: '50%', bottom: '10px', transform: 'translateX(-50%)', background: 'rgba(20,10,40,.75)', color: '#fff', padding: '6px 12px', borderRadius: '12px', font: '13px system-ui,sans-serif', zIndex: 30, pointerEvents: 'none' }); document.body.appendChild(e) }
  const n = AV.nearTarget && AV.nearTarget(); e.textContent = '👪 ' + (n ? tr('Press E: ', 'Pulsa E: ') + (typeof n.label === 'function' ? n.label() : n.label) : tr('Explore! E = interact · T = travel map · I = backpack · Z = phone', '¡Explora! E = interactuar · T = mapa · I = mochila · Z = teléfono')) });
/* the start-screen button */
{ const b0 = $('bNew'); if (b0 && !$('bFam')) { const b = document.createElement('button'); b.id = 'bFam'; b.textContent = '👪 ' + tr('Family demo', 'Demo familiar'); b.title = tr('A separate demo save: adult content hidden, 2,500 demo credits, simple controls.', 'Partida de demo aparte: sin contenido adulto, 2.500 créditos, controles sencillos.'); b.onclick = () => FAM.start(); b0.parentNode.appendChild(b) } }
})(window.AV);
