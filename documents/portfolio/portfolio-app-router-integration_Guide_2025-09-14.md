Portfolio App Router Integration Guide
Official Title: Guide for Integrating App Router with Source Portfolio Module
Domain: Portfolio
File Name: portfolio-app-router-integration_Guide_2025-09-14.md
Main Part: portfolio-app-router-integration
Qualifier: Guide
Date: 2025-09-14

Spotlight Comments:
Provides a clear framework for integrating App Router with Source Portfolio, ensuring modular and maintainable code.
Includes code examples for Hub and Category pages, data façade, and strict rules for domain vs. UI logic separation.
Reinforces prior refactor documentation with consistent focus on templates, adapters, and import boundaries.

Summary:
The Guide for Integrating App Router with Source Portfolio Module outlines a structured approach to connect the App Router (/app/portfolio/*) with the Source Portfolio module (/src/portfolio/*), emphasizing a clean, scalable architecture. It details how to implement thin App Router pages that fetch data through a façade (/src/data/portfolio), normalize it using domain adapters (adaptSectionsForHub, adaptCategoryPageData), and render templates (PortfolioHubTemplate, PortfolioCategoryTemplate). The guide enforces strict dependency rules, separating shared domain logic in /src/portfolio/lib from UI-specific logic in component and section folders, with clear guidelines for validators, adapters, and registries.
This document is a practical tool for developers, providing code snippets for page implementations, a data façade example, a verification checklist, and optional ESLint rules to enforce import boundaries. It ensures the portfolio domain aligns with production standards, facilitating a seamless transition to a template-based architecture while maintaining functional and visual consistency with the existing application.

---

Here’s a practical guide to wire the **App Router** to your **Source Portfolio** module cleanly—plus rules to keep **`/src/portfolio/lib`** distinct from per-component/section validators & adapters. At the end you’ll see how the **`/src/data/portfolio`** layer plugs into pages and templates.

---

# 1) App Router ↔ Source Portfolio: the contract

## 1.1 Directory roles (quick mental model)

* **App Router (`/app/portfolio` …)**
  Thin pages that fetch/assemble data and **compose** templates/sections from the **Source Portfolio** module. No UI logic here beyond routing.

* **Source Portfolio (`/src/portfolio`)**
  The reusable domain package:

  * `templates/` – page-level scaffolds (Hub, Category).
  * `sections/` – reusable page sections (incl. `PortfolioSection` orchestrator).
  * `components/` – building blocks (galleries, modals, viewers).
  * `lib/` – domain SSOT (adapters, validators, registry, metrics, types).
  * `index.ts` + `templates/index.ts` – public barrels.

> **Dependency direction (always one way):**
> **App Router → `src/portfolio/templates` → `sections` → `components` → `lib`**
> No imports back “up” the graph.

## 1.2 Pathing (imports that pages should use)

Set (and keep) these path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/portfolio/*": ["src/portfolio/*"],
      "@/portfolio": ["src/portfolio/index.ts"],
      "@/data/*": ["src/data/*"]
    }
  }
}
```

Then in pages:

* Hub page (`/app/portfolio/page.tsx`) imports:

  ```ts
  import { PortfolioHubTemplate } from "@/portfolio/templates";
  ```
* Category page (`/app/portfolio/[category]/page.tsx`) imports:

  ```ts
  import { PortfolioCategoryTemplate } from "@/portfolio/templates";
  ```

**Do not** import from deep internal files (e.g., `../../sections/PortfolioSection/PortfolioSection.tsx`) in the App Router; rely on the template barrel.

---

# 2) Make App Router use the Source Portfolio templates

## 2.1 Hub page (`/app/portfolio/page.tsx`)

**Goal:** fetch or assemble the Hub sections (featured items per category), adapt them, and render the **Hub Template**. Use your domain adapters to keep the page thin.

```tsx
// /app/portfolio/page.tsx
import { PortfolioHubTemplate } from "@/portfolio/templates";
import { adaptSectionsForHub } from "@/portfolio/lib/adapters";
import { getFeaturedByCategory } from "@/data/portfolio"; // example facade you expose

export default async function PortfolioHubPage() {
  // 1) Gather raw data (from src/data/portfolio/*)
  const rawSections = await getFeaturedByCategory();

  // 2) Normalize to HubTemplate contract
  const sections = adaptSectionsForHub(rawSections);

  // 3) Render template
  return (
    <PortfolioHubTemplate
      sections={sections}
      meta={{
        title: "Portfolio",
        subtitle:
          "Real results across web, video, SEO, content, lead gen, and automation.",
        heroButton: { text: "Start Your Project", href: "/contact" },
      }}
      features={{ showSearch: true, showOverview: true, showCTA: true }}
      analytics={{ context: "portfolio_hub", trackSectionViews: true }}
    />
  );
}
```

> If you still have `HubSectionsClient.tsx` in the app folder, retire it. The **template** orchestrates sections using the **`PortfolioSection`** orchestrator under the hood.

## 2.2 Category page (`/app/portfolio/[category]/page.tsx`)

**Goal:** normalize category data and pass into **Category Template**.

```tsx
// /app/portfolio/[category]/page.tsx
import { PortfolioCategoryTemplate } from "@/portfolio/templates";
import { adaptCategoryPageData } from "@/portfolio/lib/adapters";
import { getCategoryBundle } from "@/data/portfolio"; // you implement; pulls items, tools, metrics, etc.

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // 1) Fetch raw domain payload for this category
  const raw = await getCategoryBundle(category);

  // 2) Normalize to CategoryTemplate contract
  const data = adaptCategoryPageData(raw);

  // 3) Render template
  return (
    <PortfolioCategoryTemplate
      category={category as any} // cast to CategorySlug if your types enumerate it
      title={raw.title ?? "Category"}
      subtitle={raw.subtitle ?? "Selected work in this category."}
      data={data}
      layout={{ showTools: true, showCaseStudies: true, showPackages: true }}
      analytics={{ context: `portfolio_category_${category}`, trackItemViews: true }}
    />
  );
}
```

---

# 3) SSOT rules for `/src/portfolio/lib` vs per-component/section utils

You already have **both**:

* **Domain SSOT**: `/src/portfolio/lib/{adapters,validators,metrics,registry,types}.ts`
* **Local component/section utils**: e.g.,
  `/src/portfolio/components/StandardPortfolioGallery/utils/portfolioGalleryValidator.ts`
  `/src/portfolio/sections/PortfolioSection/utils/portfolioSectionValidator.ts`

## 3.1 What belongs in **`/src/portfolio/lib`** (shared SSOT)

Put in `lib/` only things that:

* Are **domain-level** contracts or logic used by *multiple* sections/components:

  * **Types**: `Project`, `CategorySlug`, `PortfolioVariant`, etc.
  * **Registry**: e.g., variant → viewer registry used by `PortfolioSection`.
  * **Validators**: schemas for **domain primitives** (e.g., `ProjectSchema`).
  * **Adapters**: domain-level adapters used at pages/templates to convert raw data to section/template props (e.g., `adaptSectionsForHub`, `adaptCategoryPageData`, `toPortfolioSectionProps`).
  * **Metrics/transforms**: currency/number formatting, sorting, stable keys.

**Never** reference a specific UI implementation from `lib/`—no imports from `components/` or `sections/`.

## 3.2 What belongs in **local** component/section folders

Put in the component/section directory **only** validators/adapters that are **specific to that UI**:

* **Component validator**
  e.g., `components/StandardPortfolioGallery/utils/portfolioGalleryValidator.ts`
  *Purpose:* Validate props unique to that component (card size modes, max rows, animation flags).
  *May import:* `lib/types` or domain primitives, **but not** other components.

* **Section validator / adapter**
  e.g., `sections/PortfolioSection/utils/portfolioSectionValidator.ts` or `sections/.../adapters.ts`
  *Purpose:* Normalize a flexible *section block* configuration into concrete section props (e.g., variant fallback, limits).
  *May import:* `lib/types`, `lib/validators` (domain primitives), **not** component internals.

## 3.3 Naming & import boundaries (to prevent overlap)

* **Domain primitives:**
  In `lib/validators.ts` export **primitive** schemas like `ProjectSchema`, `CategorySlugSchema`.
  Consumer rule: if you’re validating “a project object,” use **lib**. If you’re validating “props for a specific UI,” use the **local** validator.

* **Adapters naming:**

  * **Domain adapters** (in `lib/adapters.ts`): `toPortfolioSectionProps`, `adaptSectionsForHub`, `adaptCategoryPageData`.
  * **Local adapters** (inside a section/component folder): `toStandardGalleryProps`, `toStatsSectionProps`.
    This naming makes import location obvious during code review.

* **Enforce with ESLint (optional but recommended):**

  * Block **upward imports** from components → templates:

    ```js
    // .eslintrc.js
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/portfolio/templates/*", // disallow importing templates
            "../*", // forbid traversing up outside the component/section without alias
          ],
        },
      ],
    }
    ```
  * Allow `@/portfolio/lib/*` and `@/portfolio/sections/*` inside templates.

* **Registry scoping:**

  * Keep **domain registry** in `lib/registry.ts` for *public* variant-to-viewer mapping that `PortfolioSection` uses.
  * If a component needs an **internal registry** (e.g., media viewer registry), keep it **inside that component folder** (you already do this in `components/mediaViewers/registry.ts`). Don’t export internal registries from `lib/`.

---

# 4) Verification checklist (before shipping)

* **Build graph sanity**

  * [ ] App pages import **only** from `@/portfolio/templates` (and `@/data/portfolio`).
  * [ ] Templates import from `@/portfolio/sections` and `@/portfolio/lib` (never from app).
  * [ ] Sections import from `@/portfolio/components` and `@/portfolio/lib`.
  * [ ] Components import only from `@/portfolio/lib` (not from sections/templates).

* **Validator lines**

  * [ ] Validating **domain primitives** (Project, Category) → use **`lib/validators`**.
  * [ ] Validating **component/section props** → use **local** validators in that folder.

* **Adapters**

  * [ ] Adapting **page data → template props** → **`lib/adapters`**.
  * [ ] Adapting **config → section props** in a **section** → local `adapters.ts`.
  * [ ] Adapting **loose → component props** in a **component** → local `adapters.ts`.

* **Registry**

  * [ ] Variant → viewer mapping lives in **`lib/registry.ts`** and is consumed by `PortfolioSection`.
  * [ ] Any special sub-registries (like media viewers) stay inside their component folder.

---

# 5) Putting the data layer to work (`/src/data/portfolio`)

You already have a solid data area:

```
/src/data/portfolio
  _types/ _utils/ _validators/
  <category>/*-featured.ts
  <category>/*-items.ts
  items/*.ts
  index.ts, metrics.ts, toolRegistry.tsx, types.ts, validation.ts
```

## 5.1 Add a thin façade API for pages

Create a small **facade** that aggregates & normalizes for pages—so App Router never touches raw files:

```ts
// /src/data/portfolio/index.ts (facade)
import * as seo from "./seo-services/seo-services-featured";
import * as video from "./video-production/video-production-featured";
// … import other categories
import { mapVariantToSection } from "@/portfolio/lib/adapters"; // domain mapping

export async function getFeaturedByCategory() {
  // shape the hub sections
  return [
    {
      slug: "seo-services",
      label: "SEO Services",
      variant: mapVariantToSection("web"),  // or whatever mapping you use
      viewAllHref: "/portfolio/seo-services",
      items: (await seo.items()).slice(0, 6),
      subtitle: "Rank higher and convert better.",
      priority: 10,
    },
    {
      slug: "video-production",
      label: "Video Production",
      variant: mapVariantToSection("video"),
      viewAllHref: "/portfolio/video-production",
      items: (await video.items()).slice(0, 6),
      subtitle: "Shorts, brand films, demos.",
      priority: 20,
    },
    // …
  ];
}

export async function getCategoryBundle(slug: string) {
  // Return a payload with items, tools, packages, metrics, etc.
  // Compose from your existing files in /src/data/portfolio/*
  // The page will pass this to adaptCategoryPageData()
  return {
    title: "SEO Services",
    subtitle: "Proven SEO case studies & wins.",
    items: await (await import(`./seo-services/seo-services-items`)).items(),
    tools: await (await import("./categoryTools")).tools("seo-services"),
    recommendedPackages: [],
    metrics: { totalProjects: 24, successRate: "92%" },
    // …
  };
}
```

> This keeps **pages tiny** and moves structural knowledge into a single, testable façade.

## 5.2 Pass data into templates (final hop)

* In **Hub page**, call `getFeaturedByCategory()`, then `adaptSectionsForHub()` and render `PortfolioHubTemplate`.
* In **Category page**, call `getCategoryBundle(slug)`, then `adaptCategoryPageData()` and render `PortfolioCategoryTemplate`.

**No component should import from `/src/data/portfolio` directly**—only pages (or server loaders) should.

---

# 6) Quick migration notes (nice to have)

* Retire **`HubSectionsClient.tsx`** in `/app/portfolio`. The **Hub Template** + **`PortfolioSection`** already do this orchestration.
* Ensure **all inline styles** in templates are moved into the corresponding CSS Modules you created.
* Keep your **dev-time guards** (or add zod validators later) inside template/section folders, but **prefer `lib/validators`** for domain primitives.

---

## TL;DR flow

1. **Page** fetches from **`/src/data/portfolio` façade** →
2. **`lib/adapters`** normalize to template/section props →
3. **Templates** compose **Sections** →
4. **Sections** orchestrate **Components** using **`lib/registry`** →
5. **Components** validate their own **local** prop rules; for **domain primitives**, use **`lib/validators`**.

If you want, I can generate a tiny ESLint config snippet and a set of `import/no-restricted-paths` rules tailored to your exact folders to “lock in” these boundaries.
