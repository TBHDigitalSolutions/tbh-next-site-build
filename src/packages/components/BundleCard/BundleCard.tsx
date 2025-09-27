// src/packages/components/BundleCard/BundleCard.tsx
// src/packages/components/BundleCard/BundleCard.tsx
"use client";

import * as React from "react";
import styles from "./BundleCard.module.css";

import BundleCardFrame from "@/packages/components/BundleCardFrame";
import { PriceLabel, type Money } from "@/components/ui/molecules/PriceLabel";
import { ServiceChip, type ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import TagChips from "@/components/ui/molecules/TagChips";
import { FeatureList } from "@/components/ui/molecules/FeatureList";

// Atoms
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Centralized CTAs & routes
import { ROUTES, CTA_LABEL } from "@/packages/lib/cta";

export type BundleCardProps = {
  id?: string;

  /** Primary display title */
  name: string;

  /** Short value prop (1–2 sentences) */
  summary?: string;

  /** Services included in the bundle (service slugs or free labels) */
  services: (ServiceSlug | string)[];

  /** Optional highlight bullets (3–6 short points) */
  highlights?: string[];

  /** Canonical pricing for the bundle (Money is preferred) */
  price?: Money;
  /** Fallback label when no Money is provided */
  priceLabel?: string;

  /** Visual badges (e.g., “Best value”) */
  badge?: string;

  /** Optional tiny “Save X%” ribbon */
  savingsPct?: number;

  /** Routing: use `href` directly or `seoSlug` → `/packages/[slug]` */
  seoSlug?: string;
  href?: string;

  /** Taxonomy chips */
  tags?: string[];

  /** Actions (labels/links can be overridden per card) */
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };

  /** Presentation variants & class hook */
  variant?: "default" | "rail";
  className?: string;

  /** Testing hook */
  testId?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function BundleCard({
  id,
  name,
  summary,
  services,
  highlights,
  price,
  priceLabel,
  badge,
  savingsPct,
  seoSlug,
  href,
  tags,
  primaryCta,
  secondaryCta,
  variant = "default",
  className,
  testId,
}: BundleCardProps) {
  // Resolve canonical link + CTA defaults
  const linkHref = href ?? (seoSlug ? ROUTES.package(seoSlug) : "#");
  const primaryHref = primaryCta?.href ?? linkHref;
  const secondaryHref = secondaryCta?.href ?? ROUTES.book;

  const primaryLabel = primaryCta?.label ?? CTA_LABEL.VIEW_DETAILS;
  const secondaryLabel = secondaryCta?.label ?? CTA_LABEL.BOOK_A_CALL;

  // Top 3–5 highlight bullets
  const featureItems =
    (highlights ?? []).slice(0, 5).map((f, i) => ({ id: `h-${i}`, label: f }));

  return (
    <BundleCardFrame
      className={cx(styles.card, variant === "rail" && styles.cardRail, className)}
      padding="lg"
      height="stretch"
      hoverLift
      ariaLabel={`${name} bundle`}
      data-testid={testId}
    >
      <header className={styles.header}>
        <div className={styles.ribbonRow}>
          {badge ? <span className={styles.badge}>{badge}</span> : null}
          {typeof savingsPct === "number" && savingsPct > 0 ? (
            <span className={styles.savings}>Save {savingsPct}%</span>
          ) : null}
        </div>

        <h3 className={styles.title}>{name}</h3>
        {summary ? <p className={styles.summary}>{summary}</p> : null}

        <Divider />

        {services?.length ? (
          <div className={styles.services} aria-label="Included services">
            {services.map((svc, idx) => (
              <ServiceChip
                key={`${String(svc)}-${idx}`}
                service={String(svc)}
                size="sm"
                variant="subtle"
              />
            ))}
          </div>
        ) : null}
      </header>

      {featureItems.length > 0 && (
        <div className={styles.features}>
          <FeatureList items={featureItems} size="sm" />
        </div>
      )}

      <div className={styles.pricing}>
        <PriceLabel price={price} fallbackLabel={priceLabel ?? "Contact for pricing"} />
      </div>

      {tags?.length ? (
        <div className={styles.tags}>
          <TagChips tags={tags} />
        </div>
      ) : null}

      <Divider />

      <div className={styles.actions}>
        <Button
          href={primaryHref}
          variant="primary"
          ariaLabel={`${primaryLabel} — ${name}`}
        >
          {primaryLabel}
        </Button>

        <Button
          href={secondaryHref}
          variant="secondary"
          ariaLabel={`${secondaryLabel} — ${name}`}
        >
          {secondaryLabel}
        </Button>
      </div>
    </BundleCardFrame>
  );
}
