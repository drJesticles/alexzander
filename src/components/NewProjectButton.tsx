'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function NewProjectButton({ templateSlug, kit, label, accent }: { templateSlug?: string; kit?: string; label: string; accent?: boolean }) {
  const r = useRouter(); const [busy, setBusy] = useState(false);
  async function go() {
    const name = window.prompt('Project name', templateSlug ? templateSlug.replace(/-/g, ' ') : 'New site'); if (!name) return;
    setBusy(true);
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, templateSlug, kit }) });
    setBusy(false);
    if (!res.ok) { alert('Could not create project'); return; }
    const p = await res.json(); r.push(`/editor/${p.id}`);
  }
  return <button className={`btn ${accent ? 'btn-accent' : ''}`} onClick={go} disabled={busy}>{busy ? 'Creating…' : label}</button>;
}
