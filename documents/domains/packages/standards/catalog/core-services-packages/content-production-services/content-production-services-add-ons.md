---
title: "Content Production — Add-Ons Catalog"
domain: "packages"
main: "core-services-packages/content-production-services"
qualifier: "AddOns"
date: "2025-09-21"
status: "Draft"
owners: ["@conor"]
tags: ["packages", "content-production", "add-ons", "pricing"]
version: 1
service: "content"
pricingModel:
  canonical: ["oneTime", "monthly"]
  currency: "USD"
notes:
  - "Mirror these items in /src/data/packages/content-production/content-production-addons.ts"
  - "All prices use canonical Money; legacy 'setup' → 'oneTime'."
---

# ➕ Content Production Add-Ons

## Brand & Strategy

### Brand Identity Starter Kit
**ID:** `content-brand-identity-kit`  
- Logo design and brand guidelines  
- Business card and letterhead design  
- Brand color palette and typography  
- Basic brand asset library  
**Price:** `{ oneTime: 4500 }`

### Content Audit & Strategy Package
**ID:** `content-audit-strategy`  
- Complete content audit (current assets)  
- Competitive content analysis  
- 6-month content strategy roadmap  
- Editorial calendar template setup  
**Price:** `{ oneTime: 2500 }`

---

## Photography & Video

### Professional Photography Package
**ID:** `content-professional-photography`  
- Full-day product or corporate photography  
- 50+ edited high-resolution images  
- Usage rights and licensing  
- Multiple format optimization  
**Price:** `{ oneTime: 3500 }`

### Video Content Production Add-On
**ID:** `content-video-production`  
- 4 videos/month (2–5 minutes each)  
- Scripting & storyboarding  
- Pro filming & editing  
- Multi-platform optimization  
**Price:** `{ monthly: 4500 }`

---

## Social Media Management (Tiers)

> Prefer distinct add-on IDs for each tier so pricing and scope are explicit.

### Social Starter
**ID:** `content-social-starter`  
- 3 platforms, 12 posts/month  
- Engagement monitoring  
**Price:** `{ monthly: 2500 }`

### Social Growth
**ID:** `content-social-growth`  
- 4 platforms, 30 posts/month  
- Community management  
**Price:** `{ monthly: 4500 }`

### Social Authority
**ID:** `content-social-authority`  
- Unlimited platforms, 60+ posts/month  
- Influencer outreach  
**Price:** `{ monthly: 8500 }`

---

## Podcast & Audio

### Podcast Starter Kit
**ID:** `content-podcast-starter`  
- Branding, hosting setup  
- 2 episodes/month (editing included)  
**Price:** `{ oneTime: 4000, monthly: 1500 }`

### Podcast Growth Pack
**ID:** `content-podcast-growth`  
- Weekly production  
- Distribution + guest outreach  
**Price:** `{ monthly: 3500 }`

### Branded Audio Series
**ID:** `content-audio-branded-series`  
- 6-episode scripted series  
**Price:** `{ oneTime: 7500 }`

---

## Accelerators & Compliance

### Rapid Content Creation Pack
**ID:** `content-accelerator-rapid`  
- 48-hour turnaround, priority queue  
**Price:** “+50% of base package rate” _(billing note; no Money value)_

### Content Repurposing System
**ID:** `content-accelerator-repurpose`  
- Audit, multi-format adaptation, library organization  
**Price:** `{ oneTime: 3500, monthly: 1500 }`

### Brand Consistency Monitoring
**ID:** `content-accelerator-brand-compliance`  
- Guideline enforcement, approval workflows, reporting  
**Price:** `{ monthly: 2500 }`
