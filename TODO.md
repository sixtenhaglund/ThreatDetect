# ThreatDetect — TODO

* When false positive, motivate why it's not a virus, for example:
  * Virtualbox/npm/yarn etc are real commands, towards  


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
