awesome — here’s your **official “Landing Pages” playbook** for this repo. it shows where landing pages live, how they route through the App Router, how data is authored/loaded, SEO rules, UTMs, and an end-to-end example you can copy-paste.

---

# landing pages: goals & boundaries

**Goal:** ship many focused campaign pages quickly, without touching core services taxonomy.
**Shape:** data-authored pages rendered by a small, reusable Landing template.
**Where:** `/app/lp/[slug]` (flat, campaign-agnostic), with all composition/data in `src/data/page/landing/**`.

**/app must not** contain raw catalogs or composition logic. It only:

* reads `params.slug`
* imports a ready `LandingPageData` from `src/data/page/landing/<slug>/index.ts`
* renders `<LandingTemplate />`
* emits metadata from the page data

---

# directory layout (recommended)

```
/app
  /lp
    /[slug]
      page.tsx                 // thin controller
    layout.tsx                 // optional LP-specific shell (no sitewide nav)
  ...
/src
  /data
    /page
      /landing
        /_shared               // optional shared assets across LPs
          faqs.json
          testimonials.json
        /<slug-a>
          index.ts             // exports LandingPageData
          hero.json            // optional granular partials
          sections.ts          // optional sections config
        /<slug-b>
          index.ts
  /templates
    /LandingPage
      LandingTemplate.tsx      // dumb UI, typed props
      LandingTemplate.module.css
  /lib
    /landing
      urls.ts                  // lpToCanonicalUrl(), build helpers
      taxonomy.ts              // resolveLanding(slug) if you keep a registry
```

**Why `/lp`?** Short, memorable, and avoids clashing with `/services/*`. If you prefer `/campaigns/*`, it’s the same pattern.

---

# routing rules

* **Canonical route:** `/lp/[slug]` (e.g. `/lp/black-friday`, `/lp/saas-seo-audit`).
* **No changes to services taxonomy.** LPs are independent of `/services/[hub]/[service]`.
* **Aliases/vanity URLs:** add to middleware **only if** you need `/offer/*` or legacy slugs.
* **Trailing query params:** UTMs & refs are preserved by default (no redirects that drop query strings).

---

# data model

Create a simple, stable type (you can extend your existing service template shapes):

```ts
// src/types/landing.types.ts
export type LandingHero = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  media?: { poster?: string; video?: string | null; image?: string | null };
  ctas?: Array<{ label: string; href: string; variant?: "primary"|"secondary" }>;
};

export type LandingSection =
  | { kind: "features"; title: string; items: Array<{ icon?: string; title: string; copy: string }> }
  | { kind: "testimonials"; title?: string; items: Array<{ quote: string; author: string; role?: string }> }
  | { kind: "packages"; title?: string; items: Array<{ name: string; price?: string; bullets: string[] }> }
  | { kind: "faq"; items: Array<{ q: string; a: string }> }
  | { kind: "custom"; component: string; props?: Record<string, unknown> };

export type LandingSEO = {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: { index?: boolean; follow?: boolean }; // default: noindex,follow for paid LPs
  og?: Record<string, unknown>;
};

export type LandingPageData = {
  slug: string;
  hero: LandingHero;
  sections: LandingSection[];
  seo?: LandingSEO;
  theme?: "light" | "dark";
};
```

**Authoring location:**
`src/data/page/landing/<slug>/index.ts` returns a strict `LandingPageData`. Use `/_shared/*.json` for common blocks (faqs/testimonials), or reach into selectors if you want to surface portfolio or packages.

Example:

```ts
// src/data/page/landing/saas-seo-audit/index.ts
import type { LandingPageData } from "@/types/landing.types";
import sharedFaqs from "../_shared/faqs.json";
import { selectPackages, selectTestimonials } from "@/data/selectors";

const testimonials = selectTestimonials({ hub: "seo-services", featured: true, limit: 3 });
const packages = selectPackages({ hub: "seo-services", service: "analytics-optimization", featured: true });

const data: LandingPageData = {
  slug: "saas-seo-audit",
  hero: {
    eyebrow: "Limited Offer",
    title: "SaaS SEO Audit: Find Growth Levers in 14 Days",
    subtitle: "Technical, content, and growth opportunities — delivered as an actionable plan.",
    ctas: [
      { label: "Get the Audit", href: "/book?plan=seo-audit", variant: "primary" },
      { label: "See What’s Included", href: "#packages" }
    ],
    media: { image: "/images/lp/seo-audit-hero.png" }
  },
  sections: [
    { kind: "features", title: "What you get", items: [
      { title: "Technical gap analysis", copy: "Crawlability, indexing, Core Web Vitals." },
      { title: "Content map", copy: "Opportunity clusters prioritized by ROI." },
      { title: "Action plan", copy: "90-day backlog with sprint sizing." },
    ]},
    { kind: "testimonials", items: testimonials },
    { kind: "packages", title: "Pick your audit scope", items: packages },
    { kind: "faq", items: sharedFaqs }
  ],
  seo: {
    title: "SaaS SEO Audit | TBH Digital",
    description: "Pinpoint technical and content wins in 14 days.",
    // LPs often use noindex (ads) — flip to index if this is evergreen.
    robots: { index: false, follow: true }
  },
  theme: "light",
};

export default data;
```

---

# the landing template

Keep it dumb and typed. It renders blocks based on `sections[].kind`.

```tsx
// src/templates/LandingPage/LandingTemplate.tsx
"use client";
import styles from "./LandingTemplate.module.css";
import type { LandingPageData } from "@/types/landing.types";
import FAQAccordion from "@/components/sections/FAQAccordion/FAQAccordion";
import Testimonials from "@/components/sections/Testimonials/Testimonials";
import PackageCarousel from "@/components/sections/PackageCarousel/PackageCarousel";

export default function LandingTemplate(props: LandingPageData) {
  const { hero, sections, theme } = props;

  return (
    <main data-theme={theme ?? "light"}>
      <section className={styles.hero}>
        <h1>{hero.title}</h1>
        {hero.subtitle && <p>{hero.subtitle}</p>}
        <div className={styles.ctas}>
          {hero.ctas?.map((c) => (
            <a key={c.label} href={c.href} className={c.variant === "secondary" ? styles.ctaSecondary : styles.ctaPrimary}>
              {c.label}
            </a>
          ))}
        </div>
      </section>

      {sections.map((s, i) => {
        switch (s.kind) {
          case "features":
            return (
              <section key={i} className={styles.features}>
                {s.title && <h2>{s.title}</h2>}
                <ul>{s.items.map((it, idx) => <li key={idx}><strong>{it.title}</strong><p>{it.copy}</p></li>)}</ul>
              </section>
            );
          case "testimonials":
            return <Testimonials key={i} items={s.items} />;
          case "packages":
            return <PackageCarousel key={i} title={s.title ?? "Packages"} items={s.items} />;
          case "faq":
            return <FAQAccordion key={i} items={s.items} />;
          case "custom":
            // Optional registry for custom modules by name
            return <div key={i} data-component={s.component} />;
        }
      })}
    </main>
  );
}
```

---

# the page controller (App Router)

```tsx
// app/lp/[slug]/page.tsx
import { notFound } from "next/navigation";
import LandingTemplate from "@/templates/LandingPage/LandingTemplate";
import { lpToCanonicalUrl } from "@/lib/landing/urls";

export const dynamic = "error";   // static by default
export const revalidate = false;  // no remote fetch

async function loadLanding(slug: string) {
  try {
    // Prefer explicit file existence checks if you add a registry.
    const mod = await import(`@/data/page/landing/${slug}/index`);
    return mod.default as import("@/types/landing.types").LandingPageData;
  } catch {
    return null;
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await loadLanding(params.slug);
  if (!data) return notFound();
  return <LandingTemplate {...data} />;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await loadLanding(params.slug);
  if (!data) return {};
  return {
    title: data.seo?.title ?? data.hero.title,
    description: data.seo?.description,
    alternates: { canonical: data.seo?.canonical ?? lpToCanonicalUrl(params.slug) },
    robots: {
      index: data.seo?.robots?.index ?? false,  // safe default for paid LPs
      follow: data.seo?.robots?.follow ?? true,
    },
    openGraph: data.seo?.og,
  };
}

// Optional: pre-render known LPs (kept in a registry)
export async function generateStaticParams() {
  const { knownLandingSlugs } = await import("@/lib/landing/taxonomy");
  return knownLandingSlugs().map((slug) => ({ slug }));
}
```

---

# UTMs, analytics, and forms

* **UTMs:** App Router preserves `?utm_*` automatically. Do **not** redirect LPs unless normalizing trailing slashes (keep query & hash).
* **Form actions:** Post to your booking or quote endpoints with hidden fields populated from `searchParams` (client side) or from `headers()` server-side.
* **Attribution:** add a tiny hook to capture `document.location.search` into localStorage/sessionStorage on mount if you need multi-page attribution.

---

# SEO rules of thumb

* **Paid LP (most cases):** `noindex, follow`, but set a **canonical** to itself if you expect sharing.
* **Evergreen LP (SEO):** `index, follow`, unique title/description, and avoid close duplication with `/services/*` content.
* **OpenGraph:** allow per-LP overrides; default to hero title/subtitle + hero image.

---

# A/B testing & variants

Two options:

1. **Multiple slugs**

   * `/lp/seo-audit-v1`, `/lp/seo-audit-v2`
   * Separate data folders, separate static pages
   * Split traffic at the ad level or via redirect rules

2. **Runtime variant switch** (kept minimal)

   * Single slug `/lp/seo-audit`
   * The page reads `searchParams.variant` and chooses a variant data file *server-side*
   * Keep HTML stable to avoid layout shift; still static if you prebuild both variants and do a tiny param gate.

---

# middleware (optional aliases)

If you need vanity aliases like `/offer/seo-audit` → `/lp/saas-seo-audit`:

* Add exact entries to `LEGACY_REDIRECTS`.
* Do **not** add broad, greedy rules that might swallow `/services/*`.

Example:

```ts
// middleware.ts (snippet)
const LEGACY_REDIRECTS = {
  "/offer/seo-audit": "/lp/saas-seo-audit",
  "/landing/black-friday": "/lp/black-friday",
  // ...
};
```

---

# app directory tree with LPs integrated

```
/app
├── layout.tsx
├── page.tsx
├── lp
│   ├── [slug]
│   │   └── page.tsx
│   └── layout.tsx                 // optional: stripped nav, faster shell
├── services
│   ├── page.tsx
│   ├── page.data.json
│   └── [hub]
│       ├── page.tsx
│       └── [service]
│           ├── page.tsx
│           ├── packages/page.tsx
│           └── [sub]/page.tsx
├── main
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   └── products-services/page.tsx
├── legal
│   ├── privacy-policy/page.tsx
│   ├── terms-conditions/page.tsx
│   └── terms-services/page.tsx
└── packages
    ├── page.tsx
    └── [bundles]/page.tsx
```

---

# maintenance checklist (use per new LP)

* [ ] Create `src/data/page/landing/<slug>/index.ts` exporting `LandingPageData` (lint & typecheck).
* [ ] (Optional) Add shared assets under `src/data/page/landing/_shared/*`.
* [ ] Ensure any referenced images/videos exist under `/public/images/lp/*` or similar.
* [ ] Add analytics/form wiring (CTAs → `/book?...` with UTM passthrough).
* [ ] Decide SEO mode: **noindex** (paid) or **index** (evergreen).
* [ ] If you want SSG params, list the slug in `knownLandingSlugs()`; otherwise rely on on-demand or fallback (keep `dynamic="error"` if you require predeclared slugs).
* [ ] (If aliasing) add entries to `LEGACY_REDIRECTS` in `middleware.ts`.
* [ ] `npm run typecheck && npm run build` — fix any type drift in the template.

---

# pro tips

* Keep LP **content density high** and **component variety low**; the template should cover 90% of cases with `sections[].kind`.
* Reuse your existing **Testimonials**, **PackageCarousel**, **FAQAccordion**, **PricingSection** components. Only add “custom” blocks when truly needed.
* If you foresee hundreds of LPs, back them with a small registry in `src/lib/landing/taxonomy.ts` to control `generateStaticParams`, and consider colocated images in each LP folder.

---

if you want, I can scaffold the first LP (`saas-seo-audit`) into your repo structure so you can run `npm run build` right away.
