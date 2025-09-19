// src/lib/schemas/servicesPage.zod.ts
import { z } from "zod";

/**
 * Base schemas for reusable components
 */
export const CTA = z.object({
  label: z.string().min(1, "CTA label is required"),
  href: z.string().url("CTA href must be a valid URL"),
  variant: z.enum(["primary", "secondary", "outline"]).optional(),
  target: z.enum(["_self", "_blank"]).optional(),
  rel: z.string().optional(),
});

export const MediaObject = z.object({
  src: z.string().url("Media src must be a valid URL"),
  alt: z.string().optional(),
  type: z.enum(["image", "video"]).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  caption: z.string().optional(),
});

export const Hero = z.object({
  title: z.string().min(1, "Hero title is required").max(100, "Hero title too long"),
  subtitle: z.string().max(200, "Hero subtitle too long").optional(),
  description: z.string().max(500, "Hero description too long").optional(),
  media: MediaObject.optional(),
  primaryCta: CTA.optional(),
  secondaryCta: CTA.optional(),
  backgroundType: z.enum(["solid", "gradient", "image"]).optional(),
  backgroundColor: z.string().optional(),
});

export const CapabilityBullet = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Bullet label is required"),
  href: z.string().url().optional(),
  description: z.string().optional(),
});

export const CapabilityPillar = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Pillar title is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
});

export const Capabilities = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(CapabilityBullet).optional(),
  pillars: z.array(CapabilityPillar).optional(),
  chips: z.array(z.string()).optional(),
  ctas: z.object({
    primary: CTA.optional(),
    secondary: CTA.optional(),
  }).optional(),
}).refine(
  (data) => data.bullets || data.pillars,
  { message: "Capabilities must have either bullets or pillars" }
);

export const TwoColumnVideo = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  videoId: z.string().optional(),
  provider: z.enum(["youtube", "vimeo", "local"]).optional(),
  thumbnail: MediaObject.optional(),
  layout: z.enum(["video-left", "video-right"]).optional(),
});

export const PricingTier = z.object({
  id: z.string(),
  name: z.string().min(1, "Pricing tier name is required"),
  description: z.string().optional(),
  badge: z.string().optional(),
  price: z.object({
    setup: z.number().nonnegative().optional(),
    monthly: z.number().nonnegative().optional(),
    yearly: z.number().nonnegative().optional(),
    originalPrice: z.number().nonnegative().optional(),
    currency: z.string().default("USD"),
  }).optional(),
  features: z.array(z.string()).optional(),
  highlighted: z.boolean().optional(),
  popular: z.boolean().optional(),
  cta: CTA.optional(),
});

export const PricingData = z.object({
  tiers: z.array(PricingTier).length(3, "Pricing must have exactly 3 tiers"),
  comparison: z.object({
    title: z.string().optional(),
    headers: z.array(z.string()).optional(),
    rows: z.array(z.object({
      feature: z.string(),
      values: z.array(z.union([z.string(), z.boolean()])),
    })).optional(),
  }).optional(),
  notes: z.object({
    disclaimer: z.string().optional(),
    contact: z.string().optional(),
    contactHref: z.string().url().optional(),
  }).optional(),
});

export const PricingCallout = z.object({
  variant: z.enum(["included", "addon", "custom"]),
  label: z.string().optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  note: z.string().optional(),
  cta: CTA.optional(),
});

export const ScopeData = z.object({
  title: z.string().optional(),
  includes: z.array(z.string().min(1)).min(1, "At least one scope item is required"),
  deliverables: z.array(z.string().min(1)).min(1, "At least one deliverable is required"),
  addons: z.array(z.string().min(1)).optional(),
});

export const WorkflowData = z.object({
  variant: z.enum(["timeline", "flow", "diagram"]).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    duration: z.string().optional(),
    deliverables: z.array(z.string()).optional(),
  })).optional(),
});

export const PortfolioItem = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  image: MediaObject.optional(),
  href: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const TestimonialData = z.object({
  id: z.string().optional(),
  content: z.string().min(1, "Testimonial content is required"),
  author: z.object({
    name: z.string().min(1, "Author name is required"),
    title: z.string().optional(),
    company: z.string().optional(),
    avatar: MediaObject.optional(),
  }),
  rating: z.number().min(1).max(5).optional(),
  featured: z.boolean().optional(),
});

export const FAQ = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "FAQ question is required"),
  answer: z.string().min(1, "FAQ answer is required"),
  category: z.string().optional(),
});

/**
 * Level-specific schemas
 */

/** L1 Hub — no pricing, exactly 3 portfolio items */
export const HubDataSchema = z.object({
  kind: z.literal("hub"),
  hero: Hero,
  capabilities: Capabilities.optional(),
  twoColVideo: TwoColumnVideo.optional(),
  pricing: z.undefined(),
  portfolio: z.array(PortfolioItem).length(3, "Hub must have exactly 3 portfolio items"),
  testimonials: z.object({
    data: z.array(TestimonialData).optional(),
    count: z.number().optional(),
    intervalMs: z.number().optional(),
  }).optional(),
  faqs: z.array(FAQ).optional(),
  cta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    primaryCta: CTA.optional(),
    secondaryCta: CTA.optional(),
  }).optional(),
  serviceCards: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      href: z.string().url(),
    })).optional(),
  }).optional(),
}).strict();

/** L2 Service — pricing optional (leaf) with exactly 3 tiers if present, portfolio exactly 3 */
export const ServiceDataSchema = z.object({
  kind: z.literal("service"),
  hero: Hero,
  capabilities: Capabilities.optional(),
  twoColVideo: TwoColumnVideo.optional(),
  pricing: PricingData.optional(),
  portfolio: z.array(PortfolioItem).length(3, "Service must have exactly 3 portfolio items"),
  testimonials: z.object({
    data: z.array(TestimonialData).optional(),
    count: z.number().optional(),
    intervalMs: z.number().optional(),
  }).optional(),
  faqs: z.array(FAQ).optional(),
  cta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    primaryCta: CTA.optional(),
    secondaryCta: CTA.optional(),
  }).optional(),
  serviceCards: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      href: z.string().url(),
    })).optional(),
  }).optional(),
}).strict();

/** L2B Sub-Hub — directory. No full pricing here */
export const SubHubDataSchema = z.object({
  kind: z.literal("subhub"),
  hero: Hero,
  capabilities: Capabilities.optional(),
  twoColVideo: TwoColumnVideo.optional(),
  portfolio: z.array(PortfolioItem).max(3, "Sub-hub can have at most 3 portfolio items").optional(),
  testimonials: z.object({
    data: z.array(TestimonialData).optional(),
    count: z.number().optional(),
    intervalMs: z.number().optional(),
  }).optional(),
  faqs: z.array(FAQ).optional(),
  cta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    primaryCta: CTA.optional(),
    secondaryCta: CTA.optional(),
  }).optional(),
  serviceCards: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      title: z.string(),
      description: z.string().optional(),
      href: z.string().url(),
    })).optional(),
  }).optional(),
}).strict();

/** L3 Sub-Service — callout only, portfolio ≤ 2 */
export const SubServiceDataSchema = z.object({
  kind: z.literal("subservice"),
  hero: Hero,
  capabilities: Capabilities.optional(),
  twoColVideo: TwoColumnVideo.optional(),
  workflow: WorkflowData.optional(),
  scope: ScopeData.optional(),
  pricingCallout: PricingCallout.optional(),
  portfolio: z.array(PortfolioItem).max(2, "Sub-service can have at most 2 portfolio items").optional(),
  testimonials: z.object({
    data: z.array(TestimonialData).optional(),
    count: z.number().optional(),
    intervalMs: z.number().optional(),
  }).optional(),
  faqs: z.array(FAQ).optional(),
  cta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    primaryCta: CTA.optional(),
    secondaryCta: CTA.optional(),
  }).optional(),
}).strict();

/**
 * Universal service page schema (discriminated union)
 */
export const ServicePageDataSchema = z.discriminatedUnion("kind", [
  HubDataSchema,
  ServiceDataSchema,
  SubHubDataSchema,
  SubServiceDataSchema,
]);

/**
 * Type exports
 */
export type CTAType = z.infer<typeof CTA>;
export type MediaObjectType = z.infer<typeof MediaObject>;
export type HeroType = z.infer<typeof Hero>;
export type CapabilitiesType = z.infer<typeof Capabilities>;
export type PricingDataType = z.infer<typeof PricingData>;
export type PricingCalloutType = z.infer<typeof PricingCallout>;
export type ScopeDataType = z.infer<typeof ScopeData>;
export type WorkflowDataType = z.infer<typeof WorkflowData>;
export type PortfolioItemType = z.infer<typeof PortfolioItem>;
export type TestimonialDataType = z.infer<typeof TestimonialData>;
export type FAQType = z.infer<typeof FAQ>;

export type HubDataType = z.infer<typeof HubDataSchema>;
export type ServiceDataType = z.infer<typeof ServiceDataSchema>;
export type SubHubDataType = z.infer<typeof SubHubDataSchema>;
export type SubServiceDataType = z.infer<typeof SubServiceDataSchema>;
export type ServicePageDataType = z.infer<typeof ServicePageDataSchema>;

/**
 * Validation utilities
 */
export function validateServicePageData(data: unknown): {
  isValid: boolean;
  data?: ServicePageDataType;
  errors: string[];
  warnings: string[];
} {
  try {
    const validatedData = ServicePageDataSchema.parse(data);
    const warnings: string[] = [];

    // Additional business logic validations
    if (validatedData.kind === "service" && !validatedData.pricing) {
      warnings.push("Service page has no pricing data - consider adding pricing tiers");
    }

    if (validatedData.kind === "subservice" && !validatedData.scope) {
      warnings.push("Sub-service page has no scope data - consider adding scope definition");
    }

    if (!validatedData.hero.primaryCta) {
      warnings.push("Page has no primary CTA - consider adding a main action button");
    }

    return {
      isValid: true,
      data: validatedData,
      errors: [],
      warnings,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      return {
        isValid: false,
        errors,
        warnings: [],
      };
    }

    return {
      isValid: false,
      errors: ['Unknown validation error occurred'],
      warnings: [],
    };
  }
}

/**
 * Type guards for runtime checking
 */
export function isHubData(data: ServicePageDataType): data is HubDataType {
  return data.kind === "hub";
}

export function isServiceData(data: ServicePageDataType): data is ServiceDataType {
  return data.kind === "service";
}

export function isSubHubData(data: ServicePageDataType): data is SubHubDataType {
  return data.kind === "subhub";
}

export function isSubServiceData(data: ServicePageDataType): data is SubServiceDataType {
  return data.kind === "subservice";
}

/**
 * Safe parsers that return null on failure
 */
export function safeParseHubData(data: unknown): HubDataType | null {
  try {
    return HubDataSchema.parse(data);
  } catch {
    return null;
  }
}

export function safeParseServiceData(data: unknown): ServiceDataType | null {
  try {
    return ServiceDataSchema.parse(data);
  } catch {
    return null;
  }
}

export function safeParseSubHubData(data: unknown): SubHubDataType | null {
  try {
    return SubHubDataSchema.parse(data);
  } catch {
    return null;
  }
}

export function safeParseSubServiceData(data: unknown): SubServiceDataType | null {
  try {
    return SubServiceDataSchema.parse(data);
  } catch {
    return null;
  }
}

export function safeParseServicePageData(data: unknown): ServicePageDataType | null {
  try {
    return ServicePageDataSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Validation helpers for development
 */
export function devValidateServicePageData(
  data: unknown,
  context: string = "unknown"
): void {
  if (process.env.NODE_ENV !== "development") return;

  const result = validateServicePageData(data);

  if (!result.isValid) {
    console.group(`🚨 Service Page Schema Validation Errors in ${context}`);
    result.errors.forEach(error => console.error("❌", error));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group(`⚠️ Service Page Schema Warnings in ${context}`);
    result.warnings.forEach(warning => console.warn("⚠️", warning));
    console.groupEnd();
  }
}

/**
 * Schema refinement utilities
 */
export function refineServicePageData(data: ServicePageDataType): ServicePageDataType {
  // Apply business logic refinements
  const refined = { ...data };

  // Ensure portfolio items have proper fallbacks
  if ('portfolio' in refined && Array.isArray(refined.portfolio)) {
    refined.portfolio = refined.portfolio.map(item => ({
      ...item,
      description: item.description || `Portfolio item: ${item.title}`,
    }));
  }

  // Ensure FAQs have IDs
  if ('faqs' in refined && Array.isArray(refined.faqs)) {
    refined.faqs = refined.faqs.map((faq, index) => ({
      ...faq,
      id: faq.id || `faq-${index}`,
    }));
  }

  // Ensure testimonials have proper structure
  if ('testimonials' in refined && refined.testimonials?.data) {
    refined.testimonials.data = refined.testimonials.data.map((testimonial, index) => ({
      ...testimonial,
      id: testimonial.id || `testimonial-${index}`,
    }));
  }

  return refined;
}

/**
 * Default data generators for fallback scenarios
 */
export function getDefaultHubData(title: string): HubDataType {
  return {
    kind: "hub",
    hero: {
      title,
      subtitle: "Explore our comprehensive service offerings",
    },
    portfolio: [
      { id: "portfolio-1", title: "Featured Work 1" },
      { id: "portfolio-2", title: "Featured Work 2" },
      { id: "portfolio-3", title: "Featured Work 3" },
    ],
  };
}

export function getDefaultServiceData(title: string): ServiceDataType {
  return {
    kind: "service",
    hero: {
      title,
      subtitle: "Professional service solutions tailored to your needs",
    },
    portfolio: [
      { id: "portfolio-1", title: "Service Example 1" },
      { id: "portfolio-2", title: "Service Example 2" },
      { id: "portfolio-3", title: "Service Example 3" },
    ],
  };
}

export function getDefaultSubServiceData(title: string): SubServiceDataType {
  return {
    kind: "subservice",
    hero: {
      title,
      subtitle: "Specialized service offering with detailed scope",
    },
  };
}

/**
 * Data transformation utilities
 */
export function transformLegacyServiceData(legacyData: any): ServicePageDataType | null {
  try {
    // Attempt to transform legacy data format to current schema
    const transformed: any = {
      kind: legacyData.type || "service",
      hero: {
        title: legacyData.title || legacyData.name || "Untitled Service",
        subtitle: legacyData.subtitle || legacyData.description,
        primaryCta: legacyData.cta ? {
          label: legacyData.cta.label || "Learn More",
          href: legacyData.cta.href || "/contact",
        } : undefined,
      },
    };

    // Transform other fields as needed
    if (legacyData.capabilities) {
      transformed.capabilities = legacyData.capabilities;
    }

    if (legacyData.portfolio) {
      transformed.portfolio = Array.isArray(legacyData.portfolio) 
        ? legacyData.portfolio.slice(0, 3)
        : [];
    }

    return ServicePageDataSchema.parse(transformed);
  } catch {
    return null;
  }
}