import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-photo-corporate",
  service: "content",
  name: "Corporate Photography Package",
  summary:
    "Full-day corporate session including professional headshots (up to 15 people), office imagery, and candid lifestyle coverage.",
  price: { oneTime: 3500, currency: "USD" },
  tags: ["photography", "corporate", "brand"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Standard gallery delivery in 5 business days",
};

export default pkg;