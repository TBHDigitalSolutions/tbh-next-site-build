title: "External Packages MDX Template (Hybrid)"
domain: "packages"
file: "packages-mdx_Template_2025-10-01.md"
main: "packages-mdx"
qualifier: "Template"
date: "2025-10-01"
time: 12:09pm
status: "Approved"
owners: ["@yourname"]
tags: ["packages","mdx","template","hybrid","authoring","external-json","internal-json","build"]
spotlight:
  - "Hybrid model: narrative lives in public.mdx; structured data in external.json/internal.json"
  - "Strict rule: no pricing or currency prose in MDX"
  - "Build compiles MDX to sanitized narrative.*Html and attaches it to per-slug external JSON"
  - "Per-slug outputs fix the 'one big JSON' problem and emit a tiny index.json for hubs/search"
  - "Clear mapping of MDX sections → narrative fields (Overview/Purpose/Notes/FAQ)"
  - "Editor checklist ensures slug/title/summary quality and compliance"
summary: "Production-ready MDX template for external packages using the hybrid model. Authors write narrative only in public.mdx while all structured fields (outcomes, includes, price band copy, extras, rails) live in external.json/internal.json. The build compiles MDX into narrative.*Html and attaches it to a generated per-slug external JSON consumed by the app."
links:
  related: []

-----
10-01-2025 | 12:09pm
---
Got it—here’s the **production-ready, hybrid MDX template** for external packages, updated to match the current architecture:

* **Hybrid model**: authors write **narrative only** in `public.mdx`.
* All **structured data** (outcomes, includes, price band copy, rails, extras, etc.) lives in **`external.json`**.
* **No pricing** (numbers, currency symbols, “starting at…”) may appear in MDX.
* The build compiles MDX → `narrative.*Html` and **attaches** it into the generated per-slug external JSON your app reads via the usual typed `base`.

---

# Where this file lives

```
documents/domains/packages/catalog/<slug>/public.mdx
```

---

# What this MDX controls (and how it maps)

| MDX section   | Generated external JSON field |
| ------------- | ----------------------------- |
| `## Overview` | `narrative.overviewHtml`      |
| `## Purpose`  | `narrative.purposeHtml`       |
| `## Notes`    | `narrative.notesHtml`         |
| `## FAQ`      | `narrative.faqHtml`           |

Everything else (meta, outcomes, includes, features, price band copy, extras, cross-sell, add-ons, sticky summary, SEO title/desc, etc.) is authored in **`external.json`** and/or **`internal.json`**.

---

# Production MDX template (copy this)

```md
---
# REQUIRED — keep light; structured fields live in external.json
slug: smartdaw-strategic-flow              # must match folder name
title: SmartDAW Strategic Flow             # visible H1/title on page
summary: Align demand gen with sales, fast. # short value prop shown in hero and rail
status: Approved                           # Draft | In Review | Approved
authors: ["@owner-handle"]                 # optional list of handles

# OPTIONAL — only for page <head>; structured SEO stays in external.json if you prefer
seo:
  title: SmartDAW Strategic Flow Packages
  description: From ad to won: ICP, lead routing, playbooks, and reporting.
---

<!--
💡 Authoring guardrails (do not delete):

1) NO PRICING in MDX — never include currency symbols, dollar amounts, or “starting at” text.
2) Keep paragraphs short (2–4 sentences). Use headings & lists for scannability.
3) Links are allowed, but avoid deep technical docs here; this page is customer-facing narrative.
4) Accessibility: prefer descriptive link text (avoid “click here”).
-->

## Overview

A few short paragraphs (2–6 sentences total) that set context and promise the outcome.
Explain *what* the package is and *why now*, in plain language. Avoid feature lists here;
that comes later in the includes and outcomes on the page.

## Purpose

One focused paragraph (~3–5 sentences) describing the business outcome and how success
will be measured at a high level. Speak to exec/decision-maker context. Avoid technical
implementation details.

## Notes

- Scope assumptions or caveats that matter to buyers (e.g., limited to one ICP segment).
- What the team needs from the customer (but save the “hard” requirements list for `external.json > extras.requirements`).
- Ethical guardrails at a high level (detail lives in `extras.ethics` in `external.json`).

## FAQ

### What if our CRM is messy?
We include a hygiene checklist; if critical gaps exist, we’ll scope a patch project.

### How fast can we go live?
Typical projects complete in two weeks after access is granted.

### Who needs to be involved on our side?
A sales lead and a marketing/ops contact for 2× 60-minute workshops.
```

---

## Acceptance checklist (editors)

* [ ] **No pricing** or currency symbols appear anywhere in MDX.
* [ ] `slug` matches the folder name exactly.
* [ ] `title` and `summary` are present and written for customers.
* [ ] Overview ≤ ~150–200 words; Purpose is a single, clear paragraph.
* [ ] Notes are concise; detailed requirements/ethics go in **`external.json`**.
* [ ] FAQ entries (if present) use `###` headings and short answers.

---

## Quick reminder: where to put everything else

* **`external.json`** (public, structured): outcomes, features, includesGroups / includesTable, price **band copy** (tagline/note/finePrint/CTAs — *no numbers*), extras (timelineBlocks, requirements, ethics), sticky summary, SEO, crossSell/addOns, tags/category/badges.
* **`internal.json`** (private): tiers, canonical **price** (numbers), margins, ops. Build may copy the canonical tier **price** into `priceBand.price` during synthesis.

This keeps your **hybrid** workflow clean, scalable, and compliant—and fixes the “one big JSON” problem by letting the build emit **one generated external JSON per slug** with these MDX narratives attached.
