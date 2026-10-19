import { kitStylesheet } from '@/lib/render';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { css } = await kitStylesheet((await params).slug);
  return new Response(css, { headers: { 'content-type': 'text/css; charset=utf-8', 'cache-control': 'no-store' } });
}
