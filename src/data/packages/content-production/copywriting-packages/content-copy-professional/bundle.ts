import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-copy-professional",
  service: "content",
  name: "Professional Copywriting Package",
  tier: "Professional",
  summary:
    "A strategic, brand-consistent copy engine across channels—30 pieces per month including advanced web, long-form blogs, email sequences, ads, and sales materials.",
  price: { monthly: 5500, currency: "USD" },
  badges: ["Best Value"],
  tags: ["copywriting", "long-form", "email-sequences", "ads", "sales"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;