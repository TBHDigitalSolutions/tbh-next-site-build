// shared-ui/hooks/useScrollSpy.ts

"use client";

import { useEffect } from "react";
import { useScrollSpyContext } from "../../contexts/ScrollSpyContext";

interface UseScrollSpyOptions {
  /** CSS selector for headings to observe */
  selector?: string;
  /** IntersectionObserver rootMargin */
  rootMargin?: string; 
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Optional class to toggle on active element */
  activeClass?: string;
}

/** 
 * useScrollSpy
 * Tracks the current heading in view and updates global context.
 * Optionally adds/removes a CSS class on the active element.
 */
export function useScrollSpy({
  selector = "h2, h3",
  rootMargin = "-100px 0px -60% 0px",
  debounceMs = 50,
  activeClass,
}: UseScrollSpyOptions = {}) {
  const { activeId, setActiveId } = useScrollSpyContext();

  // Observe visibility of headings
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(selector)).filter(
      (el): el is HTMLElement => el instanceof HTMLElement
    );
    if (elements.length === 0) return;

    let timeout: number;
    const observer = new IntersectionObserver(
      (entries) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        }, debounceMs);
      },
      { rootMargin, threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [selector, rootMargin, debounceMs, setActiveId]);

  // Toggle CSS class on active heading
  useEffect(() => {
    if (!activeClass) return;
    const all = Array.from(document.querySelectorAll(selector));
    all.forEach((el) => el.classList.remove(activeClass));
    if (activeId) {
      const activeEl = document.getElementById(activeId);
      activeEl?.classList.add(activeClass);
    }
  }, [activeId, activeClass, selector]);

  return { activeId };
}

export default useScrollSpy;