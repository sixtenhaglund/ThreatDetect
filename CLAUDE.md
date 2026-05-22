# ThreatDetect

A cyber-security reflex game built by Sixten. Fake error popups appear, styled like real Windows / BIOS / terminal / notification dialogs. The player decides **Report** (it's a virus) or **OK** (it's safe). One life. Ten rounds, ~10 cards per round, virus roster grows each round.

Originally built on base44 (a no-code platform). Migrated to a single self-contained HTML file because base44's billing was bad and Sixten wanted full control of the code.

## How to run

Double-click `index.html`. No build step, no install — it's a single file with inline CSS, JS, and procedural Web Audio. Works offline.

## File structure (inside `index.html`)

The script is organized top-to-bottom as:

1. **CSS** — design tokens, layout, animations, per-virus death effects
2. **DATA** — `VIRUSES` object (20 threats, each with description, signs, errors, meter effect) and `LEGIT` array (~95 safe alerts)
3. **TEMPLATES** — `TPL` enum: WIN11 / AV / BIOS / TERMINAL / TOAST / DESKTOP / LOADING
4. **DEATHS** — per-virus death animation metadata (text + duration)
5. **CONFIG** — `startLives: 1`, `cardsPerRound: 10`, `totalRounds: 10`, scoring + starter unlocks
6. **SAVE** — `localStorage` wrapper (key `threatdetect_save_v1`): highest round, codex unlocks, settings
7. **AUDIO** — Web Audio API engine + procedural per-virus death sounds (`Audio.deaths`)
8. **METERS** — fake telemetry (FPS / ping / CPU / vol / fake clock) that viruses tamper with
9. **STATE + ACTIONS** — central state object, `choose()`, `nextCard()`, `startChallenge()`, etc.
10. **VIEWS** — menu / settings / codex / training / play / epilepsy-warning / dying / infected / false-positive / win
11. **ROUTER** — `render()` switches on `state.screen`; click + keydown handlers
12. **INIT** — final `render()` call

## Core game concepts

- **Templates** — each virus error and legit alert specifies a `template` (`TPL.WIN11`, `TPL.BIOS`, etc.). The same content renders differently depending on which template is set, so viruses can disguise themselves across multiple popup styles.
- **Meter tampering** — each virus may define a `meterEffect` (e.g. `{ fps: "flash" }`, `{ cpu: 247 }`). When a virus card is showing, those meters get overridden. Legit cards = natural jitter. The meters are decorative; they never read real system values.
- **UI tampering** — at higher rounds, virus cards can apply `tamper-pulse`, `tamper-shake`, `tamper-null` (hides buttons), or `tamper-swap` (reverses button order). Player relies on keyboard fallback (V / C / arrow keys / 1 / 2) when NULL hides buttons.
- **Death sequences** — when a virus kills the player, the screen flips to a virus-specific full-screen animation (`.death-EPILEPTICA`, `.death-MELTDOWN`, etc.) with its own procedural sound from `Audio.deaths[key]`. Skippable via "Skip →" button.
- **Codex unlock** — `unlockVirus(key)` adds a virus to `save.unlocked` the first time it's correctly classified. Locked entries show `??????` in the codex. Three starter viruses are pre-unlocked: EPILEPTICA, STATIC, WORM.
- **Round ramp** — `buildDeck(round)` scales virus density from ~20% (round 1) to ~70% (round 10). `availableViruses(round)` filters by `minRound` so new threats gate in progressively (PULSE r4, SCREAMER r5, NULL r6, MIMIC r8, etc.).

## Audio extension point

`AUDIO_BLOBS` is an empty map at the top of the audio section. If real recorded SFX get added later as base64 data URIs, they'll override the procedural versions. All current sounds are synthesized via Web Audio (oscillators, filters, noise buffers) — no external files.

## Save data

Stored in `localStorage` under key `threatdetect_save_v1`. Three fields:
- `highestRound` — best round reached
- `unlocked` — array of virus keys discovered
- `settings` — `{ master, ambient, sfx, photosensitive }`

Wiped by Settings → **Reset**. Note: localStorage is scoped to the file's path/origin — moving `index.html` to a different folder resets the save.

## Working on this project

See the global CLAUDE.md (`~/.claude/CLAUDE.md`) for collaboration style and git workflow.
