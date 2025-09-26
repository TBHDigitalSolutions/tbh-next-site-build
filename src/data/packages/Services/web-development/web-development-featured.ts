// /src/data/packages/web-development/web-development-featured.ts
// Top 3 web development packages for website display

import type { FeaturedCard } from "../_types/packages.types";

export const webDevelopmentFeatured: FeaturedCard[] = [
  {
    id: "webdev-professional-website-featured",
    service: "webdev",
    packageId: "webdev-professional-website",
    headline: "Modern website that converts visitors into customers",
    highlights: [
      "Custom responsive design (10 pages)",
      "Content management system",
      "Contact forms & analytics setup", 
      "Mobile optimization",
      "3 months maintenance included"
    ],
    startingAt: 8500,
    badge: "Most Popular",
    ctaLabel: "Build Professional Site"
  },
  {
    id: "webdev-business-growth-featured",
    service: "webdev", 
    packageId: "webdev-business-growth-platform",
    headline: "Advanced functionality to support business growth",
    highlights: [
      "Advanced website with integrations (20 pages)",
      "E-commerce or booking functionality",
      "CRM integration",
      "Performance optimization",
      "6 months maintenance included"
    ],
    startingAt: 18000,
    badge: "Best Growth",
    ctaLabel: "Scale Business Platform"
  },
  {
    id: "webdev-custom-application-featured",
    service: "webdev",
    packageId: "webdev-custom-web-application", 
    headline: "Custom solutions for unique business requirements",
    highlights: [
      "Custom web application development",
      "Advanced integrations & APIs",
      "User dashboard & admin systems",
      "Enterprise security & hosting",
      "Ongoing development support"
    ],
    startingAt: 45000,
    badge: "Enterprise",
    ctaLabel: "Build Custom Solution"
  }
];

export default webDevelopmentFeatured;