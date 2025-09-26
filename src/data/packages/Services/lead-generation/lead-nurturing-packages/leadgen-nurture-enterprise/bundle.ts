import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-nurture-enterprise",
  service: "leadgen",
  name: "Enterprise Nurturing Platform",
  summary:
    "Unlimited sequences with AI-powered personalization, predictive optimization, and enterprise integrations managed by a dedicated strategist.",
  price: { oneTime: 12500, monthly: 5500, currency: "USD" },
  category: "Lead Nurturing",
  subcategory: "Nurturing",
  icp: "Global or multi-product organizations with complex journeys and compliance needs.",
  tags: ["AI personalization", "predictive", "lifecycle", "MAP/CDP", "governance"],
  badges: ["Premium"],
  highlights: [
    "Unlimited sequences & complex branching",
    "AI-powered content personalization",
    "Predictive send & path optimization",
    "Dedicated nurturing strategist",
  ],
};

export default bundle;
