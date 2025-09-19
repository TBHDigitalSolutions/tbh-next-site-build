// src/components/features/home/Services/ServiceCard.tsx
"use client";

import React from "react";
import clsx from "clsx";
import "./ServiceCard.css";

interface ServiceCardProps {
  title: string;
  description: string;
  highlights?: string[];
  className?: string;
  /** Optional aria-label override for the article */
  ariaLabel?: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  highlights,
  className,
  ariaLabel,
}) => {
  const id = `service-title-${slugify(title)}`;

  return (
    <article
      className={clsx("service-card", className)}
      role="article"
      aria-labelledby={id}
      aria-label={ariaLabel}
      tabIndex={0} /* enables keyboard focus + :focus-visible styles */
    >
      <div className="service-card-content">
        {/* Title */}
        <h3 id={id} className="service-title">
          {title}
        </h3>

        {/* Description */}
        <p className="service-description">{description}</p>

        {/* Highlights (optional) */}
        {highlights?.length ? (
          <ul className="service-highlights" aria-label={`Key features of ${title}`}>
            {highlights.map((item, idx) => (
              <li
                key={`highlight-${idx}-${item.slice(0, 12)}`}
                className="service-highlight-item"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
};

export default ServiceCard;
