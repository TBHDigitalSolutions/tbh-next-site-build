"use client";

import React from "react";
import "./CoreValues.css";
import type { CoreValue } from "@/data/page/main-pages/about/types";

export type CoreValuesProps = {
  /** Section heading (optional) */
  title?: string;
  /** Section subheading (optional) */
  subtitle?: string;
  /** Values to render (page provides these) */
  values: CoreValue[];
  /** Optional passthrough for layout hooks */
  className?: string;
};

/**
 * CoreValues
 * - Pure presentational component (no data imports)
 * - Preserves existing CSS by using stable class names
 * - Adds alias class names to avoid regressions if legacy CSS differs
 */
export default function CoreValues({
  title = "Our Core Values",
  subtitle,
  values,
  className,
}: CoreValuesProps) {
  return (
    <section
      className={[
        // prefer existing class names you already use in CoreValues.css
        "corevalues",
        "core-values",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby="corevalues-title"
    >
      {/* Header */}
      <header className="corevalues-header core-values-header">
        {title && (
          <h2 id="corevalues-title" className="corevalues-title core-values-title">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="corevalues-subtitle core-values-subtitle">{subtitle}</p>
        )}
      </header>

      {/* Grid */}
      <div className="corevalues-grid core-values-grid" role="list">
        {values.map((value, idx) => {
          const key = value.id ?? `corevalue-${idx}`;
          return (
            <article
              key={key}
              role="listitem"
              className="corevalue-item core-value-item"
              aria-labelledby={`${key}-title`}
            >
              {value.icon && (
                <div
                  className="corevalue-icon core-value-icon"
                  role="img"
                  aria-label={`${value.title} icon`}
                >
                  {value.icon}
                </div>
              )}

              <h3 id={`${key}-title`} className="corevalue-title core-value-title">
                {value.title}
              </h3>

              {value.description && (
                <p className="corevalue-description core-value-description">
                  {value.description}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
