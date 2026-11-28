/* APEVERSE 2.3 - lw_police.js : Milestone G - a light "small GTA" loop with Apeverse's own tone (owner brief: stealing bikes / vehicles,
   police reaction, wanted stars, chases, hospital respawn).  Crime is optional: police only appear when you are wanted.
   - Theft: a few civilian vehicles are parked in every city (cars, scooters; hover craft on Astro-9): "🎭 Steal it" puts you in the driver's
     seat.  Rental stands also offer "take one without paying".  If anyone is around (characters or crowds within 18 m) they report you:
     car +2 ★, scooter / bike +1 ★.  Nobody around = a clean getaway.
   - Wanted 1-5 ★ (HUD).  Officers on foot (1 per star, max 5) run to you; from 3 ★ a police car with light bar and the recorded siren
     (public-domain recording) joins.  Regional police (name, colours, response strength).
   - Arrest: an officer next to you for 1.5 s while you are on foot or slow -> BUSTED: fine 120 x stars, the stolen vehicle is impounded,
     stars cleared, released at the station.  🙌 Surrender (button / phone) = arrest at half the fine.
   - Escape: out of sight of police for 18 s per star -> one star less; hiding inside a building (walls on 3 sides) doubles the speed.
   - Health 0-100: crashes while riding (by impact speed) and hard falls hurt; at 0 -> "WASTED"-style fade -> you wake up at the city's
     hospital, a walk-in building with a heal counter; medical fee 150 (LW.CFG.medFee), wanted cleared, homes / money / missions kept
     (a timed mission in progress fails and can be retried).  Hospitals heal for 30 ¢.
   Non-graphic, no weapons yet (stylised punches stay as they were).  Save: S.lw.hp, S.lw.wanted (cleared on load). */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, say = LW.say;
LW.CFG.medFee = 150;
const PO = LW.police = { stars: 0, cops: [], car: null, stats: { thefts: 0, arrests: 0, escapes: 0, deaths: 0, reports: 0 }, lastSeen: 0 };
const REG = { amsterdam: ['Politie', 0x1a3a8a, 1], madrid: ['Policía', 0x1a2a5a, 1], barcelona: ['Mossos', 0x1a2a5a, 1], sevilla: ['Policía', 0x1a2a5a, 1], cadiz: ['Policía', 0x1a2a5a, 1], paris: ['Police', 0x1a2a6a, 1.1], vienna: ['Polizei', 0x2a3a4a, 1.1],
  tokyo: ['警察 Keisatsu', 0x1a1a3a, 1.4], chiang_mai: ['ตำรวจ Police', 0x5a4a2a, .8], pai: ['ตำรวจ Police', 0x5a4a2a, .6], koh_tao: ['ตำรวจ Police', 0x5a4a2a, .6], rio: ['Polícia', 0x2a3a2a, 1], oaxaca: ['Policía', 0x1a2a4a, .9], ape_town: ['Ape Patrol', 0x6a2a8a, .7], astro9: ['Station Security', 0x2a6a8a, 1.2] };
const reg = () => REG[AV.W && AV.W.id] || ['Police', 0x1a2a5a, 1];
const st = () => { const s = LW.st(); if (s.hp == null) s.hp = 100; return s };
LW.hp = () => st().hp;
/* ---------- HUD ---------- */
const hud = document.createElement('div'); hud.id = 'lwWanted'; hud.style.cssText = 'position:fixed;right:12px;top:245px;z-index:31;font:20px Georgia,serif;color:#ffd23a;text-shadow:0 0 6px #000;text-align:right;pointer-events:none';
document.body.appendChild(hud); const sb = document.createElement('button'); sb.textContent = '🙌 ' + tr('Surrender', 'Rendirse'); sb.style.cssText = 'position:fixed;right:12px;top:300px;z-index:31;display:none;font:13px Georgia,serif;padding:5px 10px;border-radius:8px;background:#2a1a40;color:#fff;border:1px solid #ffd23a;cursor:pointer'; sb.onclick = () => LW.surrender(); document.body.appendChild(sb);
function drawHud() { const s = st(); hud.innerHTML = (PO.stars ? '<span style="color:#ff4a4a">' + '★'.repeat(PO.stars) + '</span>' + '☆'.repeat(5 - PO.stars) + '<br><small style="font-size:12px">' + say(L(reg()[0] + ' are after you', reg()[0] + ' te persiguen')) + '</small><br>' : '') + '<small style="font-size:13px;color:' + (s.hp < 35 ? '#ff6a6a' : '#9aff9a') + '">❤ ' + Math.round(s.hp) + '</small>'; sb.style.display = PO.stars ? 'block' : 'none' }
/* ---------- crime + witnesses ---------- */
function witnesses() { const W = AV.W, P = AV.P; let n = 0; for (const t of W.T) if (t.npc && Math.hypot(t.npc.g.position.x - P.x, t.npc.g.position.z - P.z) < 18) n++; const C = AV.city && AV.city.near ? AV.city.near(P.x, P.z, 18) : null; if (C && C.length) n += C.length; for (const c of PO.cops) if (Math.hypot(c.g.position.x - P.x, c.g.position.z - P.z) < 30) n += 3; return n }
LW.crime = function (stars, what) { const n = witnesses() + (LW._forceWitness ? 1 : 0); if (!n) { AV.toast('🤫 ' + tr('Nobody saw a thing.', 'Nadie ha visto nada.')); return 0 } PO.stats.reports++; setStars(Math.min(5, PO.stars + stars)); AV.toast('🚨 ' + tr('Someone called the ', 'Alguien ha llamado a ') + reg()[0] + ': ' + say(what) + ' ' + '★'.repeat(PO.stars)); PO.lastSeen = AV.now(); return PO.stars };
function setStars(n) { PO.stars = Math.max(0, Math.min(5, n)); st().wanted = PO.stars; syncCops(); drawHud(); if (AV.mis) AV.mis.emit('wanted', PO.stars) }
LW.setStars = setStars;
/* ---------- civilian vehicles to steal ---------- */
const PARK = [];
function parkCivilians(W) { PARK.length = 0; if (!AV.veh || !W.ctx) return; const a9 = W.id === 'astro9', list = a9 ? [['woblr', 0xd8d8e8], ['hoverbike', 0x8a3ad8]] : [['car', 0x8a1a1a], ['car', 0xd8d8d0], ['scooter', 0x2a2a2a], ['scooter', 0xd8a020]];
  const ps = (W.places || []).filter(p => isFinite(p.x) && !/^home_|^lw_|^vent_/.test(p.id)); for (let i = 0; i < list.length && ps.length; i++) { const p = ps[(i * 5 + 3) % ps.length], sp = AV.safeSpot(W, p.x + 6 + i, p.z - 5); const [kind, col] = list[i]; if (!AV.veh.KINDS[kind]) continue;
    try { const g = new THREE.Mesh(AV.veh.geo(kind, col), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5 })); g.material.userData.lin = 1; g.position.set(sp[0], W.surface(sp[0], sp[1]) || 0, sp[1]); g.rotation.y = i * 1.3; W.ctx.group.add(g);
      const rec = { kind, col, g, x: sp[0], z: sp[1], yaw: i * 1.3 }; PARK.push(rec); W.cols.push([sp[0] - (kind === 'car' || kind === 'woblr' ? 1.1 : .5), sp[0] + (kind === 'car' || kind === 'woblr' ? 1.1 : .5), sp[1] - (kind === 'car' || kind === 'woblr' ? 1.1 : .5), sp[1] + (kind === 'car' || kind === 'woblr' ? 1.1 : .5)]); rec.col = W.cols[W.cols.length - 1];
      W.T.push({ x: sp[0] + 1.6, z: sp[1], r: 2.4, label: () => '🎭 ' + tr('Steal this ', 'Robar este ') + say(AV.veh.KINDS[kind].n).toLowerCase() + tr(' (crime: police if seen)', ' (delito: policía si te ven)'), fn: () => LW.steal(rec), show: () => !rec.gone, lwCrime: true }) } catch (e) { console.warn('park', e) } } }
LW.parked = () => PARK;
LW.steal = function (rec) { if (rec.gone) return null; rec.gone = true; rec.g.parent && rec.g.parent.remove(rec.g); const W = AV.W, i = W.cols.indexOf(rec.col); if (i >= 0) W.cols.splice(i, 1);
  const v = AV.veh.rent(rec.kind, rec.x, rec.z, rec.yaw, { price: 0, col: rec.col, stand: 'stolen', ride: true }); if (v) { v.stolen = true; v.until = AV.S.day } PO.stats.thefts++; AV.audio && AV.audio.blip && AV.audio.blip(180, .12, 'square', .1);
  AV.toast('🎭 ' + tr('Hot-wired. Drive!', 'Haciendo el puente. ¡Arranca!')); LW.crime(/car|woblr/.test(rec.kind) ? 2 : 1, /car|woblr/.test(rec.kind) ? L('car theft', 'robo de coche') : L('vehicle theft', 'robo de vehículo')); return v };
/* rental stands: take one without paying */
function standThefts(W) { for (const t of W.T.slice()) { let l = ''; try { l = typeof t.label === 'function' ? t.label() : String(t.label || '') } catch (e) { } const m = l.match(/Rent an? (e-scooter|scooter|bicycle|tuk-tuk)/i); if (!m || t.lwCrime) continue; const kind = { 'e-scooter': 'escooter', scooter: 'scooter', bicycle: 'bicycle', 'tuk-tuk': 'tuktuk' }[m[1].toLowerCase()];
  if (!AV.veh.KINDS[kind]) continue; W.T.push({ x: t.x + 1.4, z: t.z + 1.4, r: 1.8, label: () => '🎭 ' + tr('Take one without paying (crime)', 'Llevarte uno sin pagar (delito)'), fn: () => { const sp = AV.safeSpot(W, t.x + 2, t.z + 2); const v = AV.veh.rent(kind, sp[0], sp[1], 0, { price: 0, stand: 'stolen', ride: true }); if (v) v.stolen = true; PO.stats.thefts++; LW.crime(1, L('bike / scooter theft', 'robo de bici / moto')) }, lwCrime: true }) } }
/* ---------- police: officers on foot + a patrol car ---------- */
AV.NPCS.lw_cop = { name: 'Officer', title: ['police', 'policía'], col: '#7ad8ff', look: { fur: 0x6a4a32, shirt: 0x1a2a5a, hat: 0x1a1a2a }, persona: 'police', greet: c => [c.t('Move along.', 'Circule.')], barks: c => [c.t('Stop right there!', '¡Alto ahí!'), c.t('Hands where I can see them!', '¡Las manos donde las vea!')], chips: () => [], intents: [] };
function mkCop(W, x, z) { const sp = AV.safeSpot(W, x, z); const look = Object.assign({}, AV.NPCS.lw_cop.look, { shirt: reg()[1] }); const g = AV.npc.softBody('lw_cop_' + PO.cops.length, look); g.position.set(sp[0], W.surface(sp[0], sp[1]) || 0, sp[1]); W.ctx.group.add(g); AV.lin(g); return { g, W, near: 0 } }
function syncCops() { const W = AV.W; if (!W || !W.ctx) return; const want = Math.min(5, Math.ceil(PO.stars * reg()[2]));
  while (PO.cops.length > want) { const c = PO.cops.pop(); c.g.parent && c.g.parent.remove(c.g) }
  const P = AV.P; while (PO.cops.length < want) { const a = Math.random() * 6.28, r = 28 + Math.random() * 10; PO.cops.push(mkCop(W, P.x + Math.cos(a) * r, P.z + Math.sin(a) * r)) }
  if (PO.stars >= 3 && !PO.car) { try { const g = new THREE.Group(), body = new THREE.Mesh(AV.veh.geo('car', 0xf0f0f0), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5 })); body.material.userData.lin = 1; g.add(body); const bar = new THREE.Mesh(AV.G.box, new THREE.MeshBasicMaterial({ color: 0xff2a2a })); bar.position.set(0, 1.6, 0); bar.scale.set(1, .15, .3); g.add(bar);
      const a = Math.random() * 6.28, sp = AV.safeSpot(W, P.x + Math.cos(a) * 45, P.z + Math.sin(a) * 45); g.position.set(sp[0], W.surface(sp[0], sp[1]) || 0, sp[1]); W.ctx.group.add(g); PO.car = { g, bar, W, siren: siren(g) } } catch (e) { console.warn('police car', e) } }
  if (PO.stars < 3 && PO.car) dropCar() }
function dropCar() { if (!PO.car) return; PO.car.g.parent && PO.car.g.parent.remove(PO.car.g); if (PO.car.siren) try { PO.car.siren.s.stop(); PO.car.siren.g.disconnect() } catch (e) { } PO.car = null }
let sirenBuf = null; function siren() { const A = AV.audio; if (!A || !A.ok || !A.ctx) return null; const c = A.ctx; const make = b => { const s = c.createBufferSource(), g = c.createGain(), p = c.createStereoPanner ? c.createStereoPanner() : null; s.buffer = b; s.loop = true; g.gain.value = 0; s.connect(g); (p ? (g.connect(p), p) : g).connect(A.mediaBus || c.destination); s.start(); return { s, g, p } };
  const out = { s: null, g: null, p: null }; if (sirenBuf) Object.assign(out, make(sirenBuf)); else fetch('assets/sfx/cc0_commons/siren_police.ogg').then(r => r.arrayBuffer()).then(b => c.decodeAudioData(b)).then(b => { sirenBuf = b; if (PO.car) Object.assign(PO.car.siren || (PO.car.siren = out), make(b)) }).catch(() => { }); return out }
/* ---------- per frame: chase, arrest, escape, health ---------- */
let lastV = 0, airY = null, tk = 0;
AV.frameFns.push(dt => { if (!AV.running || !AV.W || LW.CFG.police === false) return; dt = Math.min(.05, dt || .016); const P = AV.P, W = AV.W, now = AV.now(), riding = AV.act && AV.act.cur && AV.act.cur.id === 'ride', rv = riding ? Math.abs(AV.act.cur.v || 0) : Math.hypot(P.vx || 0, P.vz || 0);
  /* health: crashes + falls */
  if (riding) { const s = AV.act.cur; if (s.bumps > (s._lwB || 0)) { s._lwB = s.bumps; const dmg = Math.min(60, Math.max(4, lastV * 2.2)); LW.hurt(dmg, L('crash', 'choque')) } lastV = Math.abs(s.v || 0) } else lastV = 0;
  if (!P.on) { if (airY == null || P.y > airY) airY = P.y } else if (airY != null) { const fall = airY - P.y; airY = null; if (fall > 4.5 && !riding) LW.hurt((fall - 4.5) * 12, L('a bad fall', 'una mala caída')) }
  if (now - tk > .25) { tk = now; drawHud() }
  if (!PO.stars) return; let seen = false;
  for (const c of PO.cops) { if (c.W !== W) continue; const g = c.g, dx = P.x - g.position.x, dz = P.z - g.position.z, d = Math.hypot(dx, dz); if (d < 35) seen = true;
    if (d > 1.1) { const sp = (3.6 + PO.stars * .3) * dt, nx = g.position.x + dx / d * sp, nz = g.position.z + dz / d * sp; if (W.surface(nx, nz) !== null && AV.isFree(W, nx, nz, .3)) { g.position.x = nx; g.position.z = nz } else { const ax = g.position.x + dz / d * sp, az = g.position.z - dx / d * sp; if (W.surface(ax, az) !== null && AV.isFree(W, ax, az, .3)) { g.position.x = ax; g.position.z = az } } g.position.y = W.surface(g.position.x, g.position.z) || 0; g.rotation.y = Math.atan2(dx, dz) }
    if (d < 1.7 && rv < 3) { c.near += dt; if (c.near > 1.5) return LW.arrest(false) } else c.near = Math.max(0, c.near - dt) }
  if (PO.car && PO.car.W === W) { const g = PO.car.g, dx = P.x - g.position.x, dz = P.z - g.position.z, d = Math.hypot(dx, dz); if (d < 50) seen = true; if (d > 6) { const sp = Math.min(14, 6 + PO.stars * 1.5) * dt, nx = g.position.x + dx / d * sp, nz = g.position.z + dz / d * sp; if (W.surface(nx, nz) !== null) { g.position.x = nx; g.position.z = nz; g.position.y = W.surface(nx, nz) || 0 } g.rotation.y = Math.atan2(dx, dz) }
    PO.car.bar.material.color.setHex(Math.floor(now * 4) % 2 ? 0xff2a2a : 0x2a5aff); const sr = PO.car.siren; if (sr && sr.g) { sr.g.gain.value = Math.max(0, .5 - d / 120) * ((AV.S.set && AV.S.set.vv) == null ? 1 : AV.S.set.vv); if (sr.p) { const rx = dx * Math.cos(P.yaw) - dz * Math.sin(P.yaw); sr.p.pan.value = Math.max(-1, Math.min(1, -rx / 30)) } } }
  if (seen) PO.lastSeen = now; const hide = LW.enclosed && LW.enclosed(W, P.x, P.z) ? 2 : 1; if (now - PO.lastSeen > 18 / hide) { PO.lastSeen = now; setStars(PO.stars - 1); if (!PO.stars) { PO.stats.escapes++; AV.toast('😎 ' + tr('You lost them. Wanted level cleared.', 'Los has despistado. Ya no te buscan.')) } else AV.toast(tr('They are losing your trail... ', 'Están perdiendo tu rastro... ') + '★'.repeat(PO.stars)) } });
LW.arrest = function (surrender) { const s = PO.stars || 1, fine = Math.round(120 * s * (surrender ? .5 : 1)); PO.stats.arrests++; const paid = Math.min(fine, AV.S.money); if (paid > 0) AV.txn(-paid, reg()[0] + (surrender ? ': fine (surrendered)' : ': fine'));
  for (const r of (AV.S.veh && AV.S.veh.list || []).filter(r => r.stolen)) AV.veh.giveBack(r); if (AV.act && AV.act.cur && AV.act.cur.id === 'ride') AV.act.end('arrest'); setStars(0); dropCar();
  AV.fadeTo(1, 250); setTimeout(() => { const W = AV.W, ar = W.arrivals[W.defaultArrival] || W.arrivals.default || Object.values(W.arrivals)[0], sp = AV.safeSpot(W, ar.x, ar.z), P = AV.P; P.x = sp[0]; P.z = sp[1]; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; AV.fadeTo(0, 600) }, 280);
  AV.toast('🚔 ' + (surrender ? tr('You put your hands up. ', 'Levantas las manos. ') : tr('BUSTED! ', '¡DETENIDO! ')) + tr('Fine ', 'Multa ') + paid + ' ¢' + tr('. Stolen vehicles impounded. Released at the station.', '. Vehículos robados incautados. Liberado en comisaría.')); AV.save(); return paid };
LW.surrender = () => PO.stars ? LW.arrest(true) : 0;
LW.hurt = function (dmg, why) { const s = st(); if (PO.dead) return; s.hp = Math.max(0, s.hp - dmg); AV.toast('❤ -' + Math.round(dmg) + ' (' + say(why) + ')'); if (s.hp <= 0) LW.die(why); drawHud() };
LW.heal = n => { const s = st(); s.hp = Math.min(100, s.hp + n); drawHud() };
LW.die = function (why) { if (PO.dead) return; PO.dead = true; PO.stats.deaths++; const W = AV.W, h = (LW.hospital || {})[W.id]; if (AV.act && AV.act.cur) try { AV.act.end('down') } catch (e) { }
  const m = AV.mis && AV.mis.st(); if (m) for (const id in m.a) { const s2 = AV.mis.cur(id); if (s2 && s2.time) AV.mis.fail(id, L('You ended up in hospital.', 'Acabaste en el hospital.')) }
  const ov = document.getElementById('lwDown') || Object.assign(document.createElement('div'), { id: 'lwDown' }); ov.style.cssText = 'position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:rgba(80,0,0,.55);color:#fff;font:bold 54px Georgia,serif;letter-spacing:6px;text-shadow:0 0 12px #000'; ov.textContent = tr('KNOCKED OUT', 'K.O.'); document.body.appendChild(ov); AV.fadeTo(1, 900);
  setTimeout(() => { const P = AV.P, sp = h ? h.front : (() => { const ar = W.arrivals.default || Object.values(W.arrivals)[0]; return AV.safeSpot(W, ar.x, ar.z) })(); P.x = sp[0]; P.z = sp[1]; P.y = W.surface(P.x, P.z) || 0; P.vx = P.vz = 0; setStars(0); dropCar(); st().hp = 100; const fee = Math.min(LW.CFG.medFee, AV.S.money); if (fee > 0) AV.txn(-fee, 'Hospital: medical fee'); ov.remove(); AV.fadeTo(0, 900); PO.dead = false;
    AV.toast('🏥 ' + tr('You wake up at ', 'Te despiertas en ') + (h ? h.name : tr('the clinic', 'la clínica')) + tr('. Patched up. Fee ', '. Curado. Tarifa ') + fee + ' ¢. ' + tr('Your homes, money and missions are safe.', 'Tus casas, dinero y misiones están a salvo.')); AV.save() }, 1800) };
/* ---------- hospitals: a walk-in building with a heal counter, near each city's arrival ---------- */
LW.hospital = {};
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); PO.cops.length = 0; PO.car = null; PO.stars = 0; airY = null; if (!W || !W.ctx || LW.CFG.police === false) return; if (st().wanted) st().wanted = 0;
  try { parkCivilians(W); standThefts(W) } catch (e) { console.warn('police', e) }
  setTimeout(() => { if (AV.W !== W || LW.hospital[W.id] && LW.hospital[W.id].W === W) return; try { const ar = W.arrivals[W.defaultArrival] || W.arrivals.default || Object.values(W.arrivals)[0], name = ({ madrid: 'Hospital de la Paz', amsterdam: 'OLVG Ziekenhuis', tokyo: '渋谷 Hospital', paris: 'Hôpital Saint-Germain', vienna: 'AKH Wien', chiang_mai: 'Ram Hospital', rio: 'Hospital Copacabana', barcelona: 'Hospital del Mar', ape_town: 'Ape Town Healing Dome' })[W.id] || (W.name + ' Hospital');
    const b = LW.interiors && LW.interiors.build(W, { name, kind: 'pharmacy', x: ar.x + 18, z: ar.z + 12 }); if (b) { LW.hospital[W.id] = { W, name, front: b.front, counter: b.counter }; const t = W.T.find(t2 => t2.lwInside && Math.hypot(t2.x - b.counter[0], t2.z - b.counter[1]) < .5); if (t) { t.label = () => '🏥 ' + name + tr(': nurse (heal 30 ¢)', ': enfermería (curar 30 ¢)'); t.fn = () => { if (st().hp >= 100) return AV.toast(tr('You are fine. Drink some water.', 'Estás bien. Bebe agua.')); if (AV.txn(-30, name + ': treatment')) { LW.heal(100); AV.toast('🏥 ' + tr('All patched up. ❤ 100', 'Como nuevo. ❤ 100')) } } } } } catch (e) { console.warn('hospital', e) } }, 2400) } }
addEventListener('load', () => { const PH = AV.phone; if (PH && PH.APPS && !PH.APPS.find(a => a.id === 'surrender')) PH.APPS.push({ id: 'surrender', ic: '🙌', n: L('Surrender', 'Rendirse'), go: () => { AV.closePanel('cmp'); LW.surrender() }, out: true, badge: () => PO.stars }) });
})(window.AV);
