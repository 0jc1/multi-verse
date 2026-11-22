# NPC conversations — offline engine + optional AI backend

## Offline (default, works everywhere)
* Content lives in `data/npcs.js` (English + Español). Each NPC has a persona, context-aware greetings, topics (keyword intents),
  follow-up questions (yes/no or free answers), contextual quick-reply chips, ambient "barks" (speech bubbles when you walk past) and fallbacks.
* Engine: `js/chat.js`. It scores the player's message against topic keywords (accents ignored, word stems matched), never repeats
  the same line twice in a row, remembers within the session what you talked about, your name (shared by all NPCs), a few facts
  (e.g. Luma remembers your favourite painting), affinity (polite vs rude), and reacts once to the most recent thing you did
  (tipped the band, finished a shift, travelled, bought a bissap, watched the cinema).
* Quests (`js/npc.js`, `AV.quests`): Zil → *Bissap for Luma*, Luma → *A slow gallery walk*, Grakk → *The moss rhythm*,
  Bongo → *Feel the one-drop*, Nix → *Orbit hop*. Rewards are paid by game code only (`AV.txn`), never by dialogue text.
* Add an NPC: add an entry to `AV.NPCS` in `data/npcs.js`, then in a world: `AV.npc.spawn(ctx, 'id', { x, z, yaw })`.

## Optional AI backend (later)
The browser never holds an API key. You host a small endpoint (any language) that calls the model with **your** key.

Enable in the browser console: `AV.setLLMUrl('https://your-endpoint.example/npc')` (stored in this browser only). Clear with `AV.setLLMUrl('')`.

### Request (POST, JSON)
```json
{ "character": "zil", "name": "Zil", "persona": "…", "language": "en",
  "message": "player text (≤300 chars)", "history": [{"r":"player|npc","t":"…"}],
  "memory": { "met": 3, "facts": {"favorite":"Banana Melt"}, "player_name": "Alex", "topics_this_session": ["job"], "affinity": 1 },
  "state": { "job": true, "world": "ape_town", "credits": 215, "rent_days": 0, "day": 1, "time": 560, "quests": {}, "items": {}, "recent_events": ["tip_band"] },
  "allowed_actions": ["offer_job", "start_quest", "suggest_world"] }
```
### Response
```json
{ "reply": "text shown to the player (< 800 chars, no HTML)", "action": { "type": "start_quest", "id": "bissap_luma" } }
```
* The game validates every action: `offer_job` only from Zil; `start_quest` only for a quest that NPC gives and the player has not started;
  `suggest_world` only for playable worlds. Anything else is ignored. No action can change credits.
* Timeout 9 s. On any error the offline engine answers instead, and the chat label says so.
* Recommended server prompt: the persona + "Stay in character, 1–3 sentences, reply in {language}, never invent game features,
  only propose actions from allowed_actions". Rate-limit per IP; never log personal data.
