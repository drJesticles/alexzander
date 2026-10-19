import { notFound } from 'next/navigation';
import { getKit, listKits } from '@/lib/library';
import KitPreview from '@/components/KitPreview';
import CodeBlock from '@/components/CodeBlock';
export const dynamic = 'force-dynamic';
export default async function KitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [k, kits] = await Promise.all([getKit(slug), listKits()]);
  if (!k) notFound();
  const tokens = [...k.tokensCss.matchAll(/(--wf-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]);
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex items-start gap-4"><div className="flex w-32 h-16 rounded overflow-hidden shrink-0">{k.swatch.map((s, i) => <div key={i} className="flex-1" style={{ background: s }} />)}</div>
        <div><h1 className="text-2xl font-bold">{k.name}</h1><p className="muted text-sm max-w-2xl">{k.description}</p><div className="muted text-xs mt-1">{k.family} · {k.fonts.map(x => x.family).join(', ') || 'system fonts'} · {k.dark ? 'light + dark' : 'light only'}{k.source && <> · <a className="underline" href={k.source} target="_blank" rel="noreferrer">source</a></>}</div></div></div>
      <KitPreview kits={kits} defaultKit={k.slug} height={900} srcFor={(kit, theme) => `/preview/kit/${kit}?theme=${theme}`} />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-4"><div className="font-medium mb-2 text-sm">Tokens set by this kit ({tokens.length})</div><div className="max-h-96 overflow-auto code"><table className="w-full"><tbody>{tokens.map(([n, v]) => <tr key={n + v} className="border-t border-[var(--app-border)]"><td className="py-1 pr-3 muted">{n}</td><td className="py-1 flex items-center gap-2">{/^#|^rgb|^hsl/.test(v) && <span className="inline-block w-4 h-4 rounded border border-[var(--app-border)]" style={{ background: v }} />}{v}</td></tr>)}</tbody></table></div></div>
        <div className="space-y-4"><CodeBlock title="tokens.css" code={k.tokensCss} lang="css" />{k.kitCss && <CodeBlock title="kit.css" code={k.kitCss} lang="css" />}</div>
      </div>
    </div>
  );
}
