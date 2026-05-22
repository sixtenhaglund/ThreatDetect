# ThreatDetect — TODO

Running checklist. Sixten adds items; Claude checks them off when done.

**Format:**
- `- [ ]` = open
- `- [x]` = done

See `IDEAS.md` for the larger brainstorm — items often graduate from IDEAS into TODO when they're picked up.

---

## Active

- [ ] **Split the single HTML file into multiple files.** Right now `index.html` is ~270 KB and grows every session. Splitting it makes editing easier — smaller files load faster in the editor, the git diff of "I changed the WORM data" doesn't have to live next to a CSS change, and we can find code by *where it logically lives* instead of scrolling.

  **Three paths:**
  1. **Keep single file, add clearer section dividers / table of contents at the top.** Smallest change. Buys you faster navigation in the editor (Ctrl+F a big section banner). No cost — still double-click to play.
  2. **Multi-file from a local folder.** `index.html` + `style.css` + `game.js` + `data.js` (or JSON). Best editing experience. **Downside:** browsers block ES module imports over `file://` due to CORS — you'd need to run a tiny local web server (`python -m http.server`) to test. Loses the "open from disk and play" magic.
  3. **Split for dev, bundle for release.** Write multiple files; have a tiny script concatenate them into a single `index.html` when you want to share. Best of both worlds, but adds one build step. Probably the right answer when the project crosses ~400 KB.

  **Recommendation:** start with option 1 (just add clear section banners — 15-minute job, big readability win). Move to option 3 if the project keeps growing and edits feel painful.

- [ ] **Randomize alerts to fight memorization.** Same virus error rendered twice should *not* look identical. On each render, randomize within a controlled pool:
  - File counts, byte sizes, PIDs, port numbers, version numbers, timestamps
  - Domain TLDs (`.host` / `.live` / `.ru` / `.pw` / `.win`)
  - App names where reasonable (Photoshop / Illustrator / Premiere; Chrome / Edge / Firefox)
  - User names (`StandardUser` / `j.doe` / `admin` / `kids`)
  - File extensions in the meta strings
  - The Win11 app-icon color (small palette of plausible app colors so it's not always the blue Office icon)
  - The error icon glyph (within the same severity — different error icon variants exist)
  - Optional: tiny phrasing tweaks ("Click here for details" / "Open Settings to fix" / "More info") via a small pool of equivalent endings
  - Add more variant disguises while at it — e.g., the WORM HR-email and the WORM IT-support could each have 3–4 sender-name pools

  **Implementation sketch:** add a `randomize(card)` step inside `renderCard()` that takes the static card data and rolls fresh dynamic fields before passing to the template renderer. Probably 30–60 minutes once the field pools are defined.

---

## Completed

(Items move here once checked.)

---

## Notes on what goes here vs IDEAS.md

- **TODO.md** = stuff someone has decided to do. Concrete, actionable, owned.
- **IDEAS.md** = brainstorm menu. Larger, speculative, "maybe someday."

Items can graduate from IDEAS to TODO when Sixten picks them. They don't have to go through IDEAS first — small things can be added straight to TODO.
