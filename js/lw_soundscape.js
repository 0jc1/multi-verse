/* APEVERSE 2.3 - lw_soundscape.js : recorded, spatial, city-specific ambience (owner: "realistic street, traffic, crowd, market,
   nature and nightlife sound recordings ... spatial and specific to each city").
   Recordings: assets/sfx/cc0_commons/*.ogg - public domain / CC0 files from Wikimedia Commons, licence verified per file at download
   (assets/sfx/cc0_commons/CREDITS.json keeps title, author, licence and source page for each).
   - Street bed: two long street recordings crossfaded from random offsets (no short recognisable loop), city worlds only, outdoors only.
   - Place emitters: every named place is classified (market / café-restaurant / bar-club / square / beach / park) and the nearest few
     play their recording through a PannerNode at the place's real position, so they get louder as you approach and pan as you turn.
     Bars and clubs only at night, markets and squares mostly by day.
   - Passing vehicles: recorded mopeds / motorbikes / a car, swept across the stereo field with a Doppler-like playback-rate glide
     (Thai worlds: mostly mopeds; Europe: cars + motorbikes).  Replaces the procedural pass-bys from lw_audio.js when recordings load.
   Volumes follow the Settings sliders: ambience (va), crowds (vc), vehicles (vv).  AV.LW.scape.stats for tests. */
'use strict';
(function (AV) {
const LW = AV.LW, DIR = 'assets/sfx/cc0_commons/';
const SC = LW.scape = { buf: {}, stats: { loaded: 0, failed: 0, emitters: 0, passes: 0, bed: false }, on: true };
const vol = k => { const s = (AV.S && AV.S.set) || {}; return s[k] == null ? 1 : +s[k] };
const NATURE = { verdalux: 1, koh_samui_jurassic: 1, judean_desert: 1, nimbus: 1, jungle_dub: 1, astro9: 1 }, THAI = { chiang_mai: 1, pai: 1, koh_tao: 1, da_nang: 1 };
const KINDS = { market: { files: ['market_rain', 'crowd_mall'], g: .55, r: 45, day: 1 }, cafe: { files: ['restaurant', 'talk_group1', 'talk_group3'], g: .5, r: 28 }, bar: { files: ['party', 'talk_group3'], g: .55, r: 34, night: 1 },
  square: { files: ['crowd_mall', 'talk_group1'], g: .45, r: 40, day: 1 }, beach: { files: ['waves_pebble'], g: .7, r: 60 }, park: { files: ['birds_cars'], g: .5, r: 45, day: 1 } };
SC.classify = p => { const n = ((p.name && p.name[0]) || p.id || '').toLowerCase();
  if (/market|bazaar|mercado|mercat|souk|markt|warorot|shuk|bazar/.test(n)) return 'market'; if (/beach|playa|praia|caleta|sairee|lagoon|copacabana|leme/.test(n)) return 'beach';
  if (/\bbar\b|pub|club|kneipe|beisl|proeflokaal|kraantje|lounge|nightlife|nonbei|tavern|taberna|mezcal|waxy|blues|pandeiro/.test(n)) return 'bar';
  if (/caf[eé]|coffee|restaurant|food|tapas|bistro|juice|bakery|bakkerij|konditorei|chocolat|tajine|churr|padaria|noodle|sucos|vegetarian/.test(n)) return 'cafe';
  if (/park|garden|garten|jard|retiro|vondel|grove|forest|stadtpark|alameda/.test(n)) return 'park';
  if (/plaza|plaça|square|platz|piazza|praça|place|scramble|z[oó]calo|plein|dam\b|gate|crossing/.test(n)) return 'square'; return null };
function ctx() { const A = AV.audio; return A && A.ok && A.ctx ? A.ctx : null }
const loading = {};
function load(k) { const c = ctx(); if (!c || SC.buf[k] || loading[k]) return; loading[k] = fetch(DIR + k + '.ogg').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer() }).then(b => c.decodeAudioData(b)).then(d => { SC.buf[k] = d; SC.stats.loaded++ }).catch(e => { SC.stats.failed++; console.warn('scape', k, e) }) }
const ALL = ['street_sunday1', 'street_sunday2', 'car_pass', 'moped_pass', 'moto_1', 'moto_2', 'moto_3', 'crowd_mall', 'talk_group1', 'talk_group3', 'restaurant', 'birds_cars', 'waves_pebble'];   /* market_rain + party: not downloaded yet (Commons rate limit), kinds fall back to crowd_mall / talk_group3 */
SC.preload = () => ALL.forEach(load);
const bus = () => { const A = AV.audio; return A.mediaBus || A.ctx.destination };
/* ---------- street bed ---------- */
let bed = null;
function bedTick(outdoor) { const c = ctx(); if (!c) return; const w = AV.W && AV.W.id, want = !!w && !NATURE[w] && outdoor && SC.on;
  if (!bed && want && SC.buf.street_sunday1) { const g = c.createGain(); g.gain.value = 0; g.connect(bus()); bed = { g, srcs: [], next: 0 } }
  if (!bed) return; const h = AV.S.time / 60, busy = h > 7 && h < 23 ? 1 : .45, target = want ? .22 * vol('va') * busy * (THAI[w] ? 1.1 : 1) : 0; bed.g.gain.setTargetAtTime(target, c.currentTime, .8); SC.stats.bed = target > 0;
  if (want && c.currentTime > bed.next) { const keys = ['street_sunday1', 'street_sunday2'].filter(k => SC.buf[k]); const b = SC.buf[keys[Math.random() * keys.length | 0]]; if (!b) return; const s = c.createBufferSource(), fg = c.createGain(), len = Math.min(b.duration - 1, 40 + Math.random() * 30), off = Math.random() * Math.max(0, b.duration - len - 1), t = c.currentTime;
    s.buffer = b; fg.gain.setValueAtTime(0, t); fg.gain.linearRampToValueAtTime(1, t + 4); fg.gain.setValueAtTime(1, t + len - 4); fg.gain.linearRampToValueAtTime(0, t + len); s.connect(fg); fg.connect(bed.g); s.start(t, off, len); bed.next = t + len - 4 } }
/* ---------- place emitters ---------- */
const EM = new Map();
function emitTick() { const c = ctx(), W = AV.W; if (!c || !W) return; const P = AV.P, h = AV.S.time / 60, night = h >= 19 || h < 4, inside = !!(AV.home && AV.home.inside);
  const cands = []; for (const p of W.places || []) { if (!isFinite(p.x)) continue; const k = SC.classify(p); if (!k) continue; const K = KINDS[k]; if ((K.night && !night) || (K.day && h < 6.5)) continue; const d = Math.hypot(p.x - P.x, p.z - P.z); if (d < K.r * 1.4) cands.push({ p, k, K, d }) }
  cands.sort((a, b) => a.d - b.d); const keep = new Set(cands.slice(0, inside ? 0 : 4).map(o => o.p));
  for (const [p, e] of EM) if (!keep.has(p) || e.W !== W) { e.g.gain.setTargetAtTime(0, c.currentTime, .5); setTimeout(() => { try { e.s.stop(); e.g.disconnect() } catch (x) { } }, 2500); EM.delete(p) }
  const cos = Math.cos(P.yaw), sin = Math.sin(P.yaw);
  for (const o of cands) { if (!keep.has(o.p)) continue; let e = EM.get(o.p); if (!e) { const f = o.K.files.find(k => SC.buf[k] && Math.random() < .7) || o.K.files.find(k => SC.buf[k]); if (!f) continue; const b = SC.buf[f], s = c.createBufferSource(), pn = c.createPanner(), g = c.createGain();
      pn.panningModel = 'equalpower'; pn.distanceModel = 'inverse'; pn.refDistance = 6; pn.rolloffFactor = 1.3; pn.maxDistance = o.K.r * 2; s.buffer = b; s.loop = true; g.gain.value = 0; s.connect(pn); pn.connect(g); g.connect(bus()); s.start(0, Math.random() * Math.max(.1, b.duration - .5)); e = { s, pn, g, W, k: o.k, f }; EM.set(o.p, e); SC.stats.emitters++ }
    const dx = o.p.x - P.x, dz = o.p.z - P.z, rx = dx * cos - dz * sin, rz = dx * sin + dz * cos;   /* into the listener frame (camera looks down -z at yaw 0) */
    if (e.pn.positionX) { e.pn.positionX.value = rx; e.pn.positionY.value = 1; e.pn.positionZ.value = rz } else e.pn.setPosition(rx, 1, rz);
    const fade = Math.max(0, 1 - o.d / (o.K.r * 1.4)); e.g.gain.setTargetAtTime(o.K.g * vol(o.k === 'beach' || o.k === 'park' ? 'va' : 'vc') * Math.min(1, fade * 1.6), c.currentTime, .4) } }
SC.live = () => [...EM.values()].map(e => e.k + ':' + e.f);
/* ---------- recorded pass-bys (take over from lw_audio.js's synth when loaded) ---------- */
function passRec(kind) { const c = ctx(); if (!c) return false; const pool = kind === 'car' ? ['car_pass', 'moto_2'] : ['moped_pass', 'moto_1', 'moto_3', 'moto_2']; const k = pool.filter(x => SC.buf[x])[Math.random() * pool.length | 0] || pool.find(x => SC.buf[x]); if (!k) return false;
  const b = SC.buf[k], s = c.createBufferSource(), pn = c.createStereoPanner ? c.createStereoPanner() : null, g = c.createGain(), t = c.currentTime + .05, dur = Math.min(b.duration, 3 + Math.random() * 2.5), dir = Math.random() < .5 ? -1 : 1, v = .5 * vol('vv') * (.5 + Math.random() * .6);
  s.buffer = b; s.playbackRate.setValueAtTime(1.06, t); s.playbackRate.linearRampToValueAtTime(.94, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * .45); g.gain.linearRampToValueAtTime(0, t + dur);
  if (pn) { pn.pan.setValueAtTime(-.85 * dir, t); pn.pan.linearRampToValueAtTime(.85 * dir, t + dur); s.connect(g); g.connect(pn); pn.connect(bus()) } else { s.connect(g); g.connect(bus()) } s.start(t, Math.random() * Math.max(0, b.duration - dur), dur); SC.stats.passes++; return true }
addEventListener('load', () => { const p0 = LW.passBy; if (!p0) return; LW.passBy = kind => { if (kind !== 'hover' && SC.on && passRec(kind === 'tuktuk' ? 'scooter' : kind)) { LW.audioStats.passBys++; return } return p0(kind) } });
let tk = 0, pre = false;
AV.frameFns.push(() => { if (!AV.running || !AV.W) return; const now = AV.now(); if (now - tk < .1) return; tk = now; if (!pre && ctx()) { pre = true; SC.preload() } if (AV.audio && AV.audio.mute) return; const outdoor = !(AV.home && AV.home.inside); try { bedTick(outdoor); emitTick() } catch (e) { } });
{ const pe = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (pe) pe(W); const c = ctx(); for (const [p, e] of EM) { try { e.s.stop(); e.g.disconnect() } catch (x) { } } EM.clear(); if (bed && c) bed.g.gain.setTargetAtTime(0, c.currentTime, .3) } }
})(window.AV);
