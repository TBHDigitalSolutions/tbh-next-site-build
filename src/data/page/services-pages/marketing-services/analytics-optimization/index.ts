// src/data/page/services-pages/marketing-services/analytics-optimization/index.ts

// --- Central data pools (adjust aliases if needed) ---
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
  service: "analytics-optimization", 
  featured: true, 
  limit: 9 
});

const testimonials = selectTestimonials({ 
  hub: "marketing-services", 
  service: "analytics-optimization", 
  limit: 3 
});

const packages = selectPackages({ 
  hub: "marketing-services", 
  service: "analytics-optimization", 
  featured: true 
});

export default {
  kind: "service",
  slug: "analytics-optimization",

  /* ============================================================
     1) HERO
  ============================================================ */
  hero: {
    content: {
      eyebrow: "Marketing",
      title: "Analytics & Optimization",
      subtitle:
        "Trustworthy tracking, clear reporting, and disciplined experimentation. Turn data into compound growth.",
      primaryCta: { label: "Request analytics audit", href: "/contact" },
      secondaryCta: { label: "See resources", href: "#resources" },
    },
    badges: ["GA4", "Server-side Tagging", "CRO", "Attribution"],
  },

  /* ============================================================
     2) SEARCH (domain-specific search banner)
  ============================================================ */
  search: {
    placeholder: "Search analytics topics, CRO tactics, and case studies…",
    index: "services",
    filters: { hub: "marketing-services", service: "analytics-optimization" },
  },

  /* ============================================================
     3) OVERVIEW INTRO (TwoColumnSection / Video)
  ============================================================ */
  twoColVideo: {
    variant: "text",
    title: "Measure what matters—and act on it",
    description:
      "We fix tracking, define an event taxonomy your team can understand, and ship a reporting layer that answers real business questions. Then we run a rigorous experimentation program to turn insights into ROI.",
    bullets: [
      "Data layer & privacy-safe tracking",
      "Decision-ready dashboards",
      "Experimentation & CRO cadence",
    ],
    cta: { label: "Plan a 60-day analytics sprint", href: "/book" },
  },

  /* ============================================================
     4) Services & Capabilities + Expandable Bullets (combined)
  ============================================================ */
  servicesAndCapabilitiesExpandable: {
    title: "What's included",
    description:
      "From baseline accuracy to testing programs that reliably move the numbers.",
    pillars: [
      {
        id: "tracking",
        title: "Tracking Foundation",
        description:
          "Clean, privacy-aware tracking with a clear event taxonomy.",
        deliverables: [
          "GA4 / server-side tagging",
          "Event & parameter schema",
          "Consent mode & governance",
        ],
      },
      {
        id: "reporting",
        title: "Reporting & Dashboards",
        description:
          "Clarity for marketing, product, and exec stakeholders.",
        deliverables: [
          "Source-of-truth metrics",
          "Funnel & cohort reporting",
          "Looker/BigQuery/Sheets pipelines",
        ],
      },
      {
        id: "experimentation",
        title: "Experimentation & CRO",
        description:
          "Disciplined testing that compounds over time.",
        deliverables: [
          "Hypothesis backlog & scoring",
          "A/B testing runbooks",
          "Weekly/bi-weekly review cadence",
        ],
      },
      {
        id: "attribution",
        title: "Attribution & Modeling",
        description:
          "Understand contribution across channels—cookieless included.",
        deliverables: [
          "Channel/geo experiments",
          "Media mix modeling (MMM) — optional",
          "Incrementality & lift studies",
        ],
      },
    ],
    // Quick links (non-expandable)
    bullets: [
      { label: "GA4 Setup", href: "#ga4" },
      { label: "Server-Side Tagging", href: "#sst" },
      { label: "Dashboards", href: "#dash" },
      { label: "A/B Testing", href: "#ab" },
      { label: "Attribution", href: "#attr" },
    ],
    // Expandable "L3/L4" recognizers
    expandable: [
      {
        id: "ga4",
        title: "GA4 & Event Taxonomy",
        summary:
          "Standardize events and parameters so reporting is reliable and comparable across teams.",
        details: [
          "Event & parameter schema design",
          "Consent mode and data retention",
          "Migration & backfill planning",
        ],
        cta: { label: "Get GA4 audit", href: "/contact" },
        tag: "Tracking",
      },
      {
        id: "sst",
        title: "Server-Side Tagging",
        summary:
          "Improve data quality and resilience with server-side GTM/collection.",
        details: [
          "SST container & endpoint setup",
          "PII handling & governance patterns",
          "Performance & reliability benefits",
        ],
        tag: "Tracking",
      },
      {
        id: "dash",
        title: "Decision-Ready Dashboards",
        summary:
          "Role-specific views for growth, product, and leadership.",
        details: [
          "Source of truth KPI definition",
          "Funnel & cohort views",
          "Looker / BigQuery / Sheets pipelines",
        ],
        tag: "Reporting",
      },
      {
        id: "ab",
        title: "Experimentation & CRO",
        summary:
          "Ship tests weekly/bi-weekly with a backlog that never runs dry.",
        details: [
          "Hypothesis framework & scoring",
          "Test design & guardrails",
          "Win archive & knowledge base",
        ],
        tag: "CRO",
      },
      {
        id: "attr",
        title: "Attribution & Incrementality",
        summary:
          "Move beyond last-click with experiments and modeled contribution.",
        details: [
          "Geo/channel split testing",
          "Lift & incrementality verification",
          "Media mix modeling (optional)",
        ],
        tag: "Attribution",
      },
    ],
    defaultOpen: 1,
  },

  /* ============================================================
     5) Portfolio (visual examples ONLY) - Using selector data
     Choose variant: "web" | "video" | "demo"
  ============================================================ */
  portfolio: {
    variant: "web",
    title: "Selected Analytics Work",
    subtitle:
      "Examples of dashboards, event schemas, and test-driven optimizations.",
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
    subtitle:
      "Checklists, calculators, and deep dives into analytics & CRO.",
    items: [
      // Case studies
      ...marketingCases.map((c: any) => ({
        title: c.title,
        description: c.summary,
        href: c.href || c.url || "/work",
        kind: "case-study",
        meta: c.metrics,
      })),
      // Useful tools/playbooks
      {
        title: "Analytics Audit Checklist",
        description: "A step-by-step worksheet to validate your GA4 setup.",
        href: "/playbooks/analytics-audit-checklist",
        kind: "playbook",
      },
      {
        title: "UTM Builder",
        description: "Consistent campaign tracking without the guesswork.",
        href: "/tools/utm-builder",
        kind: "tool",
      },
      {
        title: "Experiment Tracker Template",
        description: "Score, prioritize, and archive tests for compounding gains.",
        href: "/playbooks/experiment-tracker",
        kind: "template",
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
        id: "essential",
        name: "Essential",
        price: 1500,
        period: "monthly",
        features: [
          "GA4 audit & fixes",
          "Core dashboards",
          "Monthly insights",
        ],
        cta: { label: "Start", href: "/contact" },
        popular: true,
      },
      {
        id: "pro",
        name: "Professional",
        price: 3000,
        period: "monthly",
        features: [
          "Server-side tagging",
          "Role-based dashboards",
          "Bi-weekly CRO cadence",
        ],
        cta: { label: "Scale", href: "/contact" },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        features: [
          "Attribution experiments/MMM",
          "Data warehouse integration",
          "Customized governance",
        ],
        cta: { label: "Discuss", href: "/contact" },
      },
    ],
    comparison: {
      columns: ["Essential", "Professional", "Enterprise"],
      rows: [
        { label: "GA4 & Taxonomy", values: ["✓", "✓", "✓"] },
        { label: "Server-Side Tagging", values: ["—", "✓", "✓"] },
        { label: "Dashboards", values: ["Core", "Role-based", "Custom & exec"] },
        { label: "CRO Cadence", values: ["Monthly", "Bi-weekly", "Weekly/Custom"] },
        { label: "Attribution Modeling", values: ["—", "Experiments", "Experiments + MMM"] },
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
    subtitle:
      "Bundle common needs, or add focused enhancements to your plan.",
    featured: packages?.featured ?? marketingFeatured ?? [],
    items: packages?.items ?? [
      ...(marketingPackages ?? []),
      ...(marketingAddons ?? []),
    ],
    cta: {
      label: "See full catalog",
      href: "/services/marketing-services/analytics-optimization/packages",
    },
  },

  /* ============================================================
     9) Testimonials - Using selector data
  ============================================================ */
  testimonials: {
    title: "What clients say",
    subtitle: "Decisions with confidence—and performance to match.",
    data: testimonials?.length ? testimonials : marketingTestimonials ?? [],
  },

  /* ============================================================
     10) FAQs (buying/implementation objections only)
  ============================================================ */
  faqs: {
    title: "Analytics & Optimization — FAQs",
    items: [
      {
        question: "Do we need to migrate or fix our GA4 before CRO?",
        answer:
          "We validate and repair tracking first so experiment readouts are trustworthy. Stand-alone analytics sprints are available.",
      },
      {
        question: "Can you support privacy/cookieless changes?",
        answer:
          "Yes. We configure consent mode, server-side tagging, and governance so your data remains decision-ready as policies evolve.",
      },
      {
        question: "How soon can we expect ROI from testing?",
        answer:
          "Most teams see quick wins within 4–8 weeks of a disciplined cadence. Compounding gains build over quarters, not days.",
      },
    ],
  },

  /* ============================================================
     11) Final CTA
  ============================================================ */
  cta: {
    title: "Ready to trust your data and ship winning tests?",
    primaryCta: { label: "Book a consult", href: "/book" },
    secondaryCta: { label: "Request analytics audit", href: "/contact" },
  },
} as const;