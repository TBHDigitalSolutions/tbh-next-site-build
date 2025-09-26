import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-retargeting-display",
  service: "leadgen",
  name: "Display Retargeting Package",
  summary:
    "Visual remarketing across the Google Display Network and compatible programmatic placements with creative iteration and audience optimization.",
  price: { monthly: 2500, currency: "USD" }, // ad spend billed separately
  category: "Retargeting Campaign Services",
  subcategory: "Display",
  icp: "Brands seeking scalable visual remarketing to re-engage site visitors and abandoners.",
  tags: ["retargeting", "display", "GDN", "programmatic", "remarketing"],
  badges: ["Popular"],
  highlights: [
    "GDN + programmatic placements",
    "Creative design & optimization",
    "Audience + frequency management",
    "Monthly reporting & insights",
    "Ad spend billed separately",
  ],
};

export default bundle;
