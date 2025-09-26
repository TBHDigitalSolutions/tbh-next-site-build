import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-testing-starter",
  service: "leadgen",
  name: "Conversion Testing Starter",
  summary:
    "Entry-level A/B testing program with two tests per month focused on quick, high-impact wins (forms, CTAs, headlines) and clear reporting.",
  price: { monthly: 2500, currency: "USD" },
  category: "Conversion Optimization",
  subcategory: "A/B Testing",
  icp: "Businesses beginning systematic testing with modest traffic volumes.",
  tags: ["A/B testing", "CRO", "forms", "CTA", "analytics"],
  badges: ["Popular"],
  highlights: [
    "2 structured A/B tests per month",
    "Form & CTA optimization",
    "Testing strategy & backlog",
    "Performance reporting & insights",
  ],
};

export default bundle;
