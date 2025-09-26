import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-channel-professional",
  service: "leadgen",
  name: "Professional Channel Management",
  summary:
    "Coordinated multi-channel program (5+ channels) with advanced analysis, cross-channel attribution, and bi-weekly reviews.",
  price: { monthly: 6500, currency: "USD" },
  category: "Strategy & Planning",
  subcategory: "Channel Planning",
  icp: "Growing teams expanding and coordinating multiple lead sources.",
  tags: ["multi-channel", "attribution modeling", "optimization"],
  badges: ["Popular"],
  highlights: [
    "5+ channels coordinated",
    "Advanced performance analysis",
    "Cross-channel attribution modeling",
    "Bi-weekly performance reviews",
  ],
};

export default bundle;
