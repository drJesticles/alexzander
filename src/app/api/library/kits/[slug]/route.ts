import { NextResponse } from 'next/server';
import { getKit } from '@/lib/library';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const kit = await getKit((await params).slug);
  return kit ? NextResponse.json(kit) : NextResponse.json({ error: 'not found' }, { status: 404 });
}
