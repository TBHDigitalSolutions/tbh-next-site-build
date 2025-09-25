import * as React from "react";
import styles from "./Carousel.module.css";
import CarouselControls from "../CarouselControls/CarouselControls";

export type CarouselProps = {
  children: React.ReactNode;
  /** Label for assistive tech */
  ariaLabel?: string;
  /** Start index (closest item will be scrolled into view on mount) */
  initialIndex?: number;
  /** Called when the “active” item changes */
  onIndexChange?: (index: number) => void;
  /** Show built-in controls; "inside" overlays, "outside" expects you place your own (or we render inline below) */
  controls?: "inside" | "outside" | "none";
  /** Controls visual variant */
  controlsVariant?: "floating" | "inline";
  /** Show X / Y counter text */
  showCounter?: boolean;
  /** Scroll step: "page" uses viewport width; number = px to scroll */
  scrollBy?: "page" | number;
  /** Snap behavior */
  snap?: "mandatory" | "proximity";
  /** CSS sizing knobs */
  gap?: string;              // e.g., "1rem"
  itemMinWidth?: string;     // e.g., "16rem"
  className?: string;
  style?: React.CSSProperties;
  /** ID for deep linking or labels */
  id?: string;
};

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      ariaLabel = "Carousel",
      initialIndex = 0,
      onIndexChange,
      controls = "inside",
      controlsVariant = "floating",
      showCounter = true,
      scrollBy = "page",
      snap = "mandatory",
      gap = "1rem",
      itemMinWidth = "16rem",
      className,
      style,
      id,
    },
    ref
  ) => {
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    React.useImperativeHandle(ref, () => viewportRef.current as HTMLDivElement);

    const items = React.Children.toArray(children).filter(Boolean);
    const [activeIndex, setActiveIndex] = React.useState<number>(Math.min(Math.max(initialIndex, 0), items.length - 1));
    const [edge, setEdge] = React.useState<{ atStart: boolean; atEnd: boolean }>({ atStart: true, atEnd: items.length <= 1 });

    const liveRef = React.useRef<HTMLDivElement | null>(null);

    // Scroll to initial index on mount
    React.useEffect(() => {
      const vp = viewportRef.current;
      if (!vp) return;
      const target = vp.querySelector<HTMLElement>(`[data-carousel-item="${activeIndex}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "instant", block: "nearest", inline: "start" } as ScrollIntoViewOptions);
      }
      // compute initial edges
      computeEdges();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helpers
    const announce = (text: string) => {
      // polite live region announcement
      if (!liveRef.current) return;
      liveRef.current.textContent = text;
      // Clear after a tick to prevent verbose repetition
      window.setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = "";
      }, 800);
    };

    const computeEdges = () => {
      const vp = viewportRef.current;
      if (!vp) return;
      const atStart = vp.scrollLeft <= 1;
      const atEnd = vp.scrollLeft >= vp.scrollWidth - vp.clientWidth - 1;
      setEdge({ atStart, atEnd });
    };

    const scrollToIndex = (index: number, behavior: ScrollBehavior = "smooth") => {
      const vp = viewportRef.current;
      if (!vp) return;
      const clamped = Math.min(Math.max(index, 0), items.length - 1);
      const el = vp.querySelector<HTMLElement>(`[data-carousel-item="${clamped}"]`);
      if (el) {
        el.scrollIntoView({ behavior, inline: "start", block: "nearest" } as ScrollIntoViewOptions);
      } else if (scrollBy === "page") {
        vp.scrollTo({ left: clamped * vp.clientWidth, behavior });
      }
    };

    const goPrev = () => {
      if (scrollBy === "page") {
        scrollToIndex(Math.max(activeIndex - 1, 0));
      } else {
        const vp = viewportRef.current;
        if (!vp) return;
        vp.scrollBy({ left: typeof scrollBy === "number" ? -scrollBy : -vp.clientWidth, behavior: "smooth" });
      }
    };

    const goNext = () => {
      if (scrollBy === "page") {
        scrollToIndex(Math.min(activeIndex + 1, items.length - 1));
      } else {
        const vp = viewportRef.current;
        if (!vp) return;
        vp.scrollBy({ left: typeof scrollBy === "number" ? scrollBy : vp.clientWidth, behavior: "smooth" });
      }
    };

    const onKeyDownViewport: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(items.length - 1);
      } else if (e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "PageDown") {
        e.preventDefault();
        goNext();
      }
    };

    const updateActiveFromScroll = React.useCallback(() => {
      const vp = viewportRef.current;
      if (!vp) return;
      // Pick child whose center is closest to viewport center
      const center = vp.getBoundingClientRect().left + vp.clientWidth / 2;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      const els = vp.querySelectorAll<HTMLElement>("[data-carousel-item]");
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(center - itemCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = Number(el.dataset.carouselItem);
        }
      });
      if (bestIdx !== activeIndex) {
        setActiveIndex(bestIdx);
        onIndexChange?.(bestIdx);
        if (showCounter) {
          announce(`Slide ${bestIdx + 1} of ${items.length}`);
        }
      }
      computeEdges();
    }, [activeIndex, items.length, onIndexChange, showCounter]);

    // Observe scroll/resize
    React.useEffect(() => {
      const vp = viewportRef.current;
      if (!vp) return;
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(updateActiveFromScroll);
      };
      const ro = new ResizeObserver(onScroll);
      vp.addEventListener("scroll", onScroll, { passive: true });
      ro.observe(vp);
      return () => {
        vp.removeEventListener("scroll", onScroll);
        ro.disconnect();
        cancelAnimationFrame(raf);
      };
    }, [updateActiveFromScroll]);

    return (
      <div
        id={id}
        className={[styles.root, className].filter(Boolean).join(" ")}
        style={{ ...style, ["--carousel-gap" as any]: gap, ["--carousel-item-min" as any]: itemMinWidth }}
      >
        <div
          ref={viewportRef}
          className={[styles.viewport, snap === "proximity" ? styles.snapProximity : styles.snapMandatory].join(" ")}
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          tabIndex={0}
          onKeyDown={onKeyDownViewport}
        >
          <div className={styles.track}>
            {items.map((child, idx) => (
              <div
                key={(child as any)?.key ?? idx}
                className={styles.item}
                data-carousel-item={idx}
                aria-roledescription="slide"
                aria-label={`Slide ${idx + 1} of ${items.length}`}
              >
                {child}
              </div>
            ))}
          </div>
        </div>

        {/* Live region for announcements */}
        <div className={styles.srOnly} aria-live="polite" ref={liveRef} />

        {controls !== "none" && (
          <div className={controls === "inside" ? styles.controlsInside : styles.controlsOutside}>
            <CarouselControls
              onPrev={goPrev}
              onNext={goNext}
              prevDisabled={edge.atStart}
              nextDisabled={edge.atEnd}
              counterText={showCounter ? `${activeIndex + 1} / ${items.length}` : undefined}
              variant={controlsVariant}
              size="md"
            />
          </div>
        )}
      </div>
    );
  }
);

Carousel.displayName = "Carousel";
export default Carousel;
