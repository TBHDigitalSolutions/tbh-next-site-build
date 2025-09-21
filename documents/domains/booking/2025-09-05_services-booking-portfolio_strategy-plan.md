Awesome—here’s a clear plan for both **booking** and **portfolio** that fits your app routes, reuses your existing components, and keeps UX + SEO tight.

---

# 1) Bookings / Appointment Settings

## Recommended approach: **Hybrid**

Use **both** a dedicated page *and* a modal. They serve different moments:

* **Dedicated page**: `/book`
  Best for SEO, shareable links, and full details (meeting options, prep notes, FAQs, timezone hints). Link this from nav, footers, and long-form CTAs.

* **Modal quick-book**: open from any CTA (button on hero, cards, carousels)
  Ideal when a user already has intent on a service page—don’t make them leave the flow.

### How to wire it up in Next.js  (fits your directory)

* **Route**: `app/book/page.tsx` → embeds your scheduler (Calendly, Cal.com) **or** your own booking form.
* **Modal**: keep CTAs pointing to `/book`, but enable **modal-on-route** with parallel/Intercepted routes:

  * Add `(modals)/book/page.tsx` and show it as a modal overlay when the URL is `/book` from inside a service page.
  * Outside service pages (e.g., direct visit), render the full page.
* **Prefill context**: pass querystrings to personalize:

  * From video page → `/book?topic=video&ref=/services/video-production`
  * Use these to set default calendar type / intake form fields.

### Where to place the CTA

* In your **ModulesCarousel** “Explore Next Steps” section, keep the **Booking** tile (you already have it):

  * It links to `/book` and shows as a consistent card everywhere. You’re already set here—and the styling is uniform via `ModuleCard` + `ModulesCarousel`. &#x20;

### Backend integration (later)

* Pipe bookings to Dolibarr/ERPNext as **leads/opportunities**. (Use the same API pattern you’ve built for quote-requests.)

---

# 2) Portfolio / Past Work Examples

## Recommended approach: **Hub + Service-local embeds (shared data)**

Use a **single global portfolio hub** that’s filterable/searchable **and** embed service-specific slices on each service page.

### Structure

* **Global directory**: `/portfolio`

  * Acts like a **searchable hub** for *all* work.
  * Filters by **Service (Video, Web, Design)**, **Industry**, **Tags**, and has a search bar.
  * Ideal for prospects who want to browse everything in one place.

* **Service-specific portfolio pages**:

  * `/portfolio/video` → uses your **VideoPortfolioGallery** (search + filters + lightbox/inline) for all video items.
  * `/portfolio/web` → uses **PortfolioDemoClient** for site demos (with modal next/prev).
  * `/portfolio/design` → (new) reuse a generic grid/gallery (same API/data, different template).

* **Embedded sections on service pages**:

  * On `/services/[hub]/[service]`, show a **“Featured work”** band with 6–9 filtered items + CTA “View all \[Service] work” → `/portfolio/[service]`.
  * This keeps decision-making context on the service page but lets explorers go deep.

### Reuse your components

* **Video work** → `VideoPortfolioGallery` (already supports search, filters, lightbox, and inline playback). Perfect for `/portfolio/video` and for embedded sections with a “show more” CTA.&#x20;
* **Web work** → `PortfolioDemoClient` (already includes gallery + modal demos). Great for `/portfolio/web` and snippets on the Web Dev service page.&#x20;
* **Cross-service modules** → surface portfolio entry points via **ModulesCarousel** on hubs/services (your “Explore Next Steps” section), with consistent cards via **ModuleCard**. &#x20;

### Data model (single source for all portfolio)

Create a shared dataset (CMS or JSON/TS) like `/data/portfolio/index.(ts|json)`:

```ts
type PortfolioItem = {
  id: string;
  title: string;
  service: "video" | "web" | "design" | "content" | "marketing";
  client?: string;
  description?: string;
  tags?: string[];
  // video
  src?: string;
  embedUrl?: string;
  thumbnail?: string;
  // web
  demoImages?: string[];
  demoSlug?: string;
  // generic
  cta?: { label: string; href: string };
  featured?: boolean;
};
```

* **Global page** `/portfolio` filters across all items.
* **Service pages** query the same dataset but filter by `service` (and maybe `featured`).

### UX/SEO notes

* Use **indexable pages** for `/portfolio`, `/portfolio/video`, `/portfolio/web` (great for SEO queries “video portfolio”, “website examples”).
* Use **schema.org** `CreativeWork`/`VideoObject` where possible.
* Keep **fast loads** (thumbs + lazy iframes), which your Video component already does.

---

## Where everything plugs into your current system

* **Calls-to-action** to booking are already modeled in your modules data:
  The “Book a Discovery Call” card uses `href: "/book"` inside **ModulesCarousel** and renders as a consistent card via **ModuleCard**. &#x20;

* **Video portfolio** UX is already solved with **VideoPortfolioGallery** (search, filters, lightbox/inline behaviors). Use this for `/portfolio/video` and small curated sections in service pages.&#x20;

* **Web portfolio** demos are already solved with **PortfolioDemoClient** (gallery + modal). Perfect for `/portfolio/web` and embeds.&#x20;

---

## Quick, opinionated blueprint

**Bookings**

* Add `app/book/page.tsx` (full page, SEO)
* Add `(modals)/book/page.tsx` to enable route-driven modal overlay on service pages
* Update all CTA buttons to link to `/book?topic=<service>`

**Portfolio**

* Add `app/portfolio/page.tsx` (hub, filters for all services)
* Add `app/portfolio/video/page.tsx` using `VideoPortfolioGallery`
* Add `app/portfolio/web/page.tsx` using `PortfolioDemoClient`
* On each service page, add **“Featured work”** (3–9 items) + “View all” link

**Modules / Carousels**

* Keep using **ModulesCarousel** on hub/service pages to surface next steps: case studies, portfolio, pricing, booking, etc. Your current `items` schema and `ModuleCard` design already support this pattern. &#x20;

---

## When to choose “one page for all portfolio” vs “per-service pages”

* **Both.** You need the global discovery surface **and** service-focused proof.

  * **Global `/portfolio`** = discovery and SEO.
  * **Per-service pages** = high-intent proof while deciding a specific service.
  * **Embedded strips** on service pages = reduce friction to proof.

---

If you want, I can sketch the **route files** and minimal **TSX stubs** for `/book`, `/portfolio`, `/portfolio/video`, and `/portfolio/web`, already wired to your components and ready for your data source.
