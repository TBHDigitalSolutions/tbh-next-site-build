import type { PackageBundle } from "../../_types/packages.types";

import bundleContentStarter from "./bundle-content-starter";
import bundleContentGrowth from "./bundle-content-growth";
import bundleContentEnterprise from "./bundle-content-enterprise";

export const CONTENT_BUNDLES_LIST: PackageBundle[] = [
  bundleContentStarter,
  bundleContentGrowth,
  bundleContentEnterprise,
];

export const CONTENT_BUNDLES: Record<string, PackageBundle> = Object.fromEntries(
  CONTENT_BUNDLES_LIST.map(b => [b.id, b])
);

export default CONTENT_BUNDLES;