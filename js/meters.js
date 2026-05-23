// =====================================================
// meters.js — fake telemetry HUD
// Depends on core.js (pad2, rng, clamp would conflict — kept locally)
// Defines: FAKE_CLOCK_START, fakeClock, METERS, meterEffectFor, cardFxClasses
// =====================================================
"use strict";

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
    // Legit cards don't get the red 'bad' flag.
    // A virus card can also opt-in to the quiet treatment by adding quiet:true to
    // its meterEffect — A5515T4N7 uses this so its too-perfect values stay subtle.
    this.overrideIsVirus = isVirus !== false && !(eff && eff.quiet);
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
      case "lowfps":    return String(rng(1, 11));
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
