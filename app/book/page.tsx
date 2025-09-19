// app/book/page.tsx
import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { BookingHubTemplate } from "@/booking/templates/BookingHubTemplate";
import { getBookingHubConfig } from "@/data/booking";
import { adaptBookingHubConfig } from "@/booking/lib/adapters";
import { validateCanonicalService } from "@/lib/validators";

// ============================================================================
// Metadata & SEO
// ============================================================================

export const metadata: Metadata = {
  title: "Schedule a Consultation | Book Your Service Call",
  description: "Book a consultation with our team. Choose from web development, video production, SEO, marketing, and content services. Schedule your call today.",
  keywords: ["book consultation", "schedule call", "web development", "video production", "seo services", "marketing"],
  alternates: { canonical: "/book" },
  openGraph: {
    title: "Schedule a Consultation",
    description: "Book a consultation with our team for web development, video production, SEO, and marketing services.",
    url: "/book",
    type: "website",
    images: [
      {
        url: "/images/og/booking-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Schedule a consultation with our team"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Schedule a Consultation",
    description: "Book a consultation with our team for web development, video production, SEO, and marketing services.",
    images: ["/images/og/booking-hero.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  }
};

// ============================================================================
// Props & Params
// ============================================================================

interface BookPageProps {
  searchParams?: {
    service?: string;
    provider?: "cal" | "calendly" | "acuity" | "custom";
    meetingType?: string;
    theme?: "light" | "dark";
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    ref?: string;
  };
}

// ============================================================================
// JSON-LD Structured Data
// ============================================================================

function BookingJsonLd({ config }: { config: any }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/book#webpage`,
        url: `${baseUrl}/book`,
        name: "Schedule a Consultation",
        description: "Book a consultation with our team for professional services",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${baseUrl}#website`,
          url: baseUrl,
          name: config.organization?.name || "TBH Digital Solutions"
        }
      },
      {
        "@type": "ContactPage",
        "@id": `${baseUrl}/book#contactpage`,
        url: `${baseUrl}/book`,
        name: "Schedule a Consultation",
        description: "Book a consultation with our team",
        mainEntity: {
          "@type": "Organization",
          name: config.organization?.name || "TBH Digital Solutions",
          url: baseUrl,
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: "English"
          }
        }
      }
    ]
  };

  if (config.faq && config.faq.length > 0) {
    jsonLd["@graph"].push({
      "@type": "FAQPage",
      "@id": `${baseUrl}/book#faq`,
      mainEntity: config.faq.map((item: any) => ({
        "@type": "Question",
        name: item.q || item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a || item.answer
        }
      }))
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function BookPage({ searchParams = {} }: BookPageProps) {
  const {
    service,
    provider = "cal",
    meetingType,
    theme = "light",
    utm_source,
    utm_medium,
    utm_campaign,
    ref
  } = searchParams;

  // Validate service parameter if provided
  let canonicalService = undefined;
  if (service) {
    const validationResult = validateCanonicalService(service);
    if (!validationResult.isValid) {
      notFound();
    }
    canonicalService = validationResult.service;
  }

  // Get booking configuration from data layer
  let bookingConfig;
  try {
    bookingConfig = await getBookingHubConfig({
      service: canonicalService,
      provider: provider as any,
      theme,
      analytics: {
        utm_source,
        utm_medium,
        utm_campaign,
        ref
      }
    });
  } catch (error) {
    console.error("Failed to load booking config:", error);
    notFound();
  }

  // Adapt configuration for template
  const templateProps = adaptBookingHubConfig(bookingConfig, {
    service: canonicalService,
    meetingType,
    prefill: {
      service: canonicalService,
      source: ref || utm_source
    },
    analytics: {
      context: "book_page",
      service: canonicalService,
      utm_source,
      utm_medium,
      utm_campaign,
      ref
    }
  });

  return (
    <Fragment>
      <BookingJsonLd config={bookingConfig} />
      
      <BookingHubTemplate
        {...templateProps}
        analytics={{
          ...templateProps.analytics,
          pageType: "booking_hub",
          canonicalService,
          source: "direct_visit"
        }}
      />
    </Fragment>
  );
}

// ============================================================================
// Runtime Configuration
// ============================================================================

// Enable static generation for common paths
export function generateStaticParams() {
  return [
    {},
    { service: "web-development-services" },
    { service: "video-production-services" },
    { service: "seo-services" },
    { service: "marketing-services" },
    { service: "lead-generation-services" },
    { service: "content-production-services" }
  ];
}

// Revalidate every 24 hours
export const revalidate = 86400;