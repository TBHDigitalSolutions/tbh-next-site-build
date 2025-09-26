import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-exhibition-enterprise",
  service: "leadgen",
  name: "Enterprise Exhibition Platform",
  summary:
    "Enterprise-scale trade show program across multiple shows with advanced tech, integrations, cross-show nurturing, and dedicated specialists.",
  price: { oneTime: 15000, monthly: 5500, currency: "USD" }, // per show + program management
  category: "Event & Experience Marketing",
  subcategory: "Trade Shows & Exhibitions",
  icp: "Large organizations with multi-show roadmaps and complex data/compliance requirements.",
  tags: ["enterprise", "trade show", "integrations", "nurture", "attribution", "ABM"],
  badges: ["Enterprise"],
  highlights: [
    "Multi-show strategy & coordination",
    "Advanced booth tech & demos",
    "Integrated lead management & scoring",
    "Cross-show nurturing & ABM alignment",
    "Dedicated trade show specialist",
  ],
};

export default bundle;
