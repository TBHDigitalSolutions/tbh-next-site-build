heck yes — here’s a **drop-in starter bundle** for a **Phase 1 (client-only)** search using **MiniSearch**.
Copy these files into `/src/search`, add the tiny build script, and you’re live.

> Assumes you already have these SSOT modules:
>
> * `@/data/taxonomy/servicesTaxonomy` (your L1/L2/L3)
> * `@/data/portfolio/index` (exporting `portfolioItems`)
> * `@/data/packages/index` (exporting `bundles`)

---

# 📁 File tree (paste into your repo)

```
/src/search
├── config
│   ├── search.config.ts
│   └── synonyms.ts
├── core
│   ├── types.ts
│   ├── rank.ts
│   ├── sources.services.ts
│   ├── sources.portfolio.ts
│   ├── sources.packages.ts
│   ├── indexer.ts
│   └── buildIndex.ts
├── client
│   ├── miniClient.ts
│   ├── useSearch.ts
│   ├── highlight.ts
│   └── debounce.ts
└── ui
    ├── SearchBar.tsx
    ├── SearchBanner.tsx
    ├── CommandPalette.tsx
    ├── Filters.tsx
    ├── ResultsList.tsx
    ├── ResultCard.tsx
    └── search.module.css
```

---

## /src/search/config/search.config.ts

```ts
export const SEARCH_FIELDS = {
  index: ["title", "summary", "tags", "serviceKey", "category"],
  store: ["id", "type", "title", "summary", "path", "serviceKey", "category", "tags", "date", "weight"],
  boost: { title: 3, summary: 1, tags: 1.5 },
  fuzzy: 0.2,
  prefix: true,
  limit: 50,
};

export const FEATURE_FLAGS = {
  USE_API: false, // Phase 1 = client-only
};
```

## /src/search/config/synonyms.ts

```ts
export const SYNONYMS: Record<string, string[]> = {
  "web dev": ["web development", "website"],
  "seo": ["search", "search engine optimization"],
  "video": ["film", "brand film", "production"],
};
```

---

## /src/search/core/types.ts

```ts
export type SearchType = "hub" | "service" | "subservice" | "portfolio" | "package";

export type SearchDoc = {
  id: string;
  type: SearchType;
  title: string;
  summary?: string;
  path: string;
  serviceKey?: string; // "video" | "web" | "seo" | "marketing" | "content" | "leadgen"
  hub?: string;
  category?: string;
  tags?: string[];
  date?: string;
  weight?: number; // manual boost
};

export type SearchFilters = {
  types?: SearchType[];
  serviceKey?: string;
  query?: string;
};
```

## /src/search/core/rank.ts

```ts
import type { SearchDoc } from "./types";

export function applyRanking(docs: SearchDoc[]): SearchDoc[] {
  // simple place to add recency/featured boosts
  return docs.map(d => ({
    ...d,
    weight: (d.weight ?? 1) + (d.date ? recencyBoost(d.date) : 0),
  }));
}

function recencyBoost(iso?: string): number {
  if (!iso) return 0;
  const days = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 30) return 1.5;
  if (days < 90) return 0.8;
  return 0;
}
```

## /src/search/core/sources.services.ts

```ts
import type { SearchDoc } from "./types";
// Import your taxonomy — adjust path to your real file:
import servicesTaxonomy from "@/data/taxonomy/servicesTaxonomy";

/**
 * Expect taxonomy like:
 * [{ slug:'video-production', title:'Video Production', services:[
 *    { slug:'production', title:'Production', subservices:[{slug:'b-roll', title:'B-Roll'}] }
 * ]}]
 */
export function servicesToDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const hub of servicesTaxonomy) {
    docs.push({
      id: `hub:${hub.slug}`,
      type: "hub",
      title: hub.title ?? hub.name ?? hub.slug,
      summary: hub.description ?? "",
      path: `/services/${hub.slug}`,
      serviceKey: hub.slug, // if your hub key equals serviceKey (else map)
      hub: hub.slug,
      tags: hub.tags ?? [],
      weight: 3,
    });

    for (const svc of hub.services ?? []) {
      docs.push({
        id: `service:${hub.slug}/${svc.slug}`,
        type: "service",
        title: svc.title ?? svc.name ?? svc.slug,
        summary: svc.description ?? "",
        path: `/services/${hub.slug}/${svc.slug}`,
        serviceKey: hub.slug,
        hub: hub.slug,
        tags: svc.tags ?? [],
        weight: 2,
      });

      for (const sub of svc.subservices ?? []) {
        docs.push({
          id: `subservice:${hub.slug}/${svc.slug}/${sub.slug}`,
          type: "subservice",
          title: sub.title ?? sub.name ?? sub.slug,
          summary: sub.description ?? "",
          path: `/services/${hub.slug}/${svc.slug}/${sub.slug}`,
          serviceKey: hub.slug,
          hub: hub.slug,
          tags: sub.tags ?? [],
          weight: 1,
        });
      }
    }
  }
  return docs;
}
```

## /src/search/core/sources.portfolio.ts

```ts
import type { SearchDoc } from "./types";
import portfolioItems from "@/data/portfolio";

export function portfolioToDocs(): SearchDoc[] {
  return portfolioItems.map((p: any) => ({
    id: `portfolio:${p.id}`,
    type: "portfolio",
    title: p.title,
    summary: p.description,
    path: p.service ? `/portfolio/${p.service}` : `/portfolio`,
    serviceKey: p.service,
    category: p.category,
    tags: p.tags,
    date: p.date,
    weight: p.featured ? 5 : 1,
  }));
}
```

## /src/search/core/sources.packages.ts

```ts
import type { SearchDoc } from "./types";
import { bundles } from "@/data/packages";

export function packagesToDocs(): SearchDoc[] {
  return bundles.map((b: any) => ({
    id: `package:${b.slug}`,
    type: "package",
    title: b.name,
    summary: b.description,
    path: `/packages/${b.slug}`,
    serviceKey: b.services?.[0], // pick a dominant service for filtering
    tags: [...(b.useCases ?? []), ...(b.services ?? [])],
    weight: 3,
  }));
}
```

## /src/search/core/indexer.ts

```ts
import type { SearchDoc } from "./types";
import { servicesToDocs } from "./sources.services";
import { portfolioToDocs } from "./sources.portfolio";
import { packagesToDocs } from "./sources.packages";
import { applyRanking } from "./rank";

export function buildDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [
    ...servicesToDocs(),
    ...portfolioToDocs(),
    ...packagesToDocs(),
  ];
  return applyRanking(docs);
}
```

## /src/search/core/buildIndex.ts

```ts
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { buildDocs } from "./indexer";

export function writeStaticIndex() {
  const docs = buildDocs();
  const dir = path.join(process.cwd(), "public", "search");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.json"), JSON.stringify(docs));
  console.log(`[search] Wrote ${docs.length} docs → /public/search/index.json`);
}
```

---

## /src/search/client/miniClient.ts

```ts
"use client";
import MiniSearch from "minisearch";
import { SEARCH_FIELDS } from "../config/search.config";
import type { SearchDoc, SearchFilters } from "../core/types";

let mini: MiniSearch<SearchDoc> | null = null;
let cache: SearchDoc[] | null = null;

export async function ensureMini(): Promise<MiniSearch<SearchDoc>> {
  if (mini) return mini;
  const res = await fetch("/search/index.json", { cache: "force-cache" });
  cache = await res.json();
  mini = new MiniSearch<SearchDoc>({
    fields: SEARCH_FIELDS.index,
    storeFields: SEARCH_FIELDS.store,
    searchOptions: { boost: SEARCH_FIELDS.boost, fuzzy: SEARCH_FIELDS.fuzzy, prefix: SEARCH_FIELDS.prefix },
  });
  mini.addAll(cache);
  return mini;
}

export async function runClientSearch(filters: SearchFilters) {
  const idx = await ensureMini();
  const q = filters.query?.trim() ?? "";
  const base = q ? idx.search(q) as SearchDoc[] : (cache ?? []);
  const filtered = base.filter((d) => {
    if (filters.types && !filters.types.includes(d.type)) return false;
    if (filters.serviceKey && d.serviceKey !== filters.serviceKey) return false;
    return true;
  });
  return filtered.slice(0, SEARCH_FIELDS.limit);
}
```

## /src/search/client/useSearch.ts

```ts
"use client";
import { useEffect, useState } from "react";
import type { SearchDoc, SearchFilters } from "../core/types";
import { runClientSearch } from "./miniClient";
import { debounce } from "./debounce";

export function useSearch(initial?: SearchFilters) {
  const [query, setQuery] = useState(initial?.query ?? "");
  const [results, setResults] = useState<SearchDoc[]>([]);
  const [loading, setLoading] = useState(false);

  const execute = async (f?: SearchFilters) => {
    setLoading(true);
    const out = await runClientSearch({ ...(initial || {}), ...(f || {}), query });
    setResults(out);
    setLoading(false);
  };

  useEffect(() => { execute(); /* eslint-disable-next-line */ }, []);
  const onQueryChange = debounce((value: string) => {
    setQuery(value);
    execute({ ...(initial || {}), query: value });
  }, 200);

  return { query, setQuery: onQueryChange, results, loading, search: execute };
}
```

## /src/search/client/highlight.ts

```ts
export function highlight(text = "", q = ""): JSX.Element | string {
  if (!q) return text;
  const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>
      )}
    </>
  );
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

## /src/search/client/debounce.ts

```ts
export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 200) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
```

---

## /src/search/ui/search.module.css

```css
.searchBanner { padding: 2rem 0; border-top: 1px solid var(--border); }
.searchRow { display: grid; grid-template-columns: 1fr auto; gap: .75rem; }
.searchInput { padding: .75rem 1rem; border: 1px solid var(--border); border-radius: .5rem; }
.searchBtn { padding: .75rem 1rem; border-radius: .5rem; border: 1px solid var(--border); background: var(--bg-elev); }
.filters { display:flex; gap:.5rem; margin:.75rem 0 1rem; flex-wrap: wrap; }
.results { display:grid; gap:.5rem; }
.resultCard { padding: .75rem 1rem; border:1px solid var(--border); border-radius:.5rem; }
.resultMeta { font-size:.8rem; opacity:.7; }
.empty { padding:.75rem; opacity:.7; }
```

## /src/search/ui/SearchBar.tsx

```tsx
"use client";
import styles from "./search.module.css";

export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search…" }:{
  value: string; onChange: (v: string)=>void; onSubmit: ()=>void; placeholder?: string;
}) {
  return (
    <div className={styles.searchRow}>
      <input
        className={styles.searchInput}
        value={value}
        onChange={(e)=> onChange(e.target.value)}
        onKeyDown={(e)=> e.key==="Enter" && onSubmit()}
        placeholder={placeholder}
        aria-label="Search"
      />
      <button className={styles.searchBtn} onClick={onSubmit}>Search</button>
    </div>
  );
}
```

## /src/search/ui/ResultCard.tsx

```tsx
"use client";
import Link from "next/link";
import styles from "./search.module.css";
import { highlight } from "../client/highlight";
import type { SearchDoc } from "../core/types";

export default function ResultCard({ doc, query }: { doc: SearchDoc; query?: string }) {
  return (
    <article className={styles.resultCard}>
      <Link href={doc.path}>
        <strong>{highlight(doc.title, query)}</strong>
      </Link>
      {doc.summary && <div>{highlight(doc.summary, query)}</div>}
      <div className={styles.resultMeta}>
        {doc.type} {doc.serviceKey ? `• ${doc.serviceKey}` : ""} {doc.category ? `• ${doc.category}` : ""}
      </div>
    </article>
  );
}
```

## /src/search/ui/ResultsList.tsx

```tsx
"use client";
import styles from "./search.module.css";
import ResultCard from "./ResultCard";
import type { SearchDoc } from "../core/types";

export default function ResultsList({ results, query }:{ results: SearchDoc[]; query?: string }) {
  if (!results.length) return null;
  return (
    <ul className={styles.results} role="listbox" aria-label="Search results">
      {results.map(r => (
        <li key={r.id}><ResultCard doc={r} query={query} /></li>
      ))}
    </ul>
  );
}
```

## /src/search/ui/Filters.tsx

```tsx
"use client";
import styles from "./search.module.css";
import type { SearchType } from "../core/types";

const TYPE_OPTS: {label:string; value:SearchType}[] = [
  { label: "Hubs", value: "hub" },
  { label: "Services", value: "service" },
  { label: "Subservices", value: "subservice" },
  { label: "Portfolio", value: "portfolio" },
  { label: "Packages", value: "package" },
];

const SERVICE_OPTS = [
  { label:"Video", value:"video" }, { label:"Web", value:"web" }, { label:"SEO", value:"seo" },
  { label:"Marketing", value:"marketing" }, { label:"Content", value:"content" }, { label:"Lead Gen", value:"leadgen" },
];

export function Filters({
  types, setTypes, serviceKey, setServiceKey
}:{
  types?: SearchType[]; setTypes?: (t:SearchType[])=>void;
  serviceKey?: string; setServiceKey?: (k:string)=>void;
}) {
  return (
    <div className={styles.filters}>
      {!!setTypes && TYPE_OPTS.map(opt => (
        <label key={opt.value}><input
          type="checkbox"
          checked={!!types?.includes(opt.value)}
          onChange={(e)=>{
            if (!types) return;
            setTypes(e.target.checked ? [...types, opt.value] : types.filter(t=>t!==opt.value));
          }}
        /> {opt.label}</label>
      ))}
      {!!setServiceKey && (
        <select value={serviceKey ?? ""} onChange={(e)=> setServiceKey?.(e.target.value)}>
          <option value="">All Services</option>
          {SERVICE_OPTS.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </div>
  );
}
```

## /src/search/ui/SearchBanner.tsx

```tsx
"use client";
import { useState } from "react";
import { useSearch } from "../client/useSearch";
import type { SearchType } from "../core/types";
import SearchBar from "./SearchBar";
import ResultsList from "./ResultsList";
import { Filters } from "./Filters";
import styles from "./search.module.css";

export default function SearchBanner({ types: initialTypes, serviceKey: initialService }: {
  types?: SearchType[]; serviceKey?: string;
}) {
  const [types, setTypes] = useState<SearchType[]>(initialTypes ?? ["hub","service","subservice","portfolio","package"]);
  const [serviceKey, setServiceKey] = useState<string | undefined>(initialService);
  const { query, setQuery, results, loading, search } = useSearch({ types, serviceKey, query:"" });

  return (
    <section className={styles.searchBanner}>
      <h2>Search</h2>
      <SearchBar value={query} onChange={setQuery} onSubmit={()=> search({ types, serviceKey })} />
      <Filters types={types} setTypes={setTypes} serviceKey={serviceKey} setServiceKey={setServiceKey} />
      {loading ? <div>Searching…</div> : <ResultsList results={results} query={query} />}
    </section>
  );
}
```

## /src/search/ui/CommandPalette.tsx  *(optional global ⌘K)*

```tsx
"use client";
import { useEffect, useState } from "react";
import { useSearch } from "../client/useSearch";
import styles from "./search.module.css";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results, search } = useSearch({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className={styles.palette}>
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          autoFocus
          placeholder="Search everything…"
          value={query}
          onChange={(e)=> setQuery(e.target.value)}
          onKeyDown={(e)=> e.key==="Enter" && search({})}
        />
        <button className={styles.searchBtn} onClick={()=> setOpen(false)}>Close</button>
      </div>
      <ul className={styles.results}>
        {results.map(r => (
          <li key={r.id}>
            <a href={r.path}><strong>{r.title}</strong> <small>({r.type})</small></a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

# 🛠 Build step (generate the static index)

Create `scripts/build-search.ts`:

```ts
// scripts/build-search.ts
import { writeStaticIndex } from "@/search/core/buildIndex";
writeStaticIndex();
```

In **package.json**:

```json
{
  "scripts": {
    "prebuild": "ts-node --compiler-options '{\"module\":\"CommonJS\",\"baseUrl\":\".\"}' scripts/build-search.ts",
    "build": "next build"
  }
}
```

> If you don’t use ts-node, compile that tiny script or run it with `tsx`.

---

# 🔌 How to use on pages

**/app/services/page.tsx**

```tsx
import SearchBanner from "@/search/ui/SearchBanner";

export default function ServicesIndex() {
  return (
    <>
      {/* hero ... */}
      <SearchBanner types={["hub","service","subservice"]} />
      {/* L1 cards ... */}
    </>
  );
}
```

**/app/portfolio/page.tsx**

```tsx
<SearchBanner types={["portfolio"]} />
```

**/app/packages/page.tsx**

```tsx
<SearchBanner types={["package"]} />
```

**Global (optional)**

```tsx
// in layout or navbar
import CommandPalette from "@/search/ui/CommandPalette";
<CommandPalette />
```

---

That’s it — you now have a **working, upgradeable search**:

* Phase 1: static `/public/search/index.json` + MiniSearch in the browser.
* Later: flip to an API or Meilisearch with minimal changes (keep the same `SearchDoc` shape and UI).
