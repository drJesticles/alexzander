import { promises as fs } from 'node:fs';
import path from 'node:path';
import { LIBRARY_DIR, USER_KITS_DIR } from './paths';

export type KitMeta = {
  slug: string; name: string; family: 'big-four' | 'web-dev' | 'off-the-wall' | 'brand'; description: string;
  source?: string; fonts: { family: string; weights?: number[] }[]; dark?: boolean; swatch: string[]; tags: string[]; version: number;
  user?: boolean;
};
export type Kit = KitMeta & { tokensCss: string; kitCss: string };
export type ComponentMeta = {
  slug: string; name: string; category: string; description: string; tags: string[]; previewHeight: number;
  hasScript: boolean; fields?: string[]; version: number;
};
export type Component = ComponentMeta & { html: string; css: string; js: string };
export type TemplatePage = { file: string; title: string; path: string };
export type TemplateMeta = {
  slug: string; name: string; vertical: string; description: string; kit: string; pages: TemplatePage[];
  tags: string[]; components?: string[]; version: number;
};
export type SiteFields = { business?: Record<string, string>; social?: Record<string, string>; nav?: { label: string; path: string }[] };
export type Template = Omit<TemplateMeta, 'pages'> & { site: SiteFields; pages: (TemplatePage & { html: string })[]; css: string };

async function exists(p: string) { try { await fs.access(p); return true; } catch { return false; } }
async function readOr(p: string, fallback = '') { try { return await fs.readFile(p, 'utf8'); } catch { return fallback; } }
async function dirs(p: string): Promise<string[]> {
  try { const e = await fs.readdir(p, { withFileTypes: true }); return e.filter(d => d.isDirectory()).map(d => d.name).sort(); } catch { return []; }
}
async function readJson<T>(p: string): Promise<T | null> { try { return JSON.parse(await fs.readFile(p, 'utf8')) as T; } catch { return null; } }

export const CONTRACT = {
  async tokens() { return readOr(path.join(LIBRARY_DIR, 'kits', '_contract', 'tokens.css')); },
  async base() { return readOr(path.join(LIBRARY_DIR, 'kits', '_contract', 'base.css')); },
};

// ---------- kits ----------
async function kitDirs(): Promise<{ slug: string; dir: string; user: boolean }[]> {
  const out: { slug: string; dir: string; user: boolean }[] = [];
  for (const s of await dirs(path.join(LIBRARY_DIR, 'kits'))) if (!s.startsWith('_')) out.push({ slug: s, dir: path.join(LIBRARY_DIR, 'kits', s), user: false });
  for (const s of await dirs(USER_KITS_DIR)) if (!out.some(k => k.slug === s)) out.push({ slug: s, dir: path.join(USER_KITS_DIR, s), user: true });
  return out;
}
export async function listKits(): Promise<KitMeta[]> {
  const out: KitMeta[] = [];
  for (const k of await kitDirs()) { const m = await readJson<KitMeta>(path.join(k.dir, 'kit.json')); if (m) out.push({ ...m, user: k.user }); }
  const order = ['brand', 'big-four', 'web-dev', 'off-the-wall'];
  return out.sort((a, b) => order.indexOf(a.family) - order.indexOf(b.family) || a.name.localeCompare(b.name));
}
export async function getKit(slug: string): Promise<Kit | null> {
  const k = (await kitDirs()).find(x => x.slug === slug); if (!k) return null;
  const m = await readJson<KitMeta>(path.join(k.dir, 'kit.json')); if (!m) return null;
  return { ...m, user: k.user, tokensCss: await readOr(path.join(k.dir, 'tokens.css')), kitCss: await readOr(path.join(k.dir, 'kit.css')) };
}

// ---------- components ----------
export const CATEGORIES = ['nav','hero','features','services','about','cta','footer','pricing','testimonials','team','faq','stats','logos','process','forms','gallery','media','blog','contact','content','elements','commerce','utility'];
let compIndexCache: { at: number; list: ComponentMeta[] } | null = null;
export async function listComponents(fresh = false): Promise<ComponentMeta[]> {
  if (!fresh && compIndexCache && Date.now() - compIndexCache.at < 5000) return compIndexCache.list;
  const out: ComponentMeta[] = [];
  const root = path.join(LIBRARY_DIR, 'components');
  for (const cat of await dirs(root)) for (const slug of await dirs(path.join(root, cat))) {
    const m = await readJson<ComponentMeta>(path.join(root, cat, slug, 'meta.json')); if (m) out.push(m);
  }
  out.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name));
  compIndexCache = { at: Date.now(), list: out };
  return out;
}
export async function getComponent(slug: string): Promise<Component | null> {
  const meta = (await listComponents()).find(c => c.slug === slug); if (!meta) return null;
  const dir = path.join(LIBRARY_DIR, 'components', meta.category, slug);
  return { ...meta, html: await readOr(path.join(dir, 'index.html')), css: await readOr(path.join(dir, 'style.css')), js: meta.hasScript ? await readOr(path.join(dir, 'script.js')) : '' };
}
export async function getComponentsBySlugs(slugs: string[]): Promise<Component[]> {
  const out: Component[] = [];
  for (const s of slugs) { const c = await getComponent(s); if (c) out.push(c); }
  return out;
}
/** Slugs of library components referenced by data-wf-component in an HTML string. */
export function componentSlugsIn(html: string): string[] {
  return [...new Set([...html.matchAll(/data-wf-component="([^"]+)"/g)].map(m => m[1]))];
}

// ---------- templates ----------
export async function listTemplates(includeHidden = false): Promise<TemplateMeta[]> {
  const out: TemplateMeta[] = [];
  const root = path.join(LIBRARY_DIR, 'templates');
  for (const slug of await dirs(root)) {
    if (!includeHidden && slug.startsWith('_')) continue;
    const m = await readJson<TemplateMeta>(path.join(root, slug, 'meta.json')); if (m) out.push(m);
  }
  return out.sort((a, b) => a.vertical.localeCompare(b.vertical) || a.name.localeCompare(b.name));
}
export async function getTemplate(slug: string): Promise<Template | null> {
  const dir = path.join(LIBRARY_DIR, 'templates', slug);
  const m = await readJson<TemplateMeta>(path.join(dir, 'meta.json')); if (!m) return null;
  const site = (await readJson<SiteFields>(path.join(dir, 'site.json'))) || {};
  const pages = [] as (TemplatePage & { html: string })[];
  for (const p of m.pages) pages.push({ ...p, html: await readOr(path.join(dir, 'pages', p.file)) });
  return { ...m, site, pages, css: await readOr(path.join(dir, 'template.css')) };
}
export async function libraryCounts() {
  const [k, c, t] = await Promise.all([listKits(), listComponents(), listTemplates()]);
  return { kits: k.length, components: c.length, templates: t.length, categories: [...new Set(c.map(x => x.category))].length };
}
export { exists };
