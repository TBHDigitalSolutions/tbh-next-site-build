search-domain-the-single-path-for-searching-packages-globally-and-on-package-pages.md
---

Got it — I couldn’t open the `search.zip` you attached (tooling limitation), so I can’t line-by-line review your current files. But I can give you a precise, drop-in integration plan that makes your **existing search domain** the single path for searching **packages** globally and on package pages, while fitting perfectly with the **data/content** setup and the **generated indices** we defined.

Below is a concrete, production-ready alignment plan, with specific file touch points, code stubs, and acceptance checks. If you want me to sanity-check your current `src/search/**` code against this, paste those files (or key ones like `core/types.ts`, `core/sources.packages.ts`, `client/miniClient.ts`, `server/searchService.ts`) and I’ll reconcile them exactly.

---

# 🎯 Goal

* Keep **your search domain** (`src/search/**`) the single abstraction.
* Feed it **packages** data from the **build pipeline** we established:

  * `src/data/packages/__generated__/bundles.enriched.json` (SSOT + attached MDX HTML/excerpt)
  * `src/data/packages/__generated__/packages.search.json` (final docs for client search)
* Support **two drivers** with a flag:

  * `MINISEARCH` (static, client-side): ship `packages.search.json` to the client.
  * `MEILISEARCH` (server, optional): push docs at build time.

Environment switch:

```
SEARCH_DRIVER=minisearch | meilisearch
```

---

# 🔌 Types: Align search documents with your domain

Make sure `src/search/core/types.ts` has (or extend it to have) a **Packages** doc shape that matches what we’ll generate:

```ts
// src/search/core/types.ts
export type SearchDomain = "packages" | "services" | "portfolio" | "site";

export type PackageDoc = {
  id: string;               // bundle slug or package id
  kind: "bundle" | "package";
  slug: string;             // route slug
  title: string;            // display title
  subtitle?: string;        // short tagline
  excerpt?: string;         // plain-text summary (from MDX or includes)
  content?: string;         // optional larger plain-text blob (for scoring)
  services?: string[];      // e.g. ["seo","content","webdev"]
  tier?: string;            // e.g. "Essential" | "Pro" | "Enterprise"
  priceOneTime?: number | null;
  priceMonthly?: number | null;
  badges?: string[];        // e.g. ["Most Popular"]
  tags?: string[];          // categories, features, synonyms
  url: string;              // resolved app route (e.g. `/packages/${slug}`)
  updatedAt?: string;       // ISO for freshness signals
  // ranking helpers
  boosts?: Record<string, number>; // optional scoring tweaks
};

export type SearchDoc = PackageDoc /* | ServiceDoc | PortfolioDoc | ... */;
```

> If your `types.ts` already defines `SearchDoc`, keep that; just ensure `PackageDoc` fields above exist or map cleanly.

---

# 🏗️ Build step: generate the **packages** search docs

Create (or adapt) a dedicated generator that consumes **enriched bundles** and writes **packages.search.json**.

```ts
// scripts/packages/lib/build-search-index.ts
import fs from "node:fs";
import path from "node:path";

type EnrichedBundle = {
  slug: string;
  name: string;
  description?: string;
  services?: string[];
  isMostPopular?: boolean;
  price?: { oneTime?: number; monthly?: number };
  includes?: { items?: string[] }[];
  content?: { html?: string; excerpt?: string; wordCount?: number; updatedAt?: string };
};

type PackageDoc = {
  id: string;
  kind: "bundle" | "package";
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  content?: string;
  services?: string[];
  tier?: string;
  priceOneTime?: number | null;
  priceMonthly?: number | null;
  badges?: string[];
  tags?: string[];
  url: string;
  updatedAt?: string;
  boosts?: Record<string, number>;
};

const ROOT = path.resolve(__dirname, "../../../..");
const GEN_DIR = path.join(ROOT, "src/data/packages/__generated__");
const ENRICHED = path.join(GEN_DIR, "bundles.enriched.json");
const OUT = path.join(GEN_DIR, "packages.search.json");

// crude HTML stripper for content
function stripHtml(html?: string): string | undefined {
  if (!html) return undefined;
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildPackagesSearchIndex() {
  const raw = fs.readFileSync(ENRICHED, "utf8");
  const bundles: EnrichedBundle[] = JSON.parse(raw);

  const docs: PackageDoc[] = bundles.map((b) => {
    const features = (b.includes ?? []).flatMap((s) => s.items ?? []);
    const badges = b.isMostPopular ? ["Most Popular"] : [];
    const tags = Array.from(
      new Set([...(b.services ?? []), ...features.slice(0, 10)])
    );

    return {
      id: b.slug,
      kind: "bundle",
      slug: b.slug,
      title: b.name,
      subtitle: b.description,
      excerpt: b.content?.excerpt || features.slice(0, 3).join(" · "),
      content: stripHtml(b.content?.html),
      services: b.services,
      priceOneTime: b.price?.oneTime ?? null,
      priceMonthly: b.price?.monthly ?? null,
      badges,
      tags,
      url: `/packages/${b.slug}`,
      updatedAt: b.content?.updatedAt,
      boosts: { featured: b.isMostPopular ? 1.2 : 1.0 },
    };
  });

  fs.mkdirSync(GEN_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(docs, null, 2), "utf8");
  console.log(`✅ wrote ${docs.length} package docs → ${path.relative(ROOT, OUT)}`);
}

if (require.main === module) {
  buildPackagesSearchIndex();
}
```

**Wire it into the build pipeline** (we already planned this in `scripts/packages/build.ts`):

* After **validate** and **attach content**, run `build-search-index.ts`.
* Optionally copy the JSON to `public/search/packages.search.json` for fast client fetch.

Add an npm script:

```json
{
  "scripts": {
    "packages:build-index": "tsx scripts/packages/lib/build-search-index.ts"
  }
}
```

---

# 📚 Update the search “sources” to consume the generated docs

Adjust `src/search/core/sources.packages.ts` to read **the generated docs** (instead of crawling many TS files). Two modes:

### A) Client (Minisearch) – load JSON

```ts
// src/search/core/sources.packages.ts
import pkg from "@/data/packages/__generated__/packages.search.json";

export async function getPackageDocs() {
  // If this needs to run client-side, you can `fetch('/search/packages.search.json')` instead.
  return pkg as any[];
}
```

### B) Server (Meilisearch) – push docs at build time

If you use Meili, use the same output docs and push them in your build script:

```ts
// scripts/packages/lib/push-meili.ts
import { client } from "@/src/search/server/meiliClient"; // adjust path
import path from "node:path";
import fs from "node:fs";

const ROOT = path.resolve(__dirname, "../../../..");
const OUT = path.join(ROOT, "src/data/packages/__generated__/packages.search.json");

export async function pushPackagesToMeili() {
  const raw = fs.readFileSync(OUT, "utf8");
  const docs = JSON.parse(raw);
  const index = await client.getOrCreateIndex("packages", { primaryKey: "id" });
  await index.updateSettings({
    searchableAttributes: ["title", "subtitle", "excerpt", "content", "tags", "services"],
    filterableAttributes: ["services", "badges", "tier"],
    sortableAttributes: ["priceMonthly", "priceOneTime", "updatedAt"],
    synonyms: {
      seo: ["search engine optimization"],
      "ppc": ["paid search","google ads"]
    }
  });
  const task = await index.addDocuments(docs);
  console.log("📤 Meilisearch task:", task.taskUid);
}

if (require.main === module) {
  pushPackagesToMeili().catch((e) => {
    console.error("❌ Meili push failed", e);
    process.exit(1);
  });
}
```

---

# ⚙️ Make the client pick the driver

Centralize the driver selection in `src/search/index.ts`:

```ts
// src/search/index.ts
import { useSearch } from "./client/useSearch";
import type { PackageDoc } from "./core/types";

export type { PackageDoc };

export const SEARCH_DRIVER = (process.env.NEXT_PUBLIC_SEARCH_DRIVER || "minisearch").toLowerCase();

export function isMini() { return SEARCH_DRIVER === "minisearch"; }
export function isMeili() { return SEARCH_DRIVER === "meilisearch"; }

// Re-export client helpers
export { default as highlight } from "./client/highlight";
export { default as debounce } from "./client/debounce";
```

In `client/miniClient.ts`, ensure it loads the **static JSON**:

```ts
// src/search/client/miniClient.ts
import MiniSearch from "minisearch";

let mini: MiniSearch | null = null;

export async function loadMiniPackages() {
  if (mini) return mini;
  const res = await fetch("/search/packages.search.json", { cache: "force-cache" });
  const docs = await res.json();
  mini = new MiniSearch({
    fields: ["title", "subtitle", "excerpt", "content", "tags", "services"],
    storeFields: ["id","slug","title","subtitle","excerpt","url","badges","services","priceMonthly","priceOneTime"],
    searchOptions: { prefix: true, fuzzy: 0.2 }
  });
  mini.addAll(docs);
  return mini;
}
```

> Ensure the build copies `src/data/packages/__generated__/packages.search.json` → `public/search/packages.search.json` (simple step in `scripts/packages/build.ts`).

---

# 🔎 UI wiring

Your UI already has:

* `src/search/ui/SearchBar.tsx`
* `src/search/ui/CommandPalette.tsx`
* `src/search/ui/ResultsList.tsx`, `ResultCard.tsx`, etc.

Ensure the results component knows how to render **package** docs:

```tsx
// src/search/ui/ResultCard.tsx (excerpt)
import type { PackageDoc } from "@/src/search";

export default function ResultCard({ result }: { result: PackageDoc }) {
  return (
    <a className="result-card" href={result.url}>
      <div className="result-title">{result.title}</div>
      {result.subtitle && <div className="result-subtitle">{result.subtitle}</div>}
      {result.excerpt && <div className="result-excerpt">{result.excerpt}</div>}
      {/* Add badges/services if helpful */}
    </a>
  );
}
```

---

# 🧪 Acceptance checklist

**Build**

* [ ] `npm run validate:packages` passes.
* [ ] MDX content compiles; `bundles.enriched.json` contains `content.excerpt/html`.
* [ ] `npm run packages:build-index` writes `__generated__/packages.search.json`.
* [ ] (If minisearch) file is copied to `public/search/packages.search.json`.

**Client (minisearch)**

* [ ] `useSearch` yields package hits with titles, excerpts, links.
* [ ] Typing “seo” also finds “search engine optimization” (synonyms).

**Server (meilisearch – optional)**

* [ ] `push-meili.ts` indexes the same docs.
* [ ] Filtering/sorting works on `services`, `priceMonthly`, `updatedAt`.

**Routing**

* [ ] Each result `url` resolves to the correct `/packages/[slug]` page.

**Content**

* [ ] If a bundle has MDX, its `excerpt` shows in results.
* [ ] If not, fallback extracts from `includes`.

**Perf & privacy**

* [ ] `packages.search.json` contains **no secrets** and acceptable size (usually << 2–3 MB).
* [ ] Static file is served with cache headers (Next public assets default ok).

---

# 🧭 Where this leaves you

* Your **search domain** remains the single API for search.
* The **packages** data & content pipeline now **feeds** search with a stable, typed doc shape.
* You can flip between `MINISEARCH` and `MEILISEARCH` with one env var.
* Global search and package pages use the exact **same index** and logic.

If you paste the handful of search files you want me to verify (`core/types.ts`, `core/sources.packages.ts`, `client/miniClient.ts`, `server/searchService.ts`), I’ll tweak the code stubs above to your exact implementation details.
