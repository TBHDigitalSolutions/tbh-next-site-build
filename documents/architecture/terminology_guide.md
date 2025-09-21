Official Title: Project Architecture Terminology Guide
Domain: Web Development, Project Architecture
File Name: project-architecture_terminology-guide_2025-09-13.md
Main Part: project-architecture
Qualifier: TerminologyGuide
Date: 2025-09-13
Spotlight Comments:
- Defines key terms (Page, Layout, Template, Section, etc.) and their roles in a Next.js app.
- Explains data-to-UI mapping flow from blocks to templates to sections.
- Cross-references project-architecture_system-overview_2025-09-13.md and project-architecture_service-data-patterns_2025-09-13.md.

Summary: The Project Architecture Terminology Guide provides a clear, concise glossary of core architectural terms (Page, Layout, Template, Section, Component, Container, Block, Module, Adapter, Validator) used in TBH Digital Solutions' Next.js marketing website. It details where each element lives, their responsibilities, and how data flows from page data blocks through adapters to templates and sections, ensuring clarity, reusability, and safety with examples specific to the Marketing Services hub.

---

Awesome question. Here’s a clean, no-nonsense glossary for the words we’ve been using—what each *is*, where it typically lives in a Next.js + TypeScript app, and how they relate. I’ll also show how “mapping logic” flows from data to UI.

---

## The building blocks (pun intended)

### Page

* **What:** A routed entry point (`/app/.../page.tsx`).
* **Job:** Fetch/prepare data for a single route and render a high-level UI (often a **Template**).
* **Tip:** Pages should stay thin—no business rules, no heavy layout logic.

### Layout

* **What:** Persistent wrapper(s) around pages (`/app/layout.tsx`, nested layouts).
* **Job:** Shell UI (header, footer, nav), theming, metadata.
* **Tip:** No page-specific business logic here.

### Template

* **What:** A *page-sized* composition component (e.g., `ServiceTemplate.tsx`).
* **Job:** Takes a **single data object** and orchestrates which **Sections** to render and in what order.
* **Tip:** Templates decide *what sections to show*; sections decide *how they look*.

### Section

* **What:** A self-contained page slice (Hero, Pricing, FAQs, Portfolio, CTA).
* **Job:** One responsibility, one layout; takes a **normalized props shape**.
* **Tip:** Sections render **Components** inside.

### Component

* **What:** A small, reusable UI piece (Card, Button, Badge, Accordion).
* **Job:** Pure presentation; no domain rules; typed props.
* **Tip:** Components should be easy to reuse anywhere.

### Container

* **What:** A glue component that fetches/derives data and passes it into a presentational Component/Section.
* **Job:** Side-effects or derived state (optional in App Router—often the Page/Template already handles this).
* **Tip:** If your page is thin and template handles orchestration, you may not need extra containers.

### Block

* **What:** A *piece of data* (not code) representing content for a Section (e.g., `{ hero: {...}, pricing: {...} }`).
* **Job:** Lives in your **page data** (TS or JSON); a template reads blocks and chooses sections.
* **Tip:** Missing blocks → section is skipped.

### Module

* **What:** Two meanings; be explicit in your repo:

  1. **Code module**: just “a file that exports things”.
  2. **UI module** (your project’s term): a reusable composite chunk (e.g., “Resources carousel”) that can appear across pages.
* **Tip:** If you use “module” for UI, treat it like a **Section** that’s portable.

### Adapter

* **What:** A small function that converts a source shape → the props a Section expects.
* **Job:** “Mapping logic”—normalize/reshape data (e.g., pricing tiers, portfolio items) to section props.
* **Tip:** Keeps Sections dumb and reusable; keeps Templates clean.

### Validator

* **What:** Zod (or similar) schema + CLI that asserts your data’s shape is correct.
* **Job:** Fail fast in CI; ensure blocks match the expected types before rendering.
* **Tip:** Validators protect Templates/Sections from bad inputs.

---

## Where they live (typical)

* **Pages / Layouts:** `/app/**`
* **Templates:** `/src/templates/**` (or `/app/(templates)/**` if colocating)
* **Sections:** `/src/sections/**`
* **Components (atoms/molecules):** `/src/components/**`
* **Adapters / Mappers:** `/src/lib/adapters/**` (e.g., `pricingAdapters.ts`)
* **Validators / Schemas:** `/src/lib/schemas/**` + CLI in `/scripts/**`
* **Page Data (blocks):** `/src/data/page/**` (TS recommended, JSON allowed with parse/validate)

---

## How the mapping logic flows (end-to-end)

**1) Page data (blocks)**

* Example file: `/src/data/page/services-pages/marketing-services/index.ts`
* Exports one typed object:

  ```ts
  export default {
    hero: {...},
    portfolio: {...},
    pricing: {...},
    faq: {...},
    // etc.
  }
  ```

  Missing blocks are okay.

**2) Page → Template**

* `/app/services/marketing-services/page.tsx`

  * Finds the taxonomy node for the route.
  * Imports the page’s data object.
  * Renders `<ServiceTemplate node={node} data={data} />`.

**3) Template → Sections (or Modules)**

* `ServiceTemplate.tsx`:

  * Checks for each block (e.g., `data.hero ? <Hero .../> : null`).
  * Calls **Adapters** where needed (e.g., `adaptPricing(data.pricing, hubSlug)`).
  * Decides ordering and conditional visibility.
  * Passes **normalized props** to Sections.

**4) Sections → Components**

* Each Section receives clean, typed props and renders presentational Components (Cards, Buttons, etc.)—no data wrangling inside.

**5) Validators (outside render path)**

* CLI scripts validate all data (taxonomy, services pages, portfolio, packages).
* CI blocks merges if data is invalid → your app stays safe.

---

## Why this separation helps

* **Clarity:** You know exactly where to put things:

  * Data in **data files**, orchestration in **templates**, rendering in **sections/components**, normalization in **adapters**, safety in **validators**.
* **Reusability:** Sections don’t care where data comes from; they just get typed props.
* **Safety:** Validators catch bad shapes *before* runtime.
* **Refactors:** If a Section’s props change, TypeScript tells you where adapters/data need updates.

---

## Quick examples (marketing services)

* **Block:** `pricing` block inside the page data:

  ```ts
  pricing: {
    title: "Marketing Pricing",
    tiers: [{ id: "starter", price: 2000, unit: "/mo", features: [...] }],
    disclaimer: "Prices are starting points…"
  }
  ```
* **Adapter:** `adaptMarketingPricing()` maps `tiers` to the props that `<PricingTable />` expects (e.g., ensures `currency`, fills defaults).
* **Section:** `<PricingSection {...mappedProps} />` renders the table.
* **Template:** `ServiceTemplate` calls the adapter and chooses whether/where the Pricing section appears.
* **Validator:** `validate-services-pages.ts` asserts the `pricing` block satisfies the schema before it ever hits the app.

---

## What maps to what (cheat sheet)

* **Blocks (data)** → used by **Templates**.
* **Templates** → decide which **Sections** to show.
* **Adapters** → convert block shapes to **Section props**.
* **Sections** → render **Components**.
* **Validators** → keep blocks and taxonomy correct.
* **Pages** → glue route + data + template.
* **Layouts** → wrap pages (shell/UI framing).

If you keep these roles clean, you’ll ship faster with fewer surprises.
