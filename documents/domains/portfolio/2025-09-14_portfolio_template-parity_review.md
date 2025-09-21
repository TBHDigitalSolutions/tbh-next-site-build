Portfolio Template Parity Review
Official Title: Portfolio Hub and Category Template Parity Review
Domain: Portfolio
File Name: portfolio-template-parity_ParityReview_2025-09-14.md
Main Part: portfolio-template-parity
Qualifier: ParityReview
Date: 2025-09-14

Spotlight Comments:
Evaluates the structural and visual alignment of portfolio Hub and Category templates with existing app pages.
Provides actionable tweaks and a checklist to ensure layout parity and behavioral consistency.
Cross-references data adapters and template props for precise configuration.

Summary:
The Portfolio Hub and Category Template Parity Review assesses the alignment of the portfolio domain’s Hub and Category templates with the existing application’s page layouts, ensuring a seamless refactor. It confirms that both templates replicate the app’s layout bands (Hero, Search, Overview/Intro, Sections, CTA for Hub; Hero, Search, Header, Metrics, Items, optional blocks for Category) and provides configuration options (e.g., meta, features, layout flags) to achieve pixel-level sameness without structural changes. The document includes a smoke-test checklist to verify visual and functional parity, covering hero content, search behavior, analytics, and empty states.
This review serves as a quality assurance tool for developers, offering clear guidance on maintaining consistency with the app’s user experience during the transition to a template-based architecture. It emphasizes the use of data façade adapters (adaptSectionsForHub, adaptCategoryPageData) and contract checks to ensure templates render identically to the original pages, with optional tweaks for copy, filters, or CTAs if needed.

---

Absolutely—here’s a tight “does it match the App pages?” review of your current **production templates** plus any micro-tweaks needed so the refactor lands with the **same visible layout** (Hero → Search → Overview/Intro → Sections with “View All” → CTA) and **the same category flow** (Hero → Search → Header → Metrics → Items → optional blocks).

---

# 1) Portfolio **Hub** Template → App layout parity

## What the template renders (in order)

1. **Hero** (title, subtitle, primary CTA)
2. **Search** (types: portfolio/package/case-study; with filters & service filter)
3. **Overview/Intro** (drives context before the sections)
4. **Sections list** (each with heading, subtitle/count, “View All →”, and the correct variant routed to `PortfolioSection`)
5. **CTA block** (packages CTA)

This is exactly the common “Hub” page composition your app used. The current template already follows this sequence and supplies matching props for headings, subtitles, search banner copy, section labels, and the closing CTA.&#x20;

### Minor knobs you can use to mirror current page behavior 1:1

* **Copy/strings**: `meta.title`, `meta.subtitle`, `meta.heroButton`
* **Toggle blocks** (to remove or show a band your current page didn’t include): `features.showSearch`, `features.showOverview`, `features.showCTA`
* **Analytics parity**: `analytics.context` + `trackSectionViews` (template passes to `PortfolioSection`)

> If your current app page didn’t include the overview band, set `features={{ showOverview: false }}` and the structure still lines up visually.

**Verdict:** Hub Template is layout-compatible with the app. (No structural changes required.)&#x20;

---

# 2) Portfolio **Category** Template → App layout parity

## What the template renders (in order)

1. **Hero** (category title + “Start Your Project”)
2. **Search** (scoped to the category via `presetFilters`)
3. **Header** (H1 + subtitle)
4. **Metrics** (optional grid of KPIs)
5. **Items** (via `PortfolioSection`, using the category’s default viewer variant)
6. **Optional blocks**: Tools / Case Studies / Packages

This mirrors the app’s Category page structure—your current client page had the same “hero → search → heading → items (+ supporting blocks)” rhythm. The template already scopes search to the category and supports an empty state that matches the page’s “coming soon” messaging.&#x20;

### Knobs to match existing page behavior

* **Metrics on/off**: simply omit or provide `data.metrics`.
* **Supporting blocks**: drive visibility with `layout.showTools|showCaseStudies|showPackages`.
* **Analytics parity**: `analytics.context` + `trackItemViews` (forwarded to `PortfolioSection`).

**Verdict:** Category Template is layout-compatible with the app. (No structural changes required.)&#x20;

---

# 3) Tiny, optional tweaks if you want pixel-level sameness

These are *optional* and only needed if your current app pages have slightly different copy or filters.

### Hub Search copy/filters

In `PortfolioHubTemplate`, the Search Banner currently uses:

* `types=["portfolio","package","case-study"]`
* `showFilters`, `showTypeFilter`, `showServiceFilter`, `limit={6}`
* Title/subtitle/placeholder text matching an “Explore Our Work” pattern

If your page used different copy or a smaller result limit, pass those through your Search component props in-place (no template change needed).&#x20;

### Category Search scoping

In `PortfolioCategoryTemplate`, search is already pre-filtered with:

* `presetFilters={{ portfolio_category: category }}`
* Title/subtitle derived from the category title (keep or customize if your app showed different strings).&#x20;

### Section subtitles/count

Hub sections show a default subtitle of “N featured projects” when one isn’t supplied; if your app showed a different default (e.g., “N projects”), pass `subtitle` per section when you adapt the data.&#x20;

### CTA band on Category

If your category pages ended with a CTA in the app, you can add a small CTA section to the Category template (mirroring the Hub CTA). Right now the Category template intentionally ends after optional blocks; most teams prefer the CTA on Hub only.&#x20;

---

# 4) Contract checks to keep pages ⇄ templates in sync

Use these quick “contract assertions” at the page boundary so the templates render exactly like your app:

## Hub page → `PortfolioHubTemplate`

* Build `sections: HubSection[]` via your data façade and **normalize** with `adaptSectionsForHub(...)` so each section has:

  * `slug`, `label`, **`variant`** (`"gallery" | "video" | "interactive"`), `viewAllHref`, `items[]`, optional `subtitle`, `priority`
* Provide `meta`, `features`, `analytics` to toggle the exact bands your page showed (e.g., hide Overview if the app didn’t have it).&#x20;

## Category page → `PortfolioCategoryTemplate`

* Build `data: CategoryPageData` with your façade and **normalize** via `adaptCategoryPageData(...)`:

  * `items[]` (the list that `PortfolioSection` renders)
  * Optional `tools[]`, `caseStudies[]`, `recommendedPackages[]`, `metrics`
* Send `layout` flags only for blocks your page showed; keep them off to match a lean layout.&#x20;

> Since both templates hand off to **`PortfolioSection`** for the actual items, the **viewer selection** (standard gallery vs video vs interactive demo) remains identical to your app’s behavior—as long as the `variant` is set correctly in the sections/category config.

---

# 5) “Same layout” smoke-test checklist (copy/paste)

* **Hero**

  * Hub: `meta.title|subtitle|heroButton` produce the same hero as page. &#x20;
  * Category: hero title `${title} Portfolio` + subtitle match the page. &#x20;
* **Search**

  * Hub: types + filters + copy match your current Search banner. &#x20;
  * Category: `presetFilters` includes the category; copy aligned. &#x20;
* **Overview/Intro** (Hub only)

  * Toggle off if your app didn’t include it (`features.showOverview=false`). &#x20;
* **Sections**

  * Order mirrors page (use `priority`).
  * “View All →” links match previous routing. &#x20;
* **CTA**

  * Hub includes CTA band (toggle with `features.showCTA`). &#x20;
  * Category: add one only if your page had it (optional).
* **Analytics**

  * Hub per-section context: `${context}_${slug}` (same grouping as page). &#x20;
  * Category per-item impressions toggled with `trackItemViews`. &#x20;
* **Empty states**

  * Hub + Category have resilient, styled empty states consistent with your app’s tone.

---

## Bottom line

* Your **Hub** and **Category** templates already reproduce the app pages’ **layout bands and behavior**.
* Use the small flags (features/layout), meta copy, and the adapters that build section/category props to achieve **pixel-level sameness** without keeping orchestration logic in the app layer.
