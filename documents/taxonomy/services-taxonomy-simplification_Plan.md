Official Title: Services Taxonomy and Middleware Simplification Plan

Domain: Services, Web Development

File Name: services-taxonomy-simplification_Plan_2025-09-12.md

Main Part: services-taxonomy-simplification

Qualifier: Plan

Date: 2025-09-12

Spotlight Comments:
- Establishes a single-source-of-truth taxonomy in `src/data/taxonomy/servicesTree.ts`.
- Simplifies middleware to enforce canonical hub slugs and normalize URLs.
- Cross-references services-page-blueprint.md for alignment with page structures.

Summary: The Services Taxonomy and Middleware Simplification Plan outlines a streamlined approach for managing the service taxonomy and middleware for TBH Digital Solutions' website. It defines a single-source-of-truth taxonomy in `src/data/taxonomy/servicesTree.ts` for hubs, services, and sub-services, eliminates legacy redirects to prevent loops, and provides minimal middleware to enforce canonical hub slugs and normalize URLs. The document includes code snippets for middleware, static parameter generation, URL helpers, and taxonomy validation to ensure consistency and scalability across service pages.

---

got it — fresh eyes, simplify-first. here’s (1) a keep/trim plan for the **middleware** and **service tree**, (2) a “single-source-of-truth” taxonomy doc (incl. static params), and (3) minimal, robust code snippets so everything stays in lockstep.

---

# 0) TL;DR (what to keep / what to drop)

**Keep**

* A single canonical hub naming scheme:
  `/services/{hub}`, where `{hub}` ∈
  `web-development-services | video-production-services | seo-services | marketing-services | lead-generation-services | content-production-services`.
* A single taxonomy tree (one module) that defines hubs/services/subservices and is used for:

  * `generateStaticParams`
  * URL helpers
  * Selectors scoping
  * (Optionally) middleware hub validation

**Drop (for a fresh build)**

* All legacy redirect tables.
* Any aliasing that rewrites canonical → non-canonical (e.g. `marketing-services → marketing`). That caused your previous loop.

**Optional (tiny conveniences)**

* Normalize root entries like `/{hub}-services` → `/services/{hub}-services` (keeps human-friendly deep links).
* Duplicate slashes / trailing slash normalization.

---

# 1) Single Source of Truth (SSOT) for taxonomy

## Decision

* **Authoritative taxonomy lives in:** `src/data/taxonomy/servicesTree.ts`
  Reason: taxonomy is content structure. “lib” should **not** own content.
* **lib uses helpers only:** `src/lib/services/taxonomy.ts` & `taxonomyHelpers.ts` should **import** the SSOT and expose pure helpers (traversals, lookups, flatteners). They must not declare another tree.

### Concrete rules

1. **Only one tree:** `export const servicesTree` from `src/data/taxonomy/servicesTree.ts`.
2. **Types:** keep all service taxonomy types in `src/types/servicesTaxonomy.types.ts` and use them in both data & lib.
3. **lib re-exports helpers:**

   * `getHubs()`, `getServices(hub)`, `getSubservices(hub, svc)`
   * `flattenForStaticParams()`
   * `isCanonicalHubSlug(slug)`

> If you currently have a parallel tree in `src/lib/services/taxonomy.ts`, replace it with a thin wrapper that imports from the data SSOT.

---

# 2) Minimal middleware for a fresh build

## Goals

* Enforce canonical hub segment (\*-services) under `/services/*`.
* Allow root entry `/[hub]-services(/…)?` → `/services/[hub]-services(/…)?`
* Normalize slashes.
* **No legacy redirects. No non-canonical aliases.** (This removes the redirect loop risk.)

## Implementation

```ts
// middleware.ts (lean version for fresh build)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep this tiny and explicit
const CANONICAL_HUBS = new Set<string>([
  "web-development-services",
  "video-production-services",
  "seo-services",
  "marketing-services",
  "lead-generation-services",
  "content-production-services",
]);

function normalizePath(pathname: string): string {
  let p = pathname.replace(/\/{2,}/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function rootHubToServices(pathname: string): string | null {
  // /{hub}-services[/... ] -> /services/{hub}-services[/...]
  const m = pathname.match(/^\/([a-z0-9-]+-services)(\/.*)?$/);
  if (!m) return null;
  const hub = m[1];
  if (CANONICAL_HUBS.has(hub)) {
    return `/services/${hub}${m[2] ?? ""}`;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const original = url.pathname;
  const lower = original.toLowerCase();
  const pathname = normalizePath(lower);

  // A) Normalize // and trailing /
  if (pathname !== original) {
    const target = new URL(pathname || "/", url);
    target.search = url.search;
    target.hash = url.hash;
    return NextResponse.redirect(target, 308);
  }

  // B) Lift root hub entries into /services/*
  const lift = rootHubToServices(pathname);
  if (lift) {
    const target = new URL(lift, url);
    target.search = url.search;
    target.hash = url.hash;
    return NextResponse.redirect(target, 301);
  }

  // C) If under /services/{hub}, enforce canonical hub token
  if (pathname.startsWith("/services/")) {
    const segs = pathname.split("/").filter(Boolean); // ["services", hub, ...]
    const hub = segs[1];
    if (hub && !CANONICAL_HUBS.has(hub)) {
      // Non-canonical hub under /services => 404 *or* rewrite to a safe hub.
      // For fresh build, we prefer 404 to prevent accidental alias loops:
      return NextResponse.rewrite(new URL("/404", url));
      // Or if you want a soft landing page:
      // return NextResponse.redirect(new URL("/services", url), 302);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/services/:path*",
    "/web-development-services/:path*",
    "/video-production-services/:path*",
    "/seo-services/:path*",
    "/marketing-services/:path*",
    "/lead-generation-services/:path*",
    "/content-production-services/:path*",
  ],
};
```

### Why this works (and won’t loop)

* We **never** map the canonical hubs to alternates (e.g. `marketing-services → marketing`).
* We **never** maintain a growing legacy table.
* Root conveniences only move **into** `/services/*` once.

> If you eventually need true aliases (e.g. `/marketing → /services/marketing-services`), add **one-way** rules only. Never map back.

---

# 3) Service tree (review & trims)

## What’s good

* Clear three-tier model: hub → service → subservice
* Node shapes include `slug`, `path`, `title`, `hero` → aligns with templates
* No use of reserved slug `packages` for L3 — good
* Explicit paths set at construction time — predictable `generateStaticParams`

## What to remove / tighten (fresh build)

* Remove commentary about legacy slugs in the doc header (keep it clean).
* Ensure **hub slugs** are the canonical `*-services` to match middleware.
  Example: if any hub currently uses `marketing` (without `-services`), rename to `marketing-services`.
* Co-locate small invariants (like “no `packages` at L3”) in a single validator.

## Add a tiny validator (runs in dev/build)

```ts
// src/lib/services/taxonomyHelpers.ts (add)
import { servicesTree } from "@/data/taxonomy/servicesTree";
import type { AnyServiceNode } from "@/types/servicesTaxonomy.types";

export function assertTaxonomyInvariants(tree: AnyServiceNode) {
  const hubs = new Set<string>();
  const reserved = new Set(["packages"]);

  function walk(node: AnyServiceNode) {
    if ("slug" in node) {
      if (node.kind === "hub") {
        if (!node.slug.endsWith("-services")) {
          throw new Error(`Hub slug must end with "-services": ${node.slug}`);
        }
        if (hubs.has(node.slug)) {
          throw new Error(`Duplicate hub slug: ${node.slug}`);
        }
        hubs.add(node.slug);
      }
      if (reserved.has(node.slug)) {
        throw new Error(`Reserved slug used: ${node.slug}`);
      }
    }
    // @ts-expect-error narrow at runtime
    node.children?.forEach((c: AnyServiceNode) => walk(c));
  }

  walk(tree);
}

if (process.env.NODE_ENV !== "production") {
  assertTaxonomyInvariants(servicesTree);
}
```

---

# 4) Static params (SSG) from the SSOT

Create a single flattener that both pages and search builders can share:

```ts
// src/lib/services/taxonomy.ts (helpers only; imports SSOT)
import { servicesTree } from "@/data/taxonomy/servicesTree";
import type { AnyServiceNode } from "@/types/servicesTaxonomy.types";

export function flattenForStaticParams() {
  const hubs: { hub: string }[] = [];
  const services: { hub: string; service: string }[] = [];
  const subs: { hub: string; service: string; sub: string }[] = [];

  function walk(node: AnyServiceNode) {
    if (node.kind === "hub") {
      hubs.push({ hub: node.slug });
      node.children.forEach(walk);
    } else if (node.kind === "service") {
      services.push({ hub: node.path.split("/")[2], service: node.slug });
      node.children?.forEach(walk);
    } else if (node.kind === "subservice") {
      const parts = node.path.split("/"); // /services/{hub}/{service}/{sub}
      subs.push({ hub: parts[2], service: parts[3], sub: node.slug });
    }
  }
  walk(servicesTree);
  return { hubs, services, subs };
}
```

Usage in App Router:

```ts
// app/services/[hub]/page.tsx
import { flattenForStaticParams } from "@/lib/services/taxonomy";

export function generateStaticParams() {
  return flattenForStaticParams().hubs;
}
```

```ts
// app/services/[hub]/[service]/page.tsx
export function generateStaticParams() {
  return flattenForStaticParams().services;
}
```

```ts
// app/services/[hub]/[service]/[sub]/page.tsx
export function generateStaticParams() {
  return flattenForStaticParams().subs;
}
```

**Rule:** no page defines hub/service lists by hand. They all call this helper. That’s your SSOT in action.

---

# 5) URL helpers (no duplication)

Keep **all** URL composition in one place and make them derive from the SSOT:

```ts
// src/lib/services/serviceUrls.ts
export const serviceUrls = {
  hub: (hub: string) => `/services/${hub}`,
  service: (hub: string, service: string) => `/services/${hub}/${service}`,
  sub: (hub: string, service: string, sub: string) => `/services/${hub}/${service}/${sub}`,
};
```

Anywhere that needs paths uses this. Do not embed string templates in components.

---

# 6) Data loaders & selectors (alignment note)

* `src/lib/services/dataLoaders.ts` may accept `{ hub, service, sub }` and should validate against the SSOT (`isCanonicalHubSlug`, `findNode`).
* `src/data/selectors.ts` should also validate inputs (fail fast in dev).

This prevents “typo hub” bugs that otherwise sneak past until runtime.

---

# 7) Where taxonomy lives vs. middleware

**Middleware** must stay **small and edge-safe**. Do **not** import the full tree (it increases the edge bundle and couples runtime behavior to content churn). Keep a tiny whitelist there:

* `CANONICAL_HUBS` (6 items) — hand-maintained or **generated** at build.

**Optional codegen** if you want zero duplication:

* Add a tiny script that reads the SSOT and writes `src/.generated/canonicalHubs.ts`:

  ```ts
  // scripts/gen-canonical-hubs.ts (node)
  import { servicesTree } from "../src/data/taxonomy/servicesTree";
  import { writeFileSync, mkdirSync } from "fs";
  const hubs: string[] = servicesTree.children.map(h => h.slug);
  mkdirSync("src/.generated", { recursive: true });
  writeFileSync(
    "src/.generated/canonicalHubs.ts",
    `export const CANONICAL_HUBS = new Set(${JSON.stringify(hubs)});\n`
  );
  ```
* Run it in `npm run prebuild`, then in `middleware.ts`:

  ```ts
  import { CANONICAL_HUBS } from "@/./.generated/canonicalHubs";
  ```

This keeps middleware lean without duplicating hub names.

---

# 8) Testing & maintenance checklist

**After any taxonomy change:**

* [ ] `npm run typecheck` — types catch most shape drift.
* [ ] `npm run build` — ensures `generateStaticParams` still matches pages.
* [ ] `npm run start` and visit:

  * `/services`
  * each hub (the 6 canonicals)
  * one service under each hub
  * one subservice if exists
  * root entrance `/{hub}-services` (confirm 301 → `/services/{hub}-services`)
* [ ] try a non-canonical hub (e.g. `/services/marketing`) → expect 404/rewrite, not redirect loops.
* [ ] run your search indexer (if any) to confirm it depends on `flattenForStaticParams()` only.

**Linters / guards (recommended):**

* ESLint rule to forbid hardcoded “/services/…” strings (force `serviceUrls.*` helpers).
* Unit test for `assertTaxonomyInvariants()` to run in CI.

---

# 9) What we removed (explicitly)

* `LEGACY_REDIRECTS` table.
* Alias map that equated canonical/non-canonical (`marketing ↔ marketing-services`).
* Any bidirectional mapping that could loop.

---

# 10) What we kept (explicitly)

* One canonical hub namespace: the six `*-services`.
* One taxonomy module (SSOT) under `src/data/taxonomy/servicesTree.ts`.
* Thin lib helpers that **import** the SSOT (no duplicate trees).
* Minimal middleware that:

  * Normalizes slashes
  * Lifts `/[hub]-services` to `/services/[hub]-services`
  * Validates hub segment under `/services/*`

---

want me to refactor your current `lib/services/taxonomy.ts` to a thin helper (no tree), plus add the `assertTaxonomyInvariants()` and the lean middleware as code changes? I can draft the exact diffs next.
