"use client";

import React from "react";
import Image from "next/image";
import "./ImageGrid.css"; // ✅ Final unified CSS for responsive, contained grids

// ============================
// ✅ Interfaces
// ============================

interface ImageGridItem {
  id?: string | number;
  src: string;
  alt: string;
  label?: string; // Optional label/caption
  link?: string;  // Optional link
}

interface ImageGridProps {
  items: ImageGridItem[];
  gap?: string;          // Optional gap override
  showLabels?: boolean;  // ✅ Control label visibility (default: false)
  size?: number;         // ✅ Optional control for image size (default: 120)
}

// ============================
// ✅ ImageGrid Component
// ============================

const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  gap = "var(--spacing-md)",
  showLabels = false,
  size = 100,
}) => {
  const itemCount = items.length;

  // ✅ Dynamic columns based on item count
  const columns =
    itemCount >= 6
      ? 3
      : itemCount === 4
      ? 2
      : itemCount <= 3
      ? itemCount
      : 3; // Default to 3 if unexpected count

  return (
    <div className="image-grid__container">
      <div
        className={`image-grid image-grid--cols-${columns}`}
        style={{ gap }}
      >
        {items.map((item, index) => (
          <div key={item.id || index} className="image-grid-item">
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={size}
                  height={size}
                  className="image-grid-img"
                />
                {item.label && (
                  <p className={`image-grid-label ${showLabels ? "visible" : ""}`}>
                    {item.label}
                  </p>
                )}
              </a>
            ) : (
              <>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={size}
                  height={size}
                  className="image-grid-img"
                />
                {item.label && (
                  <p className={`image-grid-label ${showLabels ? "visible" : ""}`}>
                    {item.label}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
