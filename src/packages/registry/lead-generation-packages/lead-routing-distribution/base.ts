// src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts

/** Pricing — only source of truth (no startingAt/teasers) */
export type Money = { oneTime?: number; monthly?: number; currency: "USD" };

/** Flexible FAQ item (authoring-friendly) */
export type PackageFaq = {
  id?: string | number;
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

/** “What’s included” group */
export type IncludeGroup = {
  title: string;
  items: string[];
};

/** Canonical package data (single source of truth) */
export type PackageBase = {
  /* Identity & taxonomy */
  id: string;                       // e.g. "leadgen-routing-distribution"
  slug: string;                     // e.g. "lead-routing-distribution"
  service: "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev";
  name: string;
  tier?: string;                    // cosmetic badge (“Essential”, “Pro”)
  tags?: string[];
  badges?: string[];
  tier?: string;              // optional cosmetic badge (e.g., "Essential")

  /* Media (optional) */
  image?: { src: string; alt: string };

  /* Detail content */
  icp?: string;               // who it’s for (1 sentence)
  outcomes: string[];         // 3–6 KPI bullets
  includes: Array<{ title: string; items: string[] }>;

  /** Optional deeper details (used by PackageDetailExtras) */
  deliverables?: string[];
  timeline?: { setup?: string; launch?: string; ongoing?: string };
  ethics?: string[];

  /** FAQs can be authored with q/a or question/answer */
  faqs?: PackageFaq[];

  /** Short notes / caveats */
  notes?: string;

  /* Optional cross-sell / SEO */
  addOnRecommendations?: string[];
  relatedSlugs?: string[];
  seo?: { title?: string; description?: string };
};

/* --------------------------------- Data ---------------------------------- */

export const base: PackageBase = {
  /* ------------------------- Identity & taxonomy ------------------------- */
  id: "leadgen-routing-distribution",
  slug: "lead-routing-distribution",
  service: "leadgen",
  name: "Lead Routing & Distribution",
  summary:
    "Automated lead routing so the right rep gets the right lead in seconds — fairly, transparently, and at scale.",
  description:
    "We configure fair, transparent routing that respects territories and capacity, logs every handoff to your CRM for auditability, and ships with lightweight dashboards so RevOps can track performance and iterate safely.",
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
    "↑ Speed-to-lead (seconds, not minutes)",
    "↑ Fair distribution across teams/territories",
    "↓ Lead leakage & duplicate assignments",
    "↑ SLA adherence and follow-up consistency",
    "↑ Visibility with CRM-side routing events",
  ],

  /* ------------------------------ Phase 3 -------------------------------- */
  features: [
    "Territory routing by region, segment, or book of business",
    "Round-robin with catch-up logic & out-of-office handling",
    "Daily caps / load balancing to prevent over-assignment",
    "Account-owner lookups & conflict guardrails",
    "Duplicate suppression and “do-not-route” lists",
    "CRM write-backs + dashboards for audit & performance",
  ],

  includes: [
    {
      title: "Distribution & Assignment",
      items: [
        "Territory-based distribution",
        "Round-robin assignment",
        "Assignment rule library (starter set)",
        "Account-owner conflict checks",
      ],
    },
    {
      title: "Reporting & Telemetry",
      items: [
        "Routing decision events written to CRM",
        "Monthly performance dashboard (starter)",
      ],
    },
    {
      title: "Scope & Connectivity",
      items: ["Initial setup for one CRM", "Primary territory model included"],
    },
  ],

  /** Optional deeper details (rendered when present) */
  deliverables: [
    "Configured routing rules & primary territory model",
    "CRM-side routing event logging & starter dashboards",
    "Admin playbook & training session",
  ],
  requirements: [
    "CRM admin access (Salesforce or HubSpot)",
    "Active reps list with emails & territories",
    "Territory model / ownership source of truth (spreadsheet or object model)",
    "Business rules for assignment (owner, queues, exceptions)",
    "Sandbox access & API credentials (if applicable)",
    "Change-approver + business hours/holiday calendar",
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

  /* --------------------------------- FAQs ------------------------------- */
  faqs: [
    {
      id: "capacity",
      question: "Can we cap leads per rep per day?",
      answer:
        "Yes. We support daily caps with catch-up logic so fairness is maintained while preventing overload.",
    },
    {
      id: "oOO",
      question: "How do you handle vacations or out-of-office?",
      answer:
        "We toggle OOO on reps and route to alternates with audit logs. The system catches them up on return if you enable catch-up.",
    },
    {
      id: "tools",
      question: "Which CRMs are supported?",
      answer:
        "Salesforce and HubSpot are supported out-of-the-box. Others can be scoped as an add-on.",
    },
    {
      id: "testing",
      question: "Can we A/B test routing rules?",
      answer:
        "Submit a ticket with new rules/territories. Simple changes land within 1–3 business days.",
    },
    {
      id: "fairness",
      question: "How do you keep distribution fair?",
      answer:
        "We use a round-robin rotation and guardrails to prevent double-assignments and account-owner conflicts.",
    },
    {
      id: "ai",
      question: "What does AI-powered routing mean here?",
      answer:
        "We combine intent, fit, and engagement signals to score leads and bias routing toward the highest-propensity rep or team while honoring rules.",
    },
    {
      id: "integrations",
      question: "Can you integrate with our data warehouse or CDP?",
      answer:
        "Yes. We support MAP/CDP/warehouse/webhooks for scoring inputs and write-backs for audit and analytics.",
    },
    {
      id: "governance",
      question: "How are changes approved and tracked?",
      answer:
        "All rule changes are versioned with owner, timestamp, and reason. We maintain rollback points and a change log.",
    },
  ],

  /* ------------------------------ Footnotes ----------------------------- */
  notes:
    "Initial setup includes configuration for one CRM and one primary territory model. Advanced experiments, enrichment, and multi-CRM are add-ons.",

  addOnRecommendations: [],
  relatedSlugs: [],

  seo: {
    title: "Lead Routing & Distribution",
    description:
      "Automate lead assignment with territories, round-robin, guardrails, and CRM-level audit logging.",
  },
};
