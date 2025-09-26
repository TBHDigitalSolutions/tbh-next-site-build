import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-offer-professional",
  service: "leadgen",
  name: "Professional Offer System",
  summary:
    "Six offers across the funnel with competitive positioning, advanced A/B testing, incentive design, and ongoing optimization.",
  price: { oneTime: 8500, monthly: 1500, currency: "USD" },
  category: "Offer Strategy",
  subcategory: "Offers & Lead Magnets",
  icp: "Growing companies needing a diverse, always-on offer portfolio.",
  tags: ["MOFU/BOFU", "positioning", "experimentation", "analytics"],
  badges: ["Recommended"],
  highlights: [
    "6 offers across TOFU/MOFU/BOFU",
    "Competitive analysis & positioning",
    "Advanced A/B testing & optimization",
    "Incentive program development",
  ],
};

export default bundle;
