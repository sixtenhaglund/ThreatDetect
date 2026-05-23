// =====================================================
// game.js — runtime logic, state, views, router
// Depends on (in load order): data.js, audio.js
// =====================================================

"use strict";

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
  const el = document.createElement("div");
  el.className = "creditz-toast";
  el.innerHTML = '<strong>' + esc(amount) + '</strong><span>' + esc(sub || "") + '</span>';
  document.body.appendChild(el);
  // Force reflow so the transition runs from the initial state.
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

/* Pattern-based detection of textual tells inside the alert's title/message/meta.

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

/* ============================================================
   METERS (fake telemetry — never reads real system values)
   ============================================================ */

const FAKE_CLOCK_START = Date.UTC(2031, 5, 12, 14, 23, 7);
let fakeClock = FAKE_CLOCK_START;

function pad2(n) { return String(n).padStart(2, "0"); }
function rng(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

const METERS = {
  timer: null,
  override: null,
  state: { fps: 60, ping: 24, cpu: 47, vol: 72, time: "14:23:07" },
  start() {
    if (this.timer) return;
    this.tick();
    this.timer = setInterval(() => this.tick(), 700);
  },
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  },
  setOverride(eff, isVirus) {
    this.override = eff || null;
    // When a legit card sets the meter context (e.g. thermal throttle → high CPU),
    // we don't want the value flagged red — it's an expected reading, not tampering.
    this.overrideIsVirus = isVirus !== false;
    this.tick();
  },
  tick() {
    const s = this.state;
    // Wider natural jitter — real systems vary a LOT.
    // Bigger random walk so high CPU / dropped FPS / slow ping happen organically,
    // making "the meter looks weird" a much weaker signal that something is a virus.
    s.fps  = clamp(s.fps  + rng(-8, 8),   22, 95);
    s.ping = clamp(s.ping + rng(-12, 12), 8,  180);
    s.cpu  = clamp(s.cpu  + rng(-6, 6),   18, 92);
    // VOL is the user's audio volume — it shouldn't randomly change. Stays put unless
    // a virus's meterEffect explicitly tampers with it.
    s.vol  = 72;
    fakeClock += 700 + rng(0, 600);
    const d = new Date(fakeClock);
    s.time = pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes()) + ":" + pad2(d.getUTCSeconds());
    this.paint();
  },
  paint() {
    const o = this.override || {};
    // Training is for learning — always show tampering clearly (like easy).
    // Otherwise use the actual difficulty (or "hard" for the standalone Challenge button).
    const diff = state.screen === "training"
      ? "easy"
      : (state.gameMode === "challenge" ? "hard" : (state.difficulty || "normal"));
    // Per-difficulty: how often the meter shows the tampered value, and how often it goes red.
    const profile = ({
      easy:      { showTamper: 1.0,  redChance: 1.0,  briefFlash: false },
      normal:    { showTamper: 0.95, redChance: 0.55, briefFlash: false },
      hard:      { showTamper: 0.7,  redChance: 0.18, briefFlash: false },
      nightmare: { showTamper: 0.18, redChance: 0,    briefFlash: true  }
    })[diff] || { showTamper: 1.0, redChance: 1.0, briefFlash: false };

    const self = this;
    const set = (key, base) => {
      const el = document.querySelector('[data-m="' + key + '"]');
      if (!el) return;
      if (!(key in o)) {
        // Not tampered for this card — show normal jittered value
        el.textContent = base;
        el.classList.remove("bad");
        return;
      }
      const tamperShown = Math.random() < profile.showTamper;
      if (tamperShown) {
        el.textContent = self.applyEffect(key, o[key]);
        // Only viruses' tampered values turn red. Legit contextual matches stay neutral.
        el.classList.toggle("bad", self.overrideIsVirus && Math.random() < profile.redChance);
        if (profile.briefFlash) {
          // Nightmare: revert to the normal value almost immediately — barely-there flash
          const baseVal = base;
          setTimeout(() => {
            if (el && el.isConnected) {
              el.textContent = baseVal;
              el.classList.remove("bad");
            }
          }, 100 + Math.random() * 80);
        }
      } else {
        // Pretend everything's fine on this tick
        el.textContent = base;
        el.classList.remove("bad");
      }
    };
    set("fps",  this.state.fps);
    set("ping", this.state.ping);
    set("cpu",  this.state.cpu);
    set("vol",  this.state.vol);
    set("time", this.state.time);
  },
  applyEffect(key, mode) {
    if (typeof mode === "number") return String(mode);
    switch (mode) {
      case "flash":     return Math.random() < 0.5 ? "0"   : "999";
      case "null":      return Math.random() < 0.5 ? "NULL": "∞";
      case "pulse":     return Math.random() < 0.4 ? "120" : "60";
      case "blank":     return "—";
      case "kernel":    return "KERNEL";
      case "countdown": return "00:00:0" + Math.floor(Math.random() * 9);
      case "wrong":     return rand(["1601-01-01", "9999-12-31", "2025-02-30", "0000:00:00"]);
      case "room237":   return this.state.time.slice(0, 3) + "37:" + this.state.time.slice(6);
      case "spike":     return Math.random() < 0.5 ? String(this.state.ping) : "9999";
      default:          return String(mode);
    }
  }
};

function meterEffectFor(card) {
  if (!card) return null;
  if (card.noMeter) return null;
  // Legit cards can also have meterEffect so a "thermal throttle" notice spikes CPU,
  // a "battery saver" notice drops it, "VPN dropped" raises ping, etc. — making the
  // meters a context cue rather than a virus tell.
  if (card.meterEffect) return card.meterEffect;
  if (!card.isVirus) return null;
  const v = VIRUSES[card.virusKey];
  return v && v.meterEffect ? v.meterEffect : null;
}

function cardFxClasses(card) {
  if (!card || !card.isVirus) return "";
  const cls = [];
  if (card.btnFlicker)   cls.push("fx-btn-flicker");
  if (card.noise)        cls.push("fx-noise");
  if (card.wobble)       cls.push("fx-wobble");
  if (card.borderPulse)  cls.push("fx-border-pulse");
  if (card.iconShake)    cls.push("fx-icon-shake");
  if (card.fontMismatch) cls.push("fx-font-mismatch");
  return cls.length ? " " + cls.join(" ") : "";
}

/* ============================================================
   STATE
   ============================================================ */

const state = {
  screen: "epilepsy-warning",
  prevScreen: "menu",
  // play state
  gameMode: "normal",   // "normal" or "challenge" — challenge is harder
  difficulty: "normal", // "easy" | "normal" | "hard" | "nightmare" — applies to normal mode
  score: 0, round: 1, lives: CONFIG.startLives,
  streak: 0, deck: [], cardIdx: 0,
  correct: 0, total: 0,
  roundCorrect: 0,        // correct calls in the current round only (out of cardsPerRound)
  threatsNeutralized: 0,  // virus cards correctly reported across the run
  runCreditz: 0,          // creditz earned this run from round bonuses (score bonus added at end)
  lastRunCreditz: 0,      // displayed on the end-of-run screens
  lastRunMultiplier: 1,   // rank multiplier that was applied
  lastRunRank: 0,         // 0 = not on board, 1-10 = leaderboard position
  lastRunBaseCreditz: 0,  // round + score creditz before multiplier
  killer: null,         // virus key when died to virus
  killerCard: null,     // the exact card object that killed the player
  firstDeath: false,    // true if this is the first time this virus has killed the player
  falsePositive: null,  // legit card object when died to false positive
  locked: false,
  // codex
  openCodex: null,      // key of currently expanded entry
  codexFilter: null,    // when set, codex shows only this virus
  sideCodexOpen: false, // true while the codex sidebar is showing next to the play panel
  // training
  trainingVirus: null,
  trainingStreak: 0,
  // codex animation preview
  previewVirus: null,
  previewTimeout: null,
  codexScrollY: 0,        // remembers scroll position while we leave the codex to play a preview
  // training reveal — shows the post-mortem for a wrongly-classified card
  trainingReveal: null,
  // ui tampering
  tampering: null,      // { type: 'swap'|'pulse'|'shake'|'null', strength: 0..1 }
  // death sequence timer
  deathTimeout: null,
  // antivirus minigame
  minigame: null
};

/* ============================================================
   HELPERS
   ============================================================ */

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

function availableViruses(round) {
  return Object.keys(VIRUSES).filter(k => VIRUSES[k].minRound <= round);
}

function buildDeck(round) {
  // Effective mode = "challenge" (legacy button) OR the chosen difficulty under Normal
  const mode = state.gameMode === "challenge" ? "challenge" : state.difficulty;
  let avail, virusRatio;
  switch (mode) {
    case "easy":
      // Delay virus introductions by 2 rounds, low density
      avail = Object.keys(VIRUSES).filter(k => VIRUSES[k].minRound <= Math.max(1, round - 2));
      if (avail.length === 0) avail = CONFIG.starterUnlocked.slice();
      virusRatio = Math.min(0.45, 0.15 + (round - 1) * 0.04);
      break;
    case "hard":
    case "challenge":
      avail = Object.keys(VIRUSES);                          // all 20 from round 1
      virusRatio = Math.min(0.8, 0.4 + (round - 1) * 0.05);  // 40% → 80%
      break;
    case "nightmare":
      avail = Object.keys(VIRUSES);
      virusRatio = Math.min(0.9, 0.6 + (round - 1) * 0.04);  // 60% → 90%
      break;
    case "normal":
    default:
      avail = availableViruses(round);                       // standard minRound gating
      virusRatio = Math.min(0.7, 0.2 + (round - 1) * 0.06);  // 20% → 70%
      break;
  }
  const virusCards = [];
  avail.forEach(k => VIRUSES[k].errors.forEach(e => virusCards.push({ ...e, isVirus: true, virusKey: k })));
  const legitCards = LEGIT.map(e => ({ ...e, isVirus: false, virusKey: null }));
  const virusCount = Math.min(virusCards.length, Math.max(2, Math.round(CONFIG.cardsPerRound * virusRatio)));
  const legitCount = CONFIG.cardsPerRound - virusCount;
  const pickedViruses = shuffle(virusCards).slice(0, virusCount);
  const pickedLegit   = shuffle(legitCards).slice(0, legitCount);
  return shuffle(pickedViruses.concat(pickedLegit));
}

function rollTampering(round, card) {
  // Shift effective round based on difficulty / mode
  const mode = state.gameMode === "challenge" ? "challenge" : state.difficulty;
  const shifts = { easy: -2, normal: 0, hard: 2, challenge: 2, nightmare: 4 };
  const effRound = round + (shifts[mode] || 0);
  if (effRound < 4) return null;
  if (card.virusKey === "PULSE") {
    return { type: effRound >= 7 ? "pulseHard" : "pulse" };
  }
  if (card.virusKey === "NULL") {
    return { type: "null" };
  }
  if (card.virusKey === "SCREAMER") {
    return { type: effRound >= 7 ? "shake" : "pulseHard" };
  }
  // Other virus cards: chance of light tampering scaling with round
  const chance = Math.min(0.45, (effRound - 3) * 0.05);
  if (card.isVirus && Math.random() < chance) {
    const opts = effRound >= 7 ? ["swap", "pulse", "shake"] : ["swap", "pulse"];
    return { type: rand(opts) };
  }
  return null;
}

/* ============================================================
   ACTIONS
   ============================================================ */

function unlockAudio() { Audio.resume(); }

function go(screen) {
  state.prevScreen = state.screen;
  state.screen = screen;
  render();
}

function startChallenge() {
  unlockAudio();
  Audio.startAmbient();
  state.score = 0;
  state.round = 1;
  state.lives = CONFIG.startLives;
  state.streak = 0;
  state.correct = 0;
  state.total = 0;
  state.roundCorrect = 0;
  state.threatsNeutralized = 0;
  state.runCreditz = 0;
  state.lastRunCreditz = 0;
  state.lastRunMultiplier = 1;
  state.lastRunRank = 0;
  state.lastRunBaseCreditz = 0;
  state.killer = null;
  state.falsePositive = null;
  state.cardIdx = 0;
  state.deck = buildDeck(state.round);
  state.tampering = rollTampering(state.round, state.deck[0]);
  state.locked = false;
  state.sideCodexOpen = false;
  state.screen = "play";
  render();
  METERS.start();
  METERS.setOverride(meterEffectFor(state.deck[0]), !!(state.deck[0] && state.deck[0].isVirus));
  maybePlayCardSound();
}

function startTraining(virusKey) {
  unlockAudio();
  Audio.startAmbient();
  // Training is also a way to discover a virus — unlock it in the codex
  unlockVirus(virusKey);
  state.trainingVirus = virusKey;
  state.trainingStreak = 0;
  state.screen = "training";
  state.locked = false;
  state.sideCodexOpen = false;
  state.deck = buildTrainingDeck(virusKey);
  state.cardIdx = 0;
  state.tampering = rollTampering(10, state.deck[0]);
  render();
  METERS.start();
  METERS.setOverride(meterEffectFor(state.deck[0]), !!(state.deck[0] && state.deck[0].isVirus));
  maybePlayCardSound();
}

function buildTrainingDeck(virusKey) {
  const v = VIRUSES[virusKey];
  const virusCards = v.errors.map(e => ({ ...e, isVirus: true, virusKey }));
  const legitCards = shuffle(LEGIT).slice(0, 12).map(e => ({ ...e, isVirus: false, virusKey: null }));
  return shuffle(virusCards.concat(virusCards).concat(legitCards));
}

function nextCard() {
  state.cardIdx++;
  state.locked = false;
  if (state.screen === "training") {
    if (state.cardIdx >= state.deck.length) {
      state.deck = buildTrainingDeck(state.trainingVirus);
      state.cardIdx = 0;
    }
    state.tampering = rollTampering(10, state.deck[state.cardIdx]);
    render();
    {
      const c = state.deck[state.cardIdx];
      METERS.setOverride(meterEffectFor(c), !!(c && c.isVirus));
    }
    maybePlayCardSound();
    return;
  }
  if (state.cardIdx >= state.deck.length) {
    awardRoundCreditz();     // pay out for the round we just completed (works for the win round too)
    if (state.round >= CONFIG.totalRounds) {
      Audio.levelUp();
      Audio.stopAmbient();
      METERS.stop();
      if (state.round > save.highestRound) { save.highestRound = state.round; Save.write(save); }
      recordRun("win");
      state.screen = "win";
      render();
      return;
    }
    state.round++;
    state.roundCorrect = 0;  // fresh counter each round
    if (state.round > save.highestRound) { save.highestRound = state.round; Save.write(save); }
    // Unlock Nightmare once you reach round 3 on Normal or Hard difficulty
    if (state.gameMode === "normal" && state.round >= 3 &&
        (state.difficulty === "normal" || state.difficulty === "hard") &&
        !save.nightmareUnlocked) {
      save.nightmareUnlocked = true;
      Save.write(save);
    }
    state.cardIdx = 0;
    state.deck = buildDeck(state.round);
    Audio.levelUp();
  }
  state.tampering = rollTampering(state.round, state.deck[state.cardIdx]);
  render();
  {
    const c = state.deck[state.cardIdx];
    METERS.setOverride(meterEffectFor(c), !!(c && c.isVirus));
  }
  maybePlayCardSound();
}

function maybePlayCardSound() {
  const card = state.deck[state.cardIdx];
  if (!card) return;
  if (card.scream) Audio.scream();
  else if (card.pulse) Audio.heartbeat();
  else if (card.nullify) Audio.glitch();
}

function choose(reportedAsVirus) {
  if (state.locked) return;
  const card = state.deck[state.cardIdx];
  if (!card) return;

  // Apply swap-tampering: the labels visually swapped but the player's
  // intent maps to the LABEL they clicked, not the underlying meaning.
  // The button data-action stays correct ("virus"/"check") because the
  // SWAP is purely cosmetic — the click already says what they intended.
  state.locked = true;
  const correct = reportedAsVirus === card.isVirus;
  state.total++;
  Audio.click();
  if (correct) {
    state.correct++;
    state.roundCorrect++;
    if (card.isVirus) state.threatsNeutralized++;
    state.streak++;
    if (state.screen === "training") state.trainingStreak++;
    const bonus = Math.min(state.streak, CONFIG.streakCap) * CONFIG.streakBonus;
    state.score += CONFIG.scoreRight + bonus;
    Audio.correct();
    if (card.isVirus) unlockVirus(card.virusKey);
    showReveal(true, card);
    setTimeout(nextCard, 650);
  } else {
    state.streak = 0;
    if (state.screen === "training") {
      state.trainingStreak = 0;
      Audio.wrong();
      if (card.isVirus) unlockVirus(card.virusKey);
      showReveal(false, card);
      // Pause and show the post-mortem so the player can learn from the miss
      state.trainingReveal = card;
      setTimeout(() => { render(); }, 650);
      return;
    }
    state.score = Math.max(0, state.score + CONFIG.scoreWrong);
    state.lives--;
    if (card.isVirus) unlockVirus(card.virusKey);
    if (state.lives <= 0) {
      // Antivirus save: if the player misclassified a VIRUS and has antivirus in stock,
      // run the quarantine minigame instead of dying. Win = continue, antivirus consumed.
      if (card.isVirus && (save.antivirus || 0) > 0) {
        save.antivirus--;
        Save.write(save);
        state.lives = 1;             // give the life back so the run continues on win
        startQuarantineMinigame(card);
        return;
      }
      triggerEndOfRun(card);
    } else {
      Audio.wrong();
      showReveal(false, card);
      setTimeout(nextCard, 850);
    }
  }
}

/* End-of-run dispatcher — used by normal deaths AND by losing the antivirus minigame. */
function triggerEndOfRun(card) {
  Audio.stopAmbient();
  METERS.stop();
  if (card.isVirus) {
    if (!Array.isArray(save.deathsBy)) save.deathsBy = [];
    state.firstDeath = !save.deathsBy.includes(card.virusKey);
    if (state.firstDeath) {
      save.deathsBy.push(card.virusKey);
      Save.write(save);
    }
    state.killer = card.virusKey;
    state.killerCard = card;
    state.falsePositive = null;
    recordRun("infected");
    state.screen = "dying";
    render();
    Audio.death(card.virusKey);
    const dur = (DEATHS[card.virusKey] || {}).duration || 4500;
    state.deathTimeout = setTimeout(() => {
      state.deathTimeout = null;
      state.screen = "infected";
      render();
    }, dur);
  } else {
    state.killer = null;
    state.falsePositive = card;
    recordRun("false-positive");
    state.screen = "false-positive";
    render();
    Audio.gameOver();
  }
}

/* ============================================================
   ANTIVIRUS QUARANTINE MINIGAME
   Spawn N virus targets on screen, click them all before the timer runs out.
   ============================================================ */



/* Shared setup. opts: { savedCard, training } */
function startMinigame(opts) {
  opts = opts || {};
  unlockAudio();
  const targets = [];
  for (let i = 0; i < MG_TARGETS; i++) {
    targets.push({
      x: 10 + Math.random() * 80,    // % of viewport
      y: 18 + Math.random() * 68,
      hit: false
    });
  }
  state.minigame = {
    active: true,
    targets,
    hits: 0,
    needed: MG_TARGETS,
    timeLeft: MG_DURATION,
    startTime: Date.now(),
    savedCard: opts.savedCard || null,
    training: !!opts.training,
    interval: null
  };
  state.screen = "minigame";
  render();
  Audio.click();
  state.minigame.interval = setInterval(() => {
    if (!state.minigame || !state.minigame.active) return;
    state.minigame.timeLeft -= 0.1;
    const el = document.getElementById("mg-timer");
    if (el) el.textContent = Math.max(0, state.minigame.timeLeft).toFixed(1);
    if (state.minigame.timeLeft <= 0) failQuarantine();
  }, 100);
}

/* In-run path: save us from a misclassified virus. */
function startQuarantineMinigame(savedCard) {
  startMinigame({ savedCard });
}

/* Practice mode: loop the minigame, tally wins/losses, no game-over. */
const TRAINING_STATS_DEFAULT = { wins: 0, losses: 0, bestTimeMs: null };
function startMinigameTraining() {
  state.minigameStats = state.minigameStats || Object.assign({}, TRAINING_STATS_DEFAULT);
  startMinigame({ training: true });
}

function hitMinigameTarget(idx) {
  const mg = state.minigame;
  if (!mg || !mg.active) return;
  const t = mg.targets[idx];
  if (!t || t.hit) return;
  t.hit = true;
  mg.hits++;
  Audio.correct();
  const node = document.querySelector('[data-mg-target="' + idx + '"]');
  if (node) node.classList.add("hit");
  const left = document.getElementById("mg-remaining");
  if (left) left.textContent = (mg.needed - mg.hits);
  if (mg.hits >= mg.needed) winQuarantine();
}

function winQuarantine() {
  const mg = state.minigame;
  if (!mg) return;
  mg.active = false;
  if (mg.interval) clearInterval(mg.interval);
  const elapsedMs = Date.now() - mg.startTime;
  Audio.correct();
  if (mg.training) {
    // Tally + immediately start a fresh round.
    const stats = state.minigameStats;
    stats.wins++;
    if (stats.bestTimeMs === null || elapsedMs < stats.bestTimeMs) stats.bestTimeMs = elapsedMs;
    state.minigame = null;
    startMinigame({ training: true });
    return;
  }
  const card = mg.savedCard;
  state.minigame = null;
  // Show a non-blocking quarantine toast and advance straight to the next card —
  // no brief re-render of the misclicked card (which made it feel like a card got skipped).
  state.screen = "play";
  showCreditzToast("🛡 Quarantined", card.virusKey + " · antivirus consumed");
  nextCard();
}

function failQuarantine() {
  const mg = state.minigame;
  if (!mg) return;
  mg.active = false;
  if (mg.interval) clearInterval(mg.interval);
  if (mg.training) {
    state.minigameStats.losses++;
    state.minigame = null;
    startMinigame({ training: true });
    return;
  }
  const card = mg.savedCard;
  state.minigame = null;
  state.lives = 0;             // back to dead
  triggerEndOfRun(card);
}

function showReveal(correct, card) {
  const r = document.getElementById("reveal");
  if (!r) return;
  r.className = "reveal " + (correct ? "correct" : "wrong");
  let label;
  if (card && card._antivirusSave) {
    label = "🛡 Quarantined · " + card.virusKey;
  } else if (correct) {
    label = card.isVirus ? ("Neutralized · " + card.virusKey) : "Clear";
  } else {
    label = card.isVirus ? ("Missed · " + card.virusKey) : "False Positive";
  }
  r.innerHTML = '<div class="stamp">' + esc(label) + "</div>";
  requestAnimationFrame(() => r.classList.add("show"));
  setTimeout(() => r.classList.remove("show"), 650);
}

function toggleCodex(key) {
  const wasOpen = state.openCodex === key;
  state.openCodex = wasOpen ? null : key;
  // DOM-only update: avoids re-rendering the whole panel, which would otherwise
  // re-play the .fade-in animation (the "black flash") and scroll back to the top.
  document.querySelectorAll(".codex-entry.open").forEach(el => el.classList.remove("open"));
  if (state.openCodex) {
    const el = document.querySelector(".codex-entry.v-" + state.openCodex);
    if (el) el.classList.add("open");
  }
}

/* ============================================================
   POPUP TEMPLATE RENDERERS
   ============================================================ */

/* A small pool of error-icon SVGs. Each card picks one deterministically (hashed from its content)
   so the icon stays stable per card but varies card-to-card — classic X, warning, glitch, blank, ∅, skull, ?. */

function iconFor(card) {
  if (card && card.icon && ICONS[card.icon]) return ICONS[card.icon];
  const t = card ? ICON_BY_TEMPLATE[card.template] : null;
  return ICONS[t || "error"];
}

// Back-compat exports for any code still referencing the old names directly.
const ERROR_ICON_SVG = ICON_VARIANTS[0];
const WARN_ICON_SVG  = ICON_VARIANTS[1];

function renderActions(card) {
  // Report = Virus, OK = Safe. Hidden when NULL tampering active.
  const left  = `<button class="btn danger" data-action="virus">Report</button>`;
  const right = `<button class="btn primary" data-action="check">OK</button>`;
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
        <button class="btn" data-action="virus">Report</button>
        <button class="btn primary" data-action="check">OK</button>
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
        <button class="btn danger" data-action="virus">Report</button>
        <button class="btn primary" data-action="check">OK</button>
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
        <span><span class="key">F2</span> <button class="btn danger" data-action="virus" style="padding:4px 12px;font-size:12px">Report</button></span>
        <span><span class="key">F10</span> <button class="btn primary" data-action="check" style="padding:4px 12px;font-size:12px">OK</button></span>
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
        <button class="term-btn" data-action="virus">Report</button>
        <button class="term-btn" data-action="check" style="background:#003366;border-color:#66ddff;color:#66ddff;">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
        <button class="w311-btn" data-action="virus">Report</button>
        <button class="w311-btn" data-action="check">OK</button>
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
        <button class="btn danger big" data-action="virus">Report</button>
        <button class="btn primary big" data-action="check">OK</button>
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
        <button class="btn danger big" data-action="virus">Report</button>
        <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
      <button class="btn danger big" data-action="virus">Report</button>
      <button class="btn primary big" data-action="check">OK</button>
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
    case TPL.WIN11:
    default:           return renderWin11(card);
  }
}

/* ============================================================
   VIEWS
   ============================================================ */

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


function viewMinigame() {
  const mg = state.minigame;
  if (!mg) return "";
  const isTraining = !!mg.training;
  const stats = state.minigameStats || TRAINING_STATS_DEFAULT;
  const trainingStrip = isTraining ? `
    <div class="hud" style="grid-template-columns: repeat(3, 1fr); max-width: 460px; margin: 8px auto 0;">
      <div class="cell"><div class="label">Wins</div><div class="value" style="color: var(--primary);">${stats.wins}</div></div>
      <div class="cell"><div class="label">Losses</div><div class="value" style="color: var(--destruct);">${stats.losses}</div></div>
      <div class="cell"><div class="label">Best</div><div class="value">${stats.bestTimeMs !== null ? (stats.bestTimeMs / 1000).toFixed(2) + "s" : "—"}</div></div>
    </div>` : "";
  const heading = isTraining ? "PRACTICE: QUARANTINE" : "QUARANTINE THE THREATS";
  const sub = isTraining ? "Click all ${n} skulls before the timer ends. Practice loops automatically — wins and losses are tallied."
                         : "Click all ${n} skulls before the timer runs out. Miss the deadline and the virus kills you.";
  const exitBtn = isTraining
    ? `<div class="row center" style="margin-top:8px;"><button class="btn" data-action="exit-minigame-training">Exit Practice</button></div>`
    : "";
  return `
    <div class="minigame-stage">
      <div class="minigame-header">
        <h3 style="margin:0; color: var(--primary); letter-spacing: 0.3em;">${isTraining ? "🎯 PRACTICE MODE" : "🛡 ANTIVIRUS DEPLOYED"}</h3>
        <h1 style="margin: 6px 0;">${heading}</h1>
        <p class="mute">${esc(sub.replace("${n}", String(mg.needed)))}</p>
        <div class="hud" style="grid-template-columns: 1fr 1fr; max-width: 360px; margin: 6px auto 0;">
          <div class="cell"><div class="label">Left</div><div class="value" id="mg-remaining">${mg.needed - mg.hits}</div></div>
          <div class="cell"><div class="label">Time</div><div class="value" id="mg-timer">${mg.timeLeft.toFixed(1)}</div></div>
        </div>
        ${trainingStrip}
        ${exitBtn}
      </div>
      <div class="minigame-field">
        ${mg.targets.map((t, i) => `
          <button class="minigame-target ${t.hit ? "hit" : ""}"
                  data-action="mg-hit" data-target="${i}" data-mg-target="${i}"
                  style="left:${t.x}%; top:${t.y}%;">☠</button>
        `).join("")}
      </div>
    </div>`;
}

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

function render() {
  const app = document.getElementById("app");
  let html = "";
  switch (state.screen) {
    case "menu":              html = viewMenu(); break;
    case "difficulty-picker": html = viewDifficultyPicker(); break;
    case "settings":          html = viewSettings(); break;
    case "reset-confirm":     html = viewResetConfirm(); break;
    case "codex":             html = viewCodex(); break;
    case "training":          html = viewTraining(); break;
    case "training-pick":     html = viewTraining(); break;
    case "play":              html = viewPlay(false); break;
    case "epilepsy-warning":  html = viewEpilepsyWarning(); break;
    case "shop":              html = viewShop(); break;
    case "minigame":          html = viewMinigame(); break;
    case "dying":             html = viewDying(); break;
    case "preview":           html = viewPreview(); break;
    case "infected":          html = viewInfected(); break;
    case "false-positive":    html = viewFalsePositive(); break;
    case "win":               html = viewWin(); break;
    default:                  html = viewMenu();
  }
  app.innerHTML = html + '<div id="reveal" class="reveal"></div>';
  // Toggle a body class so #app can give itself right-padding when the side codex is open.
  const sideOpen = state.sideCodexOpen && (state.screen === "play" || state.screen === "training");
  document.body.classList.toggle("side-codex-open", sideOpen);
}

document.addEventListener("click", (e) => {
  unlockAudio();
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  // Prevent <a href="#"> handlers from navigating / scrolling to top.
  if (btn.tagName === "A") e.preventDefault();
  const a = btn.dataset.action;
  switch (a) {
    case "play":
      state.gameMode = "normal";
      startChallenge();
      break;
    case "play-challenge":
      state.gameMode = "challenge";
      startChallenge();
      break;
    case "show-difficulty":
      state.screen = "difficulty-picker";
      render();
      break;
    case "start-difficulty":
      if (btn.hasAttribute("disabled")) break;
      state.gameMode = "normal";
      state.difficulty = btn.dataset.diff;
      startChallenge();
      break;
    case "confirm-warning":
      state.screen = "menu";
      render();
      break;
    case "shop":
      state.prevScreen = state.screen;
      state.screen = "shop";
      render();
      break;
    case "buy-item": {
      const id = btn.dataset.item;
      const item = SHOP_ITEMS.find(x => x.id === id);
      if (!item) break;
      if ((save.creditz || 0) < item.price) break;
      save.creditz = (save.creditz || 0) - item.price;
      save[item.id] = (save[item.id] || 0) + 1;
      Save.write(save);
      Audio.correct();
      render();
      break;
    }
    case "mg-hit": {
      const idx = parseInt(btn.dataset.target, 10);
      hitMinigameTarget(idx);
      break;
    }
    case "minigame-practice":
      state.minigameStats = Object.assign({}, TRAINING_STATS_DEFAULT);
      startMinigameTraining();
      break;
    case "exit-minigame-training": {
      const mg = state.minigame;
      if (mg && mg.interval) clearInterval(mg.interval);
      state.minigame = null;
      state.screen = "menu";
      render();
      break;
    }
    case "skip-death":
      if (state.deathTimeout) { clearTimeout(state.deathTimeout); state.deathTimeout = null; }
      Audio.stopDeath();
      state.screen = "infected";
      render();
      break;
    case "training":
      state.trainingVirus = null;
      state.screen = "training-pick";
      render();
      break;
    case "train-pick":
      if (btn.hasAttribute("disabled")) return;
      startTraining(btn.dataset.key);
      break;
    case "codex":
      state.codexFilter = null;
      state.openCodex = null;
      state.prevScreen = state.screen;
      state.screen = "codex";
      render();
      break;
    case "pause-codex":
      // During play (and training), the Codex button toggles a side panel
      // instead of switching screens — so you can consult it while the
      // current card is still showing.
      if (state.screen === "play" || state.screen === "training") {
        state.sideCodexOpen = !state.sideCodexOpen;
        render();
      } else {
        state.codexFilter = null;
        state.openCodex = null;
        state.prevScreen = "play";
        state.screen = "codex";
        render();
      }
      break;
    case "close-side-codex":
      state.sideCodexOpen = false;
      render();
      break;
    case "study-killer":
      if (!state.killer) break;
      state.codexFilter = state.killer;
      state.openCodex = state.killer;
      state.prevScreen = state.screen;
      state.screen = "codex";
      render();
      break;
    case "back-from-codex":
      state.codexFilter = null;
      state.openCodex = null;
      state.screen = state.prevScreen || "menu";
      render();
      // resume meter ticker if we returned to play/training
      if (state.screen === "play" || state.screen === "training") {
        const card = state.deck[state.cardIdx];
        if (card) METERS.setOverride(meterEffectFor(card), !!card.isVirus);
      }
      break;
    case "toggle-entry":
      toggleCodex(btn.dataset.key);
      break;
    case "preview-virus": {
      unlockAudio();
      const k = btn.dataset.key;
      // Remember where we were scrolled in the codex so we can restore it on auto-return.
      const listEl = document.querySelector(".codex-list");
      state.codexScrollY = listEl ? listEl.scrollTop : 0;
      state.previewVirus = k;
      // Don't touch prevScreen — preview always returns to codex,
      // and the codex's own back button needs prevScreen intact.
      state.screen = "preview";
      render();
      Audio.death(k);
      // Auto-return after the same duration the animation runs in-game.
      if (state.previewTimeout) clearTimeout(state.previewTimeout);
      const dur = (DEATHS[k] || {}).duration || 4500;
      state.previewTimeout = setTimeout(() => {
        state.previewTimeout = null;
        state.previewVirus = null;
        Audio.stopDeath();
        state.screen = "codex";
        render();
        // Restore the scroll position so the page doesn't jump back to the top.
        const back = document.querySelector(".codex-list");
        if (back) back.scrollTop = state.codexScrollY;
      }, dur);
      break;
    }
    case "back-from-preview":
      if (state.previewTimeout) { clearTimeout(state.previewTimeout); state.previewTimeout = null; }
      Audio.stopDeath();
      state.previewVirus = null;
      state.screen = "codex";
      render();
      // Restore scroll just like the auto-return path does.
      const backList = document.querySelector(".codex-list");
      if (backList) backList.scrollTop = state.codexScrollY;
      break;
    case "training-continue":
      state.trainingReveal = null;
      state.locked = false;
      nextCard();
      break;
    case "settings":
      state.prevScreen = state.screen;
      state.screen = "settings";
      render();
      break;
    case "toggle-photo":
      save.settings.photosensitive = !save.settings.photosensitive;
      Save.write(save);
      render();
      break;
    case "toggle-jumpscares":
      save.settings.jumpscares = !(save.settings.jumpscares !== false);
      Save.write(save);
      render();
      break;
    case "reset":
      state.screen = "reset-confirm";
      render();
      break;
    case "confirm-reset":
      Save.reset();
      save = Save.load();
      Audio.applyVolumes();
      state.screen = "menu";
      render();
      break;
    case "cancel-reset":
      state.screen = "settings";
      render();
      break;
    case "menu":
      Audio.stopAmbient();
      Audio.stopDeath();
      if (state.deathTimeout) { clearTimeout(state.deathTimeout); state.deathTimeout = null; }
      METERS.stop();
      state.trainingVirus = null;
      state.sideCodexOpen = false;
      state.screen = "menu";
      render();
      break;
    case "virus":  choose(true); break;
    case "check":  choose(false); break;
  }
});

document.addEventListener("input", (e) => {
  const s = e.target.dataset && e.target.dataset.setting;
  if (!s) return;
  save.settings[s] = parseFloat(e.target.value);
  Audio.applyVolumes();
  Save.write(save);
});

document.addEventListener("keydown", (e) => {
  if (state.screen !== "play" && state.screen !== "training") return;
  if (state.locked) return;
  if (e.key === "ArrowLeft" || e.key === "v" || e.key === "V" || e.key === "1") choose(true);
  if (e.key === "ArrowRight" || e.key === "c" || e.key === "C" || e.key === "2") choose(false);
});

/* ============================================================
   INIT
   ============================================================ */

render();
