import type { PackageBundle } from "../../_types/packages.types";

/**
 * Local Business Lead Capture Bundle
 * Components map to Essential variants + local remarketing.
 */
const bundle: PackageBundle = {
  id: "bundle-leadgen-local",
  name: "Local Business Lead Capture Bundle",
  components: [
    "leadgen-channel-essential",     // Essential Channel Strategy
    "leadgen-landing-essentials",    // Local landing pages (maps integration handled via includes/impl)
    "leadgen-scoring-basic",         // Basic lead scoring
    "leadgen-routing-essential",     // Basic routing
    "leadgen-remarketing-starter",   // Local remarketing campaigns
  ],
  price: { oneTime: 8500, monthly: 6500, currency: "USD" },
};

export default bundle;
