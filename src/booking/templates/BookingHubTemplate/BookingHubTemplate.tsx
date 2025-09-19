// src/booking/templates/BookingHubTemplate/BookingHubTemplate.tsx
"use client";

/**
 * BookingHubTemplate - Main booking page template
 * 
 * This template provides a complete page layout for booking experiences with:
 * - Configurable hero section
 * - Main booking orchestration
 * - Optional packages/options display
 * - FAQ section
 * - Trust elements and social proof
 * - CTA sections
 * - Full accessibility and responsive design
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { Suspense } from "react";

// Internal imports
import type {
  BookingHubTemplateProps,
  BookingHubTemplateState,
  BookingHubSection,
  BookingHubContext,
} from "./BookingHubTemplate.types";

// Sections - lazy loaded for performance
import { lazy } from "react";
const BookingHeroSection = lazy(() => import("@/booking/sections/BookingHeroSection"));
const BookingSection = lazy(() => import("@/booking/sections/BookingSection"));
const BookingOptionsSection = lazy(() => import("@/booking/sections/BookingOptionsSection"));
const BookingFAQSection = lazy(() => import("@/booking/sections/BookingFAQSection"));

// Analytics
import { trackBookingView, trackBookingError } from "@/booking/lib/metrics";

// Styles
import styles from "./BookingHubTemplate.module.css";

// ============================================================================
// Default Components
// ============================================================================

function DefaultLoadingComponent() {
  return (
    <div className={styles.loading} role="status" aria-label="Loading booking page">
      <div className={styles.loadingSpinner} />
      <div className={styles.loadingText}>Loading booking options...</div>
    </div>
  );
}

function DefaultErrorComponent({ 
  error, 
  retry 
}: { 
  error: string; 
  retry?: () => void; 
}) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorIcon}>⚠️</div>
      <h2 className={styles.errorTitle}>Unable to Load Booking Page</h2>
      <p className={styles.errorMessage}>{error}</p>
      {retry && (
        <div className={styles.errorActions}>
          <button className={styles.errorRetry} onClick={retry} type="button">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function DefaultEmptyComponent() {
  return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>📋</div>
      <h2 className={styles.errorTitle}>No Booking Options Available</h2>
      <p className={styles.errorMessage}>
        We're currently updating our booking system. Please check back soon or contact us directly.
      </p>
    </div>
  );
}

// ============================================================================
// Section Skeletons
// ============================================================================

function HeroSkeleton() {
  return <div className={clsx(styles.skeleton, styles.skeletonHero)} />;
}

function SectionSkeleton() {
  return <div className={clsx(styles.skeleton, styles.skeletonSection)} />;
}

// ============================================================================
// Trust Section Component
// ============================================================================

function TrustSection({ trust }: { trust: NonNullable<BookingHubTemplateProps["trust"]> }) {
  if (!trust.securityBadges?.length && !trust.certifications?.length && !trust.socialProof?.length) {
    return null;
  }

  return (
    <section className={styles.trust} aria-labelledby="trust-title">
      <div className={styles.container}>
        <div className={styles.trustContent}>
          {/* Security and Certification Badges */}
          {(trust.securityBadges?.length || trust.certifications?.length) && (
            <div className={styles.trustBadges}>
              {trust.securityBadges?.map((badge, i) => (
                <div key={`security-${i}`} className={styles.trustBadge} title={badge.description}>
                  {badge.icon && <div className={styles.trustBadgeIcon}>{badge.icon}</div>}
                  <div className={styles.trustBadgeLabel}>{badge.label}</div>
                </div>
              ))}
              {trust.certifications?.map((cert, i) => (
                <div key={`cert-${i}`} className={styles.trustBadge} title={cert.description}>
                  {cert.icon && <div className={styles.trustBadgeIcon}>{cert.icon}</div>}
                  <div className={styles.trustBadgeLabel}>{cert.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Social Proof */}
          {trust.socialProof?.length && (
            <div className={styles.socialProof}>
              {trust.socialProof.map((proof, i) => (
                <div key={i} className={styles.socialProofItem}>
                  <div className={styles.socialProofContent}>
                    {proof.content}
                  </div>
                  <div className={styles.socialProofAuthor}>
                    {proof.rating && (
                      <div className={styles.socialProofRating}>
                        {Array.from({ length: 5 }, (_, j) => (
                          <span key={j}>
                            {j < proof.rating! ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                    )}
                    <span>
                      {proof.author}
                      {proof.company && ` • ${proof.company}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA Section Component
// ============================================================================

function CTASection({ 
  cta, 
  onCtaClick 
}: { 
  cta: NonNullable<BookingHubTemplateProps["cta"]>;
  onCtaClick?: (cta: string) => void;
}) {
  const handlePrimaryClick = useCallback(() => {
    if (cta.primary?.onClick) {
      cta.primary.onClick();
    }
    onCtaClick?.("primary");
  }, [cta.primary, onCtaClick]);

  const handleSecondaryClick = useCallback((index: number) => {
    const action = cta.secondary?.[index];
    if (action?.onClick) {
      action.onClick();
    }
    onCtaClick?.(`secondary-${index}`);
  }, [cta.secondary, onCtaClick]);

  return (
    <section 
      className={clsx(styles.cta)} 
      data-background={cta.background || "none"}
      aria-labelledby="cta-title"
    >
      <div className={styles.container}>
        {cta.title && (
          <h2 id="cta-title" className={styles.ctaTitle}>
            {cta.title}
          </h2>
        )}
        {cta.subtitle && (
          <p className={styles.ctaSubtitle}>
            {cta.subtitle}
          </p>
        )}

        <div className={styles.ctaActions}>
          {cta.primary && (
            <button
              className={clsx(styles.ctaButton, styles[cta.primary.variant || "primary"])}
              onClick={handlePrimaryClick}
              disabled={cta.primary.disabled}
              type="button"
              data-loading={cta.primary.loading}
            >
              {cta.primary.loading ? "Loading..." : cta.primary.label}
            </button>
          )}

          {cta.secondary?.map((action, i) => (
            <button
              key={i}
              className={clsx(styles.ctaButton, styles[action.variant || "secondary"])}
              onClick={() => handleSecondaryClick(i)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Main Template Component
// ============================================================================

const BookingHubTemplate: React.FC<BookingHubTemplateProps> = ({
  meta,
  features = {
    showHero: true,
    showBooking: true,
    showOptions: false,
    showFAQ: false,
    showCTA: true,
    showTrust: false,
    showBreadcrumbs: false,
  },
  layout = {
    containerSize: "normal",
    sectionSpacing: "comfortable",
    background: "solid",
    headerStyle: "default",
  },
  theme = {
    colorScheme: "light",
    radius: "md",
    scale: "md",
  },
  analytics,
  hero,
  booking,
  options,
  faq,
  trust,
  cta,
  breadcrumbs,
  state,
  service,
  className,
  renderHeader,
  renderFooter,
  renderSidebar,
  "data-testid": testId = "booking-hub-template",
  children,
}) => {
  // ========================================================================
  // State & Refs
  // ========================================================================
  
  const [templateState, setTemplateState] = useState<BookingHubTemplateState>({
    visibleSections: new Set(),
    isClient: false,
    scrollY: 0,
    mobileMenuOpen: false,
  });

  const templateRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTrackedView = useRef(false);

  // ========================================================================
  // Effects
  // ========================================================================

  // Client-side hydration
  useEffect(() => {
    setTemplateState(prev => ({ ...prev, isClient: true }));
  }, []);

  // Analytics - track page view
  useEffect(() => {
    if (!hasTrackedView.current && templateState.isClient && analytics?.autoTrack !== false) {
      const enabledFeatures = Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature);

      trackBookingView({
        context: analytics?.context || "booking_hub",
        service,
        features: enabledFeatures,
        timestamp: Date.now(),
      });

      analytics?.onPageView?.({
        page: "booking_hub",
        service,
        features: enabledFeatures,
        ...analytics.properties,
      });

      hasTrackedView.current = true;
    }
  }, [templateState.isClient, analytics, features, service]);

  // Intersection Observer for section visibility
  useEffect(() => {
    if (!templateState.isClient) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("data-section");
          if (!sectionId) return;

          if (entry.isIntersecting) {
            setTemplateState(prev => ({
              ...prev,
              visibleSections: new Set([...prev.visibleSections, sectionId]),
            }));

            analytics?.onSectionView?.(sectionId, {
              service,
              timestamp: Date.now(),
              ...analytics.properties,
            });
          } else {
            setTemplateState(prev => {
              const newVisible = new Set(prev.visibleSections);
              newVisible.delete(sectionId);
              return { ...prev, visibleSections: newVisible };
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "-10% 0px" }
    );

    // Observe all sections
    const sections = templateRef.current?.querySelectorAll("[data-section]");
    sections?.forEach(section => observerRef.current?.observe(section));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [templateState.isClient, analytics, service]);

  // Scroll tracking
  useEffect(() => {
    if (!templateState.isClient) return;

    const handleScroll = () => {
      setTemplateState(prev => ({ ...prev, scrollY: window.scrollY }));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [templateState.isClient]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleToggleMobileMenu = useCallback(() => {
    setTemplateState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }));
  }, []);

  const handleCtaClick = useCallback((ctaId: string) => {
    analytics?.onCtaClick?.(ctaId, {
      service,
      location: "template_cta",
      timestamp: Date.now(),
      ...analytics.properties,
    });
  }, [analytics, service]);

  const handleError = useCallback((error: Error, section?: string) => {
    trackBookingError({
      context: analytics?.context || "booking_hub",
      service,
      code: "TEMPLATE_ERROR",
      message: error.message,
      section,
      timestamp: Date.now(),
    });

    console.error(`BookingHubTemplate error in ${section || "unknown"} section:`, error);
  }, [analytics?.context, service]);

  // ========================================================================
  // Computed Values
  // ========================================================================

  const contextValue = useMemo<BookingHubContext>(() => ({
    service,
    analytics: analytics || {},
    theme,
    layout,
    features,
  }), [service, analytics, theme, layout, features]);

  const enabledSections = useMemo<BookingHubSection[]>(() => {
    const sections: BookingHubSection[] = [];

    if (features.showHero && hero) {
      sections.push({
        id: "hero",
        name: "Hero",
        enabled: true,
        priority: 1,
        props: hero,
      });
    }

    if (features.showBooking && booking) {
      sections.push({
        id: "booking",
        name: "Booking",
        enabled: true,
        priority: 2,
        props: booking,
      });
    }

    if (features.showOptions && options) {
      sections.push({
        id: "options",
        name: "Options",
        enabled: true,
        priority: 3,
        props: options,
      });
    }

    if (features.showFAQ && faq) {
      sections.push({
        id: "faq",
        name: "FAQ",
        enabled: true,
        priority: 4,
        props: faq,
      });
    }

    if (features.showTrust && trust) {
      sections.push({
        id: "trust",
        name: "Trust",
        enabled: true,
        priority: 5,
        props: trust,
      });
    }

    if (features.showCTA && cta) {
      sections.push({
        id: "cta",
        name: "CTA",
        enabled: true,
        priority: 6,
        props: cta,
      });
    }

    return sections.sort((a, b) => a.priority - b.priority);
  }, [features, hero, booking, options, faq, trust, cta]);

  // ========================================================================
  // Render Helpers
  // ========================================================================

  const renderBreadcrumbs = useCallback(() => {
    if (!features.showBreadcrumbs || !breadcrumbs?.length) return null;

    return (
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <div className={styles.container}>
          <ol className={styles.breadcrumbList}>
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className={styles.breadcrumbItem}>
                {crumb.current ? (
                  <span className={styles.breadcrumbCurrent} aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <a href={crumb.href} className={styles.breadcrumbLink}>
                    {crumb.label}
                  </a>
                )}
                {i < breadcrumbs.length - 1 && (
                  <span className={styles.breadcrumbSeparator} aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    );
  }, [features.showBreadcrumbs, breadcrumbs]);

  const renderSection = useCallback((section: BookingHubSection) => {
    const sectionProps = {
      "data-section": section.id,
      className: styles.section,
      key: section.id,
    };

    try {
      switch (section.id) {
        case "hero":
          return (
            <section {...sectionProps}>
              <Suspense fallback={<HeroSkeleton />}>
                <BookingHeroSection {...(section.props as any)} />
              </Suspense>
            </section>
          );

        case "booking":
          return (
            <section {...sectionProps}>
              <Suspense fallback={<SectionSkeleton />}>
                <BookingSection {...(section.props as any)} />
              </Suspense>
            </section>
          );

        case "options":
          return (
            <section {...sectionProps}>
              <Suspense fallback={<SectionSkeleton />}>
                <BookingOptionsSection {...(section.props as any)} />
              </Suspense>
            </section>
          );

        case "faq":
          return (
            <section {...sectionProps}>
              <Suspense fallback={<SectionSkeleton />}>
                <BookingFAQSection {...(section.props as any)} />
              </Suspense>
            </section>
          );

        case "trust":
          return (
            <section {...sectionProps}>
              <TrustSection trust={section.props as any} />
            </section>
          );

        case "cta":
          return (
            <section {...sectionProps}>
              <CTASection 
                cta={section.props as any} 
                onCtaClick={handleCtaClick}
              />
            </section>
          );

        default:
          if (section.render) {
            return (
              <section {...sectionProps}>
                {section.render()}
              </section>
            );
          }
          return null;
      }
    } catch (error) {
      handleError(error as Error, section.id);
      return (
        <section {...sectionProps}>
          <DefaultErrorComponent 
            error={`Failed to render ${section.name} section`}
            retry={() => window.location.reload()}
          />
        </section>
      );
    }
  }, [handleCtaClick, handleError]);

  // ========================================================================
  // Loading and Error States
  // ========================================================================

  if (state?.loading) {
    return state.LoadingComponent ? (
      <state.LoadingComponent />
    ) : (
      <DefaultLoadingComponent />
    );
  }

  if (state?.error) {
    return state.ErrorComponent ? (
      <state.ErrorComponent 
        error={state.error} 
        retry={() => window.location.reload()} 
      />
    ) : (
      <DefaultErrorComponent 
        error={state.error}
        retry={() => window.location.reload()}
      />
    );
  }

  if (enabledSections.length === 0) {
    return state?.EmptyComponent ? (
      <state.EmptyComponent />
    ) : (
      <DefaultEmptyComponent />
    );
  }

  // ========================================================================
  // Main Render
  // ========================================================================

  const hasEnabledSections = enabledSections.length > 0;
  const hasSidebar = !!renderSidebar;

  return (
    <div
      ref={templateRef}
      className={clsx(
        styles.template,
        {
          [styles.templateWithSidebar]: hasSidebar,
        },
        className
      )}
      data-theme={theme.colorScheme}
      data-background={layout.background}
      data-testid={testId}
    >
      {/* Skip to main content link */}
      <a href="#main-content" className={styles.skipToMain}>
        Skip to main content
      </a>

      {/* Header */}
      {renderHeader ? (
        renderHeader()
      ) : (
        <header className={clsx(styles.header, styles[layout.headerStyle || "default"])}>
          <div className={clsx(styles.container, styles[layout.containerSize || "normal"])}>
            <div className={styles.headerContent}>
              <a href="/" className={styles.logo}>
                <span>TBH Digital</span>
              </a>
              
              <div className={styles.headerActions}>
                <button
                  className={styles.mobileMenuButton}
                  onClick={handleToggleMobileMenu}
                  aria-label="Toggle navigation menu"
                  aria-expanded={templateState.mobileMenuOpen}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Breadcrumbs */}
      {renderBreadcrumbs()}

      {/* Mobile Menu */}
      <div 
        className={clsx(styles.mobileMenu, {
          [styles.open]: templateState.mobileMenuOpen,
        })}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.mobileMenuContent}>
          <button
            className={styles.mobileMenuClose}
            onClick={handleToggleMobileMenu}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
          {/* Add mobile navigation items here */}
        </div>
      </div>

      {/* Main Content Area */}
      <main 
        id="main-content" 
        className={styles.main}
        role="main"
      >
        {hasSidebar ? (
          <div className={clsx(styles.container, styles[layout.containerSize || "normal"])}>
            <div className={styles.templateWithSidebar}>
              {/* Sidebar */}
              <aside className={styles.sidebar} role="complementary">
                <div className={styles.sidebarContent}>
                  {renderSidebar()}
                </div>
              </aside>

              {/* Main content */}
              <div className={clsx(
                styles.content,
                styles[layout.sectionSpacing || "comfortable"]
              )}>
                {hasEnabledSections ? (
                  enabledSections.map(renderSection)
                ) : (
                  <DefaultEmptyComponent />
                )}
                {children}
              </div>
            </div>
          </div>
        ) : (
          <div className={clsx(
            styles.content,
            styles[layout.sectionSpacing || "comfortable"]
          )}>
            {hasEnabledSections ? (
              enabledSections.map(renderSection)
            ) : (
              <DefaultEmptyComponent />
            )}
            {children}
          </div>
        )}
      </main>

      {/* Footer */}
      {renderFooter ? (
        renderFooter()
      ) : (
        <footer className={styles.footer}>
          <div className={clsx(styles.container, styles[layout.containerSize || "normal"])}>
            <div className={styles.footerContent}>
              <div className={styles.footerText}>
                © 2024 TBH Digital Solutions. All rights reserved.
              </div>
              <nav aria-label="Footer navigation">
                <ul className={styles.footerLinks}>
                  <li>
                    <a href="/privacy" className={styles.footerLink}>
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className={styles.footerLink}>
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className={styles.footerLink}>
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </footer>
      )}

      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
        id="announcements"
      />

      {/* Mobile menu backdrop */}
      {templateState.mobileMenuOpen && (
        <div
          className={styles.mobileMenuBackdrop}
          onClick={handleToggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

BookingHubTemplate.displayName = "BookingHubTemplate";

export default BookingHubTemplate;