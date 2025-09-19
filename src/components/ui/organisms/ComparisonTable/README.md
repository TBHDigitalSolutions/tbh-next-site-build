All set! Here are the two production-ready files.

---

### `src/components/ui/organisms/ComparisonTable/index.ts`

```ts
// Public barrel for ComparisonTable
// Keeps a clean import surface and stable API for pages & adapters.

export { default as ComparisonTable } from "./ComparisonTable";

// Component-level contract (the TSX imports from here too)
export type {
  ComparisonColumn,
  ComparisonCell,
  ComparisonRow,
  ComparisonTableProps,
  // Service-page integration shapes
  ComparisonTier,
  FlatComparisonRow,
  GroupedComparisonFeature,
  AnyComparisonInput,
  ComparisonInput,
  ComparisonSection,
  WebDevComparisonSection,
  VideoComparisonSection,
  LeadGenComparisonSection,
  MarketingAutomationComparisonSection,
  SEOServicesComparisonSection,
  ContentProductionComparisonSection,
  // Legacy & advanced
  LegacyComparisonData,
  ComparisonTablePropsWithLegacy,
  ComparisonTransformer,
  ComparisonValidator,
  ComparisonThemeConfig,
  ComparisonBehaviorConfig,
  AdvancedComparisonSection,
  FeatureMatrix,
  TierConfig,
  FeatureConfig,
} from "./ComparisonTable.types";

// Optional: re-export adapters/helpers so pages can normalize data
export * from "./adapters";

// Optional: validation utilities (Zod or custom)
export * from "./utils/comparisonTableValidator";
```

---

### `src/components/ui/organisms/ComparisonTable/README.md`

````md
# ComparisonTable

A token-driven, responsive, a11y-friendly comparison engine for service pages.  
It renders a feature grid with tier columns on desktop and a stacked list on mobile, using the **unified TBH theme tokens** for consistent styling. The component’s styles and behavior are aligned with `unified-theme.css` and the Services Unified Module CSS. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

---

## ✨ Features

- **Adapter-friendly API** — pass rows/columns or normalize from your own data.
- **Mobile-first UX** — desktop table + mobile stacked list out of the box. :contentReference[oaicite:2]{index=2}
- **A11y-minded** — sticky headers, ARIA labels for cells, and a boolean legend. :contentReference[oaicite:3]{index=3}
- **Theme tokens** — colors, spacing, radii, shadows pulled from the unified theme. :contentReference[oaicite:4]{index=4}

---

## Install & Import

```ts
import { ComparisonTable } from "@/components/ui/organisms/ComparisonTable";
````

If you need types or helpers:

```ts
import type { ComparisonTableProps, ComparisonColumn, ComparisonRow } from "@/components/ui/organisms/ComparisonTable";
```

---

## Props (Component Contract)

```ts
type ComparisonTableProps = {
  columns: ComparisonColumn[]; // ordered
  rows: ComparisonRow[];       // flat list; groups inferred via row.group

  title?: string;
  subtitle?: string;
  stickyHeader?: boolean; // default true
  dense?: boolean;        // compact row height
  showLegends?: boolean;  // show ✓/— legend when any booleans exist (default true)
  className?: string;
};
```

The component renders boolean values as **✓ / —**, strings/numbers verbatim, and `null|undefined` as an em-dash. See the table rendering + mobile list in the TSX.&#x20;

---

## Styling

This component is fully styled via `ComparisonTable.module.css`, which relies on your **unified theme tokens** (colors, spacing, radii, shadows, z-index). Key class hooks you might reference:

* `.wrapper`, `.header`, `.title`, `.subtitle`
* `.group`, `.groupTitle`
* `.tableScroll`, `.table`, `.sticky`
* `.featureCol`, `.tierCol`, `.tierHeadCell`, `.tierName`, `.badge`
* `.featureName`, `.help`, `.footnote`
* `.valueCell`, `.yes`, `.no`, `.highlightCol`
* `.legend`, `.legendItem`, `.dense`
* Mobile: `.mobileList`, `.mobileFeature`, `.mobileTier`, `.mobileValue` …

The module uses tokens like `--bg-surface`, `--text-accent`, `--spacing-*`, `--radius-*`, and `--shadow-*` from the unified theme. &#x20;

---

## Service-Page Integration (Recommended Pattern)

Your service data can be authored in a **tiers + features** shape, then adapted to the component’s `columns/rows`:

```ts
import type {
  ComparisonTier,
  AnyComparisonInput,
  ComparisonTableProps
} from "@/components/ui/organisms/ComparisonTable";
import { toColumnsAndRows } from "@/components/ui/organisms/ComparisonTable/adapters"; // example adapter

const tiers: ComparisonTier[] = [
  { id: "starter", name: "Starter" },
  { id: "pro",     name: "Pro", badge: "Popular" },
  { id: "ent",     name: "Enterprise" },
];

const features: AnyComparisonInput = [
  { label: "Design system", values: { starter: "Lite", pro: "Pro", ent: "Tailored" } },
  {
    category: "DevOps",
    features: [
      { name: "CI/CD", plans: { starter: true, pro: true, ent: true } },
      { name: "Preview envs", plans: { starter: false, pro: true, ent: true } },
    ],
  },
];

const { columns, rows } = toColumnsAndRows({ tiers, features }); // normalize

export const comparisonProps: ComparisonTableProps = {
  title: "What’s included",
  columns,
  rows,
  stickyHeader: true,
  showLegends: true,
};
```

> The default CSS already supports **sticky headers**, zebra striping, highlighted columns, and a **mobile stacked list**.&#x20;

---

## Accessibility

* Cells include ARIA labels that announce `column – row: value` (e.g., “Pro – CI/CD: ✓”).
* The boolean legend (“✓ Included / — Not included”) helps communicate iconography.
* Headings and groups are semantic (`<thead>`, `scope="row"`, section headings).&#x20;

---

## Theming

* The module uses tokens defined in the unified theme files (`unified-theme.css` and the Services Unified Module).
* If you need to tweak spacing or colors, override the CSS variables at a page or layout level; the component will pick them up. &#x20;

---

## File References

* **Component**: `ComparisonTable.tsx` (structure, rendering, a11y).&#x20;
* **Styles**: `ComparisonTable.module.css` (tokens, responsive layout, legend, dense mode).&#x20;
* **Theme tokens**: `unified-theme.css` and Services Unified Module CSS. &#x20;

---

## Migration Tips

* If legacy data exports `comparisonData`, `featureMatrix`, or `packages`, use the provided types and adapters to normalize to `columns/rows` before rendering.
* Avoid redefining component types in the TSX; import from `ComparisonTable.types.ts` to keep a single source of truth.

---

## License

Internal TBH component library — use within TBH projects.

```

If you want, I can also add a tiny `toColumnsAndRows` example adapter into `adapters.ts` to match these docs.
```
