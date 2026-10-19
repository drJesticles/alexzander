'use client';
import { useState } from 'react';
import type { KitMeta } from '@/lib/library';
type Props = { kits: KitMeta[]; defaultKit: string; height: number; pages?: { id: string; label: string }[]; srcFor: (kit: string, theme: string, page: string) => string };
export default function KitPreview({ kits, defaultKit, height, pages, srcFor }: Props) {
  const [kit, setKit] = useState(defaultKit); const [theme, setTheme] = useState<'light' | 'dark'>('light'); const [page, setPage] = useState(pages?.[0]?.id || 'index'); const [w, setW] = useState<number | '100%'>('100%');
  const k = kits.find(x => x.slug === kit);
  const src = srcFor(kit, theme, page);
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-[var(--app-border)] text-sm">
        <label className="flex items-center gap-2">Kit <select className="select !w-auto" value={kit} onChange={e => setKit(e.target.value)}>{kits.map(x => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></label>
        <button className={`btn btn-sm ${theme === 'dark' ? 'btn-blue' : ''}`} disabled={!k?.dark} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={k?.dark ? 'Toggle dark mode' : 'This kit has no dark scheme'}>{theme === 'dark' ? 'Dark' : 'Light'}</button>
        {pages && pages.length > 1 && <div className="flex gap-1">{pages.map(p => <button key={p.id} className={`chip ${page === p.id ? 'chip-active' : ''}`} onClick={() => setPage(p.id)}>{p.label}</button>)}</div>}
        <div className="ml-auto flex gap-1">{([['100%', 'Full'], [1024, 'Tablet'], [390, 'Phone']] as const).map(([v, l]) => <button key={l} className={`chip ${w === v ? 'chip-active' : ''}`} onClick={() => setW(v)}>{l}</button>)}<a className="chip" href={src} target="_blank" rel="noreferrer">Open ↗</a></div>
      </div>
      <div className="bg-[#2b2f3a] flex justify-center"><iframe key={src + w} className="preview" src={src} style={{ width: w, height, maxWidth: '100%' }} title="preview" /></div>
    </div>
  );
}
