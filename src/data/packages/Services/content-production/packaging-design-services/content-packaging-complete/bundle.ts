import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-packaging-complete",
  service: "content",
  name: "Complete Packaging System",
  tier: "Complete",
  summary:
    "End-to-end packaging for a product line (up to 5 products): primary & secondary, unboxing, sustainability guidance, and photography coordination.",
  price: { oneTime: 8500, currency: "USD" },
  tags: ["packaging", "system", "sustainability", "unboxing"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;