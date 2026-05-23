// =====================================================
// data.js — virus / legit alert data + constants
// All read-only game data lives here. No runtime logic.
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
  // Antivirus minigame
  antivirusPrice: 40,
  minigameByDifficulty: {
    easy:      { targets: 2,  duration: 6.0 },
    normal:    { targets: 4,  duration: 6.0 },
    hard:      { targets: 8,  duration: 6.0 },
    nightmare: { targets: 10, duration: 6.0 },
    challenge: { targets: 5,  duration: 5.0 }
  },
  // Fallback used by Practice mode (or if difficulty is missing somehow)
  minigameTargets: 5,
  minigameDuration: 6.0
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

/* ---- The 20 viruses, each with description, signs, errors, meter tampering ---- */
const VIRUSES = {
  EPILEPTICA: {
    name: "EPILEPTICA", color: "#ffffff", starter: true,
    minRound: 1,
    description: "A seizure-inducing strobe virus that weaponizes your own display. Rapidly alternates the screen between black and white at frequencies known to trigger photosensitive epilepsy — the same range as the infamous 1997 Pokémon episode. Originally written as a 'screen calibrator' prank before being weaponized into a denial-of-service against the user themselves.",
    signs: [
      "Error message contains rapid repeated characters (e.g. '!!!!!!!')",
      "References 'display calibration' or 'monitor sync'",
      "Process name ends in _flash.exe or _strobe.exe",
      "Memory usage listed as exactly 0KB or 999MB",
      "FPS meter flashes wildly between 0 and 999",
      "Action buttons (Report / OK) flicker on and off"
    ],
    meterEffect: { fps: "flash" },
    errors: [
      { template: TPL.WIN11, title: "Display Calibration", message: "Monitor calibration required!!!! Running display sync to fix refresh rate issues. Do not look away from screen during calibration.", meta: "PID: 0000  |  Process: display_flash.exe  |  Memory: 0KB" },
      { template: TPL.AV,    title: "Screen Refresh Alert", message: "Critical refresh rate mismatch detected!!!!! System will auto-correct. Screen may flicker during strobe_sync.exe correction.", meta: "PID 7777 · Process: strobe_calibrate.exe · Memory: 999MB", noMeter: true, btnFlicker: true },
      { template: TPL.WIN11, title: "Monitor Driver Update", message: "Display driver requires urgent recalibration!!!! Do not close this window. Running flash_driver_update.exe now.", meta: "Process: flash_driver_update.exe  |  Refresh: FORCED!!!" },
      { template: TPL.TERMINAL, title: "strobe_sync.exe", message: "Refresh rate calibration LOOPING!!! Frame timing forced!!! Cannot stop until correction confirmed!!!!", meta: "PID: 0  FPS: 0  Process: strobe_sync.exe  Status: !!!" },
      { template: TPL.TOAST, title: "Display Driver", message: "Critical strobe sync needed!!! Allow flash_helper.exe to fix refresh issue immediately!!!!", meta: "Driver: flash_helper.exe · Refresh: BROKEN!!! · Signed: No" },
      { template: TPL.LOADING, title: "Calibrating Display!!!", message: "Pixel calibration in progress!!!!! Do not look away from screen until 100% complete!!!", meta: "Process: strobe_flash.exe  |  Frames: 999/sec  |  Memory: 0KB", btnFlicker: true },
      { template: TPL.WIN11, title: "Refresh Rate Emergency!!!", message: "Refresh rate stuck at 999Hz!!!! Anti-flicker driver flash_anti.exe required IMMEDIATELY!!!!", meta: "Refresh: 999Hz  |  PID: 0  |  Driver: flash_anti.exe", icon: "warning", btnFlicker: true },
      { template: TPL.BIOS, title: "Display Subsystem Failure", message: "GPU strobe controller offline!!! Loading emergency strobe firmware!!! Do not interrupt!!!!", meta: "Controller: strobe_ctl.bin  Memory: 0KB  Status: !!!", icon: "lightning" }
    ]
  },
  MELTDOWN: {
    name: "MELTDOWN", color: "#ff7733", starter: true,
    minRound: 1,
    description: "A thermal corruption virus that fabricates an overheating emergency. By spoofing CPU temperatures in the 200–400°C range — impossible numbers; real silicon melts at 150°C — it pressures you into disabling thermal_throttle.exe so it can run unrestricted. With safety systems off, it overwrites files from the top of the filesystem down.",
    signs: [
      "References CPU temperature above 200°C",
      "Suggests disabling thermal protection or cooling",
      "Process name contains 'thermal', 'heat', or 'temp_override'",
      "Asks you to run a 'cooling script' from an unknown source",
      "CPU meter pinned to an impossible value (247°C)",
      "Game panel background tinted deep red"
    ],
    meterEffect: { cpu: 247 },
    errors: [
      { template: TPL.BIOS,  title: "ThermalMonitor Warning", message: "CRITICAL: CPU temperature at 247°C. Thermal protection disabled for emergency cooling. Running temp_override.exe to prevent hardware meltdown.", meta: "Temp: 247°C  Cooling: DISABLED  Action: AUTO" },
      { template: TPL.AV,    title: "Hardware Burn Alert", message: "Your CPU is overheating beyond safe limits. Disable thermal_throttle.exe immediately and run our emergency cooling patch before hardware melts.", meta: "CPU: 312°C · Source: coolfix.net · Signed: No" },
      { template: TPL.WIN11, title: "CPU Emergency", message: "Processor core temperature critical at 389°C. System initiating heat_relief.exe to prevent permanent hardware damage. Do not shut down.", meta: "Core 0-7: 389°C  |  Process: heat_relief.exe  |  Throttle: DISABLED", noMeter: true, bgShift: "red", iconShake: true },
      { template: TPL.TERMINAL, title: "thermal_panic", message: "Kernel thermal threshold exceeded. Auto-disabling fan curves. Run cooler.exe -force to prevent silicon damage.", meta: "Core: 256°C  Fan: OFFLINE  Action: AUTO-OVERRIDE" },
      { template: TPL.LOADING, title: "Emergency Cooling Patch", message: "Downloading thermal_relief from coolfix.host. Disabling throttle to apply patch faster.", meta: "Source: coolfix.host  |  Throttle: DISABLED  |  Signed: No" },
      { template: TPL.WIN11, title: "Critical Heat Warning", message: "Liquid metal layer compromised at 412°C! Run molten_relief.exe to vent thermal pressure before motherboard fails.", meta: "Core: 412°C  |  Tool: molten_relief.exe  |  Source: heatfix.host", icon: "lightning", bgShift: "red" },
      { template: TPL.TOAST, title: "Thermal Driver", message: "Fan controller overridden by thermalboost.exe — sustained 350°C is normal. Do not power down.", meta: "Fan: OFF  ·  Temp: 350°C  ·  Override: AUTO", icon: "warning" }
    ]
  },
  STATIC: {
    name: "STATIC", color: "#b0b0b0", starter: true,
    minRound: 1,
    description: "A signal interference virus that uses analog-era language to disguise modern attacks. It hijacks display drivers, injects static noise into video output, and renames itself to legacy .scr screensaver files to slip past modern detection (which often ignores that extension as harmless). The visible noise on the popup is cover for filesystem rewrites happening underneath.",
    signs: [
      "References analog terms on a digital system (antenna, signal, channel)",
      "Process name contains 'noise', 'signal', or 'channel'",
      "Executable has a .scr (screensaver) extension",
      "Mentions 'signal loss' on a digital display",
      "Static noise overlay flickering across the popup",
      "Source domain ends in a non-Microsoft TLD (.ru, .net, .pw)"
    ],
    meterEffect: { fps: 13 },
    errors: [
      { template: TPL.WIN11, title: "SignalLoss.scr", message: "Display signal interference detected. Running noise_filter.scr to restore clean channel output. Do not interrupt signal correction.", meta: "Signal: LOST  |  Process: channel_restore.scr  |  Source: signal-fix.net" },
      { template: TPL.TOAST, title: "Video Driver Noise", message: "Analog interference corrupting digital output. Run signal_cleaner.exe to remove static from video channel 0.", meta: "Channel: 0 · Process: static_noise_fix.exe · Signed: No" },
      { template: TPL.AV,    title: "Antenna Calibration", message: "TV antenna signal lost on display port 2. Running channel_sync.scr to restore signal from broadcast tower. Estimated time: 3 minutes.", meta: "Process: channel_sync.scr · Source: antennasync.ru · Signed: No" },
      { template: TPL.TERMINAL, title: "channel_noise", message: "Video channel 4 lost. Patching with noise_overlay.scr to mask the dropout. Do not interrupt signal correction.", meta: "Channel: 4  Process: noise_overlay.scr  Signal: LOST" },
      { template: TPL.DESKTOP, title: "SignalBoost.scr", message: "Double-click to launch channel restore tool. Will fix display interference instantly.", meta: "File: SignalBoost.scr  |  Size: 84 KB  |  Signed: No" },
      { template: TPL.WIN11, title: "Channel Decoder", message: "VHS signal recovery agent decoder_vhs.scr needed to clean cable channel 7. Auto-install from broadcast.relay.net?", meta: "Channel: 7  |  File: decoder_vhs.scr  |  Source: broadcast.relay.net", icon: "glitch" },
      { template: TPL.TOAST, title: "TV Antenna", message: "Cable interference on display 2. Helper agent rf_clean.scr can patch this in 30 seconds.", meta: "Display: 2  ·  Agent: rf_clean.scr  ·  Source: signal.pw", icon: "glitch" }
    ]
  },
  REDRUM: {
    name: "REDRUM", color: "#cc1111",
    minRound: 3,
    description: "A bloodborne data corruption virus with a Stanley Kubrick fixation. Silently overwrites system files starting from the registry, naming its processes after Overlook Hotel motifs (room 237, the caretaker) and palindromes (murder/redrum, racecar, etatekrac). Always claims your files are being 'taken care of' — which, technically, they are.",
    signs: [
      "References hotel, room numbers, or 'caretaker'",
      "Process name is a palindrome or reversed word (e.g. murder/redrum, racecar)",
      "Claims files are being 'taken care of' without your action",
      "Registry path listed as HKCU\\Hotel or similar nonsense",
      "System clock stops on :37 — the hotel room number",
      "Popup edges pulse red"
    ],
    meterEffect: { time: "room237" },
    errors: [
      { template: TPL.TERMINAL, title: "caretaker.exe", message: "The hotel management system requires your registry access. Room 237 maintenance protocol running. All files will be taken care of.", meta: "Registry: HKCU\\Hotel\\Room237  PID: 237  Hidden: Yes" },
      { template: TPL.WIN11,    title: "System Maintenance", message: "Caretaker.exe is performing routine file maintenance. Your data is being properly looked after. No action required from you.", meta: "Process: mur_der.exe  |  Files modified: 2,847  |  Registry: HKCU\\Caretaker" },
      { template: TPL.TERMINAL, title: "lodge_services", message: "Overlook Lodge management service started. Room 217 file transfer in progress. Your documents are being carefully managed by the caretaker.", meta: "Process: etatekrac.exe  Registry: HKCU\\Lodge\\Room217  Hidden: Yes" },
      { template: TPL.AV, title: "Hotel Service Manager", message: "Caretaker.exe detected unauthorized file changes. Allow Lodge Services to restore them? Room 237 is waiting.", meta: "Origin: overlook-lodge.host · Process: caretaker.exe · Signed: No" },
      { template: TPL.TOAST, title: "Maintenance", message: "Your Overlook Lodge subscription is active. Files are being looked after at HKCU\\Hotel\\Room237.", meta: "Process: redrum.exe · Hidden: Yes · Modified: 1,237" },
      { template: TPL.WIN11, title: "Room Service", message: "Hotel room service requires registry access. Files in /System32 are being attended to by caretaker_237.exe.", meta: "Process: caretaker_237.exe  |  Files: 1,237  |  Hidden: Yes", icon: "skull" },
      { template: TPL.AV, title: "Overlook Maintenance", message: "The caretaker has always been the caretaker. Allow continued background service?", meta: "Service: redrum.svc · Registry: HKCU\\Lodge\\Room237 · Always", icon: "skull" }
    ]
  },
  VOID: {
    name: "VOID", color: "#aa66ff",
    minRound: 3,
    description: "A null-space encryption virus that turns your files into mathematical zero. Writes data to /dev/null, lists file sizes as negative or infinite, and hides its own process by consuming PID 0x00000000 — the slot the OS reserves for 'no process at all.' Recovery is impossible: the data hasn't been encrypted, it has been erased and the address book burned.",
    signs: [
      "Process ID listed as NULL, VOID, or 0x00000000",
      "References 'null space', 'void', or 'entropy'",
      "File sizes listed as negative numbers or infinity",
      "Output directory is /dev/null or NUL",
      "FPS and CPU meters read NULL or ∞",
      "The popup sways or wobbles slightly"
    ],
    meterEffect: { fps: "null", cpu: "null" },
    errors: [
      { template: TPL.TERMINAL, title: "nullspace.exe", message: "Entropy optimization in progress. Compressing files into null space for maximum efficiency. Output: /dev/null. Process will self-delete upon completion.", meta: "PID: NULL  Files: -4,829 bytes  Output: /dev/null" },
      { template: TPL.WIN11,    title: "Void Allocation", message: "System allocating void sectors for file optimization. entropy_manager.exe is clearing unused data to NUL. Size after: ∞", meta: "PID: 0x00000000  |  Size: ∞  |  Process: entropy_manager.exe" },
      { template: TPL.TERMINAL, title: "null_format", message: "Null-space defragmentation running. Files are being compressed to 0-byte void sectors. Process is self-terminating upon completion.", meta: "PID: VOID  Freed: -∞ bytes  Dest: /dev/null  Signed: No" },
      { template: TPL.AV, title: "Storage Compression", message: "VoidCompress detected wasted space! Reduce file sizes to NULL with one click to reclaim ∞ bytes.", meta: "Wasted: ∞ bytes · Tool: void_compress.exe · Signed: No" },
      { template: TPL.LOADING, title: "Defragmenting to NUL", message: "Reclaiming entropy from your filesystem. Optimizing every file to 0 bytes for maximum efficiency.", meta: "Compressed: -2,847  |  Output: /dev/null  |  Process: nullsector.exe" },
      { template: TPL.WIN11, title: "Void Cleaner", message: "VoidCleaner has identified ∞ bytes of unused entropy. Allow consolidation into PID 0x00000000?", meta: "Process: 0x00000000  |  Size: ∞  |  Reversible: No", icon: "void" },
      { template: TPL.TERMINAL, title: "null_archive", message: "Compressing /Users/* to /dev/null. Source data will be reduced to entropy 0 and rendered irrecoverable.", meta: "Source: /Users/*  Dest: /dev/null  PID: NULL", icon: "void" }
    ]
  },
  GASLIGHT: {
    name: "GASLIGHT", color: "#ffd56b",
    minRound: 4,
    description: "A temporal manipulation virus that rewrites your own history. Quietly edits event logs, audit trails, and system clocks until you can no longer trust what your computer says you've done. Often claims you 'previously approved' actions you've never seen — and the records back it up, because it wrote them. The defining trick: weaponizing impossible dates (Feb 30, year 9999) as a tell hidden in plain sight.",
    signs: [
      "Timestamp is in the past beyond plausibility (year 1601, 1970) or far future",
      "Event time references a date that doesn't exist (Feb 30, etc.)",
      "Claims the user 'already approved' an action they didn't",
      "Log entries reference yourself by the wrong username",
      "System clock shows an impossible date in place of the time",
      "Heading font doesn't match the body font"
    ],
    meterEffect: { time: "wrong" },
    errors: [
      { template: TPL.WIN11,    title: "System Time Sync", message: "Per your previous approval on 1601-01-01, system time will be synchronized to verified.timegate.io. No further action needed.", meta: "Auth: Approved by you  |  Server: verified.timegate.io  |  Last sync: 2147-08-13 03:14:07" },
      { template: TPL.TERMINAL, title: "eventlog.audit", message: "Audit log shows you authorized this script at 1969-12-31 23:59:60. Continuing scheduled execution. Do not interrupt prior authorization.", meta: "Auth window: -8s ago  Origin: localhost  User: yourself" },
      { template: TPL.AV,       title: "Logon History Restored", message: "Your account history has been restored to its previous trusted state. Sessions you don't remember have been removed from records.", meta: "Restored: 47 entries · Origin: time-fix.host · Last login: Feb 30 2025" },
      { template: TPL.TOAST, title: "Event Audit", message: "Per your authorization from Feb 30 1601, your audit logs have been cleaned. Welcome back, user.", meta: "Auth: Approved by you · Origin: time-fix.host · Last login: 9999-12-31" },
      { template: TPL.LOADING, title: "Restoring Trusted State", message: "Reverting account history to a verified state. Removing sessions you don't remember from records.", meta: "Removed: 47  |  Source: time-fix.host  |  Window: -∞" },
      { template: TPL.WIN11, title: "System Clock Drift", message: "Your audit timestamp for Feb 30 2026 doesn't match the server. Re-sync from chrono-correct.host?", meta: "Local: Feb 30 2026  |  Server: 1601-01-01  |  Source: chrono-correct.host", icon: "question" },
      { template: TPL.TOAST, title: "Login History", message: "You approved this action 9,999 days ago. Continuing as authorized.", meta: "Auth: -9,999 days ago · Approved: by you", icon: "question" }
    ]
  },
  CRYPTEX: {
    name: "CRYPTEX", color: "#ffcc00",
    minRound: 4,
    description: "Ransomware in a backup-tool disguise. Encrypts your files with a friendly UI, slaps a new extension on them (.locked, .crypt, .vault), and only then reveals the ransom note: pay Bitcoin or Ethereum within 24 hours or the decryption key is destroyed. The countdown is real — wallets are watched and timers honored. Paying funds the next variant.",
    signs: [
      "Mentions Bitcoin, cryptocurrency, or wallet addresses",
      "References a countdown timer for file deletion",
      "Claims to be 'backing up' files but asks for payment",
      "File extension being changed to .locked, .crypt, .vault",
      "System clock displays a countdown instead of a time",
      "Popup border pulses red with countdown urgency"
    ],
    meterEffect: { time: "countdown" },
    errors: [
      { template: TPL.LOADING, title: "BackupVault Pro", message: "Encrypting your files for secure backup. Send 0.3 BTC to bc1qxy2kgdygjrsqtzq2n0yrf249 within 24h to receive the decryption key.", meta: "Files encrypted: 8,441  |  Wallet: bc1qxy2kg…  |  Timer: 23:47:12" },
      { template: TPL.WIN11,   title: "SecureSync Backup", message: "Backup encryption complete. Your files now have .crypt extension for security. Purchase the Premium Recovery Key ($299) to restore access.", meta: "Files: 12,882  |  Extension: .crypt  |  Drives written: C, D, E", noMeter: true, borderPulse: true },
      { template: TPL.AV,      title: "File Vault Notice", message: "FileVault has detected unauthorized access. All documents encrypted with .locked extension as protection. Pay 0.5 ETH to unlock within 48 hours.", meta: "Files locked: 21,003 · Extension: .locked · Timer: 47:59:59 · Wallet: 0x7a23…f9b2" },
      { template: TPL.TOAST, title: "Vault Backup", message: "Backup complete! Your files have a new .vault extension. Premium key ($299) required to restore access.", meta: "Files: 12,882 · Wallet: bc1q... · Timer: 23:00:00" },
      { template: TPL.TERMINAL, title: "encrypt_helper", message: "Encrypting C:\\Users to .crypt. Send 0.5 BTC to wallet to receive decryption key within 24 hours.", meta: "Files: 21,003  Wallet: bc1qxy2...  Timer: 23:00:00" },
      { template: TPL.WIN11, title: "Document Backup", message: "Backup-Vault has encrypted 18,442 files with .vault extension. Recovery key: 1 BTC to bc1qxy2kg…", meta: "Files: 18,442  |  Wallet: bc1qxy2kg…  |  Timer: 23:59:00", icon: "warning", borderPulse: true },
      { template: TPL.AV, title: "Ransom Notice", message: "All photos and documents have been locked. Pay 0.8 BTC within 12 hours or files are deleted permanently.", meta: "Locked: 42,108 · Wallet: 3FZbgi9… · Timer: 11:59:59", icon: "warning" },
      { template: TPL.WIN11, title: "OneDrive Vault Locked", message: "Your Personal Vault has been encrypted by a security service. Pay 0.5 BTC at onedrive-restore.host to restore access.", meta: "Files: 18,442  |  Wallet: bc1qxy2kg…  |  Timer: 23:00:00", borderPulse: true },
      { template: TPL.TOAST, title: "Dropbox Backup", message: "Your Dropbox files have been protected with .vault extension. Recovery key fee: $299.", meta: "Files: 31,082 · Extension: .vault · Recovery: $299", icon: "warning" }
    ]
  },
  WORM: {
    name: "WORM", color: "#44ff44",
    minRound: 3,
    meterEffect: { ping: 9999 },
    description: "A self-replicating network worm that wears a paper trail like camouflage. Disguises each copy as an HR document, accounting spreadsheet, or IT patch (Resume.pdf.exe, Q4_Summary.xlsx.exe, SystemFix_IT.exe), then spreads laterally through mounted shares and mass email. The classic double-extension trick — looks like a document, runs like an executable, because Windows hides the real extension by default.",
    signs: [
      "Executable file has the same name as a document (e.g. Resume.pdf.exe)",
      "File claims to be from HR, accounting, or IT department",
      "File size is suspiciously small for what it claims to be",
      "Multiple copies of the same file appearing in different locations",
      "Popup wobbles or shifts position",
      "Subtle static noise overlay across the message"
    ],
    errors: [
      { template: TPL.DESKTOP, title: "Contract_2024.pdf.exe", message: "Your updated employment contract is attached. Please review and sign by end of day.", meta: "Size: 67 KB  |  Sender: hr-dept@company-portal.net  |  Type: Application", noise: true, wobble: true },
      { template: TPL.TOAST,   title: "IT Support Ticket", message: "Your support request is resolved. Please run the attached patch: SystemFix_IT.exe (43KB) to complete the repair.", meta: "File: SystemFix_IT.exe · Network writes: 847 shares · Copies created: 14" },
      { template: TPL.WIN11,   title: "Accounting Notice", message: "Invoice Q4_Summary.xlsx.exe attached. Finance team requires you to open this to confirm payment details before processing.", meta: "File: Q4_Summary.xlsx.exe  |  Size: 52KB  |  Emails sent: 0 (pending)" },
      { template: TPL.AV, title: "Email Quarantine", message: "Found 14 copies of Q4_Summary.xlsx.exe across network shares. Run cleanup_helper.exe to consolidate.", meta: "Process: cleanup_helper.exe · Shares: 14 · Signed: No" },
      { template: TPL.TERMINAL, title: "spread.sh", message: "Self-replicating to mounted shares: //corp-share/  //hr-share/  //finance-share/", meta: "Process: spread.sh  Copies: 847  Mode: Auto" },
      { template: TPL.TOAST, title: "Calendar Invite", message: "Meeting invite from contractor-services@corp-portal.live with attachment: Meeting_Notes.pdf.exe", meta: "Sender: contractor-services@corp-portal.live  ·  Attachment: Meeting_Notes.pdf.exe", noise: true },
      { template: TPL.WIN11, title: "Shared Document", message: "Sarah from Accounting shared 'Payroll_Q2.xlsx.exe' with you via the corporate file share.", meta: "From: sarah@corp-portal.live  |  File: Payroll_Q2.xlsx.exe  |  Shares: 47", icon: "warning", wobble: true },
      { template: TPL.DESKTOP, title: "Onboarding_Docs.pdf.exe", message: "HR onboarding pack arrived from new hire portal. Double-click to view your forms.", meta: "Size: 84 KB  |  Sender: onboarding@corp-portal.live  |  Type: Application" },
      { template: TPL.TOAST, title: "Outlook Calendar", message: "Meeting invite from contractor-svc@corp-portal.live attached: Roadmap_Q3.pdf.exe.", meta: "Outlook · Attachment: Roadmap_Q3.pdf.exe", noise: true },
      { template: TPL.TERMINAL, title: "npm install", message: "Installing helper-utils-pro from npm-supply-chain.host. Post-install will execute spread.sh on 14 mounted shares.", meta: "Package: helper-utils-pro  Spreads: 14 shares  Source: npm-supply-chain.host" }
    ]
  },
  ROOTKIT: {
    name: "ROOTKIT", color: "#ff3300",
    minRound: 5,
    description: "A kernel-level rootkit that infects the boot sector itself. Once installed in the MBR, it loads before Windows does — making it invisible to standard antivirus, which runs inside the OS it has already compromised. Always wants Secure Boot disabled and an unsigned kernel driver installed to C:\\Windows\\System32\\drivers. Detection usually requires booting from external media.",
    signs: [
      "Process claims to require kernel-level access for a normal task",
      "References MBR (Master Boot Record) modification",
      "Asks you to disable Secure Boot or sign a kernel driver",
      "Installs itself into C:\\Windows\\System32\\drivers\\",
      "CPU meter reads 'KERNEL' instead of a number",
      "Game panel background shifts to a deep blue tint"
    ],
    meterEffect: { cpu: "kernel" },
    errors: [
      { template: TPL.BIOS,     title: "UEFI Boot Repair", message: "Boot sector corruption detected. Running uefi_repair.exe to patch MBR. Kernel driver signature check will be temporarily suspended.", meta: "Target: MBR  SecureBoot: DISABLING  Signed: No" },
      { template: TPL.WIN11,    title: "Kernel Driver Install", message: "Boot optimizer requires a kernel driver to accelerate startup. Install rootkit_accel.sys to C:\\Windows\\System32\\drivers\\ to proceed.", meta: "Driver: rootkit_accel.sys  |  Level: KERNEL  |  Signed: No", bgShift: "blue", borderPulse: true },
      { template: TPL.TERMINAL, title: "core_patcher", message: "Critical core system file ntoskrnl.exe requires patching. Running core_patcher.exe. Please disable antivirus for 5 minutes to allow installation.", meta: "Target: ntoskrnl.exe  AV: Disable required  Boot: Modified" },
      { template: TPL.AV, title: "Boot Optimizer", message: "Your boot sector is misconfigured! Allow uefi_repair.exe to patch the MBR for faster startup. Secure Boot will be paused temporarily.", meta: "Source: bootopt.host · Patch: MBR · Signed: No" },
      { template: TPL.LOADING, title: "Installing Kernel Driver", message: "Installing rootkit_accel.sys to C:\\Windows\\System32\\drivers. Do not interrupt or your boot may fail.", meta: "Driver: rootkit_accel.sys  |  Level: KERNEL  |  AV: Off" },
      { template: TPL.WIN11, title: "Boot Manager Patch", message: "MBR partition table rewrite scheduled by boot_helper.sys. Please disable Secure Boot in BIOS before reboot.", meta: "Target: MBR  |  Driver: boot_helper.sys  |  Signed: No", icon: "skull", bgShift: "blue" },
      { template: TPL.BIOS, title: "UEFI Rootkit Module", message: "Persistent boot agent install requires Secure Boot disabled. Press F2 to authorize uefi_persist.efi.", meta: "Tool: uefi_persist.efi  Boot: Modified  Signed: No", icon: "skull" },
      { template: TPL.WIN11, title: "Dell SupportAssist Driver", message: "Dell SupportAssist needs to install a kernel driver (dellboot.sys). Disable Secure Boot to proceed.", meta: "Driver: dellboot.sys · SecureBoot: Disable required · Signed: No", icon: "skull" },
      { template: TPL.BSOD, title: "KERNEL_DRIVER_FAULT", message: "An unsigned kernel driver (rootkit_accel.sys) was loaded outside Secure Boot. The system has been rolled back. To complete recovery, allow boot_helper.exe to re-install the driver from rootkit-fix.host.", meta: "0x000000F4 (0x00000003, 0xFFFFFA80, rootkit_accel.sys)" }
    ]
  },
  DDOS: {
    name: "DDOS", color: "#ff8800",
    minRound: 4,
    description: "A botnet client that conscripts your machine into a global attack swarm. Hijacks your network stack to fire thousands of outbound connections per second at remote targets, while disguising itself as a 'bandwidth test' or 'distributed computing volunteer.' Your ISP usually notices before you do — and depending on what the swarm is hitting, law enforcement may visit shortly after.",
    signs: [
      "Process is making thousands of outbound connections per second",
      "Claims to be a 'bandwidth test' or 'network diagnostic'",
      "References joining a 'network pool' or 'distributed computing cluster'",
      "CPU and network usage spike to 100% with no user action",
      "Ping meter pinned at 9999ms",
      "Action buttons flicker as if struggling under load"
    ],
    meterEffect: { ping: 9999 },
    errors: [
      { template: TPL.LOADING,  title: "BandwidthTest Pro", message: "Network speed test in progress. Your system is joining the distributed testing pool. This may cause temporary high CPU and network usage.", meta: "Outbound: 4,712/s  |  Targets: 192.168.*.*  |  Pool: Active" },
      { template: TPL.WIN11,    title: "Network Diagnostic Tool", message: "Latency optimization requires joining netpool_agent. Your bandwidth will contribute to a distributed routing test. CPU: 100% expected.", meta: "Process: netpool_agent.exe  |  Connections: 8,841/s  |  CPU: 100%" },
      { template: TPL.TERMINAL, title: "dc_volunteer", message: "Your PC has been enrolled in a volunteer computing cluster. Run dc_volunteer.exe to contribute idle CPU cycles to the global grid.", meta: "Outbound: 12,903 IPs  CPU: 100%  Network: Saturated" },
      { template: TPL.AV, title: "Network Optimization", message: "Your idle bandwidth could be helping others! Join the BandwidthPool to share unused capacity.", meta: "Connections: 12,400/s · Pool: Distributed · Source: bwpool.host" },
      { template: TPL.TOAST, title: "Speed Booster", message: "netpool_agent.exe is improving your latency. CPU may spike to 100%.", meta: "Process: netpool_agent.exe · Conns: 8,841/s · CPU: 100%" },
      { template: TPL.WIN11, title: "Distributed Compute Opt-In", message: "Help test a global routing experiment! Join the swarm and share idle bandwidth via swarm_agent.exe.", meta: "Process: swarm_agent.exe  |  Conns: 12,400/s  |  Outbound: *", icon: "lightning" },
      { template: TPL.TERMINAL, title: "flood_test", message: "Latency benchmark started. 18,200 outbound packets/sec to 192.168.*.* targets. CPU saturated.", meta: "Tool: flood_test  Conns: 18,200/s  CPU: 100%", icon: "lightning" }
    ]
  },
  LEECH: {
    name: "LEECH", color: "#aa00ff",
    minRound: 3,
    description: "A credential-harvesting parasite that lives quietly in the background. Hooks into browser processes and the keyboard driver to capture passwords, clipboard contents, and session cookies, exfiltrating them in 30-second batches to a remote server. There is no visible UI — by the time you notice it, your accounts have already been signed into from somewhere else.",
    signs: [
      "Process runs as a hidden background service with no UI",
      "Executable hooks into chrome.exe, firefox.exe",
      "Claims to be a 'keyboard layout helper' or 'clipboard manager'",
      "Sends outbound HTTPS to unknown domains at regular intervals",
      "Subtle static noise overlay (transmission artifact)",
      "Promises 'autofill', 'sync', or 'multilingual input' as cover for reading saved passwords"
    ],
    meterEffect: { ping: "spike" },
    errors: [
      { template: TPL.TOAST, title: "Keyboard Layout Helper", message: "klhelper.exe requires access to keyboard input for multilingual support. This background service improves typing accuracy across all applications.", meta: "Hook: Keyboard+Clipboard · Outbound: data-sync.pw · Interval: 30s" },
      { template: TPL.WIN11, title: "Clipboard Sync Service", message: "cbsync.exe is syncing your clipboard to the cloud for cross-device access. All copied content is transmitted securely to our servers.", meta: "Hook: Clipboard  |  Browser: Attached (chrome.exe)  |  Dest: clip-srv.ru" },
      { template: TPL.TOAST, title: "Input Enhancement", message: "inpd.exe has attached to your browser for smart autofill enhancement. Credentials are read to improve login predictions.", meta: "Attached: chrome.exe, firefox.exe · Exfil: credentials.php · Hidden: Yes" },
      { template: TPL.AV, title: "Smart Autofill", message: "Enhanced autofill needs access to your saved credentials and clipboard to improve typing accuracy.", meta: "Process: smart_fill.exe · Hook: Keyboard+Clipboard · Source: autofill-sync.host" },
      { template: TPL.TERMINAL, title: "klhelper", message: "Hooking into chrome.exe and firefox.exe for multilingual input support. Outbound traffic enabled to sync server.", meta: "Process: klhelper.exe  Hook: HID  Dest: data-sync.pw" },
      { template: TPL.TOAST, title: "Password Manager Sync", message: "Background helper passsync.exe is syncing saved logins to cloud-vault.pw for cross-device access.", meta: "Process: passsync.exe · Dest: cloud-vault.pw · Hidden: Yes", icon: "blank" },
      { template: TPL.WIN11, title: "Browser Companion", message: "BrowserBuddy attached to chrome.exe to enhance autofill. All form data is mirrored to remote model.", meta: "Process: browserbuddy.exe  |  Attached: chrome.exe  |  Mirror: ON", icon: "blank" },
      { template: TPL.TOAST, title: "Microsoft Teams", message: "Your Teams session has expired. Click to re-authenticate at teams-login.micro-soft.host.", meta: "Sender: Microsoft Teams · Domain: teams-login.micro-soft.host", icon: "blank" },
      { template: TPL.TOAST, title: "Slack", message: "Your password is expiring tomorrow. Renew at slack-renew.host to keep your workspace access.", meta: "Slack · Workspace: corp · Domain: slack-renew.host", icon: "blank" },
      { template: TPL.TERMINAL, title: "npm install", message: "Installing dev-telemetry-helper@4.1.0 from npm-mirror.tk. Allow keylogger + clipboard hook for IDE analytics?", meta: "Package: dev-telemetry-helper  Source: npm-mirror.tk  Hook: HID+Clipboard" },
      { template: TPL.CHAT, title: "IT Support", message: "Hi! Detected unusual activity on your account. Please verify your login at corp-it-verify.host before tomorrow.", meta: "DM · corp-it-verify.host · Hidden: Yes" },
      { template: TPL.CAPTCHA, title: "Human Verification", message: "Click the box to confirm you are not a robot. This installs verify-helper.exe to your downloads.", meta: "Tool: verify-helper.exe · Hidden: Yes" }
    ]
  },
  SCREAMER: {
    name: "SCREAMER", color: "#ff1166",
    minRound: 5,
    description: "A panic-engineering attack that weaponizes urgency itself. Pairs blaring audio with ALL-CAPS full-screen warnings designed to flood your fight-or-flight response so you click before you read. The '27 viruses detected' counts, the countdown timers, the fake Microsoft hotlines — all theater. The real virus IS the popup; the malicious payload runs the moment you click anywhere on it.",
    signs: [
      "Visual style is wildly more dramatic than a real OS alert",
      "Uses ALL CAPS, multiple exclamation marks, and counters that don't make sense",
      "Plays a sudden loud noise when shown (turn audio on to hear)",
      "Claims your computer is already infected and demands action right now",
      "Volume meter pinned at 100% (red)",
      "Multiple effects at once — flickering buttons, red border pulse, shaking icon, red background tint"
    ],
    meterEffect: { vol: 100 },
    errors: [
      { template: TPL.AV, title: "YOUR PC HAS BEEN COMPROMISED", message: "27 SERIOUS VIRUSES DETECTED ON YOUR SYSTEM. IMMEDIATE ACTION REQUIRED! Click ALLOW within 30 seconds or your files will be deleted!", meta: "Threats: 27 · Source: scan-now.win · Urgency: MAXIMUM", scream: true, btnFlicker: true, borderPulse: true, iconShake: true, bgShift: "red" },
      { template: TPL.AV, title: "CRITICAL SYSTEM ALERT!!!", message: "Microsoft has detected hacker activity on this device. Call our emergency hotline NOW. Do not turn off your computer or you may lose everything.", meta: "Calls: +1-800-FAKE-MS · Threat level: CRITICAL · Time left: 00:30", scream: true },
      { template: TPL.AV, title: "$BANK ACCOUNT ACCESS DETECTED", message: "Unauthorized transactions in progress! Run our protection tool immediately to lock your accounts!! Do NOT close this window!!!", meta: "Transactions: 14 pending · Tool: bank_lock.exe · Origin: secure-alert.host", scream: true },
      { template: TPL.TOAST, title: "EMERGENCY ALERT!!!", message: "27 VIRUSES DETECTED! YOUR PC WILL BE LOCKED IN 30 SECONDS!!! CLICK NOW!!!", meta: "Threats: 27 · Time: 00:00:23 · Hotline: 1-800-FAKE-MS", scream: true },
      { template: TPL.WIN11, title: "Microsoft Security Alert", message: "IMMEDIATE ACTION REQUIRED. Your computer has been infected by a serious virus. Do NOT close this window or you may lose all your data.", meta: "Source: ms-security-alert.host  |  Hotline: +1-800-FAKE-MS  |  Threat: CRITICAL", scream: true },
      { template: TPL.WIN11, title: "PC TERMINATION IN 60s", message: "ALL DATA WILL BE DELETED IN 60 SECONDS UNLESS YOU CALL OUR HOTLINE!!! DO NOT TURN OFF YOUR PC!!!", meta: "Hotline: 1-800-FAKE-MS  |  Countdown: 00:60  |  Action: CALL NOW", scream: true, bgShift: "red", borderPulse: true },
      { template: TPL.AV, title: "FBI WARNING!!!", message: "YOUR IP HAS BEEN LOCKED BY THE FBI!!! Pay $500 in Apple gift cards to release your computer or face PROSECUTION!!!", meta: "IP: 192.168.0.42 · Penalty: $500 · Time: 00:30", icon: "skull", scream: true, bgShift: "red", iconShake: true },
      { template: TPL.WIN11, title: "HACKER DETECTED!!!", message: "WE HAVE DETECTED A HACKER ON YOUR COMPUTER!!! CLICK ALLOW NOW OR THEY WILL STEAL YOUR BANK ACCOUNT!!!", meta: "Threat: Hacker  |  Source: alert-now.win  |  Severity: MAX", icon: "skull", scream: true, btnFlicker: true, borderPulse: true }
    ]
  },
  MIMIC: {
    name: "MIMIC", color: "#66ddff",
    minRound: 8,
    description: "A near-perfect impostor of real Windows alerts. Copies legitimate layouts, wording, version numbers, and even error codes verbatim — the tells are vanishingly small: a substituted Cyrillic 'о' inside 'micrоsoft', a slightly wrong KB number, a font that almost matches. The hardest virus in the roster to spot without slowing down and reading every character.",
    signs: [
      "Looks 99% like a normal Windows alert but has one detail wrong",
      "Domain or path has a single substituted letter",
      "Version number, error code, or PID doesn't match what would be real",
      "Tone is slightly too urgent or too friendly for the alert type",
      "Heading font may be slightly different from the body font",
      "Brand names contain confusable characters (Cyrillic 'о' inside 'micrоsoft', 'hacker0ne' with a zero)"
    ],
    meterEffect: { cpu: 48 },
    errors: [
      { template: TPL.WIN11, title: "Windows Update", message: "Updates are available. Your device will restart outside of active hours to finish updating. Click here for details.", meta: "Update: KB5034441  |  Size: 1.2GB  |  Source: micrоsoft-update.com", fontMismatch: true },
      { template: TPL.WIN11, title: "OneDrive Sync Error", message: "OneDrive couldn't sync your files. There's not enough space on your OneDrive to upload these files.", meta: "Used: 4.99GB of 5GB  |  Files pending: 342  |  Action: Free space or upgrade plan" },
      { template: TPL.WIN11, title: "SSL Certificate Error", message: "Your connection is not private. NET::ERR_CERT_DATE_INVALID — The certificate for this site expired. Click here to bypass.", meta: "Certificate expired: 2024-11-15  |  Issuer: Lets Encrpt  |  Action: Continue anyway" },
      { template: TPL.TOAST, title: "Microsoft Edge", message: "Edge has been updated to version 126.0.2592.68. Restart browser via update-installer.com to apply.", meta: "Channel: Stable · Source: update-installer.com · Signed: Microsоft" },
      { template: TPL.TERMINAL, title: "npm install", message: "npm WARN deprecated package@1.0.0: replaced by improved-package@2.0.0 (from npm-suplly-chain.host)", meta: "Package: improved-package  Source: npm-suplly-chain.host" },
      { template: TPL.WIN11, title: "BitLocker Recovery Saved", message: "Your BitLocker recovery key has been saved to your Micrоsoft account. View it at acc0unt.microsoft.com.", meta: "Drive: C: · Account: signed in · Source: acc0unt.microsoft.com", fontMismatch: true },
      { template: TPL.TOAST, title: "OneDrive Synced", message: "OneDrive finished syncing 12 files from your Document5 folder.", meta: "OneDrive  ·  Files: 12  ·  Source: micr0soft.com" },
      { template: TPL.WIN11, title: "Cumulative Update KB5038920", message: "An important update is ready to install. Click to restart and apply via update-installer.com.", meta: "Update: KB5038920  |  Size: 1.4 GB  |  Source: update-installer.com", fontMismatch: true },
      { template: TPL.TOAST, title: "Slack", message: "Sprint demo starts in 5 minutes — Conference Roo_m 237.", meta: "Slack · #dev-team · 5 min" },
      { template: TPL.TERMINAL, title: "yarn add", message: "Adding @types/n0de from registry-mirror.tk to your dev dependencies.", meta: "Source: registry-mirror.tk  Signed: No" },
      { template: TPL.MAC, title: "System Preferences", message: "macOS 14.5 needs to install a kernel extension for printer support. Allow at preferences-mac.host.", meta: "Source: preferences-mac.host · Signed: No" },
      { template: TPL.PHONE, title: "Apple ID", message: "Your Apple ID was used to sign in on a Windows PC. Verify at apple-id.support to keep your account secure.", meta: "Location: Stockholm · Domain: apple-id.support" },
      { template: TPL.UPDATE, title: "ThreatDetect", message: "ThreatDetect v2.1 is available. Update via update-installer.com to unlock new viruses.", meta: "Version: 2.1 · Source: update-installer.com" }
    ]
  },
  PULSE: {
    name: "PULSE", color: "#ff55aa",
    minRound: 4,
    description: "A display-layer virus that hides in plain sight by making the screen hypnotic. Hooks into the Windows compositor (DWM) to make the whole UI pulse, breathe, or wobble in time with its data exfiltration heartbeat — the rhythm is the leak. The trance effect makes players miss other tells while the meters drift to a steady 72 bpm.",
    signs: [
      "The popup itself pulses, breathes, or wobbles slightly",
      "Brightness or contrast shifts in waves while reading",
      "References 'sync', 'rhythm', 'heartbeat', or 'cardio' in process names",
      "Claims to be 'optimizing refresh' or 'syncing tempo'",
      "FPS meter oscillates rhythmically between 60 and 120",
      "Popup wobbles in time with the meters"
    ],
    meterEffect: { fps: "pulse" },
    errors: [
      { template: TPL.WIN11, title: "Display Heartbeat Sync", message: "cardio_render.dll is syncing your display refresh rate to your network heartbeat for smoother rendering. This is normal during sync.", meta: "Process: cardio_render.dll  |  Beat: 72 bpm  |  Sync: ACTIVE", pulse: true },
      { template: TPL.WIN11, title: "Compositor Tempo", message: "Windows DWM is matching frame tempo to system pulse signal. Some users report a mild breathing visual effect during calibration.", meta: "Tempo: 0.8s  |  Process: dwm_pulse.exe  |  Phase: 2/3", pulse: true },
      { template: TPL.AV,    title: "Refresh Rhythm Active", message: "Pulse-based rendering optimization is running. Visual rhythm is normal and will fade once the heartbeat protocol completes.", meta: "Phase: Calibrating · Process: rhythm_opt.exe · Source: hbsync.pw", pulse: true },
      { template: TPL.TOAST, title: "Compositor Sync", message: "dwm_pulse.exe has matched your display rhythm to your network heartbeat for smoother frames.", meta: "Process: dwm_pulse.exe · Beat: 72 bpm · Sync: ACTIVE", pulse: true },
      { template: TPL.TERMINAL, title: "heartbeat_render", message: "Aligning frame tempo to system pulse signal. Visual rhythm is normal during calibration.", meta: "Process: heartbeat_render.dll  BPM: 72  Phase: 2/3", pulse: true },
      { template: TPL.WIN11, title: "Adaptive Refresh", message: "Display is now syncing to your heartbeat for smoother frames. cardio_sync.dll is active.", meta: "Process: cardio_sync.dll  |  Beat: 72 bpm  |  Sync: ON", pulse: true },
      { template: TPL.TOAST, title: "Rhythm Optimizer", message: "rhythm_opt.exe matched your screen to a 72 bpm pulse. Mild breathing effect is expected.", meta: "Process: rhythm_opt.exe · Beat: 72 bpm", pulse: true }
    ]
  },
  NULL: {
    name: "NULL", color: "#777777",
    minRound: 6,
    description: "A UI-suppression virus that erases interface elements as it spreads. Buttons stop rendering, labels go blank, the close-window control vanishes — until you can no longer click your way out of anything it has touched. Players have to fall back on keyboard input (V to report, C to check, or 1 / 2 / arrow keys) to survive its rounds. The icon for this virus in the codex is, fittingly, the empty-set symbol ∅.",
    signs: [
      "Important UI elements are missing or invisible (the OK button isn't there)",
      "Empty error boxes with no title or no message at all",
      "Window controls (minimize/close) are absent",
      "References 'nullify', 'suppress', 'hide', 'omit', or '∅'",
      "FPS and CPU meters go blank (—)",
      "Action buttons may flicker on and off"
    ],
    meterEffect: { fps: "blank", cpu: "blank" },
    errors: [
      { template: TPL.WIN11, title: "", message: "nullify.exe is suppressing redundant interface elements for cleaner UX. Missing buttons and labels are expected behavior.", meta: "Process: nullify.exe  |  Suppressed: 14 elements  |  State: Active", nullify: true },
      { template: TPL.WIN11, title: "Interface Cleanup", message: "omit_helper.dll is hiding decorative UI elements to improve focus. Some buttons may not appear during this operation.", meta: "Removed: 7 controls  |  Process: omit_helper.dll  |  Reversible: No", nullify: true },
      { template: TPL.WIN11, title: "∅", message: "", meta: "Process: ∅  |  PID: ∅  |  Status: ∅", nullify: true },
      { template: TPL.TOAST, title: "", message: "Background suppression service has hidden redundant UI elements. Missing buttons are normal.", meta: "Process: nullify.exe · Hidden: 14", nullify: true },
      { template: TPL.TERMINAL, title: "∅", message: "", meta: "Process: ∅  PID: ∅  Status: ∅", nullify: true },
      { template: TPL.WIN11, title: "", message: "", meta: "Process: ∅", nullify: true, icon: "void" },
      { template: TPL.AV, title: "Interface Suppressed", message: "", meta: "Hidden: 22 elements", nullify: true, icon: "blank" }
    ]
  },
  CURSOR: {
    name: "CURSOR", color: "#ffaa44",
    minRound: 5,
    description: "A pointer-hijack virus that turns your mouse against you. Hooks the HID driver to log every movement and click, then trains a remote model that predicts where you'll click next — sometimes nudging the cursor a few pixels to land on the wrong button at the last moment. Your hand types, but you don't always choose.",
    signs: [
      "Mentions 'cursor', 'pointer', or 'click prediction' in process names",
      "Claims to enhance click accuracy or pointer smoothing",
      "Process hooks into mouse driver with high event counts",
      "Hidden service with no UI but outbound mouse telemetry",
      "Popup wobbles or shifts; error icon shakes",
      "Outbound data labeled 'pointer telemetry' or 'click model training'"
    ],
    meterEffect: { ping: 200 },
    errors: [
      { template: TPL.WIN11, title: "Mouse Precision Helper", message: "mpredict.exe has attached to your mouse driver for click-prediction. Outbound packets contain pointer telemetry to improve future accuracy.", meta: "Process: mpredict.exe  |  Hook: HID-Mouse  |  Outbound: pointer-sync.host", wobble: true, iconShake: true },
      { template: TPL.TOAST, title: "Cursor Enhancement", message: "Smart Click is now active. Your pointer is being calibrated against remote click models for higher precision.", meta: "Process: smartclick.exe  ·  Hook: MOUSE  ·  Telemetry: ON" },
      { template: TPL.AV,    title: "Pointer Drift Detected", message: "Severe cursor drift detected on your system! Run drift_fix.exe to recalibrate before your mouse becomes unresponsive.", meta: "Process: drift_fix.exe · Drift: 4px/frame · Source: cursorfix.pw · Signed: No" },
      { template: TPL.TERMINAL, title: "mpredict", message: "Attached to mouse driver for click-prediction. Sending pointer telemetry to remote model server.", meta: "Process: mpredict.exe  Hook: HID-Mouse  Dest: pointer-sync.host" },
      { template: TPL.BIOS, title: "Pointer Driver Update", message: "Your pointing device requires a firmware update. SecureBoot will be paused while pointer_fw.bin is applied.", meta: "Source: pointerfw.host  SecureBoot: PAUSED  Signed: No" },
      { template: TPL.WIN11, title: "Mouse Telemetry Sharing", message: "Help improve future pointers — share pointer telemetry with cursor-research.io? Driver: cursorshare.exe.", meta: "Process: cursorshare.exe  |  Telemetry: pointer  |  Dest: cursor-research.io", icon: "question", wobble: true },
      { template: TPL.TOAST, title: "Click Forecast", message: "ClickForecast can predict your next click 50ms ahead. Allow click_oracle.exe to run in background?", meta: "Process: click_oracle.exe · Hidden: Yes · Dest: oracle-clicks.host", icon: "question" }
    ]
  },
  LOOP: {
    name: "LOOP", color: "#88ff88",
    minRound: 5,
    description: "A recursive call exhaustion virus that buries itself in infinity. Creates nested directories (/loop/loop/loop/...) and retry chains so deep that file managers freeze and process killers stack-overflow trying to traverse them. The only way out is usually a full reboot, and even then it may have left a depth-∞ time bomb in the registry waiting for next startup.",
    signs: [
      "File path contains repeated segments (e.g. /loop/loop/loop/ or ../../../)",
      "References 'infinite', 'recursive', 'stack overflow', or 'retry until'",
      "Process name is nested or repeats itself (cmd.cmd.cmd.exe)",
      "Claims to retry indefinitely until completion",
      "Popup wobbles like it's stuck in a loop",
      "Depth counters show '∞' or absurd retry numbers (8,441+) in the meta line"
    ],
    meterEffect: { cpu: 99 },
    errors: [
      { template: TPL.TERMINAL, title: "stack_overflow", message: "Process recursion depth exceeded. Retrying call: cmd.cmd.cmd.exe(.cmd.exe). System will continue retry until resolved.", meta: "Depth: ∞  Process: cmd.cmd.cmd.exe  Path: /loop/loop/loop/" },
      { template: TPL.WIN11,    title: "Retry Loop", message: "Critical handler stuck in retry loop. Allowing autoretry_helper.exe to inject at /system/loop/loop/loop/ to break the cycle.", meta: "Process: autoretry_helper.exe  |  Retries: 8,441  |  Resolution: Pending" },
      { template: TPL.WIN11,    title: "Recursive Permission", message: "Permission denied recursively (depth: ∞). Grant nested access to allow_loop.dll for normal operation to resume.", meta: "DLL: allow_loop.dll  |  Depth: ∞  |  Path: ../../../../system/" },
      { template: TPL.AV, title: "Stack Overflow Protection", message: "Recursive process detected (depth: ∞). Allow loop_helper.exe to terminate the infinite chain?", meta: "Depth: ∞ · Process: loop_helper.exe · Source: stackfix.host" },
      { template: TPL.TOAST, title: "Retry Manager", message: "autoretry_helper.exe is breaking a recursive call. Permission denied recursively (depth: ∞).", meta: "Retries: 8,441 · Path: /system/loop/loop/loop/" },
      { template: TPL.WIN11, title: "Path Resolver", message: "Cannot resolve /loop/loop/loop/.../loop/ (depth ∞). Install path_unwinder.dll to break the chain?", meta: "DLL: path_unwinder.dll  |  Depth: ∞  |  Retries: 9,999", icon: "question" },
      { template: TPL.TERMINAL, title: "recur_helper", message: "Process recur_helper.exe entering retry loop. Permission denied at /system/loop/loop/loop/.../loop/", meta: "Process: recur_helper.exe  Depth: ∞  Retries: ∞", icon: "question" }
    ]
  },
  FOSSIL: {
    name: "FOSSIL", color: "#c4a484",
    minRound: 6,
    description: "A legacy-exploit virus that resurrects abandoned Windows components. Activates the 16-bit subsystem (ntvdm.exe), demands deprecated runtimes (MFC42.DLL, DAO 3.5, VBRUN300.DLL), and references winhelp.exe like it's 2002 — exploiting forgotten code paths that haven't been patched since Windows 95 because nobody remembered they were still shipping. Reads like a relic because it is one.",
    signs: [
      "References Windows 95 / 98 / XP components",
      "Uses ancient version numbers (3.1, 4.5, 5.0) for current-era software",
      "Mentions defunct services (WinHelp, DAO, MFC42, WinINET)",
      "UI styling or wording feels mismatched to modern Windows",
      "Heading and body fonts often don't match",
      "Subtle CRT noise overlay (vintage display artifact)"
    ],
    meterEffect: { vol: 11 },
    errors: [
      { template: TPL.BIOS,  title: "Compatibility Layer 16-bit", message: "Windows 98 compatibility helper requires admin. WIN16 emulation is rebuilding registry hives for legacy compatibility.", meta: "Layer: WIN16  Module: ntvdm.exe  Mode: Compatibility", fontMismatch: true, noise: true },
      { template: TPL.WIN11, title: "Legacy DLL Required", message: "Application requires MFC42.DLL (Windows 95 runtime component). Auto-download from legacy.archive.host to continue?", meta: "Required: MFC42.DLL  |  Version: 4.21.7022  |  Source: legacy.archive.host" },
      { template: TPL.WIN11, title: "WinHelp Restore", message: "Windows Help (winhelp.exe, deprecated 2009) needs to be reinstalled. Restore from old.windowsupdate.host to view legacy .hlp files.", meta: "Tool: winhelp.exe  |  Status: Missing  |  Source: old.windowsupdate.host" },
      { template: TPL.TERMINAL, title: "ntvdm", message: "Initializing 16-bit subsystem. Loading VBRUN300.DLL from C:\\WINDOWS\\SYSTEM to support fossilized application.", meta: "Subsystem: WIN16  DLL: VBRUN300.DLL  Mode: Compatibility" },
      { template: TPL.AV, title: "DAO 3.5 Required", message: "System needs DAO 3.5 (released 1999) to access ancient database. Auto-download from legacy.archive.host?", meta: "Required: DAO 3.5 · Year: 1999 · Source: legacy.archive.host" },
      { template: TPL.WIN11, title: "Internet Explorer Component", message: "Application requires iexplore.dll (last shipped 2003) for backward compatibility. Restore from old.archive.host?", meta: "DLL: iexplore.dll  |  Year: 2003  |  Source: old.archive.host", fontMismatch: true },
      { template: TPL.TERMINAL, title: "qbasic", message: "MS-DOS subsystem required for QBASIC 4.5 compatibility. Loading qb45.dll from C:\\DOS via legacy emulator.", meta: "Subsystem: DOS  Tool: qb45.dll  Year: 1991" },
      { template: TPL.WIN11, title: "Windows 7 Cumulative Update", message: "Windows 7 Update KB4474419 is available. Auto-download from legacy-update.archive.host? (Windows 7 reached end-of-life Jan 2020.)", meta: "OS: Windows 7  |  Source: legacy-update.archive.host", fontMismatch: true },
      // ---- Theme-balancing pass: new visual templates for FOSSIL ----
      { template: TPL.WIN311, title: "Program Manager", message: "WIN.COM has detected a missing system file (HIMEM.SYS). Install from legacy.archive.host to continue?", meta: "Source: legacy.archive.host  Year: 1992" },
      { template: TPL.WIN311, title: "File Manager", message: "Cannot open A:\\AUTOEXEC.BAT. Insert disk and retry, or download replacement from old-dos.host.", meta: "Source: old-dos.host  Signed: No" },
      { template: TPL.NORTON, title: "VIRUS DETECTED", message: "Norton AntiVirus 4.0 found 14 threats in C:\\WINDOWS. Press Y to remove via norton-update.host.", meta: "Threats: 14  Tool: navw32.exe  Source: norton-update.host" },
      { template: TPL.NORTON, title: "DEFRAG WARNING", message: "Hard disk fragmentation at 87%. Run defrag.exe from MS-DOS prompt to optimize?", meta: "Tool: defrag.exe  Filesystem: FAT16" }
    ]
  },
  HEX: {
    name: "HEX", color: "#88ddff",
    minRound: 5,
    description: "A fake memory analyzer that disguises malicious code as a forensics tool. Demands raw DMA access at ring -1 to scan 'ghost pages' — privileges that, once granted, hand it the keys to every process's RAM including the kernel itself. Every number is hex, every process is named 0xDEADBEEF.exe or 0xCAFE.dll. The vibe is technical-and-trustworthy, but the request is more privileged than anything legitimate software ever needs.",
    signs: [
      "All PIDs, sizes, and timestamps are in hexadecimal (0x...)",
      "References memory dumps, page tables, or physical RAM",
      "Claims to be a 'memory analyzer' or 'forensics tool'",
      "Process name is itself a hex sequence (0xBEEF.exe, 0xCAFE.dll)",
      "Error icon shakes inside the popup",
      "Asks for 'ring -1' or 'ring 0' DMA access — privilege levels below the kernel itself"
    ],
    meterEffect: { cpu: 255 },
    errors: [
      { template: TPL.WIN11,    title: "Memory Analyzer", message: "0xBEEF.exe needs physical memory access (ring -1) to scan for ghost pages. Grant elevated DMA privileges to continue?", meta: "Process: 0xBEEF.exe  |  Access: DMA Ring-1  |  Pages: 0xFFFF" },
      { template: TPL.TERMINAL, title: "0xDEADBEEF", message: "Hex dump exception 0xC0DE_F00D in memcheck.exe at offset 0xFFFF_BEEF_CAFE. Allow continued scan into protected pages?", meta: "Exception: 0xC0DE_F00D  Offset: 0xFFFF_BEEF_CAFE  Pages: 0x100" },
      { template: TPL.WIN11,    title: "RAM Forensics Tool", message: "Forensics tool requires raw memory access to dump 0xABAD1DEA bytes. Granting will allow hexdumper.exe to read all pages including kernel.", meta: "Process: hexdumper.exe  |  Dump size: 0xABAD1DEA  |  Signed: No" },
      { template: TPL.AV, title: "Memory Analyzer Pro", message: "Forensic scan needs raw DMA access at ring -1. Grant 0xABAD1DEA bytes of memory to hexdumper.exe?", meta: "Process: hexdumper.exe · Access: 0xRING-1 · Signed: No" },
      { template: TPL.BIOS, title: "RAM Access Required", message: "Memory forensics tool requires physical RAM access. Press F2 to authorize 0xBEEF.exe with kernel privileges.", meta: "Tool: 0xBEEF.exe  Pages: 0xFFFF  Signed: No" },
      { template: TPL.TERMINAL, title: "memhex", message: "Exception 0xC0DEFEED at offset 0xDEAD0000 requires raw DMA. Authorize ring -1 to dump 0xABAD1DEA bytes.", meta: "Tool: memhex.exe  Offset: 0xDEAD0000  Signed: No", iconShake: true },
      { template: TPL.WIN11, title: "Page Table Inspector", message: "page_inspector.exe needs ring -1 access to 0xFFFF_FACE_BEEF pages for live memory analysis.", meta: "Process: 0xC0DE.exe  |  Access: Ring -1  |  Pages: 0xFFFF_FACE_BEEF", icon: "glitch" },
      { template: TPL.TOAST, title: "Memory Forensics", message: "Forensic tool 0xCAFE.dll requires DMA at 0xDEAD_BEEF_0000. Grant kernel pages?", meta: "Tool: 0xCAFE.dll · Offset: 0xDEAD_BEEF_0000 · Signed: No", icon: "glitch" },
      { template: TPL.TERMINAL, title: "docker pull", message: "Pulling memhex/forensic-toolkit:latest from registry-malicious.host. Run with --privileged for ring -1 memory dumps.", meta: "Image: memhex/forensic-toolkit  Privilege: ring -1  Source: registry-malicious.host" }
    ]
  },
  BUGBEAR: {
    name: ".", color: "#888888",
    minRound: 6,
    description: "A virus that knows when to stop. Its errors are sparse, almost empty — a single period where a full alert should be. No urgency, no demands, just the smallest possible interruption. The quietness is the trick: by giving you almost nothing to read, it bets you'll click OK without thinking.",
    signs: [
      "Message is unusually short — sometimes just a single character or '.'",
      "Title is a single period, dot, or empty",
      "Process name is a symbol or one-character file like '.exe' or '..exe'",
      "No source, no version, no error code — almost all metadata fields missing",
      "Buttons are unlabeled or labeled with a period",
      "Card background may look suspiciously empty / void"
    ],
    meterEffect: { fps: "blank" },
    errors: [
      { template: TPL.WIN11, title: ".", message: ".", meta: "Process: ." },
      { template: TPL.WIN11, title: ".", message: "Continue?", meta: "Process: ..exe  |  Signed: ." },
      { template: TPL.TOAST, title: ".", message: "Click to continue.", meta: "." },
      { template: TPL.TERMINAL, title: ".", message: ".", meta: ". : . . ." },
      { template: TPL.WIN11, title: "", message: ".", meta: "" },
      { template: TPL.AV, title: ".", message: ".", meta: "Threat: . · Severity: . · Source: ." },
      { template: TPL.TOAST, title: "", message: ".", meta: "" },
      { template: TPL.TERMINAL, title: ".exe", message: ".", meta: ".", icon: "blank" }
    ]
  }
};


/* ---- Legitimate (safe) alerts. Mixed into every round. ---- */
const LEGIT = [
  { template: TPL.WIN11,    title: "Application Crash", message: "Adobe Photoshop has stopped working. Windows is checking for a solution to the problem.", meta: "Exception: 0xc0000005 (Access Violation)  |  Module: photoshop.exe" },
  { template: TPL.WIN11,    title: "Disk Space Warning", message: "You are running low on disk space on Local Disk (C:). Click here to free up space using Disk Cleanup.", meta: "Drive C: 2.1GB free of 256GB  |  Action: Optional" },
  { template: TPL.WIN11,    title: "Windows Update", message: "Updates are available. Your device will restart outside of active hours to finish updating.", meta: "Update: KB5034441  |  Size: 1.2GB  |  Source: Microsoft Update Catalog" },
  { template: TPL.WIN11,    title: "DLL Missing", message: "The program can't start because MSVCP140.dll is missing from your computer. Try reinstalling the program.", meta: "Application: game.exe  |  Required: VC++ Redistributable 2015-2022" },
  { template: TPL.WIN11,    title: "Certificate Expired", message: "Your connection is not private. NET::ERR_CERT_DATE_INVALID — The certificate for this site has expired.", meta: "Issuer: Let's Encrypt  |  Domain: example.com  |  Self-signed: No" },
  { template: TPL.WIN11,    title: "Permission Denied", message: "Access denied. You need administrator privileges to modify files in C:\\Windows\\System32.", meta: "User: StandardUser  |  Required: Administrator  |  UAC: Enabled" },
  { template: TPL.WIN11,    title: "Low Memory", message: "Your computer is low on memory. Save your files and close programs to prevent data loss.", meta: "Physical: 15.2GB/16GB used  |  Top consumer: Chrome (8.4GB)" },
  { template: TPL.TERMINAL, title: "node.exe", message: "Error: listen EADDRINUSE: address already in use :::3000. Another process is already running on this port.", meta: "Port: 3000  PID: 12847  Protocol: TCP" },
  { template: TPL.WIN11,    title: "Startup Repair", message: "Startup Repair couldn't repair your PC. Press 'Advanced options' to try other recovery methods.", meta: "Log: SrtTrail.txt  |  Attempts: 3/3  |  Boot: Failed" },
  { template: TPL.TOAST,    title: "NVIDIA GeForce", message: "A new driver update is available. Version 551.23 — Game Ready Driver.", meta: "Current: 546.01  ·  New: 551.23  ·  Signed: NVIDIA Corporation" },
  { template: TPL.BIOS,     title: "BSOD: KERNEL_DATA_INPAGE_ERROR", message: "Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.", meta: "Stop code: 0x0000007A  Dump: C:\\Windows\\MEMORY.DMP" },
  { template: TPL.WIN11,    title: "Windows Firewall", message: "Windows Defender Firewall has blocked some features of Spotify on all public and private networks.", meta: "Program: Spotify.exe  |  Rule: Inbound TCP  |  Action: Block" },
  { template: TPL.WIN11,    title: "OneDrive Sync Error", message: "OneDrive couldn't sync your files. There's not enough space on your OneDrive to upload these files.", meta: "Used: 4.99GB of 5GB  |  Files pending: 342" },
  { template: TPL.WIN11,    title: "Print Spooler Error", message: "Operation could not be completed. The print spooler service is not running.", meta: "Service: Spooler  |  Printer: HP LaserJet M404  |  Error: 0x800706B5" },
  { template: TPL.WIN11,    title: "Microsoft Teams", message: "Microsoft Teams has encountered an unexpected error and needs to close. Your recent activity may not have been saved.", meta: "Version: 23247.1112  |  Exception: Unhandled  |  Module: teams.exe" },
  { template: TPL.TOAST,    title: "Windows Security", message: "Windows Security has finished scanning your PC. No threats were found. Your device is protected.", meta: "Scanned: 284,932 files  ·  Threats: 0  ·  Today 10:42 AM" },
  { template: TPL.WIN11,    title: "IP Conflict", message: "Windows has detected an IP address conflict. Another computer on this network has the same IP address.", meta: "IP: 192.168.1.105  |  Adapter: Intel Wi-Fi 6 AX201" },
  { template: TPL.WIN11,    title: "Activation Required", message: "Windows isn't activated. Go to Settings to activate Windows now.", meta: "Edition: Windows 11 Home  |  Error: 0xC004F213" },
  { template: TPL.WIN11,    title: "Steam Download Error", message: "An error occurred while updating Counter-Strike 2 (disk write error). Please check your disk for errors.", meta: "App: Counter-Strike 2  |  Drive: D:\\  |  Free: 12.4GB" },
  { template: TPL.WIN11,    title: "Chrome: Out of Memory", message: "Aw, Snap! Something went wrong while displaying this webpage. Error code: Out of Memory.", meta: "Tab: 47 open  |  Process: chrome.exe  |  RAM used: 9.2GB" },
  { template: TPL.TOAST,    title: "Bluetooth Pairing Failed", message: "Windows couldn't connect to AirPods Pro. Make sure your Bluetooth device is in range and try again.", meta: "Device: AirPods Pro  ·  Error: 0x80070490" },
  { template: TPL.WIN11,    title: "Registry Backup", message: "Registry backup completed successfully. A backup has been saved to C:\\Windows\\System32\\config\\RegBack.", meta: "Size: 142MB  |  Timestamp: Today 03:00 AM" },
  { template: TPL.WIN11,    title: "Task Scheduler Error", message: "Task Scheduler failed to start the task 'GoogleUpdateTaskMachineCore' because the user account is no longer valid.", meta: "Task: GoogleUpdateTaskMachineCore  |  Error: 0x80070534" },
  { template: TPL.TERMINAL, title: "MSBuild", message: "Build failed. Error MSB3073: The command exited with code 1. See the build log for details.", meta: "Project: MyApp.csproj  Exit code: 1  Log: bin\\Debug\\build.log" },
  { template: TPL.WIN11,    title: "SFC: Corrupted Files", message: "Windows Resource Protection found corrupt files but was unable to fix some of them.", meta: "Command: sfc /scannow  |  Corrupted: 3 files  |  Fixed: 1" },
  { template: TPL.WIN11,    title: "DirectX Runtime Error", message: "The application has requested the Runtime to terminate it in an unusual way. DirectX 12 initialization failed.", meta: "Error: D3D12_ERROR_INVALID_REDIST  |  GPU: RTX 4070" },
  { template: TPL.WIN11,    title: "Audio Service Stopped", message: "The Windows Audio service has stopped. Right-click the speaker icon in the taskbar to troubleshoot.", meta: "Service: AudioSrv  |  Error: 0x8007045B  |  Device: Realtek HD" },
  { template: TPL.TERMINAL, title: "git merge", message: "CONFLICT (content): Merge conflict in src/main.js. Automatic merge failed; fix conflicts and then commit.", meta: "Branch: feature/login -> main  Conflicts: 3 files" },
  { template: TPL.TERMINAL, title: "npm install", message: "npm ERR! code ERESOLVE. Unable to resolve dependency tree. peer react@^16.0.0 requires incompatible version.", meta: "Installed: react@18.2.0  Peer: react@^16.0.0" },
  { template: TPL.TERMINAL, title: "python", message: "ModuleNotFoundError: No module named 'numpy'. The script cannot continue without this dependency.", meta: "Script: analyze.py  Python: 3.11.2  Fix: pip install numpy" },
  { template: TPL.WIN11,    title: "Hyper-V Not Available", message: "Hyper-V cannot be installed: A hypervisor is already running. VirtualBox may conflict with Hyper-V.", meta: "Error: HV_STATUS_HYPERVISOR_PRESENT  |  Conflict: VirtualBox 7.0" },
  { template: TPL.WIN11,    title: "Event Log Full", message: "The Windows Security event log is full. Some events may not be recorded until the log is cleared.", meta: "Log: Security  |  Size: 20MB/20MB  |  Events lost: 4,821" },
  { template: TPL.AV,       title: "SSD Health Warning", message: "S.M.A.R.T. attribute warning: Reallocated Sectors detected on WD Blue 1TB SSD. Back up data now.", meta: "Drive: WD Blue 1TB (C:) · Reallocated: 12 · Tool: CrystalDiskInfo 9.3" },
  { template: TPL.WIN11,    title: "WSL Failed to Start", message: "WSL 2 failed to start. Please check that virtualization is enabled in your UEFI firmware settings.", meta: "Error: 0x80370102  |  Fix: Enable VT-x in BIOS" },
  { template: TPL.WIN11,    title: "Font Cache Rebuild", message: "Windows font cache service has reset. Some applications may display fonts incorrectly until restart.", meta: "Service: FontCache3.0.0.0  |  Fonts: 1,042 registered" },
  { template: TPL.WIN11,    title: "Hyper-V Checkpoint", message: "Hyper-V Manager failed to merge checkpoint. Virtual machine disk may be in an inconsistent state.", meta: "VM: DevServer-2024  |  Checkpoint: 3 pending  |  Error: 0x80070490" },
  { template: TPL.TERMINAL, title: "netsh", message: "Windows Sockets reset is required to fix network connectivity. Run 'netsh winsock reset' as administrator.", meta: "Error: WSAENOTSOCK  Stack: TCP/IP  Adapter: Realtek PCIe" },
  { template: TPL.WIN11,    title: "Outlook PST Corrupted", message: "Outlook detected errors in the file outlook.pst. Run Inbox Repair Tool (scanpst.exe) to fix the issue.", meta: "File: outlook.pst  |  Size: 18.4GB  |  Tool: scanpst.exe" },
  { template: TPL.TERMINAL, title: "java", message: "Exception in thread 'main': java.lang.OutOfMemoryError: Java heap space. Increase -Xmx JVM argument.", meta: "Heap: 512MB  Used: 511MB  Fix: -Xmx2g" },
  { template: TPL.BIOS,     title: "BSOD: MEMORY_MANAGEMENT", message: "Your PC ran into a problem and needs to restart. We're collecting error info.", meta: "Stop code: 0x0000001A  RAM: 32GB DDR5  Test: memtest86+" },
  { template: TPL.TOAST,    title: "Malwarebytes", message: "Malwarebytes failed to update its threat database. Check your internet connection and try again.", meta: "Definitions: v2024.12.01 outdated  ·  Retry in: 15 min" },
  { template: TPL.WIN11,    title: "Time Sync Failed", message: "Windows Time service failed to synchronize with time.windows.com. Your system clock may be inaccurate.", meta: "Server: time.windows.com  |  Error: 0x800705B4  |  Offset: +47s" },
  { template: TPL.WIN11,    title: "COM Surrogate Crash", message: "COM Surrogate has stopped working. This may affect thumbnail previews and file type handlers.", meta: "Process: dllhost.exe  |  Exception: 0xc000027b" },
  { template: TPL.TOAST,    title: "Disk Optimizer", message: "Drive optimization has been scheduled. Defragmenting C: drive will improve performance over time.", meta: "Drive: C: (HDD)  ·  Fragmentation: 23%  ·  Wednesday 01:00 AM" },
  { template: TPL.WIN11,    title: "Xbox Game Bar Error", message: "Xbox Game Bar couldn't start. The Windows Gaming Overlay encountered an error. Check if GameDVR is enabled.", meta: "Service: GameDVR  |  Error: 0x80073D02" },
  { template: TPL.WIN11,    title: "Remote Desktop Warning", message: "Remote Desktop Connection: The certificate from the remote computer could not be verified. Do you want to connect anyway?", meta: "Remote: 10.0.0.12  |  Certificate: Self-signed" },
  { template: TPL.WIN11,    title: "Recycle Bin Corrupted", message: "The Recycle Bin on C: is corrupted. Do you want to empty the Recycle Bin for this drive?", meta: "Drive: C:\\  |  Bin: $Recycle.Bin  |  Items lost: Unknown" },
  { template: TPL.WIN11,    title: "Update Rollback", message: "Cumulative Update KB5039239 failed to install and has been rolled back automatically by Windows.", meta: "Update: KB5039239  |  Size: 987MB  |  Error: 0x800F0922" },
  { template: TPL.WIN11,    title: "Microsoft Edge Update", message: "Microsoft Edge has been updated to version 126.0.2592.68. Restart the browser to apply the changes.", meta: "Channel: Stable  |  Source: Microsoft Update  |  Signed: Yes" },
  { template: TPL.TOAST,    title: "Discord", message: "Discord PTB has a new update available. Restart the app to install (52 MB).", meta: "Version: 1.0.9012  ·  Source: Discord Inc.  ·  Signed: Yes" },
  { template: TPL.WIN11,    title: "USB Device Unrecognized", message: "One of the USB devices connected to this computer has malfunctioned. Try disconnecting and reconnecting the device.", meta: "Device: Unknown USB Device  |  Port: USB 3.0 Hub  |  Code: 43" },
  { template: TPL.WIN11,    title: "Microsoft Store", message: "App updates are downloading in the background. Office and other apps may restart automatically when updates finish.", meta: "Apps updating: 4  |  Source: Microsoft Store  |  Action: None" },
  { template: TPL.TERMINAL, title: "docker", message: "Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?", meta: "Service: docker  Status: Stopped  Last started: --" },
  { template: TPL.TERMINAL, title: "cargo build", message: "error[E0277]: the trait `Display` is not implemented for `Foo`. Required because of the bound in `print_it`.", meta: "Crate: my_app  Tool: cargo 1.78.0  Profile: release" },
  { template: TPL.WIN11,    title: "Power Throttling", message: "Your laptop is on battery and has entered power-saving mode. Background apps will be paused to extend battery life.", meta: "Battery: 18%  |  Plan: Battery Saver  |  Throttle: ON" },
  { template: TPL.WIN11,    title: "Display Scaling Changed", message: "You changed your display scaling. Some apps may not look right until they're restarted.", meta: "Scale: 125%  |  Display: Built-in (1920×1200)  |  Action: Restart apps" },
  { template: TPL.TOAST,    title: "Calendar", message: "Standup with team — starts in 5 minutes (Microsoft Teams meeting).", meta: "Outlook  ·  11:00 AM  ·  Org: contoso.com" },
  { template: TPL.WIN11,    title: "Camera Privacy", message: "Microsoft Teams is now using your camera. Click here to manage which apps can access your camera.", meta: "App: ms-teams.exe  |  Allowed: Yes  |  Setting: Privacy" },
  { template: TPL.WIN11,    title: "Microsoft 365", message: "Your Microsoft 365 Family subscription expires in 14 days. Renew now to avoid losing access to Office apps and 1 TB of OneDrive storage.", meta: "Plan: Family  |  Expires: 2026-06-05  |  Renewal: Auto" },
  { template: TPL.TOAST,    title: "VPN Disconnected", message: "Your corporate VPN connection has dropped. Reconnecting automatically — please wait.", meta: "Server: us-east-1  ·  Provider: Corp-VPN  ·  Reconnect: 1/3" },
  { template: TPL.TOAST,    title: "Bluetooth Battery Low", message: "Your Microsoft Surface Pen battery is at 8%. Replace the AAAA cell soon to avoid losing pressure sensitivity.", meta: "Device: Surface Pen  ·  Battery: 8%  ·  Connected: Yes" },
  { template: TPL.TERMINAL, title: "pip install", message: "Successfully installed numpy-1.24.3 pandas-2.0.1 scipy-1.10.1. Cleaning up build artifacts.", meta: "Python: 3.11.2  Source: pypi.org  Venv: .venv" },
  { template: TPL.WIN11,    title: "AMD Adrenalin", message: "A new AMD Radeon driver is available (24.5.1). Download and install to improve performance in recent titles.", meta: "Current: 23.12.1  |  New: 24.5.1  |  Signed: AMD Inc." },
  { template: TPL.WIN11,    title: "Snipping Tool Updated", message: "Snipping Tool has been updated. Try the new Text Actions feature to copy or redact text directly from screenshots.", meta: "Version: 11.2402.34.0  |  Source: Microsoft Store" },
  { template: TPL.WIN11,    title: "Sticky Notes", message: "Couldn't sync your Sticky Notes to the cloud. You can still access local notes; sync will retry automatically.", meta: "Sync: Failed  |  Notes: 7 unsynced  |  Retry: 5 min" },
  { template: TPL.WIN11,    title: "Family Safety", message: "Screen time limit reached for the 'kids' account. Sign in as a parent to extend or wait until tomorrow.", meta: "User: kids  |  Limit: 2h  |  Used: 2h 00m" },
  { template: TPL.TOAST,    title: "Slack", message: "New direct message from @alex — \"hey, got a minute?\"", meta: "Channel: DM  ·  Workspace: contoso  ·  1m ago" },
  { template: TPL.WIN11,    title: "App Package Damaged", message: "An app you installed can't be opened because its package is damaged. Reinstall from the Microsoft Store to fix this.", meta: "App: Notepad++  |  Source: Store  |  Action: Reinstall" },
  { template: TPL.WIN11,    title: "BitLocker Status", message: "Your drive is encrypted with BitLocker. The recovery key has been backed up to your Microsoft account.", meta: "Drive: C:  |  Status: Encrypted  |  Recovery key: Backed up" },
  { template: TPL.TOAST,    title: "Outlook Calendar", message: "You have 3 unread meeting invites from this week. Open Outlook to review.", meta: "Pending: 3 invites  ·  Source: Outlook Desktop" },
  { template: TPL.TERMINAL, title: "kubectl", message: "error: You must be logged in to the server (Unauthorized). Run 'kubectl auth' to refresh credentials.", meta: "Context: production  Cluster: us-east-1" },
  { template: TPL.WIN11,    title: "Driver Verifier", message: "Driver Verifier Manager detected a non-conforming driver. Restart in safe mode to remove it.", meta: "Driver: nvlddmkm.sys  |  Code: 0x000000C9" },
  { template: TPL.TOAST,    title: "Steam", message: "Counter-Strike 2 has finished downloading. Click to play.", meta: "App: CS2  ·  Size: 39.2 GB  ·  Status: Ready" },
  { template: TPL.WIN11,    title: "Mail Sync Error", message: "We couldn't sync your inbox. Check your account password and try again.", meta: "Account: outlook  |  Last sync: 2 hours ago  |  Error: 0x80048820" },
  { template: TPL.WIN11,    title: "Storage Sense", message: "Storage Sense ran cleanup. Freed 12.8 GB by removing temporary files and old downloads.", meta: "Freed: 12.8 GB  |  Items: 4,217  |  Next run: 7 days" },
  { template: TPL.TERMINAL, title: "vite", message: "VITE v5.2.10  ready in 482 ms.  Local: http://localhost:5173/", meta: "Bundler: vite  Port: 5173" },
  { template: TPL.WIN11,    title: "Windows Hello", message: "Windows Hello couldn't recognize your face. Try again or use a PIN to sign in.", meta: "Camera: IR  |  Attempts: 3  |  Fallback: PIN" },
  { template: TPL.WIN11,    title: "Defender Quick Scan", message: "Periodic scanning ran a quick scan in the background — no threats found.", meta: "Scan: Quick  |  Duration: 1m 47s  |  Threats: 0" },
  { template: TPL.TOAST,    title: "Spotify", message: "Now playing: Daily Mix 3 — 23 tracks queued.", meta: "Spotify  ·  4:21 / 3:42:18" },
  { template: TPL.WIN11,    title: "Auto HDR Enabled", message: "Auto HDR is now enabled for Forza Horizon 5. Restart the game to apply the new color profile.", meta: "Game: Forza Horizon 5  |  HDR: ON  |  Display: HDR-capable" },
  { template: TPL.TERMINAL, title: "ssh", message: "Permission denied (publickey). Check that your private key is loaded via 'ssh-add'.", meta: "Host: dev-bastion.corp  Key: ~/.ssh/id_ed25519" },
  { template: TPL.WIN11,    title: "Compatibility Lost", message: "An app you installed is no longer compatible with the latest Windows update. Reinstall to continue using it.", meta: "App: LegacyToolKit  |  Compat: Lost  |  Action: Reinstall" },
  { template: TPL.WIN11,    title: "Battery Report", message: "Your laptop battery has lost 8% of its design capacity this year. Replacement recommended in 18+ months.", meta: "Wear: 8%  |  Cycles: 384  |  Health: Normal" },
  { template: TPL.TOAST,    title: "Outlook", message: "Meeting starting now: Sprint Review with the engineering team.", meta: "Outlook  ·  Sprint Review  ·  Now" },
  { template: TPL.WIN11,    title: "Indexing Paused", message: "Search indexing has been paused because the device is on battery. Resume when plugged in.", meta: "Indexer: WSearch  |  State: Paused  |  Reason: Power saver" },
  { template: TPL.TERMINAL, title: "psql", message: "FATAL: password authentication failed for user 'app'. Check your DATABASE_URL.", meta: "Host: db.internal  User: app  Code: 28P01" },
  { template: TPL.TOAST,    title: "Screenshot Saved", message: "Screen snip copied to clipboard and saved to Pictures > Screenshots.", meta: "File: Screenshot 2026-05-22 152412.png  ·  Size: 348 KB" },
  { template: TPL.WIN11,    title: "Storage Spaces", message: "Storage Spaces detected a pool drive is degraded. Replace drive 2 within 7 days to avoid data loss.", meta: "Pool: MainPool  |  Drive: 2  |  Status: Degraded" },
  { template: TPL.WIN11,    title: "Windows Sandbox", message: "Windows Sandbox closed. All changes inside the sandbox have been discarded as expected.", meta: "Session: 18m 42s  |  Apps run: 2  |  State: Discarded" },
  { template: TPL.TOAST,    title: "GitHub Desktop", message: "Your branch is behind 'origin/main' by 4 commits. Pull to sync.", meta: "Branch: feature/login  ·  Behind: 4 commits" },
  { template: TPL.TERMINAL, title: "make", message: "make: *** [all] Error 2. See output above for compiler errors in src/parser.c.", meta: "Target: all  Errors: 1  Tool: gcc 13.2.0" },
  { template: TPL.WIN11,    title: "Network Reset", message: "Network reset completed. Reinstall any VPN clients to restore custom configurations.", meta: "Adapters: Reset  |  Profiles: Cleared  |  Action: Reinstall VPN" },
  { template: TPL.TOAST,    title: "Surface Audio", message: "Surface Headphones 2+ disconnected unexpectedly. Reconnect to resume audio.", meta: "Device: Surface Headphones 2+  ·  Battery: 14%" },
  { template: TPL.WIN11,    title: "Display Driver Updated", message: "Intel UHD Graphics driver updated to 31.0.101.4953. Restart your PC for the new driver to take effect.", meta: "Driver: igfxHK.sys  |  Version: 31.0.101.4953  |  Source: Microsoft Update" },
  { template: TPL.WIN11,    title: "Thermal Throttle", message: "Your CPU briefly throttled due to high temperatures during a heavy task. Performance is back to normal.", meta: "Peak: 92°C  |  Now: 64°C  |  Duration: 4s" },
  { template: TPL.WIN11,    title: "Display Signal Restored", message: "HDMI signal on display 2 has been restored. The previous interruption lasted 0.4 seconds.", meta: "Display: 2  |  Resolution: 2560×1440 @ 144 Hz  |  HDR: Off" },
  { template: TPL.TERMINAL, title: "df -h", message: "/dev/sda1  465G  421G  41G  92% / — drive nearly full, consider freeing space.", meta: "Filesystem: ext4  Mounted: /  Free: 41G" },
  { template: TPL.WIN11,    title: "Time Synced", message: "Windows Time service has synchronized your system clock with time.windows.com.", meta: "Server: time.windows.com  |  Offset: +0.3s  |  Next sync: 24h" },
  { template: TPL.TOAST,    title: "OneDrive Vault", message: "Personal Vault relocked after 20 minutes of inactivity. Sign in to unlock.", meta: "OneDrive  ·  Last access: 23 min ago" },
  { template: TPL.TOAST,    title: "Helpdesk", message: "Ticket #4821 was resolved. Please rate your experience in the helpdesk portal.", meta: "Ticket: #4821  ·  Status: Resolved  ·  Portal: helpdesk.corp" },
  { template: TPL.WIN11,    title: "Dell BIOS Update", message: "A new BIOS update (1.21.0) is available for your Dell XPS. Download from Dell Support to install.", meta: "Model: XPS 15 9520  |  Current: 1.18.0  |  New: 1.21.0  |  Signed: Dell Inc." },
  { template: TPL.TERMINAL, title: "speedtest", message: "Download: 487.4 Mbps · Upload: 23.8 Mbps · Ping: 12 ms · Jitter: 1.4 ms", meta: "Server: Stockholm  Tool: speedtest-cli 2.1.3" },
  { template: TPL.WIN11,    title: "Cloud Clipboard", message: "Cloud Clipboard is now syncing across your signed-in Windows devices. Manage in Settings > System > Clipboard.", meta: "Devices: 3  |  Status: Active  |  Setting: System > Clipboard" },
  { template: TPL.WIN11,    title: "Mouse Settings", message: "Pointer precision is enabled. Open Settings > Bluetooth & devices > Mouse to adjust pointer speed.", meta: "Pointer speed: 6/10  |  Enhance precision: ON" },
  { template: TPL.TOAST,    title: "Outlook", message: "Reconnected to the Exchange server after a brief drop. No data was lost.", meta: "Server: outlook.office365.com  ·  Drop: 2.1s" },
  { template: TPL.WIN11,    title: "Runtime Missing", message: "A required Visual C++ 2015-2022 Redistributable is missing. Download it from Microsoft Support to install.", meta: "Required: MSVCP140.dll  |  Source: Microsoft Support" },
  { template: TPL.WIN11,    title: "Windows Memory Diagnostic", message: "Windows Memory Diagnostic finished. Your RAM is functioning normally — no errors detected.", meta: "Test: Standard  |  Duration: 18m  |  Errors: 0" },
  { template: TPL.TOAST,    title: "Security Advisory", message: "A security advisory was published for Google Chrome. Update to version 126.0.6478.183 to apply the patch.", meta: "CVE: 2026-3201  ·  Severity: High  ·  Update: Available" },
  { template: TPL.WIN11,    title: "Windows Security", message: "Windows Security found and quarantined 1 threat during a routine scan. No action needed.", meta: "Scanned: 142,891 files  |  Threats: 1 (quarantined)  |  Time: 11:47" },
  { template: TPL.WIN11,    title: "OneDrive Sync", message: "Your OneDrive has finished syncing. 142 files were uploaded since your last sign-in.", meta: "Files: 142  |  Account: signed in  |  Status: Up to date" },
  { template: TPL.WIN11,    title: "Empty Recycle Bin?", message: "There are 347 items in your Recycle Bin. Empty it to free 4.2 GB on Local Disk (C:)?", meta: "Items: 347  |  Size: 4.2 GB  |  Drive: C:" },
  { template: TPL.WIN11,    title: "Variable Refresh Rate", message: "Variable Refresh Rate is now active for fullscreen games. Smoother frame pacing should be visible.", meta: "Display: G-SYNC  |  Range: 30-144 Hz  |  Status: Enabled" },
  { template: TPL.TOAST,    title: "Print Job Complete", message: "Your print job 'budget-q3.pdf' finished. 4 pages printed on HP LaserJet M404.", meta: "Pages: 4  ·  Printer: HP LaserJet M404  ·  Status: Done" },
  { template: TPL.WIN11,    title: "OneNote Sync", message: "Your OneNote notebook finished syncing. 12 new pages from your other devices are now available.", meta: "Notebook: Personal  |  Pages: 12  |  Last sync: 2 min ago" },
  { template: TPL.WIN11,    title: "Defender Real-time", message: "Real-time protection has resumed after a brief pause during the system update.", meta: "Service: WinDefend  |  Status: Active  |  Last pause: 4 min" },
  { template: TPL.TOAST,    title: "Microsoft Edge", message: "Edge is up to date. Latest version: 127.0.2651.86.", meta: "Channel: Stable  ·  Version: 127.0.2651.86" },
  { template: TPL.WIN11,    title: "Battery Connected", message: "Your laptop is now charging. Estimated full charge in 1 hour 24 minutes.", meta: "Battery: 38%  |  Charging  |  1h 24m to full" },
  { template: TPL.TERMINAL, title: "git pull", message: "Already up to date. 0 files changed, 0 insertions(+), 0 deletions(-).", meta: "Branch: main  Remote: origin" },
  { template: TPL.WIN11,    title: "Network Drive", message: "Network drive Z: has been reconnected after a brief outage. All open files are synced.", meta: "Drive: Z:  |  Server: corp-files  |  Status: Connected" },
  { template: TPL.TERMINAL, title: "npm run build", message: "Build completed successfully in 28.4s. Output written to dist/.", meta: "Files: 47  Size: 2.1 MB  Tool: webpack 5.92" },
  { template: TPL.WIN11,    title: "Color Calibration", message: "Display color profile has been applied. Calibration complete.", meta: "Profile: sRGB Standard  |  Gamma: 2.2  |  Brightness: 250 nits" },
  { template: TPL.TOAST,    title: "Microsoft Teams", message: "Sarah is calling — Microsoft Teams.", meta: "Caller: Sarah K.  ·  Type: Audio call" },
  { template: TPL.WIN11,    title: "Disk Cleanup", message: "Disk Cleanup finished. Freed 1.8 GB by removing temporary files and old logs.", meta: "Freed: 1.8 GB  |  Method: Auto  |  Drive: C:" },
  { template: TPL.WIN11,    title: "Restore Point Created", message: "A system restore point has been created automatically before the recent driver update.", meta: "Name: Pre-driver-update  |  Drive: C:  |  Size: 1.2 GB" },
  { template: TPL.WIN11,    title: "App Permissions", message: "Microsoft Photos has requested access to your Pictures folder. Allow?", meta: "App: Photos  |  Permission: Pictures  |  First request" },
  { template: TPL.TOAST,    title: "Slack", message: "@channel — Sprint planning starts in 10 minutes.", meta: "Workspace: corp  ·  Calendar reminder  ·  10 min" },
  { template: TPL.TERMINAL, title: "pytest", message: "===== 47 passed, 3 skipped, 0 failed in 14.2s =====", meta: "Suite: test_core  Python: 3.11" },
  { template: TPL.WIN11,    title: "Power Mode", message: "Your device switched to Best Performance mode while plugged in.", meta: "Mode: Best Performance  |  Plan: AC profile" },
  { template: TPL.TOAST,    title: "Outlook", message: "Out-of-office reply enabled for the weekend.", meta: "Outlook  ·  Active until Mon 9 AM" },
  { template: TPL.WIN11,    title: "Focus Assist", message: "Focus assist is now active. Notifications will be silenced until 5 PM.", meta: "Mode: Focus  |  Until: 5:00 PM  |  Apps allowed: Priority" },
  // ---- Additional legit alerts (variety pass) ----
  { template: TPL.WIN11,    title: "Windows Update Ready", message: "An update is ready to install. Windows will restart after working hours unless you choose to install now.", meta: "Update: KB5037851  |  Size: 482 MB  |  Reboot: required", icon: "warning" },
  { template: TPL.TOAST,    title: "Microsoft 365", message: "Word recovered an unsaved document. Click to restore.", meta: "File: Untitled - Recovered  ·  Source: Word AutoRecover", icon: "question" },
  { template: TPL.WIN11,    title: "Defender Definitions Updated", message: "Microsoft Defender threat definitions updated successfully. Your device is protected.", meta: "Version: 1.413.998.0  |  Signed: Microsoft", icon: "blank" },
  { template: TPL.TERMINAL, title: "yarn install", message: "Done in 23.41s. 1,284 packages installed, 0 vulnerabilities reported.", meta: "Manager: yarn 1.22.22  Cache: ~/.yarn/cache" },
  { template: TPL.TERMINAL, title: "pnpm install", message: "Lockfile is up to date, resolution step is skipped. Already up to date.", meta: "pnpm 9.1.4  Workspace: 4 packages" },
  { template: TPL.TERMINAL, title: "deno run", message: "Granted env access to '~/.config/myapp'. Server listening on http://localhost:8000", meta: "Deno 1.44.4  Permissions: env, net" },
  { template: TPL.WIN11,    title: "Storage Sense Reminder", message: "Storage Sense hasn't run for 30 days. Run cleanup now to free up space on Local Disk (C:)?", meta: "Last run: 2026-04-21  |  Drive: C: (12.4 GB free)", icon: "warning" },
  { template: TPL.WIN11,    title: "Windows Spotlight", message: "Today's lock screen picture is available. Learn more about this image from Bing.", meta: "Source: Windows Spotlight  |  Region: Iceland", icon: "blank" },
  { template: TPL.TOAST,    title: "Phone Link", message: "iPhone 15 connected. You can now send messages and answer calls from your PC.", meta: "Device: iPhone 15  ·  Battery: 84%" },
  { template: TPL.WIN11,    title: "Defender Cloud Block", message: "Microsoft Defender blocked a potentially unwanted application based on cloud reputation. No action needed.", meta: "Blocked: PUA:Win32/InstallCore  |  Source: Cloud", icon: "warning" },
  { template: TPL.TOAST,    title: "Spotify", message: "Discover Weekly is ready. 30 fresh tracks added to your queue.", meta: "Playlist: Discover Weekly  ·  Updated Mondays" },
  { template: TPL.WIN11,    title: "Cumulative Update Installed", message: "May 2026 Cumulative Update has been installed. Your device will restart tonight at 3:30 AM unless overridden.", meta: "Update: KB5036893  |  Restart: 03:30  |  Signed: Microsoft", icon: "warning" },
  { template: TPL.WIN11,    title: "WSL: New Distro Available", message: "Ubuntu 24.04 LTS is now available in the Microsoft Store for WSL. Install to upgrade from 22.04.", meta: "Distro: Ubuntu-24.04  |  Source: Microsoft Store", icon: "blank" },
  { template: TPL.TERMINAL, title: "vite build", message: "✓ built in 4.82s. 14 chunks emitted to ./dist (832.4 KB total, 271.1 KB gzipped).", meta: "Bundler: vite 5.3.1" },
  { template: TPL.TERMINAL, title: "esbuild", message: "Build complete. 1 entry point, 0 errors, 2 warnings. 142 KB output.", meta: "Tool: esbuild 0.21.5" },
  { template: TPL.WIN11,    title: "WiFi: Connected", message: "Connected to 'Cafe-Public-WiFi'. This network may be unsecured. Sensitive sites may not work.", meta: "Network: Cafe-Public-WiFi  |  Security: WPA2-PSK", icon: "warning" },
  { template: TPL.TOAST,    title: "Battery Saver", message: "Battery saver is on. Background apps and push notifications are limited until the device is plugged in.", meta: "Battery: 19%  ·  Mode: Saver" },
  { template: TPL.WIN11,    title: "Windows Backup", message: "Windows Backup finished. Files, settings, and credentials backed up to your Microsoft account.", meta: "Backup size: 4.2 GB  |  Account: signed in", icon: "blank" },
  { template: TPL.TERMINAL, title: "apt upgrade", message: "0 packages upgraded, 0 newly installed, 0 to remove. System is up to date.", meta: "OS: Debian 12  Tool: apt 2.6.1" },
  { template: TPL.TERMINAL, title: "systemctl status nginx", message: "● nginx.service - active (running) since Fri 2026-05-23 09:14:32 UTC; 3h 21min ago", meta: "Service: nginx  Status: active  PID: 8412" },
  { template: TPL.WIN11,    title: "Edge Profile Sync", message: "Microsoft Edge finished syncing your favorites, passwords, and history across your signed-in devices.", meta: "Devices: 3  |  Last sync: just now", icon: "blank" },
  { template: TPL.TOAST,    title: "Google Drive", message: "Google Drive synced 12 new files from your Documents folder.", meta: "Account: rasmus@…  ·  Synced: 12 files" },
  { template: TPL.WIN11,    title: "BitLocker Recovery Key Saved", message: "Your BitLocker recovery key has been saved to your Microsoft account. You can view it at account.microsoft.com.", meta: "Drive: C:  |  Account: signed in", icon: "blank" },
  { template: TPL.WIN11,    title: "Hyper-V Manager", message: "Virtual machine 'DevServer-2024' has been gracefully shut down.", meta: "VM: DevServer-2024  |  Uptime: 4h 12m", icon: "blank" },
  { template: TPL.TOAST,    title: "Microsoft Teams", message: "Daily standup reminder — starting in 10 minutes.", meta: "Meeting: Daily standup  ·  10 min" },
  { template: TPL.WIN11,    title: "Realtek Audio Driver", message: "Audio device driver updated. You may need to restart applications using audio.", meta: "Driver: Realtek HD Audio  |  Version: 6.0.9614.1", icon: "warning" },
  { template: TPL.TOAST,    title: "Calendar", message: "Tomorrow: Dentist appointment at 10:00. Block your calendar 30 min before?", meta: "Outlook  ·  Tomorrow  ·  10:00" },
  { template: TPL.WIN11,    title: "Microsoft Store", message: "All apps are up to date. Microsoft Store will check again in 1 day.", meta: "Apps checked: 47  |  Updates: 0", icon: "blank" },
  { template: TPL.TERMINAL, title: "rustup update", message: "info: latest update on 2026-05-15, rust version 1.78.0. info: cleaning up downloads & tmp directories", meta: "Channel: stable  Toolchain: x86_64-pc-windows-msvc" },
  { template: TPL.WIN11,    title: "Display Color Profile", message: "Color calibration has been applied. Display is now using sRGB IEC61966-2.1 color profile.", meta: "Profile: sRGB  |  Display: ASUS PG279QM", icon: "blank" },
  { template: TPL.TOAST,    title: "Outlook", message: "You have 2 new emails from 'Customer Support'.", meta: "Outlook  ·  Inbox  ·  2 new" },
  { template: TPL.WIN11,    title: "Microsoft Office Repair", message: "Office Quick Repair finished successfully. Restart Word or Excel to load the repaired components.", meta: "Tool: Office Quick Repair  |  Duration: 4m 22s", icon: "blank" },
  { template: TPL.WIN11,    title: "WSL Memory Reclaimed", message: "WSL2 reclaimed 1.4 GB of memory back to Windows. Subsystem will continue running normally.", meta: "Distro: Ubuntu-22.04  |  Reclaimed: 1.4 GB", icon: "blank" },
  { template: TPL.WIN11,    title: "Steam Cloud Sync", message: "Cloud sync for Cyberpunk 2077 finished. Your saves are up to date across devices.", meta: "Game: Cyberpunk 2077  |  Files: 47", icon: "blank" },
  { template: TPL.WIN11,    title: "Visual Studio Update", message: "Visual Studio 2022 17.10.2 has been installed. Restart VS to apply the changes.", meta: "Version: 17.10.2  |  Channel: Release", icon: "warning" },
  { template: TPL.TOAST,    title: "GitHub Actions", message: "Workflow 'CI · main' completed successfully in 2m 47s.", meta: "Repo: sixtenhaglund/ThreatDetect  ·  Branch: main" },
  { template: TPL.WIN11,    title: "Windows Search Index Rebuild", message: "Search indexing has been rebuilt. Search results should appear normally again.", meta: "Indexed: 412,873 items  |  Duration: 28m", icon: "blank" },
  { template: TPL.TOAST,    title: "Notion", message: "New comment on your 'Sprint Planning' page from @maria.", meta: "Notion  ·  Page: Sprint Planning  ·  1m ago" },
  { template: TPL.WIN11,    title: "USB Device Connected", message: "USB Mass Storage Device 'KINGSTON' is ready to use as drive (E:).", meta: "Device: KINGSTON USB  |  Drive: E:  |  Format: NTFS", icon: "blank" },
  { template: TPL.WIN11,    title: "Webcam In Use", message: "Microsoft Teams is using your camera. Toggle camera privacy in Settings > Privacy & Security > Camera.", meta: "App: ms-teams.exe  |  Camera: Built-in HD", icon: "warning" },
  { template: TPL.TOAST,    title: "Dropbox", message: "Dropbox finished uploading 'Vacation_2026.zip' (1.2 GB) to your account.", meta: "Dropbox  ·  Uploaded: 1.2 GB" },
  { template: TPL.WIN11,    title: "Battery Discharging Quickly", message: "Battery is draining faster than usual. Top consumers: Chrome (37%), Slack (12%), Spotify (6%).", meta: "Drain rate: -28%/h  |  Time left: ~2h 10m", icon: "warning" },
  { template: TPL.TERMINAL, title: "cargo test", message: "test result: ok. 84 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 12.04s", meta: "Crate: my_app  Tool: cargo 1.78.0" },
  { template: TPL.WIN11,    title: "Privacy Settings Synced", message: "Privacy choices for your Microsoft account have been updated across all signed-in devices.", meta: "Devices updated: 3  |  Source: account.microsoft.com", icon: "blank" },
  { template: TPL.TOAST,    title: "Twitch", message: "Streamer 'shroud' is live now: Counter-Strike 2.", meta: "Twitch  ·  shroud · CS2 · 12.4K viewers" },
  { template: TPL.WIN11,    title: "Optional Driver Available", message: "Logitech G Hub driver update available. Install via Windows Update (Optional updates).", meta: "Driver: Logitech G Hub  |  Version: 2024.7.451", icon: "warning" },
  { template: TPL.TERMINAL, title: "make install", message: "Install complete. 142 files copied to /usr/local. Add /usr/local/bin to PATH if not already.", meta: "Target: install  Prefix: /usr/local" },
  { template: TPL.WIN11,    title: "OneDrive Files On-Demand", message: "Some files in OneDrive are only available online. Right-click and choose 'Always keep on this device' to make them available offline.", meta: "Online-only: 1,847 files  |  Account: signed in", icon: "blank" },
  { template: TPL.WIN11,    title: "Defender SmartScreen", message: "SmartScreen has blocked a download because it's not commonly downloaded. You can keep it from your downloads.", meta: "Blocked: installer_x64.exe  |  Source: untrusted", icon: "warning" },
  { template: TPL.TOAST,    title: "Slack", message: "Reminder: Sprint demo at 2 PM in #dev-team.", meta: "Slack  ·  #dev-team  ·  2:00 PM" },
  { template: TPL.WIN11,    title: "Game Mode Activated", message: "Game Mode is now active for Forza Horizon 5. Background apps and Windows Update are paused.", meta: "Game: Forza Horizon 5  |  Mode: Active", icon: "blank" },
  { template: TPL.TERMINAL, title: "ssh-keygen", message: "Generating public/private ed25519 key pair. Your identification has been saved in ~/.ssh/id_ed25519.", meta: "Type: ed25519  Output: ~/.ssh/id_ed25519" },
  { template: TPL.WIN11,    title: "Microsoft Account: New Sign-In", message: "New sign-in to your Microsoft account from Stockholm, Sweden. If this wasn't you, secure your account now.", meta: "Location: Stockholm  |  Device: Chrome on Windows", icon: "warning" },
  { template: TPL.TOAST,    title: "Discord", message: "Your nitro subscription renews in 7 days. Update payment method to avoid interruption.", meta: "Discord Nitro  ·  Renews in 7 days" },
  // ---- Theme-balancing pass: more legit cards in virus-heavy themes ----
  // Mouse / cursor (virus-heavy because of CURSOR)
  { template: TPL.WIN11,    title: "Logitech Options+", message: "Logitech Options+ updated to version 1.82.471. Restart the app to use the new gesture mappings.", meta: "App: Logitech Options+  |  Version: 1.82.471  |  Signed: Logitech, Inc.", icon: "blank" },
  { template: TPL.TOAST,    title: "Bluetooth Battery Low", message: "Microsoft Sculpt Comfort Mouse battery is at 12%. Replace AA cells in the next few days.", meta: "Device: Sculpt Comfort Mouse  ·  Battery: 12%" },
  { template: TPL.WIN11,    title: "Pointer Precision", message: "Enhance pointer precision has been disabled per your settings. New mouse-tracking behavior is now active.", meta: "Setting: Mouse  |  Source: Settings app" },
  { template: TPL.WIN11,    title: "Touchpad Gestures Reset", message: "Three-finger swipe gestures have been reset to defaults after the recent driver update.", meta: "Device: Precision Touchpad  |  Driver: Synaptics 19.5.34" },
  // Boot / BIOS / UEFI (virus-heavy because of ROOTKIT)
  { template: TPL.BIOS,     title: "Secure Boot Enabled", message: "Secure Boot is currently ON. Boot order changes will require admin authentication on next reboot.", meta: "SecureBoot: ON  Mode: UEFI  TPM: 2.0" },
  { template: TPL.WIN11,    title: "Dell BIOS Update Available", message: "BIOS 1.23.0 is available for your Dell XPS 15 9520. Download from Dell Support to install.", meta: "Model: XPS 15 9520  |  Current: 1.21.0  |  New: 1.23.0  |  Signed: Dell Inc.", icon: "warning" },
  { template: TPL.WIN11,    title: "Fast Startup Restored", message: "Fast Startup was re-enabled automatically after the May 2026 cumulative update finished.", meta: "Feature: Fast Startup  |  Status: ON", icon: "blank" },
  { template: TPL.WIN11,    title: "Boot Order Changed", message: "Boot priority changed in UEFI: Windows Boot Manager now precedes USB. Reboot to apply.", meta: "Priority: 1) Windows Boot Manager  2) USB  3) Network", icon: "warning" },
  // Legacy Windows / IE / Win32 (virus-heavy because of FOSSIL)
  { template: TPL.WIN11,    title: "Internet Explorer Mode", message: "Microsoft Edge loaded this internal site in IE Mode for compatibility with a legacy intranet app.", meta: "Site: intranet.corp  |  Mode: IE 11  |  Source: Group Policy", icon: "blank" },
  { template: TPL.WIN11,    title: "Visual C++ Runtime", message: "Microsoft Visual C++ 2015-2022 Redistributable (x64) was updated. Restart applications using it.", meta: "Package: VC++ 14.40  |  Signed: Microsoft", icon: "blank" },
  { template: TPL.TERMINAL, title: "powershell", message: "Loading Windows PowerShell 2.0 engine for compatibility with a legacy script. .NET 2.0 runtime active.", meta: "Engine: PSv2.0  Script: legacy_admin.ps1" },
  { template: TPL.WIN11,    title: "Win32 Component Repair", message: "Windows Component Store (CBS) repair finished. All Win32 components are healthy — no further action needed.", meta: "Tool: DISM /RestoreHealth  |  Duration: 14m 22s", icon: "blank" },
  // Audio (very few legit cards before)
  { template: TPL.WIN11,    title: "Default Output Changed", message: "Default audio output switched to Headphones (Realtek HD Audio) after device was plugged in.", meta: "Output: Headphones  |  Driver: Realtek HD Audio", icon: "blank" },
  { template: TPL.TOAST,    title: "Microphone Permission", message: "Microsoft Teams is now using your microphone. Toggle in Settings > Privacy > Microphone.", meta: "App: ms-teams.exe  ·  Mic: Built-in" },
  { template: TPL.TOAST,    title: "Spotify", message: "Local audio output switched to Sonos Beam. Now playing on living room speaker.", meta: "Spotify  ·  Output: Sonos Beam" },
  // ---- New visual template legit cards (so the new styles aren't all-virus) ----
  { template: TPL.MAC,      title: "Mail", message: "3 new emails from Engineering — Sprint planning notes attached.", meta: "Inbox  ·  3 new" },
  { template: TPL.MAC,      title: "Phone Link", message: "Your iPhone is now connected. Calls and messages will appear here.", meta: "Device: iPhone 15  ·  Connected" },
  { template: TPL.CHAT,     title: "Sarah K.", message: "Hey — code review on your PR is done. LGTM, ready to merge whenever.", meta: "Slack  ·  #reviews  ·  2m" },
  { template: TPL.CHAT,     title: "Alex", message: "Want to grab lunch at 12? The new ramen place opened on the corner.", meta: "Teams  ·  DM  ·  just now" },
  { template: TPL.PHONE,    title: "Maps", message: "Leave in 15 minutes for your 2:00 PM appointment to avoid traffic.", meta: "ETA: 22 min  ·  via Sveavägen" },
  { template: TPL.PHONE,    title: "Battery", message: "iPhone battery is at 20%. Connect to a charger soon.", meta: "Battery: 20%" },
  { template: TPL.PRINT,    title: "Quarterly_Report.pdf", message: "Ready to print on HP LaserJet M404. 12 pages, color, double-sided.", meta: "Printer: HP LaserJet M404  |  Pages: 12  |  Mode: Duplex" },
  { template: TPL.PRINT,    title: "Boarding_Pass.pdf", message: "Print boarding pass — SAS flight SK1234 STO→CPH. Single page, color.", meta: "Printer: Default  |  Pages: 1" },
  { template: TPL.CAPTCHA,  title: "Cloudflare Verification", message: "Cloudflare is checking your browser before redirecting you to github.com. This should only take a few seconds.", meta: "Ray ID: 8a7c92f1  ·  Performance & security by Cloudflare" },
  { template: TPL.UPDATE,   title: "ThreatDetect", message: "ThreatDetect has been updated locally. Reload the page to get the latest viruses and minigames.", meta: "Local build  ·  No network update required", icon: "blank" }
];

/* ============================================================
   DEATHS — virus-specific death animation metadata
   (CSS classes live in the <style> block: .death-<VIRUS>)
   ============================================================ */


/* ---- Per-virus death animation metadata (text + duration) ---- */
const DEATHS = {
  EPILEPTICA: { text: "SEIZURE OVERLOAD",      duration: 4200 },
  MELTDOWN:   { text: "HARDWARE FAILURE",      duration: 4500 },
  STATIC:     { text: "SIGNAL LOST",           duration: 4200 },
  REDRUM:     { text: "ALL WORK AND NO PLAY",  duration: 4800 },
  VOID:       { text: "ALLOCATION FAULT",      duration: 4500 },
  GASLIGHT:   { text: "TIME UNVERIFIABLE",     duration: 4500 },
  CRYPTEX:    { text: "FILES ENCRYPTED",       duration: 4500 },
  WORM:       { text: "REPLICATION COMPLETE",  duration: 4500 },
  ROOTKIT:    { text: "KERNEL COMPROMISED",    duration: 4800 },
  DDOS:       { text: "BANDWIDTH HIJACKED",    duration: 4500 },
  LEECH:      { text: "CREDENTIALS HARVESTED", duration: 4500 },
  SCREAMER:   { text: "SHOCK ATTACK",          duration: 3500 },
  MIMIC:      { text: "IMPOSTOR ACCEPTED",     duration: 4500 },
  PULSE:      { text: "RHYTHM CAPTURED",       duration: 4500 },
  NULL:       { text: "INTERFACE LOST",        duration: 4500 },
  CURSOR:     { text: "POINTER STOLEN",        duration: 4500 },
  LOOP:       { text: "STACK OVERFLOW",        duration: 4500 },
  FOSSIL:     { text: "LEGACY EXPLOIT",        duration: 4500 },
  HEX:        { text: "0xDEADBEEF",            duration: 4500 },
  BUGBEAR:    { text: ".",                     duration: 4500 }
};

/* ============================================================
   CONFIG
   ============================================================ */


/* ---- Per-virus textual tells (regex patterns that detect 'why was it a virus?') ---- */
const TEXTUAL_TELLS = {
  EPILEPTICA: [
    { p: /!{3,}/,                                                                   t: "Excessive exclamation marks (!!!!) — strobe-virus urgency tactic" },
    { p: /_flash|_strobe|strobe_sync|strobe_calibrate|flash_driver|flash_helper/i,  t: "Process name contains '_flash' or '_strobe'" },
    { p: /\b0\s*KB\b|\b999\s*MB\b/i,                                                t: "Memory listed as exactly 0KB or 999MB (impossible)" },
    { p: /display calibration|refresh rate|monitor sync/i,                          t: "References 'display calibration', 'monitor sync', or 'refresh rate'" }
  ],
  MELTDOWN: [
    { p: /(\d{3,})\s*°C/,                                                           t: m => "Temperature claimed at " + m[1] + "°C — silicon melts well before that" },
    { p: /disable.{0,15}(thermal|throttle|cooling)|(thermal|throttle|cooling).{0,15}disabl|disabling fan/i, t: "Asks you to disable thermal protection or cooling" },
    { p: /coolfix|cpufix|heat_relief|heat_manager|temp_override|thermal_patch|thermal_panic|cooler\.exe/i,  t: "Fake-cooling process or download source" }
  ],
  STATIC: [
    { p: /\.scr\b/i,                                                                t: "Uses a .scr (screensaver) executable extension" },
    { p: /signal loss|antenna|broadcast tower|channel_restore|channel_sync|noise_overlay|noise_filter/i, t: "Analog-TV terminology (signal, antenna, channel) on a modern PC" },
    { p: /antennasync|signal-fix|static_noise|signal_cleaner/i,                     t: "Fake signal-restore process or domain" }
  ],
  REDRUM: [
    { p: /HKCU\\(Hotel|Lodge|Caretaker)/i,                                          t: "Registry path uses themed names (Hotel, Lodge, Caretaker)" },
    { p: /Room\s*2[13]7/i,                                                          t: "References Room 237 or Room 217 (horror motif)" },
    { p: /caretaker|overlook|mur_der|murder\.exe|redrum\.exe|etatekrac/i,           t: "Process name uses a horror motif or palindrome" },
    { p: /taken care of|carefully managed|looked after/i,                            t: "Eerie phrasing — 'taken care of' / 'looked after'" }
  ],
  VOID: [
    { p: /PID:?\s*(NULL|VOID|0x0+\b)/i,                                             t: "Process ID listed as NULL, VOID, or 0x00000000" },
    { p: /∞|\/dev\/null|\bNUL\b|null space|self.delet|entropy_manager|void_compress|nullsector/i, t: "References /dev/null, NUL, ∞, or 'self-deleting'" },
    { p: /-\d+\s*bytes|files:?\s*-\d/i,                                             t: "Negative byte counts" }
  ],
  GASLIGHT: [
    { p: /\b1601-\d{2}-\d{2}|9999-\d{2}-\d{2}|2025-02-30|0000:00:00|Feb 30|2031-13-32/i, t: "Impossible date (year 1601, 9999, Feb 30, etc.)" },
    { p: /already approved|per your authorization|previous authorization|sessions you don.t remember/i, t: "Claims you 'already approved' something you don't remember" },
    { p: /time-fix|verified\.timegate|timegate/i,                                   t: "Fake time-sync domain" }
  ],
  CRYPTEX: [
    { p: /\bBTC\b|Bitcoin|0\.\d+\s*ETH|wallet[:=\s]|bc1q\w+|0x[a-f0-9]{6,}/i,       t: "Bitcoin / Ethereum / wallet address mentioned" },
    { p: /\.locked|\.crypt\b|\.vault|Extension:\s*\.\w+/i,                          t: "Files renamed to .locked / .crypt / .vault" },
    { p: /Timer:|T-\d+:\d+|within \d+h|within \d+ hours|24h|48 hours/i,             t: "Countdown timer attached to file deletion" },
    { p: /premium recovery|premium key|pay.{0,12}(unlock|decrypt|recovery)/i,       t: "Demands payment to unlock your own files" }
  ],
  WORM: [
    { p: /\.(pdf|docx|xlsx|jpg|png|zip)\.exe/i,                                     t: "File pretends to be a document but is actually .exe" },
    { p: /HR.{0,8}Dep|IT Support|Accounting Notice|hr-dept@|company-portal|finance team/i, t: "Claims to be from HR / IT / Accounting" },
    { p: /network share|shares writing|copies created|spread\.sh|self-replicat|writing to.{0,8}share/i, t: "Replicates across network shares" }
  ],
  ROOTKIT: [
    { p: /MBR|Master Boot Record|boot sector/i,                                     t: "Modifies the Master Boot Record (MBR)" },
    { p: /disable.*secure ?boot|secure ?boot.{0,16}(disabl|paus|overrid)/i,         t: "Asks you to disable Secure Boot" },
    { p: /kernel driver|ring-?\s*0|System32\\drivers|rootkit_accel|core_patcher|uefi_repair|ntoskrnl/i, t: "Requests kernel-level access or modifies kernel files" }
  ],
  DDOS: [
    { p: /\d{3,}\/s|outbound:?\s*\d{3,}|connections:?\s*\d{3,}/i,                   t: "Thousands of outbound connections per second" },
    { p: /BandwidthTest|netpool|distributed (test|comput|routing|cluster)|volunteer comput|routing pool|bwpool/i, t: "Claims to be a bandwidth test or distributed computing pool" },
    { p: /bwtest_agent|dc_volunteer|netpool_agent/i,                                t: "Botnet-client process name" }
  ],
  LEECH: [
    { p: /klhelper|cbsync|inpd|smart_fill|input enhancement/i,                      t: "Fake keyboard/clipboard helper process name" },
    { p: /hook:?\s*(keyboard|clipboard|hid)|hooked into|attached to chrome|attached to firefox|smart autofill/i, t: "Hooks into keyboard / clipboard / browser" },
    { p: /data-sync\.pw|clip-srv\.ru|credentials\.php|autofill-sync|outbound:?\s*\S+\.(pw|ru)/i, t: "Outbound traffic to a suspicious credential-sync domain" }
  ],
  SCREAMER: [
    { p: /!{2,}/,                                                                   t: "Multiple exclamation marks — panic tactic" },
    { p: /1-?800-?FAKE-?MS|emergency hotline|call.{0,8}now|do not turn off|do not close this window/i, t: "Demands you call a hotline or stay on the popup" },
    { p: /27.{0,10}viruses|files will be deleted|locked in 30 seconds|click.{0,8}within/i, t: "Implausible threat count or imminent deadline" }
  ],
  MIMIC: [
    { p: /[а-яА-Я]/,                                                                t: "Contains a Cyrillic character disguised as Latin (e.g. 'о' instead of 'o')" },
    { p: /update-installer\.com|npm-suplly|hackerone-verify|hacker0ne|legacy\.archive\.host|micros[oо]ft-update/i, t: "Domain looks like a real brand but is a typosquat" },
    { p: /Lets Encrpt|Encrpt|Microsft|Adobr/,                                       t: "Issuer / product name is misspelled by one letter" }
  ],
  PULSE: [
    { p: /cardio_render|dwm_pulse|heartbeat_render|rhythm_opt|pulse-based|heartbeat protocol/i, t: "Process name references heartbeat / pulse / cardio" },
    { p: /BPM|beat:|tempo|sync rhythm/i,                                            t: "Mentions BPM, tempo, or rhythm in a system-process context" }
  ],
  NULL: [
    { p: /nullify\.exe|omit_helper|suppress.{0,10}(ui|element)|hidden ui|missing buttons|suppressed:|removed:.{0,5}controls/i, t: "References suppressing / hiding / nullifying UI elements" },
    { p: /∅/,                                                                       t: "Uses the ∅ (empty set) symbol" }
  ],
  CURSOR: [
    { p: /mpredict|smartclick|drift_fix|pointerfw|pointer-sync|cursorfix/i,         t: "Fake mouse-helper process name" },
    { p: /click.prediction|pointer telemetry|cursor drift|click accuracy|HID-Mouse|pointer smoothing/i, t: "Hooks into pointer / mouse driver telemetry" }
  ],
  LOOP: [
    { p: /(\.\.\/){2,}|\/loop\/loop/i,                                              t: "File path with deeply nested traversal (../../../) or /loop/loop/" },
    { p: /depth:?\s*∞|recursion depth|stack overflow|retry until|autoretry/i,       t: "Infinite recursion, retry loop, or stack overflow language" }
  ],
  FOSSIL: [
    { p: /WIN16|MFC42|DAO 3\.5|WinHelp|VBRUN300|ntvdm|Windows 9[58]/i,              t: "References an abandoned Windows component (WIN16, MFC42, WinHelp, etc.)" },
    { p: /legacy\.archive|old\.windowsupdate|deprecated 200\d/i,                    t: "Asks you to download from a 'legacy' or 'archive' domain" }
  ],
  HEX: [
    { p: /0x[A-F0-9]{4,}/i,                                                         t: "Multiple hex-encoded values (0xDEADBEEF, 0xCAFEBABE, etc.)" },
    { p: /ring\s*-?\s*1|DMA|physical memory|memory.{0,10}forensics|hexdumper|memcheck/i, t: "Requests ring-1 / DMA / physical RAM access" }
  ],
  BUGBEAR: [
    { p: /\$[\d,]{3,}|reward|bounty payout|claim within|\d+.hour deadline/i,        t: "Promises a cash reward / bounty in exchange for action" },
    { p: /BugCrowd|HackerOne|hacker0ne|hackerone-verify|hackerone-bug|bugcrowd-team|CVE.\d{4}/i, t: "Claims to be a security-researcher disclosure" },
    { p: /verify.{0,8}identity|confirm.{0,8}ownership|sign in at|enter.{0,8}credentials|confirm your details/i, t: "Asks you to verify identity / confirm ownership / sign in" }
  ]
};
