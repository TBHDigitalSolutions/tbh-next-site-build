import type { PackageBundle } from "../../_types/packages.types";

/**
 * Small Business Lead Gen Starter
 * Components: Essential Channel Strategy + Landing Page Essentials + Basic Lead Scoring + Remarketing Starter
 */
const bundle: PackageBundle = {
  id: "bundle-leadgen-starter",
  name: "Small Business Lead Gen Starter",
  components: [
    "leadgen-channel-essential",
    "leadgen-landing-essentials",
    "leadgen-scoring-basic",
    "leadgen-remarketing-starter",
  ],
  price: { oneTime: 9500, monthly: 5500, currency: "USD" },
  compareAt: { oneTime: 12000, monthly: 7000, currency: "USD" },
};

export default bundle;
