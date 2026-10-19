import Link from 'next/link';
import { listComponents, CATEGORIES } from '@/lib/library';
export const dynamic = 'force-dynamic';
export default async function Components({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q } = await searchParams;
  const all = await listComponents(true);
  const present = CATEGORIES.filter(c => all.some(x => x.category === c));
  let list = cat ? all.filter(c => c.category === cat) : all;
  if (q) { const s = q.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(s) || c.tags.join(' ').includes(s) || c.slug.includes(s)); }
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Components <span className="muted text-base font-normal">({list.length})</span></h1>
        <form className="flex gap-2"><input className="input" name="q" defaultValue={q || ''} placeholder="Search…" />{cat && <input type="hidden" name="cat" value={cat} />}<button className="btn" type="submit">Go</button></form>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/components" className={`chip ${!cat ? 'chip-active' : ''}`}>all</Link>{present.map(x => <Link key={x} href={`/components?cat=${x}`} className={`chip ${cat === x ? 'chip-active' : ''}`}>{x} <span className="opacity-60 ml-1">{all.filter(c => c.category === x).length}</span></Link>)}</div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(c => (
          <Link key={c.slug} href={`/components/${c.slug}`} className="panel card-link overflow-hidden">
            <div className="overflow-hidden bg-white" style={{ height: 180 }}><iframe className="preview pointer-events-none" loading="lazy" src={`/preview/component/${c.slug}?kit=base`} style={{ width: 1280, height: Math.max(c.previewHeight, 400), transform: 'scale(0.3125)', transformOrigin: '0 0' }} title={c.name} /></div>
            <div className="p-3 space-y-1"><div className="font-medium">{c.name}</div><div className="muted text-xs line-clamp-2">{c.description}</div><div className="flex gap-1 flex-wrap"><span className="chip">{c.category}</span>{c.hasScript && <span className="chip">js</span>}</div></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
