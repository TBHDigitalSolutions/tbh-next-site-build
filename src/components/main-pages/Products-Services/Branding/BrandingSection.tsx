"use client";

import React from "react";

interface BrandingCTA {
  text: string;
  link: string;
}

interface BrandingData {
  title: string;
  description: string;
  features: string[];
  image: string;
  cta?: BrandingCTA;
}

interface BrandingSectionProps {
  data?: BrandingData;
}

const BrandingSection: React.FC<BrandingSectionProps> = ({ data }) => {
  if (!data) return null;

  const { title, description, features, image, cta } = data;

  return (
    <section className="branding-section">
      <div className="branding-container">
        {/* ✅ Title & Description */}
        <h2 className="branding-title">{title}</h2>
        <p className="branding-description">{description}</p>

        <div className="branding-content">
          {/* ✅ Features List */}
          <div className="branding-features">
            <h3 className="branding-features-title">Our Branding Services Include:</h3>
            <ul className="branding-features-list">
              {features?.map((feature, index) => (
                <li key={index} className="branding-feature-item">
                  <span className="branding-feature-text">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Image */}
          <div className="branding-image-wrapper">
            <img
              src={image}
              alt="Branding Identity Design"
              className="branding-image"
              loading="lazy"
            />
          </div>
        </div>

        {/* ✅ CTA */}
        {cta && (
          <div className="branding-cta">
            <a href={cta.link} className="branding-button">
              {cta.text}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandingSection;
