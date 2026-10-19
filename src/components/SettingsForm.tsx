'use client';
import { useState } from 'react';
export default function SettingsForm({ status }: { status: { figma: boolean; canva: boolean; secretsFile: string } }) {
  const [msg, setMsg] = useState(''); const [figmaFile, setFigmaFile] = useState(''); const [busy, setBusy] = useState(false);
  async function saveSecret(key: string, value: string) {
    const r = await fetch('/api/settings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key, value }) });
    const j = await r.json(); setMsg(j.ok ? `Saved ${key} to ${j.file}` : `Failed: ${j.error}`);
  }
  async function importFigma() {
    setBusy(true); setMsg('Importing from Figma…');
    const r = await fetch('/api/figma/import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file: figmaFile }) });
    const j = await r.json(); setBusy(false);
    setMsg(r.ok ? `Imported kit "${j.kitSlug}" (${j.colors.length} colors, ${j.type.length} text styles, ${j.components.length} components) → ${j.dir}. Open /kits/${j.kitSlug}.` : `Figma import failed: ${j.error}`);
  }
  async function importMaterial(file: File) {
    setBusy(true); setMsg('Importing Material theme…');
    const text = await file.text();
    const r = await fetch('/api/kits/import-material', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ theme: JSON.parse(text) }) });
    const j = await r.json(); setBusy(false);
    setMsg(r.ok ? `Imported kit "${j.kitSlug}" → ${j.dir}` : `Material import failed: ${j.error}`);
  }
  const Secret = ({ k, label, hint }: { k: string; label: string; hint: string }) => {
    const [v, setV] = useState('');
    return <form className="flex flex-wrap gap-2 items-end" onSubmit={e => { e.preventDefault(); saveSecret(k, v); setV(''); }}><label className="flex-1 min-w-64 text-sm"><span className="block mb-1">{label}</span><input className="input" type="password" value={v} onChange={e => setV(e.target.value)} placeholder={hint} /></label><button className="btn" type="submit">Save</button></form>;
  };
  return (
    <div className="space-y-5">
      {msg && <div className="panel p-3 text-sm border-[var(--app-accent-2)]">{msg}</div>}
      <section className="panel p-4 space-y-3">
        <h2 className="font-semibold">Figma <span className={`chip ${status.figma ? 'chip-active' : ''}`}>{status.figma ? 'token set' : 'no token'}</span></h2>
        <p className="muted text-sm">Create a personal access token at figma.com → Settings → Security → Personal access tokens (scope: file content read). It is written to <code className="code">{status.secretsFile}</code>, never into the repo.</p>
        <Secret k="FIGMA_TOKEN" label="Personal access token" hint="figd_…" />
        <div className="flex flex-wrap gap-2 items-end"><label className="flex-1 min-w-64 text-sm"><span className="block mb-1">Import a file as a design kit (URL or file key)</span><input className="input" value={figmaFile} onChange={e => setFigmaFile(e.target.value)} placeholder="https://www.figma.com/design/XXXX/Name" /></label><button className="btn btn-blue" disabled={!status.figma || busy || !figmaFile} onClick={importFigma}>Import styles</button></div>
        <p className="muted text-xs">Pulls published color styles, text styles, and component names into a new kit under data/kits/. Rename the result in its kit.json if the heuristic mapping (primary/secondary/accent) needs a nudge.</p>
      </section>
      <section className="panel p-4 space-y-3">
        <h2 className="font-semibold">Material Design 3</h2>
        <p className="muted text-sm">Export a theme from the <a className="underline" href="https://material-foundation.github.io/material-theme-builder/" target="_blank" rel="noreferrer">Material Theme Builder</a> (JSON) and drop it here to get a kit with light and dark schemes.</p>
        <input className="input" type="file" accept="application/json" onChange={e => e.target.files?.[0] && importMaterial(e.target.files[0])} />
      </section>
      <section className="panel p-4 space-y-3">
        <h2 className="font-semibold">Canva <span className={`chip ${status.canva ? 'chip-active' : ''}`}>{status.canva ? 'keys set' : 'link-out mode'}</span></h2>
        <p className="muted text-sm">Link-out mode is on: the editor’s image settings offer “Design in Canva”, and Canva exports drop into the asset manager. Full API (Canva Connect) needs an approved app; paste its keys here once you have them.</p>
        <Secret k="CANVA_CLIENT_ID" label="Client ID" hint="OC-…" /><Secret k="CANVA_CLIENT_SECRET" label="Client secret" hint="cnvca…" />
      </section>
      <section className="panel p-4 space-y-3">
        <h2 className="font-semibold">Other design sources</h2>
        <ul className="text-sm muted list-disc pl-5 space-y-1">
          <li>Material Design 3: <a className="underline" href="https://m3.material.io" target="_blank" rel="noreferrer">m3.material.io</a> (kit: material3)</li>
          <li>Apple HIG, Fluent 2, Carbon, shadcn, Bootstrap, Radix, Chakra, Ant, DaisyUI, Mantine, Polaris, Primer, Atlassian: see Design kits.</li>
          <li>Google Fonts load automatically from each kit’s <code className="code">fonts</code> list.</li>
          <li>Add your own kit: copy <code className="code">library/kits/base</code>, edit tokens.css, done.</li>
        </ul>
      </section>
    </div>
  );
}
