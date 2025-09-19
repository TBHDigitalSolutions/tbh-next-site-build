import React, { useState } from "react";
import styles from "./MediaViewers.module.css";
import type { ViewerProps } from "./types";

export const ImageViewer: React.FC<ViewerProps> = ({ project, onLoad, onError }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [nonce, setNonce] = useState(0); // cache-busting retry

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setFailed(true);
    onError?.("Failed to load image");
  };

  const retry = () => {
    setFailed(false);
    setLoaded(false);
    setNonce((n) => n + 1);
  };

  const srcWithNonce = project.media.src + (project.media.src.includes("?") ? "&" : "?") + `r=${nonce}`;

  return (
    <div className={styles.imageViewer}>
      {!loaded && !failed && (
        <div className={styles.loadingSpinner} aria-label="Loading image...">
          <div className={styles.spinner}></div>
        </div>
      )}

      {failed ? (
        <div className={styles.errorState} role="alert">
          <p>Failed to load image.</p>
          <button type="button" className={styles.retryButton} onClick={retry}>
            Retry
          </button>
        </div>
      ) : (
        <img
          src={nonce ? srcWithNonce : project.media.src}
          alt={project.media.alt || project.title}
          className={`${styles.image} ${loaded ? styles.loaded : ""}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};