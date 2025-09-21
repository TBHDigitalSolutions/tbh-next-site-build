Awesome—let’s lock down clear, simple rules for your **Services** information architecture, URLs, SEO, and on-page copy. I’ll use **Marketing Services** as the running example and tie it back to your existing services docs so everything stays consistent. &#x20;

# Services rules (L0 → L4)

**Level naming (what each page is):**

* **L0 – Site root:** `/`
* **L1 – Services root:** `/services` (optional hub overview page)
* **L2 – Hub (canonical, ends with “-services”):**
  `/web-development-services`, `/video-production-services`, `/seo-services`, `/marketing-services`, `/lead-generation-services`, `/content-production-services`
* **L3 – Service (inside a hub):**
  `/services/{hub}/{service}` → e.g., `/services/marketing/digital-advertising`
* **L4 – Subservice (inside a service):**
  `/services/{hub}/{service}/{sub}` → e.g., `/services/marketing/digital-advertising/paid-social`

> Your middleware already normalizes hub aliases to **six canonical L2 slugs** (the \*-services hubs). Keep using those; **never** create a second L2 variant.

---

## URL / slug rules

* **Hubs (L2):** must end with `-services`, e.g. `/marketing-services`.
* **Services (L3) & subservices (L4):** **do not** end with `-services`.
  Use short, specific, kebab-case nouns:
  `digital-advertising`, `content-creative`, `martech-automation`, `paid-social`, etc.
* **No trailing slashes**; lowercase only; kebab-case; ASCII.
* **Reserved words:** don’t use `packages` as a subservice slug.
* **Aliases/redirects:** if you ever add an alias, update **middleware** and the **taxonomy** together so the canonical stays stable.

**Examples (Marketing):**

* L2 (hub): `/marketing-services`
* L3 (services):
  `/services/marketing/digital-advertising`
  `/services/marketing/content-creative`
  `/services/marketing/martech-automation`
* L4 (subservices):
  `/services/marketing/digital-advertising/paid-social`
  `/services/marketing/analytics-optimization/experimentation`

(These match the structure you’ve defined for Marketing. )

---

## “Marketing” vs “Marketing Services” (when to use which)

* **Use “Marketing Services”** when referring to the **hub** (the offerings you sell):
  Page title/H1, navigation label, internal links **at L2**.
* **Use “Marketing”** only as a **discipline/descriptor** in body copy, not as the hub name.
  Good: “Our **marketing** team runs experimentation.”
  Avoid as a page title on hub/service pages (it’s ambiguous and hurts SEO intent).

**Rule of thumb:**

* Page or nav label for L2 hub → **“Marketing Services”**.
* Body text / generic discipline mention → **“marketing”**.

---

## Page SEO rules (per level)

**General:**

* One **H1** per page. Keep it direct and match page intent.
* Unique **<title>** (50–60 chars) and **meta description** (140–160 chars).
* Use **breadcrumb schema** (JSON-LD) across L2–L4.
* Internal links should follow the canonical paths; add `rel="canonical"` only if an alias exists (ideally aliases 301 to the canonical).

### L2 hub (e.g., `/marketing-services`)

* **Title:** `Marketing Services | Company`
* **H1:** `Marketing Services`
* **H2s:** six L3 categories (cards/sections), each linking to its L3 page.
* **Copy focus:** value prop + category overviews + proof (logos, testimonials).
* **Structured data:** `Organization`, `BreadcrumbList`.

### L3 service (e.g., `/services/marketing/digital-advertising`)

* **Title:** `Digital Advertising Services | Company`
* **H1:** `Digital Advertising Services`
* **H2s:** key offers or outcomes (e.g., Paid Search, Paid Social, Programmatic).
* **Copy focus:** what/why/outcomes, pricing signals or CTAs, FAQs.
* **Structured data:** `Service`, `FAQPage` (if FAQs), `BreadcrumbList`.

### L4 subservice (e.g., `/services/marketing/digital-advertising/paid-social`)

* **Title:** `Paid Social Advertising | Company`
* **H1:** `Paid Social Advertising`
* **Copy focus:** scope, deliverables, process, examples, CTA.
* **Structured data:** `Service`, optional `Product` if you package it.

> Your “Marketing Services Structure” already enumerates the L3/L4 breakdown—mirror those names and slugs exactly to keep taxonomy, pages, and URLs aligned.&#x20;

---

## Copy rules (headings & phrasing)

* **Headings (H1/H2):**

  * L2 hub: “**{Hub} Services**” (e.g., “Marketing Services”).
  * L3 service: “**{Service} Services**” (e.g., “Analytics & Optimization Services”).
  * L4 subservice: **no “services”** suffix if it’s a technique (“Paid Social Advertising”).
* **Use “for {audience/industry}”** when targeting a segment:

  * “Digital Advertising **for SaaS**” → ok as an H2 or section header.
  * Keep L2/L3 H1s generic (broadest intent); use segment targeting in sections.
* **Avoid fluff:** start sections with outcomes and proof. Add FAQs to capture long-tail.

---

## Navigation, breadcrumbs, and anchors

* **Nav labels** must match page H1s for clarity (L2/L3).
* **Breadcrumbs** reflect L2→L3→L4 (no L1 if `/services` is just a virtual root).
* **Anchors**: use semantic, predictable ids (e.g., `#pricing`, `#faqs`).

---

## Content modules per level (minimum viable)

* **L2 (hub):** Hero, overview, six category cards (L3), testimonials, CTA.
* **L3 (service):** Hero, outcomes, list of L4s, case studies, FAQs, CTA.
* **L4 (subservice):** Hero, what you do, process, examples, FAQs, CTA.

(Your Services Knowledge Hub groups these consistently; keep both the “structure” doc and “directory tree” in sync as you evolve content. )

---

## Internal linking rules

* From **L2 → L3:** grid/cards for each service.
* From **L3 → L4:** list/cards of subservices; related services section.
* From **L4:** link up to parent (L3) and across to siblings (other L4s), plus 1–2 related L3s in other hubs if relevant (but avoid link farms).

---

## Analytics & conversions

* All L2–L4 pages: consistent **primary CTA** (book, contact, quote).
* Track **CTA clicks**, **section visibility** (for long pages), and **FAQ toggles** for intent signals.
* Use the same event names and properties across hubs (helps reporting).

---

# Examples (Marketing)

### L2 hub

* **URL:** `/marketing-services`
* **Title:** `Marketing Services | Company`
* **H1:** `Marketing Services`
* **Sections:** Digital Advertising, Content & Creative, MarTech & Automation, Analytics & Optimization, PR & Communications, Strategy & Consulting.&#x20;

### L3 service

* **URL:** `/services/marketing/digital-advertising`
* **Title:** `Digital Advertising Services | Company`
* **H1:** `Digital Advertising Services`
* **Child links (L4):** Paid Search, Paid Social, Programmatic, CTV-OTT, Remarketing, Shopping/Retail Media.&#x20;

### L4 subservice

* **URL:** `/services/marketing/digital-advertising/paid-social`
* **Title:** `Paid Social Advertising | Company`
* **H1:** `Paid Social Advertising`
* **Body:** platforms, targeting, creative, measurement; CTA.

---

## Governance & “single source of truth”

* **Taxonomy:** keep canonical slugs and the L2→L3→L4 tree in one place, then **import** it everywhere (pages, middleware, scripts).
* **Middleware:** only knows **hubs** (L2) and their **aliases** → redirects to canonical `*-services`. Don’t hardcode services/subservices in middleware.
* **generateStaticParams:** derive all L3/L4 paths **from the taxonomy**, not ad hoc arrays.

---

## Documentation that mirrors the project

* Create `/docs/services` with this structure:

  ```
  docs/
    services/
      services_index.md
      marketing/
        marketing_services_structure.md
        marketing_directory_tree.txt
      seo-services/ ...
      web-development/ ...
      video-production/ ...
      lead-generation/ ...
      content-production/ ...
  ```
* **Two files per hub:**

  * **Structure** (client-facing, L2→L3→L4 descriptions).
  * **Directory tree** (internal file tree for assets/pages).
* Update the index when you add/edit hubs; keep file names in `snake_case` for consistency. (Matches the “Services Knowledge Hub” pattern you started. )

---

## Quick checklist (use every time)

* ✅ URL matches level rules (L2 ends with `-services`; L3/L4 don’t).
* ✅ H1 matches page intent (L2/L3: “{Thing} Services”; L4: specific technique).
* ✅ Title/description unique; breadcrumb JSON-LD present.
* ✅ Internal links wired L2→L3→L4; related links sensible.
* ✅ Copy uses **“Marketing Services”** for the hub and **“marketing”** as a discipline inside body text.
* ✅ New slugs/titles reflected in **taxonomy**, pages, and docs.

If you want, I can turn this into a ready-to-drop **`docs/services/rules.md`** plus a small **lint script** that checks H1/title alignment across L2–L4.
