// src/data/page/services-pages/marketing-services/content-creative/index.ts

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
  service: "content-creative", 
  featured: true, 
  limit: 9 
});

const testimonials = selectTestimonials({ 
  hub: "marketing-services", 
  service: "content-creative", 
  limit: 3 
});

const packages = selectPackages({ 
  hub: "marketing-services", 
  service: "content-creative", 
  featured: true 
});

export default {
  kind: "service",
  slug: "content-creative",

  /* ============================================================
     1) HERO
  ============================================================ */
  hero: {
    content: {
      eyebrow: "Marketing",
      title: "Content & Creative that Drives Performance",
      subtitle:
        "From strategy to production to distribution—ship on-brand content that converts across SEO, paid, email, and product surfaces.",
      primaryCta: { label: "Request content audit", href: "/contact" },
      secondaryCta: { label: "See resources", href: "#resources" },
    },
    badges: ["Editorial Systems", "Design Systems", "SEO Content", "Paid Social Creative"],
  },

  /* ============================================================
     2) SEARCH (domain-specific search banner)
  ============================================================ */
  search: {
    placeholder: "Search content patterns, briefs, and case studies…",
    index: "services",
    filters: { hub: "marketing-services", service: "content-creative" },
  },

  /* ============================================================
     3) OVERVIEW INTRO (TwoColumnSection / Video)
  ============================================================ */
  twoColVideo: {
    variant: "text",
    title: "A system for ideas → assets → outcomes",
    description:
      "We define a clear editorial strategy, build reusable patterns, and stand up a production cadence that feeds every channel. The result: fast, consistent creative that compounds performance.",
    bullets: [
      "Audience & message hierarchy",
      "Reusable templates & briefs",
      "Multi-channel distribution",
    ],
    cta: { label: "Plan a 60-day content sprint", href: "/book" },
  },

  /* ============================================================
     4) Services & Capabilities + Expandable Bullets (combined)
  ============================================================ */
  servicesAndCapabilitiesExpandable: {
    title: "What's included",
    description: "End-to-end content operations across strategy, production, and distribution.",
    pillars: [
      {
        id: "strategy",
        title: "Content Strategy",
        description: "Positioning, narrative, and content pillars mapped to the funnel.",
        deliverables: [
          "ICP & message hierarchy",
          "Editorial pillars and angles",
          "Channel & cadence plan",
        ],
      },
      {
        id: "production",
        title: "Production & Design",
        description: "Briefs, templates, and asset creation for speed and consistency.",
        deliverables: [
          "Creative brief templates",
          "Design system components",
          "Multiformat asset kits",
        ],
      },
      {
        id: "distribution",
        title: "Distribution & Repurposing",
        description: "Turn one hero asset into a month of channel content.",
        deliverables: [
          "Repurpose recipes by channel",
          "Publishing playbooks",
          "UTM & tracking standards",
        ],
      },
      {
        id: "measurement",
        title: "Measurement & Optimization",
        description: "Tie content to outcomes; iterate with discipline.",
        deliverables: [
          "Content performance dashboards",
          "Test backlog & cadence",
          "Attribution-ready taxonomy",
        ],
      },
    ],
    // Quick links (non-expandable)
    bullets: [
      { label: "SEO Content", href: "#seo-content" },
      { label: "Landing Page Copy", href: "#lp-copy" },
      { label: "Paid Social Creative", href: "#paid-creative" },
      { label: "Email & Lifecycle", href: "#email" },
      { label: "Brand & Design System", href: "#brand" },
    ],
    // Expandable recognizers (formerly L3/L4 on-page)
    expandable: [
      {
        id: "seo-content",
        title: "SEO Content & Content Hubs",
        summary:
          "Entity-rich content hubs with briefs that make production fast and accurate.",
        details: [
          "Topic clusters & internal linking",
          "Schema & on-page standards",
          "Briefs with SERP & entity cues",
        ],
        cta: { label: "Get content roadmap", href: "/contact" },
        tag: "SEO",
      },
      {
        id: "lp-copy",
        title: "Landing Page Copy & Layout",
        summary:
          "Message architecture + modular sections tuned for conversion.",
        details: [
          "Jobs-to-be-done messaging",
          "Section patterns & wireframes",
          "CRO-informed copy blocks",
        ],
        tag: "CRO",
      },
      {
        id: "paid-creative",
        title: "Paid Social Creative Systems",
        summary:
          "Angle → hook → benefit templates that scale testing and learning.",
        details: [
          "Creative concepts & angles",
          "Hook/benefit matrices",
          "Ad variants & naming standards",
        ],
        tag: "Paid",
      },
      {
        id: "email",
        title: "Email & Lifecycle Content",
        summary:
          "From welcome sequences to churn saves—message maps and modular blocks.",
        details: [
          "Lifecycle map & triggers",
          "Templates & content blocks",
          "Testing & performance norms",
        ],
        tag: "CRM",
      },
      {
        id: "brand",
        title: "Brand Voice & Design System",
        summary:
          "Stay on-brand at speed with tokens, components, and voice guides.",
        details: [
          "Voice & tone guidelines",
          "Reusable design primitives",
          "Asset handoff & governance",
        ],
        tag: "Brand",
      },
    ],
    defaultOpen: 1,
    analyticsId: "svc-content-creative",
  },

  /* ============================================================
     5) Portfolio (visual examples ONLY) - Using selector data
     Choose variant: "web" | "video" | "demo"
  ============================================================ */
  portfolio: {
    variant: "web",
    title: "Selected Content & Creative Work",
    subtitle: "Examples of landing systems, editorial hubs, and multiformat assets.",
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
    subtitle: "Playbooks, checklists, templates, and deep dives.",
    items: [
      // Case studies (long-form PDFs/articles)
      ...marketingCases.map((c: any) => ({
        title: c.title,
        description: c.summary,
        href: c.href || c.url || "/work",
        kind: "case-study",
        meta: c.metrics,
      })),
      // Practical resources
      {
        title: "Content Brief Template",
        description: "A standardized brief for SEO pages, posts, and landers.",
        href: "/playbooks/content-brief-template",
        kind: "template",
      },
      {
        title: "Editorial Calendar",
        description: "Plan topics, owners, and due dates with status at a glance.",
        href: "/playbooks/editorial-calendar",
        kind: "template",
      },
      {
        title: "Creative Angle Library",
        description: "Prompts and angles that unlock high-performing variations.",
        href: "/playbooks/creative-angles",
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
        id: "essential",
        name: "Essential",
        price: 2000,
        period: "monthly",
        features: [
          "Editorial plan & briefs",
          "2–4 assets/month",
          "Monthly reporting",
        ],
        cta: { label: "Start", href: "/contact" },
        popular: true,
      },
      {
        id: "pro",
        name: "Professional",
        price: 4000,
        period: "monthly",
        features: [
          "Multiformat production",
          "4–8 assets/month",
          "Bi-weekly optimization",
        ],
        cta: { label: "Scale", href: "/contact" },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        features: [
          "Design system support",
          "Cross-channel distribution",
          "Dedicated content lead",
        ],
        cta: { label: "Discuss", href: "/contact" },
      },
    ],
    comparison: {
      columns: ["Essential", "Professional", "Enterprise"],
      rows: [
        { label: "Assets / month", values: ["2–4", "4–8", "Custom"] },
        { label: "Formats", values: ["Blog/Lander", "Blog/Lander/Social", "All + custom"] },
        { label: "Design support", values: ["Light", "Full", "System-level"] },
        { label: "Optimization cadence", values: ["Monthly", "Bi-weekly", "Weekly/Custom"] },
        { label: "Distribution support", values: ["—", "Included", "Advanced + governance"] },
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
    subtitle: "Bundle common needs, or add focused enhancements to your plan.",
    featured: packages?.featured ?? marketingFeatured ?? [],
    items: packages?.items ?? [
      ...(marketingPackages ?? []),
      ...(marketingAddons ?? []),
    ],
    cta: {
      label: "See full catalog",
      href: "/services/marketing-services/content-creative/packages",
    },
  },

  /* ============================================================
     9) Testimonials - Using selector data
  ============================================================ */
  testimonials: {
    title: "What clients say",
    subtitle: "On-brand, on-time, and built for performance.",
    data: testimonials?.length ? testimonials : marketingTestimonials ?? [],
  },

  /* ============================================================
     10) FAQs (buying/implementation objections only)
  ============================================================ */
  faqs: {
    title: "Content & Creative — FAQs",
    items: [
      {
        question: "Can you match our brand and voice quickly?",
        answer:
          "Yes. We start with a short discovery, codify voice/tone guidelines, and produce samples to align before scaling.",
      },
      {
        question: "Do you handle design and copy in-house?",
        answer:
          "We deliver both. If you have an existing design system, we plug in; otherwise, we stand up lightweight tokens and components.",
      },
      {
        question: "How do you measure content performance?",
        answer:
          "Every asset ships with tracking and a purpose. We review KPI movement by channel and keep a backlog of next tests.",
      },
    ],
  },

  /* ============================================================
     11) Final CTA
  ============================================================ */
  cta: {
    title: "Ready to ship content that compounds?",
    primaryCta: { label: "Book a consult", href: "/book" },
    secondaryCta: { label: "Request content audit", href: "/contact" },
  },
} as const;