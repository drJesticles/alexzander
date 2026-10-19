# WebForge Library Spec (the contract every kit, component, and template follows)

Read this whole file before adding anything to `library/`. The validator (`npm run validate`) enforces the structural rules.

## 1. Three kinds of things

| kind | path | what it is |
|---|---|---|
| kit | `library/kits/<slug>/` | a design system expressed as token overrides + base restyle. Swapping the kit reskins every component and template. |
| component | `library/components/<category>/<slug>/` | one section or element: self-contained HTML + scoped CSS (+ optional JS). Becomes a drag-in block in the editor. |
| template | `library/templates/<slug>/` | a complete multi-page site built from sections. Becomes a new project in one click. |

## 2. The token contract

`library/kits/_contract/tokens.css` defines every `--wf-*` variable with a neutral default. `library/kits/_contract/base.css` defines the base classes (`.wf-container`, `.wf-section`, `.wf-grid--3`, `.wf-btn--primary`, `.wf-card`, `.wf-input`, `.wf-badge`, `.wf-eyebrow`, `.wf-lead`, etc.). Open both files; they are short.

Rules:
- Components and templates use ONLY `--wf-*` variables and `.wf-*` base classes for color, type, spacing, radius, shadow. No hard-coded hex colors, no font-family literals, no px radii. Exception: pure black/white overlays on images may use rgba.
- A kit may add NEW variables with its own prefix (`--m3-*`, `--carbon-*`) but must set every `--wf-*` it changes on `:root`.
- Dark mode: a kit that supports dark provides `[data-theme="dark"]{...}` overrides in `tokens.css` and sets `"dark": true` in `kit.json`.

## 3. Kit layout

```
library/kits/<slug>/
  kit.json
  tokens.css     # :root { --wf-* overrides } [+ [data-theme="dark"] block]
  kit.css        # optional: restyle base classes (.wf-btn, .wf-card, h1...) to match the system's feel
  README.md      # optional: source links, what was approximated
```

`kit.json`:
```json
{
  "slug": "material3",
  "name": "Material Design 3",
  "family": "big-four",            // big-four | web-dev | off-the-wall | brand
  "description": "Google's Material You system: tonal palettes, large radii, Roboto.",
  "source": "https://m3.material.io",
  "fonts": [{ "family": "Roboto", "weights": [400, 500, 700] }],   // Google Fonts, loaded automatically
  "dark": true,
  "swatch": ["#6750A4", "#EADDFF", "#FFFBFE", "#1D1B20"],           // 4 colors for the catalog card
  "tags": ["google", "android", "rounded"],
  "version": 1
}
```

Kit slugs: lowercase, digits, hyphens. Fonts listed in `fonts` are the only external resource allowed.

## 4. Component layout

```
library/components/<category>/<slug>/
  meta.json
  index.html     # ONE root element. Sections: <section class="wf-section c-<slug>" data-wf-component="<slug>">
  style.css      # every selector scoped under .c-<slug>
  script.js      # optional. IIFE. Idempotent. Queries inside [data-wf-component="<slug>"]. No globals. No libraries.
```

Categories (exact folder names): `nav`, `hero`, `features`, `services`, `about`, `cta`, `footer`, `pricing`, `testimonials`, `team`, `faq`, `stats`, `logos`, `process`, `forms`, `gallery`, `media`, `blog`, `contact`, `content`, `elements`, `commerce`, `utility`.

`meta.json`:
```json
{
  "slug": "hero-split-image",
  "name": "Hero: split with image",
  "category": "hero",
  "description": "Headline + lead + two buttons on the left, image on the right. Stacks on mobile.",
  "tags": ["hero", "image", "cta", "two-column"],
  "previewHeight": 620,          // px, for catalog iframe
  "hasScript": false,
  "fields": ["business.name", "business.phone"],   // data-wf-field keys used, if any
  "version": 1
}
```

Rules:
- Root element carries `class="c-<slug>"` and `data-wf-component="<slug>"`. Sections also carry `wf-section`.
- Everything inside must be editable in a visual editor: real text in real elements, no text baked into images.
- Images: use the local placeholder service `/ph/<w>/<h>/<label>.svg` (e.g. `/ph/1200/800/kitchen-remodel.svg`). Never hotlink external images.
- Icons: inline SVG, 24x24 viewBox, `stroke="currentColor"` or `fill="currentColor"`, class `wf-icon`.
- Links: `href="#"` unless it is a real anchor within the template.
- Responsive without JS. Test mentally at 360px, 768px, 1280px.
- Accessibility: alt text on images, labels on inputs, buttons are `<button>` or `<a>` with real text, one `<h2>` per section (hero may use `<h1>`).
- Copy: write for a real small business. Default voice: a home services / local business in Russellville, Arkansas. Use `data-wf-field="business.name"` etc. on elements that should be bulk-replaceable from site settings. Available keys: `business.name`, `business.tagline`, `business.phone`, `business.email`, `business.address`, `business.city`, `business.hours`, `business.year`, `social.facebook`, `social.instagram`, `social.google`.
- No `<style>` or `<script>` tags inside `index.html`. CSS goes in style.css, JS in script.js.
- Variants: prefer separate components (`pricing-three-tier`, `pricing-toggle`) over flags.

## 5. Template layout

```
library/templates/<slug>/
  meta.json
  site.json              # default field values (business.name etc.) + nav + footer links
  pages/
    index.html           # body fragment: stacked sections (no <html>/<head>/<body>)
    about.html
    services.html
    contact.html
    ...
  template.css           # optional template-wide overrides (scoped to .t-<slug>, applied on <body>)
  README.md              # optional
```

`meta.json`:
```json
{
  "slug": "handyman-pro",
  "name": "Handyman Pro",
  "vertical": "trades",            // trades | local | creative | tech | commerce | community | personal | utility | brand
  "description": "Five-page site for a handyman or small remodel outfit: services grid, before/after, quote form.",
  "kit": "aaa-brand",              // default kit slug
  "pages": [
    { "file": "index.html", "title": "Home", "path": "/" },
    { "file": "services.html", "title": "Services", "path": "/services" }
  ],
  "tags": ["handyman", "contractor", "quote-form"],
  "components": ["nav/nav-simple", "hero/hero-split-image"],   // library components reused (informational)
  "version": 1
}
```

Rules:
- Pages are body fragments made of sections that follow the component rules (each section has `data-wf-component`). Reuse library components verbatim where they fit; customize copy freely. A template may also contain one-off sections (slug prefixed `t-<template>-`), which must still be scoped and token-only.
- Every page starts with a nav section and ends with a footer section, identical across pages.
- Internal links use the page paths from meta (`/about`, `/contact`). Export rewrites them to `about.html`.
- Forms post to `#` with `data-wf-form="contact"` so the host can wire them later.

## 6. Placeholders and fields

`/ph/<w>/<h>/<label>.svg` is served by the app and renders a neutral SVG with the label text. `site.json` values get substituted into any element with `data-wf-field` when a project is created from a template, and can be re-applied from the editor's Site Settings panel.

## 7. Quality bar

Each piece must look finished under at least the `base` kit and the `aaa-brand` kit. If a kit's base restyle breaks a component, fix the component, not the kit. Run `npm run validate` before finishing; it checks folder shape, meta fields, hard-coded colors, external image URLs, missing scoping, and duplicate slugs.
