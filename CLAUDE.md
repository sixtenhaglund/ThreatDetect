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

## Card and template balance (IMPORTANT when adding content)

The deck-builder (`buildDeck` in `js/gameplay.js`) uses **uniform-template sampling**: each template (WIN11, TOAST, BSOD, CAPTCHA, …) has roughly equal odds of being picked per card slot, regardless of how many cards belong to it. Inside a template, cards are then chosen without replacement across the run.

Two consequences to keep in mind whenever you ADD or REMOVE cards:

1. **A template with few cards = the same cards repeating.** If BSOD has only 2 cards, every BSOD slot draws from those same 2 — the player will see them constantly. Bring small templates up so each has enough variety.
2. **A theme that's virus-only OR legit-only teaches a binary heuristic.** If every CAPTCHA / NORTON / LOADING is a virus, the player learns "captcha = virus" instead of looking at the actual tells (file extension, signer, source domain). Every template needs both virus and legit cards so the player has to actually read the card.

**Target floor when adding to a template: ~10 virus + ~10 legit (≈20 total).** Templates that already have lots (WIN11, TOAST, TERMINAL) don't need padding.

**Audit command** to check the current balance before/after a content change:

```bash
for tpl in WIN11 TOAST TERMINAL AV BIOS LOADING CHAT PHONE MAC DESKTOP WIN311 UPDATE PRINT NORTON CAPTCHA BSOD; do
  v=$(grep -c "TPL.$tpl\b" js/viruses.js)
  l=$(grep -c "TPL.$tpl\b" js/legit.js)
  printf "%-12s virus=%-3d legit=%-3d total=%d\n" "$tpl" "$v" "$l" $((v+l))
done
```

**Card variety via placeholders:** rather than only adding more cards, also use `{token}` placeholders so each card reads differently every draw. Pools live in `RANDOM_POOLS` (`js/config.js`): `tld`, `app`, `brand`, `city`, `stopcode`, `sysmodule`, `cpu`, `diagtool`, `wallet`, `timer`, `numfiles`, `department`. `substitutePlaceholders` (in `js/gameplay.js`) runs at deal-time. Adding a new placeholder type = new entry in `RANDOM_POOLS`, then use `{your_token}` in card text.

## Audio extension point

`AUDIO_BLOBS` is an empty map at the top of the audio section. If real recorded SFX get added later as base64 data URIs, they'll override the procedural versions. All current sounds are synthesized via Web Audio (oscillators, filters, noise buffers) — no external files.

## Save data

Stored in `localStorage` under key `threatdetect_save_v1`. Three fields:
- `highestRound` — best round reached
- `unlocked` — array of virus keys discovered
- `settings` — `{ master, ambient, sfx, photosensitive }`

Wiped by Settings → **Reset**. Note: localStorage is scoped to the file's path/origin — moving `index.html` to a different folder resets the save.

## Working on this project

See the global CLAUDE.md (`~/.claude/CLAUDE.md`) for collaboration style.

## Commit / push policy for this repo

This is a live repo at https://github.com/sixtenhaglund/ThreatDetect.

- **After every bigger change, commit AND push** — no waiting for permission. This is durable standing authorization.
- A "bigger change" = new feature, significant refactor, finished iteration of a task. Single-line tweaks can batch with the next real change.
- **Deadman's switch:** if a session has been going for a while with no commit/push, just do one. Don't let the diff pile up.
- Branch: `main`. No PRs unless asked.
- Commit messages: imperative summary on line 1, optional bulleted body for bigger changes. No co-author footer.
- Push immediately after every commit — never leave a commit only locally.
- Never force-push, never skip hooks unless Sixten explicitly asks.
