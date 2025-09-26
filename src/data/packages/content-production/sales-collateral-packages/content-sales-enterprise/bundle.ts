import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-sales-enterprise",
  service: "content",
  name: "Enterprise Sales System",
  tier: "Enterprise",
  summary:
    "Scaled enablement: industry-specific collateral, interactive sales presentations, a centralized sales portal, proposal automation, and ongoing optimization.",
  price: { oneTime: 15000, monthly: 2500, currency: "USD" },
  badges: ["Premium"],
  tags: ["sales", "enablement", "portal", "automation", "interactive"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;