**`docs/taxonomy/README.md`** 
---

# Taxonomy — Services & Packages

This folder contains the **canonical taxonomy** for Services and their Packages. It standardizes naming and folder structure across all service verticals and powers routing, authoring, validation, and discovery.

* **level1** = `"services"`
* **level2** = `"subservices"`
* **level3** = `"subsubservices"`

> Each service has its own `services.json` under `docs/taxonomy/<service>/services.json`.
> A central `docs/taxonomy/index.json` lists all services and points to those files.

---

## Folder layout

```
docs/taxonomy/
├── index.json                     # Aggregator (refs each service file)
├── README.md                      # This document
├── content-production/
│   └── services.json
├── lead-generation/
│   └── services.json
├── marketing/
│   └── services.json
├── seo/
│   └── services.json
├── video-production/
│   └── services.json
└── web-development/
    └── services.json
```

---

## services.json — Taxonomy Specification

### 1) Purpose

A single source of truth for:

* Services IA (service hubs, sub-service hubs, leaf pages)
* Packages catalog authoring paths, validation, filters, and routing

### 2) Canonical structure (keys & casing)

```ts
// TypeScript reference shape (authoritative)
export interface ServicesTaxonomy {
  version: string | number;
  services: Record<ServiceId, Service>;
}

export type ServiceId = string; // e.g., "web-development", "seo"

export interface Service {
  // L1: service
  label: string;
  description?: string;
  aliases?: string[];
  hubSlug: string;          // e.g., "web-development-services"
  packagesHubSlug?: string; // e.g., "web-development-packages"

  routes?: {
    serviceHub?: string;            // "/services/web-development-services"
    serviceSubservice?: string;     // "/services/web-development-services/{subservice}"
    serviceLeaf?: string;           // "/services/web-development-services/{subservice}/{subsubservice}"
    canonicalPackagePath?: string;  // "/packages/{slug}"
    friendlyPackagePath?: string;   // "/packages/{service}/{subservice}/{slug}"
    packagesByLeaf?: string;        // "/packages/catalog/{service}/{subservice}/{slug}"
  };

  authoring?: {
    docsPathTemplate: string; // "docs/packages/catalog/{service}/{subservice}/{slug}/"
    mdxFile: string;          // "public.mdx"
    internalPricingFile?: string; // "internal.json"
    assetsDir?: string;       // "assets"
  };

  filters?: {
    dimensions: string[];     // facet keys (e.g., ["stack","framework"])
    defaultSort?: "alpha" | "recent" | "popularity";
  };

  // L2: subservices
  subservices: Subservice[];
}

export interface Subservice {
  slug: string;        // e.g., "applications"
  label: string;       // "Applications"
  description?: string;

  // L3: subsubservices
  subsubservices?: Array<{
    slug: string;      // e.g., "saas-apps"
    label: string;     // "SaaS Apps"
    description?: string;
  }>;
}
```

#### Naming rules

* IDs/slugs are **lower-kebab**: `web-development`, `ai-seo`.
* Top-level key is **`services`** (level 1).
* Arrays are **`subservices`** (level 2) and **`subsubservices`** (level 3).
* Templates use **curly placeholders**: `{service}`, `{subservice}`, `{subsubservice}`, `{slug}`.

---

### 3) Validation (recommended)

* `services[*].subservices[].slug` is unique **within that service**.
* `subservices[*].subsubservices[].slug` is unique **within that subservice**.
* Package frontmatter:

  * `service` matches a `services` key.
  * `subservice` matches one of that service’s `subservices[].slug`.
  * (Optional) additional classifications may be recorded as tags/filters; keep **one primary** folder path only.
* Authoring path resolves exactly from `authoring.docsPathTemplate`.

---

### 4) Example `services.json` (Web Development + SEO)

This unified example shows two services in the same file (your real repo maintains **one file per service**; this is illustrative).

```json
{
  "version": "1.0",
  "services": {
    "web-development": {
      "label": "Web Development",
      "description": "Strategy, design, and engineering to build fast, accessible, reliable web experiences.",
      "aliases": ["webdev", "web-development-services"],
      "hubSlug": "web-development-services",
      "packagesHubSlug": "web-development-packages",
      "routes": {
        "serviceHub": "/services/web-development-services",
        "serviceSubservice": "/services/web-development-services/{subservice}",
        "serviceLeaf": "/services/web-development-services/{subservice}/{subsubservice}",
        "canonicalPackagePath": "/packages/{slug}",
        "friendlyPackagePath": "/packages/web-development/{subservice}/{slug}",
        "packagesByLeaf": "/packages/catalog/{service}/{subservice}/{slug}"
      },
      "authoring": {
        "docsPathTemplate": "docs/packages/catalog/{service}/{subservice}/{slug}/",
        "mdxFile": "public.mdx",
        "internalPricingFile": "internal.json",
        "assetsDir": "assets"
      },
      "filters": {
        "dimensions": ["stack", "framework", "cms", "objective", "performance", "compliance"],
        "defaultSort": "alpha"
      },
      "subservices": [
        {
          "slug": "applications",
          "label": "Applications",
          "description": "Product-like web apps, portals, and internal tools.",
          "subsubservices": [
            { "slug": "saas-apps", "label": "SaaS Apps" },
            { "slug": "customer-portals", "label": "Customer Portals" },
            { "slug": "internal-tools-dashboards", "label": "Internal Tools & Dashboards" },
            { "slug": "admin-panels", "label": "Admin Panels" },
            { "slug": "integrations-apis", "label": "Integrations & APIs" },
            { "slug": "authentication-sso", "label": "Authentication & SSO" },
            { "slug": "realtime-collaboration", "label": "Realtime & Collaboration" },
            { "slug": "data-visualization", "label": "Data Visualization" }
          ]
        },
        {
          "slug": "e-commerce",
          "label": "E-commerce",
          "description": "Storefronts, headless commerce, and conversion systems.",
          "subsubservices": [
            { "slug": "storefronts", "label": "Storefronts" },
            { "slug": "headless-commerce", "label": "Headless Commerce" },
            { "slug": "shopify", "label": "Shopify" },
            { "slug": "payments-checkout", "label": "Payments & Checkout" },
            { "slug": "subscriptions", "label": "Subscriptions" },
            { "slug": "pim", "label": "Product Information Management (PIM)" },
            { "slug": "search-merchandising", "label": "Search & Merchandising" },
            { "slug": "marketplaces", "label": "Marketplaces" }
          ]
        },
        {
          "slug": "website",
          "label": "Website",
          "description": "Marketing sites and content platforms.",
          "subsubservices": [
            { "slug": "marketing-sites", "label": "Marketing Sites" },
            { "slug": "landing-pages", "label": "Landing Pages" },
            { "slug": "microsites-campaigns", "label": "Microsites & Campaigns" },
            { "slug": "documentation-portals", "label": "Documentation Portals" },
            { "slug": "blogs-publications", "label": "Blogs & Publications" },
            { "slug": "multilingual-i18n", "label": "Multilingual & i18n" },
            { "slug": "accessibility-compliance", "label": "Accessibility & Compliance" },
            { "slug": "site-migrations", "label": "Site Migrations" }
          ]
        }
      ]
    },

    "seo": {
      "label": "SEO Services",
      "description": "Complete search engine optimization solutions for maximum visibility.",
      "aliases": ["search", "organic"],
      "hubSlug": "seo-services",
      "packagesHubSlug": "seo-packages",
      "routes": {
        "serviceHub": "/services/seo",
        "serviceSubservice": "/services/seo/{subservice}",
        "serviceLeaf": "/services/seo/{subservice}/{subsubservice}",
        "canonicalPackagePath": "/packages/{slug}",
        "friendlyPackagePath": "/packages/seo/{subservice}/{slug}",
        "packagesByLeaf": "/packages/catalog/{service}/{subservice}/{slug}"
      },
      "authoring": {
        "docsPathTemplate": "docs/packages/catalog/{service}/{subservice}/{slug}/",
        "mdxFile": "public.mdx",
        "internalPricingFile": "internal.json",
        "assetsDir": "assets"
      },
      "filters": {
        "dimensions": ["pillar", "intent", "siteType", "contentType", "technicalArea"],
        "defaultSort": "alpha"
      },
      "subservices": [
        {
          "slug": "ai-seo",
          "label": "AI SEO",
          "description": "Optimization for AI-driven search surfaces (SGE, LLM answers, visibility engineering).",
          "subsubservices": [
            { "slug": "ai-search-optimization", "label": "AI Search Optimization" },
            { "slug": "llm-answer-seo", "label": "LLM Answer SEO" },
            { "slug": "visibility-engineering", "label": "Visibility Engineering" }
          ]
        },
        {
          "slug": "marketing",
          "label": "Marketing",
          "description": "Content-driven SEO and promotional amplification.",
          "subsubservices": [
            { "slug": "community-seo", "label": "Community SEO" },
            { "slug": "content-hubs", "label": "Content Hubs" },
            { "slug": "content-syndication", "label": "Content Syndication" },
            { "slug": "digital-pr", "label": "Digital PR" },
            { "slug": "ecommerce-seo", "label": "Ecommerce SEO" },
            { "slug": "keyword-strategy", "label": "Keyword Strategy" },
            { "slug": "local-seo", "label": "Local SEO" },
            { "slug": "marketplace-seo", "label": "Marketplace SEO" },
            { "slug": "on-page", "label": "On-Page" },
            { "slug": "video-seo", "label": "Video SEO" }
          ]
        },
        {
          "slug": "technical",
          "label": "Technical",
          "description": "Backend, rendering, performance, and indexation discipline.",
          "subsubservices": [
            { "slug": "core-web-vitals", "label": "Core Web Vitals" },
            { "slug": "indexation-routing", "label": "Indexation Routing" },
            { "slug": "international-seo", "label": "International SEO" },
            { "slug": "migration-seo", "label": "Migration SEO" },
            { "slug": "schema", "label": "Schema" },
            { "slug": "technical-audit", "label": "Technical Audit" }
          ]
        }
      ]
    }
  }
}
```

---

## 5) How to use it (quick ops)

* **Authoring paths (packages, production):**
  `docs/packages/catalog/{service}/{subservice}/{slug}/`
  e.g. `docs/packages/catalog/web-development/applications/customer-portals/awesome-portal/`
  e.g. `docs/packages/catalog/seo/marketing/content-hubs/pillar-hub-starter/`

* **Frontmatter contract (per package):**

  ```yaml
  service: web-development
  subservice: applications
  # optional:
  subsubservice: saas-apps
  tags: ["framework:nextjs", "cms:headless", "objective:scale"]
  ```

* **Routing:**

  * Hubs/leaf pages derive from `routes.*` (replace `{…}` tokens).
  * Keep canonical detail at `/packages/{slug}`; use friendly paths for discoverability.

---

## 6) Index file

The aggregator lives at: **`docs/taxonomy/index.json`** (one line per service):

```json
{
  "version": 1,
  "spec": { "levels": { "l1": "services", "l2": "subservices", "l3": "subsubservices" } },
  "services": [
    { "id": "content-production", "label": "Content Production", "ref": "content-production/services.json" },
    { "id": "lead-generation", "label": "Lead Generation", "ref": "lead-generation/services.json" },
    { "id": "marketing-services", "label": "Marketing Services", "ref": "marketing/services.json" },
    { "id": "seo", "label": "SEO Services", "ref": "seo/services.json" },
    { "id": "video-production", "label": "Video Production", "ref": "video-production/services.json" },
    { "id": "web-development", "label": "Web Development", "ref": "web-development/services.json" }
  ]
}
```

---

## 7) QA checklist

* Top key is **`services`**; L2 array is **`subservices`**; L3 array is **`subsubservices`**.
* All slugs are **lower-kebab** and match folder names.
* Route templates use **curly placeholders**.
* `authoring.docsPathTemplate` resolves to a real package folder.
* Filters are **facets**, not taxonomy levels.

---

## 8) Optional: validation

Add a small CI step to validate each `services.json` and `index.json` against the TypeScript/Zod schema and to ensure all `ref` files in `index.json` exist. This prevents drift between taxonomy, routes, and authoring paths.
