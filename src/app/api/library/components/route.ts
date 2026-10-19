import { NextResponse } from 'next/server';
import { listComponents, getComponentsBySlugs } from '@/lib/library';
export const dynamic = 'force-dynamic';
/** ?full=1 returns html/css/js for every component (used by the editor to build blocks). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const list = await listComponents(true);
  if (url.searchParams.get('full')) return NextResponse.json(await getComponentsBySlugs(list.map(c => c.slug)));
  return NextResponse.json(list);
}
