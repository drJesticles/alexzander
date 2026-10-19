import { NextResponse } from 'next/server';
import { getTemplate } from '@/lib/library';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const t = await getTemplate((await params).slug);
  return t ? NextResponse.json(t) : NextResponse.json({ error: 'not found' }, { status: 404 });
}
