/* Render PNG app icons from icons/icon.svg using Playwright's headless Chromium.
 *
 *   node scripts/gen-icons.js
 *
 * Falls back to a globally-installed Playwright if it isn't a local dependency.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  const { execSync } = require('child_process');
  const root = execSync('npm root -g').toString().trim();
  ({ chromium } = require(path.join(root, 'playwright')));
}

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const SIZES = [192, 512];

(async () => {
  const svg = fs.readFileSync(path.join(ICONS_DIR, 'icon.svg'), 'utf8');
  const browser = await chromium.launch();
  for (const size of SIZES) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const sized = svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
    await page.setContent(
      `<!doctype html><meta charset="utf-8"><style>*{margin:0;padding:0}html,body{background:transparent}</style>${sized}`,
      { waitUntil: 'networkidle' },
    );
    const el = await page.$('svg');
    await el.screenshot({ path: path.join(ICONS_DIR, `icon-${size}.png`), omitBackground: true });
    await page.close();
    console.log(`wrote icon-${size}.png`);
  }
  await browser.close();
})().catch((err) => { console.error(err); process.exit(1); });
