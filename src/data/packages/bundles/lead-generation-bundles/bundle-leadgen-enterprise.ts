import type { PackageBundle } from "../../_types/packages.types";

/**
 * Enterprise Lead Generation Platform
 * Components: All Enterprise packages across lead-generation services (core families)
 */
const bundle: PackageBundle = {
  id: "bundle-leadgen-enterprise",
  name: "Enterprise Lead Generation Platform",
  components: [
    "leadgen-channel-enterprise",
    "leadgen-landing-enterprise",
    "leadgen-testing-enterprise",
    "leadgen-scoring-enterprise",
    "leadgen-routing-enterprise",
    "leadgen-nurture-enterprise",
    "leadgen-remarketing-enterprise",
  ],
  price: { oneTime: 55000, monthly: 34500, currency: "USD" },
  compareAt: { oneTime: 69500, monthly: 41500, currency: "USD" },
};

export default bundle;
