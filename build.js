// =====================================================================
// build.js — local production build for ThreatDetect.
// Reads source files from the repo root, produces minified output in
// ./docs/. GitHub Pages is configured to serve from ./docs/ on main, so
// committing + pushing the build is what publishes a release.
//
// Run with: npm run build
// =====================================================================

"use strict";

const fs   = require("fs");
const path = require("path");

const { minify: minifyJS }   = require("terser");
const { minify: minifyHTML } = require("html-minifier-terser");
const postcss                = require("postcss");
const cssnano                = require("cssnano");
const archiver               = require("archiver");

const ROOT   = __dirname;
const OUT    = path.join(ROOT, "docs");
const PLAY   = path.join(OUT, "play");

// -------- helpers --------------------------------------------------------

function read(file)        { return fs.readFileSync(path.join(ROOT, file), "utf8"); }
function write(rel, data)  { fs.writeFileSync(path.join(OUT, rel), data); }
function writeRaw(abs, data) { fs.writeFileSync(abs, data); }

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function bytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

// Extract the ordered list of `<script src="..."></script>` paths from
// the game's index.html so the bundle stays in the right load order
// without us hand-maintaining a separate manifest.
function parseScriptOrder(indexHtml) {
  const re = /<script\s+src="([^"]+)"><\/script>/g;
  const list = [];
  let m;
  while ((m = re.exec(indexHtml))) list.push(m[1]);
  return list;
}

// -------- build steps ----------------------------------------------------

async function buildGameCss() {
  const src = read("styles.css");
  const result = await postcss([cssnano({ preset: "default" })]).process(src, { from: undefined });
  write("play/styles.css", result.css);
  return { rawBytes: src.length, outBytes: result.css.length };
}

async function buildGameBundle() {
  const indexHtml = read("index.html");
  const scripts = parseScriptOrder(indexHtml);
  if (scripts.length === 0) throw new Error("No <script src=...> tags found in index.html");

  // Read each source file and concatenate in order. We keep them as
  // separate sections of the bundle (with a small comment header per
  // file in DEV builds — stripped in PROD).
  const concat = scripts.map(rel => {
    const text = read(rel);
    return "/* ----- " + rel + " ----- */\n" + text;
  }).join("\n\n");

  const result = await minifyJS(concat, {
    compress: { passes: 2 },
    mangle:   true,
    format:   { comments: false }
  });

  if (result.error) throw result.error;
  write("play/bundle.min.js", result.code);

  return { files: scripts.length, rawBytes: concat.length, outBytes: result.code.length };
}

async function buildGameHtml() {
  // Rewrite index.html so it loads the single bundle instead of 12 scripts.
  // The CSS link stays as ./styles.css (relative to /play/).
  const src = read("index.html");

  // Replace the whole block of consecutive <script src="..."></script>
  // tags with a single <script src="bundle.min.js"></script>.
  const replaced = src.replace(
    /(<script\s+src="[^"]+"><\/script>\s*)+/g,
    '<script src="bundle.min.js"></script>\n'
  );

  const out = await minifyHTML(replaced, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true
  });
  write("play/index.html", out);
  return { rawBytes: src.length, outBytes: out.length };
}

async function buildLanding() {
  // Inline landing.css into landing.html for a single-request landing page.
  const html = read("landing.html");
  const css  = read("landing.css");

  const minCss = (await postcss([cssnano({ preset: "default" })]).process(css, { from: undefined })).css;

  // Replace <link rel="stylesheet" href="landing.css"> with an inline <style>.
  const inlined = html.replace(
    /<link\s+rel="stylesheet"\s+href="landing\.css">/,
    "<style>" + minCss + "</style>"
  );

  const out = await minifyHTML(inlined, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
  });

  write("index.html", out);
  return { rawBytes: html.length + css.length, outBytes: out.length };
}

function copyStaticAssets() {
  // Copy files that don't need processing — manifest, icon, etc. — into
  // docs/ so the deployed site can serve them. Manifest + icon enable
  // PWA install on Chrome/Edge (desktop + Android) and Safari (iOS).
  const assets = ["manifest.json", "icon.svg"];
  const results = [];
  for (const f of assets) {
    const src = path.join(ROOT, f);
    if (!fs.existsSync(src)) continue;
    const dst = path.join(OUT, f);
    fs.copyFileSync(src, dst);
    const stat = fs.statSync(dst);
    results.push({ file: f, bytes: stat.size });
  }
  return results;
}

async function buildZip() {
  // Wrap everything we just wrote into docs/release.zip for the GitHub
  // Release attachment. Players who download the zip + double-click the
  // contained index.html get the full game offline.
  return new Promise((resolve, reject) => {
    const zipPath = path.join(OUT, "release.zip");
    // Remove an old release.zip if it's still sitting in docs/ so it
    // doesn't end up zipping itself.
    try { fs.unlinkSync(zipPath); } catch (_) { /* ok */ }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolve({ outBytes: archive.pointer() }));
    archive.on("error", reject);
    archive.pipe(output);
    // Archive the built docs/ folder — but EXCLUDE the zip itself (we
    // just deleted it but be paranoid).
    archive.glob("**/*", { cwd: OUT, ignore: ["release.zip"] });
    archive.finalize();
  });
}

// -------- main -----------------------------------------------------------

(async function main() {
  const t0 = Date.now();
  console.log("• Cleaning ./docs ...");
  ensureCleanDir(OUT);
  fs.mkdirSync(PLAY, { recursive: true });

  console.log("• Minifying game CSS ...");
  const css = await buildGameCss();
  console.log("    styles.css  " + bytes(css.rawBytes) + " -> " + bytes(css.outBytes));

  console.log("• Bundling + minifying game JS ...");
  const js = await buildGameBundle();
  console.log("    " + js.files + " JS files -> bundle.min.js  " + bytes(js.rawBytes) + " -> " + bytes(js.outBytes));

  console.log("• Minifying game HTML ...");
  const html = await buildGameHtml();
  console.log("    index.html  " + bytes(html.rawBytes) + " -> " + bytes(html.outBytes));

  console.log("• Building landing page (HTML + inlined CSS) ...");
  const landing = await buildLanding();
  console.log("    landing -> docs/index.html  " + bytes(landing.rawBytes) + " -> " + bytes(landing.outBytes));

  console.log("• Copying static assets (manifest, icon) ...");
  const assets = copyStaticAssets();
  assets.forEach(a => console.log("    " + a.file + "  " + bytes(a.bytes)));

  console.log("• Zipping docs/ into release.zip ...");
  const zip = await buildZip();
  console.log("    release.zip  " + bytes(zip.outBytes));

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  console.log("");
  console.log("✓ Build complete in " + elapsed + "s.");
  console.log("");
  console.log("Locally preview:");
  console.log("  • Landing : file://" + path.join(OUT, "index.html"));
  console.log("  • Game    : file://" + path.join(OUT, "play", "index.html"));
  console.log("");
  console.log("To publish: git add docs && git commit -m \"Release\" && git push");
  console.log("To tag a release: npm run release v0.1.0");
})().catch(err => {
  console.error("✗ Build failed:", err);
  process.exit(1);
});
