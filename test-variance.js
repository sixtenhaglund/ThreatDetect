// Diagnose deck variance — loads the real game JS in a Node vm context,
// then runs buildDeck many times to see how much variation there really is.
// Throwaway file — delete after.

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const FILES = [
  "js/config.js",
  "js/viruses.js",
  "js/legit.js",
  "js/tells.js",
  "js/core.js",
  "js/gameplay.js"
];

const sandbox = {
  console,
  Math, Date, JSON, Object, Array, Number, String, Boolean, Set, Map,
  setTimeout, clearTimeout, setInterval, clearInterval,
  document: {
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, getContext: () => ({ createImageData: () => ({ data: [] }), putImageData: () => {} }), toDataURL: () => "" })
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  window: {},
  Audio: { resume: () => {}, startAmbient: () => {}, updateMusicIntensity: () => {}, levelUp: () => {} },
  METERS: { start: () => {}, setOverride: () => {}, stop: () => {} },
  Leaderboard: { load: () => [], write: () => {} },
  VIRUS_TELLS: {},
  render: () => {}
};
vm.createContext(sandbox);

for (const f of FILES) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  vm.runInContext(src, sandbox, { filename: f });
}

// The const-declared globals live as context-locals; expose what we need
// onto the sandbox object so we can inspect them from outside.
vm.runInContext(`
  this.__VIRUSES = VIRUSES;
  this.__LEGIT = LEGIT;
  this.__CONFIG = CONFIG;
  this.__RANDOM_POOLS = RANDOM_POOLS;
  this.__buildDeck = buildDeck;
  this.__randomizeCard = randomizeCard;
  this.__substitute = substitutePlaceholders;
  this.__state = state;
`, sandbox);

const VIRUSES = sandbox.__VIRUSES;
const LEGIT = sandbox.__LEGIT;
const CONFIG = sandbox.__CONFIG;
const RANDOM_POOLS = sandbox.__RANDOM_POOLS;
const buildDeck = sandbox.__buildDeck;
const randomizeCard = sandbox.__randomizeCard;
const substitute = sandbox.__substitute;
const state = sandbox.__state;

console.log("=== Sanity check ===");
console.log("VIRUSES count:", Object.keys(VIRUSES).length);
console.log("LEGIT count:", LEGIT.length);
console.log("RANDOM_POOLS keys:", Object.keys(RANDOM_POOLS).join(", "));

state.difficulty = "normal";
state.gameMode = "normal";
state.round = 1;

console.log("\nSample placeholder substitution — 5x {tld} on virus side:");
for (let i = 0; i < 5; i++) {
  console.log("  ", substitute("{tld}", null, true, []));
}

// --- Simulate 10 round-1 deals ---
console.log("\n=== Simulating 10 round-1 deals (10 cards each) ===");
const titleCounts = {};
const dealKeyCounts = {};

function dealKeyOf(card) {
  if (card.isVirus) {
    const v = VIRUSES[card.virusKey];
    let idx = v.errors.findIndex(e => e.title === card.title);
    if (idx < 0) idx = v.errors.findIndex(e => e.message === card.message);
    return card.virusKey + ":" + idx;
  }
  let idx = LEGIT.findIndex(e => e.title === card.title);
  if (idx < 0) idx = LEGIT.findIndex(e => e.message === card.message);
  return "legit:" + idx;
}

for (let run = 0; run < 10; run++) {
  state.usedLegit = new Set();
  state.usedVirusErrors = new Set();
  state.round = 1;
  const deck = buildDeck(1);
  console.log(`\nRun ${run + 1}:`);
  for (const c of deck) {
    const tag = c.isVirus ? `[${c.virusKey}]` : "[legit]";
    const display = (c.title || "(no title)").slice(0, 60);
    console.log(`  ${tag.padEnd(15)} ${display}`);
    titleCounts[display] = (titleCounts[display] || 0) + 1;
    const dk = dealKeyOf(c);
    dealKeyCounts[dk] = (dealKeyCounts[dk] || 0) + 1;
  }
}

console.log("\n=== Variance report ===");
console.log("Total cards dealt across 10 runs:", 100);
console.log("Unique titles seen:", Object.keys(titleCounts).length);
console.log("Unique dealKeys (source cards) seen:", Object.keys(dealKeyCounts).length);

const topTitles = Object.entries(titleCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
console.log("\nTop 15 most-repeated titles across 10 runs:");
for (const [t, n] of topTitles) {
  console.log(`  ${String(n).padStart(3)}x  ${t}`);
}

console.log("\n=== Placeholder coverage check ===");
let virusWith = 0, virusTotal = 0;
Object.keys(VIRUSES).forEach(k => {
  for (const e of VIRUSES[k].errors) {
    virusTotal++;
    if ((e.title + e.message + (e.meta || "")).includes("{")) virusWith++;
  }
});
let legitWith = 0;
for (const e of LEGIT) {
  if ((e.title + e.message + (e.meta || "")).includes("{")) legitWith++;
}
console.log(`Virus errors with placeholders: ${virusWith}/${virusTotal} (${Math.round(100 * virusWith / virusTotal)}%)`);
console.log(`Legit errors with placeholders: ${legitWith}/${LEGIT.length} (${Math.round(100 * legitWith / LEGIT.length)}%)`);
