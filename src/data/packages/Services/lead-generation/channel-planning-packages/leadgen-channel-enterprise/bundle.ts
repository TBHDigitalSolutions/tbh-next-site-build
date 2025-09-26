import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-channel-enterprise",
  service: "leadgen",
  name: "Enterprise Channel Optimization",
  summary:
    "Enterprise orchestration with real-time dashboards, advanced attribution analytics, channel-mix optimization models, and weekly optimization calls.",
  price: { monthly: 12500, currency: "USD" },
  category: "Strategy & Planning",
  subcategory: "Channel Planning",
  icp: "Large organizations with complex, multi-region lead ecosystems.",
  tags: ["orchestration", "dashboards", "advanced attribution", "optimization algorithms"],
  badges: ["Premium"],
  highlights: [
    "Real-time performance dashboards",
    "Advanced attribution & cohort analysis",
    "Channel-mix optimization algorithms",
    "Dedicated strategist (weekly cadence)",
  ],
};

export default bundle;
