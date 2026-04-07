---
title: "feat: privacy and legal pages with multi-page build"
type: feat
status: active
date: 2026-04-07
---

# feat: privacy and legal pages with multi-page build

## Overview

Add `/privacy/` and `/legal/` pages to the Tomek.io site. Both pages
share the same nav + footer as the homepage, and live at clean URLs
(`https://www.tomek.io/privacy/`, `/legal/`). Footer links currently
pointing to `#` are wired up.

To make this possible without rewriting the build, extend `build.js`
from a single-page compiler to a small multi-page compiler that walks
`src/pages/` and emits each file to `dist/<slug>/index.html`.

## Problem Frame

The site has placeholder `href="#"` LEGAL and PRIVACY links in the
footer. Tomekio LLC needs real legal pages for both compliance and
basic professionalism. The current build only compiles one entry HTML.

## Requirements Trace

- R1. `https://www.tomek.io/privacy/` renders the supplied Privacy
  Policy content with the same nav + footer as the homepage.
- R2. `https://www.tomek.io/legal/` renders the supplied Terms of Use
  content with the same nav + footer as the homepage.
- R3. Footer LEGAL link → `/legal/`. Footer PRIVACY link → `/privacy/`.
- R4. Apex `https://www.tomek.io/` continues to work exactly as before.
- R5. Both new pages are responsive, readable on mobile, and use the
  same dark theme + Tailwind tokens as the homepage.
- R6. Build script supports multi-page compilation via a `src/pages/`
  directory convention. Adding a new page should mean dropping one
  file in `src/pages/` and editing nothing else.

## Scope Boundaries

- No CMS, no Markdown parser, no build framework swap. The legal copy
  is converted to HTML by hand and lives in the partials.
- No nav additions. Privacy and Legal stay accessible only via the
  footer (standard practice for legal pages).
- No layout/template engine — the two new pages use the same
  `@include partials/...` mechanism as `index.html`.
- No `@tailwindcss/typography` plugin. Long-form prose styling is done
  with hand-applied Tailwind utilities, keeping zero new dependencies.

## Context & Research

### Relevant Code and Patterns

- `build.js` — currently compiles a single hardcoded `src/index.html`.
  Already does include resolution + static file copy + recursive image
  copy. Needs to walk a directory instead.
- `src/index.html` — the existing page, using `<!-- @include
  partials/x.html -->` markers for nav, sections, footer.
- `src/partials/footer.html` — has `href="#"` on LEGAL and PRIVACY
  links, must be updated.
- `tailwind.config.js` — content glob is `src/**/*.html`, already
  picks up anything we add under `src/`.
- `src/styles/tailwind.css` — `@layer base` + `@layer utilities`
  pattern is already in use; we can add a `@layer components` block
  for `.doc-prose` if needed.

### External References

- GitHub Pages serves `/foo/` automatically when `dist/foo/index.html`
  exists. No `.htaccess` or routing needed.

## Key Technical Decisions

- **Multi-page convention: `src/pages/<slug>.html` → `dist/<slug>/index.html`.**
  Special case: `src/pages/index.html` → `dist/index.html` (homepage).
  This is the simplest convention that produces clean URLs and lets
  authors reason locally about each page.
- **Pages are full HTML documents.** Each page has its own
  `<!doctype>`, `<head>`, and `<body>`. They share nav + footer via
  `@include partials/nav.html` and `@include partials/footer.html`.
  This duplicates ~25 lines of `<head>` per page; for 3 pages that's
  acceptable. If the site grows past ~10 pages we'd extract a layout.
- **Convert legal copy to HTML by hand.** Two ~13-section documents.
  No Markdown parser, no new deps. Each page's body lives inside its
  page file directly (not a separate partial), since each is unique.
- **Long-form typography via inline Tailwind utilities.** Headings get
  `font-headline`, body gets `font-body text-on-surface-variant
  leading-relaxed max-w-3xl`. Lists use `list-disc pl-6 space-y-2`.
  Tables use the existing border-token pattern from the homepage.
  No `@tailwindcss/typography` plugin.
- **Footer LEGAL/PRIVACY links use trailing slash** (`/legal/`,
  `/privacy/`) so they work as folder URLs and don't redirect.

## Open Questions

### Resolved During Planning

- *Do legal pages need a separate "back to home" CTA?* Yes — the nav
  already includes anchor links like `#home` which on a non-root page
  resolve to `https://www.tomek.io/#home`. The Tomek.io brand mark in
  the nav links to `/#home` and works as a "back home" affordance.
  No extra CTA needed.
- *Anchor link behavior on subpages?* Nav anchors like `#what-we-do`
  on `/privacy/` jump to a non-existent id on the current page. Fix:
  rewrite nav anchor hrefs to be absolute (`/#what-we-do`) so they
  navigate back to the homepage section. This affects `nav.html` and
  the footer's PRODUCTS link.

### Deferred to Implementation

- Whether to add a small "Last updated" / breadcrumb pattern across
  all future doc pages — defer until there's a third page that needs
  it.

## High-Level Technical Design

```
src/
├── pages/
│   ├── index.html         → dist/index.html
│   ├── privacy.html       → dist/privacy/index.html
│   └── legal.html         → dist/legal/index.html
├── partials/
│   ├── nav.html           (updated: anchor hrefs become /#section)
│   ├── footer.html        (updated: legal/privacy hrefs)
│   └── ...                (unchanged section partials)
├── styles/
│   └── tailwind.css
└── images/

build.js                   (updated: walks src/pages/, emits clean URLs)
```

Build flow:

```
clean dist/
for each src/pages/*.html:
  resolve includes
  if name == 'index.html':
    write dist/index.html
  else:
    write dist/<basename>/index.html
copy CNAME, robots.txt, sitemap.xml
copy src/images/ → dist/images/
run tailwindcss CLI → dist/styles.css
```

## Implementation Units

- [ ] **Unit 1: Multi-page build script**

**Goal:** Teach `build.js` to walk `src/pages/` and produce one
`dist/<slug>/index.html` per page.

**Files:**
- Modify: `build.js`

**Approach:**
- Add a `PAGES_DIR = path.join(SRC_DIR, "pages")` constant.
- Walk `fs.readdirSync(PAGES_DIR)` filtering `.html` files.
- For each, resolve `@include` markers (existing function — works as-is).
- Output path: `dist/index.html` for `index.html`, otherwise
  `dist/<basename>/index.html`.
- Keep the existing CNAME / robots / sitemap / images copy logic.
- Print one `✓ Built dist/...` line per page for visibility.

**Verification:**
- After moving `src/index.html` → `src/pages/index.html`, running
  `npm run build` produces `dist/index.html` byte-identical to before.
- Adding a stub `src/pages/foo.html` produces `dist/foo/index.html`.

---

- [ ] **Unit 2: Move homepage into pages directory**

**Goal:** Migrate the existing homepage to the new convention without
changing its output.

**Files:**
- Move: `src/index.html` → `src/pages/index.html`

**Approach:**
- Just `git mv`. Content unchanged. The new build script (Unit 1)
  knows to output it as `dist/index.html` (root), not
  `dist/index/index.html`.

**Verification:**
- `dist/index.html` after build contains the same hero, methodology,
  products, consulting, about, footer as before.
- The site still loads at `/`.

---

- [ ] **Unit 3: Make nav anchor hrefs work from subpages**

**Goal:** Update nav links so that clicking "WHAT WE DO" from
`/privacy/` navigates back to the homepage section, not to a missing
anchor on the current page.

**Files:**
- Modify: `src/partials/nav.html`
- Modify: `src/partials/footer.html` (PRODUCTS link)

**Approach:**
- Rewrite all `#section` anchor hrefs to `/#section` so they always
  resolve from the site root.
- The Tomek.io brand mark in the nav: `href="/#home"` (was `#home`).
- Five nav links: HOME → `/`, WHAT WE DO → `/#what-we-do`, PRODUCTS
  → `/#products`, CONSULTING → `/#consulting`, ABOUT → `/#about`.
- Footer PRODUCTS link → `/#products`.
- Hero "Explore Works" button stays as `#products` since it lives
  inside `index.html` only (and document-relative is fine there).

**Verification:**
- On `/`, clicking nav links scrolls to the section (browsers handle
  the absolute URL gracefully when on the same path).
- On `/privacy/`, clicking nav links navigates to `/#section` and
  scrolls to that section after page load.

---

- [ ] **Unit 4: Doc page partial — shared head**

**Goal:** Extract the `<head>` block into a shared partial so the
two new pages don't duplicate Google Fonts links, viewport meta, etc.

**Files:**
- Create: `src/partials/head.html`
- Modify: `src/pages/index.html` (use the new head partial)

**Approach:**
- Pull the head contents (charset, viewport, fonts, stylesheets,
  favicon) into `partials/head.html`.
- The page-level `<title>` and `<meta name="description">` stay in
  each page since they differ. The head partial covers everything
  else: charset, viewport, fonts, material symbols, the styles.css
  link.
- `src/pages/index.html` becomes:
  ```
  <!doctype html>
  <html class="dark" lang="en">
    <head>
      <title>Tomek.io | Engineering AI-Native Products</title>
      <meta name="description" content="..." />
      <!-- @include partials/head.html -->
    </head>
    <body class="...">
      <!-- @include partials/nav.html -->
      <main>...</main>
      <!-- @include partials/footer.html -->
    </body>
  </html>
  ```

**Verification:**
- Build produces same `dist/index.html` content (modulo whitespace)
  as before. Site still renders identically.

---

- [ ] **Unit 5: Privacy Policy page**

**Goal:** Create `src/pages/privacy.html` rendering the supplied
Privacy Policy content with consistent dark-theme typography.

**Files:**
- Create: `src/pages/privacy.html`

**Approach:**
- Full HTML doc with the same shell: `<head>` partial, body class,
  nav include, footer include.
- `<title>Privacy Policy | Tomek.io</title>` and a matching
  description meta.
- Body wraps content in:
  ```
  <main class="pt-32 pb-24 px-6">
    <article class="max-w-3xl mx-auto">
      <header>
        <span class="font-label text-xs ...">FIG 6: PRIVACY</span>
        <h1 class="font-headline text-5xl ...">Privacy Policy</h1>
        <p class="text-on-surface-variant ...">Last updated: ...</p>
      </header>
      <div class="space-y-8 ...">
        ... sections ...
      </div>
    </article>
  </main>
  ```
- Convert the supplied Markdown to HTML by hand:
  - `## N. Heading` → `<h2 class="font-headline text-2xl font-bold mt-12 mb-4 text-on-surface">`
  - `### foo` → `<h3 class="font-headline text-lg font-bold mt-6 mb-2 text-primary">`
  - `**bold**` → `<strong class="text-on-surface">`
  - bulleted lists → `<ul class="list-disc pl-6 space-y-2">`
  - tables → reuse the homepage's bordered-cell pattern
    (`border border-outline-variant/15 p-3`)
  - external links → `<a class="text-primary underline" target="_blank" rel="noopener noreferrer">`
- Keep the body copy verbatim from the user spec.

**Verification:**
- `dist/privacy/index.html` exists.
- Page is reachable at `/privacy/` locally.
- All 13 numbered sections render with proper headings.
- Provider table renders correctly.
- External links open in a new tab.

---

- [ ] **Unit 6: Terms of Use page**

**Goal:** Create `src/pages/legal.html` rendering the supplied Terms
of Use content.

**Files:**
- Create: `src/pages/legal.html`

**Approach:**
- Same shell as privacy.html.
- `<title>Terms of Use | Tomek.io</title>`.
- Eyebrow: `FIG 7: LEGAL`.
- 12 numbered sections, hand-converted to HTML using the same
  utility-class patterns established in Unit 5.

**Verification:**
- `dist/legal/index.html` exists, reachable at `/legal/`.
- All 12 numbered sections render.

---

- [ ] **Unit 7: Wire up footer links**

**Goal:** Update the footer's LEGAL and PRIVACY links to point at the
new pages.

**Files:**
- Modify: `src/partials/footer.html`

**Approach:**
- LEGAL `href="#"` → `href="/legal/"`.
- PRIVACY `href="#"` → `href="/privacy/"`.
- PRODUCTS link gets the absolute-anchor treatment from Unit 3
  (`/#products`) so it works from the new pages too.

**Verification:**
- Click LEGAL/PRIVACY from any page → loads the corresponding doc.

---

- [ ] **Unit 8: Sitemap update**

**Goal:** Add the two new URLs to `sitemap.xml` so search engines find
them.

**Files:**
- Modify: `src/sitemap.xml`

**Approach:**
- Add `<url><loc>https://www.tomek.io/privacy/</loc>...</url>` and
  same for `/legal/`.
- Lower `priority` (0.3) and `changefreq` `yearly`.

**Verification:**
- After build, `dist/sitemap.xml` lists three URLs.

## System-Wide Impact

- **Routing:** Three top-level URLs now exist (`/`, `/privacy/`,
  `/legal/`). GitHub Pages handles folder-style serving natively.
- **Build pipeline:** `build.js` becomes a multi-page compiler. New
  pages added by dropping a file into `src/pages/`.
- **Unchanged invariants:** Tailwind config, deploy workflow, DNS,
  custom domain, image pipeline are all untouched.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Hand-converting ~25 sections of legal Markdown to HTML introduces transcription errors | Carefully copy text block by block; verify the rendered page contains every paragraph from the source spec via grep after build |
| New nav `/#section` hrefs add a hash navigation step on the homepage that wasn't there before | Browsers treat same-page hash navigation as a no-op page load; smooth scroll behavior unchanged |
| Long-form prose without the typography plugin may look uneven | Use a small set of consistent utility classes for h1/h2/h3/p/ul applied uniformly across both pages |

## Sources & References

- User-supplied Privacy Policy and Terms of Use copy in this LFG invocation.
- Existing partials in `src/partials/`.
- Existing `build.js` (single-page version).
