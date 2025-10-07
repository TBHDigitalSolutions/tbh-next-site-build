# Lead Generation — Information Architecture (Official)

**Purpose**  
This document defines the canonical 3-level taxonomy for Lead Generation and anchors folder paths, authoring, and package routing.

- **Level 1 (service):** `lead-generation` — *Complete lead acquisition and conversion solutions*
- **Level 2 (subservices):** Five core categories
- **Level 3 (subsubservices):** Service groupings under each category
- **Capabilities:** Specific deliverables/skills (not a taxonomy level). Model these as package types/tags and in package READMEs.

> This IA is aligned with the revised `services.json` block for Lead Generation and validated against the current directory trees.

---

## Level 1 — Service

- **Slug:** `lead-generation`
- **Hub route:** `/services/lead-generation-services`

---

## Level 2 — Subservices (Core Categories)

1. **strategy-planning** — Foundation strategy and channel optimization  
2. **conversion-optimization** — Landing pages, experimentation, CRO  
3. **lead-management-qualification** — Scoring, routing, nurturing  
4. **remarketing-retention** — Re-engagement & audience retargeting  
5. **event-experience-marketing** — Webinars, events, experiences

---

## Level 3 — Subsubservices (Groupings)

### strategy-planning

- `channel-planning` — Integrated channel approach, performance analysis, attribution
- `offer-strategy` — Lead magnets, content offers, incentives, competitive analysis

### conversion-optimization

- `landing-pages` — High-converting page creation, testing, mobile optimization
- `optimization` — Programmatic CRO, form optimization, UX testing
- `ab-testing` — A/B and multivariate testing, performance validation

### lead-management-qualification

- `lead-scoring` — Behavioral, demographic, engagement models
- `routing` — Distribution, sales assignment, territory routing
- `lead-nurturing` — Email nurtures, drips, automated follow-up

### remarketing-retention

- `remarketing-entry` — Pixel setup, audience segmentation, campaign initialization
- `retargeting-campaigns` — Display, social, and search retargeting programs

### event-experience-marketing

- `webinars-events` — Planning, promotion, registration ops
- `virtual-events` — Platform selection, hybrid formats, live streaming
- `trade-shows` — Strategy, booth design, lead capture systems

---

## Capabilities (Examples only; **not** a taxonomy level)

> Use these as package tags or README bullets under each Level-3 grouping.

**strategy-planning / channel-planning**

- `multi-channel-strategy`, `channel-performance-analysis`, `channel-attribution`

**strategy-planning / offer-strategy**

- `lead-magnets`, `content-offers`, `incentive-programs`, `competitive-offer-analysis`

**conversion-optimization / landing-pages**

- `landing-page-design`, `landing-page-testing`, `mobile-optimization`

**conversion-optimization / optimization**

- `conversion-rate-optimization`, `form-optimization`, `user-experience-testing`

**conversion-optimization / ab-testing**

- `split-testing`, `multivariate-testing`, `performance-testing`

**lead-management-qualification / lead-scoring**

- `behavioral-scoring`, `demographic-scoring`, `engagement-scoring`

**lead-management-qualification / routing**

- `lead-distribution`, `sales-assignment`, `territory-routing`

**lead-management-qualification / lead-nurturing**

- `email-nurturing`, `drip-campaigns`, `automated-follow-up`

**remarketing-retention / remarketing-entry**

- `pixel-implementation`, `audience-segmentation`, `campaign-setup`

**remarketing-retention / retargeting-campaigns**

- `display-retargeting`, `social-retargeting`, `search-retargeting`

**event-experience-marketing / webinars-events**

- `webinar-planning`, `event-promotion`, `registration-management`

**event-experience-marketing / virtual-events**

- `virtual-event-platforms`, `hybrid-events`, `live-streaming`

**event-experience-marketing / trade-shows**

- `trade-show-strategy`, `booth-design`, `lead-capture-systems`

---

## Authoring & Paths

- **Per-package folder:**  
  `docs/packages/catalog/lead-generation/{subservice}/{slug}/`
- **Optional leaf (L3) classification in frontmatter:**  
  `subsubservice: {one of L3 slugs above}`

**Routing templates**

- Service hub: `/services/lead-generation-services`
- Subservice hub: `/services/lead-generation-services/{subservice}`
- Leaf hub: `/services/lead-generation-services/{subservice}/{subsubservice}`
- Canonical package: `/packages/{slug}`
- Friendly package: `/packages/lead-generation/{subservice}/{slug}`

---

## QA Checklist

- L1 key = `services`, L2 array = `subservices`, L3 array = `subsubservices`
- All slugs are lower-kebab and match folder names
- Capabilities listed as tags (not additional folders under packages)
