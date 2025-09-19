// /src/portfolio/templates/PortfolioCategoryTemplate/PortfolioCategoryTemplate.tsx
"use client";

import * as React from "react";
import styles from "./PortfolioCategoryTemplate.module.css";

import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import SearchBanner from "@/search/ui/SearchBanner";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import { GrowthPackagesSection } from "@/components/packages/GrowthPackagesSection/GrowthPackagesSection";

import PortfolioSection from "../../sections/PortfolioSection";
import { CATEGORY_COMPONENTS } from "../../lib/types";
import type { PortfolioCategoryTemplateProps } from "./PortfolioCategoryTemplate.types";

/** Small, self-contained fallback UI to keep the template resilient. */
function CategoryTemplateError({
  onRetry,
  title = "Unable to load portfolio",
  message = "We're having trouble loading this category. Please try again.",
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

export default function PortfolioCategoryTemplate(props: PortfolioCategoryTemplateProps) {
  // ---- Dev-time guard (lightweight; no zod dependency here) -----------------
  if (process.env.NODE_ENV === "development") {
    try {
      if (!props || typeof props !== "object") throw new Error("Props missing");
      if (!props.category) throw new Error("`category` is required");
      if (!Array.isArray(props.data?.items)) throw new Error("`data.items` must be an array");
    } catch (e) {
      console.error("[PortfolioCategoryTemplate] props validation:", e);
    }
  }
  // ---------------------------------------------------------------------------

  const {
    category,
    title,
    subtitle,
    data,
    layout = {},
    analytics = {},
  } = props;

  const categoryCfg = CATEGORY_COMPONENTS?.[category];
  const variant = categoryCfg?.variant ?? "gallery";

  const {
    showTools = false,
    showCaseStudies = false,
    showPackages = false,
  } = layout;

  const {
    context = `portfolio_category_${category}`,
    trackItemViews = true,
  } = analytics;

  const items = Array.isArray(data.items) ? data.items : [];
  const tools = Array.isArray(data.tools) ? data.tools : [];
  const caseStudies = Array.isArray(data.caseStudies) ? data.caseStudies : [];
  const recommendedPackages = Array.isArray(data.recommendedPackages)
    ? data.recommendedPackages
    : [];
  const metrics = data.metrics;

  // State for tools tabs
  const [activeToolTab, setActiveToolTab] = React.useState(0);

  // Used for retryable regions in the future (e.g., if you lazy-load parts)
  const [nonce, setNonce] = React.useState(0);
  const retry = React.useCallback(() => setNonce((n) => n + 1), []);

  // Analytics handlers
  const handleToolTabClick = React.useCallback((index: number, tool: any) => {
    setActiveToolTab(index);
    if (typeof window !== "undefined" && window.gtag) {
      (window as any).gtag("event", "tool_interaction", {
        event_category: "Category Tools",
        event_label: `tab_switch:${tool.id}`,
        category,
        tool_id: tool.id,
        tool_title: tool.title,
      });
    }
  }, [category]);

  const handleCaseStudyClick = React.useCallback((caseStudy: any) => {
    if (typeof window !== "undefined" && window.gtag) {
      (window as any).gtag("event", "case_study_click", {
        event_category: "Case Studies",
        event_label: `view:${caseStudy.id}`,
        category,
        case_study_id: caseStudy.id,
        client: caseStudy.client,
      });
    }
  }, [category]);

  const handlePackageClick = React.useCallback((pkg: any) => {
    if (typeof window !== "undefined" && window.gtag) {
      (window as any).gtag("event", "package_interaction", {
        event_category: "Growth Packages",
        event_label: `click:${pkg.id}`,
        category,
        package_id: pkg.id,
        package_title: pkg.title,
      });
    }
  }, [category]);

  return (
    <div className={styles.categoryPageClient} data-ctx={context} data-k={nonce}>
      {/* HERO */}
      <header className={styles.heroSection} aria-labelledby="category-hero-title">
        <ServiceHero
          title={<span id="category-hero-title">{`${title} Portfolio`}</span>}
          subtitle={subtitle}
          button={{ text: "Start Your Project", href: "/contact" }}
        />
      </header>

      {/* SEARCH */}
      <section
        className={styles.searchSection}
        aria-label={`Search within ${title} portfolio`}
      >
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <SearchBanner
              types={["portfolio", "case-study"]}
              title={`Explore ${title}`}
              subtitle={`Search within our ${title.toLowerCase()} work`}
              placeholder="Try: ecommerce, product demo, local SEO, automation..."
              showFilters
              showTypeFilter
              limit={6}
              presetFilters={{ portfolio_category: category }}
              analyticsContext={context}
            />
          </Container>
        </FullWidthSection>
      </section>

      <Divider variant="constrained" />

      {/* MAIN CONTENT */}
      <main className={styles.contentSection} id="main-content">
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            {/* Portfolio Gallery Section */}
            <section className={styles.portfolioSection} aria-labelledby="portfolio-heading">
              <header className={styles.sectionHeader}>
                <h1 id="portfolio-heading" className={styles.sectionTitle}>
                  {title} Portfolio
                </h1>
                <p className={styles.sectionSubtitle}>
                  {subtitle ?? `Explore our work in ${title.toLowerCase()} with interactive previews.`}
                </p>
              </header>

              {/* Metrics (optional) */}
              {metrics && (
                <section
                  aria-label="Category metrics"
                  className={styles.metricsSection}
                >
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>
                      {metrics.totalProjects ?? items.length}
                    </span>
                    <span className={styles.metricLabel}>Projects</span>
                  </div>
                  {metrics.avgProjectDuration && (
                    <div className={styles.metric}>
                      <span className={styles.metricValue}>
                        {metrics.avgProjectDuration}
                      </span>
                      <span className={styles.metricLabel}>Avg Duration</span>
                    </div>
                  )}
                  {metrics.successRate && (
                    <div className={styles.metric}>
                      <span className={styles.metricValue}>
                        {metrics.successRate}
                      </span>
                      <span className={styles.metricLabel}>Success Rate</span>
                    </div>
                  )}
                  {metrics.clientSatisfaction && (
                    <div className={styles.metric}>
                      <span className={styles.metricValue}>
                        {metrics.clientSatisfaction}
                      </span>
                      <span className={styles.metricLabel}>
                        Client Satisfaction
                      </span>
                    </div>
                  )}
                </section>
              )}

              {/* Portfolio items */}
              <div className={styles.galleryContainer}>
                {items.length > 0 ? (
                  <PortfolioSection
                    variant={variant}
                    items={items}
                    showSearch={true}
                    showFilters={true}
                    analyticsContext={trackItemViews ? context : undefined}
                    aria-label={`${title} portfolio`}
                  />
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateContent}>
                      <h3>Portfolio Coming Soon</h3>
                      <p>
                        We're currently updating our {title.toLowerCase()} portfolio. Check back soon!
                      </p>
                      <a href="/contact" className={styles.contactLink}>
                        Discuss Your Project
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Tools & Resources */}
            {showTools && tools.length > 0 && (
              <>
                <Divider variant="constrained" />
                <section className={styles.toolsSection} aria-labelledby="tools-heading">
                  <header className={styles.sectionHeader}>
                    <h2 id="tools-heading" className={styles.sectionTitle}>
                      Helpful Tools & Resources
                    </h2>
                    <p className={styles.sectionSubtitle}>
                      Free tools and resources to help you get started with {title.toLowerCase()}
                    </p>
                  </header>

                  {tools.length === 1 ? (
                    <div className={styles.singleTool}>
                      <div className={styles.toolCard}>
                        <div className={styles.toolHeader}>
                          <h3 className={styles.toolTitle}>{tools[0].title}</h3>
                          <p className={styles.toolDescription}>{tools[0].description}</p>
                          {tools[0].badge && <span className={styles.toolBadge}>{tools[0].badge}</span>}
                        </div>
                        <div className={styles.toolComponent}>{tools[0].component}</div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.toolsTabs}>
                      <div className={styles.tabList} role="tablist" aria-label="Tools navigation">
                        {tools.map((tool, index) => (
                          <button
                            key={tool.id}
                            className={`${styles.tabButton} ${index === activeToolTab ? styles.active : ""}`}
                            onClick={() => handleToolTabClick(index, tool)}
                            role="tab"
                            aria-selected={index === activeToolTab}
                            aria-controls={`tool-panel-${index}`}
                            id={`tool-tab-${index}`}
                          >
                            {tool.title}
                            {tool.badge && <span className={styles.tabBadge}>{tool.badge}</span>}
                          </button>
                        ))}
                      </div>

                      {tools.map((tool, index) => (
                        <div
                          key={tool.id}
                          className={`${styles.tabPanel} ${index === activeToolTab ? styles.active : ""}`}
                          role="tabpanel"
                          aria-labelledby={`tool-tab-${index}`}
                          id={`tool-panel-${index}`}
                          hidden={index !== activeToolTab}
                        >
                          <div className={styles.toolCard}>
                            <div className={styles.toolHeader}>
                              <h3 className={styles.toolTitle}>{tool.title}</h3>
                              <p className={styles.toolDescription}>{tool.description}</p>
                              {tool.badge && <span className={styles.toolBadge}>{tool.badge}</span>}
                            </div>
                            <div className={styles.toolComponent}>{tool.component}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Case Studies */}
            {showCaseStudies && caseStudies.length > 0 && (
              <>
                <Divider variant="constrained" />
                <section className={styles.caseStudiesSection} aria-labelledby="case-studies-heading">
                  <header className={styles.sectionHeader}>
                    <h2 id="case-studies-heading" className={styles.sectionTitle}>
                      Success Stories
                    </h2>
                    <p className={styles.sectionSubtitle}>
                      Real results from our {title.toLowerCase()} work
                    </p>
                  </header>

                  <div className={styles.caseStudiesGrid} role="list">
                    {caseStudies.map((study) => (
                      <article key={study.id} className={styles.caseStudyCard} role="listitem">
                        {study.logo && (
                          <div className={styles.caseStudyLogo}>
                            <img src={study.logo} alt={`${study.client} logo`} loading="lazy" />
                          </div>
                        )}

                        <div className={styles.caseStudyContent}>
                          <h3 className={styles.caseStudyTitle}>{study.title}</h3>
                          <p className={styles.caseStudyClient}>{study.client}</p>
                          <p className={styles.caseStudySummary}>{study.summary}</p>

                          <div className={styles.caseStudyMetrics}>
                            <div className={styles.primaryMetric}>
                              <span className={styles.metricValue}>{study.primaryMetric.value}</span>
                              <span className={styles.metricLabel}>{study.primaryMetric.label}</span>
                            </div>

                            {Array.isArray(study.secondaryMetrics) && study.secondaryMetrics.length > 0 && (
                              <div className={styles.secondaryMetrics}>
                                {study.secondaryMetrics.slice(0, 2).map((metric, idx) => (
                                  <div key={idx} className={styles.secondaryMetric}>
                                    <span className={styles.metricValue}>{metric.value}</span>
                                    <span className={styles.metricLabel}>{metric.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {study.link && (
                            <a
                              href={study.link}
                              className={styles.caseStudyLink}
                              onClick={() => handleCaseStudyClick(study)}
                              aria-label={`Read full case study for ${study.client}`}
                            >
                              Read full case study
                              <svg
                                className={styles.linkIcon}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="9,18 15,12 9,6" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Packages */}
            {showPackages && recommendedPackages.length > 0 && (
              <>
                <Divider variant="constrained" />
                <section className={styles.packagesSection}>
                  <GrowthPackagesSection
                    packages={recommendedPackages}
                    category={category}
                    title={`Recommended ${title} Packages`}
                    subtitle="Complete solutions that include this service and complement your goals"
                    onPackageClick={handlePackageClick}
                  />
                </section>
              </>
            )}
          </Container>
        </FullWidthSection>
      </main>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <CTASection
          title={`Ready to get started with ${title.toLowerCase()}?`}
          description="Let's discuss your project and create a custom solution that delivers measurable results."
          primaryCta={{ label: "Get a Custom Quote", href: "/contact" }}
          secondaryCta={{ label: "View All Services", href: "/services" }}
          style="centered"
        />
      </section>
    </div>
  );
}