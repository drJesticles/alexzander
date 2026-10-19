import Link from 'next/link';
import { listTemplates } from '@/lib/library';
export const dynamic = 'force-dynamic';
export default async function Templates({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams;
  const all = await listTemplates();
  const verticals = [...new Set(all.map(t => t.vertical))];
  const list = v ? all.filter(t => t.vertical === v) : all;
  return (
    <div className="p-6 md:p-8 space-y-5">
      <h1 className="text-2xl font-bold">Templates <span className="muted text-base font-normal">({list.length})</span></h1>
      <div className="flex flex-wrap gap-2"><Link href="/templates" className={`chip ${!v ? 'chip-active' : ''}`}>all</Link>{verticals.map(x => <Link key={x} href={`/templates?v=${x}`} className={`chip ${v === x ? 'chip-active' : ''}`}>{x}</Link>)}</div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(t => (
          <Link key={t.slug} href={`/templates/${t.slug}`} className="panel card-link overflow-hidden">
            <div className="h-52 overflow-hidden bg-white"><iframe className="preview pointer-events-none" loading="lazy" src={`/preview/template/${t.slug}/index?kit=${t.kit}`} style={{ width: 1280, height: 1000, transform: 'scale(0.3125)', transformOrigin: '0 0' }} title={t.name} /></div>
            <div className="p-3 space-y-1"><div className="font-medium">{t.name}</div><div className="muted text-xs line-clamp-2">{t.description}</div><div className="muted text-xs">{t.pages.length} pages · {t.vertical} · kit {t.kit}</div></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
