import SettingsForm from '@/components/SettingsForm';
import { readSecrets, secretsPath } from '@/lib/secrets';
import { DATA_DIR, LIBRARY_DIR } from '@/lib/paths';
export const dynamic = 'force-dynamic';
export default async function Settings() {
  const s = await readSecrets();
  return (
    <div className="p-6 md:p-8 space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings &amp; integrations</h1>
      <SettingsForm status={{ figma: !!s.FIGMA_TOKEN, canva: !!(s.CANVA_CLIENT_ID && s.CANVA_CLIENT_SECRET), secretsFile: secretsPath() }} />
      <div className="panel p-4 text-xs muted space-y-1"><div>Library dir: <code className="code">{LIBRARY_DIR}</code></div><div>Data dir (projects, published sites, imported kits): <code className="code">{DATA_DIR}</code></div><div>Secrets file: <code className="code">{secretsPath()}</code> (outside the repo; never committed)</div></div>
    </div>
  );
}
