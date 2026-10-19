import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SECRETS_FILE } from './paths';

/** KEY=VALUE file outside the repo (default ~/.drJesticles/webforge.env). process.env wins. */
export async function readSecrets(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    const txt = await fs.readFile(SECRETS_FILE, 'utf8');
    for (const line of txt.split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
  } catch {}
  for (const k of ['FIGMA_TOKEN', 'CANVA_CLIENT_ID', 'CANVA_CLIENT_SECRET', 'UNSPLASH_KEY']) if (process.env[k]) out[k] = process.env[k] as string;
  return out;
}
export async function writeSecret(key: string, value: string): Promise<{ ok: boolean; file: string; error?: string }> {
  if (!/^[A-Z0-9_]+$/.test(key)) return { ok: false, file: SECRETS_FILE, error: 'bad key' };
  try {
    await fs.mkdir(path.dirname(SECRETS_FILE), { recursive: true, mode: 0o700 });
    let txt = ''; try { txt = await fs.readFile(SECRETS_FILE, 'utf8'); } catch {}
    const lines = txt.split('\n').filter(l => l.trim() && !l.startsWith(`${key}=`));
    if (value) lines.push(`${key}=${value}`);
    await fs.writeFile(SECRETS_FILE, lines.join('\n') + '\n', { mode: 0o600 });
    return { ok: true, file: SECRETS_FILE };
  } catch (e) { return { ok: false, file: SECRETS_FILE, error: (e as Error).message }; }
}
export function secretsPath() { return SECRETS_FILE; }
