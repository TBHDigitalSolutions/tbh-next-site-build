// src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts

// src/packages/registry/lead-generation-packages/lead-routing-distribution/base.ts
/**
 * Lead Routing & Distribution — Canonical Package Record
 * =============================================================================
 * This file is the **single source of truth** (SSOT) for all data used to render
 * the Lead Routing & Distribution package across:
 *
 * - PackagesDetailTemplate (hero + page scaffolding)
 * - PackageDetailOverview (super-card body)
 * - Phase sections (1–5) inside PackageDetailOverview
 * - PackageDetailExtras (timeline, requirements, ethics, limits)
 * - Ancillary components (Highlights, Includes, Notes, FAQ, Rails, etc.)
 *
 * Authoring guidelines:
 * - Keep *everything users will read* here. Mappers/selectors can reshape this
 *   object for specific components, but they should not invent new copy.
 * - Prefer simple primitives (strings, numbers) for portability.
 * - When HTML is necessary (e.g., rich “purpose” narrative), keep it short and
 *   conservative to avoid layout surprises.
 *
 * IMPORTANT: Types below intentionally mirror the fields that the UI expects so
 * that TypeScript can catch drift between data and components as they evolve.
 */

/* =============================================================================
 * Shared types (keep framework-agnostic)
 * ========================================================================== */

/** Pricing — single source of truth. */
export type Money = { oneTime?: number; monthly?: number; currency: "USD" };

/** Optional band microcopy shown on detail pages below the price figure. */
export type PriceBand = {
  /** Short marketing line. If omitted, the band shows **no** tagline. */
  tagline?: string;
  /*- "proposal" → “Base price — request proposal”, "final" → “… final after scope” */
  baseNote?: "proposal" | "final";
  /** E.g., "3-month minimum • + ad spend" */
  finePrint?: string;
};

/** Flexible FAQ item (authoring-friendly) */
export type PackageFaq = {
  id?: string | number;
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

/** “What’s included” item; strings recommended, object allows future notes. */
export type IncludeItem = string | { label: string; note?: string };

/** “What’s included” group */
export type IncludeGroup = {
  title: string;
  items: IncludeItem[];
};

/** Optional tabular includes (legacy/alt renderer); kept simple for portability. */
export type IncludesTable = {
  caption?: string;
  columns: Array<{ id: string; label: string }>;
  rows: Array<{ id: string; label: string; values: Record<string, boolean | string> }>;
};

/** Optional per-phase copy overrides (titles/taglines shown by headers). */
export type PhaseCopy = {
  phase1?: { title?: string; tagline?: string };
  phase2?: { title?: string; tagline?: string };
  phase3?: {
    title?: string;
    tagline?: string;
    includesTitle?: string;
    includesSubtitle?: string;
    highlightsTitle?: string;
    highlightsTagline?: string;
  };
  phase4?: { title?: string; tagline?: string };
  phase5?: { title?: string; tagline?: string };
};

/** Canonical package data (single source of truth) */
export type PackageBase = {
  /* --------------------------- Identity & taxonomy ------------------------ */
  id: string;                 // e.g. "leadgen-routing-distribution"
  slug: string;               // e.g. "lead-routing-distribution"
  service: "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev";
  category?: string;          // optional high-level category (for templates/SEO)
  name: string;               // display name
  tier?: string;              // cosmetic badge (“Essential”, “Pro”)
  tags?: string[];
  badges?: string[];

  /* --------------------------------- Hero -------------------------------- */
  /** 1–2 sentence value proposition (hero subtitle + card summary). */
  summary: string;
  /** 1–3 short paragraphs for detail body/hero. */
  description?: string;
  /** Optional hero/preview image. */
  image?: { src: string; alt: string };

  /* ------------------------------- Pricing -------------------------------- */
  /** Canonical price (detail band + “starting at” teaser). */
  price: Money;
  /** Detail band microcopy (optional). */
  priceBand?: PriceBand;

  /* ------------------------- Phase 2 — Why section ------------------------ */
  /** Common challenges this solves (bullets). */
  painPoints?: string[];
  /** Narrative of success (rich HTML allowed for short markup). */
  purposeHtml?: string;
  /** ICP (one sentence, also echoed in Phase 1 if desired). */
  icp?: string;
  /** KPI-style outcomes (3–6 bullets). */
  outcomes: string[];

  /* ------------------------ Phase 3 — What you get ------------------------ */
  /** Highlights/features (top 5 may appear on cards elsewhere). */
  features?: Array<string | { label: string; icon?: string }>;
  /** Grouped inclusions (primary renderer). */
  includes: IncludeGroup[];
  /** Optional tabular inclusions (fallback/legacy). */
  includesTable?: IncludesTable;
  /** Optional deliverables (simple bullets; may render as aside). */
  deliverables?: string[];

  /* --------------------- Phase 4 — Details & trust extras ----------------- */
  /** Access/integrations needed. */
  requirements?: string[];
  /** Setup/launch/ongoing cadence. */
  timeline?: { setup?: string; launch?: string; ongoing?: string };
  /** Ethical guardrails / limits. */
  ethics?: string[];
  /** Small-print note placed under includes or in notes. */
  notes?: string;

  /* ---------------------- Phase 5 — Next step / support ------------------- */
  /** FAQs (q/a or question/answer). */
  faqs?: PackageFaq[];
  /** Cross-sell. Use slugs; presentation layer will resolve. */
  relatedSlugs?: string[];
  /** Add-on recommendations (slugs). */
  addOnRecommendations?: string[];

  /* ------------------------------- SEO / Meta ----------------------------- */
  seo?: { title?: string; description?: string };

  /* ----------------------------- Optional copy ---------------------------- */
  /** Optional per-phase header/title/tagline overrides. */
  copy?: PhaseCopy;
};

/* =============================================================================
 * Canonical data (exported)
 * ========================================================================== */

export const base: PackageBase = {
  /* ------------------------- Identity & taxonomy ------------------------- */
  id: "leadgen-routing-distribution",
  slug: "lead-routing-distribution",
  service: "leadgen",
  category: "Lead Generation",
  name: "Lead Routing & Distribution",
  tier: "Essential",
  tags: ["routing", "assignment", "automation"],
  badges: [],

  /* --------------------------------- Hero -------------------------------- */
  summary:
    "Automated lead routing so the right rep gets the right lead in seconds — fairly, transparently, and at scale.",
  description:
    "We configure fair, transparent routing that respects territories and capacity, logs every handoff to your CRM for auditability, and ships with lightweight dashboards so RevOps can track performance and iterate safely.",
  image: {
    src: "/packages/lead-generation/lead-routing-distribution-card.png",
    alt: "Lead routing assignment previews",
  },

  /* ------------------------------- Pricing -------------------------------- */
  price: { oneTime: 2500, monthly: 1000, currency: "USD" },
  priceBand: {
    tagline: "Flat monthly fee with transparent setup — built for RevOps velocity.",
    baseNote: "proposal",
    finePrint: "3-month minimum • + ad spend (if applicable)",
  },

  /* ------------------------- Phase 2 — Why section ------------------------ */
  painPoints: [
    "Leads sit idle while reps are busy or off-shift.",
    "Uneven distribution across territories and teams.",
    "Duplicate or conflicting assignments create confusion.",
    "Limited visibility into who got what and why.",
    "Manual triage doesn't scale and is error-prone.",
  ],
  purposeHtml:
    "<p><strong>What good looks like:</strong> New leads are assigned within seconds to the <em>right</em> rep, capacity is respected, and every decision is logged to your CRM for audit and coaching. Revenue teams get speed and fairness; leadership gets visibility and control.</p>",
  icp: "Sales-led B2B teams running Salesforce or HubSpot that need fair, fast, and auditable lead assignment.",
  outcomes: [
    "↑ Speed-to-lead (seconds, not minutes)",
    "↑ Fair distribution across teams/territories",
    "↓ Lead leakage & duplicate assignments",
    "↑ SLA adherence and follow-up consistency",
    "↑ Visibility with CRM-side routing events",
  ],

  /* ------------------------ Phase 3 — What you get ------------------------ */
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
  // Optional table fallback (UI will ignore if groups are present unless preferTable=true)
  includesTable: {
    caption: "What’s included",
    columns: [{ id: "pkg", label: "Lead Routing & Distribution" }],
    rows: [
      { id: "dist-territory", label: "Territory-based distribution", values: { pkg: true } },
      { id: "dist-rr", label: "Round-robin assignment", values: { pkg: true } },
      { id: "rules-starter", label: "Assignment rule library (starter set)", values: { pkg: true } },
      { id: "conflict-checks", label: "Account-owner conflict checks", values: { pkg: true } },
      { id: "events-crm", label: "Routing decision events written to CRM", values: { pkg: true } },
      { id: "perf-dash", label: "Monthly performance dashboard (starter)", values: { pkg: true } },
      { id: "scope-1crm", label: "Initial setup for one CRM", values: { pkg: true } },
      { id: "territory-model", label: "Primary territory model included", values: { pkg: true } },
    ],
  },
  deliverables: [
    "Configured routing rules & primary territory model",
    "CRM-side routing event logging & starter dashboards",
    "Admin playbook & training session",
  ],

  /* --------------------- Phase 4 — Details & trust extras ----------------- */
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
  notes:
    "Initial setup includes configuration for one CRM and one primary territory model. Advanced experiments, enrichment, and multi-CRM are add-ons.",

  /* ---------------------- Phase 5 — Next step / support ------------------- */
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
  relatedSlugs: ["lead-scoring", "marketing-ops-audit"],
  addOnRecommendations: ["sla-alerting", "multi-crm-support"],

  /* ------------------------------- SEO / Meta ----------------------------- */
  seo: {
    title: "Lead Routing & Distribution",
    description:
      "Automate lead assignment with territories, round-robin, guardrails, and CRM-level audit logging.",
  },

  /* ----------------------------- Optional copy ---------------------------- */
  copy: {
    phase1: {
      title: "Lead Routing & Distribution",
      tagline: "Fair, fast, auditable assignment that scales with your team",
    },
    phase2: {
      title: "Why you need this",
      tagline: "Common problems, purpose & outcomes",
    },
    phase3: {
      title: "What you get",
      tagline: "Highlights, inclusions, and deliverables",
      includesTitle: "What’s included",
      includesSubtitle: "Everything that ships with this package.",
      highlightsTitle: "Highlights",
      highlightsTagline: "Top features at a glance",
    },
    phase4: {
      title: "Details & Trust",
      tagline: "Timeline, requirements, and guardrails",
    },
    phase5: {
      title: "What’s next",
      tagline: "How to proceed and what else to explore",
    },
  },
};
