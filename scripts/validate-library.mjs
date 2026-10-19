#!/usr/bin/env node
// WebForge library validator. Enforces docs/LIBRARY-SPEC.md. Exit 1 on any error.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] || 'library');
const CATEGORIES = ['nav','hero','features','services','about','cta','footer','pricing','testimonials','team','faq','stats','logos','process','forms','gallery','media','blog','contact','content','elements','commerce','utility'];
const FAMILIES = ['big-four','web-dev','off-the-wall','brand'];
const VERTICALS = ['trades','local','creative','tech','commerce','community','personal','utility','brand'];
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const errors = []; const warnings = [];
const err = (m) => errors.push(m); const warn = (m) => warnings.push(m);
const dirs = (p) => existsSync(p) ? readdirSync(p).filter(d => statSync(join(p, d)).isDirectory()) : [];
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { err(`${p}: invalid JSON (${e.message})`); return null; } };

let kits = 0, comps = 0, tmpls = 0; const compSlugs = new Map(); const kitSlugs = new Set();

// kits
for (const d of dirs(join(ROOT, 'kits'))) {
  if (d.startsWith('_')) continue;
  const base = join(ROOT, 'kits', d);
  const meta = readJson(join(base, 'kit.json')); if (!meta) continue;
  kits++; kitSlugs.add(d);
  if (meta.slug !== d) err(`kits/${d}: slug "${meta.slug}" != folder`);
  if (!SLUG.test(d)) err(`kits/${d}: bad slug`);
  for (const k of ['name','family','description','fonts','swatch','tags','version']) if (meta[k] === undefined) err(`kits/${d}: kit.json missing "${k}"`);
  if (!FAMILIES.includes(meta.family)) err(`kits/${d}: family "${meta.family}" not in ${FAMILIES.join('|')}`);
  if (!Array.isArray(meta.swatch) || meta.swatch.length !== 4) err(`kits/${d}: swatch must be 4 colors`);
  if (!existsSync(join(base, 'tokens.css'))) err(`kits/${d}: tokens.css missing`);
  else {
    const css = readFileSync(join(base, 'tokens.css'), 'utf8');
    if (!/:root\s*\{/.test(css) && d !== 'base') err(`kits/${d}: tokens.css has no :root block`);
    if (meta.dark && !/\[data-theme="dark"\]/.test(css)) err(`kits/${d}: dark:true but no [data-theme="dark"] block`);
    if (/@import|url\(https?:/.test(css)) err(`kits/${d}: tokens.css must not import or fetch external resources (fonts go in kit.json)`);
  }
  if (existsSync(join(base, 'kit.css')) && /@import|url\(https?:/.test(readFileSync(join(base, 'kit.css'), 'utf8'))) err(`kits/${d}: kit.css must not import external resources`);
}

// components
for (const cat of dirs(join(ROOT, 'components'))) {
  if (!CATEGORIES.includes(cat)) { err(`components/${cat}: unknown category`); continue; }
  for (const d of dirs(join(ROOT, 'components', cat))) {
    const base = join(ROOT, 'components', cat, d);
    const meta = readJson(join(base, 'meta.json')); if (!meta) continue;
    comps++;
    if (compSlugs.has(d)) err(`components/${cat}/${d}: duplicate slug (also in ${compSlugs.get(d)})`); compSlugs.set(d, cat);
    if (meta.slug !== d) err(`components/${cat}/${d}: slug "${meta.slug}" != folder`);
    if (!SLUG.test(d)) err(`components/${cat}/${d}: bad slug`);
    if (meta.category !== cat) err(`components/${cat}/${d}: category "${meta.category}" != folder`);
    for (const k of ['name','description','tags','previewHeight','hasScript','version']) if (meta[k] === undefined) err(`components/${cat}/${d}: meta.json missing "${k}"`);
    const htmlP = join(base, 'index.html'), cssP = join(base, 'style.css'), jsP = join(base, 'script.js');
    if (!existsSync(htmlP)) { err(`components/${cat}/${d}: index.html missing`); continue; }
    if (!existsSync(cssP)) err(`components/${cat}/${d}: style.css missing`);
    const html = readFileSync(htmlP, 'utf8');
    if (!html.includes(`data-wf-component="${d}"`)) err(`components/${cat}/${d}: root must carry data-wf-component="${d}"`);
    if (!new RegExp(`class="[^"]*\\bc-${d}\\b`).test(html)) err(`components/${cat}/${d}: root must carry class c-${d}`);
    if (/<style[\s>]|<script[\s>]/i.test(html)) err(`components/${cat}/${d}: no <style>/<script> in index.html`);
    const roots = html.trim().match(/^<[a-z]/gm) || [];
    if (!/^\s*<(section|header|footer|nav|div|aside|article|form)\b/.test(html.trim())) err(`components/${cat}/${d}: index.html must start with one root element`);
    const openTop = html.trim().match(/^<([a-z0-9]+)/); const closeTop = html.trim().match(/<\/([a-z0-9]+)>\s*$/);
    if (openTop && closeTop && openTop[1] !== closeTop[1]) err(`components/${cat}/${d}: first open tag <${openTop[1]}> and last close tag </${closeTop[1]}> differ (needs ONE root)`);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) { const src = (m[0].match(/src="([^"]*)"/) || [])[1] || ""; if (/^https?:/.test(src)) err(`components/${cat}/${d}: external image ${src} (use /ph/w/h/label.svg)`); if (!/\balt=/.test(m[0])) warn(`components/${cat}/${d}: <img> without alt`); }
    if (/style="[^"]*#[0-9a-fA-F]{3,8}/.test(html)) err(`components/${cat}/${d}: inline hex color in index.html`);
    if (existsSync(cssP)) {
      const css = readFileSync(cssP, 'utf8');
      const hex = css.match(HEX); if (hex) err(`components/${cat}/${d}: hard-coded colors in style.css: ${[...new Set(hex)].join(' ')}`);
      if (/font-family\s*:\s*(?!var\(|inherit)/.test(css)) err(`components/${cat}/${d}: font-family literal in style.css (use var(--wf-font-*))`);
      if (/@import|url\(https?:/.test(css)) err(`components/${cat}/${d}: external resource in style.css`);
      // scoping: every top-level selector must contain .c-<slug>
      const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
      const rules = stripped.replace(/@media[^{]*\{([\s\S]*?)\}\s*\}/g, '$1}').replace(/@keyframes[^{]*\{[\s\S]*?\}\s*\}/g, '');
      for (const m of rules.matchAll(/([^{}]+)\{/g)) {
        const sel = m[1].trim(); if (!sel || sel.startsWith('@') || /^\d+%$|^from$|^to$/.test(sel)) continue;
        for (const part of sel.split(',')) if (!part.includes(`.c-${d}`) && !part.includes(`[data-wf-component="${d}"]`)) err(`components/${cat}/${d}: unscoped selector "${part.trim()}" (must contain .c-${d})`);
      }
    }
    if (meta.hasScript && !existsSync(jsP)) err(`components/${cat}/${d}: hasScript:true but script.js missing`);
    if (!meta.hasScript && existsSync(jsP)) err(`components/${cat}/${d}: script.js present but hasScript:false`);
    if (existsSync(jsP)) { const js = readFileSync(jsP, 'utf8'); if (!/^\s*\(function|^\s*\(\(\)|^\s*\(\s*\(\)\s*=>/.test(js)) err(`components/${cat}/${d}: script.js must be an IIFE`); if (!js.includes(`data-wf-component="${d}"`)) err(`components/${cat}/${d}: script.js must query [data-wf-component="${d}"]`); if (/<script|document\.write|fetch\(|XMLHttpRequest/.test(js)) err(`components/${cat}/${d}: script.js must not load or fetch`); }
    if (html.length < 120) warn(`components/${cat}/${d}: index.html is tiny (${html.length} chars)`);
  }
}

// templates
for (const d of dirs(join(ROOT, 'templates'))) {
  const base = join(ROOT, 'templates', d);
  const meta = readJson(join(base, 'meta.json')); if (!meta) continue;
  tmpls++;
  if (meta.slug !== d) err(`templates/${d}: slug != folder`);
  if (!/^_?[a-z0-9][a-z0-9-]*$/.test(d)) err(`templates/${d}: bad slug`);
  for (const k of ['name','vertical','description','kit','pages','tags','version']) if (meta[k] === undefined) err(`templates/${d}: meta.json missing "${k}"`);
  if (!VERTICALS.includes(meta.vertical)) err(`templates/${d}: vertical "${meta.vertical}" not in ${VERTICALS.join('|')}`);
  if (meta.kit && !kitSlugs.has(meta.kit)) err(`templates/${d}: default kit "${meta.kit}" does not exist`);
  if (!existsSync(join(base, 'site.json'))) err(`templates/${d}: site.json missing`); else readJson(join(base, 'site.json'));
  if (!Array.isArray(meta.pages) || !meta.pages.length) { err(`templates/${d}: pages empty`); continue; }
  if (!meta.pages.some(p => p.file === 'index.html')) err(`templates/${d}: needs an index.html page`);
  for (const p of meta.pages) {
    const pp = join(base, 'pages', p.file);
    if (!existsSync(pp)) { err(`templates/${d}: page ${p.file} missing`); continue; }
    const html = readFileSync(pp, 'utf8');
    if (/<html\b|<body\b|<head\b/i.test(html)) err(`templates/${d}/${p.file}: must be a body fragment`);
    if (!/data-wf-component=/.test(html)) err(`templates/${d}/${p.file}: no sections with data-wf-component`);
    if (/<style[\s>]|<script[\s>]/i.test(html)) err(`templates/${d}/${p.file}: no <style>/<script> in pages (use template.css)`);
    for (const m of html.matchAll(/<img[^>]*src="([^"]*)"/g)) if (/^https?:/.test(m[1])) err(`templates/${d}/${p.file}: external image ${m[1]}`);
    if (!/^\s*<(header|nav)\b/.test(html)) warn(`templates/${d}/${p.file}: does not start with a header/nav`);
    if (!/<\/footer>\s*$/.test(html.trim())) warn(`templates/${d}/${p.file}: does not end with a footer`);
  }
  if (existsSync(join(base, 'template.css'))) {
    const css = readFileSync(join(base, 'template.css'), 'utf8');
    const hex = css.match(HEX); if (hex) err(`templates/${d}: hard-coded colors in template.css: ${[...new Set(hex)].join(' ')}`);
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]*\{([\s\S]*?)\}\s*\}/g, '$1}').replace(/@keyframes[^{]*\{[\s\S]*?\}\s*\}/g, '');
    for (const m of stripped.matchAll(/([^{}]+)\{/g)) { const sel = m[1].trim(); if (!sel || sel.startsWith('@') || /^\d+%$|^from$|^to$/.test(sel)) continue; for (const part of sel.split(',')) if (!part.includes(`.t-${d}`)) err(`templates/${d}: unscoped selector "${part.trim()}" in template.css (must contain .t-${d})`); }
  }
}

console.log(`kits: ${kits}  components: ${comps}  templates: ${tmpls}`);
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(errors.length ? `FAIL: ${errors.length} error(s), ${warnings.length} warning(s)` : `OK: 0 errors, ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
