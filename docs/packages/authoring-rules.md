# Authoring Rules Guide

**File:** `docs/packages/authoring-rules.md`

# Package Authoring Rules

**Version:** 2.0.0  
**Last Updated:** January 2025

## Overview

This guide documents the **CI-enforced rules** for authoring package content. These rules ensure content quality, brand consistency, and prevent common errors that would break the UI.

All rules are automatically enforced by the build pipeline. Pull requests cannot merge if these rules are violated.

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Rule PRC001: Pricing Requires Tagline](#rule-prc001-pricing-requires-tagline)
- [Rule INC001: Includes XOR Table](#rule-inc001-includes-xor-table)
- [Rule CTA001: No Duplicate CTAs](#rule-cta001-no-duplicate-ctas)
- [Service Normalization](#service-normalization)
- [Authoring Workflow](#authoring-workflow)
- [Common Errors & Solutions](#common-errors--solutions)
- [Best Practices](#best-practices)

---

## Quick Reference

| Rule Code | What It Checks | Severity | When Enforced |
|-----------|----------------|----------|---------------|
| **PRC001** | Pricing requires tagline | Error | Pre-build + Build |
| **INC001** | Exactly one of includes OR includesTable | Error | Pre-build |
| **CTA001** | No duplicate CTAs (hero vs next-step) | Error | Pre-build |
| **SVC001** | Service must be recognized alias | Error | Build |
| **DRIFT001** | No display-only fields | Error | Build |
| **IMG001** | Image src required if image provided | Error | Build |

**Enforcement Layers:**

1. **Pre-build:** `npm run lint:author` - Fast content validation
2. **Build:** `npm run data:build` - Schema validation with Zod
3. **CI:** Automatic checks on every pull request

---

## Rule PRC001: Pricing Requires Tagline

### What This Rule Checks

**If a package has pricing (one-time or monthly), it MUST have a human-authored tagline.**

### Why This Rule Exists

- **Prevents invented copy**: Ensures taglines are intentionally authored, not auto-generated
- **Brand consistency**: Pricing messages are marketing-critical and must maintain brand voice
- **Quality control**: Forces authors to think about pricing positioning

### The Rule in Detail

```yaml
# ❌ INVALID: Has pricing but no tagline
detailsAndTrust:
  pricing:
    oneTime: 2500
    currency: USD
  priceBand:
    baseNote: proposal
    # Missing tagline!

# ✅ VALID: Pricing with tagline
detailsAndTrust:
  pricing:
    oneTime: 2500
    currency: USD
  priceBand:
    tagline: "Fixed-scope starter package"  # Required!
    baseNote: proposal
    finePrint: "Studio booking not included"
```

### How to Fix

Add a `tagline` field under `detailsAndTrust.priceBand`:

```yaml
detailsAndTrust:
  priceBand:
    tagline: "Your compelling pricing message here"
```

**Tagline Guidelines:**

- **Length:** 10-80 characters (shorter triggers warning)
- **Tone:** Professional, benefit-focused
- **Content:** Should clarify pricing model or value proposition
- **Examples:**
  - "Fixed-scope starter package"
  - "Simple monthly retainer"
  - "Pay-as-you-grow pricing"
  - "One-time investment, ongoing results"

### Error Messages

**Pre-build (author-lint):**

```
❌ [PRC001] details_and_trust.price_band.tagline
   Pricing present but priceBand.tagline is missing or empty.
   Authors must provide a tagline when the package has pricing.

   💡 Fix:
   Add a tagline in your MDX frontmatter:
     detailsAndTrust:
       priceBand:
         tagline: "Your compelling pricing message here"
```

**Build-time (Zod validation):**

```
PRC001: Pricing present but price_band.tagline is missing or empty.
Authors must provide a tagline when the package has pricing.
This is enforced to prevent invented copy and ensure brand consistency.
Path: details_and_trust.price_band.tagline
```

---

## Rule INC001: Includes XOR Table

### What This Rule Checks

**Packages must have EXACTLY ONE of:**

- `whatYouGet.includes` (bulleted groups), OR
- `whatYouGet.includesTable` (comparison table)

Not both. Not neither.

### Why This Rule Exists

- **UI consistency**: Components expect one format for rendering
- **Layout stability**: Both formats have different layouts that conflict
- **Performance**: Prevents duplicate data loading

### The Rule in Detail

```yaml
# ❌ INVALID: Both includes and includesTable
whatYouGet:
  includes:
    - title: Core Deliverables
      items: [...]
  includesTable:
    columns: [...]
    rows: [...]

# ❌ INVALID: Neither includes nor includesTable
whatYouGet:
  features: [...]
  # Missing includes or includesTable!

# ✅ VALID: Option A - Groups
whatYouGet:
  includes:
    - title: "Core Deliverables"
      items:
        - "Script (up to 90 seconds)"
        - "Storyboard"
        - "2D animation"
    - title: "Additional Services"
      items:
        - "Two revision rounds"
        - "Project management"

# ✅ VALID: Option B - Table
whatYouGet:
  includesTable:
    columns: ["Item", "Included", "Add-on"]
    rows:
      - ["Script", "Yes", "No"]
      - ["Voiceover", "No", "Yes ($500)"]
      - ["Music", "Stock", "Custom ($300)"]
```

### When to Use Each Format

**Use `includes` (groups) when:**

- Simple list of deliverables
- No need for comparison across dimensions
- Grouping by category (Core, Optional, Premium, etc.)
- Most packages should use this format

**Use `includesTable` (table) when:**

- Comparing across multiple options/tiers
- Showing what's included vs. add-on
- Complex feature matrices
- Pricing tier comparisons

### How to Fix

**If you have both:**

1. Choose the most appropriate format for your content
2. Remove the other format completely

**If you have neither:**

1. Add at least one format
2. Prefer `includes` for simplicity

### Error Messages

```
❌ [INC001] what_you_get
   Both `includes` and `includesTable` are provided.
   Choose ONE format: either groups (includes) OR table (includesTable).
   Remove the unused format from your MDX frontmatter.

   💡 Fix:
   Groups work best for simple lists, tables for comparisons.
```

---

## Rule CTA001: No Duplicate CTAs

### What This Rule Checks

**Call-to-action buttons in `hero.ctas` and `nextStep.ctas` must be distinct.**

Don't use the same CTA type in both locations.

### Why This Rule Exists

- **UX clarity**: Redundant buttons confuse users
- **Screen space**: Wastes valuable real estate
- **Conversion optimization**: Different sections serve different purposes

### The Rule in Detail

```yaml
# ❌ INVALID: Duplicate request_proposal
hero:
  ctas:
    requestProposal: true
    bookACall: false
nextStep:
  ctas:
    requestProposal: true  # Same as hero!
    details: false

# ✅ VALID: Distinct CTAs
hero:
  ctas:
    requestProposal: true  # Primary action
    bookACall: false
nextStep:
  ctas:
    bookACall: true  # Different from hero
    details: false
```

### Available CTA Types

**Primary Actions:**

- `requestProposal` - "Request Proposal" button
- `bookACall` - "Book a Call" button

**Secondary Actions:**

- `details` - "View Details" link

### Recommended Patterns

**Pattern 1: Proposal → Call**

```yaml
hero:
  ctas:
    requestProposal: true
nextStep:
  ctas:
    bookACall: true
```

**Pattern 2: Call → Proposal**

```yaml
hero:
  ctas:
    bookACall: true
nextStep:
  ctas:
    requestProposal: true
```

**Pattern 3: Details → Action**

```yaml
hero:
  ctas:
    details: true
nextStep:
  ctas:
    requestProposal: true
```

### How to Fix

Change one of the CTA sections to use a different button type.

### Error Messages

```
❌ [CTA001] hero.ctas & next_step.ctas
   Duplicate CTA(s) found: "request_proposal".
   Use distinct calls-to-action in hero vs next-step sections.

   💡 Fix:
   Example fix:
     hero:
       ctas:
         requestProposal: true
     nextStep:
       ctas:
         bookACall: true  # Different from hero
```

---

## Service Normalization

### Canonical Service Values

The system supports **six canonical service categories:**

| Canonical | Aliases Accepted |
|-----------|-----------------|
| `content` | content, content-production, content production |
| `leadgen` | leadgen, lead-generation, lead generation |
| `marketing` | marketing, marketing-services, marketing services |
| `seo` | seo, seo-services, search-engine-optimization |
| `video` | video, video-production, video production |
| `webdev` | webdev, web-development, web development |

### How It Works

Authors can use any alias in their MDX frontmatter:

```yaml
# All of these normalize to "seo"
service: SEO Services        → seo
service: seo-services        → seo
service: search engine optimization → seo
service: seo                 → seo

# All of these normalize to "leadgen"
service: lead generation     → leadgen
service: lead-generation     → leadgen
service: leadgen            → leadgen
```

### Normalization Rules

1. **Case insensitive**: "SEO" = "seo" = "Seo"
2. **Separator agnostic**: Spaces, hyphens, underscores all work
3. **Suffix removal**: "-services" and "-service" are stripped
4. **Keyword matching**: "video production" matches "video"

### Error Handling

If you use an unrecognized service:

```
Error: Unrecognized service: "consulting".
Must be one of: content, leadgen, marketing, seo, video, webdev
or their aliases (e.g., "seo services", "lead-generation", "content production").
```

**Fix:** Use one of the canonical values or recognized aliases.

---

## Authoring Workflow

### Step-by-Step Guide

#### 1. Create Package File

```bash
content/packages/catalog/<service>/<slug>/public.mdx
```

Example:

```bash
content/packages/catalog/video-production/explainer-video-starter/public.mdx
```

#### 2. Write Content

Use the MDX template structure:

```mdx
---
# Meta
id: video-explainer-starter
slug: explainer-starter
service: video production
name: Explainer Video Starter

# Hero
summary: Launch a simple explainer video in 2-3 weeks.

# Pricing (if applicable)
detailsAndTrust:
  pricing:
    oneTime: 2500
    currency: USD
  priceBand:
    tagline: "Fixed-scope starter package"  # Required!
    baseNote: proposal

# What You Get (choose ONE format)
whatYouGet:
  includes:
    - title: Core Deliverables
      items:
        - Script (up to 90 seconds)
        - Storyboard
        - 2D animation

# CTAs (make them distinct)
hero:
  ctas:
    requestProposal: true
nextStep:
  ctas:
    bookACall: true
---

## Purpose
Write your purpose section here...

## Overview
Write your overview here...
```

#### 3. Validate Locally

```bash
# Run author-lint (fast, pre-build validation)
npm run lint:author

# Run full build (includes schema validation)
npm run data:build

# Run complete pipeline
npm run data:all
```

#### 4. Fix Errors

If validation fails:

1. Check `src/data/packages/__generated__/author-lint-report.json`
2. Read error messages carefully
3. Fix issues in your MDX
4. Re-run `npm run lint:author`

#### 5. Commit & Push

```bash
git add content/packages/catalog/<service>/<slug>/
git commit -m "Add <package-name> package"
git push
```

#### 6. CI Validation

- Pull request triggers automatic validation
- Must pass all checks to merge
- Review CI artifacts if validation fails

---

## Common Errors & Solutions

### Error: "Pricing present but tagline missing"

**Cause:** Package has `pricing.oneTime` or `pricing.monthly` > 0, but no `priceBand.tagline`

**Solution:**

```yaml
detailsAndTrust:
  priceBand:
    tagline: "Add your pricing message here"
```

---

### Error: "Provide exactly one: includes OR includesTable"

**Cause:** Either both formats present, or neither present

**Solution:** Choose one format and remove the other (or add if missing)

```yaml
# Option A: Use groups
whatYouGet:
  includes:
    - title: Deliverables
      items: [...]

# Option B: Use table
whatYouGet:
  includesTable:
    columns: [...]
    rows: [...]
```

---

### Error: "Duplicate CTA labels"

**Cause:** Same CTA type in both `hero.ctas` and `nextStep.ctas`

**Solution:** Use different CTA types

```yaml
hero:
  ctas:
    requestProposal: true
nextStep:
  ctas:
    bookACall: true  # Different!
```

---

### Error: "Unrecognized service"

**Cause:** Service value doesn't match any canonical value or alias

**Solution:** Use one of: `content`, `leadgen`, `marketing`, `seo`, `video`, `webdev`

```yaml
service: seo  # or "seo services", "SEO", etc.
```

---

### Error: "meta.slug must be kebab-case"

**Cause:** Slug contains uppercase, spaces, or invalid characters

**Solution:**

```yaml
# ❌ Bad
slug: Explainer_Video Starter

# ✅ Good
slug: explainer-video-starter
```

---

### Warning: "Tagline is very short"

**Cause:** Tagline < 10 characters

**Solution:** Expand to 10-80 characters for clarity

```yaml
# ❌ Too short
tagline: "Fixed"

# ✅ Better
tagline: "Fixed-scope starter package"
```

---

## Best Practices

### Content Quality

**DO:**

- ✅ Write clear, benefit-focused summaries
- ✅ Use active voice
- ✅ Be specific about deliverables
- ✅ Include realistic timelines
- ✅ Set clear expectations

**DON'T:**

- ❌ Use vague language ("some", "various", "etc.")
- ❌ Make unrealistic promises
- ❌ Copy/paste from other packages without customization
- ❌ Leave placeholder text

### Pricing

**DO:**

- ✅ Always include a tagline for priced packages
- ✅ Be transparent about what's included
- ✅ Clarify if price is estimate vs. fixed
- ✅ List any additional fees upfront

**DON'T:**

- ❌ Hide costs in fine print
- ❌ Use misleading "starting at" without context
- ❌ Forget to mention recurring fees

### Includes/Deliverables

**DO:**

- ✅ Be specific ("Script up to 90 seconds", not "Script")
- ✅ Group logically
- ✅ Use consistent formatting
- ✅ Include revision policies

**DON'T:**

- ❌ List vague deliverables
- ❌ Mix includes and add-ons without clarity
- ❌ Forget important details

### CTAs

**DO:**

- ✅ Use action-oriented language
- ✅ Make primary action obvious
- ✅ Provide multiple paths (proposal, call, details)
- ✅ Test CTA flows

**DON'T:**

- ❌ Use generic "Click here"
- ❌ Duplicate CTAs in same view
- ❌ Overwhelm with too many options

---

## Getting Help

### Resources

- **Build Pipeline Docs:** `docs/packages/build-pipeline.md`
- **Schema Reference:** `src/packages/lib/package-schema.ts`
- **Example Packages:** `content/packages/catalog/`

### Validation Tools

```bash
# Quick validation
npm run lint:author

# Verbose output
npm run lint:author -- --verbose

# Strict mode (warnings as errors)
npm run lint:author -- --strict

# Full pipeline
npm run data:all
```

### Support Channels

- **Slack:** #packages-support
- **Email:** <packages-team@company.com>
- **Docs:** docs/packages/

---

## Changelog

### Version 2.0.0 (Current)

- Added PRC001: Pricing requires tagline
- Enhanced INC001: Includes XOR table validation
- Added CTA001: No duplicate CTAs
- Improved error messages with recommendations

### Version 1.0.0

- Initial authoring rules
- Basic validation framework
- Service normalization

---

**Questions?** Reach out to the packages team or check the build pipeline documentation.

---
