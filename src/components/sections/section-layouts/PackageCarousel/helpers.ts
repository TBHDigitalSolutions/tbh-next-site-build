// src/components/sections/section-layouts/PackageCarousel/helpers.ts
import type { PackageCardProps } from "./PackageCard";

export type ServiceSlug = PackageCardProps["service"];

export const SERVICE_LABELS: Record<ServiceSlug, string> = {
  webdev: "Web Development",
  seo: "SEO Services",
  marketing: "Marketing",
  leadgen: "Lead Generation",
  content: "Content Production",
  video: "Video Production",
};

export const SERVICE_DESCRIPTIONS: Record<ServiceSlug, string> = {
  webdev: "Custom websites and web applications",
  seo: "Search engine optimization and visibility",
  marketing: "Digital marketing and growth strategies",
  leadgen: "Lead generation and conversion optimization",
  content: "Content creation and marketing",
  video: "Video production and marketing",
};

export function formatMoney(n?: number | null, currency: string = "USD"): string | null {
  if (!n || n <= 0) return null;
  
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  } catch (error) {
    // Fallback for invalid currency
    return `$${n.toLocaleString()}`;
  }
}

export function formatMonthlyPrice(n?: number | null): string | null {
  const formatted = formatMoney(n);
  return formatted ? `${formatted}/month` : null;
}

export function formatStartingPrice(n?: number | null): string | null {
  const formatted = formatMoney(n);
  return formatted ? `Starting at ${formatted}` : null;
}

export function limitToThree<T>(arr?: T[]): T[] {
  return Array.isArray(arr) ? arr.slice(0, 3) : [];
}

export function takeN<T>(arr: T[] | undefined, n: number): T[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.slice(0, Math.max(0, n));
}

export function isValidServiceSlug(slug: string): slug is ServiceSlug {
  return Object.keys(SERVICE_LABELS).includes(slug);
}

export function getServiceLabel(slug: ServiceSlug): string {
  return SERVICE_LABELS[slug] || slug;
}

export function getServiceDescription(slug: ServiceSlug): string {
  return SERVICE_DESCRIPTIONS[slug] || "";
}

/**
 * Generates a canonical package URL
 */
export function getPackageUrl(serviceSlug: ServiceSlug, packageId?: string): string {
  const baseUrl = `/services/${serviceSlug}/packages`;
  return packageId ? `${baseUrl}#${packageId}` : baseUrl;
}

/**
 * Generates add-ons URL for a service
 */
export function getAddonsUrl(serviceSlug: ServiceSlug): string {
  return `/services/${serviceSlug}/packages#addons`;
}

/**
 * Validates if a URL is internal/safe
 */
export function isInternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    // Relative URLs are considered internal
    return !url.startsWith('http');
  }
}

/**
 * Generates a test ID from a base and optional suffix
 */
export function generateTestId(base: string, suffix?: string | number): string {
  const sanitized = base.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return suffix ? `${sanitized}-${suffix}` : sanitized;
}

/**
 * Domain shape you can adapt from your data files
 */
export interface DomainPackage {
  id: string;
  service: ServiceSlug;
  name: string;
  summary?: string;
  tier: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  bestFor?: string;
  image?: { src: string; alt?: string } | null;
  price?: { setup?: number; monthly?: number; savingsPct?: number };
  features?: string[]; // 3–5 bullets
  highlights?: string[];
  startingAt?: number;
  badge?: string;
}

/**
 * Map domain package to card props
 */
export function toCard(item: DomainPackage): Omit<PackageCardProps, "className"> {
  return {
    id: item.id,
    service: item.service,
    name: item.name,
    summary: item.summary,
    tier: item.tier,
    popular: !!item.popular,
    href: getPackageUrl(item.service, item.id),
    image: item.image ?? null,
    price: { 
      setup: item.price?.setup, 
      monthly: item.price?.monthly 
    },
    ctaLabel: "View details",
    highlights: item.highlights || item.features?.slice(0, 4) || [],
    startingAt: item.startingAt || item.price?.setup,
    badge: item.badge,
    savingsPct: item.price?.savingsPct,
  };
}

/**
 * Utility to safely access nested object properties
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  return path.split('.').reduce((current, key) => 
    (current && current[key] !== undefined) ? current[key] : defaultValue, obj
  );
}

/**
 * Utility to truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Analytics helper for tracking package interactions
 */
export function trackPackageInteraction(
  action: string, 
  packageId: string, 
  serviceSlug: ServiceSlug,
  additionalData?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'package_interaction', {
        action,
        package_id: packageId,
        service: serviceSlug,
        ...additionalData,
      });
    }

    // Custom analytics
    if (typeof window.analytics === 'object' && window.analytics?.track) {
      window.analytics.track('Package Interaction', {
        action,
        packageId,
        service: serviceSlug,
        ...additionalData,
      });
    }
  }
}

/**
 * Type guard for PackageCardProps
 */
export function isPackageCardProps(obj: any): obj is PackageCardProps {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.service === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.tier === 'string' &&
    typeof obj.href === 'string' &&
    isValidServiceSlug(obj.service)
  );
}