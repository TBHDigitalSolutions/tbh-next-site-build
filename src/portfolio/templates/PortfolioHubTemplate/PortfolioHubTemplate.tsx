// /src/portfolio/templates/PortfolioHubTemplate/PortfolioHubTemplate.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./PortfolioHubTemplate.module.css";

import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import SearchBanner from "@/search/ui/SearchBanner";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";
import GrowthPackagesCTA from "@/components/packages/GrowthPackagesCTA/GrowthPackagesCTA";

import PortfolioOverviewSection from "../../sections/PortfolioOverviewSection";
import PortfolioSection from "../../sections/PortfolioSection";

import type { PortfolioHubTemplateProps } from "./PortfolioHubTemplate.types";

/** Small, self-contained fallback UI to keep the template resilient. */
function HubTemplateError({
  onRetry,
  title = "Something went wrong",
  message = "We're having trouble loading the portfolio. Please try again.",
}: {
  onRetry?: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className={styles.emptyState} role="alert" aria-live="polite">
      <h2 className={styles.emptyStateTitle}>{title}</h2>
      <p className={styles.emptyStateText}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={styles.emptyStateCTA}>
          Try Again
        </button>
      )}
    </div>
  );
}

export default function PortfolioHubTemplate(props: PortfolioHubTemplateProps) {
  // ---- Dev-time guard (lightweight; keep template dependency-free) ----------
  if (process.env.NODE_ENV === "development") {
    try {
      if (!props || typeof props !== "object") throw new Error("Props missing");
      if (!Array.isArray(props.sections)) throw new Error("`sections` must be an array");
    } catch (e) {
      console.error("[PortfolioHubTemplate] props validation:", e);
    }
  }
  // ---------------------------------------------------------------------------

  const {
    sections,
    meta = {},
    features = {},
    analytics = {},
    className,
    id,
    "data-testid": dataTestId,
  } = props;

  const {
    title = "Portfolio",
    subtitle = "Real results across web, video, SEO, content, lead gen, and automation.",
    heroButton = { text: "Start Your Project", href: "/contact" },
  } = meta;

  const {
    showSearch = true,
    showOverview = true,
    showCTA = true,
  } = features;

  const {
    context = "portfolio_hub",
    trackSectionViews = true,
  } = analytics;

  // stable sort (priority asc, then label)
  const sectionsWithItems = (sections ?? [])
    .filter((s) => Array.isArray(s.items) && s.items.length > 0)
    .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999) || a.label.localeCompare(b.label));

  // Used for any retryable regions (kept for future lazy segments)
  const [nonce, setNonce] = React.useState(0);
  const retry = React.useCallback(() => setNonce((n) => n + 1), []);

  // Analytics tracking
  const handleViewAllClick = React.useCallback((section: any) => {
    if (typeof window !== "undefined" && window.gtag) {
      (window as any).gtag("event", "portfolio_view_all_click", {
        event_category: "Portfolio Navigation",
        event_label: `view_all:${section.slug}`,
        category: section.slug,
        category_label: section.label,
        source_page: "hub",
      });
    }
  }, []);

  // Helper to get section description
  const getSectionDescription = React.useCallback((slug: string, label: string): string => {
    const descriptions: Record<string, string> = {
      "web-development-services": "Custom websites and web applications built for performance and growth",
      "video-production-services": "Compelling video content that engages and converts your audience", 
      "seo-services": "Data-driven SEO strategies that improve rankings and drive organic traffic",
      "marketing-services": "Smart automation systems that nurture leads and increase conversions",
      "content-production-services": "Strategic content that builds authority and drives engagement",
      "lead-generation-services": "Targeted campaigns and funnels that consistently bring in qualified leads",
    };
    return descriptions[slug] ?? `Explore recent ${label.toLowerCase()} work`;
  }, []);

  return (
    <div
      className={`${styles.template}${className ? ` ${className}` : ""}`}
      id={id}
      data-testid={dataTestId}
      data-ctx={context}
      data-k={nonce}
    >
      {/* HERO */}
      <header className={styles.heroSection} aria-labelledby="hub-hero-title">
        <ServiceHero
          title={<span id="hub-hero-title">{title}</span>}
          subtitle={subtitle}
          button={heroButton}
        />
      </header>

      {/* SEARCH */}
      {showSearch && (
        <>
          <section className={styles.searchSection} aria-label="Search portfolio">
            <FullWidthSection constrained containerSize="wide" padded>
              <Container size="wide" tone="surface" padded>
                <SearchBanner
                  types={["portfolio", "package", "case-study"]}
                  title="Explore Our Work"
                  subtitle="Search across all projects and see proven strategies in action"
                  placeholder="Try: ecommerce, video demo, SEO results, automation..."
                  showFilters
                  showTypeFilter
                  showServiceFilter
                  limit={6}
                  analyticsContext={context}
                />
              </Container>
            </FullWidthSection>
          </section>
          <Divider variant="constrained" />
        </>
      )}

      {/* OVERVIEW */}
      {showOverview && (
        <>
          <section className={styles.overviewSection} aria-label="Portfolio overview">
            <FullWidthSection constrained containerSize="wide" padded>
              <Container size="wide" tone="transparent" padded>
                <PortfolioOverviewSection
                  sectionTitle="Driving Results Across Every Industry"
                  layout="two-column"
                />
              </Container>
            </FullWidthSection>
          </section>
          <Divider variant="constrained" />
        </>
      )}

      {/* PORTFOLIO SECTIONS */}
      {sectionsWithItems.length > 0 ? (
        <div className={styles.hubSections}>
          {sectionsWithItems.map((section, index) => (
            <React.Fragment key={section.slug}>
              <section 
                className={styles.hubSection}
                data-category={section.slug}
                aria-labelledby={`portfolio-section-${section.slug}`}
              >
                <FullWidthSection constrained containerSize="wide" padded>
                  <Container size="wide" tone="surface" padded>
                    {/* Section Header */}
                    <header className={styles.sectionHeader}>
                      <div className={styles.headerContent}>
                        <h2
                          className={styles.sectionTitle}
                          id={`portfolio-section-${section.slug}`}
                        >
                          {section.label}
                        </h2>
                        <p className={styles.sectionSubtitle}>
                          {section.subtitle ?? getSectionDescription(section.slug, section.label)}
                        </p>
                      </div>

                      {section.items.length > 0 && (
                        <div className={styles.headerActions}>
                          <Link
                            href={section.viewAllHref}
                            className={styles.viewAllLink}
                            onClick={() => handleViewAllClick(section)}
                            aria-label={`View all ${section.label} projects`}
                          >
                            <span>View All {section.label}</span>
                            <svg 
                              className={styles.viewAllIcon}
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                          </Link>
                        </div>
                      )}
                    </header>

                    {/* Section Content */}
                    <div className={styles.sectionContent}>
                      {section.items.length > 0 ? (
                        <PortfolioSection
                          variant={section.variant}
                          items={section.items.slice(0, 3)} // Limit to 3 items for hub
                          maxItems={3}
                          showSearch={false}
                          showFilters={false}
                          showLoadMore={false}
                          analyticsContext={
                            trackSectionViews ? `${context}_${section.slug}` : undefined
                          }
                          aria-label={`${section.label} portfolio items`}
                        />
                      ) : (
                        <div className={styles.emptySectionState}>
                          <p>No {section.label.toLowerCase()} items available yet.</p>
                          <Link href="/contact" className={styles.contactLink}>
                            Contact us to discuss your {section.label.toLowerCase()} needs
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Section Footer with Stats */}
                    {section.items.length > 0 && (
                      <footer className={styles.sectionFooter}>
                        <div className={styles.sectionStats}>
                          <span className={styles.statItem}>
                            Showing {Math.min(3, section.items.length)} of {section.items.length} projects
                          </span>
                          {section.items.some((item) => item.featured) && (
                            <span className={styles.statItem}>Featured work</span>
                          )}
                        </div>
                      </footer>
                    )}
                  </Container>
                </FullWidthSection>
              </section>

              {index < sectionsWithItems.length - 1 && <Divider variant="constrained" />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <section className={styles.portfolioSection}>
          <FullWidthSection constrained containerSize="wide" padded>
            <Container size="wide" tone="surface" padded>
              <HubTemplateError
                title="Portfolio Coming Soon"
                message="We're currently curating our portfolio showcase. Check back soon to see our latest work!"
                onRetry={retry}
              />
            </Container>
          </FullWidthSection>
        </section>
      )}

      {/* CTA */}
      {showCTA && (
        <>
          <Divider variant="constrained" />
          <section className={styles.ctaSection} aria-label="Get started">
            <FullWidthSection constrained containerSize="wide" padded>
              <Container size="wide" tone="surface" padded>
                <GrowthPackagesCTA />
              </Container>
            </FullWidthSection>
          </section>
        </>
      )}

      {/* Hub Summary Footer */}
      <footer className={styles.hubFooter}>
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <div className={styles.hubSummary}>
              <h3 className={styles.summaryTitle}>
                Ready to see your project in our portfolio?
              </h3>
              <p className={styles.summaryText}>
                Every project in our portfolio represents a real business challenge solved with strategic thinking and expert execution.
              </p>
              <div className={styles.summaryActions}>
                <Link href="/contact" className={styles.primaryAction}>
                  Start Your Project
                </Link>
                <Link href="/services" className={styles.secondaryAction}>
                  Explore Our Services
                </Link>
              </div>
            </div>
          </Container>
        </FullWidthSection>
      </footer>
    </div>
  );
}