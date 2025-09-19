// /src/data/packages/content-production/content-production-packages.ts
// Content Production service packages - 3 tiers (Essential/Professional/Enterprise)
// This is the COMPLETE menu of packages for the content production service hub

import type { Package } from "../_types/packages.types";

export const contentProductionPackages: Package[] = [
  {
    id: "content-essential",
    service: "content",
    name: "Essential Content Package",
    tier: "Essential",
    summary: "Get consistent, on-brand content shipped every month for growing businesses.",
    idealFor: "Small businesses getting started with content marketing",
    outcomes: [
      "Consistent publishing cadence",
      "Professional brand voice development", 
      "Improved search visibility",
      "Social media content pipeline"
    ],
    features: [
      { label: "20 pieces of written content per month", detail: "Blog posts, social posts, web copy" },
      { label: "Basic graphic design", detail: "5 pieces per month" },
      { label: "Content calendar and publishing schedule", detail: "30-day rolling calendar" },
      { label: "Basic brand voice guidelines", detail: "Tone, style, messaging framework" },
      { label: "Monthly performance reporting", detail: "Engagement metrics and insights" }
    ],
    price: { 
      monthly: 3500,
      notes: "Includes content strategy session" 
    },
    badges: ["Most Popular"],
    sla: "Content delivered within 5 business days",
    popular: true
  },
  {
    id: "content-professional", 
    service: "content",
    name: "Professional Content Package",
    tier: "Professional",
    summary: "Comprehensive content strategy with video, photography, and advanced optimization.",
    idealFor: "Growing businesses needing consistent, high-quality content across channels",
    outcomes: [
      "40% increase in content engagement",
      "Established thought leadership",
      "Multi-channel content presence",
      "SEO content optimization"
    ],
    features: [
      { label: "40 pieces of written content per month", detail: "Long-form, social, email, web copy" },
      { label: "Advanced graphic design", detail: "15 pieces per month with brand consistency" },
      { label: "Photography direction and basic editing", detail: "Monthly photo shoot coordination" },
      { label: "Content strategy and optimization", detail: "Quarterly strategy reviews" },
      { label: "Brand voice development and guidelines", detail: "Comprehensive brand book" },
      { label: "Basic video content", detail: "2 short videos per month" },
      { label: "SEO content optimization", detail: "Keyword research and on-page optimization" }
    ],
    price: { 
      monthly: 6500,
      notes: "Includes quarterly strategy sessions"
    },
    badges: ["Best Value"],
    sla: "Content delivered within 3 business days"
  },
  {
    id: "content-enterprise",
    service: "content", 
    name: "Enterprise Content Package",
    tier: "Enterprise",
    summary: "Unlimited content production with dedicated team and advanced governance.",
    idealFor: "Large organizations with complex content needs across multiple channels",
    outcomes: [
      "Complete content ecosystem management",
      "Brand consistency across all touchpoints", 
      "Advanced performance analytics",
      "Dedicated content management team"
    ],
    features: [
      { label: "Unlimited written content", detail: "Full content team at your disposal" },
      { label: "Premium graphic design and brand materials", detail: "Dedicated design resources" },
      { label: "Professional photography and video direction", detail: "Monthly production coordination" },
      { label: "Complete editorial strategy and governance", detail: "Multi-team workflow management" },
      { label: "Multi-platform content optimization", detail: "Platform-specific content adaptation" },
      { label: "Dedicated content manager", detail: "Single point of contact for all content" },
      { label: "Performance analytics and optimization", detail: "Advanced reporting and insights" },
      { label: "Brand compliance monitoring", detail: "Quality assurance across all content" }
    ],
    price: { 
      monthly: 12000,
      notes: "Custom pricing for enterprise volumes"
    },
    badges: ["Premium"],
    sla: "Content delivered within 24-48 hours"
  }
];

export default contentProductionPackages;