// /src/data/packages/marketing/marketing-addons.ts
// Marketing Services add-ons - a la carte enhancements that bolt onto any tier

import type { AddOn } from "../_types/packages.types";

export const marketingAddOns: AddOn[] = [
  {
    id: "marketing-creative-ad-pack",
    service: "marketing",
    name: "Creative Ad Pack", 
    description: "High-converting ad creative variations with A/B testing for improved campaign performance.",
    deliverables: [
      { label: "10 ad creatives with variations", detail: "Copy and visual variations for testing" },
      { label: "Platform-specific optimization", detail: "Formatted for Google, Meta, LinkedIn" },
      { label: "A/B testing implementation", detail: "Systematic testing and performance analysis" },
      { label: "Creative performance reporting", detail: "Insights and optimization recommendations" }
    ],
    billing: "one-time",
    price: { setup: 2500 },
    pairsBestWith: ["Essential", "Professional"],
    popular: true
  },
  {
    id: "marketing-martech-audit",
    service: "marketing",
    name: "Marketing Technology Audit", 
    description: "Comprehensive evaluation of your marketing stack with optimization recommendations.",
    deliverables: [
      { label: "Complete MarTech stack assessment", detail: "Platform evaluation and gap analysis" },
      { label: "Integration optimization recommendations", detail: "Data flow and workflow improvements" },
      { label: "ROI analysis and recommendations", detail: "Cost optimization and efficiency gains" },
      { label: "Implementation roadmap", detail: "Prioritized action plan with timelines" }
    ],
    billing: "one-time",
    price: { setup: 4500 },
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "marketing-competitive-intelligence",
    service: "marketing",
    name: "Competitive Intelligence Package", 
    description: "Advanced competitor monitoring and analysis with strategic recommendations.",
    deliverables: [
      { label: "Comprehensive competitor analysis", detail: "Marketing strategy and performance review" },
      { label: "Market positioning assessment", detail: "Competitive landscape and opportunities" },
      { label: "Campaign strategy recommendations", detail: "Tactical insights and best practices" },
      { label: "Quarterly intelligence reports", detail: "Ongoing competitive monitoring" }
    ],
    billing: "hybrid",
    price: { setup: 3500, monthly: 1500 },
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "marketing-international-expansion",
    service: "marketing",
    name: "International Marketing Expansion",
    description: "Multi-market marketing strategy and execution for global expansion.",
    deliverables: [
      { label: "Market entry strategy", detail: "Regional opportunity analysis and planning" },
      { label: "Localized campaign development", detail: "Culture and language-specific campaigns" },
      { label: "Cultural adaptation and compliance", detail: "Regional regulations and best practices" },
      { label: "Multi-language campaign management", detail: "Ongoing optimization per market" }
    ],
    billing: "hybrid",
    price: { setup: 8500, monthly: 3500 },
    dependencies: ["Additional $3,500/month per additional market"],
    pairsBestWith: ["Enterprise"]
  },
  {
    id: "marketing-rapid-campaign-launch",
    service: "marketing",
    name: "Rapid Campaign Launch",
    description: "Expedited campaign deployment for time-sensitive marketing opportunities.",
    deliverables: [
      { label: "2-week campaign launch guarantee", detail: "Accelerated setup and deployment" },
      { label: "Expedited setup across all channels", detail: "Priority resource allocation" },
      { label: "Priority support and optimization", detail: "Daily monitoring and adjustments" },
      { label: "Quick-win optimization focus", detail: "Immediate performance improvements" }
    ],
    billing: "one-time",
    price: { setup: 5000 },
    dependencies: ["+50% surcharge on base package rate during launch period"],
    pairsBestWith: ["Professional", "Enterprise"],
    popular: true
  },
  {
    id: "marketing-crisis-communications",
    service: "marketing",
    name: "Crisis Communications Package",
    description: "24/7 crisis response and reputation management for brand protection.",
    deliverables: [
      { label: "Crisis communication plan development", detail: "Proactive response strategy and protocols" },
      { label: "Media relations strategy", detail: "Stakeholder communication planning" },
      { label: "24/7 crisis response support", detail: "Immediate response team activation" },
      { label: "Reputation monitoring setup", detail: "Real-time brand mention tracking" }
    ],
    billing: "hybrid",
    price: { setup: 6500, monthly: 2500 },
    dependencies: ["Activated only during crisis periods"],
    pairsBestWith: ["Enterprise"]
  }
];

export default marketingAddOns;