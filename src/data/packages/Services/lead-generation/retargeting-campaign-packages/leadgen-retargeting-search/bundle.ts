import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-retargeting-search",
  service: "leadgen",
  name: "Search Retargeting Platform",
  summary:
    "Google Ads remarketing lists for search ads (RLSA) with keyword strategies, bidding logic, and conversion-first ad copy.",
  price: { monthly: 2500, currency: "USD" }, // ad spend billed separately
  category: "Retargeting Campaign Services",
  subcategory: "Search",
  icp: "Brands with measurable search demand that want higher intent retargeting coverage.",
  tags: ["retargeting", "RLSA", "search", "Google Ads", "SEM"],
  badges: [],
  highlights: [
    "RLSA & audience layering",
    "Keyword & query optimization",
    "Advanced bidding strategies",
    "Conversion-oriented ad copy",
    "Ad spend billed separately",
  ],
};

export default bundle;
