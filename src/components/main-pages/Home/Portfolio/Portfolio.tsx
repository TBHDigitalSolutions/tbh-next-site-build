// src/components/features/home/Portfolio/Portfolio.tsx

"use client";

import React from "react";

// ✅ Fixed import paths - using correct structure
import portfolioData from "@/mock/portfolioData";
import AutoFlexSection from "@/components/sections/layouts/Flexbox/AutoFlexSection";
import PortfolioItem from "./PortfolioItem";

// ✅ Import local CSS
import "./Portfolio.css";

const Portfolio: React.FC = () => {
  const { sectionTitle, sectionDescription, portfolioItems } = portfolioData;

  return (
    <AutoFlexSection
      title={sectionTitle}
      description={sectionDescription}
      columns={3} // Three columns for desktop layout
      sectionId="portfolio"
      padding="var(--section-padding-major)"
    >
      {portfolioItems.map((item, index) => (
        <PortfolioItem
          key={`portfolio-item-${index}`} // ✅ Better key structure
          title={item.title}
          videoSrc={item.videoSrc}
          fallbackImage={item.fallbackImage}
          description={item.description}
        />
      ))}
    </AutoFlexSection>
  );
};

export default Portfolio;