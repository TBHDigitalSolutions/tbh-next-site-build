PORTFOLIO BUILD GUIDE — UPDATED (PLAIN TEXT) VERSION 3

---

# Portfolio Build Guide (Plain Text)

This guide defines **what we’re building**, **how it’s structured**, **which components are used**, and **how data flows** for the Portfolio Hub (`/portfolio`) and each Portfolio Category (`/portfolio/[category]`). It includes the modal behavior for highlights, the new packages section on category pages, and the final contact CTA.

No code here—just a clear plan you can hand to design/dev.

---

## 1) Purpose & Goals

* **Prove capability** with real work samples per service.
* **Let users preview** work quickly (inline and in a modal).
* **Drive action** with relevant packages and clear CTAs.
* **Keep it consistent** across hub, category, and service pages.
* **Indexable**: use SEO-friendly page structures with meaningful metadata.

---

## 2) Routes & Pages

* **Portfolio Hub:** `/portfolio`

  * Directory of all categories (Video, Web, SEO, Content, Marketing, Lead Gen, etc.).
  * Each category shows its **top 3 highlights** with **modal preview** and a **“View all”** button to the category page.
  * Includes **global search/filter** for all portfolio items.
  * Includes the **narrow GrowthPackagesCTA** (banner strip) near the end.
  * Ends with **CTASection** → “Contact Us”.

* **Portfolio Category:** `/portfolio/[category]`

  * Category-specific gallery with **modal previews**.
  * A **Tools block** for service-relevant tools (e.g., Audit Teaser, ICP, Playbook).
  * A **Case Studies strip** (3 items).
  * A **GrowthPackagesSection** (new) with **three package cards** tailored to the category and a bottom “View all packages” CTA.
  * Ends with **CTASection** → “Contact Us”.

> Note: The **narrow GrowthPackagesCTA** (banner) is used on the **hub** page, not on the category pages. Category pages use the **new three-card GrowthPackagesSection** instead.

---

## 3) Page Outlines (Structure & Behavior)

### 3.1 `/portfolio` — Hub (All Categories)

1. **Header / Hero (light)**

   * Title: “Our Work”
   * Subtitle: short value prop.
   * Optional small logo strip if desired.

2. **Global Search + Filters**

   * Search input filters items by title/tags.
   * Filter chips by category (Video, Web, SEO, Content, Marketing, Lead Gen, etc.).

3. **Per-Category Highlights (Top 3 + Modal)**

   * For each category, render a section with:

     * Section header: Category title + short blurb.
     * **Grid of 3 highlights** (clickable cards, open modal).
     * **“View all” button** → `/portfolio/[category]`.
   * **Modal behavior:** click a card to open a modal/lightbox:

     * Keyboard accessible (Esc to close, arrow keys if paging).
     * Supports image, video, or interactive demo per category.

4. **GrowthPackagesCTA (narrow banner)**

   * Short two-column strip; button → `/packages`.

5. **Final CTA**

   * **CTASection** with “Contact Us” (primary action).

---

### 3.2 `/portfolio/[category]` — Category Page

1. **Header / Hero (category-specific)**

   * Category title (“Video Production Portfolio”, “Web Development Portfolio”, etc.).
   * Brief description (what success looks like for this service).

2. **Category Search & Filters**

   * Search input scoped to this category’s items.
   * Optional tag filters (e.g., “ecommerce”, “B2B”, “local”).

3. **Highlights Grid (All Items for the Category)**

   * Gallery or card grid for all items.
   * **Modal previews** on click (images, videos, interactive demo depending on the service).

4. **Tools Section (service-relevant)**

   * Purpose: show related tools prospects can use **before** buying.
   * Recommended components:

     * **AuditTeaser** (SEO/Marketing/Web).
     * **ICPDefinitionBlock** (Content/Lead Gen/Marketing).
     * **PlaybookShowcase** (Content/Marketing/SEO).
   * 2–3 tools max; can vary per category.

5. **Case Studies (3)**

   * Three case study cards (logo, result metric, short blurb).
   * Optional modal or link to case study detail page.

6. **GrowthPackagesSection (Category-Aware New Section)**

   * **Three cards** tailored to this category (e.g., for SEO category: Digital Transformation, E-Commerce Accelerator, Thought Leadership—depending on your mapping).
   * Each card shows:

     * Title + short tagline
     * **One-time setup** and **Monthly retainer**
     * 4–6 key inclusions
     * **Primary “Get Package” button** (uses Button component)
     * Optional “View details” small link
   * At the bottom: **“View all packages”** button → `/packages`.

7. **Final CTA**

   * **CTASection** with “Contact Us”.

---

## 4) Highlight Components by Service (Used in Hub + Category Pages)

We choose the most appropriate, already-available component for each category’s highlight behavior. All highlights must be **clickable** to open a **modal** (image, video, or interactive demo).

* **Web Development**

  * Component: **PortfolioDemo** (already in repo)
  * Behavior: opens a **static HTML interactive demo** inside a modal (users can click around).
  * Use: Top 3 on Hub; full gallery on Category.

* **Video Production**

  * Component: **VideoPortfolioGallery** (already in repo)
  * Behavior: opens video **lightbox** with inline playback.
  * Use: Top 3 on Hub; full gallery on Category.

* **Content Production**

  * Component: **EditorialSamplesGrid** (already in repo)
  * Behavior: cards show thumbnails (PDF covers, long-form blog headers, social carousels), **modal** shows zoomed image/PDF viewer or excerpt preview.
  * Use: Top 3 on Hub; full gallery on Category.

* **SEO Services**

  * Components combo: **ResultsStatsStrip** (proof metrics) + image/graph cards (before/after, audit screenshots).
  * Behavior: **Modal** shows enlarged charts or annotated screenshots; **ResultsInfo** card can be used for metric callouts.
  * Use: Top 3 on Hub (mix of stat proof and screenshots); full set on Category.

* **Marketing**

  * Components combo: Generic **PortfolioGallery** image cards (ad creative, landing hero), **ResultsInfo** for CTR/CPA improvements.
  * Behavior: **Modal** image zoom + caption; optionally include short “campaign breakdown” copy.
  * Use: Top 3 on Hub; full set on Category.

* **Lead Generation**

  * Components combo: Generic **PortfolioGallery** image cards (ad sets, sequences), **ResultsStatsStrip** for pipeline metrics.
  * Behavior: **Modal** with image zoom and “flow diagram” if available.
  * Use: Top 3 on Hub; full set on Category.

> All highlight grids should use the same **modal mechanics** for consistency: focus trap, escape to close, and arrow-key nav where applicable.

---

## 5) Packages Integration

* **Hub page:** use the **narrow GrowthPackagesCTA** (title/subtitle + one button → `/packages`).
* **Category pages:** use the **new GrowthPackagesSection** (three package **cards** + bottom “View all packages” button).

**New module:** `GrowthPackagesSection` (section wrapper) + `GrowthPackageCard` (card component).

* Each card: title/tagline, setup price, monthly price, 4–6 inclusions, **Button** (“Get Package”) → package detail/checkout.
* Section bottom CTA: “View all packages” → `/packages`.
* Data comes from a **recommendations mapping** by category (see Data Model below).

---

## 6) Data Model (Plain Language)

* **Portfolio categories** (slugs): `video-production`, `web-development`, `seo-services`, `content-production`, `marketing-automation`, `lead-generation`.

* **Portfolio items** live in a central index with category tags.

  * Each item includes: `id`, `title`, `category`, `type` (`video` | `image` | `interactive`), `media` (video src, image src, or demo URL/folder), `thumb`, `tags`, `description`, `result` (optional metric).
  * Items may include `ctaLink` if we want to link out to live sites or longer writeups.

* **Top 3 highlights per category** for the Hub:

  * Pulled from the same index (marked with a `featured: true`, or sorted by `priority`).
  * Hub page renders the first three **per category**.

* **Packages recommendations per category**:

  * A small map of `category → [packageId, packageId, packageId]`.
  * A helper returns three bundles for the current category.
  * Falls back to any bundles that include the category in their `categoryTags`.

* **Case studies (3 per category)**:

  * Best stored in a small collection (id, title, logo, result metric, summary, link).
  * Category page pulls three relevant ones.

* **Tools per category**:

  * A mapping from category → tools list (from available components: AuditTeaser, ICPDefinitionBlock, PlaybookShowcase).
  * Each tool config: `componentId`, `title`, `tagline`, `cta` (optional), and any props needed.

---

## 7) Search & Filters

* **Hub page** search:

  * Searches **all** portfolio items across categories.
  * Simple client-side filter (title/tags).

* **Category page** search:

  * Searches **only** items in the current category.

* **Filter chips**:

  * Hub: category chips + optional tags.
  * Category: tag chips (e.g., ecommerce, B2B, local, SaaS).

---

## 8) SEO & Metadata

* Each page exports metadata:

  * **Hub**: `title = "Portfolio | Company Name"`, relevant description, canonical `/portfolio`.
  * **Category**: `title = "Service Name Portfolio | Company Name"`, category-specific description, canonical `/portfolio/[category]`.
* Structured content:

  * Include project names and short blurbs in accessible, crawlable text (not only in modals).

---

## 9) Accessibility

* All clickable cards must be **keyboard focusable**.
* Modals must use:

  * **Focus trap**, return focus on close.
  * Close on **Esc**.
  * Announce role (`dialog`) + label (project title).
* Images need **alt** text; videos should indicate **mute/controls** and provide captions if available.

---

## 10) Performance

* Use **poster images** and **lazy loading** for media thumbnails.
* Load **video players and interactive demos on demand** (open modal → load).
* Use responsive images (srcset) for thumbnails and zoomed images.

---

## 11) Analytics (recommended)

* Track:

  * **Card click** (category, item id).
  * **Modal open** (type: video/image/interactive).
  * **Get Package** (category, package id).
  * **View all packages** and **View all (category)** button clicks.
  * **Final CTA** (“Contact Us”) clicks.

---

## 12) Error & Empty States

* If a category has fewer than 3 highlights on the Hub, display available items and keep layout consistent.
* If a category page has no items, show:

  * A friendly message, a tool block, 3 case studies (generic), and the packages section.
* If media fails to load in modal, show fallback image or a retry message.

---

## 13) Content Guidelines

* **Media caps**:

  * Thumbnails ≤ 300–600 KB.
  * Videos: short, compressed, web-optimized formats.
* **Copy hygiene**:

  * One-line title (≤ 70 chars).
  * Short blurb (≤ 140 chars).
  * Results metric concise and defensible.

---

## 14) QA Checklist

* Hub: each category shows **exactly 3** featured items (or fewer if not available), all clickable, all modal previews work.
* Category: search filters items, tools show correctly, 3 case studies present, packages section shows **3** category-recommended cards.
* Buttons route correctly:

  * “View all” (Hub) → category page
  * “Get Package” → package detail/checkout
  * “View all packages” → `/packages`
  * Final **Contact Us** CTA works on both pages.
* A11y: tab order sane, modal trapping, escape closes, alt text present.
* Mobile & desktop layouts look intentional (1-col vs 3-col).

---

## 15) Component Reference (what to use where)

**Shared / Layout**

* FullWidthSection, Container, Divider, Breadcrumbs (if used)
* CTASection (“Contact Us” final section)

**Hub Page**

* Search + filter UI (shared small UI)
* **Per-Category Highlights** (with modal):

  * **Web** → PortfolioDemo (interactive static HTML modal)
  * **Video** → VideoPortfolioGallery (video lightbox)
  * **Content** → EditorialSamplesGrid (image/PDF previews)
  * **SEO** → Mix of ResultsStatsStrip + image/graph cards (modal zoom)
  * **Marketing** → PortfolioGallery image cards + ResultsInfo
  * **Lead Gen** → PortfolioGallery image cards + ResultsStatsStrip
* **GrowthPackagesCTA** (narrow banner)
* **CTASection** (“Contact Us”)

**Category Page**

* Search + tag filters (scoped)
* **Highlights Gallery** (category-appropriate component with modal)
* **Tools Block**:

  * AuditTeaser, ICPDefinitionBlock, PlaybookShowcase (pick 2–3)
* **Case Studies (3)**
* **GrowthPackagesSection** (new, 3 package cards + “View all packages”)
* **CTASection** (“Contact Us”)

**New Packages Module (category pages only)**

* GrowthPackagesSection (wrapper)
* GrowthPackageCard (card)
* Uses Button component for primary action.

---

## 16) Data Wiring Summary

* **Portfolio items:** central index with category tags and media types.
* **Hub “top 3” per category:** items marked `featured: true` or the top 3 by priority.
* **Category tools map:** category → tools list with props.
* **Case studies:** small list per category (3).
* **Packages recommendations:** category → 3 package IDs; helper resolves bundles from central packages index.
* **Search & filters:** simple client-side filter across `title`, `tags`, `category`.

---

## 17) Final CTAs (both pages)

* Always end with **CTASection**:

  * Title: “Contact Us”
  * Primary CTA: “Get in touch” → `/contact` (or `/book`, depending on your funnel)
  * Keep consistent styling with the rest of the site.

---

This is the complete, production-ready plan for implementing the **Portfolio Hub** and **Portfolio Category** experiences, with **modal highlights**, **tools**, **case studies**, **category-aware packages**, and a **clear path to contact**.
