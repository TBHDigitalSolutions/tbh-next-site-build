// src/components/sections/section-layouts/ServicesAndCapabilities/ServicesAndCapabilities.tsx
"use client";

import React from "react";
import clsx from "clsx";
import Link from "next/link";
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";
import PillarCard from "./PillarCard";
import styles from "./ServicesAndCapabilities.module.css";
import type { WithBlock, ServicesAndCapabilitiesProps } from "./ServicesAndCapabilities.types";

// Optional icon map for simple string keys
import { Megaphone, Palette, Cog, BarChart3, Newspaper, Briefcase } from "lucide-react";

function normalizeProps(props: WithBlock): ServicesAndCapabilitiesProps {
  const block = (props as any).block ?? props;
  return {
    title: block.title ?? "Services & capabilities",
    description: block.description,
    chips: block.chips ?? [],
    pillars: block.pillars ?? [],
    bullets: block.bullets ?? [],
    cards: block.cards ?? [],
    ctas: block.ctas ?? {
      primary: { label: "Talk to us", href: "/contact" },
      secondary: { label: "View pricing", href: "/pricing" },
    },
    className: block.className,
  };
}

const CARD_ICON_MAP: Record<string, React.ReactNode> = {
  "digital-advertising": <Megaphone aria-hidden />,
  "content-creative": <Palette aria-hidden />,
  "marketing-technology": <Cog aria-hidden />,
  "analytics-optimization": <BarChart3 aria-hidden />,
  "public-relations": <Newspaper aria-hidden />,
  "strategy-consulting": <Briefcase aria-hidden />,
};

function renderCardIcon(icon?: string | React.ReactNode) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "string") return CARD_ICON_MAP[icon.toLowerCase()] ?? null;
  return null;
}

const ServicesAndCapabilities: React.FC<WithBlock> = (props) => {
  const {
    title,
    description,
    chips = [],
    pillars = [],
    bullets = [],
    cards = [],
    ctas,
    className,
  } = normalizeProps(props);

  const cardsFirst = true;

  const hasPillars = pillars?.length > 0;
  const hasBullets = bullets?.length > 0;
  const hasCards = cards?.length > 0;

  if (!hasPillars && !hasBullets && !hasCards) return null;

  // --------- CARDS BAND (Explore button uses <Button variant="secondary" size="sm">) ----------
  const CardsBand = hasCards ? (
    <div className={clsx(styles.cardsBand, styles.deepNavyBand)}>
      <div className={clsx("container", styles.cardsContainer)}>
        <ul
          className={clsx(styles.grid, styles.cardsGrid, styles.equalGrid)}
          role="list"
          aria-label="Service categories"
        >
          {cards.map((c) => {
            const iconNode = renderCardIcon((c as any).icon);
            return (
              <li key={c.id ?? c.href} className={clsx(styles.gridItem, styles.equalItem)}>
                <article className={clsx(styles.cardShell, styles.equalCard)}>
                  <div className={styles.cardMedia} aria-hidden="true">
                    {iconNode ? (
                      <span className={styles.cardIcon}>{iconNode}</span>
                    ) : (
                      <span className={styles.cardIconFallback} />
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <PillarCard
                      title={c.title}
                      description={("description" in c && c.description) || ""}
                      icon={undefined}     // icon rendered in cardMedia for uniform layout
                      bullets={undefined}  // keep category cards minimal
                    />
                  </div>

                  <div className={styles.cardFooter}>
                    <Button
                      href={c.href}
                      variant="secondary"
                      size="sm"
                      ariaLabel={`Explore ${c.title}`}
                    >
                      Explore →
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  ) : null;

  // --------- HEADER + (optional pillars) + INLINE BULLETS ----------
  const TopBand = (
    <div className={clsx("container", styles.container)}>
      <header className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {description && <p className={styles.description}>{description}</p>}
        <Divider />

        {chips.length > 0 && !hasBullets && (
          <div className={styles.chipsWrap}>
            <ul className={styles.chips} role="list">
              {chips.map((c) => (
                <li key={c} className={styles.chip}>
                  <span aria-hidden>✓</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {hasPillars && (
        <ul className={clsx(styles.grid)} role="list" aria-label="Core pillars">
          {pillars.map((p) => (
            <li key={p.id} className={clsx(styles.gridItem, styles.equalItem)}>
              <PillarCard
                title={p.title}
                description={p.description}
                icon={p.icon}
                bullets={p.deliverables}
              />
            </li>
          ))}
        </ul>
      )}

      {hasBullets && (
        <nav className={styles.bulletsInline} aria-label="Capabilities">
          <ul className={styles.bulletsInlineList} role="list">
            {bullets.slice(0, 9).map((b) => (
              <li key={b.href} className={styles.bulletsInlineItem}>
                <Link href={b.href} className={styles.bulletsInlineLink}>
                  <span className={styles.bulletDot} aria-hidden="true" />
                  <span className={styles.bulletText}>{b.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );

  return (
    <section className={clsx(styles.section, "section-padding", className)}>
      {cardsFirst ? (
        <>
          {TopBand}
          {hasCards && <Divider variant="constrained" tone="default" thickness="md" />}
          {CardsBand}
        </>
      ) : (
        <>
          {CardsBand}
          {(hasPillars || hasBullets) && <Divider variant="constrained" tone="default" thickness="md" />}
          {TopBand}
        </>
      )}

      {(ctas?.secondary || ctas?.primary) && (
        <div className={clsx("container", styles.container)}>
          <div className={styles.ctaRow}>
            {ctas?.secondary && (
              <Button href={ctas.secondary.href} variant="secondary" size="md">
                {ctas.secondary.label}
              </Button>
            )}
            {ctas?.primary && (
              <Button href={ctas.primary.href} variant="primary" size="md">
                {ctas.primary.label}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesAndCapabilities;
