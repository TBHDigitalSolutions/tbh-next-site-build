import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-video-promotional",
  service: "content",
  name: "Promotional Video Package",
  summary:
    "Two 2–3 minute promotional videos per month with scripting, storyboards, professional production, and advanced motion graphics.",
  price: { monthly: 6500, currency: "USD" },
  tags: ["video", "promo", "brand"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Typical delivery 10–15 business days per video",
};

export default pkg;