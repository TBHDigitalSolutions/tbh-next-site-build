Here’s a concise, copy-pasteable **taxonomy spec + example** that unifies the patterns you’ve been using into one canonical `services.json`. It standardizes naming to the rule:

* **level1** = `"services"`
* **level2** = `"subservices"`
* **level3** = `"subsubservices"`

---

# services.json — Taxonomy Specification

## 1) Purpose

A single source of truth for:

* Services IA (service hubs, sub-service hubs, leaf pages)
* Packages catalog authoring paths, validation, filters, and routing

## 2) Canonical structure (keys & casing)

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

### Naming rules

* Keys are **lower-kebab** for ids/slugs: `web-development`, `ai-seo`.
* Top-level key is always **`services`** (level 1).
* Arrays are named **`subservices`** (level 2) and **`subsubservices`** (level 3).
* Route/authoring templates use **curly placeholders**: `{service}`, `{subservice}`, `{subsubservice}`, `{slug}`.

---

## 3) Validation (recommended)

* `services[*].subservices[].slug` must be unique **within the service**.
* `subsubservices[].slug` must be unique **within the subservice**.
* For package frontmatter:

  * `service` must match a `services` key.
  * `subservice` must match one of that service’s `subservices[].slug`.
  * (Optional) additional classifications listed in `subServices: []` can be cross-indexed; keep one **primary** folder only.
* Authoring path must resolve exactly from `authoring.docsPathTemplate`.

---

## 4) Example `services.json` (Web Development + SEO)

This is an executable, unified example that merges your **Web Development** (service = `web-development`, subservices = `applications`, `e-commerce`, `website`) and **SEO** (service = `seo`, subservices = `ai-seo`, `marketing`, `technical`) into the same file and schema.

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

  * `service`: one of the `services` keys (e.g., `"seo"`, `"web-development"`).
  * `subservice`: one of that service’s `subservices[].slug`.
  * (Optional) `subServices: []` for additional classification; **no duplicate folders**.
* **Routing:**

  * Hubs and leaf pages derive from `routes.*` templates (replace `{…}` tokens).
  * Keep detail canonical at `/packages/{slug}` and 301 friendly paths.

---

If you want, I can also provide a tiny validator (TS/Zod) that loads this file, verifies folder paths + frontmatter, and fails CI when anything drifts from the L1/L2/L3 rule.
