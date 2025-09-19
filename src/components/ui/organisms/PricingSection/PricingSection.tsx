// ============================================================================
// FILE: src/components/ui/organisms/PricingSection/PricingSection.tsx
// PricingSection — Thin Orchestrator (Production-Ready)
// ----------------------------------------------------------------------------
// • Accepts raw service data + an adapter that maps into <PricingTiers /> props
// • Renders consistent section chrome (title/subtitle) and optional notes block
// • Aligns CSS class usage to PricingSection.module.css (.pricingSection, .pricingNotes)
// • Extra safety: adapter guards, stable memoization, a11y labels, data-testid hooks
// ============================================================================

// src/components/ui/organisms/PricingSection/PricingSection.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import Button from "@/components/ui/atoms/Button/Button";
import PricingTiers, {
  type PricingTiersProps,
} from "@/components/ui/organisms/PricingTiers/PricingTiers";
// ✅ Use the new Container (renders responsive widths, spacing, tone, etc.)
import Container from "@/components/sections/container/Container/Container";
import styles from "./PricingSection.module.css";

export type PricingSectionNotes = {
  disclaimer?: string;
  contact?: string;
  contactHref?: string;
};

export type PricingSectionProps<TData = unknown> = {
  title?: string;
  subtitle?: string;
  data: TData;
  mapToTiersProps: (data: TData) => PricingTiersProps;
  notes?: PricingSectionNotes;
  className?: string;
  id?: string;
};

const PricingSection = <TData,>({
  title = "Pricing",
  subtitle,
  data,
  mapToTiersProps,
  notes,
  className,
  id = "pricing",
}: PricingSectionProps<TData>) => {
  const tiersProps = React.useMemo<PricingTiersProps>(() => {
    if (typeof mapToTiersProps !== "function") {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[PricingSection] `mapToTiersProps` must be a function.");
      }
      return { tiers: [] } as PricingTiersProps;
    }
    try {
      const mapped = mapToTiersProps(data);
      if (!mapped || !Array.isArray(mapped.tiers) || mapped.tiers.length === 0) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[PricingSection] Adapter returned no tiers. Check mapping/data."
          );
        }
        return { tiers: [] } as PricingTiersProps;
      }
      return mapped;
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[PricingSection] adapter threw:", err);
      }
      return { tiers: [] } as PricingTiersProps;
    }
  }, [data, mapToTiersProps]);

  if (!tiersProps.tiers || tiersProps.tiers.length === 0) return null;

  return (
    <Container
      as="section"
      id={id}
      aria-labelledby={`${id}-title`}
      // Keep your section styling; Container will add its own container classes too
      className={clsx(styles.pricingSection, className)}
      // sensible defaults; tweak if you want a different feel
      size="normal"
      spacing="md"
      tone="transparent"
      padded
      data-testid="pricing-section"
    >
      {(title || subtitle) && (
        <header>
          {title && (
            <h2 id={`${id}-title`} data-testid="pricing-title">
              {title}
            </h2>
          )}
          {subtitle && (
            <p aria-describedby={`${id}-title`} data-testid="pricing-subtitle">
              {subtitle}
            </p>
          )}
        </header>
      )}

      <PricingTiers {...tiersProps} />

      {notes && (notes.disclaimer || notes.contact) && (
        <div
          className={styles.pricingNotes}
          role="note"
          aria-label="Pricing notes"
          data-testid="pricing-notes"
        >
          {notes.disclaimer && <p>{notes.disclaimer}</p>}
          {notes.contact && (
            <p>
              {notes.contact}{" "}
              <Button
                href={notes.contactHref ?? "/contact"}
                variant="primary"
                size="sm"
              >
                Book a Call
              </Button>
            </p>
          )}
        </div>
      )}
    </Container>
  );
};

export default PricingSection;
export { PricingSection };
