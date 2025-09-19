// shared-ui/hooks/useDeviceType.ts
"use client";

import { useState, useEffect, useCallback } from "react";

// Tailwind-style breakpoints
const TAILWIND_BREAKPOINTS = {
  xs: 480,
  sm: 600,
  md: 768,
  lg: 1024,
  xl: 1200,
  "2xl": 1440,
} as const;

type BreakpointKey = keyof typeof TAILWIND_BREAKPOINTS;
type DeviceOrientation = "portrait" | "landscape";

export interface DeviceType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: BreakpointKey;
  orientation: DeviceOrientation;
  isTouchDevice: boolean;
}

const getBreakpointKey = (width: number): BreakpointKey => {
  const entries = Object.entries(TAILWIND_BREAKPOINTS) as [BreakpointKey, number][];
  for (let i = entries.length - 1; i >= 0; i--) {
    if (width >= entries[i][1]) return entries[i][0];
  }
  return "xs";
};

/**
 * useDeviceType
 * 
 * Hook to return responsive and environment-aware device type metadata.
 * - Useful for responsive components like headers, modals, menus, and conditional rendering
 */
const useDeviceType = (debounceMs: number = 100): DeviceType => {
  const isSSR = typeof window === "undefined";

  const [device, setDevice] = useState<DeviceType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: "xl",
    orientation: "landscape",
    isTouchDevice: false,
  });

  const updateDevice = useCallback(() => {
    const width = window.innerWidth;
    const bpKey = getBreakpointKey(width);
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const orientation = window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";

    setDevice({
      isMobile: width < TAILWIND_BREAKPOINTS.md,
      isTablet: width >= TAILWIND_BREAKPOINTS.md && width < TAILWIND_BREAKPOINTS.lg,
      isDesktop: width >= TAILWIND_BREAKPOINTS.lg,
      breakpoint: bpKey,
      orientation,
      isTouchDevice: isTouch,
    });
  }, []);

  useEffect(() => {
    if (isSSR) return;

    let timeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateDevice, debounceMs);
    };

    updateDevice(); // Initial setup
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", updateDevice);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateDevice);
      clearTimeout(timeout);
    };
  }, [debounceMs, updateDevice, isSSR]);

  return device;
};

export default useDeviceType;
