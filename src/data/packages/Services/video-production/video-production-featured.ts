// /src/data/packages/video-production/video-production-featured.ts
// Top 3 video production packages for website display

import type { FeaturedCard } from "../_types/packages.types";

export const videoProductionFeatured: FeaturedCard[] = [
  {
    id: "video-brand-essentials-featured",
    service: "video",
    packageId: "video-brand-essentials",
    headline: "Professional video content on a tight budget",
    highlights: [
      "1 professional brand video (2-3 minutes)",
      "Script development & storyboarding",
      "Professional filming & editing",
      "Social media cutdowns (5 versions)",
      "Basic motion graphics"
    ],
    startingAt: 8500,
    badge: "Most Popular",
    ctaLabel: "Create Brand Video"
  },
  {
    id: "video-content-library-featured",
    service: "video",
    packageId: "video-content-library",
    headline: "Consistent video content for marketing success",
    highlights: [
      "4 videos per quarter (testimonials, explainers, etc.)",
      "Social media optimization",
      "Platform-specific formatting",
      "Basic analytics tracking",
      "Content calendar integration"
    ],
    startingAt: 5000,
    badge: "Best Strategy",
    ctaLabel: "Build Video Library"
  },
  {
    id: "video-marketing-system-featured", 
    service: "video",
    packageId: "video-marketing-system",
    headline: "Comprehensive video strategy across all channels",
    highlights: [
      "Unlimited video production",
      "Multi-platform distribution strategy",
      "Advanced motion graphics & animation",
      "Performance tracking & optimization",
      "Dedicated video strategist"
    ],
    startingAt: 15000,
    badge: "Enterprise",
    ctaLabel: "Scale Video Marketing"
  }
];

export default videoProductionFeatured;