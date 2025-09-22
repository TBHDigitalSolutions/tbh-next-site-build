# Packages Domain — App Pages Layouts Plan
**Domain:** Packages  
**File Name:** packages-app-pages-layouts_Plan_2025-09-21.md  
**Main Part:** packages-app-pages-layouts  
**Qualifier:** Plan  
**Date:** 2025-09-21  
**Spotlight Comments:** Draft guidance on hub & bundle page layouts, functions, and behaviors  
**Summary:** Natural-language layout rules for `/packages` (hub) and `/packages/[bundle]` (detail) pages, including top/bottom structure, sections, and functional behaviors.

---

# 📦 Packages Hub (`/packages`)

## Top of the page
- **Hero:** Large title (“Integrated Growth Packages”), one-sentence subtitle, primary button (“Book a call”).
- **Search + filter bar:**
  - Search input (live search).
  - Filters: Type (All / Bundles / Packages / Add-ons), Service (Content, Lead Gen, SEO, etc.), Sort (Recommended / A–Z).

## Main content
1. **All-items grid**
   - Shows cards for **Bundles**, **Packages (tiers)**, and **Add-ons**.
   - Each card shows: name, quick one-liner, bullets, and price chips (setup, monthly, or “Custom pricing”).
   - Bundle → detail page; Package/Add-on → drawer or service page.

2. **Optional featured rails**
   - Short horizontal carousels: “Popular for SEO”, “Popular for Video” using “featured” sets.

## Bottom of the page
- **CTA band:** “Not sure which package? Talk to us” with buttons (**Book a call**, **Request a proposal**).
- **Optional:** FAQ teaser or link to “How we price”.

## Functions / behaviors
- Instant search & filtering (no reload).
- Card badges (“Most Popular”, tier labels).
- Analytics events (card clicks, CTA clicks).
- JSON-LD `ItemList` for SEO (hidden).

---

# 📦 Bundle Detail (`/packages/[bundle]`)

## Top of the page
- **Hero:** Title, value proposition, tag chips (“SEO”, “Video”), primary CTA (**Request proposal**), secondary (**Book a call**).
- **Price block:** One-time setup, monthly retainer, or “Custom pricing” with notes (e.g., “+ ad spend”).

## Main content
1. **Optional at-a-glance card**
   - Compact “you chose this” card with bullets + price chips.

2. **What’s included**
   - Structured table/accordion with grouped deliverables.

3. **Expected outcomes / results**
   - Stat strip (e.g., “≤30 days to first campaign”) or bullet list of outcomes.

4. **Recommended add-ons**
   - Grid of relevant add-ons (price + description).

5. **Popular in this category**
   - Carousel of related bundles or packages.

6. **FAQ**
   - Expandable bundle-specific Q&A (timeline, tools, approvals).

## Bottom of the page
- **CTA band:** **Get proposal**, **Book a call**, optional case studies.
- **Optional:** Trust strip (logos, testimonials).

## Functions / behaviors
- Sticky/repeated CTAs.
- Resilient pricing display (show only existing values; fallback “Custom pricing”).
- Analytics for CTA/add-on clicks.
- JSON-LD `Service` with `offers` only when pricing exists.

---

## 🧩 Mental model
- **Hub = storefront shelf** of everything (searchable, filterable, skimmable).  
- **Bundle Detail = product page** for one solution (price, scope, outcomes, add-ons, FAQ, convert).
