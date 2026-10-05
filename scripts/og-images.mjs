// Renders social share cards and app icons into public/.
// Usage: npm run og   (needs Playwright with Chromium available, e.g. `npx playwright install chromium`)
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';

execSync('npx astro build --outDir .og-build', { stdio: 'inherit', env: { ...process.env, OG_RENDER: '1', BASE: '/' } });
const server = spawn('npx', ['astro', 'preview', '--outDir', '.og-build', '--port', '4399', '--ignore-lock'], { env: { ...process.env, BASE: '/' }, stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const slugs = fs.readdirSync('.og-build/og-card');
  for (const slug of slugs) {
    await page.goto(`http://localhost:4399/og-card/${slug}/`);
    await page.waitForSelector('body[data-ready]');
    await page.screenshot({ path: `public/og/${slug}.png` });
    console.log('og', slug);
  }
  const icon = await browser.newPage();
  const svg = fs.readFileSync('public/favicon.svg', 'utf8');
  for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await icon.setViewportSize({ width: size, height: size });
    await icon.setContent(`<style>html,body{margin:0;background:#0a0e11}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`);
    await icon.screenshot({ path: `public/${name}` });
    console.log('icon', name);
  }
} finally {
  await browser.close();
  try { process.kill(-server.pid); } catch {}
  fs.rmSync('.og-build', { recursive: true, force: true });
}
