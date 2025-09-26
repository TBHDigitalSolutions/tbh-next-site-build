import type { ServicePackage } from "../../../../_types/packages.types";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const pkg: ServicePackage = {
  id: "content-publish-basic-cms",
  service: "content",
  name: "Basic CMS Package",
  tier: "Basic",
  summary:
    "Weekly website updates, blog posting (4/mo), basic social publishing, and on-page SEO formatting with a monthly report.",
  price: { monthly: 1500, currency: "USD" },
  tags: ["publishing", "cms", "blog", "seo-basics", "social"],

  includes,
  outcomes,
  faqs,
  narrative: narrativeHtml,

  // sla: "Typical updates within 2–3 business days",
};

export default pkg;