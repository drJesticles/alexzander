import { listComponents, getComponentsBySlugs } from '@/lib/library';
export const dynamic = 'force-dynamic';
/** Concatenated component scripts. ?slugs=a,b limits; default all. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('slugs');
  const slugs = q ? q.split(',') : (await listComponents()).filter(c => c.hasScript).map(c => c.slug);
  const comps = await getComponentsBySlugs(slugs);
  const js = comps.filter(c => c.js).map(c => `/* ${c.slug} */\n${c.js}`).join('\n');
  return new Response(js, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' } });
}
