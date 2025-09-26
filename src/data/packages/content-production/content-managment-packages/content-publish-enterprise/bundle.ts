import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-publish-enterprise",
  service: "content",
  name: "Enterprise Publishing System",
  tier: "Enterprise",
  summary:
    "Enterprise-scale content operations: multi-site/multi-brand publishing, advanced approvals, international distribution, and custom integrations.",
  price: { monthly: 8500, currency: "USD" },
  badges: ["Premium"],
  tags: ["publishing", "enterprise", "workflow", "international", "integrations"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;