// Builds ../data/world.json from Natural Earth 1:110m countries (public domain).
// - keeps only a display name, a continent id and rounded geometry
// - splits Russia at 60°E (Urals) so Siberia colours as Asia
// - splits French Guiana out of France so it colours as South America
// - rewinds rings for d3-geo (clockwise exteriors)
// Also copies the flags of the featured countries from flag-icons (MIT) to ../flags/.
import fs from "node:fs";
import { geoArea } from "d3-geo";
import pc from "polygon-clipping";

const SRC = new URL("./ne_110m.geojson", import.meta.url);
if (!fs.existsSync(SRC)) {
  const url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status} ${url}`);
  fs.writeFileSync(SRC, await res.text());
}
const src = JSON.parse(fs.readFileSync(SRC));
const CONT = {
  Africa: "africa", Antarctica: "antarctica", Asia: "asia", Europe: "europe",
  "North America": "namerica", "South America": "samerica", Oceania: "oceania",
  "Seven seas (open ocean)": null,
};
const NAMES = { USA: "United States", SOL: "Somalia", CYN: "Cyprus", ATF: "French Southern Lands", RUS: "Russia" };
const ADM = { SOL: "SOM", CYN: "CYP" };

const r2 = (n) => Math.round(n * 100) / 100;
function cleanRing(ring) {
  const out = [];
  for (const [x, y] of ring) {
    const p = [r2(x), r2(y)];
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
function polys(geom) { return geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates; }
function bbox(poly) {
  let a = Infinity, b = -Infinity;
  for (const [x] of poly[0]) { a = Math.min(a, x); b = Math.max(b, x); }
  return [a, b];
}

const out = [];
function push(name, adm, cont, polyList) {
  const coords = polyList
    .map((p) => p.map(cleanRing).filter(Boolean))
    .filter((p) => p.length)
    .map(rewind);
  if (!coords.length) return;
  out.push({ type: "Feature", properties: { n: name, a: adm, c: cont },
    geometry: coords.length === 1 ? { type: "Polygon", coordinates: coords[0] } : { type: "MultiPolygon", coordinates: coords } });
}

for (const f of src.features) {
  const p = f.properties;
  const adm = p.ADM0_A3;
  const name = NAMES[adm] ?? (p.NAME.includes(".") ? p.NAME_LONG : p.NAME);
  const cont = CONT[p.CONTINENT];
  const list = polys(f.geometry);
  if (adm === "RUS") {
    const eu = [], as = [];
    for (const poly of list) {
      const [lo, hi] = bbox(poly);
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
    push("French Guiana", "GUF", "samerica", list.filter((q) => bbox(q)[1] < -30));
    push(name, "FRA", "europe", list.filter((q) => bbox(q)[1] >= -30));
  } else {
    push(name, ADM[adm] ?? adm, cont, list);
  }
}

// sanity: every feature should cover less than a hemisphere
for (const f of out) {
  const a = geoArea(f);
  if (a > 2 * Math.PI) throw new Error(`bad winding: ${f.properties.n} area ${a}`);
}
const json = JSON.stringify({ type: "FeatureCollection", features: out });
fs.writeFileSync(new URL("../data/world.json", import.meta.url), json);
console.log(`world.json: ${out.length} features, ${(json.length / 1024).toFixed(0)} KB`);

const FLAGS = "in cn jp id th sa np eg ke za ng ma gb fr it es de ru no us ca mx br ar pe cl au nz".split(" ");
for (const c of FLAGS) {
  fs.copyFileSync(new URL(`./node_modules/flag-icons/flags/4x3/${c}.svg`, import.meta.url), new URL(`../flags/${c}.svg`, import.meta.url));
}
console.log(`flags: ${FLAGS.length} copied`);
