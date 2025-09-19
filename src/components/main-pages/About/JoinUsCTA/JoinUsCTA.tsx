"use client";

import React from "react";
import { motion } from "framer-motion";
// ✅ Corrected import path for shared‑ui SectionDivider
import SectionDivider from "@components/layout/SectionDivider";
// ✅ Corrected import path for shared‑ui Button
import Button from "@components/buttons/Button";
import "./JoinUsCTA.css";

// ✅ TypeScript Interface for structured data
interface JoinUsContent {
  title?: string;
  description?: string;
  cta?: {
    text?: string;
    link?: string;
  };
}

interface JoinUsCTAProps {
  data: JoinUsContent;
}

// ✅ Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const JoinUsCTA: React.FC<JoinUsCTAProps> = ({ data }) => {
  // ✅ Early return if no content
  if (!data?.title && !data?.description && !data?.cta) return null;

  return (
    <motion.div
      className="joinus-wrapper"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      {/* ✅ Title and Divider */}
      {data.title && (
        <motion.div className="joinus-title-wrapper" variants={fadeIn}>
          <h2 className="joinus-title">{data.title}</h2>
          <SectionDivider className="joinus-title-divider" />
        </motion.div>
      )}

      {/* ✅ Optional Description */}
      {data.description && (
        <motion.p className="joinus-description" variants={fadeIn}>
          {data.description}
        </motion.p>
      )}

      {/* ✅ CTA Button */}
      {data.cta?.text && data.cta?.link && (
        <motion.div
          className="joinus-cta"
          variants={fadeIn}
          whileHover={{ scale: 1.05 }}
        >
          <Button href={data.cta.link} variant="primary" size="md">
            {data.cta.text}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JoinUsCTA;
