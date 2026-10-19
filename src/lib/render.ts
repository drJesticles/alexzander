import { CONTRACT, getKit, getComponentsBySlugs, componentSlugsIn, type Kit, type SiteFields } from './library';

export function googleFontsHref(kit: Pick<Kit, 'fonts'> | null): string | null {
  if (!kit || !kit.fonts?.length) return null;
  const fam = kit.fonts.map(f => `family=${encodeURIComponent(f.family).replace(/%20/g, '+')}${f.weights?.length ? `:wght@${[...f.weights].sort((a, b) => a - b).join(';')}` : ''}`).join('&');
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}

/** Full stylesheet for a kit: contract tokens + base + kit tokens + kit css. */
export async function kitStylesheet(kitSlug: string): Promise<{ css: string; kit: Kit | null }> {
  const kit = await getKit(kitSlug);
  const parts = [await CONTRACT.tokens(), await CONTRACT.base()];
  if (kit) { parts.push(`/* kit: ${kit.slug} */`, kit.tokensCss, kit.kitCss); }
  return { css: parts.join('\n\n'), kit };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace the text of every element carrying data-wf-field="key" with the site value; update tel:/mailto: hrefs too. */
export function applyFields(html: string, site: SiteFields | null | undefined): string {
  if (!site) return html;
  const flat: Record<string, string> = {};
  for (const [g, vals] of Object.entries(site)) if (vals && typeof vals === 'object' && !Array.isArray(vals)) for (const [k, v] of Object.entries(vals as Record<string, string>)) flat[`${g}.${k}`] = String(v ?? '');
  let out = html;
  for (const [key, val] of Object.entries(flat)) {
    if (!val) continue;
    const re = new RegExp(`(<([a-z0-9]+)\\b[^>]*data-wf-field="${key.replace('.', '\\.')}"[^>]*>)([^<]*)(</\\2>)`, 'g');
    out = out.replace(re, (_m, open: string, _tag: string, _inner: string, close: string) => {
      let o = open;
      if (key === 'business.phone') o = o.replace(/href="tel:[^"]*"/, `href="tel:${val.replace(/[^+\d]/g, '')}"`);
      if (key === 'business.email') o = o.replace(/href="mailto:[^"]*"/, `href="mailto:${val}"`);
      return `${o}${esc(val)}${close}`;
    });
  }
  return out;
}

export type DocOptions = {
  title?: string; kitSlug: string; theme?: 'light' | 'dark'; bodyClass?: string; bodyHtml: string;
  extraCss?: string; extraJs?: string; includeComponentScripts?: boolean; inlineKit?: boolean; /* false => <link> to /api/css/kit */
  baseHref?: string; editorMode?: boolean;
};

/** Build a complete standalone HTML document. */
export async function buildDocument(o: DocOptions): Promise<string> {
  const { css, kit } = await kitStylesheet(o.kitSlug);
  const fonts = googleFontsHref(kit);
  let js = o.extraJs || '';
  if (o.includeComponentScripts !== false) {
    const comps = await getComponentsBySlugs(componentSlugsIn(o.bodyHtml));
    js = comps.filter(c => c.js).map(c => `/* ${c.slug} */\n${c.js}`).join('\n') + (js ? `\n${js}` : '');
  }
  const styleTag = o.inlineKit === false ? `<link rel="stylesheet" href="/api/css/kit/${o.kitSlug}">` : `<style id="wf-kit">${css}</style>`;
  return `<!doctype html>
<html lang="en" data-theme="${o.theme || 'light'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title || 'WebForge preview')}</title>
${o.baseHref ? `<base href="${o.baseHref}">` : ''}
${fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${fonts}">` : ''}
${styleTag}
${o.extraCss ? `<style id="wf-page">${o.extraCss}</style>` : ''}
</head>
<body${o.bodyClass ? ` class="${esc(o.bodyClass)}"` : ''}>
${o.bodyHtml}
${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
}
