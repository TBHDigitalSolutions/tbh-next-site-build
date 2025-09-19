// ============================================================================
// FILE: src/data/testimonials/seo-services/seo-services-testimonials.ts
// SEO Services Testimonials - Production Ready (CORRECTED FOR CANONICAL NAMING)
// ============================================================================

import type {
  Testimonial,
  SEOServicesTestimonialsSection,
  ServiceType,
  TestimonialRating
} from "../types";

/**
 * SEO Services testimonials data
 * Follows canonical field structure for consistent component integration
 */
const seoServicesTestimonials: Testimonial[] = [
  {
    id: "seo-1",
    quote: "TBH Digital Solutions transformed our organic search presence. We went from page 3 to page 1 for our most important keywords, and our organic traffic increased by 150% in just 6 months.",
    author: "David Park",
    title: "Marketing Director",
    company: "TechFlow Solutions",
    image: "/images/testimonials/david-park.png",
    rating: TestimonialRating.FIVE,
    date: "2024-03-15",
    service: ServiceType.SEO_SERVICES,
    featured: true,
    metrics: "150% increase in organic traffic, page 1 rankings"
  },
  {
    id: "seo-2",
    quote: "Their technical SEO expertise is unmatched. They identified and fixed issues that other agencies missed, resulting in a 40% improvement in our Core Web Vitals scores and significantly better rankings.",
    author: "Lisa Rodriguez",
    title: "VP of Marketing",
    company: "GrowthLabs Inc",
    image: "/images/testimonials/lisa-hernadez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-02-28",
    service: ServiceType.SEO_SERVICES,
    featured: true,
    metrics: "40% improvement in Core Web Vitals"
  },
  {
    id: "seo-3",
    quote: "The ROI from their SEO work has been incredible. We've generated over $850K in new business that can be directly attributed to improved organic search visibility.",
    author: "Robert Chen",
    title: "CEO",
    company: "Manufacturing Solutions Co",
    image: "/images/testimonials/robert-holden.png",
    rating: TestimonialRating.FIVE,
    date: "2024-01-20",
    service: ServiceType.SEO_SERVICES,
    featured: true,
    metrics: "$850K in new business from organic search"
  },
  {
    id: "seo-4",
    quote: "TBH Digital's local SEO strategy helped us dominate our market. We're now ranking #1 for all our target local keywords and our phone calls from Google increased by 200%.",
    author: "Maria Gonzalez",
    title: "Marketing Manager",
    company: "Local Business Solutions",
    image: "/images/testimonials/maria-gonzalez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-04-12",
    service: ServiceType.SEO_SERVICES,
    featured: false,
    metrics: "#1 local rankings, 200% increase in Google calls"
  },
  {
    id: "seo-5",
    quote: "Their content strategy and on-page optimization transformed our blog into a lead generation machine. Organic conversions are up 180% and we're attracting much higher-quality prospects.",
    author: "Jennifer Walsh",
    title: "Content Marketing Director",
    company: "B2B Growth Agency",
    image: "/images/testimonials/jennifer-walsh.png",
    rating: TestimonialRating.FIVE,
    date: "2024-05-08",
    service: ServiceType.SEO_SERVICES,
    featured: false,
    metrics: "180% increase in organic conversions"
  }
];

/**
 * SEO Services testimonials section configuration
 * Ready for direct integration with Testimonials component
 */
export const seoServicesTestimonialsSection: SEOServicesTestimonialsSection = {
  title: "SEO Services Results",
  subtitle: "Proven strategies that drive organic growth and visibility.",
  data: seoServicesTestimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: false,
  featuredOnly: false
};

export default seoServicesTestimonials;