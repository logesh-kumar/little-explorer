/* Little Explorer's World: the game's content and every line Tully says.
   Shared by the page and by tools/build-voice.mjs, which records each sentence with ElevenLabs.
   Every spoken string is built here, so allLines() can list all of them for recording. */
"use strict";

const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const poss = (name) => (name.endsWith("s") ? `${name}'` : `${name}'s`);

const CONT = {
  asia:       { name: "Asia", color: "yellow", emoji: "🐼", at: [92, 48], lbl: [88, 56], fact: "Asia is the biggest continent, and more people live there than anywhere else." },
  africa:     { name: "Africa", color: "orange", emoji: "🦁", at: [19, 6], fact: "Africa has lions and giraffes, and the Nile, the longest river in the world." },
  europe:     { name: "Europe", color: "purple", emoji: "🏰", at: [18, 53], fact: "Europe has lots of countries close together, and many old castles." },
  namerica:   { name: "North America", color: "green", emoji: "🦅", at: [-102, 46], lbl: [-100, 49], fact: "North America goes from icy Greenland all the way down to sunny Mexico." },
  samerica:   { name: "South America", color: "pink", emoji: "🦜", at: [-60, -14], lbl: [-62, -25], fact: "South America has the Amazon, the biggest rainforest in the world." },
  oceania:    { name: "Australia & Oceania", say: "Australia and Oceania", color: "red", emoji: "🦘", at: [134, -25], lbl: [138, -43], fact: "Kangaroos and koalas live in Australia, and Oceania has thousands of islands." },
  antarctica: { name: "Antarctica", color: "white", emoji: "🐧", at: [30, -80], fact: "Antarctica is the coldest place on Earth. It is covered in ice, and penguins live there." },
};
const OCEANS = {
  pacific:  { name: "Pacific Ocean", emoji: "🐙", at: [[-140, 2], [156, 12]], fact: "The Pacific is the biggest and deepest ocean in the world.", hint: "It is the biggest ocean, between Asia and the Americas." },
  atlantic: { name: "Atlantic Ocean", emoji: "🐬", at: [[-40, 22]], fact: "The Atlantic is the second biggest ocean. Ships cross it to sail between Europe and America.", hint: "It is between the Americas and Africa." },
  indian:   { name: "Indian Ocean", emoji: "🐢", at: [[78, -20]], fact: "The Indian Ocean is the warmest ocean. Sea turtles love it there!", hint: "Look below India!" },
  southern: { name: "Southern Ocean", emoji: "🐳", at: [[20, -63], [-120, -64]], fact: "The Southern Ocean swirls all the way around icy Antarctica.", hint: "It goes all the way around Antarctica, at the bottom of the world." },
  arctic:   { name: "Arctic Ocean", emoji: "🧊", at: [[20, 84.5]], fact: "The Arctic Ocean is at the top of the world. It is so cold that it is often frozen.", hint: "Look at the very top of the world." },
};
const COUNTRIES = [
  { a: "IND", name: "India", cont: "asia", iso: "in", emoji: "🐅", cap: "New Delhi", capAt: [77.21, 28.61], fact: "Tigers live in India, and so does the beautiful Taj Mahal.", flagFact: "India's flag is orange, white and green, with a blue wheel in the middle." },
  { a: "CHN", name: "China", cont: "asia", iso: "cn", emoji: "🐼", cap: "Beijing", capAt: [116.40, 39.90], fact: "Giant pandas live in China, and the Great Wall there is super long.", flagFact: "China's flag is red, with five yellow stars." },
  { a: "JPN", name: "Japan", cont: "asia", iso: "jp", emoji: "🗻", cap: "Tokyo", capAt: [139.69, 35.69], fact: "Japan is made of islands, and Mount Fuji is its tallest mountain.", flagFact: "Japan's flag is white, with a big red circle like the sun." },
  { a: "IDN", name: "Indonesia", cont: "asia", iso: "id", emoji: "🦎", cap: "Jakarta", capAt: [106.85, -6.21], fact: "Indonesia has thousands of islands, and real Komodo dragons live there.", flagFact: "Indonesia's flag is red on top and white on the bottom." },
  { a: "THA", name: "Thailand", cont: "asia", iso: "th", emoji: "🐘", cap: "Bangkok", capAt: [100.50, 13.76], fact: "Elephants are a very special animal in Thailand.", flagFact: "Thailand's flag has red, white and blue stripes." },
  { a: "SAU", name: "Saudi Arabia", cont: "asia", iso: "sa", emoji: "🐪", cap: "Riyadh", capAt: [46.68, 24.71], fact: "Saudi Arabia is mostly sandy desert, and camels walk across it.", flagFact: "Saudi Arabia's flag is green, with white writing and a sword." },
  { a: "NPL", name: "Nepal", cont: "asia", iso: "np", emoji: "🏔️", cap: "Kathmandu", capAt: [85.32, 27.72], fact: "Mount Everest, the tallest mountain in the world, is in Nepal.", flagFact: "Nepal's flag is made of two triangles. It is the only country flag that is not a rectangle!" },
  { a: "EGY", name: "Egypt", cont: "africa", iso: "eg", emoji: "🐊", cap: "Cairo", capAt: [31.24, 30.04], fact: "Egypt has the great pyramids, and crocodiles swim in its river, the Nile.", flagFact: "Egypt's flag is red, white and black, with a golden eagle." },
  { a: "KEN", name: "Kenya", cont: "africa", iso: "ke", emoji: "🦒", cap: "Nairobi", capAt: [36.82, -1.29], fact: "Giraffes, zebras and lions roam across Kenya.", flagFact: "Kenya's flag is black, red and green, with a shield and two spears." },
  { a: "ZAF", name: "South Africa", cont: "africa", iso: "za", emoji: "🦏", cap: "Pretoria", capAt: [28.19, -25.75], fact: "Rhinos live in South Africa, and penguins play on some of its beaches!", flagFact: "South Africa's flag is very colourful, with a big sideways Y shape." },
  { a: "NGA", name: "Nigeria", cont: "africa", iso: "ng", emoji: "🥁", cap: "Abuja", capAt: [7.49, 9.06], fact: "More people live in Nigeria than in any other country in Africa.", flagFact: "Nigeria's flag is green, white and green." },
  { a: "MAR", name: "Morocco", cont: "africa", iso: "ma", emoji: "🏜️", cap: "Rabat", capAt: [-6.84, 34.02], fact: "Morocco has snowy mountains and the edge of the giant Sahara Desert.", flagFact: "Morocco's flag is red, with a green star." },
  { a: "GBR", name: "United Kingdom", say: "the United Kingdom", cont: "europe", iso: "gb", emoji: "👑", cap: "London", capAt: [-0.13, 51.51], fact: "The United Kingdom has a king, and a famous clock tower called Big Ben.", flagFact: "The United Kingdom's flag has blue, red and white crosses. People call it the Union Jack." },
  { a: "FRA", name: "France", cont: "europe", iso: "fr", emoji: "🥐", cap: "Paris", capAt: [2.35, 48.86], fact: "France is famous for the tall Eiffel Tower and yummy croissants.", flagFact: "France's flag has blue, white and red stripes standing up." },
  { a: "ITA", name: "Italy", cont: "europe", iso: "it", emoji: "🍕", cap: "Rome", capAt: [12.50, 41.90], fact: "Pizza comes from Italy! On the map, Italy looks like a boot.", flagFact: "Italy's flag has green, white and red stripes standing up." },
  { a: "ESP", name: "Spain", cont: "europe", iso: "es", emoji: "💃", cap: "Madrid", capAt: [-3.70, 40.42], fact: "Spain is sunny, with sandy beaches and flamenco dancing.", flagFact: "Spain's flag has red and yellow stripes." },
  { a: "DEU", name: "Germany", cont: "europe", iso: "de", emoji: "🏰", cap: "Berlin", capAt: [13.40, 52.52], fact: "Germany has fairy-tale castles and big, dark forests.", flagFact: "Germany's flag has black, red and gold stripes." },
  { a: "RUS", name: "Russia", cont: "europe", also: "asia", iso: "ru", emoji: "🐻", cap: "Moscow", capAt: [37.62, 55.76], fact: "Russia is the biggest country in the world. It is in Europe and Asia, and brown bears live in its forests.", flagFact: "Russia's flag has white, blue and red stripes." },
  { a: "NOR", name: "Norway", cont: "europe", iso: "no", emoji: "🌌", cap: "Oslo", capAt: [10.75, 59.91], fact: "In Norway, you can see the colourful northern lights dance in the sky.", flagFact: "Norway's flag is red, with a blue and white cross." },
  { a: "USA", name: "United States", say: "the United States", cont: "namerica", iso: "us", emoji: "🗽", cap: "Washington, D.C.", capSay: "Washington D C", capAt: [-77.04, 38.91], fact: "The Statue of Liberty is in the United States. She is a giant green lady holding a torch.", flagFact: "The United States' flag has 50 white stars and 13 red and white stripes." },
  { a: "CAN", name: "Canada", cont: "namerica", iso: "ca", emoji: "🍁", cap: "Ottawa", capAt: [-75.70, 45.42], fact: "Canada has a maple leaf on its flag, and moose live in its forests.", flagFact: "Canada's flag is red and white, with a red maple leaf." },
  { a: "MEX", name: "Mexico", cont: "namerica", iso: "mx", emoji: "🌮", cap: "Mexico City", capAt: [-99.13, 19.43], fact: "Tacos come from Mexico, and so do lots of colourful festivals.", flagFact: "Mexico's flag is green, white and red, with an eagle holding a snake." },
  { a: "BRA", name: "Brazil", cont: "samerica", iso: "br", emoji: "🦜", cap: "Brasília", capSay: "Brasilia", capAt: [-47.88, -15.79], fact: "Most of the Amazon rainforest is in Brazil, full of parrots and monkeys.", flagFact: "Brazil's flag is green, with a yellow diamond and a blue starry circle." },
  { a: "ARG", name: "Argentina", cont: "samerica", iso: "ar", emoji: "🐎", cap: "Buenos Aires", capAt: [-58.38, -34.60], fact: "In Argentina, cowboys called gauchos ride horses across wide grassy plains.", flagFact: "Argentina's flag is light blue and white, with a smiling sun." },
  { a: "PER", name: "Peru", cont: "samerica", iso: "pe", emoji: "🦙", cap: "Lima", capAt: [-77.04, -12.05], fact: "Fluffy llamas live high up in the mountains of Peru.", flagFact: "Peru's flag has red, white and red stripes standing up." },
  { a: "CHL", name: "Chile", cont: "samerica", iso: "cl", emoji: "🌋", cap: "Santiago", capAt: [-70.67, -33.45], fact: "Chile is very long and thin, and it has lots of volcanoes.", flagFact: "Chile's flag is white and red, with a white star on a blue square." },
  { a: "AUS", name: "Australia", cont: "oceania", iso: "au", emoji: "🦘", cap: "Canberra", capAt: [149.13, -35.28], fact: "Kangaroos hop around Australia, and koalas sleep in its trees.", flagFact: "Australia's flag is dark blue, with the Union Jack and white stars." },
  { a: "NZL", name: "New Zealand", cont: "oceania", iso: "nz", emoji: "🐑", cap: "Wellington", capAt: [174.78, -41.29], fact: "New Zealand has more sheep than people!", flagFact: "New Zealand's flag is dark blue, with the Union Jack and four red stars." },
];
const BY_ADM = Object.fromEntries(COUNTRIES.map((c) => [c.a, c]));
const sayC = (c) => c.say || c.name;
const sayCap = (c) => c.capSay || c.cap;
const contSay = (k) => (k ? CONT[k].say || CONT[k].name : "the ocean");

const LEVELS = [
  { id: "oceans", name: "Oceans", emoji: "🌊", blurb: "5 big oceans", prefix: "o:" },
  { id: "continents", name: "Continents", emoji: "🗺️", blurb: "7 continents", prefix: "c:", need: ["oceans", 3] },
  { id: "countries", name: "Countries", emoji: "🚩", blurb: "28 countries", prefix: "n:", need: ["continents", 4] },
  { id: "capitals", name: "Capitals", emoji: "⭐", blurb: "Expert level", prefix: "k:", need: ["countries", 8] },
];
const BOOK = [...LEVELS, { id: "flags", name: "Flags", emoji: "🏁", prefix: "f:" }];
const LEVEL = Object.fromEntries(BOOK.map((l) => [l.id, l]));

function itemsFor(level) {
  if (level === "flags") return COUNTRIES.map((c) => ({ id: "f:" + c.a, level, kind: "country", key: c.a, c, name: c.name, say: sayC(c), emoji: c.emoji, flag: c.iso, at: c.capAt, fact: c.flagFact }));
  if (level === "oceans") return Object.entries(OCEANS).map(([k, o]) => ({ id: "o:" + k, level, kind: "ocean", key: k, name: o.name, say: "the " + o.name, emoji: o.emoji, at: o.at[0], fact: o.fact }));
  if (level === "continents") return Object.entries(CONT).map(([k, c]) => ({ id: "c:" + k, level, kind: "cont", key: k, name: c.name, say: c.say || c.name, emoji: c.emoji, at: c.at, fact: c.fact }));
  const capitals = level === "capitals";
  return COUNTRIES.map((c) => ({
    id: (capitals ? "k:" : "n:") + c.a, level, kind: "country", key: c.a, c,
    name: capitals ? c.cap : c.name, say: capitals ? sayCap(c) : sayC(c),
    emoji: capitals ? "⭐" : c.emoji, flag: capitals ? null : c.iso, at: c.capAt, fact: c.fact,
  }));
}

/* ---------- how places are named aloud ---------- */
// p is a map feature's properties: { n: name, a: country code, c: continent id or null }
function sayPlace(p) {
  const c = BY_ADM[p.a];
  if (c) return sayC(c);
  const n = p.n.replace(" / ", " or ");
  return /^(United|Central African|Democratic|Dominican|Netherlands|Philippines|Bahamas|Maldives|Gambia|Comoros|Seychelles|Vatican|French Southern|British|Isle of|Indian Ocean|South Georgia)|Islands\b/.test(n) ? "the " + n : n;
}
function describe(hit, it) {
  if (hit.kind === "country") {
    const p = hit.f.properties, nm = sayPlace(p);
    if (it.kind === "ocean") return `That's land. It's ${nm}`;
    if (it.kind === "cont") return p.c ? `That's ${nm}, in ${contSay(p.c)}` : `That's ${nm}, far out in the ocean`;
    return `That's ${nm}`;
  }
  if (hit.kind === "ocean") return it.kind === "ocean" ? `That's the ${OCEANS[hit.key].name}` : `That's the ${OCEANS[hit.key].name}. We need land`;
  return "That's the Caspian Sea, a giant salty lake";
}
function hint(it) {
  if (it.kind === "ocean") return OCEANS[it.key].hint;
  if (it.kind === "cont") return `Look for the ${CONT[it.key].color} one!`;
  const c = it.c, where = c.also ? `${contSay(c.cont)} and ${contSay(c.also)}` : contSay(c.cont);
  return it.level === "capitals" ? `It's in ${where}.` : `${cap1(sayC(c))} is in ${where}.`;
}
const answerName = (it) => (it.level === "capitals" ? sayC(it.c) : it.say);
function successText(it, fresh) {
  const head = it.level === "capitals" ? `Yes! ${sayCap(it.c)} is the capital of ${sayC(it.c)}!` : `Yes! That's ${it.say}!`;
  return fresh ? `${head} You won a sticker! ${it.fact}` : head;
}

/* ---------- every line Tully says ---------- */
const LINES = {
  greet: () => "Hi! I'm Tully the turtle. Let's explore the world together! What shall we play?",
  pickLevel: (kind) => (kind === "find" ? "Find It! Pick a level." : "Match It! Pick a level."),
  locked: (L, have) => `This one is locked. Find ${L.need[1]} ${LEVEL[L.need[0]].name.toLowerCase()} first. You have ${have}.`,
  exploreIntro: () => "Tap anywhere on the map to learn about it!",
  globeIntro: () => "Drag the globe to spin it. Tap any place to learn about it!",
  atlasIntro: () => "This is the Atlas. Pinch or press plus to zoom in, and drag to move around. More names appear as you zoom. Tap any place to hear about it!",
  explorePlace(p) {
    const c = BY_ADM[p.a];
    if (c) return `${cap1(sayC(c))}! ${c.fact} The capital city is ${sayCap(c)}.`;
    if (p.c === "antarctica") return `This is Antarctica! ${CONT.antarctica.fact}`;
    if (!p.c) return `That's ${sayPlace(p)}, far out in the ocean.`;
    return `That's ${sayPlace(p)}, in ${contSay(p.c)}.`;
  },
  exploreOcean: (k) => `The ${OCEANS[k].name}! ${OCEANS[k].fact}`,
  exploreLake: () => "The Caspian Sea! It is called a sea, but it is really the biggest lake in the world.",
  atlasCont: (k) => `${CONT[k].say || CONT[k].name}! ${CONT[k].fact}`,
  question(it) {
    if (it.level === "oceans") return `Can you find ${it.say}? Tap the water!`;
    if (it.level === "continents") return `Where is ${it.say}? Tap it!`;
    if (it.level === "countries") return `Can you find ${it.say}? Tap it!`;
    return `${sayCap(it.c)} is a capital city. Which country is it in?`;
  },
  // wrong answers get gentler and gentler help: a hint, then "look here", then the answer glows
  missFirst: (what, it) => `${what}. Try again! ${hint(it)}`,
  missSecond: (what, it) => (it.level === "capitals" ? `${what}. ${sayCap(it.c)} is the capital of ${sayC(it.c)}. Look here!` : `${what}. Look here!`),
  missReveal: (what, it) => `${what}. Here it is, glowing! Tap ${answerName(it)}.`,
  findWin: (it, fresh, revealed) => (revealed ? `Well done! That's ${answerName(it)}. Now you know it!` : successText(it, fresh)),
  matchDeal: (level) => (level === "capitals" ? "Each card is a capital city. Drag it to its country!" : "Drag each card to its home on the map! Or tap a card, then tap the map."),
  matchSelect: (it) => (it.level === "capitals" ? `${sayCap(it.c)}! Which country is it the capital of? Tap it on the map.` : `${cap1(it.say)}! Now tap its home on the map.`),
  matchWin: (it, fresh, revealed) => (revealed ? `Well done! That's ${answerName(it)}.` : successText(it, fresh)),
  matchNext: () => "Great! Now another card.",
  pickCardFirst: () => "First pick a card, then tap the map!",
  flagQuestion: (it, pickFlag) => (pickFlag ? `Which one is the flag of ${it.say}?` : "Whose flag is this? Tap the right country!"),
  flagWrong(it, c, pickFlag, tries) {
    const what = pickFlag ? `That's the flag of ${sayC(c)}.` : `No, that's not ${poss(sayC(c))} flag.`;
    if (tries >= 2) return `${what} Look, it's the glowing one!`;
    return pickFlag ? `${what} Try again! Here's a clue: ${it.c.flagFact}` : `${what} Try again! This country is in ${contSay(it.c.cont)}.`;
  },
  flagWin: (it, fresh) => `Yes! That's the flag of ${it.say}! ${fresh ? "You won a sticker! " : ""}${it.c.flagFact}`,
  roundEnd(n, newly) {
    let text = n ? `You won ${n} new sticker${n > 1 ? "s" : ""}!` : "You knew them all. Super explorer!";
    if (newly.length) text += ` New level open: ${newly.join(" and ")}!`;
    return { text, spoken: `Hooray! ${text}` };
  },
  bookOpen: (n) => `Your sticker book! You have ${n} sticker${n === 1 ? "" : "s"}.`,
  bookTap(it, got) {
    if (!got) return it.level === "flags" ? `Spot the flag of ${it.say} in Flag Fun to win this sticker!` : `Find ${it.level === "capitals" ? sayCap(it.c) : it.say} to win this sticker!`;
    return it.level === "capitals" ? `${sayCap(it.c)} is the capital of ${sayC(it.c)}.` : `${cap1(it.say)}! ${it.fact}`;
  },
  parentTap: () => "That button is for grown-ups. Press and hold it.",
  rateDemo: () => "This is how fast I talk.",
};

/* ---------- sentences and their recording keys ---------- */
function splitSentences(text) {
  return text.trim().replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
}
// FNV-1a hash plus length: the file name of a sentence's recording
function voiceKey(sentence) {
  let h = 0x811c9dc5;
  for (let i = 0; i < sentence.length; i++) { h ^= sentence.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0") + "-" + sentence.length.toString(36);
}

// Every utterance the game can produce. places: properties of every map feature (both map files).
function allLines(places) {
  const out = [];
  const add = (s) => out.push(s);
  add(LINES.greet()); add(LINES.pickLevel("find")); add(LINES.pickLevel("match"));
  add(LINES.exploreIntro()); add(LINES.globeIntro()); add(LINES.atlasIntro()); add(LINES.exploreLake());
  add(LINES.matchNext()); add(LINES.pickCardFirst()); add(LINES.parentTap()); add(LINES.rateDemo());
  for (const L of LEVELS) if (L.need) for (let have = 0; have < L.need[1]; have++) add(LINES.locked(L, have));
  for (const p of places) add(LINES.explorePlace(p));
  for (const k in OCEANS) add(LINES.exploreOcean(k));
  for (const k in CONT) add(LINES.atlasCont(k));
  const hits = [
    ...places.map((p) => ({ kind: "country", f: { properties: p } })),
    ...Object.keys(OCEANS).map((key) => ({ kind: "ocean", key })),
    { kind: "lake" },
  ];
  for (const L of LEVELS) {
    add(LINES.matchDeal(L.id));
    for (const it of itemsFor(L.id)) {
      add(LINES.question(it)); add(LINES.matchSelect(it));
      for (const fresh of [true, false]) for (const revealed of [true, false]) { add(LINES.findWin(it, fresh, revealed)); add(LINES.matchWin(it, fresh, revealed)); }
      for (const hit of hits) {
        const what = describe(hit, it);
        add(LINES.missFirst(what, it)); add(LINES.missSecond(what, it)); add(LINES.missReveal(what, it));
      }
    }
  }
  for (const it of itemsFor("flags")) {
    add(LINES.flagQuestion(it, true)); add(LINES.flagQuestion(it, false));
    add(LINES.flagWin(it, true)); add(LINES.flagWin(it, false));
    for (const c of COUNTRIES) if (c !== it.c) for (const pickFlag of [true, false]) for (const tries of [1, 2]) add(LINES.flagWrong(it, c, pickFlag, tries));
  }
  const ups = ["Continents", "Countries", "Capitals"];
  const newlySets = [[], ...ups.map((u) => [u]), ...ups.flatMap((u, i) => ups.slice(i + 1).map((v) => [u, v]))];
  for (let n = 0; n <= 6; n++) for (const s of newlySets) add(LINES.roundEnd(n, s).spoken);
  const total = BOOK.reduce((t, L) => t + itemsFor(L.id).length, 0);
  for (let n = 0; n <= total; n++) add(LINES.bookOpen(n));
  for (const L of BOOK) for (const it of itemsFor(L.id)) { add(LINES.bookTap(it, true)); add(LINES.bookTap(it, false)); }
  return out;
}

if (typeof module !== "undefined") module.exports = { allLines, splitSentences, voiceKey, LINES };
