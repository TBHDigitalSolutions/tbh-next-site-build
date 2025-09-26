import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-localization",
  service: "content",
  name: "Content Localization Services",
  tier: "Localization",
  summary:
    "Translation and transcreation with cultural adaptation, compliance review, and multi-language content ops.",
  price: { oneTime: 3500, currency: "USD", notes: "+$1,500 per additional language/market" },
  tags: ["localization", "translation", "compliance", "multilingual", "international"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;