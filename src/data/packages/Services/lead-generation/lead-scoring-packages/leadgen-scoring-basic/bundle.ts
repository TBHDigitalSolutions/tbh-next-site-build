import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-scoring-basic",
  service: "leadgen",
  name: "Basic Lead Scoring Setup",
  summary:
    "Foundational behavioral + demographic scoring, CRM automation, and a light monthly optimization cadence so sales can prioritize faster.",
  price: { oneTime: 3500, monthly: 1500, currency: "USD" },
  category: "Lead Management & Qualification",
  subcategory: "Lead Scoring",
  icp: "Small teams implementing lead qualification for the first time.",
  tags: ["lead scoring", "CRM", "automation", "qualification"],
  badges: ["Starter"],
  highlights: [
    "Behavioral + demographic scoring model",
    "MAP/CRM integration & automation",
    "Sales-ready thresholds & alerts",
    "Monthly tuning based on performance",
  ],
};

export default bundle;
