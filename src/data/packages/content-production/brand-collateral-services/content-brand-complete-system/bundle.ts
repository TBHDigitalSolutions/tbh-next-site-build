import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-brand-complete-system",
  service: "content",
  name: "Complete Brand System",
  tier: "Complete",
  summary:
    "Comprehensive identity system with advanced guidelines, full collateral suite, event/trade show assets, signage/vehicle rules, and compliance monitoring support.",
  price: { oneTime: 12500, currency: "USD" },
  badges: ["Premium"],
  tags: ["branding", "identity-system", "guidelines", "events", "signage", "compliance"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;