// src/booking/sections/BookingOptionsSection/BookingOptionsSection.tsx
"use client";

/**
 * BookingOptionsSection - Production-ready booking options display
 * 
 * This component renders a flexible grid/list/carousel of booking options
 * with comprehensive selection, theming, and accessibility support.
 * 
 * Features:
 * - Multiple layout modes (grid, list, carousel)
 * - Selection support (none, single, multiple)
 * - Loading and error states
 * - Responsive design with container queries
 * - Full accessibility (WCAG 2.1 AA)
 * - Analytics integration
 * - Customizable theming
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";

// Internal imports
import type {
  BookingOptionsSectionProps,
  BookingOption,
  BookingOptionsSectionState,
  OptionsLayout,
  OptionSelectionMode,
} from "./BookingOptionsSection.types";
import {
  validateBookingOptionsSectionProps,
  validateSelectionState,
  debugBookingOptionsProps,
} from "./utils/bookingOptionsValidator";

// Styles
import styles from "./BookingOptionsSection.module.css";

// ============================================================================
// Default Components
// ============================================================================

function DefaultLoadingComponent({ skeletonCount = 6 }: { skeletonCount?: number }) {
  return (
    <div className={styles.loading} role="status" aria-label="Loading booking options">
      <div className={styles.loadingSpinner} />
    </div>
  );
}

function DefaultSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.skeletonCard} />
      ))}
    </div>
  );
}

function DefaultErrorComponent({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorIcon}>⚠️</div>
      <h3 className={styles.errorTitle}>Unable to Load Options</h3>
      <p className={styles.errorMessage}>{error}</p>
      {onRetry && (
        <button className={styles.errorRetry} onClick={onRetry} type="button">
          Try Again
        </button>
      )}
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>📋</div>
      <h3 className={styles.emptyTitle}>No Options Available</h3>
      <p className={styles.emptyMessage}>
        There are currently no booking options to display. Please check back later.
      </p>
    </div>
  );
}

// ============================================================================
// Option Card Component
// ============================================================================

interface OptionCardProps {
  option: BookingOption;
  isSelected: boolean;
  selectionMode: OptionSelectionMode;
  onToggleSelect: (id: string) => void;
  onPrimaryAction: (id: string) => void;
  onSecondaryAction: (id: string, index: number) => void;
  renderHeader?: (option: BookingOption) => React.ReactNode;
  renderFooter?: (option: BookingOption) => React.ReactNode;
  theme?: BookingOptionsSectionProps["theme"];
  disabled?: boolean;
}

function OptionCard({
  option,
  isSelected,
  selectionMode,
  onToggleSelect,
  onPrimaryAction,
  onSecondaryAction,
  renderHeader,
  renderFooter,
  theme,
  disabled = false,
}: OptionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardClick = useCallback(() => {
    if (disabled || option.disabled) return;

    if (selectionMode !== "none") {
      onToggleSelect(option.id);
    } else if (option.actions?.primary) {
      if (option.actions.primary.onClick) {
        option.actions.primary.onClick(option.id);
      } else {
        onPrimaryAction(option.id);
      }
    }
  }, [disabled, option, selectionMode, onToggleSelect, onPrimaryAction]);

  const handlePrimaryAction = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || option.disabled) return;

      if (option.actions?.primary?.onClick) {
        option.actions.primary.onClick(option.id);
      } else {
        onPrimaryAction(option.id);
      }
    },
    [disabled, option, onPrimaryAction]
  );

  const handleSecondaryAction = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      if (disabled || option.disabled) return;

      const action = option.actions?.secondary?.[index];
      if (action?.onClick) {
        action.onClick(option.id);
      } else {
        onSecondaryAction(option.id, index);
      }
    },
    [disabled, option, onSecondaryAction]
  );

  const formatPrice = (price: BookingOption["price"]) => {
    if (!price) return null;
    
    const formatted = price.formatted || `${price.currency} ${price.amount}`;
    
    return (
      <div className={styles.cardPrice}>
        {formatted}
        {price.compareAt && (
          <span className={styles.cardPriceCompare}>
            {price.compareAt.formatted || `${price.compareAt.currency} ${price.compareAt.amount}`}
          </span>
        )}
        {price.cadence && price.cadence !== "one_time" && (
          <span className={styles.cardPriceCadence}>
            /{price.cadence.replace("per_", "")}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={clsx(
        styles.optionCard,
        {
          [styles.selected]: isSelected,
          [styles.disabled]: disabled || option.disabled,
          [styles.themeElevated]: theme?.emphasis === "elevated",
          [styles.themeOutlined]: theme?.emphasis === "outlined",
          [styles.toneBrand]: theme?.tone === "brand",
        }
      )}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role={selectionMode !== "none" ? "option" : "button"}
      aria-selected={selectionMode !== "none" ? isSelected : undefined}
      aria-disabled={disabled || option.disabled}
      tabIndex={disabled || option.disabled ? -1 : 0}
      data-testid={`option-card-${option.id}`}
    >
      {/* Ribbon */}
      {option.ribbon && (
        <div className={styles.cardRibbon}>
          {option.ribbon}
        </div>
      )}

      {/* Header */}
      <div className={styles.cardHeader}>
        {renderHeader?.(option)}
        
        {option.media && (
          <div className={styles.cardMedia}>
            {option.media}
          </div>
        )}

        <h3 className={styles.cardTitle}>{option.title}</h3>
        
        {option.subtitle && (
          <p className={styles.cardSubtitle}>{option.subtitle}</p>
        )}

        {option.badges && option.badges.length > 0 && (
          <div className={styles.cardBadges}>
            {option.badges.map((badge, i) => (
              <span
                key={i}
                className={clsx(
                  styles.cardBadge,
                  badge.tone && styles[`tone${badge.tone.charAt(0).toUpperCase()}${badge.tone.slice(1)}`]
                )}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {option.tags && option.tags.length > 0 && (
          <div className={styles.cardTags}>
            {option.tags.map((tag, i) => (
              <span
                key={i}
                className={clsx(
                  styles.cardTag,
                  tag.tone && styles[`tone${tag.tone.charAt(0).toUpperCase()}${tag.tone.slice(1)}`]
                )}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        {option.description && (
          <p className={styles.cardDescription}>{option.description}</p>
        )}

        <div className={styles.cardMeta}>
          {option.durationMinutes && (
            <div className={styles.cardDuration}>
              ⏱️ {option.durationMinutes} min
            </div>
          )}
          {formatPrice(option.price)}
        </div>

        {option.availabilityHint && option.hasNearTermAvailability && (
          <div className={styles.cardAvailability}>
            ✅ {option.availabilityHint}
          </div>
        )}

        {option.disabled && option.disabledReason && (
          <div className={styles.cardDisabledReason}>
            ❌ {option.disabledReason}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        {renderFooter?.(option)}
        
        <div className={styles.cardActions}>
          {option.actions?.primary && (
            <button
              className={styles.cardActionPrimary}
              onClick={handlePrimaryAction}
              disabled={disabled || option.disabled || !!option.actions.primary.disabledReason}
              type="button"
              aria-label={option.actions.primary.disabledReason || option.actions.primary.label}
            >
              {option.actions.primary.label}
            </button>
          )}

          {option.actions?.secondary && option.actions.secondary.length > 0 && (
            <div className={styles.cardActionSecondaryList}>
              {option.actions.secondary.map((action, i) => (
                <button
                  key={i}
                  className={styles.cardActionSecondary}
                  onClick={(e) => handleSecondaryAction(e, i)}
                  disabled={disabled || option.disabled}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const BookingOptionsSection: React.FC<BookingOptionsSectionProps> = ({
  title,
  subtitle,
  options,
  selectionMode = "none",
  selection,
  service,
  provider,
  layout,
  theme,
  a11y,
  state,
  sectionActions,
  onSelect,
  onOptionPrimaryAction,
  onOptionSecondaryAction,
  analytics,
  className,
  renderOptionHeader,
  renderOptionFooter,
  renderEmptyState,
}) => {
  // ========================================================================
  // State & Refs
  // ========================================================================
  
  const [internalState, setInternalState] = useState<BookingOptionsSectionState>({
    internalSelectedIds: selection?.selectedIds || [],
    expandedIds: new Set(),
    isClient: false,
  });

  const [visibleCount, setVisibleCount] = useState(
    layout?.maxVisible || options.length
  );

  const sectionRef = useRef<HTMLElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // ========================================================================
  // Effects
  // ========================================================================

  // Client-side hydration
  useEffect(() => {
    setInternalState(prev => ({ ...prev, isClient: true }));
  }, []);

  // Sync external selection state
  useEffect(() => {
    if (selection) {
      setInternalState(prev => ({
        ...prev,
        internalSelectedIds: selection.selectedIds,
      }));
    }
  }, [selection]);

  // Validation in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      debugBookingOptionsProps({
        title, subtitle, options, selectionMode, selection,
        service, provider, layout, theme, a11y, state, sectionActions,
        onSelect, onOptionPrimaryAction, onOptionSecondaryAction,
        analytics, className, renderOptionHeader, renderOptionFooter,
        renderEmptyState
      });
    }
  }, [
    title, subtitle, options, selectionMode, selection, service, provider,
    layout, theme, a11y, state, sectionActions, onSelect, onOptionPrimaryAction,
    onOptionSecondaryAction, analytics, className, renderOptionHeader,
    renderOptionFooter, renderEmptyState
  ]);

  // ========================================================================
  // Computed Values
  // ========================================================================

  const effectiveLayout: OptionsLayout = layout?.layout || "grid";
  const visibleOptions = options.slice(0, visibleCount);
  const hasMoreOptions = visibleCount < options.length;

  const selectedIds = selection?.selectedIds || internalState.internalSelectedIds;

  const canSelectMore = useMemo(() => {
    if (selectionMode === "none") return false;
    if (selectionMode === "single") return selectedIds.length === 0;
    if (selectionMode === "multiple") {
      const maxSelect = selection?.maxSelect || Infinity;
      return selectedIds.length < maxSelect;
    }
    return false;
  }, [selectionMode, selectedIds, selection?.maxSelect]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "";
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      }, 100);
    }
  }, []);

  const handleToggleSelect = useCallback((optionId: string) => {
    if (selectionMode === "none") return;

    const newSelectedIds = [...selectedIds];
    const index = newSelectedIds.indexOf(optionId);
    const option = options.find(opt => opt.id === optionId);

    if (index >= 0) {
      // Deselecting
      if (selectionMode === "multiple" && selection?.minSelect && 
          newSelectedIds.length <= selection.minSelect) {
        announce(`Cannot deselect ${option?.title || optionId}. Minimum ${selection.minSelect} required.`);
        return;
      }
      newSelectedIds.splice(index, 1);
      announce(`Deselected ${option?.title || optionId}`);
    } else {
      // Selecting
      if (selectionMode === "single") {
        newSelectedIds.length = 0;
      } else if (selection?.maxSelect && newSelectedIds.length >= selection.maxSelect) {
        announce(`Cannot select ${option?.title || optionId}. Maximum ${selection.maxSelect} allowed.`);
        return;
      }
      newSelectedIds.push(optionId);
      announce(`Selected ${option?.title || optionId}`);
    }

    setInternalState(prev => ({
      ...prev,
      internalSelectedIds: newSelectedIds,
    }));

    onSelect?.(newSelectedIds, optionId);

    // Analytics
    analytics?.onTrackEvent?.("option_selected", {
      optionId,
      selected: !selectedIds.includes(optionId),
      totalSelected: newSelectedIds.length,
      context: analytics.context,
    });
  }, [
    selectionMode,
    selectedIds,
    selection,
    options,
    onSelect,
    announce,
    analytics,
  ]);

  const handlePrimaryAction = useCallback((optionId: string) => {
    const option = options.find(opt => opt.id === optionId);
    
    onOptionPrimaryAction?.(optionId);

    // Analytics
    analytics?.onTrackEvent?.("option_primary_action", {
      optionId,
      action: option?.actions?.primary?.trackName || "primary_click",
      context: analytics.context,
    });

    announce(`Activated ${option?.title || optionId}`);
  }, [options, onOptionPrimaryAction, analytics, announce]);

  const handleSecondaryAction = useCallback((optionId: string, index: number) => {
    const option = options.find(opt => opt.id === optionId);
    const action = option?.actions?.secondary?.[index];
    
    onOptionSecondaryAction?.(optionId, index);

    // Analytics
    analytics?.onTrackEvent?.("option_secondary_action", {
      optionId,
      actionIndex: index,
      action: action?.trackName || "secondary_click",
      context: analytics.context,
    });

    announce(`Performed ${action?.label || "action"} on ${option?.title || optionId}`);
  }, [options, onOptionSecondaryAction, analytics, announce]);

  const handleSectionPrimaryAction = useCallback(() => {
    if (sectionActions?.primary?.onClick) {
      sectionActions.primary.onClick();
    }

    analytics?.onTrackEvent?.("section_primary_action", {
      action: sectionActions?.primary?.trackName || "section_primary",
      context: analytics.context,
    });
  }, [sectionActions, analytics]);

  const handleSectionSecondaryAction = useCallback((index: number) => {
    const action = sectionActions?.secondary?.[index];
    if (action?.onClick) {
      action.onClick();
    }

    analytics?.onTrackEvent?.("section_secondary_action", {
      actionIndex: index,
      action: action?.trackName || "section_secondary",
      context: analytics.context,
    });
  }, [sectionActions, analytics]);

  const handleShowMore = useCallback(() => {
    const increment = layout?.maxVisible || 6;
    const newCount = Math.min(visibleCount + increment, options.length);
    setVisibleCount(newCount);

    analytics?.onTrackEvent?.("show_more_options", {
      previousCount: visibleCount,
      newCount,
      context: analytics.context,
    });

    announce(`Showing ${newCount} of ${options.length} options`);
  }, [visibleCount, options.length, layout?.maxVisible, analytics, announce]);

  const handleShowLess = useCallback(() => {
    const decrement = layout?.maxVisible || 6;
    const newCount = Math.max(decrement, visibleCount - decrement);
    setVisibleCount(newCount);

    analytics?.onTrackEvent?.("show_less_options", {
      previousCount: visibleCount,
      newCount,
      context: analytics.context,
    });

    announce(`Showing ${newCount} of ${options.length} options`);
  }, [visibleCount, options.length, layout?.maxVisible, analytics, announce]);

  // ========================================================================
  // Render Helpers
  // ========================================================================

  const renderOptions = useCallback(() => {
    if (state?.loading) {
      return layout?.maxVisible ? (
        <DefaultSkeletonGrid count={Math.min(layout.maxVisible, 6)} />
      ) : (
        <DefaultLoadingComponent />
      );
    }

    if (state?.error) {
      return (
        <DefaultErrorComponent 
          error={state.error} 
          onRetry={state.onRetry} 
        />
      );
    }

    if (options.length === 0) {
      return renderEmptyState ? renderEmptyState() : <DefaultEmptyState />;
    }

    const containerClasses = clsx(
      {
        [styles.optionsGrid]: effectiveLayout === "grid",
        [styles.optionsList]: effectiveLayout === "list", 
        [styles.optionsCarousel]: effectiveLayout === "carousel",
        [styles.columnsBase1]: layout?.columns?.base === 1,
        [styles.columnsBase2]: layout?.columns?.base === 2,
        [styles.densityCompact]: layout?.density === "compact",
        [styles.densitySpacious]: layout?.density === "spacious",
      }
    );

    const optionElements = visibleOptions.map((option) => (
      <div
        key={option.id}
        className={effectiveLayout === "carousel" ? styles.carouselItem : undefined}
        style={
          effectiveLayout === "carousel" 
            ? { "--carousel-item-width": `${layout?.carousel?.itemMinWidthPx || 300}px` } as React.CSSProperties
            : undefined
        }
      >
        <OptionCard
          option={option}
          isSelected={selectedIds.includes(option.id)}
          selectionMode={selectionMode}
          onToggleSelect={handleToggleSelect}
          onPrimaryAction={handlePrimaryAction}
          onSecondaryAction={handleSecondaryAction}
          renderHeader={renderOptionHeader}
          renderFooter={renderOptionFooter}
          theme={theme}
          disabled={state?.loading}
        />
      </div>
    ));

    return (
      <div className={containerClasses}>
        {optionElements}
      </div>
    );
  }, [
    state,
    options,
    visibleOptions,
    effectiveLayout,
    layout,
    selectedIds,
    selectionMode,
    handleToggleSelect,
    handlePrimaryAction,
    handleSecondaryAction,
    renderOptionHeader,
    renderOptionFooter,
    renderEmptyState,
    theme,
  ]);

  // ========================================================================
  // Render
  // ========================================================================

  const sectionRole = useMemo(() => {
    if (selectionMode === "none") return a11y?.roleHint || "region";
    if (selectionMode === "single") return "radiogroup";
    return "group";
  }, [selectionMode, a11y?.roleHint]);

  return (
    <section
      ref={sectionRef}
      className={clsx(styles.section, className)}
      role={sectionRole}
      aria-labelledby={title ? "booking-options-title" : undefined}
      aria-label={a11y?.ariaLabel || (!title ? "Booking options" : undefined)}
      {...a11y?.attributes}
    >
      <div className={styles.container}>
        {/* Live region for announcements */}
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          className={styles.srOnly}
        />

        {/* Header */}
        {(title || subtitle) && (
          <div className={styles.header}>
            {title && (
              <h2 id="booking-options-title" className={styles.title}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={styles.subtitle}>{subtitle}</p>
            )}
          </div>
        )}

        {/* Section Actions */}
        {sectionActions && (
          <div className={styles.sectionActions}>
            {sectionActions.primary && (
              <button
                className={clsx(styles.sectionActionButton, styles.primary)}
                onClick={handleSectionPrimaryAction}
                disabled={!!sectionActions.primary.disabledReason}
                type="button"
                aria-label={sectionActions.primary.disabledReason || sectionActions.primary.label}
              >
                {sectionActions.primary.label}
              </button>
            )}
            {sectionActions.secondary?.map((action, index) => (
              <button
                key={index}
                className={clsx(styles.sectionActionButton, styles.secondary)}
                onClick={() => handleSectionSecondaryAction(index)}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Options */}
        <div className={styles.optionsContainer}>
          {renderOptions()}
        </div>

        {/* Show More/Less Controls */}
        {!state?.loading && !state?.error && options.length > 0 && layout?.maxVisible && (
          <div className={styles.showMoreContainer}>
            {hasMoreOptions ? (
              <button
                className={styles.showMoreButton}
                onClick={handleShowMore}
                type="button"
              >
                Show More ({options.length - visibleCount} remaining)
              </button>
            ) : (
              visibleCount > (layout.maxVisible || 6) && (
                <button
                  className={styles.showMoreButton}
                  onClick={handleShowLess}
                  type="button"
                >
                  Show Less
                </button>
              )
            )}
          </div>
        )}

        {/* Selection Summary */}
        {selectionMode !== "none" && selectedIds.length > 0 && (
          <div className={styles.srOnly} aria-live="polite">
            {selectedIds.length} option{selectedIds.length !== 1 ? "s" : ""} selected
            {selection?.maxSelect && ` of ${selection.maxSelect} maximum`}
          </div>
        )}
      </div>
    </section>
  );
};

BookingOptionsSection.displayName = "BookingOptionsSection";

export default BookingOptionsSection;