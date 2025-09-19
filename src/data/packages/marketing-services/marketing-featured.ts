// /src/data/packages/marketing/marketing-featured.ts
// Top 3 marketing services packages for website display

import type { FeaturedCard } from "../_types/packages.types";

export const marketingFeatured: FeaturedCard[] = [
  {
    id: "marketing-digital-advertising-featured",
    service: "marketing",
    packageId: "marketing-digital-advertising-starter",
    headline: "Professional ad management on limited budget",
    highlights: [
      "Google Ads campaign setup & management",
      "Facebook/Instagram advertising",
      "Landing page optimization",
      "Conversion tracking setup",
      "Monthly performance reporting"
    ],
    startingAt: 2500,
    badge: "Most Popular",
    ctaLabel: "Start Advertising"
  },
  {
    id: "marketing-multi-platform-featured",
    service: "marketing",
    packageId: "marketing-multi-platform-growth",
    headline: "Scale across multiple marketing channels efficiently",
    highlights: [
      "Google, Meta, LinkedIn advertising",
      "Marketing automation setup",
      "Content distribution strategy",
      "Advanced tracking & attribution", 
      "Bi-weekly optimization calls"
    ],
    startingAt: 5000,
    badge: "Best Growth",
    ctaLabel: "Scale Marketing"
  },
  {
    id: "marketing-full-stack-featured",
    service: "marketing",
    packageId: "marketing-full-stack",
    headline: "Complete marketing department without internal hiring",
    highlights: [
      "Omnichannel advertising management",
      "Marketing technology stack management",
      "PR & thought leadership campaigns",
      "Advanced analytics & reporting",
      "Dedicated marketing team"
    ],
    startingAt: 12000,
    badge: "Enterprise",
    ctaLabel: "Get Marketing Team"
  }
];

export default marketingFeatured;