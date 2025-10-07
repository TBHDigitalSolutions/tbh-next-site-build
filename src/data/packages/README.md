# Runtime Package Data (`src/data/packages`)

> **Do not edit anything inside `__generated__/` by hand.**  
> All files are built from `content/packages/catalog/**/public.mdx`.

## What lives here

```

src/data/packages/
├─ **generated**/                      # 👈 build outputs only (machine-written)
│   ├─ index.json                      # tiny catalog for hub/search
│   ├─ routes.json                     # slug → "@/packages/registry/<service>/<slug>/base"
│   ├─ cards.json                      # (optional) precomputed card props
│   ├─ health.json                     # warnings/errors per slug (doctor report)
│   ├─ hashes.json                     # mdx+assets content hashes (incremental build)
│   ├─ packages/
│   │   └─ <slug>.json                 # per-package “Package Data File” (snake_case)
│   └─ search/
│       └─ unified.search.json         # (optional) flattened search index
└─ index.ts                            # typed accessors + loaders

````

### File purposes

| File | Purpose | Used by |
| ---- | ------- | ------ |
| `index.json` | tiny rows for hub grid & filters | `app/packages/page.tsx` |
| `routes.json` | `slug → ESM path` for lazy detail imports | `app/packages/[bundles]/page.tsx` |
| `cards.json` | uniform card props (precomputed) | `app/packages/page.tsx` |
| `health.json` | authoring warnings/errors | CI dashboards |
| `hashes.json` | change detection for incremental builds | build scripts |
| `packages/<slug>.json` | Package Data File (snake_case) | `src/packages/registry/**/base.ts`, PDFs |
| `search/unified.search.json` | client-friendly search index | search UI |

## How it’s produced

Run the build pipeline:

```bash
npm run data:build     # MDX → per-slug JSON + index + health + hashes
npm run routes:build   # routes.json
npm run cards:build    # cards.json
npm run data:validate  # Zod-validate every generated JSON
````

Or all-in-one:

```bash
npm run data:all
```

## Developer ergonomics

* Import the catalog/cards directly:

  ```ts
  import { catalog, cards } from "@/data/packages";
  ```

* Lazy-load a single package JSON:

  ```ts
  import { loadPackageRaw } from "@/data/packages";

  const pkgSnake = await loadPackageRaw("<slug>"); // snake_case JSON
  // transform to camelCase and parse with PackageSchema before use
  ```

* Optional: unified search index (if your build emits it):

  ```ts
  import { loadUnifiedSearch } from "@/data/packages";
  const search = await loadUnifiedSearch(); // null if missing
  ```

## Editing rules

* Authors **only** touch `content/packages/catalog/**/public.mdx`.
* Platform/dev maintain the build scripts and schemas.
* `__generated__/` is always fully overwritten by the builder.

## Bootstrap tips

* Keep empty directories in Git with `.gitkeep`:

  ```
  src/data/packages/__generated__/packages/.gitkeep
  src/data/packages/__generated__/search/.gitkeep
  ```

* Enable `resolveJsonModule` in `tsconfig.json` so TypeScript can import JSON.

## Validation

All per-slug JSON should conform to the Zod runtime schema:
`src/packages/lib/package-schema.ts`. A build step (or `registry/base.ts`)
should parse the JSON before it reaches React components.

---

```

---

# .gitkeep placeholders (recommended)

Create empty files so the folders exist in Git before the first build:

- `src/data/packages/__generated__/packages/.gitkeep`
- `src/data/packages/__generated__/search/.gitkeep`

---

If you want, I can also drop in the **builder** scripts (`build-package-data.ts`, `build-routes.ts`, `build-cards.ts`, etc.) wired to your Zod schema and hashing rules so `npm run data:all` works out of the box.
::contentReference[oaicite:0]{index=0}

