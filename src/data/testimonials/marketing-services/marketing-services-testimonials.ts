// ============================================================================
// FILE: src/data/testimonials/marketing-services/marketing-services-testimonials.ts
// Marketing Services Testimonials - Production Ready (CORRECTED FOR CANONICAL NAMING)
// ============================================================================

import type {
  Testimonial,
  MarketingAutomationTestimonialsSection,
  ServiceType,
  TestimonialRating
} from "../types";

/**
 * Marketing Services testimonials data
 * Follows canonical field structure for consistent component integration
 */
const marketingServicesTestimonials: Testimonial[] = [
  {
    id: "marketing-services-1",
    quote: "TBH Digital Solutions completely transformed our marketing operations. The automation they built increased our lead quality by 45% while reducing manual work by 60%. Our team can now focus on strategy instead of repetitive tasks.",
    author: "Jennifer Walsh",
    title: "VP of Marketing",
    company: "TechFlow Solutions",
    image: "/images/testimonials/jennifer-walsh.png",
    rating: TestimonialRating.FIVE,
    date: "2024-03-15",
    service: ServiceType.MARKETING_SERVICES,
    featured: true,
    metrics: "45% increase in lead quality, 60% reduction in manual work"
  },
  {
    id: "marketing-services-2",
    quote: "Their lead scoring model helped our sales team focus on the right prospects at the right time. Our conversion rate from MQL to SQL improved by 34% in just 3 months, and our sales team loves the quality of leads now.",
    author: "Marcus Rodriguez",
    title: "Sales Director",
    company: "ScaleUp Manufacturing",
    image: "/images/testimonials/marcus-rodriguez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-02-28",
    service: ServiceType.MARKETING_SERVICES,
    featured: true,
    metrics: "34% improvement in MQL to SQL conversion"
  },
  {
    id: "marketing-services-3",
    quote: "The lifecycle automation they designed generated over $2M in pipeline for us. The ROI has been incredible, and the system practically runs itself. We've seen a complete transformation in our marketing effectiveness.",
    author: "Sarah Kim",
    title: "Marketing Director",
    company: "GrowthLabs Inc",
    image: "/images/testimonials/sarah-mckelvey.png",
    rating: TestimonialRating.FIVE,
    date: "2024-01-20",
    service: ServiceType.MARKETING_SERVICES,
    featured: true,
    metrics: "$2M in pipeline generated"
  },
  {
    id: "marketing-services-4",
    quote: "The email automation sequences they built for our SaaS onboarding increased trial-to-paid conversions by 67%. The personalization and timing are perfect.",
    author: "David Chen",
    title: "Product Marketing Manager",
    company: "CloudTech Solutions",
    image: "/images/testimonials/david-chen.png",
    rating: TestimonialRating.FIVE,
    date: "2024-04-10",
    service: ServiceType.MARKETING_SERVICES,
    featured: false,
    metrics: "67% increase in trial-to-paid conversions"
  },
  {
    id: "marketing-services-5",
    quote: "Their marketing automation platform integration saved us months of development time and delivered results immediately. Our nurture campaigns now have 3x higher engagement rates.",
    author: "Emma Thompson",
    title: "Marketing Operations Manager",
    company: "InnovateApp",
    image: "/images/testimonials/emma-thompson.png",
    rating: TestimonialRating.FIVE,
    date: "2024-05-15",
    service: ServiceType.MARKETING_SERVICES,
    featured: false,
    metrics: "3x higher nurture campaign engagement"
  }
];

/**
 * Marketing Services testimonials section configuration
 * Ready for direct integration with Testimonials component
 */
export const marketingServicesTestimonialsSection: MarketingAutomationTestimonialsSection = {
  title: "Marketing Services Results",
  subtitle: "Streamlined workflows that scale your marketing impact.",
  data: marketingServicesTestimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: false,
  featuredOnly: false
};

export default marketingServicesTestimonials;