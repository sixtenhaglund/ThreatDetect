# ThreatDetect — Ideas, Optimizations, and Future Directions

A brainstorm doc for everything ThreatDetect *could* become. Nothing here is a commitment — it's a menu to pick from when picking what to work on next. Items are tagged roughly by effort:

- 🟢 small (one sitting)
- 🟡 medium (a session or two)
- 🔴 large (multi-session feature)

---

## State of the game (as of last commit)

What's working well:
- **20 distinct viruses** with unique themes, signs, death animations, death sounds
- **7 popup templates** (Win11, fake AV, BIOS, Terminal, Toast, Desktop, Loading) — viruses pick thematically-matched ones
- **4 difficulty tiers** (Easy / Normal / Hard / Nightmare) plus a separate Challenge mode and Training sandbox
- **Per-card effects system** — viruses can pulse, shake, flicker buttons, tint backgrounds, swap fonts, hide UI
- **Fake telemetry meters** that scale subtlety with difficulty
- **Post-mortem** screen with the killer card replayed + textual tell detection via regex + active effect tells
- **Codex** with NEW badges, animation previews, locked entries
- **Two-key storage** — main save (resettable) vs. leaderboard (permanent across resets)
- **Ambient code-rain background** at all times
- **Photosensitive mode + Jumpscare toggle** in Settings
- Game runs as a **single self-contained HTML file** — no build step, double-click to play

The foundation is solid. Everything below builds on it without rewriting.

---

## 🌱 Creative mechanics & content

### New virus ideas
- 🟡 **MIRRORSHADE** — clicking Report registers as Check and vice versa (UI is intentionally lying). Tell: hover over a button and you see the "wrong" label briefly highlight.
- 🟡 **PUPPETEER** — Report/OK buttons slowly drift away from the cursor as you try to click them.
- 🟡 **WHISPER** — quiet audio-only tell (a faint hiss/whisper plays when this virus is on screen). Forces players to have sound on.
- 🟡 **HARVESTER** — explicitly references stealing crypto wallets / seed phrases / private keys. Different vibe from CRYPTEX (which encrypts) — this one *transfers out*.
- 🟡 **SUNDIAL** — manipulates clocks and timezones simultaneously. Tells: meter shows different timezone than the alert text references.
- 🟡 **DOPPELGÄNGER** — pretends to be one of the player's *own* viruses (e.g., shows "Codex Sync Service" pretending to be part of ThreatDetect itself). Tongue-in-cheek breaking-the-fourth-wall variant.
- 🟢 **OUROBOROS** — alert references itself recursively in process name / file path.

### New popup templates
- 🟡 **Browser SSL warning page** — full-screen red "Your connection is not private" treatment. Distinct from a Win11 dialog.
- 🟡 **CAPTCHA-style** popup — "verify you're human" with sketchy buttons.
- 🟡 **Task Manager view** — fake list of running processes; player has to spot the malicious one.
- 🟡 **Mobile push notification** — Android/iOS-style banner from the top.
- 🟢 **Print preview window** — innocent-looking print dialog with malicious file name.

### New gameplay mechanics
- 🟡 **Multi-stage viruses** — alert starts as one popup, then morphs into another after a delay if you don't report fast enough. Time pressure!
- 🟡 **Streak rewards** — every 10 correct in a row unlocks a brief "intel" tip about a random virus (small info reveal).
- 🟡 **Hint coins** — earn currency for correct calls; spend coins mid-game to highlight one tell on the current card. Adds risk/reward.
- 🟡 **Foreshadowing** — some legit alerts say "Detected suspicious file: X" — and the NEXT card is a virus disguised as X. Rewards reading every alert.
- 🟡 **Virus chains** — encountering one virus makes a thematically-paired virus more likely later in the run (e.g., REDRUM → CRYPTEX, both ransom-y).
- 🔴 **Boss waves** — every 5 rounds, a "boss" version of a random virus appears. Massive, heavily-tampered, multiple effects at once. Score 5× if correct, lose immediately if wrong.

### Accessibility
- 🟢 **"Tells visible" Training toggle** — for absolute beginners, highlight the textual tells in the popup directly (e.g., underline the impossible `°C` value).
- 🟢 **Colorblind mode** — instead of red/green, use icons or shapes (✕ for tampered, ✓ for safe). Worth even just on the meters.
- 🟡 **Reduced-motion mode** — disables all wobble/pulse/shake animations. Important for vestibular sensitivity, separate concern from photosensitive (which is just brightness).
- 🟢 **Text-size slider** in Settings — bumps font sizes on popups for readability.

---

## ⚙ Optimizations

### Performance
- 🟢 **Cancel meter ticker on non-play screens** — currently the 700ms `setInterval` keeps running even on menu/codex; harmless but wasted CPU.
- 🟢 **Pre-shuffle decks once per round** — currently re-shuffles inside `buildDeck` every advance; trivial but tidy.
- 🟡 **Throttle background animations when tab is hidden** — listen for `document.visibilitychange` and pause the background `codeRainScroll` when tab loses focus.
- 🟡 **Pool oscillator nodes** — Web Audio creates fresh oscillators for every sound; on heavy SFX (DDOS = 60 beeps), GC can hiccup. Reuse a pool of 16 oscillators with reset.

### File size
- File is now ~270 KB. That's still tiny for the web (most landing pages are 2–5 MB), but:
- 🟢 **Strip dev comments** for a "release" build (could be a single command via a tiny terser/minify step).
- 🟢 **Compact the `LEGIT` and `VIRUSES` literals** — convert to JSON in `<script type="application/json">` blocks and parse on load. Smaller bytes than JS object syntax.
- 🔴 **Move data into a separate file** — would break the single-file constraint. Probably not worth it.

### Code structure
- 🟢 **Extract magic numbers** — round count, lives, density thresholds into the `CONFIG` block. Some are still inline (e.g., `0.7` in `rollTampering`).
- 🟢 **Rename `startChallenge` to `startGame`** — name is misleading now that Challenge is a separate mode.
- 🟡 **Centralize screen transitions** — most `state.screen = "x"; render();` could go through a `go(name)` helper that also clears transient state slots (`previewTimeout`, `trainingReveal`, etc.). One place to update if cleanup ever needs to happen everywhere.
- 🟡 **Stop using `prevScreen` for back navigation** — replace with an explicit stack `state.navStack: []` so the codex/preview/settings back-buttons can never clobber each other again (the bug we already fixed once).
- 🟡 **Split the single HTML file into multiple files** — see `TODO.md` for the three paths (keep single + add dividers / multi-file folder / split-for-dev-bundle-for-release).

### Asset loading
- 🟢 **Preload Segoe UI Variable** explicitly — currently falls back to system-ui on browsers without it. A `@font-face` declaration with a CDN fallback would be ~10 lines.
- 🟡 **Real recorded SFX** — the `AUDIO_BLOBS` slot in the Audio module is empty. Filling it with base64 WAV/MP3 for SCREAMER and the death stings would punch up game feel. Easy add when ready.

---

## 🚀 Future expansion

### Bigger systems
- 🔴 **Daily challenge** — one seeded run per day that's identical for every player. Posts to a separate "Daily Top 10" leaderboard. Requires only a date-based seed.
- 🔴 **Cloud leaderboard** — global top 100 via a free tier of Supabase/Firebase/Cloudflare D1. The leaderboard panel already exists; just swap localStorage reads for HTTP fetches.
- 🔴 **Achievements** — a `save.achievements: { ... }` map of named milestones (e.g., `noFalsePositives`, `nightmareR5`, `allVirusesUnlocked`). Show them in a Codex tab.
- 🔴 **Tutorial mode** — guided first run, one of each popup template, hand-held tells.
- 🔴 **Endless mode** — past round 10, density caps at 90% and rounds keep climbing. Sees how far you can go.
- 🔴 **Versus mode** — two-browser-tab head-to-head, sharing a seed. Whoever scores more in 5 rounds wins. Requires a tiny matchmaking shim or shared seed via URL.

### Story / world
- 🔴 **SOC analyst progression** — between runs, you "report to the lead" with a brief story beat. Different beats per virus encountered. Adds narrative without locking out free play.
- 🔴 **Virus origin lore** — short "case files" on each codex entry explaining where the virus came from. Worldbuilding.

### Community features
- 🔴 **Custom virus designer** — players name a virus, pick a color, write 3 tells, get 3 disguised error variants generated. Stored in localStorage; sharable via URL.
- 🔴 **Replay sharing** — encode an entire run (deck + player choices) into a URL, paste to share. "Watch how I lost on round 8" links.

### Platform
- 🟡 **Mobile layout pass** — touch targets are too small in spots; the meter row gets cramped on narrow screens. A proper mobile rework would open the game to phones.
- 🟡 **Keyboard-only playthrough** — already works for V/C and arrow keys, but the menus need Tab/Enter polish.
- 🔴 **Gamepad support** — for fun. D-pad + A/B mapped to Report/Check.
- 🔴 **Steam release** — wrap in Electron, add Steam Workshop for custom viruses. Real ambition project.

---

## ⚖ Balancing ideas

### Difficulty tuning
- **Easy might be *too* easy** — virus density 15% means round 1 has 1–2 viruses among 10 cards. Players can blanket-OK and still hit round 3. Consider: still slow virus pool but density should match Normal so practice is meaningful.
- **Nightmare might be *too* hard mid-cycle** — with 60–90% virus density AND tampering shifted +4 rounds, even careful play feels brutal. Consider: keep the density but soften tampering to +3, or give Nightmare a "1 free miss" allowance.
- **Hard's tampering shift (+2)** lands well — feels like a real step up without being unfair. Keep.

### Score formula
- Current: `+100 + min(streak,10)*50` per correct. Cap of 10 means streaks past that don't reward more. Consider:
  - Remove streak cap, add diminishing returns: `+100 * (1 + log2(streak))` — encourages long streaks without runaway scaling.
  - Add **difficulty multiplier**: Easy ×0.5, Normal ×1, Hard ×1.5, Nightmare ×2.5. Makes the leaderboard reward harder runs.

### Round structure
- **Cards per round (10)** feels right.
- **Total rounds (10)** is borderline short for advanced players. Endless mode would fix this.
- **Rounds 7–10 are the same difficulty in practice** since density caps at 70% and tampering peaks. Round identity could go deeper:
  - Every 3rd round, force-introduce a never-seen-yet virus (if any remain).
  - Round 10 has a guaranteed boss (see Boss Waves above).

### Codex
- Codex unlocks on encounter — should it require *correct identification*? Stricter, but motivates careful play. Trade-off: harder to learn since you can't read about a virus that killed you the first time.
- Alternative: unlock on encounter (current) for the description, but require correct identification to unlock the full sign list.

### Training
- Training currently auto-unlocks the virus in Codex. Should it count toward `deathsBy`? Currently no, which is correct — Training deaths shouldn't earn the NEW badge.
- Consider a "score-attack training" mode: same virus repeated but you're scored by how fast you correctly identify each variant.

---

## 🪥 Polish backlog (small wins)

- 🟢 The "Skip →" button on death animations needs a hover state — currently looks flat.
- 🟢 Some popup template buttons say "Report" with a skull glyph (☠), others have an alert glyph (⚠). Pick one.
- 🟢 The FALSE POSITIVE screen could show a single example tell of the legit alert it really was (e.g., "Microsoft Defender uses the address `*.microsoft.com` — this one matched").
- 🟢 Codex entries don't currently show how many *times* you've encountered the virus. A small counter would be nice.
- 🟢 Settings panel has no visible "saved!" feedback after dragging a slider — works silently. A tiny toast would reassure.
- 🟢 Reset button could glow more before you click it — current styling makes it feel like a regular link.
- 🟡 The codex's "Watch Death Animation" button could show a tiny still-frame thumbnail of the animation instead of just a play-arrow.
- 🟡 SCREAMER's death animation auto-skip ignores the photosensitive setting — those red flashes are intense. Should auto-soften.
- 🟡 Pause-and-resume mid-run — clicking Codex during play freezes the deck position but doesn't show a clear "PAUSED" overlay. Should.

---

## How to use this document

- When you have time for a small task, scan the 🟢 list and pick one.
- When you have a whole session, look at the 🟡 list.
- 🔴 items are stretch goals — they reshape what the game *is*, not just polish it.

Nothing here is sacred. Items can be deleted, merged, or split as your taste evolves. This is just a thinking surface.
