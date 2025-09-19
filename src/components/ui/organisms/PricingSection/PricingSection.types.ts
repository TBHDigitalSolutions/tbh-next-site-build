// src/components/ui/organisms/PricingSection/PricingSection.types.ts

/**
 * PricingSection.types.ts — Production-ready types aligned to the new architecture.
 *
 * The section is a thin orchestrator:
 *  - Pages pass raw, service-specific `data` (generic typed).
 *  - A required adapter maps that raw `data` → PricingTiersProps.
 *  - The section renders headings/notes and delegates tier UI to <PricingTiers />.
 *
 * Inline tier-card types are defined in the PricingTiers package.
 */

import type { PricingTiersProps } from "@/components/ui/organisms/PricingTiers/PricingTiers";

/**
 * Adapter signature: Convert arbitrary service data → props for <PricingTiers />.
 * Implementations typically live beside each service page (e.g. adapters.ts).
 */
export type MapToTiersProps<TData = unknown> = (data: TData) => PricingTiersProps;

/** Optional notes rendered under the tiers grid. */
export interface PricingSectionNotes {
  /** Fine-print / disclaimers (e.g., licensing, scope caveats). */
  disclaimer?: string;
  /** A short callout sentence preceding the contact CTA. */
  contact?: string;
  /** Optional href for the contact CTA (component may default to "/contact"). */
  contactHref?: string;
}

/** Props consumed by the thin PricingSection orchestrator. */
export interface PricingSectionProps<TData = unknown> {
  /** Section title (e.g., "Pricing"). */
  title?: string;
  /** Section subtitle (one concise sentence). */
  subtitle?: string;

  /**
   * Raw, service-specific data. Shape is intentionally unconstrained here
   * so each service can evolve independently. The adapter normalizes it.
   */
  data: TData;

  /**
   * Required adapter that maps the raw `data` into a clean presentational
   * contract for <PricingTiers />.
   */
  mapToTiersProps: MapToTiersProps<TData>;

  /** Optional notes block rendered beneath the tier grid. */
  notes?: PricingSectionNotes;

  /** Optional className to extend/override section-level styles. */
  className?: string;

  /**
   * Optional anchor id for in-page linking (defaults to "pricing" in the
   * component implementation).
   */
  id?: string;
}

/* -----------------------------------------------------------------------------
 * Convenience re-exports
 * ---------------------------------------------------------------------------*/
export type { PricingTiersProps };

/* -----------------------------------------------------------------------------
 * (Optional) Deprecated aliases to ease migration; remove once all callsites are updated.
 * ---------------------------------------------------------------------------*/
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PricingNotes extends PricingSectionNotes {}
export type PricingAdapter<TData = unknown> = MapToTiersProps<TData>;
