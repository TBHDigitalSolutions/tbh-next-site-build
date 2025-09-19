// src/components/ui/organisms/PortfolioDemo/PortfolioDemoClient.tsx

"use client";

import * as React from "react";
import PortfolioGallery from "@/portfolio/components/PortfolioDemo/Gallery/PortfolioGallery";
import DemoModal from "@/portfolio/components/PortfolioDemo/Modal/DemoModal";
import type { Project } from "@/portfolio/components/types";

interface PortfolioDemoClientProps {
  items: Project[];
  variant?: "hub" | "full";
  showTitles?: boolean;
  max?: number;
  onModalOpen?: (project: Project) => void;
  'aria-label'?: string;
} 

export default function PortfolioDemoClient({ 
  items, 
  variant = "full",
  showTitles = true,
  max,
  onModalOpen,
  'aria-label': ariaLabel
}: PortfolioDemoClientProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Limit items if max is specified (for hub page)
  const displayItems = max ? items.slice(0, max) : items;

  const handleOpen = (item: Project, index: number) => {
    setOpenIndex(index);
    onModalOpen?.(item);
  };

  const handleClose = () => setOpenIndex(null);

  const onPrev = openIndex !== null && openIndex > 0 ? () => setOpenIndex((i) => (i! - 1)) : undefined;
  const onNext =
    openIndex !== null && openIndex < displayItems.length - 1 ? () => setOpenIndex((i) => (i! + 1)) : undefined;

  const activeItem = openIndex !== null ? displayItems[openIndex] : null;

  return (
    <>
      <PortfolioGallery
        title={variant === "hub" ? undefined : "Interactive Site Demos"}
        subtitle={variant === "hub" ? undefined : "Click any card to open a live-feel static demo in a modal."}
        items={displayItems}
        columns={variant === "hub" ? 3 : 3}
        enableSearch={variant === "full"}
        enableFilters={variant === "full"}
        showResultsInfo={variant === "full"}
        showTitles={showTitles}
        onOpenItem={handleOpen}
        aria-label={ariaLabel}
      />

      {activeItem && (
        <DemoModal
          project={activeItem}
          isOpen={openIndex !== null}
          index={openIndex ?? undefined}
          total={displayItems.length}
          onClose={handleClose}
          onPrevious={onPrev}
          onNext={onNext}
        />
      )}
    </>
  );
}

// Named export for backward compatibility
export { PortfolioDemoClient };