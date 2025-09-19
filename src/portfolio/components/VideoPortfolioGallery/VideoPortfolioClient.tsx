// src/components/ui/organisms/VideoPortfolioGallery/VideoPortfolioClient.tsx
"use client";

import * as React from "react";
import VideoPortfolioGallery from "./VideoPortfolioGallery";
import VideoLightbox from "./VideoLightbox";
import type {
  VideoItem,
  VideoPortfolioGalleryProps,
  ClickBehavior,
} from "./VideoPortfolioGallery.types";

type Props = Omit<VideoPortfolioGalleryProps, "onItemClick"> & {
  /** How clicking a card behaves (default: "lightbox") */
  clickBehavior?: ClickBehavior;
  /** Use our modal lightbox when clickBehavior="lightbox" (default: true) */
  lightbox?: boolean;
  /** Analytics tracking for video interactions */
  onVideoPlay?: (item: VideoItem, index: number) => void;
  /** Analytics tracking for modal events */
  onModalOpen?: (item: VideoItem, index: number) => void;
  onModalClose?: (item: VideoItem) => void;
};

/** Normalize common YouTube/Vimeo URLs to embeddable URLs */
function toEmbedUrl(raw?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, "https://example.com");
    const host = url.hostname.replace(/^www\./, "");

    // YouTube
    if (host.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?rel=0&modestbranding=1`;
      if (url.pathname.startsWith("/embed/")) return raw;
    }
    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
    }

    // Vimeo page → player embed (preserve hash if present)
    if (host === "vimeo.com" && !host.includes("player.vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      const h = url.searchParams.get("h");
      return id ? `https://player.vimeo.com/video/${id}${h ? `?h=${h}` : ""}` : raw;
    }

    // Already an embed
    if (host.includes("player.vimeo.com") || url.pathname.startsWith("/embed/")) {
      return raw;
    }
  } catch (error) {
    console.error("Error normalizing embed URL:", error);
  }
  return raw;
}

/** Choose the best URL to open externally (embed for platforms, mp4 for local) */
function bestOpenUrl(item: VideoItem): string | null {
  if (item.embedUrl) return toEmbedUrl(item.embedUrl);
  const normalized = toEmbedUrl(item.src);
  // if src looks like a platform URL, prefer the normalized embed; otherwise use local file
  const isPlatform = /youtube|youtu\.be|vimeo/i.test(item.src);
  return isPlatform ? normalized : item.src || normalized || null;
}

const VideoPortfolioClient: React.FC<Props> = ({
  items,
  clickBehavior = "lightbox",
  lightbox = true,
  externalTarget = "_blank",
  onVideoPlay,
  onModalOpen,
  onModalClose,
  ...galleryProps
}) => {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<VideoItem | null>(null);
  
  // Track modal and video interaction analytics
  const handleItemClick = React.useCallback(
    (item: VideoItem, index: number) => {
      // Track video play intent
      onVideoPlay?.(item, index);
      
      switch (clickBehavior) {
        case "newtab": {
          const u = bestOpenUrl(item);
          if (u) {
            window.open(u, externalTarget, "noopener,noreferrer");
          }
          return;
        }
        case "inline": {
          // For inline playback, still open lightbox as fallback
          if (lightbox) {
            onModalOpen?.(item, index);
            setActive(item);
            setOpen(true);
          } else {
            const u = bestOpenUrl(item);
            if (u) window.open(u, externalTarget, "noopener,noreferrer");
          }
          return;
        }
        case "lightbox":
        default: {
          if (lightbox) {
            onModalOpen?.(item, index);
            setActive(item);
            setOpen(true);
          } else {
            const u = bestOpenUrl(item);
            if (u) {
              window.open(u, externalTarget, "noopener,noreferrer");
            }
          }
        }
      }
    },
    [clickBehavior, lightbox, externalTarget, onVideoPlay, onModalOpen],
  );

  const handleClose = React.useCallback(() => {
    if (active) {
      onModalClose?.(active);
    }
    setOpen(false);
    setActive(null);
  }, [active, onModalClose]);

  // Handle modal open from gallery (for analytics)
  const handleModalOpen = React.useCallback((item: VideoItem, index: number) => {
    onModalOpen?.(item, index);
  }, [onModalOpen]);

  // Prevent hydration issues
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <VideoPortfolioGallery
        {...galleryProps}
        items={items}
        lightbox={false}
        onItemClick={() => {}} // No-op during SSR
        onModalOpen={() => {}} // No-op during SSR
        clickBehavior={clickBehavior}
        externalTarget={externalTarget}
      />
    );
  }

  return (
    <>
      <VideoPortfolioGallery
        {...galleryProps}
        items={items}
        lightbox={false}            // we manage the modal here
        onItemClick={handleItemClick}
        onModalOpen={handleModalOpen}
        clickBehavior={clickBehavior}
        externalTarget={externalTarget}
      />
      {mounted && (
        <VideoLightbox 
          open={open} 
          onClose={handleClose} 
          item={active}
          size="large"
        />
      )}
    </>
  );
};

export default VideoPortfolioClient;