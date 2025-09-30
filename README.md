# TBH Platform — Project Overview & Website Workspace

This repo hosts the marketing website built on the **Next.js App Router** with a clear separation between the **app layer**, **domain modules**, and **data (SSOT) layers**. It also documents canonical service slugs and authoring patterns that keep the site consistent and easy to maintain.

---

## 1) Quick Start

```bash
# Install
npm i

# Dev server (workspace-aware)
npm run dev

# Build, start
npm run build && npm run start

# Lint/format
npm run lint
npm run format
```

> If you work within the `website/` workspace, use the workspace scripts (e.g., `npm --workspace website run dev`). fileciteturn0file0

---

## 2) Tech Stack (at a glance)

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI:** Tailwind CSS, optional shadcn/ui, Framer Motion
- **Validation:** Zod (light guards)
- **Tooling:** ESLint, Prettier, `tsx` for CLIs
- **Node:** ≥ 18.18

The stack and conventions are tuned for a static-first, SEO-friendly marketing site with thin pages and strongly-typed templates/sections. fileciteturn0file4

---

## 3) Repository Layout

At the monorepo level, the **website workspace** lives under `website/` and uses the App Router structure inside `website/src/`:

```
website/
├─ next.config.js
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ public/                # build-ready assets (icons, images, fonts, videos, manifest)
└─ src/
   ├─ app/                # routes & layouts (App Router)
   ├─ components/         # website-specific UI
   ├─ contexts/
   ├─ hooks/
   ├─ providers/
   ├─ mock/               # local mock data for pages
   ├─ styles/             # global CSS modules
   ├─ types/
   └─ utils/
```
See the full workspace breakdown (aliases, routing examples, and conventions) in the Website Workspace doc. fileciteturn0file0

---

## 4) Routing & URL Rules (Services)

Service hubs and pages use **canonical `*-services` slugs** everywhere they cross boundaries (routing, adapters, data, exports). Examples:

```
/services/web-development-services
/services/video-production-services
/services/seo-services
/services/marketing-services
/services/lead-generation-services
/services/content-production-services
```
Legacy/alias slugs are **normalized to canonical** via shared utils; middleware should redirect legacy paths to canonical ones. fileciteturn0file4 fileciteturn0file1

**Levels** (conceptual):
- **L0** `/services` (overview)
- **L1** `/services/{hub}` (e.g., `marketing-services`)
- **L2** `/services/{hub}/{service}`
- **L3** `/services/{hub}/{service}/{sub}`
- **L4** reserved: `/services/{hub}/{service}/packages` (do not use `packages` as a subservice slug). fileciteturn0file4

---

## 5) Single Source of Truth (SSOT) for Services

All canonical service constants, enums, and helpers live under a shared module and are imported app‑wide:

```
/src/shared/services/
├─ constants.ts     # CANONICAL_SERVICES, LEGACY_TO_CANONICAL
├─ types.ts         # CanonicalService, ServiceType
├─ utils.ts         # normalizeServiceSlug, validateServiceSlug, assertCanonicalService
└─ index.ts         # barrel
```
**Rule:** No domain/module redefines these values. All cross-domain joins normalize to canonical first. fileciteturn0file1

---

## 6) Domain Modules — Structure & Authoring

Each domain (e.g., **packages**, **portfolio**, **pricing**, **tools**, **FAQ**, **testimonials**, **services & capabilities**) follows the same production-ready module shape:

```
/src/<domain>
├─ components/             # leaf UI (self-contained)
├─ sections/               # orchestrators; compose components
├─ templates/              # Hub/Detail scaffolds used by pages
├─ lib/                    # SSOT: adapters, validators, transforms, types, registry
└─ index.ts                # small public API (barrel)
```
Keep **pages thin**: fetch via a data façade, adapt via `lib/adapters`, render templates. Do not fetch inside templates/sections/components. fileciteturn0file3 fileciteturn0file2

**Authoring rules (highlights):**
- One **orchestrator section** per domain (e.g., `<Domain>Section`) with simple `variant` strings.
- `lib/` is the single source of truth for domain primitives; **never** import UI upward.
- Use named exports; place `@deprecated` JSDoc on legacy aliases during migrations. fileciteturn0file1 fileciteturn0file3

---

## 7) Data & Facades

The app consumes data via simple façades (e.g., `getHubBundle`, `getDetailBundle`, `search`) exposed from `/src/data/<domain>/index.ts`. Keep raw data validators and normalization helpers co-located under that domain’s data folder. fileciteturn0file2

Portfolio, packages, services pages, and taxonomy are typed and validated with small TypeScript/CLI scripts for consistency and CI gating. fileciteturn0file4

---

## 8) Public Assets & Mirroring

Author media under `src/data/**` and mirror the expected directory tree into `/public` using the provided tools. Typical commands:

```bash
npm run mirror:public:prune:dry   # preview
npm run mirror:public:prune       # apply mirroring + prune extras
npm run verify:public             # strict verification
```
These tools maintain `/public` consistently and can write sentinel README files. fileciteturn0file4

---

## 9) Scripts & CI

TypeScript CLIs validate data health per domain (taxonomy, portfolio, packages, services pages). Suggested npm scripts:

```bash
npm run data:quick-check   # precommit; fast
npm run data:ci            # CI gate; strict, includes public verify
```
Add domain-specific validators (e.g., `validate-portfolio`, `validate-packages`, `validate-services-pages`) and run them in CI. fileciteturn0file4

---

## 10) Coding Standards & Lint Guardrails

- Import services constants/enums/utils **only** from the shared barrel.
- Keep directories lowercase **kebab-case**; exports named and canonical-first.
- Use ESLint `no-restricted-imports` to prevent cross-layer imports (e.g., sections importing templates). fileciteturn0file1

---

## 11) Contributing Workflow

```bash
# Local dev
npm run dev

# Type & lint
npm run typecheck && npm run lint && npm run format

# Public assets (preview → apply → verify)
npm run mirror:public:prune:dry
npm run mirror:public:prune
npm run verify:public

# Data health
npm run data:quick-check
npm run data:ci
```
Run taxonomy/services validators whenever you change service hubs or pages; middleware/redirects must remain in sync with canonical slugs. fileciteturn0file4

---

## 12) Glossary

- **Hub (L1):** Top-level service family (`*-services`)
- **Service (L2):** Concrete offering within a hub
- **Subservice (L3):** Focused capability within a service
- **Packages:** Bundles sold per hub/service
- **SSOT:** Single source of truth (authoritative module or file)
fileciteturn0file4

---


---

# 📂 Source Directory & Domain Modules

The application is organized into **domain-oriented modules** under `/src`, each encapsulating UI, state, data, and integration logic for a particular concern. This ensures **single sources of truth (SSOTs)**, clear ownership, and easier scaling.

## Root Domains

- **`/src/booking/`**  
  Manages the end-to-end **booking flow**: forms, calendars, policies, consent, and booking confirmation.  
  - **Components** — atomic widgets like `AvailabilityCalendar`, `BookingForm`, `BookingConfirmation`.  
  - **Sections/Templates** — compose multiple booking widgets into reusable layouts (`BookingHubTemplate`, etc.).  
  - **Hooks** — `useBookingFlow`, `useBookingAnalytics`, etc. to handle modal state, analytics, and process flow.  
  - **Lib** — adapters, constants, utils, and validators (the SSOT for booking logic).  
  - Closely tied to **`/src/data/booking/`** which holds configs, calendars, intake forms, and validation schemas.  

- **`/src/search/`**  
  Provides full-site **search** across services, portfolio, and packages.  
  - **Core** — `indexer.ts`, `sources.*.ts`, and `rank.ts` normalize SSOTs into `SearchDoc[]`.  
  - **Client/Server** — `miniClient.ts` and `searchService.ts` support static, API-based, or external engines.  
  - **UI** — `SearchBar`, `SearchBanner`, `CommandPalette`, `Filters`, `ResultCard`.  
  - Scoped search is wired into hubs, services, portfolio, and packages.  

- **`/src/packages/` (and `/src/data/packages/`)**  
  Defines **growth packages** and bundles.  
  - Includes `.ts` and `.md` SSOT files for addons, featured packages, and integrated bundles.  
  - Used in pricing pages, package comparison carousels, and search indexing.  

- **`/src/portfolio/` (and `/src/data/portfolio/`)**  
  Handles **portfolio items, categories, and galleries**.  
  - Supports multiple viewers (`ImageViewer`, `PDFViewer`, `VideoViewer`) and modal shells.  
  - Includes `PortfolioHubTemplate` and sections like `PortfolioOverviewSection`.  
  - Indexed by search and cross-linked with services/packages.  

- **`/src/data/` (Data Domain)**  
  Canonical SSOT for structured content:  
  - **Booking** — configs, calendars, intake flows, validation schemas.  
  - **Case Studies** — service-specific examples for credibility.  
  - **Packages** — bundles, addons, and pricing metadata.  
  - **Portfolio** — items, featured works, registry and validation.  
  - **Page Data** — content for legal, marketing, and service pages.  
  - **Testimonials** — mapped to each service.  
  - **Taxonomy** — `servicesTree.ts` is the master reference for services hierarchy.  

## Shared Domains

- **`/src/components/`** — Global and page-level UI components (header, footer, modals, grids).  
- **`/src/sections/` & `/src/templates/`** — Higher-order layouts for services, hubs, and subservices.  
- **`/src/hooks/`** — Cross-domain utilities (`useAnalytics`, `useFilters`, `useSubscriptionStatus`).  
- **`/src/lib/`** — Shared utilities and schema validators across domains.  
- **`/src/contexts/` & `/src/providers/`** — Context and provider setup (analytics, theme, cookie consent).  

## Principles

- **Domain boundaries are explicit.** Booking logic stays in `booking/`; package pricing in `packages/`; search in `search/`.  
- **Data-first design.** All dynamic content (services, packages, testimonials, case studies) originates from `/src/data/`.  
- **Composable hierarchy.** Pages → Templates → Sections → Components → UI atoms.  
- **Extensible search.** Unified across domains, scoped per page, and upgradeable from client-only to API-backed.  


## 13) Reference Docs

- Website Workspace (directory, routes, aliases, conventions) — fileciteturn0file0
- Global Rules: Canonical “*-Services” Implementation — fileciteturn0file1
- Domain Implementation Template — fileciteturn0file2
- Structure & Authoring Guide (Reusable Template) — fileciteturn0file3
- Project Overview & Implementation Guide — fileciteturn0file4
```

# End of README

# Source Directory & Domain Specifications

This project uses **domain-oriented modules** under `src/` with a strict separation between **app pages**, **source modules**, and the **data (SSOT) domain**. Each domain exposes typed templates/sections/components with a small `lib` API and reads from a co-located data façade in `src/data/{domain}`. 【1†source】

## Top-level map (short)
```
src/
├─ booking/         # booking flow UI, sections, templates, lib
├─ search/          # unified search (services, portfolio, packages)
├─ packages/        # UI for package CTAs/sections
├─ portfolio/       # portfolio UI (galleries, modals, sections, templates)
├─ data/            # SSOT for all domains (services, pages, packages, portfolio, booking, etc.)
├─ services/        # services landing UI (selector, navigation, overview)
├─ components/, sections/, templates/   # shared UI surfaces
├─ lib/, hooks/, contexts/, providers/  # shared utilities
└─ styles/, types/, utils/              # styling and typed contracts
```

> **Import direction:** App → Templates → Sections → Components; **lib** holds *pure* domain primitives. Never import upward. 【5†source】

---

## Data Domain (`src/data`) — Single Source of Truth (SSOT)
- Centralized catalogs and page data for **services**, **packages**, **portfolio**, **testimonials**, **case studies**, and **booking**. Use `selectors.ts` helpers to compose page props. 【8†source】  
- **Taxonomy**: `taxonomy/servicesTree.ts` is authoritative for hubs/services and powers routes and breadcrumbs. Keep all slugs **canonical** (e.g., `video-production-services`). 【8†source】  
- **Page flows**: Service pages load data from `src/data/page/services-pages/<hub>/<service>/index.ts`, then template adapters map to props. 【8†source】

**Data façades (pattern):**
```
/src/data/{domain}/index.ts
  getHubBundle()
  getDetailBundle(slug)
  search(query, filters?)
```
Template pages must fetch **only** via these façades; adapters handle normalization/validation. 【1†source】

---

## Booking Domain (`src/booking` + `src/data/booking`)
**Purpose:** End‑to‑end scheduling UX (page + modal), with variants `"embed" | "form" | "calendar"`. 【3†source】【4†source】

**Source module shape:**
```
src/booking/
├─ templates/BookingHubTemplate, BookingModalTemplate
├─ sections/BookingSection (orchestrator; chooses variant)
├─ components/{AvailabilityCalendar, BookingForm, SchedulerEmbed, TimezonePicker, ...}
└─ lib/{types.ts,adapters.ts,validators.ts,registry.ts,metrics.ts,constants.ts,utils.ts}
```
- **Lib guardrails:** no React imports, named exports only, canonicalize service slugs via shared SSOT helpers. 【6†source】  
- **Adapters & validators:** produce strict props (`BookingHubTemplateProps`, `BookingModalTemplateProps`, `BookingSectionProps`), with Zod schemas and defaults in `registry.ts`. 【12†source】【15†source】

**Data SSOT:**
```
src/data/booking/
├─ index.ts (façade: getBookingHub, getCalendarForService, getIntakeForService, searchSlots)
├─ _types, _utils/{normalization.ts, search.ts}, _validators/{schema.ts, booking.validate.ts}
├─ calendars/<canonical-service>.ts    # provider config per service
└─ intake/<canonical-service>.ts       # intake question sets per service
```
All files are **keyed by canonical service slugs**; normalize legacy aliases at the edge. 【4†source】

**UX & quality bars:** route‑driven modal `/app/(modals)/book` + page `/app/book`, parity with portfolio bands, analytics events, a11y, SEO, perf. 【10†source】【13†source】【14†source】

---

## Search Domain (`src/search`)
**Goal:** Unified, upgradeable search across Services (L1/L2/L3), Portfolio, and Packages. Represent everything as a `SearchDoc` and filter by `type`/`serviceKey`. 【7†source】

**Directory:**
```
src/search/
├─ config/{search.config.ts, synonyms.ts}
├─ core/{types.ts, rank.ts, sources.services.ts, sources.portfolio.ts, sources.packages.ts, indexer.ts, buildIndex.ts}
├─ client/{miniClient.ts, useSearch.ts, highlight.ts, debounce.ts}
├─ server/{searchService.ts, meiliClient.ts}
└─ ui/{SearchBar.tsx, SearchBanner.tsx, CommandPalette.tsx, Filters.tsx, ResultCard.tsx, ResultsList.tsx, search.module.css}
public/search/index.json  # generated (Phase 1)
```
**Phases:**  
1) **Client-only** static index (`/public/search/index.json` + MiniSearch). 2) **API** route (`/api/search`). 3) **External engine** (Meilisearch/Typesense/Algolia). UI and `SearchDoc` stay stable. 【2†source】【10†source】

**Page wiring (examples):**
```tsx
// /services
<SearchBanner types={["hub","service","subservice"]} />
// /portfolio
<SearchBanner types={["portfolio"]} />
// /packages
<SearchBanner types={["package"]} />
```
You can also scope by service: `<SearchBanner types={["service","subservice","portfolio","package"]} serviceKey="video" />`. 【10†source】

---

## Packages Domain (`src/packages` + `src/data/packages`)
- **SSOT:** bundles, addons, featured sets live in `src/data/packages/**` with type guards & validators; surfaced via a small façade. Indexed for search and rendered via carousels/sections. 【2†source】
- **UI:** `sections/PackageCarousel/*` provides comparison cards, featured bundles, and add‑ons grids that read normalized props from adapters. (See `sections/PackageCarousel` in `src/sections/section-layouts/`).

---

## Portfolio Domain (`src/portfolio` + `src/data/portfolio`)
- **UI:** galleries, modal viewers, stats sections, and hub/category templates.  
- **Lib:** adapters/validators/registry define viewer behavior and analytics hooks.  
- **Data:** items + featured lists keyed by service; consumed by selectors and search indexers. 【8†source】

---

## Services UI (`src/services`) & Shared UI
- **Services UI:** navigation, overview grids, search banner, and selectors for hubs/services.  
- **Shared UI:** global components (`src/components`), section layouts (`src/sections`), and page templates (`src/templates`) compose typed props coming from domain adapters.

---

## Conventions & Rules (applies to every domain)
- **Fetch via data façades only**, then adapt → templates → sections → components (no fetching inside templates/sections/components). 【1†source】  
- **Canonical “*-services” slugs** everywhere; normalize legacy aliases in adapters at boundaries. 【0†source】  
- **Typed validators** at the lib layer; **no React in `lib/*`**; enforce import direction with lint rules. 【6†source】  
- **Search-ready** by default: each domain should export indexer mappers or expose fields the search core can read. 【2†source】
---

* **Note:** that all Title/Headers & Divider components should be wrapped in a container together.

* For each section in the PackageDetailsOverview the section should have a "universal tagline/description" that can be used across all packages.

➡️ Title block should be excluded from this.
➡️ Note update: if the Title/Header & Divider for a section includes a "universal tagline/description" all 3 should be wrapped together.
➡️ All titles/headers should be centered/aligned and all descriptions and summaries should have text right aligned.
➡️ All bullets should be centered and text/bullets should be right aligned.

---

* **Button notes:** All components with buttons should use the Button.tsx component and apply the buttons’ attrs/links, styling, etc in the component configuration.

  * All CTA buttons
    ↳ Single buttons are centered
    ↳ Double buttons are always side by side regardless of screen size or container size.
    The buttons should scale accordingly as well as the text.

---