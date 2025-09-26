import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-scoring-enterprise",
  service: "leadgen",
  name: "Enterprise Scoring Platform",
  summary:
    "AI-assisted, real-time lead scoring across products and markets with custom algorithms, advanced behavior analysis, and dedicated strategist.",
  price: { oneTime: 12500, monthly: 4500, currency: "USD" },
  category: "Lead Management & Qualification",
  subcategory: "Lead Scoring",
  icp: "Enterprises with complex motions, multiple product lines, and high volumes.",
  tags: ["AI scoring", "custom modeling", "real-time", "multi-product"],
  badges: ["Premium"],
  highlights: [
    "Custom scoring algorithms per product/region",
    "AI-assisted predictive signals",
    "Real-time updates & drift monitoring",
    "Dedicated scoring strategist",
  ],
};

export default bundle;
