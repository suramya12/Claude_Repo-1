export const SITE = {
  name: 'Into Bhutan',
  tagline: 'A journey into the Land of the Thunder Dragon',
  description: 'An independent guide to why, when and how to visit Bhutan: the seven wonders, the unclimbed Himalaya, festivals, treks, itineraries and practical planning.',
  checked: 'October 2026',
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
/** Build an internal URL that respects the deploy base path. Paths are directory-style with a trailing slash. */
export function url(path = '/') {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  const [p, hash] = path.split('#');
  let clean = '/' + p.replace(/^\//, '');
  if (!/\.[a-z0-9]+$/i.test(clean) && !clean.endsWith('/')) clean += '/';
  return BASE + clean + (hash ? '#' + hash : '');
}

export const NAV = [
  { href: '/wonders/', label: 'Wonders' },
  { href: '/places/', label: 'Map' },
  { href: '/mountains/', label: 'Mountains' },
  { href: '/festivals/', label: 'Festivals' },
  { href: '/experiences/', label: 'Experiences' },
  { href: '/itineraries/', label: 'Itineraries' },
  { href: '/plan/', label: 'Plan' },
];

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
