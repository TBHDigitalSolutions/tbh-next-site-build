// src/packages/sections/PackageDetailOverview/PackageDetailPhases/Phase1HeroSection/Phase1HeroSection.tsx
/**
 * Phase 1 — Hero Section
 * -----------------------------------------------------------------------------
 * This component renders the *top* of the Package Detail page's left column and,
 * optionally, the canonical price/actions band in a right column. It is a thin
 * composition layer over three existing "parts":
 *
 *  - TitleBlock        (left: title, value prop, description, ICP)
 *  - MetaRow           (left: service chip + tag chips)
 *  - PriceActionsBand  (right: price + primary/secondary CTAs, fine print)
 *
 * Design principles:
 * - **Composition, not configuration**: this phase simply arranges already
 *   battle-tested parts. It forwards all props untouched so styles/behavior
 *   remain centralized in the parts themselves.
 * - **Back-compat guardrails**: imports use *default* imports (not named) to
 *   prevent the "Element type is invalid" runtime error when a part exports
 *   `default`. See "Gotchas" below.
 * - **A11y-first**: semantic `<header>` lives *inside* TitleBlock; this wrapper
 *   uses `<section>` and provides an `aria-label` for the right column.
 *
 * Layout:
 * - The module CSS is expected to provide a responsive two-column grid via:
 *     .wrap   (grid container)
 *     .colA   (left column)
 *     .colB   (right column / band)
 *     .meta   (container for MetaRow beneath TitleBlock)
 *
 * When to render the band:
 * - On detail pages where there is a canonical price and a consistent CTA
 *   policy, pass a fully-formed `band` prop. When omitted, the right column is
 *   not rendered and the left column spans the full width.
 *
 * Gotchas:
 * - ❗**Default vs named imports**: The parts used here (`TitleBlock`,
 *   `MetaRow`, `PriceActionsBand`) are **default exports**. Importing them with
 *   curly braces will produce `undefined` and crash React with:
 *     “Element type is invalid: expected a string or a class/function but got: undefined…”
 *
 * Testing checklist (visual + a11y):
 * - Title text renders as the chosen heading level in TitleBlock (default h2).
 * - Divider appears beneath the main heading when `showDivider` is true.
 * - Value prop and description render when provided.
 * - ICP block appears only when `icp` or `icpDescription` is present.
 * - Meta row appears only when `metaRow` is provided and `show` within it is true.
 * - Band appears only when `band` is provided; CTAs are keyboard-focusable.
 * - Right column has `aria-label="Pricing and actions"`.
 */

"use client";

import * as React from "react";
import styles from "./Phase1HeroSection.module.css";

/**
 * ✅ IMPORTANT: these parts export DEFAULT components, not named exports.
 * Using named braces here would make them undefined at runtime.
 */
import TitleBlock from "@/packages/sections/PackageDetailOverview/parts/TitleBlock";
import MetaRow from "@/packages/sections/PackageDetailOverview/parts/MetaRow";
import PriceActionsBand from "@/packages/sections/PackageDetailOverview/parts/PriceActionsBand";

/** Reuse child prop types to stay in sync with the parts’ public APIs. */
export type TitleBlockProps = React.ComponentProps<typeof TitleBlock>;
export type MetaRowProps = React.ComponentProps<typeof MetaRow>;
export type PriceActionsBandProps = React.ComponentProps<typeof PriceActionsBand>;

/**
 * Public prop contract for the Phase 1 Hero Section.
 */
export type Phase1HeroSectionProps = {
  /**
   * Optional DOM id for the outer <section>. Useful for skip-links and to
   * derive stable ids for nested headings inside the TitleBlock.
   */
  id?: string;

  /**
   * Left column payload:
   * - `TitleBlockProps` controls heading level, divider, value prop, description,
   *    and ICP audience area.
   */
  titleBlock: TitleBlockProps;

  /**
   * Optional meta row beneath the TitleBlock:
   * - `service` chip and an array of `tags` (chips).
   * - Respect the `show` flag inside `MetaRowProps` to toggle visibility.
   */
  metaRow?: MetaRowProps;

  /**
   * Optional canonical price/CTA band for detail pages.
   * - When omitted, the right column is not rendered.
   * - When provided, it should contain price, CTA labels/links, and fine print.
   */
  band?: PriceActionsBandProps;

  /**
   * Optional style hooks for the outer wrapper.
   */
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Phase 1 — Hero
 * Left: Title + short value prop + optional description + optional ICP + (optional) MetaRow
 * Right: Canonical PriceActionsBand (optional)
 *
 * @example
 * <Phase1HeroSection
 *   id="pkg-abc__phase1"
 *   titleBlock={{
 *     id: "pkg-abc__title",
 *     as: "h2",
 *     title: "Growth Package",
 *     valueProp: "Predictable pipeline in 90 days.",
 *     description: "A fast-track program to validate and scale acquisition.",
 *     icp: "B2B SaaS teams at Seed–Series B",
 *   }}
 *   metaRow={{ service: "growth", tags: ["B2B SaaS", "ICP: PMM"], show: true }}
 *   band={{
 *     variant: "detail",
 *     price: { monthly: 6000, currency: "USD" },
 *     tagline: "Flat fee. Cancel anytime after 3 months.",
 *     baseNote: "proposal",
 *     finePrint: "3-month minimum • + ad spend",
 *     ctaPrimary: { label: "Request proposal", href: "/contact" },
 *     ctaSecondary: { label: "Book a call", href: "/book" },
 *     showDivider: true,
 *     align: "center",
 *   }}
 * />
 */
function Phase1HeroSection({
  id,
  titleBlock,
  metaRow,
  band,
  className,
  style,
}: Phase1HeroSectionProps) {
  /** Compose outer class list without introducing extra whitespace. */
  const sectionClass = [styles.wrap, className].filter(Boolean).join(" ");

  return (
    <section id={id} className={sectionClass} style={style} data-section="Phase1HeroSection">
      {/* ================================ LEFT ================================ */}
      <div className={styles.colA}>
        {/* Title + value prop + optional long description + ICP */}
        <TitleBlock {...titleBlock} />

        {/* Service chip + tags row (rendered only when provided & allowed) */}
        {metaRow ? (
          <div className={styles.meta}>
            <MetaRow {...metaRow} />
          </div>
        ) : null}
      </div>

      {/* ================================ RIGHT =============================== */}
      {/* Canonical Price + Actions band for detail pages (optional) */}
      {band ? (
        <aside className={styles.colB} aria-label="Pricing and actions">
          <PriceActionsBand {...band} />
        </aside>
      ) : null}
    </section>
  );
}

export default Phase1HeroSection;

/**
 * Implementation Notes
 * -----------------------------------------------------------------------------
 * - Performance: This component is a presentational composition; it does not
 *   compute derived data itself. Derive and memoize rich objects (like `band`)
 *   *upstream* to avoid needless re-renders.
 *
 * - Styling: Keep spacing and typography decisions inside the parts. The phase
 *   wrapper should only manage *layout* (grid/columns) and conditional presence.
 *
 * - Extensibility: If you need to add a tertiary action or a promo ribbon in
 *   the right column, prefer extending `PriceActionsBand` so visual logic stays
 *   co-located with the primary/secondary CTAs.
 *
 * - Server/Client: Marked `"use client"` because nested parts often rely on
 *   client-only behavior (e.g., focus outlines, interactive CTA elements). If
 *   all parts become server-safe, you can re-evaluate this directive.
 */

