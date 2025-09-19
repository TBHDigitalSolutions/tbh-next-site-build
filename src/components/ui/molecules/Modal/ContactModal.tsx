"use client";

import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";
// ✅ Pull in the shared-ui contact form instead of a non-existent local one
import ContactForm from "@/components/ui/organisms/ContactForm/ContactForm";
import "./ContactModal.css";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="contactmodal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contactmodal-heading"
    >
      <div
        className="contactmodal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="contactmodal-close"
          aria-label="Close Modal"
        >
          <MdClose size={24} />
        </button>

        {/* Heading */}
        <h2 id="contactmodal-heading" className="contactmodal-heading">
          Get in Touch
        </h2>

        {/* Contact Form */}
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactModal;
