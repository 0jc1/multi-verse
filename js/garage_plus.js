/* APEVERSE 2.2 (Agent 3) - garage_plus.js : extends the verified garage (garage.js, untouched) without changing how buying, parking,
   valet, paint, sell and shipping work.
   - Workshop (parts) for every vehicle you own: engine tune (stage 1 / 2: higher top speed + acceleration, applied when you ride),
     sport rims, underglow (3 colours) and a top box. Visual parts are added to the parked and ridden vehicle; all saved on the record
     (rec.mods) and refunded at 40 % when you sell (handled by the existing sell price + this bonus).
   - More dealer classes, added to the existing dealer lists: Madrid gets the e-scooter and the Woblr Zip-EV, Chiang Mai the e-scooter.
   - ApePhone 🚗 Garage keeps working; the garage panel gets a 🔧 Workshop button per owned vehicle.
   API: AV.garage.mods(rec) · AV.garage.part(rec, key) · AV.garage.workshop() */
'use strict';
(function (AV) {
const G = AV.garage, VEH = AV.veh, ACT = AV.act; if (!G || !VEH || !ACT) return;
const tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]);
const PARTS = G.PARTS = { tune1: { n: L('Engine tune, stage 1 (+12 % top speed, +15 % acceleration)', 'Puesta a punto 1 (+12 % velocidad, +15 % aceleración)'), p: 180, needs: null, motor: 1 },
  tune2: { n: L('Engine tune, stage 2 (+25 % top speed, +30 % acceleration)', 'Puesta a punto 2 (+25 % velocidad, +30 % aceleración)'), p: 320, needs: 'tune1', motor: 1 },
  rims: { n: L('Sport rims (gold)', 'Llantas deportivas (doradas)'), p: 90 }, glow: { n: L('Underglow (tap again to change colour)', 'Luz de bajos (otra vez = cambia color)'), p: 70 }, box: { n: L('Top box / roof box', 'Baúl / cofre de techo'), p: 60 } };
const GLOW = [0xff4ad2, 0x4ad8ff, 0x7aff7a];
G.mods = rec => { rec.mods = rec.mods || {}; return rec.mods };
G.part = function (rec, k) { const P = PARTS[k]; if (!rec || !rec.owned || !P) return false; const m = G.mods(rec); if (P.motor && /bicycle/.test(rec.kind)) return msg(tr('Bicycles have no engine to tune.', 'Las bicis no tienen motor.'));
  if (P.needs && !m[P.needs]) return msg(tr('Fit stage 1 first.', 'Primero la fase 1.')); if (m[k] && k !== 'glow') return msg(tr('Already fitted.', 'Ya montado.'));
  if (!AV.txn(-P.p, tr('Workshop: ', 'Taller: ') + say(P.n))) return msg(tr(say(P.n) + ' costs ' + P.p + '; you have ' + AV.S.money + '.', say(P.n) + ' cuesta ' + P.p + '; tienes ' + AV.S.money + '.'));
  if (k === 'glow') m.glow = ((m.glow || 0) % GLOW.length) + 1; else m[k] = 1; m.spent = (m.spent || 0) + P.p; AV.save(); deco(true); AV.snd && AV.snd.fx('ok'); AV.toast('🔧 ' + say(P.n) + tr(' — fitted.', ' — montado.')); return true };
function msg(m) { AV.toast('⚠️ ' + m); G.lastErr = m; const e = document.getElementById('wsMsg'); if (e) e.textContent = '⚠️ ' + m; return false }
/* tuning applies to the ride: a per-ride copy of the vehicle's stats */
const R = ACT.types.ride; if (R && !R.__gp) { const s0 = R.start; R.start = function (s) { const r = s0.apply(this, arguments); const m = s.rec && s.rec.mods; if (m && (m.tune1 || m.tune2)) { const k = m.tune2 ? 1.25 : 1.12, a = m.tune2 ? 1.3 : 1.15; s.K = Object.assign({}, s.K, { top: s.K.top * k, boost: s.K.boost * k, acc: s.K.acc * a }); G.stats.tunedRides = (G.stats.tunedRides || 0) + 1 } return r }; R.__gp = 1 }
/* visual parts on parked + ridden vehicles */
const M = (c, e) => new THREE.MeshStandardMaterial({ color: c, roughness: .35, metalness: .7, emissive: e || 0, emissiveIntensity: e ? 1.2 : 0 });
function deco(force) { for (const o of VEH.live()) { const m = o.rec.mods; if (!m || !o.mesh) continue; const key = JSON.stringify([m.rims, m.glow, m.box]); if (o.__gk === key && !force) continue; o.__gk = key; const old = o.mesh.getObjectByName('gp_parts'); if (old) o.mesh.remove(old);
  const g = new THREE.Group(); g.name = 'gp_parts'; o.mesh.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(o.mesh), inv = new THREE.Matrix4().copy(o.mesh.matrixWorld).invert(), sz = bb.getSize(new THREE.Vector3()), sc = o.mesh.scale.x || 1;
  const L2 = Math.max(sz.x, sz.z) / sc, W2 = Math.min(sz.x, sz.z) / sc, H = sz.y / sc;
  if (m.rims) for (const fx of [-.32, .32]) for (const sx of (W2 > 1.1 ? [-.5, .5] : [0])) { const r = new THREE.Mesh(new THREE.TorusGeometry(Math.min(.3, H * .2), .04, 6, 14), M(0xd8b048)); r.position.set(sx * W2 * 1.01, Math.min(.3, H * .2), fx * L2); r.rotation.y = Math.PI / 2; g.add(r) }
  if (m.glow) { const c = GLOW[m.glow - 1], p = new THREE.Mesh(new THREE.PlaneGeometry(W2 * .9, L2 * .85), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .55 })); p.rotation.x = -Math.PI / 2; p.position.y = .04; g.add(p) }
  if (m.box) { const b = new THREE.Mesh(new THREE.BoxGeometry(Math.min(.5, W2 * .6), .3, .45), M(0x1a1a1e)); b.position.set(0, H * (W2 > 1.1 ? 1.02 : .8), W2 > 1.1 ? 0 : -L2 * .38); g.add(b) }
  o.mesh.add(g) } }
G.deco = deco; let dT = 0; AV.frameFns.push(dt => { if ((dT -= dt) > 0) return; dT = 1; try { deco(false) } catch (e) { } });
/* workshop panel */
G.workshop = function (recId) { const own = G.owned().filter(r => !recId || String(r.id) === String(recId)), K = VEH.KINDS;
  const p = AV.panel('cmp', '<b>🔧 ' + tr('Workshop', 'Taller') + '</b><div class="note">' + tr('Parts stay on the vehicle and are saved. Tuning applies when you ride.', 'Las piezas se quedan en el vehículo y se guardan. La puesta a punto se aplica al montar.') + '</div>' +
    (own.map(r => { const m = G.mods(r); return '<div class="bitem"><div class="bic">' + (K[r.kind] || {}).icon + '</div><div class="bnm">' + say((K[r.kind] || { n: [r.kind, r.kind] }).n) + ' <small>' + ((AV.worldMeta(r.w) || {}).name || r.w) + (m.tune2 ? ' · ⚙️⚙️' : m.tune1 ? ' · ⚙️' : '') + (m.rims ? ' · 🛞' : '') + (m.glow ? ' · ✨' : '') + (m.box ? ' · 📦' : '') + '</small></div><div class="bbt">' + Object.keys(PARTS).map(k => '<button data-r="' + r.id + '" data-k="' + k + '"' + ((m[k] && k !== 'glow') || (PARTS[k].needs && !m[PARTS[k].needs]) ? ' disabled' : '') + '>' + { tune1: '⚙️1', tune2: '⚙️2', rims: '🛞', glow: '✨', box: '📦' }[k] + ' ' + PARTS[k].p + '</button>').join('') + '</div></div>' }).join('') || '<div class="note">' + tr('You don’t own a vehicle yet: buy one at a dealer.', 'Aún no tienes vehículo: compra uno en un concesionario.') + '</div>') +
    '<div class="note" id="wsMsg"></div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
  p.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const r = G.owned().find(x => String(x.id) === b.dataset.r); if (G.part(r, b.dataset.k)) G.workshop(recId) }); return p };
const gp0 = G.panel; G.panel = function () { const p = gp0.apply(this, arguments); const P = document.getElementById('cmp'); if (P && G.owned().length && !P.querySelector('#gpWs')) { const b = document.createElement('button'); b.id = 'gpWs'; b.textContent = '🔧 ' + tr('Workshop: parts + tuning', 'Taller: piezas y puesta a punto'); b.onclick = () => G.workshop(); const c = P.querySelector('[data-close]'); c ? P.insertBefore(b, c) : P.appendChild(b) } return p };
/* sell: the parts add 40 % of what they cost */
const sell0 = G.sell; G.sell = function (rec) { const extra = rec && rec.mods && rec.mods.spent ? Math.round(rec.mods.spent * .4) : 0; const r = sell0.apply(this, arguments); if (r && extra) AV.txn(extra, tr('Parts resold', 'Piezas revendidas')); return r };
/* more classes at existing dealers (kinds that already exist in vehicles.js) */
const addStock = (w, it) => { const D = G.DEAL[w]; if (D && !D.stock.some(s => s.kind === it.kind)) D.stock.push(it) };
addStock('madrid', { kind: 'escooter', model: L('Woblr Glide e-scooter', 'Patinete Woblr Glide'), price: 160, cols: [0x1e1e22, 0xe8e4da, 0x3ab0d8] });
addStock('madrid', { kind: 'woblr', model: L('Woblr Zip-EV city car (electric)', 'Woblr Zip-EV (eléctrico)'), price: 1600, cols: [0x7ad8ff, 0xe8e8ea, 0xffd84a, 0x2a2a2e] });
addStock('chiang_mai', { kind: 'escooter', model: L('Woblr Glide e-scooter', 'Patinete Woblr Glide'), price: 140, cols: [0x1e1e22, 0x3ab04a] });
})(window.AV);
