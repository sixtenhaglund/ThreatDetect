// =====================================================
// templates.js — alert card visual templates
// One render function per template style (Win11, BSOD, Norton, Mac, etc.)
// Depends on data.js (ICONS, TPL), core.js (esc)
// =====================================================
"use strict";


/* ============================================================
   POPUP TEMPLATE RENDERERS
   ============================================================ */

/* A small pool of error-icon SVGs. Each card picks one deterministically (hashed from its content)
   so the icon stays stable per card but varies card-to-card — classic X, warning, glitch, blank, ∅, skull, ?. */

function iconFor(card) {
  let svg;
  if (card && card.icon && ICONS[card.icon])      svg = ICONS[card.icon];
  else if (card && ICON_BY_TEMPLATE[card.template]) svg = ICONS[ICON_BY_TEMPLATE[card.template]];
  else                                               svg = ICONS.error;
  // Recolor the primary `fill="#xxxxxx"` (first one in the SVG) with the per-card
  // iconColor if it's set. Cheaper than per-icon templating — keeps shapes intact
  // but lets the same icon appear in different colors across cards.
  if (card && card.iconColor) {
    svg = svg.replace(/fill="#[0-9a-fA-F]{3,8}"/, 'fill="' + card.iconColor + '"');
  }
  return svg;
}

// Back-compat exports for any code still referencing the old names directly.
const ERROR_ICON_SVG = ICON_VARIANTS[0];
const WARN_ICON_SVG  = ICON_VARIANTS[1];

function renderActions(card) {
  // Report = Virus, OK = Safe. Hidden when NULL tampering active.
  const left  = `<button class="btn danger" data-action="virus">${card.labelReport || "Report"}</button>`;
  const right = `<button class="btn primary" data-action="check">${card.labelOk || "OK"}</button>`;
  return left + right;
}

function renderWin11(card) {
  const heading = card.title || "";
  return `
    <div class="win-dialog">
      <div class="win-titlebar">
        <div class="win-titlebar-left">
          <div class="win-app-icon"></div>
          <div class="win-title">${esc(card.title || "System")}</div>
        </div>
        <div class="win-tb-btns">
          <div class="win-tb-btn">&#x2013;</div>
          <div class="win-tb-btn">&#x25A1;</div>
          <div class="win-tb-btn close">&#x2715;</div>
        </div>
      </div>
      <div class="win-body">
        <div class="win-error-icon">${iconFor(card)}</div>
        <div class="win-content">
          ${heading ? `<div class="win-heading">${esc(heading)}</div>` : ""}
          <div class="win-message">${esc(card.message)}</div>
          ${card.meta ? `<div class="win-meta">${esc(card.meta)}</div>` : ""}
        </div>
      </div>
      <div class="win-actions">
        <button class="btn" data-action="virus">${card.labelReport || "Report"}</button>
        <button class="btn primary" data-action="check">${card.labelOk || "OK"}</button>
      </div>
    </div>`;
}

function renderAV(card) {
  return `
    <div class="av-dialog">
      <div class="av-header">
        <span>⚠</span> Antivirus Alert <span class="badge">URGENT</span>
      </div>
      <div class="av-body">
        <div class="av-icon">${iconFor(card)}</div>
        <div class="av-content">
          <div class="av-heading">${esc(card.title)}</div>
          <div class="av-message">${esc(card.message)}</div>
          ${card.meta ? `<div class="av-meta">${esc(card.meta)}</div>` : ""}
        </div>
      </div>
      <div class="av-actions">
        <button class="btn danger" data-action="virus">${card.labelReport || "Report"}</button>
        <button class="btn primary" data-action="check">${card.labelOk || "OK"}</button>
      </div>
    </div>`;
}

function renderBIOS(card) {
  return `
    <div class="bios">
      <div class="bios-header">${esc(card.title || "AWARD BIOS v1.4")}</div>
      <div class="bios-row"><span class="bios-key">SYSTEM&nbsp;NOTICE:</span>&nbsp;${esc(card.message)}</div>
      ${card.meta ? `<div class="bios-row" style="margin-top:10px"><span class="bios-key">DEBUG:</span>&nbsp;${esc(card.meta)}</div>` : ""}
      <div class="bios-warn">Press a key to continue or report as threat.</div>
      <div class="bios-actions">
        <span><span class="key">F2</span> <button class="btn danger" data-action="virus" style="padding:4px 12px;font-size:12px">${card.labelReport || "Report"}</button></span>
        <span><span class="key">F10</span> <button class="btn primary" data-action="check" style="padding:4px 12px;font-size:12px">${card.labelOk || "OK"}</button></span>
      </div>
    </div>`;
}

function renderTerminal(card) {
  const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
  return `
    <div class="term">
      <div class="term-titlebar">
        <span class="term-dot"></span>
        <span>${esc(card.title || "shell")} — root@localhost</span>
      </div>
      <div class="term-body">
        <div class="term-line"><span class="prompt">[${esc(ts)}] $</span> ${esc(card.title || "")}</div>
        <div class="term-line"><span class="err">!</span> ${esc(card.message)}</div>
        ${card.meta ? `<div class="term-line"><span class="warn">~</span> ${esc(card.meta)}</div>` : ""}
        <div class="term-line"><span class="prompt">$</span> <span class="term-cursor"></span></div>
      </div>
      <div class="term-actions">
        <button class="term-btn" data-action="virus">${card.labelReport || "Report"}</button>
        <button class="term-btn" data-action="check" style="background:#003366;border-color:#66ddff;color:#66ddff;">${card.labelOk || "OK"}</button>
      </div>
    </div>`;
}

function renderToast(card) {
  return `
    <div class="toast-stage">
      <div class="toast">
        <div class="toast-head">
          <span class="badge"></span> ${esc(card.title || "Notification")}
          <span style="margin-left:auto;color:#888;">&#x2715;</span>
        </div>
        <div class="toast-body">
          <div class="toast-title">${esc(card.title)}</div>
          <div class="toast-msg">${esc(card.message)}</div>
          ${card.meta ? `<div class="toast-meta">${esc(card.meta)}</div>` : ""}
        </div>
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderDesktop(card) {
  // pick icon style from filename suffix
  let cls = "exe";
  const t = (card.title || "").toLowerCase();
  if (t.includes(".pdf")) cls = "pdf";
  else if (t.includes(".zip")) cls = "zip";
  else if (t.includes(".exe")) cls = "exe";
  const glyph = cls === "pdf" ? "📄" : cls === "zip" ? "🗜" : "⚙";
  return `
    <div class="desktop-stage">
      <div class="desktop-icon selected">
        <div class="ico ${cls}">${glyph}</div>
        <div class="label">${esc(card.title)}</div>
      </div>
      <div class="desktop-tooltip">
        ${esc(card.message)}
        ${card.meta ? `<div class="small">${esc(card.meta)}</div>` : ""}
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderLoading(card) {
  return `
    <div class="loading">
      <div class="loading-title">${esc(card.title)}</div>
      <div class="loading-sub">${esc(card.message)}</div>
      <div class="loading-bar"><div class="loading-fill"></div></div>
      <div class="loading-pct">63% — please do not power off</div>
      ${card.meta ? `<div class="loading-step">> ${esc(card.meta)}</div>` : ""}
    </div>
    <div class="row" style="gap:10px;margin-top:14px;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

/* -------- New visual templates -------- */

function renderWin311(card) {
  return `
    <div class="w311">
      <div class="w311-title"><span>${esc(card.title || "Error")}</span><span class="w311-close">×</span></div>
      <div class="w311-body">
        <div class="w311-icon">⊗</div>
        <div class="w311-content">
          <div class="w311-msg">${esc(card.message)}</div>
          ${card.meta ? `<div class="w311-meta">${esc(card.meta)}</div>` : ""}
        </div>
      </div>
      <div class="w311-actions">
        <button class="w311-btn" data-action="virus">${card.labelReport || "Report"}</button>
        <button class="w311-btn" data-action="check">${card.labelOk || "OK"}</button>
      </div>
    </div>`;
}

function renderBSOD(card) {
  return `
    <div class="bsod">
      <div class="bsod-inner">
:(

A problem has been detected and Windows has been shut down to prevent damage
to your computer.

${esc(card.title || "UNHANDLED_EXCEPTION")}

If this is the first time you've seen this Stop error screen,
restart your computer. If this screen appears again, follow these steps:

${esc(card.message)}

Technical information:
*** STOP: ${esc(card.meta || "0x000000F4")}
*** Press any key to continue _</div>
      <div class="row" style="gap:10px;margin-top:14px;">
        <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
        <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
      </div>
    </div>`;
}

function renderNorton(card) {
  return `
    <div class="norton-stage">
      <div class="norton-titlebar">═════ Norton AntiVirus ═════</div>
      <div class="norton-body">
        <div class="norton-title">${esc(card.title || "VIRUS ALERT")}</div>
        <div class="norton-msg">${esc(card.message)}</div>
        ${card.meta ? `<div class="norton-meta">> ${esc(card.meta)}</div>` : ""}
        <div class="norton-prompt">Press [ Y ] to continue, [ N ] to cancel</div>
      </div>
      <div class="row" style="gap:10px;margin-top:14px;">
        <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
        <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
      </div>
    </div>`;
}

function renderMac(card) {
  return `
    <div class="mac-notif">
      <div class="mac-icon">${iconFor(card)}</div>
      <div class="mac-body">
        <div class="mac-head">
          <span class="mac-app">${esc(card.title || "Notification")}</span>
          <span class="mac-time">now</span>
        </div>
        <div class="mac-msg">${esc(card.message)}</div>
        ${card.meta ? `<div class="mac-meta">${esc(card.meta)}</div>` : ""}
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderChat(card) {
  const initial = (card.title || "?").trim().charAt(0).toUpperCase();
  return `
    <div class="chat-msg">
      <div class="chat-avatar">${esc(initial)}</div>
      <div class="chat-body">
        <div class="chat-head">
          <span class="chat-name">${esc(card.title || "Unknown")}</span>
          <span class="chat-time">just now</span>
        </div>
        <div class="chat-text">${esc(card.message)}</div>
        ${card.meta ? `<div class="chat-meta">${esc(card.meta)}</div>` : ""}
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderPhone(card) {
  return `
    <div class="phone-screen">
      <div class="phone-statusbar"><span>9:41</span><span>●●●●● 5G</span></div>
      <div class="phone-clock">9:41</div>
      <div class="phone-date">Thursday, May 23</div>
      <div class="phone-banner">
        <div class="phone-app">${esc(card.title || "Notification")}</div>
        <div class="phone-msg">${esc(card.message)}</div>
        ${card.meta ? `<div class="phone-meta">${esc(card.meta)}</div>` : ""}
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderPrint(card) {
  return `
    <div class="print-dialog">
      <div class="print-tabbar">Print — ${esc(card.title || "Document")}</div>
      <div class="print-body">
        <div class="print-preview"><div class="print-page"></div></div>
        <div class="print-side">
          <div class="print-label">Document</div>
          <div class="print-value">${esc(card.message)}</div>
          ${card.meta ? `<div class="print-meta">${esc(card.meta)}</div>` : ""}
          <div class="print-actions-inline">
            <button class="print-btn-primary">Print</button>
            <button class="print-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderCaptcha(card) {
  return `
    <div class="captcha-card">
      <div class="captcha-text">${esc(card.message)}</div>
      <div class="captcha-box">
        <div class="captcha-checkbox"></div>
        <div class="captcha-label">I'm not a robot</div>
        <div class="captcha-brand">
          <div class="captcha-brand-name">reCAPTCHA</div>
          <div class="captcha-brand-sub">Privacy - Terms</div>
        </div>
      </div>
      ${card.meta ? `<div class="captcha-meta">${esc(card.meta)}</div>` : ""}
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderUpdate(card) {
  return `
    <div class="td-update">
      <div class="td-update-icon">🛡</div>
      <div class="td-update-body">
        <div class="td-update-title">${esc(card.title || "ThreatDetect")}</div>
        <div class="td-update-msg">${esc(card.message)}</div>
        ${card.meta ? `<div class="td-update-meta">${esc(card.meta)}</div>` : ""}
      </div>
      <div class="td-update-actions">
        <button class="td-update-btn primary">Update Now</button>
        <button class="td-update-btn">Later</button>
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

// Outlook 2000-style email window. Used by real-world worms like ILOVEYOU,
// MyDoom — the visual signature is the gray Win9x window chrome, the
// From/To/Cc/Subject header rows, and an attachment row at the bottom with
// a small file icon that's actually a script (.vbs / .exe). The card's title
// becomes the Subject line; the message is the body; meta becomes the
// attachment filename (with size in parens, e.g. "LOVE-LETTER-FOR-YOU.txt.vbs (10KB)").
function renderEmail(card) {
  const from    = card.from    || "sender@example.com";
  const to      = card.to      || "you@yourcompany.com";
  const cc      = card.cc      || "";
  const attach  = card.attach  || (card.meta || "");
  return `
    <div class="email-window">
      <div class="email-titlebar">
        <span class="email-title">${esc(card.title || "(no subject)")} - Message</span>
        <span class="email-controls"><span>_</span><span>□</span><span>×</span></span>
      </div>
      <div class="email-menubar"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Actions</span><span>Help</span></div>
      <div class="email-headers">
        <div class="email-hrow"><span class="email-hlabel">From:</span><span class="email-hvalue">${esc(from)}</span></div>
        <div class="email-hrow"><span class="email-hlabel">To:</span><span class="email-hvalue">${esc(to)}</span></div>
        <div class="email-hrow"><span class="email-hlabel">Cc:</span><span class="email-hvalue">${esc(cc)}</span></div>
        <div class="email-hrow email-subject"><span class="email-hlabel">Subject:</span><span class="email-hvalue">${esc(card.title || "")}</span></div>
      </div>
      <div class="email-body">
        <div class="email-body-text">${esc(card.message || "")}</div>
        <div class="email-scrollbar"><div class="email-scrollthumb"></div></div>
      </div>
      ${attach ? `
      <div class="email-attach">
        <div class="email-attach-icon" aria-hidden="true">
          <svg width="36" height="44" viewBox="0 0 36 44">
            <rect x="2" y="2" width="32" height="40" fill="#fff8c8" stroke="#7a6a1a" stroke-width="1"/>
            <rect x="2" y="2" width="32" height="8" fill="#1f3a8a"/>
            <text x="18" y="9" text-anchor="middle" font-size="6" font-family="Tahoma, sans-serif" font-weight="bold" fill="#fff">SCRIPT</text>
            <line x1="6"  y1="16" x2="30" y2="16" stroke="#7a6a1a" stroke-width="0.6"/>
            <line x1="6"  y1="20" x2="30" y2="20" stroke="#7a6a1a" stroke-width="0.6"/>
            <line x1="6"  y1="24" x2="30" y2="24" stroke="#7a6a1a" stroke-width="0.6"/>
            <line x1="6"  y1="28" x2="26" y2="28" stroke="#7a6a1a" stroke-width="0.6"/>
            <line x1="6"  y1="32" x2="30" y2="32" stroke="#7a6a1a" stroke-width="0.6"/>
            <line x1="6"  y1="36" x2="22" y2="36" stroke="#7a6a1a" stroke-width="0.6"/>
          </svg>
        </div>
        <div class="email-attach-label">${esc(attach)}</div>
      </div>` : ""}
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

// WannaCry-style ransom note. Matches the iconic 2017 ransom screen:
// red header bar with the misspelled "Wana Decrypt0r 2.0" title and a
// language dropdown, a left red panel with the padlock and two
// countdown timers, a right white FAQ panel ("What Happened to My
// Computer?", "Can I Recover My Files?", "How Do I Pay?"), and a
// bottom row with a Bitcoin wallet field + Check Payment / Decrypt
// buttons. Card fields:
//   title    = the brand text in the header (default "Wana Decrypt0r 2.0")
//   message  = the FAQ body text on the right (multi-section)
//   meta     = unused in the popup; used by the death screen for wallet
//   wallet   = optional override for the Bitcoin wallet address
//   amount   = optional override for the ransom dollar amount (default $300)
//   timer1   = optional "payment will be raised on" countdown (default 02:23:57:37)
//   timer2   = optional "your files will be lost on" countdown (default 06:23:57:37)
function renderRansom(card) {
  const title   = card.title   || "Wana Decrypt0r 2.0";
  const wallet  = card.wallet  || (card.meta || "13AM4VW2dhxYgXeQepoHkHSQuy6NgaEb94");
  const amount  = card.amount  || "$300";
  const timer1  = card.timer1  || "02:23:57:37";
  const timer2  = card.timer2  || "06:23:57:37";
  const msg     = card.message || "Your important files are encrypted.\n\nMany of your documents, photos, videos, databases and other files are no longer accessible because they have been encrypted. Maybe you are busy looking for a way to recover your files, but do not waste your time. Nobody can recover your files without our decryption service.";
  return `
    <div class="ransom-window">
      <div class="ransom-header">
        <span class="ransom-title">${esc(title)}</span>
        <span class="ransom-lang">English ▾</span>
      </div>
      <div class="ransom-body">
        <div class="ransom-left">
          <div class="ransom-padlock" aria-hidden="true">
            <svg width="44" height="52" viewBox="0 0 44 52">
              <path d="M14 22 L14 14 a8 8 0 0 1 16 0 L30 22" fill="none" stroke="#fff" stroke-width="3.5"/>
              <rect x="8" y="22" width="28" height="22" fill="#fff" stroke="#fff" stroke-width="1"/>
              <circle cx="22" cy="32" r="3" fill="#c11414"/>
              <rect x="20.6" y="33" width="2.8" height="6" fill="#c11414"/>
            </svg>
          </div>
          <div class="ransom-tile">
            <div class="ransom-tile-label">Payment will be raised on</div>
            <div class="ransom-tile-date">5/15/2017 17:00:00</div>
            <div class="ransom-tile-sub">Time Left</div>
            <div class="ransom-tile-timer">${esc(timer1)}</div>
          </div>
          <div class="ransom-tile">
            <div class="ransom-tile-label">Your files will be lost on</div>
            <div class="ransom-tile-date">5/19/2017 17:00:00</div>
            <div class="ransom-tile-sub">Time Left</div>
            <div class="ransom-tile-timer">${esc(timer2)}</div>
          </div>
          <div class="ransom-links">
            <div>About bitcoin</div>
            <div>How to buy bitcoins?</div>
            <div>Contact Us</div>
          </div>
        </div>
        <div class="ransom-right">
          <div class="ransom-headline">Ooops, your files have been encrypted!</div>
          <div class="ransom-faq">${esc(msg)}</div>
          <div class="ransom-pay">
            <div class="ransom-pay-label">Send ${esc(amount)} worth of bitcoin to this address:</div>
            <div class="ransom-pay-row">
              <span class="ransom-pay-icon">bitcoin<br>ACCEPTED HERE</span>
              <input class="ransom-pay-input" value="${esc(wallet)}" readonly tabindex="-1">
              <button class="ransom-pay-copy" tabindex="-1">Copy</button>
            </div>
            <div class="ransom-pay-buttons">
              <button class="ransom-pay-btn" tabindex="-1">Check Payment</button>
              <button class="ransom-pay-btn primary" tabindex="-1">Decrypt</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

// Minimalist "you are an idiot"-style prank popup. Subtler than the
// 90s shock-site original — small line-art smiley where the alert
// icon belongs, lowercase serif text, single OK button. The popup
// looks ALMOST like a normal browser dialog at first glance; the
// tells (smiley face, calm lowercase phrasing, no close X) only
// surface when the player slows down and reads carefully.
const IDIOT_FACE_SVG =
  '<svg viewBox="0 0 48 48" shape-rendering="geometricPrecision">' +
    '<circle cx="24" cy="24" r="20" fill="none" stroke="#000" stroke-width="2"/>' +
    '<circle cx="17" cy="20" r="2.5" fill="#000"/>' +
    '<circle cx="31" cy="20" r="2.5" fill="#000"/>' +
    '<path d="M14 28 Q24 36 34 28" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>' +
  '</svg>';

function renderIdiot(card) {
  return `
    <div class="idiot-popup">
      <div class="idiot-titlebar">
        <span class="idiot-title">${esc(card.title || "JavaScript Alert")}</span>
      </div>
      <div class="idiot-body">
        <div class="idiot-figure" aria-hidden="true">${IDIOT_FACE_SVG}</div>
        <div class="idiot-msg">${esc(card.message || "you are an idiot")}</div>
      </div>
      ${card.meta ? `<div class="idiot-meta">${esc(card.meta)}</div>` : ""}
      <div class="idiot-footer">
        <button class="idiot-ok" tabindex="-1">OK</button>
      </div>
    </div>
    <div class="row" style="gap:10px;margin-top:14px;justify-content:center;">
      <button class="btn danger big" data-action="virus">${card.labelReport || "Report"}</button>
      <button class="btn primary big" data-action="check">${card.labelOk || "OK"}</button>
    </div>`;
}

function renderCard(card) {
  switch (card.template) {
    case TPL.AV:       return renderAV(card);
    case TPL.BIOS:     return renderBIOS(card);
    case TPL.TERMINAL: return renderTerminal(card);
    case TPL.TOAST:    return renderToast(card);
    case TPL.DESKTOP:  return renderDesktop(card);
    case TPL.LOADING:  return renderLoading(card);
    case TPL.WIN311:   return renderWin311(card);
    case TPL.BSOD:     return renderBSOD(card);
    case TPL.NORTON:   return renderNorton(card);
    case TPL.MAC:      return renderMac(card);
    case TPL.CHAT:     return renderChat(card);
    case TPL.PHONE:    return renderPhone(card);
    case TPL.PRINT:    return renderPrint(card);
    case TPL.CAPTCHA:  return renderCaptcha(card);
    case TPL.UPDATE:   return renderUpdate(card);
    case TPL.EMAIL:    return renderEmail(card);
    case TPL.RANSOM:   return renderRansom(card);
    case TPL.IDIOT:    return renderIdiot(card);
    case TPL.WIN11:
    default:           return renderWin11(card);
  }
}

/* ============================================================
   VIEWS
   ============================================================ */
