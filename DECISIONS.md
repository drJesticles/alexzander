# DECISIONS — WebForge (one line each; say so before reopening one)

- 2026-10-19 · Stack: Next.js 16 App Router + GrapesJS 0.23 editor + flat-file library (no database). Reason: zero-ops on Alex, files are git-diffable, GrapesJS is the closest open-source Webflow canvas.
- 2026-10-19 · Library format is framework-agnostic HTML/CSS/JS on a `--wf-*` token contract, so every kit reskins every component. See docs/LIBRARY-SPEC.md.
- 2026-10-19 · Delivery: cloud session pushes to GitHub `drJesticles/alexzander`; Alex pulls into `~/workspace/projects/webforge` and pushes to Forgejo. Cloud sessions cannot create repos (verified: HTTP 403 on repo create).
- 2026-10-19 · Secrets live in `~/.drJesticles/webforge.env`, never in `data/` or the repo.
- 2026-10-19 · Canva: link-out + asset drop-in only until a Connect API app is approved. Figma: REST import with a personal access token.
- 2026-10-19 · Slugs are kebab-case (web convention) even though workspace prefers camelCase for file names; both are Windows-safe.
- 2026-10-19 · Port: app defaults to 3100 in dev; production port comes from `.env` and must be claimed on alex first (24310 suggested).
