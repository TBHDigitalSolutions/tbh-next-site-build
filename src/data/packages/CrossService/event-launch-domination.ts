// /src/data/packages/bundles/event-launch-domination.ts
import type { PackageBundle } from "../_types/packages.types";
import type { ServicePricing } from "@/types/servicesTemplate.types";

const pricing: ServicePricing = {
  kind: "tiers",
  title: "Event & Launch Domination",
  subtitle: "Maximize exposure before, during, and after your moment",
  tiers: [
    {
      id: "setup",
      name: "Setup & Event Coverage",
      price: "$25,000",
      period: "one-time",
      features: [
        "Full event coverage (crew, highlight reel)",
        "5 speaker/session edits + testimonials",
        "Event promotion kit (emails/social/graphics)",
        "Event landing page + schema",
        "Tracking & performance setup",
      ],
      badge: "Project",
      cta: { label: "Lock Your Date", href: "/contact?pkg=event-setup" },
    },
    {
      id: "retainer",
      name: "Post-Event Retainer (3 months)",
      price: "$6,000",
      period: "monthly",
      features: [
        "Remarketing ads (Google/Meta/LinkedIn)",
        "Post-event nurture email flows",
        "Content repurposing from footage",
        "Monthly performance reporting",
      ],
      badge: "Momentum",
      cta: { label: "Keep Momentum", href: "/contact?pkg=event-retainer" },
    },
  ],
};

const bundle: PackageBundle = {
  slug: "event-launch-domination",
  id: "pkg-event-launch-domination",
  title: "Event & Launch Domination",
  subtitle: "Turn your event or launch into a content & demand flywheel.",
  summary: "Campaign creative, landing pages, filming, and 90 days of remarketing + nurture to convert attention.",
  category: "custom",
  tags: ["events", "video", "ads", "email", "landing-page"],
  icon: "bolt",
  cardImage: {
    src: "/packages/event-launch-domination/card.jpg",
    alt: "Conference keynote speaker presenting",
  },
  hero: {
    content: {
      title: "Event & Launch Domination",
      subtitle: "We plan, capture, and convert — so the attention you earn becomes pipeline.",
      primaryCta: { label: "Request Proposal", href: "/contact?pkg=event" },
      secondaryCta: { label: "Book a Call", href: "/book" },
    },
    background: { 
      type: "image", 
      src: "/packages/event-launch-domination/hero.jpg", 
      alt: "Conference audience and stage" 
    },
  },
  includedServices: [
    "Video: highlight reel + session edits + testimonials",
    "Content: promo kit (emails, social, graphics)",
    "Marketing: multichannel ad campaign",
    "SEO/Web: event landing page optimization",
    "Lead Gen: post-event nurture funnel",
  ],
  highlights: ["End-to-end coverage", "Fast turnaround", "90-day capture plan"],
  outcomes: {
    title: "What to expect",
    variant: "stats",
    items: [
      { label: "Registrations / RSVPs", value: "+30-60%" },
      { label: "SQLs from Event", value: "+15-35%" },
      { label: "Content Library", value: "10-20 assets" },
    ],
  },
  pricing,
  faq: {
    title: "FAQ",
    faqs: [
      {
        id: "timeline",
        question: "How far in advance should we book?",
        answer: "Ideally 6-8 weeks before your event date.",
      },
      {
        id: "travel",
        question: "Do you travel?",
        answer: "Yes. Travel is billed at cost and scoped in your proposal.",
      },
      {
        id: "virtual",
        question: "Can you handle virtual or hybrid events?",
        answer: "Absolutely. We have experience with virtual event production, live streaming, and hybrid event management.",
      },
      {
        id: "deliverables",
        question: "What's the typical turnaround for video content?",
        answer: "Highlight reel within 48 hours, full session edits within 2 weeks of event completion.",
      },
    ],
  },
  cta: {
    title: "Own your event window",
    primaryCta: { label: "Get Proposal", href: "/contact?pkg=event" },
    secondaryCta: { label: "See Launch Wins", href: "/case-studies?tag=launch" },
    layout: "centered",
    backgroundType: "gradient",
  },
};

export default bundle;