---
title: "Lead Generation — Add-Ons"
domain: "packages"
main: "core-services-packages/lead-generation-services"
qualifier: "Add-Ons"
date: "2025-09-21"
status: "Draft"
owners: ["@conor"]
tags: ["lead-generation", "add-ons", "upsells", "pricing"]
version: 1
service: "leadgen"
pricingModel:
  canonical: ["oneTime", "monthly"]
  currency: "USD"
notes:
  - "Author prices with the canonical `{ oneTime, monthly }` object."
  - "Attach add-on IDs to bundles as `addOnRecommendations[]` when relevant."
---

# 🔧 Lead Generation Add-Ons

_A la carte enhancements that bolt onto any tier. All items are modeled as standalone `.ts` data (no MDX) and can be attached to any ServicePackage._

---

## ⭐ Lead Magnet Creation Package
**ID (suggested):** `leadgen-lead-magnet`  
**Billing:** One-time  
**Price:** `{ oneTime: 3500 }`  
**Pairs Best With:** Essential, Professional  
**Popular:** ✅

**Deliverables:**
- 3 high-converting lead magnets (ebooks, guides, tools)  
- Landing page design and setup (conversion-optimized)  
- Email sequence automation (5–7 emails per magnet)  
- Performance tracking setup (conversion & engagement)

---

## Webinar Success Package
**ID (suggested):** `leadgen-webinar-success`  
**Billing:** One-time  
**Price:** `{ oneTime: 5500 }`  
**Pairs Best With:** Professional, Enterprise  

**Deliverables:**
- Complete webinar planning & setup (platform, registration, technical)  
- Promotional campaign design (multi-channel)  
- Registration and follow-up automation (attendee journey)  
- Post-event content creation (replay & nurture)

---

## Sales Funnel Optimization Audit
**ID (suggested):** `leadgen-audit-optimization`  
**Billing:** One-time  
**Price:** `{ oneTime: 2500 }`  
**Pairs Best With:** Essential, Professional, Enterprise  

**Deliverables:**
- End-to-end funnel analysis  
- CRO recommendations (prioritized)  
- A/B testing plan development  
- Implementation roadmap with timelines

---

## Advanced Attribution Modeling
**ID (suggested):** `leadgen-advanced-attribution`  
**Billing:** Hybrid  
**Price:** `{ oneTime: 6500, monthly: 2500 }`  
**Dependencies:** Access to all relevant marketing platforms  
**Pairs Best With:** Professional, Enterprise  

**Deliverables:**
- Multi-touch attribution setup  
- Advanced analytics & custom dashboards  
- Cross-channel lead tracking  
- Executive reporting

---

## ⭐ Account-Based Marketing (ABM) Add-On
**ID (suggested):** `leadgen-abm`  
**Billing:** Monthly  
**Price:** `{ monthly: 8500 }`  
**Dependencies:** Campaign costs billed separately  
**Pairs Best With:** Professional, Enterprise  
**Popular:** ✅

**Deliverables:**
- Target account identification & research  
- Personalized campaign development (account-specific)  
- Multi-channel ABM execution  
- Account-level tracking & attribution

---

## International Lead Generation
**ID (suggested):** `leadgen-international`  
**Billing:** Hybrid  
**Price:** `{ oneTime: 5500, monthly: 2500 }`  
**Dependencies:** `+ $2,500/month` per additional market  
**Pairs Best With:** Enterprise  

**Deliverables:**
- Market research & entry strategy  
- Localized campaign development (language & culture)  
- Regional compliance (e.g., GDPR)  
- Multi-language lead nurturing
