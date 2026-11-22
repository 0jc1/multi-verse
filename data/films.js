/* APEVERSE V0.9.7 - data/films.js : the user's own long films (hard links in assets/media/films/, originals stay on the Desktop
   in "classic bager yt downloads"). Each film has programme tags; every cinema screen picks its programme by tag:
   lcb = The Last Classic Bangers in order (Ape Town outdoor cinema) · astro = Club Graviton / Astro-9 (Cinema 9)
   jungle = jungle planet + cave songs (Jungle Cinema) · hostel = hostel + Planet Earth episodes (Giant Hostel lounge TV) */
window.AV = window.AV || {};
AV.FILMS = [
  ['lcb_001', 'The Last Classic Bangers — Showreel', 'lcb'], ['lcb_002', 'The Alien Client', 'lcb'], ['lcb_003', 'Transport to the Record Market', 'lcb'],
  ['lcb_004', 'Crok’s Record Stall', 'lcb'], ['lcb_005', 'On the Way to Premo', 'lcb'], ['lcb_006', 'Credits Rule Everything Around Me (Premo’s Studio)', 'lcb'],
  ['lcb_007', 'Journey to the Jungle Planet', 'lcb jungle'], ['lcb_008', 'Inside the Jungle Cave', 'lcb jungle'], ['lcb_009', 'Travel Back to Planet Earth (Channel 7G)', 'lcb hostel'],
  ['lcb_010', 'Walking to Graviton', 'lcb astro'], ['lcb_011', 'Club Graviton Soundcheck', 'lcb astro'], ['lcb_012', 'The Gig That Bent Gravity — Part I', 'lcb astro'],
  ['lcb_013', 'The Gig That Bent Gravity — Part II (Zero-Gravity Concert)', 'lcb astro'], ['lcb_014', 'After the Gig — Club Graviton Stories', 'lcb astro'],
  ['lcb_015', 'Breakfast on Planet Aster-9', 'lcb astro'], ['lcb_016', 'The Weirdest Vending Machine in the Galaxy', 'lcb astro'], ['lcb_017', 'Echoes of Nature', 'lcb jungle'],
  ['lcb_018', 'Find Your New Planet (Retro Commercial)', 'lcb astro'], ['lcb_019', 'Inside the Cave of Vinyls', 'lcb jungle'], ['lcb_020', 'The Cave That Sang', 'lcb jungle'],
  ['lcb_021', 'Cave Song — Part II', 'lcb jungle'], ['lcb_022', 'Cave Song — Part III', 'lcb jungle'], ['lcb_024', 'Out of the Cave, Into Astro-9', 'lcb astro'],
  ['lcb_025', 'Checking Into Astro-9 Hostal', 'lcb astro hostel'], ['lcb_026', 'A Home Between Worlds', 'lcb hostel'], ['lcb_027', 'Getting Ready to Jam at the Hostel', 'lcb hostel'],
  ['lcb_028', 'The Rooftop Jam', 'lcb hostel'], ['lcb_029', 'Party Till the Sunrise', 'lcb hostel'],
  ['orig_graviton_part_song_1', 'Club Graviton — Song 1 (music video)', 'astro'], ['orig_intergalactic_mojo_by_groove_dealers', 'Intergalactic Mojo — Groove Dealers', 'astro'],
  ['orig_frog_crew_top_galactic_charts', 'Frog Crew — Top of the Galactic Charts', 'astro jungle'], ['orig_band_chilling_in_cave', 'The Band Chilling in the Cave', 'jungle'],
  ['orig_pick_your_planet', 'Pick Your Planet', 'lcb astro']
].concat([
  /* ZtonedApe music videos (Desktop\lost old muke\...\Music Videos Ztoned Ape Hip Hop) — these were listed as "not supplied" in data/media.js */
  ['mv_01', 'ZtonedApe — Cosmic Odyssey', 'mv', 'Cosmic_odyssey_ztonedape_music_video_V1.mp4'], ['mv_02', 'ZtonedApe — Dimensional Drift', 'mv', 'dimensional drift ztonedape musicvideo.mp4'],
  ['mv_03', 'ZtonedApe — Elevated', 'mv', 'elevated_V2_ztonedape_music_video.mp4'], ['mv_04', 'ZtonedApe — Feeling Good', 'mv', 'Feeling_Good_Ztoned_Ape_music_video (1).mp4'],
  ['mv_05', 'ZtonedApe — Feeling High', 'mv jungle', 'Feeling_high.mp4'], ['mv_06', 'ZtonedApe — Hip Hop', 'mv', 'hip_hop_ztonedape_music_video_V4.mp4'],
  ['mv_07', 'History of Cannabis (AI animation)', 'mv jungle', 'History_of_Cannabis_ai_animation_V2.mp4'], ['mv_08', 'ZtonedApe — I Love You Mary Jane', 'mv jungle', 'i_love_you_mary_jane_ztoned_ape_musicvideoV1.mp4'],
  ['mv_09', 'ZtonedApe — Joyful', 'mv', 'Joyfull_ZtonedApe_Music_Video_ (1).mp4'], ['mv_10', 'ZtonedApe & Bamb Alejo — Lost on Wanderlust', 'mv hostel', 'lost_on_wanderlust_V1_music_video_ztonedape_bamb_alejo_V4.mp4'],
  ['mv_11', 'ZtonedApe — Metamorphic', 'mv astro', 'metamorphic_ZtonedApe.mp4'], ['mv_12', 'ZtonedApe — Peace & Love', 'mv jungle', 'peace_love_ZtonedApe_V6.mp4'],
  ['mv_13', 'ZtonedApe — Sunshine in a Bag', 'mv jungle', 'Sunshine_in_a_bag_musicvideo_ztonedapemp3_hd_V2.mp4'], ['mv_14', 'ZtonedApe — Today Is a Good Day', 'mv hostel', 'Today_is_a_Good_Day_ZTONEDAPE.mp4'],
  ['mv_15', 'ZtonedApe — Visions in Sound', 'mv astro', 'Visions_in_Sound_ ztoned ape music video.mp4'], ['mv_16', 'ZtonedApe — Weed Weed', 'mv jungle', 'weed_weed_ztonedape music video_V1.mp4'],
  ['mv_17', 'ZtonedApe — Trippy', 'mv astro', 'ztoned_ape_trippy_music_videomp4_V1.mp4'], ['mv_18', 'ZtonedApe — 0 Views (Official)', 'mv', 'ZtonedApe_0_views_Official_Music_Video_V3.mp4'],
  ['mv_19', 'ZtonedApe — I Wanna Travel the World', 'mv hostel', 'ztonedape_I_wanna_travel_the_world_music_video_V1.mp4'], ['mv_20', 'ZtonedApe — Chronic Chronicles', 'mv', 'Chronic Chronicles hip hop MUSICVIDEO ztonedape.mp4']
]).map(([id, title, tags, orig]) => ({ id, title, file: 'assets/media/films/' + id + '.mp4', tags: tags.split(' '), present: true, w: 16, h: 9, filename: orig || id + '.mp4' }));
/* register as cinema features (media.js programme); the old "not supplied" music-video entries are replaced by the real files */
if (AV.MEDIA_DATA) { const have = new Set(AV.FILMS.map(f => f.filename)); AV.MEDIA_DATA.cinema = (AV.MEDIA_DATA.cinema || []).filter(c => !c.film && !have.has(c.filename)).concat(AV.FILMS.map(f => Object.assign({ film: true }, f))) }
