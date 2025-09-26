import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-copy-essential",
  service: "content",
  name: "Essential Copywriting Package",
  tier: "Essential",
  summary:
    "Core conversion-focused copy for small businesses—web pages, blogs, email, and social—delivered on a steady monthly cadence.",
  price: { monthly: 2800, currency: "USD" },
  tags: ["copywriting", "seo-basics", "blog", "email", "social"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Typical turnaround 3–5 business days per item",
};

export default pkg;