import React, { useEffect, useRef, useState } from "react";
import styles from "./MediaViewers.module.css";
import type { ViewerProps } from "./types";

export const InteractiveViewer: React.FC<ViewerProps> = ({
  project,
  onLoad,
  onError,
  blockDetectMs = 3000,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      if (!loaded && !failed) {
        setBlocked(true);
        onError?.("Interactive demo blocked by security policies");
      }
    }, blockDetectMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [loaded, failed, onError, blockDetectMs]);

  const handleLoad = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setFailed(true);
    onError?.("Failed to load interactive demo");
  };

  const openExternal = () => {
    const url = project.href || project.media.src;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (blocked || failed) {
    return (
      <div className={styles.interactiveViewer}>
        <div className={styles.errorState} role="alert">
          <h3>Unable to load interactive demo</h3>
          <p>This demo can’t be embedded here due to security policies.</p>
          <div className={styles.errorActions}>
            <button type="button" className={styles.primaryButton} onClick={openExternal}>
              Open Demo in New Tab
            </button>
            <button
              type="button"
              className={styles.retryButton}
              onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.interactiveViewer}>
      {!loaded && (
        <div className={styles.loadingSpinner} aria-label="Loading interactive demo...">
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading interactive demo...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={project.media.src}
        className={`${styles.iframe} ${loaded ? styles.loaded : ""}`}
        title={project.media.title || `Interactive demo: ${project.title}`}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="no-referrer"
      />

      <div className={styles.iframeOverlay}>
        <div className={styles.overlayContent}>
          <button type="button" className={styles.openExternalButton} onClick={openExternal}>
            <svg
              className={styles.externalIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open in New Tab
          </button>
        </div>
      </div>
    </div>
  );
};