import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-remarketing-enterprise",
  service: "leadgen",
  name: "Enterprise Remarketing Platform",
  summary:
    "Enterprise-scale remarketing with unlimited segmentation, cross-device orchestration, personalized dynamic ads, and a dedicated specialist.",
  price: { oneTime: 8500, monthly: 5500, currency: "USD" },
  category: "Remarketing & Retention",
  subcategory: "Remarketing Setup",
  icp: "Large organizations with complex journeys, multiple regions, or product lines.",
  tags: ["remarketing", "cross-device", "personalization", "automation", "data"],
  badges: ["Premium"],
  highlights: [
    "Advanced tracking & attribution",
    "Unlimited audience segmentation",
    "Personalized dynamic remarketing",
    "Dedicated remarketing specialist",
  ],
};

export default bundle;
