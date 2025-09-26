// /src/data/packages/seo-services/seo-services-addons.ts
// SEO Services add-ons - specialized enhancements

import type { AddOn } from "../_types/packages.types";

export const seoServicesAddOns: AddOn[] = [
  {
    id: "seo-migration-support",
    service: "seo",
    name: "SEO Migration Support",
    description: "Comprehensive website migration planning and execution to preserve search rankings.",
    deliverables: [
      { label: "Pre-migration SEO audit", detail: "Complete assessment of current SEO status" },
      { label: "Migration planning and execution", detail: "Detailed migration strategy and implementation" },
      { label: "Post-migration monitoring", detail: "30-day monitoring and issue resolution" },
      { label: "Traffic recovery optimization", detail: "Proactive ranking recovery strategies" }
    ],
    billing: "one-time",
    price: { setup: 4500 },
    pairsBestWith: ["Professional", "Enterprise"],
    popular: true
  },
  {
    id: "seo-international-setup",
    service: "seo",
    name: "International SEO Setup",
    description: "Multi-language and geographic targeting optimization for global expansion.",
    deliverables: [
      { label: "Hreflang implementation", detail: "Proper international targeting setup" },
      { label: "Multi-language optimization", detail: "Content optimization for target languages" },
      { label: "Geographic targeting setup", detail: "Country-specific search optimization" },
      { label: "Local market research", detail: "Keyword research for target markets" }
    ],
    billing: "hybrid",
    price: { setup: 3500, monthly: 2000 },
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "seo-emergency-audit",
    service: "seo", 
    name: "Technical SEO Emergency Audit",
    description: "Urgent technical issue identification and resolution for critical SEO problems.",
    deliverables: [
      { label: "Urgent technical issue identification", detail: "48-hour comprehensive audit" },
      { label: "Priority fix recommendations", detail: "Ranked list of critical issues" },
      { label: "48-hour turnaround", detail: "Emergency response timeline" },
      { label: "Implementation support", detail: "Technical guidance for fixes" }
    ],
    billing: "one-time",
    price: { setup: 2500 },
    pairsBestWith: ["Essential", "Professional", "Enterprise"]
  },
  {
    id: "seo-penalty-recovery",
    service: "seo",
    name: "Google Penalty Recovery Service", 
    description: "Comprehensive penalty analysis and recovery strategy for penalized websites.",
    deliverables: [
      { label: "Penalty analysis and identification", detail: "Detailed penalty assessment" },
      { label: "Recovery strategy development", detail: "Step-by-step recovery plan" },
      { label: "Technical and content fixes", detail: "Implementation of penalty resolution" },
      { label: "Reconsideration request support", detail: "Google reconsideration assistance" }
    ],
    billing: "hybrid",
    price: { setup: 5500, monthly: 2500 },
    dependencies: ["Requires Google Search Console access"],
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "seo-competitive-intelligence",
    service: "seo",
    name: "SEO Competitive Intelligence",
    description: "Advanced competitor analysis and strategic insights for competitive advantage.",
    deliverables: [
      { label: "Comprehensive competitor SEO analysis", detail: "Deep-dive competitor research" },
      { label: "Gap analysis and opportunities", detail: "Competitive advantage identification" },
      { label: "Competitive keyword mapping", detail: "Keyword opportunities vs competitors" },
      { label: "Quarterly intelligence reports", detail: "Ongoing competitive monitoring" }
    ],
    billing: "hybrid", 
    price: { setup: 3500, monthly: 1500 },
    pairsBestWith: ["Professional", "Enterprise"],
    popular: true
  },
  {
    id: "seo-voice-search-optimization",
    service: "seo",
    name: "Voice Search Optimization",
    description: "Optimization for voice search and conversational queries for future-ready SEO.",
    deliverables: [
      { label: "Voice search keyword research", detail: "Conversational query identification" },
      { label: "Conversational query optimization", detail: "Content optimized for voice search" },
      { label: "Featured snippet optimization for voice", detail: "Voice-ready featured snippets" },
      { label: "Local voice search optimization", detail: "Local queries via voice devices" }
    ],
    billing: "monthly",
    price: { monthly: 3500 },
    pairsBestWith: ["Professional", "Enterprise"]
  }
];

export default seoServicesAddOns;