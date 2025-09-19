// src/components/portfolio/PortfolioModal/PortfolioModal.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/atoms/Button/Button";
import styles from "./PortfolioModal.module.css";
import type { Project } from "@/data/portfolio";

// ============================
// TYPE DEFINITIONS
// ============================

export interface PortfolioModalProps {
  /** Project to display */
  project: Project;
  /** Current index in the collection */
  index?: number;
  /** Total number of projects */
  total?: number;
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Previous project handler */
  onPrevious?: () => void;
  /** Next project handler */
  onNext?: () => void;
  /** Custom CSS class name */
  className?: string;
}

// ============================
// MEDIA VIEWER COMPONENTS
// ============================

interface MediaViewerProps {
  project: Project;
}

const VideoViewer: React.FC<MediaViewerProps> = ({ project }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  }, [project.media.src]);

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        className={styles.video}
        controls
        poster={project.media.poster}
        preload="metadata"
        aria-label={`Video: ${project.title}`}
      >
        <source src={project.media.src} type="video/mp4" />
        <p>Your browser does not support the video element.</p>
      </video>
    </div>
  );
};

const ImageViewer: React.FC<MediaViewerProps> = ({ project }) => {
  return (
    <div className={styles.imageContainer}>
      <img
        src={project.media.src}
        alt={project.media.alt || project.title}
        className={styles.image}
        loading="lazy"
      />
    </div>
  );
};

const InteractiveViewer: React.FC<MediaViewerProps> = ({ project }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className={styles.interactiveContainer}>
      <iframe
        ref={iframeRef}
        src={project.media.src}
        className={styles.iframe}
        title={project.media.title || `Interactive demo: ${project.title}`}
        sandbox="allow-scripts allow-same-origin allow-forms"
        loading="lazy"
      />
      {project.href && (
        <div className={styles.iframeOverlay}>
          <Button
            asChild
            size="sm"
            variant="outline"
            className={styles.openExternalButton}
          >
            <a 
              href={project.href} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Open live site in new tab"
            >
              Open Live Site
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

const PDFViewer: React.FC<MediaViewerProps> = ({ project }) => {
  return (
    <div className={styles.pdfContainer}>
      <iframe
        src={`${project.media.src}#view=FitH`}
        className={styles.pdfFrame}
        title={`PDF: ${project.title}`}
      />
      <div className={styles.pdfActions}>
        <Button
          asChild
          size="sm"
          variant="outline"
          className={styles.downloadButton}
        >
          <a 
            href={project.media.src} 
            download 
            aria-label="Download PDF"
          >
            Download PDF
          </a>
        </Button>
      </div>
    </div>
  );
};

// ============================
// MAIN MODAL COMPONENT
// ============================

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  project,
  index,
  total,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle arrow key navigation
  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && onPrevious) {
        event.preventDefault();
        onPrevious();
      } else if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleArrowKeys);
      return () => document.removeEventListener("keydown", handleArrowKeys);
    }
  }, [isOpen, onPrevious, onNext]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Render appropriate media viewer
  const renderMediaViewer = () => {
    switch (project.media.type) {
      case "video":
        return <VideoViewer project={project} />;
      case "interactive":
        return <InteractiveViewer project={project} />;
      case "pdf":
        return <PDFViewer project={project} />;
      case "image":
      default:
        return <ImageViewer project={project} />;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={`${styles.modalBackdrop} ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className={styles.modalContainer}
        tabIndex={-1}
      >
        {/* Modal Header */}
        <header className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h2 id="modal-title" className={styles.modalTitle}>
                {project.title}
              </h2>
              {project.client && (
                <p className={styles.modalClient}>{project.client}</p>
              )}
            </div>
            
            {total && index !== undefined && (
              <div className={styles.counter}>
                {index + 1} of {total}
              </div>
            )}
          </div>

          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        {/* Media Content */}
        <div className={styles.modalContent}>
          {renderMediaViewer()}
        </div>

        {/* Modal Footer */}
        <footer className={styles.modalFooter}>
          <div className={styles.projectInfo}>
            {project.description && (
              <p id="modal-description" className={styles.modalDescription}>
                {project.description}
              </p>
            )}

            {project.metrics && project.metrics.length > 0 && (
              <div className={styles.metrics}>
                {project.metrics.map((metric, idx) => (
                  <div key={idx} className={styles.metric}>
                    <span className={styles.metricValue}>{metric.value}</span>
                    <span className={styles.metricLabel}>{metric.label}</span>
                  </div>
                ))}
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className={styles.tags}>
                {project.tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            {onPrevious && (
              <Button
                onClick={onPrevious}
                size="sm"
                variant="outline"
                className={styles.navButton}
                aria-label="Previous project"
              >
                ← Previous
              </Button>
            )}
            
            {onNext && (
              <Button
                onClick={onNext}
                size="sm"
                variant="outline"
                className={styles.navButton}
                aria-label="Next project"
              >
                Next →
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PortfolioModal;