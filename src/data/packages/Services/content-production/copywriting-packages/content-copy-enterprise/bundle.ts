import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-copy-enterprise",
  service: "content",
  name: "Enterprise Copywriting Package",
  tier: "Enterprise",
  summary:
    "Unlimited copy production with strategic planning, long-form thought leadership, multi-channel campaigns, localization, and a dedicated copy team.",
  price: { monthly: 12000, currency: "USD" },
  badges: ["Premium"],
  tags: ["copywriting", "strategy", "localization", "thought-leadership", "campaigns"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // popular: true,
};

export default pkg;