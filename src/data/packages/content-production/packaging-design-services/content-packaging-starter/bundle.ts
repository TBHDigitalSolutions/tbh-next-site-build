import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-packaging-starter",
  service: "content",
  name: "Product Packaging Starter",
  tier: "Starter",
  summary:
    "Primary packaging for one product with labels/tags, basic photo integration, and printer-ready files. Includes two design revisions.",
  price: { oneTime: 2500, currency: "USD" },
  tags: ["packaging", "print", "labeling", "starter"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Typical timeline 2–3 weeks from kickoff",
};

export default pkg;