#!/usr/bin/env node
// Tiny static-site build:
//   - Walks src/pages/*.html, resolves <!-- @include partials/<name>.html -->
//     markers recursively, and emits clean-URL outputs:
//       src/pages/index.html   → dist/index.html
//       src/pages/<slug>.html  → dist/<slug>/index.html
//   - Copies a small allowlist of root-level static files (CNAME, robots,
//     sitemap) and recursively copies src/images/ → dist/images/.

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");
const PAGES_DIR = path.join(SRC_DIR, "pages");
const DIST_DIR = path.join(__dirname, "dist");
const INCLUDE_RE = /<!--\s*@include\s+(\S+?)\s*-->/g;

function resolveIncludes(filePath, stack = []) {
  if (stack.includes(filePath)) {
    throw new Error(
      `Circular include detected: ${[...stack, filePath].join(" → ")}`
    );
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const contents = fs.readFileSync(filePath, "utf8");
  return contents.replace(INCLUDE_RE, (_match, includePath) => {
    const resolved = path.join(SRC_DIR, includePath);
    return resolveIncludes(resolved, [...stack, filePath]);
  });
}

function buildPages() {
  if (!fs.existsSync(PAGES_DIR)) {
    throw new Error(`Missing pages directory: ${PAGES_DIR}`);
  }
  const entries = fs
    .readdirSync(PAGES_DIR)
    .filter((name) => name.endsWith(".html"));

  if (entries.length === 0) {
    throw new Error(`No pages found in ${PAGES_DIR}`);
  }

  for (const name of entries) {
    const src = path.join(PAGES_DIR, name);
    const html = resolveIncludes(src);

    let outPath;
    if (name === "index.html") {
      outPath = path.join(DIST_DIR, "index.html");
    } else {
      const slug = name.replace(/\.html$/, "");
      const outDir = path.join(DIST_DIR, slug);
      fs.mkdirSync(outDir, { recursive: true });
      outPath = path.join(outDir, "index.html");
    }

    fs.writeFileSync(outPath, html);
    const rel = path.relative(__dirname, outPath);
    console.log(`✓ Built ${rel} (${html.length} bytes)`);
  }
}

function copyStaticAssets() {
  // Copy root-level static files (CNAME, robots.txt, sitemap.xml, favicon.*, etc.)
  // — anything sitting directly in src/ that isn't an HTML/CSS source.
  const STATIC_FILES = ["CNAME", "robots.txt", "sitemap.xml"];
  for (const name of STATIC_FILES) {
    const from = path.join(SRC_DIR, name);
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, path.join(DIST_DIR, name));
    }
  }

  // Recursively copy src/images/ → dist/images/ if it exists.
  const imagesSrc = path.join(SRC_DIR, "images");
  if (fs.existsSync(imagesSrc)) {
    fs.cpSync(imagesSrc, path.join(DIST_DIR, "images"), { recursive: true });
  }
}

function main() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  buildPages();
  copyStaticAssets();
}

try {
  main();
} catch (err) {
  console.error(`✗ Build failed: ${err.message}`);
  process.exit(1);
}
