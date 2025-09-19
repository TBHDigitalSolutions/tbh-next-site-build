Portfolio Production Standards Guide
Official Title: Portfolio Domain Production Standards Guide
Domain: Portfolio
File Name: portfolio-production-standards_PortfolioProductionStandardsGuide_2025-09-14.md
Main Part: portfolio-production-standards
Qualifier: PortfolioProductionStandardsGuide
Date: 2025-09-14

Spotlight Comments:
Provides a comprehensive checklist for building a production-ready portfolio domain.
Focuses on modular architecture, clear import boundaries, and maintainable code structure.
Cross-references data façade, templates, and accessibility standards for consistency.

Summary:
The Portfolio Domain Production Standards Guide is a detailed task list designed to guide the development of a production-ready portfolio domain within a web application. It outlines clear steps for structuring the domain’s data façade, templates, sections, components, and app router, ensuring separation of concerns, maintainability, and scalability. The document emphasizes strict import rules, accessibility, analytics integration, and performance optimizations, while providing acceptance criteria for each task to ensure alignment with the existing application’s user experience and functionality.
This guide serves as a blueprint for developers to refactor or build the portfolio domain, with tasks covering data normalization, UI composition, testing, and documentation. It also includes steps for cleanup and final readiness to ensure a smooth transition to production, making it a critical resource for engineers and stakeholders aiming to maintain a consistent and high-quality portfolio feature.

---

Awesome—here’s a thorough, practical **task list** with clear **steps** to take your Portfolio domain to a production-ready, fully wired build. No code—just the checklist you can work through.

---

# 0) Ground rules (apply across all tasks)

* **Import direction:** App Router ➜ `@/portfolio/templates` ➜ `@/portfolio/sections` ➜ `@/portfolio/components` ➜ `@/portfolio/lib`.
* **Domain vs UI rules:** Domain primitives (Project, Category, etc.) live in `@/portfolio/lib/*`; UI-specific rules stay beside each component/section under `utils/`.
* **Pages never import components directly**—only templates (and the data façade).

---

# 1) Data Façade (src/data/portfolio) — single source for pages

**Goal:** App pages call a tiny API; all raw files remain internal.

**Tasks & Steps**

1. **Create façade functions**

   * `getFeaturedByCategory()` returns an array of raw hub sections.
   * `getCategoryBundle(slug)` returns raw category payload (items, tools, case studies, metrics, etc.).
2. **Normalize inside the pages via lib adapters**

   * Hub: pass façade output to `adaptSectionsForHub(...)`.
   * Category: pass façade output to `adaptCategoryPageData(...)`.
3. **Stabilize slugs**

   * Centralize list of allowed category slugs; export once for routing and validation.
4. **Document input contracts**

   * In `/src/data/portfolio/README.md`, describe what each façade returns (fields that **must** be present vs optional).

**Acceptance**

* Pages can render without importing any raw `items/*.ts` directly.
* Slugs and shapes are consistent across hub and category paths.

---

# 2) Domain SSOT (src/portfolio/lib) — adapters, validators, registry, types, metrics

**Goal:** Keep shared rules here; avoid leaks from UI folders.

**Tasks & Steps**

1. **Adapters**

   * Ensure the following exist and are the *only* adapters used by pages/templates:

     * `adaptSectionsForHub(rawSections)`
     * `adaptCategoryPageData(rawData)`
     * (Optional) `toPortfolioSectionProps(portfolioBlock)` for service pages that include a portfolio block.
2. **Validators**

   * Keep **primitive** schemas (Project, Category, MediaItem) here.
   * Do **not** include UI-specific props in lib validators.
3. **Registry**

   * Keep variant ➜ viewer mapping in `lib/registry.ts`.
   * Ensure `PortfolioSection` reads only from this registry.
4. **Types & Metrics**

   * Confirm `types.ts` exposes the primitives used by templates/sections (Project, CategorySlug, PortfolioVariant).
   * Keep shared formatters/metric helpers here (e.g., number/currency/date formatters).

**Acceptance**

* Nothing in `lib/` imports from `templates/`, `sections/`, or `components/`.
* Pages and templates compile with only `lib` adapters and types.

---

# 3) Templates (src/portfolio/templates) — layout & composition only

**Goal:** Port the app pages’ layout bands (Hero → Search → Overview/Intro → Sections → CTA for Hub; Hero → Search → Header → Metrics → Items → optional blocks for Category) into templates.

**Tasks & Steps**

1. **Hub Template**

   * Props contract is final (`PortfolioHubTemplateProps`).
   * Features flags (`showSearch`, `showOverview`, `showCTA`) mirror your app’s choices.
   * Hero copy is configurable via `meta`; analytics via `analytics.context`.
2. **Category Template**

   * Props contract is final (`PortfolioCategoryTemplateProps`).
   * Layout flags (`showTools`, `showCaseStudies`, `showPackages`) reflect what your app shows.
   * Category search is scoped using preset filters; analytics context per category.
3. **CSS Modules**

   * Confirm templates use their own `*.module.css`; no inline styles.
   * Token variables (spacing, colors) align with your design tokens.
4. **Error/empty states**

   * Each template has a graceful empty state and simple retry hook (even if unused initially).

**Acceptance**

* Visual structure matches the current app pages band-for-band.
* Templates don’t fetch data or own analytics logic; they pass flags/contexts down.

---

# 4) Sections (src/portfolio/sections) — orchestrate components

**Goal:** `PortfolioSection` is the single orchestrator for variant rendering.

**Tasks & Steps**

1. **Contract**

   * Ensure `PortfolioSection.types.ts` includes variant union and a11y fields.
2. **Adapters & Validators**

   * Section-level `adapters.ts` accepts flexible block config and returns strict props.
   * Section-level validator validates **section props** (not domain primitives).
3. **Other Sections**

   * `PortfolioOverviewSection`, `PortfolioStatsSection`, `PortfolioOverviewText` follow the same standard (types, adapters, utils/validator, CSS, TSX).

**Acceptance**

* Templates invoke sections with minimal glue code.
* Variants route through registry consistently; no ad-hoc viewer selection in templates or pages.

---

# 5) Components (src/portfolio/components) — building blocks

**Goal:** Each component folder is self-contained and follows the component standard.

**Tasks & Steps**

1. **File presence check**

   * `*.types.ts`, `adapters.ts` (if component needs input shaping), `utils/*Validator.ts`, `Component.tsx`, `Component.module.css`, `index.ts`.
2. **Local validators**

   * Validate only **component props**; import domain primitives from `lib` where needed.
3. **Media viewers & modals**

   * Keep registries internal (e.g., mediaViewers/registry.ts); don’t export to lib.

**Acceptance**

* No component imports from templates or sections.
* Local validators don’t duplicate primitive schemas from `lib`.

---

# 6) App Router (app/portfolio/\*) — thin pages

**Goal:** Pages just fetch+adapt, then render templates.

**Tasks & Steps**

1. **Hub page**

   * Replace app-level orchestration (e.g., old HubSectionsClient) with `<PortfolioHubTemplate />`.
   * Build `sections` by calling data façade + `adaptSectionsForHub`.
   * Provide `meta`, `features`, `analytics` to mirror current UX.
2. **Category page**

   * Replace app-level client composition with `<PortfolioCategoryTemplate />`.
   * Build `data` by calling façade + `adaptCategoryPageData`.
   * Gate with allowed `CategorySlug`s (return `notFound()` on invalid).
3. **Metadata & SSG**

   * Optional: `generateStaticParams()` from central slug list.
   * Keep metadata functions; ensure they don’t import UI.
4. **Cleanup**

   * Remove unused app-level clients/CSS once templates are in use.

**Acceptance**

* App files are < 60 lines each and only import templates and data façade.
* Full build passes with old app-level client components removed or archived.

---

# 7) Contracts & Boundaries — enforce with lint & review

**Goal:** Prevent regressions and cross-layer imports.

**Tasks & Steps**

1. **ESLint rules**

   * Disallow imports from `@/portfolio/templates/*` in sections/components.
   * Disallow imports from `@/portfolio/sections/*` in components.
   * Allow `@/portfolio/lib/*` anywhere **below** templates; forbid the reverse.
2. **PR checklist**

   * “Did pages import only templates and data façade?”
   * “Are new validators domain-level or UI-level in the right folder?”
   * “Are variants routed via registry only?”

**Acceptance**

* CI fails when someone imports against the agreed graph.
* Reviewers have a one-pager checklist to sign off.

---

# 8) Analytics & Telemetry — consistent and SSR-safe

**Goal:** Templates pass context; sections/components trigger events client-side.

**Tasks & Steps**

1. **Contexts**

   * Hub: `${context}_${section.slug}` for per-section views.
   * Category: `${context}` for item views; toggle with `trackItemViews`.
2. **Event wiring**

   * Place event emitters inside client components (no `window` in templates).
3. **Naming**

   * Document event names and payload schema in `/src/portfolio/README.md`.

**Acceptance**

* No SSR warnings in logs.
* Event payloads include the expected context keys.

---

# 9) Accessibility & Internationalization

**Goal:** Landmarks, headings, labels, and keyboard affordances across templates/sections.

**Tasks & Steps**

1. **Landmarks**

   * `header`, `section[aria-label]`, `main`, `nav` used consistently.
2. **Headings**

   * Single H1 per page (Category), H2 for sections, informative labels.
3. **Focus & Motion**

   * `:focus-visible` styles and `prefers-reduced-motion` queries in CSS modules.
4. **Copy**

   * Ensure template strings are passable props for i18n later.

**Acceptance**

* Axe (or similar) shows no critical violations.
* Keyboard users can access search and controls.

---

# 10) Styling & Theming

**Goal:** Token-driven CSS; no inline styles.

**Tasks & Steps**

1. **Variables**

   * Ensure template/section CSS modules use tokens for spacing, colors, typography.
2. **Responsive**

   * Grid/stack responsive rules; mobile spacing verified.
3. **Print & reduced motion**

   * Print hide/show logic and motion fallbacks in place.

**Acceptance**

* Visual regressions minimized during theme swaps.
* No hardcoded hex values where tokens should exist.

---

# 11) Performance & Code-splitting

**Goal:** Load heavy viewers only when needed.

**Tasks & Steps**

1. **Dynamic imports**

   * Ensure `PortfolioSection` code-splits variant viewers if heavy (video/demo).
2. **Bundle size**

   * Verify bundle analyzer after refactor; watch for accidental imports in pages.
3. **Images & media**

   * Confirm media viewers use lazy strategies.

**Acceptance**

* Initial route stays lean; variant bundles loaded on demand.
* No big regressions vs pre-refactor.

---

# 12) Testing & QA

**Goal:** Confidence the contract holds and UX matches the old pages.

**Tasks & Steps**

1. **Unit**

   * Adapters: happy path + malformed input returns sane defaults.
   * Validators: accept good data, reject wrong shape.
2. **Component smoke**

   * Render each section/variant with minimal props; assert no console errors.
3. **Template smoke**

   * Render hub & category templates with sample fixtures; assert bands display as expected.
4. **E2E (core paths)**

   * `/portfolio` Hub renders; at least one section list is visible.
   * `/portfolio/[category]` renders with items and search scoped.

**Acceptance**

* CI runs tests green.
* Manual checks show band-for-band parity with legacy app pages.

---

# 13) Documentation

**Goal:** Make the architecture obvious to future you.

**Tasks & Steps**

1. **Portfolio Domain – Production Standards Guide**

   * Add a “Contracts” section diagram and examples of allowed imports.
2. **How-to**

   * “Add a new category” steps: data files ➜ façade ➜ adapters ➜ template.
   * “Add a new viewer variant” steps: component folder ➜ registry ➜ section routing.

**Acceptance**

* New engineers can add a category or viewer without asking for help.

---

# 14) Cleanup & Decommission

**Goal:** Remove dead code, keep history if needed.

**Tasks & Steps**

1. **Retire app clients**

   * `HubSectionsClient.*`, `CategoryPageClient.*` and related CSS if unused.
2. **Remove duplicate helpers**

   * Any app-level normalization/metrics code duplicated from `lib`.
3. **Barrels**

   * Ensure `/src/portfolio/templates/index.ts` re-exports types + defaults.
   * Ensure `/src/portfolio/index.ts` exports only top-level public API.

**Acceptance**

* No stale files in app folder; imports compile without alias hacks.

---

# 15) Final Readiness Gate

**Goal:** Ship confidence.

**Tasks & Steps**

1. **Build & type check**

   * `build` + typecheck clean; no `any` in public types.
2. **Visual parity pass**

   * Compare old pages vs new templates; confirm same bands and copy.
3. **Analytics dry run**

   * Verify events with correct contexts fire on interaction/view.
4. **Error & empty**

   * Simulate empty data; templates show friendly empty states.

**Acceptance**

* Stakeholders sign off on parity.
* Monitoring dashboards show expected events.

---

Use this list as your “work board.” If you want, I can turn it into a Kanban-style CSV (or a markdown checklist grouped by assignee) so you can paste it straight into your tracker.
