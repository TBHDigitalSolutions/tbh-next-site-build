// src/data/page/services-pages/marketing-services/martech-automation/index.ts

// --- Central data pools (adjust aliases if your paths differ) ---
import marketingTestimonials from "@/data/testimonials/marketing-services/marketing-services-testimonials";
import { marketingPackages } from "@/data/packages/marketing-services/marketing-packages";
import { marketingAddons } from "@/data/packages/marketing-services/marketing-addons";
import { marketingFeatured } from "@/data/packages/marketing-services/marketing-featured";
import { marketingServicesItems } from "@/data/portfolio/marketing-services/marketing-services-items";
import { marketingServicesFeatured } from "@/data/portfolio/marketing-services/marketing-services-featured";
import { marketingCases } from "@/data/caseStudies/marketing-services/marketing-services-cases";

// --- Shared selectors for central data sources ---
import { selectPortfolio, selectTestimonials, selectPackages } from "@/data/selectors";

// Use selectors to get filtered data for this specific service
const portfolioItems = selectPortfolio({ 
  hub: "marketing-services", 
  service: "martech-automation", 
  featured: true, 
  limit: 9 
});

const testimonials = selectTestimonials({ 
  hub: "marketing-services", 
  service: "martech-automation", 
  limit: 3 
});

const packages = selectPackages({ 
  hub: "marketing-services", 
  service: "martech-automation", 
  featured: true 
});

export default {
  kind: "service",
  slug: "martech-automation",

  /* ============================================================
     1) HERO
  ============================================================ */
  hero: {
    content: {
      eyebrow: "Marketing",
      title: "Martech & Automation",
      subtitle:
        "CRM, CDP, and marketing automation that actually talk to each other. Clean data, reliable journeys, and measurable lift.",
      primaryCta: { label: "Request stack audit", href: "/contact" },
      secondaryCta: { label: "See resources", href: "#resources" },
    },
    badges: ["HubSpot", "Salesforce", "Klaviyo", "Segment", "Zapier/Workato"],
  },

  /* ============================================================
     2) SEARCH (domain-specific search banner)
  ============================================================ */
  search: {
    placeholder: "Search integrations, lifecycle journeys, playbooks, and case studies…",
    index: "services",
    filters: { hub: "marketing-services", service: "martech-automation" },
  },

  /* ============================================================
     3) OVERVIEW INTRO (TwoColumnSection / Video)
  ============================================================ */
  twoColVideo: {
    variant: "text",
    title: "Unify your stack. Automate the busywork. Prove the impact.",
    description:
      "We map your data sources, stand up clean pipelines, and orchestrate lifecycle programs that convert—without breaking every time you add a new tool.",
    bullets: [
      "Source-of-truth contacts & events",
      "Lifecycle journeys that don't stall",
      "Reporting you can trust",
    ],
    cta: { label: "Plan a 60-day enablement sprint", href: "/book" },
  },

  /* ============================================================
     4) Services & Capabilities + Expandable Bullets (combined)
  ============================================================ */
  servicesAndCapabilitiesExpandable: {
    title: "What's included",
    description:
      "Strategy → implementation → enablement. We leave you with docs, governance, and dashboards.",
    pillars: [
      {
        id: "platform-architecture",
        title: "Platform Strategy & Architecture",
        description: "Choose the right tools and define how they share data.",
        deliverables: [
          "System diagram & data contracts",
          "Event & object schema",
          "Vendor evaluation & migration plan",
        ],
      },
      {
        id: "implementation",
        title: "Implementation & Integrations",
        description: "Wire up CRM/CDP/ESP/ads with stable, debuggable syncs.",
        deliverables: [
          "Native & middleware integrations",
          "Webhooks, ETL/ELT jobs",
          "Error handling & retries",
        ],
      },
      {
        id: "journeys",
        title: "Journeys & Lifecycle",
        description: "Acquisition → onboarding → expansion → save.",
        deliverables: [
          "Triggered flows & branching",
          "Templates & personalization",
          "A/B testing & holdouts",
        ],
      },
      {
        id: "data-governance",
        title: "Data & Governance",
        description: "Consent, deduplication, and naming that scales.",
        deliverables: [
          "Consent/region policies",
          "Identity resolution & dedupe",
          "Naming/UTM standards",
        ],
      },
      {
        id: "ops-enablement",
        title: "Ops & Enablement",
        description: "Runbooks, playbooks, and training to stay unblocked.",
        deliverables: [
          "Admin runbooks",
          "Campaign playbooks",
          "Team training & office hours",
        ],
      },
    ],
    // Quick links (non-expandable)
    bullets: [
      { label: "HubSpot Implementation", href: "#hubspot" },
      { label: "Salesforce Integration", href: "#salesforce" },
      { label: "Klaviyo Flows", href: "#klaviyo" },
      { label: "Segment/Events", href: "#segment" },
      { label: "Lead Scoring & Routing", href: "#lead-scoring" },
    ],
    // Expandable recognizers (former L3/L4 on-page)
    expandable: [
      {
        id: "hubspot",
        title: "HubSpot Setup & Migrations",
        summary:
          "CRM objects, pipelines, and workflows configured to your sales motion with clean permissions.",
        details: [
          "Custom objects & pipelines",
          "Property taxonomy & field governance",
          "Sales <> marketing handoff & SLAs",
        ],
        cta: { label: "Get HubSpot audit", href: "/contact" },
        tag: "CRM",
      },
      {
        id: "salesforce",
        title: "Salesforce & RevOps Integrations",
        summary:
          "Marketing → Salesforce sync that won't silently fail at quarter-end.",
        details: [
          "Marketing Cloud/Pardot/Kafka/Mulesoft patterns",
          "Lead/account matching & dedupe",
          "Routing, SLAs, & error monitoring",
        ],
        tag: "CRM",
      },
      {
        id: "klaviyo",
        title: "Klaviyo & ESP Flows",
        summary:
          "Lifecycle email/SMS with triggered journeys and robust segmentation.",
        details: [
          "Signup/onboarding/cart/browse flows",
          "Profile traits & event triggers",
          "Deliverability & warmup plans",
        ],
        tag: "ESP",
      },
      {
        id: "segment",
        title: "Segment/Events & CDP",
        summary:
          "Event schemas, sources/destinations, and privacy-safe routing.",
        details: [
          "Track/identify/group specs",
          "Device → server-side collection",
          "Forwarding to ads/warehouse",
        ],
        tag: "CDP",
      },
      {
        id: "lead-scoring",
        title: "Lead Scoring & Routing",
        summary:
          "Behavioral + firmographic scoring with fair, fast routing.",
        details: [
          "Rules/ML hybrid scoring",
          "Round-robin & territory routing",
          "Feedback loop & win analysis",
        ],
        tag: "RevOps",
      },
      {
        id: "consent-privacy",
        title: "Consent & Privacy Controls",
        summary:
          "GDPR/CCPA ready with regional enforcement and audit trails.",
        details: [
          "CMP integration & consent mode",
          "Regional policy routing",
          "Data retention & subject requests",
        ],
        tag: "Governance",
      },
      {
        id: "attribution-plumbing",
        title: "Attribution Plumbing",
        summary:
          "UTMs, identity, and cost/revenue syncs for decision-ready ROAS.",
        details: [
          "UTM standards & auto-tagging",
          "Ad platform → CRM revenue sync",
          "Modeled vs. last-touch reporting",
        ],
        tag: "Attribution",
      },
    ],
    defaultOpen: 1,
    analyticsId: "svc-martech-automation",
  },

  /* ============================================================
     5) Portfolio (visual examples ONLY) - Using selector data
     Choose variant: "web" | "video" | "demo"
  ============================================================ */
  portfolio: {
    variant: "web",
    title: "Selected Martech Work",
    subtitle:
      "Examples of journey orchestration, data schemas, and integration patterns.",
    items: portfolioItems?.length
      ? portfolioItems
      : (marketingServicesFeatured?.length
        ? marketingServicesFeatured
        : marketingServicesItems), // fallback chain
  },

  /* ============================================================
     6) Module Carousel (Resources & Case Studies) — includes CASE STUDIES
  ============================================================ */
  modules: {
    title: "Resources & Case Studies",
    subtitle: "Playbooks, templates, and deep dives into lifecycle ops.",
    items: [
      // Case studies (long-form)
      ...marketingCases.map((c: any) => ({
        title: c.title,
        description: c.summary,
        href: c.href || c.url || "/work",
        kind: "case-study",
        meta: c.metrics,
      })),
      // Practical resources
      {
        title: "Lifecycle Mapping Template",
        description: "Visualize triggers, branches, and measurement for every journey.",
        href: "/playbooks/lifecycle-mapping-template",
        kind: "template",
      },
      {
        title: "Lead Routing Runbook",
        description: "Document owners, SLAs, and failure handling.",
        href: "/playbooks/lead-routing-runbook",
        kind: "playbook",
      },
      {
        title: "Integration Error Triage",
        description: "A lightweight process to detect, alert, and resolve sync failures.",
        href: "/playbooks/integration-triage",
        kind: "playbook",
      },
    ],
  },

  /* ============================================================
     7) Pricing + Comparison
     (Starting prices; final after scope consultation)
  ============================================================ */
  pricing: {
    title: "Plans & Pricing",
    tiers: [
      {
        id: "enablement",
        name: "Enablement",
        price: 2500,
        period: "monthly",
        features: [
          "Stack audit & prioritization",
          "Core integrations & tracking fixes",
          "Monthly ops support",
        ],
        cta: { label: "Start", href: "/contact" },
        popular: true,
      },
      {
        id: "growth",
        name: "Growth",
        price: 4500,
        period: "monthly",
        features: [
          "Lifecycle journeys (3–5)",
          "Role-based dashboards",
          "Bi-weekly enhancements",
        ],
        cta: { label: "Scale", href: "/contact" },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        features: [
          "CDP & warehouse integration",
          "Advanced governance & SLAs",
          "Dedicated RevOps/MAE",
        ],
        cta: { label: "Discuss", href: "/contact" },
      },
    ],
    comparison: {
      columns: ["Enablement", "Growth", "Enterprise"],
      rows: [
        { label: "Integrations", values: ["Core", "Core + advanced", "Custom"] },
        { label: "Journeys", values: ["1–2", "3–5", "Custom"] },
        { label: "Data Warehouse/CDP", values: ["—", "Optional", "Included/Custom"] },
        { label: "Governance", values: ["Light", "Standard", "Advanced"] },
        { label: "Reporting", values: ["Essential KPIs", "Role-based", "Exec & finance"] },
      ],
    },
    disclaimer:
      "Pricing shown are starting points. Final pricing is determined after a scope consultation.",
  },

  /* ============================================================
     8) Packages & Add-Ons - Using selector data
  ============================================================ */
  packages: {
    title: "Packages & Add-Ons",
    subtitle: "Bundle common enablement needs or add focused enhancements.",
    featured: packages?.featured ?? marketingFeatured ?? [],
    items: packages?.items ?? [
      ...(marketingPackages ?? []),
      ...(marketingAddons ?? []),
    ],
    cta: {
      label: "See full catalog",
      href: "/services/marketing-services/martech-automation/packages",
    },
  },

  /* ============================================================
     9) Testimonials - Using selector data
  ============================================================ */
  testimonials: {
    title: "What clients say",
    subtitle: "Less ops firefighting. More growth.",
    data: testimonials?.length ? testimonials : marketingTestimonials ?? [],
  },

  /* ============================================================
     10) FAQs (buying/implementation objections only)
  ============================================================ */
  faqs: {
    title: "Martech & Automation — FAQs",
    items: [
      {
        question: "Can you work within our existing toolset?",
        answer:
          "Yes. We start with a stack audit and keep the tools that serve you best. We only recommend replacements when there's a clear ROI.",
      },
      {
        question: "Will our data be privacy-compliant?",
        answer:
          "We implement consent mode, regional policies, and governance standards (GDPR/CCPA) with clear documentation and audits.",
      },
      {
        question: "How do you handle integration failures?",
        answer:
          "We design for resilience—error queues, retries, and alerting with runbooks so your team can resolve issues quickly.",
      },
    ],
  },

  /* ============================================================
     11) Final CTA
  ============================================================ */
  cta: {
    title: "Ready to unify your stack and automate growth?",
    primaryCta: { label: "Book a consult", href: "/book" },
    secondaryCta: { label: "Request stack audit", href: "/contact" },
  },
} as const;