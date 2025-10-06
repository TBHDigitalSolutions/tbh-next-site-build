# `src/packages/lib/registry/readme.md`

## What this folder is

This folder contains the **single-purpose Registry Loader** that your build and SSG code uses to read package entries from the on-disk registry and validate them against your **single source of truth** schema.

* Loader file: [`src/packages/lib/registry/loader.ts`](../registry/loader.ts)
* It does **one** job: discover `content.generated.json` files under `src/packages/registry/**`, parse them, and validate them with `parsePackage` from `src/packages/lib/package-schema.ts`.

> Keep all “marketing helpers,” “featured selections,” or service metadata elsewhere. This loader is deliberately **narrow** so it stays easy to test and reason about.

---

## Registry conventions

```
src/
└── packages/
    └── registry/
        ├── <service-dir-1>/
        │   └── <package-slug>/content.generated.json
        ├── <service-dir-2>/
        │   └── <package-slug>/content.generated.json
        └── ...
```

Examples:

* `src/packages/registry/lead-generation-packages/lead-routing-distribution/content.generated.json`
* `src/packages/registry/content-production-packages/explainer-video-starter/content.generated.json`

Each `content.generated.json` must conform to the runtime schema defined in `src/packages/lib/package-schema.ts` (i.e., `PackageSchema`). The loader **enforces** that at read time.

How `content.generated.json` gets there:

```
MDX (docs/packages/.../public.mdx)
  → parse + normalize (mdx-frontmatter-schema.ts)
    → transform to runtime Package object
      → write content.generated.json (your build script)
```

---

## When to use the loader

* **Next.js SSG**: generate static params and prefetch package data.
* **CI / build scripts**: validate the entire registry and fail with clear errors.
* **CLI utilities**: index packages by slug or collect routes.
* **Any code** that needs a **validated** runtime `Package` object.

**Do not** put UI logic, pricing math, or copy/CTA decisions here.

---

## API surface (typed)

All functions are pure, framework-agnostic, and Node-compatible.

```ts
import {
  DEFAULT_REGISTRY_ROOT,
  REGISTRY_FILENAME,
  type RegistryEntry,
  type BulkLoadResult,

  discoverPackageEntries,
  loadPackageByFile,
  loadPackageBySlug,
  loadBySlugAcrossServices,
  loadAllPackages,

  collectPackageSlugs,
  collectPackageRoutes,
  indexBySlug,

  loadPackageByFileCached,
  clearLoaderCache,
} from "@/packages/lib/registry/loader";
```

### Types

* **`PackageSchemaType`** – validated runtime object from `package-schema.ts`.
* **`RegistryEntry`** – `{ jsonPath, dir, serviceDir, slug }`.
* **`BulkLoadResult`** – `{ items: Array<{entry, data}>, errors: Array<{...}> }`.

---

## Usage recipes

### 1) Next.js — static params and data preloading

```ts
// app/packages/[slug]/page.tsx (Next.js /app router)
import { loadBySlugAcrossServices, collectPackageSlugs } from "@/packages/lib/registry/loader";

export async function generateStaticParams() {
  const slugs = await collectPackageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const result = await loadBySlugAcrossServices(params.slug);
  if (!result) return notFound();

  const { data: pkg } = result; // ← already validated PackageSchemaType
  // render with your mappers or directly
  return <pre>{JSON.stringify(pkg, null, 2)}</pre>;
}
```

### 2) Build script — validate everything

```ts
// scripts/validate-registry.ts
import { loadAllPackages } from "@/packages/lib/registry/loader";

const { items, errors } = await loadAllPackages();

console.log(`Valid packages: ${items.length}`);
if (errors.length) {
  console.error(`Invalid packages: ${errors.length}`);
  for (const e of errors) {
    console.error(`\n- ${e.file}`);
    console.error(e.message);
  }
  process.exit(1);
}
```

### 3) Quick index by slug

```ts
import { indexBySlug } from "@/packages/lib/registry/loader";

const map = await indexBySlug();
const leadRouting = map["lead-routing-distribution"]; // PackageSchemaType | undefined
```

### 4) Load by `(serviceDir, slug)`

```ts
import { loadPackageBySlug } from "@/packages/lib/registry/loader";

const { data } = await loadPackageBySlug(
  "lead-generation-packages",
  "lead-routing-distribution"
);
```

---

## Error handling

The loader validates every JSON against your SSOT schema:

* On **single-file** loads, it throws an `Error` whose message includes:

  * The file path
  * Zod issues (if available), including property paths and human text
* On **bulk loads**, it **does not throw**. You get:

  * `items` – all valid packages
  * `errors` – an array of detailed error objects

**Example error message (trimmed):**

```
Schema validation failed for: /.../content.generated.json
  [1] includes → Provide either includes (groups) or includesTable
  [2] price → monthly: Too small: expected number to be > 0
```

---

## Configuration knobs

* **`DEFAULT_REGISTRY_ROOT`**
  Defaults to `process.cwd()/src/packages/registry`. Pass `opts.registryRoot` to any public function to override per call.

* **`REGISTRY_FILENAME`**
  The generated file name; defaults to `content.generated.json`.

* **Discovery** uses `fast-glob` and a platform-stable glob pattern:

  ```
  <registryRoot>/**/content.generated.json
  ```

---

## How this integrates with the schema modules

* **Runtime schema**: `src/packages/lib/package-schema.ts`

  * Exports `parsePackage` and the `PackageSchemaType` runtime type.
  * The loader depends on this and **never** duplicates the schema.

* **Authoring schema**: `src/packages/lib/mdx-frontmatter-schema.ts`

  * Used during the build step that transforms `public.mdx` → runtime object.
  * That step writes `content.generated.json`. The loader consumes it.

---

## Typical end-to-end pipeline

```mermaid
flowchart LR
  A[docs/.../public.mdx] --> B[Parse frontmatter\n(MdxFrontmatterSchema)]
  B --> C[Transform → runtime\nfrontmatterToPackage()]
  C --> D[Validate runtime\nPackageSchema.parse]
  D --> E[Write content.generated.json]
  E --> F[Read & validate\nregistry/loader.ts]
  F --> G[Map to UI props\nmappers/package-mappers.ts]
  G --> H[Render components]
```

* **This loader** sits at **F**.
* UI surfaces should use the **mappers** in `src/packages/lib/mappers/package-mappers.ts` to convert the validated runtime object to component props.

---

## Components & scripts that should use the loader

* **Next.js pages** (detail page, listing pages) – to grab validated data.
* **Static params generation** – `collectPackageSlugs()` / `collectPackageRoutes()`.
* **Build/CI** – `loadAllPackages()` to validate the entire registry.
* **Indexer scripts** – `indexBySlug()` for O(1) lookup by slug.
* **Admin/ops scripts** – `loadPackageByFile()` for targeted reads.
* **Performance-sensitive** loops – `loadPackageByFileCached()` (opt-in cache).

> Components themselves should not import the loader directly in the browser. Use it server-side (build/SSG/SSR) and pass the data to your components or map it with `package-mappers.ts` first.

---

## Caching

`loadPackageByFileCached()` provides a **simple in-memory cache** keyed by the absolute file path.
Use `clearLoaderCache()` if your build regenerates files and you need to invalidate.

* It’s intentionally simple—**no** TTLs or file watchers.
* Use it in **build scripts** or **Node-only** contexts.

---

## Testing tips

* Unit test `parsePackage` and your content separately using fixtures.
* Integration test the loader on a **temp registry root**:

  1. Create a temp folder that mirrors the registry structure.
  2. Write a valid and an invalid `content.generated.json`.
  3. Call `loadAllPackages({ registryRoot: temp })` and assert `items`/`errors`.

---

## Migration notes (if you used `src/packages/lib/registry.ts` before)

* The old `registry.ts` mixed **service metadata**, **featured slugs**, and **registry loading**.
* This loader intentionally **drops** that scope: it performs **I/O + validation** only.
* Move any marketing/service helpers to a separate module (e.g., `src/packages/lib/registry-meta.ts`).
* Switch callers to:

  * `discoverPackageEntries` / `loadAllPackages` for reading & validating
  * `collectPackageSlugs` / `collectPackageRoutes` for SSG
  * `indexBySlug` for script-time fast lookups

---

## Troubleshooting

* **“Schema validation failed … includes … Provide either includes (groups) or includesTable”**
  Ensure your MDX frontmatter or generated JSON includes **one** of:

  * `includes` (groups), or
  * `includesTable` (table fallback)

* **“Invalid JSON (…): …”**
  The file is malformed. Re-run the build step that writes `content.generated.json` and inspect that file on disk.

* **Nothing discovered**
  Verify `src/packages/registry/**/content.generated.json` exists, or pass `opts.registryRoot` pointing at the right root.

---

## Install notes

The loader relies on:

* **Node 18+** (for `node:` imports)
* **`fast-glob`** (install as a dependency)

```bash
pnpm add fast-glob
# or
npm i fast-glob
# or
yarn add fast-glob
```

TypeScript paths are used in examples (`@/packages/...`). Make sure your `tsconfig.json` `paths` are set accordingly.

---

## See also

* **Schema (runtime):** `src/packages/lib/package-schema.ts`
* **Schema (authoring + transform):** `src/packages/lib/mdx-frontmatter-schema.ts`
* **Mappers (UI):** `src/packages/lib/mappers/package-mappers.ts`

These three layers—**authoring → runtime → UI props**—give you a clean, testable, and maintainable pipeline.

---

If you later decide you want the service/featured utilities, keep them in a **separate** module (e.g., `src/packages/lib/registry-meta.ts`) to preserve this loader’s single responsibility.
