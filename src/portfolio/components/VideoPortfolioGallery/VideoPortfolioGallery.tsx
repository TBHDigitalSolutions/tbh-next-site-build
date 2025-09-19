// src/components/ui/organisms/VideoPortfolioGallery/VideoPortfolioGallery.tsx
"use client";

import React, { useMemo, useState, useCallback, useId } from "react";
import Image from "next/image";
import clsx from "clsx";
import styles from "./VideoPortfolioGallery.module.css";
import VideoLightbox from "./VideoLightbox";
import type {
  VideoPortfolioGalleryProps,
  VideoItem,
  ClickBehavior,
} from "./VideoPortfolioGallery.types";

/* -----------------------------
   Small helpers
------------------------------*/
const isNonEmpty = (v?: string | null): v is string =>
  typeof v === "string" && v.trim().length > 0;

/* -----------------------------
   Helpers: embed URL detection and conversion
------------------------------*/
function isEmbedUrl(src: string) {
  const s = (src || "").toLowerCase();
  return (
    s.includes("youtube.com/embed") ||
    s.includes("youtube.com/watch") ||
    s.includes("youtu.be/") ||
    s.includes("player.vimeo.com") ||
    s.includes("vimeo.com/")
  );
}

function toEmbedUrl(src: string) {
  try {
    const url = new URL(src, "https://dummy-base/");
    const host = url.hostname.replace("www.", "");

    if (host.includes("youtu.be")) {
      const id = url.pathname.slice(1);
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
    }
    if (host.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?rel=0&modestbranding=1`;
      if (url.pathname.includes("/embed/")) return src;
    }
    if (host.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}${url.search ? url.search : ""}`;
    }
  } catch (error) {
    console.error("Error converting to embed URL:", error);
  }
  return src;
}

function bestOpenUrl(item: VideoItem): string | null {
  if (item.embedUrl) return toEmbedUrl(item.embedUrl);
  const normalized = toEmbedUrl(item.src);
  const isPlatform = /youtube|youtu\.be|vimeo/i.test(item.src);
  return isPlatform ? normalized : item.src || normalized || null;
}

function primaryPlayableUrl(item: VideoItem) {
  // Prefer a valid embed URL if present; otherwise a best-effort conversion; otherwise raw src
  const candidate = item.embedUrl || item.src || "";
  return isEmbedUrl(candidate) ? candidate : toEmbedUrl(candidate);
}

/** Stable key generator */
function keyFor(item: Pick<VideoItem, "id" | "title">, index: number) {
  return item.id && item.id.trim().length > 0
    ? item.id
    : `vpg-${index}-${(item.title || "item").replace(/\s+/g, "-").toLowerCase()}`;
}

export const VideoPortfolioGallery: React.FC<VideoPortfolioGalleryProps> = ({
  title = "Video Portfolio",
  subtitle,
  items,
  columns = 3,
  maxItems,
  lightbox = true,
  clickBehavior = "lightbox",
  externalTarget = "_blank",
  onItemClick,
  onModalOpen,
  className,
  variant = "default",
  showHeader = true,
  loading = false,
  emptyMessage = "No videos available.",
}) => {
  // Built-in lightbox state (used when onItemClick is not provided)
  const [activeItem, setActiveItem] = useState<VideoItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Inline playback state
  const [inlineId, setInlineId] = useState<string | null>(null);

  // Generate unique IDs for accessibility
  const headingId = useId();

  // Apply maxItems limit if specified
  const displayItems = useMemo(() => {
    return maxItems ? items.slice(0, maxItems) : items;
  }, [items, maxItems]);

  // Grid column CSS class
  const colsClass = useMemo(() => {
    switch (columns) {
      case 4:
        return styles.cols4;
      case 2:
        return styles.cols2;
      case 1:
        return styles.cols1;
      default:
        return styles.cols3;
    }
  }, [columns]);

  // Handle card click
  const handleCardClick = useCallback(
    (item: VideoItem, idx: number) => {
      // Track modal open for analytics
      onModalOpen?.(item, idx);

      // If consumer passed a handler (e.g., VideoPortfolioClient), call that and return.
      if (onItemClick) {
        onItemClick(item, idx);
        return;
      }

      // Otherwise, handle locally based on clickBehavior.
      switch (clickBehavior) {
        case "newtab": {
          const url = bestOpenUrl(item);
          if (url) {
            window.open(url, externalTarget, "noopener,noreferrer");
          }
          return;
        }
        case "inline": {
          setInlineId((prev) => (prev === item.id ? null : item.id));
          return;
        }
        case "lightbox":
        default: {
          if (lightbox) {
            setActiveItem(item);
            setLightboxOpen(true);
          } else {
            const url = bestOpenUrl(item);
            if (url) window.open(url, externalTarget, "noopener,noreferrer");
          }
        }
      }
    },
    [onItemClick, onModalOpen, clickBehavior, lightbox, externalTarget]
  );

  // Close lightbox handler
  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
    setActiveItem(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className={clsx(styles.wrapper, styles.loading, className)}>
        {showHeader && (
          <header className={styles.header}>
            <div className={styles.loadingSkeleton}>
              <div className={styles.titleSkeleton} />
              {subtitle && <div className={styles.subtitleSkeleton} />}
            </div>
          </header>
        )}
        <div className={clsx(styles.grid, colsClass)}>
          {Array.from({ length: columns * 2 }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton}>
              <div className={styles.thumbSkeleton} />
              <div className={styles.bodySkeleton}>
                <div className={styles.lineSkeleton} />
                <div className={styles.lineSkeleton} style={{ width: "60%" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className={clsx(styles.wrapper, styles[variant], className)}
        aria-labelledby={showHeader ? `${headingId}-title` : undefined}
      >
        {/* Header */}
        {showHeader && (
          <header className={styles.header}>
            <div>
              <h2 id={`${headingId}-title`} className={styles.title}>
                {title}
              </h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </header>
        )}

        {/* Empty state */}
        {displayItems.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎬</div>
            <p className={styles.emptyMessage}>{emptyMessage}</p>
          </div>
        ) : (
          /* Grid */
          <div className={clsx(styles.grid, colsClass)} role="list">
            {displayItems.map((item, idx) => {
              const isInline =
                clickBehavior === "inline" && inlineId === item.id;
              const canEmbed =
                isEmbedUrl(item.embedUrl ?? item.src) ||
                isEmbedUrl(toEmbedUrl(item.embedUrl ?? item.src ?? ""));

              return (
                <article
                  key={keyFor(item, idx)}
                  className={clsx(
                    styles.card,
                    item.featured && styles.featured,
                    isInline && styles.inlineActive
                  )}
                  role="listitem"
                >
                  {/* Clickable thumbnail / player */}
                  <button
                    type="button"
                    className={styles.thumbBtn}
                    aria-label={`Play ${item.title}`}
                    onClick={() => handleCardClick(item, idx)}
                  >
                    <div className={styles.thumbWrap} aria-hidden="true">
                      {/* Inline mode: swap thumbnail for player */}
                      {isInline ? (
                        canEmbed ? (
                          <iframe
                            className={styles.embed}
                            src={primaryPlayableUrl(item)}
                            title={item.title || "Video player"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : isNonEmpty(item.src) ? (
                          <video
                            className={styles.player}
                            src={item.src}
                            controls
                            preload="metadata"
                            playsInline
                          />
                        ) : (
                          <div className={styles.errorState}>
                            <span>⚠️ Video unavailable</span>
                          </div>
                        )
                      ) : (
                        <>
                          {isNonEmpty(item.thumbnail) ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title || "Video thumbnail"}
                              className={styles.thumb}
                              width={640}
                              height={360}
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              priority={idx < 2}
                            />
                          ) : (
                            // Visual fallback when no thumbnail provided
                            <div
                              className={styles.thumb}
                              style={{
                                display: "grid",
                                placeItems: "center",
                                color: "#999",
                                background:
                                  "var(--bg-muted, rgba(0,0,0,0.2))",
                              }}
                              aria-label="No thumbnail"
                            >
                              <span aria-hidden="true">🎬</span>
                            </div>
                          )}

                          {/* Play button overlay */}
                          <div className={styles.playBadge}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path fill="currentColor" d="M8 5v14l11-7z" />
                            </svg>
                          </div>

                          {/* Duration badge */}
                          {item.duration && (
                            <span className={styles.duration}>
                              {item.duration}
                            </span>
                          )}

                          {/* Featured badge */}
                          {item.featured && (
                            <span className={styles.featuredBadge}>
                              Featured
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </button>

                  {/* Card metadata */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle} title={item.title}>
                      {item.title}
                    </h3>

                    {/* Client and category in a row */}
                    {(item.client || item.category) && (
                      <div className={styles.subMeta}>
                        {item.client && (
                          <span className={styles.client}>{item.client}</span>
                        )}
                        {item.category && (
                          <span className={styles.category}>
                            {item.category}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className={styles.desc} title={item.description}>
                        {item.description}
                      </p>
                    )}

                    {/* Tags (limited to first 3 for space) */}
                    {item.tags && item.tags.length > 0 && (
                      <div
                        className={styles.tagList}
                        role="list"
                        aria-label="Tags"
                      >
                        {item.tags.slice(0, 3).map((t, i) => (
                          <span
                            key={`${item.id}-tag-${i}`}
                            className={styles.tag}
                            role="listitem"
                          >
                            {t}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className={styles.tagMore}>
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metrics display */}
                    {item.metrics && Object.keys(item.metrics).length > 0 && (
                      <div className={styles.metrics}>
                        {Object.entries(item.metrics)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key} className={styles.metric}>
                              <span className={styles.metricValue}>
                                {value}
                              </span>
                              <span className={styles.metricLabel}>
                                {key}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* CTA link */}
                    {item.cta && (
                      <a
                        className={styles.cta}
                        href={item.cta.href}
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                      >
                        {item.cta.label}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Built-in lightbox (only renders when not using external onItemClick handler) */}
      {lightbox && !onItemClick && (
        <VideoLightbox
          open={lightboxOpen}
          onClose={handleCloseLightbox}
          item={activeItem}
          size="large"
        />
      )}
    </>
  );
};

// Default export for backward compatibility
export default VideoPortfolioGallery;