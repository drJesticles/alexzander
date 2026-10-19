# Editor internals (src/editor/WebForgeEditor.tsx)

- GrapesJS init: `storageManager:false` (we save ourselves), `keepUnusedStyles:true` (state selectors like `.is-open` survive export), plugins: preset-webpage (panels, import modal, code viewer), blocks-basic, plugin-forms, custom-code.
- Canvas loads `/api/css/kit/<kit>` as a stylesheet and `/api/library/scripts` as a script. Kit switch rewrites that `<link>` href and updates `Canvas.getConfig().styles` so new page frames get it too. Theme = `data-theme` on the canvas `<html>`.
- Pages: first load uses `pageManager.pages` built from `project.pages` (html + css per page). After the first save `project.gjs` exists and `loadProjectData` restores everything. Adding a page copies the index page's first (nav) and last (footer) components.
- Blocks: one per library component, `content = <style>css</style> + html`; GrapesJS parses the style tag into CSS rules. Category = component category.
- Save: per page `page.getMainComponent().toHTML()` (body tag stripped) and the global `editor.getCss()` (CSS is site-wide in GrapesJS, so every page gets the same css string; export dedupes).
- Code drawer: HTML is per page (`setComponents`), CSS is the whole site (`setStyle`). Pull refreshes from canvas; Apply pushes. Kit CSS is not shown there on purpose.
- Site fields: finds `[data-wf-field="key"]` components in every page, sets text, fixes `tel:`/`mailto:` hrefs.
- Known limits: component scripts run once at frame load, so interactive bits (menus, sliders) only animate in Preview, not inside the canvas. GrapesJS may add ids to elements; harmless. Template-scoped CSS (`.t-<slug>`) relies on the body class, which the editor adds to the wrapper on frame load.
- Smoke test: `node scripts/smoke-editor.mjs http://127.0.0.1:3100 <projectId>` → counts blocks, canvas sections, kit link, code drawer; screenshot in artifacts/.
