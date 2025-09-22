// shared-ui/components/gallery/GalleryGrid.tsx

"use client";

import React, { useState } from "react";
import clsx from "clsx";
import LightboxModal from "../modals/LightboxModal";
import "./GalleryGrid.css";

export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
  href?: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  layout?: "grid" | "carousel" | "masonry";
  lightbox?: boolean;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({
  images = [],
  columns = 3,
  className = "",
  layout = "grid",
  lightbox = true,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) return null;

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div 
        className={clsx(
          "gallery-grid",
          `gallery-grid-cols-${columns}`,
          layout === "masonry" && "gallery-grid-masonry",
          layout === "carousel" && "gallery-grid-carousel",
          className
        )}
      >
        {images.map((image, index) => (
          <div 
            key={`gallery-item-${index}`} 
            className="gallery-grid-item"
          >
            <div className="gallery-grid-image-wrapper">
              {image.href ? (
                <a 
                  href={image.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <img
                    src={image.src}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    className="gallery-grid-image"
                  />
                </a>
              ) : lightbox ? (
                <button 
                  className="gallery-grid-image-button"
                  onClick={() => openLightbox(index)}
                  aria-label={`View ${image.alt || `image ${index + 1}`} in lightbox`}
                >
                  <img
                    src={image.src}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    className="gallery-grid-image"
                  />
                </button>
              ) : (
                <img
                  src={image.src}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  className="gallery-grid-image"
                />
              )}
            </div>
            {image.caption && (
              <div className="gallery-grid-caption">{image.caption}</div>
            )}
          </div>
        ))}
      </div>
      
      {lightbox && (
        <LightboxModal
          images={images}
          initialIndex={selectedIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default GalleryGrid;