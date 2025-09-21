Here’s a reusable, copy-paste **Domain Implementation Template** you can use to stand up any new domain (e.g., **packages**, **booking**, **search**, **pricing**, **tools**, **services & capabilities**, **FAQ**, **testimonials**, **CTA**, **overview/intro**). It generalizes everything we established for **portfolio**—contracts, directory shape, responsibilities, and guardrails—so new domains land production-ready and consistent.

---

# {Domain} — Architecture & Production Guide (Template)

> Replace `{Domain}` with your domain name (e.g., `packages`) and `{slug}` with its URL slug (e.g., `packages`). This template mirrors the portfolio blueprint (thin App Router → typed templates → sections → components → shared lib → data façade). &#x20;

---

## 1) Purpose & Scope

**What this domain does:**
A one-paragraph purpose (business outcome, user flows, pages).
**Pages covered:**

* Hub/index: `/{slug}`
* Optional leaf pages: `/{slug}/[id]` or `/{slug}/[category]`

**Non-goals:** call out what *doesn’t* belong here (e.g., checkout, auth).

> Keep the same “thin page, strong template” approach used in portfolio so orchestration is reusable and parity with existing pages stays high.&#x20;

---

## 2) Final directory shape (target)

```
/app/{slug}
├── [param]            # optional
│   └── page.tsx
└── page.tsx

/src/{domain}
├── templates
│   ├── {Domain}HubTemplate
│   │   ├── index.ts
│   │   ├── {Domain}HubTemplate.tsx
│   │   ├── {Domain}HubTemplate.types.ts
│   │   └── {Domain}HubTemplate.module.css
│   └── {Domain}DetailTemplate (or CategoryTemplate)
│       ├── index.ts
│       ├── {Domain}DetailTemplate.tsx
│       ├── {Domain}DetailTemplate.types.ts
│       └── {Domain}DetailTemplate.module.css
├── sections
│   ├── index.ts
│   └── ...Section/ (types, adapters, utils/*Validator.ts, .module.css, .tsx)
├── components
│   ├── index.ts
│   └── ...Component/ (types, adapters, utils/*Validator.ts, .module.css, .tsx)
├── lib
│   ├── adapters.ts      # domain-level adapters (SSOT)
│   ├── validators.ts    # primitive validators (SSOT)
│   ├── registry.ts      # variant → renderer, etc.
│   ├── metrics.ts       # shared formatters/transforms
│   └── types.ts         # primitives used across the domain
└── index.ts             # public barrel for the module

/src/data/{domain}
├── index.ts             # façade (getHubBundle, getDetailBundle, search, etc.)
├── _types/index.ts
├── _utils/* (normalization, search helpers)
├── _validators/* (schema.ts, validate.ts)
└── ... (category folders, items, metrics, registries)
```

> The portfolio refactor used this exact layering to separate **app**, **module**, and **data**, and enforced it with types and adapters. Keep the same import direction: **App → templates → sections → components → lib** (never the reverse). &#x20;

---

## 3) Responsibilities & import rules

### App Router (`/app/{slug}`…)

* **Thin pages only**: fetch via data façade, adapt via `src/{domain}/lib/adapters`, render **templates**.
* **Never** import sections/components directly; only `@/{domain}/templates` + `@/data/{domain}`.
* Own SEO metadata + JSON-LD; **no client-only logic** here.&#x20;

### Module templates (`/src/{domain}/templates/*`)

* Own **layout bands** and composition (e.g., **Hero → Search → Content → CTA**).
* Accept prepared props; **no fetching**.
* Defer rendering to **sections**; pass down analytics context/flags only.
* Provide empty/error states and responsive CSS modules.&#x20;

### Sections (`/src/{domain}/sections/*`)

* Orchestrate **variant** rendering; bind domain data to components.
* Keep `*.types.ts`, optional `adapters.ts`, `utils/*Validator.ts`, `*.module.css`, `.tsx`, `index.ts`.

### Components (`/src/{domain}/components/*`)

* Leaf UI building blocks with local validators for **component props only**.
* Self-contained (types, adapters if needed, utils, CSS, TSX). No imports from sections/templates.

### Shared lib (`/src/{domain}/lib/*`) — SSOT

* **Only domain-level** primitives: types, registry, metrics, **validators for primitives**, **adapters used by pages/templates**.
* Must **not** import from sections or components.
* Example adapters: `adaptHubSections`, `adaptDetailData`, `to{Domain}SectionProps`.
* Example validators: `ItemSchema`, `{Domain}SlugSchema` (not component props).&#x20;

### Data façade (`/src/data/{domain}`)

* Canonical source; expose **simple functions** the app pages call:

  * `getHubBundle()` / `getAllFeaturedByCategory()`
  * `getDetailBundle(slug)` / `getCategoryBundle(slug)`
  * `search(query, filters)`
* Keep `_validators` for raw data and `_utils` for normalization/search.&#x20;

---

## 4) Contracts (types) — what crosses boundaries

Define these **once** in `src/{domain}/lib/types.ts` and re-use everywhere:

* **Slug unions** (e.g., `CategorySlug`, `{Domain}Variant`)
* **Primitive item types** (`Item`, `Media`, `Metric`…)
* **Template props** (`{Domain}HubTemplateProps`, `{Domain}DetailTemplateProps`)
* **Section props** (`{Domain}SectionProps`)
* **Hub section model** (`HubSection { slug, label, variant, viewAllHref, items[], subtitle?, priority? }`)

> Portfolio’s parity review and integration guide show how these contracts keep app pages and templates in sync while preserving the visual bands (Hero/Search/Overview/Sections/CTA). Mirror that pattern for every new domain.&#x20;

---

## 5) Validation policy

* **lib/validators.ts**: schemas for domain primitives only (e.g., `ItemSchema`, `SlugSchema`).
* **sections/components `utils/*Validator.ts`**: validate only **UI-specific** props (layout toggles, view sizes, limits).
* **data/\_validators**: runtime validation for incoming/raw data (CMS, files) before adaptation.

> This split prevents overlap: primitives live in **lib**, UI rules live **locally** next to the renderer. Enforce via lint rules or code review.&#x20;

---

## 6) App pages → templates wiring (minimal pages)

**Hub**:

1. call façade → 2) `adaptHubSections(raw)` → 3) render `<{Domain}HubTemplate … />` with `{ meta, features, analytics }`.

**Detail/Category**:

1. call façade → 2) `adaptDetailData(raw)` → 3) render `<{Domain}DetailTemplate … />` with `{ layout, analytics }`.

> This is the same flow we used for portfolio (pages under 60 lines, no client orchestration).&#x20;

---

## 7) Template parity (bands & toggles)

Both templates should expose flags to match existing app layouts 1:1:

* `features.showSearch`, `showOverview`, `showCTA` (Hub)
* `layout.showTools`, `showCaseStudies`, `showPackages` (Detail/Category)
* `meta.{title,subtitle,heroButton}`; `analytics.{context,track*}`

> These knobs matched the app pages for portfolio and should be replicated so future domains maintain visual parity without ad-hoc page code.

---

## 8) Accessibility, SEO, performance (baseline)

* **A11y**: focus trap for modals, keyboard nav, ARIA labels, one H1 per page, headings cascade (H2 for sections).
* **SEO**: pages own `Metadata` + JSON-LD; templates render crawlable copy, not only modals.
* **Perf**: lazy media, posters/thumbnails, dynamic import heavy viewers if needed, avoid client code in pages.&#x20;

---

## 9) Lint guardrails (optional but recommended)

```
no-restricted-imports:
  - "@/ {domain} /templates/*"  # disallow inside sections/components
  - "@/ {domain} /sections/*"   # disallow inside components
  - "../*"                      # discourage upward relative traversals
```

Allow `@/{domain}/lib/*` anywhere **downstream** of templates; forbid reverse imports.&#x20;

---

## 10) Scaffolding checklist (no code, just steps)

1. **Create module skeleton**

* `/src/{domain}/{templates,sections,components,lib}`
* `/src/{domain}/index.ts` barrels; one index inside `templates/`.

2. **Define contracts**

* `lib/types.ts`: primitives and template props.
* `lib/validators.ts`: primitive schemas.
* `lib/registry.ts`: variant → renderer map (if applicable).
* `lib/adapters.ts`: `adaptHubSections`, `adaptDetailData`, optional `to{Domain}SectionProps`.

3. **Author templates**

* `{Domain}HubTemplate` and `{Domain}DetailTemplate` with `*.types.ts` and `*.module.css`.
* Add **empty/error states** and **feature/layout toggles**.

4. **Sections & components**

* Implement at least one **orchestrator** section and 1–3 leaf components.
* Local validators in `utils/*Validator.ts`.

5. **Data façade**

* `/src/data/{domain}/index.ts`: `getHubBundle()`, `getDetailBundle(slug)`, `search()`.
* `_validators/schema.ts` + `validate.ts` for raw inputs.
* `_utils/normalization.ts`, `search.ts`.

6. **Pages**

* `/app/{slug}/page.tsx` and optional `/app/{slug}/[param]/page.tsx`:

  * Fetch via façade → adapt via `lib/adapters` → render templates.
  * Add `generateStaticParams()` if needed and metadata/JSON-LD.

7. **Parity QA**

* Use the **Template Parity Review** checklist: verify bands order, copy, search scope, section counts, CTA behaviors, and analytics contexts.

8. **Acceptance gates**

* Build passes; imports respect boundaries; validators wired; empty states render; SSR-safe.
* Optional CI: run domain validators + health checks if applicable.&#x20;

---

## 11) Example façade & adapter names (rename per domain)

* **Data façade**:
  `get{Domain}HubBundle()`, `get{Domain}DetailBundle(slug)`, `search{Domain}(query, filters)`

* **Adapters (lib)**:
  `adapt{Domain}HubSections(raw)`, `adapt{Domain}DetailData(raw)`, `to{Domain}SectionProps(block)`

* **Types (lib)**:
  `{Domain}Variant`, `{Domain}Slug`, `{Domain}Item`, `{Domain}Metric`, `{Domain}HubTemplateProps`, `{Domain}DetailTemplateProps`

---

## 12) “Done” checklist (copy into your PR)

* [ ] App pages import **only** `@/{domain}/templates` and `@/data/{domain}`
* [ ] Templates **don’t fetch** and expose **feature/layout** toggles
* [ ] Sections implement an orchestrator + local validators
* [ ] Components are self-contained with local validators (no imports from sections/templates)
* [ ] `lib/` contains only **domain primitives** (types, validators, registry, adapters) and imports nothing from UI
* [ ] Data façade returns the shapes adapters expect; raw files remain internal
* [ ] Metadata/JSON-LD implemented at pages; templates render crawlable content
* [ ] Empty/error states present; keyboard and focus behaviors verified
* [ ] Build & lint pass; import boundaries honored; parity checklist green

---

### Why this works

This template codifies the same **contracts + layering** used for portfolio (and proven in your parity and integration docs). New domains inherit the same **maintainability, performance, and a11y**—and they slot into the App Router with minimal glue. &#x20;

If you want, I can generate a tailored scaffold (file tree + placeholder files) for your next domain (e.g., **packages**), following this template exactly.
