import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-event-professional",
  service: "leadgen",
  name: "Professional Event System",
  summary:
    "Monthly webinar or virtual event engine with advanced promotion, cross-channel registration, and automated follow-up.",
  price: { monthly: 6500, currency: "USD" },
  category: "Event & Experience Marketing",
  subcategory: "Webinars & Virtual Events",
  icp: "Teams running recurring events that need predictable lead capture and process.",
  tags: ["webinar", "virtual event", "automation", "nurture", "registration"],
  badges: ["Recommended"],
  highlights: [
    "One event per month (webinar or virtual workshop)",
    "Advanced promotion across email + social + partner lists",
    "Follow-up automation & lead scoring",
    "Bi-weekly performance reviews",
  ],
};

export default bundle;
