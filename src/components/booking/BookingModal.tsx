"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./booking.module.css";

export interface BookingModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Close handler (backdrop, ESC, Close button) */
  onClose: () => void;
  /** URL to embed (Calendly/Cal.com or your /book route with params) */
  src?: string;
  /** Dialog title for a11y */
  title?: string;
  /** Optional description (visually hidden but announced to SR users) */
  description?: string;
  /** Optional aria-labelled element id if title is external */
  labelledById?: string;
  /** Optional className for root dialog panel */
  className?: string;
  /** Additional props for the iframe element */
  iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
  /** Callback when iframe loads successfully */
  onLoad?: () => void;
  /** Callback when iframe fails to load */
  onError?: (error: Error) => void;
  /** Show loading state while iframe loads */
  showLoading?: boolean;
}

/** Utility: safely access document in SSR */
const hasDOM = () => typeof window !== "undefined" && typeof document !== "undefined";

/** Prevent background scroll while modal is open */
function useScrollLock(lock: boolean) {
  useLayoutEffect(() => {
    if (!hasDOM()) return;
    const { body } = document;
    if (!lock) return;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => { 
      body.style.overflow = prev; 
    };
  }, [lock]);
}

/** Trap focus within the dialog */
function useFocusTrap(rootRef: React.RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active || !rootRef.current || !hasDOM()) return;

    const root = rootRef.current;
    const focusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
          'textarea:not([disabled]), button:not([disabled]):not([tabindex="-1"]), ' +
          'iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable=true]'
        )
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && 
               style.visibility !== "hidden" && 
               !el.hasAttribute("disabled") && 
               !el.getAttribute("aria-hidden");
      });

    const firstFocus = () => {
      const els = focusable();
      (els[0] || root).focus();
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = focusable();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (activeEl === first || activeEl === root) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const onFocus = (e: FocusEvent) => {
      if (!root.contains(e.target as Node)) {
        firstFocus();
      }
    };

    const prev = document.activeElement as HTMLElement | null;
    firstFocus();

    document.addEventListener("keydown", onKeydown);
    document.addEventListener("focusin", onFocus);

    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("focusin", onFocus);
      prev?.focus();
    };
  }, [active, rootRef]);
}

/** BookingModal — accessible, focus-trapped, ESC/backdrop closable, scroll-locked */
export default function BookingModal({
  isOpen,
  onClose,
  src = "/book",
  title = "Schedule Consultation",
  description = "Use this dialog to book time with our team.",
  labelledById,
  className,
  iframeProps,
  onLoad,
  onError,
  showLoading = true,
}: BookingModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(showLoading);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Close on ESC
  useEffect(() => {
    if (!isOpen || !hasDOM()) return;
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(); 
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Focus trap + scroll lock
  useFocusTrap(dialogRef, isOpen);
  useScrollLock(isOpen);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(showLoading);
      setHasError(false);
      setErrorMessage("");
    }
  }, [isOpen, showLoading]);

  // Backdrop click (ignore clicks inside panel)
  const onBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const onPanelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Iframe event handlers
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage("Unable to load booking form. Please try refreshing or contact us directly.");
    const error = new Error("Iframe failed to load");
    onError?.(error);
  }, [onError]);

  // Handle fallback to booking page
  const handleFallbackAction = useCallback(() => {
    window.open(src, "_blank", "noopener,noreferrer");
    onClose();
  }, [src, onClose]);

  // ARIA labelling
  const titleId = useMemo(() => labelledById ?? "booking-title", [labelledById]);
  const descId = "booking-desc";

  if (!isOpen) return null;

  return (
    <div 
      className={styles.backdrop} 
      role="presentation" 
      onClick={onBackdropClick}
      data-testid="booking-modal-backdrop"
    >
      <div
        className={[styles.dialog, className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={onPanelClick}
        ref={dialogRef}
        tabIndex={-1}
        data-focus-trapped="true"
        data-testid="booking-modal-dialog"
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button 
            className={styles.close} 
            type="button" 
            aria-label="Close booking modal" 
            onClick={onClose}
            data-testid="booking-modal-close"
          >
            ×
          </button>
        </header>

        {/* SR description, so screen readers get context */}
        <p id={descId} className={styles.srOnly}>
          {description}
        </p>

        <div className={styles.body}>
          {hasError ? (
            <div className={styles.errorState} data-testid="booking-modal-error">
              <h3 className={styles.errorTitle}>Booking Unavailable</h3>
              <p className={styles.errorMessage}>{errorMessage}</p>
              <button 
                className={styles.errorAction}
                onClick={handleFallbackAction}
                type="button"
              >
                Open Booking Page
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className={styles.loadingState} data-testid="booking-modal-loading">
                  <div className={styles.loadingSpinner} aria-hidden="true"></div>
                  <span>Loading booking form...</span>
                </div>
              )}
              <div className={styles.iframeWrap}>
                <iframe
                  src={src}
                  title="Booking Form"
                  loading="lazy"
                  className={styles.iframe}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  data-testid="booking-modal-iframe"
                  {...iframeProps}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}