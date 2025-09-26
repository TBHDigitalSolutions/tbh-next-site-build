import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-editorial-starter",
  service: "content",
  name: "Content Strategy Starter",
  tier: "Starter",
  summary:
    "A one-time engagement to audit your content, build a 6-month roadmap, and establish voice, style, and measurement foundations.",
  price: { oneTime: 4500, currency: "USD" },
  tags: ["editorial", "content-strategy", "audit", "roadmap"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;