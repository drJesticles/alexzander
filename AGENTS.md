# AGENTS.md — WebForge (projects/webforge)

Single source of truth for this project. `CLAUDE.md` and `GEMINI.md` are one-line imports of this file. Workspace-wide rules in `~/workspace/AGENTS.md` apply on top; where they conflict, the workspace file wins.

## What this is

WebForge is Jesse's self-hosted Wix/Webflow-style site builder and library for AAA Graphic Co client work (and AAA Home Specialists / Avant Movers sites). Next.js app + GrapesJS visual editor + a flat-file library of design kits, components, and complete templates. Code master is alex (`~/workspace/projects/webforge`). GitHub `drJesticles/alexzander` is the delivery channel from cloud sessions; Forgejo on alex is the canonical remote once pushed there.

## Read first, in order

1. `BRIEF.md` — Jesse's words, the goal, the done-when list.
2. `STATUS.md` — verified vs claimed, next, stalled.
3. `DECISIONS.md` — one line each; say so before reopening one.
4. `docs/LIBRARY-SPEC.md` — the contract for anything under `library/`.

## Standing rules for this repo

- Library content follows `docs/LIBRARY-SPEC.md`. `npm run validate` must pass before a commit that touches `library/`.
- Secrets (Figma token, Canva keys) live in `~/.drJesticles/webforge.env` on alex. The app reads `WEBFORGE_SECRETS_FILE` (default that path). Never commit a token; `data/` is gitignored except `.gitkeep`.
- Port: the app binds to `WEBFORGE_BIND` (default 127.0.0.1) and `WEBFORGE_PORT`. On alex the port must be claimed first: `ssh alex port-claim alex-server <port> tcp webforge`. Reserved range for alex is 24000-24999; `24310` is the suggested claim, not a claimed one, until the registry says so.
- Delete with `trash`, never `rm`. Local commits are fine; pushes to GitHub only when Jesse asks.
- Markdown for docs. No `.txt`/`.pdf` twins.
- Subagents in `.claude/agents/`: `researcher`, `runner`, `reviewer`, `netops-prober`.

## Commands

```bash
npm run dev          # http://127.0.0.1:3100 (dev port; production uses WEBFORGE_PORT)
npm run build && npm start
npm run validate     # library structure + token-only check
npm run index        # rebuild library/index.json
docker compose up -d # production on alex (see docker-compose.yml, bind + port from .env)
./wrapup.sh "one line"   # end of session: STATUS.md entry + local commit
```
