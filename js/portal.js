/* APEVERSE V0.9.1 - portal.js : the Portal Pipe.
   P key / Pipe button -> the pipe rises to your mouth (inhale: ember flares), you exhale a cloud of psychedelic smoke,
   the holographic world selector swirls in. Choose a world -> a smoke stream flies ahead and a portal forms out of it on free ground.
   Walk in (or press E) to travel. "Places here" jumps inside the current world. Return to Ape Town + Unstuck are always offered.
   Worlds that are not built yet are listed honestly as Under construction and cannot be entered. */
'use strict';
(function (AV) {
const $ = AV.$, tr = AV.tr, TAU = AV.TAU, cam = AV.cam, scene = AV.scene;
const PP = AV.pipe = { open: false, portal: null, anim: 0, puff: -1, smokeOn: 0 };

/* ======================= held pipe (child of the camera) ======================= */
const held = new THREE.Group(); held.scale.setScalar(.7); cam.add(held); PP.held = held;
const bowlTex = AV.mkc(128, c => { const g = c.createLinearGradient(0, 0, 128, 0); ['#ff4ad2', '#ffb04a', '#ffe94a', '#4aff9a', '#4ac8ff', '#9a5cff', '#ff4ad2'].forEach((h, i) => g.addColorStop(i / 6, h)); c.fillStyle = '#4a2410'; c.fillRect(0, 0, 128, 128); c.fillStyle = g; for (let i = 0; i < 5; i++) { c.save(); c.translate(0, 18 + i * 24); c.beginPath(); for (let x = 0; x <= 128; x += 4) c.lineTo(x, Math.sin(x / 128 * TAU * 2 + i) * 5); c.lineTo(128, 8); c.lineTo(0, 8); c.fill(); c.restore() } });
(function () {
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a3416, roughness: .45, map: bowlTex, emissive: 0x2a0a20, emissiveIntensity: .4 }), brass = AV.std(0xe0b04a, .3, .9), glow = AV.std(0xff7a30, .4, 0, 0xff5a10, 1.6);
  const prof = []; for (let i = 0; i <= 10; i++) { const t = i / 10; prof.push(new THREE.Vector2(.028 + Math.sin(t * Math.PI) * .028 + t * .012, t * .11 - .02)) }
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), wood); bowl.position.set(0, 0, 0); held.add(bowl);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(.034, .02, .02, 16), AV.std(0x1a0a06, .9)); inner.position.y = .082; held.add(inner);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.046, .006, 8, 24), brass); rim.rotation.x = Math.PI / 2; rim.position.y = .09; held.add(rim);
  const em = new THREE.Mesh(AV.G.sph, glow); em.scale.set(.03, .01, .03); em.position.set(0, .088, 0); held.add(em); PP.ember = em;
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(.02, -.01, 0), new THREE.Vector3(.12, -.04, .01), new THREE.Vector3(.24, -.03, .02), new THREE.Vector3(.33, .0, .02)]);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, .011, 8, false), wood); held.add(stem);
  const tip = new THREE.Mesh(AV.G.cyl, brass); tip.scale.set(.012, .05, .012); tip.position.set(.35, .01, .02); tip.rotation.z = Math.PI / 2 - .25; held.add(tip);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.016, .004, 6, 16), brass); ring.position.set(.13, -.04, .01); ring.rotation.y = Math.PI / 2; held.add(ring);
  const gem = new THREE.Mesh(AV.G.ico, AV.std(0x8a5cff, .2, .2, 0x7a4cff, 1.5)); gem.scale.setScalar(.018); gem.position.set(.0, .03, .055); held.add(gem); PP.gem = gem;
  held.userData.bowlTop = new THREE.Vector3(0, .1, 0); held.userData.mat = wood;
  held.traverse(o => { o.castShadow = false; o.renderOrder = 5 });
})();
AV.lin(held);

/* ======================= smoke particles (world space) ======================= */
const SN = 220, sPos = new Float32Array(SN * 3), sCol = new Float32Array(SN * 3), sSz = new Float32Array(SN), sAl = new Float32Array(SN), sRot = new Float32Array(SN);
const sV = new Float32Array(SN * 3), sAge = new Float32Array(SN), sLife = new Float32Array(SN), sS0 = new Float32Array(SN), sS1 = new Float32Array(SN); let sNext = 0;
const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sPos, 3)); sg.setAttribute('aCol', new THREE.BufferAttribute(sCol, 3)); sg.setAttribute('aSz', new THREE.BufferAttribute(sSz, 1)); sg.setAttribute('aAl', new THREE.BufferAttribute(sAl, 1)); sg.setAttribute('aRot', new THREE.BufferAttribute(sRot, 1));
const smokeMat = new THREE.ShaderMaterial({
  uniforms: { pr: { value: 1 } }, transparent: true, depthWrite: false,
  vertexShader: 'attribute vec3 aCol;attribute float aSz,aAl,aRot;uniform float pr;varying vec3 vC;varying float vA,vR;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSz*pr*(420./max(-mv.z,.3));vC=aCol;vA=aAl;vR=aRot;}',
  fragmentShader: 'varying vec3 vC;varying float vA,vR;float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}' +
    'void main(){vec2 d=gl_PointCoord-.5;float c=cos(vR),s=sin(vR);d=mat2(c,-s,s,c)*d;float r=length(d);if(r>.5)discard;float n=vn(d*6.+vR*3.)*.6+vn(d*13.-vR)*.4;float a=smoothstep(.5,.05,r)*(.55+.45*n)*vA;gl_FragColor=vec4(vC*(.85+.3*n),a);}'
});
const smoke = new THREE.Points(sg, smokeMat); smoke.frustumCulled = false; smoke.renderOrder = 6; scene.add(smoke);
const SCOL = [0xd8c8ff, 0xffb0e8, 0xa8f0ff, 0xfff0c8, 0xc8ffd8], _c = new THREE.Color();
function emit(x, y, z, vx, vy, vz, life, s0, s1, col) {
  const i = sNext; sNext = (sNext + 1) % SN; sPos[i * 3] = x; sPos[i * 3 + 1] = y; sPos[i * 3 + 2] = z; sV[i * 3] = vx; sV[i * 3 + 1] = vy; sV[i * 3 + 2] = vz;
  sAge[i] = 0; sLife[i] = life; sS0[i] = s0; sS1[i] = s1; sRot[i] = Math.random() * TAU; _c.setHex(col == null ? SCOL[Math.random() * SCOL.length | 0] : col); sCol[i * 3] = _c.r; sCol[i * 3 + 1] = _c.g; sCol[i * 3 + 2] = _c.b;
}
const _v = new THREE.Vector3(), _f = new THREE.Vector3(), _u = new THREE.Vector3();
function mouth() { cam.getWorldDirection(_f); _u.set(0, 1, 0).applyQuaternion(cam.quaternion); return _v.copy(cam.position).addScaledVector(_f, .32).addScaledVector(_u, -.1) }
/* big exhale in front of the player */
PP.exhale = function (n) {
  const red = AV.S.set.reduce; n = Math.round((n || 46) * (red ? .4 : 1) * (AV.device === 'phone' ? .6 : 1)); mouth(); const m = _v.clone(); cam.getWorldDirection(_f);
  for (let i = 0; i < n; i++) { const sp = .6 + Math.random() * 1.6, a = Math.random() * TAU, sp2 = Math.random() * .5; emit(m.x, m.y, m.z, _f.x * sp + Math.cos(a) * sp2, _f.y * sp + .25 + Math.random() * .35, _f.z * sp + Math.sin(a) * sp2, 2.2 + Math.random() * 2, .06, .55 + Math.random() * .6) }
};
/* smoke stream from the player to a point (the portal forms out of it) */
function stream(x, y, z) {
  mouth(); const m = _v.clone(), n = AV.S.set.reduce ? 10 : 28;
  for (let i = 0; i < n; i++) { const f = i / n, T = .9 + Math.random() * .5; emit(m.x, m.y, m.z, (x - m.x) / T * (.85 + f * .2) + (Math.random() - .5) * .5, (y - m.y) / T + (Math.random() - .5) * .4, (z - m.z) / T * (.85 + f * .2) + (Math.random() - .5) * .5, T + .3, .1, .45 + Math.random() * .35) }
}
function updSmoke(dt) {
  for (let i = 0; i < SN; i++) {
    if (sLife[i] <= 0) { sAl[i] = 0; continue } sAge[i] += dt; const k = sAge[i] / sLife[i]; if (k >= 1) { sLife[i] = 0; sAl[i] = 0; continue }
    const dr = Math.pow(.35, dt); sV[i * 3] *= dr; sV[i * 3 + 2] *= dr; sV[i * 3 + 1] = sV[i * 3 + 1] * dr + .18 * dt;
    const sw = Math.sin(sAge[i] * 2 + i) * .12 * dt; sPos[i * 3] += sV[i * 3] * dt + sw; sPos[i * 3 + 1] += sV[i * 3 + 1] * dt; sPos[i * 3 + 2] += sV[i * 3 + 2] * dt - sw;
    sSz[i] = sS0[i] + (sS1[i] - sS0[i]) * Math.sqrt(k); sAl[i] = Math.min(1, k * 8) * (1 - k) * .75; sRot[i] += dt * .4;
  }
  for (const n of ['position', 'aSz', 'aAl', 'aRot', 'aCol']) sg.attributes[n].needsUpdate = true;
}

/* ======================= portal object ======================= */
const VS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const FS = 'uniform float t,form;uniform vec3 c1,c2;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p)*2.0;float a=atan(p.y,p.x);' +
  'float k=abs(mod(a*6./6.2831+t*.15,1.)-.5)*2.;float s=sin(a*5.0+t*2.0-r*9.0+sin(r*14.-t*3.)*.6)*.5+.5;float s2=sin(k*9.-r*16.+t*4.)*.5+.5;' +
  'vec3 ir=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+r*.7-t*.12+s*.2));vec3 col=mix(mix(c1,c2,s),ir,.45+.25*s2)*(1.5-r)+vec3(1.)*pow(1.-r,6.)*.9;' +
  'float edge=smoothstep(1.0,.82,r)*smoothstep(form*1.05+.02,form*1.05-.05,r);gl_FragColor=vec4(col,edge*(.45+.55*s));}';
/* soft round sprite for the portal's spiral sparks (kept across portals, never disposed) */
const DOT = (() => { const t = AV.mkc(64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64) }); t.userData = t.userData || {}; t.userData.keep = true; return t })();
const COL = { ape_town: [0xffb04a, 0x7ff0c8], verdalux: [0x38e8a0, 0x7a5cff], astro9: [0xff4ad2, 0x4ac8ff], jungle_dub: [0xe8c030, 0x30c060] };
function clearPortal() { if (!PP.portal) return; const p = PP.portal; if (AV.W) { const i = AV.W.T.indexOf(p.tg); if (i >= 0) AV.W.T.splice(i, 1) } if (p.g.parent) p.g.parent.remove(p.g); AV.dispose(p.g); PP.portal = null }
function name(id) { const m = AV.worldMeta(id); return m ? m.name : id }
function placeName(pl) { return pl.name ? (AV.ui === 'es' && pl.name[1] ? pl.name[1] : pl.name[0]) : pl.id }
function summon(dest, place) {
  const W = AV.W; if (!W) return false; clearPortal();
  const fx = -Math.sin(AV.P.yaw), fz = -Math.cos(AV.P.yaw); let best = null;
  outer: for (const dist of [3.8, 4.8, 5.8, 3]) for (const da of [0, .5, -.5, 1, -1, 1.6, -1.6]) { const a = AV.P.yaw + da, x = AV.P.x - Math.sin(a) * dist, z = AV.P.z - Math.cos(a) * dist; if (AV.isFree(W, x, z, 1.3) && Math.abs((W.surface(x, z) || 0) - AV.P.y) < 1.2) { best = [x, z]; break outer } }
  if (!best) { const s = AV.safeSpot(W, AV.P.x + fx * 3, AV.P.z + fz * 3); if (!AV.isFree(W, s[0], s[1], 1.2) || Math.hypot(s[0] - AV.P.x, s[1] - AV.P.z) > 12) return false; best = s }
  const y = W.surface(best[0], best[1]) || 0, g = new THREE.Group(); g.position.set(best[0], y, best[1]); g.rotation.y = Math.atan2(AV.P.x - best[0], AV.P.z - best[1]); W.group.add(g);
  const col = place ? [0x7ff0ff, 0xff6ad5] : (COL[dest] || [0xb07aff, 0x7ff0ff]);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45, .1, 12, 64), new THREE.MeshBasicMaterial({ color: col[0] })); ring.position.y = 1.65; g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.62, .035, 8, 64), new THREE.MeshBasicMaterial({ color: col[1] })); ring2.position.y = 1.65; g.add(ring2);
  const mat = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, form: { value: 0 }, c1: { value: new THREE.Color(col[0]) }, c2: { value: new THREE.Color(col[1]) } }, vertexShader: VS, fragmentShader: FS, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), mat); disc.position.y = 1.65; g.add(disc);
  /* spiral particles */
  const n = 90, pp = new Float32Array(n * 3), pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: col[1], size: .16, map: DOT, transparent: true, opacity: .95, depthWrite: false, blending: THREE.AdditiveBlending })); pts.position.y = 1.65; g.add(pts);
  const l = new THREE.PointLight(col[0], 1.8, 11); l.position.y = 1.6; g.add(l);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), new THREE.MeshBasicMaterial({ color: col[1], transparent: true, opacity: .35, depthWrite: false })); pad.rotation.x = -Math.PI / 2; pad.position.y = .04; g.add(pad);
  const label = place ? placeName(place) : name(dest), tag = AV.kit.tag(label, place ? tr('portal hop', 'salto de portal') : tr('portal', 'portal'), '#ffffff'); tag.position.y = 3.75; tag.scale.set(3.4, 1.06, 1); g.add(tag);
  const tg = { x: best[0], z: best[1], r: 2.4, label: () => (place ? tr('Hop to ', 'Saltar a ') : tr('Enter portal to ', 'Entrar al portal a ')) + label, fn: () => go(PP.portal) }; W.T.push(tg);
  AV.lin(g); PP.portal = { g, mat, ring, ring2, pts, pp, n, pad, light: l, dest, place, t0: AV.now(), x: best[0], z: best[1], y, tg };
  stream(best[0], y + 1.6, best[1]); return true;
}
PP.summon = summon;
function go(p) {
  if (!p) return; const dest = p.dest, place = p.place; clearPortal(); AV.audio && AV.audio.whoosh();
  if (place) { AV.fadeTo(1, 300); setTimeout(() => { const W = AV.W, sp = AV.safeSpot(W, place.x, place.z); AV.P.x = sp[0]; AV.P.z = sp[1]; AV.P.y = W.surface(sp[0], sp[1]) || 0; AV.P.vx = AV.P.vy = AV.P.vz = 0; if (place.yaw != null) AV.P.yaw = place.yaw; AV.fadeTo(0, 400); AV.toast(placeName(place)) }, 320) }
  else AV.travel(dest, 'pipe');
}

/* ======================= holographic, psychedelic world selector ======================= */
function status(id) { return AV.isPlayable(id) ? 'ok' : 'wip' }
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
PP.show = function () {
  if (PP.open || AV.blocking()) return; const W = AV.W; if (!W) return; PP.open = true; PP.puff = 0; PP.inhaled = false;
  const worlds = (AV.WORLDS_DATA || []).slice().sort((a, b) => (status(a.id) === 'ok' ? 0 : 1) - (status(b.id) === 'ok' ? 0 : 1) || (a.roadmap_no || 99) - (b.roadmap_no || 99));
  const open = worlds.filter(w => status(w.id) === 'ok'), wip = worlds.filter(w => status(w.id) !== 'ok'), places = W.places || [];
  let h = '<div class="pp-smoke"><i></i><i></i><i></i><i></i></div><div class="pp-in"><div class="hbar"><h2 class="pp-title">' + tr('PORTAL PIPE', 'PIPA-PORTAL') + '</h2><div class="row"><button id="pRet">' + tr('Return to Ape Town', 'Volver a Ape Town') + '</button><button id="pUn">' + tr('Unstuck', 'Desbloquear') + '</button><button id="pX">' + tr('Close (Esc)', 'Cerrar (Esc)') + '</button></div></div>' +
    '<div class="sub">' + tr('Exhale, choose a world — a portal forms out of the smoke in front of you. Walk through it. You are in: ', 'Exhala y elige un mundo: un portal se forma con el humo frente a ti. Atraviésalo. Estás en: ') + '<b>' + esc(name(W.id)) + '</b></div>';
  if (places.length) h += '<div class="pp-sec">' + tr('Places in ', 'Lugares en ') + esc(name(W.id)) + '</div><div class="pp-places">' + places.map((p, i) => '<button class="pp-place" data-p="' + i + '">✦ ' + esc(placeName(p)) + '</button>').join('') + '</div>';
  h += '<div class="pp-sec">' + tr('Open worlds', 'Mundos abiertos') + '</div><div class="cards big">';
  for (const w of open) { const here = W.id === w.id;
    h += '<button class="card ' + (here ? 'off here' : 'ok') + '" data-w="' + w.id + '" ' + (here ? 'aria-disabled="true"' : '') + '>' + (w.thumb ? '<img alt="" src="' + w.thumb + '">' : '<div class="ph"></div>') +
      '<div class="nm">' + esc(w.name) + '</div><div class="st"><span class="badge ' + (here ? 'b-leg' : 'b-ok') + '">' + (here ? tr('You are here', 'Aquí') : tr('Open — form a portal', 'Abierto: crear portal')) + '</span></div>' +
      '<div class="ds">' + esc(w.core_identity || '') + (w.music_identity ? '<br><span class="mu">♪ ' + esc(w.music_identity) + '</span>' : '') + '</div></button>' }
  h += '</div><div class="pp-sec dim">' + tr('On the roadmap — under construction', 'En la hoja de ruta: en construcción') + '</div><div class="cards">';
  for (const w of wip) h += '<button class="card off" data-w="' + w.id + '" aria-disabled="true">' + (w.thumb ? '<img alt="" src="' + w.thumb + '">' : '<div class="ph"></div>') + '<div class="nm">' + esc(w.name) + '</div><div class="st"><span class="badge b-wip">' + tr('Under construction', 'En construcción') + '</span></div></button>';
  h += '</div><div class="note" style="text-align:center">' + tr('Only worlds marked Open exist in this build. The rest are on the roadmap and listed honestly as under construction.', 'Solo los mundos marcados como Abiertos existen en esta versión. El resto está en la hoja de ruta y figura como en construcción.') + '</div></div>';
  const el = $('pipe'); el.innerHTML = h; el.classList.add('pp'); el.style.display = 'block'; AV.pushModal('pipe', PP.hide);
  el.querySelectorAll('.card').forEach(b => b.onclick = () => {
    const id = b.dataset.w; if (status(id) !== 'ok') { AV.toast(name(id) + ': ' + tr('under construction — not enterable yet.', 'en construcción: todavía no se puede entrar.')); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return }
    if (W.id === id) { AV.toast(tr('You are already here.', 'Ya estás aquí.')); return }
    PP.hide(); if (summon(id)) { AV.audio && AV.audio.whoosh(); AV.toast(tr('Portal to ', 'Portal a ') + name(id) + tr(' is forming — walk into it (or press E near it).', ' se está formando: entra en él (o pulsa E cerca).')) } else AV.toast(tr('No safe space for a portal here. Move to open ground.', 'No hay espacio seguro para un portal aquí. Ve a terreno abierto.'));
  });
  el.querySelectorAll('.pp-place').forEach(b => b.onclick = () => { const pl = places[+b.dataset.p]; PP.hide(); if (summon(W.id, pl)) AV.toast(tr('Portal hop to ', 'Salto de portal a ') + placeName(pl) + tr(' — walk in.', ': entra.')); else AV.toast(tr('No safe space for a portal here.', 'No hay espacio seguro para un portal aquí.')) });
  $('pRet').onclick = () => { PP.hide(); if (W.id === 'ape_town') { AV.toast(tr('You are already in Ape Town.', 'Ya estás en Ape Town.')); return } if (summon('ape_town')) AV.toast(tr('Return portal forming.', 'Portal de regreso formándose.')) };
  $('pUn').onclick = () => { PP.hide(); AV.unstuck() }; $('pX').onclick = () => PP.hide();
  /* arrow-key navigation between cards */
  el.onkeydown = e => { const items = [...el.querySelectorAll('.pp-place,.card.ok')]; let i = items.indexOf(document.activeElement); if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { items[(i + 1) % items.length].focus(); e.preventDefault() } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { items[(i - 1 + items.length) % items.length].focus(); e.preventDefault() } };
  setTimeout(() => { const f = el.querySelector('.card.ok'); f && f.focus({ preventScroll: true }) }, 900);
  if (AV.audio && AV.audio.ok) { AV.audio.blip(110, .7, 'sawtooth', .04); AV.audio.blip(165, .6, 'triangle', .05) }
};
PP.hide = function () { if (!PP.open) return; PP.open = false; $('pipe').style.display = 'none'; $('pipe').innerHTML = ''; AV.popModal('pipe') };
PP.toggle = () => { if (PP.open) PP.hide(); else PP.show() };
AV.keymap.KeyP = PP.toggle;

/* ======================= per-frame animation ======================= */
const bowlW = new THREE.Vector3(); let wisp = 0;
AV.frameFns.push((dt, t) => {
  const red = AV.S.set.reduce, viewer = AV.modals.some(m => m.id === 'viewer' || m.id === 'cinema');
  /* V1.1 (Worlds Reborn §29): the pipe is only in your hand while you use it (P / phone Pipe opens the portal menu, or a puff is playing);
     otherwise your hands are free for whatever you equip from the backpack */
  held.visible = !viewer && (PP.open || PP.puff >= 0 || PP.anim > .03);
  /* smoking sequence: 0..0.75 raise + inhale, 0.75..1.0 lower + exhale burst */
  let raise = 0;
  if (PP.puff >= 0) {
    PP.puff += dt * (red ? 1.6 : 1); const k = PP.puff;
    raise = k < .75 ? Math.sin(Math.min(1, k / .75) * Math.PI / 2) : Math.max(0, 1 - (k - .75) / .35);
    if (k > .75 && !PP.inhaled) { PP.inhaled = true; PP.exhale(); AV.audio && AV.audio.whoosh() }
    if (k > 1.3) PP.puff = -1;
  }
  const k = PP.open ? .35 : 0; PP.anim += (k - PP.anim) * Math.min(1, 6 * dt);
  const a = PP.anim, bob = red ? 0 : Math.sin(t * 1.6) * .006;
  held.position.set(.34 - .3 * raise - .1 * a, -.3 + .2 * raise + .06 * a + bob, -.55 + .22 * raise);
  held.rotation.set(.3 - .3 * raise, -.35 + .9 * raise, .1 + .25 * raise);
  PP.ember.material.emissiveIntensity = 1.1 + (red ? 0 : Math.sin(t * 6) * .3) + raise * 3.2; PP.ember.scale.y = .01 + raise * .008;
  PP.gem.rotation.y = t * 2; PP.gem.rotation.x = t;
  if (held.userData.mat.map) held.userData.mat.map.offset.x = (t * .05) % 1;
  /* idle wisps from the bowl */
  wisp -= dt; if (held.visible && wisp <= 0) { wisp = red ? .5 : .16; held.updateMatrixWorld(); bowlW.copy(held.userData.bowlTop); held.localToWorld(bowlW); emit(bowlW.x, bowlW.y, bowlW.z, (Math.random() - .5) * .05, .25 + Math.random() * .1, (Math.random() - .5) * .05, 1.6 + Math.random(), .012, .1 + Math.random() * .08, 0xe8e0ff) }
  smokeMat.uniforms.pr.value = AV.R ? AV.R.getPixelRatio() : 1; updSmoke(dt);
  /* portal: forms over ~1.2 s, spins, swallows the player */
  const p = PP.portal; if (!p) return;
  const age = t - p.t0, form = Math.min(1, age / 1.2), e = 1 - Math.pow(1 - form, 3);
  p.mat.uniforms.t.value = t; p.mat.uniforms.form.value = e; p.ring.scale.setScalar(.2 + .8 * e); p.ring2.scale.setScalar(.2 + .8 * e + Math.sin(t * 3) * .02); p.ring.rotation.z = t * .6; p.ring2.rotation.z = -t * .4;
  p.pad.material.opacity = .35 * e; p.light.intensity = 1.8 * e; p.g.position.y = p.y + Math.sin(t * 2) * .03;
  for (let i = 0; i < p.n; i++) { const f = ((i / p.n) + t * .25) % 1, ang = i * 2.4 + t * 2.2, r = 1.55 * (1 - f) * e; p.pp[i * 3] = Math.cos(ang) * r; p.pp[i * 3 + 1] = Math.sin(ang) * r; p.pp[i * 3 + 2] = (f - .5) * .3 }
  p.pts.geometry.attributes.position.needsUpdate = true;
  const d = Math.hypot(p.x - AV.P.x, p.z - AV.P.z);
  if (d < 1.3 && !AV.blocking() && age > .8) go(p);
  else if (age > 90 && d > 8) clearPortal();
});
const prevEnter = AV.onWorldEnter; AV.onWorldEnter = W => { if (prevEnter) prevEnter(W); clearPortal(); PP.hide() };
AV.pipeTarget = () => PP.portal;
PP.smokeAlive = () => { let n = 0; for (let i = 0; i < SN; i++) if (sLife[i] > 0) n++; return n };
})(window.AV);
