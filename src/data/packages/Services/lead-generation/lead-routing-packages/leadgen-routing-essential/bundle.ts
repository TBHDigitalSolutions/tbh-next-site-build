import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-routing-essential",
  service: "leadgen",
  name: "Essential Routing System",
  summary:
    "Automated assignment with territory and round-robin rules, basic SLAs, and monthly reporting so inbound leads reach the right rep quickly.",
  price: { oneTime: 2500, monthly: 1000, currency: "USD" },
  category: "Lead Routing & Distribution",
  subcategory: "Lead Routing",
  icp: "Small sales teams establishing fair, automated lead distribution.",
  tags: ["routing", "round-robin", "territories", "CRM", "SLA"],
  badges: ["Starter"],
  highlights: [
    "Territory & round-robin assignment",
    "Owner, queue, and team rules",
    "Holiday/OOO fallback routing",
    "Monthly performance reporting",
  ],
};

export default bundle;
