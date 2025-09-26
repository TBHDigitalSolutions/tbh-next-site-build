import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-testing-advanced",
  service: "leadgen",
  name: "Advanced Testing Program",
  summary:
    "Scaled experimentation with 4 tests/month, UX behavior analytics, funnel diagnostics, and a quarterly testing roadmap.",
  price: { monthly: 4500, currency: "USD" },
  category: "Conversion Optimization",
  subcategory: "A/B Testing",
  icp: "Companies committed to data-driven optimization running multiple campaigns.",
  tags: ["A/B", "MVT", "UX research", "heatmaps", "funnel"],
  badges: ["Recommended"],
  highlights: [
    "4 tests per month",
    "UX behavior analysis (heatmaps/session replay)",
    "Funnel diagnostics & CRO implementation",
    "Quarterly roadmap & strategy",
  ],
};

export default bundle;
