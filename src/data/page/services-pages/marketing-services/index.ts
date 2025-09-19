// src/data/page/services-pages/marketing-services/index.ts

// --- Shared selectors for central data sources ---
import { selectPortfolio, selectTestimonials, selectPackages } from "@/data/selectors";

// Use selectors to get filtered data for this marketing services hub
const portfolioItems = selectPortfolio({ 
  hub: "marketing-services", 
  featured: true, 
  limit: 9 
});

const testimonials = selectTestimonials({ 
  hub: "marketing-services", 
  limit: 3 
});

const packages = selectPackages({ 
  hub: "marketing-services", 
  featured: true 
});

export default {
  kind: "hub",
  slug: "marketing-services",
  hero: {
    content: {
      eyebrow: "Services",
      title: "Marketing Services",
      subtitle: "Performance creative, paid media, analytics, and automation that compound growth.",
      primaryCta: { label: "Talk to marketing", href: "/contact" },
    },
  },
  // OPTIONAL: You can omit cards here if you derive from taxonomy in the template
  capabilities: {
    title: "Explore our services",
    cards: [
      { id: "digital-advertising",     title: "Digital Advertising",      href: "/services/marketing-services/digital-advertising" },
      { id: "content-creative",        title: "Content & Creative",       href: "/services/marketing-services/content-creative" },
      { id: "martech-automation",      title: "Martech & Automation",     href: "/services/marketing-services/martech-automation" },
      { id: "analytics-optimization",  title: "Analytics & Optimization", href: "/services/marketing-services/analytics-optimization" },
      { id: "pr-communications",       title: "PR & Communications",      href: "/services/marketing-services/pr-communications" },
      { id: "strategy-consulting",     title: "Strategy & Consulting",    href: "/services/marketing-services/strategy-consulting" },
    ],
  },
  
  /* ============================================================
     Portfolio - Using selector data
  ============================================================ */
  portfolio: {
    title: "Selected Work",
    subtitle: "Examples of marketing campaigns, systems, and optimizations across our services.",
    items: portfolioItems,
  },

  /* ============================================================
     Testimonials - Using selector data
  ============================================================ */
  testimonials: {
    title: "What clients say",
    subtitle: "Results that speak for themselves.",
    data: testimonials,
  },

  /* ============================================================
     Packages - Using selector data
  ============================================================ */
  packages: {
    title: "Packages & Add-Ons",
    subtitle: "Popular marketing service bundles and focused enhancements.",
    items: packages,
  },

  cta: {
    title: "Ready to plan your next quarter?",
    primaryCta: { label: "Book a consult", href: "/book" },
  },
} as const;