import React, { useEffect, useRef, useState } from "react";
import styles from "./MediaViewers.module.css";
import type { ViewerProps } from "./types";

export const VideoViewer: React.FC<ViewerProps> = ({ project, onLoad, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const handleCanPlay = () => {
      setLoaded(true);
      onLoad?.();
    };
    const handleError = () => {
      setFailed(true);
      onError?.("Failed to load video");
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    el.addEventListener("loadeddata", handleCanPlay);
    el.addEventListener("error", handleError);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    return () => {
      el.removeEventListener("loadeddata", handleCanPlay);
      el.removeEventListener("error", handleError);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [onLoad, onError, project.media.src]);

  const togglePlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  return (
    <div className={styles.videoViewer}>
      {!loaded && !failed && (
        <div className={styles.loadingSpinner} aria-label="Loading video...">
          <div className={styles.spinner}></div>
        </div>
      )}

      {failed ? (
        <div className={styles.errorState} role="alert">
          <p>Failed to load video.</p>
          <button type="button" className={styles.retryButton} onClick={() => videoRef.current?.load()}>
            Retry
          </button>
        </div>
      ) : (
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            className={`${styles.video} ${loaded ? styles.loaded : ""}`}
            controls
            poster={project.media.poster}
            preload="metadata"
            aria-label={`Video: ${project.title}`}
            playsInline
          >
            <source src={project.media.src} />
            <p>
              Your browser does not support the video element.{" "}
              <a href={project.media.src} target="_blank" rel="noopener noreferrer">
                Download the video
              </a>
            </p>
          </video>

          {loaded && !playing && (
            <button
              className={styles.playOverlay}
              onClick={togglePlayback}
              aria-label="Play video"
              type="button"
            >
              <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};