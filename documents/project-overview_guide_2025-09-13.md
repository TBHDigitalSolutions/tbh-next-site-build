Official Title: Project Overview and Implementation Guide
Domain: Web Development, Project Architecture
File Name: project-overview_guide_2025-09-13.md
Main Part: project-overview
Qualifier: Guide
Date: 2025-09-13
Spotlight Comments:

Comprehensive guide for new teammates covering stack, architecture, routing, and workflows.
Details SSOTs, scripts, and SEO rules for services, portfolio, and packages.
Cross-references portfolio-domain_implementation-guide.md and src-tree-audit_improvement-plan.md.

Summary: The Project Overview and Implementation Guide serves as a concise onboarding document for TBH Digital Solutions' marketing website, built with Next.js 15 App Router. It outlines the tech stack, directory structure, routing rules (with canonical hub slugs), single sources of truth (e.g., servicesTree.ts), asset mirroring, TypeScript CLI scripts, SEO practices, and workflows for adding content or features, ensuring new developers can quickly understand and maintain the site while keeping data and routes consistent.

---

Here’s a single, drop-in **project overview** you can paste into your repo root as `README.md` (or `docs/overview.md`). It’s meant for a new teammate to read once and “get” the whole thing—the stack, layout, routing, data sources, scripts, and how to add/maintain features.

---

# Project Overview

A production-ready marketing website built with **Next.js App Router**. It’s organized around a **Services taxonomy** (hubs → services → subservices), a **Portfolio** domain, and **Packages** (offer bundles). Scripts and tools keep `/public` and content data healthy and in sync.

---

## 1) Tech stack

* **Framework:** Next.js **15** (App Router)
* **Language:** TypeScript (app + CLIs), *2 small JS tools in `/tools`*
* **UI:** React **19**, Tailwind CSS **4**, shadcn/ui (optional), Framer Motion (micro-interactions)
* **Validation:** Zod (schemas)
* **Tooling:** ESLint, Prettier, `tsx` for running TS CLIs
* **Node:** `>=18.18` (see `package.json > engines.node`)

---

## 2) High-level architecture

```
/app                      # App Router pages/layouts
/src
├── data                  # Single sources of truth (SSOT) for page/domain data
│   └── taxonomy          # servicesTree.ts (authoritative services taxonomy)
├── lib                   # Domain helpers (selectors, URL helpers, loaders, pricing)
│   └── services          # taxonomy.ts, helpers, serviceUrls.ts, etc.
├── types                 # Shared TypeScript types
/public                   # Mirrored, build-ready assets (auto-maintained)
/scripts                  # TypeScript CLIs for data validation/fix/migrate
/tools                    # Small JS tools (mirror/check /public)
```

**Key ideas**

* **SSOT** for taxonomy is `src/data/taxonomy/servicesTree.ts`.
* **Middleware** normalizes/redirects service routes to canonical slugs (kept in sync with the SSOT).
* **App Router** consumes taxonomy + data to generate `/services/...`, `/portfolio`, `/packages`, and main pages.
* **Scripts** validate and maintain content; **tools** mirror `/src/data/**` media to `/public/**`.

---

## 3) Routing & URL rules (services)

Top-level hubs are canonicalized to “\*-services” slugs:

```
/web-development-services
/video-production-services
/seo-services
/marketing-services
/lead-generation-services
/content-production-services
```

### Levels

* **L0**: `/services` (virtual root, index/overview)
* **L1**: hub → `/services/{hub}` (canonical hub slug, e.g., `marketing-services`)
* **L2**: service → `/services/{hub}/{service}`
* **L3**: subservice → `/services/{hub}/{service}/{sub}`
* **L4**: reserved for **packages** subpath under service: `/services/{hub}/{service}/packages`

**Reserved slugs:** don’t use `packages` as a subservice slug.

**Aliases & legacy:** `middleware.ts` redirects `/web`, `/seo`, `/marketing`, etc., and legacy paths → canonical hubs. It also normalizes duplicate slashes and trims trailing slashes.

**Copy/SEO phrasing:**

* Use **“Marketing Services”** in titles/H1s and navigation.
* Use **“digital marketing”** inside descriptive copy where it reads naturally; don’t create “digital-marketing” URLs. Canonical hub = `marketing-services`.

---

## 4) App Router layout (selected)

```
/app
├── page.tsx                             # Home
├── layout.tsx                           # Root layout & <head> scaffolding
├── main/{about|contact|products-services}/page.tsx
├── portfolio
│   ├── page.tsx                         # Hub: /portfolio
│   └── [category]/page.tsx              # /portfolio/[web-development|video-production|...]
├── packages
│   ├── page.tsx                         # /packages (index)
│   └── [bundles]/page.tsx               # optional dynamic bundle page
└── services
    ├── page.tsx                         # /services (overview)
    └── [hub]/[service]/[sub]/page.tsx   # nested service routes
```

**Pages import data** from `/src/data/**` and helpers from `/src/lib/**`. Never hardcode hub/service lists inside page files; use the SSOT + helpers.

---

## 5) Single sources of truth (SSOT)

* **Taxonomy (authoritative):**
  `src/data/taxonomy/servicesTree.ts` — the hierarchical tree that drives:

  * `generateStaticParams` for `/services` routes
  * Middleware canonicalization (keep slugs aligned)
  * Selectors/filters (e.g., filter portfolio items by `{hub, service}`)

* **Services helpers:**
  `src/lib/services/*` — URL builders, taxonomy helpers, pricing adapters, loaders. These *consume* the SSOT; they do not redefine it.

* **Types:**
  `src/types/servicesTaxonomy.types.ts`, `src/types/servicesTemplate.types.ts` — shared types used by app and CLIs.

* **Portfolio data:**
  `src/data/portfolio/**` — items, case studies; selectors; *kept lean and typed*.

* **Packages data:**
  `src/data/packages/**` — package manifests and relationships (e.g., featured refs per hub/service).

---

## 6) Public assets & mirroring

Your production assets live in `/public`, but you **author assets** under `/src/data/**`. Two small JS tools keep them in sync:

* `tools/mirror-public.js`
  Mirrors the expected directory tree into `/public`, adds README.md sentinels, and (optionally) **prunes** extras.

* `tools/check-public.js`
  Verifies that all referenced media files exist in `/public`.

### Common commands

```bash
# Preview mirror + deletions (safe)
npm run mirror:public:prune:dry

# Apply mirror + prune and write README.md sentinels
npm run mirror:public:prune

# Strict verification (dry-run + check)
npm run verify:public
```

> These tools never delete anything outside the allowed mirrored roots and respect a top-level allowlist.

---

## 7) Scripts (TypeScript CLIs)

All CLIs run with `tsx` (no build step). Most support `--json`, `--verbose`, and where applicable `--dry-run`.

```
/scripts
├── _shared/logger.ts                          # standard logging for CLIs
├── packages
│   ├── validate-packages.ts                   # schema & consistency validation
│   └── check-featured-refs.ts                 # cross-file “featured” refs sanity
├── portfolio
│   ├── validate-portfolio.ts                  # strict schema validation
│   ├── check-portfolio-health.ts              # orphans, missing media, cross-links
│   ├── portfolio-stats.ts                     # counts/coverage metrics
│   ├── fix-portfolio-data.ts                  # auto-fixer; run with --dry-run first
│   └── migrate-portfolio.ts                   # versioned migrations
├── services
│   └── validate-services-pages.ts             # services page-data validation
└── taxonomy
    └── validate-taxonomy.ts                   # taxonomy integrity vs. middleware
```

### Convenience npm scripts

```bash
# Fast local/precommit check
npm run data:quick-check

# CI gate (strict), includes public verify
npm run data:ci
```

(See `package.json` for individual domain commands—validate/fix/health/stats/migrate.)

---

## 8) SEO rules of thumb

* **Server components** own SEO metadata and JSON-LD; **client components** own interactivity.
* H1 mirrors page title; use **“{Hub Title} Services”** for hubs.
* Stable, canonical slugs from taxonomy; let middleware redirect aliases to canonical.
* Landing pages: put them under a **clear, flat namespace** (e.g., `/landing/{campaign-slug}`) with their own metadata files and **no duplicate content** with service pages.
* Avoid querystring-driven SEO content; prefer statically generated routes from the SSOT.

---

## 9) Development workflow

### Local

```bash
# Install and verify Node version >= 18.18
npm i

# Dev server
npm run dev

# Type check & lint
npm run typecheck
npm run lint
npm run format
```

### Content maintenance

```bash
# Mirror & prune /public (preview → apply)
npm run mirror:public:prune:dry
npm run mirror:public:prune

# Validate content data
npm run data:quick-check
```

### Before pushing

```bash
npm run verify:public
npm run data:ci
```

### CI (recommended jobs)

* `verify:public`
* `validate:packages` + `check:packages:featured`
* `validate:portfolio:quick` + `health:portfolio:ping`
* `validate:taxonomy`
* `validate:services-pages`

> If any script exits non-zero, CI fails and blocks the merge.

---

## 10) Adding new content/features

### Add a new **Service** (L2) or **Subservice** (L3)

1. Update `src/data/taxonomy/servicesTree.ts` with the new node(s).
2. Ensure reserved slugs are avoided (`packages`).
3. Re-run:

   ```bash
   npm run validate:taxonomy
   npm run data:quick-check
   npm run verify:public
   ```
4. If a new page needs specific content, add data under `src/data/page/services-pages/{hub}/{service}` and run:

   ```bash
   npm run validate:services-pages
   ```

### Add a new **Portfolio item**

1. Add to `src/data/portfolio/**` using the lean types (category must be a canonical union value).
2. Add assets under the appropriate mirrored data folder; then:

   ```bash
   npm run mirror:public:prune:dry  # preview
   npm run mirror:public:prune      # apply
   npm run validate:portfolio
   npm run health:portfolio
   ```

### Add a **Landing page**

1. Add a route under `/app/landing/{campaign}/page.tsx`.
2. Keep its data under `src/data/landing/{campaign}/**`.
3. Define metadata in the server component; avoid duplicating service copy verbatim.
4. Keep URLs flat and descriptive; no overlap with `/services/**`.

---

## 11) Coding standards

* **TypeScript first** for app + CLIs; prefer **ESM** in new files.
* Keep **business logic** in `src/lib/**`; pages should be thin and consume helpers.
* Don’t scatter taxonomy or hub lists—always import from SSOT.
* Prefer small, focused components. Keep client components “client” only when needed.
* Stick to reserved namespaces and filename casing; keep slugs lowercase/kebab-case.

---

## 12) Testing & quality (lightweight)

* CLIs act as “tests” for content and structure (fail fast).
* Consider adding:

  * A smoke test route that loads every `generateStaticParams` path during CI.
  * A link checker (404s) for portfolio/package hrefs.

---

## 13) Documentation

* Project docs live in `/docs/**`.
* We mirror the **project directory** with a **docs shadow** so discovery is easy:

```
/docs
├── overview.md                      # THIS FILE
├── services
│   ├── rules.md                     # URL/SEO rules, levels L0–L4, naming
│   └── authoring-guide.md           # how to add/edit hub/service pages
├── portfolio
│   └── README.md                    # domain guide (hub, category, data, scripts)
├── packages
│   └── README.md                    # schema, featured refs, pricing adapters
├── scripts
│   └── README.md                    # how to run/when to run, CI usage
└── tools
    └── README.md                    # mirror/check public and safety notes
```

**Rule of thumb:** if there’s a directory in `/app`, `/src/data`, `/src/lib`, or `/scripts`, there should be a matching explainer in `/docs` with the same name.

---

## 14) Security & operations

* No secrets in this repo (static marketing site). If you add integrations, use `.env.local` and **never commit** env files.
* Lock Node and package versions for reproducible builds.
* Keep middleware and taxonomy in sync to avoid redirect loops or orphaned pages.

---

## 15) Glossary

* **Hub (L1):** Top-level service family (`*-services`)
* **Service (L2):** A concrete offering within a hub
* **Subservice (L3):** A focused capability within a service
* **Packages:** Pre-scoped bundles of work sold per hub/service
* **Portfolio:** Evidence (projects, case studies) mapped by category (service family)
* **SSOT:** Single Source of Truth (one file/module that defines authoritative values)

---

## 16) Quick command cribsheet

```bash
# Dev
npm run dev

# Type & lint
npm run typecheck && npm run lint

# Public assets (preview → apply → verify)
npm run mirror:public:prune:dry
npm run mirror:public:prune
npm run verify:public

# Data quick check (precommit)
npm run data:quick-check

# CI gate (local or in CI)
npm run data:ci

# Portfolio maintenance
npm run portfolio:maintenance
npm run portfolio:deep-analysis
```

---

### Final notes

* Keep **taxonomy** changes deliberate: update the SSOT first, then run validators.
* Prefer **data changes over code changes** for content edits; pages should *consume* data.
* Run the **quick check** before committing and the **CI bundle** before merging.
* If something feels duplicative, push it into `src/lib/**` and reuse it everywhere.

That’s it—you’re ready to ship confidently and keep the site healthy over time.
