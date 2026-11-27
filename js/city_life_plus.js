/* APEVERSE 2.1 - city_life_plus.js : ordinary city life on top of each city's own crowd (corrective pass, owner brief Milestone B).
   Cities should read as populated and socially normal: no loitering scenes, just people doing everyday things around the real
   businesses of the world.  Built from the world's own data after it loads (its shop / venue interactions and free ground), so it needs
   no hand-placed spots and works in any city that lists itself in PRESETS:
     errands   shoppers / students / elders / workers walk between nearby businesses and go IN (they vanish inside for a few seconds,
               then come back out and walk on): "people entering and leaving shops"
     chats     pairs of friends standing on the pavement facing each other, chatting
     queue     a short line at the busiest counter by day
   Night thins the errand crowd.  Straight walking legs only where the ground between two doors is clear (no wall or prop clipping).
   AV.lifePlus = { presets, stats } */
'use strict';
(function (AV) {
const TAU = Math.PI * 2;
const PRESETS = {   /* density per quality level [low, medium, high] */
  madrid: { errands: [6, 10, 14], chats: [2, 4, 5], queue: true },
  chiang_mai: { errands: [6, 10, 14], chats: [2, 3, 5], queue: true },
  vienna: { errands: [6, 10, 14], chats: [2, 4, 5], queue: true },
  amsterdam: { errands: [6, 10, 16], chats: [2, 4, 6], queue: true },
  astro9: { errands: [5, 8, 12], chats: [2, 3, 4], queue: true }
};
const LP = AV.lifePlus = { presets: PRESETS, stats: {} };
const label = t => { try { return typeof t.label === 'function' ? t.label() : (t.label || '') } catch (e) { return '' } };
function spawn(W) {
  const P = PRESETS[W.id], ctx = W.ctx, CY = AV.city; if (!P || !ctx || !CY || !CY.crowd || !W.surface || W.__lifePlus) return; W.__lifePlus = true;
  const q = ctx.q == null ? 1 : ctx.q, rng = AV.rng((AV.S.seed || 1) * 13 + W.id.length * 101), free = (x, z, m) => W.surface(x, z) !== null && AV.isFree(W, x, z, m || .4) && !(W.noStrangersAt && W.noStrangersAt(x, z));
  /* doors: a free standing spot next to each shop / venue interaction (deduplicated, inside the world) */
  const cand = (W.T || []).filter(t => t.kind === 'shop' || t.kind === 'door' || /café|cafe|bar|shop|bakery|market|kiosk|store|tienda|laden|winkel|counter|barra|menu/i.test(label(t))).map(t => ({ x: t.x, z: t.z })).concat((W.places || []).map(p => Array.isArray(p) ? { x: +p[3], z: +p[4] } : { x: p.x, z: p.z }));
  const doors = []; for (const t of cand) { if (!isFinite(t.x) || !isFinite(t.z) || doors.some(d => Math.hypot(d[0] - t.x, d[1] - t.z) < 6)) continue;
    let s = null; for (let k = 0; k < 16 && !s; k++) { const a = k / 16 * TAU, r = 1 + (k % 4) * .6, x = t.x + Math.cos(a) * r, z = t.z + Math.sin(a) * r; if (free(x, z, .45)) s = [x, z] } if (s) doors.push(s) }
  const clear = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / .8); for (let i = 1; i < n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; if (!free(x, z, .35)) return false } return true };
  /* legs: pairs of nearby doors; walked on the world's own pathfinder (AV.path), a few routes per second so loading never hitches */
  const pairs = []; for (let i = 0; i < doors.length; i++) for (let j = i + 1; j < doors.length; j++) { const d = Math.hypot(doors[i][0] - doors[j][0], doors[i][1] - doors[j][1]); if (d > 8 && d < 70 && (!W.routeGroup || W.routeGroup(doors[i][0], doors[i][1]) === W.routeGroup(doors[j][0], doors[j][1]))) pairs.push([doors[i], doors[j], d]) }
  for (let i = pairs.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0, t = pairs[i]; pairs[i] = pairs[j]; pairs[j] = t } const legs = pairs.slice(0, P.errands[q] + 4);
  const okV = v => !!(AV.chars && AV.chars.walkerVar && AV.chars.walkerVar[v]), V = ['shopper', 'woman', 'man', 'student', 'elder', 'shopper', 'tourist', 'apron'].map(v => okV(v) || /^(man|woman|tourist)$/.test(v) ? v : 'woman');
  const crowd = CY.crowd(ctx), errands = [], chatters = [], queue = [];
  for (let i = 0; i < Math.min(P.errands[q], legs.length); i++) { const [A, B] = legs[i]; errands.push(crowd.add({ v: V[i % V.length], x: A[0], z: A[1], mode: 'idle', yaw: rng() * TAU, doorsAt: [A, B], leg: [A, B] })) }
  /* chats: two friends on clear pavement near a door, facing each other */
  for (let i = 0, tries = 0; i < P.chats[q] && tries < 60 && doors.length; tries++) { const d = doors[(rng() * doors.length) | 0], a = rng() * TAU, r = 3 + rng() * 4, x = d[0] + Math.cos(a) * r, z = d[1] + Math.sin(a) * r, b = rng() * TAU, dx = Math.sin(b) * .65, dz = Math.cos(b) * .65;
    if (!free(x - dx, z - dz, .45) || !free(x + dx, z + dz, .45)) continue; const y = Math.atan2(-dx * 2, -dz * 2);
    chatters.push(crowd.add({ v: V[(i * 3) % V.length], x: x - dx, z: z - dz, yaw: Math.atan2(dx, dz) + Math.PI, mode: 'idle' }), crowd.add({ v: V[(i * 3 + 1) % V.length], x: x + dx, z: z + dz, yaw: y + Math.PI, mode: 'idle' })); i++ }
  /* queue: three people in line at the first counter with room for it */
  if (P.queue) for (const t of W.T || []) { if (t.kind !== 'shop' || !isFinite(t.x)) continue; let dir = null; for (let k = 0; k < 8 && !dir; k++) { const a = k / 8 * TAU, ok = [1.2, 2.1, 3].every(r => free(t.x + Math.sin(a) * r, t.z + Math.cos(a) * r, .4)); if (ok) dir = a }
    if (dir == null) continue; for (let k = 0; k < 3; k++) { const r = 1.3 + k * .9; queue.push(crowd.add({ v: V[(k + 2) % V.length], x: t.x + Math.sin(dir) * r, z: t.z + Math.cos(dir) * r, yaw: dir, mode: 'idle' })) } LP.stats.queueAt = [t.x, t.z]; break }
  if (!crowd.list.length) return; crowd.build();
  /* give each errand walker its route when the pathfinder has it (one route every 150 ms); clear straight legs need no search */
  let ri = 0; const nextRoute = () => { if (AV.W !== W || ri >= errands.length) { LP.stats[W.id] && (LP.stats[W.id].routed = errands.filter(w => w.route).length); return } const w = errands[ri++], [A, B] = w.leg;
    let pts = null; if (clear(A, B)) pts = [[B[0], B[1]]]; else if (AV.path && AV.path.route) { try { const r = AV.path.route(W, { x: A[0], z: A[1] }, { x: B[0], z: B[1] }); if (r && r.length && !/straight/.test(AV.path.stats.how || '')) pts = r.map(p => [p[0], p[1]]) } catch (e) { } }
    if (pts) { const back = pts.slice(0, -1).reverse().concat([[A[0], A[1]]]); w.route = pts.slice(0, -1).map(p => [p[0], p[1]]).concat([[B[0], B[1], 5 + rng() * 9, 'idle']], back.slice(0, -1).map(p => [p[0], p[1]]), [[A[0], A[1], 5 + rng() * 9, 'idle']]); w.ri = 0; w.loop = true; w.mode = 'walk'; w.base = 'walk'; w.pause = rng() * 4 }
    setTimeout(nextRoute, 150) }; setTimeout(nextRoute, 300);
  /* errand walkers vanish inside a business while they pause at its door; night thins them out; the queue is a daytime thing */
  ctx.upd.push(() => { const h = (AV.S.time / 60) % 24, night = h >= 22 || h < 6.5, day = h >= 9 && h < 20;
    errands.forEach((w, i) => { const inside = !!w.route && w.mode === 'idle' && w.doorsAt.some(d => Math.hypot(d[0] - w.x, d[1] - w.z) < .8); w.inside = inside; w.vis = !inside && (!night || i % 3 === 0) }); queue.forEach(w => w.vis = day); chatters.forEach((w, i) => w.vis = !night || i < 2) });
  LP.stats[W.id] = { doors: doors.length, legs: legs.length, errands: errands.length, chats: chatters.length / 2, queue: queue.length }; LP.crowd = crowd; LP.errands = errands
}
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = function (W) { if (prevEnter) prevEnter(W); setTimeout(() => { if (AV.W !== W) return; try { spawn(W) } catch (e) { console.warn('lifePlus:', e); LP.stats.err = String(e && e.stack || e).slice(0, 300) } }, 1500) };
LP.spawn = spawn;
})(window.AV);
