// /src/data/packages/bundles/thought-leadership-authority.ts
import type { PackageBundle } from "../_types/packages.types";
import type { ServicePricing } from "@/types/servicesTemplate.types";

const pricing: ServicePricing = {
  kind: "tiers",
  title: "Thought Leadership & Brand Authority",
  subtitle: "Executive visibility system: content + distribution",
  tiers: [
    {
      id: "setup",
      name: "One-time Setup",
      price: "$15,000",
      period: "one-time",
      features: [
        "6 expert videos (batch filmed) + 12 clips",
        "Editorial calendar & positioning",
        "LinkedIn ad account setup",
        "Content SEO framework",
        "Outreach templates & pitch list",
      ],
      badge: "Foundation",
      cta: { label: "Start Setup", href: "/contact?pkg=authority-setup" },
    },
    {
      id: "retainer",
      name: "Ongoing Retainer",
      price: "$5,000",
      period: "monthly",
      features: [
        "4 long-form ghostwritten posts / month",
        "LinkedIn ads mgmt (nurture + promote)",
        "Backlink outreach to niche pubs",
        "Analytics & editorial review call",
      ],
      badge: "Amplify",
      cta: { label: "Build Authority", href: "/contact?pkg=authority-retainer" },
    },
  ],
};

const bundle: PackageBundle = {
  slug: "thought-leadership-authority",
  id: "pkg-thought-leadership-authority",
  title: "Thought Leadership & Brand Authority",
  subtitle: "Ship meaningful insights every month and get them in front of decision-makers.",
  summary: "Video + ghostwritten content + LinkedIn distribution + SEO/outreach to build credibility and pipeline.",
  category: "b2b",
  tags: ["linkedin", "content", "video", "seo", "outreach"],
  icon: "megaphone",
  cardImage: {
    src: "/packages/thought-leadership-authority/card.jpg",
    alt: "Executive recording professional content",
  },
  hero: {
    content: {
      title: "Thought Leadership & Brand Authority",
      subtitle: "A repeatable program for visibility — from filming to distribution to backlinks.",
      primaryCta: { label: "Request Proposal", href: "/contact?pkg=authority" },
      secondaryCta: { label: "Book a Call", href: "/book" },
    },
    background: { 
      type: "image", 
      src: "/packages/thought-leadership-authority/hero.jpg", 
      alt: "Professional video studio setup" 
    },
  },
  includedServices: [
    "Video: 6 long-form shoots + 12 clips",
    "Content: 4 long-form posts/mo (ghostwritten)",
    "Marketing: LinkedIn ads & distribution",
    "SEO: content optimization + backlinks",
    "Lead Gen: targeted outreach sequences",
  ],
  highlights: ["Exec time-efficient workflow", "Audience-first positioning", "Measurable reach & pipeline"],
  outcomes: {
    title: "What clients see in 90 days",
    variant: "stats",
    items: [
      { label: "Follower Growth", value: "2-4x" },
      { label: "Qualified Conversations", value: "+30-70%" },
      { label: "Keyword Coverage", value: "+20-40%" },
    ],
  },
  pricing,
  faq: {
    title: "FAQ",
    faqs: [
      {
        id: "time",
        question: "How much exec time is required?",
        answer: "We run batch filming & async review. Expect ~3-4 hrs/mo.",
      },
      {
        id: "ghostwriting",
        question: "Do we provide outlines or full drafts?",
        answer: "Full drafts informed by interviews and your positioning guide.",
      },
      {
        id: "compliance",
        question: "Can this work for regulated industries?",
        answer: "Yes, we work within compliance frameworks and include legal review processes when needed.",
      },
      {
        id: "results",
        question: "How do you measure thought leadership success?",
        answer: "We track engagement, follower quality, speaking opportunities, media mentions, and pipeline attribution.",
      },
    ],
  },
  cta: {
    title: "Become the go-to voice in your space",
    primaryCta: { label: "Get Proposal", href: "/contact?pkg=authority" },
    secondaryCta: { label: "See B2B Wins", href: "/case-studies?tag=b2b" },
    layout: "centered",
    backgroundType: "gradient",
  },
};

export default bundle;