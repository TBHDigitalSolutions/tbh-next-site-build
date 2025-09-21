"use client";

import React from "react";
import { motion } from "framer-motion";
import "./CompanyStory.css";
import type { CompanyStory as CompanyStoryType } from "@/data/page/main-pages/about/types";
import CompanyStoryContent from "./CompanyStoryContent";

export type CompanyStoryProps = {
  data: CompanyStoryType; // page-level data
  className?: string;
};

export default function CompanyStory({ data, className }: CompanyStoryProps) {
  const { video } = data;

  return (
    <motion.section
      className={`companystory-container ${className ?? ""}`.trim()}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Left: Video */}
      <motion.div
        className="companystory-left"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <video
          className="companystory-video"
          controls={video.controls ?? true}
          poster={video.fallbackImage}
          autoPlay={video.autoplay}
          loop={video.loop}
          muted={video.muted}
        >
          {/* Default to mp4; extend if you add more sources */}
          <source src={video.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>

      {/* Right: Content */}
      <motion.div
        className="companystory-right"
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <CompanyStoryContent data={data} />
      </motion.div>
    </motion.section>
  );
}
