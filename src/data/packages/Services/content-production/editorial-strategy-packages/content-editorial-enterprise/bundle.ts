import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-editorial-enterprise",
  service: "content",
  name: "Enterprise Editorial Management",
  tier: "Enterprise",
  summary:
    "Enterprise-level content strategy, governance, multi-team workflow management, advanced analytics, and compliance with a dedicated strategist.",
  price: { monthly: 8500, currency: "USD" },
  badges: ["Premium"],
  tags: ["editorial", "governance", "multi-team", "analytics", "compliance"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;