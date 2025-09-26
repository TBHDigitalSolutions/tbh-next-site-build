import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-editorial-advanced",
  service: "content",
  name: "Advanced Editorial Package",
  tier: "Advanced",
  summary:
    "Ongoing editorial operations with monthly calendar management, performance analysis, workflow/approvals, and team enablement.",
  price: { monthly: 3500, currency: "USD" },
  tags: ["editorial", "ops", "calendar", "analytics", "training"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;