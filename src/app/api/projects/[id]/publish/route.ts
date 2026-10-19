import { NextResponse } from 'next/server';
import { getProject, saveProject } from '@/lib/projects';
import { publishSite } from '@/lib/export';
export const dynamic = 'force-dynamic';
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const p = await getProject((await params).id);
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const r = await publishSite(p);
  p.publishedAt = new Date().toISOString(); await saveProject(p);
  return NextResponse.json({ ...r, publishedAt: p.publishedAt });
}
