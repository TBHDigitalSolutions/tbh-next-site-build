// src/components/sections/Web-Dev/PortfolioDemo/Gallery/PortfolioCard.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import styles from "./PortfolioCard.module.css";
import type { Project } from "@/data/page/services-pages/web-development/portfolio-demo/portfolio-types";

export type PortfolioCardProps = {
  item: Project;
  /** Max number of technology tags to show in the footer (0 = hide). Default 4 */
  maxTechTags?: number;
  /** Show category pill in the header */
  showCategory?: boolean;
  /** Show timeline (e.g., “2023–2024”) */
  showTimeline?: boolean;
  /** Show short description line (clamped) */
  showDescription?: boolean;
  /** Override media aspect ratio (e.g., "4 / 3", "1 / 1"); defaults to 16/9 */
  aspectRatio?: string;
};

/**
 * PortfolioCard
 * - Pure presentational card; the parent container provides interactivity (onClick, onKeyDown).
 * - Optimized for Next.js <Image>, with graceful fallback for missing or failed thumbnails.
 * - A11y: semantic figure/figcaption; robust alt text; reduced motion friendly.
 */
const PortfolioCard: React.FC<PortfolioCardProps> = ({
  item,
  maxTechTags = 4,
  showCategory = true,
  showTimeline = true,
  showDescription = true,
  aspectRatio = "16 / 9",
}) => {
  const title = item.title || "Untitled project";
  const category = item.category?.toString().trim();
  const timeline = item.timeline?.toString().trim();
  const description = item.description?.toString().trim();
  const technologies = Array.isArray(item.technologies) ? item.technologies : [];
  const techLimit = Math.max(0, maxTechTags);

  // Derive alt text for the image (prefer explicit ariaLabel if provided)
  const baseAlt =
    item.meta?.ariaLabel?.trim() ||
    (item.image && item.image.trim() ? `${title} — preview` : `${title} — no thumbnail available`);

  // Compute technology chips (limited)
  const visibleTech = techLimit > 0 ? technologies.slice(0, techLimit) : [];
  const overflowCount = techLimit > 0 ? Math.max(0, technologies.length - techLimit) : 0;

  // Handle image load errors gracefully
  const [imgError, setImgError] = React.useState(false);
  const showImage = !!item.image && !imgError;

  return (
    <figure className={styles.card} style={{ ["--pc-aspect" as any]: aspectRatio }}>
      {/* Media area */}
      <div className={styles.media} aria-hidden={false}>
        {showImage ? (
          <Image
            src={item.image as string}
            alt={baseAlt}
            fill
            sizes="(max-width: 520px) 100vw, (max-width: 960px) 50vw, 33vw"
            className={styles.image}
            priority={false}
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.placeholder} role="img" aria-label={baseAlt}>
            <span className={styles.placeholderLabel}>{title.charAt(0) || "?"}</span>
          </div>
        )}

        {/* Subtle hint that the tile can be opened by the parent (non-interactive) */}
        <div className={styles.viewHint} aria-hidden="true">
          <svg
            className={styles.viewIcon}
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path
              d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z"
              fill="currentColor"
            />
          </svg>
          <span className={styles.viewText}>View demo</span>
        </div>
      </div>

      {/* Text content */}
      <figcaption className={styles.content}>
        <header className={styles.header}>
          <h3 className={styles.title} title={title}>
            {title}
          </h3>

          {(showCategory || showTimeline) && (
            <div className={styles.metaRow}>
              {showCategory && category && (
                <span className={styles.pill} aria-label={`Category: ${category}`}>
                  {category}
                </span>
              )}
              {showTimeline && timeline && (
                <span className={styles.meta} aria-label={`Timeline: ${timeline}`}>
                  {timeline}
                </span>
              )}
            </div>
          )}

          {showDescription && description && (
            <p className={styles.description}>{description}</p>
          )}
        </header>

        {visibleTech.length > 0 && (
          <footer className={styles.footer}>
            <ul className={styles.techList} aria-label="Technologies">
              {visibleTech.map((t, i) => (
                <li key={`${t}-${i}`} className={styles.techChip} title={t}>
                  {t}
                </li>
              ))}
              {overflowCount > 0 && (
                <li className={styles.techChipMore} title={`${overflowCount} more`}>
                  +{overflowCount}
                </li>
              )}
            </ul>
          </footer>
        )}
      </figcaption>
    </figure>
  );
};

export default PortfolioCard;
