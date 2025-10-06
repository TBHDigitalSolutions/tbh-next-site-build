# Field Consistency Strategy: Single Source of Truth Architecture

You're identifying a real problem. A CSV won't solve this - you need **automated enforcement**, not documentation. Here's the plan:

---

## Core Problem

Manual documentation (CSV, wiki, etc.) **will drift**. The moment someone adds a field to a component without updating the CSV, you're out of sync. Documentation is useful for humans but useless for preventing bugs.

## Solution: Schema-Driven Development

**One source of truth** that generates everything else:

```
JSON Schema (master_external_json)
    ↓
    ├─→ Zod schemas (runtime validation)
    ├─→ TypeScript types (compile-time safety)
    ├─→ Documentation (auto-generated)
    └─→ Validation in scripts (enforced transformations)
```

---

## Implementation Plan

### Phase 1: Establish Single Source of Truth (Week 1)

#### 1.1 Convert JSON Schema to Zod

Create `src/packages/lib/schemas/package-schema.ts`:

```typescript
import { z } from "zod";

// Base types
const MoneySchema = z.object({
  oneTime: z.number().positive().optional().nullable(),
  monthly: z.number().positive().optional().nullable(),
  currency: z.literal("USD"),
}).refine(
  (data) => (data.oneTime ?? 0) > 0 || (data.monthly ?? 0) > 0,
  "At least one of oneTime or monthly must be > 0"
);

const PriceBandSchema = z.object({
  tagline: z.string().optional(),
  baseNote: z.enum(["proposal", "final"]).optional(),
  finePrint: z.string().optional(),
});

const ImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

// Main schema
export const PackageSchema = z.object({
  // Meta
  id: z.string().regex(/^[a-z]+-[a-z-]+$/),
  slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
  service: z.enum(["webdev", "seo", "marketing", "leadgen", "content", "video"]),
  subservice: z.string().optional(),
  category: z.string().optional(),
  name: z.string().min(1),
  tier: z.enum(["Essential", "Starter", "Standard", "Professional", "Pro", "Enterprise"]).optional(),
  badges: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Hero
  summary: z.string().min(1),
  description: z.string().optional(),
  image: ImageSchema.optional(),
  
  // Why (Phase 2)
  painPoints: z.array(z.string()).optional(),
  purposeHtml: z.string().optional(),
  icp: z.string().optional(),
  outcomes: z.array(z.string()).min(3),
  
  // What (Phase 3)
  features: z.array(z.union([
    z.string(),
    z.object({ label: z.string(), icon: z.string().optional() })
  ])).optional(),
  includes: z.array(z.object({
    title: z.string(),
    items: z.array(z.union([
      z.string(),
      z.object({ label: z.string(), note: z.string().optional() })
    ]))
  })),
  includesTable: z.object({
    caption: z.string().optional(),
    columns: z.array(z.union([
      z.string(),
      z.object({ id: z.string(), label: z.string() })
    ])),
    rows: z.array(z.union([
      z.array(z.union([z.string(), z.boolean()])),
      z.object({
        id: z.string(),
        label: z.string(),
        values: z.record(z.union([z.boolean(), z.string()]))
      })
    ]))
  }).optional(),
  deliverables: z.array(z.string()).optional(),
  
  // Details (Phase 4)
  price: MoneySchema,
  priceBand: PriceBandSchema.optional(),
  requirements: z.array(z.string()).optional(),
  timeline: z.object({
    setup: z.string().optional(),
    launch: z.string().optional(),
    ongoing: z.string().optional(),
  }).optional(),
  ethics: z.array(z.string()).optional(),
  limits: z.array(z.string()).optional(),
  notes: z.string().optional(),
  
  // Next (Phase 5)
  faqs: z.array(z.object({
    id: z.union([z.string(), z.number()]).optional(),
    q: z.string().optional(),
    a: z.string().optional(),
    question: z.string().optional(),
    answer: z.string().optional(),
  })).optional(),
  crossSell: z.array(z.string()).optional(),
  addOns: z.array(z.string()).optional(),
  relatedSlugs: z.array(z.string()).optional(),
  addOnRecommendations: z.array(z.string()).optional(),
  
  // SEO
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  
  // Copy overrides
  copy: z.object({
    phase1: z.object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    }).optional(),
    phase2: z.object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    }).optional(),
    phase3: z.object({
      title: z.string().optional(),
      tagline: z.string().optional(),
      includesTitle: z.string().optional(),
      includesSubtitle: z.string().optional(),
      highlightsTitle: z.string().optional(),
      highlightsTagline: z.string().optional(),
    }).optional(),
    phase4: z.object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    }).optional(),
    phase5: z.object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    }).optional(),
  }).optional(),
  
  // Narrative (compiled from MDX)
  narrative: z.object({
    overviewHtml: z.string().optional(),
    purposeHtml: z.string().optional(),
    notesHtml: z.string().optional(),
    faqHtml: z.string().optional(),
  }).optional(),
  
  // Extras
  extras: z.record(z.any()).optional(),
});

export type Package = z.infer<typeof PackageSchema>;

// Author-facing schema (more lenient)
export const PackageMarkdownSchema = PackageSchema.extend({
  // Allow either includes OR includesGroups in authoring
  includesGroups: z.array(z.object({
    title: z.string(),
    items: z.array(z.union([z.string(), z.object({ label: z.string(), note: z.string().optional() })]))
  })).optional(),
}).refine(
  (data) => data.includes || data.includesGroups || data.includesTable,
  "Must provide either 'includes', 'includesGroups', or 'includesTable'"
);

export type PackageMarkdown = z.infer<typeof PackageMarkdownSchema>;
```

#### 1.2 Generate TypeScript Types

Create `src/packages/lib/types/package.types.ts`:

```typescript
// Auto-generated from PackageSchema - DO NOT EDIT MANUALLY
import type { Package } from "../schemas/package-schema";

export type { Package };

// Utility types
export type PackageMeta = Pick<Package, "id" | "slug" | "service" | "name" | "tier" | "tags" | "badges">;
export type PackageHero = Pick<Package, "summary" | "description" | "image">;
export type PackagePrice = Required<Pick<Package, "price" | "priceBand">>;
export type PackageIncludes = NonNullable<Package["includes"]>;
export type PackageFAQ = NonNullable<Package["faqs"]>[number];
```

### Phase 2: Normalize Field Access (Week 1-2)

#### 2.1 Create Field Normalizer

Create `src/packages/lib/normalizers/package-normalizer.ts`:

```typescript
import type { PackageMarkdown, Package } from "../schemas/package-schema";

/**
 * Normalizes author-facing MDX frontmatter to runtime package shape
 * Handles field aliases and ensures consistent structure
 */
export function normalizePackage(input: PackageMarkdown): Package {
  // Normalize includes (handles includesGroups alias)
  const includes = input.includes || input.includesGroups || [];
  
  // Normalize FAQs (handles q/a vs question/answer)
  const faqs = (input.faqs || []).map(faq => ({
    id: faq.id,
    question: faq.question || faq.q,
    answer: faq.answer || faq.a,
  }));
  
  // Normalize cross-sell (handles multiple field names)
  const crossSell = input.crossSell || input.relatedSlugs || [];
  const addOns = input.addOns || input.addOnRecommendations || [];
  
  return {
    ...input,
    includes,
    faqs,
    crossSell,
    addOns,
    // Remove aliases
    includesGroups: undefined,
    relatedSlugs: undefined,
    addOnRecommendations: undefined,
  } as Package;
}
```

#### 2.2 Update Scripts to Use Normalizer

In `mirror-docs-to-registry.ts`:

```typescript
import { normalizePackage } from "@/packages/lib/normalizers/package-normalizer";
import { PackageMarkdownSchema, PackageSchema } from "@/packages/lib/schemas/package-schema";

// ... in main()
const front = PackageMarkdownSchema.parse(rawFront);
const normalized = normalizePackage(front);
const validated = PackageSchema.parse(normalized); // This will catch any issues
```

### Phase 3: Enforce in Components (Week 2)

#### 3.1 Create Typed Component Props

```typescript
// src/components/packages/types.ts
import type { Package, PackageIncludes, PackageFAQ } from "@/packages/lib/types/package.types";

export interface PackageDetailProps {
  package: Package;
}

export interface IncludesGroupsProps {
  includes: PackageIncludes;
}

export interface FAQListProps {
  faqs: PackageFAQ[];
}
```

#### 3.2 Add Runtime Checks in Dev

```typescript
// src/components/packages/PackageDetail.tsx
import { PackageSchema } from "@/packages/lib/schemas/package-schema";

export function PackageDetail({ package: pkg }: PackageDetailProps) {
  // In dev mode, validate props
  if (process.env.NODE_ENV === "development") {
    const result = PackageSchema.safeParse(pkg);
    if (!result.success) {
      console.error("PackageDetail received invalid package:", result.error);
    }
  }
  
  // ... component logic
}
```

### Phase 4: Automated Validation (Week 2-3)

#### 4.1 Pre-commit Hook

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate all public.mdx files before commit
npx tsx scripts/validate-packages.ts --staged
```

#### 4.2 Validation Script

Create `scripts/validate-packages.ts`:

```typescript
import fg from "fast-glob";
import matter from "gray-matter";
import { PackageMarkdownSchema } from "@/packages/lib/schemas/package-schema";

async function validateAll() {
  const files = await fg("docs/packages/catalog/**/public.mdx");
  let errors = 0;
  
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const { data } = matter(content);
    
    const result = PackageMarkdownSchema.safeParse(data);
    if (!result.success) {
      console.error(`\n❌ ${file}`);
      result.error.issues.forEach(issue => {
        console.error(`  ${issue.path.join(".")}: ${issue.message}`);
      });
      errors++;
    }
  }
  
  if (errors > 0) {
    console.error(`\n❌ ${errors} file(s) have validation errors`);
    process.exit(1);
  }
  
  console.log(`✅ All ${files.length} packages valid`);
}
```

#### 4.3 CI/CD Integration

`.github/workflows/validate-packages.yml`:

```yaml
name: Validate Packages
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run validate:packages
      - run: npm run type-check
```

### Phase 5: Documentation Generation (Week 3)

#### 5.1 Auto-generate Field Reference

Create `scripts/generate-field-docs.ts`:

```typescript
import { PackageSchema } from "@/packages/lib/schemas/package-schema";

// Extract schema to markdown table
function schemaToMarkdown(schema: ZodType) {
  // Walk the Zod schema and generate markdown
  // Output: docs/FIELD_REFERENCE.md
}
```

This generates a markdown table automatically from the Zod schema:

| Field Path | Type | Required | Description |
|------------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `price.oneTime` | number \| null | * | One-time fee (>0) |
| ... | ... | ... | ... |

#### 5.2 Component Field Usage Map

Create a script that scans components and documents which fields they use:

```typescript
// scripts/analyze-component-usage.ts
// Scans all components and generates usage matrix
```

Outputs `docs/COMPONENT_FIELD_USAGE.md`:

```markdown
## PackageDetail
Uses: id, slug, name, summary, description, image, price, priceBand, outcomes, includes

## PriceCard  
Uses: price, priceBand

## IncludesTable
Uses: includes OR includesTable
```

---

## Monitoring & Enforcement Checklist

### Daily (Automated)
- [ ] Pre-commit hooks validate all changed MDX files
- [ ] TypeScript compilation catches type mismatches
- [ ] CI validates entire catalog on every push

### Weekly
- [ ] Run `npm run validate:packages` locally
- [ ] Review any validation errors in logs
- [ ] Check for new TODO comments re: schema changes

### Monthly
- [ ] Regenerate field documentation
- [ ] Review component usage map for drift
- [ ] Update schemas if new requirements emerge

### On Schema Changes
- [ ] Update Zod schema first
- [ ] Regenerate TypeScript types
- [ ] Update normalizer if field aliases change
- [ ] Run full validation suite
- [ ] Update component prop types
- [ ] Regenerate documentation

---

## Anti-Patterns to Avoid

**DON'T:**
- ❌ Access fields with string literals: `pkg["someField"]`
- ❌ Create field aliases in components
- ❌ Bypass the normalizer in scripts
- ❌ Skip validation "just this once"
- ❌ Document fields in a separate CSV/wiki

**DO:**
- ✅ Use typed access: `pkg.someField`
- ✅ Normalize early (in scripts, before components)
- ✅ Validate at every boundary (MDX → script → component)
- ✅ Let the schema be the documentation
- ✅ Fail fast on schema violations

---

## Why This Works

1. **Single source of truth**: Zod schema drives everything
2. **Compile-time safety**: TypeScript catches field mismatches
3. **Runtime validation**: Scripts and components validate at boundaries
4. **Automated enforcement**: Pre-commit hooks and CI prevent bad data
5. **Self-documenting**: Generate docs from schema, not manual tracking

A CSV would be out of date within a week. This approach makes incorrect field usage **impossible to deploy**.