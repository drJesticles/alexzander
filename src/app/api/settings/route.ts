import { NextResponse } from 'next/server';
import { writeSecret, readSecrets, secretsPath } from '@/lib/secrets';
export const dynamic = 'force-dynamic';
export async function GET() { const s = await readSecrets(); return NextResponse.json({ file: secretsPath(), keys: Object.keys(s) }); }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const allowed = ['FIGMA_TOKEN', 'CANVA_CLIENT_ID', 'CANVA_CLIENT_SECRET', 'UNSPLASH_KEY'];
  if (!allowed.includes(b.key)) return NextResponse.json({ error: 'unknown key' }, { status: 400 });
  const r = await writeSecret(b.key, String(b.value || ''));
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
