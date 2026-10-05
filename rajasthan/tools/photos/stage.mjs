// Photo pipeline for the Rajasthan site, run by .github/workflows/rajasthan-photos.yml
// (GitHub's runners can reach Wikimedia Commons; the authoring container cannot).
//
// Stage A, review: for every slot in requests.json that has no pick yet and no contact sheet,
//   search Commons, keep up to 8 candidates with an allowed licence (CC0, public domain, CC BY, CC BY-SA),
//   and write review/<slot>.jpg (a labelled contact sheet) plus review/candidates.json.
// Stage B, download: for every slot in picks.json not yet in img/, fetch the chosen file,
//   write img/<slot>-1600.jpg and img/<slot>-800.jpg (progressive JPEG, q74, metadata stripped),
//   and record author, licence and source in credits.json.
//
// Needs Node 22+ and ImageMagick (convert, montage). Usage: node rajasthan/tools/photos/stage.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const T = (p) => path.join(ROOT, 'tools/photos', p);
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'RajasthanPanorama/1.0 (https://github.com/suramya12/Claude_Repo-1; static travel site photo credits)';
const OK = /^(CC0|Public domain|PD|CC BY(-SA)? \d(\.\d)?)/i;
const BAD = /(NC|ND|GFDL only|Fair use|Copyrighted)/i;

const read = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const requests = read(T('requests.json'), {});
const picks = read(T('picks.json'), {});
const candPath = T('review/candidates.json');
const cands = read(candPath, {});
const credPath = path.join(ROOT, 'tools/photos/credits.json');
const credits = read(credPath, {});
const strip = (h = '') => String(h).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return r;
    if (r.status === 429 || r.status >= 500) { await sleep(1500 * (i + 1)); continue; }
    throw new Error(`${r.status} ${url}`);
  }
  throw new Error(`gave up ${url}`);
}

async function api(params) {
  const u = new URL(API);
  Object.entries({ format: 'json', origin: '*', ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
  return (await get(u)).json();
}

function meta(p) {
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata ?? {};
  const license = strip(m.LicenseShortName?.value);
  return {
    title: p.title,
    width: ii.width, height: ii.height, mime: ii.mime,
    license,
    licenseUrl: m.LicenseUrl?.value || '',
    author: strip(m.Artist?.value) || strip(m.Credit?.value) || 'Unknown',
    description: strip(m.ImageDescription?.value).slice(0, 300),
    date: strip(m.DateTimeOriginal?.value).slice(0, 40),
    lat: m.GPSLatitude?.value || null, lon: m.GPSLongitude?.value || null,
    categories: strip(m.Categories?.value).slice(0, 300),
    source: ii.descriptionurl,
    thumb: ii.thumburl,
  };
}

async function search(q) {
  const j = await api({
    action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '30', gsrsearch: `${q} filetype:bitmap`,
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '360',
  });
  return Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index).map(meta).filter(Boolean);
}

function usable(c, portrait) {
  if (!/jpe?g/i.test(c.mime)) return false;
  if (!OK.test(c.license) || BAD.test(c.license)) return false;
  if (Math.max(c.width, c.height) < 1600) return false;
  const ar = c.width / c.height;
  return portrait ? ar > 0.55 && ar < 2.4 : ar > 1.15 && ar < 2.4;
}

// ---------- Stage A: review sheets ----------
fs.mkdirSync(T('review'), { recursive: true });
fs.mkdirSync(T('review/tmp'), { recursive: true });
for (const [slot, req] of Object.entries(requests)) {
  if (slot.startsWith('_') || picks[slot] !== undefined || cands[slot]) continue;
  const seen = new Set(); const list = [];
  for (const q of req.q) {
    for (const qq of [`${q} incategory:Quality_images`, q]) {
      try {
        for (const c of await search(qq)) {
          if (seen.has(c.title) || !usable(c, req.portrait)) continue;
          seen.add(c.title); c.qi = qq.includes('Quality_images'); list.push(c);
        }
      } catch (e) { console.log('search fail', slot, e.message); }
      await sleep(250);
    }
  }
  const top = list.slice(0, 8);
  cands[slot] = top;
  if (!top.length) { console.log('none ', slot); continue; }
  const files = [];
  for (const [i, c] of top.entries()) {
    try {
      const f = T(`review/tmp/${slot}-${i}.jpg`);
      fs.writeFileSync(f, Buffer.from(await (await get(c.thumb)).arrayBuffer()));
      const label = `${i}${c.qi ? ' QI' : ''} | ${c.license} | ${c.width}x${c.height}\n${c.title.replace(/^File:/, '').slice(0, 46)}`;
      files.push('-label', label, f);
    } catch (e) { console.log('thumb fail', slot, i, e.message); }
    await sleep(150);
  }
  execFileSync('montage', [...files, '-tile', '4x', '-geometry', '300x200+3+3', '-pointsize', '11', '-background', '#1b1b1b', '-fill', '#eeeeee', '-quality', '62', T(`review/${slot}.jpg`)]);
  console.log('sheet', slot, top.length);
}
fs.rmSync(T('review/tmp'), { recursive: true, force: true });
fs.writeFileSync(candPath, JSON.stringify(cands, null, 1) + '\n');

// ---------- Stage B: downloads ----------
const IMG = path.join(ROOT, 'img');
fs.mkdirSync(IMG, { recursive: true });
for (const [slot, pick] of Object.entries(picks)) {
  if (slot.startsWith('_') || pick === null) continue;
  const out = path.join(IMG, `${slot}-1600.jpg`);
  if (fs.existsSync(out) && credits[slot]) continue;
  const title = typeof pick === 'number' ? cands[slot]?.[pick]?.title : (pick.title ?? cands[slot]?.[pick.i]?.title);
  if (!title) { console.log('no title for pick', slot); continue; }
  try {
    const j = await api({ action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '2000' });
    const p = Object.values(j.query.pages)[0];
    const c = meta(p);
    if (!c || !OK.test(c.license) || BAD.test(c.license)) { console.log('licence rejected', slot, c?.license); continue; }
    const src = path.join(IMG, `${slot}.src.jpg`);
    fs.writeFileSync(src, Buffer.from(await (await get(c.thumb || p.imageinfo[0].url)).arrayBuffer()));
    const crop = typeof pick === 'object' && pick.crop ? ['-gravity', pick.gravity || 'center', '-crop', pick.crop, '+repage'] : [];
    for (const w of [1600, 800]) {
      execFileSync('convert', [src, '-auto-orient', ...crop, '-resize', `${w}x${w}>`, '-strip', '-interlace', 'JPEG', '-sampling-factor', '4:2:0', '-quality', w === 1600 ? '74' : '72', path.join(IMG, `${slot}-${w}.jpg`)]);
    }
    const dims = execFileSync('identify', ['-format', '%w %h', out]).toString().trim().split(' ').map(Number);
    fs.rmSync(src);
    credits[slot] = { title: c.title.replace(/^File:/, ''), author: c.author, license: c.license, licenseUrl: c.licenseUrl, source: c.source, description: c.description, date: c.date, lat: c.lat, lon: c.lon, w: dims[0], h: dims[1] };
    console.log('got  ', slot, c.license, c.author.slice(0, 40));
  } catch (e) { console.log('fail ', slot, e.message); }
  await sleep(400);
}
fs.writeFileSync(credPath, JSON.stringify(credits, null, 1) + '\n');
const total = fs.readdirSync(IMG).filter((f) => f.endsWith('.jpg')).reduce((s, f) => s + fs.statSync(path.join(IMG, f)).size, 0);
console.log(`img/ total ${(total / 1048576).toFixed(1)} MB`);
