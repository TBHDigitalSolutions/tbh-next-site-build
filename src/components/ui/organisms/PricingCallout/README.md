## PricingCallout Component: Why & Where

### 🎯 **Why PricingCallout Was Created**

**Problem**: Your Level 3 (SubService) pages need pricing information, but full pricing tables are **too heavy** and violate your pricing rules by level.

**Solution**: A lightweight pricing "callout" that shows simple pricing status without complex tier comparisons.

### 📍 **Where to Implement**

**Location**: Level 3 SubService pages only
- Route: `/services/[hub]/[service]/[sub]/page.tsx` 
- Template: `SubServiceTemplate.tsx`
- Position: After "Scope & Deliverables" section

**Example URLs**:
- `/services/marketing/marketing-automation/lead-scoring`
- `/services/seo/technical-seo/site-audit`
- `/services/web/e-commerce/shopify-setup`

### 🔄 **How It Differs from Other Pricing Components**

| Component | Purpose | Level | Complexity | Use Case |
|-----------|---------|-------|------------|----------|
| **PricingSection** | Orchestrator that renders tier grids | Level 2 | High | Full service pricing with multiple packages |
| **PricingTiers** | Displays multiple pricing cards | Level 2 | High | 2-4 pricing tiers with features/CTAs |
| **ComparisonTable** | Feature-by-feature comparison | Level 2/3 | Medium | When choices need detailed comparison |
| **PricingCallout** | Simple status indicator | **Level 3** | **Low** | Single pricing message per subservice |

### 🎨 **PricingCallout Variants**

```tsx
// Variant 1: Included in parent package
<PricingCallout 
  variant="included" 
  label="Included in Growth Package Pro"
  note="No additional cost when bundled"
/>

// Variant 2: Add-on pricing  
<PricingCallout 
  variant="addon"
  amount={1500}
  note="Can be added to any SEO package"
  cta={{ label: "Add to Package", href: "/contact" }}
/>

// Variant 3: Custom quote required
<PricingCallout 
  variant="custom"
  label="Enterprise consultation required" 
  note="Complex integrations need custom pricing"
  cta={{ label: "Contact Sales", href: "/contact/enterprise" }}
/>
```

### 🏗️ **Correct File Structure**

You're right to note the path - it should be:
```
src/components/ui/atoms/PricingCallout/  (not organisms)
├── PricingCallout.tsx
├── PricingCallout.module.css  
└── index.ts
```

**Why `atoms`?** It's a simple, single-purpose component (atom) rather than a complex multi-part organism.

### 💡 **Key Benefits**

1. **Follows pricing rules**: Level 3 gets lightweight pricing, not heavy tables
2. **Consistent UX**: All subservices have same pricing pattern
3. **Clear messaging**: Users understand if something is included, addon, or custom
4. **Performance**: Much lighter than rendering full PricingTiers
5. **Maintainable**: Simple component, easy to update globally

**Bottom line**: PricingCallout solves the "Level 3 needs pricing but not complexity" requirement with a purpose-built, lightweight component.

---

Short answer: **yes—use it**. It’s exactly the lightweight, Level-3-only pricing UI we wanted. Below is a tight ship-list to make it production-ready and wire it into `SubServiceTemplate.tsx` the right way (without leaking it into Hub or Service levels).

# ✅ What’s good about your `PricingCallout`

* **Scope & purpose match**: small, focused, “Included / Add-on / Custom” messaging fits Level-3 rules (no tier tables at subservice).
* **Clean API**: `variant`, `label`, `amount`, `note`, `cta` — everything you need and nothing you don’t.
* **A11y & UX**: ARIA region/labels, keyboardable button, responsive CSS, high-contrast & dark-mode hooks.
* **Perf**: trivial render, no heavy grids, ideal for many subservice pages.

# 🔧 Quick polish (before merge)

1. **Move to atoms**
   Move from `ui/organisms/PricingCallout` → `ui/atoms/PricingCallout`. Update imports and the barrel.

   ```
   src/components/ui/atoms/PricingCallout/
     ├─ PricingCallout.tsx
     ├─ PricingCallout.module.css
     └─ index.ts     // export { default } from "./PricingCallout"
   ```

2. **Currency consistency**
   Your `formatAmount` hard-codes `en-US`/USD. Either:

   * accept a `currency?: string` prop (default from site config), or
   * import a central `formatMoney(amount, currency)` helper and use that.

3. **Iconography**
   Emojis are fine, but consider swapping to lucide icons to match the rest of the design system:

   * included → `Check`
   * addon → `Plus`
   * custom → `MessageSquareText`
     (Keep `aria-hidden` and leave spoken text to the label.)

4. **Styling tokens**
   You already use CSS variables with sensible fallbacks. Add these to your token map if not present:

   * `--success-primary`, `--success-surface`
   * `--warning-primary`, `--warning-surface`
   * `--primary-primary`, `--primary-surface`
     That will guarantee perfect theming across light/dark.

5. **Prop “guardrails”**

   * If `variant="addon"` and `amount` is missing, show “Add-on: Custom pricing” (you already do).
   * When `cta.target === "_blank"`, also add `rel="noreferrer noopener"` in the Button (if your Button doesn’t set it automatically).

6. **Testing hook**
   You already expose `data-testid`; keep that. Add one to the label span as well if you want to assert copy in tests.

# 🧩 Exactly where to use it (Level-3 only)

In `SubServiceTemplate.tsx`, **after Scope & Deliverables**, before proof/portfolio:

```tsx
// SubServiceTemplate.tsx (excerpt)
import PricingCallout from "@/components/ui/atoms/PricingCallout";

function SubServiceTemplate({ data }: { data: SubServiceTemplateData }) {
  // ...Hero, Overview, Scope & Deliverables...

  // 3) PRICING CALLOUT (Level 3)
  const pc = data?.pricingCallout;
  {/* pc shape suggested below */}
  return (
    <>
      {/* Scope & Deliverables block here */}

      {pc ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <PricingCallout
              variant={pc.variant}           // "included" | "addon" | "custom"
              label={pc.label}               // e.g., "Included in Growth Package Pro"
              amount={pc.amount}             // number | string (addon only)
              note={pc.note}                 // small supporting text
              cta={pc.cta}                   // { label, href, variant?, target? }
            />
          </Container>
        </FullWidthSection>
      ) : null}

      {/* Optional: small ComparisonTable if this subservice has choices */}
      {/* ...Portfolio/Proof, FAQ, Final CTA... */}
    </>
  );
}
```

### Suggested data contract for Level-3 pages

```ts
// /src/data/page/services-pages/[hub]/[service]/[sub]/index.ts
export default {
  /* ... hero, overview, scope, etc. ... */
  pricingCallout: {
    variant: "included" | "addon" | "custom",
    label?: string,     // "Included in Growth Package Pro"
    amount?: number | string, // 1500 or "$1,500" (addon only)
    note?: string,      // "Can be added to any SEO package"
    cta?: { label: string; href: string; variant?: "primary" | "secondary" | "outline"; target?: "_blank" | "_self"; }
  }
}
```

# 🚫 Where **not** to use it

* **HubTemplate** (Level-1): directory only, no pricing.
* **ServiceTemplate** (Level-2): use full **PricingSection** (range/starting-at or tiers). Callout is too small for the category layer.
* **SubHubTemplate** (Level-2B): keep to a short “range note” if anything; no callout by default.

# 🧠 Optional niceties (if you want perfection)

* **`size?: "sm" | "md" | "lg"` prop** to let you compress it in denser layouts.
* **`align?: "left" | "center"` prop** so you can center it on narrow pages (you do some of this via CSS already).
* **`aria-describedby`**: if you include a longer note, expose it via an id so SRs read it with the label.
* **Analytics hook**: if `cta` is present, add an `onClick` prop or data attributes for tracking.

# ✅ Final recommendation

**Ship it.** Move it to `atoms/`, wire it into `SubServiceTemplate` exactly as above, and leave Hub/Service levels untouched. This gives you:

* clean adherence to the **Pricing Rules by Level**,
* a consistent, minimal Level-3 pricing experience,
* and a component that’s easy to maintain and theme.

If you want, I’ll:

* move the files,
* add the `index.ts` barrel + imports update in `SubServiceTemplate.tsx`,
* and stub the `pricingCallout` block in 2–3 example subservice data files (marketing, SEO, web) so you can see it live across the stack.
