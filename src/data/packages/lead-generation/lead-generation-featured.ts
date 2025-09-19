// /src/data/packages/lead-generation/lead-generation-featured.ts
// Top 3 lead generation packages for website display

import type { FeaturedCard } from "../_types/packages.types";

export const leadGenerationFeatured: FeaturedCard[] = [
  {
    id: "leadgen-local-capture-featured",
    service: "leadgen",
    packageId: "leadgen-local-capture", 
    headline: "Generate qualified leads for local businesses",
    highlights: [
      "Google Business Profile optimization",
      "Local SEO lead generation",
      "Lead capture landing pages (3)",
      "Email nurture sequences",
      "Local directory submissions"
    ],
    startingAt: 3500,
    badge: "Most Popular",
    ctaLabel: "Start Capturing Local Leads"
  },
  {
    id: "leadgen-digital-funnel-featured",
    service: "leadgen", 
    packageId: "leadgen-digital-funnel",
    headline: "Systematic process for capturing and converting online leads",
    highlights: [
      "Multi-channel lead generation strategy",
      "A/B tested landing pages", 
      "Lead scoring & automated routing",
      "Email nurturing campaigns",
      "Remarketing campaigns setup"
    ],
    startingAt: 5500,
    badge: "Best ROI",
    ctaLabel: "Build Lead Funnel"
  },
  {
    id: "leadgen-pipeline-accelerator-featured",
    service: "leadgen",
    packageId: "leadgen-pipeline-accelerator", 
    headline: "Stop leads from falling through the cracks",
    highlights: [
      "Advanced lead qualification system",
      "CRM integration & automation",
      "Multi-touch nurture sequences", 
      "Sales team training & enablement",
      "Attribution reporting & optimization"
    ],
    startingAt: 8500,
    badge: "Enterprise",
    ctaLabel: "Accelerate Pipeline"
  }
];

export default leadGenerationFeatured;