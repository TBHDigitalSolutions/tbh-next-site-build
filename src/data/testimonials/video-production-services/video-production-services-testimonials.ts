// ============================================================================
// FILE: src/data/testimonials/video-production-services/video-production-services-testimonials.ts
// Video Production Services Testimonials - Production Ready (CORRECTED FOR CANONICAL NAMING)
// ============================================================================

import type {
  Testimonial,
  VideoProductionTestimonialsSection,
  ServiceType,
  TestimonialRating
} from "../types";

/**
 * Video Production Services testimonials data
 * Follows canonical field structure for consistent component integration
 */
const videoProductionServicesTestimonials: Testimonial[] = [
  {
    id: "video-prod-1",
    quote: "Our launch video hit 250K views in a week and lifted CTRs across every paid channel.",
    author: "Mina Patel",
    title: "Brand Manager",
    company: "Aurora Labs",
    image: "/media/testimonials/mina-patel.jpg",
    rating: TestimonialRating.FIVE,
    date: "2025-04-08",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: true,
    metrics: "250K views in one week, improved CTRs"
  },
  {
    id: "video-prod-2",
    quote: "They turned complex messaging into a tight 60-second story. Demos increased 42% MoM.",
    author: "Liam Chen",
    title: "Growth Lead",
    company: "Evergreen Health",
    image: "/media/testimonials/liam-chen.jpg",
    rating: TestimonialRating.FIVE,
    date: "2025-01-19",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: true,
    metrics: "42% increase in demos MoM"
  },
  {
    id: "video-prod-3",
    quote: "TBH Digital Solutions created a brand video that perfectly captured our company culture and values. The video has been instrumental in our recruitment efforts, increasing qualified applications by 40%.",
    author: "Jennifer Walsh",
    title: "VP of Marketing",
    company: "TechCorp Industries",
    image: "/pages/services-page/video-production/testimonials/jennifer-walsh.png",
    rating: TestimonialRating.FIVE,
    date: "2024-03-15",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: false,
    metrics: "40% increase in qualified applications"
  },
  {
    id: "video-prod-4",
    quote: "The product demo video they created for our app launch was a game-changer. It generated 50% of our pre-launch signups and helped us secure $500K in pre-orders.",
    author: "Marcus Rodriguez",
    title: "CEO & Founder",
    company: "InnovateApp",
    image: "/pages/services-page/video-production/testimonials/marcus-rodriguez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-02-28",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: true,
    metrics: "50% of pre-launch signups, $500K in pre-orders"
  },
  {
    id: "video-prod-5",
    quote: "Working with their team was seamless from start to finish. The customer testimonial video became our top-performing marketing asset, increasing conversion rates by 35%.",
    author: "Sarah McKelvey",
    title: "Head of Marketing",
    company: "GrowthLabs",
    image: "/pages/services-page/video-production/testimonials/sarah-mckelvey.png",
    rating: TestimonialRating.FIVE,
    date: "2024-01-20",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: false,
    metrics: "35% increase in conversion rates"
  },
  {
    id: "video-prod-6",
    quote: "Our healthcare platform is complex, but TBH Digital made it simple and engaging. The animated explainer video reduced customer support tickets by 40% and increased demo requests by 85%.",
    author: "David Chen",
    title: "Product Marketing Manager",
    company: "HealthPlus",
    image: "/images/testimonials/david-chen.png",
    rating: TestimonialRating.FIVE,
    date: "2024-04-10",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: true,
    metrics: "40% reduction in support tickets, 85% increase in demo requests"
  },
  {
    id: "video-prod-7",
    quote: "The event coverage and highlight reel captured the energy and insights of our conference perfectly. The video drove a 300% increase in social engagement and helped secure 60% more early bird registrations.",
    author: "Maria Gonzalez",
    title: "Event Director",
    company: "TechSummit Conference",
    image: "/images/testimonials/maria-gonzalez.png",
    rating: TestimonialRating.FIVE,
    date: "2024-05-22",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: false,
    metrics: "300% increase in social engagement, 60% more registrations"
  },
  {
    id: "video-prod-8",
    quote: "The training video series transformed our educational program. Course completion rates improved by 70%, and student satisfaction scores increased by 45%.",
    author: "Robert Kim",
    title: "Learning & Development Director",
    company: "Retail Masters Academy",
    image: "/images/testimonials/robert-kim.png",
    rating: TestimonialRating.FIVE,
    date: "2024-06-08",
    service: ServiceType.VIDEO_PRODUCTION_SERVICES,
    featured: false,
    metrics: "70% increase in course completion, 45% increase in satisfaction"
  }
];

/**
 * Video Production Services testimonials section configuration
 * Ready for direct integration with Testimonials component
 */
export const videoProductionServicesTestimonialsSection: VideoProductionTestimonialsSection = {
  title: "Video Production Services Results",
  subtitle: "Compelling visuals that drive awareness and action.",
  data: videoProductionServicesTestimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: false,
  featuredOnly: false
};

export default videoProductionServicesTestimonials;