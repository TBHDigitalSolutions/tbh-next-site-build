// app/(modals)/book/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookingModalClient } from "./parts/BookingModalClient";
import { getBookingModalConfig } from "@/data/booking";
import { validateCanonicalService } from "@/lib/validators";

// ============================================================================
// Metadata (minimal for modal route)
// ============================================================================

export const metadata: Metadata = {
  title: "Schedule a Consultation",
  description: "Book a consultation with our team",
  robots: { 
    index: false, 
    follow: false,
    noarchive: true,
    nosnippet: true
  }
};

// ============================================================================
// Props & Types
// ============================================================================

interface BookModalPageProps {
  searchParams?: {
    service?: string;
    provider?: "cal" | "calendly" | "acuity" | "custom";
    meetingType?: string;
    theme?: "light" | "dark";
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    ref?: string;
    mode?: "modal" | "page";
  };
}

// ============================================================================
// Loading Components
// ============================================================================

function ModalSkeleton() {
  return (
    <div
      className="modal-skeleton"
      style={{
        position: "fixed",
        inset: 0,
        background: "color-mix(in oklab, var(--overlay, rgba(0,0,0,0.8)) 50%, transparent)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        padding: "clamp(12px, 4vw, 32px)",
      }}
      role="dialog"
      aria-busy="true"
      aria-label="Loading booking modal"
    >
      <div
        className="modal-skeleton-content"
        style={{
          width: "min(900px, 95vw)",
          maxWidth: "900px",
          minHeight: "500px",
          maxHeight: "90vh",
          borderRadius: "var(--radius-lg, 16px)",
          background: "var(--bg-surface, #ffffff)",
          border: "1px solid var(--border-subtle, #e5e7eb)",
          boxShadow: "var(--shadow-2xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25))",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        {/* Header skeleton */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle, #e5e7eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              height: "20px",
              width: "180px",
              borderRadius: "6px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 25%, rgba(255,255,255,0.8) 50%, var(--bg-elevated, #f8f9fa) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: "32px",
              width: "80px",
              borderRadius: "8px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 25%, rgba(255,255,255,0.8) 50%, var(--bg-elevated, #f8f9fa) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </div>
        
        {/* Body skeleton */}
        <div style={{ padding: "20px", display: "grid", gap: "16px" }}>
          <div
            style={{
              height: "24px",
              width: "60%",
              borderRadius: "8px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 25%, rgba(255,255,255,0.8) 50%, var(--bg-elevated, #f8f9fa) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: "380px",
              borderRadius: "12px",
              border: "1px solid var(--border-subtle, #e5e7eb)",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 25%, rgba(255,255,255,0.8) 50%, var(--bg-elevated, #f8f9fa) 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      
      {/* Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "color-mix(in oklab, var(--overlay, rgba(0,0,0,0.8)) 50%, transparent)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
      role="dialog"
      aria-label="Booking modal error"
    >
      <div
        style={{
          background: "var(--bg-surface, #ffffff)",
          border: "1px solid var(--border-subtle, #e5e7eb)",
          borderRadius: "var(--radius-lg, 16px)",
          padding: "32px",
          maxWidth: "500px",
          textAlign: "center",
          boxShadow: "var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))"
        }}
      >
        <h2 style={{ 
          margin: "0 0 16px 0", 
          color: "var(--text-error, #dc2626)",
          fontFamily: "var(--font-heading)",
          fontSize: "20px",
          fontWeight: 600
        }}>
          Unable to Load Booking
        </h2>
        <p style={{ 
          margin: "0 0 24px 0", 
          color: "var(--text-secondary, #6b7280)",
          lineHeight: 1.6
        }}>
          There was an issue loading the booking modal. Please try again or visit our main booking page.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              border: "1px solid var(--border-subtle, #e5e7eb)",
              borderRadius: "8px",
              background: "var(--bg-surface, #ffffff)",
              color: "var(--text-primary, #111827)",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            Try Again
          </button>
          <a
            href="/book"
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              background: "var(--accent-primary, #2563eb)",
              color: "white",
              textDecoration: "none",
              fontWeight: 500,
              display: "inline-block"
            }}
          >
            Go to Booking Page
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Modal Page Component
// ============================================================================

export default async function BookModalPage({ searchParams = {} }: BookModalPageProps) {
  const {
    service,
    provider = "cal",
    meetingType,
    theme = "light",
    utm_source,
    utm_medium,
    utm_campaign,
    ref,
    mode = "modal"
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

  // Get modal-specific configuration
  let modalConfig;
  try {
    modalConfig = await getBookingModalConfig({
      service: canonicalService,
      provider: provider as any,
      theme,
      meetingType,
      analytics: {
        utm_source,
        utm_medium,
        utm_campaign,
        ref,
        mode: "modal"
      }
    });
  } catch (error) {
    console.error("Failed to load modal config:", error);
    notFound();
  }

  return (
    <Suspense fallback={<ModalSkeleton />}>
      <BookingModalClient
        config={modalConfig}
        service={canonicalService}
        provider={provider as any}
        meetingType={meetingType}
        theme={theme}
        prefill={{
          service: canonicalService,
          source: ref || utm_source,
          utm_source,
          utm_medium,
          utm_campaign
        }}
        analytics={{
          context: "modal_route",
          service: canonicalService,
          utm_source,
          utm_medium,
          utm_campaign,
          ref,
          mode: "modal"
        }}
        fallbackUrl={`/book?${new URLSearchParams(searchParams as Record<string, string>).toString()}`}
      />
    </Suspense>
  );
}

// ============================================================================
// Client Component (extracted to separate file)
// ============================================================================

/* 
This page uses BookingModalClient which should be in:
app/(modals)/book/parts/BookingModalClient.tsx

The client component handles:
- Modal state management
- Focus trapping
- Scroll locking
- Keyboard navigation (ESC to close)
- Analytics tracking
- Error boundaries
- Fallback to full page on errors
*/