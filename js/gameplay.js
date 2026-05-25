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
  minigame: null,
  minigameTrainingDifficulty: null,  // chosen in step 1 of practice
  minigameTrainingType: null         // chosen in step 2 of practice
};

/* ============================================================
   HELPERS
   ============================================================ */


/* Substitute {name}, {tld}, {app}, etc. tokens in a string using RANDOM_POOLS.
   Unknown tokens are left as-is.

   A pool entry can be one of two shapes:
     [a, b, c]                       — flat list, used for both virus and legit
     { legit: [...], virus: [...] }  — split: picks from the appropriate side
                                       based on the card's isVirus flag
   The split shape is how a single {tld} placeholder produces ".com" on a
   legit card and ".pw" on a virus card — same author intent, gameplay-aware
   resolution.

   Optional `cache` object reuses the same randomly-picked value when the
   same token appears twice (so a card that mentions {tld} in both message
   and meta refers to the SAME domain instead of two different ones). */
function substitutePlaceholders(str, cache, isVirus, virusSubs) {
  if (typeof str !== "string") return str;
  return str.replace(/\{(\w+)\}/g, (m, key) => {
    if (cache && key in cache) return cache[key];
    const pool = RANDOM_POOLS[key];
    let arr = null;
    let fromVirusSide = false;
    if (Array.isArray(pool)) {
      arr = pool;
    } else if (pool && typeof pool === "object") {
      if (isVirus && pool.virus && pool.virus.length) {
        arr = pool.virus;
        fromVirusSide = true;
      } else {
        arr = pool.legit || pool.virus;
      }
    }
    const value = arr && arr.length ? rand(arr) : m;
    if (cache) cache[key] = value;
    // Track which tokens resolved to a virus-side value — the death screen
    // surfaces these as explicit "this word is fake" tells so the player
    // learns the giveaways. Dedup by token (cache means same token => same value).
    if (fromVirusSide && virusSubs && !virusSubs.find(s => s.token === key)) {
      virusSubs.push({ token: key, value: value });
    }
    return value;
  });
}

/* Called once per card when a deck is built. Stable from there on:
     - swaps in random app names / usernames / TLDs / etc.
     - picks a random icon color
     - picks a random Report/OK button label pair
   A per-card cache makes repeated {tokens} resolve to the same value
   across title/message/meta. The isVirus flag is forwarded into
   substitutePlaceholders so split pools (legit/virus shape) pick from the
   right half — the SAME author placeholder reads differently depending on
   whether the card it's on is real or a trap. */
function randomizeCard(card) {
  const c = Object.assign({}, card);
  const cache = {};
  const virusSubs = [];
  const sub = (s) => substitutePlaceholders(s, cache, !!card.isVirus, virusSubs);
  c.title   = sub(card.title   || "");
  c.message = sub(card.message || "");
  c.meta    = sub(card.meta    || "");
  // Stash the virus-side placeholder picks on the card so viewInfected can
  // call them out specifically ("this said .pw / Micros0ft / 0 KB").
  if (virusSubs.length) c._virusSubs = virusSubs;
  if (!c.iconColor)   c.iconColor   = rand(ICON_COLORS);
  if (!c.labelReport) c.labelReport = rand(REPORT_SYNONYMS);
  if (!c.labelOk)     c.labelOk     = rand(OK_SYNONYMS);
  return c;
}

function availableViruses(round) {
  return Object.keys(VIRUSES).filter(k => VIRUSES[k].minRound <= round);
}

function buildDeck(round) {
  // Effective mode = "challenge" / "endless" (own modes) OR chosen difficulty under Normal
  const mode = state.gameMode === "challenge" ? "challenge"
             : state.gameMode === "endless"   ? "endless"
             : state.difficulty;
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
    case "endless":
      // No round-10 finish line. Ramps similar to hard, caps at 85%.
      avail = Object.keys(VIRUSES);
      virusRatio = Math.min(0.85, 0.3 + (round - 1) * 0.05); // 30% → 85% by round 12
      break;
    case "normal":
    default:
      avail = availableViruses(round);                       // standard minRound gating
      virusRatio = Math.min(0.7, 0.2 + (round - 1) * 0.06);  // 20% → 70%
      break;
  }

  // Endless mode adds +1 card per round you've already cleared (round 1 = 10,
  // round 2 = 11, round 3 = 12, ...). Other modes stay at CONFIG.cardsPerRound.
  const cardsThisRound = (state.gameMode === "endless")
    ? CONFIG.cardsPerRound + Math.max(0, round - 1)
    : CONFIG.cardsPerRound;

  // Build the legit pool; each entry tagged with a stable dealKey so we can
  // track which specific cards a player has already seen this run.
  // Legit dealKey = "legit:<index in LEGIT>"; virus = "<VIRUSKEY>:<errorIdx>".
  const legitPool = LEGIT.map((e, i) => ({
    card: { ...e, isVirus: false, virusKey: null }, dealKey: "legit:" + i
  }));
  const virusPoolSize = avail.reduce((s, k) => s + VIRUSES[k].errors.length, 0);
  const virusCount = Math.min(virusPoolSize, Math.max(2, Math.round(cardsThisRound * virusRatio)));
  const legitCount = cardsThisRound - virusCount;

  if (!state.usedLegit)        state.usedLegit        = new Set();
  if (!state.usedVirusErrors)  state.usedVirusErrors  = new Set();

  const deck = shuffle(
    // Viruses: equal odds per virus regardless of how many error variants exist.
    pickByUniformVirus(avail, virusCount, state.usedVirusErrors)
      // Legits: sqrt-weighted by template so rare templates still appear.
      .concat(pickByUniformTemplate(legitPool, legitCount, state.usedLegit))
  );
  return spreadSameVirus(deck).map(randomizeCard);
}

/* Pick `n` virus cards such that each *virus* has equal odds per slot,
   regardless of how many error variants exist in the codebase. Each slot:
   pick a virus uniformly from `avail`, then pick a random fresh error card
   from that virus's pool (falls back to stale if all of its variants have
   already been dealt this run).
   Without this, viruses with more error variants (like MIMIC at 29 cards)
   appear 3-4x as often as viruses with fewer variants (like HEARTBEAT at 10) —
   because the previous template-balanced picker effectively weighted each
   virus by its pool size. */
// Per-virus weight for the uniform-virus picker. Regular viruses weight 1.0
// (equal odds with each other). Rare viruses (real-life ones marked with
// rare:true — ILOVEYOU, MYDOOM, WANNACRY, IDIOT, ...) share a constant
// total weight budget so the SUM across all rares always produces about
// the same per-run rate, no matter how many rares exist.
//
// Derivation: want ~1 rare per 10-round run, ~45 virus draws/run.
//   1 ≈ 45 × (totalRare / (regulars + totalRare))
//   totalRare ≈ regulars / 44 ≈ 0.43 when we have 19 regulars
// So per-rare weight = 0.43 / rareCount; auto-tunes as rares are added.
function virusWeight(k) {
  if (!VIRUSES[k] || !VIRUSES[k].rare) return 1.0;
  let rareCount = 0;
  for (const key in VIRUSES) if (VIRUSES[key].rare) rareCount++;
  return 0.43 / Math.max(1, rareCount);
}

function pickByUniformVirus(avail, n, usedKeys) {
  if (n <= 0 || avail.length === 0) return [];
  // Build a cumulative-weight array once so each slot is a single binary
  // search rather than re-summing weights every iteration.
  const weights = avail.map(virusWeight);
  const cum = [];
  let total = 0;
  for (let i = 0; i < weights.length; i++) { total += weights[i]; cum.push(total); }
  function pickWeighted() {
    const r = Math.random() * total;
    for (let i = 0; i < cum.length; i++) if (r < cum[i]) return avail[i];
    return avail[avail.length - 1];
  }
  const picked = [];
  let safety = n * 10;
  while (picked.length < n && safety-- > 0) {
    const k = pickWeighted();
    const errors = VIRUSES[k].errors;
    if (!errors.length) continue;
    const fresh = [];
    const stale = [];
    for (let i = 0; i < errors.length; i++) {
      const dealKey = k + ":" + i;
      (usedKeys.has(dealKey) ? stale : fresh).push(i);
    }
    const idx = fresh.length ? fresh[Math.floor(Math.random() * fresh.length)]
                             : (stale.length ? stale[Math.floor(Math.random() * stale.length)] : -1);
    if (idx < 0) continue;
    usedKeys.add(k + ":" + idx);
    picked.push({ ...errors[idx], isVirus: true, virusKey: k });
  }
  return picked;
}

/* After shuffle, avoid two cards from the SAME virus landing next to each other.
   Even with different error texts, "MELTDOWN, MELTDOWN" in a row reads as
   déjà vu. Walk the deck once and swap the second offender with a later card
   whose virusKey differs (legit cards have virusKey=null, so they qualify). */
function spreadSameVirus(deck) {
  for (let i = 0; i < deck.length - 1; i++) {
    if (!deck[i].isVirus || !deck[i + 1].isVirus) continue;
    if (deck[i].virusKey !== deck[i + 1].virusKey) continue;
    for (let j = i + 2; j < deck.length; j++) {
      if (deck[j].virusKey !== deck[i].virusKey) {
        const tmp = deck[i + 1]; deck[i + 1] = deck[j]; deck[j] = tmp;
        break;
      }
    }
  }
  return deck;
}

/* Pick `n` cards from `pool` with template-balanced weighting.
   Each template's pick weight = sqrt(its fresh card count). That gives:
     - A 1-card template (e.g. CAPTCHA) gets weight 1
     - A 100-card template (e.g. WIN11) gets weight 10
   Rare templates still show up regularly, but a template with only 1 card
   no longer dominates the slot — otherwise its one card would get dealt
   every time the template was chosen, which is the root of the "same 10
   cards every run" bug.
   Within the chosen template, picks a random fresh card (falls back to
   stale if everything's been dealt). `usedKeys` tracks dealt cards across
   rounds so the same card doesn't repeat inside one run. */
function pickByUniformTemplate(pool, n, usedKeys) {
  if (n <= 0 || pool.length === 0) return [];
  const byTemplate = {};
  pool.forEach(p => {
    const t = p.card.template || "unknown";
    if (!byTemplate[t]) byTemplate[t] = [];
    byTemplate[t].push(p);
  });
  const picked = [];
  let safety = n * 4;
  while (picked.length < n && safety-- > 0) {
    // Build weighted candidate list each iteration so usedKeys updates flow in
    const candidates = [];
    for (const t of Object.keys(byTemplate)) {
      const bucket = byTemplate[t];
      const fresh = bucket.filter(p => !usedKeys.has(p.dealKey));
      const stale = bucket.filter(p =>  usedKeys.has(p.dealKey));
      const usable = fresh.length ? fresh : stale;
      if (!usable.length) continue;
      candidates.push({ usable, weight: Math.sqrt(usable.length) });
    }
    if (!candidates.length) break;
    const totalW = candidates.reduce((s, c) => s + c.weight, 0);
    let r = Math.random() * totalW;
    let chosen = candidates[candidates.length - 1];
    for (const c of candidates) {
      r -= c.weight;
      if (r <= 0) { chosen = c; break; }
    }
    const choice = rand(chosen.usable);
    picked.push(choice.card);
    usedKeys.add(choice.dealKey);
  }
  return picked;
}

function rollTampering(round, card) {
  // Shift effective round based on difficulty / mode
  const mode = state.gameMode === "challenge" ? "challenge" : state.difficulty;
  const shifts = { easy: -2, normal: 0, hard: 2, challenge: 2, nightmare: 4 };
  const effRound = round + (shifts[mode] || 0);
  if (effRound < 4) return null;
  if (card.virusKey === "HEARTBEAT") {
    return { type: effRound >= 7 ? "pulseHard" : "pulse" };
  }
  if (card.virusKey === "DOTNULL") {
    return { type: "null" };
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
  Audio.updateMusicIntensity(0);   // round 1 = minimal layers
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
  // Empty the per-run "already-dealt" sets so each fresh run starts with the
  // full legit + virus pools available again. Templates are picked uniformly
  // by buildDeck, and within each template the dealt cards stay tracked here.
  state.usedLegit = new Set();
  state.usedVirusErrors = new Set();
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
    // Endless mode has no finish line — just keep climbing rounds forever.
    if (state.round >= CONFIG.totalRounds && state.gameMode !== "endless") {
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
    // Music intensity ramps with round progress. Endless caps at full at round 10+.
    const denom = state.gameMode === "endless" ? 10 : CONFIG.totalRounds;
    Audio.updateMusicIntensity((state.round - 1) / Math.max(1, denom - 1));
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
  if (card.pulse) Audio.heartbeat();
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
        startRandomAntivirusMinigame(card);
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

/* Minigame system lives in minigames.js — entry points are
   startRandomAntivirusMinigame(card) and startTrainingMinigame(). */

function showReveal(correct, card) {
  const r = document.getElementById("reveal");
  if (!r) return;
  r.className = "reveal " + (correct ? "correct" : "wrong");
  // Use the virus's display name (e.g. "A5515T4N7", "T.A.R.P.I.T.") rather
  // than the raw internal key (ASSISTANT, TARPIT). Falls back to the key
  // if the virus somehow isn't in VIRUSES (shouldn't happen in practice).
  const virusName = card.isVirus
    ? ((VIRUSES[card.virusKey] && VIRUSES[card.virusKey].name) || card.virusKey)
    : null;
  let label;
  if (card && card._antivirusSave) {
    label = "🛡 Quarantined · " + virusName;
  } else if (correct) {
    label = card.isVirus ? ("Neutralized · " + virusName) : "Clear";
  } else {
    label = card.isVirus ? ("Missed · " + virusName) : "False Positive";
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
    if (el) {
      el.classList.add("open");
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}
