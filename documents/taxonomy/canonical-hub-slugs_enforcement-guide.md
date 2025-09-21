Official Title: Canonical Hub Slugs Enforcement Guide

Domain: Services, Web Development

File Name: canonical-hub-slugs_enforcement-guide_2025-09-12.md

Main Part: canonical-hub-slugs

Qualifier: EnforcementGuide

Date: 2025-09-12

Spotlight Comments:
- Specifies the six canonical hub slugs for consistent use across taxonomy, middleware, and data.
- Provides enforcement rules for URLs, directories, selectors, and helpers.
- Cross-references services-taxonomy-simplification.md and marketing-services-qa.md for alignment.

Summary: The Canonical Hub Slugs Enforcement Guide defines the six canonical hub slugs (`web-development-services`, `video-production-services`, `seo-services`, `marketing-services`, `lead-generation-services`, `content-production-services`) to be used consistently across URLs, taxonomy, middleware, data directories, selectors, and helpers at TBH Digital Solutions. It outlines where these slugs must be enforced (e.g., `servicesTree.ts`, `middleware.ts`, `generateStaticParams`), includes a checklist for validation, and ensures no non-canonical aliases (e.g., `marketing`) are used to prevent redirect loops and maintain consistency.

---

Absolutely—here’s an extra section you can drop into the guide to lock this in.

---

# 0) Canonical Level-0 (Hub) Slugs — use these everywhere

For **all URLs, data directories, selectors, taxonomy, and middleware**, the six Level-0 **hub** slugs are:

```
/web-development-services
/video-production-services
/seo-services
/marketing-services
/lead-generation-services
/content-production-services
```

Use these **exact** slugs consistently. Titles/labels can vary (“Web Development Services”), but slugs and paths must not.

## Where these must be enforced

1. **Taxonomy (source of truth)**

* File: `src/data/taxonomy/servicesTree.ts`
* Hubs’ `slug` and `path` must use the canonical form, e.g.:

  ```ts
  const marketing = hubNode(
    "hub_marketing",
    "marketing-services",
    "Marketing Services"
  );
  // Every service under it derives path: /services/marketing-services/<service>
  ```

2. **App Router matchers & redirects**

* File: `middleware.ts`

  * `CANONICAL_HUBS` must contain the six “\*-services” slugs.
  * `HUB_ALIAS_TO_CANONICAL` should map any shorthand to the canonical (e.g., `"marketing-services": "marketing-services"`; **do not** map `"marketing-services"` → `"marketing"`).
  * Matchers must include each root:

    ```
    "/web-development-services/:path*",
    "/video-production-services/:path*",
    "/seo-services/:path*",
    "/marketing-services/:path*",
    "/lead-generation-services/:path*",
    "/content-production-services/:path*",
    ```

3. **Dynamic routes**

* File: `app/services/[hub]/[service]/page.tsx`

  * `generateStaticParams()` must output `{ hub: "<one of the six>" }`.
  * Loader must expect these slugs when resolving nodes and data paths.

4. **Data directories (all domains)**

* Page data (per hub):
  `src/data/page/services-pages/<hub-slug>/...`
  e.g. `src/data/page/services-pages/marketing-services/content-creative/index.ts`
* Portfolio:
  `src/data/portfolio/<hub-slug>/...`
* Testimonials:
  `src/data/testimonials/<hub-slug>/...`
* Packages:
  `src/data/packages/<hub-slug>/...`
* Case studies (if hub-scoped):
  `src/data/caseStudies/<hub-slug>/...`

5. **Selectors (tags)**

* When tagging or selecting, the **hub tag** must equal the canonical slug:

  ```ts
  selectPortfolio({ hub: "marketing-services", service: "content-creative", featured: true });
  selectTestimonials({ hub: "seo-services", service: "technical", limit: 3 });
  selectPackages({ hub: "web-development-services", service: "ecommerce" });
  ```

6. **Helpers & utilities**

* Files:
  `src/lib/services/taxonomy.ts`, `taxonomyHelpers.ts`, `serviceUrls.ts`, `dataLoaders.ts`, `pricingAdapters.ts`
* Ensure all string comparisons and path builders assume `/services/<hub>/<service>` where `<hub>` is one of the six canonical slugs above.

## Quick self-check (copy/paste)

* [ ] `servicesTree.ts` hubs: **exactly** the six canonical slugs.
* [ ] `middleware.ts`:

  * [ ] `CANONICAL_HUBS` includes all six.
  * [ ] `HUB_ALIAS_TO_CANONICAL` does **not** collapse `"*-services"` to shorter forms.
  * [ ] Route matchers list all six root entries.
* [ ] Data directories exist under each canonical hub name.
* [ ] All `select*({ hub })` calls use a canonical hub slug.
* [ ] `generateStaticParams()` yields `{ hub }` values matching the six.
* [ ] No component or adapter hardcodes non-canonical hub strings.

> TL;DR: **The six “\*-services” slugs are the only valid hub keys**. Everything—URLs, folder names, tags, lookups—should line up with them.
