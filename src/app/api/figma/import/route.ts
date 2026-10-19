import { NextResponse } from 'next/server';
import { importFigmaFile } from '@/lib/figma';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.file) return NextResponse.json({ error: 'file (URL or key) required' }, { status: 400 });
  try { return NextResponse.json(await importFigmaFile(b.file, { slug: b.slug, name: b.name })); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
}
