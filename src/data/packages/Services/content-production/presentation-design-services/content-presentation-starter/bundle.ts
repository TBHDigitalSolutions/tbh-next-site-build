import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-presentation-starter",
  service: "content",
  name: "Presentation Starter Package",
  tier: "Starter",
  summary:
    "A branded PowerPoint/Slides master, three custom sample decks, an icon/graphic library, and a concise best-practices guide.",
  price: { oneTime: 2500, currency: "USD" },
  tags: ["presentations", "template", "ppt", "google-slides", "brand"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Typical turnaround 1–2 weeks from kickoff",
};

export default pkg;