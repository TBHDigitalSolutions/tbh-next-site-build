// src/app/page.tsx
"use client";

import React, { useState } from "react";

// ✅ Add the HeroSelector for route-based hero (home = "/")
import HeroSelector from "@/components/main-pages/Home/Hero/HeroSelector";

// Section Templates
import AutoFlexSection from "@/components/sections/section-layouts/AutoFlexSection/AutoFlexSection";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";

// Cards & Components
import ServiceCard from "@/components/main-pages/Home/Services/ServiceCard";
import IndustryCard from "@/components/main-pages/Home/Industries/IndustryCard";
import PortfolioItem from "@/components/main-pages/Home/Portfolio/PortfolioItem";
import Contact from "@/components/main-pages/Home/Contact/Contact";
import ContactModal from "@/components/ui/molecules/Modal/ContactModal";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Mock Data
import serviceCardData from "@/mock/ServiceCardData";
import industriesData from "@/mock/industriesData";
import portfolioData from "@/mock/portfolioData";

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Hero (selected automatically for "/") */}
      <HeroSelector />

      {/* Services Section */}
      <AutoFlexSection
        title={serviceCardData.sectionTitle}
        description={serviceCardData.sectionDescription}
        columns={3}
        sectionId="services"
      >
        {serviceCardData.services.map((service, idx) => (
          <ServiceCard key={idx} {...service} />
        ))}
      </AutoFlexSection>
      <Divider />

      {/* Industries Section */}
      <AutoFlexSection
        title="Industries We Serve"
        description="Explore the diverse industries we serve…"
        columns={4}
        sectionId="industries"
      >
        {industriesData.map((industry, idx) => (
          <IndustryCard
            key={idx}
            title={industry.name}
            description={industry.description}
            icon={React.createElement(industry.icon)}
          />
        ))}
      </AutoFlexSection>
      <Divider />

      {/* Portfolio Section */}
      <AutoFlexSection
        title={portfolioData.sectionTitle}
        description={portfolioData.sectionDescription}
        columns={3}
        sectionId="portfolio"
        padding="var(--spacing-xl) var(--spacing-md)"
      >
        {portfolioData.portfolioItems.map((item, idx) => (
          <PortfolioItem
            key={idx}
            title={item.title}
            videoSrc={item.videoSrc}
            fallbackImage={item.fallbackImage}
            description={item.description}
          />
        ))}
      </AutoFlexSection>
      <Divider />

      {/* Contact Section */}
      <FullWidthSection
        title="Let's Connect"
        description="Ready to elevate your digital presence? Reach out today."
        sectionId="contact"
        padding="var(--spacing-xl) var(--spacing-md)"
      >
        <Contact />
      </FullWidthSection>
      <Divider />

      {/* Contact Modal */}
      {isModalOpen && (
        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default HomePage;
