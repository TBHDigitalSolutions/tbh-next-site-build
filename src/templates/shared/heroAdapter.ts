// src/templates/shared/heroAdapter.ts
/**
 * Shared Hero Adapter - Production Ready
 * =====================================
 * 
 * Single source of truth for mapping page-level hero data into ServiceHero component props.
 * Used across all service templates (Hub, Service, SubService) to ensure consistency.
 * 
 * Supports both nested structure (preferred) and flat structure (legacy compatibility).
 */

import type {
  ServiceHeroData,
  ServiceHeroProps,
  HeroBackground
} from "@/types/servicesTemplate.types";

/**
 * Primary adapter function - converts ServiceHeroData to ServiceHero props
 * Uses proper union narrowing to ensure type safety
 */
export function toHeroProps(hero: ServiceHeroData | null | undefined): ServiceHeroProps | undefined {
  if (!hero?.content?.title) return undefined;

  // Extract media with proper union narrowing
  let media: ServiceHeroProps["media"];
  if (hero.background?.type === "image") {
    media = {
      type: "image",
      src: hero.background.src,
      alt: hero.background.alt ?? hero.content.title,
    } as HeroBackground;
  } else if (hero.background?.type === "video") {
    media = {
      type: "video",
      src: hero.background.src,
      poster: hero.background.poster,
      fallback: hero.background.fallback,
      autoPlay: hero.background.autoPlay,
      muted: hero.background.muted,
      loop: hero.background.loop,
    } as HeroBackground;
  }

  // Extract primary button
  const button = hero.content.primaryCta ? {
    text: hero.content.primaryCta.label,
    href: hero.content.primaryCta.href,
    ariaLabel: hero.content.primaryCta.ariaLabel || `${hero.content.primaryCta.label} - ${hero.content.title}`,
  } : undefined;

  // Extract secondary button
  const secondaryButton = hero.content.secondaryCta ? {
    text: hero.content.secondaryCta.label,
    href: hero.content.secondaryCta.href,
    ariaLabel: hero.content.secondaryCta.ariaLabel || `${hero.content.secondaryCta.label} - ${hero.content.title}`,
  } : undefined;

  return {
    title: hero.content.title,
    subtitle: hero.content.subtitle,
    media,
    button,
    secondaryButton,
  };
}

/**
 * Legacy adapter for flat hero structures (backward compatibility)
 * @deprecated Use nested ServiceHeroData structure instead
 */
export function toHeroPropsLegacy(hero: any): ServiceHeroProps | undefined {
  if (!hero?.title) return undefined;

  if (process.env.NODE_ENV === "development") {
    console.warn("[HeroAdapter] Using legacy flat hero structure. Migrate to nested structure.");
  }

  // Extract media with proper union narrowing for legacy format
  let media: ServiceHeroProps["media"];
  if (hero.background?.type === "image" || hero.image) {
    media = {
      type: "image",
      src: hero.background?.src ?? hero.image?.src ?? "",
      alt: hero.background?.alt ?? hero.image?.alt ?? hero.title,
    };
  } else if (hero.background?.type === "video") {
    media = {
      type: "video",
      src: hero.background.src,
      poster: hero.background.poster,
      fallback: hero.background.fallback,
    };
  }

  const button = hero.primaryCta || hero.ctas?.primary ? {
    text: (hero.primaryCta?.label || hero.ctas?.primary?.label) || "",
    href: (hero.primaryCta?.href || hero.ctas?.primary?.href) || "",
    ariaLabel: hero.primaryCta?.ariaLabel || hero.ctas?.primary?.ariaLabel,
  } : undefined;

  return {
    title: hero.title,
    subtitle: hero.subtitle || hero.text,
    media: (media && "src" in media && media.src) ? media : undefined,
    button: button?.text && button?.href ? button : undefined,
  };
}

/**
 * Smart adapter that handles both new and legacy formats
 * Automatically detects structure type and uses appropriate adapter
 */
export function toHeroPropsAuto(hero: any): ServiceHeroProps | undefined {
  if (!hero) return undefined;

  // Check if it's the new nested structure
  if (hero.content?.title) {
    return toHeroProps(hero as ServiceHeroData);
  }

  // Fall back to legacy structure
  if (hero.title) {
    return toHeroPropsLegacy(hero);
  }

  return undefined;
}

/**
 * Validation helper for development
 * Ensures hero props meet component requirements
 */
export function validateHeroProps(props: ServiceHeroProps | undefined): boolean {
  if (!props) return false;

  if (process.env.NODE_ENV === "development") {
    if (!props.title?.trim()) {
      console.warn("[HeroAdapter] Missing required title");
      return false;
    }

    if (props.media && !props.media.src?.trim()) {
      console.warn("[HeroAdapter] Media missing src");
    }

    if (props.button && (!props.button.text?.trim() || !props.button.href?.trim())) {
      console.warn("[HeroAdapter] Button missing text or href");
    }

    if (props.secondaryButton && (!props.secondaryButton.text?.trim() || !props.secondaryButton.href?.trim())) {
      console.warn("[HeroAdapter] Secondary button missing text or href");
    }
  }

  return true;
}

/**
 * Development debugging helper
 * Logs input/output for troubleshooting
 */
export function debugHeroData(input: any, templateName: string): void {
  if (process.env.NODE_ENV !== "development") return;

  console.group(`[HeroAdapter] ${templateName} Debug`);
  console.log("Input:", input);
  
  const output = toHeroPropsAuto(input);
  console.log("Output:", output);
  console.log("Valid:", validateHeroProps(output));
  
  if (input?.content?.title) {
    console.log("Structure: Nested (preferred)");
  } else if (input?.title) {
    console.log("Structure: Flat (legacy)");
  } else {
    console.log("Structure: Invalid/unrecognized");
  }
  
  console.groupEnd();
}

/**
 * Helper to determine if hero data is using new nested structure
 */
export function isNestedHeroStructure(hero: any): hero is ServiceHeroData {
  return Boolean(hero?.content?.title);
}

/**
 * Helper to safely extract title from any hero structure
 */
export function extractHeroTitle(hero: any): string | undefined {
  return hero?.content?.title || hero?.title;
}

/**
 * Helper to safely extract subtitle from any hero structure
 */
export function extractHeroSubtitle(hero: any): string | undefined {
  return hero?.content?.subtitle || hero?.subtitle || hero?.text;
}

// Export types for external use
export type { ServiceHeroProps, ServiceHeroData, HeroBackground };