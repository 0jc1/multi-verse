/* APEVERSE V0.9 - world_verdalux.js : legacy V0.8 jungle moon, rebuilt as a registry world.
   Glow-trees grow while you are away (S.grow), Grakk keeps the Drum Log (12 credits per day, V0.8 rule preserved). */
'use strict';
(function (AV) {
const tr = AV.tr, G = AV.G, std = AV.std, TAU = AV.TAU;
/* AV.terrain (shared heightfield) now lives in js/world_kit.js */
AV.registerWorld({
  id: 'verdalux',
  build(ctx) {
    const mk = ctx.mk, rng = ctx.rng, S = AV.S, R = 56;
    const H = (x, z) => { const d = Math.hypot(x, z), k = Math.min(1, d / 14); return (Math.sin(x * .09) * Math.cos(z * .11) * 2.2 + Math.sin(x * .21 + z * .17) * .5) * k };
    AV.terrain(ctx, 130, 110, H, (x, z, h) => { const n = Math.sin(x * .7) * Math.cos(z * .6); return h > 1.4 ? 0x2a6a4a : h < -1 ? 0x164a3a : (n > .5 ? 0x1f5a44 : 0x236a4a) });
    const glowMat = [0x38e8a0, 0xff7ad8, 0x7ab8ff].map(c => std(0x102a22, .5, 0, c, 1.0));
    const HUMS = [['A low green hum, like a cat purring through moss.', 'Un zumbido verde y grave, como un gato ronroneando entre el musgo.'], ['Pink crackles. You’re fairly sure the tree is gossiping about Grakk.', 'Chasquidos rosas. Estás casi seguro de que el árbol chismorrea sobre Grakk.'], ['A slow blue chord. It sounds like the moon breathing out.', 'Un acorde azul y lento. Suena como la luna soltando el aire.'], ['The leaves tick in time with your heartbeat, then politely slow it down.', 'Las hojas laten al ritmo de tu corazón y luego, con educación, lo calman.']];
    const tree = (x, z, s, k, id) => { const y = H(x, z); mk(G.cyl, std(0x4a3a5a, .9), x, y + 2.2 * s, z, .3 * s, 4.4 * s, .3 * s); mk(G.ico, glowMat[k % 3], x, y + 5 * s, z, 1.8 * s, 1.5 * s, 1.8 * s, false); const l = new THREE.PointLight([0x38e8a0, 0xff7ad8, 0x7ab8ff][k % 3], .9, 12); l.position.set(x, y + 4, z); ctx.group.add(l); ctx.circles.push([x, z, .5 * s]);
      ctx.T.push({ x, z, r: 2.6, label: () => tr('Listen to the glow-tree', 'Escuchar al árbol luminoso'), fn: () => { const h = HUMS[id % HUMS.length]; AV.audio && AV.audio.blip([392, 523, 659][k % 3], .5, 'sine', .12); AV.dlg && AV.dlg.event('glow_tree'); if (AV.quests) AV.quests.mark('glow_listen', 't' + id, tr(h[0], h[1])); else AV.toast(tr(h[0], h[1])) } }) };
    const fixed = [[-14, -6], [12, -10], [-6, 14], [18, 8], [-20, 10], [6, -20], [-12, -22], [24, -4]];
    fixed.slice(0, 4).forEach((p, i) => tree(p[0], p[1], 1.1 + i * .05, i, i));   // four fixed glow-trees keep the point-light count sane
    for (let i = 0; i < Math.min(S.grow, 4); i++) tree(fixed[4 + i][0], fixed[4 + i][1], .8 + i * .1, i + 1, 4 + i);
    for (let i = 0; i < 30 * (ctx.q + 1); i++) { const a = rng() * TAU, r = 12 + rng() * 40, x = Math.cos(a) * r, z = Math.sin(a) * r, y = H(x, z), c = glowMat[i % 3]; mk(G.cyl, std(0xcfc8e8, .8), x, y + .25, z, .06, .5, .06, false); mk(G.sph, c, x, y + .55, z, .25, .14, .25, false) }
    for (let i = 0; i < 24 * (ctx.q + 1); i++) { const a = rng() * TAU, r = 20 + rng() * 34, x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - 2, z + 2) < 8) continue; const s = .7 + rng(); mk(G.cyl, std(0x3a2a4a, .9), x, H(x, z) + 3 * s, z, .3 * s, 6 * s, .3 * s); mk(G.ico, std(0x1f6a4a, .8), x, H(x, z) + 6.5 * s, z, 2 * s, 1.2 * s, 2 * s); ctx.circles.push([x, z, .45 * s]) }
    /* Drum Log + Grakk */
    const dl = { x: 2, z: -2 }, dy = H(dl.x, dl.z); const log = mk(G.cyl, std(0x6a4a2a, .8), dl.x, dy + .6, dl.z, .9, 1.2, .9); ctx.circles.push([dl.x, dl.z, 1.1]); const top = mk(G.cyl, std(0xe8c890, .6), dl.x, dy + 1.22, dl.z, .85, .05, .85, false); let hit = 0;
    AV.npc.spawn(ctx, 'grk', { x: -2.5, z: -3, yaw: Math.PI / 3, scale: 1.25, H, r: 3.5 });
    /* Vela tends the glow-trees on a slow loop; Old Tuk keeps his logbook beside the portal gate */
    AV.npc.spawn(ctx, 'vela', { x: -11, z: -4, yaw: 0, H, r: 3, speed: .8, path: [[-11, -4, 5], [-4, -10, 2], [9, -8, 4], [14, 4, 3], [-3, 11, 4]] });
    AV.npc.spawn(ctx, 'tuk', { x: 5.5, z: 26, yaw: Math.atan2(-5.5, -26), H, r: 3 });
    ctx.upd.push((dt, t) => { hit = Math.max(0, hit - dt * 4); top.scale.set(.85 + hit * .06, .05, .85 + hit * .06); top.material = hit > .1 ? std(0xffe08a, .4, 0, 0xffc040, 1.4) : std(0xe8c890, .6) });
    /* V0.9.1 ambience: glowing spores + bioluminescent mushrooms */
    const K = AV.kit; K.motes(ctx, { n: 90, x: 0, z: 0, r: 40, y0: .5, y1: 5, cols: [0x38e8a0, 0xff7ad8, 0x7ab8ff], size: 3, H, alpha: .9 });
    K.field(ctx, K.species.mushroom(0x38e8a0, 0xcfe8d8, 0xb8ffe0), K.floraMat(0), K.n(26), { r0: 8, r1: 46 }, { H, s0: .6, s1: 1.6, ok: (x, z) => Math.hypot(x - 2, z + 2) > 6 && Math.hypot(x, z - 30) > 5 });
    K.field(ctx, K.species.fern(0x1f8a5a), K.floraMat(.05, { double: true }), K.n(36), { r0: 6, r1: 50 }, { H, s0: .8, s1: 1.8, ok: (x, z) => Math.hypot(x - 2, z + 2) > 5 && Math.hypot(x, z - 30) > 5 });
    ctx.T.push({ x: dl.x, z: dl.z, r: 2.8, label: () => tr('Play the Drum Log', 'Tocar el Tronco-Tambor'), fn: () => {
      const G2 = S.mem.grk; hit = 1; try { const A = AV.audio; if (A && A.ok) { [0, .18, .36, .5, .72].forEach((o, i) => setTimeout(() => A.blip(i % 2 ? 160 : 90, .25, 'sine', .5), o * 1000)) } } catch (e) { }
      G2.drums++; AV.dlg && AV.dlg.event('drum'); if (S.drumDay !== S.day) { S.drumDay = S.day; AV.txn(12, 'Played the Drum Log') } else AV.toast(tr('The moss is full for today. Play for fun!', 'El musgo ya pagó hoy. ¡Toca por diversión!')); AV.save() } });
    /* return gate */
    const gz = 30, gy = H(0, gz); for (const s of [-1, 1]) mk(G.cyl, std(0x58506a, .8), s * 2, gy + 2, gz, .35, 4, .35); mk(G.tor, std(0x38e8a0, .4, 0, 0x38e8a0, 1), 0, gy + 2.2, gz, 2.2, 2.2, 2.2, false);
    ctx.circles.push([-2, gz, .5], [2, gz, .5]); ctx.sign && 0;
    ctx.T.push({ x: 0, z: gz - 2, r: 3, label: () => tr('Portal gate: back to Ape Town', 'Portal: volver a Ape Town'), fn: () => AV.travel('ape_town', 'verdalux') });
    return { name: 'Verdalux', surface: (x, z) => Math.hypot(x, z * 1) < R ? H(x, z) : null, fog: [18, 120], sky: { fixed: { bg: 0x120a30, fog: 0x2a1650, sun: .3, hs: .8, stars: 1, night: 1 }, dome: { s1: 0x38e8a0, s2: 0x7a5cff, swirl: .45, cloud: .5 } },
      arrivals: { default: { x: 0, z: 24, yaw: 0 }, pipe: { x: 3, z: 20, yaw: 0 }, ape_gate: { x: 0, z: 25, yaw: 0 } },
      places: [{ id: 'drum', name: ['Drum Log', 'Tronco-Tambor'], x: 2, z: 3, yaw: 0 }, { id: 'grove', name: ['Glow-tree grove', 'Arboleda luminosa'], x: -8, z: 2, yaw: Math.PI / 4 }, { id: 'gate', name: ['Portal gate', 'Puerta del portal'], x: 0, z: 25, yaw: 0 }], defaultArrival: 'default', musicProfile: { bpm: 70, root: 48, scale: [0, 2, 4, 7, 9], style: 'amb' }, stage: { pos: { x: 2, y: 2, z: -2 } } };
  }
});
})(window.AV);
