"use client";

import * as React from "react";
import styles from "./AddOnCarousel.module.css";
import Carousel from "@/components/ui/molecules/Carousel";
import AddOnCard from "@/packages/components/AddOnCard";
import type { AddOnCardItem, AddOn, adaptAddOnToCardItem } from "@/packages/components/AddOnsGrid/AddOnsGrid";

// Because `adaptAddOnToCardItem` is exported from AddOnsGrid, we can import it directly if desired.
// If not, consumers can pre-adapt and pass `items`.

export type AddOnCarouselProps = {
  title?: string;
  subtitle?: string;
  /** Prefer passing `items` already adapted; or pass `addOns` and we’ll adapt. */
  items?: AddOnCardItem[];
  addOns?: AddOn[];
  /** Carousel sizing */
  itemMinWidth?: string; // default "18rem"
  gap?: string;          // default "0.875rem"
  /** Controls & a11y */
  ariaLabel?: string;    // default "Add-on services"
  showCounter?: boolean; // default true
  className?: string;
  id?: string;
};

export default function AddOnCarousel({
  title,
  subtitle,
  items,
  addOns,
  itemMinWidth = "18rem",
  gap = "0.875rem",
  ariaLabel = "Add-on services",
  showCounter = true,
  className,
  id,
}: AddOnCarouselProps) {
  const data: AddOnCardItem[] = React.useMemo(() => {
    if (items?.length) return items;
    if (addOns?.length) {
      // Dynamic import avoids circular if your bundler flags it; inline map if not importing helper:
      const adapt = (a: AddOn): AddOnCardItem => ({
        id: a.slug,
        title: a.name,
        description: a.description,
        priceLabel: a.price
          ? (a.price.monthly
              ? `$${a.price.monthly.toLocaleString()}/mo`
              : a.price.oneTime
                ? `$${a.price.oneTime.toLocaleString()} one-time`
                : "Contact for pricing")
          : "Contact for pricing",
        badge: a.popular ? "Popular" : undefined,
        href: undefined,
        category: a.category,
        popular: a.popular,
      });
      return addOns.map(adapt);
    }
    return [];
  }, [items, addOns]);

  if (!data.length) return null;

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
          {data.map((it) => (
            <AddOnCard
              key={it.id}
              id={it.id}
              title={it.title}
              description={it.description}
              bullets={it.bullets}
              priceLabel={it.priceLabel}
              badge={it.badge}
              href={it.href}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
