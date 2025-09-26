import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-publish-professional",
  service: "content",
  name: "Professional Publishing Package",
  tier: "Professional",
  summary:
    "Daily content operations with multi-platform publishing, email newsletter management, repurposing, and analytics tracking.",
  price: { monthly: 3500, currency: "USD" },
  badges: ["Best Value"],
  tags: ["publishing", "ops", "email", "social", "analytics"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;