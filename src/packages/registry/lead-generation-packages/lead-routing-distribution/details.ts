// src/packages/registry/lead-generation-packages/lead-routing-distribution/details.ts
// registry/lead-generation-packages/lead-routing-distribution/details.ts
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Detail overview mapper for: lead-routing-distribution
 * - Produces PackageDetailOverviewProps consumed by the section component.
 * - PriceActionsBand copy (tagline/base note/fine print) is handled via mappers.ts.
 */
export const leadRoutingDistributionDetail = buildPackageDetailOverviewProps(base);

// Optional default for simpler imports
export default leadRoutingDistributionDetail;
