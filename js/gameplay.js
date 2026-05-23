// =====================================================
// gameplay.js — state, deck building, the play loop
// Depends on data.js, core.js, meters.js, audio.js
// Defines: state, substitutePlaceholders, randomizeCard, availableViruses,
//   buildDeck, rollTampering, unlockAudio, go, startChallenge, startTraining,
//   buildTrainingDeck, nextCard, maybePlayCardSound, choose, triggerEndOfRun,
//   startMinigame (+ minigame helpers), showReveal, toggleCodex
// =====================================================
"use strict";


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


/* Substitute {name}, {tld}, {app}, etc. tokens in a string using RANDOM_POOLS.
   Unknown tokens are left as-is. */
function substitutePlaceholders(str) {
  if (typeof str !== "string") return str;
  return str.replace(/\{(\w+)\}/g, (m, key) => {
    const pool = RANDOM_POOLS[key];
    return pool ? rand(pool) : m;
  });
}

/* Called once per card when a deck is built. Stable from there on:
     - swaps in random app names / usernames / TLDs / etc.
     - picks a random icon color
     - picks a random Report/OK button label pair */
function randomizeCard(card) {
  const c = Object.assign({}, card);
  c.title   = substitutePlaceholders(card.title || "");
  c.message = substitutePlaceholders(card.message || "");
  c.meta    = substitutePlaceholders(card.meta || "");
  if (!c.iconColor)   c.iconColor   = rand(ICON_COLORS);
  if (!c.labelReport) c.labelReport = rand(REPORT_SYNONYMS);
  if (!c.labelOk)     c.labelOk     = rand(OK_SYNONYMS);
  return c;
}

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
  return shuffle(pickedViruses.concat(pickedLegit)).map(randomizeCard);
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
  return shuffle(virusCards.concat(virusCards).concat(legitCards)).map(randomizeCard);
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
  // Pick target count + timer based on the current difficulty.
  // Practice always uses the default (normal-ish); challenge mode has its own row.
  const diff = opts.training
    ? null
    : (state.gameMode === "challenge" ? "challenge" : (state.difficulty || "normal"));
  const cfg = (diff && CONFIG.minigameByDifficulty[diff]) || {
    targets: CONFIG.minigameTargets,
    duration: CONFIG.minigameDuration
  };
  const targets = [];
  for (let i = 0; i < cfg.targets; i++) {
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
    needed: cfg.targets,
    timeLeft: cfg.duration,
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
