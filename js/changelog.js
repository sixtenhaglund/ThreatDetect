// =====================================================================
// changelog.js — structured release history the game consumes for the
// in-game Changelog view and the "what's new" main-menu banner.
//
// Updated by the /release skill: each release prepends a new entry at
// the top of the array. Keep in sync with CHANGELOG.md (which is the
// human-readable file shown on GitHub).
//
// Schema per entry:
//   { version, date, items: [ "..." ] }
//
// `version` is a string like "0.1.0" (no leading v, the UI adds it).
// `date` is YYYY-MM-DD.
// `items` is a list of short bullet-point strings — keep them
// player-facing ("Added ILOVEYOU"), not commit-message-y ("refactor
// pickByUniformVirus to use weighted picking").
// =====================================================================
"use strict";

const CHANGELOG = [
  {
    version: "0.1.0",
    date: "2026-05-25",
    items: [
      "First public release on github.com/sixtenhaglund/ThreatDetect",
      "20 viruses in the roster, including 4 real-life rares: ILOVEYOU, MyDoom, WannaCry, and YOU ARE AN IDIOT",
      "Each rare virus has a Real-world history block in the codex telling its actual cybersecurity story",
      "Per-virus death animations + procedural audio (and the real cackle MP3 for IDIOT)",
      "20+ error cards per virus with placeholder-based randomization for variance",
      "Landing page deployed via GitHub Pages at sixtenhaglund.github.io/ThreatDetect",
      "Local build pipeline: npm run build + npm run release"
    ]
  }
];
