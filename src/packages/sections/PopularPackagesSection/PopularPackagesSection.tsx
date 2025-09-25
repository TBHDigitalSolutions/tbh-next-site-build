"use client";

import * as React from "react";
import styles from "./PopularPackagesSection.module.css";

import Carousel from "@/components/ui/molecules/Carousel";
import PackageCard, { type PackageCardProps } from "@/packages/components/PackageCard";

export type PopularPackagesSectionProps = {
  /** H3 heading shown above the rail */
  title?: string;                       // default: "Popular packages"
  /** Optional short lead-in under the heading */
  subtitle?: string;
  /** Curated list of packages (already filtered/ordered upstream) */
  items: PackageCardProps[];
  /** Carousel sizing tokens */
  itemMinWidth?: string;                // default: "20rem"
  gap?: string;                         // default: "1rem"
  /** A11y */
  ariaLabel?: string;                   // default: "Popular packages"
  showCounter?: boolean;                // default: true
  /** Styling hooks */
  className?: string;
  id?: string;
};

export default function PopularPackagesSection({
  title = "Popular packages",
  subtitle,
  items,
  itemMinWidth = "20rem",
  gap = "1rem",
  ariaLabel = "Popular packages",
  showCounter = true,
  className,
  id,
}: PopularPackagesSectionProps) {
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
          {items.map((pkg) => (
            <PackageCard
              key={pkg.slug ?? pkg.name ?? pkg.id ?? Math.random().toString(36)}
              {...pkg}
              // rail-friendly look if your card supports it
              variant={pkg.variant ?? "rail"}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
