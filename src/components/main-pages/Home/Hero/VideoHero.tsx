// src/components/features/home/Hero/VideoHero.tsx

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import "./VideoHero.css";

interface VideoHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  videoSrc: string;
  posterImage?: string;
  fallbackImage?: string;
  primaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  textPosition?: "center" | "left" | "right" | "bottom-left" | "bottom-center" | "bottom-right";
  enablePlayPause?: boolean;
  enableVolumeControl?: boolean;
  height?: "hero-min-height" | "hero-full-height" | "hero-medium-height";
  contentWidth?: "narrow" | "normal" | "wide";
}

export const VideoHero: React.FC<VideoHeroProps> = ({
  title,
  subtitle,
  description,
  videoSrc,
  posterImage,
  fallbackImage,
  primaryCTA,
  secondaryCTA,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  overlayOpacity = 0.4,
  overlayColor = "rgba(6, 5, 18, 0.7)",
  textPosition = "center",
  enablePlayPause = true,
  enableVolumeControl = false,
  height = "hero-full-height",
  contentWidth = "normal",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      if (autoPlay) {
        video.play().catch(() => {
          console.log("Autoplay prevented by browser");
          setIsPlaying(false);
        });
      }
    };

    const handleError = () => {
      setHasError(true);
      setIsVideoLoaded(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [autoPlay]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log("Play failed");
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <section 
      className={clsx(
        "video-hero",
        height,
        `text-${textPosition}`,
        `content-${contentWidth}`,
        isVideoLoaded && "video-loaded",
        hasError && "video-error",
        className
      )}
    >
      {/* Video Background */}
      <div className="video-hero-background">
        {!hasError ? (
          <video
            ref={videoRef}
            className="hero-video"
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            playsInline
            controls={controls}
            poster={posterImage}
            preload="metadata"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : fallbackImage ? (
          <Image
            src={fallbackImage}
            alt="Hero background"
            fill
            className="hero-fallback-image"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="hero-fallback-gradient" />
        )}

        {/* Video Overlay */}
        <div 
          className="video-overlay"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      </div>

      {/* Content */}
      <div className="video-hero-content">
        <div className="video-hero-text">
          <h1 className="video-hero-title">
            {title}
          </h1>

          {subtitle && (
            <h2 className="video-hero-subtitle">
              {subtitle}
            </h2>
          )}

          {description && (
            <p className="video-hero-description">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          {(primaryCTA || secondaryCTA) && (
            <div className="video-hero-actions">
              {primaryCTA && (
                <a
                  href={primaryCTA.href}
                  className="video-btn primary"
                  onClick={primaryCTA.onClick}
                >
                  {primaryCTA.text}
                </a>
              )}

              {secondaryCTA && (
                <a
                  href={secondaryCTA.href}
                  className="video-btn secondary"
                  onClick={secondaryCTA.onClick}
                >
                  {secondaryCTA.text}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Controls */}
      <div className="video-hero-controls">
        {enablePlayPause && !hasError && (
          <button
            className="video-control-btn play-pause-btn"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            <span className={clsx("control-icon", isPlaying ? "pause-icon" : "play-icon")}>
              {isPlaying ? "⏸️" : "▶️"}
            </span>
          </button>
        )}

        {enableVolumeControl && !hasError && (
          <button
            className="video-control-btn volume-btn"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            <span className={clsx("control-icon", isMuted ? "muted-icon" : "volume-icon")}>
              {isMuted ? "🔇" : "🔊"}
            </span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {!isVideoLoaded && !hasError && (
        <div className="video-loading-overlay">
          <div className="video-loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p className="loading-text">Loading video...</p>
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="video-scroll-indicator">
        <div className="scroll-arrow">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </section>
  );
};

export default VideoHero;