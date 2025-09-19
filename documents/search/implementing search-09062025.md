Awesome—here’s a clear, scalable way to implement **search** across Services (hubs/services/subservices), **Portfolio**, and **Packages**, using your single-source data files.

I’ll give you:

1. The **data model** for a unified index
2. A **progressive architecture** (start simple → scale)
3. **Where it lives** in your repo
4. **Core code skeletons** (indexer, API, client hook, UI)
5. **UX details** (filters, keyboard, highlighting, a11y)

---

# 1) Unified Search Index (one index, many types)

Represent **everything** as “documents” with a common shape and a `type` discriminator:

```ts
// /src/search/types.ts
export type SearchType = "hub" | "service" | "subservice" | "portfolio" | "package";

export type SearchDoc = {
  id: string;                // unique (type:slug or a uuid)
  type: SearchType;          // "service" | "package" | ...
  title: string;             // primary text
  summary?: string;          // 1-2 sentence description
  path: string;              // URL to navigate to
  serviceKey?: string;       // "video" | "web" | "seo" | ...
  hub?: string;              // hub slug (e.g., "video-production")
  category?: string;         // sub-category (portfolio: "video", etc.)
  tags?: string[];           // keywords
  // ranking helpers:
  weight?: number;           // manual boost (0..10)
  date?: string;             // optional sort key for portfolio
};
```

This lets you index **Level 1/2/3 services**, **portfolio items**, and **bundles** together and filter by `type`, `serviceKey`, etc.

---

# 2) Progressive architecture (start → scale)

**Phase 1 (fastest, no server): Client-side search with a static JSON index**

* Build the index from SSOT at build time into `/public/search/index.json`.
* Use a tiny in-browser search engine:

  * **MiniSearch** (great for client bundles)
  * **Fuse.js** (fuzzy; no inverted index)

**Phase 2 (still self-hosted): API-based search**

* Keep a **server-generated index** and query via **Next.js route** (`/api/search`).
* Still use MiniSearch or Fuse on server (Node) for better performance and smaller client bundle.

**Phase 3 (bigger catalogs): Dedicated engine**

* **Meilisearch** or **Typesense** (self-host OSS) or **Algolia** (SaaS).
* Push documents from an indexer script; query via REST from the UI.
* Adds facets, typo tolerance, synonyms, analytics.

You can start Phase 1 today and upgrade without changing UI much.

---

# 3) Where files live

```
/src/search
├── types.ts             // SearchDoc definitions
├── buildIndex.ts        // build-time: read SSOT, create JSON index
├── indexer.ts           // (optional) shared functions to normalize docs
├── client.ts            // client hook & loader (MiniSearch/Fuse)
├── api.ts               // server helpers (Phase 2+)
└── synonyms.ts          // (optional) synonyms map for relevance
/public/search
└── index.json           // generated static index (Phase 1)
```

---

# 4) Core code skeletons

## 4.1 Build the index from your SSOT

```ts
// /src/search/buildIndex.ts
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import servicesTaxonomy from "@/data/taxonomy/servicesTaxonomy"; // your L1/L2/L3 structure if available
import portfolioItems from "@/data/portfolio";
import { bundles } from "@/data/packages";
import type { SearchDoc } from "./types";

// Example helpers, adapt to your real data structures:
function flattenServices(): SearchDoc[] {
  // Assume you have a taxonomy listing hubs -> services -> subservices
  // Create SearchDoc entries for each level.
  const docs: SearchDoc[] = [];
  // … iterate hubs
  // … push { id, type: "hub", title, summary, path, serviceKey }
  // … iterate services (type: "service")
  // … iterate subservices (type: "subservice")
  return docs;
}

function mapPortfolio(): SearchDoc[] {
  return portfolioItems.map(item => ({
    id: `portfolio:${item.id}`,
    type: "portfolio",
    title: item.title,
    summary: item.description,
    path: item.service ? `/portfolio/${item.service}` : `/portfolio`,
    serviceKey: item.service,
    category: item.category,
    tags: item.tags,
    date: item.date,
    weight: item.featured ? 5 : 1,
  }));
}

function mapBundles(): SearchDoc[] {
  return bundles.map(b => ({
    id: `package:${b.slug}`,
    type: "package",
    title: b.name,
    summary: b.description,
    path: `/packages/${b.slug}`,
    tags: b.useCases,
    // choose a dominant serviceKey for filtering; or omit if multi-service
    serviceKey: b.services?.[0],
    weight: 3,
  }));
}

export function buildIndex(): SearchDoc[] {
  const docs = [
    ...flattenServices(),
    ...mapPortfolio(),
    ...mapBundles(),
  ];
  return docs;
}

// Run at build time via a small script or a Next build step
export function writeStaticIndex() {
  const out = buildIndex();
  const dir = path.join(process.cwd(), "public", "search");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.json"), JSON.stringify(out));
}
```

> Run `writeStaticIndex()` from a Node script (e.g., `scripts/build-search.ts`) and call it in your build pipeline (prebuild/postinstall).

---

## 4.2 Client search (Phase 1) with MiniSearch

```ts
// /src/search/client.ts
"use client";
import MiniSearch, { Options } from "minisearch";
import type { SearchDoc } from "./types";

export type SearchFilters = {
  types?: Array<SearchDoc["type"]>;
  serviceKey?: string;    // "video" | "web" | ...
  query?: string;
};

let mini: MiniSearch<SearchDoc> | null = null;
let cache: SearchDoc[] | null = null;

const MINI_OPTS: Options<SearchDoc> = {
  fields: ["title", "summary", "tags", "serviceKey", "category"], // index
  storeFields: ["id", "type", "title", "summary", "path", "serviceKey", "category", "tags"],
  searchOptions: { boost: { title: 3, summary: 1 }, fuzzy: 0.2, prefix: true },
};

async function loadIndex(): Promise<MiniSearch<SearchDoc>> {
  if (mini) return mini;
  const res = await fetch("/search/index.json", { cache: "force-cache" });
  const docs: SearchDoc[] = await res.json();
  cache = docs;
  mini = new MiniSearch(MINI_OPTS);
  mini.addAll(docs);
  return mini;
}

export async function searchDocs(filters: SearchFilters) {
  const idx = await loadIndex();
  const q = filters.query?.trim() ?? "";
  const raw = q ? idx.search(q) : (cache ?? []);
  // facet filters:
  const filtered = raw.filter((r: any) => {
    const d = r as SearchDoc;
    if (filters.types && !filters.types.includes(d.type)) return false;
    if (filters.serviceKey && d.serviceKey !== filters.serviceKey) return false;
    return true;
  });
  return filtered.slice(0, 50) as SearchDoc[];
}
```

---

## 4.3 Global search UI (Command Palette + Page banners)

* **Command Palette**: a global `<kbd>⌘K</kbd>` or `/` to open modal, search all content.
* **Scoped banners**:

  * `/services` banner: restrict to `type in ["hub","service","subservice"]`
  * `/portfolio` banner: restrict to `type="portfolio"`
  * `/packages` banner: restrict to `type="package"`

Minimal hook + component:

```tsx
// /src/search/useSearch.ts
"use client";
import { useEffect, useState } from "react";
import { searchDocs } from "./client";
import type { SearchDoc } from "./types";

export function useSearch(initialFilters?: Parameters<typeof searchDocs>[0]) {
  const [query, setQuery] = useState(initialFilters?.query ?? "");
  const [results, setResults] = useState<SearchDoc[]>([]);
  const [loading, setLoading] = useState(false);

  async function run(filters = initialFilters) {
    setLoading(true);
    const r = await searchDocs({ ...(filters || {}), query });
    setResults(r);
    setLoading(false);
  }

  useEffect(() => { run(); /* eslint-disable-next-line */ }, []);
  return { query, setQuery, results, run, loading };
}
```

```tsx
// /src/components/SearchBanner.tsx (scope with props)
"use client";
import Link from "next/link";
import { useSearch } from "@/search/useSearch";
import type { SearchDoc, SearchType } from "@/search/types";

export default function SearchBanner({ types, serviceKey }: { types?: SearchType[], serviceKey?: string }) {
  const { query, setQuery, results, run, loading } =
    useSearch({ types, serviceKey, query: "" });

  return (
    <section>
      <div>
        <input
          placeholder="Search services, portfolio, packages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e)=> e.key==="Enter" && run({ types, serviceKey })}
          aria-label="Search"
        />
        <button onClick={()=> run({ types, serviceKey })}>Search</button>
      </div>
      {loading ? <div>Searching…</div> : (
        <ul>
          {results.map(r => (
            <li key={r.id}>
              <Link href={r.path}>
                <strong>{r.title}</strong> <small>({r.type})</small>
                {r.summary && <div>{r.summary}</div>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

**Examples of scoped use:**

* On `/services`: `<SearchBanner types={["hub","service","subservice"]} />`
* On `/portfolio`: `<SearchBanner types={["portfolio"]} />`
* On `/packages`: `<SearchBanner types={["package"]} />`
* On a **Video** hub page: `<SearchBanner types={["service","subservice","portfolio","package"]} serviceKey="video" />`

---

# 5) UX & Quality Details

* **Ranking/Boosting**

  * Index boosts for title > summary > tags.
  * Add `weight` for featured/important records (e.g., featured portfolio).
  * Promote exact serviceKey matches in scoped searches.

* **Synonyms & Typos**

  * Add `/src/search/synonyms.ts` (e.g., “web dev” ↔ “web development”).
  * MiniSearch has fuzzy and prefix search; Meilisearch/Typesense offer typo tolerance & synonyms natively.

* **Facets & Filters**

  * Show pill filters for **Type** (Services/Portfolio/Packages), **Service** (Video/Web/SEO), **Category** (when applicable).
  * Preserve **current context** (if on a Video page, preselect `serviceKey="video"`).

* **Keyboard & Modal**

  * Global **Command Palette** (`Cmd/Ctrl + K`) that uses the same `useSearch` hook and renders in a modal.
  * Arrow-key navigation + Enter to open result.
  * Respect **reduced motion**.

* **Highlighting**

  * Highlight query terms in results (wrap matches in `<mark>`).

* **A11y**

  * Label the input; use `role="listbox"` for results; keyboard focus rings; announce counts via `aria-live="polite"`.

* **Performance**

  * **Phase 1**: index.json is \~small; cache it (`cache: "force-cache"`).
  * **Phase 2/3**: server/API search to avoid shipping big index to client.

* **Analytics**

  * Track queries (debounced) and clicks (result id + position) to learn what users want.
  * Use this to add **synonyms** and improve **weights**.

---

# Quick “When to move to Meilisearch/Typesense?”

Move when:

* Index > \~5–10k documents or > 2–3 MB JSON (shipping to client hurts).
* You need **facet counts**, **synonyms**, **typo tolerance**, and **blazing speed** server-side.
* You want analytics on relevance and query suggestions.

They’re both OSS, fast to run on a small VPS, and easy to swap in later because your **SearchDoc** shape stays the same.

---

## TL;DR

* Build **one unified index** (`SearchDoc`) from your SSOT (services, portfolio, packages).
* Start with **client-side MiniSearch + static index.json**; upgrade to API or Meilisearch later.
* Provide **scoped banners** + **global command palette**; filter by `type` and `serviceKey`.
* Keep the **same types and selectors**, so swapping backends doesn’t touch your UI.
