import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-pack-healthcare",
  service: "content",
  name: "Industry Pack — Healthcare",
  tier: "Industry Pack",
  summary:
    "Specialized healthcare content with compliance-aware workflows and patient/provider-focused deliverables.",
  price: { monthly: 4500, currency: "USD" },
  tags: ["healthcare", "hipaa", "patient-education", "clinical", "compliance"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;