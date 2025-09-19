// Lead Generation — Hub (L1)
// Template: HubTemplateData (no pricing here)
// This file is page-specific content ONLY. Cross-domain (portfolio/packages/testimonials/faqs)
// should be pulled by selectors or from _shared JSON as fallbacks.

const data = {
  kind: "hub",
  slug: "lead-generation-services",
  title: "Lead Generation Services",

  hero: {
    content: {
      title: "Predictable Pipeline. Qualified Leads. Real Revenue.",
      subtitle:
        "Strategy, conversion and lifecycle programs that turn interest into pipeline and pipeline into customers.",
      primaryCta: { label: "Talk to a strategist", href: "/book" },
      secondaryCta: { label: "See success stories", href: "#portfolio" }
    },
    background: {
      type: "image",
      src: "/images/services/lead-gen/hero.jpg",
      alt: "Lead generation services"
    }
  },

  // Optional intro block for the hero/overview area
  twoColVideo: {
    title: "From 'nice clicks' to qualified pipeline",
    description:
      "We blend channel planning, offer strategy, conversion optimization, lead scoring and automated nurturing to build a measurable, scalable demand engine.",
    video: {
      src: "/video/case-studies/leadgen-overview.mp4",
      poster: "/images/services/lead-gen/overview-poster.jpg",
      autoPlay: false,
      loop: false,
      muted: true
    },
    cta: { label: "Book a free assessment", href: "/book" }
  },

  // Directory-first: keep this light; children (L2) are auto-discovered by templates
  capabilities: {
    title: "What we deliver",
    description:
      "End-to-end demand generation from strategy to conversion and lifecycle.",
    // If bullets are empty, SubHub/Hub templates will auto-derive from taxonomy children
    bullets: [
      { label: "Strategy & Planning", href: "/services/lead-generation-services/strategy-planning" },
      { label: "Conversion Optimization", href: "/services/lead-generation-services/conversion-optimization" },
      { label: "Lead Management & Qualification", href: "/services/lead-generation-services/lead-management-qualification" },
      { label: "Remarketing & Retention", href: "/services/lead-generation-services/remarketing-retention" },
      { label: "Event & Experience Marketing", href: "/services/lead-generation-services/event-experience-marketing" }
    ],
    pillars: [
      {
        id: "strategy-planning",
        title: "Strategy & Planning",
        description: "Channel plans and offers designed to capture demand.",
        deliverables: ["Channel planning", "Offer strategy", "Attribution approach"]
      },
      {
        id: "conversion-optimization",
        title: "Conversion Optimization",
        description: "Turn more traffic into qualified leads.",
        deliverables: ["Landing pages", "Forms & UX", "A/B testing program"]
      },
      {
        id: "lead-management-qualification",
        title: "Lead Management & Qualification",
        description: "Route, score, and ready leads for sales.",
        deliverables: ["Lead scoring", "Routing rules", "Lifecycle stages"]
      },
      {
        id: "remarketing-retention",
        title: "Remarketing & Retention",
        description: "Bring audiences back and increase LTV.",
        deliverables: ["Remarketing entry", "Retargeting campaigns", "Win-back plays"]
      },
      {
        id: "event-experience-marketing",
        title: "Events & Experiences",
        description: "Own the moment — webinars, virtual events, and trade shows that convert.",
        deliverables: ["Webinar programs", "Virtual events", "Trade show capture"]
      }
    ],
    ctas: {
      primary: { label: "Design my lead engine", href: "/book" },
      secondary: { label: "Explore services", href: "#services" }
    }
  },

  // Leave modules/testimonials/faq/carousel out if you prefer selectors to populate them.
  // They can also be pulled from _shared JSON files as fallbacks by your loaders.

  cta: {
    title: "Ready to grow qualified pipeline?",
    subtitle: "Get a tailored plan for your goals, budget, and timeline.",
    primaryCta: { label: "Book a strategy session", href: "/book" },
    secondaryCta: { label: "Contact sales", href: "/contact" },
    layout: "centered",
    backgroundType: "gradient",
    trustElements: ["B2B SaaS", "Ecommerce", "Healthcare", "Fintech"]
  },

  // Optional SEO block — adapt to your SEO typing if you have one
  seo: {
    title: "Lead Generation Services | Strategy, CRO, Scoring & Nurtures",
    description:
      "Full-funnel lead generation services: channel planning, offers, CRO, lead scoring, routing, remarketing, and events.",
    canonical: "/services/lead-generation-services"
  }
} as const;

export default data;