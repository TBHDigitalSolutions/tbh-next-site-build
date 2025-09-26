import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-tradeshow-starter",
  service: "leadgen",
  name: "Trade Show Starter Package",
  summary:
    "End-to-end essentials for a single trade show: strategy, basic booth guidance, lead capture, pre-show promo, and automated follow-up.",
  price: { oneTime: 5500, currency: "USD" }, // per show; venue/vendor fees not included
  category: "Event & Experience Marketing",
  subcategory: "Trade Shows & Exhibitions",
  icp: "Companies new to trade shows that need a turnkey, compliant setup for lead capture and follow-up.",
  tags: ["trade show", "exhibition", "lead capture", "automation", "event marketing"],
  badges: ["Starter"],
  highlights: [
    "Show plan & goals",
    "Lead capture system setup",
    "Pre-show promotion plan",
    "Automated post-show follow-up",
  ],
};

export default bundle;
