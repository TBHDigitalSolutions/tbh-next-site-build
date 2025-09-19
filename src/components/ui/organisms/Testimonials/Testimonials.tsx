"use client";

import type { FC } from "react";
import TestimonialSlider from "./TestimonialSlider";
import "./Testimonials.css";

type TestimonialsProps = {
  title?: string;
  subtitle?: string;
  /** This is where you pass your authoring block's `data` array. */
  data:
    | Array<{
        id?: string | number;
        quote?: string;
        title?: string;
        body?: string;
        author?: string;
        name?: string;
        role?: string;
        company?: string;
        image?: string;
        avatar?: string;
      }>
    | { items?: any[]; testimonials?: any[] };
  count?: number;
  intervalMs?: number;
};

const Testimonials: FC<TestimonialsProps> = ({
  data,
  title = "What Our Clients Say",
  subtitle = "Hear from businesses who have transformed their digital presence with us.",
  count = 3,
  intervalMs = 6000,
}) => {
  if (!data) return null;

  const showHeader = Boolean(title || subtitle);
  const headingId =
    title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || undefined;

  return (
    <section className="tms-section" aria-labelledby={headingId} role="region">
      <div className="tms-container">
        {showHeader && (
          <header className="tms-header">
            {title && (
              <h2 id={headingId} className="tms-title">
                {title}
              </h2>
            )}
            {subtitle && <p className="tms-subtitle">{subtitle}</p>}
            <hr className="tms-divider" />
          </header>
        )}

        <div className="tms-sliderWrap">
          {/* Pass the raw data array (e.g., your `testimonials.data`) */}
          <TestimonialSlider data={data} count={count} intervalMs={intervalMs} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
