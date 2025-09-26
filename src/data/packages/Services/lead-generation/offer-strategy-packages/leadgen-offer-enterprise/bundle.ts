import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-offer-enterprise",
  service: "leadgen",
  name: "Enterprise Offer Management",
  summary:
    "Unlimited offer development across products and regions with advanced competitive analysis, dynamic optimization, and a dedicated strategist.",
  price: { oneTime: 15000, monthly: 3500, currency: "USD" },
  category: "Offer Strategy",
  subcategory: "Offers & Lead Magnets",
  icp: "Enterprises with multiple product lines, regions, or audiences.",
  tags: ["enterprise", "dynamic optimization", "competitive intel", "governance"],
  badges: ["Premium"],
  highlights: [
    "Unlimited offer creation",
    "Industry-specific offers & compliance",
    "Dynamic optimization program",
    "Dedicated offer strategist",
  ],
};

export default bundle;
