import type { PackageBundle } from "../../_types/packages.types";

const bundle: PackageBundle = {
  id: "bundle-content-enterprise",
  name: "Enterprise Content Powerhouse",
  components: [
    "content-design-enterprise",
    "content-copy-enterprise",
    "content-publish-enterprise",
    "content-video-training-system",
    "content-sales-enterprise",
  ],
  price: { oneTime: 12500, monthly: 38500, currency: "USD" },
  compareAt: { oneTime: 17500, monthly: 46500, currency: "USD" },
};

export default bundle;