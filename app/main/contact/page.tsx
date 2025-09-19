// app/main/contact/page.tsx
"use client";

import React, { lazy, Suspense } from "react";

// ✅ Route-based hero (Contact is handled by the selector)
import HeroSelector from "@/components/features/home/Hero/HeroSelector";

// ✅ Core components
import ContactInfoGrid from "@/components/features/contact/ContactInfo/ContactInfoGrid";
import Divider from "@/components/core/layout/Divider/Divider";

// ✅ Mock data
import contactPageData from "@/mock/contactPage";

// ✅ Lazy-loaded sections for better performance
const ContactFAQSection = lazy(() =>
  import("@/components/features/contact/FAQ/ContactFAQSection")
);

const LocationMap = lazy(() =>
  import("@/components/features/contact/LocationMap/LocationMap").then((m) => ({
    default: m.default,
  }))
);

// ✅ Fallbacks for Suspense MUST be non-lazy for reliability
import Loader from "@/components/utils/Loader/Loader";

const ContactPage: React.FC = () => {
  const { contactInfo, location, faq } = contactPageData;

  return (
    <div className="contactpage-container">
      {/* 🔹 Hero (auto-selected for "/contact") */}
      <HeroSelector />

      {/* ✅ Section 1: Contact Info Grid */}
      <section className="contactpage-info" aria-labelledby="contact-info-title">
        <ContactInfoGrid
          sectionTitle={contactInfo.sectionTitle}
          contactInfo={contactInfo.cards}
        />
      </section>

      {/* ✅ Divider between sections */}
      <Divider />

      {/* ✅ Section 2: Location Map */}
      <section className="contactpage-map" aria-labelledby="location-map-title">
        <Suspense fallback={<Loader />}>
          <LocationMap
            sectionTitle={location.sectionTitle}
            latitude={location.latitude}
            longitude={location.longitude}
            googleMapsApiKey={location.googleMapsApiKey}
          />
        </Suspense>
      </section>

      {/* ✅ Divider between sections */}
      <Divider />

      {/* ✅ Section 3: FAQ */}
      <section className="contactpage-faq" aria-labelledby="faq-title">
        <Suspense fallback={<Loader />}>
          <ContactFAQSection
            sectionTitle={faq.sectionTitle}
            faqData={faq.questions}
          />
        </Suspense>
      </section>

      {/* ✅ Final divider at the end (optional) */}
      <Divider />
    </div>
  );
};

export default ContactPage;
