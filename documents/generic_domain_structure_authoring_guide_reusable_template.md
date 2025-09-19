# <DomainName> — Structure & Authoring Guide (Reusable Template)

> **Use this as a copy-and-adapt template** for any domain (e.g., **Packages**, **Search**, **Pricing**, **Tools**, **Services & Capabilities**, **FAQ**, **Testimonials**, **Call To Action**, **Overview/Intro**). Replace `<DomainName>` / `<domain>` placeholders with the actual domain.

---

## 1) Final Directory Layout (Single Home per Domain)

```
/src/<domain>
├── components/                # Reusable UI building blocks (the <DomainName> component module)
│   └── ...
├── sections/                  # Composable page sections used by templates
│   └── <DomainName>Section/   # Orchestrator section (single entry point for rendering)
├── templates/                 # Page-level scaffolds used by App Router pages
│   ├── <DomainName>HubTemplate.tsx
│   └── <DomainName>DetailTemplate.tsx   # or CategoryTemplate, ResultTemplate, etc.
├── lib/                       # Shared utilities across this domain (SSOT)
│   ├── adapters.ts            # map data → strict UI props (incl. to<DomainName>SectionProps)
│   ├── validators.ts          # zod or light runtime guards for inputs
│   ├── transforms.ts          # shape/metric/date coercions, sort/filters, etc.
│   ├── registry.ts            # optional: registries (renderers, viewers, strategies)
│   └── types.ts               # canonical types (or re-exported types)
├── index.ts                   # Barrel: public API for the <DomainName> domain
└── README.md                  # Authoring notes and how-to integrate
```

**Why this structure?**
- **components/**: small/medium UI primitives & organisms with minimal external knowledge.
- **sections/**: assemble components into reusable, drop-in sections. **One orchestrator** (e.g., `<DomainName>Section`) hides internal choices/variants.
- **templates/**: page-level layout scaffolds (Hub/Detail) so App Router pages stay thin.
- **lib/**: single source of truth for adapters, validators, transforms, types.
- **index.ts**: a clean, single import surface for the rest of the app.

---

## 2) Mental Model (Data → Adapter → Section → Template → Page)

```
External/Local Data ─▶ lib/adapters.ts (normalize, validate)
                      │
                      ▼
               sections/<DomainName>Section (orchestrator)
                      │
           ┌──────────┴───────────┐
           ▼                      ▼
   components/VariantA        components/VariantB
           ▼                      ▼
            ...                (more viewers)
                      │
                      ▼
            templates/*Template.tsx
                      │
                      ▼
                app/*/page.tsx (thin)
```

**Goal**: One clear section orchestrator that you can reuse everywhere (Hub, Detail/Category, Service pages) for a consistent UX.

---

## 3) Responsibilities & Authoring Rules

### A) `components/` — <DomainName> Component Module
- Keep **props strict and typed**; no data fetching.
- Co-locate CSS Modules and small utilities (hooks, portals) per component.
- Use `"use client"` only when necessary (browser APIs, stateful UI, portals).
- Examples per domain:
  - **Packages**: PackageCard, PackageGrid, AddOnsGrid
  - **Search**: SearchInput, ResultList, FiltersToolbar
  - **Pricing**: PriceTable, TierCard, ComparisonMatrix
  - **Tools**: ToolCard, ToolGrid, InstallSnippet
  - **Services & Capabilities**: CapabilityCard, CapabilityGrid
  - **FAQ**: Accordion, QuestionCard, CategoryFilter
  - **Testimonials**: TestimonialCard, Carousel
  - **CTA**: CTAHero, CTABanner
  - **Overview/Intro**: IntroHero, KeyStats, Highlights

### B) `sections/` — Page Sections
- Compose components into reusable sections.
- Define a **single orchestrator**: `<DomainName>Section`.
- Supported **variants** should be simple strings in props (e.g., `"grid" | "list" | "carousel" | "interactive"`).
- No fetching; receive normalized data via `lib/adapters.ts`.

### C) `templates/` — Page-Level Scaffolds
- Typical pairs: **Hub** (collection view) and **Detail/Category** (focused view).
- Accept already-prepared data and render `sections/*` in a consistent layout (hero, search/filter, content, CTA, etc.).
- Keep **App Router pages** thin by delegating layout & composition here.

### D) `lib/` — SSOT Utilities
- **adapters.ts**: map arbitrary inputs to strict section props; include `to<DomainName>SectionProps()` to normalize config blocks or raw arrays.
- **validators.ts**: zod schemas (or guards) for section/template inputs; throw or return safe defaults.
- **transforms.ts**: canonicalizers (metrics, currency/price formatting, slugs, dates, sorting/filtering).
- **types.ts**: domain types (e.g., `Package`, `SearchResult`, `PriceTier`, `Tool`, `FAQItem`, `Testimonial`, `CTAConfig`, `IntroStat`).
- **registry.ts** *(optional)*: map variant names → renderers/components.

### E) `index.ts` — Barrel (Public API)
Export the smallest set needed by consumers:
- `<DomainName>Section`
- `<DomainName>HubTemplate`, `<DomainName>DetailTemplate`
- `to<DomainName>SectionProps`, key types
- Any safe-to-reuse components (e.g., Card, Grid)

### F) `README.md`
Write the short “how-to” for contributors: structure, naming, integration steps, and examples.

---

## 4) Conventions

- **Aliases** (final state):
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/<domain>/*": ["src/<domain>/*"],
        "@/<domain>": ["src/<domain>/index.ts"]
      }
    }
  }
  ```
- **Naming**: Directories in `kebab-case`; components in `PascalCase`; keep file names matching exported components.
- **Client boundaries**: Use `"use client"` only for interactive UI.
- **No fetching** in components/sections; fetch in pages or server utilities, then adapt.

---

## 5) API Cheatsheet (Template)

### `lib/adapters.ts`
```ts
export type <DomainName>Variant = "grid" | "list" | "carousel" | "interactive"; // edit per domain

export function to<DomainName>SectionProps(input: any): {
  variant: <DomainName>Variant;
  title?: string;
  subtitle?: string;
  items: any[];         // replace with domain type, e.g., Package[]
  // optional domain-specific knobs, e.g. currency, filters, sort
} | null;
```

### `sections/<DomainName>Section/<DomainName>Section.tsx`
- **Props**: `{ items: <Type>[]; variant: <DomainName>Variant; title?; subtitle?; ... }`
- **Behavior**: switch on `variant` and render the right component(s).

### `templates/*Template.tsx`
- **HubTemplate**: collection, search, filters, overview, CTA.
- **DetailTemplate** (or Category/Result): focused content + related items.

---

## 6) App Router Integration Examples

### A) Hub Page
```tsx
// app/<domain>/page.tsx
import { <DomainName>HubTemplate } from "@/<domain>";
import { get<DomainName>Featured, get<DomainName>Filters } from "@/data/<domain>";

export default async function <DomainName>HubPage() {
  const [featured, filters] = await Promise.all([
    get<DomainName>Featured(),
    get<DomainName>Filters()
  ]);

  return (
    <<DomainName>HubTemplate
      featured={featured}
      filters={filters}
    />
  );
}
```

### B) Detail/Category Page
```tsx
// app/<domain>/[slug]/page.tsx
import { <DomainName>DetailTemplate } from "@/<domain>";
import { get<DomainName>BySlug, getRelated<DomainName> } from "@/data/<domain>";

export default async function <DomainName>DetailPage({ params }: { params: Promise<{ slug: string }>} ) {
  const { slug } = await params;
  const [item, related] = await Promise.all([
    get<DomainName>BySlug(slug),
    getRelated<DomainName>(slug)
  ]);

  return (
    <<DomainName>DetailTemplate item={item} related={related} />
  );
}
```

### C) Using the Section in Other Pages (e.g., Services)
```tsx
// inside a ServiceTemplate render block
import { to<DomainName>SectionProps, <DomainName>Section } from "@/<domain>";

const block = to<DomainName>SectionProps(data.<domain>);
{block && (
  <<DomainName>Section variant={block.variant} items={block.items} title={block.title} />
)}
```

---

## 7) Authoring Checklist (Copy for Each New Domain)

- [ ] Create `/src/<domain>` with **components/**, **sections/**, **templates/**, **lib/**, `index.ts`, `README.md`.
- [ ] Implement `<DomainName>Section` as the orchestrator.
- [ ] Add `to<DomainName>SectionProps()` in `lib/adapters.ts` for tolerant inputs.
- [ ] Add/confirm `@/<domain>` alias in `tsconfig.json`.
- [ ] Keep pages thin; delegate layout to templates.
- [ ] Add minimal zod validators (optional but recommended).
- [ ] Provide example data mappers and transforms (currency/metrics/filters) in `lib/`.
- [ ] Document variants and when to use them in `README.md`.

---

## 8) README.md Starter (Paste & Fill)

```md
# <DomainName> Module

## Structure
- `components/`: UI building blocks (cards, lists, viewers)
- `sections/`: Reusable sections (incl. `<DomainName>Section` orchestrator)
- `templates/`: Page-level scaffolds (Hub, Detail/Category)
- `lib/`: adapters, validators, transforms, registry, types
- `index.ts`: public API exports

## How to use
- In pages: `import { <DomainName>HubTemplate } from "@/<domain>"`
- In services: `import { to<DomainName>SectionProps, <DomainName>Section } from "@/<domain>"`

## Variants
- Declare simple variant strings (e.g., `grid | list | carousel | interactive`).
- Map variants to components in the section orchestrator.

## Notes
- Fetch in pages/route-handlers; adapt via `lib/adapters.ts`.
- Validate inputs (`lib/validators.ts`) and coerce shapes (`lib/transforms.ts`).
- Keep client-only logic inside components marked with `"use client"`.
```

---

## 9) Domain-Specific Hints (Examples)

- **Packages**: transforms for price formatting, currency, tier sorting.
- **Search**: adapters for query params → filters; result-ranking transform.
- **Pricing**: comparison-table transforms; feature-flag gating.
- **Tools**: install snippet generators; platform capability registry.
- **Services & Capabilities**: taxonomy types; capability-to-offer mapping.
- **FAQ**: category grouping and order; search index mapping.
- **Testimonials**: sentiment/industry tagging; carousel chunking.
- **CTA**: variant registry (banner/inline/modal); A/B test hooks.
- **Overview/Intro**: highlight metrics normalizer; hero copy variants.

---

## 10) Copy Template Quickly (Search/Replace)
- Replace `<DomainName>` with your domain’s Name (e.g., `Packages`).
- Replace `<domain>` with the folder/alias (e.g., `packages`).
- Adjust `variants`, `types`, and `transforms` to match the new domain.

