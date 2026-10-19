import { NextResponse } from 'next/server';
import { importMaterialTheme } from '@/lib/material';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  try { return NextResponse.json(await importMaterialTheme(b.theme ?? b, { slug: b.slug, name: b.name })); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
}
