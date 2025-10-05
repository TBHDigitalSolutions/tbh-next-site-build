// src/packages/lib/band.ts
/**
 * Helpers for choosing the PriceActionsBand variant by surface (detail vs. card)
 * and normalizing base-note copy according to the pricing shape.
 *
 * - No UI imports (avoids circular deps with React components)
 * - Coexists with the UI-level PRESET map inside PriceActionsBand
 * - Central place to reason about "detail vs card" behavior
 */

import type { Money } from "./pricing";
import { isHybrid, isOneTimeOnly } from "./pricing";
import { BASE_NOTE, BADGE } from "./copy";

/** Re-export the badge label for convenience (styled uppercase in CSS). */
export { BADGE };

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

/** Band variants supported by the UI */
export type BandVariant =
  | "detail-hybrid"   // detail page; monthly + setup
  | "detail-oneTime"  // detail page; monthly-only OR one-time-only (inline)
  | "card-hybrid"     // card; monthly + setup
  | "card-oneTime";   // card; monthly-only OR one-time-only (inline)

/** Surfaces that host the band */
export type BandContext = "detail" | "card";

/**
 * Minimal band copy container (kept here to avoid coupling to UI types).
 * If you already declared this in a shared types file, you can import it
 * from there instead; the shape is intentionally identical.
 */
export type PriceBandCopy = {
  /** Optional marketing line shown ONLY on details. Never falls back to summary. */
  tagline?: string;
  /** Base note selector used on details: "proposal" | "final" */
  baseNote?: "proposal" | "final";
  /** Additional microcopy for details: e.g., “3-month minimum • + ad spend” */
  finePrint?: string;
};

/* -------------------------------------------------------------------------- */
/* Core decision helpers                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Resolve which band variant to render based on surface context and price shape.
 *
 * Rules:
 * - Hybrid (monthly + oneTime) → *-hybrid
 * - Non-hybrid (monthly-only OR one-time-only OR undefined) → *-oneTime
 *   (The UI still renders "/mo" when monthly-only; the variant controls layout.)
 */
export function resolveBandVariant(ctx: BandContext, price?: Money): BandVariant {
  const hybrid = isHybrid(price);
  if (ctx === "detail") return hybrid ? "detail-hybrid" : "detail-oneTime";
  return hybrid ? "card-hybrid" : "card-oneTime";
}

/**
 * Default base-note policy used across the app:
 * - One-time-only  → "final"
 * - Everything else (monthly-only OR hybrid OR unknown) → "proposal"
 */
export function defaultBaseNote(price?: Money): "proposal" | "final" {
  return isOneTimeOnly(price) ? "final" : "proposal";
}

/**
 * Get the final base-note text, honoring an optional override.
 * Returns standardized copy from the copy library.
 */
export function resolveBaseNoteText(
  price?: Money,
  override?: "proposal" | "final"
): string {
  const key = override ?? defaultBaseNote(price);
  return key === "final" ? BASE_NOTE.final : BASE_NOTE.proposal;
}

/* -------------------------------------------------------------------------- */
/* Tiny convenience helper                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Build a ready-to-spread prop set for <PriceActionsBand/> based on context.
 *
 * - Always includes the resolved `variant` and the canonical `price`.
 * - Only includes `tagline`, `baseNote`, and `finePrint` for the **detail** context,
 *   because cards never show those micro lines.
 *
 * Usage:
 * ```tsx
 * // In a detail page:
 * import { bandPropsFor } from "@/packages/lib/band";
 *
 * const bp = bandPropsFor("detail", pkg.price, pkg.priceBand);
 * <PriceActionsBand {...bp} ctaPrimary={...} ctaSecondary={...} />
 *
 * // In a card:
 * const bpCard = bandPropsFor("card", pkg.price, pkg.priceBand);
 * <PriceActionsBand {...bpCard} align="start" />
 * ```
 */
export function bandPropsFor(
  ctx: BandContext,
  price: Money,
  copy?: PriceBandCopy
) {
  if (ctx === "detail") {
    return {
      variant: resolveBandVariant("detail", price),
      price,
      tagline: copy?.tagline,
      baseNote: copy?.baseNote ?? defaultBaseNote(price),
      finePrint: copy?.finePrint,
    } as const;
  }
  // Card context: omit micro lines; band presets will handle badge-left/inline/chips.
  return {
    variant: resolveBandVariant("card", price),
    price,
    // no tagline/baseNote/finePrint on cards
  } as const;
}

/* -------------------------------------------------------------------------- */
/* Small type guards (handy for styling branches, tests, etc.)                 */
/* -------------------------------------------------------------------------- */

export function isDetailVariant(v: BandVariant): v is "detail-hybrid" | "detail-oneTime" {
  return v.startsWith("detail");
}
export function isCardVariant(v: BandVariant): v is "card-hybrid" | "card-oneTime" {
  return v.startsWith("card");
}
