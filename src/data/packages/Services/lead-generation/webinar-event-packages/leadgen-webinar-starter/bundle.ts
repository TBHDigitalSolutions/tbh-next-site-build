import type { ServicePackage } from "../../../_types/packages.types";

const bundle: ServicePackage = {
  id: "leadgen-webinar-starter",
  service: "leadgen",
  name: "Webinar Starter Package",
  summary:
    "Plan, promote, and deliver a single professional webinar with registration, email promo, and post-event reporting.",
  price: { oneTime: 3500, currency: "USD" }, // per webinar; media/tool fees billed separately
  category: "Event & Experience Marketing",
  subcategory: "Webinars",
  icp: "Teams launching their first webinar or needing a turnkey, one-off execution.",
  tags: ["webinar", "event", "registration", "email", "automation"],
  badges: ["Popular"],
  highlights: [
    "Turnkey planning & execution (single webinar)",
    "Registration page & email promo sequence",
    "Platform configuration and dry run",
    "Post-event report & next-step recommendations",
  ],
};

export default bundle;
