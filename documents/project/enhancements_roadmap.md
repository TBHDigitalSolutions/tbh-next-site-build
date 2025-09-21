Official Title: Project Enhancements Roadmap
Domain: Web Development, Project Architecture, Operations
File Name: project-enhancements_roadmap_2025-09-13.md
Main Part: project-enhancements
Qualifier: Roadmap
Date: 2025-09-13
Spotlight Comments:

Outlines prioritized upgrades for content ops, analytics, SEO, and performance.
Includes concrete scripts and tools to enhance automation and developer experience.
Cross-references project-overview_guide_2025-09-13.md and portfolio-domain_implementation-guide_2025-09-12.md.

Summary: The Project Enhancements Roadmap provides a prioritized plan for improving TBH Digital Solutions' marketing website, focusing on automation, analytics, SEO, performance, and developer experience. It proposes actionable steps like nightly CI jobs, a privacy-first analytics adapter, JSON-LD for SEO, Playwright for link checking, and consent management, with code snippets and package.json updates to integrate seamlessly with the existing Next.js App Router architecture and single-source-of-truth data model.

---

Absolutely—here’s a crisp, practical roadmap of upgrades that fit your codebase and workflow. It’s grouped so you can pick things off as you go, with concrete tech choices and “how” hints.

---

# High-leverage enhancements (now → later)

## 1) Content ops & automation

* **Nightly data health job (CI cron):**

  * Run: `verify:public`, `data:ci`, and `portfolio:deep-analysis`.
  * Output JSON artifacts as build artifacts for quick review.
* **Auto-label PRs by domain:** GitHub Action that looks at paths (`/src/data/portfolio/**`, `/src/data/packages/**`) and adds labels like `domain:portfolio`.
* **Docs shadow generator:**

  * Script that creates `/docs/<mirror-of-src>` placeholders if a new directory appears (keeps docs coverage high).
* **Pre-commit hook (Husky):**

  * Run `data:quick-check` + `format` + `lint` before commits.

## 2) Analytics & event strategy (privacy-first)

* **Server-side analytics baseline:** Plausible or Umami (simple, cookie-light). Add a tiny analytics adapter in `src/lib/analytics.ts`.
* **Consent Mode (if using GA4/GTAG):**

  * Add a CMP (Cookiebot, CookieYes, Osano; or open-source `cookieconsent`) and wire **Consent Mode v2**.
  * Gate any marketing pixels behind consent. Keep a single `getConsent()` helper.
* **Event taxonomy:**

  * Define event names + props once (e.g., `PortfolioViewed`, `CTA_Click`, `{ hub, service, sub, source }`) in `src/types/analytics.types.ts`.
  * Wrap all tracking calls in `track(event, payload)` so you can swap providers later.

## 3) Admin & editorial UX (lightweight, repo-native)

* **/admin (dev-only, gated):**

  * NextAuth (GitHub provider) or simple Basic Auth on Vercel env.
  * Show read-only dashboards: portfolio coverage per hub, broken refs, recent failures from scripts.
* **Git-based CMS (optional):**

  * Decap/Netlify CMS for editing JSON/MD files → opens PRs automatically.
  * Good if non-developers will touch content.

## 4) SEO hardening & growth

* **Structured data (JSON-LD):**
  Add per-page JSON-LD builders in `src/lib/seo/jsonld.ts`:

  * `Organization`, `BreadcrumbList`, `ItemList` (hub listings), `Service` (L2/L3), and `CreativeWork` (portfolio items).
* **Metadata helpers:**
  `src/lib/seo/meta.ts` to centralize title templates, canonical, OpenGraph, and twitter cards.
* **XML sitemaps & robots:**

  * Use `app/sitemap.ts` (App Router) to emit service + portfolio routes.
  * Add `app/robots.ts` with clean crawl rules; include your asset subpaths under `/public`.
* **Hreflang (if i18n later):** scaffolding in the same meta helper.

## 5) Performance & media ops

* **Image pipeline:**

  * Standardize through `next/image` + a `getSrcSet()` helper.
  * Add `scripts/media/` to check oversize images and suggest sizes.
* **RUM performance beacons:**

  * Send Core Web Vitals to analytics (CLS, LCP, INP) via `web-vitals` package.
* **Edge caching & headers:**

  * `Cache-Control` headers for static assets, `stale-while-revalidate` where safe.
  * Consider Vercel Edge for `/services/**` if data is fully static.

## 6) Quality: testing & accessibility

* **E2E + Link checker:** Playwright

  * Crawl generated routes from `generateStaticParams` and ensure 200/308.
* **Unit tests (Vitest):**

  * `src/lib/services/*` (URL builders, taxonomy selectors), `pricingAdapters`.
* **Accessibility checks:**

  * `@axe-core/playwright` in CI on key templates.
  * Lint rule: `jsx-a11y` (included in Next ESLint config; turn on strict mode).

## 7) Security & compliance

* **CSP & headers:**

  * Strict CSP with nonces for inline scripts (or avoid inline entirely).
  * Add `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
* **Data integrity checks:**

  * Sign `servicesTree.ts` output (hash) and verify in middleware to detect accidental drift (optional, advanced).

## 8) Personalization & experimentation (optional, safe)

* **Feature flags:**
  Vercel Flags or Unleash for toggling new layouts or modules.
* **A/B testing (lights):**
  Split by header or cookie; track in your analytics adapter. Keep variants server-rendered for SEO.

## 9) Observability & error tracking

* **Sentry (client + server):**

  * Wrap `app/layout.tsx` with Sentry error boundary.
  * Capture script failures in CI and send to Sentry via a small Node SDK call.
* **Uptime & 404 monitor:**
  Scheduled script that hits a selection of routes and alerts on regressions.

## 10) Developer experience

* **Graph of routes & data:**
  A CLI (`scripts/inspect/routes.ts`) that prints a tree of all `services` paths and the data files they touch (helps onboarding).
* **Generated types from data:**
  If some JSON is hand-authored, add codegen to emit tight TypeScript unions (e.g., slugs) consumed by pages + scripts.

---

# Concrete “next steps” (you can do these this week)

1. **Add analytics adapter & event taxonomy**

```ts
// src/lib/analytics.ts
export type EventName = 'PortfolioViewed' | 'ServiceViewed' | 'CTA_Click';
export function track(name: EventName, props: Record<string, unknown> = {}) {
  // no-ops in dev; swap provider here (Plausible/GTAG)
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(name, { props });
  }
}
```

Use in components: `track('CTA_Click', { hub, service, location: 'hero' })`.

2. **Add JSON-LD builders**

```ts
// src/lib/seo/jsonld.ts
export const serviceJsonLd = ({ name, url, description }: {name:string;url:string;description?:string}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name, url, description,
});
```

Render in server component `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceJsonLd(...))}} />`.

3. **Playwright smoke & link check**

* Install: `npm i -D @playwright/test`
* Write one spec that:

  * Loads sitemap, iterates first 100 routes, expects `200|308`.
  * Scans `<a>` tags on service hubs and hits each (head requests).

4. **Nightly GitHub Action**

* Cron: `0 3 * * *` → run `verify:public`, `data:ci`, upload JSON outputs (health, stats).

5. **CMP + Consent Mode (if GA4)**

* Add CMP (or open-source `cookieconsent`).
* Wrap GTAG init in Consent Mode; block marketing tags without consent.

---

# “Nice later” (bigger bets)

* **Admin dashboards** with live stats (from CLIs’ JSON output) under `/admin` (auth’d).
* **Search** across services + portfolio (you already use MiniSearch → ship a /search route).
* **Internationalization** (if needed): route groups (`/(en)/(es)/…`), hreflang, and content keys.
* **Content calendar** generated from gaps in `portfolio-stats` (e.g., “Web Dev > Observability has 0 items → suggest a case study”).

---

## Additions to `package.json` (scripts you might wire next)

```json
{
  "scripts": {
    "an:build-vitals": "node scripts/analytics/emit-vitals-schema.js",
    "test:e2e": "playwright test",
    "test:links": "node scripts/qa/check-links.ts",
    "check:seo": "node scripts/seo/validate-jsonld.ts",
    "precommit": "npm run data:quick-check && npm run format && npm run lint"
  }
}
```

*(You can keep it lean—add only what you’ll use in the next 2–4 weeks.)*

---

## Quick priorities (TL;DR)

1. **Add analytics adapter + event taxonomy** (small, high value).
2. **Playwright smoke & link checker** (saves you from broken routes).
3. **Nightly CI cron** for `verify:public` + `data:ci` (keeps drift at zero).
4. **JSON-LD + metadata helpers** (SEO compounding gains).
5. **CMP/Consent Mode** if you run any marketing pixels.

These build on your current strengths (typed data, robust scripts, clean routing) and keep everything **automated, observable, and safe** as you add content and features.
