// =====================================================
// tells.js — per-virus textual tell patterns (regex)
//            consumed by textualTellsFor in core.js
// =====================================================
"use strict";

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
  HALLUCINATE: [
    { p: /ChatGTP|Cop1lot|Cl4ude|Geminni|cop1lot|cl4ude|geminni|chatgtp/,           t: "AI brand name is subtly misspelled (real AI assistants don't typo their own name)" },
    { p: /I (noticed|found|recommend|prepared)|Based on my analysis|Let me help/i,  t: "Friendly first-person AI tone ('I noticed…', 'Based on my analysis…')" },
    { p: /Confidence: ?\d+%|Accuracy: ?\d+%/i,                                       t: "Fake confidence / accuracy percentage attached to the recommendation" },
    { p: /I may make mistakes|please verify/i,                                       t: "Includes the AI-disclaimer fig-leaf ('I may make mistakes, please verify')" },
    { p: /ai-helper|ai-shield|ai-fix|gpt-fix|copilot-shield|claude-patch|smart-defender|workspace-protect/i, t: "Process or tool name sounds like an AI-themed helper" }
  ]
};
