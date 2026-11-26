// Builds the world-by-system status table from a suite_audit21 run:  node tools/audit_board.mjs <results.json> > table.md
// Statuses are honest: AUTO-TESTED ONLY means an automated probe exercised it in the real game on the GPU, not a human playtest.
import fs from 'fs';
const res = JSON.parse(fs.readFileSync(process.argv[2], 'utf8').replace(/^﻿/, ''));
const checks = res.checks || res.results || res;
const dump = (Array.isArray(checks) ? checks : []).find(c => /dump: audit json/.test(c.n || c.name));
if (!dump) { console.error('no dump check'); process.exit(1) }
const A = JSON.parse(dump.d || dump.detail);
const NAMES = { madrid: 'Madrid', ape_town: 'Ape Town', chiang_mai: 'Chiang Mai', pai: 'Pai', astro9: 'Astro-9', jungle_dub: 'Jungle Dub', vienna: 'Vienna', da_nang: 'Da Nang', koh_tao: 'Koh Tao', koh_samui_jurassic: 'Jurassic Koh Samui', jerusalem: 'Jerusalem', judean_desert: 'Judean Desert', verdalux: 'Verdalux' };
const isEff = (id, k) => /^effect:(smoke|psy|glow|alien)/.test(k);
const rows = [];
rows.push('| World | Food / drink (bought in probe) | Alcohol | Fictional effects item | Consume chain | Transport | Map + GPS | Festival | Arrival frame |');
rows.push('|---|---|---|---|---|---|---|---|---|');
for (const id of A.order) { const a = A.worlds[id]; if (!a) { rows.push(`| ${NAMES[id]} | not run | | | | | | | |`); continue } if (!a.load) { rows.push(`| ${NAMES[id]} | **BLOCKED: did not load** | | | | | | | |`); continue }
  const b = a.bought || {}, ids = Object.keys(b);
  const food = ids.filter(k => b[k] === 'food' || /^drink/.test(b[k]) || b[k] === 'effect:buzz');
  const alc = ids.filter(k => b[k] === 'alcohol'); const eff = ids.filter(k => isEff(k, b[k]));
  const fxd = Object.keys(a.fxDirect || {}).filter(t => t !== 'drink');
  const chain = Object.entries(a.chain || {}).map(([k, v]) => k + ': ' + v).join('; ');
  const st = (ok, partial) => ok ? 'AUTO-TESTED ONLY' : partial ? 'PARTIAL' : '**MISSING**';
  const tr = a.taxiCfg ? `taxi stand (${a.taxiStands})` : ''; const veh = [...new Set(a.vehicles || [])].join(', ');
  rows.push(`| ${NAMES[id]} | ${st(food.length > 0)}: ${food.slice(0, 6).join(', ') || '-'} | ${alc.join(', ') || '-'} | ${st(eff.length > 0, fxd.length > 0)}: ${eff.join(', ') || (fxd.length ? 'direct fx ' + fxd.join(',') : 'none')} | ${chain || '-'} ${a.noVisuals ? '· visuals-off: ' + a.noVisuals : ''} | ${st(!!(tr || veh), false)}: ${[tr, veh].filter(Boolean).join(' · ') || 'none'} | ${a.places} places, ${a.roads} road segs, route ${a.route || '-'} | ${(a.fest || []).join(', ') || '-'} | ${a.fps} fps, ${a.calls} calls |`) }
console.log(rows.join('\n'));
