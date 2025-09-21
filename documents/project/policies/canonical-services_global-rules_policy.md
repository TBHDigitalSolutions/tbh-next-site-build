Here’s the **complete, production-ready Global Rules** document with all of the improvements folded in. You can drop this straight into your repo (e.g., `/docs/global-services-naming.md`) and share it across teams.

---

# Global Rules: Canonical “\*-Services” Implementation Guide (Production)

**Last updated:** 2025-09-15
**Applies to:** All domains (testimonials, portfolio, case-studies, packages, booking, search, pricing, tools, services & capabilities, FAQ, testimonials, CTA, overview/intro)

---

## Purpose

Unify routing, file naming, types, adapters, and exports across domains using canonical **“\*-services”** service slugs that match public URLs:

```
/services/web-development-services
/services/video-production-services  
/services/seo-services
/services/marketing-services
/services/lead-generation-services
/services/content-production-services
```

This guide sets one **Source of Truth** (SSOT) for service names and enforces it via directory structure, TypeScript types, adapters, barrels, lint rules, and tests.

---

## 0) Single Source of Truth (SSOT)

All canonical service constants, enums, alias map, and helpers live in **one shared module**:

```
/src/shared/services/
├── constants.ts    # CANONICAL_SERVICES, LEGACY_TO_CANONICAL
├── types.ts        # CanonicalService, ServiceType
├── utils.ts        # normalizeServiceSlug, validateServiceSlug, assertCanonicalService
└── index.ts        # re-exports all of the above
```

**No domain** may define its own copy of these values.

### 0.1 Constants (canonical + aliases)

```ts
// /src/shared/services/constants.ts
export const CANONICAL_SERVICES = [
  "web-development-services",
  "video-production-services",
  "seo-services",
  "marketing-services",
  "lead-generation-services",
  "content-production-services",
] as const;

export const LEGACY_TO_CANONICAL = {
  // Web Development
  "web": "web-development-services",
  "webdev": "web-development-services",
  "web-development": "web-development-services",

  // Video Production
  "video": "video-production-services",
  "video-production": "video-production-services",

  // SEO
  "seo": "seo-services",

  // Marketing
  "marketing": "marketing-services",
  "marketing-automation": "marketing-services",

  // Lead Generation
  "leadgen": "lead-generation-services",
  "lead-gen": "lead-generation-services",
  "lead-generation": "lead-generation-services",

  // Content Production
  "content": "content-production-services",
  "content-production": "content-production-services",
} as const;
```

### 0.2 Types (derived from constants)

```ts
// /src/shared/services/types.ts
import { CANONICAL_SERVICES } from "./constants";

export type CanonicalService = (typeof CANONICAL_SERVICES)[number];

export enum ServiceType {
  WEB_DEVELOPMENT_SERVICES = "web-development-services",
  VIDEO_PRODUCTION_SERVICES = "video-production-services",
  SEO_SERVICES = "seo-services",
  MARKETING_SERVICES = "marketing-services",
  LEAD_GENERATION_SERVICES = "lead-generation-services",
  CONTENT_PRODUCTION_SERVICES = "content-production-services",
}
```

### 0.3 Utils (normalize + validation)

```ts
// /src/shared/services/utils.ts
import { CANONICAL_SERVICES, LEGACY_TO_CANONICAL } from "./constants";
import type { CanonicalService } from "./types";

export function normalizeServiceSlug(input: string): CanonicalService {
  const canonical = (LEGACY_TO_CANONICAL as Record<string, string>)[input] ?? input;
  assertCanonicalService(canonical);
  return canonical as CanonicalService;
}

export function validateServiceSlug(slug: string): boolean {
  const canonical = (LEGACY_TO_CANONICAL as Record<string, string>)[slug] ?? slug;
  return CANONICAL_SERVICES.includes(canonical as any);
}

export function assertCanonicalService(service: string): asserts service is CanonicalService {
  const ok = CANONICAL_SERVICES.includes(service as any);
  if (!ok) {
    throw new Error(
      `Invalid service: "${service}". Must be one of: ${CANONICAL_SERVICES.join(", ")}`
    );
  }
}
```

---

## 1) Canonical Service Slugs (SSOT)

**Use exactly these canonical slugs everywhere that crosses boundaries** (routing, adapters, data, exports):

* `web-development-services`
* `video-production-services`
* `seo-services`
* `marketing-services`
* `lead-generation-services`
* `content-production-services`

**Legacy slugs** must be normalized to canonical via `normalizeServiceSlug()`.

---

## 2) Directory Structure Rules

### 2.1 Domain directory naming

```
/src/data/{domain}/
├── {canonical-service}/
│   ├── index.ts
│   └── {canonical-service}-{domain}.ts
├── types.ts
└── index.ts
```

**Examples (correct):**

```
/src/data/testimonials/web-development-services/
/src/data/portfolio/video-production-services/
/src/data/case-studies/seo-services/
```

**Incorrect:**

```
/src/data/testimonials/web-development/
/src/data/portfolio/video-production/
/src/data/case-studies/seo/
```

### 2.2 File naming

Service-specific files **must** include the full canonical service name:

```
✅ web-development-services-testimonials.ts
✅ video-production-services-portfolio.ts
✅ seo-services-case-studies.ts

❌ web-development-testimonials.ts
❌ video-production-portfolio.ts
❌ seo-case-studies.ts
```

### 2.3 Service folder index

Every `/src/data/{domain}/{service}/` **must** include an `index.ts` that re-exports the domain’s canonical symbols (and optional legacy aliases). Dynamic imports rely on this.

### 2.4 Case sensitivity

* All file and directory names are **lowercase kebab-case** and must exactly match canonical slugs.
* Treat CI as **case-sensitive**—do not rely on macOS/Windows case-insensitive behavior.

---

## 3) Types & Enums Rules

* Import `ServiceType` and `CanonicalService` **only** from `/src/shared/services/types`.
* In data objects and cross-domain contracts, set `service` to a canonical enum value:

```ts
// ✅ Correct
{ service: ServiceType.WEB_DEVELOPMENT_SERVICES }

// ❌ Incorrect
{ service: "web-development" } // legacy value; normalize first
```

### 3.1 Domain-specific type aliases (optional)

```ts
// testimonials domain
export type WebDevelopmentServicesTestimonialsSection = TestimonialsSection;
export type VideoProductionServicesTestimonialsSection = TestimonialsSection;

// portfolio domain
export type WebDevelopmentServicesPortfolioSection = PortfolioSection;
export type VideoProductionServicesPortfolioSection = PortfolioSection;
```

---

## 4) Export Rules

### 4.1 Domain main index — canonical first, legacy deprecated

```ts
// /src/data/{domain}/index.ts

// ============================================================================
// CANONICAL EXPORTS (PRIMARY - USE THESE)
// ============================================================================
export {
  webDevelopmentServicesTestimonials,
  webDevelopmentServicesTestimonialsSection,
} from "./web-development-services";

export {
  videoProductionServicesTestimonials,
  videoProductionServicesTestimonialsSection,
} from "./video-production-services";

// ... other canonical exports

// ============================================================================
// LEGACY ALIASES (DEPRECATED - FOR BACKWARD COMPAT ONLY)
// ============================================================================
/**
 * @deprecated Use webDevelopmentServicesTestimonials instead
 */
export {
  webDevelopmentServicesTestimonials as webDevelopmentTestimonials,
  webDevelopmentServicesTestimonialsSection as webDevelopmentTestimonialsSection,
} from "./web-development-services";

// ... other legacy aliases
```

### 4.2 Service directory index — canonical + optional legacy aliases

```ts
// /src/data/testimonials/web-development-services/index.ts
export {
  webDevelopmentServicesTestimonials,
  webDevelopmentServicesTestimonialsSection,
} from "./web-development-services-testimonials";

// Optional legacy (deprecated) re-exports:
export {
  webDevelopmentServicesTestimonials as webDevelopmentTestimonials,
  webDevelopmentServicesTestimonialsSection as webDevelopmentTestimonialsSection,
} from "./web-development-services-testimonials";
```

### 4.3 Named exports only

* Service data files export **named** symbols (no default exports).
* Barrels re-export named symbols; legacy named aliases must include `@deprecated` JSDoc.

---

## 5) Service Mapping & Dynamic Imports

### 5.1 Service lookup objects (canonical first)

```ts
import {
  webDevelopmentServicesItems,
  videoProductionServicesItems,
  // ...
} from "@/data/portfolio";

export const itemsByService = {
  // Canonical (primary)
  "web-development-services": webDevelopmentServicesItems,
  "video-production-services": videoProductionServicesItems,
  // ...

  // Legacy aliases (fallback)
  "web-development": webDevelopmentServicesItems,
  "video-production": videoProductionServicesItems,
  "marketing-automation": webDevelopmentServicesItems, // example
  // ...
} as const;
```

### 5.2 Dynamic imports

* **Always** import from the **canonical** folder; legacy keys are **normalized before** import.

```ts
export const sections = {
  "web-development-services": () =>
    import("./web-development-services").then((m) => m.webDevelopmentServicesSection),

  // Legacy → canonical
  "web-development": () =>
    import("./web-development-services").then((m) => m.webDevelopmentServicesSection),
};
```

---

## 6) Adapters & Utilities

### 6.1 Adapter naming & canonicalization

* Adapters must reference canonical services in types and outputs.

```ts
import { ServiceType } from "@/shared/services/types";
import { normalizeServiceSlug } from "@/shared/services/utils";

export function adaptWebDevelopmentServicesData(raw: unknown) {
  const service = normalizeServiceSlug("web-development-services");
  return { service: ServiceType.WEB_DEVELOPMENT_SERVICES, /* ... */ };
}
```

### 6.2 Layer boundaries

* `/src/{domain}/lib/*` **must not** import from templates or data.
* Templates/sections import **types from lib**, never the reverse.
* If adapters need a “bundle-like” type, define a **minimal interface in lib** (don’t import data types).

### 6.3 Utility functions

* Utility functions must accept both canonical and legacy identifiers and **normalize** to canonical internally (via the SSOT utils).

---

## 7) Documentation Rules

### 7.1 JSDoc

Document canonical vs legacy for every export:

```ts
/** Web Development Services testimonials (CANONICAL) */
export const webDevelopmentServicesTestimonials = [...];

// Legacy alias (deprecated)
/** @deprecated Use webDevelopmentServicesTestimonials instead */
export const webDevelopmentTestimonials = webDevelopmentServicesTestimonials;
```

### 7.2 Domain README pattern

Every domain README includes:

```md
## Usage

### Canonical (Recommended)
import { webDevelopmentServicesTestimonials } from "@/data/testimonials";

### Legacy (Deprecated)
import { webDevelopmentTestimonials } from "@/data/testimonials";
```

---

## 8) Validation & Enforcement

### 8.1 Build-time validation (CI blocking)

Create a tiny validation suite (per domain) to enforce:

* **Directory names** under `/src/data/{domain}` are **canonical service names** only.
* **Exports** in `/src/data/{domain}/index.ts` list **canonical first**; legacy exports include `@deprecated`.
* **Data objects** use canonical `ServiceType` values.

*Pseudocode:*

```ts
export function validateCanonicalCompliance(domain: string) {
  const root = `/src/data/${domain}`;
  const dirs = getDirectories(root);
  const nonCanonical = dirs.filter(
    (d) => !CANONICAL_SERVICES.includes(d as any) && !["types.ts", "index.ts", "_*"].includes(d)
  );
  if (nonCanonical.length) {
    throw new Error(`Non-canonical directories in ${domain}: ${nonCanonical.join(", ")}`);
  }

  // Also: scan for ServiceType usage and export name patterns.
}
```

### 8.2 Runtime validation (defensive)

Use `assertCanonicalService` in runtime paths that accept free-form slugs.

---

## 9) Migration Strategy

### 9.1 Backward compatibility

1. Keep legacy exports functional.
2. Add **development-only** deprecation warnings.
3. Update internal usage to canonical names.
4. Document migration path.

### 9.2 Phased implementation with timeline

* **Phase 1 (Day 0):** Introduce canonical exports alongside legacy; publish this guide.
* **Phase 2 (≤ 2 weeks):** Update internal imports and `service` values to canonical.
* **Phase 3 (≤ 4 weeks):** Enable dev-time warnings on legacy imports/values.
* **Phase 4 (≥ 6 weeks, major release):** Remove legacy exports (breaking change).

### 9.3 Codemods (optional but recommended)

Create codemods to:

* Rename directories (`*/web-development` → `*/web-development-services`)
* Update imports (`webDevelopmentTestimonials` → `webDevelopmentServicesTestimonials`)
* Update object values (`service: "web-development"` → `ServiceType.WEB_DEVELOPMENT_SERVICES`)

---

## 10) Portfolio Alignment Note

Portfolio may keep **category** slugs like `web-development` internally.
**Rule:** Any cross-domain joins (e.g., joining portfolio items with testimonials, packages, etc.) must call `normalizeServiceSlug()` to map category slugs to canonical **service** slugs before lookup.

---

## 11) Lint Guardrails

Add ESLint rules to prevent drift:

* **Disallow** importing service constants, enums, or alias maps from anywhere except `/src/shared/services`.
* **Restrict** upward relative imports across domain layers.
* **Forbid** imports from `/src/{domain}/templates` inside sections/components; **forbid** imports from `/src/{domain}/sections` inside components.

Example (excerpt):

```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [
        { "name": "@/shared/services/constants", "message": "Import via '@/shared/services' barrel." },
        { "name": "@/shared/services/types", "message": "Import via '@/shared/services' barrel." },
        { "name": "@/shared/services/utils", "message": "Import via '@/shared/services' barrel." }
      ],
      "patterns": [
        "@/src/**/templates/*",
        "@/src/**/sections/*"
      ]
    }]
  }
}
```

---

## 12) Example Domain Structure (Testimonials)

```
/src/data/testimonials/
├── index.ts                                  # Canonical exports first, legacy deprecated
├── types.ts                                  # Imports ServiceType from shared/types
├── web-development-services/
│   ├── index.ts                              # Canonical + optional legacy re-exports
│   └── web-development-services-testimonials.ts  # Uses ServiceType.WEB_DEVELOPMENT_SERVICES
├── video-production-services/
│   ├── index.ts
│   └── video-production-services-testimonials.ts
├── seo-services/
│   ├── index.ts
│   └── seo-services-testimonials.ts
├── marketing-services/
│   ├── index.ts
│   └── marketing-services-testimonials.ts
├── lead-generation-services/
│   ├── index.ts
│   └── lead-generation-services-testimonials.ts
└── content-production-services/
    ├── index.ts
    └── content-production-services-testimonials.ts
```

---

## 13) Team Checklist (Copy into PRs)

* [ ] Imports use `/src/shared/services` SSOT (no local duplicates)
* [ ] Service directories are canonical `*-services` (lowercase kebab-case)
* [ ] Each service folder has an `index.ts` re-exporting canonical symbols
* [ ] Domain main `index.ts` exports **canonical first**, legacy with `@deprecated`
* [ ] Data objects use `ServiceType.*` canonical values
* [ ] Adapters normalize slugs via `normalizeServiceSlug()` and return canonical values
* [ ] `/src/{domain}/lib` does **not** import from templates/data
* [ ] Dynamic imports target canonical directories; legacy slugs normalized beforehand
* [ ] CI validation (directory names, export names, canonical usage) passes
* [ ] Dev-only warnings enabled for legacy in Phase 3
* [ ] Docs updated (README examples: canonical vs legacy)

---

By adopting this guide, all domains will share a consistent, enforced model for service naming—eliminating slug drift, preventing import/export breakage, and making cross-domain joins deterministic and testable.
