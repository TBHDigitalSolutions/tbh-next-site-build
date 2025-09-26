import type { PackageBundle } from "../../_types/packages.types";

const bundle: PackageBundle = {
  id: "bundle-content-growth",
  name: "Growth Business Content System",
  components: [
    "content-design-professional",
    "content-copy-professional",
    "content-publish-professional",
    "content-video-social-pack",
  ],
  price: { monthly: 13500, currency: "USD" },
  compareAt: { monthly: 16000, currency: "USD" },
};

export default bundle;