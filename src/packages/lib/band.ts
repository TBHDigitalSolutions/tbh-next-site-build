// src/packages/lib/band.ts
/**
 * Price Band policy helpers (pure, framework-agnostic)
 * =============================================================================
 * - Resolve visual variants per surface (card/detail) and price shape.
 * - Enforce base-note policy (one-time-only → "final", else "proposal").
 * - Provide a convenience builder for UI band props.
 *
 * Cards:
 *  - Never show base note or fine print.
 *  - Only show the compact band variant ("card-*").
 *
 * Detail:
 *  - Show tagline (if authored), base-note (resolved to text), and fine print.
 */

import type {
  BandContext,
  BandVariant,
  BaseNoteKind,
  PriceBandCopyInput,
  PriceBandCopyResolved,
  PriceBandProps,
} from "./types/band";
import type { Money } from "./pricing";
import { isHybrid, isOneTimeOnly, isMonthlyOnly } from "./pricing";
import { BASE_NOTE_TEXT } from "./copy";

/** Resolve band variant from surface + price shape. */
export function resolveBandVariant(
  ctx: BandContext,
  price?: Money | null
): BandVariant | undefined {
  if (!price) return undefined;
  if (ctx === "card") {
    return isHybrid(price) ? "card-hybrid" : "card-oneTime";
  }
  // detail
  return isHybrid(price) ? "detail-hybrid" : "detail-oneTime";
}

/** Policy: one-time-only → "final", else "proposal". */
export function defaultBaseNote(price?: Money | null): BaseNoteKind {
  if (!price) return "proposal";
  return isOneTimeOnly(price) ? "final" : "proposal";
}

/** Resolve the visible base-note string (detail only). */
export function resolveBaseNoteText(
  price?: Money | null,
  override?: BaseNoteKind
): string {
  const key = override ?? defaultBaseNote(price);
  return BASE_NOTE_TEXT[key];
}

/**
 * Assemble band props for a given surface.
 * - Cards: returns `{ variant, price }` (no copy)
 * - Detail: returns `{ variant, price, copy: { tagline, baseNote, finePrint } }`
 */
export function bandPropsFor(
  ctx: BandContext,
  price?: Money | null,
  copy?: PriceBandCopyInput
): Partial<PriceBandProps> {
  const variant = resolveBandVariant(ctx, price);

  if (!price) {
    // No price → no band; return variant (likely undefined) so caller can decide.
    return { variant };
  }

  if (ctx === "card") {
    // Cards never receive base note or fine print.
    return { variant, price };
  }

  // Detail surface: include resolved copy
  const resolved: PriceBandCopyResolved | undefined = {
    tagline: copy?.tagline,
    baseNote: resolveBaseNoteText(price, copy?.baseNote),
    finePrint: copy?.finePrint,
  };

  return { variant, price, copy: resolved };
}

/* ------------------------ Tiny convenience predicates --------------------- */

/** True if a price would render as a hybrid band (monthly + setup). */
export function isHybridBand(price?: Money | null): boolean {
  return !!price && isHybrid(price);
}

/** True if a price would render as a single-line one-time/monthly band. */
export function isSingleBand(price?: Money | null): boolean {
  return !!price && (isOneTimeOnly(price) || isMonthlyOnly(price));
}
