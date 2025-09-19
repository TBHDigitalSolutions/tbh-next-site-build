// src/components/portfolio/UniversalPortfolioModal/UniversalPortfolioModal.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ModalShell } from '../ModalShell/ModalShell';
import { mediaViewerRegistry, getMediaViewer } from '../mediaViewers';
import type { Project } from '../types';
import styles from './UniversalPortfolioModal.module.css';

interface UniversalPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  index?: number;
  total?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
  onMediaLoad?: (project: Project) => void;
  onMediaError?: (project: Project, error: string) => void;
}

export const UniversalPortfolioModal: React.FC<UniversalPortfolioModalProps> = ({
  isOpen,
  onClose,
  project,
  index,
  total,
  onPrevious,
  onNext,
  showNavigation = true,
  onMediaLoad,
  onMediaError
}) => {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Reset loading state when project changes
  useEffect(() => {
    if (isOpen) {
      setMediaLoaded(false);
      setMediaError(null);
    }
  }, [project.id, isOpen]);

  // Handle media loading events
  const handleMediaLoad = useCallback(() => {
    setMediaLoaded(true);
    onMediaLoad?.(project);
  }, [project, onMediaLoad]);

  const handleMediaError = useCallback((error: string) => {
    setMediaError(error);
    onMediaError?.(project, error);
  }, [project, onMediaError]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrevious, onNext]);

  // Get the appropriate viewer component with fallback
  const ViewerComponent = getMediaViewer(project.media.type);

  // Determine modal size based on media type
  const getModalSize = () => {
    switch (project.media.type) {
      case 'interactive':
        return 'fullscreen';
      case 'video':
      case 'pdf':
        return 'large';
      default:
        return 'default';
    }
  };

  const modalSize = getModalSize();
  const hasNavigation = showNavigation && (onPrevious || onNext);
  const hasMetrics = project.metrics && project.metrics.length > 0;
  const hasTags = project.tags && project.tags.length > 0;

  // Graceful fallback for missing viewer
  if (!ViewerComponent) {
    return (
      <ModalShell 
        isOpen={isOpen} 
        onClose={onClose}
        size="default"
        className={styles.portfolioModal}
        aria-labelledby="portfolio-modal-title"
        closeOnEscape={true}
      >
        <div className={styles.modalContent}>
          <header className={styles.header}>
            <h2 id="portfolio-modal-title" className={styles.title}>
              {project.title}
            </h2>
          </header>
          <div className={styles.content}>
            <div className={styles.unsupportedMediaType}>
              <h3>Unsupported Media Type</h3>
              <p>Cannot display media type: {project.media.type}</p>
              {project.href && (
                <a 
                  href={project.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  View Externally
                </a>
              )}
            </div>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell 
      isOpen={isOpen} 
      onClose={onClose}
      size={modalSize}
      className={`${styles.portfolioModal} ${styles[`mediaType-${project.media.type}`]}`}
      aria-labelledby="portfolio-modal-title"
      aria-describedby="portfolio-modal-description"
      closeOnEscape={true}
    >
      <div className={styles.modalContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.titleSection}>
            <h2 id="portfolio-modal-title" className={styles.title}>
              {project.title}
            </h2>
            {project.client && (
              <p className={styles.client}>
                <span className={styles.clientLabel}>Client:</span>
                {project.client}
              </p>
            )}
          </div>
          
          {total && index !== undefined && total > 1 && (
            <div className={styles.counter} aria-label={`Item ${index + 1} of ${total}`}>
              <span className={styles.counterText}>
                {index + 1} <span className={styles.counterSeparator}>of</span> {total}
              </span>
            </div>
          )}
        </header>

        {/* Main content area */}
        <div className={styles.content}>
          <div className={styles.mediaContainer}>
            <ViewerComponent 
              project={project}
              onLoad={handleMediaLoad}
              onError={handleMediaError}
            />
          </div>
        </div>

        {/* Footer with metadata and navigation */}
        <footer className={styles.footer}>
          {/* Description */}
          {project.description && (
            <div className={styles.descriptionSection}>
              <p id="portfolio-modal-description" className={styles.description}>
                {project.description}
              </p>
            </div>
          )}

          {/* Metrics */}
          {hasMetrics && (
            <div className={styles.metricsSection}>
              <h3 className={styles.sectionTitle}>Results</h3>
              <div className={styles.metrics}>
                {project.metrics!.map((metric, idx) => (
                  <div key={idx} className={styles.metric}>
                    <span className={styles.metricValue} aria-label={`${metric.label}: ${metric.value}`}>
                      {metric.value}
                    </span>
                    <span className={styles.metricLabel}>
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {hasTags && (
            <div className={styles.tagsSection}>
              <h3 className={styles.sectionTitle}>Tags</h3>
              <div className={styles.tags} role="list">
                {project.tags!.map(tag => (
                  <span key={tag} className={styles.tag} role="listitem">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {hasNavigation && (
            <div className={styles.navigation} role="group" aria-label="Portfolio navigation">
              {onPrevious && (
                <button 
                  onClick={onPrevious} 
                  className={`${styles.navButton} ${styles.prevButton}`}
                  aria-label="View previous project"
                  type="button"
                >
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                  <span>Previous</span>
                </button>
              )}
              
              {onNext && (
                <button 
                  onClick={onNext} 
                  className={`${styles.navButton} ${styles.nextButton}`}
                  aria-label="View next project"
                  type="button"
                >
                  <span>Next</span>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Loading and error states */}
          {!mediaLoaded && !mediaError && project.media.type !== 'image' && (
            <div className={styles.loadingIndicator} aria-live="polite">
              <span>Loading {project.media.type}...</span>
            </div>
          )}

          {mediaError && (
            <div className={styles.errorIndicator} role="alert" aria-live="assertive">
              <span>Error: {mediaError}</span>
            </div>
          )}
        </footer>
      </div>
    </ModalShell>
  );
};

export default UniversalPortfolioModal;