import { getComponentsBySlugs, listComponents } from '@/lib/library';
import { buildDocument } from '@/lib/render';
export const dynamic = 'force-dynamic';
/** A sampler page: one component from several categories, rendered under this kit. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const q = new URL(req.url).searchParams;
  const all = await listComponents();
  const wanted = ['nav', 'hero', 'features', 'services', 'pricing', 'testimonials', 'faq', 'forms', 'cta', 'footer'];
  const picks = wanted.map(cat => all.find(c => c.category === cat)?.slug).filter(Boolean) as string[];
  const comps = await getComponentsBySlugs(picks);
  const html = await buildDocument({ title: `Kit sampler: ${slug}`, kitSlug: slug, theme: q.get('theme') === 'dark' ? 'dark' : 'light', bodyHtml: comps.map(c => c.html).join('\n'), extraCss: comps.map(c => c.css).join('\n') });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
