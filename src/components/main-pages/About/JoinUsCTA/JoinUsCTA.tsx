"use client";

import React from "react";
import "./JoinUsCTA.css";
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";
import type { JoinUsCTAData } from "@/data/page/main-pages/about/types";

export type JoinUsCTAProps = {
  /** Page-provided data (no in-file imports) */
  data: JoinUsCTAData;
  /** Optional passthrough for layout wrappers */
  className?: string;
};

export default function JoinUsCTA({ data, className }: JoinUsCTAProps) {
  const { title, subtitle, primaryCta, secondaryCta } = data || {};

  // If nothing meaningful to render, return null
  if (!title && !subtitle && !primaryCta && !secondaryCta) return null;

  return (
    <section
      className={["joinus-wrapper", className].filter(Boolean).join(" ")}
      aria-labelledby={title ? "joinus-title" : undefined}
    >
      {/* Title + divider (preserve class names) */}
      {(title || subtitle) && (
        <div className="joinus-title-wrapper">
          {title && (
            <h2 id="joinus-title" className="joinus-title">
              {title}
            </h2>
          )}
          <Divider className="joinus-title-divider" />
          {subtitle && <p className="joinus-description">{subtitle}</p>}
        </div>
      )}

      {/* Actions — keep legacy class names; add a secondary button if provided */}
      {(primaryCta || secondaryCta) && (
        <div className="joinus-cta">
          {primaryCta?.href && primaryCta?.label && (
            <Button
              href={primaryCta.href}
              variant="primary"
              size="md"
              aria-label={primaryCta.label}
            >
              {primaryCta.label}
            </Button>
          )}

          {secondaryCta?.href && secondaryCta?.label && (
            <Button
              href={secondaryCta.href}
              variant="outline"
              size="md"
              aria-label={secondaryCta.label}
            >
              {secondaryCta.label}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
