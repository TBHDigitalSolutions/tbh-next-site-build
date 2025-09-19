// /src/data/packages/lead-generation/lead-generation-addons.ts
// Lead Generation add-ons - a la carte enhancements that bolt onto any tier

import type { AddOn } from "../_types/packages.types";

export const leadGenerationAddOns: AddOn[] = [
  {
    id: "leadgen-lead-magnet-kit",
    service: "leadgen",
    name: "Lead Magnet Creation Package", 
    description: "High-converting lead magnets with landing pages and email sequences to capture quality leads.",
    deliverables: [
      { label: "3 high-converting lead magnets", detail: "Ebooks, guides, or tools designed for your audience" },
      { label: "Landing page design and setup", detail: "Conversion-optimized pages for each magnet" },
      { label: "Email sequence automation", detail: "5-7 email nurture sequence per magnet" },
      { label: "Performance tracking setup", detail: "Conversion and engagement analytics" }
    ],
    billing: "one-time",
    price: { setup: 3500 },
    pairsBestWith: ["Essential", "Professional"],
    popular: true
  },
  {
    id: "leadgen-webinar-system",
    service: "leadgen",
    name: "Webinar Success Package", 
    description: "Complete webinar planning and execution system for high-quality lead generation.",
    deliverables: [
      { label: "Complete webinar planning and setup", detail: "Platform, registration, technical setup" },
      { label: "Promotional campaign design", detail: "Multi-channel promotion strategy" },
      { label: "Registration and follow-up automation", detail: "Automated attendee journey" },
      { label: "Post-event content creation", detail: "Replay optimization and lead nurturing" }
    ],
    billing: "one-time",
    price: { setup: 5500 },
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "leadgen-sales-funnel-audit",
    service: "leadgen",
    name: "Sales Funnel Optimization Audit", 
    description: "Comprehensive analysis of your lead generation funnel with actionable improvement recommendations.",
    deliverables: [
      { label: "Complete funnel analysis", detail: "End-to-end conversion path review" },
      { label: "Conversion rate optimization recommendations", detail: "Data-driven improvement strategies" },
      { label: "A/B testing plan development", detail: "Systematic testing roadmap" },
      { label: "Implementation roadmap", detail: "Prioritized action plan with timelines" }
    ],
    billing: "one-time", 
    price: { setup: 2500 },
    pairsBestWith: ["Essential", "Professional", "Enterprise"]
  },
  {
    id: "leadgen-advanced-attribution",
    service: "leadgen",
    name: "Advanced Attribution Modeling",
    description: "Enterprise-level lead tracking and multi-touch attribution for complex sales cycles.",
    deliverables: [
      { label: "Multi-touch attribution setup", detail: "Track leads across entire customer journey" },
      { label: "Advanced analytics implementation", detail: "Custom reporting and dashboard creation" },
      { label: "Cross-channel lead tracking", detail: "Unified view of all lead sources" },
      { label: "Custom reporting development", detail: "Executive-level performance dashboards" }
    ],
    billing: "hybrid",
    price: { setup: 6500, monthly: 2500 },
    dependencies: ["Requires access to all marketing platforms"],
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "leadgen-account-based-marketing",
    service: "leadgen",
    name: "Account-Based Marketing (ABM) Add-On",
    description: "Targeted lead generation for enterprise accounts with personalized campaigns.",
    deliverables: [
      { label: "Target account identification and research", detail: "Strategic account selection and profiling" },
      { label: "Personalized campaign development", detail: "Account-specific messaging and content" },
      { label: "Multi-channel ABM execution", detail: "Coordinated outreach across channels" },
      { label: "Account-level tracking and attribution", detail: "Enterprise account performance analytics" }
    ],
    billing: "monthly",
    price: { monthly: 8500 },
    dependencies: ["Campaign costs billed separately"],
    pairsBestWith: ["Professional", "Enterprise"],
    popular: true
  },
  {
    id: "leadgen-international-expansion",
    service: "leadgen",
    name: "International Lead Generation",
    description: "Multi-market lead generation expansion with localized campaigns and compliance.",
    deliverables: [
      { label: "Market research and entry strategy", detail: "Regional opportunity analysis" },
      { label: "Localized campaign development", detail: "Culture and language-specific campaigns" },
      { label: "Regional compliance considerations", detail: "GDPR, local regulation compliance" },
      { label: "Multi-language lead nurturing", detail: "Localized email and content sequences" }
    ],
    billing: "hybrid",
    price: { setup: 5500, monthly: 2500 },
    dependencies: ["Additional $2,500/month per additional market"],
    pairsBestWith: ["Enterprise"]
  }
];

export default leadGenerationAddOns;