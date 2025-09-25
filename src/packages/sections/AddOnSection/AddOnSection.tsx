import * as React from "react";
import styles from "./AddOnSection.module.css";

import AddOnCarousel from "@/packages/components/AddOnCarousel";
import AddOnsGrid, {
  type AddOnCardItem,
  type AddOn,
} from "@/packages/components/AddOnsGrid/AddOnsGrid";

export type AddOnSectionProps = {
  title?: string;
  subtitle?: string;
  /** Prefer `items`; or pass `addOns` and we’ll adapt (grid) */
  items?: AddOnCardItem[];
  addOns?: AddOn[];
  /** Layout selection */
  layout?: "carousel" | "grid"; // default "carousel"
  /** Grid options */
  gridMinCardWidthPx?: number;  // default 260
  showSearch?: boolean;         // default true
  showCategoryFilter?: boolean; // default true
  /** Carousel options */
  itemMinWidth?: string;        // default "18rem"
  gap?: string;                  // default "0.875rem"
  /** Root passthrough */
  className?: string;
  id?: string;
};

export default function AddOnSection({
  title = "Add-On Services",
  subtitle,
  items,
  addOns,
  layout = "carousel",
  gridMinCardWidthPx = 260,
  showSearch = true,
  showCategoryFilter = true,
  itemMinWidth = "18rem",
  gap = "0.875rem",
  className,
  id,
}: AddOnSectionProps) {
  const hasData = (items && items.length) || (addOns && addOns.length);
  if (!hasData) return null;

  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")} id={id}>
      {layout === "grid" ? (
        <AddOnsGrid
          id={`${id ?? "addons"}-grid`}
          addOns={addOns}
          items={items}
          minCardWidthPx={gridMinCardWidthPx}
          showSearch={showSearch}
          showCategoryFilter={showCategoryFilter}
        />
      ) : (
        <AddOnCarousel
          id={`${id ?? "addons"}-carousel`}
          title={title}
          subtitle={subtitle}
          items={items}
          addOns={addOns}
          itemMinWidth={itemMinWidth}
          gap={gap}
          ariaLabel="Add-on services"
        />
      )}
    </section>
  );
}
