import * as React from "react";
import styles from "./CarouselControls.module.css";

export type CarouselControlsProps = {
  onPrev?: () => void;
  onNext?: () => void;
  /** Disable buttons when no more content in that direction */
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  /** Optional slide position text like “3 / 10” */
  counterText?: string;
  /** Visual style */
  variant?: "floating" | "inline"; // default: "floating"
  /** Size */
  size?: "sm" | "md";              // default: "md"
  /** Accessible labels */
  labelPrev?: string;              // default: "Previous"
  labelNext?: string;              // default: "Next"
  className?: string;
  style?: React.CSSProperties;
};

const ChevronLeft = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path d="M12.7 15.3a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 1 1 1.4 1.4L8.4 10l4.3 4.3a1 1 0 0 1 0 1.4z" fill="currentColor"/>
  </svg>
);

const ChevronRight = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path d="M7.3 4.7a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1z" fill="currentColor"/>
  </svg>
);

export const CarouselControls: React.FC<CarouselControlsProps> = ({
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  counterText,
  variant = "floating",
  size = "md",
  labelPrev = "Previous",
  labelNext = "Next",
  className,
  style,
}) => {
  const classNames = [
    styles.controls,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(" ");

  const onKeyDownPrev: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!prevDisabled) onPrev?.();
    }
  };
  const onKeyDownNext: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!nextDisabled) onNext?.();
    }
  };

  return (
    <div className={classNames} style={style} aria-hidden={variant === "floating" ? undefined : false}>
      <button
        type="button"
        className={styles.btn}
        onClick={onPrev}
        onKeyDown={onKeyDownPrev}
        aria-label={labelPrev}
        disabled={prevDisabled}
      >
        <ChevronLeft className={styles.icon} />
      </button>

      {counterText ? <span className={styles.counter} aria-live="polite">{counterText}</span> : null}

      <button
        type="button"
        className={styles.btn}
        onClick={onNext}
        onKeyDown={onKeyDownNext}
        aria-label={labelNext}
        disabled={nextDisabled}
      >
        <ChevronRight className={styles.icon} />
      </button>
    </div>
  );
};

export default CarouselControls;
