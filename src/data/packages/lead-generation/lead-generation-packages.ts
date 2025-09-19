// /src/data/packages/lead-generation/lead-generation-packages.ts
// Lead Generation service packages - 3 tiers (Essential/Professional/Enterprise)
// This is the COMPLETE menu of packages for the lead generation service hub

import type { Package } from "../_types/packages.types";

export const leadGenerationPackages: Package[] = [
  {
    id: "leadgen-essential",
    service: "leadgen",
    name: "Starter Lead Gen Package",
    tier: "Essential",
    summary: "Systematic lead generation foundation for businesses starting their growth journey.",
    idealFor: "Small businesses new to lead generation seeking predictable lead flow",
    outcomes: [
      "Consistent qualified lead pipeline",
      "Automated lead capture and routing",
      "Basic lead scoring and prioritization",
      "Email nurturing that converts"
    ],
    features: [
      { label: "2-channel lead generation setup", detail: "Google Ads + Facebook/LinkedIn campaigns" },
      { label: "Basic landing page creation", detail: "3 high-converting landing pages" },
      { label: "Lead scoring system setup", detail: "Behavioral and demographic scoring" },
      { label: "Email nurture sequence", detail: "5-email automated follow-up" },
      { label: "Monthly lead gen reporting", detail: "Lead volume, quality, and cost metrics" },
      { label: "CRM integration and automation", detail: "Seamless lead routing and tracking" }
    ],
    price: { 
      monthly: 4000,
      notes: "Includes initial setup and campaign launch" 
    },
    badges: ["Most Popular"],
    sla: "Lead flow within 2 weeks of launch",
    popular: true
  },
  {
    id: "leadgen-professional", 
    service: "leadgen",
    name: "Growth Lead Gen Package",
    tier: "Professional",
    summary: "Comprehensive multi-channel lead generation with advanced optimization and nurturing.",
    idealFor: "Growing businesses ready to scale lead acquisition across multiple channels",
    outcomes: [
      "40-60% increase in qualified leads",
      "Multi-channel attribution clarity",
      "Advanced lead qualification",
      "Automated sales-ready handoffs"
    ],
    features: [
      { label: "4-channel lead generation management", detail: "Google, Meta, LinkedIn, content marketing" },
      { label: "A/B testing and optimization", detail: "Continuous conversion rate improvements" },
      { label: "Advanced lead scoring and routing", detail: "Predictive scoring with sales alignment" },
      { label: "Multi-sequence email nurturing", detail: "Persona-based nurture tracks" },
      { label: "Remarketing campaign setup", detail: "Cross-platform visitor retargeting" },
      { label: "Webinar or event planning", detail: "Quarterly lead generation events" },
      { label: "Advanced analytics and attribution", detail: "Multi-touch conversion tracking" }
    ],
    price: { 
      monthly: 7500,
      notes: "Includes quarterly strategy optimization"
    },
    badges: ["Best Value"],
    sla: "Weekly optimization and reporting"
  },
  {
    id: "leadgen-enterprise",
    service: "leadgen", 
    name: "Enterprise Lead Gen Package",
    tier: "Enterprise",
    summary: "Complete lead generation ecosystem with dedicated team and custom attribution.",
    idealFor: "Large organizations with complex sales funnels and multiple product lines",
    outcomes: [
      "Enterprise-scale lead qualification",
      "Custom attribution modeling",
      "Account-based marketing execution",
      "Dedicated lead generation partnership"
    ],
    features: [
      { label: "Omnichannel lead generation strategy", detail: "Unlimited channels and campaigns" },
      { label: "Custom dashboard and reporting", detail: "Real-time lead intelligence platform" },
      { label: "Advanced attribution modeling", detail: "Multi-touch revenue attribution" },
      { label: "Complex nurture workflows", detail: "AI-powered personalization" },
      { label: "Account-based marketing campaigns", detail: "Enterprise account targeting" },
      { label: "Dedicated lead generation specialist", detail: "Senior strategist exclusively assigned" },
      { label: "Custom automation development", detail: "Bespoke workflow and integration build" }
    ],
    price: { 
      monthly: 15000,
      notes: "Custom enterprise pricing based on scale"
    },
    badges: ["Premium"],
    sla: "Dedicated account management with weekly strategy calls"
  }
];

export default leadGenerationPackages;