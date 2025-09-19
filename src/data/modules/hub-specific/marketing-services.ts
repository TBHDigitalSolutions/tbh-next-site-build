import type { ModuleItem } from "../types";

export const marketingServicesModules: ModuleItem[] = [
  {
    type: "audit",
    title: "Marketing Stack Audit",
    description: "Comprehensive analysis of your marketing tools with optimization recommendations.",
    href: "/audit/marketing-stack",
    image: "/modules/martech-audit.jpg",
    tags: ["marketing-services", "marketing-technology-automation"],
    featured: true,
    hubSpecific: true
  },
  {
    type: "calculator",
    title: "Ad Spend Optimizer",
    description: "Optimize budget allocation across Google, Meta, LinkedIn, and other platforms.",
    href: "/tools/ad-spend-optimizer",
    image: "/modules/ad-optimizer.jpg",
    tags: ["marketing-services", "digital-advertising"],
    hubSpecific: true
  },
  {
    type: "resource",
    title: "Content Calendar Template",
    description: "90-day content calendar template with posting schedules and campaign integration.",
    href: "/resources/content-calendar",
    image: "/modules/content-calendar.jpg",
    tags: ["marketing-services", "content-creative"],
    hubSpecific: true
  },
  {
    type: "case-study",
    title: "B2B Lead Generation Success",
    description: "How we generated 847 qualified leads and $3.2M pipeline in 6 months.",
    href: "/case-studies/b2b-leadgen-success",
    image: "/modules/b2b-leadgen-case.jpg",
    tags: ["marketing-services", "digital-advertising"],
    featured: true
  },
  {
    type: "tool",
    title: "Attribution Analyzer",
    description: "Track customer journeys across multiple touchpoints and optimize attribution.",
    href: "/tools/attribution-analyzer",
    image: "/modules/attribution-tool.jpg",
    tags: ["marketing-services", "analytics-optimization"],
    hubSpecific: true
  },
  {
    type: "checklist",
    title: "PR Campaign Checklist",
    description: "Complete guide to launching successful public relations campaigns.",
    href: "/resources/pr-campaign-checklist",
    image: "/modules/pr-checklist.jpg",
    tags: ["marketing-services", "public-relations-communications"],
    hubSpecific: true
  },
  {
    type: "calculator",
    title: "Customer LTV Calculator",
    description: "Calculate customer lifetime value and optimize acquisition spending.",
    href: "/tools/ltv-calculator",
    image: "/modules/ltv-calculator.jpg",
    tags: ["marketing-services", "analytics-optimization"],
    hubSpecific: true
  },
  {
    type: "tool",
    title: "Competitor Ad Intelligence",
    description: "Analyze competitor advertising strategies across all major platforms.",
    href: "/tools/competitor-ads",
    image: "/modules/competitor-intel.jpg",
    tags: ["marketing-services", "digital-advertising"],
    hubSpecific: true
  }
];