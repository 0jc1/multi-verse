#!/usr/bin/env node
/* APEVERSE 2.0 - tools/music_catalog.mjs : M10. A validated catalogue of the owner's LOCAL audio library.
   Nothing this tool reads or writes is committed: the catalogue goes to local/ and copied audio to gitignored folders.
   - Scans audio files (mp3 wav m4a flac ogg aac) under the given roots (default: ~/Downloads ~/Desktop ~/Documents ~/Music),
     skipping node_modules and this game's own checkouts.
   - Validates each file (MP3 frame sync / RIFF / fLaC / OggS / ftyp), reads ID3v2/ID3v1 title + artist + album, measures
     duration (MP3: Xing/Info frame count or CBR size; WAV: byte rate), de-duplicates by size + hash of the first 64 KB.
   - Classifies: owner (ZtonedApe / Stone Ape / Apeverse in name, path or tags, or listed in the game's playlists),
     likely_owner (an "ape" folder, no third-party artist tag), third_party (another artist tag), unknown.
   - --restore : copies the owner's originals that data/music.js lists but the build is missing, from the library
                 (exact file name match only; assets/music/jungle_dub + stone_ape_band are gitignored).
   - --library N : copies N more owner originals (valid MP3, 1-10 min, distinct titles) to assets/music/library/ (gitignored)
                 and writes local/music_local.js, which adds the playlist "my_library" to the game on this machine only.
   usage: node tools/music_catalog.mjs [--restore] [--library 40] [root ...] */
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import crypto from 'node:crypto'; import vm from 'node:vm'; import { fileURLToPath } from 'node:url';
const GAME = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), flag = f => args.includes(f), opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d };
const roots = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--library'); const H = os.homedir();
const ROOTS = roots.length ? roots : ['Downloads', 'Desktop', 'Documents', 'Music'].map(d => path.join(H, d)).filter(d => fs.existsSync(d));
const EXT = /\.(mp3|wav|m4a|flac|ogg|aac)$/i, SKIP = /node_modules|ape multiverse 1|\.git[\\/]/i;
const OWNER = /ztoned\s*_?ape|ztonedape|stone\s*_?ape|apeverse/i, LIKELY = /(^|[\\/ _-])ape([\\/ _-]|$)/i;
const OUT = path.join(GAME, 'local'); fs.mkdirSync(OUT, { recursive: true });

/* ---------- the game's playlists ---------- */
const box = { window: {} }; box.AV = box.window.AV = {}; vm.runInNewContext(fs.readFileSync(path.join(GAME, 'data/music.js'), 'utf8'), box);
const LISTED = []; for (const [k, P] of Object.entries(box.window.AV.MUSIC || {})) for (const t of P.tracks || []) LISTED.push({ list: k, file: t.file, title: t.title, base: path.basename(t.file).toLowerCase(), present: fs.existsSync(path.join(GAME, t.file)) });
const listedBase = new Set(LISTED.map(t => t.base));

/* ---------- walk ---------- */
let macStubs = 0;
function* walk(dir, depth = 0) { if (depth > 12) return; let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }) } catch (e) { return }
  for (const e of ents) { const p = path.join(dir, e.name); if (SKIP.test(p)) continue; if (e.isDirectory()) yield* walk(p, depth + 1); else if (e.isFile() && EXT.test(e.name)) { if (e.name.startsWith('._')) { macStubs++; continue } yield p } }   /* skip macOS AppleDouble stubs */ }

/* ---------- tags + validation + duration ---------- */
const BR2 = [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 0], BR = { 1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0] }, SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
function txt(b, enc) { if (enc === 1 || enc === 2) { let s = b; if (enc === 1 && s[0] === 0xff && s[1] === 0xfe) s = s.subarray(2); else if (enc === 1 && s[0] === 0xfe && s[1] === 0xff) { s = Buffer.from(s.subarray(2)); s.swap16() } return s.toString('utf16le').replace(/\0+$/, '') } return b.toString(enc === 3 ? 'utf8' : 'latin1').replace(/\0+$/, '') }
function id3v2(b) { if (b.toString('latin1', 0, 3) !== 'ID3') return { size: 0 }; const v = b[3], sz = ((b[6] & 127) << 21 | (b[7] & 127) << 14 | (b[8] & 127) << 7 | (b[9] & 127)) + 10, tags = {}; let i = 10;
  while (i + 10 < Math.min(sz, b.length)) { const id = b.toString('latin1', i, i + 4); if (!/^[A-Z0-9]{4}$/.test(id)) break; const fs_ = v === 4 ? ((b[i + 4] & 127) << 21 | (b[i + 5] & 127) << 14 | (b[i + 6] & 127) << 7 | (b[i + 7] & 127)) : b.readUInt32BE(i + 4); if (fs_ <= 0 || i + 10 + fs_ > b.length) break;
    if (id === 'TIT2' || id === 'TPE1' || id === 'TALB') tags[{ TIT2: 'title', TPE1: 'artist', TALB: 'album' }[id]] = txt(b.subarray(i + 11, i + 10 + fs_), b[i + 10]).trim(); i += 10 + fs_ } return { size: sz, tags } }
function mp3(b, total, start) { for (let i = start; i < Math.min(b.length - 4, start + 65536); i++) { if (b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) continue; const ver = (b[i + 1] >> 3) & 3, lay = (b[i + 1] >> 1) & 3, bi = b[i + 2] >> 4, si = (b[i + 2] >> 2) & 3; if (ver === 1 || lay === 0 || lay === 3 || (lay === 2 && ver !== 3) || bi === 0 || bi === 15 || si === 3) continue;
    const kbps = lay === 2 ? BR2[bi] : BR[ver === 3 ? 1 : 2][bi], sr = SR[ver][si], spf = ver === 3 ? 1152 : 576, mono = (b[i + 3] >> 6) === 3, xo = i + 4 + (ver === 3 ? (mono ? 17 : 32) : (mono ? 9 : 17));
    const tag = lay === 1 ? b.toString('latin1', xo, xo + 4) : ''; if ((tag === 'Xing' || tag === 'Info') && (b.readUInt32BE(xo + 4) & 1)) return { ok: true, dur: b.readUInt32BE(xo + 8) * spf / sr, kbps, sr };
    const len = Math.floor((ver === 3 ? 144 : 72) * kbps * 1000 / sr); if (b[i + len] !== 0xff && i + len < b.length) continue;   /* confirm a 2nd frame */
    return { ok: true, dur: (total - i) * 8 / (kbps * 1000), kbps, sr, layer: lay === 2 ? 'MPEG layer II' : null } } return { ok: false } }
function probe(p) { let fd, st; try { st = fs.statSync(p); fd = fs.openSync(p, 'r') } catch (e) { return { ok: false, err: 'unreadable' } } try { const n = Math.min(st.size, 262144), b = Buffer.alloc(n); fs.readSync(fd, b, 0, n, 0); const ext = path.extname(p).slice(1).toLowerCase(), hash = crypto.createHash('sha1').update(b.subarray(0, 65536)).digest('hex').slice(0, 16), r = { size: st.size, ext, hash };
    if (ext === 'mp3') { const v2 = id3v2(b); let tags = v2.tags || {}; if (st.size > 128) { const t = Buffer.alloc(128); fs.readSync(fd, t, 0, 128, st.size - 128); if (t.toString('latin1', 0, 3) === 'TAG') { const f = (a, z) => t.toString('latin1', a, z).replace(/\0.*$/, '').trim(); tags = Object.assign({ title: f(3, 33), artist: f(33, 63), album: f(63, 93) }, tags) } }
      let v2b = v2.size || 0; while (v2b && v2b + 10 < n && b.toString('latin1', v2b, v2b + 3) === 'ID3') v2b += ((b[v2b + 6] & 127) << 21 | (b[v2b + 7] & 127) << 14 | (b[v2b + 8] & 127) << 7 | (b[v2b + 9] & 127)) + 10;   /* stacked tags */
      if (b.toString('latin1', v2b + 4, v2b + 8) === 'ftyp' || b.toString('latin1', 4, 8) === 'ftyp') return Object.assign(r, { ok: true, dur: null, tags, container: 'mp4 (named .mp3)' });
      let m = mp3(b, st.size, v2b); if (!m.ok && v2.size && v2.size + 4 > n - 65536 && v2.size < st.size) { const b2 = Buffer.alloc(Math.min(131072, st.size - v2.size)); fs.readSync(fd, b2, 0, b2.length, v2.size); m = mp3(b2, st.size - v2.size, 0) }   /* big cover art: the audio starts past the first read */ return Object.assign(r, { ok: m.ok, dur: m.dur, kbps: m.kbps, tags, container: m.layer || 'mp3', err: m.ok ? null : 'no MPEG frames' }) }
    if (ext === 'wav') { const ok = b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WAVE'; const br = ok ? b.readUInt32LE(28) : 0; return Object.assign(r, { ok, dur: ok && br ? (st.size - 44) / br : null, err: ok ? null : 'bad RIFF' }) }
    const magic = { flac: b.toString('latin1', 0, 4) === 'fLaC', ogg: b.toString('latin1', 0, 4) === 'OggS', m4a: b.toString('latin1', 4, 8) === 'ftyp' || b.readUInt32BE(0) === 0x1a45dfa3, aac: (b[0] === 0xff && (b[1] & 0xf6) === 0xf0) || b.toString('latin1', 0, 3) === 'ID3' }[ext];
    return Object.assign(r, { ok: !!magic, dur: null, err: magic ? null : 'bad header', container: b.readUInt32BE(0) === 0x1a45dfa3 ? 'webm (named .' + ext + ')' : ext }) } catch (e) { return { ok: false, err: String(e.message || e) } } finally { try { fs.closeSync(fd) } catch (e) { } } }

/* ---------- scan ---------- */
const t0 = Date.now(), files = []; for (const R of ROOTS) for (const p of walk(R)) { const pr = probe(p), rel = path.relative(H, p), tags = pr.tags || {}, hay = rel + ' ' + (tags.title || '') + ' ' + (tags.artist || '') + ' ' + (tags.album || '');
  const listed = listedBase.has(path.basename(p).toLowerCase()), cls = OWNER.test(hay) || listed ? 'owner' : tags.artist && !OWNER.test(tags.artist) ? 'third_party' : LIKELY.test(path.dirname(rel)) ? 'likely_owner' : 'unknown';
  files.push({ container: pr.container || pr.ext, path: p, rel, name: path.basename(p), size: pr.size || 0, ext: pr.ext, ok: !!pr.ok, err: pr.err || null, dur: pr.dur ? Math.round(pr.dur) : null, kbps: pr.kbps || null, title: tags.title || null, artist: tags.artist || null, album: tags.album || null, hash: pr.hash, cls, listed }) }
const seen = new Map(); for (const f of files) { const k = f.size + ':' + f.hash; if (seen.has(k)) f.dupOf = seen.get(k); else seen.set(k, f.rel) }
const by = k => files.reduce((a, f) => (a[f[k]] = (a[f[k]] || 0) + 1, a), {});

/* ---------- missing playlist tracks: find + (optionally) restore ---------- */
const restore = []; for (const t of LISTED.filter(t => !t.present)) { const c = files.filter(f => f.ok && f.name.toLowerCase() === t.base), uniq = [...new Set(c.map(f => f.size + ':' + f.hash))];
  const r = { list: t.list, file: t.file, candidates: c.length, status: !c.length ? 'not found' : uniq.length > 1 ? 'ambiguous (different files share the name)' : 'found' };
  if (r.status === 'found' && flag('--restore')) { const dst = path.join(GAME, t.file); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(c[0].path, dst); r.status = 'restored' } restore.push(r) }

/* ---------- optional local library playlist ---------- */
let library = []; const N = +opt('--library', 0); if (N > 0) { const LIB = path.join(GAME, 'assets/music/library'); fs.mkdirSync(LIB, { recursive: true }); const titles = new Set();
  const pick = files.filter(f => f.cls === 'owner' && !f.listed && !f.dupOf && f.ok && f.ext === 'mp3' && f.dur >= 60 && f.dur <= 600).sort((a, b) => a.name.localeCompare(b.name));
  for (const f of pick) { const t = (f.title || f.name.replace(/\.mp3$/i, '')).replace(/_/g, ' ').replace(/\b(V\d+|Udio|Suno)\b/gi, '').replace(/\s+/g, ' ').trim(), key = t.toLowerCase().replace(/[^a-z0-9]/g, ''); if (!key || titles.has(key)) continue; titles.add(key);
    const out = 'lib_' + String(library.length + 1).padStart(3, '0') + '_' + key.slice(0, 40) + '.mp3'; fs.copyFileSync(f.path, path.join(LIB, out)); library.push({ file: 'assets/music/library/' + out, title: t, dur: f.dur }); if (library.length >= N) break }
  fs.writeFileSync(path.join(OUT, 'music_local.js'), '/* generated by tools/music_catalog.mjs - LOCAL ONLY (gitignored). The owner\'s own originals, copied into assets/music/library/. */\nwindow.AV = window.AV || {}; AV.MUSIC = AV.MUSIC || {};\nAV.MUSIC.my_library = ' + JSON.stringify({ name: 'My Library (ZtonedApe originals)', bpm: 90, shuffle: true, local: true, tracks: library.map(({ file, title }) => ({ file, title })) }, null, 1) + ';\n') }

/* ---------- reports (local/) ---------- */
const sum = { scanned: files.length, macStubsSkipped: macStubs, roots: ROOTS.length, secs: +((Date.now() - t0) / 1000).toFixed(1), valid: files.filter(f => f.ok).length, invalid: files.filter(f => !f.ok).length, duplicates: files.filter(f => f.dupOf).length, byClass: by('cls'), byExt: by('ext'), hours: +(files.filter(f => !f.dupOf && f.dur).reduce((a, f) => a + f.dur, 0) / 3600).toFixed(1), restore, library: library.length };
fs.writeFileSync(path.join(OUT, 'music_catalog.json'), JSON.stringify({ generated: new Date().toISOString(), summary: sum, files }, null, 1));
const md = ['# Local music catalogue (LOCAL ONLY - never commit)', '', 'Generated ' + new Date().toISOString() + ' by `tools/music_catalog.mjs`.', '', '| | |', '|---|---|', ...Object.entries({ 'files scanned': sum.scanned, valid: sum.valid, 'invalid / unreadable': sum.invalid, duplicates: sum.duplicates, 'hours (unique, measured)': sum.hours, ...Object.fromEntries(Object.entries(sum.byClass).map(([k, v]) => ['class: ' + k, v])) }).map(([k, v]) => '| ' + k + ' | ' + v + ' |'),
  '', '## Game playlist files missing from the build', '', '| playlist | file | status |', '|---|---|---|', ...restore.map(r => '| ' + r.list + ' | ' + path.basename(r.file) + ' | ' + r.status + ' |'),
  '', '## Owner originals (' + files.filter(f => f.cls === 'owner' && !f.dupOf).length + ' unique)', '', '| file | duration | valid |', '|---|---|---|', ...files.filter(f => f.cls === 'owner' && !f.dupOf).map(f => '| ' + f.rel.replace(/\|/g, '/') + ' | ' + (f.dur ? Math.floor(f.dur / 60) + ':' + String(f.dur % 60).padStart(2, '0') : '?') + ' | ' + (f.ok ? 'yes' : 'NO: ' + f.err) + ' |'),
  '', '## Invalid files', '', ...files.filter(f => !f.ok).slice(0, 200).map(f => '- ' + f.rel + ': ' + f.err)];
fs.writeFileSync(path.join(OUT, 'MUSIC_CATALOG.md'), md.join('\n') + '\n');
console.log(JSON.stringify(Object.assign({}, sum, { restore: restore.reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {}) }), null, 1));
