## `src/packages/registry/lead-routing-distribution/README.md`

# 📦 Lead Routing & Distribution — Registry Author Notes

## Public Package (canonical)

**ID:** `leadgen-routing-distribution`  
**Slug:** `lead-routing-distribution`  
**Service:** `leadgen`  
**Category:** `Routing & Assignment`  
**Tags:** `routing`, `assignment`, `automation`  

**Tier (cosmetic):** Essential  
**Badge (optional):** —  

**Price (Money; ONLY source of truth):**

```json
{ "oneTime": 2500, "monthly": 1000, "currency": "USD" }
````

### Super Card copy (used by `details.ts`)

**Title:** Lead Routing & Distribution

**Value Prop (1–2 sentences):**
Automated lead routing and assignment so reps get the right leads, faster. Standardized rules and telemetry keep distribution fair and performance visible.

**ICP (who it's for):**
Small–mid sales teams that need territory/skill-based assignment without custom engineering.

**Outcomes (4–6 KPI-style bullets):**

* Faster speed-to-lead and first-touch
* Fair distribution across reps/teams
* Higher connect and qualification rates
* Consistent routing visibility in the CRM

### What’s Included (grouped; becomes `includesTable.sections`)

**Group A — Distribution & Assignment**

* Territory-based distribution
* Round-robin assignment
* Basic assignment rules (status, source, capacity)

**Group B — Reporting & Telemetry**

* Monthly performance reporting
* Routing event logs to CRM (owner change, queue, rule hit)
* Basic dashboards for volume and SLA

**Group C — Scope & Connectivity**

* Initial setup for **one** CRM (HubSpot/Salesforce)
* **One** primary territory model included
* Admin training (playbook + handoff)

### Pinned Card highlights (top 5; reused from card)

* Territory-based distribution
* Round-robin assignment
* Basic assignment rules
* Monthly performance reporting
* CRM-ready routing events

### Notes (rendered under table)

**Notes / Guardrails:**
Routing logic follows declared territory and assignment rules; complex AI-based optimization and custom integrations are out-of-scope for the Essential tier.

**Timeline:**
Setup **3–5 business days** → pilot validation with sample leads → go-live. Ongoing: monthly performance review & rule tweaks.

---

## Image (optional)

**src:** `/packages/lead-generation/lead-routing-distribution-card.png`
**alt:** `Lead routing assignment previews`

## CTAs (policy reference)

* **Cards:** “View details” → `/packages/lead-routing-distribution`; “Book a call” → `/book`
* **Detail CTA band:** “Request proposal” → `/contact`; “Book a call” → `/book`

---

## 🔒 Internal Tiers (not rendered; for Sales/quoting)

> Public price shows **Starter** only. Use these for quotes.

### Essential Routing System (Starter)

**Price:** `{ oneTime: 2500, monthly: 1000, currency: "USD" }`
**Includes:** Distribution & Assignment (A1–A3), Reporting & Telemetry (B1–B2), Scope & Connectivity (C1–C3)

### Professional Distribution Platform (Professional)

**Price:** `{ oneTime: 4500, monthly: 2000, currency: "USD" }`
**Adds/Changes:**

* Advanced routing algorithms (weighted, overflow queues)
* Skill-based assignment; load balancing
* Expanded dashboards (conversion by rule/owner)

### Enterprise Routing Intelligence (Enterprise)

**Price:** `{ oneTime: 8500, monthly: 3500, currency: "USD" }`
**Adds/Changes:**

* AI-assisted assignment & dynamic optimization
* Multi-criteria rules (capacity, intent, region, product)
* Advanced analytics + dedicated routing specialist
* Custom integration development

**Quoting Notes:**

* “Pro” if >2 territories or >3 skill rules.
* “Enterprise” if AI optimization or custom integrations are required.
* Discounts: Sales ≤10%; 10–20% Manager; >20% Director.
* Effective: 2025-01-01 • Review: 2025-06-01.

---

### How `details.ts` maps from this README

* `title` → **Title**  
* `valueProp` → **Value Prop**  
* `icp` → **ICP**  
* `service` / `tags` → **Service/Tags**  
* `price` → **Price (Money)**  
* `outcomes` → **Outcomes** bullets  
* `includesTable.sections` → **What’s Included** groups (A/B/C)  
* `notes` → **Notes / Guardrails** + **Timeline** (two paragraphs)

Everything needed by `PackageDetailOverview` is now present in one place; `card.ts` simply reuses the top-5 **Pinned Card highlights** (and the same `price`).

---

### Notes

* No `startingAt`/`priceTeaser`/`packagePrice` anywhere — **only** `price`.
* Card features are derived from the first two include groups to match your “top 5” list.
* Detail page uses `sectionCtas()` (Request proposal / Book a call); the pinned card uses the same card data with `variant: "rail"`.

Want me to add this to a `registry/index.ts` with lookups (`PACKAGE_CARDS`, `PACKAGE_DETAILS`) so your page can import from one place?
