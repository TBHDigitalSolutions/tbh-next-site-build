// src/components/ui/organisms/ScopeDeliverables/ScopeDeliverables.tsx
import React from "react";
import styles from "./ScopeDeliverables.module.css";

export interface ScopeData {
  title?: string;
  subtitle?: string;
  includes: string[];
  deliverables: string[];
  addons?: string[];
}

export interface ScopeDeliverablesProps {
  /** Scope configuration object */
  scope: ScopeData;
  /** Optional section ID for anchor linking */
  id?: string;
  /** Additional CSS class */
  className?: string;
  /** Test ID for testing */
  testId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Show section even if all arrays are empty */
  showWhenEmpty?: boolean;
  /** Custom icons for each section */
  icons?: {
    includes?: string;
    deliverables?: string;
    addons?: string;
  };
  /** Optional callback when an item is clicked */
  onItemClick?: (type: 'includes' | 'deliverables' | 'addons', item: string, index: number) => void;
}

const DEFAULT_ICONS = {
  includes: "✓",
  deliverables: "📋",
  addons: "+",
};

/**
 * Utility to check if an array has items
 */
function hasItems(arr?: string[]): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Generates loading placeholder items
 */
function generateLoadingItems(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Loading item ${i + 1}...`);
}

/**
 * ScopeDeliverables component for displaying project scope, deliverables, and add-ons
 * Used primarily on Sub-Service (L3) pages to clarify what's included in a service
 */
export default function ScopeDeliverables({
  scope,
  id = "scope-deliverables",
  className,
  testId = "scope-deliverables",
  isLoading = false,
  showWhenEmpty = false,
  icons = DEFAULT_ICONS,
  onItemClick,
}: ScopeDeliverablesProps) {
  
  const { title, subtitle, includes, deliverables, addons } = scope;
  const finalIcons = { ...DEFAULT_ICONS, ...icons };

  // Check if we have any content to display
  const hasAnyItems = hasItems(includes) || hasItems(deliverables) || hasItems(addons);
  
  // Don't render if no items and not loading and not showing when empty
  if (!hasAnyItems && !isLoading && !showWhenEmpty) {
    return null;
  }

  // Prepare display data (with loading states)
  const displayIncludes = isLoading && !hasItems(includes) 
    ? generateLoadingItems(3) 
    : includes || [];
    
  const displayDeliverables = isLoading && !hasItems(deliverables) 
    ? generateLoadingItems(3) 
    : deliverables || [];
    
  const displayAddons = isLoading && !hasItems(addons) 
    ? generateLoadingItems(2) 
    : addons || [];

  const handleItemClick = (type: 'includes' | 'deliverables' | 'addons', item: string, index: number) => {
    if (!isLoading && onItemClick) {
      onItemClick(type, item, index);
    }
  };

  return (
    <section 
      id={id}
      className={`${styles.scopeDeliverables} ${isLoading ? styles.loading : ""} ${className || ""}`}
      data-testid={testId}
      aria-labelledby={`${id}-title`}
      aria-busy={isLoading}
    >
      {/* Header */}
      {(title || subtitle) && (
        <header className={styles.header}>
          {title && (
            <h2 id={`${id}-title`} className={styles.title}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}
        </header>
      )}

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        
        {/* Scope Includes Section */}
        {(hasItems(displayIncludes) || showWhenEmpty) && (
          <div 
            className={`${styles.sectionCard} ${styles.includes}`}
            data-testid={`${testId}-includes`}
          >
            <header className={styles.sectionHeader}>
              <div className={`${styles.sectionIcon} ${styles.includes}`} aria-hidden="true">
                {finalIcons.includes}
              </div>
              <h3 className={styles.sectionTitle}>Scope Includes</h3>
              <span className={styles.sectionCount}>
                {displayIncludes.length}
              </span>
            </header>

            {hasItems(displayIncludes) ? (
              <ul className={styles.itemList} role="list">
                {displayIncludes.map((item, index) => (
                  <li 
                    key={index} 
                    className={`${styles.listItem} ${isLoading ? styles.loadingItem : ""}`}
                    onClick={() => handleItemClick('includes', item, index)}
                    role="listitem"
                  >
                    <span 
                      className={`${styles.itemIcon} ${styles.includes}`} 
                      aria-hidden="true"
                    >
                      {finalIcons.includes}
                    </span>
                    <span className={styles.itemText}>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <p>Scope details coming soon</p>
              </div>
            )}
          </div>
        )}

        {/* Deliverables Section */}
        {(hasItems(displayDeliverables) || showWhenEmpty) && (
          <div 
            className={`${styles.sectionCard} ${styles.deliverables}`}
            data-testid={`${testId}-deliverables`}
          >
            <header className={styles.sectionHeader}>
              <div className={`${styles.sectionIcon} ${styles.deliverables}`} aria-hidden="true">
                {finalIcons.deliverables}
              </div>
              <h3 className={styles.sectionTitle}>Deliverables</h3>
              <span className={styles.sectionCount}>
                {displayDeliverables.length}
              </span>
            </header>

            {hasItems(displayDeliverables) ? (
              <ul className={styles.itemList} role="list">
                {displayDeliverables.map((item, index) => (
                  <li 
                    key={index} 
                    className={`${styles.listItem} ${isLoading ? styles.loadingItem : ""}`}
                    onClick={() => handleItemClick('deliverables', item, index)}
                    role="listitem"
                  >
                    <span 
                      className={`${styles.itemIcon} ${styles.deliverables}`} 
                      aria-hidden="true"
                    >
                      {finalIcons.deliverables}
                    </span>
                    <span className={styles.itemText}>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📦</div>
                <p>Deliverable details coming soon</p>
              </div>
            )}
          </div>
        )}

        {/* Add-ons Section */}
        {(hasItems(displayAddons) || showWhenEmpty) && (
          <div className={styles.addonsSection}>
            <div 
              className={`${styles.addonsCard} ${styles.addons}`}
              data-testid={`${testId}-addons`}
            >
              <header className={styles.sectionHeader}>
                <div className={`${styles.sectionIcon} ${styles.addons}`} aria-hidden="true">
                  {finalIcons.addons}
                </div>
                <h3 className={styles.sectionTitle}>Optional Add-ons</h3>
                <span className={styles.sectionCount}>
                  {displayAddons.length}
                </span>
              </header>

              {hasItems(displayAddons) ? (
                <ul className={styles.itemList} role="list">
                  {displayAddons.map((item, index) => (
                    <li 
                      key={index} 
                      className={`${styles.listItem} ${isLoading ? styles.loadingItem : ""}`}
                      onClick={() => handleItemClick('addons', item, index)}
                      role="listitem"
                    >
                      <span 
                        className={`${styles.itemIcon} ${styles.addons}`} 
                        aria-hidden="true"
                      >
                        {finalIcons.addons}
                      </span>
                      <span className={styles.itemText}>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔧</div>
                  <p>Add-on options coming soon</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading state announcement for screen readers */}
      {isLoading && (
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Loading scope and deliverables information...
        </div>
      )}
    </section>
  );
}