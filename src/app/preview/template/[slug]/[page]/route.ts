import { getTemplate } from '@/lib/library';
import { buildDocument, applyFields } from '@/lib/render';
import { cssForHtml } from '@/lib/projects';
export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  const t = await getTemplate(slug);
  if (!t) return new Response('not found', { status: 404 });
  const pg = t.pages.find(p => p.file.replace(/\.html$/, '') === page) || t.pages[0];
  const q = new URL(req.url).searchParams;
  const kit = q.get('kit') || t.kit;
  // make internal links navigate between preview pages, keeping the kit
  const linkMap = new Map(t.pages.map(p => [p.path, `/preview/template/${slug}/${p.file.replace(/\.html$/, '')}?kit=${kit}&theme=${q.get('theme') || 'light'}`]));
  const body = applyFields(pg.html, t.site).replace(/href="([^"#]*)(#[^"]*)?"/g, (m, href: string, hash = '') => linkMap.has(href) ? `href="${linkMap.get(href)}${hash}"` : m);
  const html = await buildDocument({ title: `${t.name} · ${pg.title}`, kitSlug: kit, theme: q.get('theme') === 'dark' ? 'dark' : 'light', bodyClass: `t-${t.slug}`, bodyHtml: body, extraCss: await cssForHtml(pg.html, t.css) });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
