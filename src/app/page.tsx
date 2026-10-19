import Link from 'next/link';
import { libraryCounts, listTemplates, listKits } from '@/lib/library';
import { listProjects } from '@/lib/projects';
import NewProjectButton from '@/components/NewProjectButton';
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [c, tpls, kits, projects] = await Promise.all([libraryCounts(), listTemplates(), listKits(), listProjects()]);
  return (
    <div className="p-6 md:p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">WebForge</h1>
        <p className="muted text-sm">Pick a template, swap the design kit, edit visually or in code, export or publish. Self-hosted on Alex.</p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Templates', c.templates, '/templates'], ['Components', c.components, '/components'], ['Design kits', c.kits, '/kits'], ['Projects', projects.length, '/projects']].map(([l, n, h]) => (
          <Link key={String(l)} href={String(h)} className="panel card-link p-4"><div className="text-3xl font-bold">{n}</div><div className="muted text-sm">{l}</div></Link>
        ))}
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Start something</h2><NewProjectButton label="Blank project" /></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tpls.slice(0, 6).map(t => (
            <Link key={t.slug} href={`/templates/${t.slug}`} className="panel card-link overflow-hidden">
              <div className="h-40 overflow-hidden bg-white"><iframe className="preview pointer-events-none" loading="lazy" src={`/preview/template/${t.slug}/index?kit=${t.kit}`} style={{ width: 1280, height: 800, transform: 'scale(0.3125)', transformOrigin: '0 0' }} title={t.name} /></div>
              <div className="p-3"><div className="font-medium">{t.name}</div><div className="muted text-xs">{t.vertical} · kit {t.kit}</div></div>
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Recent projects</h2>
        {projects.length === 0 ? <p className="muted text-sm">No projects yet. Open a template and click “Use this template”.</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{projects.slice(0, 6).map(p => <Link key={p.id} href={`/editor/${p.id}`} className="panel card-link p-4"><div className="font-medium">{p.name}</div><div className="muted text-xs">kit {p.kit} · updated {p.updatedAt.slice(0, 16).replace('T', ' ')}</div></Link>)}</div>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="font-semibold">Design kits</h2>
        <div className="flex flex-wrap gap-2">{kits.map(k => <Link key={k.slug} href={`/kits/${k.slug}`} className="chip">{k.name}</Link>)}</div>
      </section>
    </div>
  );
}
