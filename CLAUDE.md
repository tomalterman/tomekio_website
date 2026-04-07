# CLAUDE.md

Project guidance for Claude Code working in this repo.

## What this is

Static marketing site for Tomek.io. Vanilla HTML + Tailwind, compiled
by a tiny Node script (`build.js`) to a minified `dist/` and deployed
to GitHub Pages on every push to `main`.

## Layout

```
src/
├── pages/             # one HTML file per URL
│   ├── index.html     → /
│   ├── privacy.html   → /privacy/
│   └── legal.html     → /legal/
├── partials/          # @include'd into pages
│   ├── head.html      # shared <head> chunk (charset, fonts, stylesheet)
│   ├── nav.html
│   ├── footer.html
│   └── ...            # one section per file (hero, about, etc.)
├── styles/tailwind.css
├── images/            # copied recursively to dist/images/
├── CNAME, robots.txt, sitemap.xml
build.js               # multi-page compiler + asset copier
tailwind.config.js
```

## How the build works

`npm run build` runs:
1. `node build.js` — walks `src/pages/`, resolves `<!-- @include
   partials/<name>.html -->` markers recursively, emits clean URLs
   (`pages/index.html` → `dist/index.html`, `pages/foo.html` →
   `dist/foo/index.html`). Copies CNAME / robots / sitemap and the
   `src/images/` tree.
2. Tailwind CLI → `dist/styles.css` (minified, content glob is
   `src/**/*.html`).

## Conventions

### Path conventions

- **All asset URLs are root-relative** (`/styles.css`, `/images/foo.png`,
  `/#section`). Never relative — relative paths break on subpages like
  `/privacy/` because they resolve to `/privacy/styles.css`.
- **Nav and intra-site anchor hrefs use `/#section`** so they navigate
  to the homepage section from any page, not a missing anchor on the
  current page.

### Adding a new page

1. Drop `src/pages/<slug>.html` (full HTML doc — see existing pages for
   the shell).
2. Use `<!-- @include partials/head.html -->` for the shared head
   chunk and `<!-- @include partials/nav.html --> ... <!-- @include
   partials/footer.html -->` for chrome.
3. Long-form prose pages (legal/privacy/etc.) use the `doc-*`
   component classes (see Typography below). Do not re-inline
   heading/list/link utility strings.
4. Link to the new page from wherever it should be discoverable
   (footer, nav, etc.).
5. Add the URL to `src/sitemap.xml`.

### Typography for long-form pages

Doc-page typography lives in `src/styles/tailwind.css` under
`@layer components` as a single source of truth:

| Class | Use for |
|---|---|
| `doc-h1` | Page title |
| `doc-h2` | Numbered section heading |
| `doc-h3` | Subsection heading |
| `doc-list` | Bulleted list |
| `doc-link` | In-prose link |
| `doc-strong` | Inline emphasis |
| `doc-eyebrow` | Small uppercase label (eyebrow tag, "last updated", etc.) |

**Never inline the underlying utility strings on a doc page.** If a
heading style needs to change, change `tailwind.css` once. Do not
edit the inline classes on individual `<h2>` elements.

If you need a new doc-page primitive (e.g. `doc-quote`), add it to
the `@layer components` block, do not invent a new utility-string
pattern in pages.

### Section partials

Each homepage section is its own partial under `src/partials/`. They
use Tailwind utilities directly (the `doc-*` classes are for
long-form pages, not the homepage). Hardcoded hex colors are
forbidden — always use the design tokens defined in
`tailwind.config.js` (`bg-surface`, `text-primary`, `border-outline-variant`,
etc.).

### Commit conventions

- Conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`).
- Co-Authored-By trailer for Claude.
- Commit straight to `main`. There is no PR workflow on this repo.

## Drift check before pushing

**Before every `git push`**, run a quick drift audit. The goal is to
catch consistency regressions that the build won't catch on its own —
inlined utility strings that should use the `doc-*` classes, hardcoded
hex colors, broken root-relative paths, etc.

Run these checks (all should return 0 hits, or only known exceptions):

```sh
# 1. No re-inlined doc-page typography (should use doc-h2 etc.)
grep -rn 'font-headline text-2xl font-bold mt-12 mb-4 text-on-surface' src/pages src/partials
grep -rn 'font-headline text-lg font-bold mt-6 mb-2 text-primary'      src/pages src/partials
grep -rn 'list-disc pl-6 space-y-2'                                    src/pages src/partials
grep -rn 'text-primary underline hover:text-primary-fixed'             src/pages src/partials

# 2. No hardcoded brand hex colors (use Tailwind tokens instead)
grep -rEn '#(00132e|8ad2ff|001b3d|3d4850|81cfff|00baff)' src/pages src/partials

# 3. No relative stylesheet/image paths in pages or partials
#    (breaks on subpages — must be root-relative /styles.css, /images/...)
grep -rn 'href="styles.css"'   src/pages src/partials
grep -rn 'src="images/'        src/pages src/partials
grep -rn 'srcset="images/'     src/pages src/partials

# 4. No same-page anchor hrefs in nav/footer (must be /#section so they
#    work from subpages — exception: hero "Explore Works" inside index.html)
grep -n 'href="#' src/partials/nav.html src/partials/footer.html

# 5. Build must succeed and produce zero unresolved @include markers
npm run build
grep -rn '@include' dist/
```

If any check fires, fix it before pushing. The exceptions are:

- `.technical-line` and `.technical-line-vertical` in `tailwind.css`
  intentionally hardcode `#3d4850` (the design-token color is part
  of the gradient definition itself — moving it to a CSS variable
  is a future refactor).
- Hero "Explore Works" button in `src/partials/hero.html` may use
  `href="#products"` (document-relative) since it lives only in the
  homepage shell.

If the drift audit produces a hit you believe is intentional, either
add it to the exceptions list above or fix the underlying drift before
pushing.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs
`npm ci && npm run build` and publishes `dist/` to GitHub Pages.

The custom domain is `www.tomek.io` (apex `tomek.io` redirects to
www). DNS lives at Cloudflare. The Pages cert is issued by Let's
Encrypt and rotates automatically.

## Don't

- Don't add Markdown parsers, layout engines, frameworks, or
  build-time dependencies beyond Tailwind. The whole point of this
  repo is that the build is ~100 lines of vanilla Node.
- Don't introduce a JS runtime dependency on the client. The site is
  static; if interactivity is ever needed, vanilla `<script>` is fine.
- Don't break the rule that "every URL is a real `index.html` in
  `dist/`" — no client-side routing.
