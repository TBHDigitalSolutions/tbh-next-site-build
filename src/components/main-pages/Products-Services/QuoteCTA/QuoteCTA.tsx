"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaEnvelopeOpenText } from "react-icons/fa";
// ✅ Reusable Button from shared‑ui
import Button from "@/components/ui/atoms/Button/Button";
// ✅ Divider from shared‑ui
import Divider from "@/components/core/layout/Divider/Divider";

import "./QuoteCTA.css"; // ✅ Component styles

// ✅ Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

interface QuoteCTAProps {
  onOpenModal: () => void;
}

const QuoteCTA: React.FC<QuoteCTAProps> = ({ onOpenModal }) => {
  return (
    <motion.div
      className="quote-cta-wrapper"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      {/* Title & Divider */}
      <motion.div className="quote-title-wrapper" variants={fadeIn}>
        <h2 className="quote-title">Get a Custom Quote Today!</h2>
        <Divider className="quote-title-divider" />
      </motion.div>

      {/* Description */}
      <motion.p className="quote-description" variants={fadeIn}>
        Let us help you find the best solution for your business needs. Get a
        tailored quote for our services in SaaS, Web Development, Marketing, and
        Content Creation.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        className="quote-cta"
        variants={fadeIn}
        whileHover={{ scale: 1.05 }}
      >
        <Button href="#" variant="primary" size="md" onClick={onOpenModal}>
          <FaEnvelopeOpenText className="quote-icon" />
          Request a Quote
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default QuoteCTA;
