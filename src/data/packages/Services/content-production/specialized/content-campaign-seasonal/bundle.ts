import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-campaign-seasonal",
  service: "content",
  name: "Seasonal Content Campaign",
  tier: "Campaign",
  summary:
    "Time-sensitive, cross-channel campaign for holidays, events, or launches—strategy, assets, QA, and post-campaign readout.",
  price: { oneTime: 2500, currency: "USD", notes: "Scope-based; typical total $2,500–$7,500 per campaign" },
  tags: ["campaign", "seasonal", "launch", "events", "cross-channel"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Standard timeline 1–3 weeks depending on scope/date",
};

export default pkg;