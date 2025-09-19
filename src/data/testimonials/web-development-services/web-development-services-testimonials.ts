// ============================================================================
// FILE: src/data/testimonials/web-development-services/web-development-services-testimonials.ts
// Web Development Services Testimonials - Production Ready (CORRECTED FOR CANONICAL NAMING)
// ============================================================================

import type {
  Testimonial,
  WebDevelopmentTestimonialsSection,
  ServiceType,
  TestimonialRating
} from "../types";

/**
 * Web Development Services testimonials data
 * Follows canonical field structure for consistent component integration
 */
const webDevelopmentServicesTestimonials: Testimonial[] = [
  {
    id: "web-dev-1",
    quote: "The new site cut page load times in half and doubled inbound demo requests in the first 45 days.",
    author: "Ava Thompson",
    title: "Director of Digital",
    company: "NorthStar Systems",
    image: "/media/testimonials/ava-thompson.jpg",
    rating: TestimonialRating.FIVE,
    date: "2025-03-12",
    service: ServiceType.WEB_DEVELOPMENT_SERVICES,
    featured: true,
    metrics: "50% faster load times, 2x demo requests"
  },
  {
    id: "web-dev-2",
    quote: "Their component architecture made our content rollouts effortless—no more brittle templates.",
    author: "Hector Ramirez",
    title: "Head of Marketing",
    company: "Cobalt Works",
    image: "/media/testimonials/hector-ramirez.jpg",
    rating: TestimonialRating.FIVE,
    date: "2025-02-02",
    service: ServiceType.WEB_DEVELOPMENT_SERVICES,
    featured: true,
    metrics: "Effortless content updates"
  },
  {
    id: "web-dev-3",
    quote: "They rebuilt our site on Next.js and the improvement was immediate—Core Web Vitals in the 90s and a double-digit lift in organic traffic.",
    author: "Sarah McKelvey",
    title: "VP of Marketing",
    company: "GrowthLabs",
    image: "/images/testimonials/sarah-mckelvey.png",
    rating: TestimonialRating.FIVE,
    date: "2025-03-02",
    service: ServiceType.WEB_DEVELOPMENT_SERVICES,
    featured: false,
    metrics: "90s Core Web Vitals, double-digit traffic growth"
  },
  {
    id: "web-dev-4",
    quote: "The team delivered a complex marketplace on time and under budget. Checkout friction dropped and conversions rose 45% within the first quarter.",
    author: "David Park",
    title: "Director of Ecommerce",
    company: "Retail Innovations Group",
    image: "/images/testimonials/david-park.png",
    rating: TestimonialRating.FIVE,
    date: "2025-04-18",
    service: ServiceType.WEB_DEVELOPMENT_SERVICES,
    featured: true,
    metrics: "45% conversion increase, reduced checkout friction"
  },
  {
    id: "web-dev-5",
    quote: "Our SaaS dashboard feels snappy and reliable. Their guidance on analytics and error monitoring has been invaluable for our roadmap.",
    author: "Emma Thompson",
    title: "Product Lead",
    company: "Insightlytics",
    image: "/images/testimonials/emma-thompson.png",
    rating: TestimonialRating.FIVE,
    date: "2025-05-07",
    service: ServiceType.WEB_DEVELOPMENT_SERVICES,
    featured: false,
    metrics: "Improved dashboard performance and reliability"
  },
  {
    id: "web-dev-6",
    quote: "We finally have a maintainable design system and a CMS our team actually enjoys using. Support after launch has been proactive and fast.",
    author: "Marcus Rodriguez",
    title: "Head of Digital",
    company: "InnovateApp",
    image: "/images/testimonials/marcus-rodriguez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-11-29",
    service: ServiceType.WEB_DEVELOPMENT_SERVICES,
    featured: false,
    metrics: "Maintainable design system, improved CMS experience"
  }
];

/**
 * Web Development Services testimonials section configuration
 * Ready for direct integration with Testimonials component
 */
export const webDevelopmentServicesTestimonialsSection: WebDevelopmentTestimonialsSection = {
  title: "Web Development Services Results",
  subtitle: "Fast, accessible, and easy-to-update sites that convert.",
  data: webDevelopmentServicesTestimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: false,
  featuredOnly: false
};

export default webDevelopmentServicesTestimonials;