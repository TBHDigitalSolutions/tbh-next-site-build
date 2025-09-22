Perfect—here are the **production-ready template files** for
`documents/domains/packages/templates/`. They follow your visible-header standard, include clear “how to use” steps, and are tuned to your repo/branch/scripts.

> ⚠️ **Filename rule vs. templates:**
> Your `docs:check` script enforces `<kebab>_<Qualifier>_<YYYY-MM-DD|Evergreen>.md`.
> If you want zero lint noise, **rename these files** to:
>
> * `phase-long_Playbook_Evergreen.md`
> * `phase-short_Checklist_Evergreen.md`
>   …or add `templates/` to the ignore list in `check-docs.ts`. I show both options at the end.

---

## 1) `documents/domains/packages/templates/phase-short_Checklist_Template.md`

````md
**Official Title:** Packages — Phase XX — <Title> — Checklist  
**Domain:** packages  
**File Name:** phase-short_Checklist_Template.md  
**Main Part:** phase-<XX>-<kebab-title>  
**Qualifier:** Checklist  
**Date:** Evergreen

**Spotlight Comments:**  
- Pinned, minimal “working rules” + tasks for Codex/PRs.  
- Mirrors SSOT goals/acceptance; never diverge—update SSOT first.  
- Use npm only; branch from `feat/packages-refactor`.

**Summary:**  
Use this **short checklist** as the operational brief for one phase. Paste it into Codex/VS Code or include it in PR descriptions. It lists guardrails, in/out of scope, exact tasks, acceptance checks, and commands.

---

# Phase XX — <Title> (Checklist)

**Repo:** `TBHDigitalSolutions/tbh-next-site-build`  
**Runtime:** Node 20 + **npm**  
**Working branch:** `feat/packages-refactor` (never commit to `main`)  
**Phase branch (create):** `feat/packages-PH<XX>-<kebab-title>`

## 1) Objective (copy verbatim from SSOT)
> <Copy the 1–2 sentence goal from `../packages-phase-driven_Plan_2025-09-22.md#phase-xx-...`>

## 2) Working rules
- Work only on `feat/packages-refactor` → open PRs from `feat/packages-PH<XX>-<slug>` into it.
- Use **npm** only; ask before running shell commands.
- Pages are thin controllers; templates do presentation; **no runtime MD/MDX** parsing.
- All data via `@/data/packages` façade.
- Do not commit `src/data/packages/__generated__/` or `.env.local`.

## 3) Scope & Non-goals
- **In scope:** <files/dirs to modify>
- **Out of scope:** <explicitly list what not to touch>

## 4) Concrete tasks
- [ ] T1 — <specific file/path + action>  
- [ ] T2 — <specific file/path + action>  
- [ ] T3 — <specific file/path + action>  
- [ ] T4 — <tests/validation updates>  
- [ ] T5 — <docs updates: which file/section>

## 5) Acceptance criteria (copy from SSOT)
- [ ] <criterion 1>  
- [ ] <criterion 2>  
- [ ] <criterion 3>  

## 6) Commands to run (local & CI)
```bash
npm run docs:check
npm run data:ci
npm run build
npm run dev
````

## 7) Pull request

* **Base:** `feat/packages-refactor`
* **Title:** `feat(packages): PH<XX> — <kebab-title>`
* **Body includes:** Objective, scope, screenshots, **this checklist**, and links:

  * SSOT anchor → `documents/domains/packages/packages-phase-driven_Plan_2025-09-22.md#phase-xx-...`
  * Standards → `documents/domains/packages/standards/authoring-and-data-standards.md`

## 8) Post-merge

* [ ] Run `npm run docs:index` to refresh `_generated/index.json`.
* [ ] Update `documents/domains/packages/index.md` if you keep a manual control table.

````

---

## 2) `documents/domains/packages/templates/phase-long_Playbook_Template.md`

```md
**Official Title:** Packages — Phase XX — <Title> — Playbook  
**Domain:** packages  
**File Name:** phase-long_Playbook_Template.md  
**Main Part:** phase-<XX>-<kebab-title>  
**Qualifier:** Playbook  
**Date:** Evergreen

**Spotlight Comments:**  
- Deep “how-to” for the phase: steps, code stubs, tests, risks, rollout.  
- Links back to SSOT for goals/acceptance (SSOT is normative).  
- Tailored to `feat/packages-refactor` workflow + npm scripts.

**Summary:**  
This **Playbook** is the execution guide for a single phase. It details context, dependencies, exact file edits, code scaffolds, validations, analytics/SEO (if any), risks, and rollout. Keep it in lockstep with the SSOT for the phase goals and acceptance criteria.

---

# Phase XX — <Title> (Playbook)

**Repo:** `TBHDigitalSolutions/tbh-next-site-build`  
**Runtime:** Node 20 + **npm**  
**Base branch:** `feat/packages-refactor`  
**Phase branch (create):** `feat/packages-PH<XX>-<kebab-title>`

---

## 1) Objective (from SSOT)
> <Copy verbatim from SSOT: `documents/domains/packages/packages-phase-driven_Plan_2025-09-22.md#phase-xx-...`>

## 2) Why this matters
- <Business/UX/SEO impact>  
- <Risks mitigated>  
- <Dependencies unblocked>

## 3) Dependencies
- Requires: Node 20, `npm ci`, environment: `.env.local` with `NEXT_PUBLIC_SITE_URL`.
- Blocks/Blocked by: PH<YY> (link if applicable).  
- Reference standards:  
  - `documents/domains/packages/standards/authoring-and-data-standards.md`  
  - `documents/domains/packages/standards/routing-and-page-layouts.md`  
  - `documents/domains/packages/standards/data-content-rules.md`

## 4) Inputs & Outputs
- **Inputs:** <list authored TS/MDX files, configs>  
- **Outputs:** <generated JSONs, pages, templates, scripts>  
- **Git ignore:** `src/data/packages/__generated__/` and `.env.local`

## 5) Detailed work plan (step-by-step)
1) <Exact file path> — <edit/creation summary>  
   - Rationale: <why>  
   - Snippet:
   ```ts
   // paste realistic stub
````

2. <Exact file path> — <action>

   ```tsx
   // component/page stub
   ```

3. Tests/validation updates

   * `scripts/packages/validate-packages.ts`: \<rule/threshold>
   * `scripts/packages/doctor.ts`: <message>

4. Docs updates

   * `documents/domains/packages/phases/phase-<XX>-<kebab-title>/<...>.md`: <sections>

## 6) Analytics / SEO / Schema (if applicable)

* Events: `<namespace>:<event>` with payload `{ id, type, service }`
* SEO: canonical & OG derived from `NEXT_PUBLIC_SITE_URL`
* JSON-LD: `<type>` emitted only under \<pricing present|other condition>

## 7) Test & validation plan

* Unit: \<files/tests>
* Manual: \<route to open, what to click, expected behavior>
* CI: `npm run docs:check && npm run data:ci && npm run build`

## 8) Acceptance criteria (from SSOT)

* [ ] \<paste criteria 1>
* [ ] \<paste criteria 2>
* [ ] \<paste criteria 3>

## 9) Rollout plan

* Branch: `feat/packages-PH<XX>-<slug>`
* PR: into `feat/packages-refactor` with screenshots and checkboxes.
* After merge: integration testing on preview; if green, include in the next integration PR → `main`.

## 10) Risks & rollback

* Risks: <list>
* Rollback: revert PR `<sha>`, restore previous generated artifacts if needed.

## 11) Commands

```bash
# setup
npm ci

# sanity
npm run docs:check

# phase-specific (add or remove as appropriate)
npm run data:ci
npm run build
npm run dev
```

## 12) Changelog (this phase file)

* YYYY-MM-DD — \<what changed / who / PR link>

````

---

## 3) `documents/domains/packages/templates/_generated/index.json` (seed)

```json
{
  "dir": "documents/domains/packages/templates",
  "relDir": "templates",
  "lastUpdated": "1970-01-01T00:00:00.000Z",
  "docs": [],
  "subdirs": []
}
````

---

## How to use these templates (exact steps)

```bash
# 1) Create a new phase from templates
PHASE_NO=04
PHASE_KEBAB="app-router-hub-and-detail"
PHASE_DIR="documents/domains/packages/phases/phase-$(printf '%02d' $PHASE_NO)-$PHASE_KEBAB"

mkdir -p "$PHASE_DIR"

# Short (Checklist)
cp documents/domains/packages/templates/phase-short_Checklist_Template.md \
   "$PHASE_DIR/phase-$(printf '%02d' $PHASE_NO)-$PHASE_KEBAB_Checklist_2025-09-22.md"

# Long (Playbook)
cp documents/domains/packages/templates/phase-long_Playbook_Template.md \
   "$PHASE_DIR/phase-$(printf '%02d' $PHASE_NO)-$PHASE_KEBAB_Playbook_2025-09-22.md"

# 2) Open both files and replace placeholders:
#    <Title>, <kebab-title>, Phase XX, PH<XX>, tasks/paths, and SSOT links.

# 3) Rebuild the doc index and lint the headers
npm run docs:index
npm run docs:check
```

---

## If you want `docs:check` to **ignore** these templates (keep original filenames)

Edit `documents/domains/packages/scripts/check-docs.ts` and add this just under the `walk()` function’s `if (e.isDirectory())` branch:

```ts
if (e.isDirectory()) {
  if (e.name === "templates") continue; // ← skip template files entirely
  await walk(abs, acc);
}
```

Or, simplest: **rename the templates** to match the pattern:

```bash
git mv documents/domains/packages/templates/phase-short_Checklist_Template.md \
      documents/domains/packages/templates/phase-short_Checklist_Evergreen.md

git mv documents/domains/packages/templates/phase-long_Playbook_Template.md  \
      documents/domains/packages/templates/phase-long_Playbook_Evergreen.md
```

Then adjust each file’s **File Name** line to the new filename.

---

### Done

You now have clean, repo-ready **Checklist** and **Playbook** templates that your `docs:index` and `docs:check` tooling can work with, and practical instructions to spin up any new phase in seconds.
