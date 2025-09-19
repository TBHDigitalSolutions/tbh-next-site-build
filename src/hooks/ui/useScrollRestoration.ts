// shared-ui/hooks/useScrollRestoration.ts

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "scroll-positions";

type ScrollMap = Record<string, number>;

interface UseScrollRestorationOptions {
  manual?: boolean;
  behavior?: ScrollBehavior;
}

const getStorageMap = (): ScrollMap => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};
 
const saveToStorage = (map: ScrollMap) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};

/**
 * useScrollRestoration
 * Combines hash-based scroll, sessionStorage persistence, and manual control.
 */
const useScrollRestoration = ({
  manual = false,
  behavior = "auto",
}: UseScrollRestorationOptions = {}) => {
  const pathname = usePathname();
  const scrollMapRef = useRef<ScrollMap>(getStorageMap());
  const isRestoring = useRef(false);
  const [scrollY, setScrollY] = useState(0);

  // Save scroll position to memory and sessionStorage
  const savePosition = useCallback(() => {
    const y = window.scrollY;
    scrollMapRef.current[pathname] = y;
    saveToStorage(scrollMapRef.current);
  }, [pathname]);

  // Restore scroll or hash
  const restorePosition = useCallback((overridePath?: string) => {
    const targetPath = overridePath || pathname;
    const hash = window.location.hash;

    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior, block: "start" });
        return;
      }
    }

    const y = scrollMapRef.current[targetPath] ?? 0;
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior });
      isRestoring.current = false;
    });
  }, [pathname, behavior]);

  // Auto-save on unload
  useEffect(() => {
    const handleUnload = () => savePosition();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [savePosition]);

  // Track scroll position state
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mark restore intention on back/forward nav
  useEffect(() => {
    const handlePopState = () => {
      isRestoring.current = true;
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Restore on route change unless in manual mode
  useEffect(() => {
    if (!manual && typeof window !== "undefined") {
      restorePosition();
    }
  }, [pathname, manual, restorePosition]);

  return {
    scrollY,
    savePosition,
    restorePosition,
  };
};

export default useScrollRestoration;
