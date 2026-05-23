// =====================================================
// views.js — top-level screens (menu, codex, play, breach, etc.)
// Plus creditzEarnedBlock + renderCodexEntries helpers.
// Depends on data.js, core.js, gameplay.js, templates.js
// =====================================================
"use strict";


function viewMenu() {
  const high = save.highestRound || 1;
  const bestScore = save.highestScore || 0;
  const unlockedCount = save.unlocked.length;
  const totalCount = Object.keys(VIRUSES).length;
  const lb = Leaderboard.load();

  const outcomeLabel = { win: "WIN", infected: "INF", "false-positive": "FP" };
  const outcomeCls   = { win: "win", infected: "infected", "false-positive": "fp" };
  const lbBody = lb.length === 0
    ? `<div class="lb-empty">No runs recorded yet.<br>Play a round to set a record.</div>`
    : `<div class="lb-list">
        ${lb.slice(0, 10).map((e, i) => {
          const diffLabel = {
            easy: "EASY", normal: "NORM", hard: "HARD",
            nightmare: "NMRE", challenge: "CHAL"
          }[e.difficulty] || "—";
          const diffCls = e.difficulty ? "diff-" + e.difficulty : "";
          return `
          <div class="lb-row rank-${i + 1} ${i === 0 ? "top" : ""}">
            <span class="lb-rank">${i === 0 ? "★" : (i + 1)}</span>
            <span class="lb-score">${Number(e.score || 0).toLocaleString()}</span>
            <span class="lb-diff ${diffCls}">${diffLabel}</span>
            <span class="lb-round">R${e.round || 1}</span>
            <span class="lb-outcome ${outcomeCls[e.outcome] || ""}">${outcomeLabel[e.outcome] || ""}</span>
          </div>`;
        }).join("")}
      </div>`;

  return `
    <div class="menu-row fade-in">
      <div class="panel center stack loose">
        <div class="stack tight">
          <div class="logo">THREATDETECT</div>
          <div class="tiny">SOC analyst training simulator</div>
        </div>
        <div class="stack tight" style="margin-top: 8px;">
          <button class="menu-btn" data-action="show-difficulty"><span>Play<div class="menu-sub">Pick difficulty · or jump into Training</div></span><span class="arrow">▶</span></button>
          <button class="menu-btn" data-action="play-challenge"><span>Challenge<div class="menu-sub">All 20 viruses from round 1 · denser threats · earlier UI tampering</div></span><span class="arrow">▶</span></button>
          <button class="menu-btn" data-action="codex"><span>Codex<div class="menu-sub">${unlockedCount}/${totalCount} threats discovered</div></span><span class="arrow">▶</span></button>
          <button class="menu-btn" data-action="minigame-practice"><span>Minigame Practice<div class="menu-sub">Train the quarantine minigame · no antivirus needed</div></span><span class="arrow">▶</span></button>
          <button class="menu-btn" data-action="shop"><span>Shop<div class="menu-sub">${(save.creditz || 0).toLocaleString()} ₢ available · coming soon</div></span><span class="arrow">▶</span></button>
          <button class="menu-btn" data-action="settings"><span>Settings<div class="menu-sub">Audio · photosensitivity · reset</div></span><span class="arrow">▶</span></button>
        </div>
        <div class="badge-row" style="justify-content: center; margin-top: 6px;">
          <span class="badge">Best round: ${high}/${CONFIG.totalRounds}</span>
          <span class="badge">Best score: ${bestScore.toLocaleString()}</span>
          <span class="badge" style="color: hsl(50 100% 65%); border-color: hsl(50 100% 50% / 0.4);">${(save.creditz || 0).toLocaleString()} ₢</span>
        </div>
      </div>
      <aside class="lb-panel">
        <h3 class="lb-title">Top Runs</h3>
        ${lbBody}
      </aside>
    </div>`;
}

function viewResetConfirm() {
  return `
    <div class="panel center stack fade-in">
      <h3 style="color: var(--destruct); letter-spacing: 0.3em;">⚠  RESET PROGRESS</h3>
      <h1 class="flicker" style="color: var(--destruct); text-shadow: 0 0 18px var(--destruct);">ARE YOU SURE?</h1>
      <div class="stack" style="max-width: 480px; margin: 0 auto; text-align: left;">
        <p class="mute" style="font-weight: 700; color: hsl(0 70% 78%);">This will permanently wipe:</p>
        <ul class="mute" style="line-height: 1.7; padding-left: 18px;">
          <li>Best round reached</li>
          <li>Best score</li>
          <li>Codex unlocks (back to 3 starter viruses)</li>
          <li>First-death NEW badges</li>
          <li>Nightmare difficulty unlock</li>
          <li>Audio, photosensitivity, and jumpscare settings</li>
        </ul>
        <p class="mute" style="font-weight: 700; color: hsl(140 70% 78%); margin-top: 10px;">This will keep:</p>
        <ul class="mute" style="line-height: 1.7; padding-left: 18px;">
          <li>Top Runs leaderboard (stored separately)</li>
        </ul>
        <p style="color: hsl(0 70% 75%); margin-top: 10px; font-weight: 700;">There is no undo.</p>
      </div>
      <div class="row center" style="margin-top: 12px;">
        <button class="btn danger" data-action="confirm-reset">Yes, Reset Everything</button>
        <button class="btn primary" data-action="cancel-reset">Cancel</button>
      </div>
    </div>`;
}

function viewDifficultyPicker() {
  const nightmareUnlocked = !!save.nightmareUnlocked;
  return `
    <div class="panel center stack loose fade-in">
      <h3 class="tiny" style="color: var(--primary);">SELECT DIFFICULTY</h3>
      <p class="mute">Higher difficulty = more viruses earlier + denser threats + stronger UI tampering. 1 life across all difficulties.</p>
      <div class="stack tight">
        <button class="menu-btn" data-action="start-difficulty" data-diff="easy">
          <span>Easy<div class="menu-sub">Mostly safe alerts · viruses gated 2 rounds later · gentle tampering</div></span>
          <span class="arrow">▶</span>
        </button>
        <button class="menu-btn" data-action="start-difficulty" data-diff="normal">
          <span>Normal<div class="menu-sub">The balanced run · viruses unlock as you climb · 20%→70% density</div></span>
          <span class="arrow">▶</span>
        </button>
        <button class="menu-btn" data-action="start-difficulty" data-diff="hard">
          <span>Hard<div class="menu-sub">All 20 viruses from round 1 · 40%→80% density · UI tampering kicks in early</div></span>
          <span class="arrow">▶</span>
        </button>
        <button class="menu-btn" data-action="start-difficulty" data-diff="nightmare" ${nightmareUnlocked ? "" : "disabled style='opacity:0.45;cursor:not-allowed;'"}>
          <span>Nightmare ${nightmareUnlocked ? '<span class="new-badge" style="background:#ff3344;color:#fff;border-color:#ff3344;box-shadow:0 0 0 2px rgba(0,0,0,0.6),0 0 16px #ff3344;">UNLOCKED</span>' : "🔒"}<div class="menu-sub">${nightmareUnlocked ? "60%→90% density · all viruses · tampering from round 1" : "Locked — reach round 3 on Normal or Hard to unlock"}</div></span>
          <span class="arrow">▶</span>
        </button>
        <div style="border-top: 1px dashed var(--border); margin: 6px 0; padding-top: 10px;">
          <button class="menu-btn" data-action="training" style="width: 100%;">
            <span>Training<div class="menu-sub">Pick a single virus · infinite lives · post-mortem on every miss</div></span>
            <span class="arrow">▶</span>
          </button>
        </div>
      </div>
      <div class="row center">
        <button class="btn" data-action="menu">Back</button>
      </div>
    </div>`;
}

function viewSettings() {
  const s = save.settings;
  return `
    <div class="panel stack fade-in">
      <div class="row between">
        <h2>Settings</h2>
        <button class="btn" data-action="menu">Back</button>
      </div>
      <div class="setting-row">
        <div><label>Master volume</label><div class="desc">Overall mix</div></div>
        <input class="slider" type="range" min="0" max="1" step="0.01" value="${s.master}" data-setting="master">
      </div>
      <div class="setting-row">
        <div><label>Ambient hum</label><div class="desc">Background drone during play</div></div>
        <input class="slider" type="range" min="0" max="1" step="0.01" value="${s.ambient}" data-setting="ambient">
      </div>
      <div class="setting-row">
        <div><label>SFX</label><div class="desc">Clicks, scream, reveal</div></div>
        <input class="slider" type="range" min="0" max="1" step="0.01" value="${s.sfx}" data-setting="sfx">
      </div>
      <div class="setting-row">
        <div><label>Photosensitive mode</label><div class="desc">Reduce flashing / strobe effects</div></div>
        <div class="toggle ${s.photosensitive ? "on" : ""}" data-action="toggle-photo"></div>
      </div>
      <div class="setting-row">
        <div><label>Jumpscares</label><div class="desc">Sudden loud horror sting + volume boost when a virus kills you</div></div>
        <div class="toggle ${s.jumpscares !== false ? "on" : ""}" data-action="toggle-jumpscares"></div>
      </div>
      <div class="setting-row">
        <div><label>Reset all progress</label><div class="desc">Wipes codex unlocks, best round, and settings</div></div>
        <button class="btn danger" data-action="reset">Reset</button>
      </div>
    </div>`;
}

function renderCodexEntries(opts) {
  opts = opts || {};
  const allowPreview = opts.allowPreview !== false; // sidebar during play passes false
  return Object.keys(VIRUSES).map(key => {
    const v = VIRUSES[key];
    const unlocked = save.unlocked.includes(key);
    const isOpen = state.openCodex === key;
    const filtered = state.codexFilter && state.codexFilter !== key;
    if (filtered) return "";
    const meterLabels = unlocked ? describeMeterEffect(v.meterEffect) : [];
    return `
      <div class="codex-entry v-${key} ${isOpen ? "open" : ""}">
        <div class="codex-head" data-action="toggle-entry" data-key="${key}">
          <span class="caret">▶</span>
          <span class="vname v-${key} ${unlocked ? "" : "locked"}">${unlocked ? esc(v.name) : "??????"}</span>
          <span class="tiny">${unlocked ? "Discovered" : "Locked"}</span>
        </div>
        <div class="codex-body">
          <p class="desc">${unlocked ? esc(v.description) : "Encounter and identify this threat to unlock its file."}</p>
          ${unlocked ? `<p class="tiny">How to identify</p><ul>${v.signs.map(s => `<li>${esc(s)}</li>`).join("")}</ul>${
            meterLabels.length ? `<p class="tiny" style="margin-top:10px;">Telemetry tampering</p><ul>${meterLabels.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""
          }${
            allowPreview ? `<button class="btn" data-action="preview-virus" data-key="${key}" style="margin-top:12px;">▶ Watch Death Animation</button>` : ""
          }` : ""}
        </div>
      </div>`;
  }).join("");
}

function viewCodex() {
  const list = renderCodexEntries();
  return `
    <div class="panel wide stack">
      <div class="row between">
        <h2>${state.codexFilter ? "Killer Threat File" : "Virus Codex"}</h2>
        <button class="btn" data-action="back-from-codex">Back</button>
      </div>
      <p class="mute">${state.codexFilter ? "The threat that ended your run." : `${save.unlocked.length}/${Object.keys(VIRUSES).length} threats discovered.`}</p>
      <div class="codex-list">${list}</div>
    </div>`;
}

function viewTrainingReveal() {
  const card = state.trainingReveal;
  const isVirus = card.isVirus;
  const v = isVirus ? VIRUSES[card.virusKey] : null;
  const textTells = isVirus ? textualTellsFor(card) : [];
  const fxTells = isVirus ? activeTells(card) : [];
  const cls = isVirus ? "v-" + card.virusKey : "";
  const tellsBody = isVirus
    ? `
      <div class="killer-tells">
        <div class="killer-tells-title">Why it was a virus</div>
        ${textTells.length ? `
          <div class="tells-section">
            <div class="tells-section-label">In the alert text:</div>
            <ul class="killer-tells-list">${textTells.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>` : ""}
        ${fxTells.length ? `
          <div class="tells-section">
            <div class="tells-section-label">How it visually misbehaved:</div>
            <ul class="killer-tells-list">${fxTells.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>` : ""}
        ${textTells.length + fxTells.length === 0 ? `
          <p class="mute" style="font-size:0.82rem;">No obvious tells on this variant — re-read the card carefully and study the codex profile.</p>` : ""}
      </div>`
    : `
      <div class="killer-tells safe">
        <div class="killer-tells-title">Why this was safe</div>
        <ul class="killer-tells-list">
          <li>No meter tampering — values stayed in normal range</li>
          <li>No flickering buttons, no panel tint, no border pulse</li>
          <li>Domain, version numbers, and process names looked legitimate</li>
          <li>No urgency tactics, no impossible claims, no payment demands</li>
        </ul>
      </div>`;
  return `
    <div class="panel center stack fade-in">
      <h3 style="color: ${isVirus ? "var(--destruct)" : "hsl(40 100% 60%)"};">YOU MISSED</h3>
      ${isVirus
        ? `<h1 class="${cls}">${esc(v.name)}</h1>
           <p class="mute" style="max-width:460px;margin:0 auto;">${esc(v.description)}</p>`
        : `<h1 style="color: hsl(40 100% 60%); text-shadow: 0 0 12px hsl(40 100% 40%);">FALSE POSITIVE</h1>
           <p class="mute">That alert was legitimate — you over-flagged it.</p>`}
      <div class="killer-display">
        <div class="killer-label tiny">The card that fooled you</div>
        <div class="killer-card">${renderCard(card)}</div>
      </div>
      ${tellsBody}
      <div class="row center">
        <button class="btn primary" data-action="training-continue">Continue Training</button>
        <button class="btn" data-action="menu">Exit to Menu</button>
      </div>
    </div>`;
}

function viewTraining() {
  if (state.trainingReveal) return viewTrainingReveal();
  if (!state.trainingVirus) {
    const entries = Object.keys(VIRUSES).map(key => {
      const v = VIRUSES[key];
      const cls = "v-" + key;
      const isDiscovered = save.unlocked.includes(key);
      const badge = isDiscovered ? "" : `<span class="badge" style="margin-left:8px;font-size:0.55rem;">NEW</span>`;
      return `
        <button class="menu-btn" data-action="train-pick" data-key="${key}">
          <span>
            <span class="${cls}" style="font-weight:700;">${esc(v.name)}${badge}</span>
            <div class="menu-sub">${esc(v.description.slice(0, 90))}${v.description.length > 90 ? "…" : ""}</div>
          </span>
          <span class="arrow">▶</span>
        </button>`;
    }).join("");
    return `
      <div class="panel wide stack fade-in">
        <div class="row between">
          <h2>Training</h2>
          <button class="btn" data-action="menu">Back</button>
        </div>
        <p class="mute">Pick a virus to practice against. Infinite lives. Mixed in with legitimate alerts.</p>
        <div class="stack tight">${entries}</div>
      </div>`;
  }
  return viewPlay(true);
}

function viewPlay(isTraining) {
  const card = state.deck[state.cardIdx];
  if (!card) return "";
  const hearts = "♥".repeat(state.lives) + "♡".repeat(Math.max(0, CONFIG.startLives - state.lives));
  const photo = save.settings.photosensitive;
  let tamperCls = "";
  if (state.tampering && !photo) {
    if (state.tampering.type === "pulse")     tamperCls = " tamper-pulse";
    if (state.tampering.type === "pulseHard") tamperCls = " tamper-pulse-hard";
    if (state.tampering.type === "shake")     tamperCls = " tamper-shake";
    if (state.tampering.type === "null")      tamperCls = " tamper-null";
  }
  // Swap visual: render the card then *flip* the button order by adding a flex-direction reverse class.
  const swap = state.tampering && state.tampering.type === "swap";
  const fxClasses = cardFxClasses(card);
  const panelBgFx = (card.isVirus && card.bgShift) ? " fx-bg-" + card.bgShift : "";
  const codexLabel = state.sideCodexOpen ? "Close" : "Codex";
  const codexIcon  = state.sideCodexOpen ? "✕"      : "📖";
  const hud = isTraining ? `
    <div class="hud" style="grid-template-columns: repeat(4, 1fr);">
      <div class="cell"><div class="label">Mode</div><div class="value">Training</div></div>
      <div class="cell"><div class="label">Target</div><div class="value v-${state.trainingVirus}">${esc(state.trainingVirus)}</div></div>
      <div class="cell"><div class="label">Streak</div><div class="value">×${state.trainingStreak}</div></div>
      <button class="cell" data-action="pause-codex" style="background:var(--muted);border:1px solid var(--border);color:var(--fg);"><div class="label">${codexLabel}</div><div class="value" style="font-size:1rem;">${codexIcon}</div></button>
      <button class="cell" data-action="menu" style="background:var(--muted);border:1px solid var(--border);color:var(--fg);"><div class="label">Exit</div><div class="value" style="font-size:1rem;">↩</div></button>
    </div>` : (() => {
      const av = save.antivirus || 0;
      const cols = av > 0 ? 6 : 5;
      const avCell = av > 0
        ? `<div class="cell"><div class="label">🛡 AV</div><div class="value" style="color: hsl(50 100% 70%);">${av}</div></div>`
        : "";
      return `
    <div class="hud" style="grid-template-columns: repeat(${cols}, 1fr);">
      <div class="cell"><div class="label">Score</div><div class="value">${state.score}</div></div>
      <div class="cell"><div class="label">Round</div><div class="value">${state.round}/${CONFIG.totalRounds}</div></div>
      <div class="cell"><div class="label">Life</div><div class="value" style="color:var(--primary);text-shadow:0 0 8px rgba(255,80,80,0.4);">${hearts}</div></div>
      ${avCell}
      <button class="cell" data-action="pause-codex" style="background:var(--muted);border:1px solid var(--border);color:var(--fg);"><div class="label">${codexLabel}</div><div class="value" style="font-size:1rem;">${codexIcon}</div></button>
      <button class="cell" data-action="menu" style="background:var(--muted);border:1px solid var(--border);color:var(--fg);"><div class="label">Exit</div><div class="value" style="font-size:1rem;">↩</div></button>
    </div>`;
    })();
  const meters = `
    <div class="meters" aria-label="System telemetry">
      <div class="meter"><span class="m-label">FPS</span><span class="m-val" data-m="fps">60</span></div>
      <div class="meter"><span class="m-label">PING</span><span class="m-val" data-m="ping">24</span><span class="m-unit">ms</span></div>
      <div class="meter"><span class="m-label">CPU</span><span class="m-val" data-m="cpu">47</span><span class="m-unit">°C</span></div>
      <div class="meter"><span class="m-label">VOL</span><span class="m-val" data-m="vol">72</span><span class="m-unit">%</span></div>
      <div class="meter"><span class="m-label">SYS</span><span class="m-val" data-m="time">14:23:07</span></div>
    </div>`;
  const sidebar = state.sideCodexOpen ? `
    <aside class="codex-side panel stack">
      <div class="row between">
        <h3 style="margin:0;">Codex</h3>
        <button class="btn" data-action="close-side-codex">Close</button>
      </div>
      <p class="mute" style="font-size:0.8rem;">${save.unlocked.length}/${Object.keys(VIRUSES).length} discovered.</p>
      <div class="codex-list">${renderCodexEntries({ allowPreview: false })}</div>
    </aside>` : "";
  return `
    <div class="panel stack fade-in${panelBgFx}">
      ${hud}
      ${meters}
      <div class="row between">
        <span class="tiny">${isTraining ? "Repeat as needed" : `Card ${state.cardIdx + 1} / ${state.deck.length}`}</span>
        <span class="tiny">${isTraining ? `Best streak this session: ×${state.trainingStreak}` : `Streak ×${state.streak}`}</span>
      </div>
      <div class="card-wrap${tamperCls}${fxClasses}" ${swap ? "style='direction:rtl;'" : ""}>${renderCard(card)}</div>
    </div>
    ${sidebar}`;
}

function creditzEarnedBlock() {
  const total = state.lastRunCreditz || 0;
  const roundEarned = state.runCreditz || 0;
  const scoreEarned = Math.max(0, total - roundEarned);
  return `
    <div class="killer-tells" style="border-left-color: hsl(50 100% 60%);">
      <div class="killer-tells-title" style="color: hsl(50 100% 70%);">Creditz earned</div>
      <div class="row between" style="font-size:0.85rem; margin-top:4px;">
        <span class="mute">Round bonuses</span>
        <strong>${roundEarned.toLocaleString()} ₢</strong>
      </div>
      <div class="row between" style="font-size:0.85rem;">
        <span class="mute">Score bonus (1 ₢ per 100 pts)</span>
        <strong>${scoreEarned.toLocaleString()} ₢</strong>
      </div>
      <div class="row between" style="font-size:1.05rem; margin-top:6px; padding-top:6px; border-top:1px solid var(--border);">
        <strong>Total this run</strong>
        <strong style="color: hsl(50 100% 65%);">+${total.toLocaleString()} ₢</strong>
      </div>
      <div class="tiny" style="margin-top:6px;">Wallet: ${(save.creditz || 0).toLocaleString()} ₢</div>
    </div>`;
}


/* viewMinigame and viewMinigamePick* live in minigames.js */

function viewShop() {
  const wallet = save.creditz || 0;
  const itemsHtml = SHOP_ITEMS.map(item => {
    const owned = (save[item.id] || 0);
    const canAfford = wallet >= item.price;
    return `
      <div class="shop-item">
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-body">
          <div class="shop-item-head">
            <span class="shop-item-name">${esc(item.name)}</span>
            <span class="shop-item-price">${item.price} ₢</span>
          </div>
          <div class="shop-item-desc">${esc(item.description)}</div>
          <div class="shop-item-foot">
            <span class="tiny">Owned: <strong>${owned}</strong></span>
            <button class="btn primary" data-action="buy-item" data-item="${item.id}" ${canAfford ? "" : "disabled style='opacity:0.45;cursor:not-allowed;'"}>
              ${canAfford ? "Buy" : "Not enough ₢"}
            </button>
          </div>
        </div>
      </div>`;
  }).join("");
  return `
    <div class="panel wide center stack fade-in">
      <div class="row between" style="width:100%;">
        <h2 style="margin:0;">Shop</h2>
        <button class="btn" data-action="menu">Back</button>
      </div>
      <div class="cell" style="display:inline-block; padding: 12px 22px; margin: 0 auto;">
        <div class="label">Wallet</div>
        <div class="value" style="font-size: 1.6rem; color: hsl(50 100% 65%); text-shadow: 0 0 12px hsl(50 100% 40% / 0.5);">${wallet.toLocaleString()} ₢</div>
      </div>
      <div class="shop-list">${itemsHtml}</div>
    </div>`;
}

function viewEpilepsyWarning() {
  return `
    <div class="panel center stack fade-in">
      <h3 style="color: hsl(40 100% 65%); letter-spacing: 0.3em;">PHOTOSENSITIVITY WARNING</h3>
      <h1 class="flicker" style="color: hsl(40 100% 65%); text-shadow: 0 0 18px hsl(40 100% 45%);">EPILEPSY ADVISORY</h1>
      <div class="stack" style="max-width: 480px; margin: 0 auto; text-align: left;">
        <p class="mute">This game contains:</p>
        <ul class="mute" style="line-height: 1.7; padding-left: 18px;">
          <li>Rapid flashing lights and full-screen strobe effects</li>
          <li>Sudden loud audio cues during threat reveals</li>
          <li>Aggressive visual distortion during death sequences</li>
          <li>Color shifts and brightness pulses across the UI</li>
        </ul>
        <p class="mute">If you have a history of epilepsy, photosensitive seizures, or visual triggers, close this tab now. Otherwise, you can enable <strong>Photosensitive Mode</strong> in Settings to reduce flashing.</p>
      </div>
      <div class="row center" style="margin-top: 12px;">
        <button class="btn primary" data-action="confirm-warning">I Understand · Continue</button>
      </div>
    </div>`;
}

function viewDying() {
  const k = state.killer;
  const photoCls = save.settings.photosensitive ? " photo-safe" : "";
  return `
    <div class="death-stage death-${k}${photoCls}">
      <div class="death-fx"></div>
      <button class="btn death-skip" data-action="skip-death">Skip →</button>
    </div>`;
}

function viewPreview() {
  const k = state.previewVirus;
  const photoCls = save.settings.photosensitive ? " photo-safe" : "";
  return `
    <div class="death-stage death-${k}${photoCls}">
      <div class="death-fx"></div>
      <button class="btn death-skip" data-action="back-from-preview">← Back to Codex</button>
    </div>`;
}

function viewInfected() {
  const v = state.killer ? VIRUSES[state.killer] : null;
  const cls = state.killer ? "v-" + state.killer : "";
  const card = state.killerCard;
  const textTells = textualTellsFor(card);
  const fxTells = activeTells(card);
  const hasAnyTell = textTells.length + fxTells.length > 0;
  const photoCls = save.settings.photosensitive ? " photo-safe" : "";
  return `
    <div class="breach-stage">
      ${state.killer ? `<div class="breach-anim"><div class="death-${state.killer}${photoCls}"><div class="death-fx"></div></div></div>` : ""}
      <div class="breach-content panel center stack">
        <h3 style="color: var(--destruct)">SYSTEM BREACH</h3>
        <h1 class="glitch ${cls}">INFECTED</h1>
        ${v ? `<h2 class="${cls}">${esc(v.name)}${state.firstDeath ? ' <span class="new-badge">NEW</span>' : ''}</h2><p class="mute" style="max-width:460px;margin:0 auto;">${esc(v.description)}</p>` : ""}
        ${card ? `
          <div class="killer-display">
            <div class="killer-label tiny">The alert that fooled you</div>
            <div class="killer-card">${renderCard(card)}</div>
          </div>` : ""}
        ${hasAnyTell ? `
          <div class="killer-tells">
            <div class="killer-tells-title">Why it was a virus</div>
            ${textTells.length ? `
              <div class="tells-section">
                <div class="tells-section-label">In the alert text:</div>
                <ul class="killer-tells-list">
                  ${textTells.map(t => `<li>${esc(t)}</li>`).join("")}
                </ul>
              </div>` : ""}
            ${fxTells.length ? `
              <div class="tells-section">
                <div class="tells-section-label">How it visually misbehaved:</div>
                <ul class="killer-tells-list">
                  ${fxTells.map(t => `<li>${esc(t)}</li>`).join("")}
                </ul>
              </div>` : ""}
            ${textTells.length === 0 && fxTells.length === 0 ? `
              <p class="mute" style="font-size:0.82rem;">This one looked clean. The only giveaway was buried in the details — re-read the popup above carefully.</p>` : ""}
          </div>` : `
          <div class="killer-tells">
            <div class="killer-tells-title">Why it was a virus</div>
            <p class="mute" style="font-size:0.82rem;">This variant has no obvious tells — that's why MIMIC and stealthy viruses are dangerous. Study the codex entry to learn what to look for next time.</p>
          </div>`}
        <div class="hud" style="margin-top: 8px;">
          <div class="cell"><div class="label">Score</div><div class="value">${state.score}</div></div>
          <div class="cell"><div class="label">Threats</div><div class="value">${state.threatsNeutralized || 0}</div></div>
          <div class="cell"><div class="label">Round</div><div class="value">${state.round}</div></div>
        </div>
        ${creditzEarnedBlock()}
        <div class="row center">
          <button class="btn primary" data-action="play">Try Again</button>
          <button class="btn" data-action="study-killer">Study This Threat</button>
          <button class="btn" data-action="menu">Main Menu</button>
        </div>
      </div>
    </div>`;
}

function viewFalsePositive() {
  const fp = state.falsePositive;
  const accuracy = state.total ? Math.round(state.correct / state.total * 100) : 0;
  return `
    <div class="panel center stack fade-in">
      <h3 style="color: hsl(40 100% 60%);">COMPLIANCE FLAG</h3>
      <h1 style="color: hsl(40 100% 60%); text-shadow: 0 0 16px hsl(40 100% 40%);">FALSE POSITIVE</h1>
      <p class="mute" style="max-width: 460px; margin: 0 auto;">
        You quarantined a legitimate system process. Help desk got buried in tickets, and the auditor is asking questions.
      </p>
      ${fp ? `
        <div class="killer-display">
          <div class="killer-label tiny">The alert you wrongly reported</div>
          <div class="killer-card">${renderCard(fp)}</div>
        </div>
        <div class="killer-tells safe">
          <div class="killer-tells-title">Why this was safe</div>
          <ul class="killer-tells-list">
            <li>No meter tampering — values stayed in normal range</li>
            <li>No flickering buttons, no panel tint, no border pulse</li>
            <li>Domains, version numbers, and process names looked legitimate</li>
            <li>No urgency tactics, no impossible claims, no Bitcoin demands</li>
          </ul>
        </div>` : ""}
      <div class="hud" style="margin-top: 8px;">
        <div class="cell"><div class="label">Score</div><div class="value">${state.score}</div></div>
        <div class="cell"><div class="label">Round</div><div class="value">${state.round}</div></div>
      </div>
      ${creditzEarnedBlock()}
      <div class="row center">
        <button class="btn primary" data-action="play">Try Again</button>
        <button class="btn" data-action="menu">Main Menu</button>
      </div>
    </div>`;
}

function viewWin() {
  return `
    <div class="panel center stack fade-in">
      <h3 style="color: var(--primary)">SHIFT COMPLETE</h3>
      <h1 class="pulse">SYSTEM SECURE</h1>
      <p class="mute">All ${CONFIG.totalRounds} rounds cleared. The network is yours.</p>
      <div class="hud">
        <div class="cell"><div class="label">Score</div><div class="value">${state.score}</div></div>
        <div class="cell"><div class="label">Codex</div><div class="value">${save.unlocked.length}/${Object.keys(VIRUSES).length}</div></div>
      </div>
      ${creditzEarnedBlock()}
      <div class="row center">
        <button class="btn primary" data-action="play">Play Again</button>
        <button class="btn" data-action="codex">Codex</button>
        <button class="btn" data-action="menu">Main Menu</button>
      </div>
    </div>`;
}

/* ============================================================
   ROUTER
   ============================================================ */
