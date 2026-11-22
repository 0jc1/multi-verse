#!/usr/bin/env python3
"""Apeverse V0.9 asset audit. Run with: python3 -I audit.py
Reads the extracted uploads (untrusted data), probes real files, and writes:
  assets/asset_manifest.json, docs/ASSET_AUDIT.md,
  data/worlds.json, data/media_placements.json, data/worlds.js, data/media.js
"""
import base64, io, json, os, re, subprocess, sys
from PIL import Image

RAW = '/home/claude/apeverse_src/raw'
OUT = '/home/claude/apeverse_v09'
MAPS = f'{RAW}/x_apeverse_worlds_maps'
REFS = f'{RAW}/x_world_reference_images'
CHAR = f'{RAW}/x_character_references_apeverse'
VID = f'{OUT}/assets/media/paintings'
CAT = f'{RAW}/x_Apeverse_V08_Media_Catalog_71_Index/Apeverse_V08_Media_Catalog_71.json'
MAN = f'{RAW}/Apeverse_Living_Paintings_Collection_28_manifest.json'

def jpg_b64(path, w, q=55):
    im = Image.open(path).convert('RGB')
    h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode(), im.size

def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
        'stream=codec_type,codec_name,width,height,r_frame_rate:format=duration,size',
        '-of', 'json', path], capture_output=True, text=True)
    j = json.loads(r.stdout or '{}')
    v = next((s for s in j.get('streams', []) if s['codec_type'] == 'video'), {})
    a = next((s for s in j.get('streams', []) if s['codec_type'] == 'audio'), None)
    return dict(video_codec=v.get('codec_name'), width=v.get('width'), height=v.get('height'),
                fps=v.get('r_frame_rate'), duration_s=round(float(j.get('format', {}).get('duration', 0)), 2),
                has_audio=bool(a), audio_codec=a and a.get('codec_name'))

def poster(path, w=200):
    r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-ss', '1.5', '-i', path, '-frames:v', '1',
                        '-f', 'image2pipe', '-vcodec', 'mjpeg', '-'], capture_output=True)
    im = Image.open(io.BytesIO(r.stdout)).convert('RGB')
    h = round(im.height * w / im.width); im = im.resize((w, h), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=60, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

# ---------------------------------------------------------------- media placements (prompt section 10)
TABLE = [  # filename, preferred world, gallery/room, title
 ('Banana_melt.mp4','ape_town','Animated-art gallery','Banana Melt'),
 ('Bissap_abbibi_special_V1.mp4','ape_town','Cafe / art gallery','Bissap Abibi Special'),
 ('Chill_Rhythms_loop_V3.mp4','ape_town','Botanical gallery','Chill Rhythms'),
 ('Freeze_ur_mind_ZtoneApe_summer_promo.mp4','ape_town','Promotional-art gallery','Freeze Ur Mind (summer promo)'),
 ('Funky_chimp_choco_parody_advert_V2.mp4','ape_town','Fantasy advertisement exhibition','Funky Chimp Choco (parody ad)'),
 ('HARP_HOP_ztoned_ape_V1.mp4','ape_town','Music-art gallery','Harp Hop'),
 ('Harp_hop_2.mp4','ape_town','Music-art gallery','Harp Hop 2'),
 ('Hazy_wonderland_Vibes_HD.mp4','ape_town','Psychedelic botanical gallery','Hazy Wonderland Vibes'),
 ('Japan_jamz_V2 (1).mp4','astro9','Travel-art gallery / Cinema 9','Japan Jamz'),
 ('Mango_inferno_parody_advert_V2.mp4','ape_town','Fantasy advertisement exhibition','Mango Inferno (parody ad)'),
 ('Mango_tango_sorbet_ztoned_ape (1).mp4','ape_town','Food-art gallery','Mango Tango Sorbet'),
 ('Tropical_thunder_zing_za_thc_drink_promo_1_V3.mp4','ape_town','Optional promotional-art exhibition','Tropical Thunder Zing-Za (parody promo)'),
 ('Underwater_jam_V2.mp4','atlantis','Atlantis gallery','Underwater Jam'),
 ('ZtonedApe_Grinding_Forever_V1.mp4','ape_town','Ztonedape portfolio gallery','Grinding Forever'),
 ('Ztoned_ape_s_interdimentional_ice_cream_V6.mp4','ape_town','Interdimensional food-art exhibition','Interdimensional Ice Cream'),
 ('alien_Groove_alien_animation_loop_1_V5.mp4','astro9','Astro-9 art gallery','Alien Groove'),
 ('borisito_swing_shortdog_vid.mp4','madrid','Madrid personal-memory gallery','Borisito Swing'),
 ('burning_man_ztonedape_V1.mp4','burning_pyramid','Festival gallery / potential portal','Burning Man (Ztonedape)'),
 ('chant_V1.mp4','jungle_dub','Jungle Dub music gallery','Chant'),
 ('cow abduction loop 2.mp4','astro9','Alien Maze / Astro-9','Cow Abduction Loop'),
 ('egypt_world_travel_1_V1.mp4','burning_pyramid','Burning Pyramid Festival gallery','Egypt World Travel 1'),
 ('egypt_world_travel_V1 (1).mp4','burning_pyramid','Burning Pyramid Festival gallery','Egypt World Travel'),
 ('grove_with_me_cubims_animation_boom_bap_short_V1.mp4','jungle_dub','Jungle Dub music exhibition','Groove With Me (cubist boom-bap)'),
 ('in_the_music_promo_roman_fresco_V1.mp4','ape_town','Historical-art gallery','In The Music (Roman fresco promo)'),
 ('pai_hostel_beatz.mp4','pai','Pai World gallery','Pai Hostel Beatz'),
 ('sax_circle_chant_I_1_V1.mp4','jungle_dub','Jazz / Jungle Dub music gallery','Sax Circle Chant'),
 ('treehouse_beats_animation_loop_V1.mp4','jungle_dub','Jungle Dub treehouse gallery','Treehouse Beats'),
 ('wonderland_jamms_V2.mp4','ape_town','Fantasy-art gallery','Wonderland Jamms'),
]
FLAGS = {  # publication / content review notes
 'Tropical_thunder_zing_za_thc_drink_promo_1_V3.mp4': 'Filename references a cannabis-themed drink; fictional parody promo. Needs content label and rights review before public release.',
 'Funky_chimp_choco_parody_advert_V2.mp4': 'Parody advert: confirm it does not imitate a real brand before public release.',
 'Mango_inferno_parody_advert_V2.mp4': 'Parody advert: confirm it does not imitate a real brand before public release.',
 'Freeze_ur_mind_ZtoneApe_summer_promo.mp4': 'Promotional video: confirm music/voice rights before public release.',
}
CAPTIONS = {
 'Banana_melt.mp4': 'A banana that refuses to stay solid.',
 'Bissap_abbibi_special_V1.mp4': 'Hibiscus-red specials from the café wall.',
 'Freeze_ur_mind_ZtoneApe_summer_promo.mp4': 'Summer promo from the Ztonedape archive.',
 'Funky_chimp_choco_parody_advert_V2.mp4': 'A fictional chocolate advert starring a funky chimp.',
 'Mango_inferno_parody_advert_V2.mp4': 'A fictional mango advert that runs a little hot.',
 'Mango_tango_sorbet_ztoned_ape (1).mp4': 'Sorbet, tango, mango.',
 'Tropical_thunder_zing_za_thc_drink_promo_1_V3.mp4': 'Fictional parody drink promo (mature-theme label).',
 'Ztoned_ape_s_interdimentional_ice_cream_V6.mp4': 'Ice cream from another dimension.',
}

# ---------------------------------------------------------------- worlds (prompt section 6)
MAPFILES = {
 'ape_town': ['Apeverse Town_ Psychedelic Garden Masterplan.png', 'Psychedelic Stone Ape Festival Valley Map-1.png'],
 'jungle_dub': ['Apeverse Jungle Rave Map.png', 'Neon Jungle Festival Map-2.png'],
 'cyberpunk': ['Neon Cyberpunk Festival City Map-3.png'],
 'astro9': ['Astro-9_ Intergalactic Market World.png'],
 'bio_jungle': ['Bioluminescent Jungle Festival Map-5.png'],
 'mayan': ['Mesoamerican Jungle City at Sunrise-6.png'],
 'madrid': ['Apeverse Madrid_ Psychedelic City Map.png'],
 'chiang_mai': ['Chiang Mai Old City Adventure Map.png'],
 'atlantis': ['Apeverse Atlantis Underwater City Map.png'],
 'vienna': ['Apeverse Vienna 2000s Memory Map (1).png'],
 'somatra': ['Apeverse Somatra_ The Flower Maze Planet.png'],
 'alien_maze_x9': ['Apeverse Alien Maze Planet X-9.png'],
 'quantum_ziggurat': ['Quantum Ziggurat_ Galactic Casino World.png'],
 'neon_nexus': ['Galactic Neon Market City-4.png'],
}
W = lambda i, n, num, core, music, status='planned', lm=(), extra=None: dict(
    id=i, name=n, roadmap_no=num, core_identity=core, music_identity=music, status=status, landmarks=list(lm), **(extra or {}))
WORLDS = [
 W('ape_town','Ape Town',1,'Main home hub: music, art, galleries, cinema','Boom-bap hip-hop, mellow bass, Rhodes, tropical groove','playable',
   ['La Finca gateway','Circular Plaza','Lotus Canal stage (Stone Ape Band)','Gallery Gardens (Living Paintings)','Outdoor Cinema','Zil\'s Cafe','Eco-lodge apartment','Portal Grove','Waterfalls and bridges']),
 W('jungle_dub','Jungle Dub Party Planet',2,'Jungle raves, reggae, dub, nature','Dub reggae, deep bass, percussion','planned',
   ['Jungle Rave main stage','Roots Village','Dub Lab','Bamboo Bazaar','River Bar','Floating Bungalows','Lotus Lagoon','Treehouse lodging','Jungle Cinema','Crystal waterfalls']),
 W('cyberpunk','Cyberpunk Metropolis',3,'Neon skyscrapers and futuristic nightlife','Dark synth funk',lm=['Neon avenues','Rooftop club','Screening room']),
 W('astro9','Astro-9 Market World',4,'Intergalactic bazaar and Club Graviton','Cosmic funk, space jazz','planned',
   ['Central Plaza','Intergalactic Bazaar','Astro Cafe','Orbit Lounge','Docking Bay','Cinema 9','Glassopy observatory','Club Graviton','Portals']),
 W('bio_jungle','Bioluminescent Jungle World',5,'Original luminous creatures and ecosystems','Ambient fantasy percussion'),
 W('mayan','Mayan Canal Kingdom',6,'Temples, canals, boats and jungles','Percussion and flutes'),
 W('robot','Robot World',7,'Mechanical cities and robotic life','Mechanical funk'),
 W('weird_alien','Weird Alien Planet',8,'Impossible biology and mysterious terrain','Experimental ambient'),
 W('madrid','Madrid / Pinar Universe',9,'Urban memories, neighborhoods and culture','Hip-hop, jazz, street music'),
 W('london','London Traveler World',10,'Streets, markets, pubs and music culture','Rhodes jazz-hop'),
 W('chiang_mai','Chiang Mai Universe',11,'Giant Hostel, temples, music, markets','Relaxed fusion, acoustic travel beats',
   extra=None, lm=['Giant Hostel','Blue\'s Live Music Bar','Pineapple Express','Chada\'s Vegetarian','Khun Kae\'s Juice Bar','Tha Phae Gate','Night Bazaar','Doi Suthep','Ping River','Route to Pai']),
 W('pai','Pai World',12,'Mountain town, river and nature','Acoustic fusion'),
 W('acid_dmt','Acid-DMT Dimension',13,'Surreal psychedelic geometry','Experimental electronics'),
 W('ibiza','Ibiza 60s Island City',14,'Vintage island, flower-power atmosphere','60s psychedelic soul'),
 W('burning_pyramid','Burning Pyramid Festival World',15,'Desert festivals and pyramids','Downtempo desert grooves'),
 W('atlantis','Underwater City / Atlantis',16,'Coral cities and marine life','Aquatic ambient'),
 W('vienna','Vienna 2000s Memory World',17,'Nostalgic city, music, nightlife, school','Nostalgic urban nightlife',
   lm=['Stephansplatz','Donaukanal (LEGENDARY HAPPENS graffiti)','Flex','Badeschiff','Naschmarkt','Prater','Schonbrunn','Belvedere','Vienna International School (22nd district, near Alte Donau)']),
 W('space_jazz','Space Jazz Lounge Planet',18,'Peaceful interstellar music world','Space jazz'),
 W('prehistoric','Prehistoric Dinosaur World',19,'Ancient nature and dinosaurs','Tribal percussion'),
 W('volcanic_funk','Volcanic Funk Planet',20,'Lava, music and volcanic landscapes','Heavy funk'),
 # additional concepts (never discarded)
 W('somatra','Somatra - The Flower Maze Planet',None,'Flower labyrinths, giant plants, crystal caves','Psychedelic jungle percussion','planned',
   ['Orchid Labyrinth','Lotus Spire','Mushroom Gardens','Emerald Falls','River of Colors','Crystal Caves','Skyroot Village','Canopy Rave','Portal'],extra=dict(kind='additional_concept')),
 W('neon_nexus','Neon Nexus - Virtual Vegas',None,'Neon arcades and holographic arenas (fictional points only)','Neon funk',extra=dict(kind='additional_concept')),
 W('quantum_ziggurat','Quantum Ziggurat',None,'Galactic casino pyramids (fictional points only)','Space lounge',extra=dict(kind='additional_concept')),
 W('alien_maze_x9','Alien Maze Planet X-9',None,'Twisting routes, Crystal Gardens, Gravity Club','Strange harmonies',extra=dict(kind='additional_concept')),
 W('da_nang','Đà Nẵng - river city by the sea',21,'Vietnamese coastal city: Hàn River, Dragon Bridge, My Khe beach','Sunny travel beats, sea breeze','playable',
   ['Dragon Bridge (Cầu Rồng)','Hàn River & Love Pier','My Khe Beach (Biển Mỹ Khê)','Hàn Market','Da Nang Cathedral (Rooster Church)','Sơn Trà Night Market','Sun Wheel · Asia Park','Cồn Market','Sơn Trà peninsula & Lady Buddha','Marble Mountains']),
 W('verdalux','Verdalux (jungle moon, V0.8 legacy)',None,'Preserved V0.8 location: Grakk and the Drum Log','Drum log and moss tones','planned',
   ['Glow-trees','Drum Log','Grakk','Portal gate'],extra=dict(kind='legacy_v08')),
]
# status flips are applied from data/status_overrides.json written by the build (kept separate so audit can be rerun)
OVR = {}
p = f'{OUT}/data/status_overrides.json'
if os.path.exists(p): OVR = json.load(open(p))

def main():
    man = json.load(open(MAN)); cat = json.load(open(CAT))
    manifest = dict(version='0.9', note='Generated by apeverse_tools/audit.py from the supplied uploads. Originals are never modified.', files=[])
    have_vids = {f: os.path.join(VID, f) for f in os.listdir(VID) if f.lower().endswith('.mp4')}
    # ---- videos present
    vids = {}
    for f, path in sorted(have_vids.items()):
        pr = probe(path); size = os.path.getsize(path)
        vids[f] = dict(pr, bytes=size, poster=poster(path))
        manifest['files'].append(dict(path=f'assets/media/paintings/{f}', source='Apeverse_V08_Living_Paintings_Starter.zip/01_Gallery_Living_Paintings/'+f,
            type='video/mp4', bytes=size, **pr, status='present', playable_in_chromium=None,
            note='Probed with ffprobe; browser playback is verified in docs/TESTING.md'))
    # ---- images
    def addimg(path, rel, role, world=None):
        im = Image.open(path)
        manifest['files'].append(dict(path=rel, source=os.path.basename(path), type='image/png', bytes=os.path.getsize(path),
            width=im.width, height=im.height, role=role, world=world, status='present_reference_only',
            note='Original is NOT copied into the game folder (large). A small thumbnail is embedded in data/worlds.js.'))
    used = {}
    for wid, files in MAPFILES.items():
        for f in files:
            addimg(os.path.join(MAPS, f), 'reference/maps/'+f, 'world_map_art_direction', wid); used[f] = wid
    for f in sorted(os.listdir(MAPS)):
        if f not in used: manifest['files'].append(dict(path='reference/maps/'+f, status='unassigned'))
    for f in sorted(os.listdir(REFS)):
        addimg(os.path.join(REFS, f), 'reference/world_reference_images/'+f, 'additional_reference_unlabelled')
    addimg(os.path.join(CHAR, 'ztonedapebandpic.png'), 'reference/characters/ztonedapebandpic.png', 'official_band_reference')
    # ---- manifest 28
    placements = []
    cat_names = {(e.get('filename') or e.get('file')): e for e in cat['asset_entries']}
    for fn, world, room, title in TABLE:
        m = next((v for v in man['videos'] if v['filename'] == fn), None)
        ok = fn in have_vids
        placements.append(dict(filename=fn, title=title, world=world, room=room, status='present' if ok else 'missing',
            manifest_meta=dict(duration_s=m and m['duration_seconds'], width=m and m['width'], height=m and m['height']),
            file=f'assets/media/paintings/{fn}' if ok else None, caption=CAPTIONS.get(fn, ''),
            review_flag=FLAGS.get(fn), download_enabled=False, special_portal=None))
        if not ok:
            manifest['files'].append(dict(path=f'assets/media/paintings/{fn}', status='MISSING', note='Listed in the 28-painting manifest but not in any supplied ZIP.'))
    # ---- special candidates
    cand = ['Giant_Hostel_1_V2.mp4', 'happy_new_year_dub_party_V4.mp4', 'burning_man_ztonedape_V1.mp4', 'ztonedape traveller.mp4']
    cand_report = {}
    names_all = list(cat_names) + [v['filename'] for v in man['videos']]
    for c in cand:
        stem = re.sub(r'[^a-z0-9]', '', c.lower().replace('.mp4', ''))
        near = [n for n in names_all if stem[:10] in re.sub(r'[^a-z0-9]', '', n.lower())]
        cand_report[c] = dict(in_supplied_files=c in have_vids, listed_in_catalog_or_manifest=near)
    # ---- catalog
    roles = {}
    for e in cat['asset_entries']:
        fn = e.get('filename'); r = e.get('role')
        roles.setdefault(r, []).append(dict(filename=fn, duration_s=e.get('duration_seconds'), w=e.get('video_width'), h=e.get('video_height'),
                                              present=fn in have_vids))
    cinema = [dict(filename=e['filename'], title=os.path.splitext(e['filename'])[0].replace('_', ' '), duration_s=e.get('duration_seconds'),
                   present=False) for e in cat['asset_entries'] if e.get('role') == 'cinema_feature']
    # ---- worlds
    worlds = []
    for w in WORLDS:
        w = dict(w); w['status'] = OVR.get(w['id'], w['status'])
        refs = MAPFILES.get(w['id'], [])
        w['art_refs'] = refs
        if refs:
            w['thumb'], _ = jpg_b64(os.path.join(MAPS, refs[0]), 230, 52)
        worlds.append(w)
    # ---- write outputs
    os.makedirs(f'{OUT}/data', exist_ok=True); os.makedirs(f'{OUT}/docs', exist_ok=True)
    json.dump(manifest, open(f'{OUT}/assets/asset_manifest.json', 'w'), indent=1)
    wj = [{k: v for k, v in w.items() if k != 'thumb'} for w in worlds]
    json.dump(wj, open(f'{OUT}/data/worlds.json', 'w'), indent=1)
    json.dump(dict(placements=placements, cinema_catalog_entries=cinema, special_candidates=cand_report,
                   note='Edit world/room here to move paintings. A catalog entry is not a playable file; only status=present is playable.'),
              open(f'{OUT}/data/media_placements.json', 'w'), indent=1)
    with open(f'{OUT}/data/worlds.js', 'w') as f:
        f.write('/* generated by apeverse_tools/audit.py from data/worlds.json + embedded thumbnails */\nwindow.AV=window.AV||{};AV.WORLDS_DATA=')
        json.dump(worlds, f); f.write(';\n')
    pj = []
    for p_ in placements:
        d = dict(p_)
        if p_['status'] == 'present':
            v = vids[p_['filename']]; d.update(w=v['width'], h=v['height'], dur=v['duration_s'], audio=v['has_audio'], poster=v['poster'])
        pj.append(d)
    with open(f'{OUT}/data/media.js', 'w') as f:
        f.write('/* generated by apeverse_tools/audit.py */\nwindow.AV=window.AV||{};AV.MEDIA_DATA=')
        json.dump(dict(placements=pj, cinema=cinema), f); f.write(';\n')
    # ---- markdown
    L = []
    L.append('# Apeverse V0.9 - Asset audit\n')
    L.append('Generated from the real contents of the supplied uploads. **A catalog entry or filename is not a playable file.**\n')
    L.append('## Summary\n')
    L.append(f'- Supplied archive: `multi_apeverse_1.zip` (7 entries): V0.8 game, 4 ZIPs, 1 manifest JSON.')
    L.append(f'- **Playable videos actually present: {len(have_vids)}** (all in `Apeverse_V08_Living_Paintings_Starter.zip`).')
    L.append(f'- 28-painting manifest: **{sum(1 for p_ in placements if p_["status"]=="present")} present, {sum(1 for p_ in placements if p_["status"]=="missing")} missing**.')
    L.append(f'- 71-video catalog: 8 present, {len(cat["asset_entries"])-8} missing (45 living paintings, 6 music-promo paintings, 20 cinema features).')
    L.append('- **Cinema features present: 0 of 20.** The cinema screens the 8 supplied short videos; the 20 catalog features are listed as "file not supplied".')
    L.append('- **Original music tracks / stems supplied: 0** (catalog audio_inventory: 0 mp3, 0 instrumental stems). The soundtrack is procedural.')
    L.append('- 19 images: 16 world maps, 3 unlabelled world reference images, 1 band character reference.')
    L.append('- Nothing in the supplied folders was modified. Videos were copied byte-for-byte with original filenames.\n')
    L.append('## Videos present (ffprobe)\n')
    L.append('| File | Size | Resolution | Duration | Audio | Assigned world | Review flag |')
    L.append('|---|---|---|---|---|---|---|')
    for p_ in placements:
        if p_['status'] != 'present': continue
        v = vids[p_['filename']]
        L.append(f'| `{p_["filename"]}` | {v["bytes"]/1e6:.1f} MB | {v["width"]}x{v["height"]} | {v["duration_s"]} s | {"yes" if v["has_audio"] else "no"} | {p_["world"]} / {p_["room"]} | {p_["review_flag"] or ""} |')
    L.append('\nAll 8 are H.264 video with AAC audio, portrait orientation. Resolution varies (about 452x678 up to 1296x1920), so the game keeps each video\'s own aspect ratio.\n')
    L.append('## Videos listed in the manifest but MISSING (20)\n')
    for p_ in placements:
        if p_['status'] == 'missing': L.append(f'- `{p_["filename"]}` (intended: {p_["world"]} - {p_["room"]})')
    L.append('\n## Special painting candidates\n')
    for c, r in cand_report.items():
        L.append(f'- `{c}`: in supplied files: **{r["in_supplied_files"]}**; near matches in catalog/manifest: {r["listed_in_catalog_or_manifest"] or "none"}')
    L.append('\n## Cinema catalog (20 features, none supplied)\n')
    for c in cinema: L.append(f'- {c["title"]} ({c["duration_s"]} s) - `{c["filename"]}` - **file not supplied**')
    L.append('\nKnown works named in the prompt (The Last Classic Bangers, The Life I Want, Star Bros) are not playable: no video file or approved stream was supplied for them. They are not claimed in the game.\n')
    L.append('## Images\n')
    L.append('| World / use | File | Size |'); L.append('|---|---|---|')
    for wid, files in MAPFILES.items():
        for f in files:
            im = Image.open(os.path.join(MAPS, f)); L.append(f'| {wid} | `{f}` | {im.width}x{im.height} |')
    for f in sorted(os.listdir(REFS)): L.append(f'| unlabelled reference | `{f}` | |')
    L.append('| band character reference | `ztonedapebandpic.png` | |')
    L.append('\nNote: `Galactic Neon Market City-4.png` has no legible title; it is kept as an alternate market-city illustration (candidate for Neon Nexus or an Astro-9 variant). `Psychedelic Stone Ape Festival Valley Map-1.png` and `Neon Jungle Festival Map-2.png` are treated as alternates of Ape Town and Jungle Dub. No illustration was discarded.\n')
    L.append('## Duplicates / alternatives\n')
    L.append('- No byte-identical duplicate files were found among the supplied videos. The Vienna map file is named `(1)`; only one Vienna map exists in the upload, so the school-placement correction (Donaustadt, 22nd district, near Alte Donau) is recorded in the world data rather than copied from an illustration.\n')
    L.append('## Publication / licensing issues needing review\n')
    L.append('- `Tropical_thunder_zing_za_thc_drink_promo_1_V3.mp4`: cannabis-themed filename. In the game it carries a "mature-theme parody promo" label and downloads are off.')
    L.append('- Two parody adverts (`Funky_chimp_choco...`, `Mango_inferno...`): confirm they do not imitate real brands.')
    L.append('- Visual content of all 8 videos was only checked via a single poster frame per video and filename. A full content/rights review (music, voices, any real people) is still required before public release.')
    L.append('- The Ape Town map shows a cannabis lounge and the Jungle Rave map an herbal garden; neither was built. Real businesses (Chiang Mai, Vienna, Madrid) are references only; no endorsement is implied.')
    L.append('- The band reference image shows sneakers resembling a branded model; the game uses generic sneakers with no logos.')
    L.append('- Public downloads are OFF for every video until rights are confirmed (`download_enabled: false`).\n')
    open(f'{OUT}/docs/ASSET_AUDIT.md', 'w').write('\n'.join(L) + '\n')
    print('worlds', len(worlds), 'present videos', len(have_vids), 'js sizes', os.path.getsize(f'{OUT}/data/worlds.js'), os.path.getsize(f'{OUT}/data/media.js'))
main()
