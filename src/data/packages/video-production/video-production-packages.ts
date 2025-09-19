// /src/data/packages/video-production/video-production-packages.ts
// Video Production service packages - 3 tiers (Essential/Professional/Enterprise)
// This is the COMPLETE menu of packages for the video production service hub

import type { Package } from "../_types/packages.types";

export const videoProductionPackages: Package[] = [
  {
    id: "video-essential",
    service: "video",
    name: "Brand Video Essentials",
    tier: "Essential",
    summary: "Professional video content foundation that tells your story and drives engagement.",
    idealFor: "Small businesses needing professional video content but with limited budget",
    outcomes: [
      "Professional brand credibility through video",
      "Increased engagement and conversion rates",
      "Multi-platform video content library",
      "Enhanced storytelling and messaging"
    ],
    features: [
      { label: "1 professional brand video", detail: "2-3 minutes, fully produced" },
      { label: "Script development & storyboarding", detail: "Professional pre-production planning" },
      { label: "Professional filming & editing", detail: "Single-camera setup with professional quality" },
      { label: "Social media cutdowns", detail: "5 versions optimized for different platforms" },
      { label: "Basic motion graphics", detail: "Titles, lower thirds, and simple animations" },
      { label: "Multiple format delivery", detail: "Web, social, and presentation formats" }
    ],
    price: { 
      setup: 8500,
      notes: "Project-based pricing, additional videos available"
    },
    badges: ["Great for Startups"],
    sla: "2-3 week delivery from concept to final delivery",
    popular: true
  },
  {
    id: "video-professional", 
    service: "video",
    name: "Content Video Library",
    tier: "Professional",
    summary: "Consistent video content production with multi-platform optimization and performance tracking.",
    idealFor: "Growing businesses needing consistent video content for marketing and sales",
    outcomes: [
      "Consistent video content pipeline",
      "Multi-platform audience engagement",
      "Professional video marketing presence",
      "Measurable video performance improvement"
    ],
    features: [
      { label: "4 videos per quarter", detail: "Testimonials, explainers, product demos" },
      { label: "Social media optimization", detail: "Platform-specific versions and formats" },
      { label: "Platform-specific formatting", detail: "YouTube, LinkedIn, Instagram, TikTok ready" },
      { label: "Basic analytics tracking", detail: "Performance monitoring across platforms" },
      { label: "Content calendar integration", detail: "Coordinated with overall marketing strategy" },
      { label: "Professional editing and motion graphics", detail: "Advanced post-production quality" },
      { label: "Quarterly strategy sessions", detail: "Video strategy alignment and optimization" }
    ],
    price: { 
      setup: 5000,
      monthly: 6500,
      notes: "Includes quarterly planning and strategy sessions"
    },
    badges: ["Most Popular"],
    sla: "Video delivery within 2 weeks, monthly performance reviews"
  },
  {
    id: "video-enterprise",
    service: "video", 
    name: "Video Marketing System",
    tier: "Enterprise",
    summary: "Unlimited video production with dedicated team and comprehensive distribution strategy.",
    idealFor: "Large organizations with comprehensive video needs across all marketing channels",
    outcomes: [
      "Complete video marketing ecosystem",
      "Unlimited professional video capability",
      "Advanced distribution and optimization",
      "Dedicated video marketing partnership"
    ],
    features: [
      { label: "Unlimited video production", detail: "Full video team at your disposal" },
      { label: "Multi-platform distribution strategy", detail: "Comprehensive channel optimization" },
      { label: "Advanced motion graphics & animation", detail: "Cinematic quality post-production" },
      { label: "Performance tracking & optimization", detail: "Advanced analytics and ROI measurement" },
      { label: "Dedicated video strategist", detail: "Senior video marketing specialist assigned" },
      { label: "Live streaming and event coverage", detail: "Real-time video production capabilities" },
      { label: "Custom video marketing automation", detail: "Integrated video distribution workflows" }
    ],
    price: { 
      setup: 15000,
      monthly: 12500,
      notes: "Custom enterprise pricing based on volume and complexity"
    },
    badges: ["Premium"],
    sla: "Dedicated account management with weekly strategy calls"
  }
];

export default videoProductionPackages;