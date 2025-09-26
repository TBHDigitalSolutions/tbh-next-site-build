import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-presentation-sales-system",
  service: "content",
  name: "Sales Presentation System",
  tier: "Professional",
  summary:
    "A persuasive, interactive sales deck with copywriting, persona/vertical variants, animations, and speaker notes—engineered to close.",
  price: { oneTime: 5500, currency: "USD" },
  tags: ["presentations", "sales", "deck", "interactive", "animation"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;