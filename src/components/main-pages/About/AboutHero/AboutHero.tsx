"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";
import type { HeroData } from "@/data/page/main-pages/about/types";
import "./AboutHero.css";

export type AboutHeroProps = {
  /** Page-level data injection (from the About page barrel) */
  data: HeroData & {
    /** Legacy support: some older data used `highlight` */
    highlight?: string;
    /** Legacy support: some older data used { text, link } instead of { label, href } */
    cta?: { label?: string; href?: string } | { text?: string; link?: string };
  };
  /** Optional extra class for the root <section> */
  className?: string;
  /** Add a divider after the section (default: true) */
  showBottomDivider?: boolean;
};

/** Normalize CTA shape to { label, href } regardless of legacy keys */
function normalizeCTA(
  cta: AboutHeroProps["data"]["cta"]
): { label?: string; href?: string } {
  if (!cta) return {};
  const anyCta = cta as Record<string, string | undefined>;
  return {
    label: anyCta.label ?? anyCta.text,
    href: anyCta.href ?? anyCta.link,
  };
}

export default function AboutHero({
  data,
  className,
  showBottomDivider = true,
}: AboutHeroProps) {
  const { title, subtitle } = data;
  const highlight = (data as any)?.highlight as string | undefined;
  const { label: ctaLabel, href: ctaHref } = normalizeCTA(data.cta);

  return (
    <>
      <section
        className={`about-hero-section${className ? ` ${className}` : ""}`}
      >
        <div className="about-hero-container">
          <div className="about-hero-wrapper">
            <motion.h1
              className="about-hero-heading"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {title}{" "}
              {highlight && (
                <span className="about-hero-highlight">{highlight}</span>
              )}
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

            {ctaLabel && ctaHref && (
              <motion.div
                className="about-hero-cta"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              >
                <Button variant="primary" size="large" href={ctaHref}>
                  {ctaLabel}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {showBottomDivider && <Divider className="about-hero-bottom-divider" />}
    </>
  );
}
