import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '@/lib/paths';
export const dynamic = 'force-dynamic';
const TYPES: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf' };
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const root = path.join(DATA_DIR, 'assets');
  const fp = path.resolve(root, ...(await params).path);
  if (!fp.startsWith(root + path.sep)) return new Response('forbidden', { status: 403 });
  try { const b = await fs.readFile(fp); return new Response(new Uint8Array(b), { headers: { 'content-type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'cache-control': 'public, max-age=3600' } }); }
  catch { return new Response('not found', { status: 404 }); }
}
