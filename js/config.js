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
  startingCreditz: 0,           // how much ₢ a fresh save starts with
  creditzPerRound: { challenge: 20, easy: 2, normal: 5, hard: 15, nightmare: 30, endless: 10 },
  scorePerCreditz: 1000,         // every 100 score points = +1 ₢ at end of run
  // Antivirus minigames. Each cell is {n, t}:
  //   n = count / length / threshold for that minigame
  //   t = timer in seconds
  antivirusPrice: 40,
  minigameByDifficulty: {
    easy:      { rounds: 1, quarantine: {n:3,  t:6.0}, sequence: {n:2, t:9.5}, impostor: {n:4,  t:4.0} },
    normal:    { rounds: 2, quarantine: {n:5,  t:6.0}, sequence: {n:3, t:9.0}, impostor: {n:9,  t:4.0} },
    hard:      { rounds: 4, quarantine: {n:8,  t:5.5}, sequence: {n:4, t:8.0}, impostor: {n:18,  t:3.5} },
    nightmare: { rounds: 5, quarantine: {n:10, t:5.5}, sequence: {n:5, t:8.0}, impostor: {n:36, t:3.0} },
    challenge: { rounds: 5, quarantine: {n:6,  t:5.0}, sequence: {n:3, t:7.0}, impostor: {n:21,  t:3.0} },
    endless:   { rounds: 3, quarantine: {n:9,  t:5.0}, sequence: {n:4, t:7.5}, impostor: {n:14, t:3.5} }
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
  app:        ["Microsoft Teams", "Slack", "Discord", "Outlook", "OneDrive", "Notion", "Zoom", "SharePoint", "Asana", "Linear", "Trello", "Photoshop", "Excel", "Word", "Spotify", "Steam", "Visual Studio Code", "Figma"],
  brand:      ["Microsoft", "Google", "Apple", "Amazon", "Adobe", "Dropbox", "GitHub", "Cloudflare", "Mozilla", "Logitech", "NVIDIA", "Intel", "AMD"],
  city:       ["Stockholm", "Berlin", "Helsinki", "Oslo", "Copenhagen", "Tallinn", "Amsterdam", "Riga"],
  // People & comms
  name:       ["Sarah K.", "Alex Chen", "Maya Lindqvist", "Jordan Williams", "Sam Patel", "Casey Brown", "Riley Park", "Sven Bergstrom", "Mira Singh", "Tom Lee", "Eva Söderlund", "Hugo Andersson"],
  username:   ["alex.k", "StandardUser", "admin", "jdoe", "sara_p", "m.dahl", "sixten", "sysadmin", "lhansson", "guest"],
  // System / OS
  kb:         ["KB5034441", "KB4474419", "KB5031356", "KB5028948", "KB5040442", "KB5039212", "KB5036893"],
  version:    ["4.21.7022", "22.06.1", "110.0.1587.41", "14.40", "3.8.6", "2025.05.01", "1.92.3", "115.0", "12.0.5"],
  filesize:   ["1.2 GB", "84 KB", "256 MB", "4.5 MB", "38 MB", "12 GB", "640 KB", "1.8 MB", "512 MB", "76 KB"],
  filename:   ["Q4_Summary", "Annual_Report", "Resume_2026", "Project_Plan", "README", "Invoice_8821", "Meeting_Notes", "Backup_Final", "Budget_Q3", "design_v3"],
  ext:        [".docx", ".pdf", ".xlsx", ".jpg", ".png", ".zip", ".pptx", ".csv", ".txt", ".mp4"],
  process:    ["svchost.exe", "explorer.exe", "RuntimeBroker.exe", "dwm.exe", "services.exe", "spoolsv.exe", "lsass.exe", "csrss.exe", "winlogon.exe"],
  driver:     ["Realtek HD Audio", "NVIDIA Display Driver", "Intel Graphics", "Logitech HID", "Bluetooth A2DP", "Synaptics Touchpad", "Realtek PCIe LAN", "ASMedia USB 3.2", "Intel Wi-Fi 6E"],
  // Network
  port:       ["443", "80", "8080", "22", "3389", "53", "25", "587", "8443"],
  ipaddr:     ["192.168.0.42", "10.0.0.1", "172.16.0.5", "192.168.1.100", "10.10.0.27", "172.20.5.18"],
  // Misc
  percent:    ["14%", "23%", "47%", "68%", "82%", "96%", "31%", "59%"],
  game:       ["Cyberpunk 2077", "Helldivers 2", "Stardew Valley", "Minecraft", "CS2", "Elden Ring", "Hades", "Baldur's Gate 3", "Fortnite", "Hollow Knight"],
  // BSOD-flavor pools — used inside Windows kernel-crash cards so each draw
  // shows different stop codes, modules, CPUs, etc. even when the title is fixed.
  stopcode: [
    "0x0000001A", "0x0000000A", "0x00000124", "0x00000050", "0x00000139",
    "0x000000F4", "0x0000007B", "0x000000D1", "0x000000C2", "0x00000019",
    "0x000000ED", "0x00000074", "0x0000004E", "0x000000BE", "0x000000C9"
  ],
  sysmodule: [
    "nvlddmkm.sys", "tcpip.sys", "ndis.sys", "ntoskrnl.exe", "win32k.sys",
    "iastor.sys", "ataport.sys", "Netio.sys", "fltmgr.sys", "afd.sys",
    "Realtek8169.sys", "atikmpag.sys", "USBHUB.SYS", "ks.sys"
  ],
  cpu: [
    "Intel Core i7-12700K", "Intel Core i5-13600K", "Intel Core i9-14900K",
    "AMD Ryzen 9 7900X", "AMD Ryzen 7 7700X", "AMD Ryzen 5 7600",
    "Apple M2", "Apple M3 Pro", "Snapdragon X Elite"
  ],
  diagtool: [
    "mdsched.exe", "sfc.exe", "chkdsk.exe", "DISM /RestoreHealth",
    "Reliability Monitor", "Event Viewer", "verifier.exe", "memtest86"
  ],
  // Virus-flavor pools — wallets / file counts / countdowns vary so
  // ransomware cards aren't identical every time they're drawn.
  wallet: [
    "bc1qxy2kgdygjrsqtzq2n0yrf249", "bc1q34aq5drpuwy3wgl9lhup9892hxv9",
    "3FZbgi9kSU5cKHwXJsK6n9b1n1cM5",
    "0x7a23f9b21cffabe991acb5572b9",
    "0x8c4b5fa2cd91ef7218bc1d5a5e21"
  ],
  timer: [
    "23:42:18", "23:00:00", "12:14:55", "47:59:59", "11:59:30", "06:32:11", "00:42:07"
  ],
  numfiles: [
    "8,441", "12,882", "21,003", "18,442", "31,082", "42,108", "88,221", "65,704"
  ]
};

// Icon colors a card may get assigned. Picked once per card at deal time.
const ICON_COLORS = ["#ff1500", "#001aff", "#1f6feb", "#830000", "#030027", "#3b3b3b", "#000000", "#888888"];

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
