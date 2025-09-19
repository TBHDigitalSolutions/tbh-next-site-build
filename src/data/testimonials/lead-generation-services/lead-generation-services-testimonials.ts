// ============================================================================
// FILE: src/data/testimonials/lead-generation-services/lead-generation-services-testimonials.ts
// Lead Generation Services Testimonials - Production Ready (CORRECTED FOR CANONICAL NAMING)
// ============================================================================

import type {
  Testimonial,
  LeadGenerationTestimonialsSection,
  ServiceType,
  TestimonialRating
} from "../types";

/**
 * Lead Generation Services testimonials data
 * Follows canonical field structure for consistent component integration
 */
const leadGenerationServicesTestimonials: Testimonial[] = [
  {
    id: "lead-gen-1",
    quote: "TBH Digital Solutions completely transformed our lead generation. We went from struggling to get 50 leads per month to consistently generating 300+ qualified leads that our sales team actually wants to follow up on.",
    author: "David Park",
    title: "VP of Marketing",
    company: "TechScale Solutions",
    image: "/pages/services-page/lead-generation/testimonials/david-park.png",
    rating: TestimonialRating.FIVE,
    date: "2024-03-15",
    service: ServiceType.LEAD_GENERATION_SERVICES,
    featured: true,
    metrics: "From 50 to 300+ qualified leads per month"
  },
  {
    id: "lead-gen-2",
    quote: "Their strategic approach to lead generation helped us identify our ideal customers and create campaigns that actually convert. ROI improved by 250% and our sales team is much happier with lead quality.",
    author: "Lisa Hernandez",
    title: "Marketing Director",
    company: "GrowthLabs Inc",
    image: "/pages/services-page/lead-generation/testimonials/lisa-hernadez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-02-28",
    service: ServiceType.LEAD_GENERATION_SERVICES,
    featured: true,
    metrics: "250% ROI improvement"
  },
  {
    id: "lead-gen-3",
    quote: "The lead quality from their campaigns is exceptional. Our sales team is closing 45% of the leads they generate, compared to 15% from our previous agency. The difference is night and day.",
    author: "Robert Holden",
    title: "CEO",
    company: "ScaleUp Manufacturing",
    image: "/pages/services-page/lead-generation/testimonials/robert-holden.png",
    rating: TestimonialRating.FIVE,
    date: "2024-01-20",
    service: ServiceType.LEAD_GENERATION_SERVICES,
    featured: true,
    metrics: "45% close rate vs 15% previously"
  },
  {
    id: "lead-gen-4",
    quote: "TBH Digital's lead generation strategy completely transformed our B2B sales pipeline. We've seen a 300% increase in qualified leads and our cost per acquisition dropped by 60%.",
    author: "Jennifer Walsh",
    title: "VP of Sales",
    company: "TechFlow Solutions",
    image: "/images/testimonials/jennifer-walsh.png",
    rating: TestimonialRating.FIVE,
    date: "2024-04-12",
    service: ServiceType.LEAD_GENERATION_SERVICES,
    featured: false,
    metrics: "300% increase in qualified leads, 60% lower cost per acquisition"
  },
  {
    id: "lead-gen-5",
    quote: "Their lead scoring and nurturing system helped us focus on the right prospects. Our sales team productivity increased by 40% and we're closing more deals than ever.",
    author: "Marcus Rodriguez",
    title: "Sales Director",
    company: "InnovateApp",
    image: "/images/testimonials/marcus-rodriguez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-05-08",
    service: ServiceType.LEAD_GENERATION_SERVICES,
    featured: false,
    metrics: "40% increase in sales productivity"
  }
];

/**
 * Lead Generation Services testimonials section configuration
 * Ready for direct integration with Testimonials component
 */
export const leadGenerationServicesTestimonialsSection: LeadGenerationTestimonialsSection = {
  title: "Lead Generation Services Results",
  subtitle: "Higher-quality pipeline with lower acquisition cost.",
  data: leadGenerationServicesTestimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: false,
  featuredOnly: false
};

export default leadGenerationServicesTestimonials;