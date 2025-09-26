import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-testing-enterprise",
  service: "leadgen",
  name: "Enterprise Testing Platform",
  summary:
    "Enterprise-grade experimentation at scale: parallel workstreams, personalization tests, cross-device/channel coverage, and dedicated CRO specialist.",
  price: { monthly: 8500, currency: "USD" },
  category: "Conversion Optimization",
  subcategory: "A/B Testing",
  icp: "Large organizations with complex funnels, teams, and segmentation needs.",
  tags: ["experimentation platform", "personalization", "governance", "statistics"],
  badges: ["Premium"],
  highlights: [
    "Unlimited tests (fair use; prioritized backlog)",
    "Personalization & audience-level testing",
    "Cross-device/channel orchestration",
    "Dedicated testing specialist",
  ],
};

export default bundle;
