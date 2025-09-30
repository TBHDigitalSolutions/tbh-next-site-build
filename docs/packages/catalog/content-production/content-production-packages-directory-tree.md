Here’s a clean, **authoring-ready directory layout** for **Content Production** packages that follows your taxonomy file and the canonical path pattern:

```
docs/packages/catalog/{service}/{subservice}/{slug}/
```

* `service` = `content-production`
* `subservice` ∈ `creative-services` | `writing-editorial` | `production-publishing` | `sales-marketing-materials`
* `slug` = the specific package (kebab-case).
* The **Level-3 (subsubservice)** is set in frontmatter (not the path).

---

# Content Production — packages directory tree

```txt
docs/
└─ packages/
   └─ catalog/
      └─ content-production/
         ├─ creative-services/
         │  ├─ brand-identity-starter/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  ├─ social-graphics-kit/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  ├─ product-photo-studio-day/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  ├─ on-location-photo-shoot/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  ├─ explainer-video-starter/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  └─ motion-graphics-pack/
         │     ├─ public.mdx
         │     ├─ internal.json
         │     └─ assets/.keep
         │
         ├─ writing-editorial/
         │  ├─ website-copy-refresh/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  ├─ blog-article-pack-4/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  ├─ messaging-playbook/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  └─ editorial-calendar-sprint/
         │     ├─ public.mdx
         │     ├─ internal.json
         │     └─ assets/.keep
         │
         ├─ production-publishing/
         │  ├─ cms-migration-lite/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  ├─ content-upload-retainer/
         │  │  ├─ public.mdx
         │  │  ├─ internal.json
         │  │  └─ assets/.keep
         │  └─ asset-packaging-kit/
         │     ├─ public.mdx
         │     ├─ internal.json
         │     └─ assets/.keep
         │
         └─ sales-marketing-materials/
            ├─ one-pager-starter/
            │  ├─ public.mdx
            │  ├─ internal.json
            │  └─ assets/.keep
            ├─ sales-deck-pro/
            │  ├─ public.mdx
            │  ├─ internal.json
            │  └─ assets/.keep
            ├─ brand-collateral-kit/
            │  ├─ public.mdx
            │  ├─ internal.json
            │  └─ assets/.keep
            └─ pitch-deck-design-sprint/
               ├─ public.mdx
               ├─ internal.json
               └─ assets/.keep
```

> The sample slugs above intentionally cover the L3 areas from your taxonomy:
>
> * **creative-services** → `design`, `photography`, `video-production`
> * **writing-editorial** → `copywriting`, `editorial-strategy`
> * **production-publishing** → `cms-publishing`, `packaging`
> * **sales-marketing-materials** → `sales-materials`, `brand-collateral`, `presentation-design`

---

# Files per package (author edits)

Inside each `<slug>` directory:

```
public.mdx        # frontmatter + body (phase sections)
internal.json     # tiers/ops/sales notes (internal only)
assets/           # images, diagrams, downloads (optional)
```

## `public.mdx` — frontmatter keys (SSOT)

* **Identity**: `id`, `slug`, `service: "content-production"`, `subservice`, *(optional)* `subsubservice`
* **Taxonomy/meta**: `tags[]`, `badges[]`, `tier?`, `image?`, `seo?`
* **Phase 1 (Hero)**: `summary`, `description`
* **Phase 2 (Why)**: `purposeHtml?`, `painPoints[]?`, `icp?`, `outcomes[]`
* **Phase 3 (What)**: `features[]`, `includesGroups[]` *(or)* `includesTable`
* **Phase 4 (Details & Trust)**:

  * `price` (Money: `monthly?`, `oneTime?`, `currency: "USD"`)
  * `priceBand` (`tagline?`, `baseNote?`, `finePrint?`)
  * `extras.timeline?`, `extras.requirements?`, `extras.ethics?`, `notes?`
* **Phase 5 (Next step)**: `faqs[]?`, `crossSell[]?`, `addOns[]?`

> Body content uses headings that match your Markdown Template. The build extracts/compiles narrative blocks to `*.Html` as needed.

## `internal.json` — (example skeleton)

```json
{
  "tiers": [
    { "name": "Starter", "price": { "monthly": 1500, "currency": "USD" } },
    { "name": "Professional", "price": { "monthly": 3000, "currency": "USD" } },
    { "name": "Enterprise", "price": { "monthly": 6000, "currency": "USD" } }
  ],
  "opsNotes": "SLA: 5 BD for first drafts; designer bandwidth required.",
  "salesNotes": "Great fit for PLG SaaS; bundle with SEO Content Hubs.",
  "estimation": { "hours": 24, "roles": ["PM","Writer","Designer"] }
}
```

---

## Authoring rules & routing

* **Path rule:** `docs/packages/catalog/content-production/{subservice}/{slug}/`
* **Frontmatter:** `subservice` must be one of:
  `creative-services` | `writing-editorial` | `production-publishing` | `sales-marketing-materials`
  *(Optionally add `subsubservice` to reflect the L3 grouping.)*
* **Routes** (from taxonomy):

  * Hub: `/services/content-production-services`
  * Subservice hub: `/services/content-production-services/{subservice}`
  * Leaf hub: `/services/content-production-services/{subservice}/{subsubservice}`
  * Canonical package: `/packages/{slug}`
  * Friendly package: `/packages/content-production/{subservice}/{slug}`

---

This gives you a consistent, scalable structure that matches ytheour `services.json`, keeps **subsubservice** as metadata, and plugs straight into the **PackageDetailOverview** pipeline.
