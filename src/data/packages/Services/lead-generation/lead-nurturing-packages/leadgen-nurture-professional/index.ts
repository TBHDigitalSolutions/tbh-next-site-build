import bundle from "./bundle";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

export default {
  ...bundle,
  includes,
  outcomes,
  faq: { title: "Professional Nurturing — FAQs", faqs },
  content: { html: narrativeHtml },
};
