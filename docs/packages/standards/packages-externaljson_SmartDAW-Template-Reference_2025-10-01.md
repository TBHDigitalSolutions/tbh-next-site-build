title: "SmartDAW external.json — Template & Official Reference"
domain: "packages"
file: "packages-externaljson_SmartDAW-Template-Reference_2025-10-01.md"
main: "packages-externaljson"
qualifier: "SmartDAW-Template-Reference"
date: "2025-10-01"
time: 11:59am
status: "Approved"
owners: ["@yourname"]
tags: ["packages","external-json","schema","mdx","build","normalizer","pricing","tiers","json-ld","ci"]
spotlight:
  - "Per-slug, build-generated artifact at src/data/packages/__generated__/packages/<slug>.external.json — never hand-edited"
  - "Contains nested authoring sections plus normalized top-level mirrors for simple, typed UI consumption"
  - "Pricing policy supported: Mode A via internal.json (default) and strict Mode B frontmatter; JSON-LD omits offers when price is absent"
  - "Narrative compiled from MDX into sanitized HTML; includes normalized to includesGroups/includesTable; extras mapped to timeline/requirements/ethics"
  - "Safe public tiers: copy only when flagged and only rows marked is_public; UI requires ui.showTieredPricing"
  - "Validation & CI: schema checks, includesGroups/Table requirement, price shape rules, and no price prose in MDX"
summary: "A drop-in external.json template for SmartDAW and the official reference for the external package artifact—covering where it lives, how it’s generated from MDX (+ optional internal pricing), its canonical shape (nested + normalized), how the UI consumes it, and the validation/CI and pricing rules that keep it safe and consistent."
links:
  related: []

-----
10-01-2025 | 11:59am
---
Awesome — here’s a **drop-in external.json template for SmartDAW** and the **official reference doc** for `external.json` so anyone on the team can read it and know exactly what it is, where it lives, how it’s generated, and how the UI consumes it.

---

# smartdaw.external.json (template)

> Path (generated): `src/data/packages/__generated__/packages/smartdaw-strategic-flow.external.json`
> Authors **do not** hand-edit this; it’s produced from `public.mdx` (+ optional `internal.json`).
> This sample is fully-populated and valid; replace values as needed in your authoring sources.

```json
{
  "meta": {
    "id": "pkg_smartdaw",
    "slug": "smartdaw-strategic-flow",
    "service": "lead-generation",
    "category": "Go-To-Market",
    "tier": "Core",
    "badges": [],
    "tags": ["ICP", "routing", "playbooks"]
  },
  "hero": {
    "seo": {
      "title": "SmartDAW Strategic Flow",
      "description": "From ad to won: ICP, lead routing, playbooks, and reporting in two weeks."
    },
    "summary": "Turn raw demand into repeatable revenue motions.",
    "image": { "src": "/assets/packages/smartdaw/hero.png", "alt": "SmartDAW diagram" }
  },
  "narrative": {
    "overviewHtml": "<p>SmartDAW aligns demand generation with sales execution. In two weeks we deliver a working flow…</p>",
    "purposeHtml": "<p>Ship a production-ready routing & playbook loop that scales as you grow.</p>",
    "faqHtml": "<details><summary>What if our CRM is messy?</summary><p>We include a hygiene checklist; if critical gaps exist we’ll scope a patch.</p></details>",
    "notesHtml": "<p><em>Pilot limited to one ICP segment; admin access required.</em></p>"
  },
  "why_you_need_this": {
    "pain_points": [
      "Leads stall at handoff",
      "Inconsistent follow-up",
      "No shared ICP rubric"
    ],
    "icp": "Seed–Series B B2B teams with inbound volume and a CRM admin.",
    "outcomes": [
      "Defined ICP segments with a scoring rubric",
      "Routing & distribution rules live in CRM",
      "Baseline funnel reporting in 2 weeks"
    ]
  },
  "what_you_get": {
    "highlights": ["Scoring rubric", "Routing rules", "Sales playbooks", "Dashboards"],
    "includes": [
      { "group_name": "Discovery & Design", "bullets": ["ICP workshop", "Current flow audit", "Scoring rubric"] },
      { "group_name": "Build & Enablement", "bullets": ["Routing rules", "Sales playbooks", "Handoff SLAs"] },
      { "group_name": "Reporting", "bullets": ["Funnel dashboard", "Attribution baseline"] }
    ],
    "deliverables": ["ICP rubric", "Routing config", "Playbooks", "Dashboards"]
  },
  "details_and_trust": {
    "pricing": { "monthly": { "amount": 6000, "currency": "USD" } },
    "price_band": {
      "tagline": "Starting at",
      "base_note": "proposal",
      "fine_print": "Implementation requires admin access; data hygiene issues may extend timelines."
    },
    "timeline": {
      "setup": "Week 1: Workshop, audit, rubric",
      "launch": "Week 2: Routing build, enablement, dashboards",
      "ongoing": "Optional ops support"
    },
    "requirements": ["CRM admin access", "Source tracking parameters enabled", "Sales acceptance criteria documented"],
    "caveats": ["No deceptive outreach", "Consent-based data use"]
  },
  "next_step": {
    "faqs": [],
    "cross_sell": { "related": ["smartdaw-lead-scoring", "smartdaw-outbound"], "add_ons": ["data-cleanup"] },
    "notes": null
  },

  /* ---------- Normalized mirrors for app components (do not hand-edit) ---------- */

  "id": "pkg_smartdaw",
  "slug": "smartdaw-strategic-flow",
  "service": "lead-generation",
  "name": "SmartDAW Strategic Flow",
  "tagline": "Two-week go-live.",
  "features": ["Scoring rubric", "Routing rules", "Sales playbooks", "Dashboards"],
  "includesGroups": [
    { "title": "Discovery & Design", "items": ["ICP workshop", "Current flow audit", "Scoring rubric"] },
    { "title": "Build & Enablement", "items": ["Routing rules", "Sales playbooks", "Handoff SLAs"] },
    { "title": "Reporting", "items": ["Funnel dashboard", "Attribution baseline"] }
  ],
  "includesTable": {
    "title": "What’s included",
    "caption": "Scope for the SmartDAW Strategic Flow package",
    "rows": ["ICP rubric", "Routing rules", "Playbooks", "Dashboards"]
  },
  "price": { "monthly": { "amount": 6000, "currency": "USD" } },
  "priceBand": {
    "tagline": "Starting at",
    "baseNote": "proposal",
    "finePrint": "Implementation requires admin access; data hygiene issues may extend timelines.",
    "ctas": [
      { "kind": "primary", "label": "Book intro call", "href": "/contact", "ariaLabel": "Book SmartDAW intro" },
      { "kind": "secondary", "label": "Download scope", "href": "/smartdaw/scope.pdf" }
    ]
  },
  "extras": {
    "timelineBlocks": [
      { "title": "Week 1", "description": "Workshop, audit, rubric" },
      { "title": "Week 2", "description": "Routing build, enablement, dashboards" }
    ],
    "requirements": ["CRM admin access", "Source tracking parameters enabled", "Sales acceptance criteria documented"],
    "ethics": ["No deceptive outreach", "Consent-based data use"]
  },
  "outcomes": [
    "Defined ICP segments with a scoring rubric",
    "Routing & distribution rules live in CRM",
    "Baseline funnel reporting in 2 weeks"
  ],
  "crossSell": [
    { "slug": "smartdaw-lead-scoring", "label": "Lead Scoring" },
    { "slug": "smartdaw-outbound", "label": "Outbound Playbooks" }
  ],
  "addOns": [{ "slug": "data-cleanup", "label": "Data Cleanup" }],

  /* ---------- Future public tiers (copied from internal.json only if flagged) ---------- */

  "internal_tiers": [
    {
      "name": "Core",
      "best_for": "Single ICP; Seed–Series A",
      "problem_solved": "Lead flow alignment and repeatable follow-up",
      "includes": ["ICP workshop", "Routing rules", "Playbooks", "Funnel dashboard"],
      "price": { "monthly": { "amount": 6000, "currency": "USD" } },
      "is_public": true
    }
  ],
  "ui": { "showTieredPricing": false }
}
```

> If this package is **custom-quote only**, omit `"price"` and leave the band’s CTAs; the band will render without an amount and JSON-LD will omit `offers`.

---

# external.json — Official documentation

## 1) What is `external.json`?

A **per-package, build-generated artifact** containing:

* All public fields the app needs to render a package detail page and hubs.
* Narrative HTML compiled from `public.mdx` (sanitized).
* A **normalized mirror** of the most consumed fields (`price`, `includesGroups`, `extras`, etc.) so components remain dumb.
* (Optional) a **public-safe view** of internal tiers for a future tiered pricing table.

**Source of truth:**

* Public content → `documents/domains/packages/catalog/<service>/<subservice>/<slug>/public.mdx`
* Pricing & ops → `…/internal.json` (recommended)

**Generated path:**
`src/data/packages/__generated__/packages/<slug>.external.json`

**Never edited by hand.**

---

## 2) Lifecycle (how it’s produced)

1. **Parse** `public.mdx` → frontmatter + Phase sections → `narrative.*Html`.
2. **Merge price** from `internal.json` (Mode A) or accept strict frontmatter price (Mode B).
3. **Normalize**:

   * `what_you_get.includes[].{group_name,bullets[]}` → `includesGroups[].{title,items[]}`
   * `details_and_trust.timeline{setup,launch,ongoing}` → `extras.timelineBlocks[]` (user-friendly steps)
4. **Validate** against schema (see below).
5. **Write** per-slug JSON; **update** `index.json` catalog.

---

## 3) Field reference (contract)

### Money / Price

* `Money`: `{ amount: number; currency: "USD" }`
* `Price`: `{ monthly?: Money; oneTime?: Money }`
* **Rules:** USD only; either `monthly` or `oneTime` (or neither for custom quote).

### Nested authoring sections

* `meta`: identity & taxonomy (`id`, `slug`, `service`, `category?`, `tier?`, `badges?`, `tags?`)
* `hero`: `seo?`, `summary` (value prop), `image?`
* `narrative`: `overviewHtml?`, `purposeHtml?`, `faqHtml?`, `notesHtml?` (compiled & sanitized)
* `why_you_need_this`: `pain_points?`, `icp?`, `outcomes?`
* `what_you_get`: `highlights?`, **`includes[]`** (groups), `deliverables?`
* `details_and_trust`: `pricing?`, `price_band?{tagline?,base_note?,fine_print?}`, `timeline?`, `requirements?`, `caveats?`
* `next_step`: `faqs?[]`, `cross_sell?{related[] , add_ons[]}`, `notes?`

### Normalized mirrors (for UI)

* Mirrors: `price`, `priceBand{tagline?,baseNote?,finePrint?,ctas[]}`, `includesGroups[]`, `includesTable?`, `extras{timelineBlocks[],requirements[],ethics[]}`, `features[]`, `outcomes[]`, `crossSell[]`, `addOns[]`
* Top-level identity mirrors (`id`, `slug`, `service`, `name?`, `tagline?`) exist for compatibility with legacy `base.ts`.

### UI flags & public tiers

* `ui.showTieredPricing?: boolean` — gated rollout.
* `internal_tiers?: Tier[]` — **only** when explicitly enabled at build; copy **public-safe** tier rows where `is_public: true`.

---

## 4) Validation rules (CI gates)

* **Required:** `meta.id`, `meta.slug`, `meta.service`, `hero.summary`, and **at least one** of `includesGroups` or `includesTable`.
* **Price:** optional; if present must be valid `Price` (USD). If price **absent**, JSON-LD must **omit** `offers`.
* **MDX safety:** sanitize compiled HTML; disallow `<script>` etc.
* **No price prose in MDX** (Mode A): fail on patterns like `$123`, `per month`, `% off`.
* **Slug uniqueness** across catalog.
* **Adapter smoke test:** generated JSON → PDO props → render without runtime errors.

---

## 5) How the UI consumes it

* **Detail page** (`PackagesDetailTemplate` + `PackageDetailOverview`):

  * `TitleBlock`: `name` (or `meta.slug` as fallback), `hero.summary`, `narrative.overviewHtml`
  * `MetaRow`: `meta.service`, `meta.tags`
  * `OutcomesBlock`: `outcomes`
  * `IncludesFromGroups` / `PackageIncludesTable`: `includesGroups` / `includesTable`
  * `NotesBlock`: `narrative.notesHtml`
  * `PriceActionsBand`: `price`, `priceBand`
  * `PackageDetailExtras`: `extras.timelineBlocks`, `extras.requirements`, `extras.ethics`
  * `FAQSection`: `narrative.faqHtml` (or normalized FAQs)
  * `Rails`: `crossSell`, `addOns`
  * *(Later)* `TieredPricingTable`: render **only** if `ui.showTieredPricing === true` and at least one `internal_tiers[].is_public === true`.

* **Hubs/search**:

  * `index.json` carries light metadata (id, slug, name/summary, tags, `hasPrice`); cards use `features`/`includes` snippets.

---

## 6) Examples

### A) Custom-quote package (no price)

```json
{
  "meta": { "id": "pkg_custom", "slug": "advanced-integrations", "service": "lead-generation" },
  "hero": { "summary": "Complex integrations for unique stacks." },
  "price": null,
  "priceBand": {
    "tagline": "Custom quote",
    "finePrint": "Scoped after discovery.",
    "ctas": [{ "kind": "primary", "label": "Request proposal", "href": "/contact" }]
  },
  "includesGroups": [{ "title": "Scope", "items": ["Discovery", "Solution design"] }]
}
```

### B) One-time price

```json
{
  "price": { "oneTime": { "amount": 24000, "currency": "USD" } },
  "priceBand": { "baseNote": "final" }
}
```

---

## 7) Change management & versioning

* Add optional `"schemaVersion": "2025-09-30"` at top level if you want hard gating.
* Backward compatibility: keep normalized mirrors; prefer nested sections (`meta`, `hero`, etc.) for new code.
* Deprecations follow: **add → mirror → migrate → remove** with a CI warning window.

---

If you want this wired into your repo immediately, paste the JSON above into your build’s golden sample, and keep the doc section alongside your standards in `documents/domains/packages/standards/`.
