// shared-ui/providers/ScrollProvider.tsx

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import useScrollRestoration from "@hooks/ui/useScrollRestoration";

interface ScrollContextValue {
  scrollY: number;
  saveScroll: () => void;
  restoreScroll: (path?: string) => void;
} 

const ScrollContext = createContext<ScrollContextValue | undefined>(undefined);

/**
 * ScrollProvider
 *
 * Provides global scroll tracking, restoration, and manual control.
 * Works with sessionStorage, hash links, and custom events like modals/tabs.
 */
export const ScrollProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { scrollY, savePosition, restorePosition } = useScrollRestoration({
    behavior: "smooth",
    manual: false,
  });

  const [currentScroll, setCurrentScroll] = useState(scrollY);

  // Sync scrollY on scroll
  const onScroll = useCallback(() => {
    setCurrentScroll(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Save scroll on UI interactions (modals, drawers, tabs, etc.)
  useEffect(() => {
    const events = ["modal:open", "sidebar:toggle", "tab:change"];

    const handleSave = () => savePosition();
    events.forEach((event) => window.addEventListener(event, handleSave));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleSave));
    };
  }, [savePosition]);

  // Restore scroll on mount (hydrated pages or SSR-compatible)
  useEffect(() => {
    requestAnimationFrame(() => restorePosition());
  }, [restorePosition]);

  return (
    <ScrollContext.Provider
      value={{
        scrollY: currentScroll,
        saveScroll: savePosition,
        restoreScroll: restorePosition,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

/**
 * useScroll
 * Access scroll context globally.
 */
export const useScroll = (): ScrollContextValue => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a <ScrollProvider />");
  }
  return context;
};
