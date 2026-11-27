/* APEVERSE 2.3 "The Living World" - lw_core.js : shared foundation for the 2.3 systems.
   - AV.LW.CFG: tunables (starting money, the optional starter grant for existing saves).
   - New games start with CFG.startMoney credits.  Existing saves keep their money; once, a panel OFFERS an optional starter grant.
   - Relationship memory per character (AV.LW.rel(id)): times met, affinity, remembered flags, last day seen.  Survives saves.
   - Reputation per world (AV.LW.rep(world, delta)).
   - Floating 3D markers (AV.LW.marker) used by missions: gold "!" over people with work for you, pink "◆" over the current objective.
   Save: optional S.lw = { v, grant, rep:{world:n} }, S.rel = { id: { met, aff, f:{}, last } }.  Old saves load unchanged. */
'use strict';
(function (AV) {
const tr = AV.tr;
const LW = AV.LW = { CFG: { startMoney: 10000, grant: 10000, grantBelow: 3000, version: '2.3-dev' }, stats: {} };
LW.L = (en, es) => [en, es == null ? en : es];
LW.say = a => Array.isArray(a) ? tr(a[0], a[1] == null ? a[0] : a[1]) : typeof a === 'function' ? a() : String(a == null ? '' : a);
LW.esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

/* ---------- generous start: new games only (old saves are loaded on top of fresh(), so their money wins) ---------- */
const fresh0 = AV.fresh;
AV.fresh = function () { const s = fresh0.apply(this, arguments), m = LW.CFG.startMoney; s.money = m; s.log = [{ d: 1, t: 'Starting funds', a: m }]; return s };
const st = () => { const S = AV.S; if (!S.lw) { S.lw = { v: 1, rep: {}, grant: null, born: S.day }; } S.lw.rep = S.lw.rep || {}; return S.lw };
LW.st = st;
/* a save that already existed before 2.3: no S.lw yet and not the brand-new 10 000-credit day-1 start */
function isNewGame(S) { return S.day === 1 && Array.isArray(S.log) && S.log.length <= 1 && S.log[0] && S.log[0].t === 'Starting funds' && S.log[0].a === LW.CFG.startMoney }
LW.grantPanel = function () {
  const g = LW.CFG.grant, S = AV.S;
  const p = AV.panel('cmp', '<h3>🎁 ' + tr('Apeverse 2.3 starter grant', 'Ayuda inicial de Apeverse 2.3') + '</h3><p>' +
    tr('New games now start with ' + g + ' credits, enough for a first flat or a small business. Your saved game keeps its ' + S.money + ' credits.',
       'Las partidas nuevas empiezan ahora con ' + g + ' créditos, suficiente para un primer piso o un pequeño negocio. Tu partida conserva sus ' + S.money + ' créditos.') +
    '</p><p>' + tr('Would you like a one-time starter grant of ' + g + ' credits? It is optional and is only offered once.', '¿Quieres una ayuda única de ' + g + ' créditos? Es opcional y solo se ofrece una vez.') + '</p>' +
    '<button id="lwGrantYes">' + tr('Yes, add ' + g + ' credits', 'Sí, añadir ' + g + ' créditos') + '</button> <button id="lwGrantNo">' + tr('No thanks, keep my balance', 'No, gracias') + '</button>');
  p.querySelector('#lwGrantYes').onclick = () => { st().grant = 'taken'; AV.txn(g, 'Apeverse 2.3 starter grant'); AV.closePanel('cmp') };
  p.querySelector('#lwGrantNo').onclick = () => { st().grant = 'declined'; AV.save(); AV.closePanel('cmp') };
};
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); const S = AV.S; if (S.lw) return; const neu = isNewGame(S); st().grant = neu ? 'new' : null; AV.save();
  if (!neu && S.money < LW.CFG.grantBelow && !AV.saveKey.includes('test')) setTimeout(() => { if (!AV.blocking() && st().grant == null) LW.grantPanel() }, 2500) } }

/* ---------- relationships + reputation ---------- */
LW.rel = function (id) { const S = AV.S; S.rel = S.rel || {}; return S.rel[id] = S.rel[id] || { met: 0, aff: 0, f: {}, last: 0 } };
LW.aff = (id, d) => { const r = LW.rel(id); r.aff = Math.max(-10, Math.min(10, r.aff + d)); return r.aff };
LW.rep = function (w, d) { const R = st().rep; if (d) { R[w] = Math.round(((R[w] || 0) + d) * 10) / 10; AV.save() } return R[w] || 0 };
LW.repTitle = n => n >= 60 ? LW.L('Local legend', 'Leyenda local') : n >= 30 ? LW.L('Well known', 'Muy conocido') : n >= 12 ? LW.L('Regular', 'Habitual') : n >= 3 ? LW.L('Familiar face', 'Cara conocida') : LW.L('Newcomer', 'Recién llegado');
LW.part = () => { const h = AV.S.time / 60; return h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : h < 22 ? 'evening' : 'night' };

/* ---------- floating markers ---------- */
const TEX = {};
function tex(kind) { if (TEX[kind]) return TEX[kind]; const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const col = kind === 'give' ? '#ffd23a' : kind === 'obj' ? '#ff4ad2' : '#7ad8ff', glyph = kind === 'give' ? '!' : kind === 'obj' ? '◆' : '?';
  g.fillStyle = 'rgba(20,8,32,.75)'; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = col; g.stroke();
  g.fillStyle = col; g.font = 'bold 76px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(glyph, 64, 70);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.userData = { keep: true }; return TEX[kind] = t }
const pool = [];
LW.marker = function (kind) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(kind), transparent: true, depthTest: false, depthWrite: false, fog: false }));
  m.material.userData.lin = 1; m.material.userData.shared = true; m.renderOrder = 999; m.scale.set(.9, .9, 1); m.userData.kind = kind; AV.scene.add(m); pool.push(m); return m };
LW.dropMarker = m => { if (!m) return; AV.scene.remove(m); m.material.dispose(); const i = pool.indexOf(m); if (i >= 0) pool.splice(i, 1) };
AV.frameFns.push(() => { const t = AV.now ? AV.now() : performance.now() / 1000; for (const m of pool) { const b = m.userData.base; if (!b) continue; m.position.set(b.x, b.y + .18 * Math.sin(t * 2.6), b.z);
  const d = AV.cam.position.distanceTo(m.position), s = Math.max(.8, Math.min(3.2, d * .055)); m.scale.set(s, s, 1) } });

/* ---------- small HUD line for the tracked objective ---------- */
const css = document.createElement('style');
css.textContent = '#lwObj{position:fixed;left:10px;top:150px;max-width:min(380px,60vw);padding:6px 12px;border-radius:12px;background:rgba(20,8,32,.78);border:1px solid #ff4ad2;color:#fff;font:14px Georgia,serif;z-index:30;pointer-events:none;display:none;text-align:left}' +
  '#lwObj b{color:#ffd23a}#lwObj small{opacity:.8}.lwBtns button{margin:3px 4px 3px 0}.lwConvo .line{margin:4px 0;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.07)}.lwConvo .me{background:rgba(255,74,210,.16);text-align:right}' +
  '.lwConvo .opts button{display:block;width:100%;text-align:left;margin:4px 0;padding:8px 10px}.lwTabs button.on{background:#ff4ad2;color:#fff}.lwMis{border-bottom:1px solid rgba(255,255,255,.12);padding:6px 0}.lwMis small{opacity:.8}';
document.head.appendChild(css);
const obj = document.createElement('div'); obj.id = 'lwObj'; document.body.appendChild(obj);
LW.objLine = function (html) { if (!html) { obj.style.display = 'none'; return } obj.innerHTML = html; obj.style.display = 'block' };
})(window.AV);
