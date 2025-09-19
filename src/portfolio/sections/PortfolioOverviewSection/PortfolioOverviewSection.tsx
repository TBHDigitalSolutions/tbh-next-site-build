// ===================================================================
// PortfolioOverviewSection.tsx - Production Ready
// ===================================================================

import React, { useId, useState, useCallback } from "react";
import type { PortfolioOverviewSectionProps } from "./PortfolioOverviewSection.types";
import styles from "./PortfolioOverviewSection.module.css";

// Lazy load child components for code splitting
const PortfolioOverviewText = React.lazy(() => 
  import("../PortfolioOverviewText").then(mod => ({ default: mod.default || mod.PortfolioOverviewText }))
);

const PortfolioStatsSection = React.lazy(() => 
  import("../PortfolioStatsSection").then(mod => ({ default: mod.default || mod.PortfolioStatsSection }))
);

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PortfolioOverviewSection error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.error}>
          <div className={styles.errorTitle}>Section Unavailable</div>
          <p className={styles.errorMessage}>
            This content is temporarily unavailable. Please try refreshing the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback
const LoadingFallback = () => (
  <div className={styles.loading}>
    <div style={{ height: '200px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)' }} />
  </div>
);

// Memoized components to prevent unnecessary re-renders
const MemoizedText = React.memo(PortfolioOverviewText);
const MemoizedStats = React.memo(PortfolioStatsSection);

export default function PortfolioOverviewSection({
  // Section shell
  sectionTitle = "Driving Results Across Every Industry",
  sectionId,
  background = "surface",

  // Child props (already adapted)
  textProps,
  statsProps,

  // Layout
  layout = "two-column",
  reverse = false,

  // Styling & behavior
  className = "",
  onError,
}: PortfolioOverviewSectionProps) {
  const autoId = useId();
  const resolvedSectionId = sectionId || `portfolio-overview-${autoId}`;
  const headingId = `${resolvedSectionId}-heading`;
  
  // Loading states for dynamic components
  const [textLoading, setTextLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Error handling
  const handleError = useCallback((error: Error) => {
    console.error('Portfolio overview section error:', error);
    onError?.(error);
  }, [onError]);

  // Get layout classes
  const layoutClass = {
    'two-column': styles.twoColumn,
    'stacked': styles.stacked,
    'stats-first': styles.statsFirst,
  }[layout] || styles.twoColumn;

  const sectionClass = [
    styles.section,
    layoutClass,
    reverse ? styles.reverse : '',
    className
  ].filter(Boolean).join(' ');

  // Render components based on what props are provided
  const textComponent = textProps ? (
    <div className={styles.textContent}>
      <React.Suspense fallback={<LoadingFallback />}>
        <MemoizedText {...textProps} />
      </React.Suspense>
    </div>
  ) : null;

  const statsComponent = statsProps ? (
    <div className={styles.statsContent}>
      <React.Suspense fallback={<LoadingFallback />}>
        <MemoizedStats {...statsProps} />
      </React.Suspense>
    </div>
  ) : null;

  // Handle empty state
  if (!textComponent && !statsComponent) {
    return (
      <section
        id={resolvedSectionId}
        className={styles.error}
        aria-labelledby={headingId}
      >
        <div className={styles.errorTitle}>No Content Available</div>
        <p className={styles.errorMessage}>
          This section requires either text or statistics content to display.
        </p>
      </section>
    );
  }

  return (
    <SectionErrorBoundary onError={handleError}>
      <section
        id={resolvedSectionId}
        className={sectionClass}
        data-background={background}
        aria-labelledby={sectionTitle ? headingId : undefined}
        role="region"
      >
        {sectionTitle && (
          <header className={styles.sectionHeader}>
            <h2 id={headingId} className={styles.sectionTitle}>
              {sectionTitle}
            </h2>
          </header>
        )}

        {/* Render components based on layout */}
        {layout === "stacked" && (
          <>
            {textComponent}
            {statsComponent}
          </>
        )}

        {layout === "stats-first" && (
          <>
            {statsComponent}
            {textComponent}
          </>
        )}

        {layout === "two-column" && (
          <>
            {reverse ? (
              <>
                {statsComponent}
                {textComponent}
              </>
            ) : (
              <>
                {textComponent}
                {statsComponent}
              </>
            )}
          </>
        )}
      </section>
    </SectionErrorBoundary>
  );
}