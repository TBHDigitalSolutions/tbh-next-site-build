// /src/data/packages/content-production/content-production-addons.ts
// Content Production add-ons - a la carte enhancements that bolt onto any tier

import type { AddOn } from "../_types/packages.types";

export const contentProductionAddOns: AddOn[] = [
  {
    id: "content-brand-identity-kit",
    service: "content",
    name: "Brand Identity Starter Kit", 
    description: "Complete brand foundation with logo, guidelines, and asset library for consistent content creation.",
    deliverables: [
      { label: "Logo design and brand guidelines", detail: "Primary logo, variations, usage rules" },
      { label: "Business card and letterhead design", detail: "Professional stationery suite" },
      { label: "Brand color palette and typography", detail: "Color codes, font specifications" },
      { label: "Basic brand asset library", detail: "Templates and brand elements" }
    ],
    billing: "one-time",
    price: { setup: 4500 },
    pairsBestWith: ["Essential", "Professional"],
    popular: true
  },
  {
    id: "content-professional-photography",
    service: "content", 
    name: "Professional Photography Package",
    description: "High-quality photography for products, team, and brand storytelling content.",
    deliverables: [
      { label: "Full-day product or corporate photography", detail: "8-hour professional shoot" },
      { label: "50+ edited high-resolution images", detail: "Professional editing and retouching" },
      { label: "Usage rights and licensing", detail: "Commercial use license included" },
      { label: "Multiple format optimization", detail: "Web, print, and social formats" }
    ],
    billing: "one-time",
    price: { setup: 3500 },
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "content-audit-strategy",
    service: "content",
    name: "Content Audit & Strategy Package", 
    description: "Comprehensive analysis of existing content with strategic roadmap for improvement.",
    deliverables: [
      { label: "Complete content audit", detail: "Analysis of current content assets" },
      { label: "Competitive content analysis", detail: "Benchmark against industry leaders" },
      { label: "6-month content strategy roadmap", detail: "Detailed implementation plan" },
      { label: "Editorial calendar template setup", detail: "Workflows and approval processes" }
    ],
    billing: "one-time", 
    price: { setup: 2500 },
    pairsBestWith: ["Essential", "Professional", "Enterprise"]
  },
  {
    id: "content-podcast-production",
    service: "content",
    name: "Podcast Production Add-On",
    description: "Complete podcast setup and ongoing production for thought leadership content.",
    deliverables: [
      { label: "Podcast branding and setup", detail: "Logo, intro music, hosting platform" },
      { label: "Monthly episode production", detail: "2 episodes per month, full editing" },
      { label: "Show notes and transcription", detail: "SEO-optimized episode descriptions" },
      { label: "Distribution and promotion", detail: "Multi-platform publishing and social promotion" }
    ],
    billing: "hybrid",
    price: { setup: 4000, monthly: 1500 },
    pairsBestWith: ["Professional", "Enterprise"],
    popular: true
  },
  {
    id: "content-social-management",
    service: "content",
    name: "Social Media Management Add-On",
    description: "Daily social media management with community engagement and performance optimization.",
    deliverables: [
      { label: "Daily social media posting", detail: "3-5 platforms with optimized content" },
      { label: "Community management", detail: "2 hours daily engagement and response" },
      { label: "Social media strategy optimization", detail: "Platform-specific best practices" },
      { label: "Monthly social analytics", detail: "Performance tracking and insights" }
    ],
    billing: "monthly",
    price: { monthly: 2500 },
    pairsBestWith: ["Essential", "Professional"],
    popular: true
  },
  {
    id: "content-video-production",
    service: "content",
    name: "Video Content Production Add-On",
    description: "Professional video content creation for enhanced storytelling and engagement.",
    deliverables: [
      { label: "Monthly video production", detail: "4 videos per month (2-5 minutes each)" },
      { label: "Script development and storyboarding", detail: "Professional pre-production planning" },
      { label: "Professional filming and editing", detail: "Multi-camera setup with advanced editing" },
      { label: "Multi-platform optimization", detail: "Versions for web, social, and presentations" }
    ],
    billing: "monthly",
    price: { monthly: 4500 },
    pairsBestWith: ["Professional", "Enterprise"]
  }
];

export default contentProductionAddOns;