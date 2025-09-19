"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/core/layout/Divider/Divider";
import "./CompanyStoryContent.css";

interface CompanyStoryContentProps {
  data: {
    title: string;
    description: string;
    highlight: string;
    cta?: { text: string; link: string };
  };
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const CompanyStoryContent: React.FC<CompanyStoryContentProps> = ({ data }) => {
  return (
    <motion.div
      className="companystory-content-wrapper"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="companystory-title-wrapper">
        <h2 className="companystory-content-heading">{data.title}</h2>
        <Divider className="companystory-content-divider" />
      </div>

      <p className="companystory-content-description">{data.description}</p>
      <p className="companystory-content-highlight">{data.highlight}</p>

      {data.cta?.text && data.cta?.link && (
        <div className="companystory-content-cta">
          <Button href={data.cta.link} variant="primary" size="md">
            {data.cta.text}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default CompanyStoryContent;
