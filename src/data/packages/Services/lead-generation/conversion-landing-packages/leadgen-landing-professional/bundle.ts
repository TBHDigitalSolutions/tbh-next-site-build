import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-landing-professional",
  service: "leadgen",
  name: "Professional Landing Page System",
  summary:
    "Six landing pages with an ongoing CRO program: A/B testing, behavior analytics, and systematic optimization across devices.",
  price: { oneTime: 6500, monthly: 2500, currency: "USD" },
  category: "Conversion Optimization",
  subcategory: "Landing Pages",
  icp: "Growth teams running multiple campaigns that need disciplined, continuous optimization.",
  tags: ["A/B testing", "heatmaps", "CRO", "analytics"],
  badges: ["Recommended"],
  highlights: [
    "6 pages + ongoing optimization",
    "A/B testing across all pages",
    "Heat mapping & behavior analysis",
    "Mobile & desktop test coverage",
  ],
};

export default bundle;
