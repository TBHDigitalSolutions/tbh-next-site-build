---
title: "Package Registry Authoring — base.ts"
domain: "documentation"
file: "package-registry-authoring_README_2025-10-01.md"
main: "package-registry-authoring"
qualifier: "README"
date: "2025-10-01"
time: 12:58pm
status: "Approved"
owners: ["@yourname"]
tags: ["packages","registry","base.ts","typescript","pricing","mappers","documentation"]
spotlight:
  - "Defines base.ts as the single source of truth for package metadata, pricing, and content"
  - "Explains how card.ts and details.ts map base.ts into UI props via centralized mappers"
  - "Documents pricing policy, authoring rules (no CTA copy or 'Starting at…' prose), and a canonical example"
summary: "Production-ready README describing how to author base.ts for each package, what fields it must include, how centralized mappers consume it to build cards and detail pages, and the pricing/band policy that keeps UI consistent and maintainable."
links:
  related:
    - "./src/packages/lib/registry/mappers.ts"
    - "./src/packages/lib/pricing.ts"
    - "./src/packages/lib/band.ts"
    - "./src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts"

---

Here’s a **production-ready** `documentation/README.md` you can drop into the repo. It explains what `base.ts` is, every field it should contain, how it’s consumed by the app, and authoring rules/gotchas.

---

# Package Registry Authoring — `base.ts`

**Source of truth** for a single package’s metadata, pricing, and content.
Each package folder contains a `base.ts` that exports one typed object (no JSX, no UI code). Everything else (cards, detail pages, CTAs, price band) is **derived** from this file through centralized mappers.

- Typical location:

```
src/packages/registry/<family>/<slug>/base.ts
# e.g.
src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts
```

---

## What depends on `base.ts`?

These consumers read `base.ts` and build UI props:

- `src/packages/lib/registry/mappers.ts`

  - `buildPackageCardProps` → **PackageCard** (grid/rail)
  - `buildPackageDetailOverviewProps` → **PackageDetailOverview** (detail page)
  - `buildPinnedCardForDetail` → compact rail card on detail page
  - CTA policy & pricing band variant are handled here
- **Components** fed by the mappers:

  - `PackageCard` (default / rail / pinned-compact)
  - `PackageDetailOverview` (super-card section)
  - `PriceActionsBand` (detail page band; cards use band in “card” mode)
- **Helpers** used by mappers/components:

  - `src/packages/lib/pricing.ts` (canonical `Money`, `formatMoney`, SR labels)
  - `src/packages/lib/band.ts` (chooses band variant & default base-note)
  - `src/packages/lib/copy.ts` (CTA labels, base-note strings, badge text)

> ✅ **You never write teasers or CTA labels in** **`base.ts`** **.**  Those are derived centrally for consistency.

---

## Authoring goals

- Single, canonical **price** per package (`Money` type).
- Clear, short **summary** for cards & headings.
- Optional **description** for a longer paragraph on the detail page.
- Structured **includes** & **outcomes** for scannable value.
- Optional **Price Band** copy (only used on the **detail** page): `tagline`, `baseNote`, `finePrint`.

---

## Type (authoring shape)

Prefer importing shared types if available:

```ts
// If your registry/types exports this shape, import it.
// Otherwise keep the local type in base.ts consistent with this.
import type { Money } from "@/packages/lib/pricing";

export type PackageBase = {
  /* Identity & taxonomy */
  id: string;                       // unique, kebab-case recommended: "<family>-<slug>"
  slug: string;                     // URL slug: "lead-routing-distribution"
  service: "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";
  name: string;                     // Display name
  summary: string;                  // 1–2 sentence value prop (card + detail)
  description?: string;             // Longer blurb (detail overview body)
  price: Money;                     // { monthly?, oneTime?, currency? } — canonical

  tags?: string[];                  // Chips shown in hero (not in overview meta by default)
  badges?: string[];                // First badge may appear on cards if enabled
  tier?: string;                    // Cosmetic tag, e.g. "Essential"

  image?: { src: string; alt: string }; // Card/hero art

  /* Detail content */
  icp?: string;                     // 1 sentence “who it’s for”
  outcomes?: string[];              // 3–6 KPI bullets
  includes?: Array<{ title: string; items: string[] }>; // grouped bullets (SSOT)

  /* Price Band (detail page only; optional) */
  priceBand?: {
    tagline?: string;               // optional marketing line (detail only)
    baseNote?: "proposal" | "final";// override; default policy is hybrid/monthly→proposal, one-time→final
    finePrint?: string;             // e.g. "3-month minimum • + ad spend"
  };

  /* Extras (rendered via PackageDetailExtras when present) */
  deliverables?: string[];
  timeline?: { setup?: string; launch?: string; ongoing?: string };
  ethics?: string[];

  /* FAQs (free-form authoring) */
  faqs?: Array<{
    id?: string | number;
    question?: string; q?: string;  // either field is accepted
    answer?: string;   a?: string;
  }>;

  /* Small print under includes table (plain text) */
  notes?: string;

  /* Cross-sell / SEO */
  addOnRecommendations?: string[];
  relatedSlugs?: string[];
  seo?: { title?: string; description?: string };
};
```

---

## Canonical pricing (`Money`)

- **Shape:**  `{ monthly?: number; oneTime?: number; currency?: "USD" | string }`
- **Rules:**

  - **Monthly-only:**  `{ monthly: 1000, currency: "USD" }`
  - **Hybrid (monthly + setup):**  `{ monthly: 1000, oneTime: 2500, currency: "USD" }`
  - **One-time-only:**  `{ oneTime: 5000, currency: "USD" }`
- **Never author** “Starting at …” strings—UI derives them.
- **Policy:**  default base-note is:

  - monthly-only / hybrid →  **“proposal”**
  - one-time-only →  **“final”**

> The **cards** never show base-note or fine-print.
> The **detail page** shows the full band (badge, stacked/inline figure, base-note, optional fine-print).

---

## Example `base.ts`

```ts
// src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts
import type { Money } from "@/packages/lib/pricing";

export type PackageBase = { /* …keep in sync with README type… */ };

export const base: PackageBase = {
  id: "leadgen-routing-distribution",
  slug: "lead-routing-distribution",
  service: "leadgen",
  name: "Lead Routing & Distribution",
  summary:
    "Automated lead routing so reps always get the right leads, faster.",
  description:
    "We configure fair, transparent routing that respects territories and capacity, logs every handoff to your CRM, and ships with dashboards so RevOps can iterate safely.",

  price: { monthly: 1000, oneTime: 2500, currency: "USD" },

  tags: ["routing", "assignment", "automation"],
  badges: [],
  tier: "Essential",

  image: { src: "/packages/lead-generation/lead-routing-distribution-card.png", alt: "Lead routing assignment previews" },

  icp: "Sales teams using a CRM who need automated, fair, and fast lead assignment.",

  outcomes: [
    "Faster speed-to-lead",
    "Fair distribution across reps",
    "Consistent performance visibility",
  ],

  includes: [
    { title: "Distribution & Assignment", items: ["Territory-based distribution", "Round-robin assignment", "Basic assignment rules"] },
    { title: "Reporting & Telemetry",   items: ["Monthly performance reporting", "CRM-ready routing events"] },
    { title: "Scope & Connectivity",    items: ["Initial setup for one CRM", "Primary territory model included"] },
  ],

  // Optional band copy (detail page only)
  priceBand: {
    tagline: "Make every lead count with fair, fast assignment.",
    // baseNote: "proposal",        // omit to follow default policy
    finePrint: "3-month minimum • + ad spend",
  },

  // Optional deeper details for PackageDetailExtras
  deliverables: [
    "Configured routing rules and primary territory model",
    "Routing event logging into CRM with basic dashboards",
    "Admin playbook and training session",
  ],
  timeline: { setup: "3–5 business days", launch: "Pilot validation then go-live", ongoing: "Monthly review and tweaks" },
  ethics: [
    "Routing follows declared territory/assignment rules",
  ],

  // Optional FAQs
  faqs: [
    { id: "capacity", question: "Can we cap leads per rep per day?", answer: "Yes, with daily caps and catch-up logic." },
  ],

  // Small print under includes table
  notes: "Initial setup includes one CRM and one territory model.",

  // Cross-sell & SEO
  relatedSlugs: [],
  seo: { title: "Lead Routing & Distribution", description: "Automate lead assignment with rules and reporting." },
};
```

---

## How the app uses `base.ts`

- **Cards** (`PackageCard`)

  - Mappers read `base` → build props:

    - Name, summary, features (top 5 derived from `includes`)
    - Price (renders band in “card” mode w/ badge-left; chips for hybrids)
    - CTAs: **View details** (→ `/packages/<slug>`), **Book a call** (→ `/book`)
    - No base-note or fine-print on cards
- **Detail Overview** (`PackageDetailOverview`)

  - Mappers read `base` → build props:

    - Title, value prop (summary), description, icp
    - Outcomes and Includes (groups → grid; fallback table supported)
    - **PriceActionsBand**:

      - `variant` from price shape (`resolveBandVariant("detail", price)`)
      - `tagline`, `baseNote`, `finePrint` from `base.priceBand` (no summary fallback)
      - CTAs: **Request proposal** (→ `/contact`) + **Book a call** (→ `/book`)
    - Pinned rail card uses “Request proposal” primary

---

## Authoring rules & gotchas

### ✅ Do

- Keep `summary` **short** (1–2 sentences).
- Provide **real** grouped `includes`—the first \~5 items become card highlights.
- Write **alt** text for `image`.
- If authoring a band **tagline**, make it a concise marketing line (detail page only).
- Use **USD** unless there’s a good reason to switch.

### ❌ Don’t

- Don’t write “Starting at …” anywhere in authoring.
- Don’t put CTA copy or URLs in `base.ts`.
- Don’t copy `summary` into `priceBand.tagline`. (No summary → tagline fallback.)

### Pricing policy recap

- **Hybrid/Monthly-only** → default base-note  **“proposal.”**
- **One-time-only** → default base-note  **“final.”**
- Cards never show base-note/fine-print; detail page does.

---

## Naming conventions

- `id`: `"<family>-<slug>"`, e.g., `leadgen-routing-distribution`
- `slug`: lowercase, kebab-case; becomes `/packages/<slug>`
- `service`: one of `"webdev" | "seo" | "marketing" | "leadgen" | "content" | "video"`

---

## Quality checklist (PR review)

- [ ] Price is canonical `Money` (no teaser strings).
- [ ] `summary` is concise; `description` is optional but helpful.
- [ ] `includes` groups & items are clear; first 5 would read well as card highlights.
- [ ] `priceBand` (if present) includes only **detail** copy: `tagline`, `baseNote?`, `finePrint?`.
- [ ] No CTA labels or URLs in `base.ts`.
- [ ] `image.alt` is present when `image.src` is set.
- [ ] Strings are plain text (no HTML).
- [ ] Optional extras (timeline/ethics/faqs) are succinct and useful.

---

## How to wire a new package (quick start)

1. **Create a folder**: `src/packages/registry/<family>/<slug>/`
2. **Add** **`base.ts`** with the object above.
3. (Optional) **Add a README.md** for the author (use the SmartDAW template).
4. **Export mappers** (thin wrappers) or rely on centralized listing:

    ```ts
    // card.ts
    import { buildDefaultCard, buildRailCard } from "@/packages/lib/registry/mappers";
    import { base } from "./base";
    export const <slugCamel>Card = buildDefaultCard(base);
    export const <slugCamel>CardRail = buildRailCard(base);

    // details.ts
    import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
    import { base } from "./base";
    export const <slugCamel>Detail = buildPackageDetailOverviewProps(base);
    ```

    > Replace `<slugCamel>` with the slug in camelCase (e.g., `leadRoutingDistribution`).
    >

That’s it—the mappers and shared helpers will take care of pricing display, CTAs, and component wiring.