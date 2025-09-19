// src/lib/packages/mapFeaturedPackages.ts
import type { PackageCardProps } from "@/components/sections/section-layouts/PackageCarousel";
import type { ServiceSlug } from "@/components/sections/section-layouts/PackageCarousel/helpers";

/**
 * Shape that matches your existing featured data files structure
 */
export interface FeaturedPackageData {
  id: string;
  service: ServiceSlug;
  packageId?: string;
  name?: string;
  headline: string;
  summary?: string;
  tier?: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  href?: string;
  image?: { src: string; alt?: string } | null;
  price?: { setup?: number; monthly?: number } | null;
  ctaLabel?: string;
  highlights: string[];
  startingAt: number;
  badge?: string;
  savingsPct?: number;
  category?: string;
  featured?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Normalized output format for package cards
 */
export interface NormalizedPackageCard extends Omit<PackageCardProps, "className"> {
  originalData?: FeaturedPackageData;
}

/**
 * Validation result for featured package data
 */
export interface PackageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: FeaturedPackageData;
}

/**
 * Mapping configuration for different services
 */
export interface ServiceMappingConfig {
  serviceSlug: ServiceSlug;
  baseUrl: string;
  defaultTier: "Essential" | "Professional" | "Enterprise";
  defaultCtaLabel: string;
  maxItems: number;
  enableSorting: boolean;
  sortBy?: "popular" | "startingAt" | "tier" | "name";
}

/**
 * Type guard to check if data matches FeaturedPackageData structure
 */
export function isFeaturedPackageData(data: any): data is FeaturedPackageData {
  return (
    data &&
    typeof data === "object" &&
    typeof data.id === "string" &&
    typeof data.service === "string" &&
    typeof data.headline === "string" &&
    Array.isArray(data.highlights) &&
    typeof data.startingAt === "number"
  );
}

/**
 * Validates and sanitizes featured package data
 */
export function validateFeaturedPackage(data: any): PackageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Package data must be an object");
    return { isValid: false, errors, warnings };
  }

  // Required fields validation
  if (!data.id || typeof data.id !== "string") {
    errors.push("Package must have a valid id");
  }

  if (!data.service || typeof data.service !== "string") {
    errors.push("Package must have a valid service slug");
  }

  if (!data.headline || typeof data.headline !== "string") {
    errors.push("Package must have a headline");
  }

  if (!Array.isArray(data.highlights)) {
    errors.push("Package must have highlights array");
  } else if (data.highlights.length === 0) {
    warnings.push("Package has no highlights");
  }

  if (typeof data.startingAt !== "number" || data.startingAt < 0) {
    errors.push("Package must have a valid startingAt price");
  }

  // Optional field validation
  if (data.tier && !["Essential", "Professional", "Enterprise"].includes(data.tier)) {
    warnings.push(`Invalid tier "${data.tier}", using default`);
  }

  if (data.price && typeof data.price === "object") {
    if (data.price.setup && (typeof data.price.setup !== "number" || data.price.setup < 0)) {
      warnings.push("Invalid setup price, will be ignored");
    }
    if (data.price.monthly && (typeof data.price.monthly !== "number" || data.price.monthly < 0)) {
      warnings.push("Invalid monthly price, will be ignored");
    }
  }

  // Create sanitized version if there are only warnings
  let sanitized: FeaturedPackageData | undefined;
  if (errors.length === 0) {
    sanitized = sanitizeFeaturedPackage(data);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized,
  };
}

/**
 * Sanitizes featured package data by removing invalid fields and applying defaults
 */
function sanitizeFeaturedPackage(data: any): FeaturedPackageData {
  const sanitized: FeaturedPackageData = {
    id: String(data.id).trim(),
    service: data.service,
    headline: String(data.headline).trim(),
    highlights: Array.isArray(data.highlights) 
      ? data.highlights.filter(h => typeof h === "string" && h.trim()).map(h => h.trim())
      : [],
    startingAt: Number(data.startingAt),
  };

  // Optional fields with validation
  if (data.packageId && typeof data.packageId === "string") {
    sanitized.packageId = data.packageId.trim();
  }

  if (data.name && typeof data.name === "string") {
    sanitized.name = data.name.trim();
  }

  if (data.summary && typeof data.summary === "string") {
    sanitized.summary = data.summary.trim();
  }

  if (data.tier && ["Essential", "Professional", "Enterprise"].includes(data.tier)) {
    sanitized.tier = data.tier;
  }

  if (typeof data.popular === "boolean") {
    sanitized.popular = data.popular;
  }

  if (data.href && typeof data.href === "string") {
    sanitized.href = data.href.trim();
  }

  if (data.image && typeof data.image === "object") {
    sanitized.image = {
      src: String(data.image.src || "").trim(),
      alt: String(data.image.alt || "").trim(),
    };
  }

  if (data.price && typeof data.price === "object") {
    sanitized.price = {};
    if (typeof data.price.setup === "number" && data.price.setup >= 0) {
      sanitized.price.setup = data.price.setup;
    }
    if (typeof data.price.monthly === "number" && data.price.monthly >= 0) {
      sanitized.price.monthly = data.price.monthly;
    }
  }

  if (data.ctaLabel && typeof data.ctaLabel === "string") {
    sanitized.ctaLabel = data.ctaLabel.trim();
  }

  if (data.badge && typeof data.badge === "string") {
    sanitized.badge = data.badge.trim();
  }

  if (typeof data.savingsPct === "number" && data.savingsPct > 0 && data.savingsPct <= 100) {
    sanitized.savingsPct = data.savingsPct;
  }

  if (data.category && typeof data.category === "string") {
    sanitized.category = data.category.trim();
  }

  if (typeof data.featured === "boolean") {
    sanitized.featured = data.featured;
  }

  if (data.metadata && typeof data.metadata === "object") {
    sanitized.metadata = { ...data.metadata };
  }

  return sanitized;
}

/**
 * Maps featured package data to PackageCard props
 */
export function mapFeaturedToPackageCard(
  data: FeaturedPackageData,
  config?: Partial<ServiceMappingConfig>
): NormalizedPackageCard {
  const defaultConfig: ServiceMappingConfig = {
    serviceSlug: data.service,
    baseUrl: `/services/${data.service}/packages`,
    defaultTier: "Essential",
    defaultCtaLabel: "View Details",
    maxItems: 3,
    enableSorting: true,
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Generate href if not provided
  const href = data.href || `${finalConfig.baseUrl}#${data.packageId || data.id}`;

  // Determine tier with fallback logic
  const tier = data.tier || 
    (data.badge?.toLowerCase().includes("enterprise") ? "Enterprise" :
     data.badge?.toLowerCase().includes("pro") ? "Professional" :
     finalConfig.defaultTier);

  // Determine if popular based on badge or explicit flag
  const popular = data.popular || 
    data.badge?.toLowerCase().includes("popular") ||
    data.badge?.toLowerCase().includes("best") ||
    false;

  return {
    id: data.id,
    service: data.service,
    name: data.name || data.headline,
    summary: data.summary,
    tier,
    popular,
    href,
    image: data.image ?? null,
    price: data.price ?? undefined,
    ctaLabel: data.ctaLabel || finalConfig.defaultCtaLabel,
    highlights: data.highlights.slice(0, 4), // Limit to 4 for display
    startingAt: data.startingAt,
    badge: data.badge,
    savingsPct: data.savingsPct,
    originalData: data,
  };
}

/**
 * Maps multiple featured packages with validation and sorting
 */
export function mapFeaturedPackages(
  packages: any[],
  config?: Partial<ServiceMappingConfig>
): {
  mapped: NormalizedPackageCard[];
  errors: string[];
  warnings: string[];
  skipped: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const mapped: NormalizedPackageCard[] = [];
  let skipped = 0;

  if (!Array.isArray(packages)) {
    errors.push("Packages must be an array");
    return { mapped: [], errors, warnings, skipped: 0 };
  }

  const finalConfig: ServiceMappingConfig = {
    serviceSlug: config?.serviceSlug || "webdev",
    baseUrl: config?.baseUrl || "/services",
    defaultTier: "Essential",
    defaultCtaLabel: "View Details",
    maxItems: 3,
    enableSorting: true,
    ...config,
  };

  // Process each package
  packages.forEach((pkg, index) => {
    const validation = validateFeaturedPackage(pkg);
    
    if (!validation.isValid) {
      errors.push(`Package at index ${index}: ${validation.errors.join(", ")}`);
      skipped++;
      return;
    }

    if (validation.warnings.length > 0) {
      warnings.push(`Package at index ${index}: ${validation.warnings.join(", ")}`);
    }

    if (validation.sanitized) {
      const mappedCard = mapFeaturedToPackageCard(validation.sanitized, finalConfig);
      mapped.push(mappedCard);
    }
  });

  // Apply sorting if enabled
  if (finalConfig.enableSorting && finalConfig.sortBy) {
    mapped.sort((a, b) => {
      switch (finalConfig.sortBy) {
        case "popular":
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
        case "startingAt":
          return (a.startingAt || 0) - (b.startingAt || 0);
        case "tier":
          const tierOrder = { Essential: 1, Professional: 2, Enterprise: 3 };
          return tierOrder[a.tier] - tierOrder[b.tier];
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  // Limit to max items
  const limitedMapped = mapped.slice(0, finalConfig.maxItems);

  return {
    mapped: limitedMapped,
    errors,
    warnings,
    skipped,
  };
}

/**
 * Service-specific mappers with predefined configurations
 */
export const serviceMappers = {
  webdev: (packages: any[]) => mapFeaturedPackages(packages, {
    serviceSlug: "webdev",
    defaultCtaLabel: "Build Website",
    sortBy: "tier",
  }),
  
  seo: (packages: any[]) => mapFeaturedPackages(packages, {
    serviceSlug: "seo",
    defaultCtaLabel: "Boost Rankings",
    sortBy: "popular",
  }),
  
  marketing: (packages: any[]) => mapFeaturedPackages(packages, {
    serviceSlug: "marketing",
    defaultCtaLabel: "Start Campaign",
    sortBy: "startingAt",
  }),
  
  leadgen: (packages: any[]) => mapFeaturedPackages(packages, {
    serviceSlug: "leadgen",
    defaultCtaLabel: "Generate Leads",
    sortBy: "popular",
  }),
  
  content: (packages: any[]) => mapFeaturedPackages(packages, {
    serviceSlug: "content",
    defaultCtaLabel: "Create Content",
    sortBy: "tier",
  }),
  
  video: (packages: any[]) => mapFeaturedPackages(packages, {
    serviceSlug: "video",
    defaultCtaLabel: "Start Production",
    sortBy: "startingAt",
  }),
} as const;

/**
 * Universal mapper that auto-detects service from data
 */
export function mapFeaturedPackagesUniversal(packages: any[]): {
  mapped: NormalizedPackageCard[];
  errors: string[];
  warnings: string[];
  skipped: number;
} {
  if (!Array.isArray(packages) || packages.length === 0) {
    return { mapped: [], errors: ["No packages provided"], warnings: [], skipped: 0 };
  }

  // Try to detect service from first valid package
  const firstPackage = packages.find(pkg => pkg && typeof pkg.service === "string");
  if (!firstPackage) {
    return { mapped: [], errors: ["No valid packages with service information"], warnings: [], skipped: 0 };
  }

  const serviceSlug = firstPackage.service as ServiceSlug;
  const mapper = serviceMappers[serviceSlug];
  
  if (mapper) {
    return mapper(packages);
  }

  // Fallback to generic mapping
  return mapFeaturedPackages(packages, { serviceSlug });
}

/**
 * Development-time validator for featured package data
 */
export function devValidateFeaturedPackages(packages: any[], componentName: string = "PackageCarousel"): void {
  if (process.env.NODE_ENV !== "development") return;

  const result = mapFeaturedPackagesUniversal(packages);
  
  if (result.errors.length > 0) {
    console.group(`🚨 ${componentName} Package Mapping Errors`);
    result.errors.forEach(error => console.error("❌", error));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group(`⚠️ ${componentName} Package Mapping Warnings`);
    result.warnings.forEach(warning => console.warn("⚠️", warning));
    console.groupEnd();
  }

  if (result.skipped > 0) {
    console.warn(`⏭️ ${componentName} Skipped ${result.skipped} invalid packages`);
  }
}