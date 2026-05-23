// =====================================================
// core.js — helpers, Save/Leaderboard, creditz, tells
// Depends on data.js. Defines: esc, shuffle, rand, formatDate,
//   Save, Leaderboard, save, unlockVirus, recordRun, creditz,
//   showCreditzToast, describeMeterEffect, activeTells, textualTellsFor
// =====================================================
"use strict";

/* ---- Basic utility helpers (used everywhere) ---- */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const SAVE_KEY = "threatdetect_save_v1";

const Save = {
  defaults() {
    return {
      highestRound: 1,
      highestScore: 0,
      unlocked: CONFIG.starterUnlocked.slice(),
      deathsBy: [],
      nightmareUnlocked: false,
      creditz: 0,
      antivirus: 0,
      settings: { master: 0.8, ambient: 0.4, sfx: 0.8, photosensitive: false, jumpscares: true }
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return Save.defaults();
      const parsed = JSON.parse(raw);
      const d = Save.defaults();
      // If a previous version had a leaderboard inside the main save,
      // migrate it into the standalone leaderboard store and strip it from here.
      if (Array.isArray(parsed.leaderboard) && parsed.leaderboard.length) {
        const existing = Leaderboard.load();
        const merged = existing.concat(parsed.leaderboard);
        merged.sort((a, b) => (b.score || 0) - (a.score || 0));
        Leaderboard.write(merged.slice(0, 10));
      }
      return {
        highestRound: parsed.highestRound || d.highestRound,
        highestScore: parsed.highestScore || d.highestScore,
        unlocked: parsed.unlocked || d.unlocked,
        deathsBy: Array.isArray(parsed.deathsBy) ? parsed.deathsBy : d.deathsBy,
        nightmareUnlocked: !!parsed.nightmareUnlocked,
        creditz: typeof parsed.creditz === "number" ? parsed.creditz : d.creditz,
        antivirus: typeof parsed.antivirus === "number" ? parsed.antivirus : d.antivirus,
        settings: Object.assign(d.settings, parsed.settings || {})
      };
    } catch (e) { return Save.defaults(); }
  },
  write(s) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) {}
  },
  reset() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  }
};

/* Leaderboard lives in its OWN localStorage key so it survives Save.reset().
   Personal stats (best round, best score) are still wiped — only the top-runs list is global. */
const LB_KEY = "threatdetect_leaderboard_v2";
const Leaderboard = {
  load() {
    try {
      const raw = localStorage.getItem(LB_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  },
  write(list) {
    try { localStorage.setItem(LB_KEY, JSON.stringify(list)); } catch (e) {}
  },
  add(entry) {
    const list = Leaderboard.load();
    list.push(entry);
    list.sort((a, b) => (b.score || 0) - (a.score || 0));
    const trimmed = list.slice(0, 10);
    Leaderboard.write(trimmed);
    return trimmed;
  }
};

let save = Save.load();

function unlockVirus(key) {
  if (!save.unlocked.includes(key)) {
    save.unlocked.push(key);
    Save.write(save);
  }
}

function recordRun(outcome) {
  // Effective difficulty label: "challenge" is its own mode, otherwise show the chosen difficulty.
  const difficulty = state.gameMode === "challenge" ? "challenge" : (state.difficulty || "normal");
  const entry = {
    score: state.score,
    round: state.round,
    accuracy: state.total ? Math.round(state.correct / state.total * 100) : 0,
    correct: state.correct,
    total: state.total,
    outcome: outcome,
    difficulty: difficulty,
    runId: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    date: new Date().toISOString().slice(0, 10)
  };
  // Leaderboard lives in a separate localStorage slot — survives reset
  Leaderboard.add(entry);
  // Personal best score lives in main save — wiped by reset
  if (state.score > (save.highestScore || 0)) {
    save.highestScore = state.score;
    Save.write(save);
  }
  // Award Creditz: round bonuses already accumulated in state.runCreditz +
  // 1 creditz per 100 points of final score, multiplied by leaderboard rank bonus.
  finalizeCreditz(entry);
}

/* ============================================================
   CREDITZ — the in-game currency
   ============================================================ */

/* Called when a round is completed. Pays the round bonus DIRECTLY to the wallet
   immediately (so the player sees it tick up and so quitting mid-run doesn't lose it). */
function awardRoundCreditz() {
  const mode = state.gameMode === "challenge" ? "challenge" : (state.difficulty || "normal");
  const amount = CONFIG.creditzPerRound[mode] || 0;
  if (amount <= 0) return;
  state.runCreditz = (state.runCreditz || 0) + amount;
  save.creditz = (save.creditz || 0) + amount;
  Save.write(save);
  showCreditzToast("+" + amount + " ₢", "Round " + state.round + " cleared (" + mode + ")");
}

/* Called at end of run (in recordRun, after the entry is added). Pays the score bonus.
   (Round bonuses were already paid out as each round completed. No multiplier — being
   on the leaderboard is its own reward, not a cash perk.) */
function finalizeCreditz(entry) {
  const scoreCreditz = Math.floor(state.score / CONFIG.scorePerCreditz);
  const baseTotal = (state.runCreditz || 0) + scoreCreditz;
  save.creditz = (save.creditz || 0) + scoreCreditz;
  Save.write(save);
  // Track rank for display, but don't apply it as a money bonus.
  const lb = Leaderboard.load();
  const idx = lb.findIndex(e => e.runId === entry.runId);
  state.lastRunCreditz = baseTotal;
  state.lastRunMultiplier = 1;
  state.lastRunRank = idx >= 0 ? idx + 1 : 0;
  state.lastRunBaseCreditz = baseTotal;
}

/* Floating "+X ₢" notification that appears briefly on the screen. */
function showCreditzToast(amount, sub) {
  // Put all toasts in a shared stack container so simultaneous earnings (e.g. round
  // complete + antivirus quarantine) are both visible instead of overlapping.
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  el.className = "creditz-toast";
  el.innerHTML = '<strong>' + esc(amount) + '</strong><span>' + esc(sub || "") + '</span>';
  stack.appendChild(el);
  void el.offsetWidth;
  el.classList.add("show");
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 400);
  }, 1800);
}


function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function describeMeterEffect(effect) {
  if (!effect) return [];
  const labels = [];
  const phrases = {
    fps: {
      flash: "FPS meter flickered wildly between 0 and 999",
      pulse: "FPS meter oscillated rhythmically between 60 and 120",
      "null": "FPS meter read NULL or ∞",
      blank: "FPS meter went blank (—)"
    },
    cpu: {
      kernel: "CPU meter read 'KERNEL' instead of a number",
      "null": "CPU meter read NULL or ∞",
      blank: "CPU meter went blank (—)"
    },
    ping: {
      spike: "PING meter spiked randomly between normal and 9999ms"
    },
    time: {
      wrong:     "System clock showed an impossible date",
      countdown: "System clock displayed a countdown timer instead of a time",
      room237:   "System clock stuck on the :37 mark (Room 237 reference)"
    }
  };
  for (const meter of Object.keys(effect)) {
    const value = effect[meter];
    if (phrases[meter] && phrases[meter][value]) {
      labels.push(phrases[meter][value]);
      continue;
    }
    if (typeof value === "number") {
      const unit = meter === "ping" ? "ms" : meter === "vol" ? "%" : meter === "cpu" ? "°C" : "";
      labels.push(meter.toUpperCase() + " meter pinned at " + value + unit);
      continue;
    }
    labels.push(meter.toUpperCase() + " meter showed '" + value + "'");
  }
  return labels;
}

function activeTells(card) {
  if (!card || !card.isVirus) return [];
  const tells = [];
  const v = VIRUSES[card.virusKey];
  if (!card.noMeter) {
    const effect = card.meterEffect || (v && v.meterEffect);
    describeMeterEffect(effect).forEach(t => tells.push(t));
  }
  if (card.btnFlicker)   tells.push("Report / OK buttons flickered on and off");
  if (card.bgShift)      tells.push("Game panel background shifted to a " + card.bgShift + " tint");
  if (card.noise)        tells.push("Static noise overlay flickered across the popup");
  if (card.wobble)       tells.push("Popup wobbled or swayed side-to-side");
  if (card.borderPulse)  tells.push("Pulsing red border around the popup");
  if (card.iconShake)    tells.push("Error icon shook in place");
  if (card.fontMismatch) tells.push("Heading font didn't match the body font");
  if (card.scream)       tells.push("Sudden loud audio sting played when the card appeared");
  if (card.pulse)        tells.push("Popup throbbed with a heartbeat pulse");
  if (card.nullify)      tells.push("UI elements were missing or hidden");
  return tells;
}

/* Pattern-based detection of textual tells inside the alert's title/message/meta. */
function textualTellsFor(card) {
  if (!card || !card.isVirus) return [];
  const text = String(card.title || "") + " " + String(card.message || "") + " " + String(card.meta || "");
  const list = TEXTUAL_TELLS[card.virusKey] || [];
  const tells = [];
  for (const entry of list) {
    const m = text.match(entry.p);
    if (m) tells.push(typeof entry.t === "function" ? entry.t(m) : entry.t);
  }
  return tells;
}

