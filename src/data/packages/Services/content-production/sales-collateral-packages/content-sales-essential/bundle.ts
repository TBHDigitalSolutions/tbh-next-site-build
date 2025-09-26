import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-sales-essential",
  service: "content",
  name: "Essential Sales Package",
  tier: "Essential",
  summary:
    "Foundational sales assets for small teams: brochure, one-pagers, basic case studies, business cards, and email signatures—written and designed.",
  price: { oneTime: 3500, currency: "USD" },
  tags: ["sales", "collateral", "brochure", "one-pagers", "case-studies"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;