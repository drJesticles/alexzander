import { writeUserKit, onColor, tokensCssFrom } from './kits-user';
import { safeSlug } from './paths';
import type { KitMeta } from './library';

/** Import a Material Theme Builder export (material-theme.json with schemes.light/dark). */
export async function importMaterialTheme(json: unknown, opts: { slug?: string; name?: string } = {}) {
  const j = json as { schemes?: Record<string, Record<string, string>>; description?: string; seed?: string };
  const light = j.schemes?.light; const dark = j.schemes?.dark;
  if (!light) throw new Error('Not a Material Theme Builder export: schemes.light missing');
  const map = (s: Record<string, string>) => ({
    '--wf-bg': s.background || s.surface, '--wf-surface': s.surfaceContainerLow || s.surfaceVariant || s.surface, '--wf-surface-2': s.surfaceContainerHigh || s.surfaceVariant || s.surface,
    '--wf-text': s.onBackground || s.onSurface, '--wf-text-muted': s.onSurfaceVariant || s.onSurface,
    '--wf-primary': s.primary, '--wf-on-primary': s.onPrimary || onColor(s.primary), '--wf-primary-hover': s.primaryContainer || s.primary,
    '--wf-secondary': s.secondaryContainer || s.secondary, '--wf-on-secondary': s.onSecondaryContainer || s.onSecondary || onColor(s.secondary),
    '--wf-accent': s.tertiary, '--wf-on-accent': s.onTertiary || onColor(s.tertiary), '--wf-border': s.outlineVariant || s.outline,
    '--wf-danger': s.error, '--wf-shadow-sm': '0 1px 2px rgba(0,0,0,.08)', '--wf-shadow-md': '0 4px 12px rgba(0,0,0,.12)',
  });
  const slug = safeSlug(opts.slug || `material-${(j.seed || 'custom').replace('#', '')}`);
  const meta: KitMeta = { slug, name: opts.name || `Material: ${j.seed || 'custom'}`, family: 'big-four', description: `Material Theme Builder import${j.seed ? ` seeded from ${j.seed}` : ''}.`, source: 'https://material-foundation.github.io/material-theme-builder/', fonts: [{ family: 'Roboto', weights: [400, 500, 700] }], dark: !!dark, swatch: [light.primary, light.tertiary, light.background || light.surface, light.onBackground || light.onSurface], tags: ['material', 'imported'], version: 1 };
  const extra = { '--wf-font-display': '"Roboto", system-ui, sans-serif', '--wf-font-body': '"Roboto", system-ui, sans-serif', '--wf-radius-md': '0.75rem', '--wf-radius-lg': '1rem', '--wf-btn-radius': '9999px', '--wf-card-radius': '1rem' };
  const dir = await writeUserKit({ meta, tokensCss: tokensCssFrom(map(light), dark ? map(dark) : undefined, extra), kitCss: '.wf-btn{letter-spacing:.01em}\n.wf-card{border:0}\n' });
  return { kitSlug: slug, dir };
}
