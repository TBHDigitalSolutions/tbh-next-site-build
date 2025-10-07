// src/packages/components/AddOnCarousel/AddOnCarousel.tsx
"use client";

/**
 * AddOnCarousel — horizontally scrollable row of add-on cards.
 * Accepts either pre-adapted `items` (preferred) or raw `addOns` which are
 * adapted via AddOnsGrid.adaptAddOnToCardItem. If neither is provided,
 * this component will fall back to mock data from `src/mock`.
 *
 * Pricing:
 *  - Passes canonical `price?: Money` and/or `priceLabel` to AddOnCard.
 *  - No formatting performed here.
 */

import * as React from "react";
import styles from "./AddOnCarousel.module.css";
import Carousel from "@/components/ui/molecules/Carousel";
import AddOnCard from "@/packages/components/AddOnCard";

// Reuse types + adapter from AddOnsGrid to avoid drift
import type {
  AddOnCardItem,
  AddOn,
} from "@/packages/components/AddOnsGrid/AddOnsGrid";
import { adaptAddOnToCardItem } from "@/packages/components/AddOnsGrid/AddOnsGrid";

// Mock data fallbacks
import { asAddOnCardItems, asAddOns } from "@/mock";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type AddOnCarouselProps = {
  title?: string;
  subtitle?: string;

  /** Prefer passing `items` already adapted; or pass `addOns` and we’ll adapt. */
  items?: AddOnCardItem[];
  addOns?: AddOn[];

  /** Carousel sizing */
  itemMinWidth?: string; // default "18rem"
  gap?: string; // default "0.875rem"

  /** Controls & a11y */
  ariaLabel?: string; // default "Add-on services"
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
    // 1) Caller-provided, already adapted
    if (items?.length) return items;

    // 2) Caller-provided domain objects; adapt to card items
    if (addOns?.length) return addOns.map(adaptAddOnToCardItem);

    // 3) Mock data fallbacks (first try fully-adapted, then raw addOns)
    const mockItems = typeof asAddOnCardItems === "function" ? asAddOnCardItems() : [];
    if (mockItems.length) return mockItems;

    const mockAddOns = typeof asAddOns === "function" ? asAddOns() : [];
    if (mockAddOns.length) return mockAddOns.map(adaptAddOnToCardItem);

    // 4) Nothing to render
    return [];
  }, [items, addOns]);

  if (!data.length) return null;

  return (
    <section className={cx(styles.section, className)} id={id}>
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
              name={it.title}
              description={it.description}
              bullets={it.bullets}
              price={it.price}
              priceLabel={it.priceLabel}
              badge={it.badge ?? (it.popular ? "Popular" : undefined)}
              href={it.href}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
