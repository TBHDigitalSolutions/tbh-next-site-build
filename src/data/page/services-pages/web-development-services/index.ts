// src/data/page/services-pages/web-development-services/index.ts
// L1 Hub page-data for Web Development Services
// - Shows L2 categories as cards (Applications, Ecommerce, Website)
// - No pricing here (pricing lives in L2 leaf pages)
// - Voice & toggles only; cross-domain content is selected via selectors

export default {
  kind: "hub",
  slug: "web-development-services",
  title: "Web Development Services",
  hero: {
    content: {
      eyebrow: "TBH Digital Solutions",
      title: "Full-stack Web Development that ships, scales, and converts",
      subtitle:
        "From modern websites to complex SaaS and ecommerce platforms—designed for speed, reliability, and growth.",
      primaryCta: { label: "Talk to a developer", href: "/contact" },
      secondaryCta: { label: "See portfolio", href: "/portfolio/web-development" },
    },
  },

  // Optional intro/overview band; safe to omit if not needed
  twoColVideo: {
    title: "Build with a proven architecture",
    description:
      "We pair a clean design system with robust application patterns: typed APIs, observability, testing, and CI/CD—so releases are predictable and performance stays fast.",
    // You can add videoUrl or imageUrl later if/when assets are ready.
  },

  capabilities: {
    title: "Explore our web development services",
    description:
      "Pick a path below. Each category contains focused sub-services you can browse—implementation details, workflows, and add-ons are defined at deeper levels.",
    // L2 categories as cards (derived from your directory tree)
    cards: [
      {
        id: "applications",
        title: "Applications",
        href: "/services/web-development-services/applications",
      },
      {
        id: "ecommerce",
        title: "Ecommerce",
        href: "/services/web-development-services/ecommerce",
      },
      {
        id: "website",
        title: "Website",
        href: "/services/web-development-services/website",
      },
    ],
  },

  // Cross-domain content (testimonials/portfolio/faqs/modules) will be selected
  // via selectors by hub/service/sub and can be overridden by _shared JSON.

  cta: {
    title: "Ready to build or migrate?",
    primaryCta: { label: "Get a scoped estimate", href: "/book" },
  },

  // Optional: lightweight SEO metadata stub (used by your template if supported)
  seo: {
    title: "Web Development Services | TBH Digital Solutions",
    description:
      "Full-stack websites, applications, and ecommerce with performance, security, and reliability baked in.",
    canonical: "/services/web-development-services",
  },
} as const;
