/* APEVERSE 2.0 - music_life.js : M10. Music + bands: a musical life on top of the DJ booths and instruments (music_play.js,
   dj_mixer.js) and the residents (residents.js).
   - Stone Ape Band (Ape Town, Lotus Stage): two sets a night (19:00 sunset set, 22:00 late set). A board by the stage shows set
     times, the setlist (the stone_ape_band playlist, split into sets) and what is playing. Catch 30 minutes of a set: +music rep.
   - Your band (Madrid, Sala Malasaña): the musicians you recruited (Kofi guitar, Inés vocals, Nacho drums) are members.
     Rehearse at the stage (11:00-20:00, room 20 credits): members come over, you play the band jam on the beat, skill grows,
     every couple of good rehearsals you write a song. Book a gig (1+ member, 2+ songs) for 22:00: members walk to the stage,
     a crowd fills the hall and dances, you play the set; pay = door split by crowd and quality, fans + music rep, no-show costs rep.
   - DJ nights: book a night (22:00-02:00) at a DJ booth (Jungle Dub, La Finca, Flex, Club Graviton - fee and reputation tiers).
     Play the booth in that window: paid by time on the decks, mixes (the audible deck changes while both decks run), minus dead air.
   - Band & gigs panel (from the People panel, Z): gig guide (Stone Ape Band sets, Kofi's schedule, your bookings, DJ venues),
     your band (members, skill, songs, fans, history).
   Save: optional S.band.{skill,songs,fans,gigs,reh,prog,booked}, S.djNights.{booked,nights} (S.dj is the mixer's track memory), S.sab.seen.  AV.gigs */
'use strict';
(function (AV) {
const tr = AV.tr, L = (e, s) => [e, s], say = a => tr(a[0], a[1]), ACT = AV.act; if (!ACT) return;
const ML = AV.gigs = { stats: { setsSeen: 0, rehearsals: 0, gigs: 0, djNights: 0 }, last: null };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const st = () => { const S = AV.S; S.band = S.band || { members: [] }; const b = S.band; b.members = b.members || []; b.skill = b.skill || 0; b.songs = b.songs || []; b.fans = b.fans || 0; b.gigs = b.gigs || []; b.reh = b.reh || 0; b.prog = b.prog || 0;
  S.rep = S.rep || { barrio: 0, business: 0, music: 0 }; S.djNights = S.djNights || { booked: null, nights: [] }; S.sab = S.sab || { seen: {} }; return S };
const rep = n => { const S = st(); S.rep.music = Math.max(-50, Math.min(100, (S.rep.music || 0) + n)) };
const hr = () => Math.floor(AV.S.time / 60) % 24, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ROLE = { kofi: L('guitar', 'guitarra'), ines: L('vocals', 'voz'), nacho: L('drums', 'batería') };
ML.ROLE = ROLE;

/* ======================= Stone Ape Band: schedule + setlist ======================= */
const SETS = [{ h: 19, len: 90, n: L('Sunset set', 'Set del atardecer') }, { h: 22, len: 90, n: L('Late set', 'Set de la noche') }];
ML.SETS = SETS;
ML.setNow = (t = AV.S.time) => (AV.fest && AV.fest.headNow && t === AV.S.time && AV.fest.headNow('hanging_bazaar')) ? null : SETS.find(s => t >= s.h * 60 && t < s.h * 60 + s.len) || null;
ML.nextSet = (t = AV.S.time) => SETS.find(s => s.h * 60 > t) || SETS[0];
ML.setlist = i => { const T = ((AV.MUSIC || {}).stone_ape_band || {}).tracks || [], half = Math.ceil(T.length / 2); return (i === 0 ? T.slice(0, half) : T.slice(half).concat(T.slice(0, 1))).map(t => t.title) };
let sab = null;   /* { x, z, acc, key } while in Ape Town */
function sabPanel() { const now = ML.setNow(), np = AV.audio && AV.audio.nowPlaying && AV.audio.nowPlaying(), fmtH = s => String(s.h).padStart(2, '0') + ':00–' + String(s.h + Math.floor(s.len / 60)).padStart(2, '0') + ':' + String(s.len % 60).padStart(2, '0');
  let h = '<b>🎸 Stone Ape Band · ' + tr('Lotus Stage', 'Escenario de Loto') + '</b><div class="note">' + (now ? '🔴 ' + tr('LIVE NOW: ', 'EN DIRECTO: ') + say(now.n) : tr('Next: ', 'Siguiente: ') + say(ML.nextSet().n) + ' · ' + fmtH(ML.nextSet())) + (np && np.playlist ? '<br>♪ ' + esc(np.title) + (np.playing ? '' : tr(' (loading / paused)', ' (cargando / en pausa)')) : '') + '</div>';
  SETS.forEach((s, i) => { h += '<div class="note"><b>' + say(s.n) + '</b> · ' + fmtH(s) + '<br>' + ML.setlist(i).map((t, k) => (k + 1) + '. ' + esc(t) + (np && np.title === t ? ' ◀' : '')).join('<br>') + '</div>' });
  h += '<div class="note">' + tr('Catch half an hour of a set to become a regular (+music reputation).', 'Quédate media hora en un set para ser habitual (+reputación musical).') + '</div><div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>'; AV.panel('cmp', h) }
ML.sabPanel = sabPanel;
function sabTick(dt) { if (!sab) return; const s = ML.setNow(), P = AV.P; if (!s || Math.hypot(P.x - sab.x, P.z - sab.z) > 30) { sab.acc = 0; return } const key = AV.S.day + ':' + s.h, S = st(); if (S.sab.seen[key]) return; if (sab.key !== key) { sab.key = key; sab.acc = 0 }
  sab.acc += dt * 2; if (sab.acc >= 30) { S.sab.seen[key] = 1; rep(1); ML.stats.setsSeen++; AV.vitals && AV.vitals.add(0, 6); AV.save(); AV.toast('🎸 ' + tr('You caught the Stone Ape Band\'s ' + say(s.n).toLowerCase() + '. +music rep', 'Viste el ' + say(s.n).toLowerCase() + ' de la Stone Ape Band. +reputación musical')) } }

/* ======================= your band (Madrid, Sala Malasaña) ======================= */
let SB = null, sess = null, music0 = null, crowd = [];
function findStage(W) { const sala = (W.places || []).find(p => p.id === 'sala'); if (!sala) return null; let best = null, bd = 1e9;
  for (const c of W.cols) { const w = c[1] - c[0], d = c[3] - c[2]; if (w < 3.5 || w > 4.7 || d < 9 || d > 11) continue; const dd = Math.hypot((c[0] + c[1]) / 2 - sala.x, (c[2] + c[3]) / 2 - sala.z); if (dd < 40 && dd < bd) { bd = dd; best = c } }
  if (!best) return null; const [x0, x1, z0, z1] = best, zc = (z0 + z1) / 2, front = x1 + 1.1;
  const spots = [-2.6, 0, 2.6].map(o => ({ x: front, z: zc + o, stage: { x: x0 + 2.4, y: .8, z: zc + o, yaw: Math.PI / 2 } }));   /* members: walk to the front, then stand on the platform facing the hall (east) */
  const play = { x: x1 + 1.8, z: zc + 4.6 }, hall = []; for (let x = x1 + 3.5; x < x1 + 13; x += 1.6) for (let z = z0 - 1; z <= z1 + 1; z += 1.6) if (AV.isFree(W, x, z, .45)) hall.push([x, z]);
  return { x0, x1, z0, z1, zc, spots, play, hall, door: { x: sala.x, z: sala.z } } }
ML.spot = id => { if (!SB) return null; const i = Math.max(0, st().band.members.indexOf(id)); return SB.spots[i % SB.spots.length] };
ML.call = (id, h) => { const b = st().band; if (!b.members.includes(id) || !SB) return null; if (sess && AV.abs() < sess.until) return { key: 'stage', verb: sess.kind };
  const g = b.booked; if (g && !g.done && AV.S.day === g.day && h >= g.h - 1) return { key: 'stage', verb: 'gig' }; return null };
function summon() { /* members far away come over (by metro) and walk in from the door */ const PE = AV.people; if (!PE || !SB) return; for (const id of st().band.members) { const p = PE.list.find(q => q.id === id); if (p && Math.hypot(p.x - SB.door.x, p.z - SB.door.z) > 60) { p.x = SB.door.x + (Math.random() - .5) * 3; p.z = SB.door.z + (Math.random() - .5) * 3; p.path = null; p.slot = null } } }
const present = () => { const PE = AV.people; if (!PE || !SB) return 0; return st().band.members.filter(id => { const p = PE.list.find(q => q.id === id); return p && Math.hypot(p.x - SB.spots[0].x, p.z - SB.zc) < 9 }).length };
function stageMusic(on) { const W = AV.W; if (!W || !AV.audio || !AV.audio.setWorld) return; if (on) { if (music0 === null) music0 = W.music || false; const k = (AV.MUSIC || {}).stone_ape_band ? 'stone_ape_band' : Object.keys(AV.MUSIC || {})[0]; W.music = { playlist: k, pos: { x: SB.x1 - 1, y: 2.4, z: SB.zc }, bed: .3 }; AV.audio.setWorld(W) }
  else if (music0 !== null) { W.music = music0 || undefined; music0 = null; AV.audio.setWorld(W) } }
function spawnCrowd(n) { dropCrowd(); const W = AV.W, q = (W.ctx && W.ctx.q) || 0; n = Math.min(n, [5, 9, 12][q], SB.hall.length); const sp = SB.hall.slice().sort(() => Math.random() - .5);
  for (let i = 0; i < n; i++) { try { const A = AV.chars.softActor('human', 9100 + i * 31 + st().band.gigs.length * 7, { lod: true, shells: 0, shadow: false, crowd: true }), h = new THREE.Group(); h.add(A.root); const [x, z] = sp[i]; h.position.set(x, W.surface(x, z) || 0, z); h.rotation.y = -Math.PI / 2 + (Math.random() - .5) * .5; W.ctx.group.add(h); crowd.push({ h, actor: A.actor, x, z }) } catch (e) { console.warn('gig crowd', e) } }
  ML.stats.crowd = crowd.length; return crowd.length }
function dropCrowd() { for (const c of crowd) { c.h.parent && c.h.parent.remove(c.h); c.h.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose() }) } crowd = [] }
const kindFor = () => st().band.members.includes('nacho') ? 'keys' : 'drums';
function startSession(kind) { const W = AV.W, b = st().band; sess = { kind, until: AV.abs() + (kind === 'gig' ? 150 : 120), t0: AV.abs() }; summon(); stageMusic(true);
  if (kind === 'gig') { const n = 3 + Math.floor(b.fans / 8) + Math.floor(Math.max(0, st().rep.music) / 6); sess.crowd = spawnCrowd(n) }
  const v = { type: 'inst', p: { band: true, noTip: true, gig: kind, name: kind === 'gig' ? L('your gig at Sala Malasaña', 'tu concierto en Sala Malasaña') : L('rehearsal at Sala Malasaña', 'ensayo en Sala Malasaña') }, W, x: SB.play.x, z: SB.play.z };
  if (!ACT.start('instrument', { v, kind: kindFor() })) { sess = null; stageMusic(false); dropCrowd(); return false } return true }
ML.rehearse = function () { const b = st().band; if (!SB || !b.members.length || ACT.cur) return false; const h = hr(); if (h < 11 || h >= 20) { AV.toast(tr('The room is free for rehearsals 11:00–20:00.', 'La sala está libre para ensayar de 11:00 a 20:00.')); return false }
  if (!AV.txn(-20, tr('Rehearsal room, Sala Malasaña', 'Sala de ensayo, Sala Malasaña'))) return false; return startSession('rehearsal') };
ML.playGig = function () { const g = st().band.booked; if (!SB || !g || g.done || g.day !== AV.S.day || hr() < g.h || ACT.cur) return false; return startSession('gig') };
const W1 = ['Neon', 'Lazy', 'Golden', 'Midnight', 'Concrete', 'Velvet', 'Lucky', 'Electric', 'Barrio', 'Paper', 'Rooftop', 'Slow'], W2 = ['Sunday', 'Gran Vía', 'Heartbeat', 'Moon', 'Metro', 'Groove', 'Summer', 'Static', 'Siesta', 'Fever', 'Echo', 'Avenue'];
function songName(n) { return W1[(n * 7 + 3) % W1.length] + ' ' + W2[(n * 5 + 1) % W2.length] }
function endBand(s) { const b = st().band, kind = s.v.p.gig, hits = s.hits || 0, on = s.onBeat || 0, acc = hits ? on / hits : 0, pres = present(); stageMusic(false); sess = null; let res;
  if (kind === 'rehearsal') { if (hits < 8) res = { kind, short: true, text: tr('Too short to count as a rehearsal.', 'Demasiado corto para contar como ensayo.') };
    else { const gain = +(Math.min(10, on / 3) * (.6 + .2 * pres) * (1 - b.skill / 150)).toFixed(1); b.skill = clamp(+(b.skill + gain).toFixed(1), 0, 100); b.reh++; b.prog += on >= 12 ? 1 : .5; let song = null;
      if (b.prog >= 2) { b.prog -= 2; song = { n: songName(b.songs.length + b.reh), q: Math.round(clamp(b.skill * .7 + acc * 30, 5, 100)), day: AV.S.day }; b.songs.push(song) } rep(1); ML.stats.rehearsals++;
      res = { kind, on, hits, acc, gain, pres, song, text: tr('Rehearsal: ', 'Ensayo: ') + on + '/' + hits + tr(' on the beat · band skill +', ' a tiempo · nivel +') + gain + ' (' + Math.round(b.skill) + ')' + (song ? tr(' · new song: “', ' · canción nueva: “') + song.n + '”' : '') } } }
  else { const g = b.booked; if (g) g.done = true; const n = crowd.length; dropCrowd();
    if (hits < 16) { rep(-2); res = { kind, walked: true, text: tr('You walked off after a few notes. The crowd boos; the venue is not impressed.', 'Te bajaste del escenario tras unas notas. El público abuchea.') } }
    else { const sq = b.songs.length ? b.songs.reduce((a, x) => a + x.q, 0) / b.songs.length : 30, quality = clamp(.45 * acc + .3 * b.skill / 100 + .25 * sq / 100, 0, 1), pay = Math.round(n * 9 * (.4 + quality)), fans = Math.round(n * quality * 1.5), rp = Math.round(2 + 6 * quality);
      AV.txn(pay, tr('Gig at Sala Malasaña (door split)', 'Concierto en Sala Malasaña (taquilla)')); b.fans += fans; rep(rp); for (const id of b.members) { const m = AV.people && AV.people.mem(id); if (m) m.f = Math.min(100, m.f + 5) } AV.vitals && AV.vitals.add(0, 12);
      b.gigs.push({ day: AV.S.day, venue: 'sala', crowd: n, acc: +acc.toFixed(2), q: +quality.toFixed(2), pay, fans }); ML.stats.gigs++;
      res = { kind, on, hits, acc, quality, pay, fans, rp, crowd: n, text: tr('Gig: ', 'Concierto: ') + n + tr(' in the crowd · ', ' de público · ') + Math.round(acc * 100) + tr('% on the beat · ', '% a tiempo · ') + '+' + pay + tr(' credits · +', ' créditos · +') + fans + tr(' fans', ' fans') } } }
  ML.last = res; AV.save(); AV.toast((kind === 'gig' ? '🎤 ' : '🎸 ') + res.text) }

/* ======================= DJ nights ======================= */
const VEN = [{ w: 'jungle_dub', re: /Jungle Dub/i, fee: 70, rep: 0, n: L('Jungle Dub sound system', 'Sound system de Jungle Dub') }, { w: 'ape_town', re: /La Finca/i, fee: 60, rep: 0, n: L('La Finca block party (Ape Town)', 'Fiesta de La Finca (Ape Town)') },
  { w: 'vienna', re: /Flex/i, fee: 120, rep: 8, n: L('Flex, Donaukanal (Vienna)', 'Flex, Donaukanal (Viena)') }, { w: 'astro9', re: /Graviton/i, fee: 160, rep: 15, n: L('Club Graviton (Astro-9)', 'Club Graviton (Astro-9)') }];
ML.VEN = VEN;
const inWindow = (b, d = AV.S.day, t = AV.S.time) => b && !b.done && ((d === b.day && t >= b.h * 60) || (d === b.day + 1 && t < 120));
ML.bookDJ = function (i) { const S = st(), v = VEN[i]; if (!v || (S.djNights.booked && !S.djNights.booked.done) || S.rep.music < v.rep) return false; S.djNights.booked = { v: i, w: v.w, day: AV.S.day + (hr() >= 21 ? 1 : 0), h: 22 }; AV.save(); AV.toast('🎧 ' + tr('DJ night booked: ', 'Noche de DJ reservada: ') + say(v.n) + (S.djNights.booked.day > AV.S.day ? tr(', tomorrow', ', mañana') : '') + ' 22:00–02:00'); return true };
ML.bookGig = function () { const b = st().band; if (!b.members.length || b.songs.length < 2 || (b.booked && !b.booked.done)) return false; b.booked = { day: AV.S.day + (hr() >= 20 ? 1 : 0), h: 22, venue: 'sala' }; AV.save(); AV.toast('🎤 ' + tr('Gig booked: Sala Malasaña, ', 'Concierto reservado: Sala Malasaña, ') + (b.booked.day > AV.S.day ? tr('tomorrow', 'mañana') : tr('tonight', 'esta noche')) + ' 22:00'); return true };
function djStart(s) { const S = st(), b = S.djNights.booked; if (!b || !s.v || !s.v.p || AV.W.id !== b.w || !VEN[b.v].re.test(say(s.v.p.name || ['', '']))) return; if (!inWindow(b)) return; s.djGig = { play: 0, silence: 0, trans: 0, side: null, started: false }; AV.toast('🎧 ' + tr('Your booked DJ night! Keep the music going, mix between decks, avoid dead air.', '¡Tu noche de DJ! Mantén la música, mezcla entre platos, evita silencios.')) }
function djTick(dt) { const s = ACT.cur; if (!s || s.id !== 'dj' || !s.djGig) return; const D = AV.dj, g = s.djGig, on = D && D.playing && D.playing(); if (on) { g.play += dt; g.started = true } else if (g.started) g.silence += dt;
  if (D && D.level) { const run = k => D.decks && D.decks[k] && D.decks[k].track && !D.decks[k].el.paused, both = run('a') && run('b'), side = D.level('a') >= D.level('b') ? 'a' : 'b';   /* a mix: the audible deck changes while both decks run (blend or cut) */ if (g.side && side !== g.side && both) g.trans++; g.side = side } }
function djEnd(s) { const g = s.djGig, S = st(), b = S.djNights.booked; if (!g || !b) return; b.done = true; const v = VEN[b.v], k = Math.min(1, g.play / 90), pay = Math.max(0, Math.round(v.fee * k * (.75 + .1 * Math.min(3, g.trans)) - g.silence * 2)), rp = Math.round(1 + 4 * k) + (g.trans >= 2 ? 1 : 0);
  if (pay) AV.txn(pay, tr('DJ night: ', 'Noche de DJ: ') + say(v.n)); rep(rp); S.djNights.nights.push({ day: AV.S.day, w: v.w, secs: Math.round(g.play), mixes: g.trans, dead: Math.round(g.silence), pay }); ML.stats.djNights++;
  ML.last = { kind: 'dj', pay, rp, secs: g.play, trans: g.trans, silence: g.silence, text: tr('DJ night: ', 'Noche de DJ: ') + Math.round(g.play) + tr(' s on the decks · ', ' s en los platos · ') + g.trans + tr(' mixes · ', ' mezclas · ') + Math.round(g.silence) + tr(' s dead air · +', ' s de silencio · +') + pay + tr(' credits', ' créditos') };
  AV.save(); AV.toast('🎧 ' + ML.last.text) }

/* hooks: results when an activity ends, DJ gigs when one starts */
const aEnd = ACT.end; ACT.end = function (why) { const s = ACT.cur; const r = aEnd.apply(this, arguments); try { if (s && s.v && s.v.p && s.v.p.gig) endBand(s); else if (s && s.id === 'dj') djEnd(s) } catch (e) { console.warn('music_life end', e) } return r };
const aStart = ACT.start; ACT.start = function (id, opt) { const ok = aStart.apply(this, arguments); try { if (ok && id === 'dj') djStart(ACT.cur) } catch (e) { console.warn('music_life start', e) } return ok };

/* no-shows */
function bookingsTick() { const S = st(), b = S.band.booked, d = S.djNights.booked; if (b && !b.done && (AV.S.day > b.day)) { b.done = true; b.noShow = true; rep(-3); AV.save(); AV.toast('🎤 ' + tr('You missed your gig at Sala Malasaña. The booker is not happy (−music rep).', 'Faltaste a tu concierto en Sala Malasaña (−reputación musical).')) }
  if (d && !d.done && (AV.S.day > d.day + 1 || (AV.S.day === d.day + 1 && AV.S.time >= 120))) { d.done = true; d.noShow = true; rep(-3); AV.save(); AV.toast('🎧 ' + tr('You missed your DJ night (−music rep).', 'Faltaste a tu noche de DJ (−reputación musical).')) } }

/* ======================= panel: gig guide + your band ======================= */
ML.panel = function (tab) { tab = tab || 'gigs'; const S = st(), b = S.band, h = hr(), dayWord = d => d === AV.S.day ? tr('tonight', 'esta noche') : d === AV.S.day + 1 ? tr('tomorrow', 'mañana') : tr('day ', 'día ') + d;
  let x = '<b>🎸 ' + tr('Band & gigs', 'Banda y conciertos') + '</b> · ' + tr('music rep ', 'reputación musical ') + Math.round(S.rep.music) + ' · ' + b.fans + tr(' fans', ' fans') + '<div class="row"><button data-tab="gigs"' + (tab === 'gigs' ? ' disabled' : '') + '>' + tr('Gig guide', 'Agenda') + '</button><button data-tab="band"' + (tab === 'band' ? ' disabled' : '') + '>' + tr('Your band', 'Tu banda') + '</button></div>';
  if (tab === 'gigs') { const now = ML.setNow(); x += '<div class="note"><b>Stone Ape Band</b> · Ape Town, ' + tr('Lotus Stage', 'Escenario de Loto') + '<br>' + SETS.map(s => (now === s ? '🔴 ' : '') + String(s.h).padStart(2, '0') + ':00 ' + say(s.n)).join(' · ') + '</div>';
    x += AV.fest && AV.fest.guideHtml ? AV.fest.guideHtml() : '';   /* M14 festivals */
    const K = AV.people && AV.people.R && AV.people.R.kofi; if (K) x += '<div class="note"><b>Kofi</b> · ' + K.day.filter(d => d[3] === 'busking' || d[3] === 'gig').map(d => (d[0] % 24) + ':00–' + (d[1] % 24) + ':00 ' + (d[3] === 'busking' ? 'Puerta del Sol' : 'Sala Malasaña')).join(' · ') + '</div>';
    const g = b.booked; x += '<div class="note"><b>' + tr('Your band', 'Tu banda') + '</b> · Sala Malasaña<br>' + (g && !g.done ? '🎤 ' + tr('Booked: ', 'Reservado: ') + dayWord(g.day) + ' 22:00' + (inWindow(g) ? tr(' — go to the stage and play!', ' — ¡ve al escenario y toca!') : '') : (b.members.length && b.songs.length >= 2 ? '<button data-gig>' + tr('Book a gig at Sala Malasaña', 'Reservar concierto en Sala Malasaña') + '</button>' : tr('Needs 1+ band member and 2+ songs (', 'Necesita 1+ miembro y 2+ canciones (') + b.members.length + ' · ' + b.songs.length + ')')) + '</div>';
    const d = S.djNights.booked, dOpen = d && !d.done; x += '<div class="note"><b>' + tr('DJ nights', 'Noches de DJ') + '</b> (22:00–02:00)' + (dOpen ? '<br>🎧 ' + tr('Booked: ', 'Reservado: ') + say(VEN[d.v].n) + ', ' + dayWord(d.day) : '') + '</div><div class="bgrid">';
    VEN.forEach((v, i) => { const ok = !dOpen && S.rep.music >= v.rep; x += '<div class="bitem"><div class="bic">🎧</div><div class="bnm">' + esc(say(v.n)) + '<small>' + tr('fee up to ', 'hasta ') + v.fee + tr(' · needs music rep ', ' · requiere reputación ') + v.rep + '</small></div><div class="bbt"><button data-dj="' + i + '"' + (ok ? '' : ' disabled') + '>' + tr('Book', 'Reservar') + '</button></div></div>' }); x += '</div>' }
  else { x += '<div class="note">' + tr('Skill ', 'Nivel ') + Math.round(b.skill) + '/100 · ' + b.reh + tr(' rehearsals · ', ' ensayos · ') + b.songs.length + tr(' songs', ' canciones') + '</div><div class="bgrid">';
    if (!b.members.length) x += '<div class="note">' + tr('No members yet. Make friends with Madrid\'s musicians and ask them to join: Kofi (guitar), Inés (vocals), Nacho (drums).', 'Aún no hay miembros. Hazte amigo de los músicos de Madrid y pídeles que se unan: Kofi (guitarra), Inés (voz), Nacho (batería).') + '</div>';
    for (const id of b.members) { const r = AV.people && AV.people.R[id], m = AV.people && AV.people.mem(id); x += '<div class="bitem"><div class="bic">🎶</div><div class="bnm">' + esc(r ? r.n : id) + ' · ' + esc(say(ROLE[id] || L('music', 'música'))) + '<small>♥ ' + (m ? m.f : 0) + '</small></div><div class="bbt"></div></div>' }
    x += '</div>' + (b.songs.length ? '<div class="note"><b>' + tr('Songs', 'Canciones') + '</b><br>' + b.songs.map(s => '“' + esc(s.n) + '” · ' + s.q).join('<br>') + '</div>' : '') + (b.gigs.length ? '<div class="note"><b>' + tr('Gigs', 'Conciertos') + '</b><br>' + b.gigs.slice(-5).map(g => tr('day ', 'día ') + g.day + ' · ' + g.crowd + tr(' people · ', ' personas · ') + '+' + g.pay).join('<br>') + '</div>' : '') +
      '<div class="note">' + tr('Rehearse at the Sala Malasaña stage, 11:00–20:00 (room 20 credits). Two good rehearsals write a song.', 'Ensaya en el escenario de Sala Malasaña, 11:00–20:00 (sala 20 créditos). Dos buenos ensayos escriben una canción.') + '</div>' }
  x += (ML.last ? '<div class="note">' + esc(ML.last.text) + '</div>' : '') + '<div class="row"><button data-close>' + tr('Done', 'Listo') + '</button></div>';
  const pn = AV.panel('cmp', x); pn.querySelectorAll('[data-tab]').forEach(e => e.onclick = () => ML.panel(e.dataset.tab)); pn.querySelectorAll('[data-dj]').forEach(e => e.onclick = () => { ML.bookDJ(+e.dataset.dj); ML.panel('gigs') }); const gb = pn.querySelector('[data-gig]'); if (gb) gb.onclick = () => { ML.bookGig(); ML.panel('gigs') } };

/* ======================= world hooks ======================= */
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); SB = null; sab = null; sess = null; music0 = null; crowd = []; if (!W || !W.ctx) return; st();
  try { if (W.id === 'ape_town') { const tip = W.T.find(t => /Tip the band/.test(typeof t.label === 'function' ? t.label() : String(t.label))); const x = tip ? tip.x : 0, z = tip ? tip.z : 49; sab = { x, z, acc: 0 };
      W.T.push({ x: x + 5, z: z + 1.5, r: 2.4, label: () => '📋 Stone Ape Band: ' + (ML.setNow() ? tr('LIVE now · setlist', 'EN DIRECTO · setlist') : tr('set times + setlist', 'horarios + setlist')), fn: sabPanel }) }
    if (W.id === 'madrid') { SB = findStage(W); ML.stats.stage = !!SB; if (SB) { const P = SB.play;
      W.T.push({ x: P.x, z: P.z, r: 2.2, show: () => !ACT.cur && st().band.members.length > 0 && ((hr() >= 11 && hr() < 20) || inWindow(st().band.booked)), label: () => inWindow(st().band.booked) ? tr('🎤 Play your gig (', '🎤 Toca tu concierto (') + st().band.members.length + tr(' bandmates on stage)', ' compañeros en el escenario)') : tr('🎸 Rehearse with your band (20 credits)', '🎸 Ensayar con tu banda (20 créditos)'), fn: () => inWindow(st().band.booked) ? ML.playGig() : ML.rehearse() });
      W.T.push({ x: SB.x1 + 1.4, z: SB.z0 - 1.4, r: 2, label: () => tr('🎫 Sala Malasaña: band bookings + gig guide', '🎫 Sala Malasaña: reservas y agenda'), fn: () => ML.panel('gigs') }) } }
    W.ctx.upd.push(dt => { dt = Math.min(dt, .1); sabTick(dt); djTick(dt); bookingsTick(); if (crowd.length) { const dancing = ACT.cur && ACT.cur.v && ACT.cur.v.p && ACT.cur.v.p.gig === 'gig'; for (const c of crowd) if (c.actor) { c.actor.play && c.actor.play(dancing ? 'Dance' : 'Idle'); c.actor.mixer && c.actor.mixer.update(dt) } } });
    W.ctx.leave.push(() => { dropCrowd(); if (ACT.cur && ACT.cur.v && ACT.cur.v.p && ACT.cur.v.p.gig) ACT.end('leave') }) } catch (e) { console.warn('music_life failed', e); ML.stats.err = String(e) } };
})(window.AV);
