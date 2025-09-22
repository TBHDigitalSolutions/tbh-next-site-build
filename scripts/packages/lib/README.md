# `scripts/packages/lib` — Build Pipeline for Packages Content

This folder contains small, framework-agnostic build utilities that turn your MD/MDX marketing pages + data into searchable, enriched JSON for the app.

It produces three generated artifacts:

* `src/data/packages/__generated__/content.map.json`
* `src/data/packages/__generated__/bundles.enriched.json`
* `src/data/packages/__generated__/packages.search.json`

They power bundle pages, service hubs, and in-app search.

---

## What each script does

| Script                  | Purpose                                                                                                                                              | Inputs                                                                         | Output                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `compile-mdx.ts`        | Compiles MD/MDX in `src/content/packages/**` to HTML + metadata keyed by **slug**. Extracts `html`, `excerpt`, `wordCount`, `updatedAt`, `headings`. | MD/MDX under `src/content/packages/{bundles,overviews,services}/**/*.{md,mdx}` | `src/data/packages/__generated__/content.map.json` (object keyed by slug)                  |
| `attach-content.ts`     | Attaches compiled HTML/metadata to bundles (by slug).                                                                                                | `src/data/packages/bundles.json`, `__generated__/content.map.json`             | `src/data/packages/__generated__/bundles.enriched.json` (array of bundles with `.content`) |
| `build-search-index.ts` | Builds unified search index (bundles + non-bundle docs). Strips HTML to plain text.                                                                  | `__generated__/bundles.enriched.json`, `__generated__/content.map.json`        | `src/data/packages/__generated__/packages.search.json` (array of search docs)              |
| `fs-helpers.ts`         | Small shared helpers (`readJson`, `writeJson`, `ensureDir`, etc.).                                                                                   | —                                                                              | —                                                                                          |

> The pipeline order is always: **compile → attach → index**.

---

## Prerequisites (npm-first)

* **Node.js 18+**
* **TypeScript runner** (choose one)

  * `ts-node` (`npx ts-node --transpile-only …`) **← used in examples**
  * or `tsx` (`npx tsx …`)

Install dev dependencies once:

```bash
npm i -D fast-glob gray-matter unified remark-parse remark-gfm remark-mdx remark-rehype rehype-slug rehype-stringify he
npm i -D ts-node              # or: npm i -D tsx
npm i -D chokidar-cli         # only if you use the watch script
```

> Already using pnpm or yarn? You can keep them—just swap `npm` for your tool of choice. There’s no requirement to switch.

---

## Add to `package.json`

```json
{
  "scripts": {
    // 1) Compile MDX → content.map.json
    "packages:compile-mdx": "ts-node --transpile-only scripts/packages/lib/compile-mdx.ts",

    // 2) Attach compiled content to bundles → bundles.enriched.json
    "packages:attach-content": "ts-node --transpile-only scripts/packages/lib/attach-content.ts",

    // 3) Build search index → packages.search.json
    "packages:build-search": "ts-node --transpile-only scripts/packages/lib/build-search-index.ts",

    // Convenience: run all three in order
    "packages:build": "npm run packages:compile-mdx && npm run packages:attach-content && npm run packages:build-search",

    // Optional: watch-like loop (rerun build on content changes)
    "packages:dev": "chokidar 'src/content/packages/**/*.{md,mdx}' -c \"npm run packages:build\""
  }
}
```

> Prefer `tsx`? Replace `ts-node --transpile-only` with `tsx`.

---

## How & when to run

### Typical local workflow

Run after editing/adding any Markdown/MDX in `src/content/packages/**` or changing bundle data in `src/data/packages/bundles.json`:

```bash
npm run packages:build
```

This regenerates all three files in `src/data/packages/__generated__/`.

### CI usage

```bash
npm ci
npm run packages:build
```

Cache the `__generated__` directory if your deploy expects baked artifacts.

---

## Script details & CLI flags

### 1) `compile-mdx.ts`

* **Scans:** `src/content/packages/{bundles,overviews,services}/**/*.{md,mdx}`
* **Emits:** `src/data/packages/__generated__/content.map.json` (keyed by `slug`)
* **Extracts per doc:**

  * `html` (MDX → HTML; MDX JSX/ESM nodes are stripped for safe static HTML)
  * `excerpt` (first paragraph or \~160 chars, word-safe trimmed)
  * `wordCount` (ignores code blocks)
  * `updatedAt` (`lastUpdated` frontmatter → fallback to file mtime; normalized to `YYYY-MM-DD`)
  * `headings` (depth + text + id when present)

**Run:**

```bash
npx ts-node --transpile-only scripts/packages/lib/compile-mdx.ts
```

**Flags:**

```bash
# custom output path
npx ts-node --transpile-only scripts/packages/lib/compile-mdx.ts \
  --out src/data/packages/__generated__/content.map.json
```

**Recommended frontmatter:**

```yaml
---
slug: seo-services-featured
title: SEO Services Featured Packages
summary: Top 3 SEO solutions addressing the most critical search visibility challenges.
lastUpdated: 2025-01-15
---
```

> Missing `slug/title/summary` is tolerated (derived from file/heading), but adding them produces better excerpts and titles.

---

### 2) `attach-content.ts`

* **Reads:** `src/data/packages/bundles.json`, `__generated__/content.map.json`
* **Writes:** `__generated__/bundles.enriched.json`

Attaches for each matching `bundle.slug`:

```ts
bundle.content = { html, excerpt, wordCount, updatedAt }
```

**Run:**

```bash
npx ts-node --transpile-only scripts/packages/lib/attach-content.ts
```

**Flags:**

```bash
npx ts-node --transpile-only scripts/packages/lib/attach-content.ts \
  --bundles src/data/packages/bundles.json \
  --content src/data/packages/__generated__/content.map.json \
  --out     src/data/packages/__generated__/bundles.enriched.json
```

---

### 3) `build-search-index.ts`

* **Reads:** `__generated__/bundles.enriched.json`, `__generated__/content.map.json`
* **Writes:** `__generated__/packages.search.json` (array)
* **Indexed content:**

  * **Bundles** (always): `title`, `subtitle`, `summary`, `category`, `tags`, `excerpt`, `updatedAt`, `headings`, and full `contentText` (HTML stripped & entities decoded).
  * **Non-bundle docs** (services/overviews) are included by default. Toggle with `--includeDocs`.

**Run:**

```bash
npx ts-node --transpile-only scripts/packages/lib/build-search-index.ts
```

**Flags:**

```bash
npx ts-node --transpile-only scripts/packages/lib/build-search-index.ts \
  --bundles src/data/packages/__generated__/bundles.enriched.json \
  --content src/data/packages/__generated__/content.map.json \
  --out     src/data/packages/__generated__/packages.search.json \
  --includeDocs 1   # or 0 to exclude service/overview docs
```

**Search doc shape (example):**

```json
{
  "id": "bundle:local-business-growth",
  "docType": "bundle",
  "slug": "local-business-growth",
  "title": "Local Business Growth",
  "subtitle": "Be discovered locally and convert more nearby customers with a repeatable engine.",
  "summary": "Promo video, local SEO, landing page, GBP optimization, and ongoing ads/content to keep demand flowing.",
  "category": "local",
  "tags": ["local", "seo", "video", "ads", "landing-page"],
  "excerpt": "Dominate your local market with a complete online presence…",
  "updatedAt": "2025-01-15",
  "wordCount": 1420,
  "headings": ["Perfect For", "The Problem We Solve", "Our Solution", "Implementation Timeline", "Expected Results (90 Days)"],
  "contentText": "Local Business Growth Package Dominate your local market…"
}
```

---

## File contracts (quick reference)

* **`content.map.json`** — **object** keyed by slug

  ```json
  {
    "seo-services-featured": {
      "slug": "seo-services-featured",
      "title": "SEO Services Featured Packages",
      "summary": "Top 3 SEO solutions…",
      "html": "<h1>SEO Services Featured Packages</h1>…",
      "excerpt": "These featured SEO packages solve…",
      "wordCount": 980,
      "updatedAt": "2025-01-15",
      "headings": [{ "depth": 2, "text": "Overview", "id": "overview" }]
    }
  }
  ```

* **`bundles.enriched.json`** — **array** of bundle objects with:

  ```json
  {
    "slug": "local-business-growth",
    "title": "Local Business Growth",
    "summary": "Promo video, local SEO…",
    "content": {
      "html": "<h1>Local Business Growth Package</h1>…",
      "excerpt": "Dominate your local market…",
      "wordCount": 1420,
      "updatedAt": "2025-01-15"
    }
  }
  ```

* **`packages.search.json`** — **array** of search docs (bundles + docs), see example above.

---

## When to run which

* **Changed or added content page** (`src/content/packages/**`):
  Run `packages:compile-mdx` → `packages:attach-content` → `packages:build-search`
  (or just `packages:build`).

* **Changed bundle data** (`src/data/packages/bundles.json`):
  Run `packages:attach-content` → `packages:build-search`
  (or `packages:build`).

* **Changed search behavior** (scoring, fields, etc.):
  Run `packages:build-search`.

---

## Common pitfalls & tips

* **Slug mismatch:** `attach-content` matches by `bundle.slug`. Ensure MDX frontmatter `slug` matches the bundle’s `slug`.
* **Dates:** `updatedAt` is normalized to `YYYY-MM-DD`. Provide `lastUpdated` in frontmatter, or file mtime is used.
* **Headings:** H1–H3 are most useful; the compiler collects standard headings and preserves `id` when available.
* **Entities/HTML:** The index strips tags and decodes HTML entities using `he` for higher-quality search text.
* **Exit codes:** If nothing compiles or nothing gets indexed, scripts set a non-zero `process.exitCode` (CI will fail).

---

## `fs-helpers.ts` (shared utilities)

Centralizes small helpers used by scripts:

* `readJson<T>(file: string): Promise<T>`
* `writeJson(file: string, data: unknown): Promise<void>`
* `ensureDir(dir: string): Promise<void>`

Use these instead of duplicating `fs` boilerplate across scripts.

---

## Suggested developer flow (npm)

```bash
# 1) Edit .mdx or bundle data
# 2) Rebuild artifacts
npm run packages:build

# 3) Start your dev server and verify content/search
npm run dev
```

---

## Do I need pnpm or yarn?

No. If you’ve been using **npm**, keep using it—this pipeline works perfectly with npm.
If you later feel pain from install time or disk usage, consider **pnpm**; otherwise there’s no reason to switch.
---

```json
{
  "scripts": {
    "packages:clean": "rm -rf src/data/packages/__generated__",
    "packages:compile-mdx": "tsx scripts/packages/lib/compile-mdx.ts",
    "packages:attach-content": "tsx scripts/packages/lib/attach-content.ts",
    "packages:build-search": "tsx scripts/packages/lib/build-search-index.ts",
    "packages:export-packages": "tsx scripts/packages/lib/build-packages-json.ts",
    "packages:build": "npm run packages:compile-mdx && npm run packages:attach-content && npm run packages:build-search && npm run packages:export-packages",
    "packages:rebuild": "npm run packages:clean && npm run packages:build",
    "packages:dev": "chokidar 'src/content/packages/**/*.{md,mdx}' 'src/data/packages/{bundles.json,addOns.json,featured.json}' 'src/data/packages/**/*-packages.ts' -c 'npm run packages:build'"
  }
}
```

### Run it

```bash
npm run packages:export-packages
```

### (Optional) Script chain

If you want `packages.json` included in your full build, update your script:

```json
"packages:build": "npm run packages:compile-mdx && npm run packages:attach-content && npm run packages:build-search && npm run packages:export-packages"
```

Everything else in your pipeline can stay as-is.

Re-run the same sequence:

```bash
npm run packages:compile-mdx
npm run packages:attach-content
npm run packages:build-search
npm run packages:export-packages
```

### Expected logs (happy path)

* **Compile MDX:** no “Duplicated slugs”
* **Attach content:** “Attached content: 7” and **no** “No content match”
* **Build search:** “Content entries: 24” (all featured pages counted)
* **Export packages:** “Written: 18” (unchanged), and no warnings

If you want, I can also provide a tiny guard script to **fail the build on duplicate slugs** with file paths, so this never slips in again.
