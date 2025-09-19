// /src/data/packages/content-production/content-production-featured.ts
// Top 3 content production packages for website display

import type { FeaturedCard } from "../_types/packages.types";

export const contentProductionFeatured: FeaturedCard[] = [
  {
    id: "content-brand-starter-featured",
    service: "content",
    packageId: "content-brand-starter",
    headline: "Build consistent brand voice across all platforms",
    highlights: [
      "Brand voice development & guidelines",
      "20 pieces of monthly content (blogs, social posts)",
      "Basic graphic design (10 pieces/month)",
      "Content calendar & publishing schedule",
      "Monthly performance reporting"
    ],
    startingAt: 2500,
    badge: "Most Popular",
    ctaLabel: "Start Building Brand Voice"
  },
  {
    id: "content-social-growth-featured", 
    service: "content",
    packageId: "content-social-growth",
    headline: "Create engaging social media content consistently",
    highlights: [
      "40 social media posts per month (all platforms)",
      "Professional graphic design & templates", 
      "Hashtag research & optimization",
      "Community management (2 hours/day)",
      "Monthly analytics & optimization"
    ],
    startingAt: 1500,
    badge: "Best Value",
    ctaLabel: "Grow Social Presence"
  },
  {
    id: "content-complete-system-featured",
    service: "content", 
    packageId: "content-complete-system",
    headline: "Comprehensive content across all marketing channels",
    highlights: [
      "Unlimited written content",
      "Professional photography direction",
      "Video content creation (4 videos/month)",
      "Multi-platform optimization",
      "Dedicated content strategist"
    ],
    startingAt: 5000,
    badge: "Enterprise",
    ctaLabel: "Get Complete System"
  }
];

export default contentProductionFeatured;