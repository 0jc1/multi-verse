/* APEVERSE 2 NEW WORLDS - world_tokyo.js : TOKYO (present day), district 1 = SHIBUYA, linked to a small HARAJUKU area.  1 m = 1 m, north is -z.
   Built from the owner's illustrated "Apeverse Tokyo: Tradition Meets Futurism" map (mood / POI reference only), not a survey of the city.
     Shibuya: the scramble crossing (x 0, z 0) with three giant screens on the corner towers, the station + Haru plaza (east), Center Gai
     (pedestrian shopping lane, west), the Udagawa back alley, a back street with power lines, a south alley up to an Inari shrine grove,
     Chōchin Yokochō (lantern alley: wooden izakaya huts facing bars in the railway arches) and the elevated Loop Line viaduct.
     Harajuku (north, 450 m up the avenue or 1 stop on the Loop Line): the timbered station, Takeshita Street, the forest shrine torii.
   Architecture kit: narrow "pencil" buildings (tile, glass curtain wall, balcony and concrete fronts), vertical blade signs in Japanese,
   lit fascias, roof billboards and water tanks, AC units, vending machines, utility poles with wires, wooden yokochō huts with red
   lanterns.  Every business and brand is fictional; landmarks (the crossing, stations, streets) are public places.
   Shared-system use only (kit, city crowd, rides, shop, talk, garage, transit, festivals): see tokyo_life.js.  AV.tokyo (debug + tests) */
'use strict';
(function (AV) {
const TAU = Math.PI * 2, PI = Math.PI;
const TKY = AV.tokyo = { stats: {} };
const XMIN = -202, XMAX = 120, ZMIN = -562, ZMAX = 190, DECK = 8, TRACK = [104, 110];
/* walkable: the whole rectangle, except the forest edge north of Harajuku (only the shrine forest itself) and the viaduct strip */
function surf(x, z) { if (TKY.asSurf) { const s2 = TKY.asSurf(x, z); if (s2 !== undefined) return s2 } if (x < XMIN || x > XMAX || z < ZMIN || z > ZMAX) return null; if (z < -482 && (x < -60 || x > 60)) return null; return 0 }
TKY.surf = surf; TKY.DECK = DECK; TKY.TRACK = TRACK;

/* ======================= sign atlas (Japanese shop signs, all fictional businesses) ======================= */
const SG = { r: {} };
const fit = (g, t, w, px, fam, y, x) => { let n = px; do { g.font = fam.replace('#', n); n -= 2 } while (g.measureText(t).width > w && n > 9); g.fillText(t, x, y) };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath() };
const JP = '"Yu Gothic", "Meiryo", "Hiragino Sans", "Noto Sans JP", "Noto Sans CJK JP", sans-serif', JPM = '"Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", "MS Mincho", serif';
/* horizontal fascia: big Japanese name + a Latin subline */
const fas = (jp, en, bg, fg, ac, o) => (g, w, h) => { o = o || {}; if (o.grad) { const gr = g.createLinearGradient(0, 0, w, 0); o.grad.forEach((c, i) => gr.addColorStop(i / (o.grad.length - 1), c)); g.fillStyle = gr } else g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (o.frame) { g.strokeStyle = o.frame; g.lineWidth = 6; g.strokeRect(7, 7, w - 14, h - 14) } if (o.bar !== false) { g.fillStyle = ac; g.fillRect(0, h - 9, w, 9) }
  g.textAlign = 'center'; g.textBaseline = 'middle'; if (o.neon) { g.shadowColor = o.neon; g.shadowBlur = 16 } g.fillStyle = fg; fit(g, jp, w - 40, h * .52, (o.font || '900 #px ') + (o.serif ? JPM : JP), h * .4, w / 2);
  g.fillStyle = o.subc || ac; fit(g, en, w - 50, h * .2, '700 #px Arial, sans-serif', h * .8, w / 2); g.shadowBlur = 0 };
/* vertical blade sign (tategaki): characters stacked top to bottom */
const vert = (txt, bg, fg, bd, o) => (g, w, h) => { o = o || {}; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = bd; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8);
  const ch = [...txt], n = ch.length, s = Math.min(w * .74, (h - 24) / n * .9); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; if (o.neon) { g.shadowColor = o.neon; g.shadowBlur = 12 }
  g.font = '900 ' + Math.floor(s) + 'px ' + (o.serif ? JPM : JP); ch.forEach((c, i) => g.fillText(c, w / 2, 12 + (h - 24) * (i + .5) / n)); g.shadowBlur = 0 };
/* noren / small cloth or yatai sign */
const noren = (jp, bg, fg) => (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.35)'; for (let x = w / 3; x < w - 2; x += w / 3) g.fillRect(x - 2, h * .45, 4, h * .55); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, jp, w - 24, h * .5, '900 #px ' + JPM, h * .36, w / 2) };
const bill = (top, sub, c1, c2, fg) => (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w * (.15 + i * .16), h * (.3 + (i % 2) * .4), h * .3, 0, TAU); g.fill() }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 8; fit(g, top, w - 40, h * .42, '900 #px Arial Black, Arial, sans-serif', h * .4, w / 2); fit(g, sub, w - 40, h * .2, '700 #px ' + JP, h * .78, w / 2); g.shadowBlur = 0 };
const SIGNS = [
  /* the businesses you can use */
  ['apemart', 640, 128, (g, w, h) => { g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4ab8'; g.fillRect(0, 0, w, 26); g.fillStyle = '#d82a2a'; g.fillRect(0, h - 22, w, 22); g.fillStyle = '#1f4ab8'; g.textAlign = 'left'; g.textBaseline = 'middle'; fit(g, 'ApeMart Express', w - 200, 50, '900 #px Arial, sans-serif', 66, 20); g.fillStyle = '#d82a2a'; fit(g, 'エイプマート', 170, 34, '900 #px ' + JP, 66, w - 180); g.fillStyle = '#fff'; fit(g, '24h · 渋谷センター街店', w - 40, 16, '700 #px ' + JP, h - 11, 20) }],
  ['ramen', 640, 128, fas('ラーメン 雷', 'RAMEN KAMINARI · tonkotsu · gyōza', '#1a1a1a', '#f4f0e0', '#d82a2a', { serif: true, frame: '#d82a2a', bar: false })],
  ['kissa', 640, 128, fas('ジャズ喫茶 黒猫', 'JAZZ KISSA KURONEKO · records · coffee', '#2a1c14', '#f2d9a0', '#c8a040', { serif: true, frame: '#c8a040', bar: false, font: '700 #px ' })],
  ['livehouse', 640, 128, fas('SPACE NEKO', 'LIVE HOUSE · B1 · ライブハウス · DJ late', '#0c0a18', '#ff7ad8', '#4ad8ff', { neon: '#ff4ab0', subc: '#9ae8ff' })],
  ['arcade', 640, 128, fas('バナナゾーン', 'GAME CENTER BANANA ZONE · UFO catcher · rhythm', '#1a0a3a', '#ffe14a', '#ff4ad2', { neon: '#ffb000', grad: ['#2a0a5a', '#0a1a5a'] })],
  ['karaoke', 640, 128, fas('カラオケ 歌宴', 'KARAOKE UTAGE · 24h · private rooms', '#d81a6a', '#ffffff', '#ffe14a', { neon: '#ff9ad8' })],
  ['records', 640, 128, fas('GROOVE DEALERS', 'RECORDS 渋谷 · レコード · vinyl · 中古', '#8a1a1a', '#f4e0a8', '#f4e0a8', { serif: true, frame: '#f4e0a8', bar: false })],
  ['izakaya', 448, 112, fas('居酒屋 提灯', 'IZAKAYA CHŌCHIN', '#3a1a10', '#f4e8d0', '#d82a2a', { serif: true })],
  ['yakitori', 448, 112, fas('焼き鳥 とり吉', 'YAKITORI TORIKICHI', '#1a1a1a', '#ffd84a', '#d82a2a', { serif: true })],
  ['oden', 448, 112, fas('おでん 灯', 'ODEN AKARI · 熱燗', '#f4ead0', '#3a1a10', '#8a2a1a', { serif: true })],
  ['sushi', 640, 128, fas('回転寿司 夕暮れ', 'KAITEN SUSHI YŪGURE', '#f4f4f0', '#1a2a6a', '#d82a2a', { serif: true })],
  ['cycle', 640, 128, fas('さくらサイクル', 'SAKURA CYCLE · rental · ママチャリ', '#ffe8f0', '#c82a6a', '#3a8a3a')],
  ['sento', 640, 128, fas('銭湯 松の湯', 'SENTŌ MATSU-NO-YU · ゆ · public bath', '#1a3a6a', '#ffffff', '#f2c230', { serif: true })],
  ['crepe', 448, 112, fas('モモ クレープ', 'MOMO CRÊPES', '#ffd8e8', '#d82a7a', '#7a3ad8')],
  ['taiyaki', 448, 112, fas('たい焼き 鯛屋', 'TAIYAKI TAIYA · 焼きたて', '#f2c230', '#5a2a0a', '#d82a2a', { serif: true })],
  ['apephone', 640, 128, fas('ApePhone', 'ApePhone Store Tokyo · エイプフォン 渋谷', '#f4f4f6', '#1a1a1a', '#2a7ae8', { font: '300 #px ' })],
  ['kawaii', 640, 128, fas('カワイイ クレープ', 'KAWAII CRÊPE HARAJUKU', '#ff9ad8', '#ffffff', '#7a3ad8', { neon: '#ff4ab0', grad: ['#ff9ad8', '#9ad8ff'] })],
  ['candy', 640, 128, fas('にじ わたあめ', 'RAINBOW CANDY FLOSS', '#ffffff', '#ff4ab0', '#4ad8ff', { grad: ['#ffd8f0', '#d8f0ff', '#f0ffd8'] })],
  ['vintage', 640, 128, fas('古着 ウラ', 'URA VINTAGE · 古着 · used clothing', '#2a2a2a', '#f4d84a', '#f4d84a', { serif: true })],
  ['purikura', 640, 128, fas('プリクラ さくら', 'PURIKURA SAKURA · photo stickers', '#ffe8f4', '#e82a8a', '#ffb0d8', { grad: ['#fff0f8', '#ffd8ec'] })],
  ['swag', 640, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#5a2a8a'); gr.addColorStop(.5, '#a83aa8'); gr.addColorStop(1, '#ff5ab0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f4ead0'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'SWAG', w - 300, 78, '900 #px Arial Black, Arial, sans-serif', 54, w / 2); fit(g, 'TOKYO 原宿 · streetwear', w - 80, 22, '700 #px ' + JP, 106, w / 2) }],
  /* landmarks and street furniture */
  ['st_shibuya', 1024, 128, (g, w, h) => { g.fillStyle = '#1a1a1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#3aa84a'; g.fillRect(0, h - 14, w, 14); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, '渋谷  SHIBUYA  STATION', w - 80, 72, '900 #px ' + JP, 58, w / 2) }],
  ['st_harajuku', 1024, 128, (g, w, h) => { g.fillStyle = '#f4f0e4'; g.fillRect(0, 0, w, h); g.fillStyle = '#3aa84a'; g.fillRect(0, h - 14, w, 14); g.fillStyle = '#2a1a10'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, '原宿  HARAJUKU', w - 80, 72, '900 #px ' + JPM, 58, w / 2) }],
  ['centergai', 1024, 160, (g, w, h) => { g.fillStyle = '#0e1a3a'; g.fillRect(0, 0, w, h); g.shadowColor = '#ffd84a'; g.shadowBlur = 14; g.fillStyle = '#ffe88a'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, 'センター街', w - 80, 84, '900 #px ' + JP, 62, w / 2); g.shadowColor = '#4ad8ff'; g.fillStyle = '#9ae8ff'; fit(g, 'CENTER GAI · SHIBUYA', w - 120, 30, '800 #px Arial, sans-serif', 128, w / 2); g.shadowBlur = 0 }],
  ['takeshita', 1024, 160, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#ff9ad8', '#ffe14a', '#9ae8ff', '#c89aff'].forEach((c, i) => gr.addColorStop(i / 3, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.strokeStyle = '#d82a8a'; g.lineWidth = 8; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 78px ' + JP; g.strokeText('竹下通り', w / 2, 62); g.fillText('竹下通り', w / 2, 62); g.fillStyle = '#7a1a5a'; fit(g, 'TAKESHITA STREET · HARAJUKU', w - 120, 30, '900 #px Arial, sans-serif', 128, w / 2) }],
  ['yokocho', 640, 128, (g, w, h) => { g.fillStyle = '#3a1a10'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff6a3a'; for (let i = 0; i < 2; i++) { g.beginPath(); g.ellipse(48 + i * (w - 96), h / 2, 26, 38, 0, 0, TAU); g.fill() } g.fillStyle = '#f4e0b0'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, '提灯横丁', w - 200, 64, '900 #px ' + JPM, 52, w / 2); fit(g, 'CHŌCHIN YOKOCHŌ', w - 200, 22, '700 #px Arial, sans-serif', 104, w / 2) }],
  ['loop', 256, 384, (g, w, h) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, w, h); g.fillStyle = '#3aa84a'; g.fillRect(0, 0, w, 110); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 46px ' + JP; g.fillText('環状線', w / 2, 40); g.font = 'bold 26px Arial'; g.fillText('LOOP LINE', w / 2, 86); g.fillStyle = '#1a1a1a'; g.font = 'bold 28px ' + JP; g.fillText('渋谷 Shibuya', w / 2, 170); g.fillText('↓', w / 2, 212); g.fillText('原宿 Harajuku', w / 2, 254); g.font = '22px Arial'; g.fillText('every 4 min · 2 cr', w / 2, 330) }],
  ['haru', 256, 112, (g, w, h) => { g.fillStyle = '#5a4a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8a860'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#f0dca0'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, '忠猿ハル像', w - 30, 38, '900 #px ' + JPM, 40, w / 2); fit(g, 'HARU, THE LOYAL APE', w - 30, 18, '700 #px Georgia, serif', 84, w / 2) }],
  ['inari', 128, 320, vert('稲荷神社', '#1a1a1a', '#f2d23a', '#c8a040', { serif: true })],
  ['jingu', 128, 320, vert('森の宮', '#2a1a10', '#f4e8c8', '#c8a040', { serif: true })],
  ['matsuri', 1024, 160, (g, w, h) => { g.fillStyle = '#1a1a3a'; g.fillRect(0, 0, w, h); for (let x = 30; x < w; x += 64) { g.fillStyle = (x / 64 | 0) % 2 ? '#ff5a3a' : '#ffe8c8'; g.beginPath(); g.ellipse(x, 22, 14, 18, 0, 0, TAU); g.fill() } g.fillStyle = '#ffe8c8'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, '渋谷 盆踊り 夏祭り', w - 120, 62, '900 #px ' + JPM, 86, w / 2); g.fillStyle = '#ffb06a'; fit(g, 'SHIBUYA BON ODORI MATSURI · every Friday', w - 160, 24, '800 #px Arial, sans-serif', 136, w / 2) }],
  ['y_yakisoba', 256, 96, noren('やきそば', '#d82a2a', '#ffffff')], ['y_takoyaki', 256, 96, noren('たこ焼き', '#1a3a8a', '#ffffff')], ['y_kakigori', 256, 96, noren('かき氷', '#ffffff', '#1a5ad8')], ['y_kingyo', 256, 96, noren('金魚すくい', '#ff8a2a', '#1a1a1a')], ['y_wanage', 256, 96, noren('輪投げ', '#3a8a3a', '#ffffff')],
  ['n_sake', 160, 96, noren('酒', '#1a2a4a', '#ffffff')], ['n_tori', 160, 96, noren('焼鳥', '#d82a2a', '#ffffff')], ['n_oden', 160, 96, noren('おでん', '#f4ead0', '#3a1a10')], ['n_ramen', 160, 96, noren('らーめん', '#1a1a1a', '#f2c230')],
  ['vend', 128, 224, (g, w, h) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.fillRect(8, 8, w - 16, 120); const C = ['#d82a2a', '#2a8a3a', '#f2c230', '#2a5ad8', '#8a4a2a', '#ff8ac8', '#4ad8d8', '#e8e8e8']; for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { g.fillStyle = C[(r * 3 + i) % 8]; rr(g, 14 + i * 26, 16 + r * 38, 18, 30, 5); g.fill(); g.fillStyle = '#7aff7a'; g.fillRect(16 + i * 26, 48 + r * 38, 14, 3) } g.fillStyle = '#d8d8d8'; g.fillRect(20, 150, w - 40, 26); g.fillStyle = '#1a1a1a'; g.fillRect(40, 186, w - 80, 22); g.fillStyle = '#2a5ad8'; g.font = 'bold 15px ' + JP; g.textAlign = 'center'; g.fillText('つめた〜い', w / 2, 166) }],
  ['vend2', 128, 224, (g, w, h) => { g.fillStyle = '#d82a2a'; g.fillRect(0, 0, w, h); g.fillStyle = '#101010'; g.fillRect(8, 8, w - 16, 120); const C = ['#f4f4f4', '#f2c230', '#5a3a1a', '#3aa84a', '#2a5ad8', '#ff8a2a']; for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { g.fillStyle = C[(r + i * 2) % 6]; rr(g, 14 + i * 26, 16 + r * 38, 18, 30, 5); g.fill(); g.fillStyle = '#ff5a5a'; g.fillRect(16 + i * 26, 48 + r * 38, 14, 3) } g.fillStyle = '#f4f4f4'; g.font = 'bold 15px ' + JP; g.textAlign = 'center'; g.fillText('あったか〜い', w / 2, 166); g.fillStyle = '#1a1a1a'; g.fillRect(40, 186, w - 80, 22) }],
  ['w_konbini', 256, 160, (g, w, h) => { g.fillStyle = '#f8f8f4'; g.fillRect(0, 0, w, h); for (let r = 0; r < 3; r++) { g.fillStyle = '#b8bcc0'; g.fillRect(0, 46 + r * 50, w, 4); for (let i = 0; i < 11; i++) { g.fillStyle = ['#d82a2a', '#2a6ad8', '#3aa85a', '#f2c230', '#8a4ad8', '#ff8a3a', '#1a1a1a'][(i * 3 + r) % 7]; g.fillRect(6 + i * 23, 18 + r * 50, 16, 28) } } }],
  ['w_fashion', 256, 160, (g, w, h) => { g.fillStyle = '#f4f0ea'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = ['#ff4ab0', '#1a1a1a', '#4ad8ff', '#ffe14a', '#8a4ad8'][i]; g.beginPath(); g.moveTo(26 + i * 50, 30); g.lineTo(46 + i * 50, 30); g.lineTo(54 + i * 50, 120); g.lineTo(18 + i * 50, 120); g.fill(); g.fillStyle = '#e0c8a8'; g.beginPath(); g.arc(36 + i * 50, 20, 9, 0, TAU); g.fill() } }],
  ['w_food', 256, 160, (g, w, h) => { g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { const x = 18 + (i % 4) * 60, y = 28 + (i >> 2) * 70; g.fillStyle = '#f4f0e8'; g.beginPath(); g.ellipse(x + 12, y + 22, 26, 14, 0, 0, TAU); g.fill(); g.fillStyle = ['#e8a050', '#d84a2a', '#f4d870', '#7a4a2a'][i % 4]; g.beginPath(); g.ellipse(x + 12, y + 18, 18, 9, 0, 0, TAU); g.fill(); g.fillStyle = '#f4f4f4'; g.font = 'bold 13px Arial'; g.fillText('¥' + (680 + i * 120), x - 4, y + 48) } }],
  ['poster_live', 256, 384, (g, w, h) => { g.fillStyle = '#0c0a18'; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, 150, 10, w / 2, 150, 140); gr.addColorStop(0, '#ff4ab0'); gr.addColorStop(1, 'rgba(12,10,24,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, 300); g.fillStyle = '#ffe14a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 34px Arial Black, Arial'; g.fillText('TONIGHT', w / 2, 40); g.fillStyle = '#fff'; g.font = '900 30px Arial'; g.fillText('STONE APE', w / 2, 230); g.fillText('BAND', w / 2, 264); g.fillStyle = '#9ae8ff'; g.font = 'bold 20px ' + JP; g.fillText('19:00 開演 · ¥15', w / 2, 310); g.fillText('DJ YUMI 23:00 →', w / 2, 344) }],
  ['menu_ramen', 256, 256, (g, w, h) => { g.fillStyle = '#f4ead0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = '900 30px ' + JPM; g.fillText('食券機', 20, 30); g.font = 'bold 20px ' + JP; ['とんこつ ¥9', '味玉 +¥1', '餃子 ¥5', 'ビール ¥6'].forEach((t, i) => { g.fillStyle = ['#d82a2a', '#f2c230', '#3a8a3a', '#2a5ad8'][i]; g.fillRect(20, 66 + i * 44, 40, 34); g.fillStyle = '#1a1a1a'; g.fillText(t, 72, 83 + i * 44) }) }],
  /* rooftop billboards: Apeverse brands (fictional) */
  ['b_zton', 512, 192, bill('ZtonedApe', '新作アルバム · NEW ALBUM OUT NOW', '#3a0a5a', '#ff4ab0', '#ffffff')],
  ['b_moon', 512, 192, bill('MOONMELT', 'ムーンメルト · cosmic sportswear', '#0a1a3a', '#4ad8ff', '#ffffff')],
  ['b_puff', 512, 192, bill('PuffPop', 'パフポップ ソーダ · 新フレーバー', '#ff8a2a', '#ffe14a', '#3a0a3a')],
  ['b_sol', 512, 192, bill('SOLTERRA', 'ソルテラ · living for every planet', '#c8572e', '#f4ead8', '#ffffff')],
  ['b_phone', 512, 192, bill('ApePhone 9', 'エイプフォン · 9 lenses, 1 banana', '#1a1a1a', '#5a5a6a', '#ffffff')],
  ['b_groove', 512, 192, bill('GROOVE DEALERS', 'グルーヴ・ディーラーズ · live tour', '#8a1a1a', '#ffb04a', '#ffffff')],
  /* ground-floor shops that dress the streets (not every door is a business you can use) */
  ['g_drug', 448, 104, fas('ドラッグストア', 'DRUGSTORE · 薬 · cosmetics', '#ffe14a', '#d82a2a', '#d82a2a')],
  ['g_gyudon', 448, 104, fas('牛丼 まつや', 'GYŪDON · 24h', '#f28a1a', '#ffffff', '#1a1a1a')],
  ['g_curry', 448, 104, fas('カレーハウス', 'CURRY HOUSE · 辛さ5段階', '#f2c230', '#5a2a0a', '#5a2a0a')],
  ['g_cafe', 448, 104, fas('喫茶 ひだまり', 'KISSATEN · coffee · toast', '#3a2a1e', '#f4e0b0', '#c8a040', { serif: true })],
  ['g_book', 448, 104, fas('本屋 ことの葉', 'BOOKS · manga · magazines', '#1f3a2a', '#f4f0e0', '#c8a040', { serif: true })],
  ['g_shoes', 448, 104, fas('スニーカー', 'SNEAKERS · limited', '#1a1a1a', '#ffffff', '#ff4a2a')],
  ['g_100', 448, 104, fas('100円ショップ', '100 YEN SHOP · everything', '#e82a6a', '#ffffff', '#ffe14a')],
  ['g_hair', 448, 104, fas('美容室 hana', 'HAIR SALON · cut · color', '#f4f0f0', '#4a4a4a', '#c82a6a', { font: '300 #px ' })],
  ['g_udon', 448, 104, fas('うどん 一本', 'UDON IPPON · 手打ち', '#f4ead8', '#2a1a10', '#2a1a10', { serif: true })],
  ['g_tonkatsu', 448, 104, fas('とんかつ 勝', 'TONKATSU KATSU', '#1a1a1a', '#f2c230', '#f2c230', { serif: true })],
  ['g_camera', 448, 104, fas('カメラ 中古', 'USED CAMERAS · film', '#1a2a4a', '#ffffff', '#f2c230')],
  ['g_manga', 448, 104, fas('まんが喫茶', 'MANGA CAFÉ · 24h · booths', '#2a8ad8', '#ffffff', '#ffe14a')],
  ['g_bar', 448, 104, fas('BAR 月光', 'BAR GEKKŌ · whisky · 2F', '#0a0a14', '#c8d8ff', '#8a9aff', { neon: '#4a6aff' })],
  ['g_phone', 448, 104, fas('スマホ修理', 'PHONE REPAIR · 30 min', '#ffffff', '#1a5ad8', '#1a5ad8')],
  ['g_yakiniku', 448, 104, fas('焼肉 炎', 'YAKINIKU HOMURA', '#1a0a0a', '#ff6a2a', '#ff6a2a', { serif: true })],
  ['g_dessert', 448, 104, fas('パフェ ミルキー', 'PARFAIT MILKY · 2F', '#fff0f8', '#e84a9a', '#9a6ad8')],
  /* vertical blade signs */
  ['v_karaoke', 80, 384, vert('カラオケ', '#d81a6a', '#ffffff', '#ffe14a', { neon: '#ff9ad8' })], ['v_ramen', 80, 384, vert('ラーメン', '#1a1a1a', '#ffd84a', '#d82a2a')],
  ['v_izakaya', 80, 384, vert('居酒屋', '#8a1a1a', '#ffffff', '#f2c230', { serif: true })], ['v_yakiniku', 80, 384, vert('焼肉', '#1a0a0a', '#ff6a2a', '#ff6a2a', { serif: true })],
  ['v_bar', 80, 384, vert('BAR', '#0a0a2a', '#9ac8ff', '#4a6aff', { neon: '#4a6aff' })], ['v_manga', 80, 384, vert('まんが', '#2a8ad8', '#ffffff', '#ffe14a')],
  ['v_sushi', 80, 384, vert('寿司', '#f4f0e8', '#1a2a6a', '#d82a2a', { serif: true })], ['v_game', 80, 384, vert('ゲーム', '#2a0a5a', '#ffe14a', '#ff4ad2', { neon: '#ffb000' })],
  ['v_hair', 80, 384, vert('美容室', '#ffffff', '#c82a6a', '#c82a6a')], ['v_record', 80, 384, vert('中古レコード', '#8a1a1a', '#f4e0a8', '#f4e0a8', { serif: true })],
  ['v_live', 80, 384, vert('ライブ', '#0c0a18', '#ff7ad8', '#4ad8ff', { neon: '#ff4ab0' })], ['v_cafe', 80, 384, vert('喫茶', '#3a2a1e', '#f4e0b0', '#c8a040', { serif: true })],
  ['v_massage', 80, 384, vert('整体', '#1a5a3a', '#ffffff', '#ffffff')], ['v_eikaiwa', 80, 384, vert('英会話', '#ff8a2a', '#ffffff', '#1a1a1a')],
  ['v_sento', 80, 384, vert('ゆ', '#1a3a6a', '#ffffff', '#f2c230', { serif: true })], ['v_hotel', 80, 384, vert('ホテル', '#3a1a4a', '#ffd8f8', '#ff9ad8', { neon: '#ff9ad8' })]
];
const GEN = SIGNS.filter(s => /^g_/.test(s[0])).map(s => s[0]), BLADE = SIGNS.filter(s => /^v_/.test(s[0])).map(s => s[0]), BILL = SIGNS.filter(s => /^b_/.test(s[0])).map(s => s[0]);
function makeAtlas(LIST, SG, W, H) { if (SG.tex) return SG.tex; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const sh = []; let top = 0;
  for (const [k, w, h, fn] of LIST.slice().sort((a, b) => b[2] - a[2] || b[1] - a[1])) { let s = sh.find(q => q.h >= h && q.x + w <= W); if (!s) { if (top + h > H) { (SG.over = SG.over || []).push(k); continue } s = { y: top, h, x: 0 }; sh.push(s); top += h + 4 } g.save(); g.translate(s.x, s.y); g.beginPath(); g.rect(0, 0, w, h); g.clip(); try { fn(g, w, h) } catch (e) { (SG.bad = SG.bad || []).push(k) } g.restore(); SG.r[k] = [s.x / W, 1 - (s.y + h) / H, w / W, h / H]; s.x += w + 4 }
  SG.used = top; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; SG.tex = t; return t }
/* quads into one geometry; ry = direction the face looks at (0 = +z) */
function quadGeo(qs, R) { const n = qs.length, pos = new Float32Array(n * 18), nor = new Float32Array(n * 18), uv = new Float32Array(n * 12); let o = 0;
  qs.forEach(q => { const r = R[q.k]; if (!r) return; const c = Math.cos(q.ry), s = Math.sin(q.ry), hw = q.w / 2, hh = q.h / 2, P = (a, b) => [q.x + a * c, q.y + b, q.z - a * s];
    const v = [[P(-hw, -hh), [r[0], r[1]]], [P(hw, -hh), [r[0] + r[2], r[1]]], [P(hw, hh), [r[0] + r[2], r[1] + r[3]]], [P(-hw, hh), [r[0], r[1] + r[3]]]];
    for (const i of [0, 1, 2, 0, 2, 3]) { pos.set(v[i][0], o * 3); nor.set([s, 0, c], o * 3); uv.set(v[i][1], o * 2); o++ } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, o * 3), 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor.subarray(0, o * 3), 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv.subarray(0, o * 2), 2)); g.computeBoundingSphere(); return g }
TKY.kit = { fit, rr, makeAtlas, quadGeo, fas, vert, noren };

/* ======================= pencil-building kit ======================= */
const TILE = [0xd8cfc0, 0xc8bba8, 0xe8e2d6, 0xb8b4ac, 0x9a9a9e, 0xd0c4b0, 0x8a8680, 0xe0d8c8, 0x6a6e74, 0xc4a88a, 0xa89a8a, 0xf0ece4], GLASS = [0x2a3440, 0x24303a, 0x34404c, 0x1e2a34];
const WOOD = [0x5a3a24, 0x4a2e1c, 0x6a4a2e, 0x3a2416];
/* building at front point (fx, fz), facing yaw (0 = front faces +z), width w, height h, depth d.  parts -> P (solid) / Gl (lit) / Gs (glass) */
function tower(P, Gl, Gs, fx, fz, yaw, w, h, d, o) { const K = AV.kit, BG = K.BG, rng = o.rng, col = o.col;
  const base = new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeTranslation(fx, 0, fz));
  const put = (arr, geo, hex, x, y, z, sx, sy, sz) => { const m = K.M(x, y, z, sx, sy, sz); m.premultiply(base); arr.push([geo, hex, m, 0]) };
  const gf = o.gf || 4.2, sty = o.style || 'tile', lit = () => rng() < (o.litP == null ? .32 : o.litP), warm = () => rng() < .55 ? 0xffe2b0 : 0xd8ecff;
  if (o.hollow) { const t = .3; put(P, BG.box, col, 0, (gf + h) / 2, -d / 2, w, h - gf, d); put(P, BG.box, col, 0, gf / 2, -d + t / 2, w, gf, t); for (const sx of [-1, 1]) put(P, BG.box, col, sx * (w / 2 - t / 2), gf / 2, -d / 2, t, gf, d);
    const dv = w / 2 - 1.1; put(P, BG.box, o.shopCol || 0x1a1a1a, 0, gf - .35, .05, w, .7, .16); put(P, BG.box, o.shopCol || 0x1a1a1a, -w / 2 + .2, (gf - .7) / 2, .05, .4, gf - .7, .16); put(P, BG.box, o.shopCol || 0x1a1a1a, dv - .85, (gf - .7) / 2, .05, .3, gf - .7, .16);
    put(P, BG.box, o.shopCol || 0x1a1a1a, w / 2 - .15, (gf - .7) / 2, .05, .3, gf - .7, .16); const gx0 = -w / 2 + .4, gx1 = dv - 1; put(Gs, BG.box, 0xa8c8d8, (gx0 + gx1) / 2, 1.75, .06, gx1 - gx0, 2.5, .04); put(P, BG.box, 0x3a3a3e, (gx0 + gx1) / 2, .25, .06, gx1 - gx0, .5, .14) }
  else put(P, BG.box, col, 0, h / 2, -d / 2, w, h, d);
  /* ground floor */
  if (o.hollow) { }
  else if (o.shop) { put(P, BG.box, o.shopCol || 0x1a1a1a, 0, gf - .35, .05, w, .7, .14); put(o.lit ? Gl : P, BG.box, o.lit ? warm() : 0x2a3440, -.4, 1.6, .1, w - 2, 2.6, .05); put(P, BG.box, 0x101012, w / 2 - .75, 1.25, .1, 1, 2.5, .05); put(P, BG.box, 0x8a8a8c, 0, .08, .4, w, .16, .8) }
  else if (o.wood) { put(P, BG.box, 0x2a1a10, 0, gf / 2, .03, w, gf, .08); put(Gl, BG.box, 0xffc890, 0, 1.4, .09, w - 1, 2.2, .04) }
  else { put(P, BG.box, 0x3a3a3e, 0, gf - .3, .04, w, .25, .1); put(P, BG.box, 0x5a6068, -w * .2, 1.4, .06, w * .45, 2.6, .05); put(P, BG.box, 0x9aa0a6, w * .28, 1.2, .06, 1.1, 2.3, .05) }
  /* upper floors */
  const fl = o.fl || 3.3, nwin = Math.max(1, Math.round((w - 1) / 2.6)); let n = 0;
  for (let y = gf + .4; y + 2.2 < h - .5; y += fl, n++) {
    if (sty === 'glass') { const L1 = lit(); put(L1 ? Gl : P, BG.box, L1 ? warm() : GLASS[n % 4], 0, y + 1.35, .05, w - .3, 2.5, .05); for (let k = 0; k <= nwin; k++) put(P, BG.box, 0x3a3e44, -w / 2 + .15 + k * (w - .3) / nwin, y + 1.35, .09, .08, 2.5, .04); put(P, BG.box, 0x9aa0a6, 0, y + 2.75, .06, w, .3, .1) }
    else if (sty === 'balcony') { const L1 = lit(); put(L1 ? Gl : P, BG.box, L1 ? warm() : GLASS[n % 4], 0, y + 1.25, .02, w - 1, 2.2, .05); put(P, BG.box, 0xd8d8d4, 0, y + .1, .55, w - .2, .14, 1.1); put(P, BG.box, rng() < .5 ? 0xe8e8e4 : 0x8a9aa8, 0, y + .65, 1.08, w - .2, .9, .06); if (rng() < .35) put(P, BG.box, 0xe0e0dc, w / 2 - .7, y + .5, .5, .8, .55, .3) }
    else if (sty === 'wood') { const L1 = lit(); put(P, BG.box, WOOD[n % 4], 0, y + 1, .04, w, 2.2, .06); put(L1 ? Gl : P, BG.box, L1 ? 0xffc890 : 0x2a1e14, 0, y + 1.1, .08, w * .6, 1.2, .04); for (let k = -2; k <= 2; k++) put(P, BG.box, 0x2a1a10, k * w * .12, y + 1.1, .11, .05, 1.2, .03) }
    else { for (let i = 0; i < nwin; i++) { const x = (i - (nwin - 1) / 2) * (w / nwin), L1 = lit(); put(P, BG.box, 0xb8bcc0, x, y + 1.3, .02, 1.5, 1.8, .08); put(L1 ? Gl : P, BG.box, L1 ? warm() : GLASS[(i + n) % 4], x, y + 1.3, .07, 1.3, 1.6, .04) }
      if (rng() < .45) put(P, BG.box, 0xe0e0dc, (rng() < .5 ? -1 : 1) * (w / 2 - .5), y + .35, .25, .8, .55, .3) } }
  /* roof: parapet, water tank, antenna */
  put(P, BG.box, 0x8a8a88, 0, h + .4, -.1, w, .8, .2); if (w > 4.5 && rng() < .5) { const tx = (rng() - .5) * (w - 3); P.push([BG.cyl, 0xb8b8b4, K.M(0, h + 1.6, 0, 1, 1.6, 1).premultiply(new THREE.Matrix4().makeTranslation(tx, 0, -d / 2)).premultiply(base), 0]) }
  if (rng() < .25) put(P, BG.box, 0x4a4a4a, w * .3, h + 2.5, -d * .4, .08, 5, .08);
  return base }
/* wooden 2-storey yokochō hut */
function hut(P, Gl, fx, fz, yaw, w, h, d, rng) { const K = AV.kit, BG = K.BG, base = new THREE.Matrix4().makeRotationY(yaw).premultiply(new THREE.Matrix4().makeTranslation(fx, 0, fz));
  const put = (arr, geo, hex, x, y, z, sx, sy, sz) => { const m = K.M(x, y, z, sx, sy, sz); m.premultiply(base); arr.push([geo, hex, m, 0]) }, wc = WOOD[(rng() * 4) | 0];
  put(P, BG.box, wc, 0, h / 2, -d / 2, w, h, d); put(P, BG.box, 0x2a2a2e, 0, h + .2, -d / 2 + .2, w + .3, .3, d + .6); put(P, BG.box, 0x3a3a3e, 0, 2.9, .45, w, .12, .9);   /* roof + eave */
  put(P, BG.box, 0x3a2414, 0, .75, .04, w - .8, 1.5, .05); put(Gl, BG.box, 0xe8a060, 0, 1.95, .045, w - .8, .85, .04); put(P, BG.box, 0x2a1a10, 0, 2.55, .06, w, .2, .1); for (let k = -1; k <= 1; k++) put(P, BG.box, 0x1a1008, k * (w - .8) / 3, 1.3, .07, .06, 2.1, .03);
  put(P, BG.box, 0x1a1a1a, 0, h - 1, .05, w * .5, .9, .05);   /* upstairs window */
  for (const sx of [-1, 1]) { put(Gl, BG.sph, 0xff4a2a, sx * (w / 2 - .45), 2.4, .75, .26, .36, .26); put(P, BG.box, 0x1a1a1a, sx * (w / 2 - .45), 2.82, .75, .2, .06, .2) }   /* red chōchin lanterns */
  return base }

/* ======================= the world ======================= */
AV.registerWorld({
  id: 'tokyo',
  build(ctx) {
    const K = AV.kit, CY = AV.city, BG = K.BG, q = ctx.q, rng = ctx.rng, grp = ctx.group, S = AV.S;
    const st = () => { S.tokyo = S.tokyo || { met: {}, q: {}, train: 0 }; return S.tokyo };
    const T = (x, z, r, label, fn, show, kind) => { const t = { x, z, r, label, fn, show, kind }; ctx.T.push(t); return t };
    const P = [], Gl = [], Gs = [], Q = [], cols = ctx.cols, circ = ctx.circles;
    const box = (arr, hex, x0, x1, y0, y1, z0, z1) => arr.push([BG.box, hex, K.M((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), 0]);
    const sign = (k, x, y, z, w, h, ry, dbl) => { Q.push({ k, x, y, z, w, h, ry }); if (dbl) Q.push({ k, x: x - Math.sin(ry) * .03, y, z: z - Math.cos(ry) * .03, w, h, ry: ry + PI }) };
    let gi = 0, bi = 0, vi = 0; const nextGen = () => GEN[(gi++) % GEN.length], nextBlade = () => BLADE[(bi++ * 7) % BLADE.length], nextBill = () => BILL[(vi++) % BILL.length];
    /* ---------- ground: grey paving everywhere, asphalt carriageways, coloured Center Gai paving, kerbs, lane lines ---------- */
    const pave = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#8a8a88'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 32) { const v = 140 + Math.random() * 30; g.fillStyle = 'rgb(' + (v | 0) + ',' + (v | 0) + ',' + (v - 4 | 0) + ')'; g.fillRect(x + 1, y + 1, 30, 30) }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.5, .5); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t })();
    { const g = new THREE.PlaneGeometry(XMAX - XMIN, ZMAX - ZMIN); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (XMAX - XMIN) / 2, uv.getY(i) * (ZMAX - ZMIN) / 2); g.rotateX(-PI / 2);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: pave, roughness: .9 })); m.position.set((XMIN + XMAX) / 2, -.01, (ZMIN + ZMAX) / 2); m.receiveShadow = true; m.material.userData.lin = 1; grp.add(m) }
    const ASPH = 0x2e2f33, LINE = 0xe8e8e4;
    box(P, ASPH, -10, 10, 0, .03, -480, 186); box(P, ASPH, -200, -10, 0, .03, -8, 8); box(P, ASPH, 10, 50, 0, .03, -8, 8);   /* the avenue (N-S), the west road and the station drop-off */
    for (const x of [-10.1, 9.9]) { box(P, 0xb0b0ac, x, x + .2, 0, .14, -480, -14); box(P, 0xb0b0ac, x, x + .2, 0, .14, 14, 186) } for (const z of [-8.1, 7.9]) box(P, 0xb0b0ac, -200, -16, 0, .14, z, z + .2);   /* kerbs */
    for (let z = -476; z < 184; z += 6) if (Math.abs(z) > 18) box(P, LINE, -.08, .08, .03, .04, z, z + 3); for (let x = -198; x < -24; x += 6) box(P, LINE, x, x + 3, .03, .04, -.08, .08);   /* centre lines */
    /* the scramble: zebra arms + both diagonals, stop lines */
    for (let x = -9.5; x < 9.5; x += 1.1) { box(P, LINE, x, x + .55, .03, .045, -13.5, -9); box(P, LINE, x, x + .55, .03, .045, 9, 13.5) } for (let z = -7.5; z < 7.5; z += 1.1) { box(P, LINE, -21.5, -17, .03, .045, z, z + .55); box(P, LINE, 17, 21.5, .03, .045, z, z + .55) }
    for (const s of [1, -1]) for (let k = -8; k <= 8; k++) { const t = k / 8.5, cx = t * 12, cz = s * t * 9.5, a = Math.atan2(s * 9.5, 12); P.push([BG.box, LINE, K.M(cx, .04, cz, .5, .015, 4, 0, -a + PI / 2, 0), 0]) }
    box(P, LINE, 0, 9.5, .03, .045, -15.2, -14.8); box(P, LINE, -9.5, 0, .03, .045, 14.8, 15.2); box(P, LINE, -23.2, -22.8, .03, .045, -7.8, 0); box(P, LINE, 22.8, 23.2, .03, .045, 0, 7.8);
    box(P, 0x9a7a6a, -195, -16, 0, .02, -40, -32); box(P, 0x8a7a72, -96, -90, 0, .02, -120, -40); box(P, 0x7a7670, -195, -16, 0, .02, -128, -120); box(P, 0x8a7a6a, -80, -74, 0, .02, 14, 116); box(P, 0x6a5a4e, 89, 94, 0, .02, 46, 186); box(P, 0x7a7670, 16, 89, 0, .02, 120, 126);   /* lanes */
    box(P, 0xa89a90, -180, -16, 0, .02, -436, -428);   /* Takeshita */
    /* ---------- the Loop Line viaduct (x 100..114): deck, parapets, rails, pillars; a solid embankment wall (railway arches) ---------- */
    box(P, 0x9a9890, 99, 115, DECK - .8, DECK, ZMIN, ZMAX); for (const x of [99, 114.6]) box(P, 0x8a8880, x, x + .4, DECK, DECK + 1.1, ZMIN, ZMAX);
    for (const tx of TRACK) { box(P, 0x5a5048, tx - 1.3, tx + 1.3, DECK, DECK + .12, ZMIN, ZMAX); for (const s of [-.72, .72]) box(P, 0x9a9aa0, tx + s - .05, tx + s + .05, DECK + .12, DECK + .25, ZMIN, ZMAX) }
    for (let z = ZMIN + 8, i = 0; z < ZMAX; z += 16, i++) { box(P, 0x8a8880, 100, 101.4, 0, DECK - .8, z - .7, z + .7); box(P, 0x8a8880, 112.6, 114, 0, DECK - .8, z - .7, z + .7); if (i % 3 === 0) box(P, 0x3a3a3a, 100.6, 100.7, DECK + 1.1, DECK + 6.5, z - .1, z + .1) }   /* + catenary masts */
    box(P, 0x6a5a50, 100, 100.6, 0, DECK - .8, ZMIN, ZMAX); for (let z = ZMIN + 16; z < ZMAX; z += 16) box(P, 0x3a302a, 99.95, 100.02, .4, 5.2, z - 6, z + 6);   /* arch wall with dark arch infills */
    cols.push([100, XMAX + 2, ZMIN, ZMAX]);
    /* ---------- building rows ---------- */
    const SHOPS = {};   /* named shop lots: key -> { x, z, yaw, w, face, ax, out:[dx,dz], al:[dx,dz], h, d } */
    const SPECIAL = [['apemart', 'cgS', -52, 9, 8], ['ramen', 'cgS', -72, 7, 8], ['arcade', 'cgS', -104, 12, 8], ['crepe', 'cgS', -127, 5], ['karaoke', 'cgS', -150, 8],
      ['records', 'cgN', -48, 8], ['sushi', 'cgN', -66, 9], ['taiyaki', 'cgN', -118, 5],
      ['kissa', 'udW', -80, 8, 10], ['sento', 'udE', -72, 10], ['livehouse', 'saW', 60, 14, 11], ['cycle', 'saE', 40, 8], ['apephone', 'r1Es', 70, 9],
      ['izakaya', 'yk', 82, 5, 7], ['yakitori', 'gd', 100, 6], ['oden', 'gd', 132, 5],
      ['kawaii', 'tkN', -40, 7], ['purikura', 'tkN', -92, 8], ['swag', 'tkN', -132, 12], ['candy', 'tkS', -54, 6], ['vintage', 'tkS', -100, 9]];
    const BLAD = { apemart: 'v_game', ramen: 'v_ramen', arcade: 'v_game', karaoke: 'v_karaoke', records: 'v_record', sushi: 'v_sushi', kissa: 'v_cafe', sento: 'v_sento', livehouse: 'v_live', izakaya: 'v_izakaya' };
    let nB = 0;
    /* a row of buildings along axis ax ('z': fronts at x = front, 'x': fronts at z = front), facing +/- (face), from a0 to a1 */
    function row(id, ax, front, a0, a1, face, depth, o) { o = o || {}; const out = ax === 'z' ? [face, 0] : [0, face], al = ax === 'z' ? [0, 1] : [1, 0], yaw = ax === 'z' ? (face > 0 ? PI / 2 : -PI / 2) : (face > 0 ? 0 : PI);
      let a = a0; while (a < a1 - 3) { let w = (o.wmin || 5) + rng() * ((o.wmax || 9) - (o.wmin || 5)); const sp = SPECIAL.find(s => s[1] === id && !SHOPS[s[0]] && s[2] - s[3] / 2 < a + w + 1 && s[2] + s[3] / 2 > a);
        if (sp) { const sa = sp[2] - sp[3] / 2; if (sa - a >= 3) w = sa - a > (o.wmax || 9) + 3 ? w : sa - a; else w = sp[3] } if (a + w > a1) w = a1 - a; if (w < 3) break; const isSp = sp && w === sp[3];
        const ac = a + w / 2, fx = ax === 'z' ? front : ac, fz = ax === 'z' ? ac : front, h = o.hFix || ((o.h0 || 9) + rng() * (o.hr || 10)), shop = isSp || rng() < (o.shopP == null ? .7 : o.shopP);
        const sty = o.style || ['tile', 'tile', 'glass', 'balcony', 'concrete', 'tile'][(rng() * 6) | 0];
        if (o.build) o.build(fx, fz, yaw, w, h, depth, { isSp, sp, out, al, a, ac, shop });
        else if (o.hut) hut(P, Gl, fx, fz, yaw, w, h, depth, rng);
        else tower(P, Gl, Gs, fx, fz, yaw, w, h, depth, { rng, col: o.col || TILE[(rng() * TILE.length) | 0], style: sty, shop, lit: shop && rng() < .75, hollow: isSp && !!sp[4], shopCol: [0x1a1a1a, 0x2a2a2e, 0x3a1a1a, 0x1a2a3a, 0xe8e8e4][(rng() * 5) | 0], gf: o.gf, litP: o.litP });
        const c0 = ax === 'z' ? [Math.min(front, front - face * depth), Math.max(front, front - face * depth), a + .05, a + w - .05] : [a + .05, a + w - .05, Math.min(front, front - face * depth), Math.max(front, front - face * depth)];
        if (!(isSp && sp[4])) cols.push(c0); nB++;
        const sx = fx + out[0] * .24, sz = fz + out[1] * .24;
        if (isSp) { SHOPS[sp[0]] = { k: sp[0], x: fx + out[0] * .2, z: fz + out[1] * .2, yaw, w, face, ax, out, al, h, d: depth, hollow: sp[4] || 0, c: c0, lsx: Math.round(Math.cos(yaw) * al[0] - Math.sin(yaw) * al[1]) } }
        else if (o.build) { }
        else if (o.hut) { const nk = ['n_sake', 'n_tori', 'n_oden', 'n_ramen'][(rng() * 4) | 0]; sign(nk, fx + out[0] * .12, 2.05, fz + out[1] * .12, w * .62, w * .62 * .6, yaw) }
        else if (shop && o.gen) { sign(o.gen[(rng() * o.gen.length) | 0], sx, (o.gf || 4.2) - .55, sz, w - .5, (w - .5) * .232, yaw) }
        else if (shop && !o.noSign) { const gk = nextGen(); sign(gk, sx, (o.gf || 4.2) - .55, sz, w - .5, (w - .5) * .232, yaw); if (!o.hut) sign(['w_konbini', 'w_fashion', 'w_food'][(rng() * 3) | 0], fx + out[0] * .14, 1.6, fz + out[1] * .14, Math.max(1, w - 2.2), 2.0, yaw) }
        if (!o.hut && !o.build && !o.noBlade && h > 9 && rng() < (o.bladeP == null ? .6 : o.bladeP)) { const bk = isSp && BLAD[sp[0]] ? BLAD[sp[0]] : nextBlade(), sd = rng() < .5 ? -1 : 1, bh = Math.min(5.6, h - 6); sign(bk, fx + out[0] * .75 + al[0] * sd * (w / 2 - .45), 5.2 + bh / 2, fz + out[1] * .75 + al[1] * sd * (w / 2 - .45), bh * .21, bh, yaw + PI / 2, true); box(P, 0x2a2a2a, Math.min(fx + out[0] * .1 + al[0] * sd * (w / 2 - .45), fx + out[0] * .75 + al[0] * sd * (w / 2 - .45)) - .04, Math.max(fx + out[0] * .1 + al[0] * sd * (w / 2 - .45), fx + out[0] * .75 + al[0] * sd * (w / 2 - .45)) + .04, 5.1 + bh, 5.2 + bh, Math.min(fz + out[1] * .1 + al[1] * sd * (w / 2 - .45), fz + out[1] * .75 + al[1] * sd * (w / 2 - .45)) - .04, Math.max(fz + out[1] * .1 + al[1] * sd * (w / 2 - .45), fz + out[1] * .75 + al[1] * sd * (w / 2 - .45)) + .04) }
        if (!o.hut && !o.build && h > 16 && rng() < (o.billP == null ? .22 : o.billP)) { const bw = Math.min(w - 1, 9); sign(nextBill(), fx - out[0] * 1.5, h + 1.2 + bw * .19, fz - out[1] * 1.5, bw, bw * .375, yaw); box(P, 0x3a3a3a, fx - out[0] * 1.7 - al[0] * bw / 2 - .05, fx - out[0] * 1.7 + al[0] * bw / 2 + .05, h, h + 1.3, fz - out[1] * 1.7 - al[1] * bw / 2 - .05, fz - out[1] * 1.7 + al[1] * bw / 2 + .05) }
        a += w + .02 } }
    /* filler masses that close the inside of a block (roofscape seen over the rows) */
    function fill(x0, x1, z0, z1, h0, hr) { for (let x = x0; x < x1 - .5; x += 22) for (let z = z0; z < z1 - .5; z += 22) { const xa = Math.min(x1, x + 22), za = Math.min(z1, z + 22), h = h0 + rng() * hr; box(P, TILE[(rng() * TILE.length) | 0], x, xa, 0, h, z, za); box(P, 0x8a8a88, x, xa, h, h + .7, z, za);
        if (h > 18 && rng() < .5) { const L1 = rng() < .4; box(L1 ? Gl : P, L1 ? 0xffe2b0 : 0x2a3440, x + 1, xa - 1, h - 3.4, h - 1.2, z - .02, z + .02); box(L1 ? Gl : P, L1 ? 0xd8ecff : 0x2a3440, x + 1, xa - 1, h - 3.4, h - 1.2, za - .02, za + .02) } }
      cols.push([x0, x1, z0, z1]) }
    /* --- Shibuya --- */
    row('cgS', 'x', -32, -195, -38, -1, 9, { h0: 9, hr: 12 }); row('a2N', 'x', -14, -195, -38, 1, 9, { h0: 12, hr: 16 });   /* block A: Center Gai's south side + the road's north side, back to back */
    row('cgN', 'x', -40, -195, -96, 1, 12, { h0: 9, hr: 13 }); row('cgN', 'x', -40, -90, -28, 1, 12, { h0: 9, hr: 13 });
    row('udW', 'z', -96, -108, -52, 1, 12, { h0: 7, hr: 9 }); row('udE', 'z', -90, -108, -52, -1, 12, { h0: 7, hr: 9 });
    row('bkS', 'x', -120, -195, -96, -1, 12, { h0: 8, hr: 8 }); row('bkS', 'x', -120, -90, -28, -1, 12, { h0: 8, hr: 8 }); row('bkN', 'x', -128, -195, -28, 1, 12, { h0: 8, hr: 10 });
    fill(-195, -108, -108, -52, 10, 20); fill(-78, -28, -108, -52, 12, 22);
    row('r1W', 'z', -16, -120, -40, 1, 12, { h0: 16, hr: 22, billP: .5 }); row('r1W', 'z', -16, 34, 114, 1, 12, { h0: 14, hr: 20, billP: .5 });
    row('r2S', 'x', 14, -195, -80, -1, 12, { h0: 10, hr: 16 }); row('r2S', 'x', 14, -74, -40, -1, 12, { h0: 12, hr: 16 });
    row('saW', 'z', -80, 26, 114, 1, 12, { h0: 7, hr: 9 }); row('saE', 'z', -74, 26, 114, -1, 12, { h0: 7, hr: 9 });
    fill(-195, -92, 26, 114, 8, 16); fill(-62, -28, 26, 114, 10, 18);
    row('r1Es', 'z', 16, 50, 120, -1, 12, { h0: 12, hr: 16 }); row('r1Es', 'z', 16, 126, 186, -1, 12, { h0: 12, hr: 16 });
    row('shN', 'x', 120, 28, 81, 1, 12, { h0: 7, hr: 8, bladeP: .4 }); row('shS', 'x', 126, 28, 81, -1, 12, { h0: 7, hr: 8, bladeP: .4 });
    fill(28, 81, 50, 108, 10, 18); fill(28, 81, 138, 190, 10, 18);
    row('yk', 'z', 89, 50, 119, 1, 8, { hut: true, wmin: 3.2, wmax: 4.6, h0: 4.6, hr: 1.4, shopP: 1, noSign: true }); row('yk', 'z', 89, 127, 160, 1, 8, { hut: true, wmin: 3.2, wmax: 4.6, h0: 4.6, hr: 1.4, shopP: 1, noSign: true });
    row('gd', 'z', 94, 50, 160, -1, 6, { hFix: 4.6, wmin: 4.5, wmax: 6, style: 'concrete', col: 0x7a5a4a, noBlade: true, gf: 4.2, shopP: .85, gen: ['g_bar', 'g_yakiniku', 'g_udon', 'g_tonkatsu', 'g_gyudon'] });
    fill(81, 100, 162, 190, 6, 6);   /* the yokochō ends in a wall at z 162 */
    fill(-202, -195, -132, 18, 14, 10); fill(-202, -195, 18, 116, 8, 8);   /* the west end of the lanes */
    box(P, 0xf2c230, -199, -198.6, 0, 1, -8, 8); for (let z = -7; z < 8; z += 2) box(P, 0x1a1a1a, -198.95, -198.55, .3, .7, z, z + 1);   /* road closed barrier */
    /* --- between Shibuya and Harajuku, and Harajuku --- */
    row('r1Wn', 'z', -16, -426, -130, 1, 12, { h0: 12, hr: 20, billP: .4 }); row('r1En', 'z', 16, -398, -130, -1, 14, { h0: 14, hr: 22, billP: .4 });
    fill(-200, -28, -416, -140, 12, 26); fill(30, 100, -398, -130, 16, 28);
    row('tkN', 'x', -436, -178, -28, 1, 12, { h0: 6, hr: 7, wmin: 4, wmax: 7, bladeP: .3 }); row('tkS', 'x', -428, -178, -28, -1, 12, { h0: 6, hr: 7, wmin: 4, wmax: 7, bladeP: .3 });
    row('r1Wh', 'z', -16, -480, -438, 1, 12, { h0: 10, hr: 12 }); fill(-200, -28, -482, -448, 8, 14); fill(-200, -178, -448, -416, 8, 10); fill(52, 100, -440, -398, 10, 12); fill(60, 100, -482, -470, 6, 6);
    TKY.stats.buildings = nB;
    /* ---------- landmarks ---------- */
    const glassM = 0x34404c;
    /* NW corner tower with the big screen (x -38..-16, z -32..-14) */
    { box(P, 0x3a3e44, -38, -16, 0, 34, -32, -14); for (let y = 5; y < 33; y += 3.4) { box(Gl, y % 2 > 1 ? 0xd8ecff : 0xffe2b0, -37.5, -16.5, y, y + 2.2, -14.06, -13.98); box(P, 0x9aa0a6, -38, -16, y + 2.4, y + 2.8, -14.1, -14) }
      box(P, 0x1a1a1e, -16.2, -15.9, 10, 24, -31, -15); box(P, 0x1a1a1e, -37, -17, 22, 31, -13.98, -13.6); box(P, 0x101012, -36, -18, 0, 4.2, -13.95, -13.9); cols.push([-38, -16, -32, -14]) }
    /* SW "Moon Tower": a silver drum on the corner (x -40..-16, z 14..34) */
    { P.push([BG.cyl, 0xc8ccd0, K.M(-28, 16, 25, 11, 32, 11), 0]); for (let y = 4; y < 31; y += 3.2) P.push([BG.cyl, y % 2 > 1.2 ? 0x2a3440 : 0x3a4654, K.M(-28, y + 1.1, 25, 11.08, 2, 11.08), 0]); P.push([BG.cyl, 0xffd84a, K.M(-28, 32.6, 25, 9, .8, 9), 0]); box(P, 0x9aa0a6, -40, -16, 0, 4.4, 14, 34); cols.push([-40, -16, 14, 34]) }
    /* NE department store "Maru-Ape" (x 16..100, z -130..-62) */
    { box(P, 0xe0dcd2, 16, 100, 0, 30, -130, -62); for (let y = 6; y < 29; y += 4) { box(Gl, 0xffe8c8, 17, 99, y, y + 2.4, -61.98, -61.9); box(Gl, 0xffe8c8, 15.9, 16, y, y + 2.4, -129, -63) } box(P, 0x1a1a1e, 24, 52, 10, 26, -61.9, -61.6);
      P.push([BG.cyl, 0xd8d4ca, K.M(22, 18, -68, 7, 36, 7), 0]); box(P, 0x101012, 30, 44, 0, 4.4, -61.95, -61.9); cols.push([16, 100, -130, -62]); sign('b_sol', 70, 33.6, -64, 22, 8.25, 0); sign('b_zton', 16.4, 33.6, -100, 22, 8.25, -PI / 2) }
    /* Shibuya station (x 52..100, z -55..40) + island platform on the viaduct */
    { box(P, 0xcfcac0, 52, 100, 0, 7, -55, 40); box(Gl, 0xd8ecff, 52, 52.1, 1, 6.2, -50, 35); for (let z = -50; z < 36; z += 4) box(P, 0x5a5e64, 51.9, 52, 0, 6.6, z, z + .3); box(P, 0x2a2a2e, 51.5, 52, 6.8, 7.4, -55, 40); box(P, 0x101012, 51.8, 51.9, 0, 3.4, -16, -4);
      cols.push([52, 100, -55, 40]); sign('st_shibuya', 51.6, 8.4, -8, 16, 2, -PI / 2); sign('loop', 50.7, 1.6, -18.5, .9, 1.35, -PI / 2);
      box(P, 0xb8b4ac, 105.6, 108.4, DECK, DECK + 1.05, -50, 30); box(P, 0x5a5e64, 104.6, 109.4, DECK + 4.4, DECK + 4.6, -50, 30); for (let z = -46; z < 30; z += 8) box(P, 0x5a5e64, 106.9, 107.1, DECK + 1, DECK + 4.4, z, z + .2);
      box(P, 0x9a9aa0, 40, 52, 4.6, 4.8, -10, 6); for (const z of [-9.5, 5.5]) box(P, 0x9a9aa0, 40, 40.3, 0, 4.6, z, z + .3) }   /* drop-off canopy */
    /* Harajuku station: a timbered cottage with a green roof and a spire (x 52..100, z -470..-440) */
    { box(P, 0xf4f0e4, 52, 100, 0, 7, -470, -440); for (let x = 54; x < 100; x += 3.2) box(P, 0x4a2e1c, x, x + .3, 0, 7, -440.04, -439.94); box(P, 0x4a2e1c, 52, 100, 3.4, 3.7, -440.06, -439.94); for (let z = -468; z < -440; z += 3.2) box(P, 0x4a2e1c, 51.9, 52, 0, 7, z, z + .3);
      const rs = new THREE.Shape([[-16, 0], [16, 0], [0, 7]].map(p => new THREE.Vector2(p[0], p[1]))), rg = new THREE.ExtrudeGeometry(rs, { depth: 49, bevelEnabled: false }); P.push([rg, 0x3a6a4a, K.M(51.5, 7, -455, 1, 1, 1, 0, PI / 2, 0), 0]);   /* ridge along x */
      P.push([BG.cone, 0x3a6a4a, K.M(56, 13, -455, 2.4, 7, 2.4), 0]); box(P, 0xf4f0e4, 54, 58, 7, 9.5, -457, -453); box(Gl, 0xffe2b0, 51.95, 52, 1.2, 3, -462, -448); box(P, 0x101012, 51.85, 51.9, 0, 3.2, -458, -452);
      cols.push([52, 100, -471, -439]); sign('st_harajuku', 51.6, 5.4, -455, 12, 1.5, -PI / 2); sign('loop', 50.7, 1.6, -460.5, .9, 1.35, -PI / 2);
      box(P, 0xb8b4ac, 105.6, 108.4, DECK, DECK + 1.05, -480, -430); box(P, 0x3a6a4a, 104.6, 109.4, DECK + 4.4, DECK + 4.6, -480, -430); for (let z = -476; z < -430; z += 8) box(P, 0x5a5e64, 106.9, 107.1, DECK + 1, DECK + 4.4, z, z + .2) }
    /* the forest shrine: giant torii at the north end of the avenue, gravel approach, a haiden in the trees */
    const torii = (x, z, s, ry, plaque) => { const c = Math.cos(ry), sn = Math.sin(ry), at = (u, v) => [x + u * c + v * sn, z - u * sn + v * c], red = plaque === 'jingu' ? 0x6a5040 : 0xc8321e;
      for (const u of [-2.2 * s, 2.2 * s]) { const [px, pz] = at(u, 0); P.push([BG.cyl, red, K.M(px, 2.6 * s, pz, .32 * s, 5.2 * s, .32 * s), 0]); P.push([BG.cyl, 0x1a1a1a, K.M(px, .3 * s, pz, .38 * s, .6 * s, .38 * s), 0]); circ.push([px, pz, .4 * s]) }
      P.push([BG.box, red, K.M(x, 4.3 * s, z, 5.6 * s, .32 * s, .3 * s, 0, ry, 0), 0], [BG.box, 0x1a1a1a, K.M(x, 5.15 * s, z, 6.6 * s, .34 * s, .5 * s, 0, ry, 0), 0], [BG.box, red, K.M(x, 4.85 * s, z, 6.2 * s, .28 * s, .4 * s, 0, ry, 0), 0]);
      for (const u of [-3.3 * s, 3.3 * s]) { const [px, pz] = at(u, 0); P.push([BG.box, 0x1a1a1a, K.M(px, 5.3 * s, pz, .6 * s, .22 * s, .5 * s, 0, ry, u > 0 ? .35 : -.35), 0]) }
      if (plaque) { const [px, pz] = at(0, .2 * s); sign(plaque, px, 4.7 * s, pz, .55 * s, 1.35 * s, ry, true) } };
    torii(0, -488, 2, 0, 'jingu');
    { box(P, 0xc8c0b0, -6, 6, 0, .03, -556, -484); box(P, 0x6a5040, -14, 14, 0, 1.2, -556, -548); box(P, 0xf4f0e4, -12, 12, 1.2, 5.4, -556, -549); for (let x = -11; x < 12; x += 2.6) box(P, 0x6a5040, x, x + .4, 1.2, 5.4, -548.95, -548.85); box(P, 0x8a6a4a, -16, 16, 5.4, 6, -558, -546);
      const rs = new THREE.Shape([[-17, 0], [17, 0], [12, 4.2], [-12, 4.2]].map(p => new THREE.Vector2(p[0], p[1]))); P.push([new THREE.ExtrudeGeometry(rs, { depth: 14, bevelEnabled: false }), 0x4a5a4a, K.M(0, 6, -559, 1, 1, 1), 0]); cols.push([-14, 14, -558, -547]) }
    /* ---------- Shibuya details: Haru statue plaza, taxi pool, trees, lamps, guard rails, signals, vending machines, power lines ---------- */
    { const bz = 0x6a5636; box(P, 0x8a8478, 32, 36, 0, 1.4, 24, 28); P.push([BG.sph, bz, K.M(34, 2.3, 26, .8, .95, .7), 0], [BG.sph, bz, K.M(34, 3.35, 26.15, .5, .5, .48), 0], [BG.sph, 0xc8a878, K.M(33.62, 3.32, 26.15, .1, .26, .3), 0]);
      for (const s of [-1, 1]) P.push([BG.sph, bz, K.M(34, 3.45, 26.15 + s * .5, .14, .16, .1), 0], [BG.sph, bz, K.M(33.6, 1.75, 26 + s * .45, .42, .28, .3), 0], [BG.cyl, bz, K.M(33.55, 2.35, 26 + s * .62, .14, .8, .14, 0, 0, .3), 0]);
      cols.push([32, 36, 24, 28]); sign('haru', 31.95, 1, 26, 1.6, .7, -PI / 2) }
    const trees = [], sakura = []; for (let z = -470; z < 180; z += 14) for (const x of [-12.6, 12.6]) { if (Math.abs(z) < 50 || (x > 0 && z > -62 && z < 50) || (z > -440 && z < -424) || (z > -42 && z < -30)) continue; trees.push([x, z]) }
    for (const [x, z] of [[20, 36], [46, 36], [46, 18], [46, 44], [28, 44], [-180, -36], [-150, -36], [-125, -36]]) sakura.push([x, z]);
    for (const [x, z] of trees) { const h = 6 + rng() * 2; box(P, 0x4a3a2a, x - .18, x + .18, 0, h * .55, z - .18, z + .18); for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; P.push([BG.ico, [0x3a6a2e, 0x4a7a34, 0x5a8a3a][k % 3], K.M(x + Math.cos(a) * 1.2, h * .75, z + Math.sin(a) * 1.2, 1.8, 1.5, 1.8), 0]) } P.push([BG.ico, 0x4a7a34, K.M(x, h * .9, z, 2, 1.7, 2), 0]); circ.push([x, z, .3]) }
    const blossom = (x, z, s) => { box(P, 0x4a3026, x - .2 * s, x + .2 * s, 0, 2.6 * s, z - .2 * s, z + .2 * s); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; P.push([BG.ico, [0xf8c8d8, 0xf4b0c8, 0xfcdce6][k % 3], K.M(x + Math.cos(a) * 1.5 * s, 3.4 * s + (k % 2) * .5, z + Math.sin(a) * 1.5 * s, 1.9 * s, 1.4 * s, 1.9 * s), 0]) } P.push([BG.ico, 0xf8c8d8, K.M(x, 4 * s, z, 2.2 * s, 1.6 * s, 2.2 * s), 0]); circ.push([x, z, .3 * s]) };
    for (const [x, z] of sakura) blossom(x, z, 1);
    /* street lamps + guard rails along the avenue */
    for (let z = -476; z < 184; z += 20) for (const x of [-11, 11]) { if (Math.abs(z) < 24) continue; box(P, 0x4a4e54, x - .07, x + .07, 0, 7, z - .07, z + .07); box(P, 0x4a4e54, x - (x > 0 ? 1.6 : -.07), x + (x > 0 ? .07 : 1.6), 6.9, 7, z - .07, z + .07); box(Gl, 0xf4f8ff, x - (x > 0 ? 1.6 : -1.2) - .3, x - (x > 0 ? 1.2 : -1.6) + .3, 6.75, 6.9, z - .2, z + .2) }
    for (const x of [-10.5, 10.5]) for (const [z0, z1] of [[-470, -24], [24, 180]]) { box(P, 0xe8e8e4, x - .04, x + .04, .8, .9, z0, z1); for (let z = z0; z < z1; z += 2.5) box(P, 0xe8e8e4, x - .03, x + .03, 0, .9, z, z + .06) }
    /* taxi pool (plaza north) */
    { box(P, 0xb0b0ac, 20, 48, 0, .14, -40, -39.7); box(P, 0x2e2f33, 20, 48, 0, .02, -58, -40); box(P, 0x1a4a2a, 46, 46.2, 0, 2.6, -46, -45.8); box(Gl, 0xffd84a, 45.6, 46.6, 2.6, 3.1, -46.2, -45.6) }
    /* traffic signals: car heads (4 approaches) + pedestrian heads at the corners; their lamps are separate meshes switched by tokyo_life */
    const SIG = { carNS: [], carEW: [], ped: [] };
    const pole = (x, z) => { box(P, 0x5a5e64, x - .1, x + .1, 0, 5.4, z - .1, z + .1); circ.push([x, z, .25]) };
    for (const [x, z, grp2, ry] of [[-11, -15.5, 'carNS', 0], [11, 15.5, 'carNS', PI], [-23.5, 9, 'carEW', PI / 2], [23.5, -9, 'carEW', -PI / 2]]) { pole(x, z); box(P, 0x2a2e34, x - .9, x + .9, 4.9, 5.4, z - .25, z + .25); SIG[grp2].push([x, 5.15, z, ry]) }
    for (const [x, z] of [[-14.5, -14.5], [14.5, -14.5], [-14.5, 14.5], [14.5, 14.5]]) { pole(x, z); box(P, 0x2a2e34, x - .12, x + .12, 2.45, 3.15, z - .12, z + .12); SIG.ped.push([x, 2.8, z]) }
    TKY.SIG = SIG;
    /* vending machines (jihanki) */
    /* [x, z] = a point on the wall the machine backs onto, ry = the way it faces */
    const VEND = [[-16, -60, PI / 2], [-16, -61.15, PI / 2], [-90, -70, -PI / 2], [-74, 90, -PI / 2], [-74, 91.15, -PI / 2], [60, 40, 0], [61.15, 40, 0], [-60, -120, PI], [-16, -300, PI / 2], [-16, -301.15, PI / 2], [-40, -428, PI], [16, 160, -PI / 2]];
    for (const [x, z, ry] of VEND) { const c = Math.cos(ry), s = Math.sin(ry), bx = x + s * .42, bz = z + c * .42; P.push([BG.box, rng() < .5 ? 0xf4f4f4 : 0xd82a2a, K.M(bx, .95, bz, 1.05, 1.9, .8, 0, ry, 0), 0]); sign(rng() < .5 ? 'vend' : 'vend2', x + s * .83, 1.05, z + c * .83, .9, 1.58, ry); circ.push([bx, bz, .55]) }
    TKY.vend = VEND;
    /* utility poles + wires over the back street, the Udagawa alley, the south alley and Takeshita */
    const wires = (pts) => { for (const [x, z] of pts) { P.push([BG.cyl, 0x9a9890, K.M(x, 4.6, z, .16, 9.2, .16), 0]); box(P, 0x6a6a68, x - .9, x + .9, 8.4, 8.55, z - .06, z + .06); circ.push([x, z, .25]); if (rng() < .5) P.push([BG.cyl, 0x5a5e5a, K.M(x + .35, 7.2, z, .28, .7, .28), 0]) }
      for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]], dx = b[0] - a[0], dz = b[1] - a[1], L2 = Math.hypot(dx, dz), an = Math.atan2(dx, dz); for (const [off, y] of [[-.7, 8.5], [.7, 8.5], [0, 7.9]]) P.push([BG.box, 0x1a1a1a, K.M((a[0] + b[0]) / 2 + Math.cos(an) * off, y - .25, (a[1] + b[1]) / 2 - Math.sin(an) * off, .03, .03, L2, 0, an, 0), 0]) } };
    { const pts = []; for (let x = -190; x < -20; x += 17) pts.push([x, -121]); wires(pts) } { const pts = []; for (let z = -115; z < -42; z += 15) pts.push([-90.8, z]); wires(pts) } { const pts = []; for (let z = 20; z < 112; z += 16) pts.push([-74.8, z]); wires(pts) }
    { const pts = []; for (let x = -175; x < -30; x += 18) pts.push([x, -428.8]); wires(pts) }
    /* Center Gai: gateway arch at the avenue, lamp arches down the lane */
    { for (const z of [-40.2, -31.8]) box(P, 0x2a2e3a, -17.4, -17, 0, 7.2, z - .2, z + .2); box(P, 0x2a2e3a, -17.6, -16.8, 6.4, 7.6, -40.6, -31.4); sign('centergai', -16.75, 7, -36, 8, 1.25, PI / 2, true);
      for (let x = -40; x > -192; x -= 24) { for (const z of [-39.7, -32.3]) box(P, 0x3a3e48, x - .08, x + .08, 0, 5.6, z - .08, z + .08); box(P, 0x3a3e48, x - .08, x + .08, 5.5, 5.7, -39.7, -32.3); for (let k = 0; k < 5; k++) box(Gl, [0xff6ab0, 0xffd84a, 0x6ad8ff][k % 3], x - .18, x + .18, 5.15, 5.45, -38.6 + k * 1.5, -38.3 + k * 1.5) } }
    /* Takeshita arch + Harajuku plaza */
    { for (const z of [-436.4, -427.6]) box(P, 0xe8e0f0, -17.4, -17, 0, 6.6, z - .2, z + .2); box(P, 0xd8c8f0, -17.6, -16.8, 6, 7.8, -436.8, -427.2); sign('takeshita', -16.75, 6.9, -432, 8.4, 1.32, PI / 2, true); for (const [x, z] of [[24, -470], [44, -470], [24, -410], [34, -420]]) blossom(x, z, 1.1) }
    /* Chōchin Yokochō: gateway sign over the lane at the plaza end, lantern strings, the gādoshita bars' lanterns */
    { box(P, 0x3a1a10, 88.6, 89, 0, 4.2, 47.8, 48.2); box(P, 0x3a1a10, 94, 94.4, 0, 4.2, 47.8, 48.2); box(P, 0x3a1a10, 88.6, 94.4, 4, 4.4, 47.8, 48.2); sign('yokocho', 91.5, 4.9, 48.3, 4.2, .84, PI, true);
      for (let z = 54; z < 158; z += 3) { box(Gl, z % 2 ? 0xff5a2a : 0xffa04a, 91.3, 91.7, 3.6, 4.1, z - .2, z + .2); box(P, 0x1a1a1a, 89, 94, 4.25, 4.28, z - .01, z + .01) } }
    /* ---------- the Inari shrine grove (south of the alleys, x -200..-16, z 116..190) ---------- */
    { box(P, 0x9a9282, -200, -16, 0, .02, 116, 190); box(P, 0x8a7e6a, -122, -18, 0, .03, 147, 153);   /* gravel + the stone approach */
      box(P, 0x5a4a3a, -200, -80.5, 0, 1.4, 114, 116.4); box(P, 0x5a4a3a, -73.5, -16, 0, 1.4, 114, 116.4); cols.push([-200, -80.5, 114, 116.4], [-73.5, -16, 114, 116.4]); box(P, 0x5a4a3a, -200, -199, 0, 1.4, 116, 190); cols.push([-202, -199, 116, 190]); box(P, 0x5a4a3a, -200, -16, 0, 1.4, 188.6, 190); cols.push([-200, -16, 188.6, 190]);
      torii(-20, 150, 1, PI / 2, 'inari'); for (let k = 0; k < 6; k++) torii(-60 - k * 3.2, 150, .62, PI / 2);   /* a short tunnel of small vermilion torii */
      /* haiden (worship hall) on a stone base */
      box(P, 0xa8a090, -142, -104, 0, 1.2, 136, 164); box(P, 0xe8e0d0, -138, -110, 1.2, 6.5, 140, 160); for (let z = 140; z < 161; z += 3.4) box(P, 0xc8321e, -110.4, -109.6, 1.2, 6.5, z - .3, z + .3); box(P, 0x101010, -110.2, -110.1, 1.4, 5.2, 144, 156);
      const rs = new THREE.Shape([[-17, 0], [17, 0], [11, 5], [-11, 5]].map(p => new THREE.Vector2(p[0], p[1]))); P.push([new THREE.ExtrudeGeometry(rs, { depth: 26, bevelEnabled: false }), 0x2a2a2e, K.M(-124, 6.5, 137, 1, 1, 1), 0]);
      box(P, 0x6a4a2a, -106, -103.4, 1.2, 2.2, 147.5, 152.5); box(Gl, 0xd8a040, -104, -103.9, 2.8, 4.4, 149.4, 150.6); cols.push([-142, -104, 136, 164]);
      for (const z of [146, 154]) { box(P, 0x9a968c, -100.6, -99.4, 0, 1.2, z - .6, z + .6); P.push([BG.sph, 0xe8e4dc, K.M(-100, 1.8, z, .45, .6, .35), 0], [BG.cone, 0xe8e4dc, K.M(-100, 2.5, z, .14, .4, .14), 0], [BG.box, 0xc8321e, K.M(-99.7, 1.55, z, .1, .3, .5), 0]); cols.push([-100.6, -99.4, z - .6, z + .6]) }   /* kitsune */
      for (const x of [-34, -50, -84, -96]) for (const z of [145.2, 154.8]) { box(P, 0x9a968c, x - .35, x + .35, 0, 1.6, z - .35, z + .35); box(Gl, 0xffd8a0, x - .3, x + .3, 1.6, 2.1, z - .3, z + .3); box(P, 0x6a665c, x - .55, x + .55, 2.1, 2.35, z - .55, z + .55); circ.push([x, z, .5]) }   /* stone lanterns */
      box(P, 0x9a968c, -42, -38, 0, .9, 138, 141); box(P, 0x3a6a8a, -41.6, -38.4, .85, .92, 138.3, 140.7); box(P, 0x6a4a2a, -42.2, -37.8, 2.8, 3.1, 137.6, 141.4); for (const [x, z] of [[-42, 137.8], [-38, 137.8], [-42, 141.2], [-38, 141.2]]) box(P, 0x6a4a2a, x - .1, x + .1, 0, 2.8, z - .1, z + .1); cols.push([-42.2, -37.8, 137.8, 141.2]);   /* chōzuya */
      box(P, 0x6a4a2a, -118, -108, 0, 2.2, 168, 168.4); for (let x = -117.5; x < -108.5; x += .55) box(P, 0xe0c890, x, x + .4, 1.2, 1.9, 168.4, 168.46); cols.push([-118, -108, 167.8, 168.6]);   /* ema rack */
      box(P, 0x6a4a2a, -96, -92, 0, 1.6, 139, 140); for (let x = -95.6; x < -92.2; x += .3) box(P, 0xf4f4f0, x, x + .12, 1.5, 1.9, 139.4, 139.5); cols.push([-96, -92, 138.8, 140.2]);   /* omikuji tying rack */
      /* camphor + sakura + cedars around the grove */
      { const x = -160, z = 176; box(P, 0x4a3a2a, x - 1.2, x + 1.2, 0, 7, z - 1.2, z + 1.2); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; P.push([BG.ico, [0x2e5a26, 0x3a6a2e][k % 2], K.M(x + Math.cos(a) * 5, 10 + (k % 2) * 2, z + Math.sin(a) * 5, 6, 4.4, 6), 0]) } box(P, 0xf4f0e4, x - 1.25, x + 1.25, 4, 4.4, z - 1.25, z + 1.25); cols.push([x - 1.3, x + 1.3, z - 1.3, z + 1.3]) }
      for (const [x, z] of [[-30, 130], [-30, 172], [-70, 128], [-70, 176], [-150, 128], [-180, 140], [-186, 160], [-120, 182], [-90, 182], [-52, 182]]) blossom(x, z, 1.1);
      for (let x = -196; x < -20; x += 9) for (const z of [119, 185]) { if (Math.abs(x + 77) < 6) continue; P.push([BG.cone, 0x24401e, K.M(x + (rng() - .5) * 3, 7, z, 2.2, 14, 2.2), 0]); box(P, 0x3a2a1e, x - .25, x + .25, 0, 2, z - .25, z + .25) } }
    /* the shrine forest north of Harajuku: dense cedars both sides of the approach */
    for (let z = -488; z > -556; z -= 7) for (const x of [-56, -44, -30, -18, 18, 30, 44, 56]) { if (z < -544 && Math.abs(x) < 20) continue; const xx = x + (rng() - .5) * 4; P.push([BG.cone, [0x24401e, 0x2e4a24][(rng() * 2) | 0], K.M(xx, 8, z, 2.6, 16, 2.6), 0]); box(P, 0x3a2a1e, xx - .3, xx + .3, 0, 2.4, z - .3, z + .3); circ.push([xx, z, .5]) }
    for (let x = -60; x <= 60; x += 6) box(P, 0x2a3a22, x, x + 6, 0, 18, -562, -556);
    cols.push([-60, -6.5, -562, -556], [6.5, 60, -562, -556]);
    /* ---------- the matsuri (festival) decorations: built here, shown by tokyo_life on festival nights ---------- */
    const fest = new THREE.Group(); fest.visible = false; grp.add(fest); TKY.festG = fest; const FP = [], FL = [], FQ = [];
    const YG = [34, -28]; /* the yagura stands in the taxi-pool plaza (x 20..48, z -58..-20) */
    { const [x, z] = YG; for (const [dx, dz] of [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]]) FP.push([BG.box, 0x6a4a2a, K.M(x + dx, 2.4, z + dz, .3, 4.8, .3), 0]); FP.push([BG.box, 0xc8321e, K.M(x, 2.6, z, 5.4, .3, 5.4), 0], [BG.box, 0xf4f0e4, K.M(x, 3.4, z, 5.6, 1.4, 5.6), 0], [BG.box, 0x6a4a2a, K.M(x, 4.9, z, 5.8, .2, 5.8), 0], [BG.box, 0x3a3a3a, K.M(x, 6.4, z, 6.4, .3, 6.4), 0]);
      FP.push([BG.cyl, 0x8a4a2a, K.M(x, 3.6, z, .9, 1.1, .9, PI / 2, 0, 0), 0]); for (let k = 0; k < 4; k++) FQ.push({ k: 'matsuri', x: x + [0, 2.82, 0, -2.82][k], y: 3.4, z: z + [2.82, 0, -2.82, 0][k], w: 5.4, h: .84, ry: [0, PI / 2, PI, -PI / 2][k] });
      for (let r = 0; r < 12; r++) { const a = r / 12 * TAU, ex = x + Math.cos(a) * 14, ez = z + Math.sin(a) * 14; FP.push([BG.box, 0x5a5e64, K.M(ex, 2.6, ez, .12, 5.2, .12), 0]); for (let k = 1; k < 8; k++) { const t = k / 8, lx = x + (ex - x) * t, lz = z + (ez - z) * t, ly = 6.3 - (5.2 - 6.3) * 0 - Math.sin(t * PI) * .9 - t * 1.1; FL.push([BG.sph, k % 2 ? 0xff5a3a : 0xfff0d0, K.M(lx, ly, lz, .22, .3, .22), 0]) } } }
    for (let x = -30; x > -192; x -= 4) for (const z of [-39.2, -32.8]) FL.push([BG.sph, (x / 4 | 0) % 2 ? 0xff5a3a : 0xfff0d0, K.M(x, 4.4, z, .24, .32, .24), 0]);   /* Center Gai lantern lines */
    FQ.push({ k: 'matsuri', x: -16.7, y: 8.6, z: -36, w: 8, h: 1.25, ry: PI / 2 }, { k: 'matsuri', x: -16.8, y: 8.6, z: -36, w: 8, h: 1.25, ry: -PI / 2 });
    const YATAI = [['y_yakisoba', 22, -54], ['y_takoyaki', 30, -54], ['y_kakigori', 38, -54], ['y_kingyo', 46, -50], ['y_wanage', 46, -42], ['y_yakisoba', 22, -16.5], ['y_takoyaki', 46, -16.5]];
    for (const [k, x, z] of YATAI) { const ry = x > 45 ? -PI / 2 : z > -20 ? PI : 0, c = Math.cos(ry), s = Math.sin(ry); FP.push([BG.box, 0x6a4a2a, K.M(x, .5, z, 2.6, 1, 1.3, 0, ry, 0), 0], [BG.box, [0xd82a2a, 0x1a3a8a, 0xf4f4f4, 0xff8a2a, 0x3a8a3a][Math.abs((x + z) | 0) % 5], K.M(x - s * .2, 2.5, z - c * .2, 3, .15, 1.8, 0, ry, 0), 0]);
      for (const u of [-1.3, 1.3]) FP.push([BG.box, 0x5a3a20, K.M(x + c * u, 1.25, z - s * u, .1, 2.5, .1, 0, ry, 0), 0]); FQ.push({ k, x: x + s * .7, y: 2.15, z: z + c * .7, w: 2.4, h: .9, ry }); FL.push([BG.sph, 0xff5a3a, K.M(x + s * .7 + c * 1.1, 1.9, z + c * .7 - s * 1.1, .2, .28, .2), 0]) }
    TKY.YG = YG; TKY.YATAI = YATAI;
    const festM = new THREE.Mesh(K.merge(FP), K.floraMat(0, { rough: .7 })); festM.material.userData.lin = 1; fest.add(festM);
    /* ---------- the businesses: interiors behind their shopfronts ---------- */
    const sh = SHOPS;
    /* hollow lot -> walls with the door open; PT(u, v): u = metres in from the front, v = metres along the row */
    function interior(key, fitFn) { const s = sh[key]; if (!s || !s.hollow) return null; const depth = s.hollow, f = s.out, a = s.al, PT = (u, v) => [s.x - f[0] * u + a[0] * v, s.z - f[1] * u + a[1] * v];
      const bb = (u0, u1, v0, v1) => { const p = PT(u0, v0), q2 = PT(u1, v1); return [Math.min(p[0], q2[0]), Math.max(p[0], q2[0]), Math.min(p[1], q2[1]), Math.max(p[1], q2[1])] };
      const hw = s.w / 2, dv = s.lsx * (hw - 1.1);   /* the facade's door bay is on the building's local +x side: in row coordinates that is v = lsx * (hw - 1.1) */
      cols.push(bb(.1, depth, -hw, -hw + .35), bb(.1, depth, hw - .35, hw), bb(depth - .35, depth + .3, -hw, hw));   /* side walls + back wall */
      cols.push(bb(0, .35, -hw, dv - .7), bb(0, .35, dv + .7, hw));   /* the front wall with the door gap at v = dv */
      if (depth + .3 < s.d) cols.push(bb(depth + .3, s.d, -hw, hw));   /* the rest of the plot behind the back wall */
      const fb = bb(.2, depth, -hw + .3, hw - .3); box(P, 0x8a8478, fb[0], fb[1], .01, .05, fb[2], fb[3]); const lb = bb(depth * .3, depth * .7, -hw + 1, hw - 1); box(Gl, 0xf4f8ff, lb[0], lb[1], 4.0, 4.06, lb[2], lb[3]);
      /* F(u, f): fittings in door-relative coordinates (the door is always at f = -(hw - 1.1), so f > 0 is the far side) */
      const F = (u, f) => PT(u, -s.lsx * f), fbb = (u0, u1, f0, f1) => bb(u0, u1, -s.lsx * f0, -s.lsx * f1);
      const it = { key, PT, F, bb: fbb, depth, w: s.w, hw, door: PT(-1, dv), doorIn: PT(1.2, dv), mid: PT(depth / 2, 0), dv }; fitFn && fitFn(it); return it }
    const bx2 = (arr, hex, it, u0, u1, y0, y1, v0, v1) => { const b = it.bb(u0, u1, v0, v1); box(arr, hex, b[0], b[1], y0, y1, b[2], b[3]) };
    const IN = {};
    /* (door at f = -dv; keep f < -dv + 1.2 clear for the first 3 m) */
    IN.apemart = interior('apemart', it => { for (let i = 0; i < 3; i++) { const f = -1.6 + i * 1.8; bx2(P, 0xe8e8ec, it, 2.6, 6.2, 0, 1.6, f, f + .7); for (let k = 0; k < 5; k++) bx2(P, [0xd82a2a, 0x2a6ad8, 0x3aa85a, 0xf2c230, 0xff8a3a, 0x8a4ad8][(k + i) % 6], it, 2.8 + k * .7, 3.3 + k * .7, 1.6, 1.85, f + .1, f + .6) }
      bx2(Gl, 0xd8f0ff, it, 7.3, 7.6, .3, 2.4, -3.6, 4); bx2(P, 0xd8d8d0, it, .9, 2.2, 0, 1.05, 2.6, 3.2); bx2(P, 0x2a2a2e, it, 1.4, 1.8, 1.05, 1.4, 2.7, 3.1); it.cust = it.F(1.6, 2.0); it.staff = it.F(1.6, 3.8) });
    IN.ramen = interior('ramen', it => { bx2(P, 0x6a4a2a, it, 4.2, 4.8, 0, 1.05, -1.2, 3.2); bx2(P, 0xd8b890, it, 4.1, 4.9, 1.05, 1.12, -1.3, 3.3); bx2(P, 0xc8c8c4, it, 6, 7.6, 0, 1, -1.2, 3.2); for (let k = 0; k < 4; k++) bx2(P, 0x2a2a2a, it, 3.3, 3.7, 0, .7, -.9 + k * 1.1, -.5 + k * 1.1);
      bx2(P, 0xe8e0d0, it, .5, 1.1, 0, 1.6, 2.3, 3.1); bx2(Gl, 0xffffff, it, 1.1, 1.15, 1.0, 1.5, 2.35, 3.05); it.cust = it.F(3.0, 1.2); it.staff = it.F(5.5, 1.2); it.ticket = it.F(1.6, 2.7) });
    IN.arcade = interior('arcade', it => { for (let k = 0; k < 4; k++) { const f = -2.4 + k * 1.6; bx2(P, 0xf4f4f8, it, 4.6, 5.8, 0, 2.2, f, f + 1.2); bx2(Gl, [0xff4ad2, 0x4ad8ff, 0xffe14a, 0x7aff8a][k], it, 4.5, 4.62, .9, 2, f + .1, f + 1.1) }
      bx2(P, 0x1a1a2a, it, 1.4, 2.4, 0, 1.6, 4.2, 5.4); bx2(Gl, 0xff4ad2, it, 1.35, 1.42, 1, 1.5, 4.3, 5.3); bx2(Gl, 0xff9ad8, it, 6.4, 7.6, 0, 2.4, 3, 5.4); it.crane = it.F(3.8, -.6); it.drum = it.F(2.9, 4.8); it.puri = it.F(5.8, 4.2) });
    IN.kissa = interior('kissa', it => { for (let k = 0; k < 14; k++) bx2(P, [0x1a1a1a, 0x8a1a1a, 0xf2c230, 0x2a4a8a, 0xe8e0d0][k % 5], it, it.depth - .7, it.depth - .4, .3 + (k % 5) * .5, .7 + (k % 5) * .5, -2.4 + (k >> 1) * .7, -1.9 + (k >> 1) * .7); bx2(P, 0x3a2414, it, 2.6, 3.2, 0, 1.05, -.8, 3.6);
      for (const f of [-3.4, 2.8]) bx2(P, 0x1a1410, it, it.depth - 1.5, it.depth - .8, 0, 2.6, f, f + .8); for (const u of [5.2, 7]) bx2(P, 0x6a2a1a, it, u, u + 1, 0, .55, -2.8, -1.4); it.cust = it.F(2.0, 1.4); it.staff = it.F(3.9, 1.4) });
    IN.livehouse = interior('livehouse', it => { bx2(P, 0x1a1a1e, it, it.depth - 3, it.depth - .4, 0, .9, -6.2, 6.2); for (let k = 0; k < 5; k++) bx2(Gl, [0xff4ad2, 0x4ad8ff, 0xffe14a][k % 3], it, it.depth - 2.6, it.depth - 2.4, 3.6, 3.8, -5 + k * 2.4, -4.6 + k * 2.4); for (const f of [-5.6, 5.2]) bx2(P, 0x101012, it, it.depth - 2.8, it.depth - 2, .9, 2.8, f, f + .8);
      bx2(P, 0x2a1a12, it, 1.4, 2.2, 0, 1.1, 2.6, 6.3); bx2(Gl, 0x4ad8ff, it, 2.2, 2.26, .2, .9, 2.7, 6.2); bx2(Gl, 0x5a2a9a, it, it.depth - .42, it.depth - .38, 1.2, 3.6, -5.6, 5.6); for (let k = 0; k < 8; k++) bx2(Gl, [0xff4ad2, 0x4ad8ff][k % 2], it, it.depth - .44, it.depth - .4, 1.3 + (k % 4) * .55, 1.5 + (k % 4) * .55, -5 + k * 1.3, -4.4 + k * 1.3); it.cust = it.F(2.9, 4.4); it.staff = it.F(.9, 4.4); it.stage = it.F(it.depth - 1.6, 0); it.floor = it.F(5.2, 0); it.booth = it.F(it.depth - 4.2, 4.6) });
    IN.izakaya = interior('izakaya', it => { bx2(P, 0x6a4a2a, it, 3.8, 4.4, 0, 1.05, -.6, 2.2); bx2(P, 0xd8b890, it, 3.7, 4.5, 1.05, 1.1, -.7, 2.3); for (let k = 0; k < 3; k++) bx2(P, 0x2a1a10, it, 3, 3.4, 0, .7, -.4 + k * .9, -.1 + k * .9); for (let k = 0; k < 6; k++) bx2(P, [0x2a6a3a, 0xe8e0d0, 0x6a1a1a][k % 3], it, 6.3, 6.5, 1.3, 1.9, -1.6 + k * .5, -1.3 + k * .5); it.cust = it.F(2.7, .9); it.staff = it.F(5.3, .9) });
    TKY.interiors = IN;
    /* ---------- districts in their own modules (tokyo_asakusa.js) ---------- */
    const shibuyaShops = Object.keys(sh).length; TKY.AS = null; if (TKY.asakusa) try { TKY.AS = TKY.asakusa(ctx, { row, fill, box, sign, P, Gl, Gs, Q, sh, SPECIAL, interior, bx2, IN, T, st, torii, blossom, wires }) } catch (e) { console.warn('tokyo asakusa', e); TKY.stats.asErr = String(e && e.stack || e).slice(0, 400) }
    /* signs over the named shopfronts (+ window displays), noren at the yokochō doors */
    for (const k in sh) { const s = sh[k], tall = /^(yakitori|oden|izakaya)$/.test(k); sign(k, s.x + s.out[0] * .06, s.signY || (tall ? 3.3 : 3.65), s.z + s.out[1] * .06, s.w - .4, (s.w - .4) * (SIGNS.find(x => x[0] === k)[2] / SIGNS.find(x => x[0] === k)[1]), s.yaw);
      if (!s.hollow && !tall && !s.noWin) sign(/crepe|taiyaki|kawaii|candy/.test(k) ? 'w_food' : /records|vintage|swag/.test(k) ? 'w_fashion' : 'w_konbini', s.x - s.out[0] * .06, 1.6, s.z - s.out[1] * .06, s.w - 2.2, 2, s.yaw) }
    if (sh.ramen) sign('menu_ramen', sh.ramen.x + sh.ramen.out[0] * .3 + sh.ramen.al[0] * -2.6, 1.4, sh.ramen.z + sh.ramen.out[1] * .3 + sh.ramen.al[1] * -2.6, .9, .9, sh.ramen.yaw);
    if (sh.livehouse) { const s = sh.livehouse; sign('poster_live', s.x + s.out[0] * .2 + s.al[0] * -4.8, 1.8, s.z + s.out[1] * .2 + s.al[1] * -4.8, 1.2, 1.8, s.yaw) }
    TKY.shops = sh;
    /* ---------- merge everything static ---------- */
    atlasTex(); const solidM = K.floraMat(0, { rough: .82 }); solidM.userData.lin = 1; const NWK = AV.nwkit, CELL = 64; const REG = (x) => x > 250 ? 'as' : 'sh', RO = { region: REG }; TKY.region = null; TKY.chunks = NWK.chunked(P, CELL, a => K.merge(a), solidM, grp, 'tky_static', { shadow: true, region: REG });
    if (Gs.length) { const gm = new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: .05, metalness: .3, transparent: true, opacity: .35, depthWrite: false }); gm.userData.lin = 1; TKY.chunks.push(...NWK.chunked(Gs, 128, a => K.merge(a), gm, grp, 'tky_glass', { order: 2, region: REG })) }
    const glowM = new THREE.MeshBasicMaterial({ vertexColors: true }); glowM.userData.lin = 1; TKY.chunks.push(...NWK.chunked(Gl, 128, a => K.merge(a), glowM, grp, 'tky_glow', RO)); TKY.glowM = glowM;
    const flM = new THREE.MeshBasicMaterial({ vertexColors: true }); flM.userData.lin = 1; fest.add(new THREE.Mesh(K.merge(FL), flM));
    const signM = new THREE.MeshStandardMaterial({ map: SG.tex, emissiveMap: SG.tex, emissive: 0xffffff, emissiveIntensity: .35, roughness: .55, alphaTest: .3 }); signM.userData.lin = 1; TKY.chunks.push(...NWK.chunked(Q, 128, a => quadGeo(a, SG.r), signM, grp, 'tky_signs', RO)); TKY.signM = signM; if (TKY.AS && TKY.asak && TKY.asak.makeShutters) TKY.asak.makeShutters(signM);
    fest.add(new THREE.Mesh(quadGeo(FQ, SG.r), signM));
    TKY.stats.parts = P.length + Gl.length; TKY.stats.signs = Q.length; TKY.stats.atlasOver = (SG.over || []).length; TKY.stats.atlasBad = (SG.bad || []).length; TKY.stats.atlasUsed = SG.used;
    /* night: lit windows dim by day, signs and lanterns brighten at night */
    ctx.upd.push(() => { const h = (S.time / 60) % 24, n = h > 19 || h < 5 ? 1 : h > 17.5 ? (h - 17.5) / 1.5 : h < 6.5 ? (6.5 - h) / 1.5 : 0; signM.emissiveIntensity = .35 + 1.0 * n; glowM.color.setScalar(.4 + .6 * n); TKY.night = n; const r = TKY.noRegion ? 'all' : AV.P.x > 250 ? 'as' : 'sh'; if (r !== TKY.region) { TKY.region = r; for (const m of TKY.chunks) m.visible = r === 'all' || m.userData.region === r } });
    TKY.ctx = ctx;
    /* ---------- map ---------- */
    const PLc = (id, en, es, x, z, yaw) => ({ id, name: [en, es], x, z, yaw });
    const mapRoads = [[0, -480, 0, 186, 20], [-200, 0, 50, 0, 16], [-16, -36, -195, -36, 8], [-16, -124, -195, -124, 8], [-93, -40, -93, -120, 6], [-77, 14, -77, 116, 6], [16, 123, 89, 123, 6], [91.5, 46, 91.5, 186, 5], [-16, -432, -180, -432, 8], [0, -484, 0, -546, 10]];
    const places = [PLc('scramble', 'Shibuya Scramble Crossing', 'Cruce de Shibuya', 0, 0, 0), PLc('station', 'Shibuya Station (Loop Line)', 'Estación de Shibuya (Línea Circular)', 46, -10, -PI / 2), PLc('haru', 'Haru statue plaza', 'Plaza de la estatua de Haru', 28, 26, PI / 2),
      PLc('centergai', 'Center Gai', 'Center Gai', -60, -36, PI / 2), PLc('udagawa', 'Udagawa alley', 'Callejón de Udagawa', -93, -80, PI), PLc('backstreet', 'Back street (power lines)', 'Calle trasera', -100, -124, PI / 2), PLc('yokocho', 'Chōchin Yokochō (lantern alley)', 'Chōchin Yokochō (callejón de farolillos)', 91.5, 90, PI),
      PLc('shrine', 'Inari shrine', 'Santuario Inari', -60, 150, PI / 2), PLc('matsuri', 'Matsuri plaza (yagura)', 'Plaza del matsuri (yagura)', 34, -36, 0), PLc('taxi', 'Taxi pool', 'Parada de taxis', 30, -44, 0),
      PLc('harajuku', 'Harajuku Station', 'Estación de Harajuku', 46, -455, -PI / 2), PLc('takeshita', 'Takeshita Street', 'Calle Takeshita', -80, -432, PI / 2), PLc('forest', 'Forest shrine (Mori-no-Miya)', 'Santuario del bosque (Mori-no-Miya)', 0, -520, 0)];
    const NAMES = { apemart: 'ApeMart Express', ramen: 'Ramen Kaminari', arcade: 'Game Center Banana Zone', crepe: 'Momo Crêpes', karaoke: 'Karaoke Utage', records: 'Groove Dealers Records Shibuya', sushi: 'Kaiten Sushi Yūgure', taiyaki: 'Taiyaki Taiya', kissa: 'Jazz Kissa Kuroneko', sento: 'Sentō Matsu-no-yu', livehouse: 'Live House SPACE NEKO', cycle: 'Sakura Cycle (bikes)', apephone: 'ApePhone Store Tokyo', izakaya: 'Izakaya Chōchin', yakitori: 'Yakitori Torikichi', oden: 'Oden Akari', kawaii: 'Kawaii Crêpe', purikura: 'Purikura Sakura', swag: 'SWAG Tokyo', candy: 'Rainbow Candy Floss', vintage: 'Ura Vintage' };
    for (const k in NAMES) { const s = sh[k]; if (s) places.push(PLc(k, NAMES[k], NAMES[k], s.x + s.out[0] * 3, s.z + s.out[1] * 3, Math.atan2(s.out[0], s.out[1]) + PI)) }
    if (TKY.AS) { for (const r of TKY.AS.roads) mapRoads.push(r); for (const p of TKY.AS.places) places.push(PLc(p[0], p[1], p[2], p[3], p[4], p[5])) }
    TKY.names = NAMES; TKY.stats.shopsPlaced = shibuyaShops; TKY.stats.allShops = Object.keys(sh).length;
    if (TKY.life) try { TKY.life(ctx, { T, st, sh, IN, box, SIG, YG, YATAI, fest }) } catch (e) { console.warn('tokyo life', e); TKY.stats.lifeErr = String(e && e.stack || e).slice(0, 400) }
    return { name: 'Tokyo', surface: surf, fog: [70, 460], sky: { exp: .9, tint: [0x8a7ab8, 0xd8c8e0, .3, .3], dome: { s1: 0xe8d0e8, s2: 0x8aa0d8, swirl: .02, cloud: .6, glow: .4 } },
      arrivals: { default: { x: 30, z: 22, yaw: PI / 2 }, pipe: { x: 26, z: 36, yaw: PI / 2 }, train: { x: 46, z: -10, yaw: PI / 2 } }, defaultArrival: 'default',
      mapRoads, places, mapNav: TKY.nav || null,
      greet: { human: [['Konnichiwa! Wait for the little green man — then everyone crosses at once.', '¡Konnichiwa! Espera al muñequito verde: entonces cruza todo el mundo a la vez.'], ['Lost? Everyone meets at the Haru statue.', '¿Perdido? Todo el mundo queda en la estatua de Haru.']] },
      chatLines: [['The scramble is the busiest crossing in the Apeverse. Probably.', 'El scramble es el cruce más concurrido del Apeverse. Probablemente.'], ['Friday night is Bon Odori — lanterns everywhere.', 'El viernes por la noche hay Bon Odori: farolillos por todas partes.'], ['Best ramen is at Kaminari. Buy the ticket at the machine first.', 'El mejor ramen está en Kaminari. Primero el ticket en la máquina.']],
      musicProfile: { bpm: 92, root: 50, scale: [0, 1, 5, 7, 8], style: 'amb' } };
  }
});
function atlasTex() { return makeAtlas(SIGNS, SG, 2048, 4096) }
TKY.SIGNS = SIGNS; TKY.SG = SG;
})(window.AV);
