// /src/data/packages/marketing/marketing-packages.ts
// Marketing Services packages - 3 tiers (Essential/Professional/Enterprise)
// This is the COMPLETE menu of packages for the marketing services hub

import type { Package } from "../_types/packages.types";

export const marketingPackages: Package[] = [
  {
    id: "marketing-essential",
    service: "marketing",
    name: "Digital Marketing Starter",
    tier: "Essential",
    summary: "Professional ad management and basic automation for small businesses entering digital marketing.",
    idealFor: "Small businesses needing professional ad management but with limited budget",
    outcomes: [
      "Professional campaign setup and management",
      "Clear performance tracking and reporting",
      "Improved cost per acquisition",
      "Basic marketing automation foundation"
    ],
    features: [
      { label: "Google Ads campaign management", detail: "Search and display campaigns with optimization" },
      { label: "Facebook/Instagram advertising", detail: "Social media ad campaigns and audience targeting" },
      { label: "Basic marketing automation setup", detail: "Email sequences and lead nurturing" },
      { label: "Monthly performance reporting", detail: "ROI tracking and optimization recommendations" },
      { label: "Up to $5K monthly ad spend management", detail: "Professional campaign oversight" },
      { label: "Conversion tracking setup", detail: "Goal tracking and attribution analysis" }
    ],
    price: { 
      monthly: 3500,
      notes: "Ad spend billed separately to your accounts" 
    },
    badges: ["Most Popular"],
    sla: "Campaign launch within 1 week, weekly optimization",
    popular: true
  },
  {
    id: "marketing-professional", 
    service: "marketing",
    name: "Comprehensive Marketing Package",
    tier: "Professional",
    summary: "Multi-platform marketing with advanced automation, content, and analytics for growing businesses.",
    idealFor: "Growing businesses with diverse marketing needs across multiple channels",
    outcomes: [
      "30-50% improvement in marketing efficiency",
      "Multi-channel attribution clarity",
      "Advanced automation and personalization",
      "Comprehensive content and campaign strategy"
    ],
    features: [
      { label: "Multi-platform paid advertising", detail: "Google, Meta, LinkedIn with advanced targeting" },
      { label: "Content marketing and distribution", detail: "Blog content, social media, email campaigns" },
      { label: "Marketing automation and lead nurturing", detail: "Advanced workflows and personalization" },
      { label: "Influencer partnership coordination", detail: "Influencer identification and campaign management" },
      { label: "Advanced analytics and reporting", detail: "Multi-touch attribution and ROI analysis" },
      { label: "Up to $15K monthly ad spend management", detail: "Professional campaign optimization" },
      { label: "Bi-weekly strategy optimization", detail: "Regular performance reviews and adjustments" }
    ],
    price: { 
      monthly: 7500,
      notes: "Includes quarterly strategy sessions and ad spend management"
    },
    badges: ["Best Value"],
    sla: "Same-day campaign adjustments, bi-weekly strategy calls"
  },
  {
    id: "marketing-enterprise",
    service: "marketing", 
    name: "Enterprise Marketing Solutions",
    tier: "Enterprise",
    summary: "Complete marketing department capabilities with dedicated team and advanced technology stack.",
    idealFor: "Large organizations with complex marketing requirements across multiple markets",
    outcomes: [
      "Full-funnel marketing optimization",
      "Enterprise-scale campaign management",
      "Advanced MarTech stack management",
      "Dedicated marketing leadership"
    ],
    features: [
      { label: "Full-funnel marketing strategy", detail: "Awareness to retention across all channels" },
      { label: "Advanced programmatic advertising", detail: "Automated bidding and audience optimization" },
      { label: "Marketing technology stack management", detail: "Platform integration and optimization" },
      { label: "PR and communications strategy", detail: "Media relations and thought leadership" },
      { label: "Executive thought leadership campaigns", detail: "C-level positioning and content strategy" },
      { label: "Dedicated marketing team", detail: "Senior strategists exclusively assigned" },
      { label: "Custom attribution and analytics", detail: "Enterprise reporting and insights platform" }
    ],
    price: { 
      monthly: 18000,
      notes: "Custom enterprise pricing based on scope and ad spend"
    },
    badges: ["Premium"],
    sla: "Dedicated account management with weekly strategy sessions"
  }
];

export default marketingPackages;