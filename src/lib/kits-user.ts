import { promises as fs } from 'node:fs';
import path from 'node:path';
import { USER_KITS_DIR, safeSlug } from './paths';
import type { KitMeta } from './library';

export type KitDraft = { meta: KitMeta; tokensCss: string; kitCss?: string; readme?: string };

export async function writeUserKit(d: KitDraft): Promise<string> {
  const slug = safeSlug(d.meta.slug);
  const dir = path.join(USER_KITS_DIR, slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'kit.json'), JSON.stringify({ ...d.meta, slug }, null, 2));
  await fs.writeFile(path.join(dir, 'tokens.css'), d.tokensCss);
  if (d.kitCss) await fs.writeFile(path.join(dir, 'kit.css'), d.kitCss);
  if (d.readme) await fs.writeFile(path.join(dir, 'README.md'), d.readme);
  return dir;
}

export function hexFrom(c: { r: number; g: number; b: number; a?: number }): string {
  const h = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}
export function luminance(hex: string): number {
  const m = hex.replace('#', '').match(/.{2}/g); if (!m) return 0;
  const [r, g, b] = m.map(x => { const v = parseInt(x, 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const onColor = (hex: string) => luminance(hex) > 0.4 ? '#111111' : '#ffffff';

/** Map a bag of named colors to the --wf-* contract with name heuristics, then fill gaps in order. */
export function mapColorsToTokens(named: { name: string; hex: string }[]): Record<string, string> {
  const t: Record<string, string> = {};
  const pick = (re: RegExp) => named.find(c => re.test(c.name.toLowerCase()))?.hex;
  const primary = pick(/primary|brand|main/) || named.find(c => luminance(c.hex) < 0.5 && luminance(c.hex) > 0.03)?.hex || named[0]?.hex || '#2457f5';
  const secondary = pick(/secondary/) || named.find(c => c.hex !== primary && luminance(c.hex) < 0.15)?.hex || '#0f172a';
  const accent = pick(/accent|tertiary|highlight/) || named.find(c => ![primary, secondary].includes(c.hex) && luminance(c.hex) > 0.2 && luminance(c.hex) < 0.7)?.hex || '#f59e0b';
  const bg = pick(/background|canvas|^bg/) || named.find(c => luminance(c.hex) > 0.9)?.hex || '#ffffff';
  const surface = pick(/surface|card|panel/) || named.find(c => luminance(c.hex) > 0.8 && c.hex !== bg)?.hex || '#f5f5f7';
  const text = pick(/text|ink|foreground|on-background/) || named.find(c => luminance(c.hex) < 0.05)?.hex || '#16181d';
  const border = pick(/border|outline|divider|stroke/) || '#d9dbe3';
  Object.assign(t, { '--wf-primary': primary, '--wf-on-primary': onColor(primary), '--wf-primary-hover': primary, '--wf-secondary': secondary, '--wf-on-secondary': onColor(secondary), '--wf-accent': accent, '--wf-on-accent': onColor(accent), '--wf-bg': bg, '--wf-surface': surface, '--wf-surface-2': surface, '--wf-text': text, '--wf-text-muted': text, '--wf-border': border });
  const s = pick(/success|green/); if (s) t['--wf-success'] = s; const w = pick(/warning|amber|orange/); if (w) t['--wf-warning'] = w; const d = pick(/danger|error|red/); if (d) t['--wf-danger'] = d;
  return t;
}
export function tokensCssFrom(tokens: Record<string, string>, dark?: Record<string, string>, extra: Record<string, string> = {}): string {
  const block = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `:root {\n${block({ ...tokens, ...extra })}\n}\n${dark ? `[data-theme="dark"] {\n${block(dark)}\n}\n` : ''}`;
}
