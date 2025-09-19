# Services: IA, URLs, SEO & Copy Rules

## Levels (what each page is)

- **L0** – Site root: `/`
- **L1** – Services root: `/services` (optional overview)
- **L2** – **Hub** (canonical; ends with `-services`)
  - e.g. `/marketing-services`
- **L3** – **Service** inside a hub
  - e.g. `/services/marketing/digital-advertising`
- **L4** – **Subservice** inside a service
  - e.g. `/services/marketing/digital-advertising/paid-social`

> Canonical L2 hubs:  
> `/web-development-services`, `/video-production-services`, `/seo-services`, `/marketing-services`, `/lead-generation-services`, `/content-production-services`.

## URL / slug rules

- L2 hubs **must** end with `-services`.
- L3/L4 slugs **do not** end with `-services`.
- Lowercase, kebab-case, ASCII. No trailing slash.
- Reserved: never use `packages` as an L4 slug.
- Aliases (if any) must 301 → canonical and be reflected in middleware + taxonomy together.

## “Marketing” vs “Marketing Services”

- Use **“Marketing Services”** when naming the **hub** (L2).
- Use **“marketing”** as a discipline inside body copy.
- Do **not** label the hub page “Marketing” alone—too ambiguous.

## On-page SEO (per level)

**Global**
- One H1 per page.
- Unique `<title>` (~50–60 chars) and meta description (~140–160).
- Breadcrumb JSON-LD on L2–L4.

**L2 (Hub)**
- **H1:** `{Hub Title} Services` (e.g., “Marketing Services”)
- **<title>:** `{Hub Title} Services | {Brand}`
- Sections: overview + cards linking to L3 services.

**L3 (Service)**
- **H1:** `{Service Title} Services` (e.g., “Digital Advertising Services”)
- **<title>:** `{Service Title} Services | {Brand}`

**L4 (Subservice)**
- **H1:** `{Subservice Title}` (no “Services”)
- **<title>:** `{Subservice Title} | {Brand}`

## Copy rules

- L2/L3 H1s end with **“Services”**; L4 H1s do **not**.
- Segment targeting goes in section headers (e.g., “for SaaS”), not in L2/L3 H1s.
- Start sections with outcomes, then proof (case studies/testimonials), then details/FAQs.

## Navigation & internal links

- Nav labels match H1s for L2/L3.
- Breadcrumbs reflect L2 → L3 → L4.
- L2 links to its L3s; L3 links to its L4s; L4 links back to parent and siblings.

## Governance (single source of truth)

- **Taxonomy** defines the L2→L3→L4 tree and titles.
- **Pages** read titles from taxonomy (or are verified against it).
- **Middleware** only canonicalizes **L2 hubs**; don’t hardcode L3/L4 there.
- `generateStaticParams` derives L3/L4 routes from taxonomy, never hardcoded arrays.

## Quick checklist

- URL matches level rules ✅
- H1/title follow level rules ✅
- Canonical slugs match taxonomy ✅
- Breadcrumb JSON-LD present ✅
- Internal links wired L2→L3→L4 ✅
```

---