/**
 * UI Types — Price Band (presentation-only)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Define the *presentation* types for a price actions band component. Keep
 * decision logic (variant picking, base-note rules) in a utility module
 * (e.g., `utils/band.ts`) to avoid circular dependencies with React components.
 *
 * NOTE: The *content* (authoring) schema already defines the canonical
 * `priceBand` object; here we add UI-centric types such as the variant enum.
 */

import type { Money } from "./pricing";

/** Surfaces that may host a band. */
export type BandContext = "detail" | "card";

/** Variants the UI component supports (layout-level concern). */
export type BandVariant =
  | "detail-hybrid"   // detail page; monthly + setup
  | "detail-oneTime"  // detail page; monthly-only OR one-time-only
  | "card-hybrid"     // card; monthly + setup
  | "card-oneTime";   // card; monthly-only OR one-time-only

/**
 * Microcopy shown alongside the price on the detail surface.
 * (The canonical authoring fields exist in the runtime package. This mirrors
 * that shape so UI props remain explicit and decoupled.)
 */
export type PriceBandCopy = {
  /** Optional marketing line shown ONLY on details. Never falls back to summary. */
  tagline?: string;
  /** Base note selector used on details: "proposal" | "final" */
  baseNote?: "proposal" | "final";
  /** Additional microcopy for details: e.g., “3-month minimum • + ad spend” */
  finePrint?: string;
};

/**
 * Minimal prop payload a band component might accept, independent of any
 * particular framework. Variants and copy are optional to keep props ergonomic.
 */
export type PriceBandProps = {
  variant?: BandVariant;
  price: Money;
  copy?: PriceBandCopy;
};
