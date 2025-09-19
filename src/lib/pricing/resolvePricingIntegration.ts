// src/lib/pricing/resolvePricingIntegration.ts
import { resolvePricingAdapter } from "@/lib/services/pricingAdapters";
import type { TaxonomyNode } from "@/types/servicesTaxonomy.types";
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";

/**
 * Pricing integration result
 */
export interface PricingIntegrationResult {
  title: string;
  subtitle: string;
  data: any;
  mapToTiersProps: (data: any) => any;
  notes: {
    disclaimer: string;
    contact: string;
    contactHref: string;
    additionalInfo?: string[];
  };
  metadata: {
    serviceSlug: string;
    hubSlug?: string;
    level: number;
    hasComparison: boolean;
    currency: string;
    lastUpdated?: string;
  };
}

/**
 * Pricing integration options
 */
export interface PricingIntegrationOptions {
  /** Custom title override */
  customTitle?: string;
  /** Custom subtitle override */
  customSubtitle?: string;
  /** Currency code to use */
  currency?: string;
  /** Whether to include comparison table */
  includeComparison?: boolean;
  /** Additional disclaimer notes */
  additionalNotes?: string[];
  /** Custom contact information */
  customContact?: {
    text: string;
    href: string;
  };
}

/**
 * Resolves pricing integration for service pages
 * Orchestrates pricing data, adapters, and display configuration
 */
export function resolvePricingIntegration(
  node: TaxonomyNode,
  data: ServiceTemplateData,
  options: PricingIntegrationOptions = {}
): PricingIntegrationResult {
  if (!node || !data) {
    throw new Error("Both node and data are required for pricing integration");
  }

  // Validate node structure
  if (!node.slug || !node.name) {
    throw new Error("Node must have slug and name properties");
  }

  // Resolve pricing adapter for this service
  const pricingAdapter = resolvePricingAdapter({
    level: 2,
    hub: node.parentId,
    service: node.slug,
  });

  if (!pricingAdapter) {
    console.warn(`No pricing adapter found for service: ${node.slug}`);
  }

  // Generate titles with fallbacks
  const title = options.customTitle || 
    `${node.name} Pricing & Packages` ||
    "Pricing & Packages";
    
  const subtitle = options.customSubtitle || 
    "Investment levels designed for sustainable growth" ||
    "Choose the plan that fits your needs";

  // Prepare metadata
  const metadata = {
    serviceSlug: node.slug,
    hubSlug: node.parentId,
    level: 2,
    hasComparison: Boolean(data.pricing?.comparison || options.includeComparison),
    currency: options.currency || "USD",
    lastUpdated: new Date().toISOString(),
  };

  // Prepare notes with customization
  const notes = {
    disclaimer: "All packages include setup and 30-day support",
    contact: options.customContact?.text || "Questions about which package fits?",
    contactHref: options.customContact?.href || "/contact",
    additionalInfo: options.additionalNotes,
  };

  // Validate pricing data exists
  if (!data.pricing) {
    console.warn(`No pricing data found for service: ${node.slug}`);
  }

  return {
    title,
    subtitle,
    data: data.pricing,
    mapToTiersProps: pricingAdapter || ((data: any) => ({ tiers: [] })),
    notes,
    metadata,
  };
}

/**
 * Enhanced pricing integration with validation and error handling
 */
export function resolvePricingIntegrationSafe(
  node: TaxonomyNode,
  data: ServiceTemplateData,
  options: PricingIntegrationOptions = {}
): {
  result: PricingIntegrationResult | null;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate inputs
    if (!node) {
      errors.push("Node is required");
      return { result: null, errors, warnings };
    }

    if (!data) {
      errors.push("Data is required");
      return { result: null, errors, warnings };
    }

    if (!node.slug) {
      errors.push("Node must have a slug");
    }

    if (!node.name) {
      errors.push("Node must have a name");
    }

    if (errors.length > 0) {
      return { result: null, errors, warnings };
    }

    // Check for potential issues
    if (!data.pricing) {
      warnings.push("No pricing data found - using empty pricing");
    }

    if (!node.parentId) {
      warnings.push("No parent ID found - may affect adapter resolution");
    }

    // Attempt to resolve pricing integration
    const result = resolvePricingIntegration(node, data, options);

    // Additional validation on result
    if (!result.mapToTiersProps) {
      warnings.push("No pricing adapter resolved - using fallback");
    }

    if (!result.data) {
      warnings.push("No pricing data available");
    }

    return { result, errors, warnings };
  } catch (error) {
    errors.push(`Failed to resolve pricing integration: ${error instanceof Error ? error.message : "Unknown error"}`);
    return { result: null, errors, warnings };
  }
}

/**
 * Resolves pricing integration for multiple services
 */
export function resolveBulkPricingIntegration(
  services: Array<{ node: TaxonomyNode; data: ServiceTemplateData }>,
  options: PricingIntegrationOptions = {}
): {
  results: Array<{ service: string; result: PricingIntegrationResult | null }>;
  errors: Array<{ service: string; errors: string[] }>;
  warnings: Array<{ service: string; warnings: string[] }>;
} {
  const results: Array<{ service: string; result: PricingIntegrationResult | null }> = [];
  const errors: Array<{ service: string; errors: string[] }> = [];
  const warnings: Array<{ service: string; warnings: string[] }> = [];

  services.forEach(({ node, data }) => {
    const serviceId = node?.slug || "unknown";
    const { result, errors: serviceErrors, warnings: serviceWarnings } = 
      resolvePricingIntegrationSafe(node, data, options);

    results.push({ service: serviceId, result });

    if (serviceErrors.length > 0) {
      errors.push({ service: serviceId, errors: serviceErrors });
    }

    if (serviceWarnings.length > 0) {
      warnings.push({ service: serviceId, warnings: serviceWarnings });
    }
  });

  return { results, errors, warnings };
}

/**
 * Utility to check if pricing integration is valid
 */
export function isPricingIntegrationValid(integration: PricingIntegrationResult): boolean {
  return Boolean(
    integration &&
    integration.title &&
    integration.mapToTiersProps &&
    typeof integration.mapToTiersProps === "function"
  );
}

/**
 * Utility to get default pricing integration for fallback scenarios
 */
export function getDefaultPricingIntegration(
  serviceName: string = "Service"
): PricingIntegrationResult {
  return {
    title: `${serviceName} Pricing`,
    subtitle: "Investment levels designed for sustainable growth",
    data: null,
    mapToTiersProps: () => ({ tiers: [] }),
    notes: {
      disclaimer: "Pricing details coming soon",
      contact: "Contact us for custom pricing",
      contactHref: "/contact",
    },
    metadata: {
      serviceSlug: serviceName.toLowerCase().replace(/\s+/g, "-"),
      level: 2,
      hasComparison: false,
      currency: "USD",
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Development helper to validate pricing integration
 */
export function devValidatePricingIntegration(
  node: TaxonomyNode,
  data: ServiceTemplateData,
  options: PricingIntegrationOptions = {}
): void {
  if (process.env.NODE_ENV !== "development") return;

  const { result, errors, warnings } = resolvePricingIntegrationSafe(node, data, options);

  if (errors.length > 0) {
    console.group(`🚨 Pricing Integration Errors for ${node?.slug || "unknown"}`);
    errors.forEach(error => console.error("❌", error));
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group(`⚠️ Pricing Integration Warnings for ${node?.slug || "unknown"}`);
    warnings.forEach(warning => console.warn("⚠️", warning));
    console.groupEnd();
  }

  if (result && !isPricingIntegrationValid(result)) {
    console.warn(`🔍 Pricing integration may be incomplete for ${node?.slug}`);
  }
}

/**
 * Utility to merge pricing integration options
 */
export function mergePricingIntegrationOptions(
  base: PricingIntegrationOptions,
  override: PricingIntegrationOptions
): PricingIntegrationOptions {
  return {
    ...base,
    ...override,
    additionalNotes: [
      ...(base.additionalNotes || []),
      ...(override.additionalNotes || []),
    ],
  };
}

/**
 * Default export for backwards compatibility
 */
export default resolvePricingIntegration;