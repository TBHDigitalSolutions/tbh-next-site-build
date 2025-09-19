// src/components/ui/organisms/VideoPortfolioGallery/VideoLightbox.tsx
"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import Modal from "@/components/ui/molecules/Modal/Modal";
import type { VideoItem } from "./VideoPortfolioGallery.types";

type Props = {
  open: boolean;
  onClose: () => void;
  item: VideoItem | null;
  size?: "small" | "medium" | "large";
};

function toEmbedUrl(raw?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, "https://example.com");
    const host = url.hostname.replace("www.", "");

    // YouTube watch/short → nocookie embed
    if (host.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?rel=0&modestbranding=1&autoplay=1`;
      if (url.pathname.startsWith("/embed/")) {
        // Add autoplay to existing embed URLs
        const embedUrl = new URL(raw);
        embedUrl.searchParams.set('autoplay', '1');
        return embedUrl.toString();
      }
    }
    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&autoplay=1`;
    }

    // Vimeo page → player embed (preserves ?h= hash if present)
    if (host.includes("vimeo.com") && !host.includes("player.vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      const h = url.searchParams.get("h");
      return id ? `https://player.vimeo.com/video/${id}${h ? `?h=${h}&` : "?"}autoplay=1` : raw;
    }

    // Already an embed URL - add autoplay
    if (host.includes("player.vimeo.com")) {
      const embedUrl = new URL(raw);
      embedUrl.searchParams.set('autoplay', '1');
      return embedUrl.toString();
    }
  } catch (error) {
    console.error("Error converting to embed URL:", error);
  }
  return raw;
}

function isEmbed(u?: string | null) {
  if (!u) return false;
  const s = u.toLowerCase();
  return s.includes("youtube") || s.includes("youtu.be") || s.includes("vimeo");
}

const VideoLightbox: React.FC<Props> = ({ open, onClose, item, size = "large" }) => {
  const embed = useMemo(() => toEmbedUrl(item?.embedUrl || item?.src || ""), [item?.embedUrl, item?.src]);
  const useIframe = isEmbed(embed);

  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, handleKeyDown]);

  // Don't render if no item
  if (!item) {
    return null;
  }

  const modalContent = (
    <>
      {useIframe ? (
        <div 
          className="video-container"
          style={{ 
            position: "relative", 
            paddingTop: "56.25%", /* 16:9 aspect ratio */
            height: 0,
            overflow: "hidden",
            borderRadius: "8px",
            background: "#000"
          }}
        >
          <iframe
            src={embed!}
            title={item.title || "Video"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : item.src ? (
        <video
          src={item.src}
          poster={item.thumbnail}
          controls
          autoPlay
          playsInline
          preload="metadata"
          style={{ 
            width: "100%", 
            height: "auto", 
            background: "#000", 
            borderRadius: "8px",
            display: "block"
          }}
          onError={(e) => {
            console.error("Video playback error:", e);
            // graceful fallback if codec/path issue
            if (item.src) window.open(item.src, "_blank", "noopener,noreferrer");
          }}
        />
      ) : (
        <div style={{ 
          padding: "2rem", 
          textAlign: "center",
          background: "var(--bg-secondary, #f8f9fa)",
          borderRadius: "8px",
          border: "1px dashed var(--border-subtle, #e0e0e0)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎬</div>
          <p style={{ margin: "0 0 1rem 0", color: "var(--text-secondary, #666)" }}>
            No playable source available.
          </p>
          {(item.embedUrl || item.src) ? (
            <a 
              href={item.embedUrl || item.src!} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: "var(--accent-primary, #007bff)", 
                textDecoration: "underline",
                fontWeight: "500"
              }}
            >
              Open in new tab →
            </a>
          ) : (
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted, #999)" }}>
              Please check your data for src or embedUrl.
            </p>
          )}
        </div>
      )}
      
      {/* Video metadata */}
      <div style={{ 
        marginTop: "1rem", 
        padding: "1rem", 
        background: "var(--bg-surface, #fff)",
        borderRadius: "6px",
        border: "1px solid var(--border-subtle, #e0e0e0)"
      }}>
        {/* Title and client */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          marginBottom: "0.5rem"
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: "1.125rem", 
            fontWeight: "600",
            color: "var(--text-primary, #000)"
          }}>
            {item.title}
          </h3>
          {item.duration && (
            <span style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary, #666)",
              background: "var(--bg-muted, #f1f3f4)",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px"
            }}>
              {item.duration}
            </span>
          )}
        </div>

        {/* Client and category */}
        {(item.client || item.category) && (
          <div style={{ 
            display: "flex", 
            gap: "0.5rem", 
            marginBottom: "0.5rem",
            flexWrap: "wrap"
          }}>
            {item.client && (
              <span style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary, #666)",
                background: "var(--accent-primary, #007bff)",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontWeight: "500"
              }}>
                {item.client}
              </span>
            )}
            {item.category && (
              <span style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary, #666)",
                background: "var(--bg-muted, #f1f3f4)",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px"
              }}>
                {item.category}
              </span>
            )}
          </div>
        )}
        
        {/* Description */}
        {item.description && (
          <p style={{ 
            margin: "0 0 0.5rem 0", 
            color: "var(--text-secondary, #666)",
            lineHeight: "1.5"
          }}>
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div style={{ 
            display: "flex", 
            gap: "0.25rem", 
            flexWrap: "wrap",
            marginBottom: "0.5rem"
          }}>
            {item.tags.map((tag, i) => (
              <span 
                key={i}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted, #999)",
                  background: "var(--bg-subtle, #f8f9fa)",
                  padding: "0.125rem 0.375rem",
                  borderRadius: "3px",
                  border: "1px solid var(--border-subtle, #e0e0e0)"
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metrics */}
        {item.metrics && Object.keys(item.metrics).length > 0 && (
          <div style={{
            display: "flex",
            gap: "1rem",
            marginTop: "0.75rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-subtle, #e0e0e0)"
          }}>
            {Object.entries(item.metrics).map(([key, value]) => (
              <div key={key} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "var(--accent-primary, #007bff)"
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted, #999)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {key}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {item.cta && (
          <div style={{ marginTop: "1rem" }}>
            <a 
              href={item.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "var(--accent-primary, #007bff)",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "0.875rem",
                fontWeight: "500",
                transition: "background-color 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "var(--accent-primary-hover, #0056b3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "var(--accent-primary, #007bff)";
              }}
            >
              {item.cta.label}
            </a>
          </div>
        )}
      </div>
    </>
  );

  return (
    <Modal isOpen={open} onClose={onClose} title={item.title} size={size}>
      {modalContent}
    </Modal>
  );
};

export default VideoLightbox;