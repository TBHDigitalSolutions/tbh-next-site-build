"use client";

import React from "react";
// ✅ Updated to use TBH UI hooks structure
import useModal from "@/hooks/ui/useModal";

// ✅ Import modal components using TBH directory structure
import { ContactModal } from "@/components/ui/molecules/Modal";
import { CTAModal } from "@/components/ui/molecules/Modal";
import { QuoteFormModal } from "@/components/ui/molecules/Modal";
import { LightboxModal } from "@/components/ui/molecules/Modal";
import { Modal } from "@/components/ui/molecules/Modal";

// ✅ TBH Modal Components Registry
const MODAL_COMPONENTS: Record<string, React.FC<any>> = {
  contact: ContactModal,
  cta: CTAModal,
  quote: QuoteFormModal,
  lightbox: LightboxModal,
  generic: Modal,
  // ✅ Add more modal types as needed
  newsletter: CTAModal, // Using CTA modal as newsletter fallback
};

interface ModalRendererProps {
  className?: string;
}

/**
 * TBH ModalRenderer
 * Renders the active modal based on useModal() state
 * Supports all TBH modal types via the MODAL_COMPONENTS registry
 */
const ModalRenderer: React.FC<ModalRendererProps> = ({ className = "" }) => {
  const { modalType, modalProps, isOpen, closeModal } = useModal();

  // Early return if no modal should be shown
  if (!isOpen || !modalType) return null;

  const Component = MODAL_COMPONENTS[modalType];

  if (!Component) {
    console.warn(`TBH ModalRenderer: Unknown modal type "${modalType}"`);
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not child elements
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  return (
    <div 
      className={`modal-overlay ${className}`}
      onClick={handleBackdropClick}
      onKeyDown={handleEscapeKey}
      role="presentation"
    >
      <div 
        className="modal-backdrop" 
        aria-hidden="true"
      />
      <div 
        className="modal-content" 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Component 
          {...modalProps} 
          onClose={closeModal}
          modalType={modalType}
        />
      </div>
    </div>
  );
};

export default ModalRenderer;