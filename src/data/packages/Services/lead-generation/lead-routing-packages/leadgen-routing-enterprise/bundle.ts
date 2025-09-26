import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-routing-enterprise",
  service: "leadgen",
  name: "Enterprise Routing Intelligence",
  summary:
    "AI-powered, multi-criteria routing with dynamic optimization, rich analytics, and custom integrations for complex global orgs.",
  price: { oneTime: 8500, monthly: 3500, currency: "USD" },
  category: "Lead Routing & Distribution",
  subcategory: "Lead Routing",
  icp: "Large organizations with multiple products, regions, and sales motions.",
  tags: ["AI routing", "dynamic optimization", "multi-criteria", "governance", "integrations"],
  badges: ["Premium"],
  highlights: [
    "AI-assisted rule scoring",
    "Dynamic optimization & drift detection",
    "Multi-criteria (intent, fit, availability)",
    "Dedicated routing specialist & custom integrations",
  ],
};

export default bundle;
