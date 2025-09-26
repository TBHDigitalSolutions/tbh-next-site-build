import type { ServicePackage } from "../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-design-enterprise",
  service: "content",
  name: "Enterprise Visual Design System",
  tier: "Enterprise",
  summary:
    "Enterprise-grade design production with brand governance, senior art direction, and rapid turnarounds across all channels.",
  price: { monthly: 9500, currency: "USD" },
  badges: ["Premium"],
  tags: ["visual-design", "brand-system", "creative-ops"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;
