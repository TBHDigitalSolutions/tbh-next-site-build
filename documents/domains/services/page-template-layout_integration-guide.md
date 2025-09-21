Official Title: Service Page Component Layout and Integration Guide

Domain: Services, Web Development

File Name: service-page-template-layout_integration-guide_2025-09-12.md

Main Part: service-page-layout

Qualifier: IntegrationGuide

Date: 2025-09-12

Spotlight Comments:
- Defines component-by-component layout for L2 service pages with Portfolio and Case Studies separation.
- Integrates Portfolio orchestrator and Module Carousel for resources and case studies.
- Cross-references marketing-services-data-integration.md and services-page-blueprint.md.

Summary: The Service Page Component Layout and Integration Guide outlines a streamlined component-by-component structure for Level 2 service pages, focusing on the Marketing Services hub. It specifies using a single `PortfolioSection` orchestrator to handle visual examples (web, video, or demo variants), places case studies in the Module Carousel as resources, and ensures pricing clarity with a consultation disclaimer, maintaining SEO, UX, and performance through capped item counts and lazy-loading.

---

Absolutely—your mental model is solid, and your tweak (put case studies into the Module Carousel and keep “Portfolio” purely as visual examples) is the right call. Here’s how I’d handle it cleanly without clutter, plus the revised component-by-component layout.

## How to handle Portfolio vs. Case Studies

### 1) Make **Portfolio** a flexible, single orchestrator

Create a tiny `PortfolioSection` orchestrator that selects the right viewer based on the service’s content type:

* **Web examples (sites, dashboards, ecommerce):** use `StandardPortfolioGallery` (image-first grids, modal).
* **Video work:** use `VideoPortfolioGallery` (lightbox, inline playback, YouTube/Vimeo support, robust empty/loading states).&#x20;
* **Interactive demos (live-feel walkthroughs):** use `PortfolioDemoClient` (gallery + modal with prev/next controls).&#x20;

**Why one orchestrator?** You keep authoring/data contracts stable and switch presentation by `variant` or by inspecting item types. This avoids separate “case study carousel” logic on service pages entirely and prevents duplication.

**Minimal orchestrator idea**

* Props: `{ title?, subtitle?, variant?: "web" | "video" | "demo", items: [] }`
* Internally:

  * `variant === "video"` → render `VideoPortfolioGallery`
  * `variant === "demo"` → render `PortfolioDemoClient`
  * else → render `StandardPortfolioGallery`

**Data source**
Feed it from each hub/service’s `_shared/portfolio.json` (you already defined a solid JSON shape earlier). Keep it capped to **6–9 items** for scannability and performance; defer the long tail to a dedicated /work or /portfolio page.

### 2) Put **Case Studies** inside the **Module Carousel**

Treat case studies (PDFs, long-form write-ups, gated content) as **resources**, not visuals. Slot them into the Module Carousel along with calculators, checklists, and playbooks. Label it clearly as **“Resources & Case Studies”** so users know these are deep-dives/tools—different from the visual Portfolio examples.

### 3) Keep Pricing + Comparison light and honest

* Use your `PricingSection` (adapter-driven) to show **starting prices**. Include the disclaimer: *“Final pricing is set after a scope consultation.”* The section already supports a notes block and clean adapter boundaries.&#x20;
* If you need a side-by-side breakdown, use `ComparisonTable` (great for feature/tier grids; works well on mobile with the stacked list).&#x20;

### 4) Reinforce clarity with service-proof

* Use `Testimonials`/`TestimonialSlider` sparingly (2–3 items) to avoid noise. The slider normalizes authoring and auto-rotates beyond the visible count.&#x20;
* For L3/L4 “recognition” on the page, the new **Services & Capabilities + Expandable Bullets** module you’re adding is perfect—pillars + quick bullets + accordion items in one, so people immediately spot **their** problem/task. (You’ve got the orchestrator + parts scaffold set.)

### 5) Keep FAQs laser-focused

Use `FAQAccordion` for buying/implementation objections, not a knowledge base. You can keep the search and category filter on for longer lists; it already normalizes items defensively.&#x20;

### 6) Keep an eye on L2 structure

* If an L2 has children (acts like a sub-hub), show the child cards and L3 bullets there; otherwise show the L2 “sales page” (hero, intro, SAC+Expandable, Portfolio, Module Carousel, Pricing, Testimonials, FAQs, CTA).
* Avoid deep routes (skip separate L3/L4 pages). If you need scope breakdowns on a sub-topic, use `ScopeDeliverables` or your Expandable bullets—both are built for on-page clarity.&#x20;

---

## Updated plain-text layout (component-by-component)

> Key notes:
> • **Portfolio Section** = visual examples (web/video/demo).
> • **Case Studies live in the Module Carousel** (resources rail).
> • Pricing shows **starting prices** and includes a **consultation disclaimer**.

1. **ServiceHero**
   Headline, subhead, primary/secondary CTAs, credibility cues.

2. **SearchBanner (domain-specific)**
   From your search UI package; helps users jump to relevant content/tools fast.

3. **Overview Intro**
   TwoColumnSection or TwoColVideoSection to set the narrative (problem → approach → outcome).

4. **Services & Capabilities + Expandable Bullets (combined)**
   Single module: pillars (deliverables), quick bullets, and **expandable bullets** for L3/L4 recognition on-page.

5. **Portfolio Section (visual examples only)**
   Orchestrated:

* `variant="web"` → **StandardPortfolioGallery** (default)
* `variant="video"` → **VideoPortfolioGallery** (lightbox/inline)&#x20;
* `variant="demo"` → **PortfolioDemoClient** (interactive demo modal)&#x20;
  Cap items to 6–9. Add a “See all work” link if needed.

6. **Module Carousel (Resources & Case Studies)**
   One rail for **case studies** (PDF/long-form), playbooks, checklists, calculators, tools. Label clearly as “Resources & Case Studies”.

7. **Pricing Section**
   Use `PricingSection` (adapter) to render tiers; include notes block with the **starting-price** disclaimer:
   *“Final pricing is determined after a scope consultation.”*&#x20;

8. **Comparison Table (optional)**
   When plan distinctions need a matrix, render `ComparisonTable` right after Pricing.&#x20;

9. **Packages & Add-Ons**
   Quick snapshot of bundles and optional add-ons (link to packages catalog if needed).

10. **Testimonials**
    2–3 authoritative quotes; use `Testimonials` or `TestimonialSlider` to keep it light.&#x20;

11. **FAQAccordion**
    Top buying/implementation FAQs, with search/category filter as needed.&#x20;

12. **Final CTA**
    “Book a consult”, “Get an estimate”, “Request an audit”. Your CTA section already supports both primary/secondary buttons.&#x20;

---

## Why this works

* **SEO**: You keep one strong L2 page per service (canonical), rich with topical coverage (pillars, expandable bullets, portfolio, resources, FAQs).
* **UX**: No rabbit holes. People get recognition (L3/L4) without leaving the page.
* **Ops**: Orchestrators + adapters mean you swap **presentation** (video vs demo vs image galleries) without touching authoring.
* **Performance**: Cap portfolio items, lazy-load modals/lightboxes; defer big carousels below the fold.

If you want, I can drop a quick `PortfolioSection.tsx` orchestrator stub you can paste that wires `variant` → right gallery and accepts a single normalized `items` array.
