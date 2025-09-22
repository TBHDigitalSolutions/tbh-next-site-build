---
title: "Marketing Services — Add-Ons Catalog"
domain: "packages"
main: "core-services-packages/marketing-services"
qualifier: "Add-Ons"
date: "2025-09-21"
status: "Draft"
owners: ["@conor"]
tags: ["marketing", "add-ons", "paid-media", "analytics", "martech"]
version: 1
service: "marketing"
pricingModel:
  canonical: ["oneTime", "monthly"]
  currency: "USD"
notes:
  - "Author prices with { oneTime?, monthly? } and add spend notes in copy if applicable."
---

# 🧩 Marketing Services Add-Ons

## Paid Media Enhancements
- **Creative Ad Pack** — 10 ad creatives with variations  
  **Price:** `{ oneTime: 2500 }`
- **Retargeting Expansion Pack** — Display + social retargeting  
  **Price:** `{ monthly: 1500 }` + ad spend
- **TikTok / Short Video Ad Pack** — 8 optimized short video ads  
  **Price:** `{ oneTime: 3500 }`

---

## Analytics & Reporting Upgrades
- **Custom Dashboard Build** — Looker Studio or Power BI  
  **Price:** `{ oneTime: 3000 }`
- **Advanced Attribution Model** — Multi-touch funnel attribution  
  **Price:** `{ oneTime: 4500 }`
- **Monthly Strategy Call** — Analyst reviews & optimization  
  **Price:** `{ monthly: 1200 }`

---

## Marketing Technology Services
- **Marketing Technology Audit** — Complete MarTech evaluation  
  **Price:** `{ oneTime: 4500 }`
- **Competitive Intelligence Package** — Comprehensive competitor analysis  
  **Price:** `{ oneTime: 3500 }`
- **Crisis Communications Package** — Crisis response & monitoring setup  
  **Price:** `{ oneTime: 6500 }`

---

## Accelerators & Specialized
- **Rapid Campaign Launch** — 2-week expedited deployment  
  **Price:** `+50%` of base package rate
- **International Marketing Expansion** — Market entry & localization  
  **Price:** `{ oneTime: 8500 } +  { monthly: 3500 } per additional market
- **Marketing Transformation Program** — 6-month overhaul  
  **Price:** `{ oneTime: 25000 }` (program fee)

> _Implementation note_: In data authoring, map any legacy `setup` to `oneTime`. Use `priceMeta.note` for “+ ad spend”.
