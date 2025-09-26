import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-scoring-professional",
  service: "leadgen",
  name: "Professional Scoring System",
  summary:
    "Advanced multi-factor and predictive scoring with ongoing optimization, surfacing sales-ready leads and enabling confident prioritization.",
  price: { oneTime: 6500, monthly: 2500, currency: "USD" },
  category: "Lead Management & Qualification",
  subcategory: "Lead Scoring",
  icp: "Growing sales teams with multiple segments, higher volume, and diverse campaigns.",
  tags: ["lead scoring", "predictive", "attribution", "analytics"],
  badges: ["Recommended"],
  highlights: [
    "Predictive scoring setup (MAP/CDP or custom)",
    "Multi-factor models by segment",
    "Sales readiness & routing signals",
    "Quarterly model refresh & analytics",
  ],
};

export default bundle;
