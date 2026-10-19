'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
type P = { id: string; name: string; kit: string; templateSlug: string | null; updatedAt: string; publishedAt?: string | null; slug: string };
export default function ProjectsList({ kits }: { kits: string[] }) {
  const [list, setList] = useState<P[] | null>(null);
  const load = () => fetch('/api/projects').then(r => r.json()).then(setList);
  useEffect(() => { load(); }, []);
  if (!list) return <p className="muted text-sm">Loading…</p>;
  if (!list.length) return <p className="muted text-sm">No projects yet.</p>;
  return (
    <div className="panel divide-y divide-[var(--app-border)]">
      {list.map(p => (
        <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
          <div className="flex-1 min-w-48"><div className="font-medium">{p.name}</div><div className="muted text-xs">{p.templateSlug ? `from ${p.templateSlug}` : 'blank'} · kit {p.kit} · {p.updatedAt.slice(0, 16).replace('T', ' ')}{p.publishedAt && <> · <a className="underline" href={`/sites/${p.slug}/`} target="_blank" rel="noreferrer">published</a></>}</div></div>
          <select className="select !w-auto" value={p.kit} onChange={async e => { await fetch(`/api/projects/${p.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kit: e.target.value }) }); load(); }}>{kits.map(k => <option key={k}>{k}</option>)}</select>
          <Link className="btn btn-sm btn-blue" href={`/editor/${p.id}`}>Open editor</Link>
          <a className="btn btn-sm" href={`/preview/project/${p.id}/index`} target="_blank" rel="noreferrer">Preview</a>
          <a className="btn btn-sm" href={`/api/projects/${p.id}/export`}>Export zip</a>
          <button className="btn btn-sm" onClick={async () => { if (!confirm(`Delete “${p.name}”? This removes data/projects/${p.id}.json.`)) return; await fetch(`/api/projects/${p.id}`, { method: 'DELETE' }); load(); }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
