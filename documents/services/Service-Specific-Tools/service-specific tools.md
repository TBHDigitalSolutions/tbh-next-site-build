Awesome—here’s a clean, ready-to-build list of **service-specific tools** for your six portfolio categories. Each item is named, briefly explained, and easy to map to a route like `/tools/<service>/<tool-slug>` and a data entry under `/src/data/portfolio/tools/<service>.tools.ts`.

# Tools by Service

## /content-production

* **Content Brief Generator** — turns a topic + keywords into a structured brief (audience, angle, CTAs).
* **Headline & Hook Analyzer** — scores hook strength and suggests alternatives.
* **Readability & Tone Checker** — flags passive voice, grade level, jargon.
* **Topic Cluster Planner** — builds pillar/cluster maps from seed terms.
* **Keyword → Outline Mapper** — creates H2/H3 outlines from target terms.
* **Editorial Calendar Builder** — quick calendar export with owners/status.
* **CTA Matcher** — recommends CTAs by funnel stage & content type.
* **Rights & Releases Checklist** — tracks model/property releases and asset licenses.

## /lead-generation

* **Lead Magnet Picker** — recommends the best magnet format by ICP & goal.
* **Landing Page CRO Audit** — checks headline clarity, offer, friction, trust.
* **A/B Test Significance Calculator** — estimates sample size or reads results.
* **Funnel Leak Finder** — highlights drop-offs from ad → LP → form → email.
* **Form Health Tester** — validation, error states, autofill, mobile UX.
* **UTM Builder** *(shared)* — consistent campaign tagging with presets.
* **CAC/LTV Calculator** — projects payback by channel.
* **Retargeting Audience Builder** — suggests audiences based on site behaviors.

## /marketing

* **Campaign Brief Builder** — objectives, audience, channels, KPIs in one doc.
* **Customer Journey Mapper** — visualizes stages, messages, and assets.
* **Email Sequence Planner** — drafts nurture/drip timing and themes.
* **Deliverability Preflight** — checks DKIM/SPF/DMARC + spam triggers.
* **Segmentation Rule Builder** — boolean rules for traits & behaviors.
* **Lead Scoring Simulator** — tweak weights; see MQL threshold impact.
* **Budget Allocator** — channel mix vs. target CAC/ROAS.
* **Marketing Calendar** — cross-channel timeline export.

## /seo-services

* **Technical SEO Audit** — crawlability, indexation, 404/500, canonicals.
* **Core Web Vitals Checker** — LCP/CLS/INP snapshots with fixes.
* **SERP Snippet Preview** — pixel-accurate title/meta preview.
* **Schema Markup Builder** — JSON-LD for org, product, article, FAQ.
* **Sitemap & Robots Tester** — parses, validates, and spot-checks coverage.
* **Redirect/Canonical Checker** — follows chains; flags conflicts.
* **Internal Linking Suggester** — recommends anchors from existing content.
* **Local SEO NAP Auditor** — compares name/address/phone across citations.

## /video-production

* **Script Length Estimator** — words → runtime for VO & talking head.
* **Shot List Generator** — scene → angles → coverage checklist.
* **Storyboard Builder** *(template)* — printable frames + notes.
* **Aspect Ratio & Safe Area Preview** — 9:16, 1:1, 16:9 framing helper.
* **Budget Estimator** — crew, gear, days, post-hours roll-up.
* **Location & Permit Checklist** — permits, releases, insurance.
* **Color Profile/LUT Previewer** — apply sample LUTs to stills.
* **Music Licensing Checklist** — rights, duration, territory, platform.

## /web-development

* **Performance Budget Calculator** — defines KB/TTI budgets per page type.
* **Lighthouse Snapshot** — one-click run & diff (on-site wrapper).
* **Accessibility Quick Audit** — WCAG focus order, contrast, labels.
* **Responsive Breakpoint Tester** — presets for common device widths.
* **Security Headers Checker** — CSP/HSTS/X-Frame/X-Content audit.
* **Open Graph/Twitter Card Preview** — link previews for key pages.
* **Redirects & 404 Auditor** — map & validate Next.js rewrites/redirects.
* **Form Submission Tester** — webhook sandbox + spam honeypot checks.

---

## Where each tool lives (convention)

* **Routes:** `/tools/<service>/<tool-slug>`
  e.g., `/tools/seo-services/serp-snippet-preview`
* **Data files:** `/src/data/portfolio/tools/<service>.tools.ts`
  Each entry follows:

  ```ts
  export const SEO_TOOLS = [
    { id: 'serp-snippet-preview', title: 'SERP Snippet Preview', href: '/tools/seo-services/serp-snippet-preview', badge: 'Free' },
    // ...
  ];
  ```

## Shared tools you can surface in multiple services

* **UTM Builder** (lead-gen, marketing)
* **A/B Significance Calculator** (lead-gen, marketing)
* **Open Graph/Twitter Preview** (web-dev, content, SEO)
* **Core Web Vitals Checker** (web-dev, SEO)

If you want, I can generate the **six tools data files** with the correct TypeScript shape and stub routes for each tool so you can paste them straight in.
