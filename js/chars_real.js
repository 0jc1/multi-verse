/* APEVERSE - chars_real.js : realistic Stone Ape Band + ape villagers (ported from the apeverse 9 build).
   Loaded AFTER chars.js / chars_human.js. It keeps the classic builders in C.classic (humans, crowds, statues and the
   city-life animals still use them) and swaps in high-poly, skinned, PBR characters for:
     C.gorilla(), C.ztone(), C.orangutan()  - the band (C.animate drives them with IK on the instruments)
     C.npc(fur, shirt, hat)                 - every ape villager (Zil, Sol, Kiko, Pip, Luma, Nix, Bongo, Grakk)
     C.alien(o) / C.alienActor(o)           - soft-body aliens (Zib + Orbo builds): wobbling belly and cranium, springy antennae,
                                              glowing suit trims. alienActor speaks the forge-alien clip API (Idle/Walk/Dance/Wave)
                                              so beings.js crowds and the Astro-9 plaza drive it unchanged.
   Compatibility: villagers expose the classic pivots userData.head / aL / aR / lL / lR / torso as invisible proxies.
   Whatever npc.js, the worlds or quest code write into them (arm swings, talking gestures, head nods) becomes IK
   targets; when npc.js walks a body along its path, procedural stepping plants the feet. Meshes are sculpted in Web
   Workers (sculpt.js + anatomy.js) and cached in IndexedDB; materials in pbr.js; skeleton/IK/springs in rig.js. */
'use strict';
(function (AV) {
const C = AV.chars, CL = C.classic = { gorilla: C.gorilla, ztone: C.ztone, orangutan: C.orangutan, npc: C.npc, animate: C.animate }, AN = AV.anatomy, PBR = AV.pbr, RG = AV.rig, TAU = Math.PI * 2;
const V = THREE.Vector3, Q = THREE.Quaternion, EU = THREE.Euler;
const IDM = new THREE.Matrix4(), UPV = new V(0, 1, 0), ZV = new V(0, 0, 1);
const _v = new V(), _w = new V(), _u = new V(), _q = new Q(), _q2 = new Q(), _e = new EU();
const clamp = (x, a, b) => x < a ? a : x > b ? b : x, ease = x => x * x * (3 - 2 * x), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

/* ======================= background generation: worker pool + IndexedDB cache ======================= */
const GEN = C.gen = (function () {
  const SRC = (AV._gensrc || []).join('\n'), mem = new Map(), geos = new Map(), jobs = new Map(); let workers = null, rr = 0, jid = 0, dbp = null, pending = 0;
  let h = 2166136261; for (let i = 0; i < SRC.length; i++) { h ^= SRC.charCodeAt(i); h = Math.imul(h, 16777619) } const HASH = (h >>> 0).toString(36);
  const waiters = [];
  function initWorkers() {
    workers = [];
    try {
      const code = 'self.window=self;self.AV={};' + AV._gensrc.map(f => '(' + f + ')(self);').join('\n') +
        '\nself.onmessage=function(e){var d=e.data;try{var m=AV.anatomy.part(d.desc);var tr=[];(function col(o){for(var k in o){var v=o[k];if(v&&v.buffer instanceof ArrayBuffer){if(tr.indexOf(v.buffer)<0)tr.push(v.buffer)}else if(v&&typeof v==="object")col(v)}})(m);self.postMessage({id:d.id,m:m},tr)}catch(err){self.postMessage({id:d.id,err:String(err&&err.stack||err)})}};';
      const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })), n = Math.max(1, Math.min(3, (navigator.hardwareConcurrency || 2) - 1));
      for (let i = 0; i < n; i++) { const w = new Worker(url); w.onmessage = e => { const j = jobs.get(e.data.id); if (!j) return; jobs.delete(e.data.id); if (e.data.err) { console.warn('char worker:', e.data.err); j.res(local(j.desc)) } else j.res(e.data.m) }; w.onerror = ev => { ev.preventDefault && ev.preventDefault(); for (const [id, j] of jobs) if (j.w === w) { jobs.delete(id); j.res(local(j.desc)) } }; workers.push(w) }
    } catch (e) { console.warn('char workers unavailable, building on the main thread', e); workers = [] }
  }
  function local(desc) { return new Promise(res => setTimeout(() => res(AN.part(desc)), 0)) }
  function build(desc) { if (!workers) initWorkers(); if (!workers.length) return local(desc); return new Promise(res => { const id = ++jid, w = workers[rr++ % workers.length]; jobs.set(id, { res, desc, w }); w.postMessage({ id, desc }) }) }
  function db() {
    if (dbp) return dbp;
    return dbp = new Promise(res => {
      try {
        const r = indexedDB.open('apeverse_chars', 1); r.onupgradeneeded = () => r.result.createObjectStore('p'); r.onerror = () => res(null); r.onblocked = () => res(null);
        r.onsuccess = () => { const d = r.result; try { const tx = d.transaction('p', 'readwrite'), st = tx.objectStore('p'), g = st.get('__ver'); g.onsuccess = () => { if (g.result !== HASH) { st.clear(); st.put(HASH, '__ver') } }; tx.oncomplete = () => res(d); tx.onerror = tx.onabort = () => res(d) } catch (e) { res(d) } };
      } catch (e) { res(null) }
      setTimeout(() => res(null), 4000);
    });
  }
  const idbGet = k => db().then(d => d && new Promise(res => { try { const q = d.transaction('p').objectStore('p').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null) } catch (e) { res(null) } }));
  const idbPut = (k, v) => db().then(d => { try { d && d.transaction('p', 'readwrite').objectStore('p').put(v, k) } catch (e) { } });
  function data(desc) {
    const key = HASH + ':' + JSON.stringify(desc); if (mem.has(key)) return mem.get(key);
    pending++; const t0 = performance.now();
    const p = idbGet(key).then(v => v ? (v.cached = true, v) : build(desc).then(m => { idbPut(key, m); return m }))
      .then(m => { pending--; C.stats.parts++; C.stats.ms += performance.now() - t0; if (!m.cached) C.stats.built++; if (!pending) { const w = waiters.splice(0); w.forEach(f => f()) } return m });
    mem.set(key, p); return p;
  }
  function attrs(g, m) {
    g.setAttribute('position', new THREE.BufferAttribute(m.pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(m.nor, 3));
    g.setAttribute('skinIndex', new THREE.BufferAttribute(m.skI, 4)); g.setAttribute('skinWeight', new THREE.BufferAttribute(m.skW, 4));
    g.setAttribute('aMat', new THREE.BufferAttribute(m.mat, 4)); g.setAttribute('aAO', new THREE.BufferAttribute(m.ao, 1)); g.setAttribute('aFur', new THREE.BufferAttribute(m.fur, 1));
    g.setIndex(new THREE.BufferAttribute(m.idx, 1)); g.computeBoundingSphere(); g.boundingSphere.radius += .6; g.userData.shared = true; return g;
  }
  /* geometry for a part (shared by every character and every world visit; never disposed) */
  function geo(desc, shells) {
    const key = JSON.stringify(desc) + '|' + (shells || 0); if (geos.has(key)) return geos.get(key);
    const p = data(desc).then(m => {
      const out = { main: attrs(new THREE.BufferGeometry(), m), tris: m.nt };
      if (m.shell && shells) { const s = attrs(new THREE.BufferGeometry(), m.shell), ig = new THREE.InstancedBufferGeometry(); for (const k in s.attributes) ig.setAttribute(k, s.attributes[k]); ig.setIndex(s.index);
        const a = new Float32Array(shells); for (let i = 0; i < shells; i++) a[i] = (i + 1) / shells; ig.setAttribute('aShell', new THREE.InstancedBufferAttribute(a, 1)); ig.instanceCount = shells; ig.boundingSphere = s.boundingSphere.clone(); ig.userData.shared = true; out.shell = ig; out.shellTris = m.shell.nt * shells }
      return out;
    });
    geos.set(key, p); return p;
  }
  return { data, geo, idle: () => pending === 0 ? Promise.resolve() : new Promise(r => waiters.push(r)), HASH };
})();
C.stats = { parts: 0, built: 0, ms: 0, tris: 0 };
C.ready = () => GEN.idle();

/* ======================= looks (colours follow the band reference art) ======================= */
const LOOK = {
  gorilla: { kind: 'gorilla', sp: 'gorilla', fur: 0x2c2d31, skin: 0x37373d, dark: 0x161618, nail: 0x55504f, tip: 0x9a9aa0, eye: 0xb07818, strandF: 230, shells: 20,
    shirt: { o: { loose: 1.05, sleeve: .55 }, col: 0x1b1b1d, h: 'jersey', decal: 'logo' }, pants: { o: { loose: 1.12, rips: true }, col: 0x7fa5d2, kind: 'denim' },
    shoes: { o: { high: true }, cols: [0x1d1d20, 0xf3f2ee, 0xf3f2ee, 0xf3f2ee] }, hat: { style: 'beanie', cols: [0x6a6b3a, 0x5a5b30] } },
  ztone: { kind: 'ztone', sp: 'chimp', fur: 0x5a3a22, skin: 0xd2a277, dark: 0x6a4030, nail: 0xe0b890, tip: 0xc89060, eye: 0x7a4818, strandF: 250, shells: 18,
    shirt: { o: { loose: 1.06, sleeve: .6 }, pattern: 'tiedye', decal: 'spiral' }, pants: { o: { loose: 1.18, pockets: true }, col: 0x4f8a3a, kind: 'twill' },
    shoes: { o: {}, cols: [0xf4f2fb, 0xf6f6f2, 0xffffff, 0x8a4ad8] }, hat: { style: 'bucket', cols: [0x58c038, 0x4caa30] } },
  orangutan: { kind: 'orangutan', sp: 'orangutan', fur: 0xc4561a, skin: 0xb87648, dark: 0x5a3020, nail: 0x9a6a48, tip: 0xffb070, eye: 0x6a3a10, strandF: 170, shells: 24,
    shirt: { o: { loose: 1.14, sleeve: .62, open: true }, pattern: 'floral' }, pants: { o: { loose: 1.12 }, col: 0x1f9a8a, kind: 'twill' },
    shoes: { o: {}, cols: [0x2ab8a0, 0xf4f0e0, 0xf2c43a, 0x3aa858] }, hat: null }
};

/* ======================= materials ======================= */
function bodyMat(L, shell) {
  return PBR.charMat({ cols: [L.fur, L.skin, L.dark, L.nail], rough: [.78, .52, .42, .32], alb: PBR.tex('furVar'), albS: 3, albMask: [1, .5, .3, 0],
    h: PBR.tex('furH'), hS: 7, hMask: [1, 0, 0, 0], h2: PBR.tex('skinH'), h2S: 11, h2Mask: [0, 1, 1, .2], bump: .0011, sheen: new THREE.Color(L.fur).multiplyScalar(.35).getHex(),
    envI: .55, shell, furK: L.furK || 1, strandF: L.strandF, tip: L.tip });
}
function shirtMat(L, K) {
  const S = L.shirt, s = K.s, chestY = K.bones[K.idx.chest].pos[1], o = { rough: [.86, .7, .86, .86], h: PBR.tex('jersey'), hS: 14, hMask: [1, 1, 1, 1], h2: PBR.tex('furVar'), h2S: 5, h2Mask: [.35, .35, .35, .35], bump: .0007, sheen: 0x3a3a3a, envI: .35 };
  if (S.pattern === 'tiedye') Object.assign(o, { cols: [0xffffff, 0xffffff, 0xffffff, 0xffffff], alb: PBR.tex('tiedye'), albS: 1.6, albMask: [1, 1, 1, 1], albMode: 1, decal: { tex: PBR.tex('spiral'), rect: [0, chestY - .02 * s, .62 * s, .62 * s], side: 0 } });
  else if (S.pattern === 'floral') Object.assign(o, { cols: [0xffffff, 0xffffff, 0xffffff, 0xffffff], alb: PBR.tex('floral'), albS: 1.9, albMask: [1, 1, 1, 1], albMode: 1, h: PBR.tex('twill'), hS: 9, rough: [.7, .7, .7, .7], sheen: 0x5a4a2a });
  else Object.assign(o, { cols: [S.col, S.col, S.col, S.col], alb: PBR.tex('furVar'), albS: 6, albMask: [.25, .25, .25, .25] });
  if (S.decal === 'logo') o.decal = { tex: PBR.tex('logo'), rect: [0, chestY + .045 * s, .36 * s, .36 * s], side: 1 };
  return PBR.charMat(o);
}
function pantsMat(L) {
  const P = L.pants;
  if (P.kind === 'denim') return PBR.charMat({ cols: [P.col, P.col, P.col, P.col], rough: [.9, .9, .9, .9], alb: PBR.tex('denimAlb'), albS: 7, albMask: [1, 1, 1, 1], h: PBR.tex('denim'), hS: 8, hMask: [1, 1, 1, 1], h2: PBR.tex('furVar'), h2S: 3, h2Mask: [.5, .5, .5, .5], bump: .0007, sheen: 0x404858, envI: .3 });
  return PBR.charMat({ cols: [P.col, P.col, P.col, P.col], rough: [.85, .85, .85, .85], alb: PBR.tex('furVar'), albS: 4, albMask: [.35, .35, .35, .35], h: PBR.tex('twill'), hS: 11, hMask: [1, 1, 1, 1], h2: PBR.tex('furVar'), h2S: 3, h2Mask: [.4, .4, .4, .4], bump: .0006, sheen: 0x303030, envI: .3 });
}
function shoeMat(L) { return PBR.charMat({ cols: L.shoes.cols, rough: [.42, .85, .7, .38], alb: PBR.tex('furVar'), albS: 6, albMask: [.12, .2, .1, .1], h: PBR.tex('leather'), hS: 9, hMask: [1, .2, .5, 1], h2: PBR.tex('twill'), h2S: 30, h2Mask: [0, 0, 1, 0], bump: .0005, envI: .7, clearcoat: .2 }) }
function skinMat(L) { return PBR.charMat({ cols: [L.skin, L.skin, L.dark, L.nail], rough: [.55, .5, .42, .3], alb: PBR.tex('furVar'), albS: 7, albMask: [.22, .22, .15, 0], h: PBR.tex('skinH'), hS: 16, hMask: [1, 1, 1, .2], h2: PBR.tex('skinH'), h2S: 45, h2Mask: [.5, .5, .5, 0], bump: .00035, envI: .45 }) }
function hairMat(H) { return PBR.charMat({ skinning: false, cols: [H.cols[0], H.cols[1], H.cols[0], H.cols[0]], rough: [.5, .8, .5, .5], alb: PBR.tex('furH'), albS: 9, albMask: [.6, .2, .6, .6], h: PBR.tex('furH'), hS: 14, hMask: [1, .2, 1, 1], h2: PBR.tex('twill'), h2S: 20, h2Mask: [0, 1, 0, 0], bump: .0009, sheen: new THREE.Color(H.cols[0]).multiplyScalar(.8).getHex(), envI: .5 }) }
function hatMat(H) { return PBR.charMat({ skinning: false, cols: [H.cols[0], H.cols[1], H.cols[0], H.cols[0]], rough: [.92, .92, .92, .92], alb: PBR.tex('furVar'), albS: 5, albMask: [.4, .4, .4, .4], h: PBR.tex(H.style === 'beanie' ? 'rib' : 'twill'), hS: H.style === 'beanie' ? 7 : 12, hMask: [1, 1, 1, 1], h2: PBR.tex('furVar'), h2S: 4, h2Mask: [.3, .3, .3, .3], bump: .0012, sheen: 0x404040, envI: .3 }) }

/* alien: one body sculpt, channels = 0 slick suit, 1 mottled skin, 2 dark (lips, soles, eye rim), 3 glowing trim + antenna bulbs */
function alienMat(L) {
  return PBR.charMat({ cols: [L.suit, L.skin, L.dark, L.glow], rough: [.3, .4, .45, .3], metal: [.35, 0, 0, 0], emit: [0, 0, 0, L.glowK || 2.2],
    alb: PBR.tex('spots'), albS: 3.5, albMask: [.1, .55, .3, 0], h: PBR.tex('rib'), hS: 10, hMask: [.3, 0, 0, 0], h2: PBR.tex('skinH'), h2S: 13, h2Mask: [0, .5, .4, 0], bump: .00035,
    clearcoat: .45, clearcoatRoughness: .3, envI: .8 });   // no sheen: that velvet term reads as fur
}

/* ======================= character assembly ======================= */
function build(L) {
  const g = new THREE.Group(), K = AN.skeleton(Object.assign({}, AN.SPECIES[L.sp], L.ov || {})), R = new RG.Rig(K).mount(g), I = K.idx, s = K.s;
  const st = { g, K, R, I, L, s, kind: L.kind, chains: {}, springs: [], ropes: [], beads: [], eyes: [], lids: [], blinkT: 1 + Math.random() * 3, blink: 0, ly: 0, lp: 0, jaw: 0, t: 0, lastT: null, rnd: Math.random() * 100 };
  g.userData = { kind: L.kind, st, head: R.bones[I.head], s, baseY: 0 };
  st.chains.L = R.chain('armL', I.uarmL, I.farmL, I.handL); st.chains.R = R.chain('armR', I.uarmR, I.farmR, I.handR);
  st.chains.lL = R.chain('legL', I.thighL, I.shinL, I.footL); st.chains.lR = R.chain('legR', I.thighR, I.shinR, I.footR);
  /* finger flexion axes (rest char space) */
  st.fax = {}; for (const k of ['L', 'R']) { const H = K.hands[k], inw = new V(...H.inward), ax = [];
    H.fingers.forEach(j => ax.push(new V().subVectors(new V(...j[1]), new V(...j[0])).normalize().cross(inw).normalize()));
    const td = new V().subVectors(new V(...H.thumb[1]), new V(...H.thumb[0])).normalize(), pc = new V(...H.kn).sub(new V(...H.thumb[0])).normalize(); ax.push(td.clone().cross(pc).normalize()); st.fax[k] = ax;
    st['hand' + k] = { along: new V(...H.along), inward: new V(...H.inward), fwd: new V(...H.fwd) } }
  /* soft-body springs */
  const big = L.sp === 'orangutan' ? 1.4 : L.sp === 'gorilla' ? 1.15 : 1;
  if (L.alien) {   /* aliens: a heavy wobbling belly (Orbo) / lean one (Zib), soft cranium, antennae that whip with every move */
    const orbo = L.type === 'orbo', sp = st.sp = {
      belly: new RG.Spring(R, 'belly', { k: orbo ? 75 : 140, c: orbo ? 4 : 8, max: (orbo ? .07 : .035) * s }), chest: new RG.Spring(R, 'chestJ', { k: 170, c: 10, max: .025 * s }),
      throat: new RG.Spring(R, 'throat', { k: 160, c: 9, max: .02 * s }), crown: new RG.Spring(R, 'crown', { k: 110, c: 5, max: .024 * s }),
      antL: new RG.Spring(R, 'antTL', { k: 65, c: 3.2, max: .08 * s, lift: 1.1 }), antR: new RG.Spring(R, 'antTR', { k: 65, c: 3.2, max: .08 * s, lift: 1.1 }) };
    for (const k in sp) st.springs.push(sp[k]);
  } else st.springs.push(new RG.Spring(R, 'belly', { k: 110, c: 7, max: .05 * s * big, gain: 1 }), new RG.Spring(R, 'chestJ', { k: 190, c: 11, max: .03 * s }),
    new RG.Spring(R, 'cheekL', { k: 240, c: 9, max: .018 * s * big }), new RG.Spring(R, 'cheekR', { k: 240, c: 9, max: .018 * s * big }),
    new RG.Spring(R, 'throat', { k: L.sp === 'orangutan' ? 70 : 150, c: L.sp === 'orangutan' ? 5 : 9, max: .04 * s * big }),
    new RG.Spring(R, 'hemF', { k: 130, c: 6, max: .045 * s }), new RG.Spring(R, 'hemB', { k: 130, c: 6, max: .045 * s }));
  /* meshes (async) */
  const mats = st.mats = L.alien ? { body: alienMat(L) } : { body: L.human ? skinMat(L) : bodyMat(L, false), fur: L.shells ? bodyMat(L, true) : null, shirt: shirtMat(L, K), pants: pantsMat(L), shoes: shoeMat(L) };
  const D = p => Object.assign({ sp: L.sp }, L.ov ? { ov: L.ov } : {}, p);
  const parts = L.alien ? [] : [D({ part: 'shirt', o: L.shirt.o }), D({ part: 'pants', o: L.pants.o }), D({ part: 'shoes', o: L.shoes.o })].concat(L.hat ? [D({ part: 'hat', style: L.hat.style })] : []);
  const skinned = (desc, mat, shellMat, shells) => GEN.geo(desc, shells).then(G => {
    const m = new THREE.SkinnedMesh(G.main, mat); m.bind(R.skeleton, IDM); m.castShadow = L.shadow !== false; m.receiveShadow = true; g.add(m); C.stats.tris += G.tris;
    if (G.shell && shellMat) { const f = new THREE.SkinnedMesh(G.shell, shellMat); f.bind(R.skeleton, IDM); f.castShadow = false; f.receiveShadow = true; f.renderOrder = 1; g.add(f); C.stats.tris += G.shellTris; st.furMesh = f }
    st.loaded = (st.loaded || 0) + 1; if (L.alien) st.eyes.forEach(e => e.visible = true);   // no floating eyeballs while the body sculpts
  });
  if (L.alien) st.ready = skinned(D({ part: 'body' }), mats.body);
  else { skinned(D({ part: 'body', cover: L.human ? parts.slice(0, 3) : parts }), mats.body, mats.fur, L.shells || 0);
    skinned(parts[0], mats.shirt); skinned(parts[1], mats.pants); skinned(parts[2], mats.shoes) }
  if (L.hat) GEN.geo(parts[3]).then(G => { const m = new THREE.Mesh(G.main, L.human ? hairMat(L.hat) : hatMat(L.hat)); m.castShadow = true; m.receiveShadow = true; R.attach('head', m); C.stats.tris += G.tris; st.loaded = (st.loaded || 0) + 1 });
  if (L.alien) { alienEyes(st); return st }
  /* eyes + blinking lids */
  const E3 = AN.eyes(K), eyeG = eyeGeo(L.human ? 1.12 : .62), lidG = new THREE.SphereGeometry(1, 20, 10, 0, TAU, 0, Math.PI * .55), eyeM = PBR.propMat({ color: L.eye, map: PBR.tex('iris'), roughness: .06, clearcoat: 1, clearcoatRoughness: .03, envI: L.human ? .8 : 1.3 }), lidM = PBR.propMat({ color: L.skin, roughness: .6, envI: .3 });
  const hp = R.rest[I.head];
  for (const ep of [E3[0], E3[1]]) {
    const e = new THREE.Mesh(eyeG, eyeM); e.scale.setScalar(E3[2]); e.position.set(hp.x + ep[0], hp.y + ep[1], hp.z + ep[2]); R.attach('head', e); st.eyes.push(e);
    const lid = new THREE.Mesh(lidG, lidM); lid.scale.setScalar(E3[2] * 1.12); lid.position.set(hp.x + ep[0], hp.y + ep[1], hp.z + ep[2]); R.attach('head', lid); lid.rotation.x = -.6; st.lids.push(lid);
  }
  return st;
}
/* alien eyes: big glossy almond (Zib) or one cyclops eye (Orbo) seated in the sculpted sockets; they blink by squashing */
function alienEyes(st) {
  const L = st.L, E3 = AN.eyes(st.K), hp = st.R.rest[st.I.head], sh = E3.shape, r = E3[2];
  const m = PBR.propMat({ color: L.eye, map: PBR.tex('alienIris'), emissive: L.eye, emissiveMap: PBR.tex('alienIris'), emissiveIntensity: .35, roughness: .04, clearcoat: 1, clearcoatRoughness: .02, envI: 1.5 });
  st.alienEyes = true;
  for (const ep of E3.n === 1 ? [[0, E3[0][1], E3[0][2]]] : [E3[0], E3[1]]) {
    const sd = Math.sign(ep[0]), e = new THREE.Mesh(eyeGeo(.5), m); e.scale.set(r * sh[0], r * sh[1], r * sh[2]); e.userData.sy = e.scale.y;
    e.position.set(hp.x + ep[0], hp.y + ep[1], hp.z + ep[2] - r * .1); e.rotation.set(0, sd * .3, sd * E3.tilt); e.visible = false; st.R.attach('head', e); st.eyes.push(e);
  }
}
/* eyeball: sphere with a planar-projected iris on the +z pole */
const EYEG = {};
function eyeGeo(k) {
  k = k || .62; if (EYEG[k]) return EYEG[k]; const g = new THREE.SphereGeometry(1, 24, 16); g.rotateX(Math.PI / 2); const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); uv.setXY(i, .5 + x * k * (z > 0 ? 1 : 1.6), .5 + y * k * (z > 0 ? 1 : 1.6)) }
  g.userData.shared = true; return EYEG[k] = g;
}

/* ======================= props & instruments ======================= */
const PROPG = {};
function shared(key, f) { if (!PROPG[key]) { PROPG[key] = f(); PROPG[key].userData.shared = true } return PROPG[key] }
/* tube with a radius profile along a Catmull-Rom path */
function vtube(pts, segs, sides, rf) {
  const cv = new THREE.CatmullRomCurve3(pts.map(p => new V(p[0], p[1], p[2]))), fr = cv.computeFrenetFrames(segs, false), pos = [], nor = [], idx = [];
  for (let i = 0; i <= segs; i++) { const t = i / segs, P = cv.getPointAt(t), N = fr.normals[i], B = fr.binormals[i], r = rf(t);
    for (let j = 0; j <= sides; j++) { const a = j / sides * TAU, cs = Math.cos(a), sn = Math.sin(a), nx = N.x * cs + B.x * sn, ny = N.y * cs + B.y * sn, nz = N.z * cs + B.z * sn; pos.push(P.x + nx * r, P.y + ny * r, P.z + nz * r); nor.push(nx, ny, nz) } }
  for (let i = 0; i < segs; i++) for (let j = 0; j < sides; j++) { const a = i * (sides + 1) + j, b = a + sides + 1; idx.push(a, a + 1, b, a + 1, b + 1, b) }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx); g.userData.curve = cv; return g;
}
function mesh(geo, mat, x, y, z, par, shadow) { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = shadow !== false; m.receiveShadow = true; if (par) par.add(m); return m }

/* upright bass: local origin at the endpin tip, strings face +z */
function makeBass() {
  const grp = new THREE.Group(), wood = PBR.propMat({ map: PBR.tex('wood'), color: 0xffffff, roughness: .32, clearcoat: 1, clearcoatRoughness: .12, envI: 1 }), eb = PBR.propMat({ color: 0x141210, roughness: .28, clearcoat: .6, envI: .8 }),
    metal = PBR.propMat({ color: 0xd8d8d8, metalness: 1, roughness: .25, envI: 1.2 }), gold = PBR.propMat({ color: 0xd6a83a, metalness: 1, roughness: .25, envI: 1.2 }), maple = PBR.propMat({ color: 0xe6cfa0, roughness: .5, envI: .5 }), hole = PBR.propMat({ color: 0x0a0604, roughness: .9 });
  const body = shared('bassBody', () => {
    const half = [[0, 0], [.2, .012], [.315, .075], [.355, .2], [.34, .33], [.28, .44], [.215, .5], [.2, .56], [.215, .62], [.255, .7], [.268, .8], [.235, .9], [.15, .985], [.07, 1.03], [0, 1.045]];
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.splineThru(half.slice(1).map(p => new THREE.Vector2(p[0], p[1]))); sh.splineThru(half.slice(0, -1).reverse().map(p => new THREE.Vector2(-p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(sh, { depth: .15, bevelEnabled: true, bevelThickness: .03, bevelSize: .025, bevelSegments: 5, curveSegments: 72 }); g.translate(0, 0, -.075);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (z > .07) { const hw = .36; p.setZ(i, z + .04 * Math.max(0, 1 - (x / hw) * (x / hw)) * Math.sin(Math.min(1, Math.max(0, y / 1.045)) * Math.PI)) } }
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.3 + .5, uv.getY(i) * .9);
    g.computeVertexNormals(); return g;
  });
  mesh(body, wood, 0, .16, 0, grp);
  const fbG = shared('bassFB', () => { const g = new THREE.BoxGeometry(.07, 1, .026, 1, 8, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setX(i, p.getX(i) * 1.45); g.computeVertexNormals(); return g });
  const fb = mesh(fbG, eb, 0, 1.3, .25, grp); fb.scale.y = .92; fb.rotation.x = -.15;
  mesh(shared('bassNeck', () => new THREE.CylinderGeometry(.03, .038, .52, 14)), wood, 0, 1.55, .15, grp).rotation.x = -.15;
  const pb = mesh(shared('bassPeg', () => new THREE.BoxGeometry(.05, .2, .065)), wood, 0, 1.86, .12, grp); pb.rotation.x = -.35;
  const scroll = shared('bassScroll', () => { const pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 2.6, r = .055 * (1 - i / 30 * .72); pts.push([0, Math.sin(a) * r, Math.cos(a) * r]) } return vtube(pts, 60, 8, t => .017 * (1 - t * .5)) });
  mesh(scroll, wood, 0, 1.98, .08, grp).rotation.x = -.4;
  for (let i = 0; i < 4; i++) { const y = 1.8 + (i % 2) * .08, sd = i < 2 ? 1 : -1; mesh(shared('tunerP', () => new THREE.CylinderGeometry(.008, .008, .09, 8).rotateZ(Math.PI / 2)), metal, sd * .05, y, .13 - (y - 1.8) * .35, grp); mesh(shared('tunerK', () => new THREE.BoxGeometry(.01, .035, .025)), gold, sd * .095, y, .13 - (y - 1.8) * .35, grp) }
  const brG = shared('bassBridge', () => { const s = new THREE.Shape(); s.moveTo(-.085, 0); s.lineTo(.085, 0); s.lineTo(.05, .16); s.quadraticCurveTo(0, .175, -.05, .16); s.closePath(); const h = new THREE.Path(); h.absarc(0, .05, .022, 0, TAU); s.holes.push(h); return new THREE.ExtrudeGeometry(s, { depth: .012, bevelEnabled: false }) });
  const br = mesh(brG, maple, 0, .78, .145, grp); br.rotation.x = -Math.PI / 2 + .05; br.position.z = .14;
  const tpG = shared('bassTail', () => { const s = new THREE.Shape(); s.moveTo(-.025, 0); s.lineTo(.025, 0); s.lineTo(.06, .3); s.quadraticCurveTo(0, .33, -.06, .3); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: .015, bevelEnabled: true, bevelThickness: .005, bevelSize: .004, bevelSegments: 2 }) });
  mesh(tpG, eb, 0, .3, .17, grp).rotation.x = -.12;
  for (const sd of [1, -1]) { const f = shared('fhole', () => vtube([[0, -.1, 0], [.012, -.04, 0], [-.012, .04, 0], [0, .1, 0]], 16, 6, t => .006 + .004 * Math.sin(t * Math.PI))); const m = mesh(f, hole, sd * .13, .78, .135, grp, false); m.scale.set(1, 1, .3); m.rotation.z = sd * .12 }
  mesh(shared('endpin', () => new THREE.CylinderGeometry(.006, .004, .17, 8)), metal, 0, .085, 0, grp);
  /* strings: tailpiece -> bridge top -> nut */
  const strG = shared('bassStr', () => new THREE.CylinderGeometry(1, 1, 1, 6, 1));
  const strings = []; for (let i = 0; i < 4; i++) { const x = (i - 1.5) * .018, a = new V(x * 1.6, .6, .2), b = new V(x * 2.2, .94, .3), c = new V(x, 1.79, .2), r = .0018 + i * .0006;
    for (const [p, q] of [[a, b], [b, c]]) { const m = mesh(strG, metal, 0, 0, 0, grp, false), d = new V().subVectors(q, p); m.position.copy(p).add(q).multiplyScalar(.5); m.scale.set(r, d.length(), r); m.quaternion.setFromUnitVectors(UPV, d.normalize()); if (q === c) strings.push(m) } }
  grp.userData.strings = strings;
  /* frame used by the IK targets: neck line (nut..fingerboard end) */
  grp.userData.neckTop = new V(0, 1.74, .22); grp.userData.neckBot = new V(0, 1.0, .33); grp.userData.pluck = new V(0, .98, .36);
  return grp;
}
/* alto saxophone: local origin at the mouthpiece tip; body hangs along -y, keys face +z */
function makeSax() {
  const grp = new THREE.Group(), brass = PBR.propMat({ color: 0xd9a33a, metalness: 1, roughness: .2, clearcoat: .55, clearcoatRoughness: .1, envI: 1.35 }), pearl = PBR.propMat({ color: 0xf4eee0, roughness: .2, clearcoat: 1, envI: .8 }), blk = PBR.propMat({ color: 0x111111, roughness: .3, clearcoat: .7 });
  const path = [[0, -.03, .05], [0, -.07, .1], [0, -.12, .13], [0, -.2, .135], [0, -.38, .125], [0, -.56, .115], [0, -.66, .13], [0, -.69, .19], [0, -.64, .25], [0, -.53, .27], [0, -.43, .28]];
  const body = shared('saxBody', () => vtube(path, 120, 18, t => t < .12 ? .009 + t * .03 : t < .62 ? .013 + (t - .12) * .055 : t < .82 ? .041 + (t - .62) * .02 : .045 + Math.pow((t - .82) / .18, 3) * .05));
  mesh(body, brass, 0, 0, 0, grp);
  const bell = shared('saxBell', () => new THREE.LatheGeometry([[.094, 0], [.1, .005], [.098, .012], [.085, .03], [.07, .055], [.058, .08]].map(p => new THREE.Vector2(p[0], -p[1])), 40));
  const bl = mesh(bell, brass, 0, -.43, .28, grp); bl.rotation.x = .12;
  const mp = shared('saxMP', () => new THREE.CylinderGeometry(.0065, .011, .07, 14)); const m = mesh(mp, blk, 0, -.005, .025, grp); m.rotation.x = Math.PI / 2 + .55;
  const cup = shared('saxCup', () => new THREE.CylinderGeometry(.012, .012, .006, 16)), pad = shared('saxPad', () => new THREE.CylinderGeometry(.0085, .0085, .004, 14));
  const curve = body.userData.curve, keys = [];
  for (let i = 0; i < 9; i++) { const t = .26 + i * .042, P = curve.getPointAt(t), T = curve.getTangentAt(t), r = .013 + (t - .12) * .055 + .006, n = new V(0, 0, 1).sub(T.clone().multiplyScalar(T.z)).normalize();
    const k = mesh(cup, brass, P.x + n.x * r, P.y + n.y * r, P.z + n.z * r, grp); k.quaternion.setFromUnitVectors(UPV, n); const pp = mesh(pad, pearl, 0, .004, 0, k); keys.push(k) }
  const rod = shared('saxRod', () => new THREE.CylinderGeometry(.0025, .0025, .36, 6)); mesh(rod, brass, .03, -.38, .14, grp);
  grp.userData.keys = keys; grp.userData.curve = curve;
  /* hand anchors (sax local) */
  grp.userData.lh = new V(.035, -.27, .17); grp.userData.rh = new V(.035, -.5, .165);
  return grp;
}
/* MPC sampler: local origin at the centre of the top face, pads +y */
function makeMPC() {
  const grp = new THREE.Group(), case_ = PBR.propMat({ color: 0x222228, roughness: .45, clearcoat: .3 }), scr = PBR.propMat({ color: 0x0c1418, roughness: .15, clearcoat: 1, emissive: 0x1a6a8a, emissiveIntensity: .6 }), knob = PBR.propMat({ color: 0x9a9aa4, metalness: 1, roughness: .3 });
  const bodyG = shared('mpcBody', () => { const w = .4, d = .36, r = .03, s = new THREE.Shape(); s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: .04, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 3 }); g.rotateX(-Math.PI / 2); g.translate(0, -.048, 0); return g });
  mesh(bodyG, case_, 0, 0, 0, grp);
  const padG = shared('mpcPad', () => { const g = new THREE.BoxGeometry(.066, .012, .066, 2, 1, 2); return g });
  const cols = [0xe84a8a, 0xb05ae8, 0x4a8ae8, 0x4ad8c8, 0xe8a03a, 0xe8e04a, 0x6ae04a, 0xe85a4a]; const pads = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const col = cols[(r * 4 + c + r) % 8], m = PBR.propMat({ color: col, roughness: .55, emissive: col, emissiveIntensity: .12, envI: .3 }); const p = mesh(padG, m, .05 + c * .078 - .117 + .05, .004, -.117 + r * .078 + .02, grp); p.userData.base = .12; pads.push(p) }
  mesh(shared('mpcScreen', () => new THREE.BoxGeometry(.12, .004, .07)), scr, -.13, .002, -.1, grp);
  for (let i = 0; i < 4; i++) mesh(shared('mpcKnob', () => new THREE.CylinderGeometry(.011, .012, .018, 16)), knob, -.165 + (i % 2) * .05, .01, .02 + (i >> 1) * .05, grp);
  grp.userData.pads = pads; return grp;
}
/* green aviator shades */
function makeShades(K) {
  const grp = new THREE.Group(), s = K.s * K.P.head, lens = PBR.propMat({ color: 0x1a9a50, roughness: .04, metalness: .2, clearcoat: 1, transparent: true, opacity: .82, envI: 1.5 }), fr = PBR.propMat({ color: 0x1a1a1a, metalness: .6, roughness: .3 });
  const lg = shared('lens', () => { const g = new THREE.SphereGeometry(1, 24, 12, 0, TAU, 0, .7); g.rotateX(Math.PI / 2); return g });
  const E = AN.eyes(K);
  for (const e of [E[0], E[1]]) { const l = mesh(lg, lens, e[0] * 1.05, e[1] - .004 * s, e[2] + .026 * s, grp); l.scale.set(.05 * s, .04 * s, .02 * s); const r = mesh(shared('rim', () => new THREE.TorusGeometry(1, .07, 6, 32)), fr, e[0] * 1.05, e[1] - .004 * s, e[2] + .03 * s, grp); r.scale.set(.05 * s, .04 * s, .05 * s) }
  mesh(shared('bridge', () => new THREE.CylinderGeometry(.003, .003, 1, 6).rotateZ(Math.PI / 2)), fr, 0, E[0][1] + .006 * s, E[0][2] + .032 * s, grp).scale.set(.035 * s, 1, 1);
  for (const sd of [1, -1]) { const t = mesh(shared('temple', () => new THREE.BoxGeometry(.004, .006, 1)), fr, sd * .16 * s, E[0][1] + .004 * s, E[0][2] - .05 * s, grp); t.scale.z = .17 * s; t.rotation.y = sd * .12 }
  return grp;
}
function bandRing(r, col, metal) { return new THREE.Mesh(shared('ring' + r, () => new THREE.TorusGeometry(1, .22, 8, 24)), PBR.propMat({ color: col, metalness: metal ? 1 : 0, roughness: metal ? .25 : .5, envI: 1 })) }

/* rope helpers (dreads, chains, necklaces, hair) */
function bonePoint(st, name, off) { const R = st.R, i = R.I[name]; return out => { out.copy(off).applyQuaternion(R.Q[i]).add(R.P[i]).applyMatrix4(st.g.matrixWorld); return out } }
function headOff(st, x, y, z) { const R = st.R, hp = R.rest[R.I.head], s = st.s * st.K.P.head; return new V(x * s, y * s, z * s) }
function collider(st, name, off, r) { return { c: bonePoint(st, name, off), r } }

/* ======================= band members ======================= */
C.gorilla = function () {
  const st = build(LOOK.gorilla), R = st.R, s = st.s, g = st.g, I = st.I;
  /* dreadlocks from under the beanie, with beads at the tips */
  const dreadM = PBR.propMat({ color: 0x241a12, roughness: .9, envI: .3 }), heads = [collider(st, 'head', headOff(st, 0, .14, -.02), .19 * s), collider(st, 'chest', new V(0, .12 * s, -.04 * s), .26 * s), collider(st, 'neck', new V(0, 0, -.02 * s), .14 * s)];
  for (let i = 0; i < 9; i++) { const a = -2.1 + i / 8 * 4.2, x = Math.sin(a) * .155, z = Math.cos(a) * .12 - .06; if (z > .06) continue;
    const rope = new RG.Rope({ n: 8, seg: .055 * s, radius: t => (.016 - t * .005) * s, mat: dreadM, anchor: bonePoint(st, 'head', headOff(st, x, .1, z)), colliders: heads, damp: .965, parent: g }); st.ropes.push(rope);
    const bead = new THREE.Mesh(shared('bead', () => new THREE.SphereGeometry(1, 10, 8)), PBR.propMat({ color: [0xe83a3a, 0x3ac85a, 0xf2c43a][i % 3], roughness: .35, clearcoat: .6 })); bead.scale.setScalar(.022 * s); g.add(bead); st.beads.push({ m: bead, rope, f: .97 }) }
  /* bead necklace: rope pinned at both sides of the neck */
  const neck = R.rest[I.neck], nm = PBR.propMat({ color: 0x3a2a1a, roughness: .7 });
  const nl = new RG.Rope({ n: 14, seg: .042 * s, radius: () => .004 * s, mat: nm, anchor: bonePoint(st, 'chest', new V(.13 * s, (neck.y - R.rest[I.chest].y) * .9, .0)), anchor2: bonePoint(st, 'chest', new V(-.13 * s, (neck.y - R.rest[I.chest].y) * .9, .0)), colliders: [collider(st, 'chest', new V(0, .06 * s, .02 * s), .25 * s), collider(st, 'chestJ', new V(0, 0, -.04 * s), .17 * s)], damp: .95, parent: g });
  st.ropes.push(nl); for (let i = 1; i < 14; i++) { const b = new THREE.Mesh(shared('bead', () => new THREE.SphereGeometry(1, 10, 8)), PBR.propMat({ color: [0xe83a3a, 0x3ac85a, 0xf2c43a][i % 3], roughness: .35, clearcoat: .6 })); b.scale.setScalar(.021 * s); g.add(b); st.beads.push({ m: b, rope: nl, f: i / 14 }) }
  /* wallet chain on the jeans */
  const hipsY = R.rest[I.hips].y, chainM = PBR.propMat({ color: 0xc8c8cc, metalness: 1, roughness: .28 });
  st.ropes.push(new RG.Rope({ n: 10, seg: .04 * s, radius: t => .0045 * s * (1 + .3 * Math.sin(t * 90)), mat: chainM, anchor: bonePoint(st, 'hips', new V(-.17 * s, .08 * s, .1 * s)), anchor2: bonePoint(st, 'hips', new V(-.19 * s, .0, -.12 * s)), colliders: [collider(st, 'thighR', new V(0, -.1 * s, 0), .14 * s)], damp: .95, parent: g }));
  /* the upright bass stands on the floor at the gorilla's front-left */
  const bass = makeBass(); bass.position.set(.32 * s, 0, .5 * s); bass.rotation.set(-.2, -.4, .06); g.add(bass); st.bass = bass; g.userData.bass = bass;
  st.notes = [0, .42, .2, .62, .3, .5, .12, .7];
  return g;
};
C.ztone = function () {
  const st = build(LOOK.ztone), R = st.R, s = st.s, g = st.g, I = st.I;
  const chainM = PBR.propMat({ color: 0xe0b84a, metalness: 1, roughness: .2, clearcoat: .4, envI: 1.3 }), neck = R.rest[I.neck];
  st.ropes.push(new RG.Rope({ n: 16, seg: .032 * s, radius: t => .0075 * s * (1 + .28 * Math.abs(Math.sin(t * 70))), mat: chainM, anchor: bonePoint(st, 'chest', new V(.1 * s, (neck.y - R.rest[I.chest].y) * .95, .0)), anchor2: bonePoint(st, 'chest', new V(-.1 * s, (neck.y - R.rest[I.chest].y) * .95, .0)), colliders: [collider(st, 'chest', new V(0, .06 * s, .02 * s), .21 * s), collider(st, 'chestJ', new V(0, 0, -.03 * s), .15 * s)], damp: .94, parent: g }));
  /* bracelets */
  for (const k of ['L', 'R']) { const H = st.K.hands[k], c = [0xe83a8a, 0x3ac8e8, 0xf2c43a]; for (let i = 0; i < 2; i++) { const b = bandRing(1, c[(i + (k === 'L' ? 0 : 1)) % 3], false), p = new V(...H.wr).addScaledVector(new V(...H.d2), -(.035 + i * .03) * s); b.position.copy(p); b.quaternion.setFromUnitVectors(ZV, new V(...H.d2)); b.scale.setScalar(.06 * s * (1 - i * .05)); R.attach('farm' + k, b) } }
  /* MPC strapped at the waist */
  const mpc = makeMPC(), hp = R.rest[I.hips]; mpc.position.set(.02 * s, hp.y + .1 * s, .34 * s); mpc.rotation.set(-.55, .08, 0); R.attach('hips', mpc); st.mpc = mpc; g.userData.mpc = mpc; g.userData.pads = mpc.userData.pads;
  return g;
};
C.orangutan = function () {
  const st = build(LOOK.orangutan), R = st.R, s = st.s, g = st.g, I = st.I;
  R.attach('head', (() => { const sh = makeShades(st.K), hp = R.rest[I.head]; sh.position.copy(hp); return sh })());
  /* beard strands (the long arm hair comes from the drooping fur shells) */
  const hairM = PBR.propMat({ color: 0xc05a1c, roughness: .85, sheen: new THREE.Color(0x6a2a0a), envI: .3 });
  for (let i = 0; i < 3; i++) st.ropes.push(new RG.Rope({ n: 5, seg: .035 * s, radius: q => (.011 - q * .008) * s, mat: hairM, anchor: bonePoint(st, 'jaw', headOff(st, (i - 1) * .03, -.05, .1).add(R.rest[I.head]).sub(R.rest[I.jaw])), damp: .93, parent: g }));
  const sax = makeSax(); g.add(sax); st.sax = sax; g.userData.sax = sax;
  return g;
};
/* villager: chimp build, plain tee + trousers + sneakers, optional round cap */
C.npc = function (fur, shirt, hat) {
  const L = { kind: 'npc', sp: 'chimp', ov: { s: 1.0 }, fur, skin: 0xc79a6e, dark: 0x5a3a2a, nail: 0xd8b090, tip: 0xffffff, eye: 0x6a3a14, strandF: 250, shells: 12,
    shirt: { o: { loose: 1.04, sleeve: .55 }, col: shirt }, pants: { o: { loose: 1.1 }, col: 0x3a3a52, kind: 'twill' }, shoes: { o: {}, cols: [0x2a2a2c, 0xe8e4da, 0x2a2a2c, 0x5a5a62] }, hat: hat != null ? { style: 'kufi', cols: [hat, hat] } : null };
  const st = build(L); st.npc = true; st.g.userData.kind = undefined;   // villagers carry no band 'kind'
  addProxies(st); const ctrl = C.brain(st.g, { external: true }); ctrl.wait = 0; PUPPETS.add(ctrl); return st.g;
};
/* classic pivots (userData.head / aL / aR / lL / lR / torso) as invisible proxies riding on the skeleton. Classic aL sits on
   the -x side, which is this rig's right arm. Code that rotates them (npc.js gestures, world dances) drives the IK. */
function addProxies(st) {
  const R = st.R, I = st.I, u = st.g.userData, mk = (bone, at) => { const o = new THREE.Group(); o.position.copy(R.rest[I[at]]); R.attach(bone, o); return o };
  st.px = { aL: mk('chest', 'uarmR'), aR: mk('chest', 'uarmL'), lL: mk('hips', 'thighR'), lR: mk('hips', 'thighL'), head: mk('neck', 'head'), torso: mk('chest', 'chest') };
  Object.assign(u, st.px);
}
function proxyPose(st, P) {
  const R = st.R, I = st.I, px = st.px, s = st.s; st.ph = st.ph || { L: { p: new V(), pole: new V(), q: null }, R: { p: new V(), pole: new V(), q: null } };
  for (const [pv, k] of [[px.aL, 'R'], [px.aR, 'L']]) {
    const r = pv.rotation, sd = k === 'L' ? 1 : -1, ch = st.chains[k], L = (ch.l1 + ch.l2) * .95, h = st.ph[k];
    _q.setFromEuler(_e.set(r.x, r.y, r.z + sd * .14));                                  // + a relaxed outward hang
    h.p.set(0, -L, 0).applyQuaternion(_q).applyQuaternion(R.Q[I.chest]).add(R.P[I['uarm' + k]]);
    h.pole.copy(R.P[I['uarm' + k]]).add(_u.set(sd * .6, -.3, -.8).applyQuaternion(R.Q[I.chest])); P.hands[k] = h;
  }
  const hr = px.head.rotation; P.head[0] += hr.x; P.head[1] += hr.y; P.head[2] += hr.z;
}
const PUPPETS = new Set();
function inScene(o) { while (o) { if (o === AV.scene) return true; o = o.parent } return false }
AV.frameFns && AV.frameFns.push((dt, t) => {
  for (const c of PUPPETS) { const g = c.st.g; if (inScene(g)) { c.seen = true; const P = AV.P; if (!P || Math.hypot(P.x - g.position.x, P.z - g.position.z) < 80) c.update(dt, t) } else if (c.seen || ++c.wait > 900) PUPPETS.delete(c) }
});
C.puppets = PUPPETS;

/* human townsfolk: two body builds, varied skin / hair / clothes from a seed (same rig, IK and walking brain as the apes) */
const HUMAN = {
  skin: [0x5c3a21, 0x8d5524, 0xa86a3c, 0xc68642, 0xe0ac69, 0xf1c27d, 0xffdbac],
  hair: [0x16110d, 0x2a1a10, 0x4a2c18, 0x7a5230, 0xb08850, 0x2c2c30, 0x8a2a1a],
  styles: ['hairShort', 'hairBun', 'hairAfro', 'hairLong', 'cap', 'hairShort'],
  shirt: [0xe8e4da, 0xd84a3a, 0x3a7ad8, 0xf2c43a, 0x2aa878, 0x7a4ac8, 0xe87aa8, 0x2a2a2e, 0xf08a2a],
  pants: [[0x5a7aa8, 'denim'], [0x2c3a5a, 'denim'], [0xb8a27a, 'twill'], [0x2a2a2c, 'twill'], [0x5a6a3a, 'twill'], [0xc8c2b4, 'twill']],
  shoes: [[0xf2f2f0, 0xf6f6f2, 0xffffff, 0xd84a3a], [0x2a2a2c, 0xe8e4da, 0x2a2a2c, 0x5a5a62], [0x8a5a3a, 0x3a2a1a, 0x5a3a2a, 0x8a5a3a], [0x3a7ad8, 0xf6f6f2, 0xffffff, 0xf2c43a]]
};
C.prefetchRealHuman = function (seed) { C._noBuild = true; try { C.realHuman(seed) } finally { C._noBuild = false } };
C.realHuman = function (seed) {
  let x = (seed | 0) * 2654435761 + 1013904223; const r = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000 }, pick = a => a[Math.floor(r() * a.length)];
  const body = r() < .5 ? 'human_a' : 'human_b', skin = pick(HUMAN.skin), style = pick(HUMAN.styles), hc = pick(HUMAN.hair), pt = pick(HUMAN.pants), sh = pick(HUMAN.shirt);
  const L = { kind: 'human', human: true, sp: body, skin, dark: new THREE.Color(skin).multiplyScalar(.72).lerp(new THREE.Color(0xa04a4a), .25).getHex(), nail: new THREE.Color(skin).lerp(new THREE.Color(0xffe8e0), .45).getHex(), eye: pick([0x4a2a10, 0x2a1a0a, 0x3a6a8a, 0x4a6a3a]), shells: 0,
    shirt: { o: { loose: 1.1, sleeve: .5 }, col: sh }, pants: { o: { loose: 1.06 }, col: pt[0], kind: pt[1] }, shoes: { o: {}, cols: pick(HUMAN.shoes) },
    hat: { style, cols: style === 'cap' ? [pick(HUMAN.shirt), pick(HUMAN.shirt)] : [hc, hc] } };
  if (style === 'cap') L.hat.cols[0] = L.hat.cols[1];
  if (C._noBuild) { const D = p => Object.assign({ sp: L.sp }, p), parts = [D({ part: 'shirt', o: L.shirt.o }), D({ part: 'pants', o: L.pants.o }), D({ part: 'shoes', o: L.shoes.o })]; GEN.data(D({ part: 'body', cover: parts })); parts.forEach(GEN.data); GEN.data(D({ part: 'hat', style })); return null }
  const st = build(L); st.npc = true; st.human = true; st.g.userData.kind = undefined; st.g.scale.setScalar(.94 + r() * .12); return st.g;
};

/* ======================= soft-body aliens ======================= */
/* o: { type: 'zib' | 'orbo', skin, suit, glow, eye (any THREE colour: hex number or '#rrggbb'), shadow, glowK }. Default colours
   are the forge aliens' (gfx_forge.js F.ALIENS) so Zib and Orbo keep their identity. */
const ALIEN = { zib: { skin: '#86d0b4', suit: '#262a4a', glow: '#7ff0ff', eye: '#3ad8ff' }, orbo: { skin: '#b07aff', suit: '#ff6ad5', glow: '#ffd84a', eye: '#ff4ad2' } };
const hex = c => new THREE.Color(c).getHex();
function alienLook(o) {
  o = o || {}; const type = o.type === 'orbo' ? 'orbo' : 'zib', D = ALIEN[type], skin = hex(o.skin || D.skin);
  return { kind: 'alien', alien: true, type, sp: 'alien_' + type, skin, suit: hex(o.suit || D.suit), glow: hex(o.glow || D.glow), eye: hex(o.eye || o.glow || D.eye),
    dark: new THREE.Color(skin).multiplyScalar(.28).getHex(), glowK: o.glowK, shadow: o.shadow, shells: 0 };
}
const defBeat = () => { const A = AV.audio; return A && A.on && A.beat && (A.ok || (A.track && A.track.active)) ? A.beat : AV.now() * 2.07 };
function alienBody(o) { const st = build(alienLook(o)); st.npc = true; st.alien = true; st.g.userData.kind = undefined; st.g.userData.alien = st.L.type; return st }
/* puppet alien for code written against the classic pivots (userData.head / aL / aR / lL / lR / torso), like the villagers.
   o.gesture ('dance' | 'drum' | 'dj') + o.beat add a beat-synced overlay. */
C.alien = function (o) {
  o = o || {}; const st = alienBody(o); addProxies(st);
  const ctrl = C.brain(st.g, { external: true, gesture: o.gesture, beat: o.beat || defBeat }); ctrl.wait = 0; PUPPETS.add(ctrl); return st.g;
};
/* actor alien: the same clip API as the forge aliens + an AnimationMixer, so crowd / plaza code can drive it unchanged:
   play('Idle' | 'Walk' | 'Dance' | 'Wave', fade), cur, acts[name] (timeScale / time / getEffectiveWeight / getClip are accepted and ignored:
   walking is planted procedural stepping from the body's real motion, dancing follows the music beat), update(dt).
   Move and turn root (its position is in its parent's space, keep the parent at the world origin). air = true: zero-g float. */
C.alienActor = function (o) {
  o = o || {}; const st = alienBody(o), g = st.g, ctrl = C.brain(g, { external: true, beat: o.beat || defBeat });
  const clip = d => ({ timeScale: 1, time: 0, getEffectiveWeight: () => 1, getClip: () => ({ duration: d }), reset() { return this }, play() { return this }, stop() { return this } });
  const A = { root: g, st, ctrl, cur: null, acts: { Idle: clip(3), Walk: clip(1), Dance: clip(4 * 60 / 124), Wave: clip(2) }, faceY: AN.eyes(st.K)[0][1] + .01 * st.s };
  A.play = n => { if (A.cur === n || !A.acts[n]) return; A.cur = n; ctrl.mode = n === 'Dance' ? 'dance' : n === 'Wave' ? 'wave' : null };
  A.talk = (sec, lock) => { ctrl.talkUntil = AV.now() + (sec == null ? 2.5 : sec); if (lock != null) g.userData.chatting = !!lock };
  Object.defineProperty(A, 'air', { get: () => !!ctrl.air, set: v => { ctrl.air = !!v } });
  A.update = dt => { if (dt > 0) ctrl.update(dt, AV.now()) };
  A.mixer = { update: A.update, stopAllAction() { }, uncacheRoot() { } }; A.ready = st.ready;
  return A;
};
C.alienLooks = ALIEN;

/* ======================= pose solver ======================= */
function newPose() { return { hip: new V(), hipR: [0, 0, 0], spine: [0, 0, 0], chest: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0], clavL: [0, 0, 0], clavR: [0, 0, 0], feet: { L: { p: new V(), q: new Q() }, R: { p: new V(), q: new Q() } }, hands: { L: null, R: null }, curl: { L: [.25, .3, .35, .4, .2], R: [.25, .3, .35, .4, .2] }, look: null, jaw: 0 } }
const eul = (q, a) => q.setFromEuler(_e.set(a[0], a[1], a[2]));
function solve(st, P, dt) {
  const R = st.R, I = st.I, s = st.s; R.reset();
  R.t[I.hips].copy(P.hip); eul(R.q[I.hips], P.hipR); eul(R.q[I.spine], P.spine); eul(R.q[I.chest], P.chest); eul(R.q[I.clavL], P.clavL); eul(R.q[I.clavR], P.clavR);
  R.fk();
  /* look-at: yaw / pitch of the target seen from the chest, split between neck and head */
  let yaw = 0, pitch = 0;
  if (P.look) { _v.subVectors(P.look, R.P[I.head]).applyQuaternion(_q.copy(R.Q[I.chest]).conjugate()); const y = Math.atan2(_v.x, _v.z), p = Math.atan2(-_v.y, Math.hypot(_v.x, _v.z)) - .08; if (Math.abs(y) < 1.45) { yaw = clamp(y, -1.1, 1.1); pitch = clamp(p, -.45, .6) } }
  st.ly = damp(st.ly, yaw, st.lookK || 3.2, dt); st.lp = damp(st.lp, pitch, st.lookK || 3.2, dt);
  eul(R.q[I.neck], [P.neck[0] + st.lp * .35, P.neck[1] + st.ly * .4, P.neck[2]]); eul(R.q[I.head], [P.head[0] + st.lp * .6, P.head[1] + st.ly * .6, P.head[2]]);
  st.jaw = damp(st.jaw, P.jaw, 18, dt); R.q[I.jaw].setFromAxisAngle(_u.set(1, 0, 0), st.jaw);
  R.fk();
  /* legs: planted feet; lower the hips if a foot is out of reach (slopes, steps) */
  let drop = 0; for (const k of ['L', 'R']) { const ch = st.chains['l' + k], d = R.P[ch.u].distanceTo(P.feet[k].p) - (ch.l1 + ch.l2) * .985; if (d > drop) drop = d }
  if (drop > 0) { R.t[I.hips].y -= drop; R.fk() }
  for (const k of ['L', 'R']) { const ch = st.chains['l' + k], sd = k === 'L' ? 1 : -1; _w.copy(R.P[ch.u]).add(_u.set(sd * .08 * s, -.2 * s, 1 * s).applyQuaternion(R.Q[I.hips])); R.ik(ch, P.feet[k].p, _w, P.feet[k].q) }
  /* arms */
  for (const k of ['L', 'R']) {
    const ch = st.chains[k], sd = k === 'L' ? 1 : -1, H = P.hands[k];
    if (H) R.ik(ch, H.p, H.pole, H.q || null);
    else { /* relaxed hang beside the thigh, swinging with the walk */ const sw = (P.swing && P.swing[k]) || 0; _v.set(sd * (st.K.P.shW + .06) * s, (st.K.P.hipY - .03) * s, (.05 + sw) * s); _v.sub(R.rest[I.chest]).applyQuaternion(R.Q[I.chest]).add(R.P[I.chest]); _v.y = Math.max(_v.y, R.P[I.hips].y - .12 * s);
      _w.copy(R.P[ch.u]).add(_u.set(sd * .5, -.2, -.8).applyQuaternion(R.Q[I.chest])); R.ik(ch, _v, _w, null) }
    const c = P.curl[k], ax = st.fax[k];
    for (let f = 0; f < 4; f++) for (let q = 0; q < 3; q++) R.q[I['f' + f + q + k]].setFromAxisAngle(ax[f], c[f] * [1.2, 1.45, 1.0][q]);
    for (let q = 0; q < 3; q++) R.q[I['t' + q + k]].setFromAxisAngle(ax[4], c[4] * [.45, .6, .5][q]);
  }
  R.fk();
  for (const sp of st.springs) sp.update(dt);
  R.apply();
  /* eyes follow the look target (clamped), lids blink */
  if (P.look && !st.alienEyes) { const hq = _q.copy(R.Q[I.head]).conjugate(), hp = R.rest[I.head]; for (const e of st.eyes) { _v.copy(e.position).add(hp).sub(R.rest[I.head]).applyQuaternion(R.Q[I.head]).add(R.P[I.head]); _v.subVectors(P.look, _v).applyQuaternion(hq).normalize(); if (_v.z < .55) _v.lerp(ZV, .6).normalize(); e.quaternion.setFromUnitVectors(ZV, _v) } }
  st.blinkT -= dt; if (st.blinkT < 0) { st.blink = .14; st.blinkT = 2 + Math.random() * 4.5 } st.blink = Math.max(0, st.blink - dt); const bl = st.blink > 0 ? Math.sin(st.blink / .14 * Math.PI) : 0;
  for (const l of st.lids) l.rotation.x = -.62 + bl * 1.75 + st.lp * .3;
  if (st.alienEyes) for (const e of st.eyes) e.scale.y = e.userData.sy * (1 - bl * .88);
  /* ropes + beads */
  for (const r of st.ropes) r.update(dt, st.g);
  for (const b of st.beads) b.rope.sample(b.m.position, b.f);
}
/* character-space look target from the camera */
function camTarget(st, out) { const cp = AV.cam ? AV.cam.position : null; if (!cp) return null; st.g.updateMatrixWorld(); return st.R.toChar(out, cp) }
const restFeet = (st, P) => { for (const k of ['L', 'R']) { P.feet[k].p.copy(st.R.rest[st.I['foot' + k]]); P.feet[k].q.set(0, 0, 0, 1) } };

/* ======================= band animation (beat-synced) ======================= */
const realAnimate = function (g, t, beat, energy, off) {
  const st = g.userData.st; const dt = st.lastT == null ? 1 / 60 : clamp(t - st.lastT, 0, .1); st.lastT = t; if (dt <= 0) return;
  const P = st.P || (st.P = newPose()), R = st.R, I = st.I, s = st.s, red = AV.S && AV.S.set && AV.S.set.reduce ? .4 : 1, e = (energy == null ? 1 : energy) * red, b = beat + (off || 0);
  g.position.y = g.userData.baseY || 0;
  restFeet(st, P);
  /* groove: knees dip just after each beat, hips sway every two beats, chest and head follow with a little delay */
  const ph = b * TAU, dip = Math.pow(.5 + .5 * Math.cos(ph - .6), 2), sway = Math.sin(b * Math.PI), nod = Math.pow(.5 + .5 * Math.cos(ph - 1.1), 3);
  P.hip.set(sway * .028 * s * e, (-.025 - dip * .05 * e) * s, 0); P.hipR = [0, sway * .07 * e, -sway * .045 * e];
  P.spine = [dip * .04 * e, -sway * .04 * e, sway * .03 * e]; P.chest = [Math.sin(t * 1.7) * .012 + dip * .03 * e, -sway * .03 * e, sway * .02 * e];
  P.neck = [nod * .08 * e, 0, 0]; P.head = [nod * .12 * e - .04, 0, Math.sin(b * Math.PI * .5) * .05 * e]; P.clavL = [0, 0, 0]; P.clavR = [0, 0, 0]; P.jaw = 0;
  const near = AV.P ? Math.hypot(AV.P.x - g.getWorldPosition(_u).x, AV.P.z - _u.z) < 16 : false; P.look = near ? camTarget(st, st.lookV || (st.lookV = new V())) : null;
  if (st.kind === 'gorilla') gorillaPlay(st, P, b, e, t);
  else if (st.kind === 'ztone') ztonePlay(st, P, b, e, t);
  else if (st.kind === 'orangutan') saxPlay(st, P, b, e, t);
  solve(st, P, dt);
};
function handFrame(st, k, along, inward) { return RG.Rig.frame(new Q(), st['hand' + k].along, st['hand' + k].inward, along, inward) }
function gorillaPlay(st, P, b, e, t) {
  const s = st.s, bass = st.bass, ud = bass.userData; bass.rotation.z = .06 + Math.sin(b * Math.PI * .5) * .02 * e; bass.updateMatrix();
  P.hip.z -= .02 * s; P.chest[0] += .1; P.chest[1] += .12; P.head[1] += .18;
  /* left hand frets: slides along the neck to the next note of an 8-step line */
  const i = Math.floor(b) % 8, f = b - Math.floor(b), nt = st.notes[i], nn = st.notes[(i + 1) % 8], pos = f < .78 ? nt : nt + (nn - nt) * ease((f - .78) / .22);
  const fret = _v.lerpVectors(ud.neckTop, ud.neckBot, .15 + pos * .55).add(_u.set(.05, 0, -.035)); bass.localToWorld(fret); st.g.worldToLocal(fret);
  const bq = bass.quaternion;
  P.hands.L = P.hands.L || { p: new V(), pole: new V(), q: new Q() }; P.hands.L.p.copy(fret);
  P.hands.L.pole.copy(st.R.P[st.I.uarmL]).add(_u.set(.6, -.5, -.4));
  P.hands.L.q = handFrame(st, 'L', _w.set(-.25, -.15, 1).applyQuaternion(bq), _u.set(-1, 0, -.2).applyQuaternion(bq));
  P.curl.L = [.55 + (f < .3 ? .2 : 0), .65, .7, .72, .45];
  /* right hand plucks across the strings at the end of the fingerboard on every beat (and on some off-beats) */
  const pl = Math.exp(-((b * 2) % 1) * 7), sweep = ((b * 2) % 1);
  const pk = _v.copy(ud.pluck).add(_u.set(-.04 + sweep * .07, pl * .03, .05 + pl * .02)); bass.localToWorld(pk); st.g.worldToLocal(pk);
  P.hands.R = P.hands.R || { p: new V(), pole: new V(), q: new Q() }; P.hands.R.p.copy(pk); P.hands.R.pole.copy(st.R.P[st.I.uarmR]).add(_u.set(-.7, -.5, -.5));
  P.hands.R.q = handFrame(st, 'R', _w.set(.35, -.85, -.25).applyQuaternion(bq), _u.set(0, .2, -1).applyQuaternion(bq));
  P.curl.R = [.15 + pl * .5, .2 + pl * .35, .7, .8, .3];
  if (st.lastPl === undefined || Math.floor(b * 2) !== st.lastPl) { st.lastPl = Math.floor(b * 2); const sk = st.springs[0]; sk && sk.kick(0, -.25 * e, 0) }
  for (const m of ud.strings) m.rotation.z = (Math.random() - .5) * .002 * pl;
}
function ztonePlay(st, P, b, e, t) {
  const s = st.s, R = st.R, I = st.I, pads = st.mpc.userData.pads, mpc = st.mpc;
  P.neck[0] += .05; P.head[0] += Math.pow(.5 + .5 * Math.cos(b * TAU - 1.1), 3) * .14 * e; P.chest[0] += .05;
  /* every 16 beats the right hand goes up to the temple for two beats (the "big brain" pose from the art) */
  const pose16 = (b % 16) > 13.6 && (b % 16) < 15.6;
  const step = Math.floor(b * 2), fr = b * 2 - step, hash = n => ((n * 2654435761) >>> 0) / 4294967296, lift = .045 * s * (1 - Math.exp(-fr * 6));
  mpc.updateMatrixWorld();
  for (const k of ['L', 'R']) {
    const sd = k === 'L' ? 1 : -1, own = (step % 2 === 0) === (k === 'L'), ix = Math.floor(hash(step + (k === 'L' ? 0 : 977)) * 8), col = k === 'L' ? 2 + (ix & 1) : ix & 1, row = (ix >> 1) & 3, pad = pads[row * 4 + col];
    const tgt = pad.getWorldPosition(_v); st.g.worldToLocal(tgt); tgt.y += (own ? lift : .05 * s) + .02 * s;
    P.hands[k] = P.hands[k] || { p: new V(), pole: new V(), q: new Q() }; P.hands[k].p.lerp(tgt, P.hands[k].init ? .35 : 1); P.hands[k].init = 1;
    P.hands[k].pole.copy(R.P[I['uarm' + k]]).add(_u.set(sd * .8, -.4, -.4)); P.hands[k].q = handFrame(st, k, _w.set(-sd * .15, -.55, .82), _u.set(0, -1, .1));
    P.curl[k] = [.12, .3, .75, .8, .35];
    if (own && fr < .25) { pad.material.emissiveIntensity = 1.6 * (1 - fr * 4) + .12 } else pad.material.emissiveIntensity = Math.max(pad.userData.base, pad.material.emissiveIntensity - .08);
  }
  if (pose16) { const hd = R.P[I.head]; P.hands.R.p.copy(hd).add(_u.set(-.13 * s, .14 * s, .06 * s)); P.hands.R.pole.copy(R.P[I.uarmR]).add(_u.set(-.8, -.6, -.1)); P.hands.R.q = handFrame(st, 'R', _w.set(.3, .4, .1), _u.set(1, 0, 0)); P.curl.R = [0, .9, .95, .95, .7]; P.head[2] += .1; P.head[0] -= .05 }
}
function saxPlay(st, P, b, e, t) {
  const s = st.s, R = st.R, I = st.I, sax = st.sax;
  /* phrase-level body language: lean back into long notes, bow forward on the turnaround */
  const phr = (b % 8) / 8, lean = Math.sin(phr * TAU) * .09 * e;
  P.spine[0] += -lean * .5; P.chest[0] += -lean - .04; P.neck[0] += lean * .4 + .05; P.head[0] += lean * .3 - .05; P.hip.z += lean * .04 * s; P.look = null;
  /* the sax follows the mouth: position from the head, orientation from the chest + head pitch */
  R.fk(); const hq = R.Q[I.head], mouth = _v.set(0, (.008 - .004) * s * st.K.P.head, .215 * s * st.K.P.head).applyQuaternion(hq).add(R.P[I.head]);
  _q.setFromEuler(_e.set(-.12 + lean * .5, .3, -.42 + Math.sin(b * Math.PI * .5) * .05 * e)); _q2.copy(R.Q[I.chest]).slerp(hq, .3); sax.quaternion.copy(_q2).multiply(_q);
  sax.position.copy(mouth).sub(_u.set(0, -.012, .02).applyQuaternion(sax.quaternion)); sax.updateMatrix();
  const keys = sax.userData.keys;
  for (const k of ['L', 'R']) {
    const sd = k === 'L' ? 1 : -1, a = (k === 'L' ? sax.userData.lh : sax.userData.rh), p = _w.copy(a).add(_u.set(sd * .03, 0, .02)).applyQuaternion(sax.quaternion).add(sax.position);
    P.hands[k] = P.hands[k] || { p: new V(), pole: new V(), q: new Q() }; P.hands[k].p.copy(p); P.hands[k].pole.copy(R.P[I['uarm' + k]]).add(_u.set(sd * .9, -.5, -.3));
    P.hands[k].q = handFrame(st, k, _w.set(-sd * .9, -.2, .2).applyQuaternion(sax.quaternion), _u.set(0, 0, -1).applyQuaternion(sax.quaternion));
    const n = Math.floor(b * 2), on = q => ((n * 7 + q * 3 + (k === 'L' ? 0 : 5)) % 5) < 3; P.curl[k] = [on(0) ? .55 : .35, on(1) ? .55 : .35, on(2) ? .55 : .35, .45, .3];
  }
  for (let i = 0; i < keys.length; i++) keys[i].scale.y = 1 - (((Math.floor(b * 2) + i * 3) % 4) === 0 ? .6 : 0);
  P.jaw = .02;
  const sp = st.springs; if (Math.floor(b) !== st.lastB) { st.lastB = Math.floor(b); sp[2].kick(0, .06 * e, 0); sp[3].kick(0, .06 * e, 0); sp[4].kick(0, -.12 * e, .05 * e) }
}

C.animate = function (g, t, beat, energy, off) { return g.userData.st ? realAnimate(g, t, beat, energy, off) : CL.animate(g, t, beat, energy, off) };

/* ======================= villagers: idle, look-at, talk, walk with foot planting ======================= */
/* opts: { id (chat id), home:{x,z}, box:[hx,hz] (wander half-extents, world axes) | radius, yaw (preferred facing), interact (ctx.T entry to keep at the NPC), idleOnly, gesture: 'dj'|'drum', beat: () => beat } */
C.brain = function (g, o) {
  const st = g.userData.st; o = o || {}; const home = o.home || { x: g.position.x, z: g.position.z }, P = st.P = newPose(), s = st.s;
  const tOff = o.interact ? { x: o.interact.x - g.position.x, z: o.interact.z - g.position.z } : null;
  const B = { state: 'idle', timer: 2 + Math.random() * 4, wp: new V(), yaw: g.rotation.y, yaw0: o.yaw == null ? g.rotation.y : o.yaw, speed: 0, vel: new V(), prev: new V().copy(g.position), feet: null, shift: Math.random() * 10, t: 0, steps: 0 };
  st.brain = B;
  function ground(x, z) { const W = AV.W, y = W && W.surface ? W.surface(x, z) : null;
    if (o.external) return y == null || B.gOff == null ? B.gy : y + B.gOff;          // puppet: follow the floor the body is placed on
    return (y == null ? (o.baseY || 0) : y) + (o.yOff || 0) }
  function pickWaypoint() {
    const W = AV.W; for (let k = 0; k < 12; k++) {
      let x, z; if (o.box) { x = home.x + (Math.random() * 2 - 1) * o.box[0]; z = home.z + (Math.random() * 2 - 1) * o.box[1] } else { const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * (o.radius || 2); x = home.x + Math.cos(a) * r; z = home.z + Math.sin(a) * r }
      if (Math.hypot(x - g.position.x, z - g.position.z) < .6) continue;
      if (!W || !AV.isFree || o.box) return B.wp.set(x, 0, z);
      let ok = true; for (let i = 1; i <= 4; i++) { const px = g.position.x + (x - g.position.x) * i / 4, pz = g.position.z + (z - g.position.z) * i / 4; if (!AV.isFree(W, px, pz, .3)) { ok = false; break } }
      if (ok) return B.wp.set(x, 0, z);
    } return null;
  }
  function initFeet() {
    g.updateMatrixWorld(); B.feet = {}; B.prev.copy(o.external ? g.getWorldPosition(_w) : g.position);
    for (const k of ['L', 'R']) { const rest = st.R.rest[st.I['foot' + k]], f = B.feet[k] = { rest: rest.clone(), w: new V(), from: new V(), to: new V(), t: 1, yaw: B.yaw, yawFrom: B.yaw }; st.R.toWorld(f.w, rest) }
  }
  function ideal(out, f, lead) { out.copy(f.rest).applyMatrix4(g.matrixWorld).addScaledVector(B.vel, lead); out.y = ground(out.x, out.z) + f.rest.y * g.scale.y; return out }
  const ctrl = {
    st, B,
    update(dt, t) {
      dt = Math.min(dt, .05); B.t += dt; const red = AV.S && AV.S.set && AV.S.set.reduce ? .5 : 1;
      /* external bodies may sit inside a moved holder group (beings.js, the Astro-9 plaza): sense in world space */
      const gp = o.external ? g.getWorldPosition(B.gp || (B.gp = new V())) : g.position; if (o.external) { const e = g.matrixWorld.elements; B.yaw = Math.atan2(e[8], e[10]) }
      const air = !!ctrl.air, gest = ctrl.mode || o.gesture;   // air: floating in zero g (feet dangle); mode: set by an actor's play()
      if (air) B.feet = null; else if (!B.feet) initFeet();
      const pp = AV.P, dx = pp ? pp.x - gp.x : 99, dz = pp ? pp.z - gp.z : 99, pd = Math.hypot(dx, dz);
      /* external puppets are told by npc.js which one is in the chat (userData.chatting); only that one talks and locks its gaze on you */
      const chatting = o.external ? !!g.userData.chatting : !!(AV.chat && AV.chat.open && o.id && AV.chat.who === o.id);
      const talking = AV.now() < (ctrl.talkUntil || 0) || (o.external ? chatting && AV.now() < ((AV.chat && AV.chat.speakUntil) || 0) : chatting), attend = talking || chatting || (!o.ambient && pd < 4.2);
      st.lookK = chatting ? 10 : 3.2;
      if (o.external) {   /* puppet: npc.js / the world moves and turns the body; we only animate it */
        B.state = 'idle'; const y = gp.y; B.gy = B.gy == null ? y : (y < B.gy ? y : B.gy + Math.min(y - B.gy, .6 * dt));
        const W = AV.W, sf = W && W.surface ? W.surface(gp.x, gp.z) : null; B.gOff = sf == null ? null : B.gy - sf;
      } else {
      /* ---- decide ---- */
      let want = B.yaw0, spd = 0;
      if (B.state === 'walk') {
        const wx = B.wp.x - g.position.x, wz = B.wp.z - g.position.z, d = Math.hypot(wx, wz); want = Math.atan2(wx, wz);
        if (d < .12 || attend) { B.state = 'idle'; B.timer = o.ambient ? .8 + Math.random() * 3.5 : 4 + Math.random() * 6 } else { const err = Math.abs(Math.atan2(Math.sin(want - B.yaw), Math.cos(want - B.yaw))); spd = (o.speed || .85) * clamp(1.2 - err * 1.1, 0, 1) * Math.min(1, d * 2.2) }
      } else {
        if (attend) want = Math.atan2(dx, dz);
        else { B.timer -= dt; if (B.timer <= 0 && !o.idleOnly) { if (pickWaypoint()) B.state = 'walk'; else B.timer = 1 } }
        if (!attend && o.idleOnly) want = B.yaw0;
      }
      /* body turns toward the wanted heading (in place when idle: the feet re-plant to follow) */
      let dy = Math.atan2(Math.sin(want - B.yaw), Math.cos(want - B.yaw)); if (B.state !== 'walk' && Math.abs(dy) < (attend ? .6 : .05)) dy = 0;
      B.yaw += clamp(dy, -2.2 * dt, 2.2 * dt) * (B.state === 'walk' ? 1 : .6); g.rotation.y = B.yaw;
      B.speed = damp(B.speed, spd, 5, dt); g.position.x += Math.sin(B.yaw) * B.speed * dt; g.position.z += Math.cos(B.yaw) * B.speed * dt;
      g.position.y = ground(g.position.x, g.position.z);
      }
      if (B.prev.distanceTo(gp) > 2) { B.prev.copy(gp); if (!air) initFeet() }                       // teleported / just placed
      B.vel.subVectors(gp, B.prev).multiplyScalar(1 / Math.max(dt, 1e-3)); B.vel.y = 0; B.prev.copy(gp);
      if (o.interact && tOff) { o.interact.x = g.position.x + tOff.x; o.interact.z = g.position.z + tOff.z }
      g.updateMatrixWorld();
      /* ---- feet: one foot swings at a time, toward where it should land ---- */
      const F = B.feet, v = B.vel.length(), dur = Math.max(.3, .48 - v * .14), lift = (.07 + .05 * Math.min(1, v)) * s;
      if (F) {
      for (const k of ['L', 'R']) { const f = F[k]; if (f.t < 1) { ideal(f.to, f, dur * .5); f.t = Math.min(1, f.t + dt / dur); const q = ease(f.t); f.w.lerpVectors(f.from, f.to, q); f.w.y += Math.sin(f.t * Math.PI) * lift; f.yaw = f.yawFrom + Math.atan2(Math.sin(B.yaw - f.yawFrom), Math.cos(B.yaw - f.yawFrom)) * q; if (f.t >= 1) B.steps++ } }
      if (F.L.t >= 1 && F.R.t >= 1) {
        let best = null, be = 0; for (const k of ['L', 'R']) { const f = F[k]; ideal(_v, f, dur * .5); const err = Math.hypot(_v.x - f.w.x, _v.z - f.w.z) + Math.abs(Math.atan2(Math.sin(B.yaw - f.yaw), Math.cos(B.yaw - f.yaw))) * .18 * s; if (err > be) { be = err; best = k } }
        const thr = (v > .05 ? .06 : .1) * s; if (best && be > thr && !(B.last === best && be < thr * 2.5)) { const f = F[best]; f.from.copy(f.w); f.yawFrom = f.yaw; f.t = 0; B.last = best }
      }
      }
      /* ---- pose ---- */
      const sw = !F ? null : F.L.t < 1 ? 'L' : F.R.t < 1 ? 'R' : null, swT = sw ? F[sw].t : 0, stance = sw === 'L' ? -1 : sw === 'R' ? 1 : 0;
      if (!F) for (const k of ['L', 'R']) {   /* floating: legs dangle and paddle slowly, toes pointed */
        const sd = k === 'L' ? 1 : -1, ph = B.t * 2.1 + (k === 'L' ? 0 : 1.7) + B.shift;
        P.feet[k].p.copy(st.R.rest[st.I['foot' + k]]).add(_u.set(sd * .03 * s, (.1 + Math.sin(ph) * .05) * s, Math.sin(ph) * .08 * s)); P.feet[k].q.setFromEuler(_e.set(.55 + Math.sin(ph) * .2, 0, 0)) }
      else for (const k of ['L', 'R']) { const f = F[k]; st.R.toChar(P.feet[k].p, f.w); const rel = Math.atan2(Math.sin(f.yaw - B.yaw), Math.cos(f.yaw - B.yaw)); let pitch = 0; if (f.t < 1) pitch = f.t < .35 ? .35 * Math.sin(f.t / .35 * Math.PI) : -.25 * Math.sin((f.t - .35) / .65 * Math.PI); P.feet[k].q.setFromEuler(_e.set(pitch, rel, 0)) }
      const breath = Math.sin(B.t * 1.6 + B.shift), shiftW = Math.sin(B.t * .35 + B.shift) * (B.state === 'walk' ? 0 : 1);
      P.hip.set(stance * .022 * s + shiftW * .025 * s * red, (-.03 - (sw ? -.02 * Math.sin(swT * Math.PI) : .012) - (v > .05 ? .015 : 0)) * s, 0);
      const twist = sw ? (sw === 'L' ? 1 : -1) * Math.sin(swT * Math.PI) * .1 * Math.min(1, v * 1.5) : 0;
      P.hipR = [.02, twist, -stance * .04 - shiftW * .035 * red]; P.spine = [.02 + v * .04, -twist * .6, stance * .02 + shiftW * .02]; P.chest = [breath * .015 + v * .03, -twist * .5, shiftW * .015];
      P.neck = [0, 0, 0]; P.head = [Math.sin(B.t * .7 + B.shift) * .03, Math.sin(B.t * .23 + B.shift) * .15 * (attend ? 0 : 1), 0]; P.clavL = [0, 0, -breath * .01]; P.clavR = [0, 0, breath * .01];
      /* arm swing opposes the legs */
      P.swing = P.swing || {}; for (const k of ['L', 'R']) { if (!F) { P.swing[k] = Math.sin(B.t * 1.3 + (k === 'L' ? 0 : 2) + B.shift) * .12; continue } const other = F[k === 'L' ? 'R' : 'L']; st.R.toChar(_v, other.w); P.swing[k] = clamp((_v.z - other.rest.z) / s * .55, -.25, .25) }
      P.hands.L = P.hands.R = null; P.curl.L = [.3, .35, .4, .45, .2]; P.curl.R = [.3, .35, .4, .45, .2];
      P.look = (pd < 9 || chatting) ? camTarget(st, st.lookV || (st.lookV = new V())) : null;
      P.jaw = talking ? Math.max(0, Math.sin(B.t * 11) * Math.sin(B.t * 2.3)) * .12 : 0;
      if (o.external && st.px) proxyPose(st, P);
      if (talking && !o.external) { const gw = Math.sin(B.t * 1.3); P.hands.R = { p: _w.set(-.18 * s, (st.K.P.hipY + .3 + gw * .05) * s, .38 * s).clone(), pole: st.R.P[st.I.uarmR].clone().add(_u.set(-.7, -.6, -.4)), q: null }; P.curl.R = [.15, .2, .25, .3, .1] }
      if (gest === 'drum' && o.beat) { const bt = o.beat(), pl = Math.exp(-(bt % 1) * 6); P.head[0] += pl * .1 * red; P.hip.y -= pl * .02 * s * red; if (!talking && B.state !== 'walk') { const sd = Math.floor(bt) % 2 ? 1 : -1, k = sd > 0 ? 'L' : 'R'; P.hands[k] = { p: new V(sd * .16 * s, (st.K.P.hipY + .02 + (1 - pl) * .06) * s, .22 * s), pole: st.R.P[st.I['uarm' + k]].clone().add(_u.set(sd * .8, -.4, -.4)), q: null }; P.curl[k] = [.1, .1, .15, .2, .1] } }
      if (gest === 'dance' && o.beat && !talking) {   /* club / dub dancing: bounce on the beat, sway, alternate raised hands */
        const bt = o.beat(), pl = Math.exp(-(bt % 1) * 5), sw = Math.sin(bt * Math.PI + B.shift), Pp = st.K.P; P.hip.y -= pl * .035 * s * red; P.hip.x += sw * .03 * s * red; P.head[0] += pl * .12 * red; P.chest[2] += sw * .06 * red; P.chest[1] += Math.sin(bt * Math.PI * .5 + B.shift) * .15 * red;
        if (B.state !== 'walk') { B.dh = B.dh || { L: new V(), R: new V() }; for (const k of ['L', 'R']) { const sd = k === 'L' ? 1 : -1, up = ((Math.floor(bt / 2) + (k === 'L' ? 0 : 1) + Math.floor(B.shift)) % 2) ? .3 : 0;
          B.dh[k].set(sd * (Pp.shW + .06 + sw * sd * .04) * s, (Pp.shY - .12 + up + pl * .05) * s, (.28 - up * .3) * s); P.hands[k] = { p: B.dh[k], pole: st.R.P[st.I['uarm' + k]].clone().add(_u.set(sd * .8, -.5, -.3)), q: null }; P.curl[k] = up ? [.1, .1, .15, .2, .1] : [.6, .65, .7, .7, .4] } } }
      if (gest === 'wave') {   /* greeting: right hand up beside the head, waving from the wrist and elbow */
        const Pp = st.K.P, w = Math.sin(B.t * 9); P.hands.R = { p: new V(-(Pp.shW + .1 + w * .06) * s, (Pp.shY + .34) * s, .1 * s), pole: st.R.P[st.I.uarmR].clone().add(_u.set(-.9, -.5, -.3)), q: null };
        P.curl.R = [.04, .04, .05, .08, .1]; P.head[2] += .1; P.chest[2] += .04 }
      if (st.sp) alienKicks(st, B, o, gest, v, F);
      if (gest === 'dj' && !talking) { const bt = o.beat ? o.beat() : t * 2, pl = Math.exp(-(bt % 1) * 5); P.head[0] += pl * .12 * red; P.hip.y -= pl * .025 * s * red;
        P.hands.L = { p: st.R.P[st.I.head].clone().add(_u.set(.13 * s, .02 * s, -.02 * s)), pole: st.R.P[st.I.uarmL].clone().add(_u.set(.8, -.8, -.2)), q: null }; P.curl.L = [.2, .25, .3, .35, .1];
        P.hands.R = { p: new V(-.22 * s + Math.sin(bt * Math.PI) * .07 * s, (o.deckY || 1.62) / g.scale.y, (o.deckZ || .78) * s), pole: st.R.P[st.I.uarmR].clone().add(_u.set(-.8, -.5, -.4)), q: null }; P.curl.R = [.35, .4, .5, .55, .3] }
      solve(st, P, dt);
    }
  };
  return ctrl;
};

/* soft-body impulses: belly + antennae bounce on dance beats, every footstep jolts them a little */
function alienKicks(st, B, o, gest, v, F) {
  const sp = st.sp, s = st.s, red = AV.S && AV.S.set && AV.S.set.reduce ? .4 : 1, y = B.yaw, rx = Math.cos(y), rz = -Math.sin(y);
  if (gest === 'dance' && o.beat) { const bi = Math.floor(o.beat()); if (bi !== B.kb) { B.kb = bi; const sd = bi % 2 ? 1 : -1, e = red * s;
    sp.belly.kick(0, -.45 * e, 0); sp.crown.kick(0, -.18 * e, 0); sp.chest.kick(0, -.12 * e, 0); sp.antL.kick(rx * sd * .32 * e, -.12 * e, rz * sd * .32 * e); sp.antR.kick(rx * sd * .32 * e, -.12 * e, rz * sd * .32 * e) } }
  if (F && B.steps !== B.ks) { B.ks = B.steps; const e = red * s * Math.min(1, v * 1.2); sp.belly.kick(0, -.25 * e, 0); sp.antL.kick(0, -.16 * e, 0); sp.antR.kick(0, -.16 * e, 0); sp.crown.kick(0, -.08 * e, 0) }
}

/* keep reflections in step with the sky (night worlds should not have bright brass) */
AV.frameFns && AV.frameFns.push(() => PBR.syncEnv());
/* warm the cache while the player is on the start screen: band + the shared villager build */
C.prefetch = function () {
  for (const k of ['gorilla', 'ztone', 'orangutan']) { const L = LOOK[k], D = p => Object.assign({ sp: L.sp }, p), parts = [D({ part: 'shirt', o: L.shirt.o }), D({ part: 'pants', o: L.pants.o }), D({ part: 'shoes', o: L.shoes.o })].concat(L.hat ? [D({ part: 'hat', style: L.hat.style })] : []); GEN.data(D({ part: 'body', cover: parts })); parts.forEach(GEN.data) }
  const V0 = { sp: 'chimp', ov: { s: 1.0 } }, D = p => Object.assign({}, V0, p), vp = [D({ part: 'shirt', o: { loose: 1.04, sleeve: .55 } }), D({ part: 'pants', o: { loose: 1.1 } }), D({ part: 'shoes', o: {} })];
  GEN.data(D({ part: 'body', cover: vp })); GEN.data(D({ part: 'body', cover: vp.concat([D({ part: 'hat', style: 'kufi' })]) })); vp.forEach(GEN.data); GEN.data(D({ part: 'hat', style: 'kufi' }));
  for (const sp of ['alien_zib', 'alien_orbo']) GEN.data({ sp, part: 'body' });
};
setTimeout(() => { try { C.prefetch() } catch (e) { console.warn(e) } }, 50);
})(window.AV);
