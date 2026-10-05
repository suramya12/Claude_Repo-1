import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import geo from '../data/geo.json';

export const BHUTAN: Feature<Geometry> = { type: 'Feature', geometry: geo.bhutan as Geometry, properties: {} };

/** Mercator projection fitted to Bhutan within a w×h box. Used at build time to draw static SVG maps. */
export function bhutanMap(w: number, h: number, pad = 40) {
  const proj = geoMercator().fitExtent([[pad, pad], [w - pad, h - pad]], BHUTAN);
  const path = geoPath(proj);
  const xy = (lon: number, lat: number) => proj([lon, lat]) as [number, number];
  return { proj, outline: path(BHUTAN) ?? '', xy };
}
