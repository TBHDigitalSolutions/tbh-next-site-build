Awesome — here are the **production-ready docs** for **Phase 04 — App Router Integration (Hub & Detail) + Templates**.
Drop these four files into:

```
documents/domains/packages/phases/phase-04-app-router-hub-and-detail/
├─ _generated/index.json
├─ README.md
├─ phase-04-app-router-hub-and-detail_Checklist_2025-09-22.md
└─ phase-04-app-router-hub-and-detail_Playbook_2025-09-22.md
```

They’re tailored to your repo (`TBHDigitalSolutions/tbh-next-site-build`), Node 20, **npm**, and the guardrails we’ve set (pages thin, no runtime MDX, read via façade only).

---

## 1) `README.md`

```md
**Official Title:** Phase 04 — App Router Integration (Hub & Detail) + Templates  
**Domain:** packages  
**File Name:** phase-04-app-router-hub-and-detail_Readme_2025-09-22.md  
**Main Part:** phase-04-app-router-hub-and-detail  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Implement `/packages` and `/packages/[bundles]` in the **App Router** using **lean pages** + **presentation-only templates**.  
- Pages read exclusively from `@/data/packages` façade; templates do **no IO**.  
- Hub has instant search/filters/featured rails; Detail renders **compiled MDX** safely and emits **Service JSON-LD** only when price exists.

**Summary:**  
This phase wires the Packages domain routes into Next.js App Router. The hub page (`/packages`) renders via `PackagesHubTemplate` using a prebuilt search dataset (`getPackagesSearchIndex()`); the detail page (`/packages/[bundles]`) resolves a bundle via façade, renders `PackagesDetailTemplate`, and (optionally) injects the bundle’s compiled MDX HTML produced in Phase 03. Both pages set robust metadata (canonical, OG/Twitter) and emit JSON-LD (hub = `ItemList`, detail = `Service` when pricing is present). Analytics hooks are exposed as props data attributes; interaction logic (if any) is in small client helpers inside the templates, without data fetching.
```

---

## 2) `phase-04-app-router-hub-and-detail_Checklist_2025-09-22.md`

```md
**Official Title:** Phase 04 — App Router Integration (Hub & Detail) + Templates (Checklist)  
**Domain:** packages  
**File Name:** phase-04-app-router-hub-and-detail_Checklist_2025-09-22.md  
**Main Part:** phase-04-app-router-hub-and-detail  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Node 20 + **npm**; branch `feat/packages-refactor`.  
- Pages are thin; templates render only; **no runtime MDX**.

**Summary:**  
Tight, reviewable steps to add `/packages` and `/packages/[bundles]` using façade data and presentation templates. Includes metadata, JSON-LD, and basic analytics attributes.

---

## Working rules
- Work on `feat/packages-refactor` (never `main`).
- Use **npm** only. Ask before running commands if using Codex.
- Import data **only** from `@/data/packages`.
- No IO inside templates; no runtime MD/MDX parsing.

## Preconditions
- [ ] Phase 01 façade exists (`BUNDLES`, `getBundleBySlug`, `FEATURED_BUNDLE_SLUGS`, `getPackagesSearchIndex`).
- [ ] Phase 03 artifacts build (`bundles.enriched.json`, `packages.search.json`) via `npm run data:ci`.

## Do this (check each)
- [ ] Create `app/packages/packages.module.css` (light helpers for hub/detail).
- [ ] Add **hub page** `app/packages/page.tsx` (server).  
- [ ] Add **detail page** `app/packages/[bundles]/page.tsx` (server; **plural** segment).  
- [ ] Add templates under `src/packages/templates/`:  
      - [ ] `PackagesHubTemplate.tsx` (server wrapper + tiny client filter/search)  
      - [ ] `PackagesDetailTemplate.tsx` (server wrapper + optional client bits)  
- [ ] Ensure both templates **emit JSON-LD** (`ItemList` for hub; `Service` for detail **only when price exists**).  
- [ ] Add light analytics attributes (`data-analytics-*`) on cards/CTAs.  
- [ ] `npm run data:ci && npm run build` → green.  
- [ ] Manual QA: hub search/filters; detail renders compiled `bundle.content.html`.  
- [ ] Open PR into `feat/packages-refactor` with screenshots/gifs.

## Acceptance
- [ ] `/packages` renders: instant search, filters, featured rails, card analytics, hidden `ItemList` JSON-LD.  
- [ ] `/packages/[bundles]` renders: compiled MDX safely, sticky CTAs, resilient pricing, `Service` JSON-LD only if priced.  
- [ ] Correct metadata (canonical/OG/Twitter); plural `[bundles]` segment; no template IO.
```

---

## 3) `phase-04-app-router-hub-and-detail_Playbook_2025-09-22.md`

````md
**Official Title:** Phase 04 — App Router Integration (Hub & Detail) + Templates (Playbook)  
**Domain:** packages  
**File Name:** phase-04-app-router-hub-and-detail_Playbook_2025-09-22.md  
**Main Part:** phase-04-app-router-hub-and-detail  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Hub and detail pages are **minimal server files** delegating to templates.  
- Templates are presentation-only; any interactivity is client-side **without fetching**.  
- JSON-LD is rendered inline with `<script type="application/ld+json">`.

**Summary:**  
This playbook provides exact file contents and paths to implement `/packages` and `/packages/[bundles]` using the Phase-01 façade and Phase-03 generated artifacts. Copy these files into your repo and adjust copy/labels as needed.

---

## 0) Branch & sanity

```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c feat/phase-04-app-router
````

Pre-flight:

* `npm run data:ci` must succeed (Phase-03 artifacts).
* Ensure `NEXT_PUBLIC_SITE_URL` is set in `.env.local`.

---

## 1) CSS helpers for hub/detail

**File:** `app/packages/packages.module.css`

```css
.page { padding-block: 24px; }
.hero { margin-bottom: 24px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 16px; }
.rail { margin-top: 32px; }
.badge { display:inline-flex; align-items:center; font-size:12px; padding:2px 8px; border-radius:9999px; background:#f5f5f5; }
.filters { display:flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 20px; }
.card { border:1px solid #eee; border-radius: 12px; padding: 16px; background:#fff; }
.price { font-weight:600; margin-top: 8px; }
.ctaBand { margin-top: 48px; padding: 16px; background:#fafafa; border:1px solid #eee; border-radius:12px; text-align:center; }
.prose { max-width: 70ch; }
.stickyCtas { position: sticky; top: 64px; z-index: 2; }
.srOnly { position:absolute; width:1px; height:1px; margin:-1px; padding:0; border:0; clip:rect(0 0 0 0); overflow:hidden; white-space:nowrap; }
```

---

## 2) Hub page (server)

**File:** `app/packages/page.tsx`

```tsx
// app/packages/page.tsx
import type { Metadata } from "next";
import styles from "./packages.module.css";
import { PackagesHubTemplate } from "@/packages/templates/PackagesHubTemplate";
import { getPackagesSearchIndex, FEATURED_BUNDLE_SLUGS } from "@/data/packages";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export const metadata: Metadata = {
  title: "Integrated Growth Packages",
  description: "Explore bundles, packages, and add-ons across Content, SEO, Video, Web and more.",
  alternates: { canonical: "/packages" },
  openGraph: { url: `${SITE}/packages`, title: "Integrated Growth Packages" },
  twitter: { card: "summary_large_image", title: "Integrated Growth Packages" }
};

export default async function Page() {
  const searchIndex = getPackagesSearchIndex(); // façade (compiled in Phase 03)
  return (
    <main className={styles.page}>
      <PackagesHubTemplate
        hero={{
          title: "Integrated Growth Packages",
          subtitle: "Pick a plan or build your own.",
          cta: { label: "Book a call", href: "/contact" }
        }}
        filters={{
          type: ["All","Bundle","Package","Add-on"],
          services: ["content","leadgen","marketing","seo","video","web"],
          sort: ["Recommended","A–Z"]
        }}
        featured={{ bundleSlugs: FEATURED_BUNDLE_SLUGS ?? [] }}
        searchIndex={searchIndex}
        classNames={styles}
        analyticsIdPrefix="packages_hub"
      />
    </main>
  );
}
```

---

## 3) Detail page (server; **plural** segment)

**File:** `app/packages/[bundles]/page.tsx`

```tsx
// app/packages/[bundles]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../packages.module.css";
import { PackagesDetailTemplate } from "@/packages/templates/PackagesDetailTemplate";
import { BUNDLES, getBundleBySlug } from "@/data/packages";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export async function generateStaticParams() {
  return BUNDLES.map(b => ({ bundles: b.slug }));
}

export async function generateMetadata({ params }: { params: { bundles: string } }): Promise<Metadata> {
  const bundle = getBundleBySlug(params.bundles);
  if (!bundle) return { robots: { index: false, follow: false } };
  const url = `${SITE}/packages/${bundle.slug}`;
  return {
    title: bundle.title,
    description: bundle.summary,
    alternates: { canonical: `/packages/${bundle.slug}` },
    openGraph: { url, title: bundle.title, description: bundle.summary ?? undefined },
    twitter: { card: "summary_large_image", title: bundle.title }
  };
}

export default function Page({ params }: { params: { bundles: string } }) {
  const bundle = getBundleBySlug(params.bundles);
  if (!bundle) return notFound();
  return (
    <main className={styles.page}>
      <PackagesDetailTemplate bundle={bundle} classNames={styles} analyticsIdPrefix="bundle_detail" />
    </main>
  );
}
```

---

## 4) Templates (presentation only, with tiny client helpers)

> Put templates under `src/packages/templates/`. They **do not fetch** or read files; they render props.
> Any interactivity is isolated in small `use client` helpers that **do not** call network/data.

### 4.1 `src/packages/templates/PackagesHubTemplate.tsx`

```tsx
// src/packages/templates/PackagesHubTemplate.tsx
import "server-only";
import React from "react";

type Money = { oneTime?: number; monthly?: number; currency?: "USD" };
type SearchRecord =
  | { type:"bundle";  slug:string; title:string; summary?:string; tags?:string[]; category?:string; price?:Money }
  | { type:"package"; id:string;   service:string; name:string;   summary?:string; tags?:string[]; category?:string; price?:Money; tier?:string }
  | { type:"addon";   id:string;   service:string; name:string;   summary?:string; tags?:string[]; category?:string; price?:Money };

export type HubProps = {
  hero: { title: string; subtitle?: string; cta?: { label: string; href: string } };
  filters: { type: string[]; services: string[]; sort: string[] };
  featured: { bundleSlugs: string[] };
  searchIndex: SearchRecord[];
  classNames: Record<string,string>;
  analyticsIdPrefix?: string;
};

function formatPrice(p?: Money) {
  if (!p || (!p.oneTime && !p.monthly)) return "Custom pricing";
  const parts: string[] = [];
  if (p.oneTime) parts.push(`$${p.oneTime} setup`);
  if (p.monthly) parts.push(`$${p.monthly}/mo`);
  return parts.join(" · ");
}

function HubJSONLD({ items }: { items: SearchRecord[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map((x, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": x.type === "bundle" ? `/packages/${x.slug}` : `/packages#${x.type}-${"slug" in x ? x.slug : x.id}`
    }))
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

export function PackagesHubTemplate(props: HubProps) {
  const { hero, filters, featured, searchIndex, classNames, analyticsIdPrefix = "packages_hub" } = props;

  // Optional: feature the featured bundles first by slug order
  const featureOrder = new Map(featured.bundleSlugs.map((s, i) => [s, i]));
  const initial = [...searchIndex].sort((a, b) => {
    if (a.type === "bundle" && b.type === "bundle") {
      const ia = featureOrder.has(a.slug) ? featureOrder.get(a.slug)! : 9999;
      const ib = featureOrder.has(b.slug) ? featureOrder.get(b.slug)! : 9999;
      if (ia !== ib) return ia - ib;
    }
    const ka = ("name" in a ? a.name : a.title).toLowerCase();
    const kb = ("name" in b ? b.name : b.title).toLowerCase();
    return ka.localeCompare(kb);
  });

  return (
    <>
      <section className={classNames.hero} aria-labelledby="packages-hero-h1">
        <h1 id="packages-hero-h1">{hero.title}</h1>
        {hero.subtitle && <p>{hero.subtitle}</p>}
        {hero.cta && <p><a className={classNames.badge} href={hero.cta.href} data-analytics={`${analyticsIdPrefix}:hero_cta`}>{hero.cta.label}</a></p>}
      </section>

      {/* Client filter/search */}
      <HubClient
        filters={filters}
        items={initial}
        classNames={classNames}
        analyticsIdPrefix={analyticsIdPrefix}
      />

      <div className={classNames.ctaBand}>
        <strong>Not sure which to pick?</strong> <a href="/contact" data-analytics={`${analyticsIdPrefix}:bottom_cta`}>Book a consult</a>
      </div>

      {/* Hidden JSON-LD for visible cards */}
      <HubJSONLD items={initial} />
    </>
  );
}

/* ---------- Client helper (no data fetch) ---------- */
"use client";
import { useMemo, useState } from "react";

function HubClient(props: {
  filters: HubProps["filters"];
  items: SearchRecord[];
  classNames: Record<string,string>;
  analyticsIdPrefix: string;
}) {
  const { filters, items, classNames, analyticsIdPrefix } = props;
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("All");
  const [service, setService] = useState<string>("All");
  const [sort, setSort] = useState<string>("Recommended");

  const filtered = useMemo(() => {
    let list = items.filter((x) => {
      const inType =
        type === "All" ||
        (type === "Bundle" && x.type === "bundle") ||
        (type === "Package" && x.type === "package") ||
        (type === "Add-on" && x.type === "addon");
      const inService = service === "All" || ("service" in x && x.service === service);
      const text = q.trim().toLowerCase();
      const inText =
        !text ||
        ("title" in x && (x.title.toLowerCase().includes(text) || (x.summary ?? "").toLowerCase().includes(text))) ||
        ("name" in x && (x.name.toLowerCase().includes(text) || (x.summary ?? "").toLowerCase().includes(text)));
      return inType && inService && inText;
    });

    if (sort === "A–Z") {
      list = list.sort((a, b) => {
        const ka = ("name" in a ? a.name : a.title).toLowerCase();
        const kb = ("name" in b ? b.name : b.title).toLowerCase();
        return ka.localeCompare(kb);
      });
    }
    return list;
  }, [items, q, type, service, sort]);

  return (
    <>
      <div className={classNames.filters} role="region" aria-label="Search and filters">
        <input
          placeholder="Search packages…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
        <select aria-label="Type" value={type} onChange={(e)=>setType(e.target.value)}>
          {filters.type.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select aria-label="Service" value={service} onChange={(e)=>setService(e.target.value)}>
          {["All", ...filters.services].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select aria-label="Sort" value={sort} onChange={(e)=>setSort(e.target.value)}>
          {filters.sort.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className={classNames.grid}>
        {filtered.map((x) => {
          const title = "name" in x ? x.name : x.title;
          const href = x.type === "bundle" ? `/packages/${x.slug}` : "/packages";
          const priceText = formatPrice(x.price);
          const key = x.type === "bundle" ? `bundle:${x.slug}` : `${x.type}:${"id" in x ? x.id : title}`;

          return (
            <a key={key} href={href} className={classNames.card} data-analytics={`${analyticsIdPrefix}:card_click`} data-type={x.type}>
              <div className={classNames.badge}>{x.type}</div>
              <h3>{title}</h3>
              {("summary" in x) && x.summary && <p>{x.summary}</p>}
              <div className={classNames.price}>{priceText}</div>
            </a>
          );
        })}
      </div>
    </>
  );
}
```

---

### 4.2 `src/packages/templates/PackagesDetailTemplate.tsx`

```tsx
// src/packages/templates/PackagesDetailTemplate.tsx
import "server-only";
import React from "react";

type Money = { oneTime?: number; monthly?: number; currency?: "USD" };
type Bundle = {
  slug: string; title: string; subtitle?: string; summary?: string;
  price?: Money; tags?: string[]; category?: string;
  components: string[]; addOnRecommendations?: string[];
  content?: { html?: string };
};

export function PackagesDetailTemplate({
  bundle,
  classNames,
  analyticsIdPrefix = "bundle_detail"
}: {
  bundle: Bundle;
  classNames: Record<string,string>;
  analyticsIdPrefix?: string;
}) {
  const priced = !!(bundle.price?.oneTime || bundle.price?.monthly);

  return (
    <>
      <article aria-labelledby="bundle-title">
        <header className={classNames.hero}>
          <div className={classNames.badge}>Bundle</div>
          <h1 id="bundle-title">{bundle.title}</h1>
          {bundle.subtitle && <p>{bundle.subtitle}</p>}
          <div className={classNames.stickyCtas}>
            <a className={classNames.badge} href="/contact" data-analytics={`${analyticsIdPrefix}:cta_primary`}>Book a call</a>{" "}
            <a className={classNames.badge} href="/contact" data-analytics={`${analyticsIdPrefix}:cta_secondary`}>Get pricing</a>
          </div>
        </header>

        <section aria-label="Pricing">
          <h2 className={classNames.srOnly}>Pricing</h2>
          <p className={classNames.price}>{formatPrice(bundle.price)}</p>
        </section>

        <section aria-label="What's included">
          <h2>What’s included</h2>
          <ul>
            {bundle.components.map(id => <li key={id}><code>{id}</code></li>)}
          </ul>
        </section>

        {bundle.addOnRecommendations?.length ? (
          <section aria-label="Recommended add-ons">
            <h2>Recommended add-ons</h2>
            <ul>
              {bundle.addOnRecommendations.map(id =>
                <li key={id}>
                  <button data-analytics={`${analyticsIdPrefix}:addon_click`} data-addon-id={id} aria-label={`Add-on ${id}`}>{id}</button>
                </li>
              )}
            </ul>
          </section>
        ) : null}

        {bundle.content?.html ? (
          <section aria-label="Details">
            <h2 className={classNames.srOnly}>Details</h2>
            <article className={classNames.prose} dangerouslySetInnerHTML={{ __html: bundle.content.html }} />
          </section>
        ) : null}

        <section className={classNames.ctaBand} aria-label="Get started">
          <strong>Want this bundle?</strong>{" "}
          <a href="/contact" data-analytics={`${analyticsIdPrefix}:cta_bottom`}>Talk to a strategist</a>
        </section>
      </article>

      {/* JSON-LD (only when priced) */}
      {priced ? <DetailJSONLD bundle={bundle} /> : null}
    </>
  );
}

function formatPrice(p?: Money) {
  if (!p || (!p.oneTime && !p.monthly)) return "Custom pricing";
  const parts: string[] = [];
  if (p.oneTime) parts.push(`$${p.oneTime} setup`);
  if (p.monthly) parts.push(`$${p.monthly}/mo`);
  return parts.join(" · ");
}

function DetailJSONLD({ bundle }: { bundle: Bundle }) {
  // Emit Service schema only when price exists
  const hasOffer = !!(bundle.price?.oneTime || bundle.price?.monthly);
  if (!hasOffer) return null;

  const offers = [];
  if (bundle.price?.monthly) {
    offers.push({
      "@type": "Offer",
      "priceCurrency": bundle.price.currency ?? "USD",
      "price": bundle.price.monthly,
      "category": "subscription"
    });
  }
  if (bundle.price?.oneTime) {
    offers.push({
      "@type": "Offer",
      "priceCurrency": bundle.price.currency ?? "USD",
      "price": bundle.price.oneTime,
      "category": "oneTime"
    });
  }

  const json = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": bundle.title,
    "description": bundle.summary ?? undefined,
    "areaServed": "US",
    "offers": offers
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
```

---

## 5) Wire analytics (attributes only)

We deliberately avoid any analytics vendor lock-in. The templates add `data-analytics="<event_id>"`. Hook these up in your site’s global client tracker (if you have one) or add later.

---

## 6) Validate

```bash
# use facade data (Phase 01) + artifacts (Phase 03)
npm run data:ci
npm run build
npm run dev
```

Manual checks:

* `/packages`: search, filters, featured ordering; cards have price chips and analytics attributes; `ItemList` JSON-LD present (view page source).
* `/packages/{existing-bundle}`: sticky CTAs, price block, “included” list, recommended add-ons, MDX content (if authored), `Service` JSON-LD only when priced.

---

## 7) Commit & PR

```bash
git add app/packages src/packages/templates
git add app/packages/packages.module.css
git commit -m "feat(packages): hub and detail routes using templates + JSON-LD + analytics attrs"
git push -u origin feat/phase-04-app-router
```

Open a PR into `feat/packages-refactor` with screenshots (hub + one detail).

---

## 8) Troubleshooting notes (repo-specific)

* If you see **route collisions** elsewhere (e.g., `/book`), resolve them before building to avoid App Router compile failures.
* If `NEXT_PUBLIC_SITE_URL` is undefined, OG canonical URLs will be relative—set a placeholder in `.env.local` for QA.
* If detail pages show “Custom pricing” unexpectedly, verify your bundle price normalization (Phase 01) and that Phase 03 rebuilt artifacts.

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "04",
  "title": "App Router Integration (Hub & Detail) + Templates",
  "files": [
    "README.md",
    "phase-04-app-router-hub-and-detail_Checklist_2025-09-22.md",
    "phase-04-app-router-hub-and-detail_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Recap — Acceptance (copy/paste)

* `/packages`: instant search, filters, featured rails, card analytics, `ItemList` JSON-LD.
* `/packages/[bundles]`: compiled MDX renders safely, sticky CTAs, resilient price display, `Service` JSON-LD **only when priced**.
* Correct metadata (canonical, OG/Twitter); plural segment `[bundles]`.
* Templates have **no IO**; all data via façade; **no runtime MDX** anywhere.
