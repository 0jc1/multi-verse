/* Apeverse V0.9.6 - cinematic graphics prototype suite (run: run_tests.ps1 -Suite tools\tests\suite_gfx.js [-FileMode]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 25000) };
  const file = location.protocol === 'file:', GX = () => AV.gfx;
  const view = (x, z, yaw, pitch) => { AV.P.x = x; AV.P.z = z; AV.P.y = 0; AV.P.vx = AV.P.vz = 0; AV.P.yaw = yaw; AV.P.pitch = pitch || 0 };
  const plazaView = () => view(-12.6, -7.4, Math.atan2(12.4, 4.6), .32);
  const setQ = q => { AV.S.set.gq = q; AV.applyQuality() };

  step('boot', async c => { $('gq').value = 'High'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 20000)); await sleep(1500); AV.save = () => { } });

  step('Astro-9 on High: post, HDRI, GLB assets', async c => {
    c('travel to Astro-9', await travel('astro9')); plazaView();
    const s0 = GX().status(); c('post-processing active on High', s0.post, JSON.stringify(s0)); c('half-float HDR path or 8-bit fallback reported', typeof s0.hdr === 'boolean', 'hdr=' + s0.hdr + ' aa=' + s0.aa + ' pr=' + s0.pr);
    c('High: anti-aliasing active in the post path', !!s0.aa && s0.aa !== 'none', s0.aa);
    c('renderer tone mapping matches the path', AV.R.toneMapping === (s0.hdr ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping));
    c('environment loaded (' + (file ? 'procedural on file://' : 'Poly Haven HDRI') + ')', await until(() => GX().envKind === (file ? 'procedural' : 'hdri'), 20000), GX().envKind);
    const want = file ? 'procedural' : 'GLB'; c('tower is ' + want, await until(() => AV.W.gfxAssets().tower === want, 20000), JSON.stringify(AV.W.gfxAssets()));
    c('both aliens are soft-body characters (sculpted, loaded)', await until(() => AV.W.gfxAssets().aliens.every(a => a === 'soft-body'), 30000), JSON.stringify(AV.W.gfxAssets()));
    let reflective = 0; GX().mats.forEach((v, m) => { if (v.kind === 'env' && m.envMap) reflective++ }); c('PBR materials receive the environment map', reflective >= 5, reflective + ' materials');
    const tw = AV.W.group.getObjectByName('shell'); c('mosaic shell has colour + normal + roughness maps', !!(tw && tw.material.map && tw.material.normalMap && tw.material.roughnessMap));
    c('neon/glow boosted for bloom (HDR)', !s0.hdr || [...GX().mats].some(([m, v]) => v.kind === 'glow' && m.color.r + m.color.g + m.color.b > 3));
    await sleep(2500);
  }, { shot: 'gfx_high_post' });

  step('rigged aliens animate', async c => {
    const P = AV.W._plaza, z = P.zib, o = P.orbo; c('Zib + Orbo have skinned meshes', [z, o].every(a => { let s = false; a.obj.traverse(m => { if (m.isSkinnedMesh) s = true }); return s }));
    c('soft body: antenna + belly spring bones move', await until(() => [z, o].every(a => { const st = a.actor && a.actor.st; return st && st.R.t[st.sp.antL.i].length() > .002 && st.R.t[st.sp.belly.i].length() > 1e-4 }), 10000));
    c('clips Idle/Walk/Dance/Wave on both', [z, o].every(a => ['Idle', 'Walk', 'Dance', 'Wave'].every(n => !!a.acts[n])));
    const bone = a => { let b = null; a.obj.traverse(x => { if (x.isBone && /thighL/.test(x.name)) b = x }); return b };
    view(-25, 4, 0); await sleep(300);                                        // stand away so Zib keeps walking
    const p0 = z.h.position.clone(), q0 = bone(z).quaternion.clone(); await until(() => z.h.position.distanceTo(p0) > .5, 15000);
    c('Zib walks around the tower', z.h.position.distanceTo(p0) > .2 && z.cur === 'Walk', p0.distanceTo(z.h.position).toFixed(2) + ' m');
    c('Zib’s legs move (skeleton animated)', bone(z).quaternion.angleTo(q0) > .05, bone(z).quaternion.angleTo(q0).toFixed(3));
    const oq = bone(o).quaternion.clone(); c('Orbo dances', o.cur === 'Dance' && await until(() => bone(o).quaternion.angleTo(oq) > .01, 10000), o.cur);
    const zt = AV.W.T.find(t => /Talk to Zib/.test(lab(t))); c('talk target follows Zib', !!zt && Math.hypot(zt.x - z.h.position.x, zt.z - z.h.position.z) < .3);
    zt.fn(); await sleep(200); c('talking makes Zib wave + speak', z.cur === 'Wave' && /Zib:/.test($('toast').textContent), $('toast').textContent);
    const ot = AV.W.T.find(t => /Talk to Orbo/.test(lab(t))); ot.fn(); await sleep(200); c('Orbo waves + speaks', o.cur === 'Wave' && /Orbo:/.test($('toast').textContent));
    const tt = AV.W.T.find(t => /Spiral tower/.test(lab(t))); tt.fn(); c('tower info panel reports the pipeline', /Post-processing/.test($('toast').textContent), $('toast').textContent);
    plazaView(); await sleep(1800);
  }, { shot: 'gfx_aliens' });

  step('settings toggles', async c => {
    AV.toggleSettings(); c('settings show the cinematic section', !!$('gPost') && !!$('gBloom') && !!$('gRefl'));
    $('gPost').value = 'off'; $('gPost').onchange({ target: $('gPost') }); c('post-processing Off', !GX().active && AV.R.toneMapping === THREE.ACESFilmicToneMapping);
    $('gRefl').value = 'off'; $('gRefl').onchange({ target: $('gRefl') }); let any = false; GX().mats.forEach((v, m) => { if (v.kind === 'env' && m.envMap) any = true }); c('reflections Off', !any);
    AV.closeTop(); await sleep(1500);
  }, { shot: 'gfx_high_off' });

  step('Medium preset', async c => {
    const o = GX().opt(); o.post = 'auto'; o.refl = 'auto'; setQ('Medium'); await sleep(400);
    const s = GX().status(); c('Medium: post on (Auto)', s.post, JSON.stringify(s)); c('Medium: FXAA edge smoothing, pixel ratio capped at 1', s.aa === 'FXAA' && s.pr <= 1, s.aa + ' pr ' + s.pr);
    o.bloom = 1.6; GX().apply(); c('bloom slider scales strength', Math.abs(GX().status().bloom - AV.W.post.bloom[0] * 1.6) < .01, GX().status().bloom); o.bloom = 1; GX().apply();
    plazaView(); await sleep(2000);
  }, { shot: 'gfx_medium' });

  step('Low preset', async c => {
    setQ('Low'); await sleep(400); const s = GX().status(); c('Low: no post-processing (Auto)', !s.post && AV.R.toneMapping === THREE.ACESFilmicToneMapping, JSON.stringify(s));
    let any = false; GX().mats.forEach((v, m) => { if (v.kind === 'env' && m.envMap) any = true }); c('Low: reflections off (Auto)', !any);
    c('Low: sky dome back to display output', !AV.kit.dome.material.defines.LIN_OUT);
    c('Orbo goes back to dancing after waving', await until(() => AV.W._plaza.orbo.cur === 'Dance', 60000), AV.W._plaza.orbo.cur);
    plazaView(); await sleep(2000);
  }, { shot: 'gfx_low' });

  step('other worlds unchanged + re-entry', async c => {
    setQ('High');
    for (const w of ['ape_town', 'jungle_dub', 'chiang_mai', 'verdalux']) { const ok = await travel(w); await sleep(600); c(w + ': loads, no post-processing, ACES as before', ok && !GX().active && AV.R.toneMapping === THREE.ACESFilmicToneMapping && !AV.kit.dome.material.defines.LIN_OUT && !$('err').textContent, $('err').textContent) }
    c('back to Astro-9', await travel('astro9')); const want = file ? 'procedural' : 'GLB';
    c('re-entry: post on again + tower ' + want + ' + soft-body aliens', GX().active && await until(() => AV.W.gfxAssets().tower === want && AV.W.gfxAssets().aliens.every(a => a === 'soft-body'), 15000), JSON.stringify(AV.W.gfxAssets()));
    c('registry only holds this world’s materials', [...GX().mats.values()].every(v => v.id === 'astro9'), GX().mats.size);
    c('low gravity on the dance floor still works', AV.W.gravityAt(0, -18) < .5);
  });

  step('fallbacks', async c => {
    let rej = false; try { await GX().glb('assets/models/astro9/does_not_exist.glb') } catch (e) { rej = true } c('missing GLB rejects (fallback stays)', rej);
    const a = AV.forge.alien('zib'); c('procedural alien builds with 16 bones + 4 clips', a.clips.length === 4 && (() => { let n = 0; a.root.traverse(o => { if (o.isBone) n++ }); return n === 16 })());
    const t = AV.forge.tower(.6); let tris = 0; t.traverse(o => { if (o.isMesh) tris += o.geometry.index.count / 3 }); c('procedural tower (Low detail) is light', tris < 20000, tris + ' tris');
  });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
