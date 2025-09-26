import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-retargeting-social",
  service: "leadgen",
  name: "Social Retargeting System",
  summary:
    "Facebook, Instagram, and LinkedIn retargeting with social-native creatives, advanced audience logic, and cross-platform coordination.",
  price: { monthly: 3500, currency: "USD" }, // ad spend billed separately
  category: "Retargeting Campaign Services",
  subcategory: "Social",
  icp: "Brands with strong social presence looking to re-engage site and profile engagers.",
  tags: ["retargeting", "social", "Facebook", "Instagram", "LinkedIn", "remarketing"],
  badges: ["Recommended"],
  highlights: [
    "FB/IG + LinkedIn campaigns",
    "Social-specific creatives",
    "Advanced audience targeting",
    "Cross-platform coordination",
    "Ad spend billed separately",
  ],
};

export default bundle;
