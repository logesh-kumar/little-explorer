// Builds the map data from Natural Earth Admin 0 countries (public domain):
//   ../data/world.json        1:110m GeoJSON, light enough for the spinning canvas globe
//   ../data/world-50m.json    1:50m TopoJSON for the flat map and atlas; shared borders are stored once,
//                             so the page can draw each border as one clean line (topojson.mesh)
// For both:
// - keeps only a display name, a continent id and the geometry
// - splits Russia at 60°E (Urals) so Siberia colours as Asia
// - splits French Guiana out of France so it colours as South America
// - rewinds rings for d3-geo (clockwise exteriors)
// Also copies the flags of the featured countries from flag-icons (MIT) to ../flags/.
import fs from "node:fs";
import { geoArea } from "d3-geo";
import pc from "polygon-clipping";
import { topology } from "topojson-server";
import { presimplify, simplify, quantile } from "topojson-simplify";
import { feature } from "topojson-client";

const CONT = {
  Africa: "africa", Antarctica: "antarctica", Asia: "asia", Europe: "europe",
  "North America": "namerica", "South America": "samerica", Oceania: "oceania",
  "Seven seas (open ocean)": null,
};
const NAMES = { USA: "United States", SOL: "Somalia", CYN: "Cyprus", ATF: "French Southern Lands", RUS: "Russia" };
const ADM = { SOL: "SOM", CYN: "CYP" };
// spelled out for reading aloud
const NAME_FIX = { "Faeroe Islands": "Faroe Islands", "Heard I. and McDonald Islands": "Heard and McDonald Islands", eSwatini: "Eswatini", "St-Barthélemy": "Saint Barthélemy", "St-Martin": "Saint Martin" };
// island countries Natural Earth files under "Seven seas (open ocean)"
const CONT_BY_ADM = { SYC: "africa", MUS: "africa", MDV: "asia" };

async function load(scale) {
  const file = new URL(`./ne_${scale}.geojson`, import.meta.url);
  if (!fs.existsSync(file)) {
    const url = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_${scale}_admin_0_countries.geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download failed: ${res.status} ${url}`);
    fs.writeFileSync(file, await res.text());
  }
  return JSON.parse(fs.readFileSync(file));
}

function cleanRing(ring, dp) {
  const f = 10 ** dp, out = [];
  for (const [x, y] of ring) {
    const p = [Math.round(x * f) / f, Math.round(y * f) / f];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  const a = out[0], b = out[out.length - 1];
  if (a[0] !== b[0] || a[1] !== b[1]) out.push([...a]);
  return out.length >= 4 ? out : null;
}
function rewind(poly) {
  return poly.map((ring, i) => {
    const big = geoArea({ type: "Polygon", coordinates: [ring] }) > 2 * Math.PI;
    // d3: exterior rings clockwise (small area), holes the other way (big area)
    return (i === 0 ? big : !big) ? ring.slice().reverse() : ring;
  });
}
const polys = (geom) => (geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates);
function lonRange(poly) {
  let a = Infinity, b = -Infinity;
  for (const [x] of poly[0]) { a = Math.min(a, x); b = Math.max(b, x); }
  return [a, b];
}

function convert(src, dp) {
  const out = [];
  const push = (name, adm, cont, polyList) => {
    const coords = polyList.map((p) => p.map((r) => cleanRing(r, dp)).filter(Boolean)).filter((p) => p.length).map(rewind);
    if (!coords.length) return;
    out.push({ type: "Feature", properties: { n: name, a: adm, c: cont },
      geometry: coords.length === 1 ? { type: "Polygon", coordinates: coords[0] } : { type: "MultiPolygon", coordinates: coords } });
  };
  for (const f of src.features) {
    const p = f.properties, adm = p.ADM0_A3;
    const raw = NAMES[adm] ?? (p.NAME.includes(".") ? p.NAME_LONG : p.NAME);
    const name = NAME_FIX[raw] ?? raw;
    const list = polys(f.geometry);
    if (adm === "RUS") {
      const eu = [], as = [];
      for (const poly of list) {
        const [lo, hi] = lonRange(poly);
        if (hi <= 60 && lo > -100) eu.push(poly);
        else if (lo >= 60 || hi < -100) as.push(poly);
        else {
          eu.push(...pc.intersection(poly, [[[lo - 1, -90], [60, -90], [60, 90], [lo - 1, 90], [lo - 1, -90]]]));
          as.push(...pc.intersection(poly, [[[60, -90], [181, -90], [181, 90], [60, 90], [60, -90]]]));
        }
      }
      push(name, "RUS", "europe", eu);
      push(name, "RUS", "asia", as);
    } else if (adm === "FRA") {
      // overseas France gets its own name and the colour of where it really is
      const part = (q) => { const [lo, hi] = lonRange(q); return hi < -55 ? "car" : hi < -30 ? "guf" : lo > 40 ? "ind" : "eu"; };
      push("French Guiana", "GUF", "samerica", list.filter((q) => part(q) === "guf"));
      push("Guadeloupe and Martinique", "GLP", "namerica", list.filter((q) => part(q) === "car"));
      push("Réunion and Mayotte", "REU", "africa", list.filter((q) => part(q) === "ind"));
      push(name, "FRA", "europe", list.filter((q) => part(q) === "eu"));
    } else {
      push(name, ADM[adm] ?? adm, CONT_BY_ADM[adm] ?? CONT[p.CONTINENT], list);
    }
  }
  for (const f of out) {
    const a = geoArea(f);
    if (a > 2 * Math.PI) throw new Error(`bad winding: ${f.properties.n} area ${a}`);
  }
  return { type: "FeatureCollection", features: out };
}

// 1:110m GeoJSON for the globe
const small = convert(await load("110m"), 2);
fs.writeFileSync(new URL("../data/world.json", import.meta.url), JSON.stringify(small));
console.log(`world.json: ${small.features.length} features, ${(JSON.stringify(small).length / 1024).toFixed(0)} KB`);

// 1:50m TopoJSON for the flat map
const big = convert(await load("50m"), 3);
// simplify on a first topology (so neighbours keep identical borders), then rebuild a compact one:
// presimplify leaves a weight on every point and undoes the delta encoding, so strip and re-encode
const QUANT = 1e5, KEEP = Number(process.env.KEEP ?? 0.5); // share of points kept
let draft = presimplify(topology({ countries: big }, QUANT));
draft = simplify(draft, quantile(draft, KEEP)); // keep the most visible points
const flat = feature(draft, draft.objects.countries);
const strip = (c) => (typeof c[0] === "number" ? [c[0], c[1]] : c.map(strip));
for (const f of flat.features) f.geometry.coordinates = strip(f.geometry.coordinates);
const topo = topology({ countries: flat }, QUANT);
const json = JSON.stringify(topo);
fs.writeFileSync(new URL("../data/world-50m.json", import.meta.url), json);
// round-trip check: every country must still be a sane d3 shape
const back = feature(topo, topo.objects.countries);
for (const f of back.features) {
  if (geoArea(f) > 2 * Math.PI) throw new Error(`bad winding after topology: ${f.properties.n}`);
}
console.log(`world-50m.json: ${back.features.length} features, ${(json.length / 1024).toFixed(0)} KB`);

const FLAGS = "in cn jp id th sa np eg ke za ng ma gb fr it es de ru no us ca mx br ar pe cl au nz".split(" ");
for (const c of FLAGS) {
  fs.copyFileSync(new URL(`./node_modules/flag-icons/flags/4x3/${c}.svg`, import.meta.url), new URL(`../flags/${c}.svg`, import.meta.url));
}
console.log(`flags: ${FLAGS.length} copied`);
