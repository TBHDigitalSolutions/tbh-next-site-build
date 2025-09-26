import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-landing-enterprise",
  service: "leadgen",
  name: "Enterprise Conversion Platform",
  summary:
    "Unlimited landing page creation and optimization with multivariate testing, personalization, advanced attribution, and enterprise integrations.",
  price: { oneTime: 15000, monthly: 5500, currency: "USD" },
  category: "Conversion Optimization",
  subcategory: "Landing Pages",
  icp: "Enterprises with complex funnels and multiple segments, products, or regions.",
  tags: ["multivariate", "personalization", "attribution", "enterprise"],
  badges: ["Premium"],
  highlights: [
    "Unlimited pages (fair-use backlog)",
    "Multivariate testing (MVT)",
    "Personalization & dynamic content",
    "Advanced analytics & integrations",
  ],
};

export default bundle;
