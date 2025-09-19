// src/booking/sections/BookingHeroSection/BookingHeroSection.types.ts
// Types for the BookingHeroSection wrapper that composes the shared ServiceHero.
// This file is framework-agnostic (pure TypeScript types) and safe for SSR.

/* ======================================================================
 * Media
 * ====================================================================*/

/**
 * Background media shown behind the hero content.
 * Mirrors the minimal shape expected by ServiceHero to keep props compatible.
 */
export type BookingHeroMedia =
  | {
      type: "image";
      /** Absolute or public path to the image. */
      src: string;
      /** Alt text for accessibility. Required for images. */
      alt: string;
      /** Optional high-quality, preloaded image hint. */
      priority?: boolean;
      /** Optional quality hint (0–100). */
      quality?: number;
      /** Object-fit behavior, defaults to 'cover'. */
      fit?: "cover" | "contain";
    }
  | {
      type: "video";
      /** Absolute or public path to the video. */
      src: string;
      /** Optional poster image shown before playback. */
      poster?: string;
      /** Fallback image if video is blocked or fails. */
      fallback?: string;
      /**
       * When true the section will ask the underlying player
       * to autoplay (muted, looped). Reduced motion is respected at runtime.
       * Default: true
       */
      autoPlay?: boolean;
      /** Loop playback. Default: true */
      loop?: boolean;
      /** Show native controls. Default: false */
      controls?: boolean;
      /** Video preload strategy. Default: 'metadata' */
      preload?: "none" | "metadata" | "auto";
    };

/* ======================================================================
 * CTA (Call To Action)
 * ====================================================================*/

/**
 * CTA button/link used by the hero. Works with either <a> or router links.
 * Keep this object stable — downstream analytics and policy checks depend on it.
 */
export interface BookingHeroCta {
  /** The button text users see. Keep it action-oriented. */
  text: string;
  /** Destination URL. May be a route, hash, or absolute URL. */
  href: string;
  /** Optional ARIA label override for accessibility. */
  ariaLabel?: string;
  /** Target behavior when using an anchor element. */
  target?: "_self" | "_blank" | "_parent" | "_top";
  /** Rel attribute when opening new tabs (e.g., 'noopener noreferrer'). */
  rel?: string;

  /** Visual size token passed to the Button atom (if used). */
  size?: "sm" | "md" | "lg";
  /** Visual style token passed to the Button atom (if used). */
  variant?: "primary" | "secondary" | "tertiary" | "outline";

  /**
   * Optional click handler if the CTA triggers in-app flows
   * (tracking, modals, etc.). If provided, it will be invoked
   * before navigation. Return `false` to prevent default navigation.
   */
  onClick?: (event: MouseEvent | unknown) => void | boolean;

  /** Optional test hook for QA & E2E tests. */
  "data-testid"?: string;

  /** Optional analytics metadata merged into click events. */
  analytics?: Record<string, unknown>;
}

/* ======================================================================
 * Trust & Badges
 * ====================================================================*/

export interface BookingTrustBadge {
  /** Short label (e.g., “Secure Checkout”, “ISO 27001”). */
  label: string;
  /** Optional small icon URL or sprite reference. */
  iconSrc?: string;
  /** Optional descriptive tooltip text (keep brief). */
  description?: string;
}

/* ======================================================================
 * Layout & Theme
 * ====================================================================*/

/** Layout knobs passed through to wrappers (e.g., HeroWrapper/Container). */
export interface BookingHeroLayout {
  /**
   * Content alignment within the hero.
   * Note: underlying ServiceHero centers by default.
   */
  align?: "center" | "left" | "right";
  /**
   * Section height hint to the wrapper.
   * The shared HeroWrapper supports these size presets.
   */
  height?: "auto" | "small" | "medium" | "large";
  /** Container width preset. */
  containerSize?: "narrow" | "normal" | "wide";
}

/** Theme tokens that can be safely overridden per-section. */
export interface BookingHeroTheme {
  /** Accent brand color used by the CTA. */
  accentColor?: string;
  /** Text color used for headings on top of media. */
  textOnMedia?: string;
  /** Optional overlay color on top of media. */
  overlayColor?: string; // e.g., "rgba(6,5,18,0.55)"
  /** Overlay opacity (0–1). */
  overlayOpacity?: number;
}

/* ======================================================================
 * Analytics
 * ====================================================================*/

export interface BookingHeroAnalytics {
  /** Event fired when the hero becomes visible on screen. */
  onView?: (payload: {
    context: string;
    title: string;
    variant?: string;
  }) => void;
  /** Event fired when a CTA is clicked. */
  onCtaClick?: (payload: {
    context: string;
    ctaText: string;
    href: string;
    variant?: string;
    extra?: Record<string, unknown>;
  }) => void;
  /** A stable string to identify where this hero is used. */
  context?: string; // e.g., "booking-hero"
}

/* ======================================================================
 * Content
 * ====================================================================*/

export interface BookingHeroEyebrow {
  /** Small kicker text above the title. */
  text: string;
  /** Optional semantic tag, defaults to <p>. */
  as?: "p" | "span" | "div";
}

/* ======================================================================
 * Props
 * ====================================================================*/

/**
 * Public props for the BookingHeroSection.
 * This section composes the shared `ServiceHero` with booking-specific
 * options and analytics hooks.
 */
export interface BookingHeroSectionProps {
  /** Main headline. Keep concise and outcome-focused. */
  title: string;
  /** Optional supporting copy shown below the title. */
  subtitle?: string;
  /** Optional eyebrow/kicker shown above the title. */
  eyebrow?: BookingHeroEyebrow;

  /** Optional background media (image or video). */
  media?: BookingHeroMedia;

  /** Primary call to action (recommended). */
  primaryCta?: BookingHeroCta;
  /** Optional secondary CTA (e.g., “Learn more”). */
  secondaryCta?: BookingHeroCta;

  /** Optional trust badges row below CTAs. */
  trustBadges?: BookingTrustBadge[];

  /** Layout hints passed to wrappers. */
  layout?: BookingHeroLayout;

  /** Theming tokens for light polish without breaking shared styles. */
  theme?: BookingHeroTheme;

  /** Analytics hooks and static context. */
  analytics?: BookingHeroAnalytics;

  /**
   * Variant key for A/B tests or content experiments
   * (e.g., "control", "short-subtitle", "video-bg").
   */
  variant?: string;

  /** Extra className(s) appended to the root element. */
  className?: string;

  /**
   * Accessibility: explicit aria-label for the hero landmark/region.
   * If omitted, a sensible label is derived from `title`.
   */
  ariaLabel?: string;

  /**
   * When true, the section will *force* reduced motion behaviors
   * (e.g., disabling background video autoplay) even if the user
   * has not set prefers-reduced-motion. Default: false
   */
  forceReducedMotion?: boolean;
}

/* ======================================================================
 * Internal helpers (optional exports)
 * ====================================================================*/

/** Safe defaults used by the section implementation. */
export const BOOKING_HERO_DEFAULTS = {
  layout: {
    align: "center",
    height: "small",
    containerSize: "normal",
  } as Required<Pick<BookingHeroLayout, "align" | "height" | "containerSize">>,
  theme: {
    overlayOpacity: 0.45,
    overlayColor: "rgba(6, 5, 18, 0.55)",
  } as Required<Pick<BookingHeroTheme, "overlayColor" | "overlayOpacity">>,
  analytics: {
    context: "booking-hero",
  } as Required<Pick<BookingHeroAnalytics, "context">>,
};

export type { BookingHeroSectionProps as DefaultBookingHeroSectionProps };
