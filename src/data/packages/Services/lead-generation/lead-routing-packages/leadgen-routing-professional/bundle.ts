import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-routing-professional",
  service: "leadgen",
  name: "Professional Distribution Platform",
  summary:
    "Advanced, rules-driven routing with skills, geo optimizations, load balancing, and analytics for growing sales orgs.",
  price: { oneTime: 4500, monthly: 2000, currency: "USD" },
  category: "Lead Routing & Distribution",
  subcategory: "Lead Routing",
  icp: "Scaling teams with multiple segments, skills, and territories.",
  tags: ["routing", "skills-based", "load balancing", "analytics", "geo"],
  badges: ["Recommended"],
  highlights: [
    "Skill-based & geo routing",
    "Load balancing & caps",
    "Calendar/working hours awareness",
    "Advanced routing analytics",
  ],
};

export default bundle;
