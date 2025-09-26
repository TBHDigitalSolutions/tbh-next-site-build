import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-brand-essentials",
  service: "content",
  name: "Brand Essentials Package",
  tier: "Essentials",
  summary:
    "Logo and brand mark system, a concise style manual, core stationery, and basic document templates—everything a new business needs to launch on brand.",
  price: { oneTime: 4500, currency: "USD" },
  tags: ["branding", "logo", "guidelines", "templates", "stationery"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Typical timeline 2–3 weeks from kickoff",
};

export default pkg;