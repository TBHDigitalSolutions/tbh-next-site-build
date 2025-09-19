// website/src/components/ui/cta/MarketingCTA.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
// ✅ Shared‑UI imports
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/core/layout/Divider/Divider";
// 🔄 Try named export first, fallback to default export
import marketingCTADefault, { marketingCTA as marketingCTANamed } from "@/mock/products-services/MarketingCTA";
import "./MarketingCTA.css";

interface MarketingCTAProps {
  data?: {
    title?: string;
    description?: string;
    highlights?: string[];
    label?: string;
    labelItems?: string[];
    ctaButton?: { text: string; link: string };
  };
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const MarketingCTA: React.FC<MarketingCTAProps> = ({ data }) => {
  // pick whichever export is defined
  const mock = marketingCTANamed ?? marketingCTADefault;
  const marketingData = data ?? mock;

  // guard against missing data
  if (!marketingData || !marketingData.title) return null;

  return (
    <motion.div
      className="marketing-cta-wrapper"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      {/* Title & Divider */}
      <motion.div className="marketing-title-wrapper" variants={fadeIn}>
        <h2 className="marketing-title">{marketingData.title}</h2>
        <Divider className="marketing-title-divider" />
      </motion.div>

      {/* Label Items */}
      {marketingData.labelItems?.length > 0 && (
        <motion.div className="marketing-label-items" variants={fadeIn}>
          {marketingData.labelItems.map((item, i) => (
            <span key={i} className="marketing-label-item">
              <FaCheckCircle className="marketing-label-icon" /> {item}
              {i < marketingData.labelItems.length - 1 && <span className="divider">|</span>}
            </span>
          ))}
        </motion.div>
      )}

      {/* Optional Label */}
      {marketingData.label && (
        <motion.h3 className="marketing-label" variants={fadeIn}>
          {marketingData.label}
          <Divider className="marketing-title-divider" />
        </motion.h3>
      )}

      {/* Description */}
      {marketingData.description && (
        <motion.p className="marketing-description" variants={fadeIn}>
          {marketingData.description}
        </motion.p>
      )}

      {/* Highlights List */}
      {marketingData.highlights?.length > 0 && (
        <ul className="marketing-cta-list">
          {marketingData.highlights.map((hl, i) => (
            <motion.li key={i} className="marketing-cta-item" variants={fadeIn}>
              <FaCheckCircle className="marketing-cta-icon" />
              <span>{hl}</span>
            </motion.li>
          ))}
        </ul>
      )}

      {/* CTA Button */}
      {marketingData.ctaButton?.text && marketingData.ctaButton?.link && (
        <motion.div className="marketing-cta" variants={fadeIn} whileHover={{ scale: 1.05 }}>
          <Button href={marketingData.ctaButton.link} variant="primary" size="md">
            {marketingData.ctaButton.text}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MarketingCTA;
