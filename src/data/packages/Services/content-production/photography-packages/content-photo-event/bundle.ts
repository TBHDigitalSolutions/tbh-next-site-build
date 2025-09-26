import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-photo-event",
  service: "content",
  name: "Event Photography Package",
  summary:
    "Full event coverage (up to 8 hours) including candid, staged, speaker, and interaction shots with a rapid 48-hour edit turnaround.",
  price: { oneTime: 2500, currency: "USD" },
  tags: ["photography", "event", "conference"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "48-hour edit turnaround",
};

export default pkg;