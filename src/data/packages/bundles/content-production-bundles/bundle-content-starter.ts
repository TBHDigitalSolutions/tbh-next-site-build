import type { PackageBundle } from "../../_types/packages.types";

const bundle: PackageBundle = {
  id: "bundle-content-starter",
  name: "Small Business Content Starter",
  components: [
    "content-design-essential",
    "content-copy-essential",
    "content-publish-basic-cms",
  ],
  price: { monthly: 5800, currency: "USD" },
  compareAt: { monthly: 6800, currency: "USD" },
};

export default bundle;