// src/components/sections/layouts/Flexbox/AutoFlexSection.tsx
"use client";

import React from "react";

// ✅ Fixed import path - using correct @ path based on directory structure
import Divider from "@/components/ui/atoms/Divider/Divider";

// ✅ Local styles
import "./AutoFlexSection.css";

interface AutoFlexSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode[];
  columns?: 1 | 2 | 3 | 4;
  padding?: string;
  gap?: string;
  sectionId?: string;
  lightBg?: string;
  darkBg?: string;
}

const AutoFlexSection: React.FC<AutoFlexSectionProps> = ({
  title,
  description,
  children,
  columns = 4,
  padding = "var(--spacing-lg)",
  gap = "var(--spacing-md)",
  lightBg = "var(--color-variant-1)",
  darkBg = "var(--color-variant-3)",
  sectionId = `autoflex-${Math.random().toString(36).substr(2, 9)}`
}) => {
  return (
    <section
      id={sectionId}
      className={`auto-flex-section auto-flex-columns-${columns}`}
      style={{
        padding,
        backgroundColor: `var(--theme-color, ${lightBg})`,
      }}
      data-light-bg={lightBg}
      data-dark-bg={darkBg}
    >
      <div className="auto-flex-section__container">
        {/* ✅ Section Header */}
        {(title || description) && (
          <div className="auto-flex-section__header">
            {title && <h2 className="auto-flex-section__title">{title}</h2>}
            {/* ✅ Divider only under title */}
            <Divider />
            {description && (
              <p className="auto-flex-section__description">{description}</p>
            )}
          </div>
        )}

        {/* ✅ Main Content */}
        <div className="auto-flex-section__wrapper">
          <div className="auto-flex-section__content" style={{ gap }}>
            {children.map((child, index) => (
              <div key={index} className="auto-flex-section__item">
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutoFlexSection;