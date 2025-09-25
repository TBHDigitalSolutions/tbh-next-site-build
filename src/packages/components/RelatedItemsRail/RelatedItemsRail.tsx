"use client";

import * as React from "react";
import styles from "./RelatedItemsRail.module.css";
import Carousel from "@/components/ui/molecules/Carousel";

import PackageCard, { type PackageCardProps } from "@/packages/components/PackageCard";
import BundleCard,  { type BundleCardProps }  from "@/packages/components/BundleCard";

type RailItem =
  | ({ kind: "package" } & PackageCardProps)
  | ({ kind: "bundle" }  & BundleCardProps);

export type RelatedItemsRailProps = {
  title?: string;                 // default: "Related"
  subtitle?: string;
  items: RailItem[];
  itemMinWidth?: string;          // default: "20rem" (bundle adjusts automatically)
  gap?: string;                    // default: "1rem"
  ariaLabel?: string;             // default: "Related items"
  showCounter?: boolean;          // default: true
  className?: string;
  id?: string;
};

export default function RelatedItemsRail({
  title = "Related",
  subtitle,
  items,
  itemMinWidth = "20rem",
  gap = "1rem",
  ariaLabel = "Related items",
  showCounter = true,
  className,
  id,
}: RelatedItemsRailProps) {
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
          {items.map((it, idx) => {
            if (it.kind === "bundle") {
              return (
                <BundleCard
                  key={(it as any).seoSlug ?? (it as any).name ?? idx}
                  {...it}
                  variant={(it as any).variant ?? "rail"}
                />
              );
            }
            return (
              <PackageCard
                key={(it as any).slug ?? (it as any).name ?? idx}
                {...it}
                variant={(it as any).variant ?? "rail"}
              />
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
