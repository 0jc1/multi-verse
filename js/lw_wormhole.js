/* APEVERSE - lw_wormhole.js : the WORMHOLE between worlds (owner's request: immersive psychedelic portal tunnel).
   Travelling between worlds now flies through a 3D spiral wormhole instead of a black fade:
     - a full-screen GLSL tunnel (polar ray-marched look): flowing organic spirals, cosmic clouds, star streaks, depth fog,
       destination-specific palettes (Ape Town jungle neon, Chiang Mai lantern gold, Tokyo neon, Paris dusk, ...);
     - smooth motion only: no strobing, no hard flashes (brightness changes are slow; reduced motion slows and calms everything);
     - synthesized whoosh / drone audio (WebAudio, no files);
     - destination name + loading progress;
   Timing: ~2.4 s flight in (cinematic) -> the world is built (the main thread is busy; the tunnel holds) -> ~1 s emergence.
   Modes (Settings, saved): cinematic (default), short (~1 s), instant (old fade); prefers-reduced-motion -> calm + short.
   Skip: Space / Esc / click / tap during the flight.  The overlay ALWAYS clears: it is removed in a finally block, and a 20 s
   safety timer removes it whatever happens (even if the world fails to load).  One WebGL context, created once and reused. */
'use strict';
(function (AV) {
const tr = AV.tr || ((a) => a);
const PAL = {   /* [core, swirl A, swirl B, cloud] per destination (0..1 RGB) */
  ape_town: [[.25, 1, .55], [.95, .3, .85], [1, .85, .2], [.2, .1, .35]], chiang_mai: [[1, .75, .3], [1, .45, .15], [.95, .2, .35], [.3, .12, .05]],
  tokyo: [[.3, .85, 1], [1, .25, .7], [.55, .3, 1], [.08, .05, .25]], paris: [[1, .7, .8], [.55, .5, 1], [1, .85, .6], [.15, .1, .3]],
  amsterdam: [[1, .55, .2], [.3, .7, 1], [.95, .95, .5], [.08, .12, .25]], astro9: [[.4, 1, .9], [.7, .3, 1], [.2, .6, 1], [.03, .03, .12]],
  madrid: [[1, .6, .25], [.9, .2, .25], [1, .9, .4], [.25, .08, .05]], default: [[.5, .9, 1], [.85, .4, 1], [1, .7, .35], [.1, .06, .22]] };
const W = AV.wormhole = { mode: 'cinematic', active: false, stats: { trips: 0, lastMs: 0, failsafe: 0 } };
try { W.mode = localStorage.getItem('apeverse_wormhole') || 'cinematic' } catch (e) { }
const reduced = () => { if (AV.S && AV.S.set && AV.S.set.reduce) return true; try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) { return false } };
W.setMode = m => { if (!['cinematic', 'short', 'instant'].includes(m)) return; W.mode = m; try { localStorage.setItem('apeverse_wormhole', m) } catch (e) { } };

let cv, gl, prog, uT, uR, uC, uA, uB, uD, uK, uSp, box, nameEl, barEl, hintEl, raf = 0;
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;uniform float t;uniform vec2 r;uniform vec3 cC,cA,cB,cD;uniform float k,sp;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;float rad=length(uv)+1e-3,ang=atan(uv.y,uv.x);
 float z=.35/rad+t*sp;            /* depth along the tunnel */
 float tw=ang/6.2831853+z*.18+.15*sin(z*.7);   /* spiral twist */
 float s1=.5+.5*sin(6.2831853*(tw*5.)+z*1.3), s2=.5+.5*sin(6.2831853*(tw*3.-z*.21)+2.);
 float cl=fb(vec2(tw*6.,z*.9));  float org=smoothstep(.35,.95,fb(vec2(tw*10.+z*.3,z*2.)));
 vec3 col=mix(cA,cB,s1); col=mix(col,cD,.55*cl); col+=cC*org*.55; col*=.55+.45*s2;
 float st=step(.985,h(floor(vec2(tw*90.,z*14.))))*smoothstep(.0,.25,fract(z*14.));   /* star streaks */
 col+=vec3(st)*.8*smoothstep(.15,.6,rad);
 float core=smoothstep(.22,0.,rad); col=mix(col,cC*1.3+.25,core*.85);   /* the light at the end */
 col*=smoothstep(0.,.08,rad*1.2)*.25+.75; col*=1.-.35*smoothstep(.55,1.2,rad);   /* depth fog + vignette */
 gl_FragColor=vec4(col*k,1.);}`;

function init() { if (cv) return true; cv = document.createElement('canvas'); cv.id = 'wormholeCv'; cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:100000;display:none;pointer-events:auto;background:#000';
  box = document.createElement('div'); box.id = 'wormholeUi'; box.style.cssText = 'position:fixed;left:50%;bottom:9vh;transform:translateX(-50%);z-index:100001;display:none;text-align:center;font:600 15px system-ui,sans-serif;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6);pointer-events:none;min-width:260px';
  box.innerHTML = '<div style="opacity:.75;letter-spacing:.2em;font-size:11px">' + tr('TRAVELLING THROUGH THE WORMHOLE', 'VIAJANDO POR EL AGUJERO DE GUSANO') + '</div><div id="wormName" style="font-size:30px;margin:4px 0 10px;font-weight:800"></div><div style="height:5px;background:rgba(255,255,255,.18);border-radius:3px;overflow:hidden"><div id="wormBar" style="height:100%;width:0;background:linear-gradient(90deg,#ffd36a,#ff6ad5,#6ad8ff);transition:width .25s"></div></div><div id="wormHint" style="opacity:.6;font-size:11px;margin-top:8px"></div>';
  document.body.appendChild(cv); document.body.appendChild(box); nameEl = box.querySelector('#wormName'); barEl = box.querySelector('#wormBar'); hintEl = box.querySelector('#wormHint');
  gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: true }); if (!gl) { cv.remove(); box.remove(); cv = null; return false }
  const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s }; prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { cv.remove(); box.remove(); cv = null; return false } gl.useProgram(prog);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  uT = gl.getUniformLocation(prog, 't'); uR = gl.getUniformLocation(prog, 'r'); uC = gl.getUniformLocation(prog, 'cC'); uA = gl.getUniformLocation(prog, 'cA'); uB = gl.getUniformLocation(prog, 'cB'); uD = gl.getUniformLocation(prog, 'cD'); uK = gl.getUniformLocation(prog, 'k'); uSp = gl.getUniformLocation(prog, 'sp');
  const skip = e => { if (W.active && W._skip) { if (e.type === 'keydown' && !['Space', 'Escape', 'Enter'].includes(e.code)) return; e.preventDefault && e.preventDefault(); W._skip() } };
  cv.addEventListener('click', skip); cv.addEventListener('touchstart', skip, { passive: true }); addEventListener('keydown', skip, true); return true }

/* audio: soft filtered-noise whoosh rising with speed + a low drone (no files, smooth envelopes, never loud) */
let ac = null, aNodes = null;
function audioStart(pal) { try { ac = ac || (AV.audio && AV.audio.ctx) || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); const now = ac.currentTime, out = ac.createGain(); out.gain.setValueAtTime(0, now); out.gain.linearRampToValueAtTime(.22, now + .6); out.connect(ac.destination);
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4; bp.frequency.setValueAtTime(260, now); bp.frequency.exponentialRampToValueAtTime(1400, now + 2.2); src.connect(bp); bp.connect(out); src.start();
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), dg = ac.createGain(); o1.type = 'sine'; o2.type = 'triangle'; o1.frequency.value = 55 + pal[0][0] * 20; o2.frequency.value = o1.frequency.value * 1.5; o2.detune.value = 7; dg.gain.value = .35; o1.connect(dg); o2.connect(dg); dg.connect(out); o1.start(); o2.start();
    aNodes = { out, srcs: [src, o1, o2], bp } } catch (e) { aNodes = null } }
function audioEnd(sec) { if (!aNodes || !ac) return; const n = aNodes, now = ac.currentTime; aNodes = null; try { n.bp.frequency.cancelScheduledValues(now); n.bp.frequency.exponentialRampToValueAtTime(220, now + sec); n.out.gain.cancelScheduledValues(now); n.out.gain.setValueAtTime(n.out.gain.value, now); n.out.gain.linearRampToValueAtTime(0, now + sec); n.srcs.forEach(s => s.stop(now + sec + .05)) } catch (e) { } }

function frame(st) { if (!cv || cv.style.display === 'none') return; const dpr = Math.min(1.25, devicePixelRatio || 1), w = Math.round(innerWidth * dpr * .6), h = Math.round(innerHeight * dpr * .6);   /* 60% resolution: soft, cheap */
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h } gl.viewport(0, 0, w, h); const t = (performance.now() - st.t0) / 1000, P = st.pal;
  gl.uniform1f(uT, t); gl.uniform2f(uR, w, h); gl.uniform3fv(uC, P[0]); gl.uniform3fv(uA, P[1]); gl.uniform3fv(uB, P[2]); gl.uniform3fv(uD, P[3]);
  gl.uniform1f(uK, st.k()); gl.uniform1f(uSp, st.speed()); gl.drawArrays(gl.TRIANGLES, 0, 3); raf = requestAnimationFrame(() => frame(st)) }

function show(on) { cv.style.display = box.style.display = on ? 'block' : 'none'; if (!on) { cancelAnimationFrame(raf); raf = 0 } }

/* settings: wormhole mode (+ Babylon graphics preset when the Babylon renderer is on) */
const ts0 = AV.toggleSettings; if (ts0) AV.toggleSettings = function () { const r = ts0.apply(this, arguments); const p = document.getElementById('set'); if (!p || p.style.display !== 'block') return r; const cl = p.querySelector('[data-close]');
  const row = document.createElement('div'); const B = AV.bab, G = B && B.on && B.gfx;
  row.innerHTML = '<p>' + tr('World travel', 'Viaje entre mundos') + ' <select id="sWorm"><option value="cinematic">' + tr('Wormhole (cinematic)', 'Agujero de gusano (cinemático)') + '</option><option value="short">' + tr('Wormhole (short)', 'Agujero de gusano (corto)') + '</option><option value="instant">' + tr('Instant', 'Instantáneo') + '</option></select></p>' +
    (G ? '<p>' + tr('Babylon graphics', 'Gráficos Babylon') + ' <select id="sBabG"><option value="auto">Auto</option>' + Object.keys(G.presets).map(k => '<option value="' + k + '">' + G.presets[k].label + '</option>').join('') + '</select> <span style="opacity:.6;font-size:12px">(F6)</span></p>' : '');
  cl ? p.insertBefore(row, cl) : p.appendChild(row); const sw = document.getElementById('sWorm'); sw.value = W.mode; sw.onchange = e => W.setMode(e.target.value); const sb = document.getElementById('sBabG'); if (sb) { sb.value = G.auto ? 'auto' : G.preset; sb.onchange = e => G.set(e.target.value) } return r };

/* wrap world travel */
const enter0 = AV.enterWorld;
AV.enterWorld = function (id, arrival, opt) { opt = opt || {}; const fromMenu = !AV.W;
  if (!opt.travel || opt.instant || W.mode === 'instant' || W.active || !AV.worldDefs || !AV.worldDefs[id] || !init()) return enter0.call(this, id, arrival, opt);
  const calm = reduced(), short = W.mode === 'short' || calm, tIn = short ? 900 : 2400, tOut = short ? 500 : 1000, def = AV.worldDefs[id] || {}, st = { t0: performance.now(), pal: PAL[id] || PAL.default, phase: 'in', pIn: 0 };
  const fadeK = () => { const e = (performance.now() - st.t0) / 1000; return Math.min(1, e / .45) * (st.phase === 'out' ? Math.max(0, 1 - (performance.now() - st.tOut0) / tOut) : 1) };
  st.k = () => .92 * fadeK(); st.speed = () => calm ? .35 : (st.phase === 'in' ? .6 + 1.4 * Math.min(1, (performance.now() - st.t0) / tIn) : st.phase === 'out' ? 1.2 : 2.0);
  W.active = true; W.stats.trips++; const T0 = performance.now(); const meta = (AV.worldMeta && AV.worldMeta(id)) || {}; nameEl.textContent = (meta.name || def.name || id.replace(/_/g, ' ').replace(/w/g, s => s.toUpperCase())).toString(); barEl.style.width = '0%'; hintEl.textContent = tr('Space / click to skip', 'Espacio / clic para saltar');
  cv.style.opacity = '1'; show(true); frame(st); audioStart(st.pal); let done = false, built = false;
  const clear = () => { if (done) return; done = true; clearTimeout(st.fs); clearInterval(st.pi); show(false); W.active = false; W._skip = null; audioEnd(.3); W.stats.lastMs = Math.round(performance.now() - T0) };
  st.fs = setTimeout(() => { if (!done) { W.stats.failsafe++; clear(); try { AV.fadeTo && AV.fadeTo(0) } catch (e) { } } }, 20000);   /* never stuck */
  st.pi = setInterval(() => { if (st.phase === 'in') barEl.style.width = Math.min(70, 70 * (performance.now() - st.t0) / tIn) + '%' }, 120);
  const build = () => { if (built) return; built = true; clearInterval(st.pi); barEl.style.width = '78%'; st.phase = 'build';
    /* let the browser paint the 78% state, then build the world (blocking) */
    setTimeout(() => { let ok = true; try { enter0.call(AV, id, arrival, Object.assign({}, opt, { instant: true })) } catch (e) { ok = false; console.error('[wormhole] travel failed', e) }
      finally { barEl.style.width = '100%'; st.phase = 'out'; st.tOut0 = performance.now(); try { AV.fadeTo && AV.fadeTo(0) } catch (e) { } audioEnd(tOut / 1000); setTimeout(clear, tOut) } }, 40) };
  W._skip = () => { if (st.phase === 'in') build() };
  setTimeout(build, tIn); return true };
})(window.AV);
