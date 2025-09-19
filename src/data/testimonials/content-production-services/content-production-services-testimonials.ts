// ============================================================================
// FILE: src/data/testimonials/content-production-services/content-production-services-testimonials.ts
// Content Production Services Testimonials - Production Ready (CORRECTED FOR CANONICAL NAMING)
// ============================================================================

import type {
  Testimonial,
  ContentProductionTestimonialsSection,
  ServiceType,
  TestimonialRating
} from "../types";

/**
 * Content Production Services testimonials data
 * Follows canonical field structure for consistent component integration
 */
const contentProductionServicesTestimonials: Testimonial[] = [
  {
    id: "content-prod-1",
    quote: "TBH Digital Solutions completely transformed our content strategy. Our organic traffic increased by 250% in just 6 months, and the quality of leads has never been better.",
    author: "Sarah Chen",
    title: "Marketing Director",
    company: "TechFlow Solutions",
    image: "/images/testimonials/sara-chen.png",
    rating: TestimonialRating.FIVE,
    date: "2024-12-01",
    service: ServiceType.CONTENT_PRODUCTION_SERVICES,
    featured: true,
    metrics: "250% organic traffic increase, 180% lead growth"
  },
  {
    id: "content-prod-2",
    quote: "The quality and consistency of their content production is unmatched. They truly understand our brand voice and have helped us establish thought leadership in our industry.",
    author: "Michael Rodriguez",
    title: "CEO",
    company: "GrowthLabs",
    image: "/images/testimonials/micheal-rodriguez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-11-15",
    service: ServiceType.CONTENT_PRODUCTION_SERVICES,
    featured: true,
    metrics: "40% improvement in brand recognition"
  },
  {
    id: "content-prod-3",
    quote: "Their video content strategy helped us generate over 500 qualified leads in the first quarter alone. The ROI has been incredible and the content quality is outstanding.",
    author: "Emma Thompson",
    title: "VP of Marketing",
    company: "ScaleUp Inc",
    image: "/images/testimonials/emma-thompson.png",
    rating: TestimonialRating.FIVE,
    date: "2024-10-20",
    service: ServiceType.CONTENT_PRODUCTION_SERVICES,
    featured: true,
    metrics: "500+ qualified leads, 85% video completion rate"
  },
  {
    id: "content-prod-4",
    quote: "TBH Digital's content team created a series of whitepapers that became our top lead magnets. Download rates exceeded 15,000 in the first month and lead quality improved dramatically.",
    author: "David Park",
    title: "Head of Demand Generation",
    company: "B2B Solutions Corp",
    image: "/images/testimonials/david-park.png",
    rating: TestimonialRating.FIVE,
    date: "2024-09-12",
    service: ServiceType.CONTENT_PRODUCTION_SERVICES,
    featured: false,
    metrics: "15,000+ whitepaper downloads in first month"
  },
  {
    id: "content-prod-5",
    quote: "Their blog content strategy transformed our SEO performance. We went from 50 keywords ranking on page 1 to over 300, and our organic traffic tripled in 8 months.",
    author: "Jennifer Walsh",
    title: "Content Marketing Manager",
    company: "Digital Growth Agency",
    image: "/images/testimonials/jennifer-walsh.png",
    rating: TestimonialRating.FIVE,
    date: "2024-08-25",
    service: ServiceType.CONTENT_PRODUCTION_SERVICES,
    featured: false,
    metrics: "From 50 to 300+ page 1 keywords, 3x organic traffic"
  },
  {
    id: "content-prod-6",
    quote: "The case studies they produced for us became our most powerful sales tools. Our sales team reports they're closing 60% more deals when they use the case studies in their presentations.",
    author: "Marcus Rodriguez",
    title: "Sales Director",
    company: "Enterprise Solutions Inc",
    image: "/images/testimonials/marcus-rodriguez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-07-18",
    service: ServiceType.CONTENT_PRODUCTION_SERVICES,
    featured: false,
    metrics: "60% more sales closures with case studies"
  }
];

/**
 * Content Production Services testimonials section configuration
 * Ready for direct integration with Testimonials component
 */
export const contentProductionServicesTestimonialsSection: ContentProductionTestimonialsSection = {
  title: "Content Production Services Results",
  subtitle: "Strategic content that drives engagement and conversions.",
  data: contentProductionServicesTestimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: false,
  featuredOnly: false
};

export default contentProductionServicesTestimonials;