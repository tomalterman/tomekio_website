---
title: "feat: Tomek.io landing page (static, GitHub Pages)"
type: feat
status: active
date: 2026-04-06
---

# feat: Tomek.io landing page (static, GitHub Pages)

## Overview

Build the production version of the Tomek.io marketing site from the existing
prototype at `design concept/concept.html`. The site is a single static HTML
page (with sectioned anchors), styled with Tailwind, hosted on GitHub Pages at
`www.tomek.io` (apex `tomek.io` redirects to www).

The source layout should be human-friendly (split into partials/components,
readable CSS, content separated where reasonable). A lightweight build step
compiles partials → single `index.html` and runs Tailwind CLI to produce a
minified, production CSS bundle. No JS framework. No server.

## Problem Frame

Tom needs a public landing page for the Tomek.io brand. The design is already
finalized in `design concept/concept.html`, which uses the Tailwind CDN and
inlined config — fine for prototyping but unsuitable for production (FOUC,
slow first paint, no minification, dependency on a 3rd-party CDN). The output
must be production-grade: minified, self-hosted assets, fast, deployable to
GitHub Pages.

## Requirements Trace

- R1. Single landing page reproducing the concept's five sections (Hero, What
  We Do, Products, Consulting, About) plus nav and footer.
- R2. Source files are easy to read and edit (split structure, not one giant
  HTML blob).
- R3. A build step compiles source → `dist/` containing a single `index.html`,
  a minified Tailwind CSS bundle, and any required assets (fonts/icons).
- R4. Deployable to GitHub Pages from `dist/` (or `docs/`) with `tomek.io`
  CNAME, accessible at `www.tomek.io`.
- R5. No external runtime CDN dependency for Tailwind. Fonts may load from
  Google Fonts (acceptable for a marketing page) but should be referenced
  from the built HTML, not via inlined CDN scripts.
- R6. Fill in plausible content for any sections referenced but unspecified
  (e.g., legal/privacy/contact links — for now anchor-only or `mailto:`).

## Scope Boundaries

- Single page only. No blog, no multi-page routing, no CMS.
- No JS framework, no bundler beyond Tailwind CLI + a tiny partial-include
  step.
- No analytics, no cookie banner (out of scope for v1).
- No actual `/legal` or `/privacy` pages — footer links resolve to placeholder
  anchors or `mailto:`.
- No dark/light theme toggle — site is dark only (matches concept).

## Context & Research

### Relevant Code and Patterns

- `design concept/concept.html` — full visual reference; the Tailwind theme
  config (custom Material-3-style color palette + zero border radius +
  Space Grotesk / Work Sans fonts) is the source of truth for styling.

### Institutional Learnings

- N/A — greenfield repo.

### External References

- Tailwind CSS standalone CLI (no Node required) for minified CSS output:
  https://tailwindcss.com/blog/standalone-cli — usable directly via npx or
  the standalone binary.
- GitHub Pages custom domain docs: a `CNAME` file in the published directory
  with `www.tomek.io` plus DNS records (CNAME `www` → `<user>.github.io`,
  ALIAS/ANAME `@` → same).

## Key Technical Decisions

- **Tailwind CLI, not CDN.** Concept uses the CDN for prototyping speed.
  Production must precompile to a minified CSS file. Reason: performance,
  no FOUC, no third-party runtime dependency.
- **Partials via tiny Node script, not a full SSG.** A ~30-line build script
  that resolves `<!-- @include partials/foo.html -->` markers keeps the
  source readable without pulling in 11ty/Astro/etc. Eleventy is a fine
  upgrade path later if the site grows.
- **`dist/` is the deploy target.** GitHub Pages will serve from
  `gh-pages` branch (published from `dist/`) or alternatively the repo can
  publish from `/docs`. We will use `dist/` + a GitHub Actions workflow that
  publishes to `gh-pages` so the source repo stays clean. The action also
  writes the `CNAME` file.
- **Self-host fonts? No, for v1.** Google Fonts is acceptable; revisit only
  if performance budget demands it.
- **Material Symbols → keep as Google Fonts link** (matches concept).
  Self-hosting the icon font is a v2 optimization.
- **No framework, no JS build.** Tiny inline `<script>` only if needed for
  mobile nav toggle (concept doesn't include one — defer).

## Open Questions

### Resolved During Planning

- *Build tool?* Tailwind standalone CLI + ~30-line Node include script. No
  bundler.
- *Where does the published site live?* `gh-pages` branch built by Actions
  from `dist/`.
- *What about the missing legal/privacy/contact pages?* Footer links become
  placeholder anchors. `CONTACT` becomes `mailto:tom@tomek.io` (best guess).

### Deferred to Implementation

- Exact GitHub Actions workflow YAML — write during Unit 5.
- Whether the `GET SCHEMATIC` CTA needs a target — for now scroll to
  `#consulting` (best guess).
- Final social link URLs in the About section — placeholder `#` for now.

## High-Level Technical Design

> *Directional guidance for review, not implementation specification.*

```
src/
├── index.html              # shell with <!-- @include partials/... --> markers
├── partials/
│   ├── nav.html
│   ├── hero.html
│   ├── what-we-do.html
│   ├── products.html
│   ├── consulting.html
│   ├── about.html
│   └── footer.html
├── styles/
│   └── tailwind.css        # @tailwind base/components/utilities + custom
└── tailwind.config.js      # color palette + fonts + radius from concept

build.js                    # resolves @include markers → dist/index.html
package.json                # scripts: build, dev, clean

dist/                       # build output (gitignored)
├── index.html              # single compiled, partial-resolved HTML
├── styles.css              # tailwind --minify output
└── CNAME                   # "www.tomek.io"

.github/workflows/deploy.yml  # build → publish dist/ to gh-pages
```

Build flow:

```
npm run build
  → node build.js              (concat partials → dist/index.html)
  → tailwindcss -i src/styles/tailwind.css -o dist/styles.css --minify
  → cp src/CNAME dist/CNAME    (or generated by Action)
```

## Implementation Units

- [ ] **Unit 1: Project scaffolding and tooling**

**Goal:** Stand up directory structure, `package.json`, Tailwind config, and
the empty source skeleton.

**Requirements:** R2, R3, R5

**Dependencies:** None

**Files:**
- Create: `package.json`
- Create: `tailwind.config.js`
- Create: `src/styles/tailwind.css`
- Create: `src/index.html` (empty shell with include markers)
- Create: `src/partials/.gitkeep`
- Create: `.gitignore` (extend existing — add `dist/`, `node_modules/`)
- Create: `README.md` (how to build/dev/deploy)

**Approach:**
- `package.json` declares dev dependency on `tailwindcss` only. Scripts:
  `build`, `dev` (watch), `clean`.
- `tailwind.config.js` ports the entire color palette, font families, and
  `borderRadius` overrides verbatim from `design concept/concept.html`.
  `content` globs `src/**/*.html`.
- `src/styles/tailwind.css` imports `@tailwind base/components/utilities`
  plus the body background grid and `.technical-line` and
  `.material-symbols-outlined` rules from the concept's `<style>` block.

**Patterns to follow:**
- Tailwind config block in `design concept/concept.html` lines 21-89.
- Inline `<style>` block in concept lines 90-122.

**Test scenarios:**
- Test expectation: none — pure scaffolding, no behavior. Verified by
  successful build in Unit 5.

**Verification:**
- `npm install` succeeds. `npx tailwindcss --help` works. Directory tree
  matches the layout in High-Level Technical Design.

---

- [ ] **Unit 2: Build script (partial includes)**

**Goal:** A small Node script that reads `src/index.html`, resolves
`<!-- @include partials/<name>.html -->` markers recursively, and writes
the result to `dist/index.html`.

**Requirements:** R2, R3

**Dependencies:** Unit 1

**Files:**
- Create: `build.js`
- Modify: `package.json` (wire `build` script)

**Approach:**
- Plain Node, no deps. Read shell, regex-replace include markers with the
  contents of the referenced partial. Allow nested includes. Fail loudly
  on a missing partial.
- Also copies `src/CNAME` to `dist/CNAME` if present (the deploy workflow
  will overwrite/create it as well, but local `dist/` should be servable).

**Test scenarios:**
- Happy path: `src/index.html` containing two `@include` markers produces a
  `dist/index.html` with both partials inlined.
- Edge case: a partial that itself contains an `@include` is resolved
  recursively.
- Error path: a marker referencing a missing file causes the script to exit
  non-zero with a clear message.

**Verification:**
- Running `npm run build` against a stub `index.html` + partial produces
  the expected concatenated output.

---

- [ ] **Unit 3: Port concept content into partials**

**Goal:** Faithfully reproduce the visual + content of `concept.html` by
splitting it into the partials listed in the directory layout.

**Requirements:** R1, R2, R6

**Dependencies:** Unit 1, Unit 2

**Files:**
- Create: `src/partials/nav.html`
- Create: `src/partials/hero.html`
- Create: `src/partials/what-we-do.html`
- Create: `src/partials/products.html`
- Create: `src/partials/consulting.html`
- Create: `src/partials/about.html`
- Create: `src/partials/footer.html`
- Modify: `src/index.html` (head tags + body with include markers)

**Approach:**
- Lift each `<section>` from the concept into its own partial unchanged.
  Lift `<nav>` and `<footer>` likewise.
- `src/index.html` contains `<!doctype html>`, `<head>` (title, meta,
  Google Fonts links, Material Symbols link, link to `styles.css`), and
  `<body>` with the seven `@include` markers in order.
- Remove the Tailwind CDN `<script>` and the inline `tailwind.config`
  block — both are replaced by the precompiled CSS bundle.
- Best-guess content for missing pieces:
  - `GET SCHEMATIC` button → `<a href="#consulting">`.
  - About social links → `href="#"` placeholders (LinkedIn / email).
  - Footer LEGAL / PRIVACY / CONTACT → `#` and `mailto:tom@tomek.io`.
  - Year in footer copyright → `2026`.

**Patterns to follow:**
- 1:1 markup from `design concept/concept.html` lines 127-680.

**Test scenarios:**
- Happy path: After `npm run build`, opening `dist/index.html` in a browser
  renders all five sections with the same visual layout as the concept.
- Edge case: All anchor links (`#home`, `#what-we-do`, `#products`,
  `#consulting`, `#about`) scroll to the matching section.
- Edge case: External link `https://tryclifton.com` opens in a new tab.

**Verification:**
- Visual diff (eyeballed) against `design concept/concept.html` shows no
  regressions.

---

- [ ] **Unit 4: Tailwind CSS production build**

**Goal:** Wire Tailwind CLI to produce a minified `dist/styles.css` that
`dist/index.html` references.

**Requirements:** R3, R5

**Dependencies:** Unit 1, Unit 3

**Files:**
- Modify: `package.json` (`build` script chains node build + tailwind CLI;
  `dev` runs both in watch mode)
- Modify: `src/styles/tailwind.css` (final pass — confirm any custom
  utilities used by the partials exist)

**Approach:**
- `build` script: `node build.js && tailwindcss -i src/styles/tailwind.css
  -o dist/styles.css --minify`
- `dev`: `node build.js && tailwindcss -i src/styles/tailwind.css -o
  dist/styles.css --watch` (and a separate file-watcher for partials is a
  v2 nice-to-have; for now re-run `npm run build` manually).
- Confirm `tailwind.config.js`'s `content` glob picks up
  `src/**/*.html` so all class names from partials are seen.

**Test scenarios:**
- Happy path: `npm run build` produces `dist/styles.css` < ~30KB minified.
- Happy path: `dist/styles.css` contains a class actually used in a
  partial (e.g., `bg-surface-container-low`).
- Edge case: A class only used inside a partial (not in `index.html`) still
  appears in the output — confirms the content glob is correct.

**Verification:**
- Open `dist/index.html` directly in a browser; styling matches the concept.
- `grep` for one custom palette class in `dist/styles.css`.

---

- [ ] **Unit 5: GitHub Pages deployment**

**Goal:** Continuous deploy `dist/` to GitHub Pages on `main` push, with
`www.tomek.io` custom domain.

**Requirements:** R4

**Dependencies:** Unit 4

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `src/CNAME` (contents: `www.tomek.io`)
- Modify: `README.md` (DNS instructions)

**Approach:**
- Workflow: on push to `main`, install Node, run `npm ci && npm run build`,
  then publish `dist/` to the `gh-pages` branch via
  `peaceiris/actions-gh-pages` (or the official `actions/deploy-pages` —
  pick one in implementation; both well documented).
- The workflow ensures `CNAME` is present in `dist/` before publish.
- README documents required DNS records:
  - `CNAME www → <github-username>.github.io`
  - Apex `tomek.io` → GitHub Pages A records (185.199.108.153 etc.) or an
    ALIAS/ANAME if the registrar supports it.
- README documents the GitHub repo settings change: Pages → source
  `gh-pages` branch / root.

**Test scenarios:**
- Happy path: Pushing to `main` triggers the workflow, build succeeds,
  `gh-pages` branch updates, site visible at `https://www.tomek.io`.
- Edge case: Apex `tomek.io` redirects to `www.tomek.io` (handled by GitHub
  Pages automatically when both A records and CNAME are configured).

**Verification:**
- Workflow run is green.
- `curl -I https://www.tomek.io` returns 200 and the rendered HTML contains
  the hero `<h1>Tomek.io</h1>`.

## System-Wide Impact

- **API surface parity:** N/A (no APIs).
- **Unchanged invariants:** `design concept/concept.html` is preserved
  untouched as the visual reference.
- **State lifecycle risks:** None — fully static.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Tailwind config drift between concept (CDN) and built CSS produces visual regressions | Port the entire `tailwind.config` block verbatim into `tailwind.config.js` in Unit 1; visually diff in Unit 4 |
| Missing class names if a partial uses a class not seen by the content glob | Set Tailwind `content` to `src/**/*.html` (covers `index.html` and all partials) |
| Apex domain (`tomek.io`) DNS not configured by Tom yet | README documents the exact A records / CNAME needed; deploy still works for `www` once `www` CNAME is set |
| GitHub Pages cache delay after first deploy | Document expected propagation in README; not a code issue |

## Documentation / Operational Notes

- README must include: local dev (`npm install`, `npm run build`, open
  `dist/index.html`), deploy mechanism, and DNS setup.

## Sources & References

- Visual reference: `design concept/concept.html`
- Tailwind standalone CLI docs (external)
- GitHub Pages custom domain docs (external)
