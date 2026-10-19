'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import grapesjs, { type Editor as GEditor, type Page } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import presetWebpage from 'grapesjs-preset-webpage';
import blocksBasic from 'grapesjs-blocks-basic';
import pluginForms from 'grapesjs-plugin-forms';
import customCode from 'grapesjs-custom-code';
import CodeMirror from '@uiw/react-codemirror';
import { html as cmHtml } from '@codemirror/lang-html';
import { css as cmCss } from '@codemirror/lang-css';
import './editor.css';

type Project = { id: string; name: string; slug: string; kit: string; theme: 'light' | 'dark'; bodyClass: string; site: { business?: Record<string, string>; social?: Record<string, string> }; pages: { id: string; name: string; path: string; html: string; css: string }[]; gjs: unknown | null; publishedAt?: string | null };
type Comp = { slug: string; name: string; category: string; html: string; css: string; js: string; previewHeight: number };
type KitMeta = { slug: string; name: string; family: string; dark?: boolean };

const CAT_ICON: Record<string, string> = { nav: 'M3 6h18M3 12h18M3 18h18', hero: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4', features: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', services: 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5', cta: 'M5 12h14M13 6l6 6-6 6', footer: 'M3 15h18v6H3zM3 3h18v9H3z', pricing: 'M12 2v20M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', testimonials: 'M4 4h16v12H8l-4 4z', team: 'M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21a8 8 0 0116 0', faq: 'M9 9a3 3 0 115 2c-1 1-2 1.5-2 3M12 17h0', stats: 'M4 20V10M10 20V4M16 20v-7M22 20H2', forms: 'M4 6h16M4 12h16M4 18h10', gallery: 'M4 4h16v16H4zM4 16l4-4 4 4 4-5 4 5', elements: 'M4 4h16v16H4zM9 4v16', commerce: 'M3 3h2l2 12h12l2-8H6M9 20h.01M17 20h.01', utility: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2 1-1 3-2-.5-1 1 .5 2-3 1-1-2h-2l-1 2-3-1 .5-2-1-1-2 .5-1-3 2-1v-2l-2-1 1-3 2 .5 1-1-.5-2 3-1 1 2h2l1-2 3 1-.5 2 1 1 2-.5 1 3-2 1z' };
const icon = (cat: string) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${CAT_ICON[cat] || 'M4 4h16v16H4z'}"/></svg>`;

const stripBody = (html: string) => html.replace(/^\s*<body[^>]*>/i, '').replace(/<\/body>\s*$/i, '').trim();

export default function WebForgeEditor({ id }: { id: string }) {
  const host = useRef<HTMLDivElement>(null);
  const ed = useRef<GEditor | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [kits, setKits] = useState<KitMeta[]>([]);
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);
  const [curPage, setCurPage] = useState<string>('');
  const [status, setStatus] = useState('');
  const [dirty, setDirty] = useState(false);
  const [drawer, setDrawer] = useState<null | 'code'>(null);
  const [codeHtml, setCodeHtml] = useState(''); const [codeCss, setCodeCss] = useState(''); const [codeTab, setCodeTab] = useState<'html' | 'css'>('html');
  const [siteModal, setSiteModal] = useState(false);
  const [siteDraft, setSiteDraft] = useState<Record<string, string>>({});
  const [kitSlug, setKitSlug] = useState('base'); const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState('');

  // ---------- load ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, k, comps] = await Promise.all([
        fetch(`/api/projects/${id}`).then(r => r.ok ? r.json() : null) as Promise<Project | null>,
        fetch('/api/library/kits').then(r => r.json()) as Promise<KitMeta[]>,
        fetch('/api/library/components?full=1').then(r => r.json()) as Promise<Comp[]>,
      ]);
      if (cancelled) return;
      if (!p) { setError('Project not found'); return; }
      setProject(p); setKits(k); setKitSlug(p.kit); setTheme(p.theme);
      setSiteDraft({ ...Object.fromEntries(Object.entries(p.site.business || {}).map(([a, b]) => [`business.${a}`, b])), ...Object.fromEntries(Object.entries(p.site.social || {}).map(([a, b]) => [`social.${a}`, b])) });
      if (!host.current) return;
      const editor = grapesjs.init({
        container: host.current,
        height: '100%',
        width: 'auto',
        fromElement: false,
        storageManager: false,
        keepUnusedStyles: true,
        showOffsets: true,
        plugins: [presetWebpage, blocksBasic, pluginForms, customCode],
        pluginsOpts: {
          [presetWebpage as unknown as string]: { blocks: ['link-block', 'quote', 'text-basic'], modalImportTitle: 'Import HTML', modalImportLabel: 'Paste HTML (with optional &lt;style&gt;) to add to the current page', modalImportContent: (e: GEditor) => e.getHtml() + '<style>' + e.getCss() + '</style>' },
          [blocksBasic as unknown as string]: { flexGrid: true, category: 'Basic' },
        },
        canvas: { styles: [`/api/css/kit/${p.kit}`], scripts: ['/api/library/scripts'] },
        pageManager: { pages: p.gjs ? undefined : p.pages.map(pg => ({ id: pg.id, name: pg.name, component: pg.html, styles: pg.css })) },
        deviceManager: { devices: [{ id: 'desktop', name: 'Desktop', width: '' }, { id: 'tablet', name: 'Tablet', width: '820px', widthMedia: '900px' }, { id: 'mobile', name: 'Mobile', width: '390px', widthMedia: '600px' }] },
        assetManager: { upload: false, assets: [...Array.from({ length: 6 }, (_, i) => `/ph/1200/800/photo-${i + 1}.svg`), '/ph/800/800/square.svg', '/ph/1600/600/banner.svg'] },
      });
      ed.current = editor;
      if (p.gjs) editor.loadProjectData(p.gjs as Record<string, unknown>);

      // blocks from the library
      const bm = editor.BlockManager;
      for (const c of comps) bm.add(`wf-${c.slug}`, { label: c.name.replace(/^[^:]+:\s*/, ''), category: { id: c.category, label: c.category, open: c.category === 'hero' }, media: icon(c.category), content: `${c.css ? `<style>${c.css}</style>` : ''}${c.html}`, select: true, activate: true });

      // body class + theme on each frame
      const applyFrame = () => {
        try {
          const doc = editor.Canvas.getDocument(); if (!doc) return;
          doc.documentElement.setAttribute('data-theme', (editor as unknown as { __wfTheme?: string }).__wfTheme || p.theme);
          const link = doc.querySelector('link[href^="/api/css/kit/"]') as HTMLLinkElement | null;
          const want = `/api/css/kit/${(editor as unknown as { __wfKit?: string }).__wfKit || p.kit}`;
          if (link && !link.getAttribute('href')?.startsWith(want)) link.setAttribute('href', want);
          if (p.bodyClass) editor.getWrapper()?.addClass(p.bodyClass);
        } catch {}
      };
      (editor as unknown as { __wfKit?: string }).__wfKit = p.kit; (editor as unknown as { __wfTheme?: string }).__wfTheme = p.theme;
      editor.on('canvas:frame:load', applyFrame);
      editor.on('page:select', () => { setCurPage(editor.Pages.getSelected()?.getId() || ''); setTimeout(applyFrame, 50); });
      editor.on('page', () => setPages(editor.Pages.getAll().map(x => ({ id: x.getId(), name: x.getName() || x.getId() }))));
      editor.on('update', () => setDirty(true));
      editor.Panels.addButton('options', { id: 'wf-code', className: 'fa fa-code', command: () => openCode(), attributes: { title: 'Edit HTML / CSS' } });
      setPages(editor.Pages.getAll().map(x => ({ id: x.getId(), name: x.getName() || x.getId() })));
      setCurPage(editor.Pages.getSelected()?.getId() || '');
      setStatus('Loaded');
    })();
    return () => { cancelled = true; ed.current?.destroy(); ed.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------- helpers ----------
  const collect = useCallback(() => {
    const editor = ed.current!; const css = editor.getCss() || '';
    const pagesOut = editor.Pages.getAll().map((pg: Page) => {
      const comp = pg.getMainComponent();
      const html = stripBody(comp ? comp.toHTML() : '');
      const meta = project?.pages.find(x => x.id === pg.getId());
      return { id: pg.getId(), name: pg.getName() || pg.getId(), path: meta?.path || (pg.getId() === 'index' ? '/' : `/${pg.getId()}`), html, css };
    });
    return { gjs: editor.getProjectData(), pages: pagesOut };
  }, [project]);

  const save = useCallback(async (silent = false) => {
    if (!ed.current || !project) return;
    const body = { ...collect(), kit: kitSlug, theme, site: siteFromDraft(siteDraft) };
    const r = await fetch(`/api/projects/${project.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) { setDirty(false); if (!silent) setStatus(`Saved ${new Date().toLocaleTimeString()}`); const p = await r.json(); setProject(p); }
    else setStatus('Save failed');
  }, [collect, project, kitSlug, theme, siteDraft]);

  useEffect(() => { const t = setInterval(() => { if (dirty) save(true); }, 45000); return () => clearInterval(t); }, [dirty, save]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [save]);

  function siteFromDraft(d: Record<string, string>) {
    const out: { business: Record<string, string>; social: Record<string, string> } = { business: {}, social: {} };
    for (const [k, v] of Object.entries(d)) { const [g, key] = k.split('.'); if (g === 'business' || g === 'social') out[g][key] = v; }
    return out;
  }
  function openCode() {
    const editor = ed.current!; setCodeHtml(stripBody(editor.getHtml())); setCodeCss(editor.getCss() || ''); setDrawer('code');
  }
  function applyCode() {
    const editor = ed.current!;
    if (codeTab === 'html' || true) editor.setComponents(codeHtml);
    editor.setStyle(codeCss);
    setDirty(true); setStatus('Code applied to canvas');
  }
  function changeKit(slug: string) {
    setKitSlug(slug); const editor = ed.current!; (editor as unknown as { __wfKit?: string }).__wfKit = slug;
    const cfg = editor.Canvas.getConfig(); cfg.styles = [`/api/css/kit/${slug}`];
    const doc = editor.Canvas.getDocument(); const link = doc?.querySelector('link[href^="/api/css/kit/"]'); if (link) link.setAttribute('href', `/api/css/kit/${slug}?t=${Date.now()}`);
    setDirty(true);
  }
  function changeTheme(t: 'light' | 'dark') {
    setTheme(t); const editor = ed.current!; (editor as unknown as { __wfTheme?: string }).__wfTheme = t;
    editor.Canvas.getDocument()?.documentElement.setAttribute('data-theme', t); setDirty(true);
  }
  function addPage() {
    const name = prompt('Page name', 'New page'); if (!name) return;
    const pid = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `page-${Date.now()}`;
    const editor = ed.current!;
    const nav = editor.Pages.get('index')?.getMainComponent()?.components().at(0);
    const footer = editor.Pages.get('index')?.getMainComponent()?.components().last();
    const content = `${nav ? nav.toHTML() : ''}<section class="wf-section" data-wf-component="blank"><div class="wf-container"><h1>${name}</h1><p class="wf-lead">Drag blocks here.</p></div></section>${footer && footer !== nav ? footer.toHTML() : ''}`;
    const pg = editor.Pages.add({ id: pid, name, component: content }); if (pg) editor.Pages.select(pg);
    setProject(p => p ? { ...p, pages: [...p.pages, { id: pid, name, path: `/${pid}`, html: '', css: '' }] } : p);
    setDirty(true);
  }
  function removePage() {
    const editor = ed.current!; const pg = editor.Pages.getSelected(); if (!pg || pg.getId() === 'index') { alert('The index page cannot be removed.'); return; }
    if (!confirm(`Remove page “${pg.getName()}”?`)) return; editor.Pages.remove(pg); editor.Pages.select('index'); setDirty(true);
  }
  function renamePage() {
    const editor = ed.current!; const pg = editor.Pages.getSelected(); if (!pg) return; const name = prompt('Page name', pg.getName()); if (name) { pg.setName(name); setPages(editor.Pages.getAll().map(x => ({ id: x.getId(), name: x.getName() || x.getId() }))); setDirty(true); }
  }
  function applySite() {
    const editor = ed.current!;
    for (const pg of editor.Pages.getAll()) {
      const root = pg.getMainComponent(); if (!root) continue;
      for (const [key, val] of Object.entries(siteDraft)) {
        if (!val) continue;
        for (const comp of root.find(`[data-wf-field="${key}"]`)) {
          comp.components(val);
          if (key === 'business.phone' && comp.getAttributes().href?.startsWith('tel:')) comp.addAttributes({ href: `tel:${val.replace(/[^+\d]/g, '')}` });
          if (key === 'business.email' && comp.getAttributes().href?.startsWith('mailto:')) comp.addAttributes({ href: `mailto:${val}` });
        }
      }
    }
    setSiteModal(false); setDirty(true); setStatus('Site fields applied to every page');
  }
  async function exportZip() { await save(true); window.location.href = `/api/projects/${project!.id}/export`; }
  async function publish() {
    await save(true); const r = await fetch(`/api/projects/${project!.id}/publish`, { method: 'POST' }); const j = await r.json();
    if (r.ok) { setStatus(`Published → ${j.url}`); window.open(j.url, '_blank'); } else setStatus(`Publish failed: ${j.error}`);
  }
  async function preview() { await save(true); window.open(`/preview/project/${project!.id}/${curPage || 'index'}`, '_blank'); }

  const kit = kits.find(k => k.slug === kitSlug);
  if (error) return <div className="p-8">{error}. <a className="underline" href="/projects">Back to projects</a></div>;
  return (
    <div className="wf-editor">
      <div className="wf-editor__top">
        <a href="/projects" className="font-semibold">← WebForge</a>
        <span className="muted truncate max-w-48">{project?.name || '…'}</span>
        <span className="mx-1 opacity-30">|</span>
        <select className="select !w-auto !py-1" value={curPage} onChange={e => ed.current?.Pages.select(e.target.value)}>{pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <button className="btn btn-sm" onClick={addPage} title="Add page">+ page</button>
        <button className="btn btn-sm" onClick={renamePage} title="Rename page">rename</button>
        <button className="btn btn-sm" onClick={removePage} title="Remove page">×</button>
        <span className="mx-1 opacity-30">|</span>
        <select className="select !w-auto !py-1" value={kitSlug} onChange={e => changeKit(e.target.value)}>{kits.map(k => <option key={k.slug} value={k.slug}>{k.name}</option>)}</select>
        <button className={`btn btn-sm ${theme === 'dark' ? 'btn-blue' : ''}`} disabled={!kit?.dark} onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}>{theme}</button>
        <button className="btn btn-sm" onClick={() => setSiteModal(true)}>Site fields</button>
        <button className="btn btn-sm" onClick={openCode}>&lt;/&gt; Code</button>
        <span className="ml-auto muted">{status}{dirty ? ' · unsaved' : ''}</span>
        <button className="btn btn-sm" onClick={preview}>Preview</button>
        <button className="btn btn-sm" onClick={exportZip}>Export zip</button>
        <button className="btn btn-sm" onClick={publish}>Publish</button>
        <button className="btn btn-sm btn-accent" onClick={() => save()}>Save</button>
      </div>
      <div className="wf-editor__body">
        <div ref={host} className="wf-editor__gjs" />
        {drawer === 'code' && (
          <div className="wf-editor__drawer">
            <div className="wf-editor__drawer-head">
              <button className={`chip ${codeTab === 'html' ? 'chip-active' : ''}`} onClick={() => setCodeTab('html')}>HTML (this page)</button>
              <button className={`chip ${codeTab === 'css' ? 'chip-active' : ''}`} onClick={() => setCodeTab('css')}>CSS (whole site)</button>
              <span className="muted ml-2">Edit, then Apply. Kit tokens are not shown here; they come from the kit.</span>
              <button className="btn btn-sm ml-auto" onClick={openCode} title="Reload from canvas">↻ Pull</button>
              <button className="btn btn-sm btn-blue" onClick={applyCode}>Apply to canvas</button>
              <button className="btn btn-sm" onClick={() => setDrawer(null)}>Close</button>
            </div>
            <div className="wf-editor__drawer-body">
              {codeTab === 'html' ? <CodeMirror value={codeHtml} height="100%" theme="dark" extensions={[cmHtml()]} onChange={v => setCodeHtml(v)} basicSetup={{ lineNumbers: true, foldGutter: true }} /> : <CodeMirror value={codeCss} height="100%" theme="dark" extensions={[cmCss()]} onChange={v => setCodeCss(v)} basicSetup={{ lineNumbers: true, foldGutter: true }} />}
            </div>
          </div>
        )}
      </div>
      {siteModal && (
        <div className="wf-editor__modal" onClick={() => setSiteModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold mb-1">Site fields</h2>
            <p className="muted text-xs mb-3">These replace every element tagged with <code className="code">data-wf-field</code> on every page: business name, phone, email, address, city, hours, year, tagline, socials.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {['business.name', 'business.tagline', 'business.phone', 'business.email', 'business.address', 'business.city', 'business.hours', 'business.year', 'social.facebook', 'social.instagram', 'social.google'].map(k => (
                <label key={k} className="text-xs"><span className="block muted mb-1">{k}</span><input className="input" value={siteDraft[k] || ''} onChange={e => setSiteDraft(d => ({ ...d, [k]: e.target.value }))} /></label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4"><button className="btn btn-sm" onClick={() => setSiteModal(false)}>Cancel</button><button className="btn btn-sm btn-accent" onClick={applySite}>Apply to all pages</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
