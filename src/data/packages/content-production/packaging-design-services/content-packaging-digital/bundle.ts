import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-packaging-digital",
  service: "content",
  name: "Digital Packaging Package",
  tier: "Digital",
  summary:
    "Presentation and “packaging” for digital products and courses: visual identity, module layout, download bundles, showcase assets, and interactive UX.",
  price: { oneTime: 3500, currency: "USD" },
  tags: ["digital", "course", "downloads", "ux", "presentation"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;