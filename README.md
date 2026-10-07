# Little Explorer's World

A talking world-map game for young children (made for a 6-year-old). Tully the turtle reads every
question aloud, so no reading is needed to play.

**Play it:** https://little-explorer.nammhs-2004.workers.dev

## What's inside

- **Explore**: tap anything on the map, or spin a 3D globe, to hear its name and a fun fact.
- **Find It!**: "Where is Africa?" Tap the map. Levels open one by one: Oceans, Continents,
  Countries (28 well-known ones), then Capitals.
- **Match It**: drag an animal, flag or capital card to its home on the map.
- **Flag Fun**: pick the right flag out of four, or say whose flag is shown.
- **Atlas**: a reference map with every country, continent and ocean named; more names appear as you zoom.
- **Sticker Book**: 96 stickers to collect. Progress is saved in the browser only (`localStorage`).

Wrong answers never lose: Tully gives a clue, then points, then the answer glows.
A grown-ups' corner (press and hold ⚙️) sets talking speed, opens all levels or resets stickers.

## How it's built

- One page, `little-explorer.html`: plain HTML, CSS and JavaScript, with d3 from cdnjs for the map
  projections (a flat Natural Earth map in SVG and an orthographic globe on canvas).
- `content.js` holds the game's data and every sentence Tully says (`LINES`), shared by the page and
  the voice build.
- Tully's voice is pre-recorded with ElevenLabs, one MP3 per sentence (`voice/<key>.mp3`, keyed by a
  hash of the sentence). The page plays the recordings in order and falls back to the browser's
  `speechSynthesis` for any sentence without one, so it still talks without the recordings.
- `data/world-50m.json`: Natural Earth 1:50m countries as TopoJSON, used for the flat map and atlas.
  Shared borders are stored once and drawn as one line (`topojson.mesh`), with coastlines separate.
- `data/world.json`: Natural Earth 1:110m GeoJSON, light enough for the spinning canvas globe.
- Russia is split at the Urals and overseas France (French Guiana, the French Caribbean, Réunion and
  Mayotte) is split from France, so each part is coloured by its own continent.
- Oceans are not in the map data; the page works out which ocean was tapped from simple
  latitude/longitude boundaries (`oceanAt` in the page).

## Rebuild and deploy

```bash
cd tools && npm install && node build-data.mjs   # data/*.json and flags/
ELEVENLABS_API_KEY=... node build-voice.mjs      # voice/: records only sentences that are new
cd .. && tools/build-site.sh                    # public/ (full HTML document + data + flags + voice)
npx wrangler deploy                             # static assets on Cloudflare Workers
```

The recordings are not in git (about 24 MB). `build-voice.mjs` reads the key from the environment,
sends it only to the ElevenLabs API and never writes it to disk; `DRY_RUN=1` counts what is missing,
and `MAX_COST` caps the credits one run may spend. Rewording a line in `content.js` only re-records
the sentences that changed.

The page itself has no doctype or `<head>` because it is also published as a claude.ai Artifact,
which adds them; `build-site.sh` wraps it in a full HTML document for Cloudflare.

## Credits

Map data from Natural Earth (public domain). Flags from flag-icons (MIT). See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
