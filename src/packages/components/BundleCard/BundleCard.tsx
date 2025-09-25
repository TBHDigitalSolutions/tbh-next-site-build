"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./BundleCard.module.css";

import BundleCardFrame from "@/packages/components/BundleCardFrame"; // ⬅️ swap-in
import PriceLabel, { type Money } from "@/components/ui/molecules/PriceLabel";
import ServiceChip, { type ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import TagChips from "@/components/ui/molecules/TagChips";
import { FeatureList } from "@/components/ui/molecules/FeatureList";

export type BundleCardProps = {
  id?: string;
  name: string;
  summary?: string;
  /** Services included in the bundle (service slugs or free labels) */
  services: (ServiceSlug | string)[];
  /** Optional highlight bullets (3–6 short points) */
  highlights?: string[];

  /** Pricing for the bundle */
  price?: Money;
  priceLabel?: string; // fallback label if no Money provided

  /** Visual badges (e.g., “Best value”) */
  badge?: string;
  /** Optional tiny “Save X%” ribbon */
  savingsPct?: number;

  /** Routing */
  seoSlug?: string;
  href?: string;

  /** Taxonomy */
  tags?: string[];

  /** Actions */
  primaryCta?: { label: string; href?: string };
  secondaryCta?: { label: string; href?: string };

  /** Presentation */
  variant?: "default" | "rail";
  className?: string;
};

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
}: BundleCardProps) {
  const linkHref = href ?? (seoSlug ? `/packages/${seoSlug}` : "#");
  const featureItems =
    (highlights ?? []).slice(0, 5).map((f, i) => ({ id: `h-${i}`, label: f }));

  return (
    <BundleCardFrame
      className={[styles.card, variant === "rail" ? styles.cardRail : "", className].filter(Boolean).join(" ")}
      padding="lg"
      height="stretch"
      hoverLift
      ariaLabel={`${name} bundle`}
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

        {services?.length ? (
          <div className={styles.services} aria-label="Included services">
            {services.map((svc, idx) => (
              <ServiceChip key={`${String(svc)}-${idx}`} service={String(svc)} size="sm" variant="subtle" />
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

      <div className={styles.actions}>
        <Link className={[styles.btn, styles.btnPrimary].join(" ")} href={primaryCta?.href ?? linkHref}>
          {primaryCta?.label ?? "View details"}
        </Link>
        {secondaryCta?.href ? (
          <Link className={[styles.btn, styles.btnSecondary].join(" ")} href={secondaryCta.href}>
            {secondaryCta.label}
          </Link>
        ) : null}
      </div>
    </BundleCardFrame>
  );
}
