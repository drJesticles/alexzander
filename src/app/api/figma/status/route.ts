import { NextResponse } from 'next/server';
import { readSecrets, secretsPath } from '@/lib/secrets';
export const dynamic = 'force-dynamic';
export async function GET() {
  const s = await readSecrets();
  return NextResponse.json({ figma: !!s.FIGMA_TOKEN, canva: !!(s.CANVA_CLIENT_ID && s.CANVA_CLIENT_SECRET), unsplash: !!s.UNSPLASH_KEY, secretsFile: secretsPath() });
}
