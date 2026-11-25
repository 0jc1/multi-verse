#!/usr/bin/env node
/* Builds data/merch_catalog.json + data/merch_catalog.js (AV.MERCH) from assets/merch/SOURCES.csv (written by the asset step,
   one row per design with the source file + its SHA-256) and the editorial table below (names, brand, collection, quality).
   Adding a design later: put its texture/thumbnail in assets/merch, add a SOURCES.csv row and a META entry, re-run.
   Brands are exact: APEVERSE · MOONMELT SUPPLY CO. · SOLTERRA · ZtonedApe (owner-confirmed 25 Nov 2026; never SOLVERA). */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const csv = fs.readFileSync(path.join(root, 'assets/merch/SOURCES.csv'), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/);
const head = csv.shift().split(','), rows = Object.fromEntries(csv.map(l => { const v = l.split(','), o = {}; head.forEach((h, i) => o[h] = v[i]); return [o.id, o] }));
const A = 'APEVERSE', MM = 'MOONMELT SUPPLY CO.', ST = 'SOLTERRA', ZA = 'ZtonedApe';
const COL = {
  moonmelt: { brand: MM, n: ['Cosmic Campground', 'Campamento Cósmico'] },
  tour: { brand: A, n: ['World Tour', 'Gira Mundial'] },
  coastal: { brand: A, n: ['Sunshine Cut-Paper', 'Recortes de Sol'] },
  cities: { brand: A, n: ['City Souvenirs', 'Recuerdos de Ciudad'] },
  solterra: { brand: ST, n: ['SOLTERRA Originals', 'SOLTERRA Originales'] },
  sunshine: { brand: ST, n: ['Sunshine Series (no wordmark)', 'Serie Sol (sin logotipo)'] },
  ztoned: { brand: ZA, n: ['ZtonedApe Underground', 'ZtonedApe Underground'] } };
/* id: [collection, name en, name es, world affinity] */
const META = {
  moonmelt_stay_mellow: ['moonmelt', 'Stay Mellow', 'Stay Mellow', 'pai'], moonmelt_cosmic_campout: ['moonmelt', 'Cosmic Campout', 'Cosmic Campout', 'pai'], moonmelt_dream_route: ['moonmelt', 'Dream Route', 'Dream Route', 'pai'],
  moonmelt_slow_orbit: ['moonmelt', 'Slow Orbit', 'Slow Orbit', 'pai'], moonmelt_low_tide_high_mind: ['moonmelt', 'Low Tide High Mind', 'Low Tide High Mind', 'pai'],
  world_tokyo: ['tour', 'Tokyo', 'Tokio'], world_sevilla: ['tour', 'Sevilla', 'Sevilla'], world_chefchaouen: ['tour', 'Chefchaouen', 'Chefchaouen'], world_cadiz: ['tour', 'Cádiz', 'Cádiz'],
  world_medellin: ['tour', 'Medellín', 'Medellín'], world_rio: ['tour', 'Rio de Janeiro', 'Río de Janeiro'], world_oaxaca: ['tour', 'Oaxaca', 'Oaxaca'], world_paris: ['tour', 'Paris', 'París'],
  apeverse_coastal_daydream: ['coastal', 'Coastal Daydream', 'Ensueño Costero'], apeverse_sun_moon: ['coastal', 'Sun & Moon', 'Sol y Luna'], apeverse_tropical_fruits: ['coastal', 'Tropical Fruits', 'Frutas Tropicales'],
  apeverse_blue_tides: ['coastal', 'Blue Tides', 'Mareas Azules'], apeverse_sunny_groove: ['coastal', 'Sunny Groove', 'Ritmo Soleado'], apeverse_ape_summer: ['coastal', 'Ape Summer', 'Verano Simio'],
  city_chiang_mai: ['cities', 'Chiang Mai', 'Chiang Mai', 'chiang_mai'], city_madrid: ['cities', 'Madrid', 'Madrid', 'madrid'], city_da_nang: ['cities', 'Da Nang', 'Da Nang', 'da_nang'], city_pai: ['cities', 'Pai', 'Pai', 'pai'],
  city_barcelona: ['cities', 'Barcelona', 'Barcelona'], city_ibiza: ['cities', 'Ibiza', 'Ibiza'], city_amsterdam: ['cities', 'Amsterdam', 'Ámsterdam'], apeverse_same_sky: ['cities', 'Same Sky, Different Places', 'Mismo Cielo, Distintos Lugares'],
  solterra_more_sun: ['solterra', 'More Sun, Less Worries', 'Más Sol, Menos Preocupaciones', 'madrid'], solterra_bloom: ['solterra', 'Bloom Where You Are', 'Florece Donde Estés', 'madrid'],
  solterra_good_energy_club: ['solterra', 'Good Energy Club', 'Club de la Buena Energía', 'madrid'], solterra_nature_heals: ['solterra', 'Nature Heals', 'La Naturaleza Sana', 'madrid'],
  solterra_slow_travel: ['solterra', 'Slow Travel, Deeper Moments', 'Viaje Lento, Momentos Profundos', 'madrid'], solterra_stay_wild: ['solterra', 'Stay Wild', 'Sigue Salvaje', 'madrid'],
  solterra_life_outside: ['solterra', 'Life Is Better Outside', 'La Vida Es Mejor Fuera', 'madrid'], solterra_good_people: ['solterra', 'Good People, Better Days', 'Buena Gente, Mejores Días', 'madrid'],
  ztonedape_bud: ['ztoned', 'Boombox Bud', 'Cogollo Boombox', 'jungle_dub'], ztonedape_dj: ['ztoned', 'Ztoned DJ', 'DJ Ztoned', 'jungle_dub'], ztonedape_bamb_polka: ['ztoned', 'BAMB (polka letters)', 'BAMB (letras de lunares)', 'jungle_dub'], ztonedape_bamb_white: ['ztoned', 'BAMB (white letters)', 'BAMB (letras blancas)', 'jungle_dub'],
  solterra_sunshine_waves: ['sunshine', 'Waves', 'Olas'], solterra_sunshine_cat_nap: ['sunshine', 'Cat Nap', 'Siesta Gatuna'], solterra_sunshine_evening_breeze: ['sunshine', 'Evening Breeze', 'Brisa de la Tarde'], solterra_sunshine_sunny_cat: ['sunshine', 'Sunny Cat', 'Gato Soleado'] };
const designs = [], miss = [];
for (const id in META) { const r = rows[id]; if (!r) { miss.push(id); continue } const [c, en, es, aff] = META[id], crop = r.crop !== 'full';
  if (!fs.existsSync(path.join(root, r.tex)) || !fs.existsSync(path.join(root, r.thumb))) { miss.push(id + ' (files)'); continue }
  designs.push({ id, name: [en, es], brand: COL[c].brand, collection: c, tex: r.tex, thumb: r.thumb, source: r.source, sha256: r.source_sha256,
    sourceRegion: crop ? r.crop + ' of a 4x4 concept sheet (' + r.src_w + 'x' + r.src_h + ' px)' : 'full image ' + r.src_w + 'x' + r.src_h + ' px',
    quality: crop ? 'concept-crop' : 'original', printMaster: crop ? 'MISSING - needs a full-resolution master before any real-world print' : 'source PNG only (not a print master)',
    affinity: aff || null, garments: ['tee', 'hoodie'], realWorldUrl: null }) }
if (miss.length) { console.error('missing:', miss.join(', ')); process.exit(1) }
const held = [
  { source: '1000019536.png', slug: 'solvera_dance_night', reason: 'printed lettering reads SOLVERA; the owner confirmed the brand is SOLTERRA - needs a SOLTERRA-lettered version' },
  { source: '1000019540.png', slug: 'solvera_blue_siesta', reason: 'printed lettering reads SOLVERA; the owner confirmed the brand is SOLTERRA - needs a SOLTERRA-lettered version' }];
const out = { schemaVersion: 1, generated: 'tools/build_merch_catalog.mjs', brands: [A, MM, ST, ZA], collections: COL, prices: { tee: 70, hoodie: 120 }, currency: 'in-game credits only',
  realWorldStore: null, designs, held };
fs.writeFileSync(path.join(root, 'data/merch_catalog.json'), JSON.stringify(out, null, 1) + '\n');
fs.writeFileSync(path.join(root, 'data/merch_catalog.js'), '/* generated by tools/build_merch_catalog.mjs from data/merch_catalog.json sources - do not edit by hand */\nwindow.AV = window.AV || {}; AV.MERCH = ' + JSON.stringify(out) + ';\n');
console.log(designs.length + ' designs · ' + Object.keys(COL).length + ' collections · held ' + held.length);
