// ============================================================================
// /src/data/packages/_types/primitives.ts
// ----------------------------------------------------------------------------
// Canonical primitives for the Packages domain.
// - Framework-agnostic.
// - Stable unions for services & tiers.
// - Single public price model: Money { oneTime?, monthly?, currency? }.
// - Small utility bases (WithId/WithSlug/WithService) used across types.
// ============================================================================

/** Canonical service slugs used for filtering, routing, and grouping. */
export type ServiceSlug =
  | "content"
  | "leadgen"
  | "marketing"
  | "seo"
  | "webdev"
  | "video";

/** Common merchandising tiers (kept as labels only; no public tier tables). */
export type Tier = "Essential" | "Professional" | "Enterprise";

/**
 * Billing model hints for add-ons and internal UI logic.
 * Keep this narrow; expand only when we actually support the mode.
 */
export type BillingModel = "one-time" | "monthly" | "hybrid";

/** Currency code (extend when you truly support more than USD end-to-end). */
export type CurrencyCode = "USD";

/**
 * Canonical money model (replaces legacy `setup`).
 * - `oneTime`: project/setup fee
 * - `monthly`: recurring retainer
 * - `currency`: optional; formatters default to "USD" when omitted
 */
export type Money = {
  oneTime?: number;
  monthly?: number;
  currency?: CurrencyCode;
};

/** Optional display/contract metadata that may accompany a price. */
export type PriceMeta = {
  /** Short note near price: "+ ad spend", "starting at", etc. */
  note?: string;
  /** Minimum commitment in months (e.g., 3, 6, 12). */
  minTermMonths?: number;
  /** Display hint when setup is waived after N months. */
  setupWaivedAfterMonths?: number;
  /** Optional internal discount (%); never auto-applied in UI. */
  discountPercent?: number;
};

/** Simple deliverable/feature row used by some legacy shapes. */
export type FeatureItem = { label: string; detail?: string };

/** Small utility bases used across authoring types. */
export type WithId = { id: string };
export type WithSlug = { slug?: string };
export type WithService = { service?: ServiceSlug | string };
