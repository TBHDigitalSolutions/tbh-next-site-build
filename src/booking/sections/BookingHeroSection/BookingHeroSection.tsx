// src/booking/sections/BookingHeroSection/BookingHeroSection.tsx
"use client";

import React from "react";
import clsx from "clsx";
import ServiceHero, {
  type ServiceHeroProps,
} from "@/components/sections/section-layouts/ServiceHero";
import { Button } from "@/components/ui/atoms/Button";

/**
 * BookingHeroSection
 * A light wrapper around the shared ServiceHero that:
 *  - adds booking-focused defaults & copy hooks
 *  - wires an optional CTA to your booking flow
 *  - exposes analytics callbacks without coupling to a specific vendor
 *
 * NOTE:
 *  - Visual styles are driven by ServiceHero.css (already imported by ServiceHero).
 *  - This component remains intentionally thin to avoid duplication.
 */

export interface BookingHeroSectionProps {
  /** Main headline (required) */
  title: string;
  /** Supporting copy below the title */
  subtitle?: string;

  /** Optional media for the hero background (passed through to ServiceHero) */
  media?: ServiceHeroProps["media"];

  /** CTA configuration; if omitted, the button row is hidden */
  cta?: {
    /** Button text (e.g., "Book a consultation") */
    label: string;
    /** Destination href (e.g., "#schedule" or "/book") */
    href: string;
    /** Button size (defaults to "md") */
    size?: "sm" | "md" | "lg";
    /** Button variant (defaults to "primary") */
    variant?: "primary" | "secondary" | "outline";
    /** Optional aria-label override */
    ariaLabel?: string;
  };

  /**
   * Optional analytics callback. Fired when the CTA is clicked.
   * You can forward this into your analytics layer (GA, Mixpanel, etc.).
   */
  onTrackCtaClick?: (payload: {
    event: "booking_hero_cta_click";
    label: string;
    href: string;
    title: string;
    timestamp: number;
  }) => void;

  /** Additional class names to augment the hero wrapper */
  className?: string;

  /**
   * If true, renders the CTA as a plain element (div) for situations where
   * you want to intercept clicks and push a modal without navigation.
   */
  disableHrefNavigation?: boolean;

  /**
   * Optional click handler for custom flows (e.g., open Scheduler modal).
   * If provided, it will run before navigation. Prevent default in the handler
   * if you need to fully override navigation.
   */
  onCtaClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}

const DEFAULT_MEDIA: ServiceHeroProps["media"] = undefined;

/**
 * Minimal helper to render the CTA using your shared Button atom,
 * while keeping ServiceHero’s layout & polish.
 */
function HeroCta(props: {
  title: string;
  cta: NonNullable<BookingHeroSectionProps["cta"]>;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  onTrack?: BookingHeroSectionProps["onTrackCtaClick"];
  disableHrefNavigation?: boolean;
}) {
  const { title, cta, onClick, onTrack, disableHrefNavigation } = props;
  const { href, label, variant = "primary", size = "md", ariaLabel } = cta;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    // Fire optional analytics
    onTrack?.({
      event: "booking_hero_cta_click",
      label,
      href,
      title,
      timestamp: Date.now(),
    });

    // Allow consumers to hook custom behavior
    onClick?.(e);

    // If navigation should be disabled (e.g., modal flow),
    // caller can either provide disableHrefNavigation or call e.preventDefault() in onClick.
    if (disableHrefNavigation) {
      e.preventDefault();
    }
  };

  // If navigation is disabled, render a <button>; else an anchor via Button's href prop.
  if (disableHrefNavigation) {
    return (
      <Button
        as="button"
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        className="service-hero-button"
        aria-label={ariaLabel ?? `${label} – ${title}`}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      href={href}
      onClick={handleClick}
      className="service-hero-button"
      aria-label={ariaLabel ?? `${label} – ${title}`}
    >
      {label}
    </Button>
  );
}

const BookingHeroSection: React.FC<BookingHeroSectionProps> = ({
  title,
  subtitle,
  media = DEFAULT_MEDIA,
  cta,
  onTrackCtaClick,
  className,
  onCtaClick,
  disableHrefNavigation = false,
}) => {
  return (
    <ServiceHero
      title={title}
      subtitle={subtitle}
      media={media}
      // We pass a minimal "button" to ServiceHero for spacing/layout consistency,
      // but render our own CTA to leverage the shared Button atom & analytics.
      button={undefined}
      className={clsx(className)}
    >
      {/* In case your ServiceHero supports children; if not, we rely on its CTA slot. */}
      {cta ? (
        <div className="service-hero-actions">
          <HeroCta
            title={title}
            cta={cta}
            onClick={onCtaClick}
            onTrack={onTrackCtaClick}
            disableHrefNavigation={disableHrefNavigation}
          />
        </div>
      ) : null}
    </ServiceHero>
  );
};

BookingHeroSection.displayName = "BookingHeroSection";

export default BookingHeroSection;
