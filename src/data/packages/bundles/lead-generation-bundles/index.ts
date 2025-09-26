import type { PackageBundle } from "../../_types/packages.types";

import bundleLeadgenStarter from "./bundle-leadgen-starter";
import bundleLeadgenGrowth from "./bundle-leadgen-growth";
import bundleLeadgenEnterprise from "./bundle-leadgen-enterprise";

import bundleLeadgenLocal from "./bundle-leadgen-local";
import bundleLeadgenEcommerce from "./bundle-leadgen-ecommerce";
import bundleLeadgenB2BEnterprise from "./bundle-leadgen-b2b-enterprise";

export const LEADGEN_BUNDLES_LIST: PackageBundle[] = [
  bundleLeadgenStarter,
  bundleLeadgenGrowth,
  bundleLeadgenEnterprise,
  bundleLeadgenLocal,
  bundleLeadgenEcommerce,
  bundleLeadgenB2BEnterprise,
];

export const LEADGEN_BUNDLES: Record<string, PackageBundle> = Object.fromEntries(
  LEADGEN_BUNDLES_LIST.map(b => [b.id, b])
);

export default LEADGEN_BUNDLES;
