// src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/PriceActionsBand.tsx
// src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/PriceActionsBand.tsx
"use client";

import * as React from "react";
import cls from "./PriceActionsBand.module.css";

// NOTE: adjust these imports only if your repo uses different default/named exports.
import PriceTeaser from "../PriceTeaser/PriceTeaser";
import CTARow from "../CTARow/CTARow";
import Divider from "@/components/ui/atoms/Divider/Divider";

/** Canonical money shape used across cards/details */
export type Money = { monthly?: number; oneTime?: number; currency?: string };

export type BandVariant =
  | "detail-hybrid"   // Variant 1 — detail page, monthly + setup
  | "card-hybrid"     // Variant 2 — card, monthly + setup
  | "detail-oneTime"  // Variant 3 — detail page, one-time
  | "card-oneTime";   // Variant 4 — card, one-time

export type Align = "start" | "center";
type Cta = { label: string; href: string; onClick?: () => void };

export type PriceActionsBandProps = {
  variant: BandVariant;
  price?: Money;

  /** Marketing tagline (detail variants only). If omitted, row is hidden. */
  tagline?: string;

  /** Base-note microcopy selector: "proposal" → “Base price — request proposal”, "final" → “… final after scope” */
  baseNote?: "proposal" | "final";

  /** Additional fine print such as “3-month minimum • + ad spend” (detail variants only). */
  finePrint?: string;

  /** Optional CTAs; if omitted the actions row is hidden. */
  ctaPrimary?: Cta;
  ctaSecondary?: Cta;

  /** Optional overrides */
  align?: Align;                // default: center on detail, start on card
  showDivider?: boolean;        // default: true on detail, false on card
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;           // label for the whole section
};

/* ----------------------------- helpers ----------------------------- */

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const isHybrid = (p?: Money) =>
  !!(p && typeof p.monthly === "number" && typeof p.oneTime === "number");

const isOneTimeOnly = (p?: Money) =>
  !!(p && typeof p.oneTime === "number" && !p.monthly);

function fmt(n?: number, currency = "USD") {
  if (typeof n !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

const baseNoteToText = (kind?: "proposal" | "final") =>
  kind === "final" ? "Base price — final after scope" : "Base price — request proposal";

/* ----------------------------- PRESETS ----------------------------- */
/** Presentational decisions per variant (no data coupling). */
type Preset = {
  badge: "above" | "left";
  teaserMode: "band" | "inline";     // passed to <PriceTeaser mode=…>
  showBaseNote: boolean;
  showFinePrint: boolean;
  showDivider: boolean;
  align: Align;
  useChipsOnCards?: boolean;         // force chip appearance for hybrids in card variants
};

const PRESET: Record<BandVariant, Preset> = {
  "detail-hybrid":  { badge: "above", teaserMode: "band",   showBaseNote: true,  showFinePrint: true,  showDivider: true,  align: "center" },
  "detail-oneTime": { badge: "above", teaserMode: "inline", showBaseNote: true,  showFinePrint: true,  showDivider: true,  align: "center" },
  "card-hybrid":    { badge: "left",  teaserMode: "inline", showBaseNote: false, showFinePrint: false, showDivider: false, align: "start", useChipsOnCards: true },
  "card-oneTime":   { badge: "left",  teaserMode: "inline", showBaseNote: false, showFinePrint: false, showDivider: false, align: "start" },
};

/* --------------------------- component ----------------------------- */

const PriceActionsBand: React.FC<PriceActionsBandProps> = ({
  variant,
  price,
  tagline,
  // NOTE: we'll compute the effective base note inside the component to handle monthly-only correctly
  baseNote,
  finePrint,
  ctaPrimary,
  ctaSecondary,
  align,
  showDivider,
  className,
  style,
  ariaLabel,
}) => {
  const p = PRESET[variant];
  const isDetail = variant.startsWith("detail");
  const currency = price?.currency ?? "USD";

  // ---- Tweak #1: default baseNote (hybrid → proposal, monthly-only → proposal, one-time → final)
  const effectiveBaseNote: "proposal" | "final" =
    baseNote ?? (isOneTimeOnly(price) ? "final" : "proposal");

  const finalAlign: Align = align ?? p.align;
  const finalShowDivider = typeof showDivider === "boolean" ? showDivider : p.showDivider;

  const showBase = p.showBaseNote && !!effectiveBaseNote;
  const showFine = p.showFinePrint && !!finePrint;

  const baseNoteText = showBase ? baseNoteToText(effectiveBaseNote) : null;

  // Badge label (keep text cased for i18n; make it uppercase via CSS)
  const Badge = <span className={cls.badge} aria-hidden="true">Starting at</span>;

  // Card hybrids → chips to prevent truncation; otherwise keep plain
  const forceChipAppearance = p.useChipsOnCards && isHybrid(price);

  const Figure = (
    <PriceTeaser
      price={price}
      mode={p.teaserMode}                      // "band" (stacked) or "inline"
      showLabel={false}                        // pill is the visible label
      appearance={forceChipAppearance ? "chip" : "plain"}
      ariaLabelPrefix="Starting at"
      align={finalAlign}
    />
  );

  // SR-only sentence (kept even if visible pill is present)
  const srSentence = isHybrid(price)
    ? `Starting at ${fmt(price?.monthly, currency)} per month plus ${fmt(price?.oneTime, currency)} setup. ${baseNoteToText(effectiveBaseNote)}.`
    : `Starting at ${fmt(price?.monthly ?? price?.oneTime, currency)}. ${baseNoteToText(effectiveBaseNote)}.`;

  return (
    <section
      className={cx(cls.band, finalAlign === "center" ? cls.alignCenter : cls.alignStart, className)}
      style={style}
      aria-label={ariaLabel ?? "Pricing and actions"}
      data-component="PriceActionsBand"
      data-variant={variant}
      data-price-shape={isHybrid(price) ? "hybrid" : isOneTimeOnly(price) ? "one-time" : "monthly"}
    >
      {/* Tagline only when provided (no fallback to summary) */}
      {isDetail && tagline ? <p className={cls.tagline}>{tagline}</p> : null}

      {/* Badge placement + figure */}
      {p.badge === "above" ? (
        <div className={cls.stack}>
          {Badge}
          <div className={cls.figureBand}>{Figure}</div>
        </div>
      ) : (
        <div className={cls.rowInline}>
          {Badge}
          <div className={cls.figureInline}>{Figure}</div>
        </div>
      )}

      {/* Detail-only microcopy */}
      {baseNoteText ? <div className={cls.meta}>{baseNoteText}</div> : null}
      {showFine ? <div className={cls.meta}>{finePrint}</div> : null}

      {/* ---- Tweak #2: use ONLY Divider (avoid internal rule duplication) */}
      {finalShowDivider ? <Divider className={cls.rule} /> : null}

      {/* Actions (optional) */}
      {ctaPrimary || ctaSecondary ? (
        <div className={cls.actions}>
          {/* ---- Tweak #3: consistent CTARow prop names */}
          <CTARow primary={ctaPrimary} secondary={ctaSecondary} align={finalAlign} />
        </div>
      ) : null}

      {/* A11y */}
      <span className={cls.srOnly}>{srSentence}</span>
    </section>
  );
};

export default React.memo(PriceActionsBand);
export type { Cta as BandCta };
