/**
 * UI Types — Pricing
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Declare *types only* for pricing payloads used by UI bands/cards and adapters.
 * Source of truth for the shape is the runtime schema (MoneySchema).
 *
 * Notes
 * -----------------------------------------------------------------------------
 * - No helpers/formatters here — keep logic in your utilities (e.g., utils/pricing).
 * - Importing from `package-schema.ts` keeps these aligned with content SSOT.
 */

import type { MoneySchemaType as RuntimeMoney } from "@/packages/lib/package-schema";

/** Canonical money payload (SSOT-derived). */
export type Money = RuntimeMoney;

/** ISO 4217 currency code union (from runtime schema). */
export type CurrencyCode = Money["currency"];

/**
 * Optional, author-provided notes attached to pricing (rarely rendered by UI).
 * Kept as a separate type alias for clarity in props.
 */
export type PriceNote = string | undefined;

/**
 * Minimal “price range” for client-side filters (UI-only).
 * Use only for searching/sorting; do not persist as content.
 */
export type PriceRange = {
  minMonthly?: number;
  maxMonthly?: number;
};
