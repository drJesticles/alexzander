import { NextResponse } from 'next/server';
import { getComponent } from '@/lib/library';
export const dynamic = 'force-dynamic';
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const c = await getComponent((await params).slug);
  return c ? NextResponse.json(c) : NextResponse.json({ error: 'not found' }, { status: 404 });
}
