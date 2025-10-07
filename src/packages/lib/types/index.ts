// src/packages/lib/types/index.ts
/**
 * Barrel exports for UI type modules.
 * -----------------------------------------------------------------------------
 * This entrypoint keeps imports stable:
 *
 *   import { Money, BandVariant } from "@/packages/lib/types";
 *
 * Notes
 * - This barrel re-exports:
 *   - pricing types + (compat) helper re-exports from "../pricing"
 *   - band presentation types
 * - No React/UI deps here. Safe for server/SSG/RSC.
 */

// Pricing (types + compat helper re-exports)
export type {
  Money,
  LegacyPrice,
  CurrencyCode,
  PriceNote,
  PriceRange,
} from "./pricing";
export {
  formatMoney,
  normalizeMoney,
  startingAtLabel,
  srPriceSentence,
  hasPrice,
  hasMonthly,
  hasOneTime,
  isHybrid,
  isMonthlyOnly,
  isOneTimeOnly,
} from "./pricing";

// Band (presentation-only types)
export type {
  BandContext,
  BandVariant,
  BaseNoteKind,
  PriceBandCopyInput,
  PriceBandCopyResolved,
  PriceBandProps,
} from "./band";
