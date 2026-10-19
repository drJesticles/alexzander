import { getProject } from '@/lib/projects';
import { buildStaticSite, zipSite } from '@/lib/export';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await getProject((await params).id);
  if (!p) return new Response('not found', { status: 404 });
  const buf = await zipSite(await buildStaticSite(p));
  return new Response(new Uint8Array(buf), { headers: { 'content-type': 'application/zip', 'content-disposition': `attachment; filename="${p.slug || p.id}.zip"` } });
}
