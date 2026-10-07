// Records every sentence Tully can say with ElevenLabs, into ../voice/<key>.mp3, plus ../voice/index.json.
// The API key is read from the environment and only ever sent to api.elevenlabs.io; it is never
// written to disk. Sentences that already have a recording are skipped, so re-runs only pay for new lines.
//
//   ELEVENLABS_API_KEY=... node build-voice.mjs            record what is missing
//   DRY_RUN=1 node build-voice.mjs                          just count what is missing
//
// Optional: VOICE_ID (default: Jessica, a built-in ElevenLabs voice), MAX_COST (stop after this many
// credits, default 30000), CONCURRENCY (default 3).
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { allLines, splitSentences, voiceKey } = require("../content.js");

const VOICE_ID = process.env.VOICE_ID || "cgSgspJ2msm6clMCkdW9"; // Jessica
const MODEL = "eleven_flash_v2_5";
const SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.3, speed: 0.95 };
const MAX_COST = Number(process.env.MAX_COST || 30000);
const CONCURRENCY = Number(process.env.CONCURRENCY || 3);
const DRY = !!process.env.DRY_RUN;
const OUT = new URL("../voice/", import.meta.url);

// every place name the maps can produce
const places = new Map();
for (const f of JSON.parse(fs.readFileSync(new URL("../data/world.json", import.meta.url))).features) places.set(JSON.stringify(f.properties), f.properties);
const topo = JSON.parse(fs.readFileSync(new URL("../data/world-50m.json", import.meta.url)));
for (const g of topo.objects.countries.geometries) places.set(JSON.stringify(g.properties), g.properties);

const sentences = new Map();
for (const u of allLines([...places.values()])) for (const s of splitSentences(u)) {
  const k = voiceKey(s);
  if (sentences.has(k) && sentences.get(k) !== s) throw new Error(`voice key collision: ${k}`);
  sentences.set(k, s);
}
fs.mkdirSync(OUT, { recursive: true });
const missing = [...sentences].filter(([k]) => !fs.existsSync(new URL(`${k}.mp3`, OUT)));
const chars = missing.reduce((t, [, s]) => t + s.length, 0);
console.log(`${sentences.size} sentences, ${missing.length} still to record (${chars} characters)`);

function writeIndex() {
  const keys = [...sentences.keys()].filter((k) => fs.existsSync(new URL(`${k}.mp3`, OUT)));
  fs.writeFileSync(new URL("index.json", OUT), JSON.stringify({ voice: VOICE_ID, model: MODEL, keys }));
  return keys.length;
}
if (DRY) { console.log(`index: ${writeIndex()} recordings`); process.exit(0); }

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error("ELEVENLABS_API_KEY is not set"); process.exit(1); }

let cost = 0, done = 0, failed = 0, stop = "";
async function record(k, text) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: MODEL, voice_settings: SETTINGS }),
    });
    if (res.ok) {
      fs.writeFileSync(new URL(`${k}.mp3`, OUT), Buffer.from(await res.arrayBuffer()));
      cost += Number(res.headers.get("character-cost") || text.length);
      return;
    }
    const body = await res.text();
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 1500 * attempt)); continue; }
    // quota, auth or bad request: stop everything, keep what we have
    stop = `HTTP ${res.status}: ${body.slice(0, 200)}`;
    return;
  }
  failed++;
}
const queue = missing.slice();
async function worker() {
  while (queue.length && !stop) {
    if (cost >= MAX_COST) { stop = `reached MAX_COST ${MAX_COST}`; break; }
    const [k, s] = queue.shift();
    await record(k, s);
    if (++done % 100 === 0) console.log(`  ${done}/${missing.length} recorded, ${cost} credits so far`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`recorded ${done - failed} new, ${failed} failed, ${cost} credits used${stop ? `; stopped: ${stop}` : ""}`);
console.log(`index: ${writeIndex()} of ${sentences.size} sentences have a recording`);
