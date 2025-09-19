// shared-ui/components/modals/LightboxModal.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import "./LightboxModal.css";

export interface LightboxImage {
  src: string;
  alt?: string;
  caption?: string;
}

interface LightboxModalProps {
  /** Array of images to display */
  images: LightboxImage[];
  /** Index of image to show when opening */
  initialIndex?: number;
  /** Whether the lightbox is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Additional class name */
  className?: string;
}

const LightboxModal: React.FC<LightboxModalProps> = ({
  images,
  initialIndex = 0,
  open,
  onClose,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reset index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialIndex]);

  // Keyboard navigation & ESC
  useEffect(() => {
    if (!open) return;
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    };
    
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, images.length, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.focus();
    }
  }, [open]);

  if (!images.length || !open) return null;
  
  const { src, alt, caption } = images[currentIndex];

  const prev = () => {
    setIsLoading(true);
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };
  
  const next = () => {
    setIsLoading(true);
    setCurrentIndex((i) => (i + 1) % images.length);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    console.error(`Failed to load image: ${src}`);
  };

  return (
    <div
      className={clsx("lightbox-backdrop", className)}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Image lightbox"
    >
      <div
        className="lightbox-container"
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
        tabIndex={0}
      >
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X size={24} />
        </button>

        <div className="lightbox-content">
          {images.length > 1 && (
            <button
              className="lightbox-nav prev"
              onClick={prev}
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <div className="lightbox-image-container">
            {isLoading && <div className="lightbox-loader"></div>}
            <img
              ref={imageRef}
              src={src}
              alt={alt || `Image ${currentIndex + 1}`}
              className={clsx("lightbox-image", isLoading && "lightbox-image-loading")}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {images.length > 1 && (
            <button
              className="lightbox-nav next"
              onClick={next}
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>

        {caption && <div className="lightbox-caption">{caption}</div>}
        
        {images.length > 1 && (
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default LightboxModal;