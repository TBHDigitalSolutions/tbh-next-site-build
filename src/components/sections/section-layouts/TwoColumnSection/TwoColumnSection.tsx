"use client";

import React from "react";
import Divider from "@/components/ui/atoms/Divider/Divider";
import "./TwoColumnSection.css";

interface TwoColumnSectionProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  sectionTitle?: string;
  sectionSubtitle?: string;
  sectionDescription?: string;
  padding?: string;
  columnGap?: string;
  lightBg?: string;
  darkBg?: string;
  isReverse?: boolean;
  sectionId?: string;
} 

const TwoColumnSection: React.FC<TwoColumnSectionProps> = ({
  leftContent,
  rightContent,
  sectionTitle,
  sectionSubtitle,
  sectionDescription,
  padding = "var(--spacing-xl) var(--spacing-md)",
  columnGap = "var(--spacing-lg)",
  lightBg = "var(--color-variant-1)",
  darkBg = "var(--color-variant-3)",
  isReverse = false,
  sectionId,
}) => {
  return (
    <section
      id={sectionId}
      className="twocolumn-section"
      style={{
        padding,
        backgroundColor: `var(--theme-color, ${lightBg})`,
      }}
      data-light-bg={lightBg}
      data-dark-bg={darkBg}
    >
      <div className="twocolumn-section__container">
        {(sectionTitle || sectionSubtitle || sectionDescription) && (
          <div className="twocolumn-section__header">
            {sectionTitle && (
              <h2 className="twocolumn-section__heading">{sectionTitle}</h2>
            )}
            <Divider />
            {sectionSubtitle && (
              <p className="twocolumn-section__subtitle">{sectionSubtitle}</p>
            )}
            {sectionDescription && (
              <p className="twocolumn-section__description">
                {sectionDescription}
              </p>
            )}
          </div>
        )}

        <div
          className={`twocolumn-section__columns ${
            isReverse ? "twocolumn-section__columns--reverse" : ""
          }`}
          style={{ gap: columnGap }}
        >
          <div className="twocolumn-section__left">{leftContent}</div>
          <div className="twocolumn-section__right">{rightContent}</div>
        </div>
      </div>
    </section>
  );
};

export default TwoColumnSection;
