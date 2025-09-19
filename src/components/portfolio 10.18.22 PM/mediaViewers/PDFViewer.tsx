import React, { useState } from "react";
import styles from "./MediaViewers.module.css";
import type { ViewerProps } from "./types";

export const PDFViewer: React.FC<ViewerProps> = ({ project, onLoad, onError }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setFailed(true);
    onError?.("Failed to load PDF");
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = project.media.src;
    link.download = `${project.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(project.media.src, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.pdfViewer}>
      {!loaded && !failed && (
        <div className={styles.loadingSpinner} aria-label="Loading PDF...">
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading PDF document...</p>
        </div>
      )}

      {failed ? (
        <div className={styles.errorState} role="alert">
          <h3>Unable to display PDF</h3>
          <p>Your browser may not support embedded PDFs.</p>
          <div className={styles.errorActions}>
            <button type="button" className={styles.primaryButton} onClick={openInNewTab}>
              Open PDF in New Tab
            </button>
            <button type="button" className={styles.retryButton} onClick={downloadPDF}>
              Download PDF
            </button>
          </div>
        </div>
      ) : (
        <>
          <iframe
            src={`${project.media.src}#toolbar=1&navpanes=1&scrollbar=1`}
            className={`${styles.pdfFrame} ${loaded ? styles.loaded : ""}`}
            title={`PDF: ${project.title}`}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
          <div className={styles.pdfActions}>
            <button type="button" className={styles.retryButton} onClick={downloadPDF}>
              Download PDF
            </button>
            <button type="button" className={styles.linkButton} onClick={openInNewTab}>
              Open in New Tab
            </button>
          </div>
        </>
      )}
    </div>
  );
};