import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-event-enterprise",
  service: "leadgen",
  name: "Enterprise Event Platform",
  summary:
    "Enterprise-scale program for webinars, virtual events, and hybrid experiences with advanced registration, integrations, and qualification.",
  price: { monthly: 12500, currency: "USD" },
  category: "Event & Experience Marketing",
  subcategory: "Enterprise Events",
  icp: "Large orgs with complex compliance, data, and multi-stakeholder needs.",
  tags: ["enterprise", "webinar", "virtual event", "hybrid", "integrations", "lead capture"],
  badges: ["Enterprise"],
  highlights: [
    "Unlimited event planning & execution (fair use: up to 4 concurrently active)",
    "Advanced attendee management & SLAs",
    "Hybrid & virtual capabilities",
    "Custom integrations & data governance",
    "Dedicated event marketing specialist",
  ],
};

export default bundle;
