// /src/data/packages/bundles/local-business-growth.ts
import type { PackageBundle } from "../_types/packages.types";
import type { ServicePricing } from "@/types/servicesTemplate.types";

const pricing: ServicePricing = {
  kind: "tiers",
  title: "Local Business Growth",
  subtitle: "One-time setup + ongoing local engine maintenance",
  tiers: [
    {
      id: "setup",
      name: "One-time Setup",
      price: "$12,500",
      period: "one-time",
      features: [
        "1-2 min promo video (filming + edit)",
        "10 branded social posts (graphics + captions)",
        "Google Business Profile setup/optimization",
        "Local SEO setup (citations, NAP, on-page)",
        "Local landing page / microsite",
        "Analytics & goal tracking",
      ],
      badge: "Project",
      cta: { label: "Kick Off Setup", href: "/contact?pkg=local-setup" },
    },
    {
      id: "retainer",
      name: "Ongoing Retainer",
      price: "$2,500",
      period: "monthly",
      features: [
        "GBP management & posts",
        "2 ad campaigns (Google/Meta) management",
        "Monthly content posting (social)",
        "Local SEO upkeep (citations/links)",
        "Reporting & review response management",
      ],
      badge: "Maintenance",
      cta: { label: "Start Retainer", href: "/contact?pkg=local-retainer" },
    },
  ],
};

const bundle: PackageBundle = {
  slug: "local-business-growth",
  id: "pkg-local-business-growth",
  title: "Local Business Growth",
  subtitle: "Be discovered locally and convert more nearby customers with a repeatable engine.",
  summary: "Promo video, local SEO, landing page, GBP optimization, and ongoing ads/content to keep demand flowing.",
  category: "local",
  tags: ["local", "seo", "video", "ads", "landing-page"],
  icon: "map-pin",
  cardImage: {
    src: "/packages/local-business-growth/card.jpg",
    alt: "Local storefronts",
  },
  hero: {
    content: {
      title: "Local Business Growth",
      subtitle: "From rankings to reviews, get a turnkey system that drives calls, visits, and bookings.",
      primaryCta: { label: "Request Proposal", href: "/contact?pkg=local" },
      secondaryCta: { label: "Book a Call", href: "/book" },
    },
    background: { 
      type: "image", 
      src: "/packages/local-business-growth/hero.jpg", 
      alt: "Main street business district" 
    },
  },
  includedServices: [
    "Video Production: 1-2 min promo",
    "Content: 10 social posts",
    "Marketing: GBP + 2 campaigns",
    "SEO: local setup (citations/NAP/on-page)",
    "Web: landing page or microsite",
  ],
  highlights: ["Fast setup (2-4 weeks)", "Clear KPI tracking", "Month-to-month retainer"],
  outcomes: {
    title: "Typical 90-day results",
    variant: "stats",
    items: [
      { label: "Calls & Form Leads", value: "+35-80%" },
      { label: "Map Pack Rankings", value: "Top 3" },
      { label: "Review Velocity", value: "2-5x" },
    ],
  },
  pricing,
  faq: {
    title: "FAQ",
    faqs: [
      {
        id: "timeline",
        question: "How long does setup take?",
        answer: "Most setups complete in 2-4 weeks depending on filming and approvals.",
      },
      {
        id: "ads-budget",
        question: "Is ad spend included?",
        answer: "Media spend is billed to your ad accounts; our fee covers strategy and management.",
      },
      {
        id: "contracts",
        question: "Is there a long-term contract?",
        answer: "No. Retainer is month-to-month with a 30-day notice.",
      },
    ],
  },
  cta: {
    title: "Ready to grow locally?",
    subtitle: "We'll build the engine — you run the business.",
    primaryCta: { label: "Get Proposal", href: "/contact?pkg=local" },
    secondaryCta: { label: "See Case Studies", href: "/case-studies?tag=local" },
    layout: "centered",
    backgroundType: "gradient",
  },
};

export default bundle;