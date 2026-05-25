// =====================================================
// main.js — router + global event handlers + boot
// Loads last; calls render() at the bottom to start the app.
// =====================================================
"use strict";


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
    case "minigame-pick-difficulty": html = viewMinigamePickDifficulty(); break;
    case "minigame-pick-type":       html = viewMinigamePickType(); break;
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
  // Music: menu music plays on all out-of-game screens; in-game music is started
  // by startChallenge/startTraining. Death + minigame screens are silent on the music side.
  applyMusicForScreen();
  applyAssistantStatic();
  applyStaticNoise();
  applyMimicPopups();
  applyCryptexRain();
  applyRewriterSparkles();
  applyIloveyouHeart();
}

const MENU_MUSIC_SCREENS = new Set([
  "menu", "settings", "codex", "shop",
  "difficulty-picker", "minigame-pick-difficulty", "minigame-pick-type",
  "epilepsy-warning", "reset-confirm"
]);

function applyMusicForScreen() {
  if (MENU_MUSIC_SCREENS.has(state.screen)) {
    Audio.startMenuMusic();
  } else {
    Audio.stopMenuMusic();
  }
}

/* ============================================================
   A5515T4N7 (ASSISTANT) — 64x64 black/green static effect
   Each pixel is randomly black or green; the whole grid re-rolls every 0.1s.
   ============================================================ */
let _assistantStaticInterval = null;

function paintAssistantStatic() {
  const el = document.querySelector(".death-ASSISTANT");
  if (!el) return;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(64, 64);
  for (let i = 0; i < img.data.length; i += 4) {
    const on = Math.random() < 0.6;
    img.data[i]     = on ? 0   : 0;
    img.data[i + 1] = on ? 255 : 0;
    img.data[i + 2] = on ? 0   : 0;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  el.style.backgroundImage = "url(" + c.toDataURL() + ")";
}

function applyAssistantStatic() {
  const onScreen =
    (state.screen === "dying"    && state.killer      === "ASSISTANT") ||
    (state.screen === "preview"  && state.previewVirus === "ASSISTANT") ||
    (state.screen === "infected" && state.killer      === "ASSISTANT");
  if (onScreen && !_assistantStaticInterval) {
    paintAssistantStatic();
    _assistantStaticInterval = setInterval(paintAssistantStatic, 100);
  } else if (!onScreen && _assistantStaticInterval) {
    clearInterval(_assistantStaticInterval);
    _assistantStaticInterval = null;
  } else if (onScreen) {
    paintAssistantStatic();
  }
}

/* ============================================================
   STATIC + TARPIT — proper analog TV snow.
   Each pixel of a 256x192 canvas gets a random GRAY value (0–255)
   every 50ms (20fps). image-rendering: pixelated scales it up to the
   full screen with crisp chunks instead of smooth blur. Pushed into
   the death screen as a CSS custom property so the existing
   background-image rule can consume it without restructuring.
   TARPIT shares the same painter — its ::after layer reads
   var(--static-noise) too, blended over its yellow phosphor wash.
   ============================================================ */
let _staticNoiseInterval = null;

function paintStaticInto(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const c = document.createElement("canvas");
  c.width = 256; c.height = 192;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255 | 0;
    d[i]     = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  el.style.setProperty("--static-noise", "url(" + c.toDataURL() + ")");
}

function killerIs(key) {
  return (state.screen === "dying"    && state.killer       === key) ||
         (state.screen === "preview"  && state.previewVirus === key) ||
         (state.screen === "infected" && state.killer       === key);
}

function applyStaticNoise() {
  const targets = [];
  if (killerIs("STATIC")) targets.push(".death-STATIC");
  if (killerIs("TARPIT")) targets.push(".death-TARPIT");
  const onScreen = targets.length > 0;
  const repaint = () => targets.forEach(paintStaticInto);
  if (onScreen && !_staticNoiseInterval) {
    repaint();
    _staticNoiseInterval = setInterval(repaint, 50);
  } else if (!onScreen && _staticNoiseInterval) {
    clearInterval(_staticNoiseInterval);
    _staticNoiseInterval = null;
  } else if (onScreen) {
    repaint();
  }
}

/* ============================================================
   MIMICER death — ONE error card displayed in the center of a bright
   blue background. In real death mode it's the card that killed you
   (state.killerCard). In codex preview mode it's a random pick from
   MIMICER's own error pool. The card glitches gently in place. The
   bright blue background pulses subtly behind it.
   ============================================================ */
function applyMimicPopups() {
  const target = document.querySelector(".death-MIMICER");
  if (!target) return;
  if (!killerIs("MIMICER")) {
    target.dataset.mimicPopulated = "";
    return;
  }
  if (target.dataset.mimicPopulated === "1") return;
  target.dataset.mimicPopulated = "1";
  const old = target.querySelector(".mimic-popups");
  if (old) old.remove();

  // Pick the card to display.
  //   dying / infected → state.killerCard (the actual card that killed you).
  //   preview          → random pick from MIMICER's own error pool.
  let card = state.killerCard;
  if (!card) {
    const errors = (VIRUSES.MIMICER && VIRUSES.MIMICER.errors) || [];
    if (errors.length) {
      const pick = errors[Math.floor(Math.random() * errors.length)];
      // Mark it as virus-flavored so placeholders resolve to virus-side values.
      card = randomizeCard({ ...pick, isVirus: true, virusKey: "MIMICER" });
    }
  }
  if (!card) return;

  const html = renderCard(card);
  const container = document.createElement("div");
  container.className = "mimic-popups";
  const outer = document.createElement("div");
  outer.className = "mimic-popup mimic-popup-center";
  const glitch = document.createElement("div");
  glitch.className = "mimic-glitch";
  const cardWrap = document.createElement("div");
  cardWrap.className = "mimic-card";
  cardWrap.innerHTML = html;
  glitch.appendChild(cardWrap);
  outer.appendChild(glitch);
  container.appendChild(outer);
  target.appendChild(container);
}

/* ============================================================
   CRYPT0 death — generate ~14 columns of ransom $-suffixed numbers,
   all streaming down at the same speed. Random starting amounts and
   per-column animation-delay so the columns desync visually.
   ============================================================ */
const CRYPT0_AMOUNTS = [
  "47$", "88$", "299$", "499$", "999$", "1,200$", "1,499$", "4,217$",
  "8,441$", "12,400$", "12,882$", "18,200$", "18,442$", "21,003$",
  "27,500$", "31,082$", "42,108$", "47,000$", "65,000$", "65,704$",
  "88,221$", "99.99$", "999.99$", "0.1 BTC$", "0.3 BTC$", "0.5 BTC$",
  "0.8 BTC$", "0.3 ETH$", "0.5 ETH$", "$"
];
/* ============================================================
   ILOVEYOU bouncing heart — DVD-screensaver-style pixel art
   heart that ping-pongs across the death stage. The wrapper
   handles X bounce, the heart handles Y bounce, both pure CSS
   (see .iloveyou-wrap / .iloveyou-heart in styles.css).
   This function just injects the DOM nodes once when the
   killer is ILOVEYOU.
   ============================================================ */
function applyIloveyouHeart() {
  const target = document.querySelector(".death-ILOVEYOU");
  if (!target) return;
  if (!killerIs("ILOVEYOU")) {
    target.dataset.iloveyouHeart = "";
    return;
  }
  if (target.dataset.iloveyouHeart === "1") return;
  target.dataset.iloveyouHeart = "1";
  const old = target.querySelector(".iloveyou-wrap");
  if (old) old.remove();

  // 8-wide × 7-tall chunky pixel heart at 16px per pixel = 128 × 112 final.
  // Drawn as horizontal rows to keep the SVG short; one light highlight
  // pixel up-top for the classic 8-bit shine.
  const heartSvg = `
    <svg viewBox="0 0 128 112" width="128" height="112" shape-rendering="crispEdges" aria-hidden="true">
      <g fill="#ff0033">
        <rect x="16"  y="0"   width="16" height="16"/>
        <rect x="32"  y="0"   width="16" height="16"/>
        <rect x="80"  y="0"   width="16" height="16"/>
        <rect x="96"  y="0"   width="16" height="16"/>
        <rect x="0"   y="16"  width="128" height="16"/>
        <rect x="0"   y="32"  width="128" height="16"/>
        <rect x="0"   y="48"  width="128" height="16"/>
        <rect x="16"  y="64"  width="96"  height="16"/>
        <rect x="32"  y="80"  width="64"  height="16"/>
        <rect x="48"  y="96"  width="32"  height="16"/>
      </g>
      <!-- 8-bit shine pixel -->
      <rect x="16" y="16" width="16" height="16" fill="#ff80a0"/>
      <rect x="32" y="16" width="16" height="16" fill="#ff5577"/>
    </svg>`;

  const wrap = document.createElement("div");
  wrap.className = "iloveyou-wrap";
  const heart = document.createElement("div");
  heart.className = "iloveyou-heart";
  heart.innerHTML = heartSvg;
  wrap.appendChild(heart);
  target.appendChild(wrap);
}

function applyCryptexRain() {
  const target = document.querySelector(".death-CRYPT0");
  if (!target) return;
  if (!killerIs("CRYPT0")) {
    target.dataset.cryptexPopulated = "";
    return;
  }
  if (target.dataset.cryptexPopulated === "1") return;
  target.dataset.cryptexPopulated = "1";
  const old = target.querySelector(".cryptex-rain");
  if (old) old.remove();

  const container = document.createElement("div");
  container.className = "cryptex-rain";
  const STREAMS = 14;
  // Palette of gold-to-red tones; pick one per column for variety.
  const palette = ["#ffcc00", "#ffaa00", "#ffd060", "#ff9900", "#ff7733", "#ff5500"];
  for (let i = 0; i < STREAMS; i++) {
    const col = document.createElement("div");
    col.className = "cryptex-stream";
    // Spread columns across the screen with light overlap allowed.
    col.style.left = (i * (100 / STREAMS)) + "%";
    col.style.width = (100 / STREAMS) + "%";
    col.style.fontSize = (1.1 + Math.random() * 1.4).toFixed(2) + "rem";
    col.style.color = palette[Math.floor(Math.random() * palette.length)];
    col.style.animationDelay = (-Math.random() * 4.5).toFixed(2) + "s";
    // Build ~24 lines per column from random amounts.
    const lines = [];
    for (let j = 0; j < 24; j++) {
      lines.push(CRYPT0_AMOUNTS[Math.floor(Math.random() * CRYPT0_AMOUNTS.length)]);
    }
    col.textContent = lines.join("\n");
    container.appendChild(col);
  }
  target.appendChild(container);
}

/* ============================================================
   Rewriter() sparkles — scatter ~120 yellow ✦ across the screen,
   each at a random position, size, color, and twinkle phase so the
   whole field shimmers unpredictably.
   ============================================================ */
const SPARK_GLYPHS  = ["•", "·", "●", "•", "·"];
const SPARK_COLORS  = ["#ffd56b", "#ffcc00", "#ffe080", "#ffaa00", "#fff0aa"];
function applyRewriterSparkles() {
  const target = document.querySelector(".death-REWRITER");
  if (!target) return;
  if (!killerIs("REWRITER")) {
    target.dataset.rewriterSparkled = "";
    return;
  }
  if (target.dataset.rewriterSparkled === "1") return;
  target.dataset.rewriterSparkled = "1";
  const old = target.querySelector(".rewriter-sparkles");
  if (old) old.remove();

  const container = document.createElement("div");
  container.className = "rewriter-sparkles";
  const COUNT = 120;
  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement("span");
    s.className = "rewriter-spark";
    s.textContent = SPARK_GLYPHS[Math.floor(Math.random() * SPARK_GLYPHS.length)];
    s.style.left = (Math.random() * 100).toFixed(2) + "%";
    s.style.top  = (Math.random() * 100).toFixed(2) + "%";
    s.style.fontSize = (0.6 + Math.random() * 1.6).toFixed(2) + "rem";
    s.style.color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
    // Negative random delay so each sparkle starts somewhere mid-cycle.
    s.style.animationDelay = (-Math.random() * 1.8).toFixed(2) + "s";
    s.style.animationDuration = (1.2 + Math.random() * 1.6).toFixed(2) + "s";
    container.appendChild(s);
  }
  target.appendChild(container);
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
    case "play-endless":
      state.gameMode = "endless";
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
      hitQuarantineTarget(parseInt(btn.dataset.target, 10));
      break;
    }
    case "seq-hit": {
      hitSequenceBtn(parseInt(btn.dataset.seqBtn, 10));
      break;
    }
    case "impostor-hit": {
      hitImpostorIcon(parseInt(btn.dataset.impostorIdx, 10));
      break;
    }
    case "minigame-practice":
      // Step 1 of practice: ask which difficulty
      state.minigameTrainingDifficulty = null;
      state.minigameTrainingType = null;
      state.screen = "minigame-pick-difficulty";
      render();
      break;
    case "mg-pick-difficulty":
      // Step 2: ask which minigame
      state.minigameTrainingDifficulty = btn.dataset.diff;
      state.screen = "minigame-pick-type";
      render();
      break;
    case "mg-pick-type":
      // Start practicing with chosen difficulty + type
      state.minigameTrainingType = btn.dataset.type;
      state.minigameStats = Object.assign({}, TRAINING_STATS_DEFAULT);
      startTrainingMinigame();
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
  // ESC skips the death animation — works on both the real death screen
  // (→ jump to game-over) and the codex preview (→ back to codex).
  if (e.key === "Escape") {
    if (state.screen === "dying") {
      if (state.deathTimeout) { clearTimeout(state.deathTimeout); state.deathTimeout = null; }
      Audio.stopDeath();
      state.screen = "infected";
      render();
      return;
    }
    if (state.screen === "preview") {
      if (state.previewTimeout) { clearTimeout(state.previewTimeout); state.previewTimeout = null; }
      Audio.stopDeath();
      state.previewVirus = null;
      state.screen = "codex";
      render();
      const backList = document.querySelector(".codex-list");
      if (backList) backList.scrollTop = state.codexScrollY || 0;
      return;
    }
  }
  if (state.screen !== "play" && state.screen !== "training") return;
  if (state.locked) return;
  if (e.key === "ArrowLeft" || e.key === "v" || e.key === "V" || e.key === "1") choose(true);
  if (e.key === "ArrowRight" || e.key === "c" || e.key === "C" || e.key === "2") choose(false);
});

/* ============================================================
   INIT
   ============================================================ */

render();
