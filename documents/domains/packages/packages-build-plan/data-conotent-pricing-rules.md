````markdown
# Packages Domain — Data & Pricing Rules
**File Name:** data-conotent-pricing-rules.md  
**Main Part:** Packages-Build-Plan  
**Qualifier:** Data+Pricing Rules (Authoring, Build, Rendering)  
**Date:** 2025-09-21  
**Spotlight Comments:** Canonicalize pricing across one-time, setup+monthly, and monthly-only; normalize legacy fields; define UI rendering, JSON-LD, and build-time validation.  
**Summary:** This spec defines the single price model used across bundles, service packages, and add-ons; shows how to author data; how scripts normalize/validate it; and how UI components/adapters must render it safely (including when price is absent).

---

## 0) Scope
Applies to **all package-like objects** in `/src/data/packages/**`:
- **Bundles** (cross-service solutions),  
- **Service Packages** (per service tiers),  
- **Add-ons** (a-la-carte enhancements).

Covers data authoring, normalization (“setup → oneTime”), optional metadata, display rules, JSON-LD, and acceptance checks.

---

## 1) Canonical Price Model (SSOT)

```ts
export type Money = {
  /** One-time charge (AKA setup/project). Example: 4500 */
  oneTime?: number;
  /** Recurring monthly charge (retainer). Example: 2500 */
  monthly?: number;
  /** ISO currency; default "USD" */
  currency?: "USD";
};

export type PriceMeta = {
  /** Short note near price: "+ ad spend", "starting at", etc. (<= 40 chars) */
  note?: string;
  /** Minimum term in months (e.g., 3, 6, 12) */
  minTermMonths?: number;
  /** If setup is waived after N months (display hint only) */
  setupWaivedAfterMonths?: number;
  /** Optional internal discount percent (not auto-applied in UI) */
  discountPercent?: number;
};
````

### Supported shapes (examples)

* **One-time project:** `{ price: { oneTime: 8500 } }`
* **Monthly only:** `{ price: { monthly: 3500 } }`
* **Setup + monthly:** `{ price: { oneTime: 5000, monthly: 2500 } }`
* **Project + maintenance:** `{ price: { oneTime: 18000, monthly: 1200 } }`
* **Custom pricing:** `price` omitted → UI shows “Custom pricing”.

> 🚫 Do **not** author `price.setup`. Legacy `setup` is mapped to `oneTime` at build.

---

## 2) Authoring Rules (TS first; JSON allowed)

* Prefer **typed TS** sources in service folders and `bundles/`.
* JSON catalogs are acceptable; the **build normalizes** them.
* Keep `currency` omitted unless not USD.
* Keep price **numbers** unformatted (no `$`, commas).

### Where to put prices

* **Service Packages / Add-ons:** inside each item as `price?: Money`, optional `priceMeta`.
* **Bundles:** high-level `price?: Money` is optional; many bundles are composite and may omit price.

---

## 3) Legacy Normalization (build-time)

To tolerate older data (`setup`) the build maps fields:

```ts
function normalizePrice(input: any): Money | undefined {
  if (!input) return undefined;
  const oneTime = input.oneTime ?? input.setup ?? undefined;
  const monthly = input.monthly ?? undefined;
  const currency = input.currency ?? "USD";
  if (oneTime == null && monthly == null) return undefined;
  return { oneTime, monthly, currency };
}
```

* All sources must pass through normalization before being written to:

  * `__generated__/bundles.enriched.json`
  * `__generated__/packages.search.json`

---

## 4) Display Rules (UI components)

### 4.1 Cards (`PackageCard`)

* Accepts `price?: Money` (optional, **null-safe**).
* Chip logic:

  * `oneTime` → **Setup \$X,XXX**
  * `monthly` → **\$X,XXX/mo**
  * both → show both chips
  * neither → **Custom pricing**
* Badges: display when present (e.g., “Most Popular”).

### 4.2 Price Block (`PriceBlock`)

* Show present lines only (one or both).
* Render `priceMeta.note` inline (e.g., “+ ad spend”).
* If `minTermMonths` present → show “3-month minimum”.
* If `setupWaivedAfterMonths` present → small helper text (“Setup waived after 6 months”).

### 4.3 Currency & formatting

* Use `Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 })`.
* Fallback `$${n}` if formatter fails.

---

## 5) JSON-LD Rules (SEO)

* On **bundle detail** pages, emit `Service` JSON-LD via adapter:

  * If `price.monthly` → add `Offer` with `price` = monthly.
  * If `price.oneTime` → add second `Offer` with `price` = oneTime.
  * If **neither** → **omit** `offers` completely.
  * Always provide `priceCurrency` (default `"USD"`).
* Hub can emit `ItemList` of bundles (optional).

> We already patched adapters to **omit offers** when price is absent and avoid crashes.

---

## 6) Validation Rules (build)

**Schema checks**

* `Money` only has `oneTime?`, `monthly?`, `currency?`.
* Values are positive integers (or at least non-negative integers); reject non-numeric strings.
* `currency` in supported set (currently `"USD"`).

**Consistency checks**

* No usage of `price.setup` in generated outputs (only allowed in inputs pre-normalization).
* Warn if:

  * price present but `currency` missing (will default to `"USD"`).
  * bundle has no price **and** no components (likely incomplete).
  * note exceeds 40 chars.

---

## 7) Authoring Examples (good vs. needs-normalization)

**✅ Good (TS)**

```ts
price: { oneTime: 4500, monthly: 1500 }         // hybrid
price: { monthly: 2500 }                        // retainer
price: { oneTime: 6500 }, priceMeta: { note: "starting at" }
```

**🛠 Needs build mapping (JSON)**

```json
{ "price": { "setup": 3500, "currency": "USD" } }   // → oneTime: 3500
```

---

## 8) Edge Cases & How to Render

| Case                           | Data Example                                      | UI Behavior                 | JSON-LD                 |
| ------------------------------ | ------------------------------------------------- | --------------------------- | ----------------------- |
| Custom/enterprise pricing      | `price` omitted                                   | Chip “Custom pricing”       | Omit `offers`           |
| Ad spend billed separately     | `price.monthly`, `priceMeta.note="+ ad spend"`    | Show note near monthly      | No change               |
| Setup waived after N months    | `oneTime`, `monthly`, `setupWaivedAfterMonths: 6` | Small helper copy           | Two offers still fine   |
| Annual option shown in UI only | Keep monthly; compute yearly in UI for toggle     | `$X/mo` ↔ `$Y/yr`           | Add yearly only if sold |
| Ranged/“starting at”           | Use fixed low price + `note: "starting at"`       | Display “starting at” label | Use fixed price value   |

---

## 9) Where Pricing Lives (by type)

* **Service Packages/Add-ons:** Almost always priced; include `price` on each item.
* **Bundles:** May be priced (show chips) **or** unpriced to steer discovery → add-ons/packages supply detail in the page.

---

## 10) Analytics

* Keep `category: "packages"`.
* Track:

  * Card primary/secondary CTA clicks.
  * Price toggle interactions (if you add annual toggle later).
  * Filter/search usage on hub.

---

## 11) Acceptance Criteria

* **Authoring:** No `setup` fields in TS; JSON inputs may include `setup` but are normalized.
* **Build:** Outputs contain only `{ oneTime?, monthly?, currency }`.
* **UI:**

  * Cards and PriceBlock render correctly with any of: one-time only, monthly only, both, or none.
  * “Custom pricing” appears when price missing.
  * Currency formatting is correct; no crashes.
* **SEO:** Detail pages emit valid `Service` JSON-LD; offers included only when price exists.

---

## 12) Quick Checklist (PR Review)

* [ ] Used canonical `Money` in all new/edited items.
* [ ] If legacy JSON edited, `setup` appears only in **inputs** (pre-build), never in generated artifacts.
* [ ] `priceMeta.note` ≤ 40 chars, concise (e.g., “+ ad spend”).
* [ ] Currency omitted (defaults to `"USD"`) unless non-USD.
* [ ] Screenshots verify chips: Setup / Monthly / Custom.
* [ ] No runtime errors in hub/detail pages with mixed pricing shapes.

---

```
```
