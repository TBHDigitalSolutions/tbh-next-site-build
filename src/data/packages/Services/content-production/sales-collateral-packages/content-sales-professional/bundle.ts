import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-sales-professional",
  service: "content",
  name: "Professional Sales Kit",
  tier: "Professional",
  summary:
    "A comprehensive, persuasive collateral suite (8–10 pieces) including detailed case studies, white papers, sales decks, trade show assets, and proposal templates.",
  price: { oneTime: 8500, currency: "USD" },
  badges: ["Best Value"],
  tags: ["sales", "collateral", "white-papers", "presentations", "tradeshows", "proposals"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;