"use client";

import * as React from "react";
import styles from "./PackagesCarousel.module.css";
import Carousel from "@/components/ui/molecules/Carousel";
import PackageCard from "@/packages/components/PackageCard";
import type { PackageGridItem } from "@/packages/components/PackageGrid/PackageGrid"; // mirrors grid items

export type PackagesCarouselProps = {
  title?: string;
  subtitle?: string;
  items: PackageGridItem[];
  /** Carousel sizing */
  itemMinWidth?: string;   // default "20rem"
  gap?: string;            // default "1rem"
  /** Controls & a11y */
  ariaLabel?: string;      // default "Packages"
  showCounter?: boolean;   // default true
  className?: string;
  id?: string;
};

export default function PackagesCarousel({
  title,
  subtitle,
  items,
  itemMinWidth = "20rem",
  gap = "1rem",
  ariaLabel = "Packages",
  showCounter = true,
  className,
  id,
}: PackagesCarouselProps) {
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
          {items.map((it) => (
            <PackageCard key={it.slug ?? it.name} {...it} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
