"use client";

import React from "react";
import { motion } from "framer-motion";
// ✅ Remove incorrect Button import (not used here)
// ✅ Import JSON data from the local mock folder
import heroData from "@/mock/TestHeroData";
import "./TestHero.module.css";

// ✅ Define TypeScript interface for the data shape
interface TestHeroDataType {
  title?: string;
  highlight?: string;
  subtitle?: string;
  cta?: {
    text?: string;
    link?: string;
  };
}

const TestHero: React.FC = () => {
  const data: TestHeroDataType = heroData;

  return (
    <section className="TestHero-container">
      <motion.h1
        className="TestHero-heading"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {data.title ?? "Welcome to Test Page!"}{" "}
        <span className="TestHero-highlight">
          {data.highlight ?? "Innovation & Excellence"}
        </span>
      </motion.h1>

      <motion.p
        className="TestHero-subtitle"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {data.subtitle ??
          "Discover our journey, vision, and commitment to success."}
      </motion.p>

      {/* Call-to-Action */}
      {data.cta?.text && data.cta?.link && (
        <motion.div
          className="TestHero-cta"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        >
          <a href={data.cta.link} className="TestHero-btn">
            {data.cta.text} →
          </a>
        </motion.div>
      )}
    </section>
  );
};

export default TestHero;
