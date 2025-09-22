**Official Title:** Phase 00 — Baseline Guardrails & Repo Hygiene (Checklist)  
**Domain:** packages  
**File Name:** phase-00-baseline-guardrails_Checklist_2025-09-22.md  
**Main Part:** phase-00-baseline-guardrails  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  

- Pin these rules for Codex/VS Code.  
- Keep the repo safe: **no runtime MD/MDX**, **no deep data imports in components**, CI green.

**Summary:**  
Operational, tight list to land Phase 00 safely. Use **npm** with Node 20 LTS. Work only on branches off `feat/packages-refactor`.

---

## Working rules (pin these)

- Work only on `feat/packages-refactor` (never `main`).
- Use **npm** only. Node **20 LTS** (`.nvmrc` = `20`).
- **No runtime MD/MDX**; compile at build.  
- Pages thin; templates present; components are presentational only (no IO).  
- Data goes through `@/data/packages` façade; no `@/data/**` inside `src/components/**`.  
- Don’t commit `src/data/packages/__generated__/` or `.env.local`.

## Do this (check each)

- [ ] Add `.nvmrc` = `20` and `engines.node` in `package.json`.
- [ ] Ensure `tsconfig.json`: `baseUrl: "src"` (with alias `@/*`) + ESM settings.
- [ ] ESLint rails: forbid `@/data/**` imports inside `src/components/**`; allow in `app/**`.
- [ ] Add/verify npm scripts: `lint`, `typecheck`, `build`, `data:ci`.
- [ ] Git ignore generated data: `src/data/packages/__generated__/`.
- [ ] Husky pre-push: **block pushes to `main`**; run `npm run lint && npm run typecheck`.
- [ ] PR template: checks for build, typecheck, data:ci, screenshots (where relevant).
- [ ] CI workflow: Node 20 + npm; run `data:ci`, `lint`, `typecheck`, `build` on PRs.

## Acceptance (must all be true)

- [ ] `npm run lint` passes with guardrails enforced.  
- [ ] `npm run typecheck` passes.  
- [ ] `npm run build` (Next.js) completes with **no route collisions** or ESM/CJS errors.  
- [ ] CI green on PRs into `feat/packages-refactor`.  
- [ ] No `@/data/**` imports under `src/components/**` (lint rule catches it).  

## Commands (quick)

```bash
# baseline
node -v
npm -v

npm run lint
npm run typecheck
npm run data:ci
npm run build
