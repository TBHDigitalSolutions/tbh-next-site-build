Portfolio App Router Refactor Plan
Official Title: Portfolio App Router Refactor Plan
Domain: Portfolio
File Name: portfolio-app-router-refactor_Plan_2025-09-14.md
Main Part: portfolio-app-router-refactor
Qualifier: Plan
Date: 2025-09-14

Spotlight Comments:
Outlines a structured migration from app-level orchestration to Source Portfolio templates for Hub and Category pages.
Emphasizes clear data and type contracts using façades and adapters to ensure maintainability.
Includes terminal commands and a checklist for incremental implementation.

Summary:
The Portfolio App Router Refactor Plan provides a detailed strategy for refactoring the portfolio domain’s App Router pages (/app/portfolio/*) to leverage Source Portfolio templates (PortfolioHubTemplate, PortfolioCategoryTemplate) and eliminate app-level orchestration. It addresses current issues such as duplicated logic, app-local CSS, and heavy page-level composition by moving layout responsibilities to templates, enforcing strict data contracts via façades (getFeaturedByCategory, getCategoryBundle) and adapters (adaptSectionsForHub, adaptCategoryPageData), and ensuring SSR-safe analytics and accessibility. The plan includes minimal page code examples, terminal commands for file updates, and a checklist to guide the migration process.
This document is intended for developers to streamline the portfolio domain’s architecture, reducing technical debt and ensuring consistency with production standards. It provides actionable steps to replace client components (HubSectionsClient, CategoryPageClient), clean up unused CSS, and enforce import boundaries, making the App Router pages thin and focused while maintaining visual and functional parity with the existing application.

---

Awesome—here’s a focused, production-ready refactor plan for the **App Router portfolio pages** that (1) hardens them, (2) replaces app-level orchestration with your Source Portfolio templates/sections, and (3) locks the data+type contracts between **`/app/portfolio/*`** and **`/src/portfolio/*`**.

---

# What you have today (quick read)

* **Hub page** renders a local **`HubSectionsClient`** that selects variant-specific components (Standard, Video, Interactive) and does its own analytics and metric normalization. This logic lives in the app layer.&#x20;
* The hub/category **CSS modules** are app-local and tightly coupled to those client components. &#x20;
* **Category page** also ships a local **`CategoryPageClient`** with duplicated helpers (normalize/sanitize video metrics), tabbed tools UI, and on-page analytics. &#x20;
* App pages do the data plumbing and layout themselves (hero, search, sections, CTA), rather than delegating layout to **Source Portfolio templates**. &#x20;

---

# Refactor goals

1. **Move layout/orchestration out of `/app`** → use **`/src/portfolio/templates`** (`PortfolioHubTemplate`, `PortfolioCategoryTemplate`) so the app pages are thin and stable.
2. **Enforce contracts** at the template boundary using the **types you already added** (`HubSection`, `PortfolioHubTemplateProps`, `PortfolioCategoryTemplateProps`) and **lib adapters** (`adaptSectionsForHub`, `adaptCategoryPageData`).
3. **Stop utility duplication in app**: use `/src/portfolio/lib/{validators,adapters,registry,metrics}`; leave component-specific validators in each component’s `utils/`.
4. **SSR-safe analytics & a11y**: keep client-only analytics inside components/sections; templates accept `analyticsContext` and booleans without touching `window`.

---

# Production refactor plan (by file)

## 1) `/app/portfolio/page.tsx` (Hub)

### Problems observed

* Page fully composes hero/search/overview/sections/cta, and relies on **`HubSectionsClient`** to pick viewers, normalize metrics, track events. That orchestration belongs in the **Source Portfolio** domain.&#x20;
* Styling relies on app-local CSS modules (fine), but you already have production CSS in the **Hub Template**.&#x20;

### Fix

* Replace the in-page composition with a **single** `<PortfolioHubTemplate />` call.
* Build `sections` via **data facade** + **`adaptSectionsForHub`** from `/src/portfolio/lib/adapters`.

**Minimal page:**

```tsx
// /app/portfolio/page.tsx
import { PortfolioHubTemplate } from "@/portfolio/templates";
import { adaptSectionsForHub } from "@/portfolio/lib/adapters";
import { getFeaturedByCategory } from "@/data/portfolio";

export default async function PortfolioHubPage() {
  const raw = await getFeaturedByCategory();
  const sections = adaptSectionsForHub(raw);
  return (
    <PortfolioHubTemplate
      sections={sections}
      meta={{ title: "Portfolio", subtitle: "Real results across services", heroButton: { text:"Start Your Project", href:"/contact" } }}
      features={{ showSearch: true, showOverview: true, showCTA: true }}
      analytics={{ context: "portfolio_hub", trackSectionViews: true }}
    />
  );
}
```

**Action items**

* Remove import/use of **`HubSectionsClient`** and its app-local helpers.&#x20;
* Keep or delete `HubSections.module.css` and `portfolio.module.css` only if something else still uses them; the template brings its own CSS module. &#x20;

---

## 2) `/app/portfolio/[category]/page.tsx` (Category)

### Problems observed

* The page renders hero/search + passes to **`CategoryPageClient`**, which duplicates hub logic (normalize/sanitize, tracking), and carries a large UI surface in app. &#x20;

### Fix

* Replace composition with a single **`<PortfolioCategoryTemplate />`** call.
* Use your data facade to assemble the payload; normalize via **`adaptCategoryPageData`**.

**Minimal page:**

```tsx
// /app/portfolio/[category]/page.tsx
import { notFound } from "next/navigation";
import { PortfolioCategoryTemplate } from "@/portfolio/templates";
import { CATEGORY_SLUGS, CATEGORY_COMPONENTS, type CategorySlug } from "@/portfolio/lib/types";
import { getCategoryBundle } from "@/data/portfolio";
import { adaptCategoryPageData } from "@/portfolio/lib/adapters";

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }));
}

export default async function PortfolioCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cs = category as CategorySlug;
  if (!CATEGORY_SLUGS.includes(cs)) return notFound();

  const raw = await getCategoryBundle(cs);
  const data = adaptCategoryPageData(raw);

  return (
    <PortfolioCategoryTemplate
      category={cs}
      title={CATEGORY_COMPONENTS[cs].label}
      subtitle={raw.subtitle ?? `Professional ${CATEGORY_COMPONENTS[cs].label.toLowerCase()} with proven results.`}
      data={data}
      layout={{ showTools: true, showCaseStudies: true, showPackages: true }}
      analytics={{ context: `portfolio_category_${cs}`, trackItemViews: true }}
    />
  );
}
```

**Action items**

* Retire **`CategoryPageClient.tsx`** and its CSS if unused after migration. &#x20;
* Keep page metadata (`generateStaticParams/Metadata`) as is—only the **render** path changes. &#x20;

---

# App ↔ Source Portfolio contract (what “correct” looks like)

**At the page boundary, pass only Template props**:

* **Hub**: `PortfolioHubTemplateProps` — `{ sections, meta?, features?, analytics? }`
  `sections` is an array of `HubSection { slug, label, variant, viewAllHref, items, subtitle?, priority? }`.
  (Variants: `"gallery" | "video" | "interactive"`)

* **Category**: `PortfolioCategoryTemplateProps` — `{ category, title, subtitle, data, layout?, analytics? }`
  `data` comes from your facade and is normalized by `adaptCategoryPageData()`.

**Where logic lives**

* **Data fetching/assembly**: pages call `/src/data/portfolio` façade only.
* **Normalization**: `/src/portfolio/lib/adapters.ts` (shared)
* **Domain types/validators/registry/metrics**: `/src/portfolio/lib/*` (shared)
* **UI-specific validation**: in each component/section’s `utils/*Validator.ts` (local; no overlap with lib)

**Why this prevents overlap**

* **Rule**: if you’re validating a **domain primitive** (e.g., `Project`), use **`lib/validators.ts`**.
  If you’re validating a **component prop shape**, keep it **next to the component** (e.g., `components/StandardPortfolioGallery/utils/portfolioGalleryValidator.ts`).
  This keeps primitives reusable and UI rules local—no cross-imports from components into `lib`.

---

# Incremental migration checklist

**Hub**

* [ ] Replace app composition with `<PortfolioHubTemplate />`.&#x20;
* [ ] Switch to facade + `adaptSectionsForHub()` to build `sections`.
* [ ] Remove/inline `HubSectionsClient` & helpers (metrics normalization & tracking move down into components/sections).&#x20;
* [ ] Delete `HubSections.module.css` if no longer used.&#x20;

**Category**

* [ ] Replace app composition with `<PortfolioCategoryTemplate />`.&#x20;
* [ ] Use `getCategoryBundle()` + `adaptCategoryPageData()` to build `data`.
* [ ] Retire `CategoryPageClient.tsx` and its CSS if unused post-migration. &#x20;

**Shared**

* [ ] Ensure **no app code** imports `components/` directly—only **`@/portfolio/templates`**.
* [ ] Keep analytics at component/section level; templates only pass contexts/flags.
* [ ] Confirm `lib/registry.ts` is the **only** variant→viewer map used by `PortfolioSection`.

---

# Terminal commands (local; no Git, no aliases work required)

> Adjust the project root prefix if you’re not running from repo root.

**(A) Backup app-level clients (optional)**

```bash
mkdir -p _backup/app-portfolio
mv app/portfolio/HubSectionsClient.tsx _backup/app-portfolio/ 2>/dev/null || true
mv app/portfolio/[category]/CategoryPageClient.tsx _backup/app-portfolio/ 2>/dev/null || true
mv app/portfolio/[category]/CategoryPageClient.module.css _backup/app-portfolio/ 2>/dev/null || true
```

**(B) Replace hub page render with template**

```bash
# create a fresh page using the minimal example above:
cat > app/portfolio/page.tsx <<'EOF'
<PASTE THE MINIMAL HUB PAGE FROM THIS PLAN>
EOF
```

**(C) Replace category page render with template**

```bash
cat > app/portfolio/[category]/page.tsx <<'EOF'
<PASTE THE MINIMAL CATEGORY PAGE FROM THIS PLAN>
EOF
```

**(D) Clean up unused CSS (only if no longer referenced)**

```bash
rm -f app/portfolio/HubSections.module.css
rm -f app/portfolio/portfolio.module.css
```

> If you still need some classes, keep them; otherwise, your template CSS modules already cover production styles.

---

# Final: hooking up `/src/data/portfolio` at page level

* Expose a **façade** with two functions:

  * `getFeaturedByCategory(): Promise<RawSection[]>`
  * `getCategoryBundle(slug: CategorySlug): Promise<RawCategoryData>`
* In **Hub page**:
  `const sections = adaptSectionsForHub(await getFeaturedByCategory())` → pass to `<PortfolioHubTemplate />`.
* In **Category page**:
  `const data = adaptCategoryPageData(await getCategoryBundle(slug))` → pass to `<PortfolioCategoryTemplate />`.

This gives you a single, consistent **portfolio section** across pages, with a clear boundary:

**App Router (pages) → Templates (layout) → Sections (orchestration) → Components (renderers)**

If you want, I can also generate a tiny ESLint rule set to prevent forbidden import directions (e.g., components importing templates) so these contracts stay locked in.
