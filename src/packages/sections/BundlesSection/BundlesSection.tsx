"use client";

import * as React from "react";
import styles from "./BundlesSection.module.css";

import Carousel from "@/components/ui/molecules/Carousel";
import BundleCard, { type BundleCardProps } from "@/packages/components/BundleCard";

export type BundlesSectionProps = {
  /** H3 heading shown above the rail */
  title?: string;                       // default: "Solution bundles"
  /** Optional short lead-in under the heading */
  subtitle?: string;
  /** Curated list of bundles (already filtered/ordered upstream) */
  items: BundleCardProps[];
  /** Carousel sizing tokens */
  itemMinWidth?: string;                // default: "22rem"
  gap?: string;                         // default: "1rem"
  /** A11y */
  ariaLabel?: string;                   // default: "Solution bundles"
  showCounter?: boolean;                // default: true
  /** Styling hooks */
  className?: string;
  id?: string;
};

export default function BundlesSection({
  title = "Solution bundles",
  subtitle,
  items,
  itemMinWidth = "22rem",
  gap = "1rem",
  ariaLabel = "Solution bundles",
  showCounter = true,
  className,
  id,
}: BundlesSectionProps) {
  if (!items?.length) return null;

  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")} id={id}>
      {(title || subtitle) && (
        <header className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
      )}

      <div className={styles.carouselWrap}>
        <Carousel
          ariaLabel={ariaLabel}
          controls="inside"
          controlsVariant="floating"
          itemMinWidth={itemMinWidth}
          gap={gap}
          snap="mandatory"
          showCounter={showCounter}
        >
          {items.map((bundle) => (
            <BundleCard
              key={bundle.seoSlug ?? bundle.id ?? bundle.name ?? Math.random().toString(36)}
              {...bundle}
              // If your BundleCard supports a compact/rail variant, pass it:
              variant={(bundle as any).variant ?? "rail"}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
