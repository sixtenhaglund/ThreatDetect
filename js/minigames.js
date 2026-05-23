// =====================================================
// minigames.js — antivirus minigames + practice mode
// Three types: "quarantine" (click skulls), "sequence" (Simon-says),
//              "impostor" (find the odd icon out).
// Antivirus picks one at random; practice mode lets you choose
// difficulty AND type then loops that pairing.
// Depends on config.js (CONFIG), core.js (showCreditzToast),
//           gameplay.js (state, nextCard, triggerEndOfRun), audio.js (Audio).
// =====================================================
"use strict";

const MINIGAME_TYPES = ["quarantine", "sequence", "impostor"];

const MINIGAME_LABELS = {
  quarantine: { name: "Quarantine",  emoji: "🛡", desc: "Click every skull before the timer hits zero." },
  sequence:   { name: "Sequence",    emoji: "🎵", desc: "Watch the colored buttons light up, then repeat the order." },
  impostor:   { name: "Impostor",    emoji: "🔍", desc: "Spot the icon that doesn't match the rest. Click it fast." }
};

const TRAINING_STATS_DEFAULT = { wins: 0, losses: 0, bestTimeMs: null };

/* ============================================================
   ENTRY POINTS
   ============================================================ */

/* In-run: antivirus triggers, pick a random minigame and run it.
   Harder difficulties require multiple back-to-back minigames (with random types). */
function startRandomAntivirusMinigame(savedCard) {
  const diff = state.gameMode === "challenge" ? "challenge" : (state.difficulty || "normal");
  const row = CONFIG.minigameByDifficulty[diff] || CONFIG.minigameByDifficulty.normal;
  const totalRounds = row.rounds || 1;
  const type = MINIGAME_TYPES[Math.floor(Math.random() * MINIGAME_TYPES.length)];
  startMinigameOfType(type, { savedCard, totalRounds, currentRound: 1 });
}

/* Training: user already picked type + difficulty in the practice flow. */
function startTrainingMinigame() {
  state.minigameStats = state.minigameStats || Object.assign({}, TRAINING_STATS_DEFAULT);
  const type = state.minigameTrainingType;
  const reqs = { training: true };
  // "random" loops with a fresh random pick each round
  if (type === "random") {
    const t = MINIGAME_TYPES[Math.floor(Math.random() * MINIGAME_TYPES.length)];
    startMinigameOfType(t, reqs);
  } else {
    startMinigameOfType(type, reqs);
  }
}

/* ============================================================
   COMMON LIFECYCLE
   ============================================================ */

function startMinigameOfType(type, opts) {
  opts = opts || {};
  unlockAudio();
  const diff = opts.training
    ? (state.minigameTrainingDifficulty || "normal")
    : (state.gameMode === "challenge" ? "challenge" : (state.difficulty || "normal"));
  const row = CONFIG.minigameByDifficulty[diff] || CONFIG.minigameByDifficulty.normal;
  const cfg = row[type] || { n: 5, t: 6 };

  // Per-type state setup
  if      (type === "quarantine") setupQuarantine(cfg);
  else if (type === "sequence")   setupSequence(cfg);
  else if (type === "impostor")   setupImpostor(cfg);
  else                            setupQuarantine(cfg);

  // Common fields
  state.minigame.type         = type;
  state.minigame.training     = !!opts.training;
  state.minigame.savedCard    = opts.savedCard || null;
  state.minigame.difficulty   = diff;
  state.minigame.totalRounds  = opts.totalRounds || 1;
  state.minigame.currentRound = opts.currentRound || 1;

  state.screen = "minigame";
  render();
  Audio.click();

  // Sequence starts in a "showing" phase — start playback after the view paints.
  if (type === "sequence") setTimeout(showNextSequenceStep, 600);

  // Common countdown timer
  state.minigame.interval = setInterval(() => {
    if (!state.minigame || !state.minigame.active) return;
    state.minigame.timeLeft -= 0.1;
    const el = document.getElementById("mg-timer");
    if (el) el.textContent = Math.max(0, state.minigame.timeLeft).toFixed(1);
    if (state.minigame.timeLeft <= 0) failMinigame();
  }, 100);
}

function winMinigame() {
  const mg = state.minigame;
  if (!mg) return;
  mg.active = false;
  if (mg.interval) clearInterval(mg.interval);
  const elapsedMs = Date.now() - mg.startTime;
  Audio.correct();
  if (mg.training) {
    const stats = state.minigameStats;
    stats.wins++;
    if (stats.bestTimeMs === null || elapsedMs < stats.bestTimeMs) stats.bestTimeMs = elapsedMs;
    state.minigame = null;
    startTrainingMinigame(); // loop with same chosen type + difficulty
    return;
  }
  // In-run antivirus: more rounds to clear?
  if (mg.currentRound < mg.totalRounds) {
    const next = mg.currentRound + 1;
    const card = mg.savedCard;
    state.minigame = null;
    // Pick a fresh random minigame type for variety in multi-round runs.
    const type = MINIGAME_TYPES[Math.floor(Math.random() * MINIGAME_TYPES.length)];
    startMinigameOfType(type, { savedCard: card, totalRounds: mg.totalRounds, currentRound: next });
    return;
  }
  // All rounds cleared.
  const card = mg.savedCard;
  state.minigame = null;
  state.screen = "play";
  showCreditzToast("🛡 Quarantined", card.virusKey + " · antivirus consumed");
  nextCard();
}

function failMinigame() {
  const mg = state.minigame;
  if (!mg) return;
  mg.active = false;
  if (mg.interval) clearInterval(mg.interval);
  if (mg.training) {
    state.minigameStats.losses++;
    state.minigame = null;
    startTrainingMinigame();
    return;
  }
  const card = mg.savedCard;
  state.minigame = null;
  state.lives = 0;
  triggerEndOfRun(card);
}

/* ============================================================
   QUARANTINE — click N skulls scattered on the field
   ============================================================ */

function setupQuarantine(cfg) {
  const targets = [];
  for (let i = 0; i < cfg.n; i++) {
    targets.push({
      x: 10 + Math.random() * 80,
      y: 18 + Math.random() * 68,
      hit: false
    });
  }
  state.minigame = {
    active: true,
    targets,
    hits: 0,
    needed: cfg.n,
    timeLeft: cfg.t,
    startTime: Date.now()
  };
}

function hitQuarantineTarget(idx) {
  const mg = state.minigame;
  if (!mg || !mg.active || mg.type !== "quarantine") return;
  const t = mg.targets[idx];
  if (!t || t.hit) return;
  t.hit = true;
  mg.hits++;
  Audio.correct();
  const node = document.querySelector('[data-mg-target="' + idx + '"]');
  if (node) node.classList.add("hit");
  const left = document.getElementById("mg-remaining");
  if (left) left.textContent = (mg.needed - mg.hits);
  if (mg.hits >= mg.needed) winMinigame();
}

/* ============================================================
   SEQUENCE — Simon-says: 4 colored buttons light up in a pattern,
              player taps them back in the same order
   ============================================================ */

const SEQUENCE_COLORS = [
  { bg: "#000000", lit: "#3f3f3f", freq: 392 },  // red    — G
  { bg: "#ffffff", lit: "#ffffff", freq: 494 },  // green  — B
  { bg: "#008507", lit: "#09aa04", freq: 587 },  // blue   — D
  { bg: "#797979", lit: "#8b774d", freq: 698 }   // yellow — F
];

function setupSequence(cfg) {
  const sequence = [];
  for (let i = 0; i < cfg.n; i++) sequence.push(Math.floor(Math.random() * 4));
  state.minigame = {
    active: true,
    sequence,
    inputIdx: 0,
    phase: "showing",
    showStep: 0,
    timeLeft: cfg.t,
    startTime: Date.now()
  };
}

function showNextSequenceStep() {
  const mg = state.minigame;
  if (!mg || !mg.active || mg.phase !== "showing") return;
  if (mg.showStep >= mg.sequence.length) {
    mg.phase = "input";
    // Flip the .seq-pad class so CSS knows buttons are now clickable
    // (enables hover, glow pulse, pointer cursor) + announce the turn change.
    const pad = document.querySelector(".seq-pad");
    if (pad) { pad.classList.remove("showing"); pad.classList.add("input"); }
    const status = document.getElementById("seq-status");
    if (status) { status.textContent = "▶ YOUR TURN — click the colors in order"; status.classList.add("active"); }
    return;
  }
  const idx = mg.sequence[mg.showStep];
  const btn = document.querySelector('[data-seq-btn="' + idx + '"]');
  if (btn) btn.classList.add("lit");
  const c = SEQUENCE_COLORS[idx];
  if (Audio.ctx) {
    const o = Audio.ctx.createOscillator(); o.type = "sine"; o.frequency.value = c.freq;
    const g = Audio.ctx.createGain();
    o.connect(g); g.connect(Audio.sfxGain);
    const t = Audio.ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.start(t); o.stop(t + 0.45);
  }
  setTimeout(() => {
    if (btn) btn.classList.remove("lit");
    mg.showStep++;
    setTimeout(showNextSequenceStep, 220);
  }, 480);
}

function hitSequenceBtn(idx) {
  const mg = state.minigame;
  if (!mg || !mg.active || mg.type !== "sequence" || mg.phase !== "input") return;
  const expected = mg.sequence[mg.inputIdx];
  const btn = document.querySelector('[data-seq-btn="' + idx + '"]');
  if (btn) {
    btn.classList.add("lit");
    setTimeout(() => btn.classList.remove("lit"), 200);
  }
  if (idx !== expected) {
    Audio.wrong();
    return failMinigame();
  }
  const c = SEQUENCE_COLORS[idx];
  if (Audio.ctx) {
    const o = Audio.ctx.createOscillator(); o.type = "sine"; o.frequency.value = c.freq;
    const g = Audio.ctx.createGain();
    o.connect(g); g.connect(Audio.sfxGain);
    const t = Audio.ctx.currentTime;
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.start(t); o.stop(t + 0.3);
  }
  mg.inputIdx++;
  const progress = document.getElementById("seq-progress");
  if (progress) progress.textContent = mg.inputIdx + "/" + mg.sequence.length;
  if (mg.inputIdx >= mg.sequence.length) winMinigame();
}

/* ============================================================
   IMPOSTOR — N icons in a grid, one is different. Click it.
   ============================================================ */

const IMPOSTOR_GLYPHS = ["☠", "⚠", "✖", "⛔", "❌", "🛑"];
const IMPOSTOR_BASE_COLOR = "#ff5566";
const IMPOSTOR_ALT_COLORS = ["#66ff99", "#ffff66", "#66aaff", "#ff99ee", "#ffaa44", "#aa66ff"];

function setupImpostor(cfg) {
  const baseGlyph = IMPOSTOR_GLYPHS[Math.floor(Math.random() * IMPOSTOR_GLYPHS.length)];
  const impostorIdx = Math.floor(Math.random() * cfg.n);
  let impostorGlyph = baseGlyph;
  let impostorColor = IMPOSTOR_BASE_COLOR;
  // Half the time it's a glyph swap, half the time it's a color swap.
  if (Math.random() < 0.5) {
    do { impostorGlyph = IMPOSTOR_GLYPHS[Math.floor(Math.random() * IMPOSTOR_GLYPHS.length)]; } while (impostorGlyph === baseGlyph);
  } else {
    impostorColor = IMPOSTOR_ALT_COLORS[Math.floor(Math.random() * IMPOSTOR_ALT_COLORS.length)];
  }
  const icons = [];
  for (let i = 0; i < cfg.n; i++) {
    icons.push({
      glyph: i === impostorIdx ? impostorGlyph : baseGlyph,
      color: i === impostorIdx ? impostorColor : IMPOSTOR_BASE_COLOR
    });
  }
  state.minigame = {
    active: true,
    icons,
    impostorIdx,
    timeLeft: cfg.t,
    startTime: Date.now()
  };
}

function hitImpostorIcon(idx) {
  const mg = state.minigame;
  if (!mg || !mg.active || mg.type !== "impostor") return;
  if (idx === mg.impostorIdx) {
    winMinigame();
  } else {
    Audio.wrong();
    failMinigame();
  }
}

/* ============================================================
   VIEWS
   ============================================================ */

function viewMinigame() {
  const mg = state.minigame;
  if (!mg) return "";
  const isTraining = !!mg.training;
  const stats = state.minigameStats || TRAINING_STATS_DEFAULT;
  const labels = MINIGAME_LABELS[mg.type] || { name: "Minigame", emoji: "🎮", desc: "" };

  const trainingStrip = isTraining ? `
    <div class="hud" style="grid-template-columns: repeat(3, 1fr); max-width: 460px; margin: 8px auto 0;">
      <div class="cell"><div class="label">Wins</div><div class="value" style="color: var(--primary);">${stats.wins}</div></div>
      <div class="cell"><div class="label">Losses</div><div class="value" style="color: var(--destruct);">${stats.losses}</div></div>
      <div class="cell"><div class="label">Best</div><div class="value">${stats.bestTimeMs !== null ? (stats.bestTimeMs / 1000).toFixed(2) + "s" : "—"}</div></div>
    </div>` : "";

  const exitBtn = isTraining
    ? `<div class="row center" style="margin-top:8px;"><button class="btn" data-action="exit-minigame-training">Exit Practice</button></div>`
    : "";

  let body = "";
  if      (mg.type === "quarantine") body = viewMG_Quarantine(mg);
  else if (mg.type === "sequence")   body = viewMG_Sequence(mg);
  else if (mg.type === "impostor")   body = viewMG_Impostor(mg);

  // Show round counter in multi-round antivirus runs (Normal+ difficulty).
  const roundStrip = (!isTraining && mg.totalRounds > 1) ? `
    <div class="mg-rounds">
      Round <strong>${mg.currentRound}</strong> of <strong>${mg.totalRounds}</strong> — clear them all to quarantine
    </div>` : "";
  return `
    <div class="minigame-stage">
      <div class="minigame-header">
        <h3 style="margin:0; color: var(--primary); letter-spacing: 0.3em;">${isTraining ? "🎯 PRACTICE · " + (mg.difficulty || "").toUpperCase() : "🛡 ANTIVIRUS DEPLOYED"}</h3>
        <h1 style="margin: 6px 0;">${labels.emoji} ${labels.name.toUpperCase()}</h1>
        <p class="mute">${esc(labels.desc)}</p>
        ${roundStrip}
        ${trainingStrip}
        ${exitBtn}
      </div>
      ${body}
    </div>`;
}

function viewMG_Quarantine(mg) {
  return `
    <div class="hud" style="grid-template-columns: 1fr 1fr; max-width: 360px; margin: 0 auto 8px;">
      <div class="cell"><div class="label">Left</div><div class="value" id="mg-remaining">${mg.needed - mg.hits}</div></div>
      <div class="cell"><div class="label">Time</div><div class="value" id="mg-timer">${mg.timeLeft.toFixed(1)}</div></div>
    </div>
    <div class="minigame-field">
      ${mg.targets.map((t, i) => `
        <button class="minigame-target ${t.hit ? "hit" : ""}"
                data-action="mg-hit" data-target="${i}" data-mg-target="${i}"
                style="left:${t.x}%; top:${t.y}%;">☠</button>
      `).join("")}
    </div>`;
}

function viewMG_Sequence(mg) {
  const phaseCls = mg.phase === "input" ? "input" : "showing";
  const activeCls = mg.phase === "input" ? " active" : "";
  const statusText = mg.phase === "input"
    ? "▶ YOUR TURN — click the colors in order"
    : "⏳ WATCH — buttons will light up";
  return `
    <div class="hud" style="grid-template-columns: 1fr 1fr 1fr; max-width: 480px; margin: 0 auto 8px;">
      <div class="cell"><div class="label">Length</div><div class="value">${mg.sequence.length}</div></div>
      <div class="cell"><div class="label">Progress</div><div class="value" id="seq-progress">${mg.inputIdx}/${mg.sequence.length}</div></div>
      <div class="cell"><div class="label">Time</div><div class="value" id="mg-timer">${mg.timeLeft.toFixed(1)}</div></div>
    </div>
    <div class="seq-status${activeCls}" id="seq-status">${statusText}</div>
    <div class="seq-pad ${phaseCls}">
      ${SEQUENCE_COLORS.map((c, i) => `
        <button class="seq-btn" data-action="seq-hit" data-seq-btn="${i}"
                style="background:${c.bg};"></button>
      `).join("")}
    </div>`;
}

function viewMG_Impostor(mg) {
  return `
    <div class="hud" style="grid-template-columns: 1fr 1fr; max-width: 360px; margin: 0 auto 8px;">
      <div class="cell"><div class="label">Icons</div><div class="value">${mg.icons.length}</div></div>
      <div class="cell"><div class="label">Time</div><div class="value" id="mg-timer">${mg.timeLeft.toFixed(1)}</div></div>
    </div>
    <div class="impostor-grid">
      ${mg.icons.map((ic, i) => `
        <button class="impostor-cell" data-action="impostor-hit" data-impostor-idx="${i}" style="color:${ic.color};">
          ${ic.glyph}
        </button>
      `).join("")}
    </div>`;
}

/* Step 1 of practice: pick difficulty */
function viewMinigamePickDifficulty() {
  const diffs = [
    { id: "easy",      label: "Easy",      sub: "small + slow" },
    { id: "normal",    label: "Normal",    sub: "standard" },
    { id: "hard",      label: "Hard",      sub: "denser + faster" },
    { id: "nightmare", label: "Nightmare", sub: "near-impossible" },
    { id: "challenge", label: "Challenge", sub: "challenge-mode tuning" }
  ];
  return `
    <div class="panel center stack fade-in">
      <div class="row between" style="width:100%;">
        <h2 style="margin:0;">Minigame Practice</h2>
        <button class="btn" data-action="menu">Back</button>
      </div>
      <p class="mute">Step 1 / 2 — pick a difficulty. Affects timer + complexity.</p>
      <div class="stack tight" style="max-width:520px; margin:0 auto; width:100%;">
        ${diffs.map(d => `
          <button class="menu-btn" data-action="mg-pick-difficulty" data-diff="${d.id}">
            <span><strong>${d.label}</strong><div class="menu-sub">${d.sub}</div></span>
            <span class="arrow">▶</span>
          </button>`).join("")}
      </div>
    </div>`;
}

/* Step 2 of practice: pick which minigame */
function viewMinigamePickType() {
  const diff = state.minigameTrainingDifficulty || "normal";
  const types = ["random"].concat(MINIGAME_TYPES);
  return `
    <div class="panel center stack fade-in">
      <div class="row between" style="width:100%;">
        <h2 style="margin:0;">Minigame Practice — ${diff}</h2>
        <button class="btn" data-action="minigame-practice">← Back</button>
      </div>
      <p class="mute">Step 2 / 2 — pick which minigame to drill. Practice loops on win/fail.</p>
      <div class="stack tight" style="max-width:520px; margin:0 auto; width:100%;">
        ${types.map(t => {
          const meta = t === "random"
            ? { name: "Random",  emoji: "🎲", desc: "Picks a different minigame each round." }
            : MINIGAME_LABELS[t];
          return `
            <button class="menu-btn" data-action="mg-pick-type" data-type="${t}">
              <span><strong>${meta.emoji} ${meta.name}</strong><div class="menu-sub">${esc(meta.desc)}</div></span>
              <span class="arrow">▶</span>
            </button>`;
        }).join("")}
      </div>
    </div>`;
}
