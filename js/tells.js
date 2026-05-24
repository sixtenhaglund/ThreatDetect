// =====================================================
// tells.js — per-virus textual tell patterns (regex)
//            consumed by textualTellsFor in core.js
// =====================================================
"use strict";

/* ---- Per-virus textual tells (regex patterns that detect 'why was it a virus?') ---- */
const TEXTUAL_TELLS = {
  EPILEPTICA: [
    { p: /!{3,}/,                                                                   t: "Excessive exclamation marks (!!!!) — strobe-virus urgency tactic" },
    { p: /_flash|_strobe|strobe_sync|strobe_calibrate|flash_driver|flash_helper|flash_anti|strobe_ctl|strobe_norton|strobe_mac|strobe-mobile|flash_fix/i,  t: "Process name contains '_flash' or '_strobe'" },
    { p: /\b0\s*KB\b|\b999\s*MB\b/i,                                                t: "Memory listed as exactly 0KB or 999MB (impossible)" },
    { p: /display calibration|refresh rate|monitor sync|anti-flicker|pixel calibration/i, t: "References 'display calibration', 'monitor sync', or 'refresh rate'" },
    { p: /\b999\s*Hz|refresh.{0,8}999|frames.{0,3}999/i,                            t: "Refresh rate claimed at 999Hz (real monitors top out around 360Hz)" },
    { p: /strobe(fix|-mobile|-fix)|flash-fix|strobefix/i,                           t: "Source domain contains 'strobe' or 'flash-fix'" }
  ],
  MELTDOWN: [
    { p: /(\d{3,})\s*°C/,                                                           t: m => "Temperature claimed at " + m[1] + "°C — silicon melts well before that" },
    { p: /disable.{0,15}(thermal|throttle|cooling|defender)|(thermal|throttle|cooling).{0,15}disabl|disabling fan/i, t: "Asks you to disable thermal protection or cooling" },
    { p: /coolfix|cpufix|heat_relief|heat_manager|temp_override|thermal_patch|thermal_panic|cooler\.exe|heatfix|thermal_emergency|molten_relief|thermalboost/i,  t: "Fake-cooling process or download source" },
    { p: /liquid metal|silicon damage|hardware melt|motherboard fail|thermal event/i, t: "Dramatic hardware-damage language (real thermal alerts are dry)" },
    { p: /fan.{0,6}(off|disabled|override)|fan curve|fan controller offline/i,      t: "Claims fans are off / disabled — Windows never asks you to do this" }
  ],
  STATIC: [
    { p: /\.scr\b/i,                                                                t: "Uses a .scr (screensaver) executable extension" },
    { p: /signal loss|antenna|broadcast tower|channel_restore|channel_sync|noise_overlay|noise_filter|noise_fix|signal_cleaner|signal_helper|signal_boost|signal interference|cable interference|VHS|VGA channel|RF tuner|rf_clean|rf_tuner|signal_helper/i, t: "Analog-TV terminology (signal, antenna, channel) on a modern PC" },
    { p: /antennasync|signal-fix|signal-mobile|broadcast{tld}|broadcast-archive|analog-archive|signal\{/i, t: "Fake signal-restore process or domain" },
    { p: /channel\s*\d+|channel_\d/i,                                               t: "References 'channel N' — modern displays don't have TV channels" }
  ],
  REDRUM: [
    { p: /HKCU\\(Hotel|Lodge|Caretaker)/i,                                          t: "Registry path uses themed names (Hotel, Lodge, Caretaker)" },
    { p: /Room\s*2[13]7/i,                                                          t: "References Room 237 or Room 217 (horror motif)" },
    { p: /caretaker|overlook|mur_der|murder\.exe|redrum\.exe|etatekrac/i,           t: "Process name uses a horror motif or palindrome" },
    { p: /taken care of|carefully managed|looked after|always been (here|the caretaker)/i, t: "Eerie phrasing — 'taken care of' / 'looked after' / 'always been'" },
    { p: /overlook-lodge|hotel-management|room237/i,                                t: "Domain references a hotel / lodge / room number" }
  ],
  VOID: [
    { p: /PID:?\s*(NULL|VOID|0x0+\b|∅)/i,                                           t: "Process ID listed as NULL, VOID, 0x00000000, or ∅" },
    { p: /∞|\/dev\/null|\bNUL\b|null space|self.delet|entropy_manager|void_compress|nullsector|void-optimize|VoidCleaner|VoidCompress|VoidOptimize/i, t: "References /dev/null, NUL, ∞, or 'self-deleting'" },
    { p: /-\d+\s*bytes|files:?\s*-\d/i,                                             t: "Negative byte counts" },
    { p: /reclaim.{0,5}∞|0\s*bytes\s*(used|of)/i,                                   t: "Claims to reclaim ∞ bytes (impossible) or 0 bytes used" },
    { p: /entropy 0|optimize.{0,4}NUL|consolidat.{0,4}NULL/i,                       t: "Talks about reducing entropy to zero or consolidating into NULL" }
  ],
  GASLIGHT: [
    { p: /\b1601-\d{2}-\d{2}|9999-\d{2}-\d{2}|2025-02-30|0000:00:00|Feb 30|2031-13-32/i, t: "Impossible date (year 1601, 9999, Feb 30, etc.)" },
    { p: /already approved|per your authorization|previous authorization|sessions you don.t remember|previously approved|you (set|confirmed|did) this/i, t: "Claims you 'already approved' something you don't remember" },
    { p: /time-fix|verified\.timegate|timegate|chrono-correct|icloud-correct|norton-audit/i, t: "Fake time-sync / audit-correction domain" },
    { p: /Removed:?\s*\d+|Removing sessions|trusted_state|rewind/i,                 t: "Claims to silently remove sessions / restore a 'trusted state'" },
    { p: /-\d+\s*days?\s*ago|-\d+\s*window/i,                                       t: "Timestamps shown as negative days (you can't approve something -47 days ago)" }
  ],
  CRYPTEX: [
    { p: /\bBTC\b|Bitcoin|0\.\d+\s*ETH|wallet[:=\s]|bc1q\w+|0x[a-f0-9]{6,}|seed phrase|crypto.?wallet/i, t: "Bitcoin / Ethereum / wallet address / seed phrase mentioned" },
    { p: /\.locked|\.crypt\b|\.vault|Extension:\s*\.\w+/i,                          t: "Files renamed to .locked / .crypt / .vault" },
    { p: /Timer:|T-\d+:\d+|within \d+h|within \d+ hours|24h|48 hours|auto-shutdown|auto-delete/i, t: "Countdown timer attached to file deletion" },
    { p: /premium recovery|premium key|pay.{0,12}(unlock|decrypt|recovery|seed)|recovery.?vault|onedrive-restore/i, t: "Demands payment to unlock your own files" },
    { p: /README_DECRYPT|ransom note|decryption (instructions|key|patch)/i,         t: "Mentions a 'README' ransom note or 'decryption key'" }
  ],
  WORM: [
    { p: /\.(pdf|docx|xlsx|jpg|png|zip)\.exe/i,                                     t: "File pretends to be a document but is actually .exe" },
    { p: /HR.{0,8}Dep|IT Support|Accounting Notice|hr-dept@|company-portal|finance team|payroll|onboarding/i, t: "Claims to be from HR / IT / Accounting / Onboarding" },
    { p: /network share|shares writing|copies created|spread\.sh|self-replicat|writing to.{0,8}share|spreads.{0,4}(to|across).{0,4}\d+|14\s*(shares|devices|contacts|nearby)/i, t: "Replicates across network shares / devices / contacts" },
    { p: /forward to.{0,5}team|send.{0,5}rest|airdrop-relay|messages-relay|npm-supply-chain/i, t: "Tells you to forward / share with others (worm propagation)" }
  ],
  ROOTKIT: [
    { p: /MBR|Master Boot Record|boot sector|bootkit|boot loader|boot_helper|boot_worm/i, t: "Modifies the Master Boot Record / boot sector" },
    { p: /disable.*secure ?boot|secure ?boot.{0,16}(disabl|paus|overrid)/i,         t: "Asks you to disable Secure Boot" },
    { p: /kernel driver|ring-?\s*0|System32\\drivers|rootkit_accel|core_patcher|uefi_repair|ntoskrnl|uefi_persist|rootkit_remover|dellboot|driver_helper_kernel|spooler_kernel_fix/i, t: "Requests kernel-level access or modifies kernel files" },
    { p: /Run as administrator|admin password|kernel-level|ring -?1|press F2|press F10|UEFI firmware/i, t: "Demands admin / UEFI / BIOS-level authorization" }
  ],
  DDOS: [
    { p: /\d{3,}\/s|outbound:?\s*\d{3,}|connections:?\s*\d{3,}|conns:?\s*\d{3,}/i,  t: "Thousands of outbound connections per second" },
    { p: /BandwidthTest|netpool|distributed (test|comput|routing|cluster|pool)|volunteer comput|routing pool|bwpool|swarm_agent|join.{0,4}pool/i, t: "Claims to be a bandwidth test or distributed computing pool" },
    { p: /bwtest_agent|dc_volunteer|netpool_agent|flood_test|norton-bandwidth/i,    t: "Botnet-client process name" },
    { p: /CPU:?\s*100%|saturated|cpu.{0,4}spike|cpu.{0,4}expected/i,                t: "Claims CPU at 100% is 'normal' or 'expected'" }
  ],
  LEECH: [
    { p: /klhelper|cbsync|inpd|smart_fill|input enhancement|browserbuddy|passsync|smartclick|verify_print|captcha-helper/i, t: "Fake keyboard/clipboard helper process name" },
    { p: /hook:?\s*(keyboard|clipboard|hid|HID\+Clipboard|keyboard\+clipboard)|hooked into|attached to chrome|attached to firefox|smart autofill|saved credentials|saved logins/i, t: "Hooks into keyboard / clipboard / browser / credentials" },
    { p: /data-sync\.pw|clip-srv\.ru|credentials\.php|autofill-sync|cloud-vault|corp-it-verify|recovery-login|outbound:?\s*\S+\.(pw|ru)/i, t: "Outbound traffic to a suspicious credential-sync domain" },
    { p: /re-enter your.{0,8}password|enter.{0,5}password.{0,8}(verify|continue|confirm)|asks for:.{0,5}password|password expires today/i, t: "Asks you to re-enter your password — real software never does this in a popup" }
  ],
  SCREAMER: [
    { p: /!{2,}/,                                                                   t: "Multiple exclamation marks — panic tactic" },
    { p: /1-?800-?FAKE-?MS|emergency hotline|call.{0,8}now|do not turn off|do not close this window|hotline|press 1|call.{0,8}(apple|microsoft|support|us)/i, t: "Demands you call a hotline or stay on the popup" },
    { p: /27.{0,10}viruses|files will be deleted|locked in 30 seconds|click.{0,8}within|countdown|action required|immediate action|critical|EMERGENCY|URGENT/i, t: "Implausible threat count or imminent deadline" },
    { p: /00:30|00:60|time left|time:.{0,3}\d{2}:\d{2}|fraud detected|suspicious charge|FRAUD/i, t: "Aggressive countdown timer or fraud-panic language" },
    { p: /all (data|files|photos).{0,10}(deleted|erased|lost|frozen)/i,             t: "Threatens to delete all your data unless you act now" }
  ],
  MIMIC: [
    { p: /[а-яА-Я]/,                                                                t: "Contains a Cyrillic character disguised as Latin (e.g. 'о' instead of 'o')" },
    { p: /update-installer\.com|npm-suplly|hackerone-verify|hacker0ne|legacy\.archive\.host|micros[oо]ft-update|app1e|g00gle|geminni|cop1lot|cl4ude|chatgtp|chr0me|firef0x/i, t: "Domain or name looks like a real brand but is a typosquat" },
    { p: /Lets Encrpt|Encrpt|Microsft|Adobr|Cl0udflare|Goggle/,                     t: "Issuer / product name is misspelled by one letter" },
    { p: /Document5|Roo_m|n0de|verified intranet/,                                  t: "Subtle digit-for-letter swaps inside otherwise normal text" }
  ],
  PULSE: [
    { p: /cardio_render|dwm_pulse|heartbeat_render|rhythm_opt|pulse-based|heartbeat protocol|cardio_sync|heartbeat_render|rhythm_scan/i, t: "Process name references heartbeat / pulse / cardio" },
    { p: /BPM|beat:|tempo|sync rhythm|breathing effect|breathing visual|72\s*bpm/i, t: "Mentions BPM, tempo, or rhythm in a system-process context" },
    { p: /pulse.{0,8}(sync|protocol|signal)|sync.{0,8}heartbeat|hbsync/i,           t: "Claims to sync the display to your network heartbeat" }
  ],
  DOTNULL: [
    { p: /nullify\.exe|omit_helper|suppress.{0,10}(ui|element)|hidden ui|missing buttons|suppressed:|removed:.{0,5}controls|hidden:.{0,3}\d+|interface.{0,5}cleanup/i, t: "References suppressing / hiding / nullifying UI elements" },
    { p: /∅/,                                                                       t: "Uses the ∅ (empty set) symbol" },
    { p: /^$/,                                                                       t: "Card text is entirely empty — real alerts always have a message" }
  ],
  P0INTR: [
    { p: /mpredict|smartclick|drift_fix|pointerfw|pointer-sync|cursorfix|cursorshare|click_oracle|cursor_smart|touch_predict|cursor-update/i, t: "Fake mouse-helper process name" },
    { p: /click.prediction|pointer telemetry|cursor drift|click accuracy|HID-Mouse|pointer smoothing|click forecast|tap accuracy|pointer model/i, t: "Hooks into pointer / mouse driver telemetry" },
    { p: /telemetry:?\s*on|share.{0,4}(pointer|telemetry|click)/i,                  t: "Wants to share your pointer / click telemetry to a remote server" }
  ],
  INFINITE: [
    { p: /(\.\.\/){2,}|\/loop\/loop/i,                                              t: "File path with deeply nested traversal (../../../) or /loop/loop/" },
    { p: /depth:?\s*∞|recursion depth|stack overflow|retry until|autoretry|retries:?\s*∞|retries:?\s*\d{4,}|retry loop|boot loop/i, t: "Infinite recursion, retry loop, or stack overflow language" },
    { p: /loop_helper|loop_unwinder|path_unwinder|recur_helper|autoretry_helper|boot_unwinder/i, t: "Fake 'unwind the loop' helper process name" }
  ],
  TARPIT: [
    { p: /WIN16|MFC42|DAO 3\.5|WinHelp|VBRUN300|ntvdm|Windows 9[58]|Windows 7|Windows XP|MS-DOS|FAT16|QBASIC|iexplore\.dll|HIMEM\.SYS|AUTOEXEC|defrag\.exe|navw32|qb45|System 7\.5|Calmira|Trumpet Winsock|QEMM|WinG|dot matrix|Epson LX/i, t: "References an abandoned Windows / DOS / Mac component" },
    { p: /legacy\.archive|old\.windowsupdate|deprecated 200\d|legacy-update|legacy-java|legacy-print|xp-update|old-dos|old-windows|winworld|fidonet|trumpet-archive|qemm-archive|mac-legacy-archive/i, t: "Asks you to download from a 'legacy' or 'archive' domain" },
    { p: /Year:?\s*(19\d{2}|200[0-9])|deprecated 19\d\d/i,                          t: "References a year from the 1990s / early 2000s (legacy bait)" }
  ],
  HEXR: [
    { p: /0x[A-F0-9]{4,}/i,                                                         t: "Multiple hex-encoded values (0xDEADBEEF, 0xCAFEBABE, etc.)" },
    { p: /ring\s*-?\s*1|DMA|physical memory|memory.{0,10}forensics|hexdumper|memcheck|page_inspector|memhex|hex_patch/i, t: "Requests ring-1 / DMA / physical RAM access" },
    { p: /0xDEAD|0xBEEF|0xCAFE|0xC0DE|0xABAD|0xFACE|0xDEEF/i,                       t: "Cute hex word (0xDEADBEEF, 0xC0DEF00D) — real error codes aren't readable English" }
  ],
  ASSISTANT: [
    { p: /ChatGTP|Cop1lot|Cl4ude|Geminni|cop1lot|cl4ude|geminni|chatgtp/,           t: "AI brand name is subtly misspelled (real AI assistants don't typo their own name)" },
    { p: /I (noticed|found|recommend|prepared|analyzed|detected|rewrote)|Based on my analysis|Let me help|Hi! I|Hey!|I (think|may have made|may be wrong)/i,  t: "Friendly first-person AI tone ('I noticed…', 'Based on my analysis…')" },
    { p: /Confidence: ?\d+%|Accuracy: ?\d+%/i,                                       t: "Fake confidence / accuracy percentage attached to the recommendation" },
    { p: /I may make mistakes|please verify|I may be wrong/i,                       t: "Includes the AI-disclaimer fig-leaf ('I may make mistakes, please verify')" },
    { p: /ai-helper|ai-shield|ai-fix|gpt-fix|copilot-shield|claude-patch|smart-defender|workspace-protect|ai-recover|ai-bios|bios-ai-reset|ai-verify|siri-shield|apple-intel-fix|siri-secure|siri-mobile/i, t: "Process or tool name sounds like an AI-themed helper" }
  ]
};
