// Verifies every internal link and asset reference in the built site (dist/) resolves to a file.
// Run after `astro build`. Exits non-zero on any broken link.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const base = (process.env.BASE ?? '/Claude_Repo-1').replace(/\/$/, '');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(dist);

const ids = new Map();
const broken = [];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
    for (const raw of m[1].split(',').map((s) => s.trim().split(' ')[0])) {
      if (!raw || /^(https?:|mailto:|tel:|data:|javascript:)/.test(raw)) continue;
      const [p, hash] = raw.split('#');
      let target;
      if (!p) target = file;
      else {
        if (!p.startsWith(base + '/')) { broken.push(`${path.relative(dist, file)}: ${raw} (outside base path)`); continue; }
        let rel = decodeURIComponent(p.slice(base.length));
        target = path.join(dist, rel);
        if (rel.endsWith('/')) target = path.join(target, 'index.html');
        if (!fs.existsSync(target)) { broken.push(`${path.relative(dist, file)}: ${raw}`); continue; }
      }
      if (hash && target.endsWith('.html') && ids.has(target) && !ids.get(target).has(hash)) {
        // Hash links to places on the map page are resolved by script, not by element id.
        if (!(target.endsWith(path.join('places', 'index.html')))) broken.push(`${path.relative(dist, file)}: ${raw} (missing #${hash})`);
      }
    }
  }
}
if (broken.length) { console.error(`Broken links (${broken.length}):\n` + broken.join('\n')); process.exit(1); }
console.log(`Checked ${files.length} pages: all internal links resolve.`);
