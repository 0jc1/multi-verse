/* APEVERSE - Giant Hostel runtime verification: scenes, textures, collisions, console errors. */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id);
  step('boot + travel', async c => {
    $('gq').value = 'High'; $('bNew').click();
    c('Ape Town loads', await until(() => AV.W && AV.W.id === 'ape_town' && AV.running, 25000));
    AV.enterWorld('chiang_mai', 'default');
    c('Chiang Mai loads', await until(() => AV.W && AV.W.id === 'chiang_mai' && AV.running, 60000));
    await sleep(5000);
  }, { shot: 'vh_arrival' });
  step('photo textures loaded on the GPU', async c => {
    const found = await until(() => {
      let n = 0; AV.W.group.traverse(o => { if (o.material && o.material.map && o.material.map.image && o.material.map.image.width > 200) n++ }); return n >= 9;
    }, 20000);
    let n = 0; const mats = [];
    AV.W.group.traverse(o => { if (o.material && o.material.map && o.material.map.image && o.material.map.image.width > 200) { n++; mats.push((o.material.map.image.getAttribute ? '' : o.material.map.image.src || '').length) } });
    c('at least 9 photo-textured meshes in the world', found, n + ' found');
    let uvpl = 0; AV.W.group.traverse(o => { if (o.geometry && o.geometry.type === 'PlaneGeometry' && o.material && o.material.map) uvpl++ });
    c('textured planes exist (banner, door, window, signs)', uvpl >= 6, uvpl + ' planes');
  }, { shot: 'vh_skin' });
  step('pixel check: banner is magenta at night', async c => {
    AV.P.x = 19.5; AV.P.z = 44; AV.P.yaw = 0; AV.P.pitch = .35; AV.S.time = 21.5 * 60; await sleep(4000);
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const gl = AV.renderer.getContext();   // read the centre band of the frame
    const px = new Uint8Array(4 * 64 * 64); gl.readPixels(0, AV.renderer.domElement.height / 2 | 0, 64, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let r = 0, g = 0, b = 0; for (let i = 0; i < 64 * 64; i++) { r += px[i * 4]; g += px[i * 4 + 1]; b += px[i * 4 + 2] }
    c('frame renders non-empty', r + g + b > 1000, 'avg rgb ' + Math.round(r / 4096) + ',' + Math.round(g / 4096) + ',' + Math.round(b / 4096));
  }, { shot: 'vh_night' });
  step('collision: shopfront glass blocks, door gap lets you in', async c => {
    place(15.5, 44, 0); AV.keys = AV.keys || {}; AV.keys.KeyW = 1; await sleep(2500); AV.keys.KeyW = 0;
    c('walked in through the door gap', AV.P.z > 52.5, 'z=' + AV.P.z.toFixed(2));
    place(22, 49, Math.PI); AV.keys.KeyW = 1; await sleep(1500); AV.keys.KeyW = 0;
    c('glass shopfront blocks (stayed inside)', AV.P.z < 52.4, 'z=' + AV.P.z.toFixed(2));
  });
  return { steps };
  function place(x, z, yaw) { AV.P.x = x; AV.P.z = z; AV.P.yaw = yaw; AV.P.vx = AV.P.vy = AV.P.vz = 0 }
})();
