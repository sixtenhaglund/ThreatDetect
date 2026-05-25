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
  UPDATE:   "update",   // fourth-wall ThreatDetect "v2.1 available" banner
  EMAIL:    "email",    // Outlook 2000-style email window (From/To/Cc/Subject + body + attachment)
  RANSOM:   "ransom",   // WannaCry-style ransom note (red header, padlock, countdowns, Bitcoin wallet)
  IDIOT:    "idiot"     // YOU ARE AN IDIOT prank dialog (yellow stick figure, magenta border, OK-only)
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
// {tld}) and they get substituted at deck-build time so the same card stays
// stable across re-renders but differs between runs.
//
// Two pool shapes are supported:
//   [a, b, c]                       — flat list (same values on virus and legit cards)
//   { legit: [...], virus: [...] }  — split: substitutePlaceholders picks
//                                     from .legit on legit cards and from .virus
//                                     on virus cards, so {tld} can mean ".com"
//                                     on a real alert and ".pw" on a fake one.
//                                     If only one side is defined the other
//                                     side falls back to it.
const RANDOM_POOLS = {
  // ---- Split pools (legit vs virus values are meaningfully different) ----
  tld: {
    legit: [".com", ".org", ".net", ".se", ".io", ".de", ".gov", ".edu", ".uk", ".dev", ".co"],
    virus: [".host", ".tk", ".live", ".pw", ".ru", ".biz", ".xyz", ".support", ".help", ".online", ".click", ".info", ".app"]
  },
  brand: {
    legit: ["Microsoft", "Google", "Apple", "Amazon", "Adobe", "Dropbox", "GitHub", "Cloudflare", "Mozilla", "Logitech", "NVIDIA", "Intel", "AMD"],
    virus: ["Micros0ft", "G00gle", "Adobr", "Appl3", "Microsft", "Cl0udflare", "AdobeReader-Pro", "Apple-Recovery"]
  },
  app: {
    legit: ["Microsoft Teams", "Slack", "Discord", "Outlook", "OneDrive", "Notion", "Zoom", "SharePoint", "Asana", "Linear", "Trello", "Photoshop", "Excel", "Word", "Spotify", "Steam", "Visual Studio Code", "Figma"],
    virus: ["Microsoft-Teams-update", "Slack-helper", "Outlook-recovery", "Teams-protect", "GoogleDocs-sync", "Photoshop-cracked", "Steam-refund", "Office365-restore"]
  },
  city: {
    legit: ["Stockholm", "Berlin", "Helsinki", "Oslo", "Copenhagen", "Tallinn", "Amsterdam", "Riga"],
    virus: ["New Tron", "Volgograd-7", "Crypto Falls", "Server Town", "Botnet Heights", "Phisherville", "Spamgrad"]
  },
  filename: {
    legit: ["Q4_Summary", "Annual_Report", "Resume_2026", "Project_Plan", "README", "Invoice_8821", "Meeting_Notes", "Backup_Final", "Budget_Q3", "design_v3"],
    virus: ["urgent_invoice", "winning_lottery", "tax_audit_2026", "package_track_388191", "ceo_request", "wire_transfer", "shared_doc", "Resume_2026.docx"]
  },
  filesize: {
    legit: ["1.2 GB", "84 KB", "256 MB", "4.5 MB", "38 MB", "12 GB", "640 KB", "1.8 MB", "512 MB", "76 KB"],
    virus: ["0 KB", "999 GB", "—", "0 B", "12 ZB", "—999 MB", "NULL"]
  },
  kb: {
    legit: ["KB5034441", "KB4474419", "KB5031356", "KB5028948", "KB5040442", "KB5039212", "KB5036893"],
    virus: ["KB0000001", "KB99999999", "KB-CRITICAL", "KB-EMERGENCY-2026", "KB777777"]
  },
  process: {
    legit: ["svchost.exe", "explorer.exe", "RuntimeBroker.exe", "dwm.exe", "services.exe", "spoolsv.exe", "lsass.exe", "csrss.exe", "winlogon.exe"],
    virus: ["sysclean.exe", "secure_helper.exe", "win_optimize.exe", "registry_doctor.exe", "antivirus_pro.exe", "system_repair.exe", "boot_fix.exe"]
  },
  ipaddr: {
    legit: ["192.168.0.42", "10.0.0.1", "172.16.0.5", "192.168.1.100", "10.10.0.27", "172.20.5.18"],
    virus: ["94.140.14.14", "185.220.101.42", "5.181.80.7", "203.0.113.42", "78.46.220.91", "62.210.55.18"]
  },
  game: {
    legit: ["Cyberpunk 2077", "Helldivers 2", "Stardew Valley", "Minecraft", "CS2", "Elden Ring", "Hades", "Baldur's Gate 3", "Fortnite", "Hollow Knight"],
    virus: ["FREE_GTA_VI_LEAK", "Roblox-Cheats-v9", "Minecraft-Helper", "Steam-Refund-Tool", "Fortnite-VBucks-Generator", "CS2-AimAssist"]
  },
  username: {
    legit: ["alex.k", "StandardUser", "jdoe", "sara_p", "m.dahl", "sixten", "lhansson"],
    virus: ["root", "admin", "system32", "Administrator", "SYSTEM", "su"]
  },

  // ---- Flat pools (same values regardless of virus/legit) ----
  department: ["Accounting", "Engineering", "HR", "Marketing", "Sales", "IT", "Legal", "Operations", "Finance", "Procurement", "DevOps"],
  name:       ["Sarah K.", "Alex Chen", "Maya Lindqvist", "Jordan Williams", "Sam Patel", "Casey Brown", "Riley Park", "Sven Bergstrom", "Mira Singh", "Tom Lee", "Eva Söderlund", "Hugo Andersson"],
  version:    ["4.21.7022", "22.06.1", "110.0.1587.41", "14.40", "3.8.6", "2025.05.01", "1.92.3", "115.0", "12.0.5"],
  ext:        [".docx", ".pdf", ".xlsx", ".jpg", ".png", ".zip", ".pptx", ".csv", ".txt", ".mp4"],
  driver:     ["Realtek HD Audio", "NVIDIA Display Driver", "Intel Graphics", "Logitech HID", "Bluetooth A2DP", "Synaptics Touchpad", "Realtek PCIe LAN", "ASMedia USB 3.2", "Intel Wi-Fi 6E"],
  port:       ["443", "80", "8080", "22", "3389", "53", "25", "587", "8443"],
  percent:    ["14%", "23%", "47%", "68%", "82%", "96%", "31%", "59%"],
  printer:    ["HP LaserJet M404", "Canon imageCLASS MF445", "Epson EcoTank ET-2820", "Brother HL-L3290CDW", "Xerox B225", "HP OfficeJet Pro 9015e", "Default Printer"],
  pagecount:  ["1", "2", "3", "5", "8", "12", "18", "24", "42"],
  alertword:  ["Warning", "Notice", "Alert", "Important", "Critical", "Urgent", "Update", "Reminder"],
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
  numfiles: {
    // Legit counts — what real Windows tools report (font counts, search index sizes, log entries, etc.)
    legit: ["47", "342", "1,042", "1,284", "1,847", "4,217", "4,821", "12,847", "84,221", "142,891", "284,932", "412,873"],
    // Virus counts — scary ransomware "your files are locked" numbers
    virus: ["8,441", "12,400", "12,882", "18,200", "18,442", "21,003", "31,082", "42,108", "65,704", "88,221"]
  },

  // PID values. Legit = ordinary 4-digit decimal PIDs. Virus = stylized
  // weirdness (zeros, hex, NULL, repeated digits) — a real Windows PID
  // would never be "NULL" or "0xDEAD".
  pid: {
    legit: ["1248", "4824", "6712", "3104", "8821", "2456", "9332", "5128", "7204", "3812", "1564", "8927"],
    virus: ["0", "0000", "7777", "9999", "0xDEAD", "NULL", "0xCAFE", "13371337", "0xBEEF00", "00000000", "∅"]
  },

  // Cloudflare-style Ray ID hex strings. Flat pool — both real and fake
  // CAPTCHAs reference these, so they're not a tell either way.
  ray: ["8a7c92f1", "9b3d4e21", "7c2f8a9d", "6e5b1c47", "4a9d2e8f", "8b3c5d9a", "9f2a7e1d", "5c4b8d2e", "7d8a3f9c", "6b1e9c4d", "3e8a1c2f"],

  // CAPTCHA / human-verification provider names. Legit = recognized services.
  // Virus = made-up brands that look "official" enough to fool people.
  captchaprov: {
    legit: ["Cloudflare", "Google reCAPTCHA", "hCaptcha", "Stripe Radar", "AWS WAF", "Akamai Bot Manager"],
    virus: ["VerifyHuman", "CaptchaPro", "RoboCheck", "QuickCAPTCHA", "HumanGuard", "CaptchaFix", "VerifyNow", "TrueHuman"]
  },

  // Phone numbers. Legit = country-formatted numbers. Virus = vanity scams
  // ("FAKE-MS") and obvious tells.
  phonenum: {
    legit: ["+46 70 123 45 67", "(555) 010-2847", "+1-800-555-0199", "+44 20 7946 0123", "(415) 555-0142"],
    virus: ["+1-800-FAKE-MS", "1-888-CRYPTO-NOW", "+880-2-FREE-MONEY", "PRESS 1 NOW", "+1-855-W1NDOWS"]
  },

  // Bank names. Legit = real banks. Virus = typo'd / vanity recovery domains.
  bank: {
    legit: ["SEB", "Handelsbanken", "Nordea", "Bank of America", "Chase", "Wells Fargo", "Barclays", "Swedbank"],
    virus: ["SE8-Bank", "B0fA-Recovery", "ChaseCustomerService", "WellsFargo-Verify", "Sw3dbank-Help", "Nord3a-Restore"]
  },

  // Email sender addresses. Same author intent → reads as official on a legit
  // card and obviously sketchy on a virus card.
  sender: {
    legit: ["it-support@company.com", "noreply@github.com", "billing@stripe.com", "no-reply@apple.com", "team@notion.so"],
    virus: ["support@micros0ft-help.pw", "ceo@your-company.tk", "billing@stripe-verify.live", "security@app1e.online", "admin@g00gle-recovery.xyz"]
  },

  // Browser names. Legit = real browsers. Virus = typo'd lookalikes.
  browser: {
    legit: ["Chrome", "Firefox", "Edge", "Safari", "Brave", "Arc"],
    virus: ["Chr0me", "FireF0x", "Edge-Recovery", "Safari-Update", "Brav3", "Chrome-Helper"]
  },

  // Geographic regions for "we noticed a login from…" notices. Legit = where
  // the user probably is. Virus = far-away places to trigger panic.
  region: {
    legit: ["Stockholm, SE", "Berlin, DE", "London, UK", "New York, US", "Helsinki, FI"],
    virus: ["Tashkent, UZ", "Vladivostok, RU", "Lagos, NG", "Bucharest, RO", "Yangon, MM", "Pyongyang, KP"]
  },

  // ---- Per-virus themed phrase pools. When used in a virus card's title or
  //      message, the virus side resolves to a signature phrase the player can
  //      learn to recognize. VIRUS_TOKEN_EXPLANATIONS (in core.js) surfaces
  //      these as tells on the death screen. Sixten's request: "if it's static
  //      a name for the error could be TV Disconnected". ----
  staticphrase: {
    legit: ["TV Antenna", "Display Signal", "Display 2", "Cable Detected", "HDMI Connected"],
    virus: ["TV Disconnected!!!", "Signal Lost", "Channel 0 Static", "VHS Glitch", "Antenna Down", "Cable Out", "Broadcast Lost", "RF Interference"]
  },
  meltdownphrase: {
    legit: ["Thermal Status", "Fan Speed Normal", "CPU Cool", "Cooling OK"],
    virus: ["CPU MELTDOWN", "Thermal Critical", "Heat Emergency", "Silicon Damage", "Coolant Failure", "Motherboard Burning"]
  },
  voidphrase: {
    legit: ["Storage OK", "Allocation Fine", "Disk Space"],
    virus: ["∅ Allocation", "Void Sector", "NULL Pointer", "0 Bytes Used", "Compressing to NULL", "Entropy Reclaimed"]
  },
  epilepticphrase: {
    legit: ["Display Refresh", "Pixel Test", "Monitor OK"],
    virus: ["STROBE EMERGENCY!!!", "Display Flash!!!", "Refresh STUCK!!!", "Pixel CALIBRATION!!!", "Monitor SYNC LOST!!!"]
  },
  cryptexphrase: {
    legit: ["Backup Complete", "Vault Open", "Files Secure"],
    virus: ["FILES ENCRYPTED", "Vault Locked", ".crypt Extension", "Ransom Notice", "Decryption Required", "Pay To Unlock"]
  },
  rootkitphrase: {
    legit: ["Driver Signed", "Secure Boot ON", "Kernel OK"],
    virus: ["Kernel Compromised", "Disable Secure Boot", "Ring 0 Access", "MBR Modified", "Unsigned Driver Required"]
  },
  wormphrase: {
    legit: ["Single File", "Local Only", "No Replication"],
    virus: ["Spreads to 14 Shares", "Network-Wide Copy", "Self-Replicating", "Forwarded to Contacts", "Mass-Mailing"]
  },
  assistantphrase: {
    legit: ["AI Suggestion", "Smart Tip", "Recommendation"],
    virus: ["I noticed an issue", "Based on my analysis", "I prepared a fix", "I may make mistakes", "Confidence: 99%"]
  }
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
  update:   "warning",
  email:    "blank",
  ransom:   "warning",
  idiot:    "warning"
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
