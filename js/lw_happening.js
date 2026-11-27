/* APEVERSE 2.3 - lw_happening.js : the "What's Happening?" ApePhone app (🔥).
   One live feed built from the game's own systems: missions + job boards near you (AV.mis), festivals (AV.fest.LIST), Stone Ape Band
   sets (AV.gigs.SETS), billiards tables, business and property opportunities (W.places vent_* / AV.LW.props), and invitations from
   friends (characters whose affinity with you is high, AV.LW.rel).  Tabs: Now · Later today · Coming days.  Every row can set a GPS
   route (same world) or travel you there through the portal network (other world).   AV.LW.happening() -> rows, AV.LW.happeningApp() */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW, L = LW.L, say = LW.say, esc = LW.esc;
const hhmm = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
const wname = w => (AV.worldMeta && (AV.worldMeta(w) || {}).name) || w;
const lbl = t => { try { return typeof t.label === 'function' ? t.label() : String(t.label || '') } catch (e) { return '' } };
LW.happening = function () { const S = AV.S, W = AV.W, here = W && W.id, P = AV.P, now = S.time, out = [];
  const add = r => { r.dist = r.w === here && r.x != null ? Math.round(Math.hypot(r.x - P.x, r.z - P.z)) : null; out.push(r) };
  /* missions: active first, then what is on offer here and elsewhere */
  const M = AV.mis; if (M) { const m = M.st();
    for (const id in m.a) { const d = M.defs[id]; if (!d) continue; const p = d.w === here ? M.where(id) : null; add({ when: 'now', ic: '◆', kind: L('Your mission', 'Tu misión'), t: say(d.title), sub: M.objective(id), w: d.w, x: p && p.x, z: p && p.z, mis: id }) }
    for (const d of Object.values(M.defs)) { if (!M.available(d.id)) continue; let x = null, z = null; if (d.w === here) { if (typeof d.giver === 'string') { const n = AV.npc && AV.npc.find(d.giver); if (n) { x = n.g.position.x; z = n.g.position.z } } else if (d.giver) { x = d.giver.x; z = d.giver.z } }
      const job = ['job', 'delivery', 'transport', 'business'].includes(d.cat); add({ when: 'now', ic: (M.CAT[d.cat] || '📜'), kind: job ? L('Job', 'Trabajo') : L('Mission', 'Misión'), t: say(d.title), sub: say(d.blurb || ''), w: d.w, x, z, far: d.w !== here }) } }
  /* festivals */
  const FE = AV.fest; if (FE && FE.LIST) for (const id in FE.LIST) { const F = FE.LIST[id]; let pl = null; try { pl = F.place || null } catch (e) { }
    if (FE.active(id)) add({ when: 'now', ic: '🎪', kind: L('Festival', 'Fiesta'), t: say(F.n), sub: tr('On now until ', 'Ahora, hasta las ') + hhmm(F.h * 60 + F.len), w: F.w, x: pl && pl.x, z: pl && pl.z });
    else { const d = FE.next(id); if (d == null) continue; const start = F.h * 60; if (d === S.day && start > now) add({ when: 'tonight', ic: '🎪', kind: L('Festival', 'Fiesta'), t: say(F.n), sub: tr('Starts ', 'Empieza a las ') + hhmm(start), w: F.w, at: start });
      else add({ when: 'later', ic: '🎪', kind: L('Festival', 'Fiesta'), t: say(F.n), sub: FE.dayName(d) + ' · ' + hhmm(start) + (d - S.day > 0 ? tr(' (in ', ' (en ') + (d - S.day) + tr(' days)', ' días)') : ''), w: F.w, day: d, at: start }) } }
  /* Stone Ape Band sets on the Lotus stage (Ape Town) */
  const G = AV.gigs; if (G && G.SETS) for (const s of G.SETS) { const st = s.h * 60, en = st + (s.len || 60); if (now >= st && now < en) add({ when: 'now', ic: '🎸', kind: L('Concert', 'Concierto'), t: tr('Stone Ape Band live', 'Stone Ape Band en directo'), sub: tr('Lotus stage, until ', 'Escenario del Loto, hasta las ') + hhmm(en), w: 'ape_town', x: 0, z: 47 }); else if (st > now) add({ when: 'tonight', ic: '🎸', kind: L('Concert', 'Concierto'), t: tr('Stone Ape Band live', 'Stone Ape Band en directo'), sub: tr('Lotus stage at ', 'Escenario del Loto a las ') + hhmm(st), w: 'ape_town', x: 0, z: 47, at: st }) }
  /* billiards + competitions + business opportunities in this world */
  if (W) { for (const t of W.T) { const l = lbl(t); if (/pool table|billar|billiard/i.test(l) && (!t.show || t.show())) add({ when: 'now', ic: '🎱', kind: L('Billiards', 'Billar'), t: l.replace(/^\S+\s/, ''), sub: tr('Open table', 'Mesa libre'), w: here, x: t.x, z: t.z }) }
    for (const p of W.places || []) if (/^vent_/.test(p.id)) add({ when: 'now', ic: '🔑', kind: L('Business opportunity', 'Oportunidad de negocio'), t: say(p.name), sub: tr('Lease or buy it on the spot', 'Alquílalo o cómpralo allí mismo'), w: here, x: p.x, z: p.z }) }
  for (const x of (LW.props ? LW.props() : [])) { if (x.rec && (x.rec.st === 'own' || x.rec.until >= S.day)) continue; add({ when: 'now', ic: '🏠', kind: L('Property for sale', 'Inmueble en venta'), t: say(x.P.name), sub: tr('Buy ', 'Compra ') + x.P.price + tr(' · rent ', ' · alquiler ') + x.P.rent + '/' + x.P.days + tr(' days', ' días'), w: x.P.w, x: null, z: null, prop: x.id }) }
  /* friends' invitations (high affinity), one per friend per day, tonight */
  const rel = S.rel || {}; for (const id in rel) { const r = rel[id], N = AV.NPCS[id]; if (!N || r.aff < 2) continue; const w = inv[id] || null; const st = 19 * 60 + ((id.length * 37 + S.day * 11) % 4) * 30;
    add({ when: st > now ? 'tonight' : 'now', ic: '💌', kind: L('Invitation', 'Invitación'), t: N.name + tr(' invites you out', ' te invita a salir'), sub: (st > now ? tr('Tonight at ', 'Esta noche a las ') + hhmm(st) : tr('Hanging out now', 'Ahora mismo')) + (w ? ' · ' + wname(w) : ''), w: w || here, npc: id, at: st }) }
  return out };
/* where each known character lives (for invitations to other worlds) */
const inv = { zil: 'ape_town', pip: 'ape_town', luma: 'ape_town', kiko: 'ape_town', sol: 'ape_town', dash: 'ape_town', remy: 'ape_town', mud: 'chiang_mai', nuni: 'chiang_mai', steve: 'chiang_mai', dino: 'chiang_mai', zape: 'chiang_mai', nunyin: 'chiang_mai', pim: 'chiang_mai' };
{ const W2 = LW.worlds2 || {}; for (const w in W2) if (W2[w].host) inv[W2[w].host.id] = w }
LW.inviteWorld = inv;
let tab = 'now';
LW.happeningApp = function (t) { if (t) tab = t; const rows = LW.happening(), here = AV.W && AV.W.id;
  const pick = rows.filter(r => r.when === tab).sort((a, b) => (b.w === here) - (a.w === here) || (a.at || 0) - (b.at || 0) || (a.dist == null ? 1e9 : a.dist) - (b.dist == null ? 1e9 : b.dist));
  const cnt = k => rows.filter(r => r.when === k).length;
  const html = '<h3 style="margin:0 0 6px">🔥 ' + tr("What's Happening?", '¿Qué pasa hoy?') + ' <small>' + hhmm(AV.S.time) + ' · ' + esc(AV.W ? AV.W.name : '') + '</small></h3><div class="lwTabs lwBtns">' +
    [['now', tr('Now', 'Ahora')], ['tonight', tr('Later today', 'Más tarde')], ['later', tr('Coming days', 'Próximos días')]].map(([k, n]) => '<button data-ht="' + k + '" class="' + (tab === k ? 'on' : '') + '">' + n + ' (' + cnt(k) + ')</button>').join('') + '<button data-close>✕</button></div>' +
    '<div style="max-height:60vh;overflow:auto">' + (pick.slice(0, 60).map((r, i) => '<div class="lwMis">' + r.ic + ' <small style="opacity:.7">' + esc(say(r.kind)) + '</small><br><b>' + esc(r.t) + '</b> <small>· ' + esc(r.w === here ? (r.dist != null ? r.dist + ' m' : tr('here', 'aquí')) : wname(r.w)) + '</small><br><small>' + esc(r.sub || '') + '</small><div class="lwBtns">' +
      (r.w === here ? (r.x != null ? '<button data-dist="' + (r.dist || 0) + '" data-go="' + i + '">📍 ' + tr('GPS route', 'Ruta GPS') + '</button>' : '') : '<button data-tv="' + i + '">🌀 ' + tr('Travel there', 'Viajar allí') + '</button>') + (r.mis ? '<button data-tk="' + i + '">📌 ' + tr('Track', 'Seguir') + '</button>' : '') + (r.prop ? '<button data-ag="' + i + '">🏠 ' + tr('Listings', 'Anuncios') + '</button>' : '') + '</div></div>').join('') ||
      '<p style="opacity:.75">' + tr('Nothing in this slot. Try another tab, or sleep / travel to move time on.', 'Nada en esta franja. Prueba otra pestaña, o duerme / viaja para que pase el tiempo.') + '</p>') + '</div>';
  const p = AV.panel('cmp', html); p.querySelectorAll('[data-ht]').forEach(b => b.onclick = () => LW.happeningApp(b.dataset.ht));
  p.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const r = pick[+b.dataset.go]; if (r.mis) AV.mis.track(r.mis); AV.closePanel('cmp'); if (r.dist != null && r.dist < 4) { AV.toast('📍 ' + tr('It is right here.', 'Está aquí mismo.')); return } AV.minimap.setDest(r.x, r.z, r.t) });
  p.querySelectorAll('[data-tv]').forEach(b => b.onclick = () => { const r = pick[+b.dataset.tv]; AV.closePanel('cmp'); AV.travel(r.w) });
  p.querySelectorAll('[data-tk]').forEach(b => b.onclick = () => { AV.mis.track(pick[+b.dataset.tk].mis); LW.happeningApp() });
  p.querySelectorAll('[data-ag]').forEach(b => b.onclick = () => { AV.closePanel('cmp'); LW.agency() });
  return p };
addEventListener('load', () => { const PH = AV.phone; if (PH && PH.APPS && !PH.APPS.find(a => a.id === 'happening')) PH.APPS.unshift({ id: 'happening', ic: '🔥', n: L("What's Happening?", '¿Qué pasa hoy?'), go: () => LW.happeningApp('now'), badge: () => { try { return LW.happening().filter(r => r.when === 'now' && r.w === (AV.W && AV.W.id) && r.dist != null && r.dist < 150).length } catch (e) { return 0 } } }) });
})(window.AV);
