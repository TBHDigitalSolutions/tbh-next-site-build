"use client";

import * as React from "react";
import clsx from "clsx";
import { Play, Pause } from "lucide-react";
import styles from "./TwoColVideoSection.module.css";

export type VideoPlayerProps = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoPlay,
  loop = true,
  muted = true,
  className,
}) => {
  const ref = React.useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setPlaying] = React.useState<boolean>(Boolean(autoPlay));
  const [errored, setErrored] = React.useState<boolean>(false);

  const toggle = React.useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    try {
      if (isPlaying) {
        el.pause();
        setPlaying(false);
      } else {
        await el.play();
        setPlaying(true);
      }
    } catch {
      setErrored(true);
    }
  }, [isPlaying]);

  if (errored) {
    return (
      <div className={clsx(styles.videoShell, styles.videoFallback, className)}>
        <p>Video unavailable.</p>
      </div>
    );
  }

  return (
    <div className={clsx(styles.videoShell, className)}>
      <video
        ref={ref}
        className={styles.videoTag}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setErrored(true)}
      >
        <source src={src} type="video/mp4" />
        <p>Your browser doesn’t support HTML5 video.</p>
      </video>

      {!autoPlay && (
        <button
          type="button"
          onClick={toggle}
          className={styles.playPauseOverlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <span className={styles.playPauseButton}>
            {isPlaying ? <Pause className={styles.playPauseIcon} /> : <Play className={styles.playPauseIcon} />}
          </span>
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
