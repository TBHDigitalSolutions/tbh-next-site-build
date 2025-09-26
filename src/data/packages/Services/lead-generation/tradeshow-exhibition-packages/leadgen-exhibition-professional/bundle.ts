import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-exhibition-professional",
  service: "leadgen",
  name: "Professional Exhibition System",
  summary:
    "Comprehensive trade show program with advanced booth setup guidance, multi-touch lead capture, integrated follow-up campaigns, and ROI tracking.",
  price: { oneTime: 8500, monthly: 2500, currency: "USD" }, // per show + program management
  category: "Event & Experience Marketing",
  subcategory: "Trade Shows & Exhibitions",
  icp: "Regular exhibitors that need consistent execution and optimization across shows.",
  tags: ["trade show", "exhibition", "lead capture", "campaigns", "ROI tracking"],
  badges: ["Recommended"],
  highlights: [
    "Advanced booth design & setup guidance",
    "Multi-touch lead capture (scan, QR, forms)",
    "Integrated email sequences & sales routing",
    "ROI dashboard & optimization cadence",
  ],
};

export default bundle;
