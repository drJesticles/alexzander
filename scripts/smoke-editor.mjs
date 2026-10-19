// Opens the editor for a project in headless Chromium and checks GrapesJS boots with library blocks.
// Usage: node scripts/smoke-editor.mjs http://127.0.0.1:3100 <projectId>
import { chromium } from '@playwright/test';
const [base = 'http://127.0.0.1:3100', id] = process.argv.slice(2);
if (!id) { console.error('need project id'); process.exit(2); }
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(`${base}/editor/${id}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.gjs-cv-canvas iframe', { timeout: 60000 });
await page.waitForTimeout(2500);
const blocks = await page.locator('.gjs-block').count();
const frame = page.frames().find(f => f.url().includes('about:blank') || f.parentFrame());
const canvasSections = await page.evaluate(() => { const f = document.querySelector('.gjs-cv-canvas iframe'); return f && f.contentDocument ? f.contentDocument.querySelectorAll('[data-wf-component]').length : -1; });
const kitLink = await page.evaluate(() => { const f = document.querySelector('.gjs-cv-canvas iframe'); const l = f && f.contentDocument && f.contentDocument.querySelector('link[href^="/api/css/kit/"]'); return l ? l.getAttribute('href') : null; });
await page.click('text=Code');
await page.waitForSelector('.cm-editor', { timeout: 15000 });
const codeLen = await page.evaluate(() => document.querySelector('.cm-content')?.textContent?.length || 0);
await page.screenshot({ path: 'artifacts/editor-smoke.png' });
await browser.close();
console.log(JSON.stringify({ blocks, canvasSections, kitLink, codeLen, errors: errors.slice(0, 5) }, null, 2));
if (blocks < 10 || canvasSections < 1 || !kitLink || codeLen < 100) process.exit(1);
