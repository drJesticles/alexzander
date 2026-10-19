import { getProject } from '@/lib/projects';
import { buildDocument } from '@/lib/render';
export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: Promise<{ id: string; pageId: string }> }) {
  const { id, pageId } = await params;
  const p = await getProject(id);
  if (!p) return new Response('not found', { status: 404 });
  const pg = p.pages.find(x => x.id === pageId) || p.pages[0];
  if (!pg) return new Response('no pages', { status: 404 });
  const q = new URL(req.url).searchParams;
  const linkMap = new Map(p.pages.map(x => [x.path, `/preview/project/${p.id}/${x.id}`]));
  const body = pg.html.replace(/href="([^"#]*)(#[^"]*)?"/g, (m, href: string, hash = '') => linkMap.has(href) ? `href="${linkMap.get(href)}${hash}"` : m);
  const html = await buildDocument({ title: `${p.name} · ${pg.name}`, kitSlug: q.get('kit') || p.kit, theme: (q.get('theme') as 'light' | 'dark') || p.theme, bodyClass: p.bodyClass, bodyHtml: body, extraCss: pg.css });
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
