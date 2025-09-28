// src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts

/** Pricing — only source of truth (no startingAt/teasers) */
export type Money = { oneTime?: number; monthly?: number; currency: "USD" };

/** Canonical package data (UI-agnostic; CMS can output this shape later) */
export type PackageBase = {
  /* Identity & taxonomy */
  id: string; // e.g. "leadgen-routing-distribution"
  slug: string; // e.g. "lead-routing-distribution"
  service: "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev";
  name: string;
  summary: string; // 1–2 sentence value prop (card + detail)
  price: Money; // ONLY authored price
  tags?: string[];
  badges?: string[];
  tier?: string; // optional cosmetic badge (e.g., "Essential")

  /* Media (optional) */
  image?: { src: string; alt: string };

  /* Detail content */
  icp?: string; // who it’s for (1 sentence)
  outcomes: string[]; // 3–6 KPI bullets
  includes: Array<{ title: string; items: string[] }>;

  /** Optional deeper details (used by PackageDetailExtras) */
  deliverables?: string[];
  timeline?: { setup?: string; launch?: string; ongoing?: string };
  ethics?: string[];

  faqs?: Array<{ id?: string | number; q?: string; a?: string; question?: string; answer?: string }>;
  notes?: string; // ethics / timeline / caveats (short)

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
      items: ["Monthly performance reporting", "CRM-ready routing events"],
    },
    {
      title: "Scope & Connectivity",
      items: ["Initial setup for one CRM", "Primary territory model included"],
    },
  ],

  /** Optional deeper details (rendered when present) */
  deliverables: [
    "Configured routing rules and primary territory model",
    "Routing event logging into CRM with basic dashboards",
    "Admin playbook and training session",
  ],
  timeline: {
    setup: "3–5 business days",
    launch: "Pilot validation with sample leads, then go-live",
    ongoing: "Monthly performance review and rule tweaks",
  },
  ethics: [
    "Routing follows declared territory/assignment rules",
    "AI-based optimization and custom integrations are out-of-scope for the Essential tier",
  ],

  // Public FAQs (optional) — add later if needed
  faqs: [
    { id: "skills", question: "How do you maintain skill tags?", answer: "We maintain a source-of-truth picklist for skills/segments and sync it to routing rules with monthly reviews." },
    { id: "capacity", question: "Can we cap leads per rep per day?", answer: "Yes. We set daily caps with catch-up logic so fairness remains over the week while preventing overload." },
    { id: "testing", question: "Can we A/B test routing rules?", answer: "Yes—Professional supports controlled experiments to compare rule outcomes without impacting SLAs." },
    { id: "tools", question: "Which CRMs are supported?", answer: "Salesforce and HubSpot are supported out-of-the-box. Others may be scoped as an add-on." },
    { id: "changes", question: "How do we request routing changes?", answer: "Submit a ticket with new rules/territories. Simple changes land within 1–3 business days." },
    { id: "fairness", question: "How do you keep distribution fair?", answer: "We use a round-robin rotation and guardrails to prevent double-assignments and account-owner conflicts." },
    { id: "ai", question: "What does AI-powered routing mean here?", answer: "We combine intent, fit, and engagement signals to score leads and bias routing toward the highest-propensity rep or team while honoring rules." },
    { id: "integrations", question: "Can you integrate with our data warehouse or CDP?", answer: "Yes. We support MAP/CDP/warehouse/webhooks for scoring inputs and write-backs for audit and analytics." },
    { id: "governance", question: "How are changes approved and tracked?", answer: "All rule changes are versioned with owner, timestamp, and reason. We keep rollback points and a change log." },
  ],

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
