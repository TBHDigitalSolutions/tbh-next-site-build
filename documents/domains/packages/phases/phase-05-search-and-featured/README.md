Perfect — here are the **production-ready docs** for **Phase 05 — Search & Featured Rails**.
Add these four files to:

```
documents/domains/packages/phases/phase-05-search-and-featured/
├─ _generated/index.json
├─ README.md
├─ phase-05-search-and-featured_Checklist_2025-09-22.md
└─ phase-05-search-and-featured_Playbook_2025-09-22.md
```

They’re tailored to `TBHDigitalSolutions/tbh-next-site-build`, Node 20, **npm**, and the guardrails you’ve set (pages thin, templates no IO, façade only).

---

## 1) `README.md`

```md
**Official Title:** Phase 05 — Search & Featured Rails  
**Domain:** packages  
**File Name:** phase-05-search-and-featured_Readme_2025-09-22.md  
**Main Part:** phase-05-search-and-featured  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Build a **fast, client-side** search (no network calls) over a **prebuilt index**.  
- Keep “featured” as a **tiny authored config** that is **validated in build** against the SSOT.  
- UX: 150–250ms debounce, empty states, **Recommended vs A–Z** sorting.

**Summary:**  
This phase completes discovery: a deterministic search index generated at build, and curated featured rails with badges and order. The index fuels the hub page instant search (client-only logic, no IO), while featured slugs/badges are authored in `src/data/packages/featured.ts` and validated during `npm run data:ci`. Output lives in `src/data/packages/__generated__/packages.search.json` and is exposed by the façade.
```

---

## 2) `phase-05-search-and-featured_Checklist_2025-09-22.md`

```md
**Official Title:** Phase 05 — Search & Featured Rails (Checklist)  
**Domain:** packages  
**File Name:** phase-05-search-and-featured_Checklist_2025-09-22.md  
**Main Part:** phase-05-search-and-featured  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Use **npm** only; branch `feat/packages-refactor`.  
- No template IO; **all reads via façade**.

**Summary:**  
Tight steps to add a robust search index, debounce UX, empty states, and featured rails validated against SSOT.

---

## Working rules
- Work only on `feat/packages-refactor` (never `main`).
- Import data **only** from `@/data/packages`; templates do not read files.
- No runtime MD/MDX parsing anywhere.

## Preconditions
- [ ] Phase 01 façade exports `getPackagesSearchIndex()` and `FEATURED_BUNDLE_SLUGS`.
- [ ] Phase 03 build emits `__generated__/packages.search.json`.

## Do this (check each)
- [ ] Ensure/author `src/data/packages/featured.ts` (slugs, badges, order).  
- [ ] Validate featured in `scripts/packages/validate-packages.ts` (or `check-featured-refs.ts`): bad refs → **fail**.  
- [ ] Confirm search index fields: **type, service, name/title, summary, tags, tier, pricePresence**.  
- [ ] Update façade: return the raw array from `packages.search.json`.  
- [ ] Update `PackagesHubTemplate` client helper: 150–250ms debounce; **empty state**; **A–Z vs Recommended**.  
- [ ] Ensure featured rails in hub: render **only resolvable** slugs.  
- [ ] `npm run data:ci && npm run build` is green.  
- [ ] Manual QA: search latency feels instant, sorting/filters correct, empty state visible.

## Acceptance
- [ ] Index covers required fields; hub search responds under light debounce.  
- [ ] Featured config validated during build; unresolved slugs fail CI.  
- [ ] Hub shows featured rails and correct sorting; empty states render.
```

---

## 3) `phase-05-search-and-featured_Playbook_2025-09-22.md`

````md
**Official Title:** Phase 05 — Search & Featured Rails (Playbook)  
**Domain:** packages  
**File Name:** phase-05-search-and-featured_Playbook_2025-09-22.md  
**Main Part:** phase-05-search-and-featured  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Deterministic build outputs → fast client search (no fetch).  
- Featured rails are **data only** (slugs/badges/order), not prose.

**Summary:**  
This playbook provides exact files & edits to finalize the search index and featured rails. It assumes Phase 01 (façade/types) and Phase 03 (build pipeline) already exist.

---

## 0) Branch & sanity

```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c feat/phase-05-search-featured
````

---

## 1) Author the featured config (slugs, badges, order)

**File:** `src/data/packages/featured.ts`

```ts
// ESM module
export type FeaturedBadge = "Most Popular" | "New" | "Best Value";
export type FeaturedItem = { slug: string; badge?: FeaturedBadge; weight?: number };

export const FEATURED_BUNDLES: FeaturedItem[] = [
  { slug: "digital-transformation-starter", badge: "Most Popular", weight: 10 },
  { slug: "ecommerce-accelerator", badge: "Best Value", weight: 20 },
  { slug: "event-launch-domination", weight: 30 }
  // add more as desired (lower weight = higher priority)
];

// Utility for façade export
export const FEATURED_BUNDLE_SLUGS = FEATURED_BUNDLES
  .sort((a, b) => (a.weight ?? 999) - (b.weight ?? 999))
  .map(x => x.slug);
```

> Keep prose for featured notes in MDX per service if you want (but no IO here).

---

## 2) Validate featured references during build

**Edit (or create):** `scripts/packages/validate-packages.ts`
Add/augment validation so **every featured slug resolves** to an existing bundle and **first N** have the right uniqueness/badge rules (tune to your rules).

```ts
// ... existing imports
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // Load authored SSOT (your existing collect() helper should already do this)
  const { bundles } = await import(path.resolve(__dirname, "./lib/collect.js")).then(m => m.collect());
  const bySlug = new Map(bundles.map((b:any) => [b.slug, b]));

  // Load featured authored TS
  const { FEATURED_BUNDLES } = await import(path.resolve(process.cwd(), "src/data/packages/featured.ts"));

  // 1) Resolve check
  const missing = FEATURED_BUNDLES.filter((f:any) => !bySlug.has(f.slug));
  if (missing.length) {
    console.error("❌ Featured slugs not found in bundles:", missing.map((m:any)=>m.slug).join(", "));
    process.exitCode = 1;
  }

  // 2) Optional badge rule (at least one “Most Popular” in top 3)
  const top3 = [...FEATURED_BUNDLES]
    .sort((a:any,b:any)=>(a.weight ?? 999)-(b.weight ?? 999))
    .slice(0,3);

  const hasMostPopular = top3.some((x:any) => x.badge === "Most Popular");
  if (!hasMostPopular) {
    console.error("✖ Badge rule violated: top 3 should include a 'Most Popular' item.");
    process.exitCode = 1;
  }

  // 3) Optional density rule (warn if any have too-few features)
  // (Assumes bundle.components exists; tweak threshold as you like.)
  top3.forEach((f:any) => {
    const b = bySlug.get(f.slug);
    if (b && (!b.components || b.components.length < 6)) {
      console.warn(`⚠️  Featured '${f.slug}' has < 6 components; card may look sparse.`);
    }
  });

  if (process.exitCode && process.exitCode !== 0) process.exit(process.exitCode);
  console.log("✅ Featured references validation passed");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

> If you already have `scripts/packages/check-featured-refs.ts`, fold these checks there and keep `validate-packages.ts` importing it.

---

## 3) Ensure the search index fields (build output)

**Edit:** `scripts/packages/lib/build-search-index.ts` (or create if missing)

```ts
// scripts/packages/lib/build-search-index.ts
import fs from "node:fs";
import path from "node:path";

type Money = { oneTime?: number; monthly?: number; currency?: "USD" };
type SearchRecord =
  | { type:"bundle";  slug:string; title:string; summary?:string; tags?:string[]; category?:string; price?:Money; pricePresence: "priced"|"custom" }
  | { type:"package"; id:string;   service:string; name:string;   summary?:string; tags?:string[]; tier?:string; category?:string; price?:Money; pricePresence: "priced"|"custom" }
  | { type:"addon";   id:string;   service:string; name:string;   summary?:string; tags?:string[]; category?:string; price?:Money; pricePresence: "priced"|"custom" };

export function buildSearchIndex({
  bundles, packages, addons
}: {
  bundles: any[]; packages: any[]; addons: any[];
}) {
  const pp = (p?: Money): "priced"|"custom" =>
    (p && (p.oneTime || p.monthly)) ? "priced" : "custom";

  const bundleRows: SearchRecord[] = bundles.map(b => ({
    type: "bundle",
    slug: b.slug,
    title: b.title,
    summary: b.summary,
    tags: b.tags ?? [],
    category: b.category,
    price: b.price,
    pricePresence: pp(b.price),
  }));

  const pkgRows: SearchRecord[] = packages.map(p => ({
    type: "package",
    id: p.id,
    service: p.service,
    name: p.name,
    summary: p.summary,
    tags: p.tags ?? [],
    tier: p.tier,
    category: p.category,
    price: p.price,
    pricePresence: pp(p.price),
  }));

  const addonRows: SearchRecord[] = addons.map(a => ({
    type: "addon",
    id: a.id,
    service: a.service,
    name: a.name,
    summary: a.summary,
    tags: a.tags ?? [],
    category: a.category,
    price: a.price,
    pricePresence: pp(a.price),
  }));

  return [...bundleRows, ...pkgRows, ...addonRows];
}

export function writeSearchIndex(outDir: string, rows: SearchRecord[]) {
  const out = path.join(outDir, "packages.search.json");
  const next = JSON.stringify(rows, null, 2);
  const prev = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
  if (prev !== next) fs.writeFileSync(out, next);
}
```

**Wire it in** your orchestrator `scripts/packages/build.ts`:

```ts
import { collect } from "./lib/collect.js";
import { buildSearchIndex, writeSearchIndex } from "./lib/build-search-index.js";
import path from "node:path";

const OUT_DIR = path.resolve(process.cwd(), "src/data/packages/__generated__");

const { bundles, packages, addons } = await collect();
// ... (compile MDX + attach content happens earlier in this file)
const searchRows = buildSearchIndex({ bundles, packages, addons });
writeSearchIndex(OUT_DIR, searchRows);
console.log("📄 Wrote __generated__/packages.search.json   rows:", searchRows.length);
```

---

## 4) Façade exports (confirm)

**Edit:** `src/data/packages/index.ts` (types omitted for brevity)

```ts
import bundles from "./__generated__/bundles.enriched.json";
import search from "./__generated__/packages.search.json";
export { FEATURED_BUNDLE_SLUGS } from "./featured";

export const BUNDLES = bundles as any[];
export const getBundleBySlug = (slug: string) => BUNDLES.find(b => b.slug === slug);

export const getPackagesSearchIndex = () => search as any[]; // SearchRecord[]
```

---

## 5) Hub template: debounce, empty state, Recommended sort

**Edit:** `src/packages/templates/PackagesHubTemplate.tsx` (client helper section)

```tsx
// inside "use client" block (replace the prior simple state logic)
import { useEffect, useMemo, useState } from "react";

function useDebounced<T>(value: T, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function HubClient({ filters, items, classNames, analyticsIdPrefix }: {
  filters: any; items: any[]; classNames: Record<string,string>; analyticsIdPrefix: string;
}) {
  const [qRaw, setQRaw] = useState("");
  const q = useDebounced(qRaw, 200);         // 150–250ms is fine
  const [type, setType] = useState("All");
  const [service, setService] = useState("All");
  const [sort, setSort] = useState("Recommended");

  const filtered = useMemo(() => {
    let list = items.filter((x) => {
      const inType =
        type === "All" ||
        (type === "Bundle" && x.type === "bundle") ||
        (type === "Package" && x.type === "package") ||
        (type === "Add-on" && x.type === "addon");
      const inService = service === "All" || (x.service && x.service === service);
      const text = q.trim().toLowerCase();
      const label = ("name" in x ? x.name : x.title) ?? "";
      const inText =
        !text ||
        label.toLowerCase().includes(text) ||
        (x.summary ?? "").toLowerCase().includes(text) ||
        (x.tags ?? []).some((t:string)=>t.toLowerCase().includes(text));
      return inType && inService && inText;
    });

    if (sort === "A–Z") {
      list = list.sort((a, b) => {
        const ka = ("name" in a ? a.name : a.title).toLowerCase();
        const kb = ("name" in b ? b.name : b.title).toLowerCase();
        return ka.localeCompare(kb);
      });
    }
    // "Recommended": keep original incoming order (featured first, then alpha from server part)
    return list;
  }, [items, q, type, service, sort]);

  return (
    <>
      {/* controls */}
      <div className={classNames.filters} role="region" aria-label="Search and filters">
        <input placeholder="Search packages…" value={qRaw} onChange={e=>setQRaw(e.target.value)} aria-label="Search" />
        <select aria-label="Type" value={type} onChange={(e)=>setType(e.target.value)}>
          {filters.type.map((t:string) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select aria-label="Service" value={service} onChange={(e)=>setService(e.target.value)}>
          {["All", ...filters.services].map((s:string) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
          {filters.sort.map((s:string) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* results / empty state */}
      {filtered.length === 0 ? (
        <p role="status">No results. Try different filters or search terms.</p>
      ) : (
        <div className={classNames.grid}>
          {filtered.map((x:any) => {
            const title = "name" in x ? x.name : x.title;
            const href = x.type === "bundle" ? `/packages/${x.slug}` : "/packages";
            return (
              <a key={`${x.type}:${"slug" in x ? x.slug : x.id}`} href={href} className={classNames.card}
                 data-analytics={`${analyticsIdPrefix}:card_click`} data-type={x.type}>
                <div className={classNames.badge}>{x.type}</div>
                <h3>{title}</h3>
                {x.summary && <p>{x.summary}</p>}
                <div className={classNames.price}>
                  {x.pricePresence === "priced" ? (x.price?.monthly ? `$${x.price.monthly}/mo` : `$${x.price?.oneTime} setup`) : "Custom pricing"}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
```

> The **server part** of `PackagesHubTemplate` should keep “featured first, then A–Z” for the initial list (as you already did in Phase 04). The client “Recommended” mode preserves that order.

---

## 6) Build & QA

```bash
npm run data:ci     # should validate featured refs and build search index
npm run build
npm run dev
```

Manual:

* Hub search updates after a short pause; empty state appears with no results.
* Switching **A–Z** sorts alphabetically; **Recommended** keeps server order (featured first).
* Featured rails (if shown separately) contain only valid slugs; no console warnings.

---

## 7) Commit & PR

```bash
git add src/data/packages/featured.ts scripts/packages/* src/data/packages/index.ts src/packages/templates/PackagesHubTemplate.tsx
git commit -m "feat(packages): search index fields + debounce UX + featured validation and rails"
git push -u origin feat/phase-05-search-featured
```

Open a PR into `feat/packages-refactor` with a gif of the hub search & filters.

---

## Troubleshooting

* **Validation fails (featured):** check typos in `featured.ts`, ensure the bundle `slug` exists in authored SSOT.
* **Search feels slow:** keep the index small (raw records only), use 150–250ms debounce, avoid expensive client operations.
* **Cards show “Custom pricing” unexpectedly:** verify price normalization in Phase 01 and that Phase 03 rebuilt artifacts.

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "05",
  "title": "Search & Featured Rails",
  "files": [
    "README.md",
    "phase-05-search-and-featured_Checklist_2025-09-22.md",
    "phase-05-search-and-featured_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Final acceptance (paste into PR)

* Search index includes: **type, service, name/title, summary, tags, tier, pricePresence**.
* Hub search: **150–250ms** debounce, **empty state**, **A–Z** vs **Recommended** works.
* Featured rails derive from `src/data/packages/featured.ts`; **validation fails on bad slugs**.
* `npm run data:ci` and `npm run build` are green.
