"use client";

import React, { useId, useState } from "react";
import "./IndustryCard.css";

interface IndustryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

const IndustryCard: React.FC<IndustryCardProps> = ({
  title,
  description,
  icon,
  className,
  ariaLabel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const reactId = useId();
  const titleId = `industry-title-${slug(title)}-${reactId}`;
  const descWrapperId = `industry-desc-${slug(title)}-${reactId}`;

  const handleToggleExpand = () => setIsExpanded((v) => !v);

  return (
    <div
      className={`industry-card ${isExpanded ? "expanded" : ""} ${className ?? ""}`}
      role="article"
      aria-labelledby={titleId}
      tabIndex={0} /* enables focus ring via :focus-visible */
      aria-label={ariaLabel}
    >
      <div className="industry-card-content">
        {/* Icon */}
        <div className="industry-icon" aria-hidden="true">
          {icon}
        </div>

        {/* Title */}
        <h3 id={titleId} className="industry-title">
          {title}
        </h3>

        {/* Collapsible description */}
        <div
          id={descWrapperId}
          className={`industry-description-wrapper ${isExpanded ? "expanded" : ""}`}
          aria-hidden={!isExpanded}
        >
          <p className="industry-description">{description}</p>
        </div>

        {/* Read more / less */}
        <button
          type="button"
          onClick={handleToggleExpand}
          className="industry-button"
          aria-expanded={isExpanded}
          aria-controls={descWrapperId}
          aria-label={`${isExpanded ? "Read less" : "Read more"} about ${title}`}
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </div>
    </div>
  );
};

export default IndustryCard;
