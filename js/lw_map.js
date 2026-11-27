/* APEVERSE 2.3 - lw_map.js : T = the full-screen interactive city map (the minimap's atlas, js/minimap.js), with:
   category filters (missions, places, shops & services, homes, transport, portals, your vehicles), a legend, a 🌀 travel button
   (the interworld travel map moved to Shift+T and this button), a 🔥 What's Happening? button, and the owner's illustrated city map
   as a separate "Illustrated guide" view.  The illustrations are artwork whose geography does not match the playable street layout,
   so they are never drawn under the GPS markers (that would mislead the player); they are shown as a guide page instead.
   T again or Esc closes the map.  Illustrated maps: assets/maps/<world>.png (local-only owner art). */
'use strict';
(function (AV) {
const tr = AV.tr, LW = AV.LW;
const ART = LW.MAP_ART = { ape_town: 'ape_town', chiang_mai: 'chiang_mai', amsterdam: 'amsterdam', chefchaouen: 'chefchaouen', koh_tao: 'koh_tao', oaxaca: 'oaxaca', pai: 'pai', paris: 'paris', vienna: 'vienna', rio: 'rio', cadiz: 'cadiz', sevilla: 'sevilla' };
LW.MAP_ART_EXTRA = { chiang_mai: ['chiang_mai_hostel'], amsterdam: ['amsterdam_neon'], madrid: ['espana_travel'], sevilla: ['espana_travel'], cadiz: ['espana_travel'], barcelona: ['espana_travel'] };
const CATS = [['mis', '❗◆', L2('Missions', 'Misiones')], ['place', '◆', L2('Places', 'Lugares')], ['shop', '🛍️', L2('Shops & services', 'Tiendas y servicios')], ['home', '🏠', L2('Homes', 'Casas')], ['move', '🚐', L2('Transport', 'Transporte')], ['portal', '🌀', L2('Portals', 'Portales')], ['veh', '🚗', L2('Your vehicles', 'Tus vehículos')]];
function L2(e, s) { return [e, s] }
const off = new Set();
LW.mapCat = m => { if (m.icon === '❗' || m.icon === '◆') return 'mis'; if (m.kind === 'portal') return 'portal'; if (m.kind === 'veh') return 'veh'; const n = String(m.name || '');
  if (/^home_|🏠|Studio|Loft|condo|house|Penthouse|Piso|flat/i.test(n)) return 'home'; if (/🚐|🛺|🚲|🛴|🛵|taxi|shuttle|tram|metro|station|ferry|bus|stop|pier/i.test((m.icon || '') + n)) return 'move';
  if (m.kind === 'venue' || /shop|store|café|cafe|bar|market|bazaar|mart|restaurant|club|gallery|museum|hostel|hotel|records|bakery|tienda|mercado/i.test(n)) return 'shop'; return 'place' };
addEventListener('load', () => { const MM = AV.minimap; if (!MM || !MM.atlas) return; MM.hide = m => off.has(LW.mapCat(m));
  const css = document.createElement('style'); css.textContent = '#lwMapBar{position:absolute;left:10px;top:52px;z-index:3;display:flex;flex-wrap:wrap;gap:4px;max-width:calc(100% - 330px)}#lwMapBar button{font:12px Georgia,serif;padding:4px 8px}#lwMapBar button.off{opacity:.4;text-decoration:line-through}' +
    '#lwLegend{position:absolute;left:10px;bottom:40px;z-index:3;background:rgba(20,8,32,.85);border:1px solid #6a5a8a;border-radius:8px;padding:6px 10px;font:12px Georgia,serif;color:#fff;line-height:1.5}#lwArt{position:fixed;inset:0;z-index:60;background:rgba(10,4,20,.94);display:none;flex-direction:column;align-items:center;justify-content:center}#lwArt img{max-width:96vw;max-height:84vh;border-radius:10px;box-shadow:0 6px 30px #000}#lwArt p{color:#fff;font:14px Georgia,serif;margin:8px}';
  document.head.appendChild(css);
  const art = document.createElement('div'); art.id = 'lwArt'; art.innerHTML = '<img alt=""><p></p><div class="lwBtns"><button data-a="prev">◀</button><button data-a="next">▶</button><button data-a="x">✕ ' + tr('Back to the live map', 'Volver al mapa real') + '</button></div>'; document.body.appendChild(art);
  let arts = [], ai = 0; const showArt = () => { const f = arts[ai]; art.querySelector('img').src = 'assets/maps/' + f + '.png'; art.querySelector('p').textContent = tr('Illustrated guide (artwork, not to scale: use the live map for GPS) · ', 'Guía ilustrada (obra artística, no a escala: usa el mapa real para el GPS) · ') + (ai + 1) + '/' + arts.length };
  art.querySelector('[data-a="x"]').onclick = () => { art.style.display = 'none' }; art.querySelector('[data-a="prev"]').onclick = () => { ai = (ai + arts.length - 1) % arts.length; showArt() }; art.querySelector('[data-a="next"]').onclick = () => { ai = (ai + 1) % arts.length; showArt() };
  LW.mapArtFor = w => [ART[w]].concat(LW.MAP_ART_EXTRA[w] || []).filter(Boolean);
  LW.showArt = w => { arts = LW.mapArtFor(w || (AV.W && AV.W.id)); if (!arts.length) { AV.toast(tr('No illustrated map for this world yet.', 'Aún no hay mapa ilustrado de este mundo.')); return false } ai = 0; showArt(); art.style.display = 'flex'; return true };
  const a0 = MM.atlas; MM.atlas = function () { if (MM.atlasOpen()) { MM.closeAtlas(); return } const r = a0.apply(this, arguments); const ov = document.getElementById('mmFull'); if (!ov) return r;
    let bar = ov.querySelector('#lwMapBar'); if (!bar) { bar = document.createElement('div'); bar.id = 'lwMapBar'; ov.appendChild(bar); const lg = document.createElement('div'); lg.id = 'lwLegend'; ov.appendChild(lg) }
    const w = AV.W && AV.W.id; bar.innerHTML = CATS.map(([k, ic, n]) => '<button data-f="' + k + '" class="' + (off.has(k) ? 'off' : '') + '">' + ic + ' ' + tr(n[0], n[1]) + '</button>').join('') + '<button data-x="travel">🌀 ' + tr('Travel to another world', 'Viajar a otro mundo') + '</button><button data-x="hap">🔥 ' + tr("What's Happening?", '¿Qué pasa hoy?') + '</button>' + (LW.mapArtFor(w).length ? '<button data-x="art">🖼️ ' + tr('Illustrated guide', 'Guía ilustrada') + '</button>' : '');
    ov.querySelector('#lwLegend').innerHTML = '<b>' + tr('Legend', 'Leyenda') + '</b><br>❗ ' + tr('someone has work / job board', 'alguien tiene trabajo / tablón') + '<br>◆ ' + tr('your tracked objective', 'tu objetivo') + '<br>🟡 ' + tr('named place', 'lugar') + ' · 🟣 ' + tr('portal', 'portal') + '<br>📍 ' + tr('click anywhere: GPS route · T / Esc: close', 'clic: ruta GPS · T / Esc: cerrar');
    bar.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const k = b.dataset.f; off.has(k) ? off.delete(k) : off.add(k); b.classList.toggle('off'); MM.zoomFull && MM.zoomFull(1) });
    bar.querySelector('[data-x="travel"]').onclick = () => { MM.closeAtlas(); setTimeout(() => AV.toggleMap(), 50) };
    bar.querySelector('[data-x="hap"]').onclick = () => { MM.closeAtlas(); setTimeout(() => LW.happeningApp && LW.happeningApp('now'), 50) };
    const ab = bar.querySelector('[data-x="art"]'); if (ab) ab.onclick = () => LW.showArt(w);
    return r };
  /* T toggles the map closed again (the atlas modal blocks the normal key handler) */
  addEventListener('keydown', e => { if (e.code === 'KeyT' && !e.shiftKey && MM.atlasOpen() && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) { e.preventDefault(); e.stopImmediatePropagation(); MM.closeAtlas() } if (e.code === 'Escape' && art.style.display === 'flex') { art.style.display = 'none'; e.stopImmediatePropagation() } }, true) });
})(window.AV);
