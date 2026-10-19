import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getComponent, listKits } from '@/lib/library';
import KitPreview from '@/components/KitPreview';
import CodeBlock from '@/components/CodeBlock';
export const dynamic = 'force-dynamic';
export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [c, kits] = await Promise.all([getComponent(slug), listKits()]);
  if (!c) notFound();
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div><Link href={`/components?cat=${c.category}`} className="muted text-xs">← {c.category}</Link><h1 className="text-2xl font-bold">{c.name}</h1><p className="muted text-sm max-w-2xl">{c.description}</p><div className="flex gap-2 mt-2 flex-wrap">{c.tags.map(x => <span key={x} className="chip">{x}</span>)}{c.hasScript && <span className="chip">has script</span>}</div></div>
      <KitPreview kits={kits} defaultKit="base" height={Math.max(c.previewHeight + 40, 320)} srcFor={(kit, theme) => `/preview/component/${c.slug}?kit=${kit}&theme=${theme}`} />
      <div className="grid lg:grid-cols-2 gap-4">
        <CodeBlock title="index.html" code={c.html} lang="html" />
        <CodeBlock title="style.css" code={c.css} lang="css" />
        {c.js && <CodeBlock title="script.js" code={c.js} lang="js" />}
      </div>
      <p className="muted text-xs">Library path: <code className="code">library/components/{c.category}/{c.slug}/</code>. Edit the files there; the catalog and editor pick changes up on the next request.</p>
    </div>
  );
}
