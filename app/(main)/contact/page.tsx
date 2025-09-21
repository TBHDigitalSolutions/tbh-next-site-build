// app/(main)/contact/page.tsx
"use client";

import React, { lazy, Suspense } from "react";

// ✅ Route-based hero (Contact is handled by the selector)
import HeroSelector from "@/components/main-pages/Home/Hero/HeroSelector";

// ✅ Core layout/atoms (unchanged)
import Divider from "@/components/ui/atoms/Divider/Divider";

// ✅ Feature components (Contact sections)
import ContactInfoGrid from "@/components/main-pages/Contact/ContactInfo/ContactInfoGrid";

// Keep lazy sections for perf
const ContactFAQSection = lazy(
  () => import("@/components/main-pages/Contact/FAQ/ContactFAQSection")
);
const LocationMap = lazy(
  () =>
    import("@/components/main-pages/Contact/LocationMap/LocationMap").then(
      (m) => ({ default: m.default })
    )
);

// ✅ Suspense fallback
import Loader from "@/components/utils/Loader/Loader";

// ✅ Page-level data (single source of truth)
import contactPageData from "@/data/page/main-pages/contact";
import type {
  ContactOption,
  ContactPageData,
} from "@/data/page/main-pages/contact/types";

import styles from "./contact.module.css";

/* ----------------------------------------------------------------------------
 * Adapters (page-level only) — keep components dumb and data-agnostic
 * ---------------------------------------------------------------------------- */

// ContactInfoGrid (legacy) expects `cards` like:
// { id: number; title: string; description: string; details: string; link: string; icon: string; }
// We’ll adapt our new `options` + `location` to that shape.
function toContactCards(
  options: ContactPageData["options"],
  location: ContactPageData["location"]
) {
  const lastAddressLine =
    location.addressLines?.[location.addressLines.length - 1] ?? "";

  const deriveDetails = (opt: ContactOption): string => {
    const href = opt.href || "";
    if (href.startsWith("mailto:")) return href.replace("mailto:", "");
    if (href.startsWith("tel:")) return href.replace("tel:", "");
    if (opt.id === "location") return lastAddressLine || "View on Maps";
    // Fallback to a human label if provided, otherwise the option title
    return opt.description || opt.ctaLabel || opt.title;
  };

  return options.map((opt, i) => ({
    id: i + 1,
    title: opt.title,
    description: opt.description ?? "",
    details: deriveDetails(opt),
    link: opt.href,
    icon: opt.icon ?? "",
  }));
}

// ContactFAQSection expects { sectionTitle, faqData: { question, answer }[] }
function toFaqProps(faq: ContactPageData["faq"]) {
  return {
    sectionTitle: faq.title,
    faqData: faq.items.map(({ question, answer }) => ({ question, answer })),
  };
}

// LocationMap expects { sectionTitle, latitude, longitude, googleMapsApiKey }
// We’ll pass a sensible section title if you didn’t provide one in UI.
function toLocationProps(location: ContactPageData["location"]) {
  return {
    sectionTitle: "Our Location",
    latitude: location.lat ?? 0,
    longitude: location.lng ?? 0,
    // If your LocationMap supports embed instead, keep using lat/lng for now.
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  };
}

/* ----------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------------- */

export default function ContactPage() {
  const { hero, options, info, faq, trust, location, cta } = contactPageData;

  // Adapt data for legacy components
  const cards = toContactCards(options, location);
  const faqProps = toFaqProps(faq);
  const locationProps = toLocationProps(location);

  return (
    <div className={styles.container}>
      {/* 🔹 Hero (auto-selected for "/contact") */}
      <HeroSelector />

      {/* ✅ Section 1: Contact Info Grid */}
      <section
        className={styles.infoSection}
        aria-labelledby="contact-info-title"
      >
        <ContactInfoGrid
          sectionTitle={info.title ?? "Contact Information"}
          contactInfo={cards}
        />
      </section>

      <Divider />

      {/* ✅ Section 2: Location Map */}
      <section className={styles.mapSection} aria-labelledby="location-map">
        <Suspense fallback={<Loader />}>
          <LocationMap {...locationProps} />
        </Suspense>
      </section>

      <Divider />

      {/* ✅ Section 3: FAQ */}
      <section className={styles.faqSection} aria-labelledby="contact-faq">
        <Suspense fallback={<Loader />}>
          <ContactFAQSection
            sectionTitle={faqProps.sectionTitle}
            faqData={faqProps.faqData}
          />
        </Suspense>
      </section>

      <Divider />
    </div>
  );
}
