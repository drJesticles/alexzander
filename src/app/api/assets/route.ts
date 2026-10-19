import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, safeSlug } from '@/lib/paths';
export const dynamic = 'force-dynamic';
const ASSETS = path.join(DATA_DIR, 'assets');
const OK = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.mp4', '.webm', '.pdf']);
/** GrapesJS asset manager upload target. Multipart field "files". Also used for Canva exports. */
export async function GET() {
  await fs.mkdir(ASSETS, { recursive: true });
  const names = (await fs.readdir(ASSETS)).filter(n => OK.has(path.extname(n).toLowerCase())).sort();
  return NextResponse.json(names.map(n => ({ src: `/assets/${n}`, name: n })));
}
export async function POST(req: Request) {
  await fs.mkdir(ASSETS, { recursive: true });
  const form = await req.formData();
  const out: { src: string; name: string }[] = [];
  for (const [, v] of form.entries()) {
    if (!(v instanceof File)) continue;
    const ext = path.extname(v.name).toLowerCase();
    if (!OK.has(ext) || v.size > 25 * 1024 * 1024) continue;
    const name = `${safeSlug(path.basename(v.name, ext))}-${Date.now().toString(36)}${ext}`;
    await fs.writeFile(path.join(ASSETS, name), Buffer.from(await v.arrayBuffer()));
    out.push({ src: `/assets/${name}`, name });
  }
  return NextResponse.json({ data: out });
}
