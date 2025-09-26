import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-offer-starter",
  service: "leadgen",
  name: "Lead Magnet Starter Kit",
  summary:
    "Create three high-converting offers with matching landing pages, basic A/B tests, and performance tracking. Ideal for teams kicking off lead capture.",
  price: { oneTime: 4500, currency: "USD" },
  category: "Offer Strategy",
  subcategory: "Offers & Lead Magnets",
  icp: "Small businesses or new programs needing proven offers quickly.",
  tags: ["lead magnets", "landing pages", "A/B testing", "email automation"],
  badges: ["Popular"],
  highlights: [
    "3 lead magnets produced",
    "Conversion-optimized landing pages",
    "Basic A/B testing setup",
    "Email sequence integration",
  ],
};

export default bundle;
