// src/components/ui/molecules/Modal/Modal.tsx

"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
// CORRECTED: Import CSS module correctly
import styles from "./Modal.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  }, [onClose]);

  // Handle outside click
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll and add event listeners
  useEffect(() => {
    if (!isOpen) return;

    // Save current scroll position
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    // Preserve original inline styles so we can restore exactly
    const original = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      top: document.body.style.top,
    };

    // Lock scroll without jump: fix body and offset by current scroll
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add("modal-open");

    // Keyboard escape
    document.addEventListener("keydown", handleKeyDown);

    // Focus inside the modal
    if (modalRef.current) modalRef.current.focus();

    console.log("Modal opened, scroll locked at", scrollY);

    return () => {
      // Read the offset we applied, then restore scroll
      const y = parseInt(document.body.style.top || "0", 10) * -1;

      // Restore styles exactly as they were
      document.body.style.overflow = original.overflow;
      document.body.style.position = original.position;
      document.body.style.width = original.width;
      document.body.style.top = original.top;
      document.body.classList.remove("modal-open");

      // Remove listeners
      document.removeEventListener("keydown", handleKeyDown);

      // Restore scroll position
      window.scrollTo(0, isNaN(y) ? 0 : y);

      console.log("Modal closed, scroll restored to", y);
    };
  }, [isOpen, handleKeyDown]);

  // Build CSS class names using the imported styles
  const sizeClass = size === "small" ? styles["modal-small"] : 
                   size === "large" ? styles["modal-large"] : 
                   styles["modal-medium"];

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className={styles["modal-overlay"]}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            // Inline styles as backup to ensure positioning
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <motion.div
            ref={modalRef}
            className={`${styles["modal-wrapper"]} ${sizeClass}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button 
                className={styles["modal-close"]} 
                onClick={onClose} 
                aria-label="Close Modal"
                type="button"
              >
                <MdClose size={24} />
              </button>
            )}
            
            {title && (
              <h2 id="modal-title" className={styles["modal-title"]}>
                {title}
              </h2>
            )}
            
            <div className={styles["modal-content"]}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Only render on client side
  if (typeof window === "undefined" || !document.body) {
    return null;
  }

  return createPortal(modalContent, document.body);
};

export default Modal;