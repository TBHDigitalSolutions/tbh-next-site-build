// src/components/ui/organisms/Testimonials/adapters.ts

import type { 
  Testimonial, 
  TestimonialInput, 
  TestimonialsSection,
  TestimonialsProps,
  WebDevTestimonialsSection,
  VideoTestimonialsSection,
  LeadGenTestimonialsSection,
  MarketingAutomationTestimonialsSection,
  SEOServicesTestimonialsSection,
  ContentProductionTestimonialsSection
} from "./Testimonials.types";

/**
 * Data adapters for Testimonials component
 * Following Service Page Type Contracts patterns
 */

// ============================================================================
// Core Transformation Functions
// ============================================================================

/**
 * Normalizes testimonial input into consistent Testimonial[] format
 */
export const normalizeTestimonialInput = (input: TestimonialInput): Testimonial[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  
  // Handle object formats
  if (typeof input === 'object') {
    if ('items' in input && Array.isArray(input.items)) return input.items.filter(Boolean);
    if ('testimonials' in input && Array.isArray(input.testimonials)) return input.testimonials.filter(Boolean);
  }
  
  return [];
};

/**
 * Creates a safe testimonial with canonical field mapping
 */
export const createTestimonial = (
  data: Partial<Testimonial> & {
    // Legacy alias support
    testimonialText?: string;
    clientName?: string;
    jobTitle?: string;
    avatarImage?: string;
    reviewText?: string;
    customerName?: string;
  },
  index: number = 0
): Testimonial => {
  // Canonical field mapping with alias support
  const quote = data.quote || 
               data.testimonial || 
               data.testimonialText ||
               data.reviewText || 
               'No testimonial provided';
               
  const author = data.author || 
                data.name || 
                data.clientName ||
                data.customerName || 
                `Client ${index + 1}`;
                
  const title = data.title || 
               data.role || 
               data.jobTitle;
               
  const image = data.image || 
               data.avatarUrl || 
               data.avatarImage || 
               '/images/default-avatar.jpg';
               
  const id = data.id || `testimonial-${index}`;
  
  return {
    id,
    quote,
    author,
    title,
    company: data.company,
    image,
    rating: data.rating,
    date: data.date,
    service: data.service,
    project: data.project,
    featured: data.featured
  };
};

/**
 * Creates testimonials section props for page.tsx usage
 */
export const createTestimonialsPageProps = (
  data: TestimonialInput,
  options: Partial<TestimonialsProps> = {}
): TestimonialsProps => {
  const testimonials = normalizeTestimonialInput(data);
  
  return {
    data: testimonials,
    count: 3,
    intervalMs: 6000,
    variant: "default",
    layout: "grid",
    enableFiltering: testimonials.some(t => t.service),
    featuredOnly: false,
    ...options
  };
};

// ============================================================================
// Service-Specific Adapters
// ============================================================================

/**
 * Web Development testimonials adapter
 */
export const createWebDevTestimonialsSection = (
  testimonials: TestimonialInput,
  overrides: Partial<WebDevTestimonialsSection> = {}
): WebDevTestimonialsSection => ({
  title: "Web Development Results",
  subtitle: "Fast, accessible, and easy-to-update sites that convert",
  data: testimonials,
  count: 3,
  intervalMs: 6000,
  variant: "cards",
  layout: "grid",
  enableFiltering: false,
  featuredOnly: false,
  ...overrides
});

/**
 * Video Production testimonials adapter
 */
export const createVideoTestimonialsSection = (
  testimonials: TestimonialInput,
  overrides: Partial<VideoTestimonialsSection> = {}
): VideoTestimonialsSection => ({
  title: "Video Production Results",
  subtitle: "Compelling visuals that drive awareness and action",
  data: testimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: true,
  featuredOnly: false,
  ...overrides
});

/**
 * Lead Generation testimonials adapter
 */
export const createLeadGenTestimonialsSection = (
  testimonials: TestimonialInput,
  overrides: Partial<LeadGenTestimonialsSection> = {}
): LeadGenTestimonialsSection => ({
  title: "Lead Generation Results",
  subtitle: "Higher-quality pipeline with lower acquisition cost",
  data: testimonials,
  count: 3,
  intervalMs: 6000,
  variant: "cards",
  layout: "grid",
  enableFiltering: false,
  featuredOnly: true,
  ...overrides
});

/**
 * Marketing Automation testimonials adapter
 */
export const createMarketingAutomationTestimonialsSection = (
  testimonials: TestimonialInput,
  overrides: Partial<MarketingAutomationTestimonialsSection> = {}
): MarketingAutomationTestimonialsSection => ({
  title: "Marketing Automation Results",
  subtitle: "Streamlined processes that scale your growth",
  data: testimonials,
  count: 4,
  intervalMs: 5000,
  variant: "minimal",
  layout: "carousel",
  enableFiltering: true,
  featuredOnly: false,
  ...overrides
});

/**
 * SEO Services testimonials adapter
 */
export const createSEOServicesTestimonialsSection = (
  testimonials: TestimonialInput,
  overrides: Partial<SEOServicesTestimonialsSection> = {}
): SEOServicesTestimonialsSection => ({
  title: "SEO Services Results",
  subtitle: "Improved rankings and organic traffic growth",
  data: testimonials,
  count: 3,
  intervalMs: 7000,
  variant: "cards",
  layout: "grid",
  enableFiltering: false,
  featuredOnly: true,
  ...overrides
});

/**
 * Content Production testimonials adapter
 */
export const createContentProductionTestimonialsSection = (
  testimonials: TestimonialInput,
  overrides: Partial<ContentProductionTestimonialsSection> = {}
): ContentProductionTestimonialsSection => ({
  title: "Content Production Results",
  subtitle: "Content that engages and converts your audience",
  data: testimonials,
  count: 3,
  intervalMs: 6000,
  variant: "default",
  layout: "slider",
  enableFiltering: true,
  featuredOnly: false,
  ...overrides
});

// ============================================================================
// CMS/External Data Adapters
// ============================================================================

/**
 * Strapi CMS testimonials adapter
 */
export const strapiTestimonialsAdapter = (
  strapiData: Array<{
    id: number;
    attributes: {
      quote: string;
      author: string;
      title?: string;
      company?: string;
      image?: { data?: { attributes?: { url: string } } };
      rating?: number;
      featured?: boolean;
      published: boolean;
      service?: string;
      publishedAt?: string;
    };
  }>
): Testimonial[] => {
  return strapiData
    .filter(item => item.attributes.published)
    .map(item => ({
      id: `strapi-${item.id}`,
      quote: item.attributes.quote,
      author: item.attributes.author,
      title: item.attributes.title,
      company: item.attributes.company,
      image: item.attributes.image?.data?.attributes?.url,
      rating: item.attributes.rating,
      featured: item.attributes.featured,
      service: item.attributes.service,
      date: item.attributes.publishedAt
    }));
};

/**
 * Contentful CMS testimonials adapter
 */
export const contentfulTestimonialsAdapter = (
  contentfulData: Array<{
    sys: { id: string; createdAt: string };
    fields: {
      quote: string;
      author: string;
      title?: string;
      company?: string;
      image?: { fields?: { file?: { url: string } } };
      rating?: number;
      featured?: boolean;
      service?: string;
    };
  }>
): Testimonial[] => {
  return contentfulData.map(item => ({
    id: `contentful-${item.sys.id}`,
    quote: item.fields.quote,
    author: item.fields.author,
    title: item.fields.title,
    company: item.fields.company,
    image: item.fields.image?.fields?.file?.url ? 
           `https:${item.fields.image.fields.file.url}` : undefined,
    rating: item.fields.rating,
    featured: item.fields.featured,
    service: item.fields.service,
    date: item.sys.createdAt
  }));
};

/**
 * Google Reviews API adapter
 */
export const googleReviewsAdapter = (
  reviewsData: Array<{
    author_name: string;
    text: string;
    rating: number;
    time: number;
    profile_photo_url?: string;
  }>
): Testimonial[] => {
  return reviewsData
    .filter(review => review.rating >= 4) // Only include 4+ star reviews
    .map((review, index) => ({
      id: `google-${index}`,
      quote: review.text.length > 200 ? 
             `${review.text.substring(0, 197)}...` : 
             review.text,
      author: review.author_name,
      rating: review.rating,
      image: review.profile_photo_url,
      date: new Date(review.time * 1000).toISOString(),
      service: "Google Reviews",
      featured: review.rating === 5
    }));
};

/**
 * Trustpilot API adapter
 */
export const trustpilotAdapter = (
  trustpilotData: Array<{
    id: string;
    content: string;
    stars: number;
    createdAt: string;
    consumer: {
      displayName: string;
    };
    companyReply?: {
      message: string;
    };
  }>
): Testimonial[] => {
  return trustpilotData
    .filter(review => review.stars >= 4)
    .map(review => ({
      id: `trustpilot-${review.id}`,
      quote: review.content.length > 180 ?
             `${review.content.substring(0, 177)}...` :
             review.content,
      author: review.consumer.displayName,
      rating: review.stars,
      date: review.createdAt,
      service: "Trustpilot",
      featured: review.stars === 5
    }));
};

// ============================================================================
// Legacy Data Migration Adapters
// ============================================================================

/**
 * Migrates old testimonial data format to new structure
 */
export const legacyTestimonialMigrationAdapter = (
  legacyData: Array<{
    id?: string;
    text?: string;           // Legacy: quote
    content?: string;        // Legacy: quote alternative
    clientName?: string;     // Legacy: author
    customerName?: string;   // Legacy: author alternative
    position?: string;       // Legacy: title
    jobTitle?: string;       // Legacy: title alternative
    companyName?: string;    // Legacy: company
    photo?: string;          // Legacy: image
    avatar?: string;         // Legacy: image alternative
    stars?: number;          // Legacy: rating
    score?: number;          // Legacy: rating alternative
    timestamp?: string;      // Legacy: date
  }>
): Testimonial[] => {
  return legacyData.map((item, index) => ({
    id: item.id || `migrated-${index}`,
    quote: item.text || item.content || 'Migrated testimonial',
    author: item.clientName || item.customerName || 'Migrated Client',
    title: item.position || item.jobTitle,
    company: item.companyName,
    image: item.photo || item.avatar,
    rating: item.stars || item.score,
    date: item.timestamp
  }));
};

/**
 * WordPress testimonial plugin adapter
 */
export const wordPressTestimonialAdapter = (
  wpData: Array<{
    id: number;
    title: { rendered: string };
    content: { rendered: string };
    acf?: {
      client_name?: string;
      client_position?: string;
      client_company?: string;
      client_image?: string;
      rating?: number;
      featured?: boolean;
      service_type?: string;
    };
    date: string;
  }>
): Testimonial[] => {
  return wpData.map(item => ({
    id: `wp-${item.id}`,
    quote: item.content.rendered.replace(/<[^>]*>/g, '').trim(), // Strip HTML
    author: item.acf?.client_name || item.title.rendered,
    title: item.acf?.client_position,
    company: item.acf?.client_company,
    image: item.acf?.client_image,
    rating: item.acf?.rating,
    featured: item.acf?.featured,
    service: item.acf?.service_type,
    date: item.date
  }));
};

// ============================================================================
// Page Component Integration Helpers
// ============================================================================

/**
 * Creates complete testimonials section for page.tsx
 */
export const createTestimonialsPageSection = <T extends TestimonialsSection>(
  serviceName: string,
  testimonialData: TestimonialInput,
  adapter: (data: TestimonialInput, overrides?: Partial<T>) => T,
  customOptions: Partial<T> = {}
) => {
  const section = adapter(testimonialData, customOptions);
  
  return {
    id: `${serviceName}-testimonials`,
    title: section.title,
    subtitle: section.subtitle,
    component: 'Testimonials' as const,
    props: {
      data: section.data,
      title: section.title,
      subtitle: section.subtitle,
      count: section.count,
      intervalMs: section.intervalMs,
      variant: section.variant,
      layout: section.layout,
      enableFiltering: section.enableFiltering,
      featuredOnly: section.featuredOnly
    } as TestimonialsProps
  };
};

/**
 * Batch create testimonials sections for multiple services
 */
export const createServiceTestimonialsSections = (
  services: Array<{
    name: string;
    data: TestimonialInput;
    adapter: (data: TestimonialInput, overrides?: any) => TestimonialsSection;
    options?: Partial<TestimonialsSection>;
  }>
) => {
  return services.map(service => 
    createTestimonialsPageSection(
      service.name,
      service.data,
      service.adapter,
      service.options
    )
  );
};

// ============================================================================
// Service Adapter Mapping
// ============================================================================

/**
 * Service adapter mapping for easy access
 */
const serviceTestimonialAdapters = {
  'web-development': createWebDevTestimonialsSection,
  'video-production': createVideoTestimonialsSection,
  'lead-generation': createLeadGenTestimonialsSection,
  'marketing-automation': createMarketingAutomationTestimonialsSection,
  'seo-services': createSEOServicesTestimonialsSection,
  'content-production': createContentProductionTestimonialsSection
} as const;

/**
 * Creates testimonials section for any service using predefined adapters
 */
export const createServicePageTestimonials = (
  serviceName: keyof typeof serviceTestimonialAdapters,
  testimonialData: TestimonialInput,
  customOptions: Partial<TestimonialsSection> = {}
) => {
  const adapter = serviceTestimonialAdapters[serviceName];
  return adapter(testimonialData, customOptions);
};

/**
 * Universal testimonials section creator
 */
export const createUniversalTestimonialsSection = (
  serviceName: string,
  testimonialData: TestimonialInput,
  options: Partial<TestimonialsSection> = {}
): TestimonialsSection => ({
  title: `${serviceName} Results`,
  subtitle: `See what our ${serviceName.toLowerCase()} clients have to say`,
  data: testimonialData,
  count: 3,
  intervalMs: 6000,
  variant: "cards",
  layout: "grid",
  enableFiltering: false,
  featuredOnly: false,
  ...options
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Filters testimonials by service type
 */
export const filterTestimonialsByService = (
  testimonials: Testimonial[],
  service: string
): Testimonial[] => {
  return testimonials.filter(t => 
    t.service?.toLowerCase().includes(service.toLowerCase()) ||
    t.project?.toLowerCase().includes(service.toLowerCase())
  );
};

/**
 * Gets featured testimonials only
 */
export const getFeaturedTestimonials = (
  testimonials: Testimonial[]
): Testimonial[] => {
  const featured = testimonials.filter(t => t.featured);
  // If no testimonials are marked as featured, return highest rated ones
  if (featured.length === 0) {
    return testimonials
      .filter(t => t.rating && t.rating >= 5)
      .slice(0, 3);
  }
  return featured;
};

/**
 * Sorts testimonials by rating and date
 */
export const sortTestimonials = (
  testimonials: Testimonial[],
  sortBy: 'rating' | 'date' | 'featured' = 'rating'
): Testimonial[] => {
  return testimonials.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'date':
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'featured':
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
};