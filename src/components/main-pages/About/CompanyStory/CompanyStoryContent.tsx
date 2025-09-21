"use client";

import React from "react";
import "./CompanyStoryContent.css";
import Divider from "@/components/ui/atoms/Divider/Divider";
import Button from "@/components/ui/atoms/Button/Button";
import type { CompanyStory } from "@/data/page/main-pages/about/types";

export type CompanyStoryContentProps = {
  data: CompanyStory;   // page-level data
  className?: string;
};

export default function CompanyStoryContent({ data, className }: CompanyStoryContentProps) {
  const { heading, subheading, body, highlights } = data;

  // Legacy compatibility: some older data used a single "highlight" string and inline CTA
  const legacyHighlight = (data as any)?.highlight as string | undefined;
  const legacyCta = (data as any)?.cta as
    | { label?: string; text?: string; href?: string; link?: string }
    | undefined;

  const ctaLabel = legacyCta?.label ?? legacyCta?.text;
  const ctaHref = legacyCta?.href ?? legacyCta?.link;

  return (
    <div className={`companystory-content-wrapper ${className ?? ""}`.trim()}>
      <div className="companystory-title-wrapper">
        {heading && <h2 className="companystory-content-heading">{heading}</h2>}
        <Divider className="companystory-content-divider" />
      </div>

      {subheading && (
        <p className="companystory-content-description">{subheading}</p>
      )}

      {/* Body blocks (paragraphs/lists) */}
      {Array.isArray(body) &&
        body.map((block, idx) => {
          if (block.type === "paragraph") {
            return (
              <p key={`cs-p-${idx}`} className="companystory-content-description">
                {block.content}
              </p>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={`cs-ul-${idx}`} className="companystory-content-list">
                {block.items.map((item, i) => (
                  <li key={`cs-li-${idx}-${i}`}>{item}</li>
                ))}
              </ul>
            );
          }
          return null;
        })}

      {/* Legacy single highlight OR modern highlights[] */}
      {legacyHighlight && (
        <p className="companystory-content-highlight">{legacyHighlight}</p>
      )}

      {Array.isArray(highlights) && highlights.length > 0 && (
        <ul className="companystory-content-highlights">
          {highlights.map((h, i) => (
            <li key={`cs-hl-${i}`} className="companystory-content-highlight">
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* Legacy inline CTA (new data usually uses a separate JoinUsCTA section) */}
      {ctaLabel && ctaHref && (
        <div className="companystory-content-cta">
          <Button href={ctaHref} variant="primary" size="md">
            {ctaLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
