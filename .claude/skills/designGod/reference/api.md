# WebForge API (all JSON unless noted; no auth, it is on the tailnet)

| method | path | what |
|---|---|---|
| GET | /api/library/kits | kit metas (library + data/kits) |
| GET | /api/library/kits/:slug | kit meta + tokensCss + kitCss |
| GET | /api/css/kit/:slug | text/css: contract tokens + base + kit tokens + kit css (what the editor canvas and previews load) |
| GET | /api/library/components | component metas; `?full=1` adds html/css/js (editor blocks) |
| GET | /api/library/components/:slug | one component with html/css/js |
| GET | /api/library/scripts | JS: all component scripts concatenated; `?slugs=a,b` to limit |
| GET | /api/library/templates | template metas (hidden `_*` excluded) |
| GET | /api/library/templates/:slug | template with site.json and page html |
| GET | /api/projects | project list (no pages) |
| POST | /api/projects | `{name, templateSlug?, kit?, site?}` → project (pages pre-rendered from template with fields applied) |
| GET/PUT/DELETE | /api/projects/:id | read / partial update (`name,kit,theme,bodyClass,site,pages,gjs`) / delete |
| GET | /api/projects/:id/export | application/zip static site |
| POST | /api/projects/:id/publish | writes data/sites/<slug>/ → `{url:"/sites/<slug>/"}` |
| GET | /api/figma/status | `{figma, canva, unsplash, secretsFile}` booleans |
| POST | /api/figma/import | `{file: url|key, slug?, name?}` → new kit in data/kits |
| POST | /api/kits/import-material | Material Theme Builder JSON (`{theme}` or raw) → new kit |
| GET/POST | /api/settings | list secret keys / `{key, value}` write to the secrets file (FIGMA_TOKEN, CANVA_CLIENT_ID, CANVA_CLIENT_SECRET, UNSPLASH_KEY) |
| GET | /ph/:w/:h/:label.svg | placeholder image |
| GET | /preview/component/:slug?kit=&theme= | full HTML document |
| GET | /preview/template/:slug/:page?kit=&theme= | full HTML, links rewritten to other preview pages |
| GET | /preview/project/:id/:pageId | full HTML of a saved project page |
| GET | /preview/kit/:slug?theme= | sampler: one component per major category under this kit |
| GET | /sites/:slug/[path] | published static site |

Project JSON shape: `{id, name, slug, templateSlug, kit, theme, bodyClass, site:{business,social}, pages:[{id,name,path,html,css}], gjs, createdAt, updatedAt, publishedAt}`. `gjs` is GrapesJS project data (source of truth once edited in the editor); `pages[].html/css` are re-rendered on every save and are what export/publish/preview use.
