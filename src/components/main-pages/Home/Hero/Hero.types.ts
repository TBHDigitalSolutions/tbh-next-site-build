// src/components/features/home/Hero/Hero.types.ts

import type React from "react";

/**
 * Discriminated union of supported hero variants.
 */
export type HeroVariant = "video" | "split" | "interactive" | "minimal";

/**
 * Common CTA shape used across heroes.
 */
export interface CTA {
  text: string;
  href: string;
  onClick?: (event?: React.MouseEvent) => void;
  variant?: "primary" | "secondary" | "outline";
}

/**
 * Small logo badge for trust/partners.
 */
export interface TrustBadge {
  id: string;
  name: string;
  logo: string;
  alt: string;
}

/**
 * Numeric/stat display.
 */
export interface Stat {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Optional breadcrumb crumb.
 */
export interface Breadcrumb {
  label: string;
  href: string;
}

/**
 * Interactive marker used by InteractiveHero.
 */
export interface InteractiveElement {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: { x: number; y: number };
  color: string;
}

/**
 * Base config shared by all hero variants and mapped to HeroSectionWrapper.
 */
export interface BaseHeroData {
  /** Discriminator */
  variant: HeroVariant;

  /** Content */
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: CTA;
  secondaryCTA?: CTA;

  /** Analytics & experiments (optional) */
  analyticsId?: string;
  abTestVariant?: string;

  /** Wrapper / layout configuration */
  align?: "center" | "left" | "right";
  height?: "hero-min-height" | "hero-full-height" | "hero-medium-height";
  backgroundImage?: string;
  overlay?: boolean;
  /** Used by wrapper; applies to any variant if desired */
  overlayOpacity?: number;
  backgroundVariant?: "gradient" | "solid";
  contentWidth?: "normal" | "wide" | "narrow";
  spacing?: "normal" | "large" | "small";
}

/**
 * VideoHero variant.
 * Matches composer usage: videoSrc + optional player flags and overlay color.
 */
export interface VideoHeroData extends BaseHeroData {
  variant: "video";
  videoSrc: string;
  posterImage?: string;
  fallbackImage?: string;
  textPosition?: "center" | "left" | "right" | "bottom-left";
  enablePlayPause?: boolean;
  enableVolumeControl?: boolean;
  /** Player behavior flags */
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  videoLoop?: boolean;
  /** Optional overlay color just for the video layer */
  overlayColor?: string;
}

/**
 * SplitScreenHero variant.
 */
export interface SplitHeroData extends BaseHeroData {
  variant: "split";
  contentSide?: "left" | "right";
  splitRatio?: "50-50" | "60-40" | "40-60";
  mobileLayout?: "stack" | "content-only";
  leftContent?: {
    backgroundImage?: string;
    backgroundVideo?: string;
  };
  rightContent?: {
    backgroundImage?: string;
    stats?: Stat[];
    trustBadges?: TrustBadge[];
    features?: string[];
  };
}

/**
 * InteractiveHero variant.
 */
export interface InteractiveHeroData extends BaseHeroData {
  variant: "interactive";
  backgroundVideo?: string;
  trustBadges?: TrustBadge[];
  interactiveElements?: InteractiveElement[];
  enableParticles?: boolean;
  enableTypingEffect?: boolean;
  /** Optional extras used by composer / variant */
  typingText?: string[];
  particleConfig?: Record<string, unknown>;
}

/**
 * MinimalHero variant.
 */
export interface MinimalHeroData extends BaseHeroData {
  variant: "minimal";
  layout?: "centered" | "left-aligned" | "split";
  showScrollIndicator?: boolean;
  minimalVariant?: "clean" | "gradient" | "bordered";
  breadcrumbs?: Breadcrumb[];
}

/**
 * Unified hero data type accepted by HeroComposer.
 */
export type AnyHeroData =
  | VideoHeroData
  | SplitHeroData
  | InteractiveHeroData
  | MinimalHeroData;
