---

## Week 2: Documentation & Validation (Days 6-10)

### Day 6-7: Documentation Updates

**File:** `docs/packages/authoring-guide.md` (create if doesn't exist)

```markdown
# Package Authoring Guide

## CI-Enforced Rules

The build pipeline enforces three critical rules to ensure content quality:

### PRC001: Pricing Requires Tagline

**Rule:** If a package has pricing (`details_and_trust.pricing.one_time` or `monthly` > 0), it **must** have a human-authored `details_and_trust.price_band.tagline`.

**Why:** Prevents auto-generated or inconsistent pricing copy. Taglines are marketing-critical and must be intentionally authored.

**Example:**

```yaml
detailsAndTrust:
  pricing:
    oneTime: 2500
    currency: USD
  priceBand:
    tagline: "Fixed-scope starter package"  # ✅ REQUIRED
    baseNote: proposal
    finePrint: "Studio booking not included"
```

**CI Behavior:** Build fails with error code `PRC001` if tagline is missing.

---

### INC001: Includes XOR Table

**Rule:** Provide **exactly one** of:

- `what_you_get.includes` (bulleted groups), OR
- `what_you_get.includes_table` (comparison table)

Not both. Not neither.

**Why:** Ensures consistent UI rendering. Cards/detail pages expect one format.

**Example:**

```yaml
# ✅ Option A: Groups
whatYouGet:
  includes:
    - title: "Core Deliverables"
      items:
        - "Script (up to 90 seconds)"
        - "Storyboard"
        - "2D animation"

# ✅ Option B: Table
whatYouGet:
  includesTable:
    columns: ["Item", "Included", "Add-on"]
    rows:
      - ["Script", "Yes", "No"]
      - ["Voiceover", "No", "Yes ($500)"]

# ❌ INVALID: Both
whatYouGet:
  includes: [...]
  includesTable: {...}

# ❌ INVALID: Neither
whatYouGet: {}
```

**CI Behavior:** Build fails with error code `INC001` if validation fails.

---

### CTA001: No Duplicate CTAs

**Rule:** Don't use identical primary/secondary CTA labels in both `hero.ctas` and `next_step.ctas`.

**Why:** Redundant buttons confuse users. Hero CTAs should be action-oriented ("Request proposal"), while next-step CTAs can be informational ("Learn more").

**Example:**

```yaml
# ❌ INVALID: Duplicate
hero:
  ctas:
    requestProposal: true
nextStep:
  ctas:
    requestProposal: true  # Same as hero

# ✅ VALID: Distinct
hero:
  ctas:
    requestProposal: true
nextStep:
  ctas:
    bookACall: true
```

**CI Behavior:** Build fails with error code `CTA001` if labels duplicate.

---

## Workflow

1. **Author:** Edit `content/packages/catalog/<service>/<slug>/public.mdx`
2. **Build:** Run `npm run data:all` (includes `lint:author`)
3. **Fix:** If errors, see `src/data/packages/__generated__/author-lint-report.json`
4. **Commit:** Only commit when `lint:author` passes locally
5. **CI:** Pull requests auto-validate; must pass to merge

---

## Quick Reference

| Field | Required | Type | Validated By |
|-------|----------|------|--------------|
| `details_and_trust.price_band.tagline` | If pricing exists | string | PRC001 |
| `what_you_get.includes` XOR `includesTable` | Yes | array/object | INC001 |
| `hero.ctas` vs `next_step.ctas` | Distinct labels | object | CTA001 |

---

## Troubleshooting

**"PRC001 error"**
→ Add `priceBand.tagline` to your MDX frontmatter.

**"INC001 error"**
→ Choose either `includes` (groups) or `includesTable` (table). Remove the other.

**"CTA001 error"**
→ Use different CTA labels in hero vs next-step sections.

**"JSON Schema mismatch"**
→ Run `npm run schema:build` to regenerate from Zod source.

```

**File:** `docs/packages/build-pipeline.md`

```markdown
# Package Build Pipeline

## Architecture

```

MDX (SSOT)
    ↓
[author-lint] → PRC001/INC001/CTA001 validation
    ↓
[data:build] → parse → normalize → Zod validate → write JSON
    ↓
[derived] → cards.json, search index, routes.json
    ↓
[schema:build] → auto-generate JSON Schema from Zod
    ↓
[registry:sync] → update registry stubs

```

## Commands

```bash
# Full build (recommended)
npm run data:all

# Individual steps (for debugging)
npm run lint:author        # Fast content validation
npm run data:build         # Core build
npm run schema:build       # Generate JSON Schema
npm run data:validate      # Post-build validation

# CI build (includes tests)
npm run ci:build
```

## Outputs

All machine-generated files live in `src/data/packages/__generated__/`:

```
__generated__/
├── packages/              # One JSON per package (snake_case)
│   ├── explainer-video-starter.json
│   └── ...
├── cards.json             # Derived card props
├── routes.json            # Route lookups
├── search/
│   └── unified.search.json
├── schema/
│   └── package-data.schema.json  # AUTO-GENERATED from Zod
├── health.json            # Build warnings/errors
├── hashes.json            # Incremental build cache
└── author-lint-report.json  # Latest lint results
```

**Golden Rule:** Never edit files in `__generated__/` by hand. Always edit `public.mdx`.

## Schema Flow

```
Zod (SSOT)
  ↓
PackageSchema (src/packages/lib/package-schema.ts)
  ↓
[zod-to-json-schema] → package-data.schema.json
  ↓
Editor tooling (VS Code, etc.)
```

JSON Schema is **derived**, not hand-written. To update it:

1. Edit `package-schema.ts`
2. Run `npm run schema:build`
3. Commit both files

## Incremental Builds

The system supports fast rebuilds:

```bash
# Only rebuild changed packages
npm run data:build -- --changed

# Rebuild single package
npm run data:build -- --slug explainer-video-starter
```

Hashing handled automatically via `hashes.json`.

## Validation Layers

1. **Author-lint** (pre-build): Fast, CI-blocking checks
2. **Zod** (during build): Runtime contract enforcement
3. **Post-validate** (after build): Sanity checks on outputs

This triple-layer approach catches errors early and provides clear feedback.

```

**Success Criteria:**
- Authoring guide explains all three rules
- Build pipeline doc shows data flow
- Troubleshooting section covers common errors
- Quick reference tables for authors

---
