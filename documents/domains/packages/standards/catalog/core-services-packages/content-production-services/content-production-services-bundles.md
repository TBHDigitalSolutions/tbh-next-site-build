---
title: "Content Production — Recommended Bundles"
domain: "packages"
main: "core-services-packages/content-production-services"
qualifier: "Bundles"
date: "2025-09-21"
status: "Draft"
owners: ["@conor"]
tags: ["packages", "content-production", "bundles", "pricing"]
version: 1
service: "content"
pricingModel:
  canonical: ["oneTime", "monthly"]
  currency: "USD"
notes:
  - "Bundles reference concrete ServicePackage IDs where possible."
  - "Where a component is a curated pack (not yet in data), mark as 'curated' and add to /src/data if chosen."
---

# 📦 Recommended Content Production Bundles

> Use these as cross-sell kits on `/packages` and the Content service hub. They combine core service packages for value and clarity.

## Small Business Content Starter
**ID:** `bundle-content-starter`  
**Components (by ID):**
- `content-design-essential` (Essential Design)
- `content-copy-essential` (Essential Copywriting)
- `content-publish-basic-cms` (Basic CMS)
**Pricing:**  
- **Bundle:** `{ monthly: 5800, currency: "USD" }`  
- **Component total (list):** `$6,800/month` → **Savings:** `$1,000/month`

---

## Growth Business Content System
**ID:** `bundle-content-growth`  
**Components (by ID):**
- `content-design-professional` (Professional Design)
- `content-copy-professional` (Professional Copywriting)
- `content-publish-professional` (Professional Publishing)
- `content-video-social-pack` (Social Media Video Pack)
**Pricing:**  
- **Bundle:** `{ monthly: 13500, currency: "USD" }`  
- **Component total (list):** `$16,000/month` → **Savings:** `$2,500/month`

---

## Enterprise Content Powerhouse
**ID:** `bundle-content-enterprise`  
**Components (by ID):**
- `content-design-enterprise` (Enterprise Design)
- `content-copy-enterprise` (Enterprise Copywriting)
- `content-publish-enterprise` (Enterprise Publishing)
- `content-video-training-system` (Training Video System)
- `content-sales-enterprise` (Enterprise Sales System)
**Pricing:**  
- **Bundle:** `{ oneTime: 12500, monthly: 38500, currency: "USD" }`  
- **Component total (list):** `$17,500 setup + $46,500/month`  
- **Savings:** `$5,000 setup + $8,000/month`

---

## Industry-Specific Bundles

### E-commerce Content Bundle
**ID:** `bundle-content-ecommerce`  
**Components (by ID):**
- `content-design-professional`
- `content-pack-ecommerce` _(curated industry pack; add as ServicePackage if adopting)_
- `content-photo-product-starter` (monthly cadence)
- `content-video-social-pack`
**Pricing (target):** `{ monthly: 12500, currency: "USD" }`

---

### B2B Professional Services Bundle
**ID:** `bundle-content-b2b-pro`  
**Components (by ID):**
- `content-copy-enterprise`
- `content-sales-professional`
- `content-photo-corporate` (quarterly)
- `content-presentation-executive`
**Pricing (target):** `{ oneTime: 8500, monthly: 12000, currency: "USD" }`

---

### Startup Content Launch Bundle
**ID:** `bundle-content-startup-launch`  
**Components (by ID):**
- `content-brand-essentials`
- `content-copy-essential`
- `content-publish-basic-cms`
- `content-presentation-starter`
**Pricing (target):** `{ oneTime: 9500, monthly: 4300, currency: "USD" }`

---

## Implementation Notes
- Add/confirm any **curated industry packs** as `ServicePackage` items in `/src/data/packages/content-production/*` if you want them searchable/selectable.
- All bundle IDs above become `Bundle.slug` in `/src/data/packages/bundles/*.ts` (or consolidated authoring).
