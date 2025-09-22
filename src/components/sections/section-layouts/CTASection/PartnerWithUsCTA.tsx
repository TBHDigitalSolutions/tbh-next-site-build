// website/src/components/ui/cta/PartnerWithUsCTA.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
// ✅ Correct shared‑UI imports
import Divider from "@/components/core/layout/Divider/Divider";
import Button from "@/components/ui/atoms/Button/Button";
// ✅ Default import of your mock data
import partnerWithUsData from "@/mock/partnerWithUsCTA";
import "./PartnerWithUsCTA.css";

// ✅ TypeScript interface for your mock shape
interface PartnerWithUsContent {
  title?: string;
  description?: string;
  highlights?: string[];
  label?: string;
  labelItems?: string[]; 
  cta?: {
    text?: string;
    link?: string;
  };
}

// ✅ Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const PartnerWithUsCTA: React.FC = () => {
  // ✅ Now pulling directly from the default-exported object
  const {
    title,
    description,
    highlights,
    label,
    labelItems,
    cta,
  } = partnerWithUsData as PartnerWithUsContent;

  // ✅ Guard against missing content
  if (!title && !description && !cta) return null;

  return (
    <motion.div
      className="partner-wrapper"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      {/* Title & Divider */}
      {title && (
        <motion.div className="partner-title-wrapper" variants={fadeIn}>
          <h2 className="partner-title">{title}</h2>
          <Divider className="partner-title-divider" />
        </motion.div>
      )}

      {/* Description */}
      {description && (
        <motion.p className="partner-description" variants={fadeIn}>
          {description}
        </motion.p>
      )}

      {/* Highlights List */}
      {highlights?.length > 0 && (
        <motion.ul className="partner-highlights" variants={fadeIn}>
          {highlights.map((hl, i) => (
            <li key={i} className="partner-highlight-item">
              <FaCheckCircle className="partner-highlight-icon" />
              <span>{hl}</span>
            </li>
          ))}
        </motion.ul>
      )}

      {/* Optional Label & Items */}
      {label && (
        <motion.div className="partner-label-wrapper" variants={fadeIn}>
          <h3 className="partner-label">{label}</h3>
          {labelItems?.length > 0 && (
            <ul className="partner-label-list">
              {labelItems.map((item, idx) => (
                <li key={idx} className="partner-label-item">
                  <FaCheckCircle className="partner-label-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* CTA Button */}
      {cta?.text && cta?.link && (
        <motion.div
          className="partner-cta"
          variants={fadeIn}
          whileHover={{ scale: 1.05 }}
        >
          <Button href={cta.link} variant="primary" size="md">
            {cta.text}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PartnerWithUsCTA;
