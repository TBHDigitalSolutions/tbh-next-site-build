// /src/data/packages/bundles/digital-transformation-starter.ts
import type { PackageBundle } from "../_types/packages.types";
import type { ServicePricing } from "@/types/servicesTemplate.types";

const pricing: ServicePricing = {
  kind: "tiers",
  title: "Digital Transformation Starter",
  subtitle: "Modernize the stack: site, data, automation, and GTM",
  tiers: [
    {
      id: "setup",
      name: "One-time Setup",
      price: "$30,000",
      period: "one-time",
      features: [
        "Corporate website redesign (10-15 pages)",
        "CRM setup (HubSpot or equivalent)",
        "Email nurture flows & forms",
        "Brand film + 2 explainers",
        "Technical SEO + analytics dashboard",
        "Initial funnel: LP + lead form + retargeting",
      ],
      badge: "Replatform",
      cta: { label: "Kick Off Setup", href: "/contact?pkg=dx-setup" },
    },
    {
      id: "retainer",
      name: "Ongoing Retainer",
      price: "$7,500",
      period: "monthly",
      features: [
        "Site maintenance & performance",
        "Campaign ops (landing pages, forms, routing)",
        "Marketing automation optimization",
        "Content & video updates",
        "Reporting & growth planning",
      ],
      badge: "Ops",
      cta: { label: "Start Retainer", href: "/contact?pkg=dx-retainer" },
    },
  ],
};

const bundle: PackageBundle = {
  slug: "digital-transformation-starter",
  id: "pkg-digital-transformation-starter",
  title: "Digital Transformation Starter",
  subtitle: "Modern brand presence, operations, and analytics — without the 6-month slog.",
  summary: "Redesign the site, implement CRM/automation, ship core content/video, and launch a working funnel fast.",
  category: "startup",
  tags: ["web", "crm", "automation", "video", "seo"],
  icon: "settings",
  cardImage: {
    src: "/packages/digital-transformation-starter/card.jpg",
    alt: "Digital transformation dashboard",
  },
  hero: {
    content: {
      title: "Digital Transformation Starter",
      subtitle: "A practical 60-90 day implementation that gets marketing, sales, and data working together.",
      primaryCta: { label: "Request Proposal", href: "/contact?pkg=dx" },
      secondaryCta: { label: "Book a Call", href: "/book" },
    },
    background: { 
      type: "image", 
      src: "/packages/digital-transformation-starter/hero.jpg", 
      alt: "Modern digital interface" 
    },
  },
  includedServices: [
    "Web: 10-15 page redesign",
    "Automation: CRM + nurture flows",
    "Content: sales collateral (case studies, decks)",
    "Video: brand film + 2 explainers",
    "SEO: technical + analytics dashboard",
    "Lead Gen: LP + retargeting campaign",
  ],
  highlights: ["Time-boxed project", "Stakeholder-friendly sequencing", "Ops ready on Day 1"],
  outcomes: {
    title: "First-quarter outcomes",
    variant: "stats",
    items: [
      { label: "Time to First Campaign", value: "≤ 30 days" },
      { label: "Core Pages Live", value: "10-15" },
      { label: "Attribution Clarity", value: "Single source of truth" },
    ],
  },
  pricing,
  faq: {
    title: "FAQ",
    faqs: [
      {
        id: "crm",
        question: "Which CRM do you prefer?",
        answer: "HubSpot is our default for speed and integrations, but we'll adapt to your stack.",
      },
      {
        id: "content",
        question: "Who handles content approvals?",
        answer: "We draft, you review async in collaborative docs. Average approval cycle is 48-72 hours.",
      },
      {
        id: "timeline",
        question: "Can this be delivered faster?",
        answer: "Standard timeline is 60-90 days. Rush delivery available with dedicated resources for 25% premium.",
      },
    ],
  },
  cta: {
    title: "Ready to modernize?",
    primaryCta: { label: "Get Proposal", href: "/contact?pkg=dx" },
    secondaryCta: { label: "See Transformations", href: "/case-studies?tag=transformation" },
    layout: "centered",
    backgroundType: "gradient",
  },
};

export default bundle;