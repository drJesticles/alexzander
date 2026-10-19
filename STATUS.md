# STATUS — WebForge

Format: `YYYY-MM-DD · verified|claimed · what · proof`

## Done (verified by real output)

- 2026-10-19 · verified · `npx next build` passes, 33 routes · cloud session, build log in chat
- 2026-10-19 · verified · all catalog pages and APIs return 200 on `next start -p 3100` · curl loop over /, /templates, /components, /kits, /projects, /settings, /api/library/*, /preview/*, /ph/*
- 2026-10-19 · verified · POST /api/projects from `_example` template substitutes site fields; GET export returns a zip with index.html, contact.html, assets/styles.css, assets/scripts.js, baked placeholder SVGs; POST publish serves /sites/smoke-test/ · curl + python zipfile listing
- 2026-10-19 · verified · GrapesJS editor boots in headless Chromium with 102 library blocks, 3 sections in canvas, kit stylesheet linked, code drawer shows page HTML · `node scripts/smoke-editor.mjs` → artifacts/editor-smoke.png
- 2026-10-19 · verified · `node scripts/validate-library.mjs` → kits: 34  components: 153  templates: 44, OK: 0 errors, 0 warnings
- 2026-10-19 · verified · visual QA: every kit screenshotted light+dark (129 shots), contrast fixed per kit; every component screenshotted at 1280 and 390 (0 mobile overflow, 0 broken images, 0 script errors); every template index screenshotted by its builder
- 2026-10-19 · verified · draft PR open: https://github.com/drJesticles/alexzander/pull/1 (branch webforge)

## Done (claimed, not yet verified on alex)

- 2026-10-19 · claimed · Figma import (src/lib/figma.ts): styles → colors/type/components → kit in data/kits. Code path exercised only for the "no token" error; not run against a real Figma file.
- 2026-10-19 · claimed · Material Theme Builder import (src/lib/material.ts); parsed a hand-made schemes JSON only.
- 2026-10-19 · claimed · Canva link-out: image toolbar "Canva" button opens canva.com custom-dimensions and explains the upload round-trip; asset upload route /api/assets tested only by code review.
- 2026-10-19 · claimed · Dockerfile / docker-compose / install-on-alex.sh written; not built or run on alex (no docker build in the cloud session).
- 2026-10-19 · claimed · /designGod skill at .claude/skills/designGod (+ artifacts/designGod.skill zip); paths and routes checked against the code, not yet used by a fresh session.

## Next

- On alex: clone, `cp .env.example .env`, claim the port (`ssh alex port-claim alex-server 24310 tcp webforge`), `./install-on-alex.sh`, open the dashboard, create a project from a template, export, publish. Record as verified here.
- Paste a Figma PAT in Settings and import one real file; fix the color-mapping heuristic if primary/secondary land wrong.
- Replace the placeholder brand colors in library/kits/aaa-brand with the real values from business/GC/graphicCo/aaaBrandDNA.md (on aaalpha).
- Push the repo to Forgejo (jesse/webforge) and set GitHub as the mirror, per the 2026-10-18 Forgejo plan.
- Nice-to-have: component scripts re-run inside the editor canvas after a block drop; Canva Connect API once an app is approved; Unsplash search in the asset manager (key slot already exists).

## Stalled on

- Nothing blocking. Everything that needs alex itself (port claim, docker build, Forgejo push) is listed under Next.
