import { NextResponse } from 'next/server';
import { getProject, saveProject, deleteProject, type Project } from '@/lib/projects';
export const dynamic = 'force-dynamic';
type P = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: P) {
  const p = await getProject((await params).id);
  return p ? NextResponse.json(p) : NextResponse.json({ error: 'not found' }, { status: 404 });
}
export async function PUT(req: Request, { params }: P) {
  const cur = await getProject((await params).id);
  if (!cur) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as Partial<Project>;
  const allowed: (keyof Project)[] = ['name', 'kit', 'theme', 'bodyClass', 'site', 'pages', 'gjs'];
  for (const k of allowed) if (b[k] !== undefined) (cur as unknown as Record<string, unknown>)[k] = b[k];
  return NextResponse.json(await saveProject(cur));
}
export async function DELETE(_: Request, { params }: P) { await deleteProject((await params).id); return NextResponse.json({ ok: true }); }
