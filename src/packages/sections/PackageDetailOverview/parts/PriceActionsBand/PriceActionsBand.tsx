// src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/PriceActionsBand.tsx
import * as React from "react";
import styles from "./PriceActionsBand.module.css";

// NOTE: adjust these imports if your project prefers named/default exports.
// In most of your parts, default exports are used.
import PriceTeaser from "../PriceTeaser/PriceTeaser";
import CTARow from "../CTARow/CTARow";
import Divider from "@/components/ui/atoms/Divider/Divider";

type Money = { monthly?: number; oneTime?: number; currency?: string };

export type PriceActionsBandVariant =
  | "detail-hybrid"   // Variant 1 (detail page, monthly + setup)
  | "card-hybrid"     // Variant 2 (card, monthly + setup)  — wiring later
  | "detail-oneTime"  // Variant 3 (detail page, one-time)
  | "card-oneTime";   // Variant 4 (card, one-time)         — wiring later

export type PriceActionsBandProps = {
  variant: PriceActionsBandVariant;
  price?: Money;
  tagline?: string;                 // used on detail variants
  baseNote?: "proposal" | "final";  // “Base price — request proposal|final after scope”
  finePrint?: string;               // e.g., "3-month minimum • + ad spend"
  ctaPrimary?: { label: string; href: string; onClick?: () => void };
  ctaSecondary?: { label: string; href: string; onClick?: () => void };
  showDivider?: boolean;            // default true on detail variants
  align?: "start" | "center";       // default center on detail, start on card
  className?: string;
  style?: React.CSSProperties;
  // Optional extra aria label for the whole band
  ariaLabel?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isHybrid(p?: Money) {
  return Boolean(p?.monthly && p?.oneTime);
}

function isOneTime(p?: Money) {
  return Boolean(p?.oneTime && !p?.monthly);
}

function formatCurrency(n: number | undefined, currency = "USD") {
  if (typeof n !== "number") return "";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

function baseNoteText(kind?: "proposal" | "final") {
  if (kind === "final") return "Base price — final after scope";
  return "Base price — request proposal";
}

function composeMetaLine(kind?: "proposal" | "final", fine?: string) {
  const base = baseNoteText(kind);
  if (fine && fine.trim()) return `${base}${fine.startsWith("•") || fine.startsWith("·") ? " " : " • "}${fine}`;
  return base;
}

/**
 * PriceActionsBand
 * Composes: (optional) tagline → PriceTeaser (band/inline) → meta fine-print → (optional) Divider → CTARow
 * Variants:
 *  - detail-hybrid   (Variant 1)
 *  - card-hybrid     (Variant 2)   // API-ready, wire in PackageCard later if desired
 *  - detail-oneTime  (Variant 3)
 *  - card-oneTime    (Variant 4)   // API-ready, wire in PackageCard later if desired
 */
export default function PriceActionsBand({
  variant,
  price,
  tagline,
  baseNote = isHybrid(price) ? "proposal" : "final",
  finePrint,
  ctaPrimary,
  ctaSecondary,
  showDivider,
  align,
  className,
  style,
  ariaLabel,
}: PriceActionsBandProps) {
  const isDetail = variant.startsWith("detail");
  const hybrid = isHybrid(price);
  const oneTimeOnly = isOneTime(price);
  const currency = price?.currency ?? "USD";

  // Defaults by surface
  const alignClass =
    align ??
    (isDetail ? "center" : "start");

  const shouldShowDivider =
    typeof showDivider === "boolean" ? showDivider : isDetail;

  const metaLine = composeMetaLine(baseNote, finePrint);

  return (
    <section
      className={cx(styles.wrap, styles.band, styles[`align-${alignClass}`], className)}
      style={style}
      aria-label={ariaLabel ?? "Pricing and actions"}
      data-component="PriceActionsBand"
      data-price-shape={hybrid ? "hybrid" : oneTimeOnly ? "one-time" : "monthly"}
    >
      {/* Tagline (detail variants) */}
      {isDetail && !!tagline && (
        <p className={styles.tagline}>{tagline}</p>
      )}

      {/* Pricing */}
      {variant === "detail-hybrid" && (
        <div className={styles.priceArea}>
          {/* Keep PriceTeaser in charge of numbers/stacking (band style) */}
          <PriceTeaser
            price={price}
            align={alignClass}      // compatible with your existing teaser align prop
            emphasis                // subtle emphasis tint if your component supports it
            ariaLabel="Starting price"
          />
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.meta}>{metaLine}</p>

          {/* SR-only compliance sentence to ensure accessibility even when label is a badge */}
          <span className={styles.srOnly}>
            {hybrid
              ? `Starting at ${formatCurrency(price?.monthly, currency)} per month plus ${formatCurrency(price?.oneTime, currency)} setup. ${baseNoteText(baseNote)}.`
              : `Starting at ${formatCurrency(price?.monthly ?? price?.oneTime, currency)}. ${baseNoteText(baseNote)}.`}
          </span>
        </div>
      )}

      {variant === "detail-oneTime" && (
        <div className={cx(styles.priceArea, styles.inline)}>
          <div className={styles.inlineHeader}>
            <span className={styles.label}>Starting at:</span>
            <span className={styles.amount}>{formatCurrency(price?.oneTime, currency)}</span>
          </div>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.meta}>{metaLine}</p>
          <span className={styles.srOnly}>
            {`Starting at ${formatCurrency(price?.oneTime, currency)}. ${baseNoteText(baseNote)}.`}
          </span>
        </div>
      )}

      {/* Card variants — API ready (kept minimal, wire into PackageCard later if desired) */}
      {variant === "card-hybrid" && (
        <div className={cx(styles.priceArea, styles.cardInline)}>
          <span className={styles.badge}>Starting at</span>
          <span className={styles.cardLine}>
            {formatCurrency(price?.monthly, currency)} / mo
            {price?.oneTime ? ` + ${formatCurrency(price?.oneTime, currency)} setup` : ""}
          </span>
          <p className={styles.meta}>{metaLine}</p>
          <span className={styles.srOnly}>
            {`Starting at ${formatCurrency(price?.monthly, currency)} per month${price?.oneTime ? ` plus ${formatCurrency(price?.oneTime, currency)} setup` : ""}. ${baseNoteText(baseNote)}.`}
          </span>
        </div>
      )}

      {variant === "card-oneTime" && (
        <div className={cx(styles.priceArea, styles.cardInline)}>
          <span className={styles.badge}>Starting at</span>
          <span className={styles.amount}>{formatCurrency(price?.oneTime, currency)}</span>
          <p className={styles.meta}>{metaLine}</p>
          <span className={styles.srOnly}>
            {`Starting at ${formatCurrency(price?.oneTime, currency)}. ${baseNoteText(baseNote)}.`}
          </span>
        </div>
      )}

      {/* Divider (detail variants only, by default) */}
      {shouldShowDivider && (
        <div className={styles.dividerWrap}>
          <Divider />
        </div>
      )}

      {/* CTAs */}
      <div className={styles.actions}>
        <CTARow
          primaryCta={ctaPrimary}
          secondaryCta={ctaSecondary}
          align={alignClass}
        />
      </div>
    </section>
  );
}
