/* APEVERSE - world_nimbus.js : NIMBUS SKY CITY — a futuristic city under one giant dome, floating above the clouds.
   - The dome is a pearl-white ellipsoid shell (62 m radius, 42 m high) built from rows of panels: a ring of panoramic
     windows at eye level all the way round, a band of alternating windows, a skylight ring and a glass oculus on top.
     Ribs, mullions and glowing light strips are merged into a few meshes; the glass is one mesh.
   - Outside: a sun-lit, animated cloud sea far below, drifting cumulus (some float right past the glass), distant sky
     spires and sister domes, airships and sky-car traffic. Real day/night comes from js/sky.js.
   - Inside: Zenith Plaza with the Aether Spire and a rideable glass sky lift to the Halo Deck (24 m up), the Window
     Promenade (benches + telescopes), the Hanging Gardens (floating islands, a waterfall, low-gravity updraft vents),
     Cloud Nine Café (menu -> backpack), the Cirrus Residences, a cloud-gazing lounge and the Skyport gate home. */
'use strict';
(function (AV) {
const tr = AV.tr, TAU = AV.TAU, K = AV.kit, A = AV.arch, M = K.M;
const R = 62, H = 42, RW = 60.4, DECK_Y = 24.25, LZ = 4.5;
const CAFE = [34, 10], RES = [-36, 4], POOL = [0, -38];
const VENTS = [[0, -27], [-21, -36], [21, -36]];
const PLANTERS = [[-12, -29, 3.4], [12, -29, 3.4], [-15, -44, 3], [15, -44, 3], [-7, -49, 2.4], [7, -49, 2.4]];
const TOWERS = [[-28, -8, 2.6, 22], [-42, -10, 3.2, 26], [-34, 11, 2.4, 17], [-46, 12, 2.8, 18], [-24, 18, 2.2, 14]];
const deg = d => d * Math.PI / 180;
const faceYaw = (fx, fz, tx, tz) => Math.atan2(-(tx - fx), -(tz - fz));      // player yaw looking from f to t

/* ======================= painted textures (generated once, kept across visits) ======================= */
const TX = {};
function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.userData = { keep: true }; return t }
/* dome panel: pearl white with a hex micro-pattern, a framed border and rivets */
function panelTex() {
  return TX.panel || (TX.panel = canvasTex(512, 512, (c, w, h) => {
    const r = AV.rng(77), g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4e9f1'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(150,170,200,.16)'; c.lineWidth = 2; const s = 22;
    for (let y = 0, row = 0; y < h + s; y += s * 1.5, row++) for (let x = (row % 2) * s * .866; x < w + s; x += s * 1.732) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; c.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s) } c.closePath(); c.stroke() }
    c.strokeStyle = 'rgba(110,130,160,.55)'; c.lineWidth = 7; c.strokeRect(10, 10, w - 20, h - 20); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.strokeRect(18, 18, w - 36, h - 36);
    c.fillStyle = 'rgba(120,140,170,.6)'; for (const [x, y] of [[34, 34], [w - 34, 34], [34, h - 34], [w - 34, h - 34]]) { c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill() }
    for (let i = 0; i < 1800; i++) { c.fillStyle = r() < .5 ? 'rgba(90,110,140,.05)' : 'rgba(255,255,255,.1)'; c.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3) }
  }, true));
}
/* 2x2 atlas of soft cumulus puffs: brightness = lighting (lit tops, grey bellies), alpha = density, flat bases */
function cloudTex() {
  return TX.cloud || (TX.cloud = canvasTex(512, 512, c => {
    const r = AV.rng(5);
    for (let k = 0; k < 4; k++) {
      const ox = (k % 2) * 256, oy = (k >> 1) * 256, n = 26 + k * 5; c.save(); c.beginPath(); c.rect(ox + 2, oy + 2, 252, 252); c.clip();
      for (let i = 0; i < n; i++) {
        const f = i / n, x = ox + 128 + (r() - .5) * 130 * (1 - f * .45), y = oy + 168 - f * 86 - r() * 24, rad = 22 + r() * 30 * (1 - f * .3), v = Math.round(176 + f * 79), col = v + ',' + v + ',' + Math.min(255, v + 10);
        const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(' + col + ',.85)'); g.addColorStop(.6, 'rgba(' + col + ',.45)'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      c.globalCompositeOperation = 'destination-out'; const fb = c.createLinearGradient(0, oy + 176, 0, oy + 206); fb.addColorStop(0, 'rgba(0,0,0,0)'); fb.addColorStop(1, 'rgba(0,0,0,1)'); c.fillStyle = fb; c.fillRect(ox, oy + 176, 256, 80); c.globalCompositeOperation = 'source-over';
      c.restore();
    }
  }, false));
}
/* city floor: marble disc, tiled rings, four avenues, a compass-star plaza, lawns, café terrace, residences paving and a
   wooden promenade along the windows; plus a matching glow map (cyan avenue lines, gold plaza rings) */
function floorTex(N) {
  const key = 'floor' + N; if (TX[key]) return TX[key];
  const RF = 62.5, m = N / (2 * RF), P = v => (v + RF) * m, r = AV.rng(31), px = N / 1024;
  const circ = (c, x, z, rr) => { c.beginPath(); c.arc(P(x), P(z), rr * m, 0, TAU) };
  const line = (c, x0, z0, x1, z1) => { c.beginPath(); c.moveTo(P(x0), P(z0)); c.lineTo(P(x1), P(z1)); c.stroke() };
  const AVE = [0, 90, 180, 270].map(d => [Math.cos(deg(d)), Math.sin(deg(d))]);
  const lawn = (c, x, z, rx, rz) => {
    c.save(); c.translate(P(x), P(z)); c.scale(rx * m, rz * m); c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.restore(); c.fillStyle = '#7cc46a'; c.fill();
    for (let i = 0; i < 1400; i++) { const a = r() * TAU, d = Math.sqrt(r()) * .97; c.fillStyle = r() < .5 ? 'rgba(40,110,40,.25)' : 'rgba(190,240,150,.22)'; c.fillRect(P(x + Math.cos(a) * d * rx), P(z + Math.sin(a) * d * rz), (1 + r() * 2.5) * px, (1 + r() * 2.5) * px) }
  };
  const map = canvasTex(N, N, c => {
    c.fillStyle = '#dde3ec'; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 260; i++) { c.strokeStyle = 'rgba(150,165,190,' + (.05 + r() * .08).toFixed(3) + ')'; c.lineWidth = (.5 + r() * 1.5) * px; c.beginPath(); let x = r() * N, y = r() * N; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * N * .08; y += (r() - .5) * N * .08; c.lineTo(x, y) } c.stroke() }
    c.strokeStyle = 'rgba(140,155,180,.35)'; c.lineWidth = .06 * m; for (let rr = 18; rr < 52; rr += 3) { circ(c, 0, 0, rr); c.stroke() }
    for (let a = 0; a < 96; a++) { const t = a / 96 * TAU; line(c, Math.cos(t) * 16, Math.sin(t) * 16, Math.cos(t) * 52, Math.sin(t) * 52) }
    lawn(c, 0, -37, 25, 15.5); lawn(c, 30, -30, 10, 7.5); lawn(c, -21, 34, 8, 6.5);
    /* café terrace + residences paving */
    c.fillStyle = '#efe4d4'; circ(c, CAFE[0], CAFE[1], 9.5); c.fill(); c.strokeStyle = 'rgba(160,120,80,.3)'; c.lineWidth = .08 * m; for (let rr = 1.5; rr < 9.5; rr += 1.5) { circ(c, CAFE[0], CAFE[1], rr); c.stroke() }
    c.save(); circ(c, RES[0], RES[1], 15); c.fillStyle = '#d3dae5'; c.fill(); c.clip(); c.strokeStyle = 'rgba(120,135,160,.4)'; c.lineWidth = .06 * m; const s = 1.6;
    for (let z = -16, row = 0; z < 16; z += s * 1.5, row++) for (let x = -16 + (row % 2) * s * .866; x < 16; x += s * 1.732) { c.beginPath(); for (let k = 0; k <= 6; k++) { const a = k / 6 * TAU + Math.PI / 6; c.lineTo(P(RES[0] + x + Math.cos(a) * s), P(RES[1] + z + Math.sin(a) * s)) } c.stroke() }
    c.restore();
    /* avenues */
    c.lineCap = 'butt'; for (const [w, col] of [[6.2, '#c4cddb'], [5.4, '#f4f6fa']]) { c.strokeStyle = col; c.lineWidth = w * m; for (const [ca, sa] of AVE) line(c, ca * 15, sa * 15, ca * 53, sa * 53) }
    c.fillStyle = 'rgba(150,175,210,.45)'; for (const [ca, sa] of AVE) for (let d = 20; d < 50; d += 4) { const x = ca * d, z = sa * d, nx = -sa, nz = ca; c.beginPath(); c.moveTo(P(x + ca * .9), P(z + sa * .9)); c.lineTo(P(x + nx * 1.1), P(z + nz * 1.1)); c.lineTo(P(x - nx * 1.1), P(z - nz * 1.1)); c.fill() }
    /* plaza with a 16-point compass star */
    c.fillStyle = '#eef1f6'; circ(c, 0, 0, 16); c.fill();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, L = i % 2 ? 9 : 14.5, w = (i % 2 ? .8 : 1.4) / 4; c.fillStyle = i % 4 === 0 ? '#d8b860' : i % 2 ? '#c8d0dc' : '#e2c98a'; c.beginPath(); c.moveTo(P(Math.cos(a) * L), P(Math.sin(a) * L)); c.lineTo(P(Math.cos(a + w) * 4), P(Math.sin(a + w) * 4)); c.lineTo(P(Math.cos(a - w) * 4), P(Math.sin(a - w) * 4)); c.fill() }
    c.strokeStyle = '#d8b860'; c.lineWidth = .3 * m; circ(c, 0, 0, 4); c.stroke(); circ(c, 0, 0, 15.6); c.stroke();
    /* wooden promenade along the windows */
    c.fillStyle = '#b48c62'; c.beginPath(); c.arc(P(0), P(0), 62.5 * m, 0, TAU); c.arc(P(0), P(0), 52 * m, 0, TAU, true); c.fill();
    const bands = [52, 54.7, 57.4, 60.1, 62.5];
    for (let b = 0; b < bands.length - 1; b++) {
      const r0 = bands[b], r1 = bands[b + 1], step = 2.6 / r1;
      for (let a = (b % 2) * step * .5; a < TAU; a += step) { const v = r(); c.fillStyle = 'rgba(' + (v < .5 ? '90,60,30,' : '235,200,150,') + (.08 + r() * .12).toFixed(3) + ')'; c.beginPath(); c.arc(P(0), P(0), r1 * m, a, a + step); c.arc(P(0), P(0), r0 * m, a + step, a, true); c.fill(); c.strokeStyle = 'rgba(70,45,25,.45)'; c.lineWidth = .05 * m; line(c, Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1) }
      c.strokeStyle = 'rgba(70,45,25,.5)'; c.lineWidth = .06 * m; circ(c, 0, 0, r1); c.stroke();
    }
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() < .5 ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.07)'; c.fillRect(r() * N, r() * N, 1 + r() * 2, 1 + r() * 2) }
  });
  const glow = canvasTex(N, N, c => {
    c.fillStyle = '#000'; c.fillRect(0, 0, N, N); c.lineCap = 'butt';
    c.strokeStyle = '#3ad8ff'; c.lineWidth = .18 * m; circ(c, 0, 0, 16.2); c.stroke(); c.lineWidth = .22 * m; circ(c, 0, 0, 51.8); c.stroke();
    c.lineWidth = .14 * m; for (const [ca, sa] of AVE) for (const s of [-1, 1]) line(c, ca * 16.2 - sa * 2.9 * s, sa * 16.2 + ca * 2.9 * s, ca * 51.8 - sa * 2.9 * s, sa * 51.8 + ca * 2.9 * s);
    c.strokeStyle = '#ffd84a'; c.lineWidth = .12 * m; circ(c, 0, 0, 4); c.stroke(); circ(c, 0, 0, 15.6); c.stroke();
    c.strokeStyle = '#ffb04a'; c.lineWidth = .12 * m; circ(c, CAFE[0], CAFE[1], 9.5); c.stroke();
    c.strokeStyle = '#9a8aff'; c.lineWidth = .12 * m; circ(c, RES[0], RES[1], 15); c.stroke();
    c.strokeStyle = '#7fe8ff'; c.lineWidth = .1 * m; circ(c, 0, 0, 62); c.stroke();
  });
  return TX[key] = { map, glow };
}

/* ======================= dome geometry helpers ======================= */
const E = (th, ph, k) => { k = k || 0; const c = Math.cos(ph); return new THREE.Vector3((R - k) * c * Math.cos(th), (H - k) * Math.sin(ph), (R - k) * c * Math.sin(th)) };
function patch(th0, th1, ph0, ph1, nu, nv, ru, rv) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = E(th0 + (th1 - th0) * i / nu, ph0 + (ph1 - ph0) * j / nv); pos.push(p.x, p.y, p.z); uv.push(i / nu * ru, j / nv * rv) }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d) }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const meridian = (th, ph0, ph1, rad, n) => { const pts = []; for (let i = 0; i <= n; i++) pts.push(E(th, ph0 + (ph1 - ph0) * i / n)); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, rad, 5, false) };
const latRing = (ph, rad, k) => new THREE.TorusGeometry((R - (k || 0)) * Math.cos(ph), rad, 5, 128).rotateX(Math.PI / 2).translate(0, (H - (k || 0)) * Math.sin(ph), 0);
/* rows of the shell, elevation in degrees: s = solid panels, g = glass, a = alternating */
const ROWS = [[0, 1.2, 's'], [1.2, 24, 'g'], [24, 33, 's'], [33, 50, 'a'], [50, 64, 's'], [64, 79, 'g'], [79, 86, 's'], [86, 90, 'g']], NSEG = 24;
/* a straight beam (box or cylinder) between two points, for batches */
const _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const beamM = (a, b, w, d) => { _d.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = _d.length(); _q.setFromUnitVectors(_up, _d.normalize()); return new THREE.Matrix4().compose(_p.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), _q, _s.set(w, L, d == null ? w : d)) };

/* ======================= sky shaders (cloud sea + cumulus billboards) ======================= */
const NOISE = 'float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}';
const SEA_VS = 'varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}';
const SEA_FS = `uniform float uT; uniform vec3 uSun, uLight, uAmb; varying vec3 vW;
#include <fog_pars_fragment>
${NOISE}
float cl(vec2 p){ return fbm(p) * .72 + fbm(p * 2.6 + 3.1 + uT * .002) * .28; }
void main(){
  vec2 p = vW.xz * .0042 + vec2(uT * .0035, uT * .0012);
  float far = smoothstep(320., 1250., length(vW.xz - cameraPosition.xz));
  float d = mix(cl(p), .52, far);
  vec2 sd = normalize(uSun.xz + vec2(1e-4)) * .035;
  float lit = clamp(.5 + (d - mix(cl(p + sd), .52, far)) * 7., 0., 1.);
  float top = smoothstep(.3, .62, d);
  vec3 deep = uAmb * .5 + uLight * .07;
  vec3 crest = uAmb * .78 + uLight * (.3 + .72 * lit);
  gl_FragColor = vec4(mix(deep, crest, top), 1.);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
}`;
const PUFF_VS = `uniform float uT; attribute vec2 aC; attribute vec4 aP; varying vec2 vUv; varying float vA;
#include <fog_pars_vertex>
void main(){
  float a = uT * aP.y, cs = cos(a), sn = sin(a); vec3 c = position;
  c.xz = vec2(c.x * cs - c.z * sn, c.x * sn + c.z * cs); c.y += sin(uT * .07 + aP.z * 6.2831) * 1.5;
  vec4 mvPosition = modelViewMatrix * vec4(c, 1.); mvPosition.xy += aC * vec2(aP.x, aP.x * .62);
  gl_Position = projectionMatrix * mvPosition;
  vUv = (aC * .5 + .5 + vec2(mod(aP.w, 2.), floor(aP.w / 2.))) * .5;
  vA = smoothstep(8., 30., -mvPosition.z);
  #include <fog_vertex>
}`;
const PUFF_FS = `uniform sampler2D uTex; uniform vec3 uLight, uAmb; varying vec2 vUv; varying float vA;
#include <fog_pars_fragment>
void main(){
  vec4 t = texture2D(uTex, vUv); float a = t.a * vA; if (a < .01) discard;
  float sh = clamp((t.r - .62) / .38, 0., 1.);
  gl_FragColor = vec4(uAmb * .8 + uLight * (.2 + .8 * sh), a * .95);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  #include <fog_fragment>
}`;
function puffGeo(list) {
  const n = list.length, pos = new Float32Array(n * 12), cor = new Float32Array(n * 8), prm = new Float32Array(n * 16), idx = [], C = [-1, -1, 1, -1, 1, 1, -1, 1];
  list.forEach((p, i) => { for (let k = 0; k < 4; k++) { const v = i * 4 + k; pos.set([p.x, p.y, p.z], v * 3); cor[v * 2] = C[k * 2]; cor[v * 2 + 1] = C[k * 2 + 1]; prm.set([p.s, p.sp, p.seed, p.cell], v * 4) } const b = i * 4; idx.push(b, b + 1, b + 2, b, b + 2, b + 3) });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aC', new THREE.BufferAttribute(cor, 2)); g.setAttribute('aP', new THREE.BufferAttribute(prm, 4)); g.setIndex(idx); return g;
}

AV.registerWorld({
  id: 'nimbus',
  build(ctx) {
    const S = AV.S, q = ctx.q, rng = ctx.rng, grp = ctx.group, MT = A.mats(), T = ctx.T, sign = (t, x, y, z, ry, w, col, o) => ctx.sign(t, x, y, z, ry, w, col, o);
    const B = { dome: K.batch(), city: K.batch(), far: K.batch(), isl: K.batch() };
    const pearl = K.floraMat(0, { map: panelTex(), rough: .38, metal: .25, double: true });
    const glassMat = o => new THREE.MeshStandardMaterial({ color: 0xd8f2ff, roughness: .06, metalness: .2, transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false });
    const glass = glassMat(.1), glassIn = glassMat(.16);
    const mesh = (g, m, ro) => { const o = new THREE.Mesh(g, m); if (ro != null) o.renderOrder = ro; grp.add(o); return o };

    /* ---------- floor ---------- */
    const fx = floorTex([1024, 2048, 2048][q]);
    const fm = new THREE.MeshStandardMaterial({ map: fx.map, emissiveMap: fx.glow, emissive: 0xffffff, emissiveIntensity: .7, roughness: .35, metalness: .1 }); fm.userData.lin = 1;
    const floor = mesh(new THREE.CircleGeometry(62.4, 128), fm); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;

    /* ---------- the dome: panels, glass, ribs, mullions, light strips ---------- */
    const glassParts = [];
    ROWS.forEach(([p0, p1, kind], ri) => {
      const ph0 = deg(p0), ph1 = deg(p1), nv = Math.max(1, Math.ceil((p1 - p0) / 4)), cellH = E(0, ph0).distanceTo(E(0, ph1)), cellW = R * Math.cos((ph0 + ph1) / 2) * TAU / NSEG;
      for (let i = 0; i < NSEG; i++) {
        const th0 = i / NSEG * TAU, th1 = (i + 1) / NSEG * TAU, isGlass = kind === 'g' || (kind === 'a' && i % 2 === 0);
        if (isGlass) glassParts.push([patch(th0, th1, ph0, ph1, 4, nv, 1, 1), 0xffffff, null, 0]);
        else B.dome.add(pearl, patch(th0, th1, ph0, ph1, 4, nv, ri === 0 ? 3 : Math.max(1, Math.round(cellW / 9)), ri === 0 ? .2 : Math.max(1, Math.round(cellH / 9))), ri === 0 ? 0xc8d2e0 : (i + ri) % 2 ? 0xf1f4f9 : 0xe5ebf3, null, .03);
      }
    });
    { const g = mesh(K.merge(glassParts), glass, 1); g.castShadow = false; g.receiveShadow = false }
    for (let i = 0; i < NSEG; i++) B.dome.add(MT.shiny, meridian(i / NSEG * TAU, 0, deg(89.4), .3, 30), 0xdfe6f0, null, .02);
    for (let i = 0; i < NSEG; i++) { const th = (i + .5) / NSEG * TAU; B.dome.add(MT.shiny, meridian(th, deg(1.2), deg(24), .14, 8), 0xdfe6f0); B.dome.add(MT.shiny, meridian(th, deg(64), deg(79), .12, 5), 0xdfe6f0) }
    for (const p of [1.2, 24, 33, 50, 64, 79, 86]) B.dome.add(MT.shiny, latRing(deg(p), .26), 0xdfe6f0);
    for (const p of [12.5, 71.5]) B.dome.add(MT.shiny, latRing(deg(p), .13), 0xdfe6f0);
    [[24, 0x7fe8ff], [33, 0xffd9a0], [50, 0x7fe8ff], [64, 0xffd9a0], [79, 0x7fe8ff]].forEach(([p, c]) => B.dome.add(MT.v, latRing(deg(p) - .004, .09, .45), c, null, 1));
    B.dome.add(MT.v, new THREE.TorusGeometry(61.6, .1, 5, 160), 0x7fe8ff, M(0, .12, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    /* hull under the platform: visible when you look down through the glass */
    B.far.add(MT.shiny, new THREE.LatheGeometry([[62.5, 0], [63.2, -.8], [61, -4], [50, -10], [34, -18], [18, -28], [6, -38], [0, -44]].map(p => new THREE.Vector2(p[0], p[1])), 72), 0xdde4ee);
    B.far.add(MT.v, new THREE.TorusGeometry(63.3, .35, 6, 160), 0x7fe8ff, M(0, -.8, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    B.far.add(MT.v, new THREE.TorusGeometry(42, .5, 6, 120), 0xffd9a0, M(0, -14.2, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; B.far.add(MT.v, A.geo('sph'), 0x9ff0ff, M(Math.cos(a) * 24, -24, Math.sin(a) * 24, 3, 1.6, 3), 1) }

    /* ---------- outside: cloud sea, cumulus, spires, sister domes ---------- */
    const CU = { uT: K.U.time, uLight: { value: new THREE.Color(1, 1, 1) }, uAmb: { value: new THREE.Color(.5, .55, .65) }, uSun: { value: new THREE.Vector3(0, 1, 0) } };
    const seaMat = new THREE.ShaderMaterial({ uniforms: Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog), CU), vertexShader: SEA_VS, fragmentShader: SEA_FS, fog: true });
    const sea = mesh(new THREE.CircleGeometry(2600, 96), seaMat); sea.rotation.x = -Math.PI / 2; sea.position.y = -70;
    const pl = [], cell = () => rng() * 4 | 0;
    for (let i = 0; i < [14, 22, 30][q]; i++) { const a = rng() * TAU, r = 76 + rng() * 34; pl.push({ x: Math.cos(a) * r, y: -8 + rng() * 32, z: Math.sin(a) * r, s: 12 + rng() * 12, sp: (.6 + rng() * .8) / r, seed: rng(), cell: cell() }) }
    for (let i = 0; i < [18, 30, 46][q]; i++) { const a = rng() * TAU, r = 120 + rng() * 320; pl.push({ x: Math.cos(a) * r, y: -58 + rng() * 95, z: Math.sin(a) * r, s: 28 + rng() * 52, sp: (.6 + rng() * .8) / r, seed: rng(), cell: cell() }) }
    for (let i = 0; i < [6, 9, 12][q]; i++) { const a = rng() * TAU, r = 220 + rng() * 380; pl.push({ x: Math.cos(a) * r, y: 70 + rng() * 80, z: Math.sin(a) * r, s: 60 + rng() * 60, sp: (.4 + rng() * .5) / r, seed: rng(), cell: cell() }) }
    const puffMat = new THREE.ShaderMaterial({ uniforms: Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog), CU, { uTex: { value: cloudTex() } }), vertexShader: PUFF_VS, fragmentShader: PUFF_FS, fog: true, transparent: true, depthWrite: false });
    const puffs = mesh(puffGeo(pl), puffMat, 0); puffs.frustumCulled = false;
    [[20, 300, 120], [70, 460, 160], [115, 340, 95], [160, 560, 180], [205, 290, 110], [250, 420, 140], [300, 620, 200], [340, 380, 130]].forEach(([a, d, h], i) => {
      const x = Math.cos(deg(a)) * d, z = Math.sin(deg(a)) * d, s = .8 + (i % 3) * .2;
      B.far.add(MT.shiny, new THREE.LatheGeometry([[14, -90], [9, -50], [6, -10], [4.6, h * .55], [4, h * .72], [9, h * .78], [9.5, h * .8], [3.2, h * .86], [2.2, h * .95], [.1, h * 1.12]].map(p => new THREE.Vector2(p[0] * s, p[1])), 18), 0xe8edf4, M(x, 0, z));
      B.far.add(MT.v, new THREE.TorusGeometry(9.7 * s, .7, 5, 32), i % 2 ? 0xffd9a0 : 0x7fe8ff, M(x, h * .79, z, 1, 1, 1, Math.PI / 2, 0, 0), 1);
      B.far.add(MT.v, A.geo('cyl'), 0x9fe8ff, M(x, h * .7, z, 4.3 * s, h * .1, 4.3 * s), .7);
      B.far.add(MT.v, A.geo('sph'), 0xff6a6a, M(x, h * 1.12 + 1, z, 1.2, 1.2, 1.2), 1);
    });
    [[235, 520, 4, 40], [40, 720, -14, 56]].forEach(([a, d, y, r]) => {
      const x = Math.cos(deg(a)) * d, z = Math.sin(deg(a)) * d;
      B.far.add(MT.shiny, new THREE.LatheGeometry([[r, 0], [r * .8, -r * .2], [r * .4, -r * .5], [0, -r * .7]].map(p => new THREE.Vector2(p[0], p[1])), 32), 0xd8e0ea, M(x, y, z));
      B.far.add(MT.shiny, A.geo('sph'), 0xf0f4fa, M(x, y, z, r * .98, r * .66, r * .98), .05);
      B.far.add(MT.v, A.geo('cyl'), 0x9fe8ff, M(x, y + r * .1, z, r * .985, r * .12, r * .985), .8);
      B.far.add(MT.v, new THREE.TorusGeometry(r, r * .02, 5, 48), 0xffd9a0, M(x, y, z, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    });

    /* ---------- airships + sky-car traffic ---------- */
    const hullM = AV.std(0xeef2f8, .35, .4), finM = AV.std(0x7a8ab8, .4, .5), glowB = c => new THREE.MeshBasicMaterial({ color: c });
    function airship(s, col) {
      const g = new THREE.Group(), add = (geo, m, x, y, z, sx, sy, sz) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o };
      add(AV.G.sph, hullM, 0, 0, 0, 9 * s, 2.6 * s, 2.6 * s); add(AV.G.box, finM, 0, -2.9 * s, 0, 4.4 * s, 1.1 * s, 1.5 * s);
      for (const z of [-1, 1]) add(AV.G.box, glowB(col), 0, -2.9 * s, z * .76 * s, 3.8 * s, .3 * s, .02);
      for (const [y, z, sy, sz] of [[2.2, 0, 2.6, .2], [-2.2, 0, 2.6, .2], [0, 2.2, .2, 2.6], [0, -2.2, .2, 2.6]]) add(AV.G.box, finM, -7.6 * s, y * s, z * s, 2.4 * s, sy * s, sz * s);
      for (const z of [-1, 1]) add(AV.G.sph, glowB(col), -9 * s, 0, z * .9 * s, .45 * s, .45 * s, .45 * s);
      add(AV.G.box, glowB(0xffffff), 1 * s, .2 * s, 0, 12 * s, .12 * s, 5.25 * s);
      grp.add(g); return g;
    }
    const ships = [[150, 22, .05, 1.2, 0x7fe8ff], [210, 46, -.035, 1.6, 0xffd9a0], [260, 8, .028, 1.4, 0xff9ad8]].map(([r, y, sp, s, c], i) => ({ g: airship(s, c), r, y, sp, a0: i * 2.1 }));
    const aurora = airship(1.1, 0xffd9a0), AUR = [Math.cos(deg(128)) * 86, 9, Math.sin(deg(128)) * 86]; aurora.position.set(AUR[0], AUR[1], AUR[2]); aurora.rotation.y = -deg(128) - Math.PI / 2;
    const LANES = [[96, 14, 1, 5], [118, 27, -1, 5], [140, 5, 1, 4]], cars = [];
    LANES.forEach(([r, y, dir, n], li) => { for (let i = 0; i < n; i++) cars.push({ r, y, dir, a: i / n * TAU + li, sp: (8 + rng() * 4) / r, c: [0x7fe8ff, 0xffd9a0, 0xff9ad8, 0xffffff][(i + li) % 4] }) });
    const carM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), cars.length); carM.frustumCulled = false; grp.add(carM);
    { const cc = new THREE.Color(); cars.forEach((c, i) => carM.setColorAt(i, cc.setHex(c.c).convertSRGBToLinear())); carM.instanceColor.needsUpdate = true; carM.material.userData.lin = 1 }

    /* ---------- Zenith Plaza: Aether Spire, Halo Deck, sky lift, light fountains ---------- */
    B.city.add(MT.shiny, new THREE.LatheGeometry([[3.6, 0], [3.5, .4], [3.0, .8], [2.9, 6], [2.7, 14], [2.6, 21.5], [3.3, 22.6], [3.4, 24.6], [2.4, 25.4], [2.2, 30], [1.9, 33], [2.6, 34.2], [2.6, 35.2], [1.2, 36.4], [.5, 38], [.06, 39]].map(p => new THREE.Vector2(p[0], p[1])), 40), 0xeef2f8);
    ctx.circles.push([0, 0, 3.4]);
    for (const [y, r, c] of [[1, 3.05, 0x7fe8ff], [8, 2.86, 0xffd9a0], [15, 2.72, 0x7fe8ff], [22.1, 3.0, 0xffd9a0], [34.7, 2.65, 0x7fe8ff]]) B.city.add(MT.v, new THREE.TorusGeometry(r, .12, 5, 48), c, M(0, y, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .26; B.city.add(MT.v, A.geo('box'), 0x9fe8ff, beamM([Math.cos(a) * 2.95, 1.4, Math.sin(a) * 2.95], [Math.cos(a) * 2.62, 21, Math.sin(a) * 2.62], .14), .9) }
    /* Halo Deck: ring at 24 m with glass railing, struts and an inlaid light ring */
    B.city.add(MT.dbl, new THREE.LatheGeometry([[3.3, 23.7], [9.4, 23.55], [10.15, 23.9], [10.15, 24.25], [3.3, 24.25], [3.3, 23.7]].map(p => new THREE.Vector2(p[0], p[1])), 64), 0xe8edf4);
    B.city.add(MT.v, new THREE.TorusGeometry(8.9, .07, 4, 96), 0x7fe8ff, M(0, DECK_Y + .02, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    B.city.add(MT.v, new THREE.TorusGeometry(9.8, .16, 5, 96), 0xffd9a0, M(0, 23.6, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    B.city.add(MT.v, new THREE.TorusGeometry(10.05, .07, 5, 96), 0x7fe8ff, M(0, DECK_Y + 1.12, 0, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; B.city.add(MT.shiny, A.geo('cyl'), 0xdfe6f0, M(Math.cos(a) * 10.05, DECK_Y + .56, Math.sin(a) * 10.05, .045, 1.12, .045)) }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .52; B.city.add(MT.shiny, A.geo('box'), 0xdfe6f0, beamM([Math.cos(a) * 2.7, 15, Math.sin(a) * 2.7], [Math.cos(a) * 8.2, 23.6, Math.sin(a) * 8.2], .32, .2)) }
    mesh(new THREE.CylinderGeometry(10.05, 10.05, 1.1, 64, 1, true), glassIn, 3).position.y = DECK_Y + .55;
    sign('HALO DECK', 0, DECK_Y + 2.2, -9.7, 0, 3.2, '#7fe8ff');
    /* sky lift: rails, base pad and a glass capsule that really carries you up */
    for (const s of [-1, 1]) B.city.add(MT.shiny, A.geo('cyl'), 0xdfe6f0, M(s * 1.02, 12.6, LZ, .06, 25.2, .06));
    B.city.add(MT.shiny, A.geo('disc'), 0xd8e0ec, M(0, .05, LZ, 1.35, .1, 1.35)); B.city.add(MT.v, new THREE.TorusGeometry(1.35, .07, 4, 32), 0x7fe8ff, M(0, .11, LZ, 1, 1, 1, Math.PI / 2, 0, 0), 1);
    const cap = new THREE.Group(); cap.position.set(0, 0, LZ); grp.add(cap);
    { const add = (o, y) => { o.position.y = y; cap.add(o); return o };
      add(new THREE.Mesh(new THREE.CylinderGeometry(.98, .98, .14, 32), AV.std(0xe8edf4, .3, .4)), .07); add(new THREE.Mesh(new THREE.CylinderGeometry(.98, .98, .1, 32), AV.std(0xe8edf4, .3, .4)), 2.65);
      add(new THREE.Mesh(new THREE.CylinderGeometry(.96, .96, 2.5, 32, 1, true), glassIn), 1.38).renderOrder = 3;
      for (const y of [.16, 2.58]) add(new THREE.Mesh(new THREE.TorusGeometry(.98, .045, 4, 40), new THREE.MeshBasicMaterial({ color: 0x7fe8ff })), y).rotation.x = Math.PI / 2 }
    sign('SKY LIFT · HALO DECK', 2.9, 3.3, 7.4, .35, 2.6, '#7fe8ff', { posts: true });
    /* holographic halo rings + floating crystal above the spire */
    const holo = [0, 1].map(i => { const m = new THREE.Mesh(new THREE.TorusGeometry(13 - i * 2.2, .1, 4, 128), new THREE.MeshBasicMaterial({ color: i ? 0xffd9a0 : 0x7fe8ff, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.y = 31 + i * 2.5; m.renderOrder = 3; grp.add(m); return m });
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), AV.std(0xcff6ff, .15, .2, 0x7fe8ff, 1.6)); crystal.position.y = 40.2; grp.add(crystal);
    const fount = [];
    for (let i = 0; i < 4; i++) {
      const a = deg(45 + i * 90), x = Math.cos(a) * 13, z = Math.sin(a) * 13;
      B.city.add(MT.shiny, A.geo('disc'), 0xdfe6f0, M(x, .25, z, 2.4, .5, 2.4)); B.city.add(MT.v, new THREE.TorusGeometry(2.36, .12, 6, 40), 0x7fe8ff, M(x, .52, z, 1, 1, 1, Math.PI / 2, 0, 0), 1);
      const w = K.waterPlane(ctx, new THREE.CircleGeometry(2.16, 32), .53, { deep: 0x2a7ab8, shallow: 0x8ae8ff, sky: 0xe8f4ff, iri: .35 }); w.position.x = x; w.position.z = z; w.renderOrder = 2;
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(.42, 0), AV.std(0xcff6ff, .15, .2, i % 2 ? 0xffd9a0 : 0x7fe8ff, 1.5)); c.position.set(x, 2.2, z); grp.add(c); fount.push(c);
      ctx.circles.push([x, z, 2.5]);
    }
    K.motes(ctx, { n: 40, x: 0, z: 0, r: 15, y0: .8, y1: 6, cols: [0x7fe8ff, 0xffd9a0, 0xffffff], size: 2.2, alpha: .7 });
    const plazaL = new THREE.PointLight(0xcfefff, .9, 34); plazaL.position.set(0, 9, 0); grp.add(plazaL);
    sign('NIMBUS SKY CITY', 0, 7.2, 29, 0, 8, '#7fe8ff');

    /* ---------- Window Promenade: benches, telescopes, planters ---------- */
    const rest = (min, msg) => { S.time += min; while (S.time >= 1440) { S.time -= 1440; S.day++ } AV.hud(); AV.save(); AV.toast(msg) };
    for (let i = 0; i < 16; i++) {
      const a = deg(i * 22.5 + 11.25), ca = Math.cos(a), sa = Math.sin(a), x = ca * 57, z = sa * 57, ry = -a - Math.PI / 2, tx = -sa, tz = ca;
      B.city.add(MT.wood, A.geo('box'), 0xffffff, M(x, .46, z, 2.2, .1, .56, 0, ry, 0)); B.city.add(MT.wood, A.geo('box'), 0xffffff, M(x - ca * .27, .82, z - sa * .27, 2.2, .44, .07, 0, ry, 0));
      for (const s of [-1, 1]) B.city.add(MT.shiny, A.geo('box'), 0xdfe6f0, M(x + tx * .9 * s, .22, z + tz * .9 * s, .08, .44, .5, 0, ry, 0));
      B.city.add(MT.v, A.geo('box'), 0x7fe8ff, M(x, .38, z, 2, .03, .4, 0, ry, 0), 1);
      ctx.circles.push([x + tx * .6, z + tz * .6, .55], [x - tx * .6, z - tz * .6, .55]);
      T.push({ x: x + ca * .9, z: z + sa * .9, r: 1.7, label: () => tr('Sit and watch the clouds (rest 15 min)', 'Sentarse a mirar las nubes (descansar 15 min)'), fn: () => rest(15, tr('You watch the clouds roll by the glass. Time drifts with them.', 'Miras las nubes pasar junto al cristal. El tiempo flota con ellas.')) });
    }
    const DIRS = [['east', 'este'], ['south-east', 'sureste'], ['south', 'sur'], ['south-west', 'suroeste'], ['west', 'oeste'], ['north-west', 'noroeste'], ['north', 'norte'], ['north-east', 'noreste']];
    const VIEWS = [['a flock of white sky-rays glides low over the cloud tops.', 'una bandada de rayas celestes blancas planea sobre las nubes.'], ['an airship tacks through a gap in the clouds, its lights blinking hello.', 'un dirigible cruza un hueco entre las nubes y te saluda con sus luces.'],
      ['far below, a hole in the clouds shows… more clouds. It is clouds all the way down.', 'muy abajo, un hueco en las nubes deja ver… más nubes. Son nubes hasta el fondo.'], ['a distant sky spire catches the sun like a needle of glass.', 'una aguja celeste lejana atrapa el sol como un alfiler de cristal.']];
    const scope = a => {
      const sk = AV.sky || { nightK: 0, dayK: 1 }, d = DIRS[Math.round((((a % TAU) + TAU) % TAU) / deg(45)) % 8], dn = AV.ui === 'es' ? d[1] : d[0];
      if (sk.nightK > .7) return tr('Telescope (' + dn + '): moonlight silvers the cloud sea, and the beacons of far sky spires blink back at you.', 'Telescopio (' + dn + '): la luna platea el mar de nubes y las balizas de las agujas lejanas te devuelven el parpadeo.');
      if (sk.dayK < .55) return tr('Telescope (' + dn + '): the cloud sea glows pink and gold; long shadows stretch between the cumulus towers.', 'Telescopio (' + dn + '): el mar de nubes brilla rosa y dorado; largas sombras se estiran entre las torres de cúmulos.');
      const v = VIEWS[(Math.random() * VIEWS.length) | 0]; return tr('Telescope (' + dn + '): ', 'Telescopio (' + dn + '): ') + (AV.ui === 'es' ? v[1] : v[0]);
    };
    for (let i = 0; i < 8; i++) {
      if (i === 2) continue;   // south: the Skyport gate stands there
      const a = deg(i * 45), ca = Math.cos(a), sa = Math.sin(a), x = ca * 59, z = sa * 59;
      for (let k = 0; k < 3; k++) { const b = a + k / 3 * TAU; B.city.add(MT.shiny, A.geo('cyl'), 0x9aa6bc, beamM([x + Math.cos(b) * .45, 0, z + Math.sin(b) * .45], [x, 1.15, z], .045)) }
      B.city.add(MT.shiny, A.geo('cyl'), 0xe8edf4, beamM([x - ca * .55, 1.08, z - sa * .55], [x + ca * .75, 1.42, z + sa * .75], .16)); B.city.add(MT.v, A.geo('cyl'), 0xffd9a0, beamM([x + ca * .7, 1.41, z + sa * .7], [x + ca * .78, 1.43, z + sa * .78], .19), 1);
      B.city.add(MT.shiny, A.geo('cyl'), 0x5a6478, beamM([x - ca * .55, 1.08, z - sa * .55], [x - ca * .7, 1.05, z - sa * .7], .07));
      ctx.circles.push([x, z, .55]);
      T.push({ x: x - ca * 1.1, z: z - sa * 1.1, r: 1.8, label: () => tr('Look through the cloud telescope', 'Mirar por el telescopio de nubes'), fn: () => { AV.toast(scope(a)); AV.audio && AV.audio.blip(880, .2, 'sine', .06) } });
    }
    const potItems = [];
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) continue;   // keep the avenue ends free
      const a = deg(i * 22.5), x = Math.cos(a) * 55, z = Math.sin(a) * 55;
      B.city.add(MT.shiny, new THREE.CylinderGeometry(.95, .8, .7, 24, 1, true), 0xe6ecf4, M(x, .35, z)); B.city.add(MT.v, A.geo('disc'), 0x4a3a2a, M(x, .62, z, .9, .08, .9)); B.city.add(MT.v, new THREE.TorusGeometry(.95, .05, 4, 32), 0x7fe8ff, M(x, .7, z, 1, 1, 1, Math.PI / 2, 0, 0), 1);
      ctx.circles.push([x, z, 1.05]); potItems.push({ x, y: .64, z, s: .75 + rng() * .3, ry: rng() * TAU });
    }
    K.scatter(ctx, K.species.bush(0x4aa84a, 0xff8ad8), K.floraMat(.01), potItems);

    /* ---------- Hanging Gardens: pool, waterfall from a floating island, planters, updraft vents ---------- */
    B.city.add(MT.shiny, A.geo('disc'), 0xdfe6f0, M(POOL[0], .3, POOL[1], 4.9, .6, 4.9)); B.city.add(MT.v, new THREE.TorusGeometry(4.85, .14, 6, 64), 0x7fe8ff, M(POOL[0], .62, POOL[1], 1, 1, 1, Math.PI / 2, 0, 0), 1);
    { const w = K.waterPlane(ctx, new THREE.CircleGeometry(4.6, 48), .58, { deep: 0x1a6aa8, shallow: 0x7ae0f0, sky: 0xe8f4ff, iri: .3 }); w.position.x = POOL[0]; w.position.z = POOL[1]; w.renderOrder = 2 }
    ctx.circles.push([POOL[0], POOL[1], 4.95]);
    K.scatter(ctx, K.species.lotus(0xff9ad8, 0x3aa04a), K.floraMat(0), [0, 1, 2, 3].map(i => ({ x: POOL[0] + Math.cos(i * 1.7 + .4) * 2.8, y: .6, z: POOL[1] + Math.sin(i * 1.7 + .4) * 2.8, s: .9, ry: i })));
    const island = (BB, x, y, z, r) => {
      BB.add(MT.v, A.geo('cone'), 0x8f98ab, M(x, y - r * .9, z, r, r * 1.8, r, Math.PI, 0, 0)); BB.add(MT.v, A.geo('cone'), 0x6f7890, M(x + r * .25, y - r * 1.45, z - r * .1, r * .42, r * 1.1, r * .42, Math.PI, 0, 0));
      BB.add(MT.v, A.geo('disc'), 0x6fcf6a, M(x, y + .1, z, r * 1.02, .3, r * 1.02));
      for (let i = 0; i < 5; i++) { const a = i * 1.3 + x; BB.add(MT.v, A.geo('ico'), [0x3aa04a, 0x5ac85a, 0xff9ad8][i % 3], M(x + Math.cos(a) * r * .62, y + .55, z + Math.sin(a) * r * .62, .8, .6, .8), i % 3 === 2 ? .6 : .1) }
      BB.add(MT.v, A.geo('ico'), 0x9ff0ff, M(x, y - r * 1.95, z, .4, .9, .4), 1);
    };
    island(B.city, 0, 15, -41.5, 3.8); island(B.isl, -12, 11, -46, 2.6); island(B.isl, 13, 13, -45, 3);
    K.scatter(ctx, K.species.candyTree(0x8a6a4a, 0xff9ad8, 0xb8a4ff, 0x9af0d0), K.floraMat(.012), [{ x: -.6, y: 15.2, z: -42.6, s: .9, ry: .4 }]);
    K.waterfall(ctx, 0, .55, -37.85, 2.2, 14.75, 0, { c1: 0xbff4ff, c2: 0xffffff }).renderOrder = 2;
    const trees = [], spirals = [], flowersBig = [];
    PLANTERS.forEach(([x, z, r], i) => {
      B.city.add(MT.shiny, new THREE.CylinderGeometry(r, r * .94, .9, 40, 1, true), 0xe6ecf4, M(x, .45, z)); B.city.add(MT.v, A.geo('disc'), 0x4a3a2a, M(x, .8, z, r - .05, .1, r - .05));
      B.city.add(MT.v, new THREE.TorusGeometry(r, .08, 4, 48), [0x7fe8ff, 0xffd9a0][i % 2], M(x, .92, z, 1, 1, 1, Math.PI / 2, 0, 0), 1); ctx.circles.push([x, z, r + .15]);
      (i < 2 ? trees : i < 4 ? spirals : flowersBig).push({ x, y: .82, z, s: i < 4 ? 1 + r * .05 : 1, ry: rng() * TAU });
      if (i >= 4) for (let k = 0; k < 2; k++) { const a = rng() * TAU; flowersBig.push({ x: x + Math.cos(a) * r * .55, y: .82, z: z + Math.sin(a) * r * .55, s: .7 + rng() * .3, ry: rng() * TAU }) }
    });
    K.scatter(ctx, K.species.candyTree(0x8a6a4a, 0xff8ad8, 0xffe08a, 0x9af0d0), K.floraMat(.012), trees);
    K.scatter(ctx, K.species.spiralTree(0x6a5a8a, 0x7fe8ff, 0xffb0e8), K.floraMat(.012), spirals);
    K.scatter(ctx, K.species.giantFlower(0xff8ad8, 0xffe040), K.floraMat(.02), flowersBig);
    const inLawn = (x, z, cx, cz, rx, rz) => ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2 < .9;
    const gardenFree = (x, z) => inLawn(x, z, 0, -37, 25, 15.5) && Math.abs(x) > 3.3 && Math.hypot(x - POOL[0], z - POOL[1]) > 6 && PLANTERS.every(p => Math.hypot(x - p[0], z - p[1]) > p[2] + .6) && VENTS.every(v => Math.hypot(x - v[0], z - v[1]) > 2.6);
    const GA = { x0: -24, x1: 24, z0: -52, z1: -22 };
    K.field(ctx, K.species.flower(0xff8ad8, 0xffe040), K.floraMat(.05, { double: true }), K.n(60), GA, { s0: .8, s1: 1.4, ok: gardenFree });
    K.field(ctx, K.species.flower(0x9ab8ff, 0xffffff, 5), K.floraMat(.05, { double: true }), K.n(40), GA, { s0: .8, s1: 1.3, ok: gardenFree });
    K.field(ctx, K.species.grass(0x5ab84a), K.floraMat(.08, { double: true }), K.n(110), GA, { s0: .8, s1: 1.5, ok: gardenFree });
    K.field(ctx, K.species.bush(0x3a9a4a, 0xffd84a), K.floraMat(.01), K.n(10), GA, { s0: .7, s1: 1.1, ok: gardenFree, col: .7 });
    const airMat = new THREE.ShaderMaterial({ uniforms: { uT: K.U.time }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'uniform float uT;varying vec2 vU;void main(){float s=fract(vU.y*3.-uT*.9+sin(vU.x*37.7)*.15);float k=smoothstep(0.,.25,s)*smoothstep(.6,.25,s);float a=(.08+.2*k)*smoothstep(1.,.5,vU.y)*smoothstep(0.,.08,vU.y);gl_FragColor=vec4(vec3(.5,.88,1.)*a,a);}' });
    const airGeo = new THREE.CylinderGeometry(1.5, 1.5, 11, 32, 1, true);
    VENTS.forEach(([x, z]) => {
      B.city.add(MT.shiny, A.geo('disc'), 0x2a3240, M(x, .04, z, 1.6, .08, 1.6)); B.city.add(MT.v, new THREE.TorusGeometry(1.62, .09, 4, 40), 0x7fe8ff, M(x, .09, z, 1, 1, 1, Math.PI / 2, 0, 0), 1);
      for (let k = 0; k < 4; k++) B.city.add(MT.shiny, A.geo('box'), 0x5a6478, M(x, .09, z, 3, .04, .1, 0, k * Math.PI / 4, 0));
      mesh(airGeo, airMat, 3).position.set(x, 5.6, z);
      K.motes(ctx, { n: 14, x, z, r: 1.3, y0: .5, y1: 9, cols: [0xffffff, 0x9fe8ff], size: 2, speed: 2.2, alpha: .7 });
      T.push({ x, z, r: 2.2, label: () => tr('Updraft vent: jump and ride the wind', 'Corriente ascendente: salta y deja que te lleve el viento'), fn: () => AV.toast(tr('Updraft! Gravity is light above the vents — jump and drift down slowly.', '¡Corriente ascendente! Sobre las rejillas la gravedad es ligera: salta y baja flotando.')) });
    });
    sign('HANGING GARDENS · UPDRAFT VENTS', 6.2, 2.6, -20.5, -.15, 4.4, '#7aff9a', { posts: true }); ctx.circles.push([6.2 - 1.67, -20.5, .25], [6.2 + 1.67, -20.5, .25]);
    const gardenL = new THREE.PointLight(0x9ff0ff, .8, 28); gardenL.position.set(0, 6, -38); grp.add(gardenL);
    K.motes(ctx, { n: 60, x: 0, z: -38, r: 20, y0: .5, y1: 5, cols: [0x7aff9a, 0xffe08a, 0xff9ad8], size: 2.6, alpha: .9, night: true });

    /* ---------- Sky Orchard (north-east) + Skyport lawn (south-west) ---------- */
    const orch = [], palms = [];
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3, d = i % 3 === 0 ? 2.5 : 6, x = 30 + Math.cos(a) * d * 1.2, z = -30 + Math.sin(a) * d * .85; (i % 2 ? palms : orch).push({ x, y: 0, z, s: .8 + rng() * .35, ry: rng() * TAU }); ctx.circles.push([x, z, .5]) }
    K.scatter(ctx, K.species.candyTree(0x7a5a3a, 0xffb0e8, 0xffe08a, 0xb8f0d0), K.floraMat(.012), orch);
    K.scatter(ctx, K.species.palm(0x8a5a2a, 0x3ab05a), K.floraMat(.01), palms);
    K.field(ctx, K.species.flower(0xffd84a, 0xff6a3a), K.floraMat(.05, { double: true }), K.n(26), { r0: 0, r1: 9, x: 30, z: -30 }, { s0: .8, s1: 1.2, ok: (x, z) => inLawn(x, z, 30, -30, 10, 7.5) });
    sign('SKY ORCHARD', 22, 2.4, -24, -Math.PI * .25, 3.2, '#ffd84a', { posts: true });
    K.field(ctx, K.species.grass(0x5ab84a), K.floraMat(.08, { double: true }), K.n(40), { r0: 0, r1: 8, x: -21, z: 34 }, { s0: .8, s1: 1.4, ok: (x, z) => inLawn(x, z, -21, 34, 8, 6.5) });
    { const p = [{ x: -24, y: 0, z: 32, s: 1.1, ry: 1 }, { x: -17, y: 0, z: 37, s: .9, ry: 2 }]; K.scatter(ctx, K.species.spiralTree(0x6a5a8a, 0xffd9a0, 0x7fe8ff), K.floraMat(.012), p); p.forEach(t => ctx.circles.push([t.x, t.z, .35])) }

    /* ---------- Cloud Nine Café (east) ---------- */
    { const [x, z] = CAFE, cr = 7, door = Math.PI, inGap = a => Math.abs(Math.atan2(Math.sin(a - door), Math.cos(a - door))) < deg(17), cg = [];
      B.city.add(MT.tile, A.geo('disc'), 0xffffff, M(x, .04, z, cr + .2, .08, cr + .2));
      for (let i = 0; i < 12; i++) {
        const a = deg(i * 30 + 15), a2 = deg(i * 30 + 45), px = x + Math.cos(a) * cr, pz = z + Math.sin(a) * cr;
        B.city.add(MT.shiny, A.geo('pillar'), 0xe8edf4, M(px, 0, pz, .7, 4.2, .7)); ctx.circles.push([px, pz, .3]);
        if (inGap((a + a2) / 2)) continue; const mx = x + Math.cos((a + a2) / 2) * cr * .985, mz = z + Math.sin((a + a2) / 2) * cr * .985, w = 2 * cr * Math.sin(deg(15));
        cg.push([A.geo('box'), 0xffffff, M(mx, 2.1, mz, .06, 4.1, w, 0, -(a + a2) / 2, 0), 0]); B.city.add(MT.v, A.geo('box'), 0xffd9a0, M(mx, .1, mz, .12, .2, w, 0, -(a + a2) / 2, 0), .6);
      }
      for (let k = 0; k < 60; k++) { const a = k / 60 * TAU; if (!inGap(a)) ctx.circles.push([x + Math.cos(a) * cr, z + Math.sin(a) * cr, .42]) }
      mesh(K.merge(cg), glassIn, 3);
      B.city.add(MT.shiny, A.geo('dome'), 0xeef2f8, M(x, 4.2, z, cr + .5, 3.2, cr + .5)); B.city.add(MT.v, new THREE.TorusGeometry(cr + .45, .16, 5, 64), 0xffd9a0, M(x, 4.25, z, 1, 1, 1, Math.PI / 2, 0, 0), 1);
      B.city.add(MT.v, A.geo('sph'), 0xffe8c0, M(x, 7.6, z, .5, .5, .5), 1);
      A.ringCounter(B.city, MT, ctx, x, z, 1.6, 2.2, 1.05, door, 1.0);
      for (const d of [40, 90, -40, -90, 0]) { const a = deg(d), tx = x + Math.cos(a) * 4.7, tz = z + Math.sin(a) * 4.7;
        B.city.add(MT.shiny, A.geo('cyl'), 0xdfe6f0, M(tx, .39, tz, .07, .78, .07)); B.city.add(MT.shiny, A.geo('disc'), 0xffffff, M(tx, .8, tz, .58, .05, .58)); B.city.add(MT.v, A.geo('sph'), 0xffd9a0, M(tx, .9, tz, .07, .07, .07), 1);
        for (const s of [-1, 1]) { const sx = tx - Math.sin(a) * .95 * s, sz = tz + Math.cos(a) * .95 * s; B.city.add(MT.shiny, A.geo('disc'), s > 0 ? 0x7fe8ff : 0xff9ad8, M(sx, .5, sz, .3, .1, .3)); B.city.add(MT.shiny, A.geo('cyl'), 0xdfe6f0, M(sx, .25, sz, .04, .5, .04)) }
        ctx.circles.push([tx, tz, .75]) }
      const cl = new THREE.PointLight(0xffd8a8, 1.1, 20); cl.position.set(x, 3.6, z); grp.add(cl);
      sign('CLOUD NINE CAFÉ', x - cr - .6, 5.3, z, -Math.PI / 2, 4.4, '#ffd84a');
      const MENU = [['cloud_latte', 4], ['stratus_sorbet', 3], ['thunder_tonic', 5]], nm = id => { const d = AV.ITEMS && AV.ITEMS[id]; return d ? d.n[AV.ui === 'es' && d.n[1] ? 1 : 0] : id };
      const menu = () => {
        const p = AV.panel('cmp', '<b>' + tr('Cloud Nine Café', 'Café Cloud Nine') + '</b><div class="note">' + tr('Barista B-9: “Welcome above the weather. What can I float your way?”', 'Barista B-9: “Bienvenido por encima del clima. ¿Qué te hago flotar hasta aquí?”') + '</div><div class="grid">' +
          MENU.map(m => '<button data-i="' + m[0] + '">' + (AV.ITEMS && AV.ITEMS[m[0]] ? AV.ITEMS[m[0]].ic + ' ' : '') + nm(m[0]) + '<small>' + m[1] + ' ' + tr('credits', 'créditos') + '</small></button>').join('') + '</div><button data-close>' + tr('Close', 'Cerrar') + '</button>');
        p.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const m = MENU.find(v => v[0] === b.dataset.i); if (!AV.txn(-m[1], 'Cloud Nine: ' + nm(m[0]))) return; if (AV.bag) AV.bag.add(m[0]); else { S.items = S.items || {}; S.items[m[0]] = (S.items[m[0]] || 0) + 1; AV.toast(nm(m[0])) } AV.audio && AV.audio.blip(660, .15, 'triangle', .12) });
      };
      T.push({ x: x - 3.3, z, r: 2.2, label: () => tr('Cloud Nine Café: order from the menu', 'Café Cloud Nine: pedir del menú'), fn: menu });
    }

    /* ---------- Cirrus Residences (west) ---------- */
    TOWERS.forEach(([x, z, r, h], i) => {
      const top = r * .9, rAt = y => r + (top - r) * y / h, glowC = i % 2 ? 0xffe2b0 : 0x9fe8ff, a = Math.atan2(-z, -x);
      B.city.add(MT.shiny, A.geo('disc'), 0xd8e0ec, M(x, .3, z, r + .9, .6, r + .9));
      B.city.add(MT.shiny, new THREE.CylinderGeometry(top, r, h, 28), 0xf0f3f8, M(x, h / 2, z));
      for (let y = 2.6, k = 0; y < h - 1.2; y += 3.2, k++) {
        B.city.add(MT.v, A.geo('cyl'), glowC, M(x, y, z, rAt(y) + .03, .55, rAt(y) + .03), .85);
        if (k % 2) { B.city.add(MT.shiny, A.geo('disc'), 0xe2e8f0, M(x, y - 1.1, z, rAt(y) + .65, .12, rAt(y) + .65)); B.city.add(MT.v, new THREE.TorusGeometry(rAt(y) + .65, .05, 4, 40), 0x7fe8ff, M(x, y - .55, z, 1, 1, 1, Math.PI / 2, 0, 0), .8) }
      }
      B.city.add(MT.shiny, A.geo('dome'), 0xe8edf4, M(x, h, z, top + .3, r * .7, top + .3)); B.city.add(MT.shiny, A.geo('cyl'), 0xc8d0dc, M(x, h + r * .7 + 1.4, z, .07, 2.8, .07)); B.city.add(MT.v, A.geo('sph'), 0xff6a6a, M(x, h + r * .7 + 2.9, z, .2, .2, .2), 1);
      B.city.add(MT.v, A.geo('box'), 0x7fe8ff, M(x + Math.cos(a) * (r + .02), 1.3, z + Math.sin(a) * (r + .02), .1, 2.4, 1.4, 0, -a, 0), 1);
      ctx.circles.push([x, z, r + .9]);
    });
    { const t1 = TOWERS[0], t3 = TOWERS[2]; B.city.add(MT.shiny, A.geo('box'), 0xe6ecf4, beamM([t1[0], 11, t1[1]], [t3[0], 11, t3[1]], 1.8, 1.1)); B.city.add(MT.v, A.geo('box'), 0x9fe8ff, beamM([t1[0], 11.2, t1[1]], [t3[0], 11.2, t3[1]], 1.85, .25), 1) }
    { const t2 = TOWERS[1], t4 = TOWERS[3]; B.city.add(MT.shiny, A.geo('box'), 0xe6ecf4, beamM([t2[0], 15, t2[1]], [t4[0], 15, t4[1]], 1.6, 1)); B.city.add(MT.v, A.geo('box'), 0xffe2b0, beamM([t2[0], 15.2, t2[1]], [t4[0], 15.2, t4[1]], 1.65, .22), 1) }
    const resL = new THREE.PointLight(0xffe2b0, .8, 30); resL.position.set(RES[0], 7, RES[1]); grp.add(resL);
    sign('CIRRUS RESIDENCES', -19.5, 2.6, 7, Math.PI / 2, 4, '#b8a4ff', { posts: true }); ctx.circles.push([-19.5, 7 - 1.52, .25], [-19.5, 7 + 1.52, .25]);

    /* ---------- Cloud-gazing lounge (south-east) ---------- */
    for (let i = 0; i < 5; i++) { const a = deg(35 + i * 5), x = Math.cos(a) * 50, z = Math.sin(a) * 50, ry = -a + Math.PI / 2;
      B.city.add(MT.wood, A.geo('box'), 0xffffff, M(x, .38, z, .75, .1, 1.9, 0, ry, 0)); B.city.add(MT.wood, A.geo('box'), 0xffffff, M(x - Math.cos(a) * .95, .72, z - Math.sin(a) * .95, .75, .1, .9, -.9, ry, 0));
      B.city.add(MT.v, A.geo('box'), 0xff9ad8, M(x, .25, z, .6, .04, 1.7, 0, ry, 0), 1); ctx.circles.push([x, z, .8]) }
    T.push({ x: Math.cos(deg(45)) * 47.5, z: Math.sin(deg(45)) * 47.5, r: 3.6, label: () => tr('Lie back and watch the clouds (rest 30 min)', 'Tumbarse a mirar las nubes (descansar 30 min)'), fn: () => rest(30, tr('A cloud shaped like an ape drifts past. Then one like a pipe. You feel rested.', 'Pasa una nube con forma de simio. Luego una con forma de pipa. Te sientes descansado.')) });
    sign('CLOUD-GAZING LOUNGE', Math.cos(deg(45)) * 44, 2.4, Math.sin(deg(45)) * 44, -Math.PI * .75, 3.6, '#ff9ad8', { posts: true });

    /* ---------- Skyport: return gate (south) + the docked Airship Aurora (south-west) ---------- */
    { const gz = 55, pm = new THREE.ShaderMaterial({ uniforms: { t: K.U.time }, transparent: true, side: THREE.DoubleSide, depthWrite: false,
        vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'uniform float t;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p)*2.;float a=atan(p.y,p.x);float s=sin(a*5.+t*2.-r*9.)*.5+.5;vec3 c1=vec3(1.,.69,.29),c2=vec3(.5,.9,1.);vec3 col=mix(c1,c2,s)*(1.4-r*.6);float e=smoothstep(1.,.86,r);gl_FragColor=vec4(col,e*(.3+.5*s));}' });
      mesh(new THREE.PlaneGeometry(4.6, 4.6), pm, 3).position.set(0, 2.5, gz);
      B.city.add(MT.v, new THREE.TorusGeometry(2.4, .22, 8, 48), 0xffd9a0, M(0, 2.5, gz), 1);
      for (const s of [-1, 1]) { B.city.add(MT.shiny, A.geo('pillar'), 0xe8edf4, M(s * 3, 0, gz, .7, 5, .7)); B.city.add(MT.v, A.geo('ico'), 0x7fe8ff, M(s * 3, 5.3, gz, .3, .4, .3), 1); ctx.circles.push([s * 3, gz, .45]) }
      B.city.add(MT.shiny, A.geo('disc'), 0xd8e0ec, M(0, .04, gz, 3.4, .08, 3.4));
      sign('SKYPORT · BACK TO APE TOWN', 0, 6.4, gz + .3, Math.PI, 5, '#ffd84a');
      T.push({ x: 0, z: gz - 2.4, r: 3, label: () => tr('Skyport gate: back to Ape Town', 'Puerta del Skyport: volver a Ape Town'), fn: () => AV.travel('ape_town', 'nimbus') }) }
    { const a = deg(128), x = Math.cos(a) * 57.5, z = Math.sin(a) * 57.5;
      T.push({ x, z, r: 2.6, label: () => tr('Skyport window: wave at the Airship Aurora', 'Ventana del Skyport: saludar al dirigible Aurora'), fn: () => { AV.toast(tr('The Airship Aurora flashes its running lights at you. Departures to the lower clouds are paused today.', 'El dirigible Aurora te hace luces. Hoy no hay salidas hacia las nubes bajas.')); AV.audio && [0, .25].forEach((o, k) => setTimeout(() => AV.audio.blip([523, 784][k], .35, 'sine', .1), o * 1000)) } }) }

    /* ---------- sky lift + Halo Deck logic ---------- */
    let deck = false, lift = null;
    const rails = []; for (let i = 0; i < 32; i++) { const a = i / 32 * TAU; rails.push([Math.cos(a) * 10.2, Math.sin(a) * 10.2, .8]) }
    const setDeck = on => { deck = on; for (const c of rails) { const k = ctx.circles.indexOf(c); if (on && k < 0) ctx.circles.push(c); else if (!on && k >= 0) ctx.circles.splice(k, 1) } };
    const ride = up => { if (lift) return; if (!up) setDeck(false); lift = { t: 0, up }; AV.P.x = 0; AV.P.z = LZ; AV.toast(up ? tr('Going up… the plaza shrinks below your feet.', 'Subiendo… la plaza se encoge bajo tus pies.') : tr('Going down to Zenith Plaza.', 'Bajando a la Plaza Cenit.')); AV.audio && AV.audio.blip(up ? 440 : 660, .4, 'sine', .08) };
    T.push({ x: 0, z: LZ + 1.6, r: 2, y: 0, show: () => !lift && !deck, label: () => tr('Sky lift: ride up to the Halo Deck', 'Ascensor celeste: subir a la Cubierta Halo'), fn: () => ride(true) });
    T.push({ x: 0, z: LZ + 1.6, r: 2, y: DECK_Y, show: () => !lift && deck, label: () => tr('Sky lift: down to Zenith Plaza', 'Ascensor celeste: bajar a la Plaza Cenit'), fn: () => ride(false) });
    T.push({ x: 0, z: -8.4, r: 1.8, y: DECK_Y, show: () => deck, label: () => tr('Halo Deck: look over the city', 'Cubierta Halo: mirar la ciudad'), fn: () => AV.toast(tr('From up here the whole city curls around the spire like a seashell, and the clouds press against every window.', 'Desde aquí arriba la ciudad entera se enrosca alrededor de la aguja como una caracola, y las nubes se apoyan en cada ventana.')) });
    ctx.upd.push(dt => {
      const P = AV.P;
      if (lift) {
        lift.t = Math.min(1, lift.t + dt / 5.5); const e = lift.t * lift.t * (3 - 2 * lift.t), y = (lift.up ? e : 1 - e) * DECK_Y; cap.position.y = y;
        P.x = 0; P.z = LZ; P.y = y; P.vx = P.vy = P.vz = 0;
        if (lift.t >= 1) { const up = lift.up; lift = null; if (up) setDeck(true); P.y = up ? DECK_Y : 0; P.on = true; AV.toast(up ? tr('Halo Deck, 24 m up. Walk the ring and look out through the high windows.', 'Cubierta Halo, a 24 m. Recorre el anillo y mira por las ventanas altas.') : tr('Zenith Plaza.', 'Plaza Cenit.')); AV.audio && AV.audio.blip(880, .3, 'sine', .08) }
      } else { if (deck && Math.hypot(P.x, P.z) > 9.8) setDeck(false); cap.position.y = deck ? DECK_Y : 0 }
    });

    /* ---------- residents ---------- */
    if (AV.beings) {
      AV.beings.spawn(ctx, [{ kind: 'robot', x: CAFE[0], z: CAFE[1], yaw: -Math.PI / 2, mode: 'idle', name: 'Barista B-9', seed: 3 }]);
      AV.beings.spawn(ctx, [{ kind: 'human', x: 0, z: 26, area: { x: 0, z: 26, r: 6 }, name: 'Sky Warden Lyra' }, { kind: 'alien', x: -14, z: -24, area: { x: -14, z: -24, r: 6 } },
        { kind: 'robot', x: -34, z: 2, area: { x: -34, z: 2, r: 6 } }, { kind: 'spirit', x: 20, z: 50, area: { x: 20, z: 50, r: 4 }, name: 'Cloud Poet' }, { kind: 'human', x: 50, z: -10, area: { x: 50, z: -10, r: 4 } },
        { kind: 'alien', x: 36, z: 34, area: { x: 36, z: 34, r: 4 } }].slice(0, AV.beings.n(ctx, 3, 5, 6)).map((s, i) => Object.assign(s, { seed: 60 + i })));
    }
    K.motes(ctx, { n: 120, x: 0, z: 0, r: 56, y0: 3, y1: 34, cols: [0xffffff, 0x9fe8ff, 0xffe8b0], size: 2, alpha: .45, night: true });

    /* ---------- flush + animation ---------- */
    B.far.flush(ctx, { noShadow: true }); delete B.far;
    const islM = B.isl.flush(ctx); delete B.isl;
    for (const k in B) B[k].flush(ctx);
    const SK = AV.sky, mtx = new THREE.Matrix4(), qq = new THREE.Quaternion(), pp = new THREE.Vector3(), ss = new THREE.Vector3(1.6, .45, .6), yAx = new THREE.Vector3(0, 1, 0);
    ctx.upd.push((dt, t) => {
      if (SK && SK.lightCol) { const lc = SK.lightCol, li = SK.lightIntensity; CU.uLight.value.setRGB(lc[0] * li, lc[1] * li, lc[2] * li); CU.uSun.value.copy(SK.lightDir || SK.sunDir) }
      if (AV.HS) CU.uAmb.value.copy(AV.HS.color).multiplyScalar(AV.HS.intensity);
      islM.forEach(m => m.position.y = Math.sin(t * .4) * .7);
      holo[0].rotation.set(Math.PI / 2 + Math.sin(t * .2) * .08, 0, t * .1); holo[1].rotation.set(Math.PI / 2 + Math.cos(t * .17) * .1, 0, -t * .14);
      crystal.rotation.y = t * .6; crystal.position.y = 40.2 + Math.sin(t * .8) * .25;
      fount.forEach((c, i) => { c.rotation.y = t * (1 + i * .2); c.position.y = 2.2 + Math.sin(t * 1.3 + i) * .18 });
      ships.forEach(s => { const a = s.a0 + t * s.sp; s.g.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * .3 + s.a0) * 2, Math.sin(a) * s.r); s.g.rotation.y = -a - (s.sp > 0 ? Math.PI / 2 : -Math.PI / 2) });
      aurora.position.y = AUR[1] + Math.sin(t * .5) * .8; aurora.rotation.z = Math.sin(t * .4) * .03;
      cars.forEach((c, i) => { const a = c.a + t * c.sp * c.dir; pp.set(Math.cos(a) * c.r, c.y + Math.sin(t * .7 + i) * .6, Math.sin(a) * c.r); qq.setFromAxisAngle(yAx, -a - c.dir * Math.PI / 2); mtx.compose(pp, qq, ss); carM.setMatrixAt(i, mtx) }); carM.instanceMatrix.needsUpdate = true;
    });

    return {
      name: 'Nimbus Sky City', fog: [180, 1400],
      sky: { dome: { cloud: .3, swirl: .18, glow: .6 } },
      surface: (x, z) => { const r = Math.hypot(x, z); if (deck && r < 9.7) return DECK_Y; return r < RW ? 0 : null },
      gravityAt: (x, z) => VENTS.some(v => Math.hypot(x - v[0], z - v[1]) < 1.9) ? .14 : 1,
      arrivals: { default: { x: 0, z: 46, yaw: 0 }, pipe: { x: 0, z: 42, yaw: 0 }, ape_gate: { x: 0, z: 50, yaw: 0 } }, defaultArrival: 'default',
      places: [{ id: 'plaza', name: ['Zenith Plaza & sky lift', 'Plaza Cenit y ascensor celeste'], x: 0, z: 9.5, yaw: 0 }, { id: 'gardens', name: ['Hanging Gardens & waterfall', 'Jardines colgantes y cascada'], x: 0, z: -21, yaw: 0 },
        { id: 'cafe', name: ['Cloud Nine Café', 'Café Cloud Nine'], x: CAFE[0] - 11, z: CAFE[1], yaw: faceYaw(CAFE[0] - 11, CAFE[1], CAFE[0], CAFE[1]) }, { id: 'res', name: ['Cirrus Residences', 'Residencias Cirro'], x: -17, z: 1, yaw: faceYaw(-17, 1, RES[0], RES[1]) },
        { id: 'windows', name: ['Cloud windows (north promenade)', 'Ventanas a las nubes (paseo norte)'], x: 0, z: -56, yaw: 0 }, { id: 'lounge', name: ['Cloud-gazing lounge', 'Mirador de nubes'], x: 33, z: 33, yaw: faceYaw(33, 33, 45, 45) },
        { id: 'skyport', name: ['Skyport gate & Airship Aurora', 'Skyport y dirigible Aurora'], x: -31, z: 41, yaw: faceYaw(-31, 41, AUR[0], AUR[2]) }],
      chatLines: [['Above the clouds, every day is a good-weather day.', 'Por encima de las nubes, todos los días hace buen tiempo.'], ['Ride the sky lift at sunset. Trust me.', 'Sube en el ascensor celeste al atardecer. Hazme caso.'],
        ['The updraft vents in the gardens? Jump. Just jump.', '¿Las corrientes de los jardines? Salta. Tú solo salta.'], ['I once dropped a sandwich out of a window. It is still falling.', 'Una vez se me cayó un bocadillo por una ventana. Sigue cayendo.']],
      musicProfile: { bpm: 96, root: 50, scale: [0, 2, 4, 7, 9, 11], style: 'sky' }
    };
  }
});
})(window.AV);
