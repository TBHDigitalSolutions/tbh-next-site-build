Absolutely—here’s a clean, domain-specific **Search** module you can drop into your repo. It’s organized so you can start **client-only** (static index) and later upgrade to an **API** or **Meilisearch/Typesense** without changing your UI.

---

# 📁 Proposed Directory Layout

```
/src/search                         # ← everything search lives here
├── config/
│   ├── search.config.ts            # global config: boosts, result limits, feature flags
│   └── synonyms.ts                 # optional: synonyms/aliases map
├── core/
│   ├── types.ts                    # SearchDoc, SearchType, filters
│   ├── indexer.ts                  # normalize SSOT → SearchDoc[]
│   ├── buildIndex.ts               # build-time: writes /public/search/index.json (Phase 1)
│   ├── sources.services.ts         # adapters: services taxonomy → SearchDoc[]
│   ├── sources.portfolio.ts        # adapters: portfolio items → SearchDoc[]
│   ├── sources.packages.ts         # adapters: bundles → SearchDoc[]
│   └── rank.ts                     # weights, boosts, scoring helpers
├── client/
│   ├── miniClient.ts               # MiniSearch/Fuse loader for client-side search (Phase 1)
│   ├── useSearch.ts                # React hook for querying + state
│   ├── highlight.ts                # highlight matched terms in snippets
│   └── debounce.ts                 # small debounce util for input
├── server/                         # used in Phase 2/3
│   ├── searchService.ts            # shared server search (MiniSearch/Meili/Typesense switch)
│   └── meiliClient.ts              # optional client for Meilisearch/Typesense
├── ui/                             # visual components only (no data-fetch in these)
│   ├── SearchBar.tsx               # input field + submit, small inline variant
│   ├── SearchBanner.tsx            # big banner variant with results list (scoped)
│   ├── CommandPalette.tsx          # Cmd/Ctrl+K modal overlay global search
│   ├── Filters.tsx                 # type/service filters (chips/toggles)
│   ├── ResultsList.tsx             # list wrapper (a11y roles)
│   ├── ResultCard.tsx              # single result card (title, summary, meta)
│   ├── EmptyState.tsx              # zero results message
│   └── search.module.css           # shared styles for search UI
└── index.ts                        # re-exports: easy imports for pages/components

/public/search
└── index.json                      # generated static index (Phase 1)
```

---

# 📦 What Each File Does (quick)

## Config

* **search.config.ts** — central knobs: fields to index, boosts, fuzzy/prefix settings, default limit, feature flags (e.g., `USE_API=true`).
* **synonyms.ts** — optional dictionary (e.g., `"web dev" -> "web development"`).

## Core

* **types.ts** — `SearchDoc`, `SearchType`, `SearchFilters`.
* **indexer.ts** — takes arrays from sources and merges to a single `SearchDoc[]`.
* **buildIndex.ts** — writes `/public/search/index.json` at build time (Phase 1).
* **sources.services.ts** — reads your services taxonomy (L1/L2/L3) → docs.
* **sources.portfolio.ts** — reads all portfolio items → docs.
* **sources.packages.ts** — reads package bundles → docs.
* **rank.ts** — applies weights (e.g., featured items get +weight), date recency boosts, etc.

## Client

* **miniClient.ts** — loads `/public/search/index.json`, initializes MiniSearch (or Fuse), and performs client-side queries.
* **useSearch.ts** — React hook: `query`, `results`, `loading`, `run(filters)`.
* **highlight.ts** — wraps matched terms with `<mark>`.
* **debounce.ts** — small debounce util for input change.

## Server (Phase 2/3)

* **searchService.ts** — centralized “switchboard” to choose MiniSearch on server or Meili/Typesense. Exports a single `search(filters)` for `/api/search`.
* **meiliClient.ts** — optional: Meilisearch/Typesense client setup.

> API route (if/when you enable server search):
>
> ```
> /app/api/search/route.ts   // calls searchService.ts
> ```

## UI

* **SearchBar.tsx** — minimal inline input w/ search button (good for headers).
* **SearchBanner.tsx** — large section: input + filters + top-N results; accepts `types` and `serviceKey` props for scoping.
* **CommandPalette.tsx** — global modal (⌘K) that uses `useSearch` to query all content.
* **Filters.tsx** — checkboxes/chips to filter by `type` (services/portfolio/packages) and by `serviceKey` (video/web/seo…).
* **ResultsList.tsx / ResultCard.tsx / EmptyState.tsx** — presentational only, a11y-friendly.

---

# 🧠 Implementation Notes (how it all works together)

## Build-time (Phase 1)

* In your build script (e.g., `scripts/build-search.ts`), call:

  ```ts
  import { writeStaticIndex } from "@/search/core/buildIndex";
  writeStaticIndex();
  ```
* This imports your SSOT data files:

  * `/src/data/taxonomy/servicesTaxonomy` (or your services source)
  * `/src/data/portfolio/index.ts`
  * `/src/data/packages/index.ts`
* It **normalizes** them via `sources.*.ts` → `SearchDoc[]`, merges in `indexer.ts`, applies boosts in `rank.ts`, then writes `/public/search/index.json`.

## Client-side search (Phase 1)

* `SearchBanner` (or `CommandPalette`) calls `useSearch`, which uses `miniClient` to fetch `/search/index.json`, build an index in the browser, and run queries.
* Scoped examples:

  ```tsx
  // On /services
  <SearchBanner types={["hub","service","subservice"]} />

  // On /portfolio
  <SearchBanner types={["portfolio"]} />

  // On /packages
  <SearchBanner types={["package"]} />

  // On /services/video-production hub page
  <SearchBanner types={["service","subservice","portfolio","package"]} serviceKey="video" />
  ```

## Server/API search (Phase 2)

* Create `/app/api/search/route.ts`:

  ```ts
  import { NextResponse } from "next/server";
  import { search } from "@/search/server/searchService";
  export async function GET(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const types = url.searchParams.getAll("type");       // optional
    const serviceKey = url.searchParams.get("service");  // optional
    const results = await search({ query: q, types, serviceKey });
    return NextResponse.json(results);
  }
  ```
* Update `useSearch` to hit `/api/search?q=...` when `USE_API=true` (from `search.config.ts`).

## External engine (Phase 3)

* Run Meilisearch/Typesense.
* Modify `searchService.ts` to index/push documents on build/deploy.
* UI and types remain the same.

---

# 🔑 Data Fields to Index (recommended defaults)

From `search.config.ts`:

```ts
export const SEARCH_FIELDS = {
  index: ["title", "summary", "tags", "serviceKey", "category"],
  store: ["id", "type", "title", "summary", "path", "serviceKey", "category", "tags", "date"],
  boost: { title: 3, summary: 1, tags: 1.5 },
  fuzzy: 0.2,
  prefix: true,
  limit: 50,
};
```

---

# 🧭 Usage: page-level wiring

* **/services/page.tsx**

  ```tsx
  import SearchBanner from "@/search/ui/SearchBanner";
  ...
  <SearchBanner types={["hub","service","subservice"]} />
  ```

* **/portfolio/page.tsx**

  ```tsx
  <SearchBanner types={["portfolio"]} />
  ```

* **/packages/page.tsx**

  ```tsx
  <SearchBanner types={["package"]} />
  ```

* **Global Command Palette**

  ```tsx
  // In your root layout or top navbar
  import CommandPalette from "@/search/ui/CommandPalette";
  <CommandPalette />
  ```

---

# ✅ A11y & UX checklist

* Input has `aria-label` and visible label/placeholder.
* Results `<ul role="listbox">` with keyboard nav (Up/Down/Enter, Esc to close in modal).
* Live region (`aria-live="polite"`) announces result count.
* `<mark>` used to highlight matched tokens.
* Debounce input (200–300ms).
* Respect `prefers-reduced-motion` for modal animations.

---

# 🧪 Testing (nice to have)

```
/src/search/__tests__
├── indexer.test.ts           # services/portfolio/packages adapters produce correct docs
├── miniClient.test.ts        # searching works with sample index
└── useSearch.test.tsx        # hook integrates correctly
```

---

If you want, I can scaffold a **starter bundle** of these files with minimal working code (MiniSearch variant), so you can paste it straight into `/src/search` and be live in Phase 1 today.
