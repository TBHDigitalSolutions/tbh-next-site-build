Awesome — here’s a **production-ready master template** you can drop into any package folder as `public.mdx`. It’s fully aligned with the build scripts + `mdx-frontmatter-schema` you’re using and includes clear comments on every field so authors don’t get tripped up (quoting, required fields, alternatives, etc.).

> **How to use**
>
> 1. Copy this file into a new folder like:
>    `docs/packages/catalog/<service>/<subservice>/<your-slug>/public.mdx`
> 2. Replace placeholder values with your package content.
> 3. Keep **at least one** of: `includesGroups` (preferred) **or** `includesTable` (fallback).
> 4. Keep the `## Purpose` section heading — the build compiles that section to `purposeHtml`.

---

# Master `public.mdx` template (copy–paste)

```mdx
---
# ──────────────────────────────────────────────────────────────────────────────
# Identity & taxonomy
# ──────────────────────────────────────────────────────────────────────────────
# Required, unique across catalog. Keep short & kebab-case.
id: "service-area-your-slug"
# URL path segment. Keep short & kebab-case.
slug: "your-slug"
# One of: webdev | seo | marketing | leadgen | content | video
service: "leadgen"
# Optional display category used in some templates/SEO (free text)
category: "Lead Generation"

# Public display name.
name: "Your Package Name"
# Optional badge shown in some UIs ("Essential", "Professional", etc.)
tier: "Essential"

# Tags help related / search. Lowercase, kebab-case recommended.
tags:
  - "tag-one"
  - "tag-two"
badges: []   # Optional visual badges; keep short tokens

# ──────────────────────────────────────────────────────────────────────────────
# Hero (top of page + card summary)
# ──────────────────────────────────────────────────────────────────────────────
# Keep to 1–2 sentences. This is your hero subtitle and card summary.
summary: "One sentence value proposition that is clear, concrete, and outcome-led."

# Optional longer blurb (1–3 short paragraphs). Keep plain text or simple quotes.
description: >
  A longer description (1–3 short paragraphs). This appears near the top of the
  detail page as the narrative body.

# Optional card/hero image. NOTE: If `alt` contains a colon (:), you MUST quote it.
image:
  src: "/packages/<service>/<slug>-card.png"
  alt: "Descriptive alt text: if you use a colon, keep it quoted."

# ──────────────────────────────────────────────────────────────────────────────
# Pricing (SSOT). At least ONE of { oneTime, monthly } is required and > 0.
# ──────────────────────────────────────────────────────────────────────────────
price:
  oneTime: 2000        # > 0
  monthly: 1500        # > 0 (omit if not used)
  currency: "USD"

# Optional detail-band microcopy (DO NOT copy the hero summary here).
priceBand:
  tagline: "Short marketing line specific to the pricing band."
  # "proposal" ≈ “price determined by proposal”; "final" ≈ “final after scope”
  baseNote: "proposal"
  finePrint: "3-month minimum • + ad spend if applicable"

# ──────────────────────────────────────────────────────────────────────────────
# Phase 2 — Why
# ──────────────────────────────────────────────────────────────────────────────
painPoints:
  - "Common problem statement one."
  - "Common problem statement two."
# ICP appears in Phase 1/2 context. Keep to one sentence.
icp: "One-sentence ideal customer profile."

# Outcomes should be crisp, KPI-flavored (3–6 bullets).
outcomes:
  - "↑ KPI improvement one"
  - "↓ Cost/risk/speed reduction"
  - "↑ Visibility / reliability / compliance"

# ──────────────────────────────────────────────────────────────────────────────
# Phase 3 — What you get
# ──────────────────────────────────────────────────────────────────────────────
# Top highlights (used by Highlights components/cards). Keep 5–8.
features:
  - "Highlight / feature one"
  - "Highlight / feature two"
  - "Highlight / feature three"

# Primary “What’s included” authoring model (preferred).
# You MUST include at least one of: includesGroups (preferred) OR includesTable (fallback).
includesGroups:
  - title: "Group A"
    items:
      - "Included item A1"
      - "Included item A2"
  - title: "Group B"
    items:
      - "Included item B1"

# --- Alternative (fallback) table authoring model (COMMENT OUT if you use groups) ---
# includesTable:
#   caption: "What’s included"
#   # You can pass columns as strings; the build will normalize ids.
#   columns: ["Your Package Name"]
#   rows:
#     - ["Included item one", "✓"]
#     - ["Included item two", "✓"]

# Optional concise deliverables list (besides inclusions).
deliverables:
  - "Deliverable one"
  - "Deliverable two"

# ──────────────────────────────────────────────────────────────────────────────
# Phase 4 — Details & trust
# ──────────────────────────────────────────────────────────────────────────────
# What you need from the customer to start.
requirements:
  - "Access / integrations / credentials"
  - "Owner / approver / calendars"

# Setup / launch / ongoing cadence (short phrases).
timeline:
  setup: "X–Y business days"
  launch: "Pilot/preview then go-live"
  ongoing: "Monthly maintenance / reporting"

# Ethical guardrails and explicit limits.
ethics:
  - "We follow declared rules/guardrails"
  - "Out-of-scope items are clearly noted"

# Optional note that renders under includes or details.
notes: >
  Small print or scoping details that are helpful to set expectations.

# ──────────────────────────────────────────────────────────────────────────────
# Phase 5 — Next (FAQ)
# ──────────────────────────────────────────────────────────────────────────────
faqs:
  - id: "faq-1"
    question: "Short customer question?"
    answer: "Concise, practical answer."
  - id: "faq-2"
    q: "Alternative keys (q/a) are also accepted."
    a: "Answer goes here."

# ──────────────────────────────────────────────────────────────────────────────
# Cross-sell & add-ons (slugs)
# ──────────────────────────────────────────────────────────────────────────────
crossSell:
  - "related-package-slug"
addOns:
  - "add-on-slug-1"
  - "add-on-slug-2"

# ──────────────────────────────────────────────────────────────────────────────
# SEO (optional)
# ──────────────────────────────────────────────────────────────────────────────
seo:
  title: "Your Package Name"
  description: "Concise meta description for social/OG/Twitter."

# ──────────────────────────────────────────────────────────────────────────────
# Optional per-phase copy overrides (used by headers/subsections)
# ──────────────────────────────────────────────────────────────────────────────
copy:
  phase1:
    title: "Your Package Name"
    tagline: "Short hero tagline"
  phase2:
    title: "Why you need this"
    tagline: "Common problems, purpose & outcomes"
  phase3:
    title: "What you get"
    tagline: "Highlights, inclusions, and deliverables"
    includesTitle: "What’s included"
    includesSubtitle: "Everything that ships with this package."
    highlightsTitle: "Highlights"
    highlightsTagline: "Top features at a glance"
  phase4:
    title: "Details & Trust"
    tagline: "Timeline, requirements, and guardrails"
  phase5:
    title: "What’s next"
    tagline: "How to proceed and what else to explore"
---

## Purpose

**What good looks like:** One paragraph under this heading is converted into `purposeHtml`
at build time. You can use **bold**, _italics_, and basic inline formatting. Keep it brief.
```

---

## Authoring rules & gotchas (quick checklist)

* **Required fields:** `id`, `slug`, `service`, `name`, `summary`, `outcomes`, `price`, and **either** `includesGroups` **or** `includesTable`.
* **Pricing:** At least one of `price.oneTime` or `price.monthly` must be present and **> 0** (the build fails on `0`).
* **Quoting:** If you use a colon (`:`) inside YAML values (like `image.alt`), **wrap the string in quotes**.
  Example: `alt: "Logo sting: lower thirds, transitions"`
* **Purpose section:** Keep the `## Purpose` heading; the build extracts that section into `purposeHtml`.
* **Includes authoring:** Prefer `includesGroups` (cards/list). Use `includesTable` only when you need a matrix. Never include both (comment one out).
* **Paths:** Place files under `docs/packages/catalog/<service>/<subservice>/<slug>/public.mdx`.
  The build tools infer service/subservice/slug from this path if you forget them in frontmatter.

---

## Optional: starter `base.ts` (registry SSOT) template

If you also keep a typed SSOT next to your registry loader, here’s a minimal, reusable skeleton that mirrors the UI expectations. Save as:

`src/packages/registry/<service>-packages/<slug>/base.ts`

```ts
// src/packages/registry/<service>-packages/<slug>/base.ts
/**
 * Canonical Package Record (SSOT)
 * - Keeps runtime data typed and co-located with the registry loader.
 * - Mirrors the fields used by the UI (hero, phases, extras, faq).
 */

export type Money = { oneTime?: number; monthly?: number; currency: "USD" };
export type PriceBand = { tagline?: string; baseNote?: "proposal" | "final"; finePrint?: string };
export type IncludeItem = string | { label: string; note?: string };
export type IncludeGroup = { title: string; items: IncludeItem[] };

export type PackageBase = {
  id: string;
  slug: string;
  service: "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";
  category?: string;
  name: string;
  tier?: string;
  tags?: string[];
  badges?: string[];

  summary: string;
  description?: string;
  image?: { src: string; alt: string };

  price: Money;
  priceBand?: PriceBand;

  painPoints?: string[];
  purposeHtml?: string;
  icp?: string;
  outcomes: string[];

  features?: Array<string | { label: string; icon?: string }>;
  includes: IncludeGroup[];
  includesTable?: {
    caption?: string;
    columns: Array<{ id: string; label: string }>;
    rows: Array<{ id: string; label: string; values: Record<string, boolean | string> }>;
  };
  deliverables?: string[];

  requirements?: string[];
  timeline?: { setup?: string; launch?: string; ongoing?: string };
  ethics?: string[];
  notes?: string;

  faqs?: Array<{ id?: string | number; q?: string; a?: string; question?: string; answer?: string }>;
  relatedSlugs?: string[];
  addOnRecommendations?: string[];

  seo?: { title?: string; description?: string };
  copy?: {
    phase1?: { title?: string; tagline?: string };
    phase2?: { title?: string; tagline?: string };
    phase3?: {
      title?: string;
      tagline?: string;
      includesTitle?: string;
      includesSubtitle?: string;
      highlightsTitle?: string;
      highlightsTagline?: string;
    };
    phase4?: { title?: string; tagline?: string };
    phase5?: { title?: string; tagline?: string };
  };
};

export const base: PackageBase = {
  id: "service-area-your-slug",
  slug: "your-slug",
  service: "leadgen",
  category: "Lead Generation",
  name: "Your Package Name",
  tier: "Essential",
  tags: ["tag-one", "tag-two"],
  badges: [],

  summary: "One sentence value proposition.",
  description: "A short paragraph of context.",
  image: { src: "/packages/<service>/<slug>-card.png", alt: "Descriptive alt" },

  price: { oneTime: 2000, monthly: 1500, currency: "USD" },
  priceBand: { tagline: "Band tagline", baseNote: "proposal", finePrint: "3-month minimum" },

  painPoints: ["Problem one", "Problem two"],
  purposeHtml: "<p>One concise paragraph extracted from MDX Purpose.</p>",
  icp: "One-sentence ICP.",
  outcomes: ["↑ KPI one", "↓ Cost two"],

  features: ["Feature one", "Feature two"],
  includes: [
    { title: "Group A", items: ["Item A1", "Item A2"] },
    { title: "Group B", items: ["Item B1"] },
  ],

  requirements: ["Access / integrations"],
  timeline: { setup: "X–Y days", launch: "Pilot then go-live", ongoing: "Monthly review" },
  ethics: ["Clear guardrail or limit"],
  notes: "Scope note.",

  faqs: [{ id: "faq-1", question: "Q?", answer: "A." }],
  relatedSlugs: ["another-slug"],
  addOnRecommendations: ["add-on-1"],

  seo: { title: "Your Package Name", description: "Concise meta description." },
  copy: {
    phase1: { title: "Your Package Name", tagline: "Hero tagline" },
    phase3: {
      title: "What you get",
      includesTitle: "What’s included",
      includesSubtitle: "Everything that ships with this package.",
      highlightsTitle: "Highlights",
    },
  },
};
```

---

## Why this template is “production-ready”

* Matches the **author-facing schema** (frontmatter) and the **runtime schema** used by your pages.
* Prevents common build failures:

  * Ensures one of `includesGroups` / `includesTable` is present.
  * Warns to **quote any colon-containing values** like `image.alt`.
  * Reminds that **price numbers must be > 0**.
* Keeps the **Purpose** section heading so your pipeline correctly generates `purposeHtml`.
* Keeps slugs/taxonomy consistent with the **expected folder structure**.

If you want, I can also generate a **lintable example pair** (one MDX + one base.ts) for each core service to seed your catalog quickly.
