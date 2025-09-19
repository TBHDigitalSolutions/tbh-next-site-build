"use client";

import React from "react";
import "./Loader.module.css"; // ✅ Import global loader styles

interface LoaderProps {
  size?: "small" | "medium" | "large"; // ✅ Customizable Sizes
  speed?: "fast" | "normal" | "slow"; // ✅ Customizable Speed
  fullScreen?: boolean; // ✅ Option for Full-Screen Loader
}

const Loader: React.FC<LoaderProps> = ({ size = "medium", speed = "normal", fullScreen = false }) => {
  return (
    <div className={`loader-container ${fullScreen ? "full-screen" : ""}`}>
      <div className={`loader spinner-${size} speed-${speed}`} aria-label="Loading..."></div>
    </div>
  );
};

export default Loader;
 