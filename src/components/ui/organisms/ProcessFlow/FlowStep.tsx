// src/components/ui/organisms/ProcessFlow/FlowStep.tsx
"use client";

import React, { useState } from "react";
import styles from "./FlowStep.module.css";
import type { FlowStepData } from "./ProcessFlow.types";

interface FlowStepProps {
  step: FlowStepData;
  index: number;
  variant: string;
  showStepNumbers: boolean;
  showIcons: boolean;
  showStatus: boolean;
  showDeliverables: boolean;
  showResources: boolean;
  showDependencies: boolean;
  showDuration: boolean;
  showDates: boolean;
  showProgress: boolean;
  interactive: boolean;
  expandable: boolean;
  isExpanded: boolean;
  animated: boolean;
  animationType: string;
  size: string;
  colorScheme: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  onStepClick?: (step: FlowStepData, index: number) => void;
  onStepHover?: (step: FlowStepData, index: number) => void;
  onToggleExpand?: (index: number) => void;
}

export const FlowStep: React.FC<FlowStepProps> = ({
  step,
  index,
  variant,
  showStepNumbers,
  showIcons,
  showStatus,
  showDeliverables,
  showResources,
  showDependencies,
  showDuration,
  showDates,
  showProgress,
  interactive,
  expandable,
  isExpanded,
  animated,
  animationType,
  size,
  colorScheme,
  customColors,
  onStepClick,
  onStepHover,
  onToggleExpand,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Handle step click
  const handleClick = () => {
    if (interactive && onStepClick) {
      onStepClick(step, index);
    }
    if (expandable && onToggleExpand) {
      onToggleExpand(index);
    }
    if (step.onClick) {
      step.onClick();
    }
  };

  // Handle step hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onStepHover) {
      onStepHover(step, index);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Get status color
  const getStatusColor = (): string => {
    if (customColors) {
      switch (step.status) {
        case "completed": return customColors.success || "#10b981";
        case "active": return customColors.primary || "#3b82f6";
        case "pending": return customColors.secondary || "#6b7280";
        case "error": return customColors.error || "#ef4444";
        case "skipped": return customColors.warning || "#f59e0b";
        default: return customColors.secondary || "#6b7280";
      }
    }

    switch (colorScheme) {
      case "green":
        return step.status === "completed" ? "#10b981" : "#22c55e";
      case "purple":
        return step.status === "completed" ? "#8b5cf6" : "#a855f7";
      case "orange":
        return step.status === "completed" ? "#f97316" : "#fb923c";
      case "red":
        return step.status === "completed" ? "#ef4444" : "#f87171";
      default:
        return step.status === "completed" ? "#3b82f6" : "#60a5fa";
    }
  };

  // Render step number/icon
  const renderStepIndicator = () => {
    const statusColor = getStatusColor();

    return (
      <div
        className={`
          ${styles.stepIndicator}
          ${styles[step.status || "pending"]}
          ${styles[size]}
        `}
        style={{ backgroundColor: statusColor }}
      >
        {showIcons && step.icon ? (
          <ion-icon name={step.icon}></ion-icon>
        ) : showStepNumbers ? (
          <span className={styles.stepNumber}>{step.step}</span>
        ) : (
          <div className={styles.stepDot}></div>
        )}
      </div>
    );
  };

  // Render status badge
  const renderStatusBadge = () => {
    if (!showStatus || !step.status) return null;

    return (
      <div className={`${styles.statusBadge} ${styles[step.status]}`}>
        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
      </div>
    );
  };

  // Render duration
  const renderDuration = () => {
    if (!showDuration || !step.duration) return null;

    return (
      <div className={styles.duration}>
        <ion-icon name="time-outline"></ion-icon>
        <span>{step.duration}</span>
      </div>
    );
  };

  // Render date
  const renderDate = () => {
    if (!showDates || !step.date) return null;

    return (
      <div className={styles.date}>
        <ion-icon name="calendar-outline"></ion-icon>
        <span>{step.date}</span>
      </div>
    );
  };

  // Render progress bar
  const renderProgress = () => {
    if (!showProgress || step.progress === undefined) return null;

    return (
      <div className={styles.progressContainer}>
        <div className={styles.progressLabel}>
          Progress: {step.progress}%
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${step.progress}%`,
              backgroundColor: getStatusColor(),
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Render deliverables
  const renderDeliverables = () => {
    if (!showDeliverables || !step.deliverables || step.deliverables.length === 0) return null;

    return (
      <div className={styles.deliverables}>
        <h4 className={styles.sectionTitle}>
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          Deliverables
        </h4>
        <ul className={styles.list}>
          {step.deliverables.map((deliverable, idx) => (
            <li key={idx}>{deliverable}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Render resources
  const renderResources = () => {
    if (!showResources || !step.resources || step.resources.length === 0) return null;

    return (
      <div className={styles.resources}>
        <h4 className={styles.sectionTitle}>
          <ion-icon name="library-outline"></ion-icon>
          Resources
        </h4>
        <ul className={styles.list}>
          {step.resources.map((resource, idx) => (
            <li key={idx}>{resource}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Render dependencies
  const renderDependencies = () => {
    if (!showDependencies || !step.dependencies || step.dependencies.length === 0) return null;

    return (
      <div className={styles.dependencies}>
        <h4 className={styles.sectionTitle}>
          <ion-icon name="git-branch-outline"></ion-icon>
          Dependencies
        </h4>
        <ul className={styles.list}>
          {step.dependencies.map((dependency, idx) => (
            <li key={idx}>{dependency}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Render substeps
  const renderSubsteps = () => {
    if (!step.substeps || step.substeps.length === 0) return null;

    return (
      <div className={styles.substeps}>
        <h4 className={styles.sectionTitle}>
          <ion-icon name="list-outline"></ion-icon>
          Substeps
        </h4>
        <div className={styles.substepsList}>
          {step.substeps.map((substep, idx) => (
            <div key={substep.id} className={styles.substep}>
              <div className={styles.substepIndicator}>
                {idx + 1}
              </div>
              <div className={styles.substepContent}>
                <h5 className={styles.substepTitle}>{substep.title}</h5>
                <p className={styles.substepDescription}>{substep.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`
        ${styles.flowStep}
        ${styles[variant]}
        ${styles[size]}
        ${step.status ? styles[step.status] : ""}
        ${interactive ? styles.interactive : ""}
        ${isHovered ? styles.hovered : ""}
        ${isExpanded ? styles.expanded : ""}
        ${step.className || ""}
      `}
      style={{
        animationDelay: animationType === "stagger" ? `${index * 0.1}s` : "0s",
        ...step.style,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Step Header */}
      <div className={styles.stepHeader}>
        {renderStepIndicator()}
        
        <div className={styles.stepHeaderContent}>
          <div className={styles.stepTitleRow}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            {renderStatusBadge()}
          </div>
          
          <div className={styles.stepMeta}>
            {renderDuration()}
            {renderDate()}
          </div>
        </div>

        {expandable && (
          <div className={styles.expandIcon}>
            <ion-icon name={isExpanded ? "chevron-up" : "chevron-down"}></ion-icon>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className={styles.stepContent}>
        <p className={styles.stepDescription}>{step.description}</p>
        
        {step.details && (
          <div className={styles.stepDetails}>
            <p>{step.details}</p>
          </div>
        )}

        {renderProgress()}

        {/* Expandable Content */}
        {(isExpanded || !expandable) && (
          <div className={styles.expandableContent}>
            {renderDeliverables()}
            {renderResources()}
            {renderDependencies()}
            {renderSubsteps()}
          </div>
        )}
      </div>
    </div>
  );
};