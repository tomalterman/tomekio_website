#!/usr/bin/env node
// Tiny static-site build: resolves <!-- @include partials/<name>.html --> markers
// recursively in src/index.html and writes the result to dist/index.html.
// Also copies src/CNAME → dist/CNAME if present.

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "src");
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

function main() {
  const entry = path.join(SRC_DIR, "index.html");
  const output = resolveIncludes(entry);

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), output);

  // Copy root-level static files (CNAME, robots.txt, sitemap.xml, favicon.*, etc.)
  // — anything sitting directly in src/ that isn't an HTML/CSS source.
  const STATIC_FILES = ["CNAME", "robots.txt", "sitemap.xml"];
  for (const name of STATIC_FILES) {
    const from = path.join(SRC_DIR, name);
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, path.join(DIST_DIR, name));
    }
  }

  console.log(`✓ Built dist/index.html (${output.length} bytes)`);
}

try {
  main();
} catch (err) {
  console.error(`✗ Build failed: ${err.message}`);
  process.exit(1);
}
