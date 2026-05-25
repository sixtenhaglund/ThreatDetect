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

The deck-builder (`buildDeck` in `js/gameplay.js`) uses two different sampling strategies for the two halves of the deck:

- **Virus side** — `pickByUniformVirus`: each *virus* gets equal odds per slot. Pick a virus uniformly from `availableViruses(round)`, then pick a random fresh error from its pool. So MIMIC (29 error variants) and PULSE (10) both land ~5% of virus slots. Without this, MIMIC was 4× more likely than PULSE simply because it had more cards in the codebase.
- **Legit side** — `pickByUniformTemplate`: each *template* gets weight `sqrt(its fresh-card count)`. A 1-card template has weight 1; a 100-card template has weight 10. Rare templates (BSOD/WIN311/CAPTCHA) still show up regularly, but a template's single card never dominates the deck.

Two hard rules whenever you ADD or REMOVE cards:

1. **Every template must have at least 10 virus + 10 legit cards (20 total).** This is the *template-balance floor* — falling below it means the same one or two cards cycle visibly across a run (the "ThreatDetect / Cloudflare every single game" bug). If you add a new template, immediately seed it to 10+10.
2. **A theme that's virus-only OR legit-only teaches a binary heuristic.** If every CAPTCHA / NORTON / LOADING is a virus, the player learns "captcha = virus" instead of looking at the actual tells (file extension, signer, source domain). Every template needs both virus and legit cards so the player has to actually read the card.

**Audit command** to check the current balance before/after a content change:

```bash
node -e "
const vm = require('vm'); const fs = require('fs');
const sandbox = { console, Math, Date, JSON, Object, Array, Set, document:{querySelector:()=>null}, localStorage:{}, Audio:{}, METERS:{}, Leaderboard:{load:()=>[]}, render:()=>{} };
vm.createContext(sandbox);
for (const f of ['js/config.js','js/viruses.js','js/legit.js','js/tells.js','js/core.js','js/gameplay.js']) {
  vm.runInContext(fs.readFileSync(f,'utf8'), sandbox, {filename:f});
}
vm.runInContext('this.__V=VIRUSES;this.__L=LEGIT;', sandbox);
const V = sandbox.__V, L = sandbox.__L;
const vTpl = {}, lTpl = {};
Object.values(V).forEach(v => v.errors.forEach(e => { const t = e.template||'?'; vTpl[t]=(vTpl[t]||0)+1; }));
L.forEach(e => { const t = e.template||'?'; lTpl[t]=(lTpl[t]||0)+1; });
const all = [...new Set([...Object.keys(vTpl), ...Object.keys(lTpl)])].sort();
all.forEach(t => { const v=vTpl[t]||0, l=lTpl[t]||0; const ok=(v>=10&&l>=10)?'OK':'need '+Math.max(0,10-v)+'v +'+Math.max(0,10-l)+'l';
  console.log(t.padEnd(10), String(v).padStart(4), String(l).padStart(4), ok); });
"
```

**Card variety via placeholders:** padding gets a template to the floor, but the next gain comes from **placeholders inside the card text**. When the same source card is dealt twice in one run (which still happens occasionally in long runs), placeholders are the only reason the second draw looks different. Use `{token}`s aggressively in titles, messages, and metas — *every* hardcoded brand/domain/PID/version/name is a missed variance opportunity.

Pools live in `RANDOM_POOLS` (`js/config.js`). Current pools:
- **Split (legit/virus shape — same token reads as ".com" on a legit card, ".pw" on a virus card):** `tld`, `brand`, `app`, `city`, `filename`, `filesize`, `kb`, `process`, `ipaddr`, `game`, `username`, `pid`, `captchaprov`, `phonenum`, `bank`, `sender`, `browser`, `region`, `numfiles`
- **Flat (same values on both sides):** `department`, `name`, `version`, `ext`, `driver`, `port`, `percent`, `printer`, `pagecount`, `alertword`, `stopcode`, `sysmodule`, `cpu`, `diagtool`, `wallet`, `timer`, `ray`

`substitutePlaceholders` (in `js/gameplay.js`) runs at deal-time. Adding a new placeholder type = new entry in `RANDOM_POOLS`, then use `{your_token}` in card text.

**Variance test harness:** `test-variance.js` at the repo root simulates buildDeck many times and reports unique-card count + top-repeated titles. Run with `node test-variance.js`. Throwaway script — delete or update as the design evolves.

## Audio extension point

Two ways to add real audio per virus, both keyed by virus key (e.g. `IDIOT`):

- **`AUDIO_BLOBS`** (top of `js/audio.js`) — `{ key: "data:audio/wav;base64,…" }`. Used for short SFX baked into the file as base64. (Currently empty.)
- **`AUDIO_FILES`** (top of `js/audio.js`) — `{ key: "data:audio/mpeg;base64,…" }`. Used by `Audio.death(key)` to play a recorded death sound instead of running the procedural `Audio.deaths[key]` function. Currently has `IDIOT` (the youareanidiot.org cackle). Stored as a base64 data URI rather than a relative file path because the game is opened via `file://` and modern browsers block `fetch()` of local files for security.

To embed a new MP3 as a data URI, run from the repo root:
```bash
node -e "const fs=require('fs'); const b64=fs.readFileSync('your.mp3').toString('base64'); console.log('data:audio/mpeg;base64,'+b64);"
```
…and paste the output into `AUDIO_FILES` keyed by virus.

Everything else is still procedurally synthesized via Web Audio (oscillators, filters, noise buffers).

## Web build / release pipeline

The game runs locally by double-clicking `index.html` (unminified source). For the **public site** at `sixtenhaglund.github.io/ThreatDetect`, there's a separate local build pipeline.

### Source vs. built output

- **Source** lives at the repo root (`index.html`, `styles.css`, `js/`, plus `landing.html` + `landing.css` for the landing page).
- **Built output** lives in `docs/` — generated by `npm run build`, committed to git, served by GitHub Pages.

```
docs/
├── index.html           # built + minified landing page (CSS inlined)
├── play/
│   ├── index.html       # built game HTML, references bundle.min.js
│   ├── styles.css       # minified game CSS
│   └── bundle.min.js    # all 12 js/*.js files concatenated + minified
└── release.zip          # offline download attached to GitHub Releases
```

The build script (`build.js`) parses `<script src="…">` tags from `index.html` to determine JS load order — no separate manifest to maintain.

### Build dependencies

`package.json` declares devDependencies: `terser`, `html-minifier-terser`, `cssnano`, `postcss`, `archiver`. Run `npm install` once after cloning. Build deps live in `node_modules/` (gitignored).

### How to ship

1. Make changes to source as usual. Test locally by double-clicking `index.html`.
2. `npm run build` — regenerates `docs/`. Takes ~1 second.
3. Verify the built version by opening `docs/index.html` (landing) and `docs/play/index.html` (game).
4. `git add docs && git commit -m "Release v0.X.0" && git push` — live site updates within ~30s.
5. `npm run release v0.X.0` — creates a GitHub Release with `docs/release.zip` attached. Requires the `gh` CLI (https://cli.github.com) authenticated via `gh auth login`.

### GitHub Pages config

Set once in repo Settings → Pages → "Deploy from a branch" → `main` / `/docs`.

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
