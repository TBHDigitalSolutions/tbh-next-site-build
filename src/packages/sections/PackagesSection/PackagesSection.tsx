import * as React from "react";
import styles from "./PackagesSection.module.css";

import PackagesCarousel from "@/packages/components/PackagesCarousel";
import PackageGrid, { type PackageGridItem } from "@/packages/components/PackageGrid/PackageGrid";

export type PackagesSectionProps = {
  title?: string;
  subtitle?: string;
  items: PackageGridItem[];
  /** Layout selection */
  layout?: "carousel" | "grid"; // default "carousel"
  /** Grid options (when layout="grid") */
  gridMinCardWidthPx?: number;  // default 280
  showSearch?: boolean;         // default true
  showSort?: boolean;           // default true
  featuredSlugs?: string[];
  jsonLd?: boolean;
  /** Carousel options (when layout="carousel") */
  itemMinWidth?: string;        // default "20rem"
  gap?: string;                  // default "1rem"
  /** Root passthrough */
  className?: string;
  id?: string;
};

export default function PackagesSection({
  title = "Packages",
  subtitle,
  items,
  layout = "carousel",
  gridMinCardWidthPx = 280,
  showSearch = true,
  showSort = true,
  featuredSlugs,
  jsonLd,
  itemMinWidth = "20rem",
  gap = "1rem",
  className,
  id,
}: PackagesSectionProps) {
  if (!items?.length) return null;

  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")} id={id}>
      {layout === "grid" ? (
        <PackageGrid
          id={`${id ?? "packages"}-grid`}
          className={styles.grid}
          items={items}
          minCardWidthPx={gridMinCardWidthPx}
          showSearch={showSearch}
          showSort={showSort}
          featuredSlugs={featuredSlugs}
          jsonLd={!!jsonLd}
        />
      ) : (
        <PackagesCarousel
          id={`${id ?? "packages"}-carousel`}
          title={title}
          subtitle={subtitle}
          items={items}
          itemMinWidth={itemMinWidth}
          gap={gap}
          ariaLabel="Packages"
        />
      )}
    </section>
  );
}
