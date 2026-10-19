import { notFound } from 'next/navigation';
import { getTemplate, listKits } from '@/lib/library';
import KitPreview from '@/components/KitPreview';
import NewProjectButton from '@/components/NewProjectButton';
export const dynamic = 'force-dynamic';
export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [t, kits] = await Promise.all([getTemplate(slug), listKits()]);
  if (!t) notFound();
  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold">{t.name}</h1><p className="muted text-sm max-w-2xl">{t.description}</p><div className="flex gap-2 mt-2 flex-wrap">{t.tags.map(x => <span key={x} className="chip">{x}</span>)}</div></div>
        <NewProjectButton templateSlug={t.slug} kit={t.kit} label="Use this template" accent />
      </div>
      <KitPreview kits={kits} defaultKit={t.kit} height={820} pages={t.pages.map(p => ({ id: p.file.replace(/\.html$/, ''), label: p.title }))} srcFor={(kit, theme, page) => `/preview/template/${t.slug}/${page}?kit=${kit}&theme=${theme}`} />
      <div className="panel p-4 text-sm"><div className="font-medium mb-1">Components used</div><div className="flex flex-wrap gap-2">{(t.components || []).map(c => <span key={c} className="chip">{c}</span>)}</div></div>
    </div>
  );
}
