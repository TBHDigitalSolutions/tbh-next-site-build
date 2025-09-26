import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-video-training-system",
  service: "content",
  name: "Training Video System",
  summary:
    "Four 5–10 minute training videos per month with instructional design, screen capture or live action, interactive elements, and LMS-ready exports.",
  price: { monthly: 8500, currency: "USD" },
  tags: ["video", "training", "LMS", "instructional-design"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Standard release cadence agreed per curriculum",
};

export default pkg;