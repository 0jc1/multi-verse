# M10: Music and bands

## 1. The owner's local audio library (`tools/music_catalog.mjs`)

**Never committed.** `.gitignore` covers:
- `local/`
- `assets/music/library/`
- `assets/music/jungle_dub/`
- `assets/music/stone_ape_band/`

```bash
node tools/music_catalog.mjs                          # catalogue only
node tools/music_catalog.mjs --restore --library 40   # + restore missing playlist files, + a local "my_library" playlist
```

**Scope.** It scans `~/Downloads`, `~/Desktop`, `~/Documents` and `~/Music`, or roots given as arguments. It skips `node_modules`, the game's own checkouts and macOS `._` stubs.

**Validation.** Each file is checked by its header:
- **MP3:** MPEG frame sync (Layer III and Layer II), with stacked ID3 tags and large cover art handled.
- **WAV:** RIFF header.
- **FLAC / Ogg / MP4:** their magic bytes.
- **WebM mislabelled as .m4a:** detected as WebM.

**Tags and duration.** It reads ID3v2/ID3v1 title, artist and album. Duration comes from the Xing/Info frame count, CBR size or the WAV byte rate.

**Duplicates.** Found by size plus a hash of the first 64 KB.

**Classification.**

| Class | Rule |
|---|---|
| owner | ZtonedApe / Stone Ape / Apeverse in the name, path or tags, or listed in `data/music.js` |
| likely_owner | an "ape" folder without a third-party artist tag |
| third_party | another artist's tag |
| unknown | none of the above |

**Outputs (local only):**
- `local/music_catalog.json`
- `local/MUSIC_CATALOG.md`
- `local/music_local.js`

`index.html` loads `local/music_local.js` if it exists (`onerror` removes the tag), so `my_library` only appears on this machine.

**This machine (2026-11-25):**
- **Files:** 5,234 scanned (plus 1,135 macOS `._` stubs skipped). 5,233 are valid; 1 is a broken 5.6 KB file. 277 are duplicates.
- **Classes:** 332 owner, 12 likely owner, 1,692 third party, 3,198 unknown.
- **Owner originals:** 326 unique, about 12.9 h.
- **Restored:** the 16 game playlist files missing from the build (`jungle_dub` 9, `stone_ape_band` 7), found by exact file name.
- **Library:** `my_library` has 40 owner originals (165 MB, local).
- **Third-party tracks** are catalogued only. They are never copied into the game or played.

## 2. Stone Ape Band (Ape Town, Lotus Stage)

**Sets.** Two sets a night: a sunset set at 19:00 and a late set at 22:00, 90 minutes each.

**Setlist board.** A board next to the stage shows:
- the set times
- the setlist, which is the real `stone_ape_band` playlist split into the two sets
- "LIVE NOW" with the current track marked

**Attendance.** Catch 30 game minutes of a set to get +1 music reputation, once per set.

**Stage audio** is unchanged: the playlist plays from the stage as before.

## 3. Your band (Madrid, Sala Malasaña)

**Members.** The musicians you recruit through M11 friendships: Kofi (guitar), Inés (vocals) and Nacho (drums).

**Rehearsals** (11:00–20:00, room 20 credits):
- Members who are far away take the metro to the door, then walk in and stand on the stage platform.
- You play the band jam (pads 1–8). Only hits on the beat count.
- **Skill** grows with on-beat hits and with the number of bandmates present.
- **Songs:** two good rehearsals write a song, with a quality score.

**Gigs** (1+ member, 2+ songs):
- Book one for 22:00. From 21:00 the members walk to the stage.
- At 22:00 a crowd fills the hall. Its size comes from your fans and music reputation, capped by quality level.
- The crowd dances while you play. The members dance on stage.
- **Pay** is the door split: crowd × 9 × (0.4 + quality), where quality mixes beat accuracy, band skill and song quality.
- **Rewards:** fans, music reputation and +5 friendship with each member.
- **Leaving after a few notes** costs reputation, and so does a **no-show**.

## 4. DJ nights

Book a 22:00–02:00 night at a DJ booth. Only one booking at a time.

| Venue | Fee up to | Music rep needed |
|---|---|---|
| Jungle Dub sound system | 70 | 0 |
| La Finca block party, Ape Town | 60 | 0 |
| Flex, Donaukanal, Vienna | 120 | 8 |
| Club Graviton, Astro-9 | 160 | 15 |

**Playing.** Use the booth in the window with the existing DJ mixer.

**Pay** = fee × min(1, seconds on the decks ÷ 90) × (0.75 + 0.1 × mixes, up to 3 mixes) − 2 per second of dead air. A mix is a change of the audible deck (blend or cut) while both decks are running.

**No-shows** cost reputation.

## 5. Band & gigs panel

Open it from the People panel (**Z** → 🎸 Band & gigs) or the 🎫 point in Sala Malasaña.
- **Gig guide:** Stone Ape Band sets, Kofi's busking and gig times, your gig booking, and DJ venues with Book buttons.
- **Your band:** members and roles, skill, songs, fans and gig history.

**Save.** New optional fields:
- `S.band.{skill, songs, fans, gigs, reh, prog, booked}`
- `S.djNights.{booked, nights}` (`S.dj` remains the DJ mixer's own track memory)
- `S.sab.seen`

## Verification

`tools/tests/suite_band.js`, real GPU, Medium (laptop on battery): **62/62**.

**Regression (real GPU):** npc 84/84, music 43/43, dj 33/33, cm 76/76, home 61/61, integration 124/124, madrid 79/79, biz 46/46, traffic 26/26.

**DJ test change.** suite_dj assumed the two tracks it loads can be synced. With the restored and library tracks they were 171 vs 133 BPM, which is out of the ±16 % range, so the mixer correctly refused. The test now gives deck B deck A's track when the pair is out of range. The mixer code is unchanged.

- **Library:** the local playlist loads; every game playlist file is on disk.
- **Real playback, proven:** a restored Stone Ape Band original plays in Ape Town. The audio clock advanced 3.0 s in 3 s, and the catalogue duration of 116 s matches the decoder's 116.3 s.
- **Stone Ape Band:** the setlist board, set times, real titles and live marker all show. Attendance gives +1 rep once.
- **DJ night:** booking works; double-booking is refused; the reputation gate works. The booked night is recognised, time on the decks and mixes are counted, and pay matches the formula.
- **Recruiting:** two members.
- **Rehearsal:**
  - both bandmates walk onto the stage
  - 14/18 hits on the beat (off-beat presses aren't counted)
  - skill grows, and there's no Stone Ape Band tip for your own rehearsal
- **Songs:** 4 rehearsals wrote 2 songs.
- **Gig:**
  - members are called at 21:00 and stand on stage
  - a crowd of 5 (Medium) dances while you play
  - the gig paid 45 credits for 5 fans at 100% beat accuracy
  - bandmates' friendship rises by 5
- **No-show:** −3 reputation.
- **Panels:** gig guide and band panel. The People panel links to them.
- **Persistence:** saved state round-trips, including the DJ mixer's track memory.
- **FPS:** 38–50 during the gig (battery, so this is not a performance claim).

**Bug found:** the DJ bookings first reused the save key `S.dj`, which the DJ mixer already uses for per-track memory. Loading a deck then crashed. They now use `S.djNights`, and the test checks both survive.

## Not done yet

- **On-stage animation:** the members' instruments aren't modelled, and they play the generic dance clip. There's no singing or strumming animation.
- **Song audio:** songs are names with a quality score, not new audio.
- **Venues:** one gig venue (Sala Malasaña). There are no tours or other cities.
- **Stone Ape Band stage:** sets don't change the stage audio; the playlist plays all day as before.
- **Recorded music:** no music sales or streaming.
- **DJ-night crowds:** sized by the existing world crowds near the booth. There's no booked-night crowd surge.
