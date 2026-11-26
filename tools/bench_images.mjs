#!/usr/bin/env node
/* M13: image numbers for the world benchmark.  node tools/bench_images.mjs <dir with bench_*.png> [<second dir to compare>]
   For each screenshot (the 3D view, HUD strips excluded: top 12 %, bottom 12 %, right 18 %): mean luminance, contrast (std dev
   of luminance), saturation, and the share of near-white pixels (L > 0.85, haze / bloom wash).  No dependencies (PNG decoded
   with zlib; 8-bit RGB/RGBA, non-interlaced, as Chrome writes them). */
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
function png(file) { const b = fs.readFileSync(file); let o = 8, w, h, ct, idat = []; while (o < b.length) { const len = b.readUInt32BE(o), type = b.toString('latin1', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12]) throw new Error('unsupported png') } else if (type === 'IDAT') idat.push(d); else if (type === 'IEND') break; o += 12 + len }
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride); let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), out = px.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) { const a = i >= bpp ? out[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1; else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c } out[i] = v & 255 } prev = out }
  return { w, h, bpp, px } }
function stats(file) { const { w, h, bpp, px } = png(file); let n = 0, s = 0, s2 = 0, sat = 0, white = 0, wTop = 0, nTop = 0, wBot = 0, nBot = 0, satBot = 0;
  for (let y = Math.floor(h * .12); y < h * .88; y += 2) for (let x = 0; x < w * .82; x += 2) { const i = (y * w + x) * bpp, r = px[i] / 255, g = px[i + 1] / 255, bl = px[i + 2] / 255, L = .2126 * r + .7152 * g + .0722 * bl, mx = Math.max(r, g, bl), mn = Math.min(r, g, bl);
    n++; s += L; s2 += L * L; const sv = mx ? (mx - mn) / mx : 0; sat += sv; if (L > .85) white++; if (y < h * .5) { nTop++; if (L > .85) wTop++ } else { nBot++; if (L > .85) wBot++; satBot += sv } }
  const mean = s / n; return { mean: +mean.toFixed(3), contrast: +Math.sqrt(Math.max(0, s2 / n - mean * mean)).toFixed(3), sat: +(sat / n).toFixed(3), white: +(white / n).toFixed(3), whiteTop: +(wTop / nTop).toFixed(3), whiteBottom: +(wBot / nBot).toFixed(3), satBottom: +(satBot / nBot).toFixed(3) } }
const [a, b] = process.argv.slice(2); const read = d => Object.fromEntries(fs.readdirSync(d).filter(f => /^bench_.*\.png$/.test(f)).map(f => [f.slice(6, -4), stats(path.join(d, f))]));
const A = read(a), B = b ? read(b) : null; const rows = Object.keys(A).sort().map(id => Object.assign({ id }, A[id], B && B[id] ? { contrast2: B[id].contrast, white2: B[id].white, sat2: B[id].sat, whiteTop2: B[id].whiteTop, whiteBottom2: B[id].whiteBottom, satBottom2: B[id].satBottom } : {}));
console.log(JSON.stringify(rows));
