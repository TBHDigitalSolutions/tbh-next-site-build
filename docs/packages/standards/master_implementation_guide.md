# Master External Package Documentation System
## Complete Implementation Guide

---

## System Architecture

### The Hybrid Model

Your package documentation system uses a **hybrid approach** that separates concerns:

1. **Narrative Content** (public.mdx)
   - Lives in: `docs/packages/catalog/<service>/<subservice>/<slug>/public.mdx`
   - Contains: Overview, Purpose, Notes, FAQ sections in natural language
   - Compiled to: `narrative.*Html` fields in generated JSON

2. **Structured Data** (external.json)
   - Lives in: `docs/packages/catalog/<service>/<subservice>/<slug>/external.json`
   - Contains: All structured fields (outcomes, includes, pricing, features, etc.)
   - Used by: Runtime UI components

3. **Internal Data** (internal.json - private)
   - Lives in: `docs/packages/catalog/<service>/<subservice>/<slug>/internal.json`
   - Contains: Tiers, margins, ops data, internal pricing
   - Never exposed to public

---

## Field Mapping Reference

### Phase 2: Why You Need This

| MDX Frontmatter | External JSON | Runtime Field | Notes |
|----------------|---------------|---------------|-------|
| `painPoints[]` | `why_you_need_this.pain_points[]` | `painPoints` | 3-5 customer problems |
| `icp` | `why_you_need_this.icp` | `icp` | One-sentence ICP |
| `outcomes[]` | `why_you_need_this.outcomes[]` | `outcomes` | 3-6 KPI bullets (use ↑ ↓) |
| `## Purpose` (MDX) | `why_you_need_this.purposeHtml` | `purposeHtml` | **Compiled from MDX** |

### Phase 3: What You Get

| MDX Frontmatter | External JSON | Runtime Field | Notes |
|----------------|---------------|---------------|-------|
| `features[]` | `what_you_get.highlights[]` | `features` | 5-8 top highlights |
| `includesGroups[]` | `what_you_get.includes[]` | `includes` | **PREFERRED** grouping |
| `includesTable` | `what_you_get.includesTable` | `includesTable` | **FALLBACK** table format |
| `deliverables[]` | `what_you_get.deliverables[]` | `deliverables` | Concrete outputs |

### Phase 4: Details & Trust

| MDX Frontmatter | External JSON | Runtime Field | Notes |
|----------------|---------------|---------------|-------|
| `price.oneTime` | `details_and_trust.pricing.oneTime` | `price.oneTime` | **Must be > 0 if present** |
| `price.monthly` | `details_and_trust.pricing.monthly` | `price.monthly` | **Must be > 0 if present** |
| `price.currency` | `details_and_trust.pricing.currency` | `price.currency` | Always "USD" |
| `priceBand.tagline` | `details_and_trust.price_band.tagline` | `priceBand.tagline` | **NOT auto-derived** |
| `priceBand.baseNote` | `details_and_trust.price_band.base_note` | `priceBand.baseNote` | "proposal" or "final" |
| `priceBand.finePrint` | `details_and_trust.price_band.fine_print` | `priceBand.finePrint` | Constraints/exclusions |
| `requirements[]` | `details_and_trust.requirements[]` | `requirements` | Client must provide |
| `timeline.*` | `details_and_trust.timeline.*` | `timeline` | setup/launch/ongoing |
| `ethics[]` | `details_and_trust.ethics[]` | `ethics` | Ethical guardrails |
| `limits[]` | `details_and_trust.limits[]` | `limits` | Scope boundaries |
| `notes` | `details_and_trust.notes` | `notes` | Additional context |

### Phase 5: Next Steps

| MDX Frontmatter | External JSON | Runtime Field | Notes |
|----------------|---------------|---------------|-------|
| `faqs[]` | `next_step.faqs[]` | `faqs` | Supports q/a or question/answer |
| `crossSell[]` | `next_step.cross_sell.related[]` | `relatedSlugs` | Related package slugs |
| `addOns[]` | `next_step.cross_sell.add_ons[]` | `addOnRecommendations` | Add-on slugs |

---

## Critical Rules & Validation

### MUST HAVE (Build will fail without these)

1. **Required Fields**
   - `id`, `slug`, `service`, `name`, `summary`
   - `outcomes[]` (minimum 3 items)
   - `price` with at least ONE of `oneTime` or `monthly` > 0
   - At least ONE of: `includesGroups` OR `includesTable`
   - `## Purpose` section in MDX body

2. **Pricing Validation**
   ```javascript
   // At least one must be > 0
   (price.oneTime > 0) || (price.monthly > 0)
   
   // Cannot both be 0
   ❌ { oneTime: 0, monthly: 0 }
   ❌ { oneTime: null, monthly: null }
   ✓ { oneTime: 3500, monthly: null }
   ✓ { oneTime: null, monthly: 1200 }
   ✓ { oneTime: 2000, monthly: 500 }
   ```

3. **YAML Quoting Rules**
   ```yaml
   # ❌ WRONG - will break YAML parsing
   alt: Logo sting: lower thirds, transitions
   
   # ✓ CORRECT - quoted because contains colon
   alt: "Logo sting: lower thirds, transitions"
   ```

### NEVER DO (Content violations)

1. **No Pricing in MDX Body**
   ```markdown
   ❌ This package starts at $3,500
   ❌ Monthly pricing from $1,200
   ❌ Investment: USD $2,400
   ✓ Two-week delivery window (no price mention)
   ```

2. **No Auto-Derived Taglines**
   ```yaml
   # ❌ WRONG - tagline is NOT the summary
   summary: "Fast landing page with analytics"
   priceBand:
     tagline: "Fast landing page with analytics"  # Don't copy!
   
   # ✓ CORRECT - unique, pricing-specific tagline
   summary: "Fast landing page with analytics"
   priceBand:
     tagline: "Own the page; iterate safely with CMS"  # Unique!
   ```

---

## File Organization

```
docs/packages/catalog/
└── {service}/
    └── {subservice}/              # Optional organizational layer
        └── {slug}/
            ├── public.mdx         # Narrative content (this file)
            ├── external.json      # Public structured data
            └── internal.json      # Private data (tiers, margins)

Example:
docs/packages/catalog/
└── content/
    └── production-publishing/
        ├── asset-packaging-kit/
        │   ├── public.mdx
        │   ├── external.json
        │   └── internal.json
        └── cms-migration-lite/
            ├── public.mdx
            ├── external.json
            └── internal.json
```

---

## Build Pipeline Flow

```
┌─────────────────┐
│  public.mdx     │  ← Author writes narrative
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MDX Compiler    │  ← Extracts ## Purpose, ## Overview, etc.
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ narrative.*Html │  ← Generated HTML content
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ external.json   │ ←─→ │ Merge & Validate│
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Generated JSON  │  ← Per-slug output
                        │ /api/packages/  │
                        │   {slug}.json   │
                        └─────────────────┘
```

---

## Common Patterns & Examples

### Pattern 1: Essential Service Package
```yaml
tier: "Essential"
price:
  oneTime: 2500
  monthly: 0
  currency: "USD"
priceBand:
  tagline: "Fixed scope, fixed price."
  baseNote: "final"
  finePrint: "Up to 100 URLs • 1 domain"
```

### Pattern 2: Recurring Retainer
```yaml
tier: "Standard"
price:
  oneTime: 0
  monthly: 2400
  currency: "USD"
priceBand:
  tagline: "Predictable monthly capacity."
  baseNote: "proposal"
  finePrint: "Month-to-month • 20 hours/month cap"
```

### Pattern 3: Hybrid Setup + Ongoing
```yaml
tier: "Professional"
price:
  oneTime: 3000
  monthly: 750
  currency: "USD"
priceBand:
  tagline: "Setup once, maintain monthly."
  baseNote: "final"
  finePrint: "3-month minimum commitment"
```

### Pattern 4: Custom/Enterprise
```yaml
tier: "Enterprise"
price:
  oneTime: null
  monthly: null
  currency: "USD"
priceBand:
  tagline: "Scoped to your requirements."
  baseNote: "proposal"
  finePrint: "Custom scope and pricing"
```

---

## FAQ Schema Flexibility

The system supports multiple FAQ formats:

```yaml
# Format 1: question/answer (preferred)
faqs:
  - id: "cms"
    question: "Which CMS is included?"
    answer: "Lightweight section-based editor."

# Format 2: q/a (alternative)
faqs:
  - id: "cms"
    q: "Which CMS is included?"
    a: "Lightweight section-based editor."

# Mixed (also valid)
faqs:
  - question: "Question one?"
    answer: "Answer one."
  - q: "Question two?"
    a: "Answer two."
```

---

## includesGroups vs includesTable

### Use includesGroups (PREFERRED)
When you want logical grouping and card-style UI:

```yaml
includesGroups:
  - title: "Strategy & Planning"
    items:
      - "Discovery workshop"
      - "Stakeholder alignment"
  - title: "Execution"
    items:
      - "Core deliverable one"
      - "Core deliverable two"
```

**Renders as**: Grouped cards or expandable sections

### Use includesTable (FALLBACK)
When you need side-by-side comparison:

```yaml
includesTable:
  caption: "Feature comparison"
  columns: ["Starter", "Pro"]
  rows:
    - ["Feature A", "✓", "✓"]
    - ["Feature B", "—", "✓"]
    - ["Feature C", "—", "✓"]
```

**Renders as**: Comparison table

**Rule**: Never use both in the same package.

---

## Cross-Sell & Add-Ons

### Field Name Aliases
The system supports multiple field names for compatibility:

```yaml
# Option 1 (external JSON style)
crossSell:
  - "related-package-one"
  - "related-package-two"
addOns:
  - "add-on-one"
  - "add-on-two"

# Option 2 (alternative style)
relatedSlugs:
  - "related-package-one"
  - "related-package-two"
addOnRecommendations:
  - "add-on-one"
  - "add-on-two"

# Option 3 (nested external JSON style)
cross_sell:
  related:
    - "related-package-one"
  add_ons:
    - "add-on-one"
```

All three formats are valid and normalized by the build.

---

## Validation Checklist

Before committing a new package:

- [ ] `slug` matches folder name exactly
- [ ] `id` follows format: `{service}-{slug}`
- [ ] At least ONE of `price.oneTime` or `price.monthly` > 0
- [ ] `includesGroups` OR `includesTable` is present (not both)
- [ ] `## Purpose` section exists in MDX body
- [ ] All YAML values with colons are quoted
- [ ] No pricing/currency in MDX body
- [ ] `priceBand.tagline` is unique (not copied from `summary`)
- [ ] `outcomes` has at least 3 items
- [ ] `image.alt` is descriptive and quoted if contains colons
- [ ] Tags are lowercase, kebab-case
- [ ] FAQs use consistent format (question/answer or q/a)

---

## Next Steps

1. **Copy the master template** to your package folder
2. **Fill in all required fields** following the rules above
3. **Write narrative sections** in MDX body (Overview, Purpose, Notes, FAQ)
4. **Validate** against the checklist
5. **Run build** to generate compiled JSON
6. **Test** in your local environment before deploying

---

## Support Resources

- **Schema Reference**: See `master_external_json` artifact
- **Template**: See `master_mdx_template` artifact
- **Examples**: Review the 20+ real examples in documents
- **Build Scripts**: Check your repo's `scripts/compile-packages.js`1: Hero Section

| MDX Frontmatter | External JSON | Runtime Field | Notes |
|----------------|---------------|---------------|-------|
| `summary` | `hero.summary` | `summary` | 1-2 sentence value prop |
| `description` | `hero.description` | `description` | 1-3 paragraphs (optional) |
| `image.src` | `hero.image.src` | `image.src` | Card/hero image path |
| `image.alt` | `hero.image.alt` | `image.alt` | **Quote if contains colons** |
| `seo.title` | `hero.seo.title` | `seo.title` | SEO title tag |
| `seo.description` | `hero.seo.description` | `seo.description` | Meta description |

### Phase 