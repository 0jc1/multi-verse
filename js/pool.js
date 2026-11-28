/* APEVERSE V0.9.4 - pool.js : playable eight-ball against Nuni.
   Top-down table in a pop-up panel: real ball physics (ball-ball + cushion collisions, rolling friction, six pockets),
   aiming line with ghost ball, charged power, turn-taking, open table / solids & stripes, fouls with ball-in-hand, 8-ball win/lose.
   Nuni's AI checks every ball/pocket pair, simulates the best candidates with the same physics, and picks the shot that pots
   AND leaves position. Her aim error is tiny (she is a champion); she still misses now and then.
   AV.pool.open({ opponent:'nuni', onEnd(win, stats) }) */
'use strict';
(function (AV) {
const tr = AV.tr, $ = AV.$;
const TW = 2.54, TH = 1.27, R = .0286, PK_C = .062, PK_S = .056, MAXV = 5.2, DT = 1 / 240;
const POCKETS = [[0, 0, PK_C], [TW / 2, -.01, PK_S], [TW, 0, PK_C], [0, TH, PK_C], [TW / 2, TH + .01, PK_S], [TW, TH, PK_C]];
const COLS = ['#f4f0e4', '#f2c41a', '#1a4ad8', '#d8281a', '#5a2a9a', '#f07a1a', '#1a8a3a', '#7a1a1a', '#111111', '#f2c41a', '#1a4ad8', '#d8281a', '#5a2a9a', '#f07a1a', '#1a8a3a', '#7a1a1a'];
const grp = n => n === 0 ? 'cue' : n === 8 ? 'eight' : n < 8 ? 'solids' : 'stripes';

/* ---------------- physics ---------------- */
function rack() {
  const b = [{ n: 0, x: TW * .25, y: TH / 2 }], order = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]; let k = 0;
  for (let row = 0; row < 5; row++) for (let i = 0; i <= row; i++) { const n = order[k++]; b.push({ n, x: TW * .72 + row * R * 1.74, y: TH / 2 + (i - row / 2) * R * 2.02 }) }
  b.forEach(o => { o.vx = o.vy = 0; o.in = false }); return b;
}
function sim(balls, ev, maxT) {        // advance until all stop; ev collects {first, potted:[], cushions}
  let t = 0; ev = ev || { first: null, potted: [], rails: 0 };
  while (t < (maxT || 12)) {
    let moving = false;
    for (const b of balls) { if (b.in) continue; const sp = Math.hypot(b.vx, b.vy); if (sp < .004) { b.vx = b.vy = 0; continue } moving = true; const dec = Math.max(0, sp - (.16 + .02 * sp) * DT) / sp; b.vx *= dec; b.vy *= dec; b.x += b.vx * DT; b.y += b.vy * DT }
    if (!moving) break;
    for (let i = 0; i < balls.length; i++) { const a = balls[i]; if (a.in) continue;
      for (const p of POCKETS) if (Math.hypot(a.x - p[0], a.y - p[1]) < p[2]) { a.in = true; a.vx = a.vy = 0; ev.potted.push(a.n); break } if (a.in) continue;
      if (a.x < R) { a.x = R; a.vx = -a.vx * .78; ev.rails++ } else if (a.x > TW - R) { a.x = TW - R; a.vx = -a.vx * .78; ev.rails++ }
      if (a.y < R) { a.y = R; a.vy = -a.vy * .78; ev.rails++ } else if (a.y > TH - R) { a.y = TH - R; a.vy = -a.vy * .78; ev.rails++ }
      for (let j = i + 1; j < balls.length; j++) { const b = balls[j]; if (b.in) continue; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy); if (d >= 2 * R || d === 0) continue;
        const nx = dx / d, ny = dy / d, ov = 2 * R - d; a.x -= nx * ov / 2; a.y -= ny * ov / 2; b.x += nx * ov / 2; b.y += ny * ov / 2;
        const rv = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny; if (rv <= 0) continue; const imp = rv * .97; a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny;
        if (ev.first == null) { if (a.n === 0) ev.first = b.n; else if (b.n === 0) ev.first = a.n } }
    }
    t += DT;
  }
  return ev;
}
const clone = bs => bs.map(b => Object.assign({}, b));
const segClear = (bs, ax, ay, bx, by, skip) => { const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy); for (const o of bs) { if (o.in || skip.indexOf(o.n) >= 0) continue; const t = Math.max(0, Math.min(1, ((o.x - ax) * dx + (o.y - ay) * dy) / (L * L))); if (Math.hypot(ax + dx * t - o.x, ay + dy * t - o.y) < 2 * R * .98) return false } return true };

/* ---------------- game ---------------- */
const G = AV.pool = { open: false };
let S = null, cv = null, cx = null, raf = 0, aim = { a: Math.PI, pow: .55, charging: false, ph: 0 }, opts = null;
const LINES = {
  start: [['Rack ’em. I’ll be gentle. That’s a lie.', 'Coloca las bolas. Seré amable. Es mentira.'], ['You break. I need to see your weaknesses first.', 'Rompes tú. Necesito ver tus debilidades primero.']],
  pPot: [['Okay, okay. Lucky.', 'Vale, vale. Suerte.'], ['Did you just… no. Coincidence.', '¿Acabas de…? No. Casualidad.'], ['Cute shot. Enjoy it while it lasts.', 'Tiro mono. Disfrútalo mientras dure.']],
  pMiss: [['The pocket is the hole, darling.', 'La tronera es el agujero, cariño.'], ['That ball is scared of you. Same.', 'Esa bola te tiene miedo. Yo también. De risa.'], ['Beer break? You look like you need one.', '¿Pausa de cerveza? Parece que la necesitas.']],
  pFoul: [['Foul! Ball in my hand. Thank you, sponsor.', '¡Falta! Bola en mi mano. Gracias, patrocinador.'], ['Scratch! The cue ball wanted to see the pocket too.', '¡Bola blanca dentro! También quería ver la tronera.']],
  nPot: [['Too easy.', 'Demasiado fácil.'], ['Did you blink? I didn’t.', '¿Parpadeaste? Yo no.'], ['That’s called “Chiang Mai English”.', 'Eso se llama “efecto Chiang Mai”.'], ['Mutt says I should let guests win. Mutt is not here.', 'Mutt dice que deje ganar a los clientes. Mutt no está aquí.'], ['Write this down for your blog.', 'Apúntalo para tu blog.']],
  nMiss: [['The table moved. I felt it.', 'La mesa se movió. Lo noté.'], ['I missed on purpose. Charity.', 'Fallé a propósito. Caridad.'], ['Who put that beer there? Distraction!', '¿Quién puso esa cerveza ahí? ¡Distracción!']],
  nFoul: [['Ugh. Fine. Ball in hand, champ. Don’t get used to it.', 'Uf. Vale. Bola en mano, campeón. No te acostumbres.']],
  win: [['WHAT. Rematch. Now. Nobody tells Mutt.', 'QUÉ. Revancha. Ya. Que nadie se lo cuente a Mutt.']],
  lose: [['Told you. Get your ass kicked by Nuni — it’s on the menu. Beer’s on me.', 'Te lo dije. “Que Nuni te dé una paliza” está en la carta. La cerveza la pago yo.']]
};
const say = k => { const a = LINES[k], l = a[Math.random() * a.length | 0]; S.msg = tr(l[0], l[1]); S.msgT = 5 };

G.openGame = function (o) {
  if (G.open) return; opts = o || {}; G.open = true;
  const el = $('pool'); el.style.display = 'block';
  el.innerHTML = '<div class="phead"><b id="psc"></b><span id="pmsg"></span></div><canvas id="pcv"></canvas>' +
    '<div class="row prow"><button id="pshoot">' + tr('Shoot', 'Tirar') + '</button><input id="ppow" type="range" min="5" max="100" value="55" aria-label="' + tr('Power', 'Fuerza') + '"><button id="phelp">' + tr('How to play', 'Cómo jugar') + '</button><button id="pquit">' + tr('Concede (Esc)', 'Rendirse (Esc)') + '</button></div><div id="phelpbox" class="note" style="display:none"></div>';
  cv = $('pcv'); cx = cv.getContext('2d'); fit(); addEventListener('resize', fit);
  S = { balls: rack(), turn: 'p', groups: { p: null, n: null }, inHand: false, moving: false, over: false, msg: '', msgT: 0, broke: false, shots: { p: 0, n: 0 }, pots: { p: 0, n: 0 }, think: 0 };
  say('start');
  AV.pushModal('pool', () => G.close(true));
  cv.onpointermove = e => { const p = toTable(e); if (!p) return; if (S.inHand && S.turn === 'p') { S.hand = p; return } const c = S.balls[0]; aim.a = Math.atan2(p.y - c.y, p.x - c.x) };
  cv.onpointerdown = e => { e.preventDefault(); if (S.turn !== 'p' || S.moving || S.over) return; const p = toTable(e); if (S.inHand && p) { if (placeOK(p.x, p.y)) { const c = S.balls[0]; c.x = p.x; c.y = p.y; c.in = false; S.inHand = false } return } if (e.pointerType === 'mouse') { aim.charging = true; aim.ph = 0 } };
  cv.onpointerup = e => { if (aim.charging) { aim.charging = false; shoot('p', aim.a, aim.pow) } };
  $('pshoot').onclick = () => { if (S.turn === 'p' && !S.moving && !S.inHand && !S.over) shoot('p', aim.a, +$('ppow').value / 100) };
  $('ppow').oninput = e => aim.pow = +e.target.value / 100;
  $('pquit').onclick = () => G.close(true);
  $('phelp').onclick = () => { const h = $('phelpbox'); h.style.display = h.style.display === 'none' ? 'block' : 'none'; h.innerHTML = tr('Aim with the mouse (or drag on touch). Hold the mouse button to charge power, release to shoot — or set the slider and press Shoot. Arrow keys: ←/→ fine aim, ↑/↓ power, Space/Enter shoot. Pot your group (solids 1–7 or stripes 9–15, decided by the first legal pot), then the 8. Fouls (scratch, hitting nothing, hitting the wrong group first) give the opponent ball in hand: click the table to place the white. Potting the 8 early loses.', 'Apunta con el ratón (o arrastra en táctil). Mantén pulsado para cargar fuerza y suelta para tirar, o usa la barra y pulsa Tirar. Flechas: ←/→ ajuste fino, ↑/↓ fuerza, Espacio/Enter tirar. Mete tu grupo (lisas 1–7 o rayadas 9–15, según la primera bola legal), luego la 8. Las faltas (blanca dentro, no tocar nada, tocar primero el grupo equivocado) dan bola en mano al rival: haz clic en la mesa para colocar la blanca. Meter la 8 antes de tiempo pierde.') };
  cancelAnimationFrame(raf); let last = performance.now(); const loop = now => { if (!G.open) return; raf = requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; tick(dt); draw() }; raf = requestAnimationFrame(loop);
};
G.close = function (conceded) {
  if (!G.open) return; G.open = false; cancelAnimationFrame(raf); removeEventListener('resize', fit); $('pool').style.display = 'none'; AV.popModal('pool');
  if (!S.over && conceded) { S.over = true; if (opts.onEnd) opts.onEnd(false, { conceded: true, pots: S.pots }) }
};
addEventListener('keydown', e => { if (!G.open) return; if (e.key === 'Escape') return; const k = e.code; if (S.turn !== 'p' || S.moving) return; if (k === 'ArrowLeft') aim.a -= e.shiftKey ? .002 : .012; else if (k === 'ArrowRight') aim.a += e.shiftKey ? .002 : .012; else if (k === 'ArrowUp') { aim.pow = Math.min(1, aim.pow + .05); $('ppow').value = aim.pow * 100 } else if (k === 'ArrowDown') { aim.pow = Math.max(.05, aim.pow - .05); $('ppow').value = aim.pow * 100 } else if ((k === 'Space' || k === 'Enter') && !S.inHand) { e.preventDefault(); shoot('p', aim.a, aim.pow) } else return; e.stopPropagation() }, true);

let sc = 300, ox = 0, oy = 0;
function fit() { const w = Math.min(innerWidth * .94, 980), h = Math.min(innerHeight * .64, w * .56); cv.width = w * devicePixelRatio; cv.height = h * devicePixelRatio; cv.style.width = w + 'px'; cv.style.height = h + 'px'; sc = Math.min((w - 40) / TW, (h - 40) / TH) * devicePixelRatio; ox = (cv.width - TW * sc) / 2; oy = (cv.height - TH * sc) / 2 }
function toTable(e) { const r = cv.getBoundingClientRect(), x = ((e.clientX - r.left) * devicePixelRatio - ox) / sc, y = ((e.clientY - r.top) * devicePixelRatio - oy) / sc; return { x: Math.max(R, Math.min(TW - R, x)), y: Math.max(R, Math.min(TH - R, y)) } }
const placeOK = (x, y) => S.balls.every(b => b.n === 0 || b.in || Math.hypot(b.x - x, b.y - y) > 2.1 * R);

function shoot(who, a, pow) {
  const c = S.balls[0]; c.vx = Math.cos(a) * MAXV * pow; c.vy = Math.sin(a) * MAXV * pow; S.moving = true; S.shooter = who; S.ev = { first: null, potted: [], rails: 0 }; S.shots[who]++; S.simT = 0;
  AV.audio && AV.audio.blip(900 + pow * 300, .05, 'triangle', .12);
}
function tick(dt) {
  if (S.msgT > 0) S.msgT -= dt;
  if (aim.charging) { aim.ph += dt * 1.6; aim.pow = .08 + (1 - Math.abs(1 - (aim.ph % 2))) * .92; $('ppow').value = aim.pow * 100 }
  if (S.moving) {
    const before = S.ev.potted.length, bh = S.ev.first; for (let i = 0; i < Math.round(dt / DT); i++) { stepOnce(); }
    if (S.ev.first != null && bh == null) AV.audio && AV.audio.blip(1300, .03, 'sine', .1);
    if (S.ev.potted.length > before) AV.audio && AV.audio.blip(220, .12, 'sine', .25);
    if (S.balls.every(b => b.in || (b.vx === 0 && b.vy === 0))) { S.moving = false; resolve() }
  } else if (S.turn === 'n' && !S.over) { S.think += dt; if (S.think > 1.3) { S.think = 0; nuniPlay() } }
}
function stepOnce() { const ev = S.ev; sim(S.balls, ev, DT * 1.01) }

function legalTargets(who) { const g = S.groups[who]; if (!g) return S.balls.filter(b => !b.in && b.n !== 0 && b.n !== 8); const left = S.balls.filter(b => !b.in && grp(b.n) === g); return left.length ? left : S.balls.filter(b => b.n === 8 && !b.in) }
function resolve() {
  const who = S.shooter, opp = who === 'p' ? 'n' : 'p', ev = S.ev, pot = ev.potted, cueIn = pot.indexOf(0) >= 0, eightIn = pot.indexOf(8) >= 0;
  const g = S.groups[who], onEight = !!g && !S.balls.some(b => grp(b.n) === g && (!b.in || pot.indexOf(b.n) >= 0));   // group already cleared BEFORE this shot
  let foul = cueIn || ev.first == null;
  if (!foul && g) { const fg = grp(ev.first); foul = onEight ? fg !== 'eight' : fg !== g }
  if (!foul && !g && ev.first === 8 && S.broke) foul = true;
  S.broke = true;
  if (eightIn) { end(onEight && !foul ? who : opp); return }
  let own = pot.filter(n => n !== 0 && n !== 8);
  if (!g && own.length && !foul) { const first = grp(own[0]); S.groups[who] = first; S.groups[opp] = first === 'solids' ? 'stripes' : 'solids'; AV.toast(tr('Groups: you have ', 'Grupos: tienes ') + (S.groups.p === 'solids' ? tr('solids (1–7)', 'lisas (1–7)') : tr('stripes (9–15)', 'rayadas (9–15)'))) }
  const mine = own.filter(n => grp(n) === S.groups[who]); S.pots[who] += mine.length;
  if (cueIn) { const c = S.balls[0]; c.in = false; c.x = TW * .25; c.y = TH / 2; c.vx = c.vy = 0 }
  if (foul) { S.turn = opp; S.inHand = true; if (opp === 'p') S.hand = { x: TW * .25, y: TH / 2 }; say(who === 'p' ? 'pFoul' : 'nFoul'); return }
  if (mine.length) { say(who === 'p' ? 'pPot' : 'nPot'); return }       // keep shooting
  S.turn = opp; say(who === 'p' ? 'pMiss' : 'nMiss');
}
function end(winner) { S.over = true; S.turn = '-'; say(winner === 'p' ? 'win' : 'lose'); setTimeout(() => { if (opts.onEnd) opts.onEnd(winner === 'p', { pots: S.pots, shots: S.shots }); setTimeout(() => G.open && G.close(false), 3500) }, 400) }

/* ---------------- Nuni's brain ---------------- */
function candidates(balls, who) {
  const c = balls[0], out = [], tg = (() => { const g = S.groups[who]; if (!g) return balls.filter(b => !b.in && b.n && b.n !== 8); const l = balls.filter(b => !b.in && grp(b.n) === g); return l.length ? l : balls.filter(b => b.n === 8 && !b.in) })();
  for (const b of tg) for (const p of POCKETS) {
    const px = p[0] + (p[0] === 0 ? R : p[0] === TW ? -R : 0) * .3, py = p[1] + (p[1] <= 0 ? R : -R) * .3, dx = px - b.x, dy = py - b.y, d2 = Math.hypot(dx, dy), gx = b.x - dx / d2 * 2 * R, gy = b.y - dy / d2 * 2 * R;
    const ax = gx - c.x, ay = gy - c.y, d1 = Math.hypot(ax, ay), cut = Math.acos(Math.max(-1, Math.min(1, (ax * dx + ay * dy) / (d1 * d2))));
    if (cut > 1.35 || !segClear(balls, c.x, c.y, gx, gy, [0, b.n]) || !segClear(balls, b.x, b.y, px, py, [b.n])) continue;
    out.push({ a: Math.atan2(ay, ax), pow: Math.min(1, .2 + (d1 * .55 + d2 * 1.15) / Math.max(.25, Math.cos(cut)) * .22), score: Math.cos(cut) * 2 - (d1 + d2) * .35, ball: b.n });
  }
  return out.sort((x, y) => y.score - x.score);
}
function bestPlacement() { let best = null; for (let i = 0; i < 60; i++) { const x = R + Math.random() * (TW - 2 * R), y = R + Math.random() * (TH - 2 * R); if (!placeOK(x, y)) continue; const bs = clone(S.balls); bs[0].x = x; bs[0].y = y; bs[0].in = false; const c = candidates(bs, 'n')[0]; if (c && (!best || c.score > best.s)) best = { x, y, s: c.score } } return best }
function nuniPlay() {
  if (S.inHand) { const p = bestPlacement() || { x: TW * .25, y: TH / 2 }; const c = S.balls[0]; c.x = p.x; c.y = p.y; c.in = false; S.inHand = false; S.think = .6; return }
  if (!S.broke) { shoot('n', Math.PI + (Math.random() - .5) * .02, 1); return }
  const pick = choose(S.balls);
  const err = (Math.random() + Math.random() + Math.random() - 1.5) * .0045 * ((opts && opts.skill) || 1);   // ~0.15° typical error: a champion, not a robot (2.3: opts.skill > 1 = weaker opponents in tournaments)
  aim.a = pick.a + err; S.nAim = aim.a; setTimeout(() => G.open && !S.over && shoot('n', pick.a + err, pick.pow), 700);
}
function choose(balls) {
  let cands = candidates(balls, 'n').slice(0, 7), pick = null, bestV = -1e9;
  for (const cd of cands) {   // simulate with her real physics; prefer pot + no scratch + a good next shot
    const bs = clone(balls); bs[0].vx = Math.cos(cd.a) * MAXV * cd.pow; bs[0].vy = Math.sin(cd.a) * MAXV * cd.pow; const ev = sim(bs, { first: null, potted: [], rails: 0 });
    if (ev.potted.indexOf(0) >= 0 || (ev.potted.indexOf(8) >= 0 && cd.ball !== 8)) continue; let v = ev.potted.indexOf(cd.ball) >= 0 ? 3 : 0;
    if (v) { const save = S.balls; S.balls = bs; const nx = candidates(bs, 'n')[0]; S.balls = save; v += nx ? nx.score : -.5 } v += cd.score * .3; if (v > bestV) { bestV = v; pick = cd }
  }
  if (!pick) {   // no pot available: safety — roll softly onto her nearest legal ball
    const c = balls[0], save = S.balls; S.balls = balls; const L = legalTargets('n'); S.balls = save;
    const tg = L.filter(b => segClear(balls, c.x, c.y, b.x, b.y, [0, b.n])).sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0] || L[0];
    pick = { a: Math.atan2(tg.y - c.y, tg.x - c.x), pow: .32, safety: true };
  }
  return pick;
}

/* ---------------- drawing ---------------- */
function draw() {
  const c = cx, W = cv.width, H = cv.height, X = v => ox + v * sc, Y = v => oy + v * sc;
  c.fillStyle = '#2a160c'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#5a2e14'; c.fillRect(ox - 26 * devicePixelRatio, oy - 26 * devicePixelRatio, TW * sc + 52 * devicePixelRatio, TH * sc + 52 * devicePixelRatio);
  const g = c.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * .6); g.addColorStop(0, '#2a8a6a'); g.addColorStop(1, '#14584a'); c.fillStyle = g; c.fillRect(ox, oy, TW * sc, TH * sc);
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.moveTo(X(TW * .25), oy); c.lineTo(X(TW * .25), oy + TH * sc); c.stroke();
  for (const p of POCKETS) { c.fillStyle = '#0a0806'; c.beginPath(); c.arc(X(p[0]), Y(p[1]), p[2] * sc * 1.05, 0, Math.PI * 2); c.fill() }
  for (const [x, y] of [[.5, -.06], [1, -.06], [1.54, -.06], [2.04, -.06], [.5, TH + .06], [1, TH + .06], [1.54, TH + .06], [2.04, TH + .06]]) { c.fillStyle = '#e8d8a8'; c.beginPath(); c.arc(X(x), Y(y), 3 * devicePixelRatio, 0, 7); c.fill() }
  /* aim */
  const cb = S.balls[0], myTurn = S.turn === 'p' && !S.moving && !S.over;
  if (myTurn && S.inHand && S.hand) { c.globalAlpha = .55; ball(S.hand.x, S.hand.y, 0); c.globalAlpha = 1; c.fillStyle = '#fff'; c.font = 14 * devicePixelRatio + 'px Georgia'; c.fillText(tr('Ball in hand: click to place the white', 'Bola en mano: haz clic para colocar la blanca'), ox + 10, oy - 8 * devicePixelRatio) }
  else if ((myTurn || (S.turn === 'n' && !S.moving && S.nAim != null)) && !cb.in) {
    const a = S.turn === 'n' ? S.nAim : aim.a, dx = Math.cos(a), dy = Math.sin(a); let hitT = 9, hb = null;
    for (const b of S.balls) { if (b.n === 0 || b.in) continue; const px = b.x - cb.x, py = b.y - cb.y, t = px * dx + py * dy; if (t < 0) continue; const off = Math.abs(px * dy - py * dx); if (off < 2 * R) { const tt = t - Math.sqrt(4 * R * R - off * off); if (tt < hitT) { hitT = tt; hb = b } } }
    if (!hb) { const tx = dx > 0 ? (TW - R - cb.x) / dx : dx < 0 ? (R - cb.x) / dx : 9, ty = dy > 0 ? (TH - R - cb.y) / dy : dy < 0 ? (R - cb.y) / dy : 9; hitT = Math.min(tx, ty) }
    const gx = cb.x + dx * hitT, gy = cb.y + dy * hitT; c.setLineDash([6 * devicePixelRatio, 6 * devicePixelRatio]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5 * devicePixelRatio; c.beginPath(); c.moveTo(X(cb.x), Y(cb.y)); c.lineTo(X(gx), Y(gy)); c.stroke(); c.setLineDash([]);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(X(gx), Y(gy), R * sc, 0, 7); c.stroke();
    if (hb) { const nx = hb.x - gx, ny = hb.y - gy, l = Math.hypot(nx, ny); c.strokeStyle = 'rgba(255,240,160,.7)'; c.beginPath(); c.moveTo(X(hb.x), Y(hb.y)); c.lineTo(X(hb.x + nx / l * .3), Y(hb.y + ny / l * .3)); c.stroke() }
    const pull = (S.turn === 'p' ? aim.pow : .5) * .25 + .04; c.strokeStyle = '#d8b080'; c.lineWidth = 7 * devicePixelRatio; c.lineCap = 'round'; c.beginPath(); c.moveTo(X(cb.x - dx * (R + pull)), Y(cb.y - dy * (R + pull))); c.lineTo(X(cb.x - dx * (R + pull + 1.1)), Y(cb.y - dy * (R + pull + 1.1))); c.stroke(); c.lineCap = 'butt';
  }
  for (const b of S.balls) if (!b.in) ball(b.x, b.y, b.n);
  function ball(x, y, n) { const r = R * sc, px = X(x), py = Y(y); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(px + r * .25, py + r * .3, r, 0, 7); c.fill();
    if (n > 8) { c.fillStyle = '#f4f0e4'; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); c.save(); c.beginPath(); c.arc(px, py, r, 0, 7); c.clip(); c.fillStyle = COLS[n]; c.fillRect(px - r, py - r * .55, r * 2, r * 1.1); c.restore() } else { c.fillStyle = COLS[n]; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill() }
    if (n) { c.fillStyle = '#fff'; c.beginPath(); c.arc(px, py, r * .45, 0, 7); c.fill(); c.fillStyle = '#111'; c.font = 'bold ' + (r * .62) + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, px, py + r * .04) }
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(px - r * .35, py - r * .38, r * .22, 0, 7); c.fill() }
  /* header */
  const lab = w => S.groups[w] ? (S.groups[w] === 'solids' ? tr('solids', 'lisas') : tr('stripes', 'rayadas')) + ' · ' + S.balls.filter(b => !b.in && grp(b.n) === S.groups[w]).length + tr(' left', ' quedan') : tr('open table', 'mesa abierta');
  $('psc').textContent = tr('You', 'Tú') + ': ' + lab('p') + '   |   Nuni: ' + lab('n') + '   |   ' + (S.over ? tr('Game over', 'Fin') : S.turn === 'p' ? tr('YOUR SHOT', 'TU TIRO') : tr('Nuni is shooting…', 'Tira Nuni…'));
  $('pmsg').textContent = S.msgT > 0 ? ' — Nuni: “' + S.msg + '”' : '';
}
G.open = false; G.openGame.rules = { TW, TH, R };
/* test hook: how often does Nuni pot a ball from a random open-table layout (with her real aim error)? */
G._test = { sim, rack, potRate(n) { const s0 = S; let pots = 0, tries = 0; for (let k = 0; k < n; k++) { S = { groups: { p: null, n: null }, balls: null }; const bs = rack(); bs.forEach(b => { b.x = .1 + Math.random() * (TW - .2); b.y = .1 + Math.random() * (TH - .2) }); bs.forEach((b, i) => { if (bs.some((o, j) => j < i && Math.hypot(o.x - b.x, o.y - b.y) < 2.1 * R)) b.in = true }); S.balls = bs;
  const pk = choose(bs); if (pk.safety) continue; tries++; const err = (Math.random() + Math.random() + Math.random() - 1.5) * .0045; const c2 = clone(bs); c2[0].vx = Math.cos(pk.a + err) * MAXV * pk.pow; c2[0].vy = Math.sin(pk.a + err) * MAXV * pk.pow; const ev = sim(c2); if (ev.potted.some(x => x !== 0 && x !== 8) && ev.potted.indexOf(0) < 0) pots++ } S = s0; return { tries, pots, rate: tries ? pots / tries : 0 } } };
})(window.AV);
