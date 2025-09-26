import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-video-social-pack",
  service: "content",
  name: "Social Media Video Pack",
  summary:
    "Eight short-form videos per month (15–60s) optimized per platform with music, basic motion, and custom thumbnails.",
  price: { monthly: 3500, currency: "USD" },
  tags: ["video", "social", "short-form"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Typical edit turnaround 3–5 business days per batch",
};

export default pkg;