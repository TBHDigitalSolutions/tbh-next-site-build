// src/components/ui/organisms/CaseStudyCarousel/CaseStudyCarousel.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import "./CaseStudyCarousel.css";

/** Flexible input types (accepts your index.ts shape) */
type ImageLike = string | { src: string; alt?: string };
type LinkLike = { href?: string; link?: string };

export interface CaseStudyMetric {
  label: string;
  value: string;
  change?: string;
}

export interface CaseStudyInput extends LinkLike {
  id: string;
  title: string;
  description?: string;
  /** Accept either plain string or {src, alt} */
  image?: ImageLike;
  /** Accept either "badge" or "category" */
  badge?: string;
  category?: string;

  // Optional extras supported by the UI (non-required)
  client?: string;
  metrics?: CaseStudyMetric[];
  tags?: string[];
  date?: string;
  featured?: boolean;
  results?: string;
}

export interface CaseStudyCarouselProps {
  /** Section title (optional) */
  title?: string;
  /** Section subtitle/description (optional) */
  subtitle?: string;

  /** Normalized list from page data (REQUIRED IN PROD) */
  caseStudies?: CaseStudyInput[];

  /** UI options */
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showProgress?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  slidesToShow?: number;
  infinite?: boolean;

  /** Click handler (optional) */
  onCaseStudyClick?: (cs: CaseStudyInput) => void;

  /**
   * Dev helper only. If true AND not production, render a tiny inline
   * fallback when caseStudies is empty. Default: false.
   */
  useDefaultDataInDev?: boolean;
}

/** --------- Helpers --------- */
const getImageSrc = (img?: ImageLike): { src?: string; alt?: string } => {
  if (!img) return {};
  return typeof img === "string" ? { src: img } : { src: img.src, alt: img.alt };
};

const getHref = (cs: CaseStudyInput): string | undefined =>
  cs.href || cs.link || undefined;

const getBadge = (cs: CaseStudyInput): string | undefined =>
  cs.badge || cs.category || undefined;

/** Minimal dev-only dataset (never shipped/used in production) */
const DEV_FALLBACK: CaseStudyInput[] = [
  {
    id: "dev-example",
    title: "Example Case Study",
    description: "Add real data in your page data file.",
    image: { src: "/images/placeholder-16x9.png", alt: "Placeholder" },
    href: "#",
    badge: "Placeholder",
  },
];

export default function CaseStudyCarousel({
  title,
  subtitle,
  caseStudies,
  className = "",
  autoPlay = true,
  autoPlayInterval = 5000,
  showProgress = true,
  showPagination = true,
  showNavigation = true,
  slidesToShow = 1,
  infinite = true,
  onCaseStudyClick,
  useDefaultDataInDev = false,
}: CaseStudyCarouselProps) {
  // In development only, optionally show a one-item fallback
  const safeItems = useMemo(() => {
    if (Array.isArray(caseStudies) && caseStudies.length > 0) return caseStudies;
    if (process.env.NODE_ENV !== "production" && useDefaultDataInDev) {
      return DEV_FALLBACK;
    }
    return [];
  }, [caseStudies, useDefaultDataInDev]);

  // No items → render nothing (prod-safe)
  if (!safeItems.length) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, safeItems.length - slidesToShow);
  const progress = maxIndex > 0 ? (currentIndex / maxIndex) * 100 : 0;

  // Auto-play
  useEffect(() => {
    if (isPlaying && safeItems.length > slidesToShow) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) =>
          infinite ? (prev >= maxIndex ? 0 : prev + 1) : Math.min(prev + 1, maxIndex)
        );
      }, autoPlayInterval);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isPlaying, autoPlayInterval, maxIndex, infinite, safeItems.length, slidesToShow]);

  const goToSlide = useCallback(
    (index: number) => setCurrentIndex(Math.max(0, Math.min(index, maxIndex))),
    [maxIndex]
  );

  const nextSlide = useCallback(
    () => setCurrentIndex((prev) => (infinite ? (prev >= maxIndex ? 0 : prev + 1) : Math.min(prev + 1, maxIndex))),
    [maxIndex, infinite]
  );

  const prevSlide = useCallback(
    () => setCurrentIndex((prev) => (infinite ? (prev <= 0 ? maxIndex : prev - 1) : Math.max(prev - 1, 0))),
    [maxIndex, infinite]
  );

  // Drag
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setIsPlaying(false);
    if (trackRef.current) trackRef.current.style.cursor = "grabbing";
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      setDragOffset(clientX - dragStart);
    },
    [isDragging, dragStart]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPlaying(autoPlay);
    if (trackRef.current) trackRef.current.style.cursor = "grab";

    const threshold = 100;
    if (dragOffset > threshold) prevSlide();
    else if (dragOffset < -threshold) nextSlide();
    setDragOffset(0);
  }, [isDragging, autoPlay, dragOffset, nextSlide, prevSlide]);

  // Handlers for mouse/touch
  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => handleDragEnd();

  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  return (
    <section className={clsx("case-carousel", className)} aria-label="Case studies">
      {(title || subtitle) && (
        <header className="case-carousel__header">
          {title && <h2 className="case-carousel__title">{title}</h2>}
          {subtitle && <p className="case-carousel__subtitle">{subtitle}</p>}
        </header>
      )}

      <div className="case-carousel__viewport">
        <div
          ref={trackRef}
          className={clsx("case-carousel__track")}
          style={{
            transform: `translateX(calc(${-currentIndex * (100 / slidesToShow)}% + ${dragOffset}px))`,
            gridTemplateColumns: `repeat(${safeItems.length}, 1fr)`,
          }}
          role="list"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {safeItems.map((cs) => {
            const { src, alt } = getImageSrc(cs.image);
            const href = getHref(cs);
            const pill = getBadge(cs);

            return (
              <article key={cs.id} className="case-card" role="listitem">
                {src && (
                  <div className="case-card__media">
                    {/* Use next/image for perf; fallback to <img> if needed */}
                    <Image
                      src={src}
                      alt={alt || cs.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="case-card__image"
                    />
                  </div>
                )}

                <div className="case-card__body">
                  {pill && <span className="case-card__badge">{pill}</span>}
                  <h3 className="case-card__title">{cs.title}</h3>
                  {cs.description && <p className="case-card__desc">{cs.description}</p>}

                  {href && (
                    <a
                      href={href}
                      className="case-card__link"
                      onClick={(e) => {
                        onCaseStudyClick?.(cs);
                        // allow normal navigation
                      }}
                      aria-label={`Open case study: ${cs.title}`}
                    >
                      View case study →
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      {(showNavigation || showPagination || showProgress) && (
        <div className="case-carousel__controls">
          {showNavigation && (
            <div className="case-carousel__nav">
              <button type="button" onClick={prevSlide} aria-label="Previous">
                ‹
              </button>
              <button type="button" onClick={nextSlide} aria-label="Next">
                ›
              </button>
            </div>
          )}

          {showPagination && safeItems.length > slidesToShow && (
            <div className="case-carousel__dots" role="tablist" aria-label="Choose slide">
              {Array.from({ length: Math.max(1, maxIndex + 1) }).map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === currentIndex}
                  aria-label={`Go to slide ${i + 1}`}
                  className={clsx("case-carousel__dot", i === currentIndex && "is-active")}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
          )}

          {showProgress && (
            <div className="case-carousel__progress" aria-hidden={true}>
              <div className="case-carousel__bar" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
