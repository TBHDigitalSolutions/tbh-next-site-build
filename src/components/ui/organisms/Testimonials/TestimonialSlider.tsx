"use client";

import React, { useEffect, useMemo, useState } from "react";
import "./TestimonialSlider.css";

/** Your authoring shape (array or object with items/testimonials) */
export type TestimonialAuthoring =
  | Array<{
      id?: string | number;
      quote?: string;
      title?: string; // graceful fallback
      body?: string;  // graceful fallback
      author?: string;
      name?: string;  // graceful fallback
      role?: string;
      company?: string;
      image?: string; // preferred
      avatar?: string; // graceful fallback
    }>
  | { items?: any[]; testimonials?: any[] };

/** Normalized shape used by this component internally */
type NormalizedTestimonial = {
  id: string | number;
  quote: string;
  author?: string;
  role?: string;
  company?: string;
  image?: string;
};

/* ------------------------ helpers ------------------------ */

function coerceArray(input: TestimonialAuthoring): any[] {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray((input as any).items)) return (input as any).items;
  if (input && Array.isArray((input as any).testimonials)) return (input as any).testimonials;
  return [];
}

function normalizeOne(t: any, idx: number): NormalizedTestimonial {
  const quote = t.quote ?? t.body ?? t.title ?? "";
  const author = t.author ?? t.name ?? "";
  const role = t.role ?? "";
  const company = t.company ?? "";
  const image = t.image ?? t.avatar ?? undefined;

  return {
    id: t.id ?? `${author || "t"}-${idx}`,
    quote,
    author,
    role,
    company,
    image,
  };
}

/* ------------------------ props ------------------------ */
type TestimonialSliderProps = {
  /** Your authoring data (array or object with .items/.testimonials). */
  data: TestimonialAuthoring;
  /** How many to show on desktop (also used for rotation step). */
  count?: number; // default 3
  /** Rotation interval in ms when there are more than `count`. */
  intervalMs?: number; // default 6000
};

/* ========================================================
 * Slider
 *  - One horizontal row (3 across on desktop, 2 tablet, 1 mobile)
 *  - Auto-rotates in place when there are more than `count`
 * ====================================================== */
const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  data,
  count = 3,
  intervalMs = 6000,
}) => {
  const raw = useMemo(() => coerceArray(data), [data]);
  const source = useMemo<NormalizedTestimonial[]>(
    () => raw.map(normalizeOne),
    [raw]
  );

  const [start, setStart] = useState(0);

  // Auto-rotate only if we have more testimonials than visible
  useEffect(() => {
    if (source.length <= count) return;
    const id = setInterval(() => {
      setStart((s) => (s + count) % source.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, source.length]);

  // Visible window [start, start+count)
  const displayed =
    source.length <= count
      ? source
      : [
          ...source.slice(start, start + count),
          ...source.slice(0, Math.max(0, start + count - source.length)),
        ].slice(0, count);

  if (source.length === 0) return null;

  // Let CSS compute exact child widths via var
  const gridStyle = { ["--tms-cards-per-row" as any]: String(count) };

  return (
    <div className="tms-slider" role="region" aria-label="Testimonials">
      <div className="tms-sliderGrid" style={gridStyle}>
        {displayed.map((t) => (
          <article key={String(t.id)} className="tms-card">
            {t.image && (
              <div className="tms-avatarWrap" aria-hidden="true">
                <img
                  className="tms-avatar"
                  src={t.image}
                  alt={t.author ? `${t.author} headshot` : "Client headshot"}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}

            {t.quote && (
              <blockquote className="tms-quote">
                <span>“{t.quote}”</span>
              </blockquote>
            )}

            {(t.author || t.company || t.role) && (
              <footer className="tms-meta">
                {t.author && <span className="tms-author">{t.author}</span>}
                {(t.company || t.role) && (
                  <span className="tms-role">
                    {t.company}
                    {t.company && t.role ? " • " : ""}
                    {t.role}
                  </span>
                )}
              </footer>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;
