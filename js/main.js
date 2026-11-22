/* APEVERSE V0.9 - main.js : start screen, device/language, new/continue, boot */
'use strict';
(function (AV) {
const $ = AV.$, tr = AV.tr;
let device = 'desktop', lang = 'en';
const STR = {
  en: { dev: 'HOW WOULD YOU LIKE TO PLAY?', lang: 'LANGUAGE', opt: 'OPTIONS', mus: 'Music', gfx: 'Graphics', nw: 'New game', ct: 'Continue saved game',
    pn: 'Touch controls: left stick = move, drag the right side = look, round buttons = act. Landscape works best. Graphics set to Low.',
    sv: 'Progress is stored in this browser only. Clearing site data erases it. Your V0.8 save is imported automatically (the original is never deleted).' },
  es: { dev: '¿CÓMO QUIERES JUGAR?', lang: 'IDIOMA', opt: 'OPCIONES', mus: 'Música', gfx: 'Gráficos', nw: 'Nueva partida', ct: 'Continuar partida guardada',
    pn: 'Controles táctiles: palanca izquierda = moverse, arrastra a la derecha = mirar, botones redondos = actuar. Mejor en horizontal. Gráficos en Bajo.',
    sv: 'El progreso se guarda solo en este navegador. Borrar los datos del sitio lo elimina. Tu partida V0.8 se importa automáticamente (la original nunca se borra).' }
};
function paint() {
  const s = STR[lang]; $('h_dev').textContent = s.dev; $('h_lang').textContent = s.lang; $('h_opt').textContent = s.opt; $('t_mus').textContent = s.mus; $('t_gfx').textContent = s.gfx;
  $('bNew').textContent = s.nw; $('bCont').textContent = s.ct; $('phoneNote').textContent = s.pn; $('saveNote').textContent = s.sv;
  $('dLap').textContent = lang === 'es' ? 'Portátil / Escritorio' : 'Laptop / Desktop'; $('dPho').textContent = lang === 'es' ? 'Teléfono / Tableta' : 'Phone / Tablet';
  $('lEn').classList.toggle('on', lang === 'en'); $('lEs').classList.toggle('on', lang === 'es');
  $('dLap').classList.toggle('on', device === 'desktop'); $('dPho').classList.toggle('on', device === 'phone'); $('phoneNote').style.display = device === 'phone' ? 'block' : 'none';
  if (device === 'phone') $('gq').value = 'Low';
  document.documentElement.lang = lang;
}
$('dLap').onclick = () => { device = 'desktop'; paint() }; $('dPho').onclick = () => { device = 'phone'; paint() };
$('lEn').onclick = () => { lang = 'en'; paint() }; $('lEs').onclick = () => { lang = 'es'; paint() };
if (/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && innerWidth < 900)) device = 'phone';
if (AV.HERO) { const h = $('heroImg'); h.src = AV.HERO; h.style.display = 'block' }
const found = AV.loadSave();
$('bCont').disabled = !found;
if (found) $('modeNote').textContent = found.from === 'v09' ? 'Saved game found.' : 'Imported from your ' + found.from.replace('apeverse_', 'V0.').replace('v0', '').toUpperCase() + ' save (the old save is untouched).';
if (!AV.isFile) { /* served over http(s) */ } else $('modeNote').textContent += (found ? ' ' : '') + 'Opened from a file: paintings and cinema play in a pop-up viewer. Use start_server for in-world video.';
paint();

function begin(S) {
  const gv = $('gq').value; AV.S = S; S.set = Object.assign({ vm: .8, vs: .8, gq: gv, sens: 1, reduce: false }, S.set); S.set.gq = gv; S.set.lang = lang; AV.ui = lang; AV.device = device;
  document.body.classList.toggle('touch', device === 'phone'); AV.musicOn = $('mus').checked;
  $('start').style.display = 'none'; AV.running = true; AV.applyQuality(); AV.resize();
  if (AV.audio) AV.audio.init(AV.musicOn);
  /* start downloading CC0 models (http only); on Low graphics skip the heaviest ones (procedural stand-ins are used instead) */
  if (AV.assets) AV.assets.preload(k => S.set.gq !== 'Low' || !/twisted_tree|fern|flower_group|mushroom_b/.test(k));
  AV.startLoop();
  AV.enterWorld(AV.worldDefs[S.world] ? S.world : 'ape_town', 'default', { instant: true });
  AV.lock();
}
$('bNew').onclick = () => { const f = AV.fresh(); begin(f) };
$('bCont').onclick = () => { if (found) begin(found.s) };
AV.boot = { begin };
})(window.AV);
