import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-nurture-essential",
  service: "leadgen",
  name: "Essential Nurturing Package",
  summary:
    "Foundational lead nurturing with 5 automated email sequences, simple triggers, and monthly reporting to keep leads warm and moving.",
  price: { oneTime: 3500, monthly: 1500, currency: "USD" },
  category: "Lead Nurturing",
  subcategory: "Nurturing",
  icp: "Small teams launching or formalizing basic email nurturing and follow-ups.",
  tags: ["nurture", "email", "automation", "drip", "CRO"],
  badges: ["Starter"],
  highlights: [
    "5 automated sequences (welcome, content, re-engage, webinar, trial)",
    "Basic trigger logic and timing controls",
    "Template design & copy polish",
    "Monthly performance reporting",
  ],
};

export default bundle;
