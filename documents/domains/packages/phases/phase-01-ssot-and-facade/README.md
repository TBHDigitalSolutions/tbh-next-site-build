Awesome — here are **production-ready docs** for **Phase 01 — SSOT Hardening & Façade**.
They’re drop-in files for:

```
documents/domains/packages/phases/phase-01-ssot-and-facade/
├─ _generated/index.json
├─ README.md
├─ phase-01-ssot-and-facade_Checklist_2025-09-22.md
└─ phase-01-ssot-and-facade_Playbook_2025-09-22.md
```

> Copy each file exactly. If a target file already exists in your repo, merge carefully.

---

## 1) `README.md`

```md
**Official Title:** Phase 01 — SSOT Hardening & Façade  
**Domain:** packages  
**File Name:** phase-01-ssot-and-facade_Readme_2025-09-22.md  
**Main Part:** phase-01-ssot-and-facade  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Make typed authoring the single source of truth (SSOT).  
- Expose a single read API via `@/data/packages` for pages/templates.  
- Normalize price dialects, IDs/slugs, and references.

**Summary:**  
Phase 01 finalizes the **typed authoring model** (packages, add-ons, bundles) under `src/data/packages/**`, enforces **price normalization** (`setup` → `oneTime`), and creates a **façade** (`src/data/packages/index.ts`) that pages/templates must use. It ensures **unique IDs/slugs** and **resolvable references** so later phases (content/MDX, build pipeline, pages) can rely on stable data contracts.
```

---

## 2) `phase-01-ssot-and-facade_Checklist_2025-09-22.md`

```md
**Official Title:** Phase 01 — SSOT Hardening & Façade (Checklist)  
**Domain:** packages  
**File Name:** phase-01-ssot-and-facade_Checklist_2025-09-22.md  
**Main Part:** phase-01-ssot-and-facade  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Pin these rules in Codex.  
- Pages/templates must read exclusively via the façade.

**Summary:**  
Tight, operational list to land a consistent SSOT and façade so the app has one stable data API.

---

## Working rules
- Work only on `feat/packages-refactor`. Use **npm**. Node **20**.  
- **No runtime MD/MDX parsing**.  
- Data flows through `@/data/packages` façade; **no deep reads** from pages/templates.  
- Generated artifacts live in `src/data/packages/__generated__/` (gitignored).

## Do this (check each)
- [ ] Create/verify `src/data/packages/types.ts` (Money, Service, PackageCatalogItem, AddOnCatalogItem, BundleAuthoring, SearchRecord).
- [ ] Create/verify `src/data/packages/taxonomy.ts` (SERVICES enum + helpers).
- [ ] Ensure per-service authoring files exist & typed: `*-packages.ts`, `*-addons.ts`; bundles in `bundles/*.ts`.
- [ ] Normalize price dialect in authoring (prefer `oneTime`/`monthly`; default `currency:"USD"`).
- [ ] Ensure **unique** `id` (packages/add-ons) and **unique** `slug` (bundles).
- [ ] Add/verify `src/data/packages/featured.json` (bundle slugs only) or TS equivalent.
- [ ] Implement façade `src/data/packages/index.ts`: export `BUNDLES`, `getBundleBySlug`, `FEATURED_BUNDLE_SLUGS`, `getPackagesSearchIndex`.
- [ ] Replace any deep imports in pages/templates with façade imports (non-invasive).
- [ ] Run: `npm run data:ci` → fix schema/reference issues until ✅.
- [ ] Run: `npm run typecheck && npm run build` → ✅.

## Acceptance
- [ ] Typecheck clean.  
- [ ] `npm run data:ci` passes (no duplicate IDs/slugs; references resolve).  
- [ ] `src/data/packages/index.ts` provides: `BUNDLES`, `getBundleBySlug`, `FEATURED_BUNDLE_SLUGS`, `getPackagesSearchIndex`.  
- [ ] Pages/templates use **only the façade** (no direct reads of deep data files).
```

---

## 3) `phase-01-ssot-and-facade_Playbook_2025-09-22.md`

````md
**Official Title:** Phase 01 — SSOT Hardening & Façade (Playbook)  
**Domain:** packages  
**File Name:** phase-01-ssot-and-facade_Playbook_2025-09-22.md  
**Main Part:** phase-01-ssot-and-facade  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Exact edits for types, authoring files, price normalization, references, and façade.  
- Uses existing repo scripts under `scripts/packages/*` (validate, build, doctor).

**Summary:**  
Follow these steps to finalize typed authoring and expose a single, stable read API for the app.

---

## 0) Branch
```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c feat/phase-01-ssot-and-facade
````

---

## 1) Types (SSOT contracts)

**File:** `src/data/packages/types.ts` (create if missing)

> Keep types small, stable, and **re-used everywhere**.

```ts
// src/data/packages/types.ts
export type Currency = "USD";
export type Money = { oneTime?: number; monthly?: number; currency?: Currency };

export type Service =
  | "content" | "leadgen" | "marketing" | "seo" | "video" | "web" | "social" // add "social" if you use it in authoring
  ;

export type PackageCatalogItem = {
  type: "package";
  id: string;            // unique across repo (e.g., "seo-pro", "content-professional")
  service: Service;
  name: string;
  tier?: "Essential" | "Professional" | "Enterprise" | "Starter" | "Growth" | "Custom";
  summary?: string;
  price?: Money;
  tags?: string[];
  category?: string;
  status?: "active" | "beta" | "deprecated";
};

export type AddOnCatalogItem = {
  type: "addon";
  id: string;            // unique across repo
  service: Service;
  name: string;
  summary?: string;
  price?: Money;
  tags?: string[];
  category?: string;
  status?: "active" | "beta" | "deprecated";
};

export type BundleAuthoring = {
  type: "bundle";
  slug: string;          // route slug; unique
  title: string;
  subtitle?: string;
  summary?: string;
  price?: Money;
  tags?: string[];
  category?: string;
  components: string[];          // package/add-on IDs
  addOnRecommendations?: string[]; // add-on IDs
  content?: { html?: string };   // populated by build (Phase 03)
};

export type SearchRecord =
  | { type: "bundle";  slug: string;  title: string;  summary?: string; tags?: string[]; category?: string; price?: Money }
  | { type: "package"; id: string;    service: string; name: string;    summary?: string; tags?: string[]; category?: string; price?: Money; tier?: string }
  | { type: "addon";   id: string;    service: string; name: string;    summary?: string; tags?: string[]; category?: string; price?: Money };
```

---

## 2) Taxonomy (services & helpers)

**File:** `src/data/packages/taxonomy.ts`

```ts
// src/data/packages/taxonomy.ts
import type { Service } from "./types";

export const SERVICES = [
  "content", "leadgen", "marketing", "seo", "video", "web", "social" // align with your repo
] as const;

export type ServiceLiteral = (typeof SERVICES)[number];

export const isService = (x: string): x is Service =>
  (SERVICES as readonly string[]).includes(x);
```

> If your repo doesn’t use `social`, drop it. Keep this list **canonical**.

---

## 3) Authoring files (per-service + bundles)

**Goal:** Ensure each service has typed files and **consistent price dialect**.

* Per-service files live in `src/data/packages/*-packages.ts` and `src/data/packages/*-addons.ts`.
* Bundles live in `src/data/packages/bundles/*.ts`.

**Actions:**

1. **Open each authoring file** and ensure it exports **typed arrays** (`PackageCatalogItem[]` / `AddOnCatalogItem[]`).
2. **Normalize price keys**: change any `price.setup` to `price.oneTime`; add `currency: "USD"` where missing.
3. Confirm **unique IDs** across all packages/add-ons; confirm **unique slugs** across bundles.
4. Confirm `bundles/*.ts` `components` & `addOnRecommendations` reference **existing IDs**.

**Snippet example (package):**

```ts
// src/data/packages/seo-packages.ts
import type { PackageCatalogItem } from "./types";

export const SEO_PACKAGES: PackageCatalogItem[] = [
  {
    type: "package",
    id: "seo-pro",
    service: "seo",
    name: "SEO Pro",
    summary: "Technical + content optimization.",
    price: { monthly: 750, currency: "USD" },
    tags: ["seo", "technical"],
    category: "Core",
    status: "active"
  }
];
```

**Snippet example (bundle):**

```ts
// src/data/packages/bundles/ecommerce-accelerator.ts
import type { BundleAuthoring } from "../types";
const bundle: BundleAuthoring = {
  type: "bundle",
  slug: "ecommerce-accelerator",
  title: "E-Commerce Accelerator",
  subtitle: "Scale with SEO + video + ads",
  summary: "All-in-one program for DTC and marketplace brands.",
  price: { oneTime: 18000, monthly: 4000, currency: "USD" }, // optional
  tags: ["ecommerce","growth"],
  category: "Integrated",
  components: ["seo-pro", "video-editing-lite"],            // ← IDs must exist
  addOnRecommendations: ["analytics-tagging-setup"]         // ← IDs must exist
};
export default bundle;
```

---

## 4) Featured list

**File:** `src/data/packages/featured.json` (or `.ts` if you prefer)

```json
{
  "bundles": {
    "featuredSlugs": [
      "local-business-growth",
      "ecommerce-accelerator",
      "thought-leadership-authority"
    ]
  }
}
```

> Keep this **slugs-only** and validate in Phase 03 scripts. If `check-featured-refs` exists (your repo has it), it will fail if slugs don’t resolve.

---

## 5) Façade (single read API)

**File:** `src/data/packages/index.ts`

> Reads **generated artifacts** when present (Phase 03), but compiles in dev-fallbacks so pages don’t break if a generated file is missing during local work.

```ts
// src/data/packages/index.ts
import type { BundleAuthoring, SearchRecord, Money } from "./types";

// Prefer generated artifacts (written by scripts/packages/build.ts in Phase 03)
let bundles: BundleAuthoring[] = [];
let searchIndex: SearchRecord[] = [];
let featuredBundleSlugs: string[] = [];

function safeLoad<T>(path: string, fallback: T): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path) as T; // Next/Node will transpile JSON requires
  } catch {
    return fallback;
  }
}

// Load generated files if available
bundles = safeLoad<BundleAuthoring[]>("./__generated__/bundles.enriched.json", []);
searchIndex = safeLoad<SearchRecord[]>("./__generated__/packages.search.json", []);

// Load featured
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const f = require("./featured.json") as { bundles?: { featuredSlugs?: string[] } };
  featuredBundleSlugs = f?.bundles?.featuredSlugs ?? [];
} catch {
  featuredBundleSlugs = [];
}

export const BUNDLES = bundles;

// Basic helpers
export const getBundleBySlug = (slug: string) =>
  BUNDLES.find((b) => b.slug === slug);

export const FEATURED_BUNDLE_SLUGS = featuredBundleSlugs;

export const getPackagesSearchIndex = () => searchIndex;

// Utility (shared): normalize money shape if ever needed at read time
export const normalizePrice = (p?: any): Money | undefined =>
  !p
    ? undefined
    : {
        oneTime: p.oneTime ?? p.setup ?? undefined,
        monthly: p.monthly ?? undefined,
        currency: p.currency ?? "USD",
      } as Money;
```

> Notes
> • We intentionally **don’t** import authoring TS directly here to avoid runtime cost; the build pipeline (Phase 03) will produce the generated JSONs that this façade reads.
> • In dev, if `__generated__` is missing, `BUNDLES`/`searchIndex` will be empty — pages should handle empty states gracefully until you run `npm run data:ci`.

---

## 6) Replace deep imports in pages/templates (non-invasive)

**Goal:** Ensure all **pages** and **templates** import **only** from the façade.

**Examples:**

* `app/packages/page.tsx`

  ```ts
  import { getPackagesSearchIndex, FEATURED_BUNDLE_SLUGS } from "@/data/packages";
  ```

* `app/packages/[bundles]/page.tsx`

  ```ts
  import { BUNDLES, getBundleBySlug } from "@/data/packages";
  ```

**Search & review (local):**

```bash
# Find deep data imports used in pages/templates
grep -RIn --include="*.{ts,tsx}" "@/data/packages/" app src/packages/templates | cat
```

Fix any direct deep imports (e.g., `@/data/packages/bundles/...`) to go through the façade.

---

## 7) Validate authorship & references

Run the existing repo scripts (you already have them):

```bash
npm run data:ci    # runs validate, check-featured-refs, growth check, build, doctor
npm run typecheck
npm run build
```

**If `doctor:packages` fails on “badge rule” or “features < 6”** (presentational policy), either:

* Update featured data to satisfy it, **or**
* Temporarily downgrade those checks to warnings and move strict enforcement to **Phase 05 (Search & Featured)**.

**Do not** ignore schema or reference errors (IDs/slugs uniqueness, missing references) — fix those now.

---

## 8) Commit

```bash
git add -A
git commit -m "feat(phase-01): SSOT hardening and data façade for packages domain"
git push -u origin feat/phase-01-ssot-and-facade
```

Open a PR into `feat/packages-refactor` and ensure CI is green.

---

## Acceptance (copy to Checklist)

* Typecheck clean.
* `npm run data:ci` passes (schema OK; IDs/slugs unique; references resolve).
* `src/data/packages/index.ts` exports `BUNDLES`, `getBundleBySlug`, `FEATURED_BUNDLE_SLUGS`, `getPackagesSearchIndex`.
* Pages/templates read **only via façade** (no deep imports).

````

---

## 4) `_generated/index.json`

> Seed index; your doc index script can update later.

```json
{
  "phase": "01",
  "title": "SSOT Hardening & Façade",
  "files": [
    "README.md",
    "phase-01-ssot-and-facade_Checklist_2025-09-22.md",
    "phase-01-ssot-and-facade_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Done

These files give you a **complete, production-ready Phase 01**: tight checklist, deep playbook, and an index stub. Once merged, your app will have a **stable, typed SSOT** and a **single façade API** (`@/data/packages`) to power later phases.
