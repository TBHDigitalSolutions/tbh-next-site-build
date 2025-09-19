"use client";

import React, { useState } from "react";
// ✅ Updated to use TBH UI molecules Modal structure
import { ContactModal } from "@/components/ui/molecules/Modal";
// ✅ Updated to use TBH UI atoms Button structure
import { Button } from "@/components/ui/atoms/Button";
// ✅ Updated CSS import to use TBH UI atoms Button structure
import "@/components/ui/atoms/Button/ContactButton.css";

const ContactButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="contactbutton-container">
            <Button
                variant="primary"
                size="large"
                className="contactbutton"
                onClick={handleOpenModal}
                aria-expanded={isModalOpen}
                aria-controls="contact-modal"
                aria-label="Open contact form"
            >
                Contact Us
            </Button>

            <ContactModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal}
                id="contact-modal"
            />
        </div>
    );
};

export default ContactButton;