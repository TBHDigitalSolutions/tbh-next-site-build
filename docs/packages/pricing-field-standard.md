# Pricing Field Standard — **Eliminate Duplicate Price Fields &amp; Drift**

> **Goal:**  One canonical price in data; everything else is derived at render time.
> **Scope:**  All services (Content Production, Lead Generation, Marketing, SEO, Video Production, Web Development) and all components (cards, details, rails, blocks, API/JSON).

---

## 1) Policy (what’s allowed)

- **Single source of truth:**  Every package has exactly **one** price object on the data model:

  ```ts
  price: { oneTime?: number; monthly?: number; currency: "USD" }
  ```

- **No authored duplicates anywhere.**  Do **not** author:

  - `startingAt` (on cards)
  - `priceTeaser`, `packagePrice` (on detail pages)
  - Any other display-only price fields
- **Hybrid pricing (setup + monthly):**  Author as `{ oneTime: <setup>, monthly: <fee> }`.
  The UI will call `oneTime`  **“setup”**  only when a `monthly` value is also present.
- **Single-price packages:**

  - If only `monthly`, show monthly only.
  - If only `oneTime`, show one-time only (not labeled “setup”).
- **Internal tiers (optional):**  Keep tier ladders in `_internal.pricing.tiers` (not rendered). Public `price` uses the **Starter** tier.

---

## 2) The Rule in Plain English (How the Renderer Labels)

- **Both** **`monthly`** **and** **`oneTime`** **present?**
  →  **“Starting at** **$<monthly>/mo + $** **&lt;oneTime&gt; setup”**
  (In this case, `oneTime` is treated as the **setup fee**.)
- **Only** **`monthly`** **present?**
  →  **“Starting at $&lt;monthly&gt;/mo”**
- **Only** **`oneTime`** **present?**
  →  **“Starting at $&lt;oneTime&gt; one-time”**

---

### Examples (taken directly from your packages)

#### SEO Services (monthly only)

- **Featured Snippet AI Optimization** — `{ monthly: 2500 }` → “Starting at  **$2,500/mo**”
- **Advanced LLM Positioning** — `{ monthly: 4500 }` → “Starting at  **$4,500/mo**”
- **Enterprise LLM Strategy** — `{ monthly: 8500 }` → “Starting at  **$8,500/mo**”

#### Web Development (hybrid: monthly + oneTime)

- **Website Essentials** — `{ oneTime: 8500, monthly: 500 }`
  → “Starting at **$500/mo + $****8,500 setup**”
- **Business Growth Website** — `{ oneTime: 18000, monthly: 1200 }`
  → “Starting at **$1,200/mo + $****18,000 setup**”
- **Enterprise Web Solutions** — `{ oneTime: 45000, monthly: 3500 }`
  → “Starting at **$3,500/mo + $****45,000 setup**”

#### Video Production (one-time only)

- **Corporate Video Package** — `{ oneTime: 6500 }` → “Starting at  **$6,500 one-time**”
- **Brand Film Production** — `{ oneTime: 12500 }` → “Starting at  **$12,500 one-time**”
- **Event Coverage Package** — `{ oneTime: 4500 }` → “Starting at  **$4,500 one-time**”
- **Training Video System** — `{ monthly: 7500 }` → “Starting at  **$7,500/mo**”

---

## Why We Do It This Way (and Why It Fixes Drift)

- You author **one canonical price object**:

  ```ts
  price: { monthly?: number; oneTime?: number; currency: "USD" }
  ```

- The UI **derives the label** from this object. There are **no duplicate fields** like `startingAt`, `priceTeaser`, or `packagePrice` to keep in sync.
- If you maintain internal tiers, the **public price is always the Starter tier**, but still rendered from the same object.
- **Rule of thumb:**
  *Store the upfront/implementation fee in* *`oneTime`* *. The renderer will call it “setup” only when there’s also a* *`monthly`* *value present.*

---

## 3) Canonical data model (TypeScript)

```ts
// src/data/packages/_types/packages.types.ts
export type Money = { oneTime?: number; monthly?: number; currency: "USD" };

export type ServicePackage = {
  id: string;              // kebab-case
  service: string;         // e.g., "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev"
  name: string;
  summary?: string;
  tags?: string[];
  badges?: string[];
  price: Money;            // ← Only source of truth for public price

  // ...other public fields (includes, outcomes, faq, content, etc.)

  _internal?: {
    pricing?: {
      tiers: Array<{
        name: "Starter" | "Professional" | "Enterprise" | string;
        price: Money;
        note?: string;
      }>;
    };
    notes?: string;
  };
};
```

> **Do not** add `startingAt`, `priceTeaser`, or `packagePrice` to any public types. Those are computed during render.

---

## 4) Rendering helpers (one place, used everywhere)

```ts
// src/packages/lib/pricing.ts
import type { Money } from "@/data/packages/_types/packages.types";

export function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function startingAtLabel(price: Money): string {
  const { monthly, oneTime } = price;
  if (monthly && oneTime) return `Starting at $${formatCurrency(monthly)}/mo + $${formatCurrency(oneTime)} setup`;
  if (monthly)            return `Starting at $${formatCurrency(monthly)}/mo`;
  if (oneTime)            return `Starting at $${formatCurrency(oneTime)} one-time`;
  return ""; // or throw if you require at least one field
}
```

- **Cards** show `startingAtLabel(pkg.price)`.
- **Detail pages** show the same label near the header and pass `pkg.price` to any price block component.

---

## 5) Component props (simplified)

### 5.1 Card props (no authored startingAt)

```ts
// src/packages/components/PackageCard/PackageCard.ts
export type PackageCardProps = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  service: string;
  tags?: string[];
  badge?: string;
  image?: { src: string; alt?: string };
  price: Money; // ← provide only this
  href: string;

  // CTAs are label+href only; text should be standardized elsewhere
  primaryCta?: { label: string; href: string };   // e.g., "View details"
  secondaryCta?: { label: string; href: string }; // e.g., "Book a call"
};
```

**Usage**

```ts
import { startingAtLabel } from "@/packages/lib/pricing";

function PackageCard({ name, price, ...rest }: PackageCardProps) {
  const label = startingAtLabel(price);
  // render label; never store it on the data
}
```

### 5.2 Detail Overview props (no authored teaser/packagePrice)

```ts
// src/packages/sections/PackageDetailOverview/index.ts
export type PackageDetailOverviewProps = {
  id: string;
  title: string;
  service: string;
  tags?: string[];
  valueProp?: string;
  price: Money; // ← provide only this
  ctaPrimary?: { label: string; href: string };   // "Request proposal"
  ctaSecondary?: { label: string; href: string }; // "Book a call"
  // ...includesTable, outcomes, notes, etc.
};
```

**Usage**

```ts
import { startingAtLabel } from "@/packages/lib/pricing";

function PackageDetailOverview({ price, ...rest }: PackageDetailOverviewProps) {
  const label = startingAtLabel(price);
  // render label near headline + use price for any price blocks
}
```

---

## 6) Authoring in Markdown (human-facing, internal)

- **Rule:**  Author one canonical price block per package using the same shape.
- **If hybrid:**  write “oneTime” for setup and “monthly” for recurring.

**Per-package MD (internal)**

```md
## Website Essentials Package

**Public price (Starter):**
‍```json
{ "oneTime": 8500, "monthly": 500, "currency": "USD" }
```

**Internal tiers (not public):**

- Professional: { "oneTime": 18000, "monthly": 1200, "currency": "USD" }
- Enterprise:   { "oneTime": 45000, "monthly": 3500, "currency": "USD" }

**Quoting notes:**  Enterprise if custom integrations or dedicated team.

```

> A tiny build script can parse these blocks to verify they match the TS objects (see §8).

---

## 7) Authoring in JSON (APIs, seeds, or headless CMS)

**Package JSON**
‍```json
{
  "id": "webdev-website-essentials",
  "service": "webdev",
  "name": "Website Essentials",
  "summary": "Professional web presence with core features.",
  "price": { "oneTime": 8500, "monthly": 500, "currency": "USD" },
  "tags": ["webdev", "essentials"],
  "_internal": {
    "pricing": {
      "tiers": [
        { "name": "Starter",      "price": { "oneTime": 8500, "monthly": 500,  "currency": "USD" } },
        { "name": "Professional", "price": { "oneTime": 18000,"monthly": 1200, "currency": "USD" } },
        { "name": "Enterprise",   "price": { "oneTime": 45000,"monthly": 3500, "currency": "USD" } }
      ]
    }
  }
}
```

---

## 8) Validation (Zod schema + CI checks)

```ts
// scripts/validate-packages.ts
import { z } from "zod";

const Money = z.object({
  oneTime: z.number().int().positive().optional(),
  monthly: z.number().int().positive().optional(),
  currency: z.literal("USD")
}).refine(m => m.oneTime || m.monthly, "At least one of oneTime or monthly must be present.");

const ServicePackage = z.object({
  id: z.string().min(1),
  service: z.enum(["content","leadgen","marketing","seo","video","webdev"]),
  name: z.string().min(1),
  price: Money,
  _internal: z.object({
    pricing: z.object({
      tiers: z.array(z.object({
        name: z.string(),
        price: Money,
        note: z.string().optional()
      }))
    }).optional()
  }).optional()
});

export function validatePackage(pkg: unknown) {
  return ServicePackage.parse(pkg);
}
```

**CI rules**

- Fail build if a package lacks `price.currency === "USD"`.
- Fail if `startingAt`, `priceTeaser`, `packagePrice` appear anywhere in data/props.
- Optional: Parse MD JSON blocks and assert equality with TS/JSON data.

---

## 9) Migration notes (1 hour clean-up, typically)

1. **Remove** `startingAt` from all cards.
2. **Remove** `priceTeaser` and `packagePrice` from all details.
3. **Add** `price: Money` to both card/detail props if missing and **plumb** through.
4. Replace any ad-hoc price strings with `startingAtLabel(price)`.
5. Keep any tier ladders in `_internal.pricing.tiers` only.

---

## 10) Quick reference (copy/paste)

**Type**

```ts
export type Money = { oneTime?: number; monthly?: number; currency: "USD" };
```

**Data**

```ts
price: { oneTime?: number; monthly?: number; currency: "USD" } // only source
```

**Render**

```ts
startingAtLabel(price) // computes "Starting at …" variants
```

**Do**

- Author once in data; derive everywhere.
- Map setup → `oneTime` whenever a monthly exists.

**Don’t**

- Don’t author `startingAt`, `priceTeaser`, or `packagePrice`.
- Don’t label `oneTime` as “setup” when there is **no** monthly.

---

### That’s it

With one canonical `price` and a single renderer, every surface stays consistent—cards, details, rails, JSON feeds, and internal MD—no drift, no desync.
