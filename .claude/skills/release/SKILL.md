---
name: release
description: Cut a new ThreatDetect release. Generates a changelog from git log, bumps the version in package.json + js/config.js + js/changelog.js, runs the production build, commits the docs/ output, pushes, and creates a GitHub Release with docs/release.zip attached. Invoke with `/release` (defaults to a patch bump) or `/release v0.2.0` to pick a specific version.
---

# /release — cut a ThreatDetect release

End-to-end release flow. One slash invocation produces everything: changelog, version bump, build, commit, push, and a GitHub Release with the offline-playable zip attached.

## When this skill fires

The user typed `/release` (optionally with a version argument or release notes). Examples:

- `/release` — auto-suggest the next patch version
- `/release v0.2.0` — release that specific version
- `/release v0.2.0 "Big content drop"` — same but with a custom one-line summary

If invoked with no version, suggest the next patch bump (e.g. `0.1.0 → 0.1.1`) and confirm with the user before continuing.

## What you do, step by step

### 1. Sanity-check the working tree

```bash
git status --porcelain
```

If there are **uncommitted source changes** (anything outside `docs/` or `node_modules/`), STOP and tell the user. They should commit those first — releases should only bundle code that's already in `main`. Example abort message: *"Uncommitted changes in foo.js, bar.css. Commit those first, then re-run /release."*

`docs/` having uncommitted changes is fine — this skill will overwrite it.

### 2. Determine the new version

- Read current version from `package.json`'s `version` field.
- If the user provided a version arg (`vX.Y.Z`), validate it with regex `^v\d+\.\d+\.\d+$` and use it.
- If no arg, propose the next **patch** bump and ask the user to confirm (or override with major/minor).
- Reject if the proposed tag already exists on the remote: `gh release view <tag>` should fail. If it succeeds (release already exists), abort with that information.

### 3. Generate changelog entries from git log

Find the previous release tag (or use the initial commit if there isn't one):

```bash
git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD
```

Then list commits since:

```bash
git log <prev-tag>..HEAD --pretty=format:"%s" --no-merges
```

Convert raw commit messages into **player-facing** changelog items. Rules:

- Strip prefixes like "fix:", "feat:", "chore:" if present.
- Skip purely-internal commits (build pipeline tweaks, doc-only changes to CLAUDE.md, refactors with no behavior change). Use judgment.
- Rephrase technical messages into player-facing language. "refactor pickByUniformVirus" → skip. "Add WannaCry virus" → "Added WannaCry — the third real-life rare with the Marcus Hutchins kill-switch story."
- Keep each bullet short (one line, under ~120 chars).
- Aim for 3-10 bullets per release. If there are fewer real changes, that's fine.
- If unsure how to summarize, ask the user before guessing.

Show the user the proposed bullet list and let them edit it before committing.

### 4. Update version references

Update these files in lockstep so they don't drift apart:

- `package.json`: `"version": "X.Y.Z"`
- `js/config.js`: `const VERSION = "X.Y.Z";`
- `js/changelog.js`: **prepend** the new entry at the top of the `CHANGELOG` array:
  ```js
  {
    version: "X.Y.Z",
    date: "YYYY-MM-DD",   // today, ISO format
    items: [
      "Bullet 1",
      "Bullet 2",
      ...
    ]
  },
  ```
- `CHANGELOG.md`: **prepend** under the `# Changelog` heading:
  ```markdown
  ## vX.Y.Z — YYYY-MM-DD

  - Bullet 1
  - Bullet 2
  ```

### 5. Build the production output

```bash
npm run build
```

Verify the script exits 0. The build is fast (~1-2s). If it fails, abort and surface the error to the user — don't try to fix it inside this skill, the user needs to see what broke.

After the build, **sanity-check** `docs/`:

```bash
ls -la docs docs/play
test -f docs/index.html && test -f docs/play/index.html && test -f docs/play/bundle.min.js && test -f docs/release.zip
```

All four files must exist and be non-zero size. Abort if not.

### 6. Commit + push

```bash
git add docs CHANGELOG.md package.json js/config.js js/changelog.js
git commit -m "Release vX.Y.Z

- Bullet 1
- Bullet 2
- ..."
git push origin main
```

The commit message body should be the same bullet list from step 3 — that way `git log` reads as the changelog too.

### 7. Create the GitHub Release

```bash
npm run release vX.Y.Z -- --notes "..."
```

`release.js` calls `gh release create vX.Y.Z docs/release.zip ...`. The notes argument should be the same bullet list, formatted as markdown:

```
Release vX.Y.Z.

- Bullet 1
- Bullet 2

Download `release.zip` to play offline.
```

If `npm run release` fails because of `gh auth` issues, tell the user to run `gh auth login`. Don't try to authenticate for them.

### 8. Report success

Show the user:
- The release tag + version
- The GitHub Release URL: `https://github.com/sixtenhaglund/ThreatDetect/releases/tag/vX.Y.Z`
- The live site URL: `https://sixtenhaglund.github.io/ThreatDetect`
- A note that the live site will update within ~30s as GitHub Pages re-deploys

## Error handling

- **Working tree dirty (non-docs changes)**: abort with a clear message about what's uncommitted.
- **Build fails**: abort, show the build error. Don't try to fix and retry.
- **Push fails (auth)**: abort and tell the user to authenticate.
- **`gh release create` fails because tag exists**: abort and suggest the next version.
- **Network errors**: retry once with a short delay (~5s) before aborting.

## What you DO NOT do in this skill

- Do not bypass `gh` auth checks. If the user isn't logged in, tell them to run `gh auth login`.
- Do not force-push or amend already-pushed commits.
- Do not edit source files (.js, .html, .css besides the version references). Source changes belong in regular commits before /release runs.
- Do not invent commits or backdated changelog entries — only summarize what `git log` actually shows.
- Do not run `npm install` automatically. If `node_modules/` is missing, tell the user to install once.
