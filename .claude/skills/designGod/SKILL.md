---
name: designGod
description: "/designGod — runs WebForge (Jesse's self-hosted Wix/Webflow-style builder on alex) from the ground up: finds the app, browses or builds kits/components/templates to spec, creates and edits projects through the API or the GrapesJS editor, swaps design kits, applies site fields, exports or publishes static sites, imports Figma/Material themes, and troubleshoots the install. Trigger on /designGod, or whenever Jesse mentions WebForge, site templates, design kits, the site builder, 'make me a site for <client>', or building/editing a client website."
---

# /designGod — WebForge operator

You know WebForge from the ground up. Say in one line which surface you are on and whether you can reach the repo (alex: `~/workspace/projects/webforge`; cloud/Dell: GitHub `drJesticles/alexzander`). No filesystem = read-only advice; say so.

## 1. Orient (30 seconds)

```bash
cd ~/workspace/projects/webforge 2>/dev/null || cd /home/user/alexzander
cat BRIEF.md STATUS.md DECISIONS.md | head -80      # goal, what is verified, what not to reopen
npm run test                                         # validator + rebuilds library/index.json (counts)
curl -s http://127.0.0.1:${WEBFORGE_PORT:-3100}/api/figma/status   # is the app up; which secrets are set
```
The app: Next.js 16 App Router + GrapesJS 0.23. Library is flat files under `library/`. Runtime data under `data/` (gitignored). Rules in `AGENTS.md` and `docs/LIBRARY-SPEC.md` (read the spec before touching `library/`).

## 2. What is in the library (2026-10-19)

34 kits (brand: aaa-brand, aaa-hs-bold, aaa-gc-studio · big-four: material3, apple-hig, fluent2, carbon · web-dev: tailwind-shadcn, bootstrap5, radix, chakra, ant-design, daisyui, mantine, polaris, primer, atlassian, base · off-the-wall: neo-brutalism, win98, winxp, terminal-green, cyberpunk, swiss-international, bauhaus, catppuccin-mocha, nord, dracula, gruvbox, nes, vaporwave, paper-newsprint, glassmorphism, y2k-chrome). 153 components in 23 categories (full slug list: `docs/COMPONENT-SLUGS.md`). 44 templates: trades (handyman-pro, remodel-studio, roofing-pro, plumbing-24-7, electrical-services, hvac-comfort, landscaping-lawn, house-cleaning, painting-drywall, avant-movers), local (restaurant-bistro, coffee-shop, hair-salon, fitness-gym, dental-clinic, auto-repair, law-firm, real-estate-agent, church-community, nonprofit-cause), creative/tech/commerce (creative-agency, design-portfolio, photographer, saas-landing, mobile-app-landing, startup-one-pager, ecommerce-storefront, product-launch-single, docs-knowledge-base, blog-magazine), brand (aaa-home-specialists, aaa-graphic-co, avant-movers-landing), personal/utility (personal-resume, link-in-bio, wedding-event, conference-event, coming-soon, maintenance-page, error-pages, pricing-page, thank-you-pages, newsletter-landing). `library/index.json` is the machine-readable catalog (`npm run index` refreshes it).

## 3. The one idea that makes everything work

Every kit, component, and template speaks one token contract: `--wf-*` CSS variables (`library/kits/_contract/tokens.css`) and `.wf-*` base classes (`base.css`). A kit = `tokens.css` overrides (+ optional `kit.css` restyle). Components and templates never hard-code colors or fonts. So: any kit reskins any site; swap the kit, nothing else changes. Keep that invariant or the validator fails.

## 4. Do things

### Make a client site (the common job)
1. Pick a template: `GET /api/library/templates` or `/templates` in the UI. Verticals: trades, local, creative, tech, commerce, community, personal, utility, brand.
2. Create the project with the client's facts so every page is pre-filled:
   ```bash
   curl -s -X POST localhost:3100/api/projects -H 'content-type: application/json' -d '{
     "name":"Doxsee Foster","templateSlug":"handyman-pro","kit":"aaa-brand",
     "site":{"business":{"name":"Doxsee Foster LLC","phone":"(479) 555-0123","email":"hi@example.com","address":"Russellville, AR 72801","city":"Russellville, AR","hours":"Mon-Fri 8-5","year":"2026","tagline":"…"}}}'
   ```
   Returns the project JSON with `id`. Open `/editor/<id>`.
3. Edit: drag blocks (left), style/layers/traits (right), **Code** drawer for direct HTML (page) and CSS (site) with **Apply**, **Site fields** to bulk-replace, kit dropdown + light/dark toggle, page selector (+ page, rename, ×). Save = button, Ctrl+S, or autosave 45 s.
4. Ship: **Export zip** (`GET /api/projects/<id>/export`, static html + `assets/`) for any host, or **Publish** (`POST /api/projects/<id>/publish`) to serve at `/sites/<slug>/` from alex.
5. Headless edits without the UI: `PUT /api/projects/<id>` with `{kit, theme, site, pages:[{id,name,path,html,css}]}`. Pages are body fragments made of sections carrying `data-wf-component`. Component CSS for library sections is resolved automatically at export only if it is already in `pages[].css`; use `cssForHtml()` semantics: template css + each used component's style.css.

### Add a kit (5 minutes)
Copy `library/kits/base` → `library/kits/<slug>`, edit `kit.json` (family: brand | big-four | web-dev | off-the-wall; fonts = Google Fonts list; swatch = 4 hex), override tokens in `tokens.css` (`:root{}` + `[data-theme="dark"]{}` if dark:true), optional `kit.css` for base-class restyle. `npm run validate`. Preview at `/preview/kit/<slug>`.
Imports: Figma → Settings (PAT stored in `~/.drJesticles/webforge.env`) → file URL → `data/kits/<slug>`; Material Theme Builder JSON → Settings; both via `POST /api/figma/import` and `POST /api/kits/import-material`.

### Add a component
Folder `library/components/<category>/<slug>/` with `meta.json`, `index.html` (ONE root: `class="wf-section c-<slug>" data-wf-component="<slug>"`), `style.css` (every selector contains `.c-<slug>`), optional `script.js` (IIFE, idempotent, queries inside `[data-wf-component="<slug>"]`). Images `/ph/<w>/<h>/<label>.svg`. Copy a sibling as the starting point. Categories are fixed: see `CATEGORIES` in `src/lib/library.ts`. Validate. It appears in the editor's block panel on the next load.

### Add a template
Folder `library/templates/<slug>/`: `meta.json` (vertical, default kit, pages[]), `site.json` (defaults), `pages/*.html` (nav … sections … footer, same nav/footer on every page, internal links = page paths), optional `template.css` scoped to `.t-<slug>`. Compose pages by concatenating library component `index.html` files and editing copy. Validate. Preview `/preview/template/<slug>/index?kit=<kit>`.

## 5. Where everything is

| thing | path |
|---|---|
| library loader, types, categories | `src/lib/library.ts` |
| document builder, kit stylesheet, field substitution | `src/lib/render.ts` |
| project store (`data/projects/*.json`) | `src/lib/projects.ts` |
| static export, publish, placeholder SVG | `src/lib/export.ts` |
| secrets (never in repo) | `src/lib/secrets.ts` → `~/.drJesticles/webforge.env` |
| Figma / Material importers | `src/lib/figma.ts`, `src/lib/material.ts`, `src/lib/kits-user.ts` |
| editor | `src/editor/WebForgeEditor.tsx` (GrapesJS init, blocks from `/api/library/components?full=1`, kit link swap, code drawer, site fields, save/export/publish) |
| previews (HTML documents for iframes) | `src/app/preview/{component,template,project,kit}/…/route.ts` |
| published sites | `src/app/sites/[slug]/[[...path]]/route.ts` ← `data/sites/<slug>/` |
| validator / index / editor smoke test | `scripts/validate-library.mjs`, `scripts/build-index.mjs`, `scripts/smoke-editor.mjs` |

Full API table: `reference/api.md`. Editor internals and gotchas: `reference/editor.md`. Ops on alex: `reference/ops.md`.

## 6. Rules you keep

- Validator green before any commit touching `library/`. No hex colors in components. No external images.
- Secrets never in `data/`, `library/`, or git. Say where a token lives, never the token.
- Port on alex must be claimed (`port-claim`) before `docker compose up`; bind 127.0.0.1 or the Tailscale IP, never 0.0.0.0.
- Delete with `trash`, not `rm`. Markdown outputs, no .txt/.pdf twins. Report absolute paths of anything you write.
- Anything that goes to a customer (a published URL, an export sent out) is drafted; Jesse sends it.
- Answers fact-forward and short; YES/NO + confidence % on Jesse's ideas; one verdict.
