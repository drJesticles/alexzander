import Link from 'next/link';
import { listKits } from '@/lib/library';
export const dynamic = 'force-dynamic';
const FAM: Record<string, string> = { brand: 'Brand kits', 'big-four': 'The big four', 'web-dev': 'Web-dev favorites', 'off-the-wall': 'Off the wall' };
export default async function Kits() {
  const kits = await listKits();
  const fams = [...new Set(kits.map(k => k.family))];
  return (
    <div className="p-6 md:p-8 space-y-8">
      <div><h1 className="text-2xl font-bold">Design kits <span className="muted text-base font-normal">({kits.length})</span></h1><p className="muted text-sm">A kit is a token set plus a base restyle. Any kit reskins every component and template. Import your own from Figma or Material Theme Builder in Settings.</p></div>
      {fams.map(f => (
        <section key={f} className="space-y-3"><h2 className="font-semibold">{FAM[f] || f}</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kits.filter(k => k.family === f).map(k => (
              <Link key={k.slug} href={`/kits/${k.slug}`} className="panel card-link overflow-hidden">
                <div className="flex h-16">{k.swatch.map((s, i) => <div key={i} className="flex-1" style={{ background: s }} />)}</div>
                <div className="p-3 space-y-1"><div className="font-medium">{k.name} {k.user && <span className="chip">imported</span>}</div><div className="muted text-xs line-clamp-2">{k.description}</div><div className="muted text-xs">{k.fonts.map(x => x.family).join(', ') || 'system fonts'}{k.dark ? ' · dark mode' : ''}</div></div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
