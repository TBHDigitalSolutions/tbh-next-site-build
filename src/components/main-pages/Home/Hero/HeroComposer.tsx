// src/components/features/home/Hero/HeroComposer.tsx
"use client";

import React, { useMemo, useCallback } from "react";
import type { AnyHeroData, CTA, VideoHeroData, SplitHeroData, InteractiveHeroData, MinimalHeroData } from "./Hero.types";
// ⚠ Ensure this import matches the actual export in the wrapper file
import HeroSectionWrapper from "./HeroSectionWrapper"; // if default export
// import { HeroSectionWrapper } from "./HeroSectionWrapper"; // if named export
import { VideoHero } from "./VideoHero";
import { SplitScreenHero } from "./SplitScreenHero";
import { InteractiveHero } from "./InteractiveHero";
import { MinimalHero } from "./MinimalHero";

export interface HeroComposerProps {
  data: AnyHeroData;
  className?: string;
  onCTAClick?: (cta: CTA, variant: "primary" | "secondary", heroVariant: string) => void;
  enableAnalytics?: boolean;
  trackEvent?: (event: string, properties: Record<string, any>) => void;
}

export default function HeroComposer({
  data,
  className,
  onCTAClick,
  enableAnalytics = true,
  trackEvent,
}: HeroComposerProps) {
  const wrapperConfig = useMemo(
    () => ({
      align: data.align ?? "center",
      height: data.height ?? "hero-min-height",
      backgroundImage: data.backgroundImage,
      overlay: data.overlay ?? true,
      overlayOpacity: data.overlayOpacity,             // now typed on BaseHeroData
      backgroundVariant: data.backgroundVariant ?? "gradient",
      contentWidth: data.contentWidth ?? "normal",
      spacing: data.spacing ?? "normal",
      className,
    }),
    [
      data.align,
      data.height,
      data.backgroundImage,
      data.overlay,
      data.overlayOpacity,
      data.backgroundVariant,
      data.contentWidth,
      data.spacing,
      className,
    ]
  );

  const trackHeroEvent = useCallback(
    (event: string, properties: Record<string, any> = {}) => {
      if (!enableAnalytics) return;
      const eventData = {
        heroVariant: data.variant,
        heroTitle: data.title,
        ...properties,
        ...(data.analyticsId && { analyticsId: data.analyticsId }),
        ...(data.abTestVariant && { abTestVariant: data.abTestVariant }),
      };
      if (trackEvent) trackEvent(event, eventData);
      else if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(`[Hero Analytics] ${event}:`, eventData);
      }
    },
    [enableAnalytics, data.variant, data.title, data.analyticsId, data.abTestVariant, trackEvent]
  );

  const enhancedPrimaryCTA = useMemo(() => {
    if (!data.primaryCTA) return undefined;
    const base = data.primaryCTA;
    return {
      ...base,
      onClick: (e?: React.MouseEvent) => {
        trackHeroEvent("hero_cta_click", {
          ctaVariant: "primary",
          ctaText: base.text,
          ctaHref: base.href,
        });
        onCTAClick?.(base, "primary", data.variant);
        base.onClick?.(e); // forward event to original handler
      },
    };
  }, [data.primaryCTA, trackHeroEvent, onCTAClick, data.variant]);

  const enhancedSecondaryCTA = useMemo(() => {
    if (!data.secondaryCTA) return undefined;
    const base = data.secondaryCTA;
    return {
      ...base,
      onClick: (e?: React.MouseEvent) => {
        trackHeroEvent("hero_cta_click", {
          ctaVariant: "secondary",
          ctaText: base.text,
          ctaHref: base.href,
        });
        onCTAClick?.(base, "secondary", data.variant);
        base.onClick?.(e); // forward event
      },
    };
  }, [data.secondaryCTA, trackHeroEvent, onCTAClick, data.variant]);

  React.useEffect(() => {
    trackHeroEvent("hero_impression");
  }, [trackHeroEvent]);

  const commonVariantProps = useMemo(
    () => ({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      primaryCTA: enhancedPrimaryCTA,
      secondaryCTA: enhancedSecondaryCTA,
    }),
    [data.title, data.subtitle, data.description, enhancedPrimaryCTA, enhancedSecondaryCTA]
  );

  const renderHeroVariant = (): React.ReactNode => {
    try {
      switch (data.variant) {
        case "video": {
          const v = data as VideoHeroData;
          return (
            <VideoHero
              {...commonVariantProps}
              videoSrc={v.videoSrc}                // fixed
              posterImage={v.posterImage}
              fallbackImage={v.fallbackImage ?? v.backgroundImage}
              textPosition={v.textPosition}
              enablePlayPause={v.enablePlayPause}
              enableVolumeControl={v.enableVolumeControl}
              overlayOpacity={v.overlayOpacity}    // still allowed if VideoHero uses its own
              overlayColor={v.overlayColor}
              height={v.height}
              contentWidth={v.contentWidth}
              videoAutoplay={v.videoAutoplay}
              videoMuted={v.videoMuted}
              videoLoop={v.videoLoop}
            />
          );
        }

        case "split": {
          const v = data as SplitHeroData;
          return (
            <SplitScreenHero
              {...commonVariantProps}
              contentSide={v.contentSide}
              splitRatio={v.splitRatio}
              mobileLayout={v.mobileLayout}
              leftContent={v.leftContent}
              rightContent={v.rightContent}
            />
          );
        }

        case "interactive": {
          const v = data as InteractiveHeroData;
          return (
            <InteractiveHero
              {...commonVariantProps}
              backgroundImage={v.backgroundImage}
              backgroundVideo={v.backgroundVideo}
              trustBadges={v.trustBadges}
              interactiveElements={v.interactiveElements}
              enableParticles={v.enableParticles}
              enableTypingEffect={v.enableTypingEffect}
              typingText={v.typingText}
              particleConfig={v.particleConfig}
              height={v.height}
            />
          );
        }

        case "minimal": {
          const v = data as MinimalHeroData;
          return (
            <MinimalHero
              {...commonVariantProps}
              backgroundImage={v.backgroundImage}
              layout={v.layout}
              showScrollIndicator={v.showScrollIndicator}
              breadcrumbs={v.breadcrumbs}
            />
          );
        }

        default: {
          // @ts-expect-error exhaustive check
          const unknownVariant = (data as any).variant;
          console.warn(`[HeroComposer] Unknown hero variant: ${unknownVariant}. Falling back to minimal hero.`);
          trackHeroEvent("hero_variant_fallback", { attemptedVariant: unknownVariant });
          return <MinimalHero {...commonVariantProps} backgroundImage={data.backgroundImage} />;
        }
      }
    } catch (error) {
      console.error(`[HeroComposer] Error rendering "${data.variant}":`, error);
      trackHeroEvent("hero_render_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        variant: data.variant,
      });
      return <MinimalHero {...commonVariantProps} backgroundImage={data.backgroundImage} />;
    }
  };

  return <HeroSectionWrapper {...wrapperConfig}>{renderHeroVariant()}</HeroSectionWrapper>;
}

/* Factory helpers stay as-is, but now align to the corrected types */
export const createVideoHeroData = (data: Omit<VideoHeroData, "variant">): VideoHeroData => ({ variant: "video", ...data });
export const createSplitHeroData = (data: Omit<SplitHeroData, "variant">): SplitHeroData => ({ variant: "split", ...data });
export const createInteractiveHeroData = (data: Omit<InteractiveHeroData, "variant">): InteractiveHeroData => ({ variant: "interactive", ...data });
export const createMinimalHeroData = (data: Omit<MinimalHeroData, "variant">): MinimalHeroData => ({ variant: "minimal", ...data });

export const HeroComposerDevTools = {
  validateHeroData: (d: AnyHeroData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!d.title) errors.push("Title is required");
    if (!d.variant) errors.push("Variant is required");
    switch (d.variant) {
      case "video":
        if (!(d as VideoHeroData).videoSrc) errors.push("Video variant requires videoSrc");
        break;
      case "split":
        if (!(d as SplitHeroData).leftContent && !(d as SplitHeroData).rightContent) {
          errors.push("Split variant requires at least leftContent or rightContent");
        }
        break;
    }
    return { isValid: errors.length === 0, errors };
  },
  getRecommendedVariant: (serviceType: string): HeroVariant => {
    const map: Record<string, HeroVariant> = {
      "content-production": "split",
      "lead-generation": "interactive",
      "marketing-automation": "minimal",
      "seo-services": "video",
      "video-production": "video",
      "web-development": "split",
    };
    return map[serviceType] ?? "minimal";
  },
};
