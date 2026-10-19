import JSZip from 'jszip';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SITES_DIR, DATA_DIR, safeSlug } from './paths';
import { kitStylesheet, googleFontsHref } from './render';
import { getComponentsBySlugs, componentSlugsIn } from './library';
import type { Project } from './projects';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type StaticSite = { files: Record<string, string | Buffer> };

/** Rewrite internal links (/about -> about.html, / -> index.html) for a flat static export. */
function rewriteLinks(html: string, pages: Project['pages'], prefix = ''): string {
  const map = new Map<string, string>();
  for (const p of pages) map.set(p.path, p.id === 'index' || p.path === '/' ? 'index.html' : `${p.id}.html`);
  return html.replace(/href="([^"]*)"/g, (m, href: string) => {
    const [pathOnly, hash] = href.split('#');
    if (map.has(pathOnly)) return `href="${prefix}${map.get(pathOnly)}${hash ? '#' + hash : ''}"`;
    if (pathOnly === '' && hash !== undefined) return m;
    return m;
  });
}

export async function buildStaticSite(p: Project, opts: { prefix?: string } = {}): Promise<StaticSite> {
  const { css: kitCss, kit } = await kitStylesheet(p.kit);
  const fonts = googleFontsHref(kit);
  const prefix = opts.prefix ?? '';
  const files: Record<string, string | Buffer> = {};
  const allHtml = p.pages.map(x => x.html).join('\n');
  const comps = await getComponentsBySlugs(componentSlugsIn(allHtml));
  const scripts = comps.filter(c => c.js).map(c => `/* ${c.slug} */\n${c.js}`).join('\n');
  const pageCss = [...new Set(p.pages.map(x => x.css))].join('\n\n');
  files['assets/styles.css'] = `${kitCss}\n\n/* pages */\n${pageCss}`;
  if (scripts) files['assets/scripts.js'] = scripts;
  for (const page of p.pages) {
    const fname = page.id === 'index' || page.path === '/' ? 'index.html' : `${page.id}.html`;
    const body = rewriteLinks(page.html, p.pages, prefix).replace(/src="\/ph\//g, `src="${prefix}assets/ph/`).replace(/(src|href|poster)="\/assets\//g, `$1="${prefix}assets/uploads/`);
    files[fname] = `<!doctype html>
<html lang="en" data-theme="${p.theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.name)} · ${esc(p.site.business?.name || p.name)}</title>
<meta name="description" content="${esc(p.site.business?.tagline || '')}">
${fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${fonts}">` : ''}
<link rel="stylesheet" href="${prefix}assets/styles.css">
</head>
<body${p.bodyClass ? ` class="${esc(p.bodyClass)}"` : ''}>
${body}
${scripts ? `<script src="${prefix}assets/scripts.js"></script>` : ''}
</body>
</html>`;
  }
  // placeholder images used -> bake as local SVGs
  for (const m of allHtml.matchAll(/\/ph\/(\d+)\/(\d+)\/([^"'\s]+?)\.svg/g)) {
    files[`assets/ph/${m[1]}/${m[2]}/${m[3]}.svg`] = placeholderSvg(+m[1], +m[2], m[3]);
  }
  // uploaded assets used by any page -> bundle the binaries
  for (const m of allHtml.matchAll(/\/assets\/([A-Za-z0-9._-]+)/g)) {
    try { files[`assets/uploads/${m[1]}`] = await fs.readFile(path.join(DATA_DIR, 'assets', m[1])); } catch {}
  }
  files['README.md'] = `# ${p.name}\n\nExported from WebForge on ${new Date().toISOString().slice(0, 10)}. Kit: ${p.kit}. Upload this folder to any static host.\n`;
  return { files };
}

export function placeholderSvg(w: number, h: number, label: string): string {
  w = Math.min(Math.max(w || 800, 16), 4000); h = Math.min(Math.max(h || 600, 16), 4000);
  const text = decodeURIComponent(label || '').replace(/[-_]+/g, ' ').slice(0, 60);
  let hue = 0; for (const ch of text) hue = (hue * 31 + ch.charCodeAt(0)) % 360;
  const fs = Math.max(14, Math.min(w, h) / 12);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(text)}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},35%,78%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},40%,62%)"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<path d="M0 ${h} L${w * 0.35} ${h * 0.55} L${w * 0.55} ${h * 0.75} L${w * 0.75} ${h * 0.45} L${w} ${h * 0.7} L${w} ${h} Z" fill="rgba(0,0,0,.12)"/>
<circle cx="${w * 0.78}" cy="${h * 0.25}" r="${Math.min(w, h) * 0.08}" fill="rgba(255,255,255,.45)"/>
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${fs}" font-weight="600" fill="rgba(20,20,30,.75)">${esc(text)}</text>
<text x="50%" y="${h / 2 + fs * 1.4}" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${fs * 0.6}" fill="rgba(20,20,30,.5)">${w} × ${h}</text>
</svg>`;
}

export async function zipSite(site: StaticSite): Promise<Buffer> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(site.files)) zip.file(name, content as string | Buffer);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

export async function publishSite(p: Project): Promise<{ url: string; dir: string }> {
  const slug = safeSlug(p.slug || p.name);
  const dir = path.join(SITES_DIR, slug);
  const site = await buildStaticSite(p, { prefix: '' });
  await fs.mkdir(dir, { recursive: true });
  for (const [name, content] of Object.entries(site.files)) {
    const fp = path.join(dir, name); await fs.mkdir(path.dirname(fp), { recursive: true }); await fs.writeFile(fp, content);
  }
  return { url: `/sites/${slug}/`, dir };
}
