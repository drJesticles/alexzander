import { getComponent } from '@/lib/library';
import { buildDocument } from '@/lib/render';
export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const c = await getComponent((await params).slug);
  if (!c) return new Response('not found', { status: 404 });
  const q = new URL(req.url).searchParams;
  const html = await buildDocument({ title: c.name, kitSlug: q.get('kit') || 'base', theme: q.get('theme') === 'dark' ? 'dark' : 'light', bodyHtml: c.html, extraCss: c.css, extraJs: q.get('pad') ? '' : undefined, bodyClass: q.get('pad') ? 'wf-preview-pad' : '' });
  return new Response(html.replace('</head>', '<style>.wf-preview-pad{padding:2rem}</style></head>'), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
