// /src/data/packages/seo-services/seo-services-featured.ts
// Top 3 SEO services packages for website display

import type { FeaturedCard } from "../_types/packages.types";

export const seoServicesFeatured: FeaturedCard[] = [
  {
    id: "seo-local-domination-featured",
    service: "seo",
    packageId: "seo-local-domination",
    headline: "Dominate local search results and get found nearby",
    highlights: [
      "Google Business Profile optimization",
      "Local keyword optimization", 
      "Citation building & management",
      "Review management system",
      "Local ranking tracking"
    ],
    startingAt: 2500,
    badge: "Most Popular",
    ctaLabel: "Dominate Local Search"
  },
  {
    id: "seo-organic-growth-featured",
    service: "seo",
    packageId: "seo-organic-growth-engine", 
    headline: "Rank for important keywords and drive organic traffic",
    highlights: [
      "Technical SEO optimization",
      "Keyword research & content strategy",
      "On-page optimization (25 pages)",
      "Link building campaigns", 
      "Monthly ranking & traffic reports"
    ],
    startingAt: 4500,
    badge: "Best Growth",
    ctaLabel: "Grow Organic Traffic"
  },
  {
    id: "seo-enterprise-system-featured",
    service: "seo", 
    packageId: "seo-enterprise-system",
    headline: "Enterprise SEO for large websites with complex challenges",
    highlights: [
      "Comprehensive technical SEO",
      "AI & featured snippet optimization",
      "Large-scale content optimization",
      "Advanced schema implementation",
      "Dedicated SEO strategist"
    ],
    startingAt: 8500,
    badge: "Enterprise",
    ctaLabel: "Scale SEO Enterprise"
  }
];

export default seoServicesFeatured;