Here’s a drop-in **README.md** you can place in `tools/` (or at repo root if you prefer). It explains what the scripts do, how to run them, when to run them, and how to handle Git with deletions/pruning.

---

# Public Mirror Tools

These tools keep your `/public` folder in sync with content trees under `src/data/*`.

* `tools/mirror-public.js` — **creates/updates** the mirrored folder structure (optionally writes `README.md` placeholders and **optionally prunes** extras).
* `tools/check-public.js` — **validates** that `/public` matches the expected mirror (reports missing/extra paths).

They only manage the **mirrored roots** below (safe by design):

```
booking, caseStudies, composers, modules, packages, page, portfolio, taxonomy, testimonials
```

> Nothing outside those roots is ever touched (favicons, robots.txt, etc. are left alone).

---

## Requirements

* Node **≥ 18**
* Your data lives under: `src/data/<one-of-the-roots-above>/…`
* Your public assets live under: `public/…`

---

## Commands (npm scripts)

### Quick reference

| Command                           | What it does                                                                             | When to use                              |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| `npm run mirror:public:dry`       | **Preview** what would be created/updated (no changes).                                  | Sanity-check before any change.          |
| `npm run mirror:public:prune:dry` | **Preview deletions** as well as creations/updates (no changes).                         | See exactly what would be removed.       |
| `npm run mirror:public:prune`     | **Apply**: create/update, and **delete extras** under mirrored roots.                    | Enforce a clean mirror before commit/CI. |
| `npm run verify:public`           | **Strict verify**: dry-run mirror (with prune) + deep check; **fails** if there’s drift. | Use in CI and before pushing.            |
| `npm run check:public`            | Validate that **all referenced media** exist in `/public` (supplemental check).          | Spot broken references fast.             |

> All mirror commands also support generating `README.md` placeholder files in each mirrored directory to make the tree self-documenting.

---

## What each script does

### `tools/mirror-public.js`

* **Mirrors** directory structure from `src/data/*` to `public/*`.
* With `--readme`, writes a small `README.md` into every mirrored directory.
* With `--prune`, **deletes any extra files or folders** inside mirrored roots that don’t exist in `src/data`.
* With `--dry-run`, prints planned actions without touching the filesystem.
* With `--verbose`, prints extra logging.

**It never** deletes or modifies:

* files outside the mirrored roots,
* the top-level `/public` favicon/manifest/robots/sitemap allowlist.

### `tools/check-public.js`

* Builds the expected structure from `src/data/*` and compares it to `/public`.
* Reports:

  * **Missing** directories/files (e.g., missing `README.md` if `--readme`),
  * **Extra** directories/files under the mirrored roots (drift).
* Supports `--json` for machine-readable output (CI) and `--verbose` for more detail.

---

## Typical workflows

### 1) Day-to-day, safe & simple

```bash
# See what would be created/updated (never deletes)
npm run mirror:public:dry

# If it looks good, apply with pruning to keep /public clean
npm run mirror:public:prune

# Verify strict match (no extras, nothing missing)
npm run verify:public
```

### 2) Just preview deletions

```bash
npm run mirror:public:prune:dry
# Review the list; nothing was changed
```

### 3) CI gate (recommended)

In CI, run:

```bash
npm run verify:public
```

If the mirror is out of sync (missing/extra), CI fails with a clear report.

---

## When to run what

* **After editing `src/data/*`** (adding/removing/renaming directories):
  Run `mirror:public:prune` → then `verify:public`.

* **Before committing**:
  Run `verify:public`. If it fails, run `mirror:public:prune` and commit the changes it made.

* **Before pushing / in PRs**:
  Run `verify:public` locally, or rely on CI to run it for you.

---

## Git: handling adds, renames, deletions

Pruning removes stale paths from `/public`. To make Git reflect that:

```bash
# After pruning
git status           # you'll see deletions and additions
git add -A           # stage all changes, including removals
git commit -m "Sync /public with src/data (mirror + prune)"
git push
```

### Common Git tasks

* **Revert a bad prune**

  ```bash
  git checkout -- public/
  # or if already committed:
  git revert <commit-sha>
  ```

* **See what changed in public only**

  ```bash
  git diff -- public
  ```

* **Stage only public changes**

  ```bash
  git add public
  ```

---

## Safety guarantees

* Only the **mirrored roots** are ever created/checked/pruned.
* Top-level files such as `favicon.ico`, `robots.txt`, `site.webmanifest`, `sitemap.xml`, etc. are **preserved**.
* `--dry-run` shows exactly what would happen, so you can review before applying.
* `verify:public` is non-destructive and safe for CI.

---

## Tips, pitfalls, and FAQs

**Q: It created new folders, but didn’t delete old ones. Why?**
A: You ran a non-pruning command (`mirror:public` or `mirror:public:dry`). To remove stale paths, run `mirror:public:prune` (or preview with `mirror:public:prune:dry`).

**Q: Can this delete files outside the mirrored roots?**
A: No. Pruning is scoped strictly **inside** `public/{booking,caseStudies,…,testimonials}`.

**Q: I renamed a directory in `src/data`. What now?**
A: Run `mirror:public:prune` so the old name in `/public` is removed and the new one is created.

**Q: Where do I change which roots get mirrored?**
A: The allowlist is defined inside both scripts (the `DATA_ROOTS` array). Keep them in sync if you change it.

**Q: Can I run without adding README.md files?**
A: Yes. The npm scripts already pass `--readme` for you, but you can drop that flag if you don’t want placeholders.

---

## Advanced: manual flags

You can run the tools directly with custom flags:

```bash
node tools/mirror-public.js --readme --dry-run --verbose --prune
node tools/check-public.js --json --verbose --readme
```

* `--dry-run`: print actions, don’t change anything.
* `--verbose`: extra logs.
* `--readme`: include/require `README.md` in every mirrored dir.
* `--prune`: delete unexpected items (mirror only).

---

## Recommended pre-push habit

```bash
npm run mirror:public:prune
npm run verify:public
git add -A
git commit -m "Mirror public from data (prune + verify)"
git push
```

Keeps `/public` always in lockstep with `src/data`, reduces review noise, and avoids asset drift.

---

Happy mirroring! 🎯
