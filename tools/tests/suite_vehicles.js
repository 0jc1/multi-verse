/* Living Playground milestone 6: bicycles, scooters, e-scooters, hover scooter, tuk-tuk fares (run_tests.ps1 -Suite tools\tests\suite_vehicles.js -StepTimeout 900 [-Mobile]) */
window.APE_T = (() => {
  const steps = [], step = (name, fn, o) => steps.push(Object.assign({ name, fn }, o || {}));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const until = async (cond, max) => { const t0 = Date.now(); while (Date.now() - t0 < (max || 8000)) { try { if (cond()) return true } catch (e) { } await sleep(120) } return false };
  const $ = id => document.getElementById(id), lab = t => typeof t.label === 'function' ? t.label() : t.label;
  const settled = () => AV.W && $('fade').style.opacity === '0';
  const travel = async id => { AV.travel(id); return until(() => AV.W && AV.W.id === id && settled(), 90000) };
  const tgt = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(lab(t)));
  const at = t => { AV.P.x = t.x; AV.P.z = t.z; AV.P.y = AV.W.surface(t.x, t.z) || 0 };
  const ride = () => AV.act.cur && AV.act.cur.id === 'ride' ? AV.act.cur : null;
  const D = (s, secs, f, sd, run) => { for (let i = 0; i < secs * 60; i++) AV.veh._drive(s, 1 / 60, f, sd, run) };

  step('boot', async c => { $('gq').value = 'Low'; $('bNew').click(); c('game starts', await until(() => AV.W && AV.running, 30000)); await sleep(1500); AV.save = () => { }; AV.S.money = 300; c('Chiang Mai', await travel('chiang_mai')); c('no world error', !$('err').textContent, $('err').textContent) });

  step('bicycle: rent, pedal, brake, steer, bump, park, ride again, return', async c => {
    const t = tgt(/Rent a bicycle/); c('Old City bicycle hire stand', !!t, t && lab(t)); if (!t) return; at(t); const m0 = AV.S.money; t.fn();
    const s = ride(); c('riding a bicycle', s && s.rec.kind === 'bicycle', s && s.rec.kind); if (!s) return; c('15 credits paid', AV.S.money === m0 - 15, m0 - AV.S.money);
    c('core movement is driven by the bike', typeof AV.drive === 'function');
    s.v = 0; D(s, 6, 1, 0, false); c('pedalling reaches cruising speed (~22 km/h)', Math.abs(s.v - 6) < .3, (s.v * 3.6).toFixed(1) + ' km/h');
    D(s, 4, 1, 0, true); c('Shift = pedal hard (~30 km/h)', s.v > 7.5 && s.v <= 8.5, (s.v * 3.6).toFixed(1) + ' km/h');
    D(s, 1.5, -1, 0, false); c('brakes stop the bike', s.v <= .05 && s.v > -.3, s.v.toFixed(2)); D(s, 2, -1, 0, false); c('slow reverse (walk it back)', s.v < 0 && s.v >= -1.6, s.v.toFixed(2));
    s.v = 5; const y0 = AV.P.yaw; D(s, .5, 1, 1, false); c('D steers right, the bike leans', AV.P.yaw < y0 - .3 && s.lean < -.05, (AV.P.yaw - y0).toFixed(2) + ' rad, lean ' + s.lean.toFixed(2));
    s.v = 4; const p0 = [AV.P.x, AV.P.z]; c('rolls forward through the real movement code', await until(() => Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]) > .15, 60000), Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]).toFixed(2) + ' m');
    c('the bike follows you', s.o.mesh.position.distanceTo(new THREE.Vector3(AV.P.x, AV.P.y, AV.P.z)) < .6);
    s.v = 6; s.want = 1; s.lx = AV.P.x; s.lz = AV.P.z; AV.act._ff(1 / 60); c('hitting a wall: bonk, speed drops', s.bumps === 1 && Math.abs(s.v) < 2, s.bumps + ' / ' + s.v.toFixed(2));
    const rec = s.rec; $('actLeave').click(); c('get off: parked where you stopped', !ride() && !AV.drive && Math.hypot(rec.x - s.lx, rec.z - s.lz) < 1.5);
    const rt = tgt(/Ride your bicycle/); c('“Ride your bicycle” on the parked bike', !!rt); if (rt) { rt.fn(); c('back on the bike, no extra charge', ride() && ride().rec === rec && AV.S.money === m0 - 15); $('actLeave').click() }
    c('Leave gets off', !ride()); const st = AV.S.act.ride; c('rides + distance saved', st && st.rides >= 2 && st.by && st.by.bicycle >= 0, JSON.stringify(st));
    at(t); const back = tgt(/Return the bicycle/); c('return it at the stand', !!back); if (back) back.fn(); c('returned: gone from the street', !AV.veh.mine().length && !AV.veh.live().length);
  });

  step('hostel scooter + tuk-tuk fares + haggling', async c => {
    const t = tgt(/Rent a scooter for today/); c('Giant Hostel scooter counter', !!t); if (!t) return; at(t); const m0 = AV.S.money; t.fn();
    const s = ride(); c('riding a real scooter (no more 2x walking)', s && s.rec.kind === 'scooter' && AV.W.speedMul() === 1, s && s.rec.kind); if (!s) return; c('50 credits', AV.S.money === m0 - 50);
    s.v = 0; D(s, 8, 1, 0, false); c('scooter tops out ~45 km/h', Math.abs(s.v - 12.5) < .3, (s.v * 3.6).toFixed(0) + ' km/h');
    s.v = 0; const ox = AV.P.x, oz = AV.P.z; s.lx = ox; s.lz = oz; AV.P.x += 40; AV.act._ff(1 / 60); c('teleported away (portal, tuk-tuk…): the scooter stays put', !ride() && Math.hypot(s.rec.x - ox, s.rec.z - oz) < .5);
    AV.P.x = ox; AV.P.z = oz;
    const ST = [-5.5, 48.5]; AV.P.x = ST[0]; AV.P.z = ST[1]; const r0 = Math.random; Math.random = () => .1;
    AV.cm.tukPanel('hostel'); await sleep(200); const b = $('cmp').querySelector('[data-s="river"]'); c('destination shows distance + fare', /m · 55/.test(b.textContent), b.textContent);
    $('tukHaggle').click(); await sleep(200); Math.random = r0; const b2 = $('cmp').querySelector('[data-s="river"]'); c('haggled: 20% off (44)', /· 44/.test(b2.textContent) && !$('tukHaggle'), b2.textContent);
    const m1 = AV.S.money; b2.click(); await sleep(300); AV.cm.skipRide && AV.cm.skipRide(); await sleep(300); c('paid 44, arrived at the Ping River', AV.S.money === m1 - 44 && Math.hypot(AV.P.x - 252, AV.P.z - 22) < 3, (m1 - AV.S.money) + ' credits');
    const rec = AV.veh.mine()[0]; c('your scooter is still parked at the hostel', rec && rec.kind === 'scooter' && rec.x < 60);
    rec.until = AV.S.day - 1; c('after midnight the rental is collected', await until(() => !AV.veh.mine().length && !AV.veh.live().length, 90000));
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  step('Vienna city bikes + e-scooters, Ape Town free bikes, parked vehicles remembered', async c => {
    c('Vienna', await travel('vienna')); c('city bike station + e-scooters', !!tgt(/City bike station/) && !!tgt(/E-scooters/));
    const e = tgt(/E-scooters/); at(e); const m0 = AV.S.money; e.fn(); const s = ride(); c('e-scooter (6 credits)', s && s.rec.kind === 'escooter' && AV.S.money === m0 - 6); if (!s) return;
    s.v = 0; D(s, 6, 1, 0, true); c('e-scooter ~23 km/h, no boost', Math.abs(s.v - 6.5) < .3, (s.v * 3.6).toFixed(0)); $('actLeave').click();
    c('Ape Town', await travel('ape_town')); const f = tgt(/free community/); c('free community bikes', !!f, f && lab(f)); if (f) { at(f); const m1 = AV.S.money; f.fn(); c('free ride', ride() && AV.S.money === m1); $('actLeave').click() }
    c('back to Vienna', await travel('vienna')); c('your parked e-scooter is still there', !!tgt(/Ride your e-scooter/));
  });

  step('Astro-9 hover scooter, Da Nang scooters, Jungle Dub bamboo bikes', async c => {
    c('Astro-9', await travel('astro9')); const h = tgt(/Hover scooter/); c('hover scooter dock', !!h); if (h) { at(h); h.fn(); const s = ride(); c('hovering', s && s.rec.kind === 'hover');
      let z = null; for (let x = -40; x <= 40 && !z; x += 2) for (let y = -60; y <= 40; y += 2) if (AV.W.gravityAt(x, y) === 0) { z = [x, y]; break }
      if (s && z) { s.lx = z[0]; s.lz = z[1]; AV.P.x = z[0]; AV.P.z = z[1]; AV.act._ff(1 / 60); c('entering zero-g: you float off', !ride()) } }
    c('Da Nang', await travel('da_nang')); c('Bạch Đằng scooter rental', !!tgt(/scooter rental/i));
    c('Jungle Dub', await travel('jungle_dub')); c('bamboo bike rack', !!tgt(/Bamboo bike/));
    c('no JS errors', !$('err').textContent, $('err').textContent);
  });

  step('phone: joystick riding, BELL button, Leave', async c => {
    $('gq').value = 'Low'; $('bNew').click(); await until(() => AV.W && AV.running, 30000); await sleep(1500); AV.save = () => { };
    c('Jungle Dub', await travel('jungle_dub')); const t = tgt(/Bamboo bike/); c('bamboo bikes', !!t); if (!t) return; at(t); t.fn(); const s = ride(); c('riding', !!s); if (!s) return;
    c('BELL + Leave buttons', getComputedStyle($('actGo')).display === 'block' && /BELL/.test($('actGo').textContent) && getComputedStyle($('actExit')).display === 'block', $('actGo').textContent);
    AV.T.y = -1; s.v = 3; const p0 = [AV.P.x, AV.P.z]; c('joystick up rides forward', await until(() => Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]) > .1 && s.v > 2.9, 240000), JSON.stringify({ moved: Math.hypot(AV.P.x - p0[0], AV.P.z - p0[1]).toFixed(2), v: s.v.toFixed(2), bumps: s.bumps, Ty: AV.T.y, yaw: AV.P.yaw.toFixed(2), p: [AV.P.x.toFixed(1), AV.P.z.toFixed(1)] })); AV.T.y = 0;
    $('actExit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); c('Leave = get off', !ride() && !AV.drive);
  }, { mobile: true, shot: 'ride_phone' });

  let active = [];
  return { names(mobile) { active = steps.filter(s => !!s.mobile === !!mobile || s.name === 'boot'); return active.map(s => s.name) },
    async exec(i) { const s = active[i], checks = [], c = (n, pass, d) => checks.push({ n: s.name + ': ' + n, pass: !!pass, d: d == null ? '' : String(d) }); try { await s.fn(c) } catch (e) { checks.push({ n: s.name + ': exception', pass: false, d: String(e && e.stack || e).slice(0, 400) }) } return { checks, shot: s.shot || null } } };
})();
