---
title: "Content Production — Featured Packages"
domain: "packages"
main: "core-services-packages/content-production-services"
qualifier: "Featured"
date: "2025-09-21"
status: "Draft"
owners: ["@conor"]
tags: ["packages", "content-production", "featured", "promotions"]
version: 1
service: "content"
pricingModel:
  canonical: ["oneTime", "monthly"]
  currency: "USD"
notes:
  - "These appear in rails/carousels and service hubs."
  - "If an ID is 'curated', add it as a virtual ServicePackage or map via an adapter."
---

# ⭐ Content Production — Featured Packages

> These 3–4 “most purchased / most practical” options surface on the Content service pages, hub rails, and cross-sell slots.

## 1) Brand Content Starter
**ID:** `content-brand-starter` _(curated composite)_  
**Positioning:** Establish consistent voice and a dependable monthly publishing cadence.  
**What’s inside (summary):**
- Brand voice development & guidelines  
- 20 pieces of monthly content  
- Basic graphic design (10 pieces/month)  
- Content calendar & publishing  
- Monthly performance reporting  
**Pricing:** `{ oneTime: 2500, monthly: 3500 }`  
**Badge:** Most Popular

> _Data note:_ Represent as a virtual `ServicePackage` or adapter-composed card from `content-copy-essential` + light design support.

---

## 2) Social Media Growth Pack
**ID:** `content-social-growth-pack` _(curated composite)_  
**Positioning:** Scalable social program that actually ships and learns.  
**What’s inside (summary):**
- 40 posts/month across platforms  
- Pro design templates  
- Hashtag & optimization workflow  
- Community management (2h/day)  
- Monthly analytics & optimization  
**Pricing:** `{ oneTime: 1500, monthly: 4500 }`  
**Badge:** Best Value

> _Data note:_ Map to `content-social-growth` add-on + supporting content ops; or author as a dedicated `ServicePackage`.

---

## 3) Complete Content System
**ID:** `content-complete-system` _(curated composite)_  
**Positioning:** End-to-end production across channels with strategy, design, and video.  
**What’s inside (summary):**
- Unlimited written content  
- Photography direction  
- 4 videos/month  
- Multi-platform optimization  
- Dedicated strategist; advanced analytics  
**Pricing:** `{ oneTime: 5000, monthly: 8500 }`  
**Badge:** Enterprise

> _Data note:_ Tie to `content-copy-enterprise` + `content-video-production` and mark as enterprise composite.

---

## Optional 4) Editorial Strategy Starter
**ID:** `content-editorial-starter`  
**Why feature:** Low-friction entry that leads to production retainers.  
**Pricing:** `{ oneTime: 4500 }`
