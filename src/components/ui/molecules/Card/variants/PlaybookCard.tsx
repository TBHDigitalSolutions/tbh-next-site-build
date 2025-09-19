"use client";

import React, { useMemo, useState } from "react";
import styles from "./PlaybookCard.module.css"; // or .module.css if you converted it
import Button from "@/components/ui/atoms/Button/Button";

export type PlaybookCardProps = {
  playbook: {
    id: string;
    title: string;
    description?: string;
    category: string;
    difficulty?: "Beginner" | "Intermediate" | "Advanced";
    tags?: string[];
    steps?: Array<{ id: string; title: string; description?: string }>;
    metrics?: Record<string, string>;
    cover?: string;
    href?: string;
    downloadUrl?: string;
  };
  variant?: "compact" | "detailed";
  onDownload?: (pb: PlaybookCardProps["playbook"]) => void;
  onPreview?: (pb: PlaybookCardProps["playbook"]) => void;
  onClick?: (pb: PlaybookCardProps["playbook"]) => void;
  showSteps?: boolean;
  showMetrics?: boolean;
};

export default function PlaybookCard({
  playbook,
  variant = "detailed",
  onDownload,
  onPreview,
  onClick,
  showSteps = true,
  showMetrics = true,
}: PlaybookCardProps) {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const stepItems = useMemo(() => (playbook.steps ?? []).slice(0, 5), [playbook.steps]);

  return (
    <article className={`${styles.card} ${styles[variant]}`} role="listitem">
      {/* Media */}
      <div
        className={styles.media}
        onMouseEnter={() => setOverlayOpen(true)}
        onMouseLeave={() => setOverlayOpen(false)}
      >
        <img
          src={playbook.cover ?? "/images/placeholders/playbook-cover.jpg"}
          alt=""
          className={styles.cover}
          loading="lazy"
        />

        {/* Overlay actions */}
        <div className={`${styles.overlay} ${overlayOpen ? styles.open : ""}`} aria-hidden={!overlayOpen}>
          <div className={styles.overlayActions}>
            {onPreview && (
              <Button
                variant="secondary"
                size="sm"
                className={`${styles.overlayBtn} ${styles.previewBtn}`}
                onClick={() => onPreview(playbook)}
                ariaLabel={`Preview ${playbook.title}`}
              >
                Preview
              </Button>
            )}
            {onDownload && (
              <Button
                variant="primary"
                size="sm"
                className={`${styles.overlayBtn} ${styles.downloadBtn}`}
                onClick={() => onDownload(playbook)}
                ariaLabel={`Download ${playbook.title}`}
              >
                Download
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content} onClick={() => onClick?.(playbook)}>
        <div className={styles.meta}>
          <span className={styles.category}>{playbook.category}</span>
          {playbook.difficulty && <span className={styles.difficulty}>{playbook.difficulty}</span>}
        </div>

        <h3 className={styles.title}>{playbook.title}</h3>
        {playbook.description && <p className={styles.description}>{playbook.description}</p>}

        {/* Steps preview */}
        {showSteps && stepItems.length > 0 && (
          <ul className={styles.steps} aria-label="Playbook steps">
            {stepItems.map((s, idx) => (
              <li key={s.id ?? `${playbook.id}-step-${idx}`} className={styles.stepItem}>
                <span className={styles.stepIndex}>{idx + 1}</span>
                <span className={styles.stepTitle}>{s.title}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Metrics */}
        {showMetrics && playbook.metrics && (
          <dl className={styles.metrics}>
            {Object.entries(playbook.metrics).map(([k, v], i) => (
              <div key={`${playbook.id}-metric-${k}-${i}`} className={styles.metricRow}>
                <dt className={styles.metricLabel}>{k}</dt>
                <dd className={styles.metricValue}>{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Footer CTA */}
        <div className={styles.ctaFooter}>
          {playbook.href ? (
            <a href={playbook.href} className={styles.link}>
              View Playbook →
            </a>
          ) : (
            <Button
              variant="link"
              size="md"
              className={styles.linkButton}
              onClick={() => onPreview?.(playbook)}
              ariaLabel={`Open ${playbook.title}`}
            >
              View Playbook →
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
