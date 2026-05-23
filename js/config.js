// =====================================================
// config.js — tuning knobs, template ids, icon SVGs,
//             random pools, button-label synonyms, shop
// Loaded first; everything else can reference these.
// =====================================================
"use strict";

/* ---- Config: tuning knobs in one place ---- */
const CONFIG = {
  startLives: 1,
  cardsPerRound: 10,
  totalRounds: 10,
  scoreRight: 100,
  streakBonus: 50,
  streakCap: 10,
  scoreWrong: -50,
  starterUnlocked: ["EPILEPTICA", "STATIC", "MELTDOWN"],
  // Creditz
  creditzPerRound: { challenge: 20, easy: 2, normal: 5, hard: 10, nightmare: 15 },
  scorePerCreditz: 500,         // every 100 score points = +1 ₢ at end of run
  // Antivirus minigames. Each cell is {n, t}:
  //   n = count / length / threshold for that minigame
  //   t = timer in seconds
  antivirusPrice: 40,
  minigameByDifficulty: {
    easy:      { rounds: 1, quarantine: {n:3,  t:6.0}, sequence: {n:3, t:9.0}, impostor: {n:4,  t:4.0} },
    normal:    { rounds: 2, quarantine: {n:5,  t:6.0}, sequence: {n:4, t:9.0}, impostor: {n:6,  t:4.0} },
    hard:      { rounds: 3, quarantine: {n:8,  t:5.5}, sequence: {n:5, t:8.0}, impostor: {n:8,  t:3.5} },
    nightmare: { rounds: 4, quarantine: {n:10, t:5.0}, sequence: {n:6, t:8.0}, impostor: {n:10, t:3.0} },
    challenge: { rounds: 3, quarantine: {n:6,  t:5.0}, sequence: {n:5, t:8.0}, impostor: {n:7,  t:3.5} }
  }
};

/* ============================================================
   SAVE
   ============================================================ */


/* ---- Template ids referenced by every card ---- */
const TPL = {
  WIN11:    "win11",
  AV:       "av",
  BIOS:     "bios",
  TERMINAL: "terminal",
  TOAST:    "toast",
  DESKTOP:  "desktop",
  LOADING:  "loading",
  // New visual templates
  WIN311:   "win311",   // Windows 3.1/95 gray Chicago-style dialog
  BSOD:     "bsod",     // full-screen blue stop screen
  NORTON:   "norton",   // old Norton AntiVirus DOS box (cyan/blue)
  MAC:      "mac",      // macOS-style notification banner
  CHAT:     "chat",     // Discord/Teams/Slack-style DM bubble
  PHONE:    "phone",    // iPhone lock-screen banner
  PRINT:    "print",    // print preview dialog
  CAPTCHA:  "captcha",  // "I'm not a robot" verification card
  UPDATE:   "update"    // fourth-wall ThreatDetect "v2.1 available" banner
};

/* ---- Error icon variants (used by iconFor in game.js) ---- */
const ICON_VARIANTS = [
  // Red X circle (classic Windows error)
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="#c42b1c"/>
    <path d="M11 11 L21 21 M21 11 L11 21" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  // Amber warning triangle
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 3 L30 28 L2 28 Z" fill="#f5a623" stroke="#000" stroke-width="1"/>
    <rect x="14.6" y="11" width="2.8" height="9" fill="#000"/>
    <rect x="14.6" y="22" width="2.8" height="2.8" fill="#000"/>
  </svg>`,
  // Glitched/torn rectangle
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="3" y="6" width="26" height="6" fill="#ff00aa"/>
    <rect x="6" y="14" width="22" height="6" fill="#00ddff" transform="translate(-4 0)"/>
    <rect x="3" y="22" width="26" height="6" fill="#ffff00" transform="translate(3 0)"/>
  </svg>`,
  // Blank box (NULL-style empty)
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="4" y="4" width="24" height="24" fill="none" stroke="#888" stroke-width="2" stroke-dasharray="3 3"/>
  </svg>`,
  // Void / empty-set ∅
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="12" fill="none" stroke="#aa66ff" stroke-width="3"/>
    <line x1="6" y1="26" x2="26" y2="6" stroke="#aa66ff" stroke-width="3"/>
  </svg>`,
  // Skull (danger / death)
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 3 C9 3 5 8 5 14 L5 19 L8 22 L8 26 L12 26 L12 22 L14 22 L14 26 L18 26 L18 22 L20 22 L20 26 L24 26 L24 22 L27 19 L27 14 C27 8 23 3 16 3 Z" fill="#222" stroke="#fff" stroke-width="1.2"/>
    <circle cx="12" cy="14" r="2.5" fill="#fff"/>
    <circle cx="20" cy="14" r="2.5" fill="#fff"/>
  </svg>`,
  // Question mark in a circle (unknown)
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="#1f6feb"/>
    <text x="16" y="22" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" font-weight="900" fill="#fff">?</text>
  </svg>`,
  // Lightning / shock
  `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
    <polygon points="18,3 8,18 15,18 12,29 24,13 17,13" fill="#ffd700" stroke="#000" stroke-width="1"/>
  </svg>`
];

// Named icon map so cards can pick their icon explicitly via `icon: "skull"` etc.
const ICONS = {
  error:     ICON_VARIANTS[0],
  warning:   ICON_VARIANTS[1],
  glitch:    ICON_VARIANTS[2],
  blank:     ICON_VARIANTS[3],
  void:      ICON_VARIANTS[4],
  skull:     ICON_VARIANTS[5],
  question:  ICON_VARIANTS[6],
  lightning: ICON_VARIANTS[7]
};

// Default icon per template — used when a card doesn't specify its own.
// Pools of random fill-ins. Card text can use {token} placeholders (e.g. {name},
// {tld}) and they get substituted at deck-build time so the same card stays stable
// across re-renders but differs between runs.
const RANDOM_POOLS = {
  department: ["Accounting", "Engineering", "HR", "Marketing", "Sales", "IT", "Legal", "Operations", "Finance", "Procurement", "DevOps"],
  tld:        [".host", ".tk", ".live", ".pw", ".ru", ".net", ".biz", ".xyz", ".support", ".help", ".online", ".click", ".info", ".app"],
  app:        ["Microsoft Teams", "Slack", "Discord", "Outlook", "OneDrive", "Notion", "Zoom", "SharePoint", "Asana", "Linear", "Trello"],
  brand:      ["Microsoft", "Google", "Apple", "Amazon", "Adobe", "Dropbox", "GitHub"],
  city:       ["Stockholm", "Berlin", "Helsinki", "Oslo", "Copenhagen", "Tallinn", "Amsterdam", "Riga"]
};

// Icon colors a card may get assigned. Picked once per card at deal time.
const ICON_COLORS = ["#c42b1c", "#f5a623", "#1f6feb", "#aa66ff", "#00b86b", "#ff44aa", "#ffd700", "#888888"];

// Button-label synonyms. Each card gets one pair at deal time so the buttons
// don't always say "Report" / "OK".
const REPORT_SYNONYMS = ["Report", "Virus", "Unsafe", "Block", "Threat", "Quarantine"];
const OK_SYNONYMS     = ["OK", "Continue", "Safe", "Allow", "Proceed", "Trust"];

const ICON_BY_TEMPLATE = {
  win11:    "error",
  av:       "warning",
  bios:     "lightning",
  terminal: "question",
  toast:    "blank",
  desktop:  "error",
  loading:  "warning",
  win311:   "error",
  bsod:     "warning",
  norton:   "warning",
  mac:      "blank",
  chat:     "question",
  phone:    "blank",
  print:    "blank",
  captcha:  "question",
  update:   "warning"
};

/* ---- Shop items ---- */
const SHOP_ITEMS = [
  {
    id: "antivirus",
    name: "Antivirus",
    price: CONFIG.antivirusPrice,
    icon: "🛡",
    description: "If you mistakenly press OK on a virus, you get one chance to quarantine it in a quick minigame. Win the minigame and the run continues — but the antivirus is consumed."
  }
];


/* ---- Antivirus minigame tuning ---- */
// (Per-difficulty minigame sizing now lives in CONFIG.minigameByDifficulty;
// startMinigame picks the right row at run time.)
