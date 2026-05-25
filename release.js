// =====================================================================
// release.js — wraps `gh release create` to attach docs/release.zip as
// a GitHub Release on the current repo.
//
// Run with: npm run release v0.1.0
// or:       node release.js v0.1.0 --notes "What's new..."
// =====================================================================

"use strict";

const fs        = require("fs");
const path      = require("path");
const { spawn } = require("child_process");

const ROOT      = __dirname;
const ZIP       = path.join(ROOT, "docs", "release.zip");

function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}

// -------- arg parsing ----------------------------------------------------

const args = process.argv.slice(2);
const tag  = args.find(a => !a.startsWith("--"));
const notesIdx = args.indexOf("--notes");
const notes = notesIdx >= 0 ? args[notesIdx + 1] : null;

if (!tag) {
  fail("Usage: npm run release <tag>\n   eg. npm run release v0.1.0\n   optional: --notes \"What's new\"");
}
if (!/^v\d+\.\d+\.\d+(-[a-z0-9.]+)?$/.test(tag)) {
  fail("Tag must look like v0.1.0 (got: " + tag + ")");
}

// -------- preflight checks ----------------------------------------------

if (!fs.existsSync(ZIP)) {
  fail("docs/release.zip not found. Run `npm run build` first.");
}

// Confirm the gh CLI is on the user's PATH so we get a clear error
// instead of a confusing ENOENT later.
function which(cmd) {
  return new Promise(resolve => {
    const p = spawn(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore" });
    p.on("close", code => resolve(code === 0));
  });
}

// -------- shell helpers --------------------------------------------------

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    p.on("close", code => code === 0 ? resolve() : reject(new Error(cmd + " exited with code " + code)));
    p.on("error", reject);
  });
}

// -------- main -----------------------------------------------------------

(async function main() {
  if (!await which("gh")) {
    fail("GitHub CLI (gh) not found.\n   Install from https://cli.github.com then run `gh auth login` once.");
  }

  const title = "ThreatDetect " + tag;
  const releaseNotes = notes || ("Release " + tag + ".\n\nDownload `release.zip` and open `index.html` in a browser to play offline.");

  console.log("→ Creating GitHub release " + tag + " ...");
  console.log("  title:  " + title);
  console.log("  attach: docs/release.zip");
  console.log("");

  await run("gh", [
    "release", "create", tag,
    ZIP,
    "--title", title,
    "--notes", releaseNotes
  ]);

  console.log("");
  console.log("✓ Release " + tag + " published.");
})().catch(err => {
  console.error("✗ Release failed:", err.message || err);
  process.exit(1);
});
