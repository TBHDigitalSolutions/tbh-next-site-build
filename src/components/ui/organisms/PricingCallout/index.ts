// src/components/ui/organisms/PricingCallout/index.ts

export { default } from "./PricingCallout";
export type {
  PricingCalloutProps,
  PricingCalloutVariant, 
  PricingCalloutCta
} from "./PricingCallout";

// Convenience type for data contracts
export interface SubServicePricingData {
  variant: PricingCalloutVariant;
  label?: string;
  amount?: number | string;
  note?: string;
  cta?: PricingCalloutCta;
}

// Example data structures for documentation
export const PRICING_CALLOUT_EXAMPLES = {
  included: {
    variant: "included" as const,
    label: "Included in Growth Package Pro",
    note: "No additional cost when bundled",
    cta: {
      label: "View Package",
      href: "/services/packages/growth-pro",
      variant: "secondary" as const,
    }
  },
  addon: {
    variant: "addon" as const,
    amount: 1500,
    note: "Can be added to any SEO package",
    cta: {
      label: "Add to Package", 
      href: "/contact?add=seo-audit",
      variant: "primary" as const,
    }
  },
  custom: {
    variant: "custom" as const,
    label: "Enterprise consultation required",
    note: "Complex integrations with custom pricing",
    cta: {
      label: "Contact Sales",
      href: "/contact/enterprise",
      variant: "primary" as const,
    }
  }
} as const;