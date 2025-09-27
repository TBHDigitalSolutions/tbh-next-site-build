// src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts

/** Pricing — only source of truth (no startingAt/teasers) */
export type Money = { oneTime?: number; monthly?: number; currency: "USD" };

/** Canonical package data (UI-agnostic; CMS can output this shape later) */
export type PackageBase = {
  /* Identity & taxonomy */
  id: string;                // e.g. "leadgen-routing-distribution"
  slug: string;              // e.g. "lead-routing-distribution"
  service: "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev";
  name: string;
  summary: string;           // 1–2 sentence value prop (card + detail)
  price: Money;              // ONLY authored price
  tags?: string[];
  badges?: string[];
  tier?: string;             // optional cosmetic badge (e.g., "Essential")

  /* Media (optional) */
  image?: { src: string; alt: string };

  /* Detail content */
  icp?: string;              // who it’s for (1 sentence)
  outcomes: string[];        // 4–6 KPI bullets (can be 3 if that’s all you want public)
  includes: Array<{ title: string; items: string[] }>;
  faqs?: Array<{ q: string; a: string }>;
  notes?: string;            // ethics / timeline / caveats (short)

  /* Optional cross-sell / SEO */
  addOnRecommendations?: string[];
  relatedSlugs?: string[];
  seo?: { title?: string; description?: string };
};

export const base: PackageBase = {
  id: "leadgen-routing-distribution",
  slug: "lead-routing-distribution",
  service: "leadgen",
  name: "Lead Routing & Distribution",
  summary:
    "Automated lead routing and distribution so sales reps always get the right leads, faster.",
  price: { oneTime: 2500, monthly: 1000, currency: "USD" },
  tags: ["routing", "assignment", "automation"],
  badges: [],
  tier: "Essential",
  image: {
    src: "/packages/lead-generation/lead-routing-distribution-card.png",
    alt: "Lead routing assignment previews",
  },

  icp: "Sales teams using a CRM who need automated, fair, and fast lead assignment.",

  outcomes: [
    "Faster speed-to-lead",
    "Fair distribution across reps",
    "Consistent performance visibility",
  ],

  includes: [
    {
      title: "Distribution & Assignment",
      items: [
        "Territory-based distribution",
        "Round-robin assignment",
        "Basic assignment rules",
      ],
    },
    {
      title: "Reporting & Telemetry",
      items: [
        "Monthly performance reporting",
        "CRM-ready routing events",
      ],
    },
    {
      title: "Scope & Connectivity",
      items: [
        "Initial setup for one CRM",
        "Primary territory model included",
      ],
    },
  ],

  // No public FAQs provided — add later if needed
  faqs: undefined,

  notes:
    "Initial setup includes configuration for one CRM and one primary territory model.",

  addOnRecommendations: [],
  relatedSlugs: [],

  seo: {
    title: "Lead Routing & Distribution",
    description:
      "Automate lead assignment with territories, round-robin, rules, and reporting.",
  },
};
