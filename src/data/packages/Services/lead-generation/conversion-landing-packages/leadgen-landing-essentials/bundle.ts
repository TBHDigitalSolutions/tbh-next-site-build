import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-landing-essentials",
  service: "leadgen",
  name: "Landing Page Essentials",
  summary:
    "Three conversion-focused landing pages with mobile optimization, tracking, and form best practices. Ideal for teams starting structured CRO.",
  price: { oneTime: 3500, monthly: 500, currency: "USD" },
  category: "Conversion Optimization",
  subcategory: "Landing Pages",
  icp: "Small businesses or new campaigns needing high-converting pages quickly.",
  tags: ["landing pages", "CRO", "tracking", "mobile"],
  badges: ["Popular"],
  highlights: [
    "3 custom landing pages",
    "Mobile optimization included",
    "GA4 + conversion tracking",
    "Form UX & validation best practices",
  ],
};

export default bundle;
