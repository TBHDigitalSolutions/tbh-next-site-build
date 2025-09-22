"use client";

import React from "react";
// ✅ Shared‑UI Divider
import Divider from "@/components/ui/atoms/Divider/Divider";
// ✅ Shared‑UI Button
import Button from "@/components/ui/atoms/Button/Button";

import "./DynamicServiceSection.css";

interface CTA {
  text: string;
  link: string;
}

interface DynamicServiceSectionProps {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  listTitle?: string;
  items?: string[];
  primaryCTA: CTA;
  secondaryCTA?: CTA;
}

const DynamicServiceSection: React.FC<DynamicServiceSectionProps> = ({
  id,
  title,
  subtitle,
  description,
  listTitle,
  items,
  primaryCTA,
  secondaryCTA,
}) => {
  return (
    <div id={id} className="dynamic-service-section">
      {/* ✅ Header */}
      <div className="dynamic-service-section__header">
        <h3 className="dynamic-service-section__title">{title}</h3>
        <Divider />
        <p className="dynamic-service-section__subtitle">{subtitle}</p>
      </div>

      {/* ✅ Content */}
      <div className="dynamic-service-section__content">
        <p className="dynamic-service-section__description">{description}</p>
        {items && items.length > 0 && (
          <div className="dynamic-service-section__list-wrapper">
            {listTitle && (
              <h4 className="dynamic-service-section__list-title">{listTitle}</h4>
            )}
            <ul className="dynamic-service-section__list">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="dynamic-service-section__list-item"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ✅ Buttons */}
      <div className="dynamic-service-section__buttons">
        <Button href={primaryCTA.link} variant="primary" size="large">
          {primaryCTA.text}
        </Button>
        {secondaryCTA && (
          <Button href={secondaryCTA.link} variant="secondary" size="large">
            {secondaryCTA.text}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DynamicServiceSection;
