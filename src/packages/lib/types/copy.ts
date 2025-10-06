/**
 * UI Types — Copy & CTAs (types only)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Provide type shapes for CTA objects and copy fragments used across UI
 * components. **Do not** export concrete strings here — keep copy in
 * dedicated utilities (e.g., `utils/cta.ts`) to avoid drift and allow A/B tests.
 */

/** CTA label type (copy string; concrete values live in `utils/cta.ts`). */
export type CtaLabel = string;

/** CTA object shape used by cards and sections. */
export type Cta = Readonly<{
  label: CtaLabel;
  href: string;
  /** Optional aria-label for screen readers; caller may omit to use defaults. */
  ariaLabel?: string;
  /** Optional analytics tag; renderers may map to data attributes. */
  dataCta?: "primary" | "secondary";
}>;

/** Common pair of CTAs (primary/secondary). */
export type CtaPair = Readonly<{ primary: Cta; secondary: Cta }>;

/**
 * Badge label used near prices on cards/bands (e.g., "STARTING AT").
 * This is a UI token — the actual string/value should live in your copy utils.
 */
export type BadgeLabel = string;
