"use client";

import React from "react";
import Image from "next/image";
import "./GalleryFeature.css";

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}

interface GalleryFeatureProps {
  images: GalleryImage[];
  columns?: number; // 1 to 4
  className?: string;
}

export const GalleryFeature: React.FC<GalleryFeatureProps> = ({
  images,
  columns = 2,
  className = "",
}) => {
  if (!images || images.length === 0) return null;

  const columnClass = `gallery-cols-${columns}`;

  return (
    <div className={`gallery-feature ${columnClass} ${className}`}>
      {images.map((img, index) => (
        <div key={index} className="gallery-item">
          <div className="gallery-image-wrapper">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="gallery-image"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={img.priority}
            />
          </div>
          {img.caption && (
            <figcaption className="gallery-caption">{img.caption}</figcaption>
          )}
        </div>
      ))}
    </div>
  );
};

export default GalleryFeature;
