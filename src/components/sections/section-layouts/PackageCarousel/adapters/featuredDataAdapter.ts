// src/components/sections/section-layouts/PackageCarousel/adapters/featuredDataAdapter.ts
import type { PackageCardProps } from "../PackageCard";
import type { ServiceSlug } from "../helpers";

/**
 * Shape that matches your existing featured data files
 */
export interface FeaturedCard {
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
}

/**
 * Type guard to check if data is FeaturedCard format
 */
export function isFeaturedCard(data: any): data is FeaturedCard {
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
 * Type guard to check if data is FeaturedCard array
 */
export function isFeaturedCardArray(data: any): data is FeaturedCard[] {
  return Array.isArray(data) && data.every(isFeaturedCard);
}

/**
 * Determines tier from badge text
 */
function determineTierFromBadge(badge?: string): "Essential" | "Professional" | "Enterprise" {
  if (!badge) return "Essential";
  
  const lowerBadge = badge.toLowerCase();
  
  if (lowerBadge.includes("enterprise") || lowerBadge.includes("premium")) {
    return "Enterprise";
  }
  
  if (
    lowerBadge.includes("professional") || 
    lowerBadge.includes("pro") ||
    lowerBadge.includes("growth") || 
    lowerBadge.includes("best") ||
    lowerBadge.includes("popular")
  ) {
    return "Professional";
  }
  
  return "Essential";
}

/**
 * Generates href from FeaturedCard data
 */
function generateHref(featuredCard: FeaturedCard): string {
  if (featuredCard.href) {
    return featuredCard.href;
  }
  
  const packageId = featuredCard.packageId || featuredCard.id;
  return `/services/${featuredCard.service}/packages#${packageId}`;
}

/**
 * Adapts FeaturedCard data to PackageCardProps format
 * Transforms your existing featured data files to work with the enhanced PackageCard
 */
export function adaptFeaturedCardToPackageCard(
  featuredCard: FeaturedCard
): Omit<PackageCardProps, "className"> {
  return {
    id: featuredCard.id,
    service: featuredCard.service,
    name: featuredCard.name || featuredCard.headline,
    summary: featuredCard.summary,
    tier: featuredCard.tier || determineTierFromBadge(featuredCard.badge),
    popular: featuredCard.popular || featuredCard.badge === "Most Popular",
    href: generateHref(featuredCard),
    image: featuredCard.image ?? null,
    price: featuredCard.price ?? undefined,
    ctaLabel: featuredCard.ctaLabel || "View Details",
    highlights: featuredCard.highlights || [],
    startingAt: featuredCard.startingAt,
    badge: featuredCard.badge,
    savingsPct: featuredCard.savingsPct,
  };
}

/**
 * Converts multiple featured cards to package cards, limiting to 3
 */
export function adaptFeaturedCardsToPackageCards(
  featuredCards: FeaturedCard[]
): Omit<PackageCardProps, "className">[] {
  if (!Array.isArray(featuredCards)) {
    console.warn("adaptFeaturedCardsToPackageCards: Expected array, got:", typeof featuredCards);
    return [];
  }

  return featuredCards
    .filter(isFeaturedCard) // Ensure all items are valid
    .slice(0, 3) // Ensure exactly 3 cards max
    .map(adaptFeaturedCardToPackageCard);
}

/**
 * Service-specific adapters for your existing data files
 */
export const serviceAdapters = {
  /**
   * Adapter for SEO services featured data
   */
  seo: (seoFeatured: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(seoFeatured),
  
  /**
   * Adapter for Web Development featured data  
   */
  webdev: (webdevFeatured: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(webdevFeatured),
  
  /**
   * Adapter for Marketing featured data
   */
  marketing: (marketingFeatured: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(marketingFeatured),
  
  /**
   * Adapter for Lead Generation featured data
   */
  leadgen: (leadgenFeatured: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(leadgenFeatured),
  
  /**
   * Adapter for Video Production featured data
   */
  video: (videoFeatured: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(videoFeatured),
  
  /**
   * Adapter for Content Production featured data
   */
  content: (contentFeatured: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(contentFeatured),
} as const;

/**
 * Universal adapter that works with any service
 */
export function adaptServiceFeaturedData(
  serviceSlug: ServiceSlug,
  featuredData: FeaturedCard[]
): Omit<PackageCardProps, "className">[] {
  const adapter = serviceAdapters[serviceSlug];
  if (adapter) {
    return adapter(featuredData);
  }
  
  // Fallback to generic adapter
  return adaptFeaturedCardsToPackageCards(featuredData);
}

/**
 * Validation helper to ensure data integrity
 */
export function validateFeaturedCardData(data: any, context: string = "unknown"): FeaturedCard[] {
  if (!Array.isArray(data)) {
    console.warn(`${context}: Featured data is not an array:`, data);
    return [];
  }

  const validCards: FeaturedCard[] = [];
  const invalidCards: any[] = [];

  data.forEach((item, index) => {
    if (isFeaturedCard(item)) {
      validCards.push(item);
    } else {
      invalidCards.push({ index, item });
    }
  });

  if (invalidCards.length > 0) {
    console.warn(`${context}: Found ${invalidCards.length} invalid featured cards:`, invalidCards);
  }

  return validCards;
}

/**
 * Helper to merge featured data from multiple sources
 */
export function mergeFeaturedData(...sources: (FeaturedCard[] | undefined)[]): FeaturedCard[] {
  const merged: FeaturedCard[] = [];
  const seenIds = new Set<string>();

  sources.forEach(source => {
    if (Array.isArray(source)) {
      source.forEach(card => {
        if (isFeaturedCard(card) && !seenIds.has(card.id)) {
          merged.push(card);
          seenIds.add(card.id);
        }
      });
    }
  });

  return merged;
}