Awesome—here’s exactly where to put a **Growth Packages** hub and the **individual package pages** in your Next.js app. I’m using clean, memorable URLs and keeping it parallel to `/services`, `/book`, and `/portfolio`.

# 📂 Updated `/app` Directory (with Packages)

```
/app
├── layout.tsx
├── legal
│   ├── legal.module.css
│   ├── privacy-policy
│   │   ├── page.data.json
│   │   └── page.tsx
│   ├── terms-conditions
│   │   ├── page.data.json
│   │   └── page.tsx
│   └── terms-services
│       ├── page.data.json
│       └── page.tsx
├── main
│   ├── about
│   │   ├── about.module.css
│   │   └── page.tsx
│   ├── contact
│   │   ├── contact.module.css
│   │   └── page.tsx
│   └── products-services
│       ├── page.tsx
│       └── products.module.css
├── book
│   └── page.tsx                     // Booking page (discovery call, scheduling)
├── portfolio
│   ├── page.tsx                     // Global portfolio hub (all projects, filters)
│   ├── portfolio.module.css
│   └── [category]                   // Optional: /portfolio/video, /portfolio/web
│       └── page.tsx
├── packages
│   ├── page.tsx                     // Growth Packages hub (all bundles overview)
│   ├── packages.module.css          // (optional styling)
│   └── [bundle]                     // Individual bundle page (full details)
│       └── page.tsx                 // e.g., /packages/local-business-growth
├── page.tsx
└── services
    ├── [hub]
    │   ├── [service]
    │   │   ├── [sub]
    │   │   │   └── page.tsx
    │   │   └── page.tsx
    │   └── page.tsx
    └── page.tsx
```

## What goes where

* **`/packages/page.tsx` (Growth Packages hub)**

  * Grid/list of all multi-service bundles (name, 1–2 sentence value, price/“starting at”, primary CTA to each bundle).
  * Secondary CTAs: **Book a call** (`/book`) and **View portfolio** (`/portfolio`).
  * Optional filters (by industry or goal: Local, E-Com, B2B, etc).

* **`/packages/[bundle]/page.tsx` (Individual package)**

  * Hero: package name, value prop, one-time setup + monthly retainer.
  * “What’s included” tables (pull from your SSOT).
  * Deliverables, timeline, add-ons, FAQs, testimonials.
  * CTAs: **Request proposal** (link/form), **Book a call**.
  * Cross-sell: “Other packages you might like”.

### Linking from elsewhere

* From `/services` growth banner → **link to `/packages`**.
* From hubs/services where relevant (“Business Solutions”) → link to `/packages/[bundle]`.
* Keep your previous link (`/pricing#bundles`) as a **secondary path** if you already have a pricing page; you can show a summary there but canonicalize to `/packages`.

---

# 📦 Suggested data placement (SSOT)

Keep packages data centralized so both the **hub** and **bundle pages** read the same source:

```
/src/data/packages/
├── index.ts                // export all bundles array
├── bundles.json            // (or .ts) source of truth for packages
└── [bundle-slugs].json     // optional per-bundle overrides
```

**Example shape:**

```ts
export type Bundle = {
  slug: string;                // "local-business-growth"
  name: string;                // "Local Business Growth"
  oneTimePrice: string;        // "$12,500"
  monthlyPrice?: string;       // "$1,500/mo"
  description: string;
  includes: { section: string; items: string[] }[]; // tables
  addOns?: string[];
  idealFor?: string[];
  timeline?: string;           // "3–6 weeks"
  ctas?: { primary: {label:string, href:string}, secondary?: {label:string, href:string} }
};
```

Both pages:

* **`/packages/page.tsx`** maps over `bundles` to render cards.
* **`/packages/[bundle]/page.tsx`** loads by `params.bundle` and renders the full details.

---

# 🔁 Optional niceties

* **Breadcrumbs:** `/packages` → `/packages/[bundle]` for clarity.
* **Canonical URLs:** Canonicalize bundle pages to `/packages/[bundle]` (avoid dupes if also listed under `/pricing`).
* **Schema.org:** Mark bundle pages as `Product`/`Service` with `offers`.
* **Redirects:** If you used `/pricing#bundles`, add a gentle banner on `/pricing` linking users to `/packages` for full details.

---

If you want, I can stub **`/packages/page.tsx`** and **`/packages/[bundle]/page.tsx`** with minimal TSX that reads from `/src/data/packages/index.ts`, so you can drop it straight in and start rendering your bundles.
