import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-design-professional",
  service: "content",
  name: "Professional Design Package",
  tier: "Professional",
  summary:
    "A complete brand identity system and a higher monthly design cadence across every touchpoint—web, social, print, advertising, and events.",
  price: { monthly: 4500, currency: "USD" },
  badges: ["Best Value"],
  tags: ["visual-design", "brand-identity", "marketing-collateral", "ads", "events"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // Optional advanced fields (uncomment if you use them)
  // related: ["content-design-essential", "content-design-enterprise"],
  // addOns: ["content-accelerator-rapid", "content-accelerator-brand-compliance"],
};

export default pkg;