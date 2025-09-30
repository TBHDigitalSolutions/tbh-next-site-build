// src/packages/registry/lead-generation-packages/lead-routing-distribution/card.ts
// registry/lead-generation-packages/lead-routing-distribution/card.ts
import { buildDefaultCard, buildRailCard } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Card mappers for: lead-routing-distribution
 * - Keep these ultra-thin; all policy lives in mappers.ts
 * - Named exports follow the slug in camelCase for consistency.
 */
export const leadRoutingDistributionCard = buildDefaultCard(base);
export const leadRoutingDistributionCardRail = buildRailCard(base);

// Optional default for simpler imports
export default leadRoutingDistributionCard;
