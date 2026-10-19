import { NextResponse } from 'next/server';
import { listProjects, createProject } from '@/lib/projects';
export const dynamic = 'force-dynamic';
export async function GET() { return NextResponse.json(await listProjects()); }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.name || typeof b.name !== 'string') return NextResponse.json({ error: 'name required' }, { status: 400 });
  const p = await createProject({ name: b.name, templateSlug: b.templateSlug || null, kit: b.kit, site: b.site });
  return NextResponse.json(p, { status: 201 });
}
