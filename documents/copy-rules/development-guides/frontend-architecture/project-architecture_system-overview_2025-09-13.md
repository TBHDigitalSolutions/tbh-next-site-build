Official Title: Project Architecture System Overview Guide
File Name: project-architecture_system-overview_2025-09-13.md
Qualifier: SystemOverview
Cross-references project-architecture_terminology-guide_2025-09-13.md and project-architecture_service-data-patterns_2025-09-13.md.
Date: 2025-09-13

Spotlight Comments:
Defines roles of Page, Layout, Template, Section, Component, Block, Adapter, and Validator.
Outlines data flow from blocks to UI and centralization of types/adapters.
Cross-references project-glossary_guide_2025-09-13.md and project-overview_guide_2025-09-13.md.

Summary: The Project Architecture and Data Flow Guide provides a clear explanation of key architectural elements (Page, Layout, Template, Section, Component, Block, Adapter, Validator) in TBH Digital Solutions' Next.js and TypeScript marketing website. It specifies their roles, where they live (e.g., components, sections, templates, lib), and how data flows from page data blocks through adapters to templates and sections, with recommendations for centralizing types/adapters and using TypeScript for data files to ensure a predictable, maintainable codebase.

---

Here’s a plain-English “what is what” guide for your Next.js + TypeScript project—plus clear advice on **where to put types and adapters**, and **how data moves** from files to UI.

---

# 1) The cast of characters (what each thing is for)

Think of a page as a play: the **Page** invites the audience, the **Layout** is the stage, the **Template** is the script, **Sections** are the scenes, **Components** are the props/actors, **Blocks** are the scene notes, **Adapters** are the translators, and **Validators** are the editors who make sure nothing is broken.

## Page

* **What:** A routed file (e.g., `/app/services/marketing-services/page.tsx`).
* **Job:** Glue together *route → data → template*. Minimal logic.
* **Inputs:** route params, page data, taxonomy node(s).
* **Outputs:** JSX using a **Template**.

## Layout

* **What:** Wrappers around pages (root or nested), e.g., header, footer, metadata.
* **Job:** Site chrome and persistent structure. No page-specific business rules.

## Template

* **What:** A “page-sized” composer.
* **Job:** Decide **which sections** to render and in **what order** based on the incoming data.
* **Rule of thumb:** Templates orchestrate; Sections render.

## Section

* **What:** A self-contained page slice (Hero, Pricing, FAQs, Portfolio, CTA).
* **Job:** Render **one thing well**. Receives **already-shaped props**.
* **Note:** Sections use Components inside.

## Component

* **What:** Small reusable UI pieces (Card, Badge, Button, TestimonialCard).
* **Job:** Pure presentation. No domain logic. Typed props.

## Module (if you use this term)

* **Two common meanings; pick one and stick with it:**

  1. **Code module:** any file that exports stuff.
  2. **UI Module:** a portable, multi-component chunk (e.g., “Resources Carousel”).
     If you use this meaning, treat it like a Section that can appear in many Templates.

## Block

* **What:** **Data**, not code. A slice of content that corresponds to a Section (e.g., `hero`, `pricing`, `faq`).
* **Where:** In your page data files (TS or JSON).
* **Job:** Tell the Template “I exist; please render the matching Section.”

## Adapter

* **What:** A small function that **maps raw data → the exact props a Section/Component needs**.
* **Job:** Normalize shapes, add defaults, compute derived fields, enforce types at the edge.
* **Why:** Keeps Templates/Sections clean and reusable.

## Validator

* **What:** A schema + script that **checks data files** (taxonomy, services pages, portfolio, packages).
* **Job:** Catch bad shapes in CI before runtime. (You’re using Zod + TS scripts.)

---

# 2) Where to centralize **types** and **adapters**

The goal: **one obvious place** per UI *unit* to find its types and adapter(s).

## Recommended pattern

* **Components (atoms/molecules)**

  * Put their **Prop types** next to them:
    `src/components/TestimonialCard/TestimonialCard.tsx`
    `src/components/TestimonialCard/types.ts` *(optional if props are simple)*
  * If they often get messy inputs, add a **component-level adapter**:
    `src/components/TestimonialCard/adapter.ts` (maps raw → `TestimonialCardProps`)

* **Sections**

  * Keep **Section props types + adapter** together:
    `src/sections/Testimonials/TestimonialsSection.tsx`
    `src/sections/Testimonials/types.ts`
    `src/sections/Testimonials/adapter.ts` (maps page **block** → `TestimonialsSectionProps`)
  * Sections can internally use smaller component adapters, but **the section adapter is the contract** for Templates.

* **Templates**

  * Keep **Template input type** (the “page data shape” it expects) next to the template:
    `src/templates/ServiceTemplate.tsx`
    `src/templates/ServiceTemplate.types.ts`
  * **Templates should not own data adapters**. They **call section adapters** instead.
    (Exception: a tiny “assemble” helper is okay if it only composes section adapters.)

* **Layouts & Pages**

  * Do **not** add adapters here.
  * Pages fetch/choose data, then hand it to the Template.
  * Layouts provide shell only.

* **Cross-domain types (taxonomy, portfolio, packages, services pages)**

  * Keep domain types in `src/types/**` (e.g., `servicesTaxonomy.types.ts`).
  * Keep domain adapters (e.g., pricing transforms) in `src/lib/adapters/**` when they are reused across many sections.

### Why this works

* **Discoverable:** When you open a Section or Component, you immediately see *its* types and *its* adapter.
* **Composable:** Templates become simple orchestration: *check block exists → call section adapter → render section*.
* **Safer:** Changing a Section prop type breaks only the **adapter**, not the whole app.

---

# 3) How data flows (no surprises)

Use this mental model every time:

```
Route → Page → Template → [for each block]
                         → SectionAdapter(data.block) → Section(props) → Components
```

* **Blocks** live in TS/JSON data files (e.g., `src/data/page/services-pages/marketing-services/index.ts`).
* **Template** checks if a block exists. If yes:
* **Adapter** normalizes the block into the exact **Section props**.
* **Section** renders using **Components**.
* **Validators** run separately (scripts/CI) to ensure blocks are well-formed before you ship.

---

# 4) JSON vs TS for data files (quick rule)

* **Prefer TypeScript data files** (`.ts` exporting objects):

  * You get **types** + intellisense + compile-time errors.
  * Import directly: `import data from '@/data/page/services-pages/marketing-services'`
* **Use JSON** only if content is totally non-code and you want easy non-dev edits.

  * If JSON, **parse + validate** it with Zod in a tiny loader (or at build time).
  * Then pass the validated object through your **Adapters** as usual.

---

# 5) What lives where (suggested folders)

```
src/
  components/
    TestimonialCard/
      TestimonialCard.tsx
      types.ts
      adapter.ts           ← (optional for component-level mapping)
  sections/
    Testimonials/
      TestimonialsSection.tsx
      types.ts
      adapter.ts           ← block-to-section mapping lives here
  templates/
    ServiceTemplate.tsx
    ServiceTemplate.types.ts
  lib/
    adapters/              ← cross-domain or reusable adapters (e.g., pricing)
    schemas/               ← Zod schemas (services pages, portfolio, etc.)
  types/
    servicesTaxonomy.types.ts
    servicesTemplate.types.ts
  data/
    page/
      services-pages/
        marketing-services/
          index.ts         ← blocks: { hero, pricing, portfolio, faq, ... }
```

---

# 6) How validation fits in (simple view)

* **At authoring time:**

  * TS data files catch obvious type issues right in your editor.
* **Precommit/CI scripts (you already have these):**

  * Run validators for **taxonomy**, **services pages**, **portfolio**, **packages**.
  * If anything is invalid, the scripts exit non-zero and block the merge.
* **At render time:**

  * Templates assume data is valid (thanks to validators).
  * Adapters still provide **last-mile shaping and defaults**.

---

# 7) Do’s and Don’ts (cheat sheet)

**Do**

* Keep **adapters + types close to the thing** they shape (component/section).
* Keep **Templates thin** (orchestrate sections; don’t transform data).
* Keep **Pages thin** (glue; no business rules).
* Use **TS data files** for page blocks whenever possible.
* Run **validators** locally and in CI.

**Don’t**

* Put mapping/transform logic inside Sections or Pages.
* Let a Template re-implement a Section’s adapter.
* Spread the same schema in multiple places (single source of truth in `src/lib/schemas` and `src/types`).

---

# 8) Tiny end-to-end example (in words)

* You add a **`testimonials` block** to `marketing-services` data.
* `ServiceTemplate` sees `data.testimonials` exists.
* It calls `adaptTestimonials(data.testimonials)` from `src/sections/Testimonials/adapter.ts`.
* That returns strictly typed `TestimonialsSectionProps`.
* `<TestimonialsSection {...props} />` renders, using `<TestimonialCard />` components.
* Your `validate-services-pages.ts` script confirms the `testimonials` block shape ahead of time.

You changed **one data file**, and—because types + adapters are centralized—the rest was automatic and safe.

---

## TL;DR

* **Centralize types + adapters at the level they serve** (Component/Section).
* **Templates orchestrate**; **Sections render**; **Adapters shape**; **Validators ensure**.
* Prefer **TS data files**; validate JSON when used.
* Keep Pages/Layout trivial; push logic down to the right layer.
* This keeps the codebase predictable, refactor-friendly, and easy to onboard to.
