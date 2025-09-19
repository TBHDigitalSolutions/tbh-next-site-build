"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import CTAForm from "@/components/ui/organisms/ContactForm/CTAForm"; 
import "./CTAModal.css";

interface CTAModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CTAModal: React.FC<CTAModalProps> = ({ isOpen, onClose }) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            closeButtonRef.current?.focus();
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="cta-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cta-modal-title"
        >
            <motion.div
                className="cta-modal-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()} // ✅ Prevents closing when clicking inside modal
            >
                {/* ✅ Close Button */}
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="cta-modal-close-button"
                    aria-label="Close modal"
                >
                    &times;
                </button>

                {/* ✅ Modal Title */}
                <h2 id="cta-modal-title" className="cta-modal-title">
                    Get in Touch
                </h2>

                {/* ✅ Contact Form */}
                <CTAForm />
            </motion.div>
        </div>
    );
};

export default CTAModal;
