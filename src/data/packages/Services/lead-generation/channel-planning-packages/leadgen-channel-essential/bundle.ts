import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-channel-essential",
  service: "leadgen",
  name: "Essential Channel Strategy",
  summary:
    "Foundational multi-channel plan (up to 3 primary channels) with tracking setup, monthly attribution reporting, and quarterly strategy reviews.",
  price: { monthly: 3500, currency: "USD" },
  category: "Strategy & Planning",
  subcategory: "Channel Planning",
  icp: "Small businesses starting structured lead generation.",
  tags: ["channel strategy", "attribution", "lead sources", "tracking"],
  badges: [],
  highlights: [
    "3 primary channels prioritized",
    "Baseline tracking & UTMs",
    "Monthly attribution reporting",
    "Quarterly strategy reviews",
  ],
};

export default bundle;
