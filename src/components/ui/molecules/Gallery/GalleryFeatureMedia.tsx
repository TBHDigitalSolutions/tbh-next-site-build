"use client";

import React from "react";
import Image from "next/image";
import { EmbeddedMedia } from "@/components/shared/EmbeddedMedia";
import "./GalleryFeatureMedia.css";

export interface GalleryMediaItem {
  type: "image" | "video" | "youtube" | "vimeo";
  src: string;
  alt?: string;
  caption?: string;
  priority?: boolean;
}

interface GalleryFeatureMediaProps {
  items: GalleryMediaItem[];
  className?: string;
  columns?: number; // 1–4
}

const GalleryFeatureMedia: React.FC<GalleryFeatureMediaProps> = ({
  items,
  className = "",
  columns = 2,
}) => {
  if (!items || items.length === 0) return null;

  const columnClass = `gallery-media-cols-${columns}`;

  return (
    <div className={`gallery-feature-media ${columnClass} ${className}`}>
      {items.map((item, idx) => (
        <div key={idx} className="gallery-media-item">
          {item.type === "image" ? (
            <div className="gallery-media-image-wrapper">
              <Image
                src={item.src}
                alt={item.alt || ""}
                fill
                className="gallery-media-image"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={item.priority}
              />
            </div>
          ) : (
            <EmbeddedMedia
              type={item.type}
              src={item.src}
              title={item.alt}
            />
          )}

          {item.caption && (
            <figcaption className="gallery-media-caption">
              {item.caption}
            </figcaption>
          )}
        </div>
      ))}
    </div>
  );
};

export default GalleryFeatureMedia;
