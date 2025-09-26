import type { PackageBundle } from "../../_types/packages.types";

/**
 * E-Commerce Lead Generation Bundle
 * Components: Professional channel mgmt + product-focused landing + abandonment remarketing + lifecycle nurturing
 */
const bundle: PackageBundle = {
  id: "bundle-leadgen-ecommerce",
  name: "E-Commerce Lead Generation Bundle",
  components: [
    "leadgen-channel-professional",
    "leadgen-landing-professional",
    "leadgen-remarketing-professional", // cart abandonment remarketing fits here
    "leadgen-nurture-professional",     // lifecycle nurturing
  ],
  price: { oneTime: 15500, monthly: 12500, currency: "USD" },
};

export default bundle;
