// app/main/products-services/page.tsx
"use client";

import React, { useState } from "react";

// ✅ Route-based hero (Products/Services is handled by the selector)
import HeroSelector from "@/components/main-pages/Home/Hero/HeroSelector";

// ✅ Core layout components
import Divider from "@/components/ui/atoms/Divider/Divider";

// ✅ Section templates
import AutoFlexSection from "@/components/sections/section-layouts/AutoFlexSection/AutoFlexSection";
import TwoColumnSection from "@/components/sections/section-layouts/TwoColumnSection/TwoColumnSection";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";

// ✅ Feature modules
import Integrations from "@/components/main-pages/Products-Services/Integrations/Integrations";
import QuoteCTA from "@/components/main-pages/Products-Services/QuoteCTA/QuoteCTA";

// ✅ UI molecules and atoms
import ServiceCard from "@/components/ui/molecules/Card/ServiceCard";
import StatsHighlight from "@/components/ui/molecules/Form/StatsHighlight";
import QuoteFormModal from "@/components/ui/molecules/Modal/QuoteFormModal";

// ✅ UI organisms
import TestimonialSlider from "@/components/ui/organisms/Testimonials/TestimonialSlider";

// ✅ CTA sections
import PartnerWithUsCTA from "@/components/sections/section-layouts/CTASection/PartnerWithUsCTA";
import MarketingCTA from "@/components/main-pages/Products-Services/Marketing/MarketingCTA";

// ✅ Legacy components
import DynamicServiceSection from "@/components/sections/section-layouts/DynamicServiceSection/DynamicServiceSection";

// ✅ Gallery components
import ImageGrid from "@/components/ui/molecules/Gallery/ImageGrid";

// ✅ Mock data
import productsServicesData from "@/mock/productsServicesPage";
import servicesSections from "@/mock/servicesSectionData";

const ProductsServicesPage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const {
    testimonialsSection,
    testimonials,
    integrations,
    statsSection,
    stats,
    servicesOverviewSection,
  } = productsServicesData;

  return (
    <>
      {/* 🔹 Hero (auto-selected for "/products-services") */}
      <HeroSelector />

      {/* Services Overview */}
      <AutoFlexSection
        title={servicesOverviewSection.title}
        description={servicesOverviewSection.description}
        columns={2}
      >
        {servicesOverviewSection.services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </AutoFlexSection>
      <Divider />

      {/* Dynamic Service Sections */}
      {servicesSections.map((section, idx) => {
        const isReverse = idx % 2 !== 0;
        const imageGridItems = section.images.map((img, i) => ({
          id: i,
          src: img.path,
          alt: img.alt,
          label: img.label,
        }));

        return (
          <React.Fragment key={section.id}>
            <TwoColumnSection
              title={section.title}
              description={section.subtitle}
              leftContent={
                <DynamicServiceSection
                  id={section.id}
                  title={section.title}
                  subtitle={section.subtitle}
                  description={section.description}
                  listTitle={section.listTitle}
                  items={section.items}
                  primaryCTA={section.primaryCTA}
                  secondaryCTA={section.secondaryCTA}
                />
              }
              rightContent={<ImageGrid items={imageGridItems} />}
              isReverse={isReverse}
            />
            <Divider />
          </React.Fragment>
        );
      })}

      {/* Integrations */}
      <FullWidthSection
        title={integrations.title}
        description={integrations.description}
      >
        <Integrations />
      </FullWidthSection>
      <Divider />

      {/* Testimonials */}
      <FullWidthSection
        title={testimonialsSection.title}
        description={testimonialsSection.description}
        align="center"
      >
        <TestimonialSlider data={testimonials} />
      </FullWidthSection>
      <Divider />

      {/* Stats */}
      <FullWidthSection
        title={statsSection.title}
        description={statsSection.subtitle}
      >
        <StatsHighlight stats={stats} />
      </FullWidthSection>
      <Divider />

      {/* CTAs & Modal */}
      <FullWidthSection>
        <QuoteCTA onOpenModal={() => setIsQuoteModalOpen(true)} />
      </FullWidthSection>
      <Divider />

      <FullWidthSection>
        <PartnerWithUsCTA />
      </FullWidthSection>
      <Divider />

      <FullWidthSection>
        <MarketingCTA />
      </FullWidthSection>
      <Divider />

      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </>
  );
};

export default ProductsServicesPage;
