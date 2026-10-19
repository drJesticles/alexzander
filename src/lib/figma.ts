import { readSecrets } from './secrets';
import { writeUserKit, hexFrom, mapColorsToTokens, tokensCssFrom } from './kits-user';
import { safeSlug } from './paths';
import type { KitMeta } from './library';

const API = 'https://api.figma.com/v1';
type FigmaStyle = { key: string; node_id: string; style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'; name: string };

export function parseFigmaKey(input: string): string {
  const m = String(input).match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/); return m ? m[1] : String(input).trim();
}
async function fig(pathname: string, token: string) {
  const r = await fetch(`${API}${pathname}`, { headers: { 'X-Figma-Token': token }, cache: 'no-store' });
  if (!r.ok) throw new Error(`Figma ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

export type FigmaImportResult = { kitSlug: string; dir: string; colors: { name: string; hex: string }[]; type: { name: string; family: string; size: number; weight: number }[]; components: string[]; notes: string[] };

/** Import published styles (colors + text) and component names from a Figma file into a user kit. */
export async function importFigmaFile(fileInput: string, opts: { slug?: string; name?: string } = {}): Promise<FigmaImportResult> {
  const { FIGMA_TOKEN } = await readSecrets();
  if (!FIGMA_TOKEN) throw new Error('No FIGMA_TOKEN. Add it in Settings (stored outside the repo).');
  const key = parseFigmaKey(fileInput);
  const notes: string[] = [];
  const file = await fig(`/files/${key}?depth=1`, FIGMA_TOKEN);
  const stylesRes = await fig(`/files/${key}/styles`, FIGMA_TOKEN);
  const styles: FigmaStyle[] = stylesRes.meta?.styles || [];
  const compsRes = await fig(`/files/${key}/components`, FIGMA_TOKEN);
  const components: string[] = (compsRes.meta?.components || []).map((c: { name: string }) => c.name).slice(0, 500);
  const ids = styles.filter(s => s.style_type === 'FILL' || s.style_type === 'TEXT').map(s => s.node_id);
  const colors: { name: string; hex: string }[] = []; const type: FigmaImportResult['type'] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const nodes = await fig(`/files/${key}/nodes?ids=${encodeURIComponent(chunk.join(','))}`, FIGMA_TOKEN);
    for (const s of styles) {
      const doc = nodes.nodes?.[s.node_id]?.document; if (!doc) continue;
      if (s.style_type === 'FILL') { const f = (doc.fills || []).find((x: { type: string; visible?: boolean }) => x.type === 'SOLID' && x.visible !== false); if (f) colors.push({ name: s.name, hex: hexFrom(f.color) }); else notes.push(`style "${s.name}" is not a solid fill; skipped`); }
      if (s.style_type === 'TEXT' && doc.style) type.push({ name: s.name, family: doc.style.fontFamily, size: doc.style.fontSize, weight: doc.style.fontWeight });
    }
  }
  if (!colors.length) {
    // fallback: sample solid fills from top-level frames
    const full = await fig(`/files/${key}?depth=3`, FIGMA_TOKEN);
    const seen = new Map<string, number>();
    const walk = (n: { fills?: { type: string; color?: { r: number; g: number; b: number } }[]; children?: unknown[] }) => { for (const f of n.fills || []) if (f.type === 'SOLID' && f.color) { const h = hexFrom(f.color); seen.set(h, (seen.get(h) || 0) + 1); } for (const c of n.children || []) walk(c as typeof n); };
    walk(full.document);
    for (const [hex, n] of [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) colors.push({ name: `fill-${n}`, hex });
    notes.push('No published color styles; sampled the most-used solid fills instead.');
  }
  const tokens = mapColorsToTokens(colors);
  const families = [...new Set(type.map(t => t.family).filter(Boolean))];
  const display = type.sort((a, b) => b.size - a.size)[0]?.family || families[0];
  const body = type.sort((a, b) => a.size - b.size).find(t => t.size >= 14 && t.size <= 18)?.family || families[1] || families[0];
  const extra: Record<string, string> = {};
  if (display) extra['--wf-font-display'] = `"${display}", system-ui, sans-serif`;
  if (body) extra['--wf-font-body'] = `"${body}", system-ui, sans-serif`;
  const slug = safeSlug(opts.slug || `figma-${file.name}`);
  const meta: KitMeta = { slug, name: opts.name || `Figma: ${file.name}`, family: 'brand', description: `Imported from Figma file "${file.name}" (${colors.length} colors, ${type.length} text styles, ${components.length} components).`, source: `https://www.figma.com/design/${key}`, fonts: families.map(f => ({ family: f, weights: [400, 500, 700] })), dark: false, swatch: [tokens['--wf-primary'], tokens['--wf-accent'], tokens['--wf-bg'], tokens['--wf-text']], tags: ['figma', 'imported'], version: 1 };
  const readme = `# ${meta.name}\n\nImported ${new Date().toISOString()} from ${meta.source}.\n\n## Colors\n${colors.map(c => `- ${c.name}: ${c.hex}`).join('\n')}\n\n## Text styles\n${type.map(t => `- ${t.name}: ${t.family} ${t.size}px / ${t.weight}`).join('\n')}\n\n## Components (${components.length})\n${components.map(c => `- ${c}`).join('\n')}\n\n## Notes\n${notes.map(n => `- ${n}`).join('\n') || '- none'}\n`;
  const dir = await writeUserKit({ meta, tokensCss: tokensCssFrom(tokens, undefined, extra), readme });
  return { kitSlug: slug, dir, colors, type, components, notes };
}
