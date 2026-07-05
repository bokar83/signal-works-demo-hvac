import { chromium } from 'file:///D:/Ai_Sandbox/agentsHQ/node_modules/playwright/index.mjs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const htmlUrl = pathToFileURL(join(here, 'creatives-v3-2.html')).href;

const shots = [
  { id: 'adA', out: 'ad-A-lead.png' },
  { id: 'adB', out: 'ad-B-start.png' },
  { id: 'adC', out: 'ad-C-tools.png' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setViewportSize({ width: 1180, height: 1180 });
await page.goto(htmlUrl, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

for (const s of shots) {
  const el = await page.$('#' + s.id);
  await el.screenshot({ path: join(here, s.out) });
  console.log('wrote', s.out);
}

await browser.close();
console.log('DONE');
