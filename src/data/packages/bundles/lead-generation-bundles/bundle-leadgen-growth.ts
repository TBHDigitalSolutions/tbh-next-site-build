import type { PackageBundle } from "../../_types/packages.types";

/**
 * Growth Business Lead Engine
 * Components: Professional Channel Mgmt + Professional Landing Page System + Professional Scoring + Professional Nurturing + Professional Remarketing
 */
const bundle: PackageBundle = {
  id: "bundle-leadgen-growth",
  name: "Growth Business Lead Engine",
  components: [
    "leadgen-channel-professional",
    "leadgen-landing-professional",
    "leadgen-scoring-professional",
    "leadgen-nurture-professional",
    "leadgen-remarketing-professional",
  ],
  price: { oneTime: 25000, monthly: 14500, currency: "USD" },
  compareAt: { oneTime: 32000, monthly: 17500, currency: "USD" },
};

export default bundle;
