// app/@modal/book/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookingModalClient } from "./parts/BookingModalClient";
import { getBookingModalConfig } from "@/data/booking";
import { validateCanonicalService } from "@/lib/validators";

// ============================================================================
// Metadata (minimal for parallel route modal)
// ============================================================================

export const metadata: Metadata = {
  title: "Schedule a Consultation",
  description: "Book a consultation with our team",
  robots: { 
    index: false, 
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true
  }
};

// ============================================================================
// Props & Types
// ============================================================================

interface ParallelModalPageProps {
  searchParams?: {
    service?: string;
    provider?: "cal" | "calendly" | "acuity" | "custom";
    meetingType?: string;
    theme?: "light" | "dark";
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    ref?: string;
    trigger?: "cta" | "navigation" | "direct";
  };
}

// ============================================================================
// Enhanced Loading Component
// ============================================================================

function ParallelModalSkeleton() {
  return (
    <div
      className="parallel-modal-skeleton"
      style={{
        position: "fixed",
        inset: 0,
        background: "color-mix(in oklab, var(--overlay-dark, rgba(0,0,0,0.85)) 60%, transparent)",
        backdropFilter: "blur(12px) saturate(180%)",
        zIndex: 1000,
        display: "grid",
        alignItems: "center",
        justifyItems: "center",
        padding: "clamp(16px, 5vw, 40px)",
        animation: "fadeIn 0.2s ease-out"
      }}
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="Loading booking modal"
    >
      <div
        className="parallel-modal-content"
        style={{
          width: "min(920px, 96vw)",
          maxWidth: "920px",
          minHeight: "520px",
          maxHeight: "92vh",
          borderRadius: "var(--radius-xl, 20px)",
          background: "var(--bg-surface, #ffffff)",
          border: "1px solid var(--border-subtle, #e5e7eb)",
          boxShadow: "var(--shadow-3xl, 0 35px 60px -12px rgba(0, 0, 0, 0.3))",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          animation: "slideInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Modal Header */}
        <header
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle, #e5e7eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--bg-surface, #ffffff)"
          }}
        >
          <div
            style={{
              height: "24px",
              width: "220px",
              borderRadius: "8px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 20%, rgba(255,255,255,0.9) 50%, var(--bg-elevated, #f8f9fa) 80%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: "36px",
              width: "100px",
              borderRadius: "10px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 20%, rgba(255,255,255,0.9) 50%, var(--bg-elevated, #f8f9fa) 80%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite 0.1s",
            }}
          />
        </header>
        
        {/* Modal Body */}
        <main style={{ padding: "24px", display: "grid", gap: "20px", overflow: "hidden" }}>
          {/* Title skeleton */}
          <div
            style={{
              height: "28px",
              width: "65%",
              borderRadius: "10px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 20%, rgba(255,255,255,0.9) 50%, var(--bg-elevated, #f8f9fa) 80%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite 0.2s",
            }}
          />
          
          {/* Subtitle skeleton */}
          <div
            style={{
              height: "18px",
              width: "85%",
              borderRadius: "8px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 20%, rgba(255,255,255,0.9) 50%, var(--bg-elevated, #f8f9fa) 80%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite 0.3s",
            }}
          />
          
          {/* Main content skeleton */}
          <div
            style={{
              height: "350px",
              borderRadius: "14px",
              border: "2px solid var(--border-subtle, #e5e7eb)",
              background: "linear-gradient(135deg, var(--bg-elevated, #f8f9fa) 0%, rgba(255,255,255,0.9) 50%, var(--bg-elevated, #f8f9fa) 100%)",
              backgroundSize: "400% 400%",
              animation: "shimmerGradient 3s ease-in-out infinite 0.4s",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Inner content hints */}
            <div style={{ 
              position: "absolute", 
              top: "20px", 
              left: "20px", 
              right: "20px",
              display: "grid",
              gap: "12px"
            }}>
              <div style={{
                height: "16px",
                width: "40%",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.7)",
              }} />
              <div style={{
                height: "32px",
                width: "80%",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.7)",
              }} />
              <div style={{
                height: "16px",
                width: "60%",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.7)",
              }} />
            </div>
          </div>
        </main>
        
        {/* Modal Footer */}
        <footer
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-subtle, #e5e7eb)",
            background: "var(--bg-surface, #ffffff)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div
            style={{
              height: "14px",
              width: "140px",
              borderRadius: "6px",
              background: "linear-gradient(90deg, var(--bg-elevated, #f8f9fa) 20%, rgba(255,255,255,0.9) 50%, var(--bg-elevated, #f8f9fa) 80%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite 0.5s",
            }}
          />
          <div
            style={{
              height: "32px",
              width: "120px",
              borderRadius: "8px",
              background: "linear-gradient(90deg, var(--accent-primary, #2563eb) 20%, var(--accent-primary-light, #3b82f6) 50%, var(--accent-primary, #2563eb) 80%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite 0.6s",
            }}
          />
        </footer>
      </div>
      
      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInScale {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        
        @keyframes shimmerGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Error Boundary Component
// ============================================================================

function ParallelModalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "color-mix(in oklab, var(--overlay-dark, rgba(0,0,0,0.85)) 60%, transparent)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Booking modal error"
    >
      <div
        style={{
          background: "var(--bg-surface, #ffffff)",
          border: "1px solid var(--border-error, #fca5a5)",
          borderRadius: "var(--radius-xl, 20px)",
          padding: "40px",
          maxWidth: "520px",
          textAlign: "center",
          boxShadow: "var(--shadow-2xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25))"
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--bg-error-soft, #fef2f2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px auto"
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" 
              stroke="var(--text-error, #dc2626)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <h2 style={{ 
          margin: "0 0 16px 0", 
          color: "var(--text-error, #dc2626)",
          fontFamily: "var(--font-heading)",
          fontSize: "24px",
          fontWeight: 700
        }}>
          Unable to Load Booking Modal
        </h2>
        
        <p style={{ 
          margin: "0 0 32px 0", 
          color: "var(--text-secondary, #6b7280)",
          lineHeight: 1.6,
          fontSize: "16px"
        }}>
          We encountered an issue loading the booking interface. You can try again or visit our main booking page to schedule your consultation.
        </p>
        
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              border: "2px solid var(--border-subtle, #e5e7eb)",
              borderRadius: "10px",
              background: "var(--bg-surface, #ffffff)",
              color: "var(--text-primary, #111827)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s ease",
              minWidth: "120px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--border-primary, #d1d5db)";
              e.currentTarget.style.background = "var(--bg-elevated, #f8f9fa)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle, #e5e7eb)";
              e.currentTarget.style.background = "var(--bg-surface, #ffffff)";
            }}
          >
            Try Again
          </button>
          
          <a
            href="/book"
            style={{
              padding: "12px 24px",
              border: "none",
              borderRadius: "10px",
              background: "var(--accent-primary, #2563eb)",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              minWidth: "120px",
              justifyContent: "center"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "var(--accent-primary-hover, #1d4ed8)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "var(--accent-primary, #2563eb)";
            }}
          >
            Go to Booking Page
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Parallel Modal Page Component
// ============================================================================

export default async function ParallelModalBookPage({ searchParams = {} }: ParallelModalPageProps) {
  const {
    service,
    provider = "cal",
    meetingType,
    theme = "light",
    utm_source,
    utm_medium,
    utm_campaign,
    ref,
    trigger = "navigation"
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

  // Get modal configuration optimized for parallel routes
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
        trigger,
        mode: "parallel_modal"
      },
      // Parallel route specific optimizations
      optimizeFor: "parallel_route",
      preloadAssets: true
    });
  } catch (error) {
    console.error("Failed to load parallel modal config:", error);
    notFound();
  }

  // Enhanced analytics context for parallel route
  const analyticsContext = {
    context: "parallel_modal_route",
    service: canonicalService,
    utm_source,
    utm_medium,
    utm_campaign,
    ref,
    trigger,
    mode: "parallel_modal",
    route_type: "intercepted"
  };

  return (
    <Suspense fallback={<ParallelModalSkeleton />}>
      <BookingModalClient
        config={modalConfig}
        service={canonicalService}
        provider={provider as any}
        meetingType={meetingType}
        theme={theme}
        variant="parallel"
        prefill={{
          service: canonicalService,
          source: ref || utm_source,
          utm_source,
          utm_medium,
          utm_campaign,
          trigger
        }}
        analytics={analyticsContext}
        fallbackUrl={`/book?${new URLSearchParams(searchParams as Record<string, string>).toString()}`}
        // Parallel route specific props
        enableInterception={true}
        enableBackdropClose={true}
        enableKeyboardNavigation={true}
        autoFocus={true}
        // Error handling
        errorBoundary={ParallelModalError}
        onError={(error) => {
          console.error("Parallel modal error:", error);
          // Track error in analytics
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'booking_modal_error', {
              error_type: error.name,
              error_message: error.message,
              context: 'parallel_route'
            });
          }
        }}
        // Performance optimizations
        lazy={false} // Don't lazy load in parallel route
        preloadScheduler={true}
        optimizeRendering={true}
      />
    </Suspense>
  );
}

// ============================================================================
// Route Configuration
// ============================================================================

// Disable static generation for this modal route
export const dynamic = 'force-dynamic';

// Fast revalidation for modal content
export const revalidate = 300;

// ============================================================================
// Client Component Exports
// ============================================================================

/* 
This parallel route modal should be used with:

1. Layout Configuration:
   - app/layout.tsx should include @modal slot
   - Enable parallel route interception

2. BookingModalClient Location:
   - app/@modal/book/parts/BookingModalClient.tsx

3. Key Features:
   - Backdrop click to close
   - ESC key handling  
   - Focus trapping
   - Scroll locking
   - Router integration
   - Analytics tracking
   - Error boundaries
   - Performance optimization

4. Usage Pattern:
   - Triggered by router.push('/book?...')
   - Renders over current page
   - Maintains page state
   - Supports deep linking
   - Graceful fallback to /book page

5. Accessibility Features:
   - ARIA modal attributes
   - Focus management
   - Screen reader support
   - Keyboard navigation
   - Color contrast compliance
   - Motion reduction support
*/