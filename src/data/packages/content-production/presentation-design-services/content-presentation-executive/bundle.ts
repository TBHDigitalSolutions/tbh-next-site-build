import type { ServicePackage } from ../../../_types/packages.types;
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-presentation-executive",
  service: "content",
  name: "Executive Presentation Package",
  tier: "Executive",
  summary:
    "Board- and investor-ready storytelling with high-impact design, custom data visualization, and coaching for confident delivery.",
  price: { oneTime: 8500, currency: "USD" },
  badges: ["Premium"],
  tags: ["presentations", "executive", "investor", "board", "dataviz"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,
};

export default pkg;