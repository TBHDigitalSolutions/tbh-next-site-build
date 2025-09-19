// /src/data/packages/bundles/ecommerce-accelerator.ts
import type { PackageBundle } from "../_types/packages.types";
import type { ServicePricing } from "@/types/servicesTemplate.types";

const pricing: ServicePricing = {
  kind: "tiers",
  title: "E-Commerce Accelerator",
  subtitle: "Conversion-ready storefront + performance marketing",
  tiers: [
    {
      id: "setup",
      name: "One-time Setup",
      price: "$18,000",
      period: "one-time",
      features: [
        "Shopify/WooCommerce setup or optimization",
        "3 product demo videos + 5 social cutdowns",
        "Product copywriting (20 SKUs)",
        "Email templates (promo + lifecycle)",
        "Technical SEO & product schema",
        "CRO baseline (speed, UX, tracking)",
      ],
      badge: "Project",
      cta: { label: "Start Setup", href: "/contact?pkg=eco-setup" },
    },
    {
      id: "retainer",
      name: "Ongoing Retainer",
      price: "$4,000",
      period: "monthly",
      features: [
        "Google Shopping + Meta ads management",
        "SEO maintenance & content updates",
        "A/B tests & CRO experiments",
        "Monthly insights & roadmap",
      ],
      badge: "Growth",
      cta: { label: "Scale Growth", href: "/contact?pkg=eco-retainer" },
    },
  ],
};

const bundle: PackageBundle = {
  slug: "ecommerce-accelerator",
  id: "pkg-ecommerce-accelerator",
  title: "E-Commerce Accelerator",
  subtitle: "Launch faster, convert more, and scale ads profitably.",
  summary: "Storefront optimization, product video, SEO/schema, and a paid engine tuned for ROAS.",
  category: "ecommerce",
  tags: ["shopify", "seo", "ads", "video", "cro"],
  icon: "shopping-bag",
  cardImage: {
    src: "/packages/ecommerce-accelerator/card.jpg",
    alt: "E-commerce dashboard showing sales metrics",
  },
  hero: {
    content: {
      title: "E-Commerce Accelerator",
      subtitle: "Get a conversion-ready storefront with content and ads that actually sell.",
      primaryCta: { label: "Request Proposal", href: "/contact?pkg=eco" },
      secondaryCta: { label: "Book a Call", href: "/book" },
    },
    background: { 
      type: "image", 
      src: "/packages/ecommerce-accelerator/hero.jpg", 
      alt: "Modern online store interface" 
    },
  },
  includedServices: [
    "Web: Shopify/Woo setup or optimization",
    "Video: 3 product demos + 5 cutdowns",
    "Content: product copy for 20 SKUs",
    "Marketing: Google Shopping + Meta",
    "SEO: technical + product schema",
  ],
  highlights: ["ROAS-oriented structure", "Fast content turnaround", "CRO baked in"],
  outcomes: {
    title: "Targets after 60-90 days",
    variant: "stats",
    items: [
      { label: "Conversion Rate Lift", value: "+15-40%" },
      { label: "Blended CAC", value: "Down 10-25%" },
      { label: "ROAS", value: "3-5x (model-dependent)" },
    ],
  },
  pricing,
  faq: {
    title: "FAQ",
    faqs: [
      {
        id: "platforms",
        question: "Do you support both Shopify and WooCommerce?",
        answer: "Yes. We maintain patterns for both and will recommend based on your stack.",
      },
      {
        id: "inventory",
        question: "Can you help with feed management?",
        answer: "We set up product feeds, attributes, and troubleshoot disapprovals during setup.",
      },
      {
        id: "ads-budget",
        question: "Is ad spend included?",
        answer: "No, media spend is separate and billed in your ad accounts.",
      },
      {
        id: "scaling",
        question: "How do you handle inventory scaling?",
        answer: "We optimize for scalable systems and can adjust copy/video production as you add products.",
      },
    ],
  },
  cta: {
    title: "Let's accelerate your store",
    subtitle: "From first click to checkout — we optimize every step.",
    primaryCta: { label: "Get Proposal", href: "/contact?pkg=eco" },
    secondaryCta: { label: "See Store Wins", href: "/case-studies?tag=ecommerce" },
    layout: "centered",
    backgroundType: "gradient",
  },
};

export default bundle;