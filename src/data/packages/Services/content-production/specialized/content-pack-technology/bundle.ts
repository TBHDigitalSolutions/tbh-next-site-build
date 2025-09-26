import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-pack-technology",
  service: "content",
  name: "Industry Pack — Technology",
  tier: "Industry Pack",
  summary:
    "Technical and product content for software, SaaS, and platforms—docs, release notes, integration guides, and thought leadership.",
  price: { monthly: 4500, currency: "USD" },
  tags: ["technology", "saas", "product-marketing", "docs", "devrel"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;