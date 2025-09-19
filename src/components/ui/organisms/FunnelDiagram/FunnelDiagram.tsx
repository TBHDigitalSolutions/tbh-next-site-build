// src/components/ui/organisms/FunnelDiagram/FunnelDiagram.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./FunnelDiagram.module.css";
import type { FunnelDiagramProps, FunnelStep } from "./FunnelDiagram.types";

export const FunnelDiagram: React.FC<FunnelDiagramProps> = ({
  steps,
  variant = "interactive",
  showMetrics = true,
  showTactics = true,
  showConversionRates = false,
  showVolume = false,
  interactive = true,
  animated = true,
  orientation = "vertical",
  direction = "top-down",
  colorScheme = "blue",
  customColors,
  size = "medium",
  showArrows = true,
  arrowStyle = "simple",
  highlightOnHover = true,
  onStepClick,
  onStepHover,
  className = "",
  style,
  loading = false,
  error,
  title,
  subtitle,
  showStepNumbers = true,
  expandable = false,
  defaultExpanded,
  responsive = true,
  mobileVariant = "stacked",
}) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<boolean[]>(
    defaultExpanded || steps.map(() => false)
  );
  const [isVisible, setIsVisible] = useState(false);
  const funnelRef = useRef<HTMLDivElement>(null);

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

    if (funnelRef.current) {
      observer.observe(funnelRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  // Handle step click
  const handleStepClick = (step: FunnelStep, index: number) => {
    if (!interactive) return;

    if (expandable) {
      const newExpanded = [...expandedSteps];
      newExpanded[index] = !newExpanded[index];
      setExpandedSteps(newExpanded);
    } else {
      setActiveStep(activeStep === index ? null : index);
    }

    if (onStepClick) {
      onStepClick(step, index);
    }

    if (step.href) {
      window.open(step.href, "_blank");
    }
  };

  // Handle step hover
  const handleStepHover = (step: FunnelStep, index: number) => {
    if (highlightOnHover && onStepHover) {
      onStepHover(step, index);
    }
  };

  // Calculate funnel width for each step
  const calculateStepWidth = (index: number): number => {
    const baseWidth = 100;
    const reductionPerStep = 15;
    return Math.max(baseWidth - (index * reductionPerStep), 30);
  };

  // Get step color
  const getStepColor = (index: number): string => {
    if (customColors && customColors[index]) {
      return customColors[index];
    }

    switch (colorScheme) {
      case "gradient":
        const gradientColors = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"];
        return gradientColors[index % gradientColors.length];
      case "rainbow":
        const rainbowColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
        return rainbowColors[index % rainbowColors.length];
      case "monochrome":
        const intensity = 100 - (index * 15);
        return `hsl(220, 50%, ${intensity}%)`;
      case "blue":
      default:
        return `hsl(200, 70%, ${75 - index * 10}%)`;
    }
  };

  // Render arrow between steps
  const renderArrow = (index: number) => {
    if (!showArrows || index === steps.length - 1) return null;

    return (
      <div className={`${styles.arrow} ${styles[arrowStyle]} ${styles[orientation]}`}>
        {arrowStyle === "animated" && <div className={styles.arrowPulse} />}
        <svg viewBox="0 0 24 24" className={styles.arrowIcon}>
          {orientation === "vertical" ? (
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(90 12 12)" />
          ) : (
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          )}
        </svg>
      </div>
    );
  };

  // Render tactics list
  const renderTactics = (step: FunnelStep, index: number) => {
    if (!showTactics || !step.tactics || step.tactics.length === 0) return null;

    const isExpanded = expandable ? expandedSteps[index] : activeStep === index || !interactive;

    return (
      <div className={`${styles.tactics} ${isExpanded ? styles.expanded : ""}`}>
        <h5 className={styles.tacticsTitle}>Tactics:</h5>
        <ul className={styles.tacticsList}>
          {step.tactics.map((tactic, idx) => (
            <li key={idx} className={styles.tacticItem}>
              {tactic}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render metrics
  const renderMetrics = (step: FunnelStep) => {
    if (!showMetrics || !step.metrics) return null;

    return (
      <div className={styles.metrics}>
        <strong>Key Metrics:</strong> {step.metrics}
      </div>
    );
  };

  // Render conversion rate
  const renderConversionRate = (step: FunnelStep) => {
    if (!showConversionRates || !step.conversionRate) return null;

    return (
      <div className={styles.conversionRate}>
        <span className={styles.conversionLabel}>Conversion Rate:</span>
        <span className={styles.conversionValue}>{step.conversionRate}%</span>
      </div>
    );
  };

  // Render volume
  const renderVolume = (step: FunnelStep) => {
    if (!showVolume || !step.volume) return null;

    return (
      <div className={styles.volume}>
        <span className={styles.volumeLabel}>Volume:</span>
        <span className={styles.volumeValue}>{step.volume.toLocaleString()}</span>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.funnelDiagram} ${styles.loading} ${className}`}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading funnel...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.funnelDiagram} ${styles.error} ${className}`}>
        <div className={styles.errorMessage}>
          <ion-icon name="alert-circle-outline"></ion-icon>
          <p>Error loading funnel: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={funnelRef}
      className={`
        ${styles.funnelDiagram}
        ${styles[variant]}
        ${styles[orientation]}
        ${styles[direction]}
        ${styles[size]}
        ${isVisible ? styles.visible : ""}
        ${interactive ? styles.interactive : ""}
        ${responsive ? styles.responsive : ""}
        ${className}
      `}
      style={style}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      {/* Funnel Container */}
      <div className={styles.funnelContainer}>
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const isExpanded = expandable ? expandedSteps[index] : isActive || !interactive;
          const stepWidth = calculateStepWidth(index);
          const stepColor = getStepColor(index);

          return (
            <div key={step.id || index} className={styles.stepWrapper}>
              <div
                className={`
                  ${styles.funnelStep}
                  ${isActive ? styles.active : ""}
                  ${isExpanded ? styles.expanded : ""}
                  ${step.active ? styles.highlighted : ""}
                  ${step.className || ""}
                `}
                style={{
                  width: orientation === "vertical" ? `${stepWidth}%` : "auto",
                  backgroundColor: stepColor,
                  animationDelay: `${index * 0.2}s`,
                }}
                onClick={() => handleStepClick(step, index)}
                onMouseEnter={() => handleStepHover(step, index)}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={(e) => {
                  if (interactive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleStepClick(step, index);
                  }
                }}
              >
                {/* Step Header */}
                <div className={styles.stepHeader}>
                  {showStepNumbers && (
                    <div className={styles.stepNumber}>{index + 1}</div>
                  )}
                  
                  {step.icon && (
                    <div className={styles.stepIcon}>
                      <ion-icon name={step.icon}></ion-icon>
                    </div>
                  )}
                  
                  <div className={styles.stepInfo}>
                    <h3 className={styles.stageName}>{step.stage}</h3>
                    <h4 className={styles.stageTitle}>{step.title}</h4>
                  </div>

                  {expandable && (
                    <div className={styles.expandIcon}>
                      <ion-icon name={isExpanded ? "chevron-up" : "chevron-down"}></ion-icon>
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className={styles.stepContent}>
                  <p className={styles.stageDescription}>{step.description}</p>

                  {/* Additional Info */}
                  <div className={styles.stepMeta}>
                    {renderConversionRate(step)}
                    {renderVolume(step)}
                  </div>

                  {/* Expandable Content */}
                  {renderTactics(step, index)}
                  {renderMetrics(step)}
                </div>
              </div>

              {/* Arrow */}
              {renderArrow(index)}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      {interactive && variant === "interactive" && (
        <div className={styles.instructions}>
          <ion-icon name="information-circle-outline"></ion-icon>
          <span>Click on any stage to explore tactics and strategies</span>
        </div>
      )}
    </div>
  );
};