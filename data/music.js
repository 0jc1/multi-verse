/* APEVERSE V0.9.3 - data/music.js : real music playlists (original Ztonedape tracks, copied byte-for-byte into assets/music/).
   A world opts in with  music: { playlist: '<key>', pos: {x,y,z} (optional, positional source), bed: 0..1 (how much is heard away from the source) }.
   To change what plays, edit the lists below (add/remove/reorder files). If every file of a playlist fails to load,
   the world falls back to its procedural musicProfile, so the game is never silent.
   bpm is an estimate used only to sync stage lights / dancing to the track. */
window.AV = window.AV || {};
AV.MUSIC = {
  jungle_dub: {
    name: 'Jungle Dub Sound System', bpm: 74, shuffle: false,
    tracks: [
      { file: 'assets/music/jungle_dub/dub_hype_part_1_V1.mp3', title: 'Dub Hype — Part 1' },
      { file: 'assets/music/jungle_dub/dub_hype_part_2.mp3', title: 'Dub Hype — Part 2' },
      { file: 'assets/music/jungle_dub/dub_hype_part_3.mp3', title: 'Dub Hype — Part 3' },
      { file: 'assets/music/jungle_dub/dub_hype_part_4.mp3', title: 'Dub Hype — Part 4' },
      { file: 'assets/music/jungle_dub/dub_hype_part_5.mp3', title: 'Dub Hype — Part 5' },
      { file: 'assets/music/jungle_dub/ZtonedApe_I_Will_Stand_dub_V1.mp3', title: 'I Will Stand (dub)' },
      { file: 'assets/music/jungle_dub/ZtonedApe_The_Brighter_the_Moment_dub_V1.mp3', title: 'The Brighter the Moment (dub)' },
      { file: 'assets/music/jungle_dub/ZtonedApe_dub_Sunshine_Every_Day_Udio_V1.mp3', title: 'Sunshine Every Day (dub)' },
      { file: 'assets/music/jungle_dub/Dubbul_O_feat_Ztonedape_V2.mp3', title: 'Dubbul O feat. Ztonedape' }
    ]
  },
  chiang_mai: {
    name: 'Chiang Mai — travel beats from the nearest venue', bpm: 88, shuffle: true,
    tracks: [
      { file: 'assets/music/chiang_mai/ZtonedApe_Travel_the_World_V2.mp3', title: 'Travel the World' },
      { file: 'assets/music/chiang_mai/ZtonedApe_Wanderlust_and_Me_V1.mp3', title: 'Wanderlust and Me' },
      { file: 'assets/music/chiang_mai/ZtonedApe_Time_to_Explore_V1.mp3', title: 'Time to Explore' },
      { file: 'assets/music/chiang_mai/ZtonedApe_The_Road_is_Calling_V1_V1.mp3', title: 'The Road is Calling' },
      { file: 'assets/music/chiang_mai/ZtonedApe_Adventure_Awaits_V2.mp3', title: 'Adventure Awaits' },
      { file: 'assets/music/chiang_mai/ZtonedApe_Travel_instrumental_V1.mp3', title: 'Travel (instrumental)' },
      { file: 'assets/music/chiang_mai/ZtonedApe_Good_Morning_Vibe_V1.mp3', title: 'Good Morning Vibe' },
      { file: 'assets/music/chiang_mai/ZtonedApe_Travel_Happy_This_Year.mp3', title: 'Travel Happy This Year' }
    ]
  },
  stone_ape_band: {
    name: 'Stone Ape Band — live on the Lotus Stage', bpm: 90, shuffle: true,
    tracks: [
      { file: 'assets/music/stone_ape_band/boom_bap_song_3_ztonedape_V1.mp3', title: 'Boom Bap Song 3' },
      { file: 'assets/music/stone_ape_band/gat_ma_back_against_the_wall_ztoned_ape_boom_bap_hip_hop_V1.mp3', title: 'Back Against the Wall' },
      { file: 'assets/music/stone_ape_band/ZtonedApe_In_the_Music_V3.mp3', title: 'In the Music' },
      { file: 'assets/music/stone_ape_band/ZtonedApe_Grinding_Forever_V2.mp3', title: 'Grinding Forever' },
      { file: 'assets/music/stone_ape_band/ZtonedApe_Keep_a_Beat_for_Me_V1.mp3', title: 'Keep a Beat for Me' },
      { file: 'assets/music/stone_ape_band/ZtonedApe_Groove_with_Me.mp3', title: 'Groove with Me' },
      { file: 'assets/music/stone_ape_band/ZtonedApe_Yeah_We_Chill_.mp3', title: 'Yeah We Chill' }
    ]
  }
};
