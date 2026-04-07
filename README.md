# Tomek.io Website

Static landing page for [Tomek.io](https://www.tomek.io). Single page, dark
theme, built from readable source partials and compiled to a minified
production bundle.

## Stack

- HTML partials, stitched together by a tiny Node script (`build.js`)
- Tailwind CSS (compiled via the Tailwind CLI — no runtime CDN)
- No JS framework, no bundler
- Hosted on GitHub Pages with a custom domain

## Project layout

```
src/
├── index.html              # shell with <!-- @include partials/... --> markers
├── partials/               # one HTML file per page section
│   ├── nav.html
│   ├── hero.html
│   ├── what-we-do.html
│   ├── products.html
│   ├── consulting.html
│   ├── about.html
│   └── footer.html
├── styles/
│   └── tailwind.css        # @tailwind directives + custom base/utilities
└── CNAME                   # www.tomek.io

tailwind.config.js          # color palette, fonts, border-radius overrides
build.js                    # resolves @include markers → dist/index.html
package.json                # build / dev / clean scripts

dist/                       # build output (gitignored)
├── index.html
├── styles.css
└── CNAME

design concept/concept.html # original design reference (do not edit)
.github/workflows/deploy.yml
```

## Develop

```sh
npm install
npm run build          # produces dist/
open dist/index.html   # macOS — or serve with: python3 -m http.server -d dist 8000
```

Watch CSS during development:

```sh
npm run dev            # rebuilds HTML once, then watches CSS
# re-run `npm run build:html` after editing partials
```

## Deploy

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages.

### One-time setup

1. **Repo settings → Pages → Source:** GitHub Actions.
2. **DNS** at the registrar for `tomek.io`:

   | Type  | Name | Value                       |
   | ----- | ---- | --------------------------- |
   | CNAME | www  | `<github-username>.github.io` |
   | A     | @    | `185.199.108.153`           |
   | A     | @    | `185.199.109.153`           |
   | A     | @    | `185.199.110.153`           |
   | A     | @    | `185.199.111.153`           |

   (Use `ALIAS`/`ANAME` for the apex if your registrar supports it.)
3. **Repo settings → Pages → Custom domain:** `www.tomek.io`. Enable
   "Enforce HTTPS" once the cert provisions.

The apex `tomek.io` will redirect to `www.tomek.io` automatically.
