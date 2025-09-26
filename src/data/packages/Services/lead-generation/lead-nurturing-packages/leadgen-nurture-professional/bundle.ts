import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-nurture-professional",
  service: "leadgen",
  name: "Professional Nurturing System",
  summary:
    "Multi-channel nurturing with advanced triggers, segmentation, and personalization across email, SMS, and social retargeting.",
  price: { oneTime: 6500, monthly: 3500, currency: "USD" },
  category: "Lead Nurturing",
  subcategory: "Nurturing",
  icp: "Companies with longer sales cycles and multiple segments or products.",
  tags: ["nurture", "segmentation", "personalization", "SMS", "retargeting"],
  badges: ["Recommended"],
  highlights: [
    "10+ sequences with branching",
    "Advanced behavioral triggers",
    "Cross-channel (email/SMS/retargeting)",
    "Advanced segmentation & targeting",
  ],
};

export default bundle;
