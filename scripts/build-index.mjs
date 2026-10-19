#!/usr/bin/env node
// Writes library/index.json: every kit, component, and template's meta (no html/css). Handy for tools and the /designGod skill.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = process.argv[2] || 'library';
const dirs = (p) => existsSync(p) ? readdirSync(p).filter(d => statSync(join(p, d)).isDirectory()).sort() : [];
const json = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const kits = dirs(join(ROOT, 'kits')).filter(d => !d.startsWith('_')).map(d => json(join(ROOT, 'kits', d, 'kit.json'))).filter(Boolean);
const components = [];
for (const cat of dirs(join(ROOT, 'components'))) for (const s of dirs(join(ROOT, 'components', cat))) { const m = json(join(ROOT, 'components', cat, s, 'meta.json')); if (m) components.push({ ...m, path: `components/${cat}/${s}` }); }
const templates = dirs(join(ROOT, 'templates')).map(d => { const m = json(join(ROOT, 'templates', d, 'meta.json')); return m && { ...m, path: `templates/${d}` }; }).filter(Boolean);
const out = { generatedAt: new Date().toISOString(), counts: { kits: kits.length, components: components.length, templates: templates.length }, kits, components, templates };
writeFileSync(join(ROOT, 'index.json'), JSON.stringify(out, null, 2));
console.log(`library/index.json: ${kits.length} kits, ${components.length} components, ${templates.length} templates`);
