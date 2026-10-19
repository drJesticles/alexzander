# BRIEF — WebForge

## Jesse's words (verbatim, 2026-10-19)

> I want a web development template library so extensive that its practically a wix or webflow clone, I want a plethora of complete builds, component , wysywig when necessary but easy to edit code directly and it would be nice if it is a cohesive web app also but I foresure want the library built and placed on alex, my localserver. I would like it to have figma, canva and intergrations with like material.io design and such for all common and popular design kits and a few off the wall ones.

Answers to the four setup questions (2026-10-19): deliver via GitHub repo pulled on Alex; Next.js + GrapesJS editor; all four design-kit groups (big four, web-dev favorites, off the wall, business-first); Figma API import + Canva link-out.

## Goal (one sentence)

A self-hosted web app on Alex where Jesse can open a complete site template or drag library components onto a page, restyle it with any design kit, edit the HTML/CSS directly, and export or publish a static site.

## Done when

- [ ] `docker compose up` on Alex serves the app on a claimed port.
- [ ] Catalog browses kits, components, and templates with live previews and kit switching.
- [ ] 20+ kits across the four families, each reskinning the whole library.
- [ ] 150+ components across the spec's categories, all passing `npm run validate`.
- [ ] 30+ complete multi-page templates, including HS / GC / AM brand demos.
- [ ] Editor: drag blocks, style panel, page manager, code panel with two-way HTML/CSS editing, save, export zip, publish to `/sites/<slug>/`.
- [ ] Settings: Figma token (stored outside the repo) imports colors, type, and component names from a file into a new kit. Canva open-in links on image slots. Material Theme Builder JSON import.
- [ ] `STATUS.md` has a verified entry for each of the above with the command or URL that proved it.
