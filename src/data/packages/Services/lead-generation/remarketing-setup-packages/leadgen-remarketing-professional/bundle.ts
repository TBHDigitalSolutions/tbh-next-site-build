import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-remarketing-professional",
  service: "leadgen",
  name: "Professional Remarketing System",
  summary:
    "Comprehensive multi-platform remarketing with 8+ audiences, dynamic feeds, and ongoing creative testing.",
  price: { oneTime: 4500, monthly: 3500, currency: "USD" },
  category: "Remarketing & Retention",
  subcategory: "Remarketing Setup",
  icp: "Companies with active digital marketing seeking cross-channel remarketing and dynamic ads.",
  tags: ["remarketing", "dynamic", "audiences", "Google Ads", "Meta", "LinkedIn", "TikTok"],
  badges: ["Recommended"],
  highlights: [
    "Advanced pixel & event tracking",
    "8+ custom audiences",
    "Dynamic remarketing setup",
    "Creative experimentation & CRO hooks",
  ],
};

export default bundle;
