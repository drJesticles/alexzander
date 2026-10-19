import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { PROJECTS_DIR, safeSlug } from './paths';
import { getTemplate, getComponentsBySlugs, componentSlugsIn, type SiteFields } from './library';
import { applyFields } from './render';

export type ProjectPage = { id: string; name: string; path: string; html: string; css: string };
export type Project = {
  id: string; name: string; slug: string; templateSlug: string | null; kit: string; theme: 'light' | 'dark';
  bodyClass: string; site: SiteFields; pages: ProjectPage[]; gjs: unknown | null; createdAt: string; updatedAt: string; publishedAt?: string | null;
};

const file = (id: string) => path.join(PROJECTS_DIR, `${id}.json`);
export async function listProjects(): Promise<Omit<Project, 'gjs' | 'pages'>[]> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  const out = [] as Omit<Project, 'gjs' | 'pages'>[];
  for (const f of await fs.readdir(PROJECTS_DIR)) if (f.endsWith('.json')) {
    try { const p = JSON.parse(await fs.readFile(path.join(PROJECTS_DIR, f), 'utf8')) as Project; const { gjs: _g, pages: _p, ...rest } = p; out.push({ ...rest }); } catch {}
  }
  return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function getProject(id: string): Promise<Project | null> {
  try { return JSON.parse(await fs.readFile(file(safeSlug(id)), 'utf8')) as Project; } catch { return null; }
}
export async function saveProject(p: Project): Promise<Project> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  p.updatedAt = new Date().toISOString();
  await fs.writeFile(file(p.id), JSON.stringify(p, null, 2));
  return p;
}
export async function deleteProject(id: string) { try { await fs.unlink(file(safeSlug(id))); } catch {} }

/** CSS for a page: template css + css of every library component used (deduped, in order of appearance). */
export async function cssForHtml(html: string, extra = ''): Promise<string> {
  const comps = await getComponentsBySlugs(componentSlugsIn(html));
  return [extra, ...comps.map(c => `/* ${c.slug} */\n${c.css}`)].filter(Boolean).join('\n\n');
}

export async function createProject(input: { name: string; templateSlug?: string | null; kit?: string; site?: SiteFields }): Promise<Project> {
  const id = `${safeSlug(input.name).slice(0, 24)}-${randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();
  const tpl = input.templateSlug ? await getTemplate(input.templateSlug) : null;
  const site: SiteFields = { ...(tpl?.site || {}), ...(input.site || {}) };
  const pages: ProjectPage[] = [];
  if (tpl) {
    for (const p of tpl.pages) {
      const html = applyFields(p.html, site);
      pages.push({ id: safeSlug(p.file.replace(/\.html$/, '')) || 'index', name: p.title, path: p.path, html, css: await cssForHtml(html, tpl.css) });
    }
  } else {
    pages.push({ id: 'index', name: 'Home', path: '/', html: '<section class="wf-section" data-wf-component="blank"><div class="wf-container"><h1>New page</h1><p class="wf-lead">Drag blocks from the left panel to start.</p></div></section>', css: '' });
  }
  return saveProject({
    id, name: input.name, slug: safeSlug(input.name), templateSlug: tpl?.slug || null, kit: input.kit || tpl?.kit || 'base', theme: 'light',
    bodyClass: tpl ? `t-${tpl.slug}` : '', site, pages, gjs: null, createdAt: now, updatedAt: now, publishedAt: null,
  });
}
