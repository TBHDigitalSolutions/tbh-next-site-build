import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-photo-product-starter",
  service: "content",
  name: "Product Photography Starter",
  tier: "Starter",
  summary:
    "E-commerce-ready product imagery—25 photos per session with basic retouching, white background and lifestyle shots.",
  price: { oneTime: 1500, currency: "USD" },
  tags: ["photography", "product", "ecommerce"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // Optional helpers:
  // sla: "Standard delivery in 3–5 business days",
};

export default pkg;