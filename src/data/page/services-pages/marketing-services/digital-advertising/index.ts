// src/data/page/services-pages/marketing-services/digital-advertising/index.ts

// --- Imports from your central data pools ---
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
  service: "digital-advertising", 
  featured: true, 
  limit: 9 
});

const testimonials = selectTestimonials({ 
  hub: "marketing-services", 
  service: "digital-advertising", 
  limit: 3 
});

const packages = selectPackages({ 
  hub: "marketing-services", 
  service: "digital-advertising", 
  featured: true 
});

// NOTE: Adjust names to your actual module exports; the goal is to funnel these into the
// new ServiceTemplate's data contracts.

export default {
  kind: "service",
  slug: "digital-advertising",
  hero: {
    content: {
      eyebrow: "Marketing",
      title: "Digital Advertising that Scales",
      subtitle:
        "Full-funnel paid media programs across search, social, programmatic, and retail—measured, test-driven, and profitable.",
      primaryCta: { label: "Request media audit", href: "/contact" },
      secondaryCta: { label: "See case studies", href: "#resources" },
    },
    badges: ["Google Partner", "Meta Certified", "Programmatic"],
  },

  // 2) Search banner (domain-specific)
  search: {
    placeholder: "Search paid media tactics, case studies, and tools…",
    index: "services",
    filters: { hub: "marketing-services", service: "digital-advertising" },
  },

  // 3) Overview intro
  twoColVideo: {
    variant: "text", // or "video" if you have a clip
    title: "Outcomes over channels",
    description:
      "We plan to your economics, not vanity metrics. Creative frameworks + testing cadence + budget discipline deliver compounding performance.",
    bullets: ["Acquisition economics", "Creative testing flywheel", "Cross-channel budget pacing"],
    cta: { label: "Plan a 90-day test", href: "/book" },
  },

  // 4) Services & Capabilities + Expandable Bullets (ONE MODULE)
  servicesAndCapabilitiesExpandable: {
    title: "What's included",
    description: "Strategy, launch, optimization, and reporting you can act on.",
    pillars: [
      {
        id: "strategy",
        title: "Account Strategy",
        description: "Objectives, budgets, and target economics.",
        deliverables: ["Channel mix plan", "Test roadmap", "Creative briefs"],
      },
      {
        id: "ops",
        title: "Ops & Launch",
        description: "End-to-end setup across platforms.",
        deliverables: ["Conversion tracking", "Naming & UTM scheme", "QA & go-live"],
      },
      {
        id: "opt",
        title: "Optimization",
        description: "Improve ROAS and LTV with disciplined iteration.",
        deliverables: ["Bidding & pacing", "Audience expansion", "A/B testing"],
      },
    ],
    // quick links
    bullets: [
      { label: "Paid Search", href: "#paid-search" },
      { label: "Paid Social", href: "#paid-social" },
      { label: "Programmatic", href: "#programmatic" },
      { label: "Retail Media", href: "#retail-media" },
    ],
    // expandable = your former L3/L4 on-page
    expandable: [
      {
        id: "paid-search",
        title: "Paid Search",
        summary: "SKAG vs. theme structures, query mapping, and budget guardrails.",
        details: ["Structure & query mapping", "SQ negation system", "PMax guardrails"],
        cta: { label: "Get search audit", href: "/contact" },
        tag: "SEM",
      },
      {
        id: "paid-social",
        title: "Paid Social",
        summary: "Creative frameworks + audience expansion to unlock scale.",
        details: ["Creative angles", "Hook & benefit matrices", "Incrementality testing"],
        tag: "Social",
      },
      {
        id: "programmatic",
        title: "Programmatic (Display/CTV-OTT)",
        summary: "Mid/upper-funnel reach with proper frequency + lift testing.",
        details: ["PMPs/PG", "Brand safety controls", "Lift verification"],
        tag: "Programmatic",
      },
      {
        id: "retail-media",
        title: "Shopping/Retail Media",
        summary: "ROAS-driven product ads with feed optimization.",
        details: ["Feed cleanup", "Merchant center hygiene", "Query sculpting"],
        tag: "Retail",
      },
    ],
    defaultOpen: 1,
  },

  // 5) Portfolio (visual examples ONLY) - Using selector data
  // For marketing, your portfolio may be images (ads/landing) or mixed → keep "web"
  portfolio: {
    variant: "web", // "video" or "demo" if applicable
    title: "Selected Campaign Work",
    subtitle: "A few examples of creative & landing systems we've shipped.",
    items: portfolioItems?.length
      ? portfolioItems
      : (marketingServicesFeatured?.length
        ? marketingServicesFeatured
        : marketingServicesItems), // fallback chain
  },

  // 6) Module Carousel (Resources & Case Studies) — includes CASE STUDIES
  modules: {
    title: "Resources & Case Studies",
    subtitle: "Playbooks, checklists, calculators, and deep dives.",
    items: [
      // case studies from your data file:
      ...marketingCases.map((c: any) => ({
        title: c.title,
        description: c.summary,
        href: c.href || c.url || "/work",
        kind: "case-study",
        meta: c.metrics,
      })),
      // add any tools/playbooks specific to ads here
      { title: "Budget Pacing Calculator", href: "/tools/pacing", kind: "tool" },
      { title: "Creative Test Matrix", href: "/playbooks/creative-tests", kind: "playbook" },
    ],
  },

  // 7) Pricing (with starting-price disclaimer baked by adapter)
  pricing: {
    title: "Plans & Pricing",
    tiers: [
      {
        id: "essential",
        name: "Essential",
        price: 2500,
        period: "monthly",
        features: ["Setup & tracking", "Foundational testing", "Monthly reporting"],
        cta: { label: "Start", href: "/contact" },
        popular: true,
      },
      {
        id: "pro",
        name: "Professional",
        price: 5000,
        period: "monthly",
        features: ["Advanced testing", "Automation & alerts", "Weekly reporting"],
        cta: { label: "Scale", href: "/contact" },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        features: ["Custom SLAs", "Data pipeline", "Dedicated team"],
        cta: { label: "Discuss", href: "/contact" },
      },
    ],
    comparison: {
      columns: ["Essential", "Professional", "Enterprise"],
      rows: [
        { label: "Channels", values: ["1–2", "2–4", "Custom"] },
        { label: "A/B Testing", values: ["Basic", "Advanced", "Programmatic"] },
        { label: "Reporting cadence", values: ["Monthly", "Weekly", "Custom"] },
      ],
    },
    // (optional) overwrite the default disclaimer/notes if you want
    disclaimer:
      "Pricing shown is a starting point. Final pricing is determined after a scope consultation.",
  },

  // 8) Packages & Add-Ons - Using selector data
  packages: {
    title: "Packages & Add-Ons",
    featured: packages?.featured ?? marketingFeatured ?? [],
    items: packages?.items ?? [
      ...(marketingPackages ?? []),
      ...(marketingAddons ?? []),
    ],
    cta: { label: "See full catalog", href: "/services/marketing-services/digital-advertising/packages" },
  },

  // 9) Testimonials - Using selector data
  testimonials: {
    title: "What clients say",
    subtitle: "Outcomes, not vanity metrics.",
    data: testimonials?.length ? testimonials : marketingTestimonials ?? [],
  },

  // 10) FAQs (keep focused on buying/implementation objections)
  faqs: {
    title: "Digital Advertising — FAQs",
    items: [
      {
        question: "How fast can we launch?",
        answer:
          "Typical timeline is 2–3 weeks for full setup (tracking, structure, creative plan). Express setups are possible.",
      },
      {
        question: "Do you work as an extension of our team?",
        answer:
          "Yes—weekly cadence, shared dashboards, and clear experiment roadmaps. We document everything we ship.",
      },
    ],
  },

  // 11) Final CTA
  cta: {
    title: "Ready to plan your next 90-day test?",
    primaryCta: { label: "Book a consult", href: "/book" },
    secondaryCta: { label: "Request audit", href: "/contact" },
  },
} as const;