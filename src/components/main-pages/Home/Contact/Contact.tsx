// src/components/legacy/Contact.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ContactModal from "@/components/ui/molecules/Modal/ContactModal";
import { homeContact, HomeContactContent } from "@/data/page/main-pages/home/contact/home-contact";
import "./Contact.css";

type ContactProps = {
  content?: HomeContactContent;
  /** add className to section if you want extra spacing overrides */
  className?: string;
};

const Contact: React.FC<ContactProps> = ({ content = homeContact, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { sectionId, image, title, blurb, ctaText } = content;

  return (
    <section id={sectionId} className={`home-contact-section ${className ?? ""}`}>
      <div className="home-contact-container">
        {/* Left image */}
        <div className="home-contact-media">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={image.priority}
          />
        </div>

        {/* Right card */}
        <motion.div
          className="home-contact-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <div className="home-contact-content">
            <h2 className="home-contact-title">{title}</h2>
            <p className="home-contact-blurb">{blurb}</p>
            <div className="home-contact-actions">
              {/* If you have global .btn, you can add className="btn btn--primary home-contact-cta" */}
              <motion.button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="home-contact-cta"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                aria-haspopup="dialog"
                aria-controls="contact-modal"
              >
                {ctaText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {isModalOpen && (
        <ContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          id="contact-modal"
        />
      )}
    </section>
  );
};

export default Contact;
