# Into Bhutan

An independent, interactive travel guide that makes the case for visiting Bhutan, and then helps you plan the trip.

**Live site:** https://suramya12.github.io/Claude_Repo-1/ (after GitHub Pages is enabled, see [Deploy](#deploy))

## What's in it

| Page | What it does |
| --- | --- |
| `/` | Scroll-driven descent from orbit to Bhutan, the Seven Wonders slider, why-go stats, interactive map, peaks chart, prayer-flag sky, festival calendar, featured experiences and itineraries |
| `/wonders/` | The seven wonders in depth |
| `/places/` | Interactive map with filters, plus all 28 places grouped by region |
| `/places/<slug>/` | One guide per place: story, highlights, practical facts, locator map, festivals, treks, itineraries and nearby places |
| `/mountains/` | Elevation chart of the unclimbed peaks, why climbing is banned, six treks with route maps |
| `/festivals/` | Month-by-month calendar with a live countdown, full-year table, festival etiquette |
| `/experiences/` | Twelve things to do and eight dishes to eat |
| `/itineraries/` + 4 detail pages | Day-by-day routes with maps and a fee calculator pre-filled for each |
| `/plan/` | Visa, SDF calculator, getting there, money, health, etiquette, packing and FAQ |
| `/about/` | Sources, photo credits, disclaimer |

Every landscape is painted procedurally on `<canvas>` (`src/lib/scenes.ts`), so the site needs no image hosting. Licensed photographs replace a scene automatically when one is added for a place.

## Rajasthan Panorama (`rajasthan/`)

A second, separate piece: a 360° panoramic world for **Rajasthan, India**. You stand at the centre of the state and look around; places sit at their real compass bearings, themes hang in the sky and tools stand on the ground. Click to zoom into a place, and keep zooming: the deepest branch goes eight levels, from orbit to the craft of mirror inlay in Amber's Sheesh Mahal.

- Plain HTML, CSS and JavaScript, no build step. d3 loads from cdnjs; if it fails, the globe and maps fall back to simpler drawings.
- Content lives in `rajasthan/js/data.js` and `rajasthan/js/places.js` (one scene graph), rendering in `archetypes.js`, `panorama.js` and `tools.js`, the engine in `app.js`.
- 73 licensed photos from Wikimedia Commons (CC BY, CC BY-SA or public domain), bundled at 1600 and 800 px, 24 MB in total. Credits are in the site's Credits scene and in `rajasthan/tools/photos/credits.json`. `.github/workflows/rajasthan-photos.yml` fetched and resized them.
- Map outlines: Natural Earth (public domain), built into `js/geo.js` by `rajasthan/tools/build-geo.mjs`.

Run it locally with any static server, e.g. `python3 -m http.server -d rajasthan 8000`, then open http://localhost:8000. The Pages deploy copies it to `/rajasthan/`.

Fees, visa rules and festival dates were checked on 5 Oct 2026 and are marked "confirm before booking".

## Stack

- [Astro](https://astro.build) static site, zero client framework. Each interactive component ships a small script.
- Self-hosted fonts via Fontsource (Archivo, Hanken Grotesk, JetBrains Mono, Noto Serif Tibetan). No third-party requests at runtime.
- `d3-geo` for the globe and map projections. Map SVGs are rendered at build time.
- Natural Earth outlines via `world-atlas`, pre-extracted to `src/data/geo.json`.
- SEO: per-page titles and descriptions, canonical URLs, Open Graph and Twitter cards, JSON-LD (TouristAttraction, TouristTrip, Festival, FAQPage, BreadcrumbList), sitemap and robots.txt.

## Develop

Requires Node 22.12+.

```sh
npm install
npm run dev        # http://localhost:4321/Claude_Repo-1/
npm test           # type check, build, and verify every internal link
```

Content lives in `src/data/`:

- `places.ts`: every place (story, highlights, facts, coordinates, scene)
- `wonders.ts`, `mountains.ts`, `festivals.ts`, `experiences.ts`, `itineraries.ts`
- `guide.ts`: practical guide, fees and FAQ. Update `FEES` when the SDF changes.

## Photography

`npm run photos` downloads one freely licensed photo per place from Wikimedia Commons (CC BY, CC BY-SA, CC0 or public domain only), stores it in `src/assets/photos/`, and regenerates `src/data/photos.ts` with author, license and source. Credits appear on the photo and on `/about/#credits`. Search terms live in `scripts/photo-sources.json`; use `--only=slug` to retry one place or `--force` to replace.

Images are served as responsive AVIF/WebP via `astro:assets`.

## Other scripts

- `npm run og`: renders social share cards (`public/og/*.png`) and app icons from the painted scenes. Needs Playwright with Chromium.
- `npm run build:geo`: regenerates `src/data/geo.json` from Natural Earth.
- `npm run check:links`: checks internal links in `dist/`.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

`.github/workflows/ci.yml` type-checks, builds and link-checks every pull request.

To host elsewhere or at a domain root, set `SITE` and `BASE` at build time, e.g. `SITE=https://intobhutan.com BASE=/ npm run build`.

## Accuracy

Facts were checked in October 2026. Visa rules, the Sustainable Development Fee and lunar festival dates change; the site tells readers to confirm with the Department of Tourism before booking.
