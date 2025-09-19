"use client";

import React, { useState } from "react";
import Image from "next/image";

// ✅ Fixed import path - using correct TBH structure
import Divider from "@/components/ui/atoms/Divider/Divider";

// ✅ Import local CSS
import "./PortfolioItem.css";

interface PortfolioItemProps {
  title: string;
  videoSrc: string;
  fallbackImage: string;
  description: string;
  isVideo?: boolean;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({
  title,
  videoSrc,
  fallbackImage,
  description,
  isVideo = true,
}) => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="portfolio-item">
      <div className="portfolio-wrapper">
        {/* ✅ Media Section (1:1 Aspect Ratio) */}
        <div className="portfolio-media-inner">
          {!videoError && isVideo ? (
            <video
              className="portfolio-media"
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              aria-label={`Portfolio video for ${title}`}
            >
              <source src={videoSrc} type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={fallbackImage}
              alt={`Portfolio image for ${title}`}
              fill
              style={{ objectFit: "cover" }}
              className="portfolio-media"
              sizes="(max-width: 768px) 40vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
        </div>

        {/* ✅ Content Section */}
        <div className="portfolio-content">
          <h3 className="portfolio-item-title">{title}</h3>
          <Divider />
          <p className="portfolio-item-description">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioItem;