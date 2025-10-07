// src/packages/lib/types/band.ts
/**
 * UI Types — Price Band (presentation-only)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Define presentation types for a price actions band component. Keep
 * decision logic (variant picking, base-note rules) in `@/packages/lib/band`
 * to avoid circular deps with React components.
 *
 * Notes
 * -----------------------------------------------------------------------------
 * - The canonical price shape is `Money` (see `types/pricing.ts`).
 * - Authoring provides `priceBand` (tagline/baseNote/finePrint) on packages.
 * - Cards do NOT render base note or fine print; detail pages do.
 */

import type { Money } from "./pricing";

/** Surfaces that may host a band. */
export type BandContext = "detail" | "card";

/** Variants the UI component supports (layout concern, not content). */
export type BandVariant =
  | "detail-hybrid"   // detail page; monthly + setup
  | "detail-oneTime"  // detail page; monthly-only OR one-time-only
  | "card-hybrid"     // card; monthly + setup
  | "card-oneTime";   // card; monthly-only OR one-time-only

/** Base-note kind as authored (used only on details). */
export type BaseNoteKind = "proposal" | "final";

/**
 * Author-provided band copy (detail surface only).
 * Never fall back to summary/description for tagline.
 */
export type PriceBandCopyInput = {
  tagline?: string;
  baseNote?: BaseNoteKind; // the "kind" (to be resolved to display text)
  finePrint?: string;
};

/**
 * Resolved band copy passed to the UI component on the detail page.
 * `baseNote` is already transformed to a display string.
 */
export type PriceBandCopyResolved = {
  tagline?: string;
  baseNote?: string;
  finePrint?: string;
};

/**
 * Minimal prop payload a band component might accept, independent of framework.
 * When used on cards, `copy` MUST be omitted (cards never show it).
 */
export type PriceBandProps = {
  variant?: BandVariant;
  price: Money;
  copy?: PriceBandCopyResolved; // only for detail pages
};
