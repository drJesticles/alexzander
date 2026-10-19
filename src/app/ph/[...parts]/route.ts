import { placeholderSvg } from '@/lib/export';
/** /ph/<w>/<h>/<label>.svg -> neutral placeholder image. */
export async function GET(_: Request, { params }: { params: Promise<{ parts: string[] }> }) {
  const [w, h, ...rest] = (await params).parts;
  const label = rest.join('/').replace(/\.svg$/, '');
  return new Response(placeholderSvg(+w, +h, label), { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' } });
}
