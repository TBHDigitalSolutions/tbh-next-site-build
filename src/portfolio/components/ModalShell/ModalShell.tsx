// ===================================================================
// /src/components/portfolio/ModalShell/ModalShell.tsx
// ===================================================================
// Accessible, SSR-safe modal shell with focus trapping, scroll lock,
// optional custom portal container, and role="document" inner wrapper.
// ===================================================================

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalShell.module.css";
import type { ModalShellProps } from "./ModalShell.types";

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  size = "default",
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  preventCloseOnBackdropClick = false,
  closeOnEscape = true,
  container = typeof document !== "undefined" ? document.body : null,
  initialFocusRef,
  initialFocusSelector,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // SSR mismatch guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Compute focusable elements inside the dialog
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!dialogRef.current) return [];
    const selectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "textarea:not([disabled])",
      "select:not([disabled])",
      "a[href]",
      "[tabindex]:not([tabindex='-1'])",
      "[contenteditable]:not([contenteditable='false'])",
      "iframe",
      "video[controls]",
      "audio[controls]",
    ].join(", ");
    return Array.from(dialogRef.current.querySelectorAll<HTMLElement>(selectors));
  }, []);

  // Choose initial focus target
  const computeInitialFocus = useCallback((): HTMLElement | null => {
    if (initialFocusRef?.current) return initialFocusRef.current;

    if (initialFocusSelector && dialogRef.current) {
      const found = dialogRef.current.querySelector<HTMLElement>(initialFocusSelector);
      if (found) return found;
    }

    const focusable = getFocusableElements();
    if (focusable.length > 0) return focusable[0];

    // Fallback to the dialog container itself
    return dialogRef.current;
  }, [getFocusableElements, initialFocusRef, initialFocusSelector]);

  // Focus trap
  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [getFocusableElements]
  );

  // Body scroll lock with scrollbar compensation
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Move focus in on next tick to allow paint
    const focusTimer = window.setTimeout(() => {
      const target = computeInitialFocus();
      target?.focus();
    }, 10);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      const prev = previousFocusRef.current;
      if (prev && prev !== document.body && typeof prev.focus === "function") {
        try {
          prev.focus();
        } catch {
          /* no-op */
        }
      }
    };
  }, [isOpen, computeInitialFocus]);

  // Keydown handlers (ESC + focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }
      trapFocus(event);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, closeOnEscape, trapFocus]);

  // Backdrop click to close (optional)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (preventCloseOnBackdropClick) return;
      if (e.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose, preventCloseOnBackdropClick]
  );

  // Don’t render on server or when closed
  if (!mounted || !isOpen || !container) return null;

  const modal = (
    <div
      ref={backdropRef}
      className={`${styles.backdrop} ${styles[`size-${size}`]} ${className}`}
      onClick={handleBackdropClick}
      data-modal-backdrop
    >
      <div
        ref={dialogRef}
        className={`${styles.container} ${styles[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        data-modal-container
      >
        {/* role="document" improves interaction semantics for SR users */}
        <div role="document" className={styles.content}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, container);
};

export default ModalShell;
