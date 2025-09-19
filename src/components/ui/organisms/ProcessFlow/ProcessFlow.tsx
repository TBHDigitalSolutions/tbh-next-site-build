// src/components/ui/organisms/ProcessFlow/ProcessFlow.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FlowStep } from "./FlowStep";
import styles from "./ProcessFlow.module.css";
import type { ProcessFlowProps, FlowStepData } from "./ProcessFlow.types";

export const ProcessFlow: React.FC<ProcessFlowProps> = ({
  steps,
  variant = "default",
  orientation = "vertical",
  showStepNumbers = true,
  showIcons = false,
  showStatus = true,
  showDeliverables = false,
  showResources = false,
  showDependencies = false,
  showDuration = false,
  showDates = false,
  showProgress = false,
  interactive = false,
  expandable = false,
  defaultExpanded,
  animated = true,
  animationType = "fade",
  activeStep,
  completedSteps = [],
  colorScheme = "blue",
  customColors,
  connectorStyle = "line",
  showConnector = true,
  size = "medium",
  spacing = "normal",
  maxWidth,
  centered = false,
  responsive = true,
  mobileVariant = "stack",
  onStepClick,
  onStepHover,
  onProgressChange,
  title,
  subtitle,
  headerContent,
  footerContent,
  loading = false,
  error,
  emptyMessage = "No process steps found",
  backgroundColor,
  borderStyle = "none",
  className = "",
  style,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<boolean[]>(
    defaultExpanded || steps.map(() => false)
  );
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for animations
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  // Update step statuses based on activeStep and completedSteps
  const processedSteps = steps.map((step, index) => {
    let status = step.status;
    
    if (completedSteps.includes(index)) {
      status = "completed";
    } else if (activeStep === index) {
      status = "active";
    } else if (activeStep !== undefined && index > activeStep) {
      status = "pending";
    }

    return { ...step, status };
  });

  // Handle step expand/collapse
  const handleToggleExpand = (index: number) => {
    const newExpanded = [...expandedSteps];
    newExpanded[index] = !newExpanded[index];
    setExpandedSteps(newExpanded);
  };

  // Handle step click
  const handleStepClick = (step: FlowStepData, index: number) => {
    if (onStepClick) {
      onStepClick(step, index);
    }
  };

  // Handle step hover
  const handleStepHover = (step: FlowStepData, index: number) => {
    if (onStepHover) {
      onStepHover(step, index);
    }
  };

  // Render connector between steps
  const renderConnector = (index: number) => {
    if (!showConnector || index === processedSteps.length - 1) return null;
    
    if (variant === "horizontal" || orientation === "horizontal") {
      return (
        <div className={`${styles.connector} ${styles.horizontal} ${styles[connectorStyle]}`}>
          <div className={styles.connectorLine}></div>
          {connectorStyle === "arrow" && (
            <div className={styles.arrowHead}>
              <ion-icon name="chevron-forward"></ion-icon>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`${styles.connector} ${styles.vertical} ${styles[connectorStyle]}`}>
        <div className={styles.connectorLine}></div>
      </div>
    );
  };

  // Render navigation for carousel (mobile)
  const renderCarouselNavigation = () => {
    if (variant !== "default" || !responsive) return null;

    return (
      <div className={styles.carouselNavigation}>
        <button
          className={styles.navButton}
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          <ion-icon name="chevron-back"></ion-icon>
        </button>
        
        <div className={styles.slideIndicators}>
          {processedSteps.map((_, index) => (
            <button
              key={index}
              className={`${styles.slideIndicator} ${currentSlide === index ? styles.active : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        
        <button
          className={styles.navButton}
          onClick={() => setCurrentSlide(Math.min(processedSteps.length - 1, currentSlide + 1))}
          disabled={currentSlide === processedSteps.length - 1}
        >
          <ion-icon name="chevron-forward"></ion-icon>
        </button>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.processFlow} ${styles.loading} ${className}`}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading process flow...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.processFlow} ${styles.error} ${className}`}>
        <div className={styles.errorMessage}>
          <ion-icon name="alert-circle-outline"></ion-icon>
          <p>Error loading process flow: {error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (processedSteps.length === 0) {
    return (
      <div className={`${styles.processFlow} ${styles.empty} ${className}`}>
        <div className={styles.emptyState}>
          <ion-icon name="list-outline"></ion-icon>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const customStyles = {
    backgroundColor,
    maxWidth,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`
        ${styles.processFlow}
        ${styles[variant]}
        ${styles[orientation]}
        ${styles[spacing]}
        ${styles[size]}
        ${styles[colorScheme]}
        ${borderStyle !== "none" ? styles[borderStyle] : ""}
        ${centered ? styles.centered : ""}
        ${responsive ? styles.responsive : ""}
        ${animated && isVisible ? styles.visible : ""}
        ${className}
      `}
      style={customStyles}
    >
      {/* Header */}
      {(title || subtitle || headerContent) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {headerContent}
        </div>
      )}

      {/* Steps Container */}
      <div className={styles.stepsContainer}>
        {processedSteps.map((step, index) => (
          <div key={step.id} className={styles.stepWrapper}>
            <FlowStep
              step={step}
              index={index}
              variant={variant}
              showStepNumbers={showStepNumbers}
              showIcons={showIcons}
              showStatus={showStatus}
              showDeliverables={showDeliverables}
              showResources={showResources}
              showDependencies={showDependencies}
              showDuration={showDuration}
              showDates={showDates}
              showProgress={showProgress}
              interactive={interactive}
              expandable={expandable}
              isExpanded={expandedSteps[index]}
              animated={animated}
              animationType={animationType}
              size={size}
              colorScheme={colorScheme}
              customColors={customColors}
              onStepClick={handleStepClick}
              onStepHover={handleStepHover}
              onToggleExpand={handleToggleExpand}
            />
            {renderConnector(index)}
          </div>
        ))}
      </div>

      {/* Carousel Navigation */}
      {renderCarouselNavigation()}

      {/* Footer */}
      {footerContent && (
        <div className={styles.footer}>
          {footerContent}
        </div>
      )}
    </div>
  );
};