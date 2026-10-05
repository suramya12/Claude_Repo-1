// Regenerates src/data/geo.json from Natural Earth (via the world-atlas package):
// world land at 1:110m for the globe, and the Bhutan outline at 1:10m for maps.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import * as topo from 'topojson-client';

const require = createRequire(import.meta.url);
const read = (f) => JSON.parse(fs.readFileSync(require.resolve(`world-atlas/${f}`)));
const round = (c, f) => (Array.isArray(c[0]) ? c.map((x) => round(x, f)) : c.map(f));
const r2 = (n) => Math.round(n * 100) / 100;
const r3 = (n) => Math.round(n * 1000) / 1000;

const land = read('land-110m.json');
const landGeo = topo.feature(land, land.objects.land).features[0].geometry;
landGeo.coordinates = round(landGeo.coordinates, r2);

const c10 = read('countries-10m.json');
const bt = topo.feature(c10, c10.objects.countries).features.find((f) => f.properties.name === 'Bhutan').geometry;
bt.coordinates = round(bt.coordinates, r3);

fs.writeFileSync(new URL('../src/data/geo.json', import.meta.url), JSON.stringify({ land: landGeo, bhutan: bt }));
console.log('wrote src/data/geo.json');
