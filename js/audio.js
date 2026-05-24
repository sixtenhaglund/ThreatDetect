// =====================================================
// audio.js — Web Audio engine + per-virus death sounds
// AUDIO_BLOBS can be filled with base64 wav/mp3 data URIs
// to override the procedural sounds keyed by name.
// =====================================================

"use strict";

const AUDIO_BLOBS = {
  // Example:
  // scream: "data:audio/wav;base64,UklGR..."
};

const Audio = {
  ctx: null, masterGain: null, ambientGain: null, sfxGain: null,
  deathGain: null,        // dedicated gain for death sounds — disconnecting it instantly silences everything in flight
  ambientNodes: null,
  unlocked: false,
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = save.settings.master;
    this.masterGain.connect(this.ctx.destination);
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = save.settings.ambient;
    this.ambientGain.connect(this.masterGain);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = save.settings.sfx;
    this.sfxGain.connect(this.masterGain);
  },
  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    this.unlocked = true;
  },
  applyVolumes() {
    if (!this.ctx) return;
    this.masterGain.gain.value  = save.settings.master;
    this.ambientGain.gain.value = save.settings.ambient;
    this.sfxGain.gain.value     = save.settings.sfx;
  },
  /* Layered procedural music. Four layers fade in as the run gets harder:
       L1 drone     — always playing (creates the base 'room is alive' feel)
       L2 arpeggio  — fades in around round-fraction 0.2 (slow 4-note melody)
       L3 kick      — fades in around 0.5 (heartbeat-like sub pulse)
       L4 shimmer   — fades in around 0.75 (high tense pad with tremolo)
     Call updateMusicIntensity(0..1) any time the round changes. */
  startAmbient() {
    if (!this.ctx || this.ambientNodes) return;
    const ctx = this.ctx;
    const out = this.ambientGain;
    const t0 = ctx.currentTime;

    // ----- L1 drone -----
    const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 55;
    const o2 = ctx.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = 55.4;
    const o3 = ctx.createOscillator(); o3.type = "sine";     o3.frequency.value = 110;
    const droneLp = ctx.createBiquadFilter();
    droneLp.type = "lowpass"; droneLp.frequency.value = 320; droneLp.Q.value = 0.4;
    const droneG = ctx.createGain(); droneG.gain.value = 0;
    o1.connect(droneLp); o2.connect(droneLp); o3.connect(droneLp);
    droneLp.connect(droneG); droneG.connect(out);
    o1.start(); o2.start(); o3.start();
    droneG.gain.linearRampToValueAtTime(0.18, t0 + 1.5);
    const droneLfo = ctx.createOscillator(); droneLfo.type = "sine"; droneLfo.frequency.value = 0.15;
    const droneLfoGain = ctx.createGain(); droneLfoGain.gain.value = 90;
    droneLfo.connect(droneLfoGain); droneLfoGain.connect(droneLp.frequency); droneLfo.start();

    // ----- L2 arpeggio (A2 - C3 - D3 - C3, minor, eerie) -----
    const arpG = ctx.createGain(); arpG.gain.value = 0;
    arpG.connect(out);
    let arpStep = 0;
    const self = this;
    const arpInterval = setInterval(function () {
      if (!self.ambientNodes) return;
      const notes = [110, 130.81, 146.83, 130.81];
      const f = notes[arpStep % notes.length];
      const start = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain();
      o.connect(g); g.connect(arpG);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.3, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.55);
      o.start(start); o.stop(start + 0.6);
      arpStep++;
    }, 800);

    // ----- L3 kick pulse (low sine thump) -----
    const kickG = ctx.createGain(); kickG.gain.value = 0;
    kickG.connect(out);
    const kickInterval = setInterval(function () {
      if (!self.ambientNodes) return;
      const start = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(80, start);
      o.frequency.exponentialRampToValueAtTime(40, start + 0.1);
      const g = ctx.createGain();
      o.connect(g); g.connect(kickG);
      g.gain.setValueAtTime(0.55, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      o.start(start); o.stop(start + 0.2);
    }, 1600);

    // ----- L4 high shimmer (two sines + slow tremolo) -----
    const shimG = ctx.createGain(); shimG.gain.value = 0;
    shimG.connect(out);
    const shimO  = ctx.createOscillator(); shimO.type  = "sine"; shimO.frequency.value  = 880;
    const shimO2 = ctx.createOscillator(); shimO2.type = "sine"; shimO2.frequency.value = 1318.5;
    shimO.connect(shimG); shimO2.connect(shimG);
    shimO.start(); shimO2.start();
    const shimLfo = ctx.createOscillator(); shimLfo.type = "sine"; shimLfo.frequency.value = 0.3;
    const shimLfoGain = ctx.createGain(); shimLfoGain.gain.value = 0.04;
    shimLfo.connect(shimLfoGain); shimLfoGain.connect(shimG.gain); shimLfo.start();

    this.ambientNodes = {
      o1, o2, o3, droneG, droneLfo,
      arpG, arpInterval,
      kickG, kickInterval,
      shimG, shimO, shimO2, shimLfo
    };
  },

  /* Re-balance the music layers for a given progress fraction (0–1).
     L1 stays full; L2/L3/L4 each cross a threshold to fade in. */
  updateMusicIntensity(t) {
    if (!this.ambientNodes || !this.ctx) return;
    const tNow = this.ctx.currentTime;
    const fade = 2.0;
    const tt = Math.max(0, Math.min(1, t));
    const arp  = Math.max(0, Math.min(1, (tt - 0.20) / 0.30)) * 0.12;
    const kick = Math.max(0, Math.min(1, (tt - 0.50) / 0.30)) * 0.14;
    const shim = Math.max(0, Math.min(1, (tt - 0.75) / 0.25)) * 0.08;
    const { arpG, kickG, shimG } = this.ambientNodes;
    arpG.gain.cancelScheduledValues(tNow);
    arpG.gain.linearRampToValueAtTime(arp,  tNow + fade);
    kickG.gain.cancelScheduledValues(tNow);
    kickG.gain.linearRampToValueAtTime(kick, tNow + fade);
    shimG.gain.cancelScheduledValues(tNow);
    shimG.gain.linearRampToValueAtTime(shim, tNow + fade);
  },

  stopAmbient() {
    if (!this.ambientNodes) return;
    const t = this.ctx.currentTime;
    const a = this.ambientNodes;
    clearInterval(a.arpInterval);
    clearInterval(a.kickInterval);
    [a.droneG, a.arpG, a.kickG, a.shimG].forEach(function (g) {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.5);
    });
    a.o1.stop(t + 0.6); a.o2.stop(t + 0.6); a.o3.stop(t + 0.6);
    a.droneLfo.stop(t + 0.6);
    a.shimO.stop(t + 0.6); a.shimO2.stop(t + 0.6); a.shimLfo.stop(t + 0.6);
    this.ambientNodes = null;
  },

  /* Menu music — calmer, mysterious, warmer chord pad than the in-play track.
     Two layers: a slow major-7-ish chord pad that breathes, and an occasional
     high "tinkle" every few seconds for interest. */
  startMenuMusic() {
    if (!this.ctx || this.menuNodes) return;
    const ctx = this.ctx;
    const out = this.ambientGain;
    const t0 = ctx.currentTime;
    // Pad: 4 sine voices forming a Cmaj9 chord (C-E-G-D)
    const padG = ctx.createGain(); padG.gain.value = 0;
    padG.connect(out);
    const freqs = [130.81, 164.81, 196.00, 293.66]; // C3 E3 G3 D4
    const padOscs = freqs.map(function (f) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0.12;
      o.connect(g); g.connect(padG); o.start();
      return o;
    });
    padG.gain.linearRampToValueAtTime(0.22, t0 + 2.5);
    // Slow tremolo for the "breathing"
    const padLfo = ctx.createOscillator(); padLfo.type = "sine"; padLfo.frequency.value = 0.12;
    const padLfoGain = ctx.createGain(); padLfoGain.gain.value = 0.06;
    padLfo.connect(padLfoGain); padLfoGain.connect(padG.gain); padLfo.start();
    this.menuNodes = { padG, padOscs, padLfo };
  },

  stopMenuMusic() {
    if (!this.menuNodes) return;
    const t = this.ctx.currentTime;
    const m = this.menuNodes;
    m.padG.gain.cancelScheduledValues(t);
    m.padG.gain.setValueAtTime(m.padG.gain.value, t);
    m.padG.gain.linearRampToValueAtTime(0, t + 0.6);
    m.padOscs.forEach(function (o) { o.stop(t + 0.7); });
    m.padLfo.stop(t + 0.7);
    this.menuNodes = null;
  },
  _env(g, t, a, d, peak) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  },
  click() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "square"; o.frequency.value = 720;
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.sfxGain);
    this._env(g, t, 0.001, 0.05, 0.18);
    o.start(t); o.stop(t + 0.08);
  },
  correct() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [659.25, 987.77].forEach((f, i) => {
      const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const g = this.ctx.createGain();
      o.connect(g); g.connect(this.sfxGain);
      this._env(g, t + i * 0.07, 0.005, 0.16, 0.22);
      o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.22);
    });
  },
  wrong() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.45);
    const g = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
    o.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    this._env(g, t, 0.002, 0.5, 0.32);
    o.start(t); o.stop(t + 0.55);
  },
  scream() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o1 = this.ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 540;
    const o2 = this.ctx.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = 547;
    const vibrato = this.ctx.createOscillator(); vibrato.type = "sine"; vibrato.frequency.value = 9;
    const vibratoGain = this.ctx.createGain(); vibratoGain.gain.value = 30;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(o1.frequency); vibratoGain.connect(o2.frequency);
    const dist = this.ctx.createWaveShaper();
    const k = 50, samples = 1024, curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = i * 2 / samples - 1;
      curve[i] = (3 + k) * x * 20 / (Math.PI + k * Math.abs(x));
    }
    dist.curve = curve;
    const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 300;
    const g = this.ctx.createGain();
    o1.connect(dist); o2.connect(dist); dist.connect(hp); hp.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.55, t + 0.04);
    g.gain.linearRampToValueAtTime(0.45, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o1.start(t); o2.start(t); vibrato.start(t);
    o1.stop(t + 1.2); o2.stop(t + 1.2); vibrato.stop(t + 1.2);
  },
  glitch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const bp = this.ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 2;
    const g = this.ctx.createGain(); g.gain.value = 0.35;
    src.connect(bp); bp.connect(g); g.connect(this.sfxGain);
    src.start(t);
  },
  heartbeat() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sine"; o.frequency.value = 60;
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.sfxGain);
    this._env(g, t, 0.005, 0.18, 0.4);
    this._env(g, t + 0.22, 0.005, 0.2, 0.35);
    o.start(t); o.stop(t + 0.6);
  },
  gameOver() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(330, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 1.4);
    const g = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200;
    o.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    this._env(g, t, 0.01, 1.4, 0.4);
    o.start(t); o.stop(t + 1.5);
  },
  levelUp() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = this.ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      const g = this.ctx.createGain();
      o.connect(g); g.connect(this.sfxGain);
      this._env(g, t + i * 0.09, 0.005, 0.22, 0.24);
      o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.3);
    });
  }
};

/* ============================================================
   Per-virus death sounds (all procedural)
   ============================================================ */

Audio.stinger = function() {
  if (!this.ctx) return;
  const t = this.ctx.currentTime;
  // High-pitch piercing sting that drops fast — the classic horror-movie sweep. LOUD.
  const o = this.ctx.createOscillator(); o.type = "sawtooth";
  o.frequency.setValueAtTime(3000, t);
  o.frequency.exponentialRampToValueAtTime(85, t + 0.45);
  const g = this.ctx.createGain();
  o.connect(g); g.connect(this.sfxGain);
  g.gain.setValueAtTime(1.6, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  o.start(t); o.stop(t + 0.6);
  // White-noise burst layered on top for impact
  const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.35), this.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = this.ctx.createBufferSource(); src.buffer = buf;
  const ng = this.ctx.createGain(); ng.gain.value = 1.2;
  src.connect(ng); ng.connect(this.sfxGain);
  src.start(t);
  // Sub-bass thump
  const sub = this.ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = 60;
  const sg = this.ctx.createGain();
  sub.connect(sg); sg.connect(this.sfxGain);
  sg.gain.setValueAtTime(1.5, t);
  sg.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  sub.start(t); sub.stop(t + 0.75);
};

Audio.boostFor = function(seconds) {
  if (!this.ctx) return;
  const t = this.ctx.currentTime;
  const base = save.settings.sfx;
  const peak = Math.min(2.0, Math.max(base, 0.4) * 2.4);
  this.sfxGain.gain.cancelScheduledValues(t);
  this.sfxGain.gain.setValueAtTime(peak, t);
  this.sfxGain.gain.setValueAtTime(peak, t + seconds);
  this.sfxGain.gain.linearRampToValueAtTime(base, t + seconds + 0.4);
};

Audio.death = function(key, skipJumpscare) {
  if (!this.ctx) return;
  const wantJump = !skipJumpscare && save.settings.jumpscares !== false;
  // Tear down any previous death audio chain so old sounds can't bleed into this one.
  this.killDeathChain();
  // Build a fresh, isolated gain node for this death. Disconnecting it later cuts ALL
  // scheduled oscillators routed through it — even ones still in the future.
  this.deathGain = this.ctx.createGain();
  const base = save.settings.sfx;
  // Constant boost for the full death — sounds shouldn't get quieter mid-animation.
  // The boost is louder when jumpscare is on, moderate otherwise.
  const level = wantJump ? Math.min(2.6, Math.max(base, 0.4) * 2.6) : base;
  this.deathGain.gain.value = level;
  this.deathGain.connect(this.masterGain);
  // While the death function runs, point sfxGain at deathGain so helper functions
  // (beep, scream, heartbeat, noiseBurst, stinger) automatically route their output there.
  const realSfx = this.sfxGain;
  this.sfxGain = this.deathGain;
  try {
    if (wantJump) this.stinger();
    const fn = this.deaths[key];
    if (fn) fn.call(this);
    else this.gameOver();
  } finally {
    this.sfxGain = realSfx;
  }
};

/* Schedule a callback that should run inside the current death's audio scope.
   Used by deaths that play multiple sounds over time (SCREAMER, PULSE).
   If stopDeath fires before the callback, the callback becomes a no-op. */
Audio.scheduleDeath = function(delayMs, fn) {
  const dg = this.deathGain;
  setTimeout(() => {
    if (this.deathGain !== dg) return;
    const realSfx = this.sfxGain;
    this.sfxGain = dg;
    try { fn.call(this); } finally { this.sfxGain = realSfx; }
  }, delayMs);
};

/* Hard-cut everything currently playing through the death chain. */
Audio.killDeathChain = function() {
  if (!this.deathGain) return;
  try { this.deathGain.disconnect(); } catch (e) {}
  this.deathGain = null;
};

/* Public: leave preview / skip death animation. Silences any in-flight death audio. */
Audio.stopDeath = function() {
  this.killDeathChain();
};

Audio.noiseBurst = function(start, duration, freq, q, gain) {
  const ctx = this.ctx;
  const buf = ctx.createBuffer(1, Math.max(1, ctx.sampleRate * duration), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = q;
  const g = ctx.createGain(); g.gain.value = gain;
  src.connect(bp); bp.connect(g); g.connect(this.sfxGain);
  src.start(start);
};

Audio.beep = function(start, freq, dur, type, gain) {
  const ctx = this.ctx;
  const o = ctx.createOscillator(); o.type = type || "square"; o.frequency.value = freq;
  const g = ctx.createGain();
  o.connect(g); g.connect(this.sfxGain);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain || 0.18, start + 0.003);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.start(start); o.stop(start + dur + 0.02);
};

Audio.deaths = {
  EPILEPTICA() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 28; i++) {
      this.beep(t + i * 0.13, 1400 + (i % 2) * 700, 0.08, "square", 0.18);
    }
  },
  MELTDOWN() {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 4);
    const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 500;
    const g = this.ctx.createGain();
    o.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.42, t + 0.3);
    g.gain.linearRampToValueAtTime(0.42, t + 3);
    g.gain.exponentialRampToValueAtTime(0.001, t + 4);
    o.start(t); o.stop(t + 4.1);
    for (let i = 0; i < 14; i++) this.noiseBurst(t + Math.random() * 3.5, 0.04, 2000 + Math.random() * 1500, 2, 0.2);
  },
  STATIC() {
    const ctx = this.ctx, t = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.5;
    bp.frequency.setValueAtTime(2200, t);
    bp.frequency.exponentialRampToValueAtTime(280, t + 3.5);
    const g = ctx.createGain(); g.gain.value = 0.85;
    src.connect(bp); bp.connect(g); g.connect(this.sfxGain);
    src.start(t);
  },
  REDRUM() {
    const t = this.ctx.currentTime;
    [55, 82.5].forEach(f => {
      const o = this.ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
      const g = this.ctx.createGain();
      o.connect(g); g.connect(this.sfxGain);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.4);
      g.gain.linearRampToValueAtTime(0.18, t + 3.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + 4.5);
      o.start(t); o.stop(t + 4.6);
    });
    const bell = this.ctx.createOscillator(); bell.type = "triangle"; bell.frequency.value = 247.5;
    const bg = this.ctx.createGain();
    bell.connect(bg); bg.connect(this.sfxGain);
    bg.gain.setValueAtTime(0, t + 0.4);
    bg.gain.linearRampToValueAtTime(0.42, t + 0.42);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
    bell.start(t + 0.4); bell.stop(t + 2.3);
  },
  VOID() {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sine"; o.frequency.value = 420;
    o.frequency.exponentialRampToValueAtTime(18, t + 4);
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0.32, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.5);
    g.gain.linearRampToValueAtTime(0, t + 4);
    o.start(t); o.stop(t + 4.1);
  },
  GASLIGHT() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 24; i++) {
      const delay = i * 0.16 + (Math.random() - 0.5) * 0.1;
      this.beep(t + delay, 780 + Math.random() * 220, 0.03, "triangle", 0.16);
    }
  },
  CRYPTEX() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 12; i++) this.beep(t + i * 0.32, 300 - i * 18, 0.1, "square", 0.22);
  },
  WORM() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 22; i++) {
      const start = t + i * 0.14 + Math.random() * 0.04;
      const o = this.ctx.createOscillator(); o.type = "sawtooth";
      o.frequency.value = 220 + Math.random() * 220;
      o.frequency.linearRampToValueAtTime(o.frequency.value * 2, start + 0.08);
      const g = this.ctx.createGain();
      const hp = this.ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 600;
      o.connect(hp); hp.connect(g); g.connect(this.sfxGain);
      g.gain.setValueAtTime(0.18, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
      o.start(start); o.stop(start + 0.12);
    }
  },
  ROOTKIT() {
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 2);
    const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 800;
    const g = this.ctx.createGain();
    o.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0.5, t);
    g.gain.linearRampToValueAtTime(0.4, t + 1.5);
    g.gain.linearRampToValueAtTime(0, t + 4.5);
    o.start(t); o.stop(t + 4.6);
  },
  DDOS() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 60; i++) this.beep(t + i * 0.07, 1200 + (i % 3) * 300, 0.05, "square", 0.1);
  },
  LEECH() {
    const t = this.ctx.currentTime;
    for (let i = 0; i < 38; i++) {
      const start = t + i * 0.11 + Math.random() * 0.04;
      this.beep(start, 1800 + Math.random() * 400, 0.025, "square", 0.13);
    }
  },
  SCREAMER() {
    this.scream();
    this.scheduleDeath(1100, () => this.scream());
  },
  MIMIC() {
    // Single constant 800Hz sine droning for the full death duration.
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = "sine"; o.frequency.value = 800;
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.05);
    g.gain.setValueAtTime(0.25, t + 4.4);
    g.gain.linearRampToValueAtTime(0, t + 4.5);
    o.start(t); o.stop(t + 4.6);
  },
  PULSE() {
    // Slower, lower-pitched heartbeats — darker and scarier than the standard one.
    const playBeat = () => {
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(); o.type = "sine"; o.frequency.value = 38;
      const g = this.ctx.createGain();
      o.connect(g); g.connect(this.sfxGain);
      this._env(g, t,        0.005, 0.32, 0.55);
      this._env(g, t + 0.32, 0.005, 0.36, 0.5);
      o.start(t); o.stop(t + 0.9);
    };
    for (let i = 0; i < 4; i++) this.scheduleDeath(i * 1100, playBeat);
  },
  DOTNULL() {
    // Chaotic bass — sustained sub+fund (like before) but with random
    // dropouts (sudden silences), random pitch jumps on the sub, and
    // sprinkled higher-pitch click bursts. Different every play.
    const t = this.ctx.currentTime;
    const sub  = this.ctx.createOscillator(); sub.type  = "sine"; sub.frequency.value  = 32;
    const fund = this.ctx.createOscillator(); fund.type = "sine"; fund.frequency.value = 48;
    const g = this.ctx.createGain();
    sub.connect(g); fund.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.1, t + 0.3);
    // ~14 random dropouts between 0.5s and 3.7s — crash to 0 for 30-100ms
    // then snap back to 1.1, so the bass feels like it's losing signal.
    for (let i = 0; i < 14; i++) {
      const at = t + 0.5 + Math.random() * 3.2;
      const dur = 0.03 + Math.random() * 0.07;
      g.gain.setValueAtTime(1.1, at - 0.003);
      g.gain.setValueAtTime(0,   at);
      g.gain.setValueAtTime(0,   at + dur);
      g.gain.setValueAtTime(1.1, at + dur + 0.005);
    }
    g.gain.setValueAtTime(1.1, t + 4);
    g.gain.linearRampToValueAtTime(0, t + 4.5);
    // Random pitch jumps on the sub oscillator (24-56 Hz range).
    for (let i = 0; i < 10; i++) {
      const at = t + 0.4 + Math.random() * 3.5;
      sub.frequency.setValueAtTime(24 + Math.random() * 32, at);
    }
    // Random higher-pitch click bursts at random times — sharp digital
    // pops on top of the bass for "data corruption" texture.
    for (let i = 0; i < 12; i++) {
      const at = t + 0.3 + Math.random() * 3.9;
      const freq = 200 + Math.random() * 1800;
      const dur = 0.04 + Math.random() * 0.08;
      this.beep(at, freq, dur, "square", 0.16);
    }
    sub.start(t);  sub.stop(t + 4.6);
    fund.start(t); fund.stop(t + 4.6);
  },
  P0INTR() {
    // Spammed square-wave beeps so fast (~30/sec) they merge into a
    // continuous "RRRRRRR" buzz rather than distinct clicks. 4.5s total.
    const t = this.ctx.currentTime;
    const interval = 0.033;          // ~30 beeps per second
    const count = Math.floor(4.5 / interval);
    for (let i = 0; i < count; i++) {
      const start = t + i * interval + Math.random() * 0.008;
      this.beep(start, 600 + Math.random() * 600, 0.028, "square", 0.12);
    }
  },
  INFINITE() {
    // Vibrating sustained bass — sub + fundamental layered like NULL, then
    // an 8 Hz sine LFO wired into the master gain so the volume wobbles
    // up and down rapidly. The LFO output (±0.45) sums with the envelope
    // value at the AudioParam, so the bass throbs between ~0.65 and ~1.55
    // — chest-felt vibration, not a flat hum.
    const t = this.ctx.currentTime;
    const sub  = this.ctx.createOscillator(); sub.type  = "sine"; sub.frequency.value  = 36;
    const fund = this.ctx.createOscillator(); fund.type = "sine"; fund.frequency.value = 54;
    const g = this.ctx.createGain();
    sub.connect(g); fund.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1.1, t + 0.3);
    g.gain.setValueAtTime(1.1, t + 4);
    g.gain.linearRampToValueAtTime(0, t + 4.5);
    // Tremolo LFO — its output adds to g.gain via AudioParam automation
    const tremolo = this.ctx.createOscillator(); tremolo.type = "sine"; tremolo.frequency.value = 8;
    const depth = this.ctx.createGain(); depth.gain.value = 0.45;
    tremolo.connect(depth); depth.connect(g.gain);
    sub.start(t);  sub.stop(t + 4.6);
    fund.start(t); fund.stop(t + 4.6);
    tremolo.start(t); tremolo.stop(t + 4.6);
  },
  TARPIT() {
    // Quiet computer hum. A sustained low sine + second harmonic + a faint
    // high-passed hiss for "fan noise" texture. No glitches, no screams —
    // an old machine just sitting in a quiet room, humming.
    // Internal gains are tiny so even with the jumpscare boost (~2.6x on
    // deathGain) the overall result stays calm.
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    const dur = 4.4;
    // Shared envelope: fade in, hold, fade out.
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.035, t0 + 0.6);
    g.gain.setValueAtTime(0.035, t0 + dur - 0.5);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    g.connect(this.sfxGain);
    // 120Hz fundamental — the mains-transformer "hum" tone.
    const hum = ctx.createOscillator();
    hum.type = "sine"; hum.frequency.value = 120;
    hum.connect(g);
    hum.start(t0); hum.stop(t0 + dur);
    // 240Hz second harmonic, quieter — adds a bit of character so it's not
    // a pure tone (real hums always have some harmonics from the transformer).
    const harm = ctx.createOscillator();
    harm.type = "sine"; harm.frequency.value = 240;
    const harmG = ctx.createGain(); harmG.gain.value = 0.35;
    harm.connect(harmG); harmG.connect(g);
    harm.start(t0); harm.stop(t0 + dur);
    // Tiny fan-hiss layer: noise highpassed at 2.4kHz, very low gain.
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2400;
    const hissG = ctx.createGain(); hissG.gain.value = 0.012;
    src.connect(hp); hp.connect(hissG); hissG.connect(this.sfxGain);
    src.start(t0); src.stop(t0 + dur);
  },
  HEXR() {
    const t = this.ctx.currentTime;
    const interval = 0.28;
    const count = Math.floor(4.4 / interval);
    for (let i = 0; i < count; i++) this.beep(t + i * interval, 880, 0.10, "square", 0.18);
  },
  ASSISTANT() {
    // Loud TV-static / glitch wall — the AI confidently failed and the machine screeches.
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    const dur = 4.4;
    // 1) Continuous wall of white noise through a wide bandpass (the main "shhhhh").
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.value = 0.55;
    src.connect(bp); bp.connect(g); g.connect(this.sfxGain);
    src.start(t0); src.stop(t0 + dur);
    // 2) Jerk the bandpass frequency around so the static sounds like a broken tuner.
    for (let i = 0; i < Math.floor(dur / 0.1); i++) {
      bp.frequency.setValueAtTime(400 + Math.random() * 4000, t0 + i * 0.1);
    }
    // 3) Layer short glitch chunks on top — random pitch spikes for the digital-corruption feel.
    for (let i = 0; i < Math.floor(dur / 0.08); i++) {
      this.noiseBurst(t0 + i * 0.08, 0.06, 2000 + Math.random() * 5000, 3, 0.4);
    }
  }
};
