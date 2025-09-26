import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-design-essential",
  service: "content",
  name: "Essential Design Package",
  tier: "Essential",
  summary:
    "Core brand visuals and a steady cadence of monthly assets to keep your marketing consistent.",
  price: { monthly: 2500, currency: "USD" },
  badges: ["Starter"],
  tags: ["visual-design", "brand-basics", "templates"],

  // composed data
  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // Optional advanced fields (uncomment if you use them)
  // related: ["content-design-professional"],
  // addOns: ["content-accelerator-rapid"],
};

export default pkg;