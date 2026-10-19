# WebForge

Self-hosted Wix/Webflow-style site builder and template library for AAA Graphic Co client work. Runs on Alex. Next.js app + GrapesJS visual editor + a flat-file library of design kits, components, and complete multi-page templates that all share one token contract, so any kit reskins any site.

```
library/
  kits/<slug>/          kit.json + tokens.css (+ kit.css)      design systems: Material 3, Apple HIG, Fluent 2, Carbon, shadcn, Bootstrap, … neo-brutalism, Win98, NES, …
  components/<cat>/<slug>/  meta.json + index.html + style.css (+ script.js)   150+ sections and elements
  templates/<slug>/     meta.json + site.json + pages/*.html   complete sites: handyman, remodel, restaurant, church, SaaS, …
src/app                 catalog, previews, editor, API
data/                   projects, published sites, imported kits (gitignored)
```

## Run on Alex

```bash
git clone <this repo> ~/workspace/projects/webforge && cd ~/workspace/projects/webforge
cp .env.example .env            # set WEBFORGE_PORT (claim it: ssh alex port-claim alex-server 24310 tcp webforge) and WEBFORGE_BIND
./install-on-alex.sh            # docker compose up -d --build
# or without docker:  ./install-on-alex.sh --bare   (node 22 + systemd user service)
```

Open `http://<bind>:<port>`. Dev mode: `npm install && npm run dev` → http://127.0.0.1:3100.

## Using it

1. **Templates** → pick one → switch kit/theme in the preview → **Use this template** → the editor opens with every page loaded.
2. **Editor**: drag blocks (every library component, grouped by category) from the left; style panel, layers, traits on the right; page selector, kit switcher, dark toggle, **Site fields** (bulk-replace name/phone/email/address on all pages), **Code** drawer (HTML of this page, CSS of the site, two-way with Apply), **Save** (also Ctrl+S, autosave every 45 s), **Preview**, **Export zip** (static site: html + assets/styles.css + assets/scripts.js + baked placeholder images), **Publish** (served by this app at `/sites/<slug>/`).
3. **Components** → browse 150+ pieces, preview under any kit, copy the HTML/CSS/JS.
4. **Design kits** → see tokens, sampler page, fonts. Import your own from **Settings**: Figma file (personal access token, stored outside the repo), Material Theme Builder JSON, or copy `library/kits/base` and edit.

## Adding to the library

Read `docs/LIBRARY-SPEC.md`. Then `npm run validate` must pass. Components use only `--wf-*` variables and `.wf-*` base classes; no hard-coded colors; placeholder images from `/ph/<w>/<h>/<label>.svg`.

## Integrations

| source | how |
|---|---|
| Figma | Settings → paste PAT → paste file URL → new kit in `data/kits/` with colors, text styles, component names |
| Material Design 3 | kit `material3`; or import a Material Theme Builder export as a kit |
| Canva | link-out buttons (Design in Canva) and asset drop-in; full Connect API once an app is approved (keys in Settings) |
| Google Fonts | loaded automatically from each kit's `fonts` list |
| Apple HIG, Fluent 2, Carbon, shadcn, Bootstrap, Radix, Chakra, Ant, DaisyUI, Mantine, Polaris, Primer, Atlassian | kits |
| Off the wall: neo-brutalism, Win98, WinXP, terminal, cyberpunk, Swiss, Bauhaus, Catppuccin, Nord, Dracula, Gruvbox, NES, vaporwave, newsprint, glassmorphism, Y2K | kits |

## Secrets and ports

Secrets live in `~/.drJesticles/webforge.env` (`FIGMA_TOKEN=…`), never in the repo. The app binds to `WEBFORGE_BIND` (127.0.0.1 or the Tailscale IP) on `WEBFORGE_PORT`, which must be claimed in the alex port registry first.

## Project files

`AGENTS.md` (rules; CLAUDE.md and GEMINI.md import it), `BRIEF.md`, `STATUS.md`, `DECISIONS.md`, `docs/LIBRARY-SPEC.md`, `.claude/agents/`, `.claude/skills/designGod/` (the skill that drives this app), `wrapup.sh`.
