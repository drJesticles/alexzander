import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SITES_DIR, safeSlug } from '@/lib/paths';
export const dynamic = 'force-dynamic';
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8' };
/** Serves published static sites from data/sites/<slug>/. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string; path?: string[] }> }) {
  const { slug, path: parts = [] } = await params;
  const url = new URL(_.url);
  if (!parts.length && !url.pathname.endsWith('/')) return Response.redirect(`${url.origin}${url.pathname}/${url.search}`, 308);
  const root = path.join(SITES_DIR, safeSlug(slug));
  let rel = parts.join('/') || 'index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const fp = path.resolve(root, rel);
  if (!fp.startsWith(root + path.sep) && fp !== root) return new Response('forbidden', { status: 403 });
  try {
    const st = await fs.stat(fp);
    const file = st.isDirectory() ? path.join(fp, 'index.html') : fp;
    const body = await fs.readFile(file);
    return new Response(new Uint8Array(body), { headers: { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' } });
  } catch { return new Response('not found', { status: 404 }); }
}
