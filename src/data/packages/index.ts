// src/data/packages/index.ts
// Canonical barrel for the Packages domain.
// Exposes types, utils, validators, recommendation API, and bundles.
// Keep this file dumb: *only* re-exports, no executable logic.

// ── Types & shared helpers ───────────────────────────────────────────────────
export * from "./_types/packages.types";
export * as Currency from "./_types/currency"; // toMoney(), etc.
export * from "./_utils";                      // ids.ts, slugs.ts, index.ts
export * from "./_validators/packages.validate";

// ── Integrated Growth Bundles (used by /app/packages pages) ──────────────────
export {
  INTEGRATED_GROWTH_BUNDLES,
  getBundleBySlug,
  getBundlesByCategory,
} from "./integrated-growth-packages";

// ── Recommendation & Package APIs (includes the missing function) ────────────
export {
  // Core recs
  getSmartRecommendations,
  getRecommendedPackages,
  getRecommendedAddOns,
  getRecommendedBundles,
  getCrossSellRecommendations,
  getUpgradeRecommendations,

  // Query/search
  searchPackages,
  getPackageById,
  getPackagesByService,    // ← the previously missing symbol
  getPopularPackages,
  getAllPackages,
  getAllAddOns,

  // Analytics
  getRecommendationStats,
  getRecommendationInsights,

  // Validation of data shape/links
  validateRecommendationSystem,
} from "./recommendations";

// ── Dev guard (prevents silent regressions during local work) ────────────────
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const recs = require("./recommendations");
  if (typeof recs.getPackagesByService !== "function") {
    throw new Error("[packages] getPackagesByService must be exported from recommendations.ts");
  }
}
