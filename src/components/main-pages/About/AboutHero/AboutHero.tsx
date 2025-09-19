"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";
import { aboutHero } from "@/mock/abouthero";
import "./AboutHero.css";

const { title, highlight, subtitle, cta } = aboutHero;

const AboutHero: React.FC = () => {
  return (
    <>
      <section className="about-hero-section">
        <div className="about-hero-container">
          <div className="about-hero-wrapper">
            <motion.h1
              className="about-hero-heading"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {title} {highlight && <span className="about-hero-highlight">{highlight}</span>}
            </motion.h1>

            <Divider className="about-hero-title-divider" />

            {subtitle && (
              <motion.p
                className="about-hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                {subtitle}
              </motion.p>
            )}

            {cta?.text && cta?.link && (
              <motion.div
                className="about-hero-cta"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              >
                <Button variant="primary" size="large" href={cta.link}>
                  {cta.text}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Divider */}
      <Divider className="about-hero-bottom-divider" />
    </>
  );
};

export default AboutHero;
