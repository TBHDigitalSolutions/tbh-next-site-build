### `src/packages/lib/types/readme.md`

# `@/packages/lib/types` — UI Type Barrel

Lightweight, framework-agnostic **types** used by UI surfaces (cards, detail pages, price band).
No React, no DOM, no CSS — just TypeScript types and a small compatibility shim.

## Files

- **`pricing.ts`**
  - Re-exports the canonical pricing **types** (`Money`, `CurrencyCode`, …) and, for compatibility during migration, also re-exports the pure helpers from `../pricing`:
    - `formatMoney`, `startingAtLabel`, `srPriceSentence`
    - Predicates: `hasPrice`, `hasMonthly`, `hasOneTime`, `isHybrid`, `isMonthlyOnly`, `isOneTimeOnly`
  - Extra UI-only types:
    - `PriceNote`, `PriceRange`

- **`band.ts`**
  - Presentation-only types for the Price Actions Band:
    - `BandContext`, `BandVariant`
    - `BaseNoteKind`
    - `PriceBandCopyInput` (authoring copy passed into detail band)
    - `PriceBandCopyResolved` (display strings after policy mapping)
    - `PriceBandProps` (minimal band prop payload)

- **`index.ts`**
  - Barrel export so callers can do:

    ```ts
    import { Money, BandVariant } from "@/packages/lib/types";
    ```

## Import Guidance

- **Preferred for helpers (new code):**

  ```ts
  // Helpers + predicates live here
  import { startingAtLabel, formatMoney, isHybrid, type Money } from "@/packages/lib/pricing";
````

* **Types (general use):**

  ```ts
  import type { Money, BandVariant, PriceRange } from "@/packages/lib/types";
  ```

* **Compatibility (existing code):**
  If you still import helpers from the `types` barrel, it will continue to work:

  ```ts
  import { startingAtLabel } from "@/packages/lib/types"; // compat re-export
  ```

  Prefer migrating to `@/packages/lib/pricing` for helpers as you touch files.

---

## Do / Don’t

**Do**

* Import **types** from `@/packages/lib/types`.
* Import **helpers** from `@/packages/lib/pricing`.
* Keep this folder free of UI/runtime dependencies.

**Don’t**

* Add business logic here (formatting/policy belong in `../pricing` or `../band`).
* Import React/Next/UI modules — this must stay SSR/RSC-safe.

## Related Modules

* `@/packages/lib/pricing` — canonical helpers (formatting, predicates, normalization).
* `@/packages/lib/band` — policy utilities for band variant + base-note resolution.
* `@/packages/lib/copy` — centralized labels (`CTA`, base-note text, price badge).



If you want, I can also add a tiny unit test scaffold (`types/index.test.ts`) to verify the barrel exports don’t drift.
::contentReference[oaicite:0]{index=0}

