import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-remarketing-starter",
  service: "leadgen",
  name: "Remarketing Starter Kit",
  summary:
    "Foundational remarketing setup with pixels, 3 core audiences, baseline creative, and monthly reporting across Google & Meta.",
  price: { oneTime: 2500, monthly: 1500, currency: "USD" },
  category: "Remarketing & Retention",
  subcategory: "Remarketing Setup",
  icp: "Businesses new to remarketing who need a clean setup and fast launch.",
  tags: ["remarketing", "retargeting", "pixels", "Google Ads", "Meta"],
  badges: ["Starter"],
  highlights: [
    "Full pixel/tag implementation",
    "3 core audience segments",
    "Google & Meta campaign setup",
    "Monthly performance reporting",
  ],
};

export default bundle;
