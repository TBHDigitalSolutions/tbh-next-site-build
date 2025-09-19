// src/components/sections/Web-Dev/PortfolioDemo/hooks/useBodyScrollLock.ts
"use client";

import { useEffect } from "react";

/**
 * useBodyScrollLock
 * ----------------------------------------------------------------------------
 * Locks <body> scrolling when `active` is true. Designed for modals/overlays.
 *
 * • SSR-safe (no-ops on the server)
 * • iOS-safe (uses position:fixed technique to prevent rubber-banding)
 * • Prevents layout shift by compensating for the scrollbar width
 * • Ref-counted so multiple overlays can coexist safely
 *
 * Usage:
 *   useBodyScrollLock(isModalOpen);
 *
 * Options:
 *   - preserveScrollPosition (default: true)
 *       When unlocking, returns the window to the prior scroll position.
 */

type Options = {
  preserveScrollPosition?: boolean;
};

// --------------------------- Module-level state ------------------------------

let lockCount = 0; // how many concurrent locks are active

// Original inline styles we will restore when the last lock releases
let originalOverflow = "";
let originalPaddingRight = "";
let originalPosition = "";
let originalTop = "";
let originalWidth = "";

// Other originals derived from computed values
let savedScrollY = 0;
let usedFixedPosition = false;

// ------------------------------- Utilities -----------------------------------

function isClient() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/** Best-effort iOS detection (covers iPadOs which reports MacIntel) */
function isIOS(): boolean {
  if (!isClient()) return false;
  const ua = window.navigator.userAgent || "";
  const platform = (window.navigator as any).platform || "";
  const maxTouchPoints = (window.navigator as any).maxTouchPoints || 0;
  const iOSByUA = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = platform === "MacIntel" && maxTouchPoints > 1;
  return iOSByUA || iPadOS;
}

/** Width of the scrollbar so we can add equal padding-right to <body> */
function getScrollbarWidth(): number {
  if (!isClient()) return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

/** Get the numeric pixel value for a CSS length (e.g. "12px" -> 12) */
function toPxNumber(value: string): number {
  const match = /^-?\d+(\.\d+)?/.exec(value);
  return match ? parseFloat(match[0]) : 0;
}

// --------------------------------- Hook --------------------------------------

export function useBodyScrollLock(
  active: boolean,
  options: Options = { preserveScrollPosition: true }
): void {
  useEffect(() => {
    if (!isClient()) return;

    const body = document.body;
    if (!body) return;

    // If activating
    if (active) {
      // First lock: capture originals and apply styles
      if (lockCount === 0) {
        savedScrollY = window.scrollY || window.pageYOffset || 0;

        // Save original inline styles to restore later
        originalOverflow = body.style.overflow;
        originalPaddingRight = body.style.paddingRight;
        originalPosition = body.style.position;
        originalTop = body.style.top;
        originalWidth = body.style.width;

        // Prevent layout shift by compensating for the missing scrollbar
        const scrollbarComp = getScrollbarWidth();
        if (scrollbarComp > 0) {
          const currentComputedPaddingRight = getComputedStyle(body).paddingRight;
          const currentPx = toPxNumber(currentComputedPaddingRight);
          body.style.paddingRight = `${currentPx + scrollbarComp}px`;
        }

        // Two strategies:
        //  - iOS: position: fixed to fully stop rubber-banding
        //  - others: overflow: hidden is enough
        if (isIOS()) {
          usedFixedPosition = true;
          body.style.position = "fixed";
          body.style.top = `-${savedScrollY}px`;
          body.style.width = "100%";
          // Do NOT set overflow hidden here to avoid content cut-offs on iOS
        } else {
          usedFixedPosition = false;
          body.style.overflow = "hidden";
        }

        body.setAttribute("data-scroll-locked", "true");
      }

      lockCount += 1;
      return () => {
        // Deactivate on unmount
        releaseBodyLock(options.preserveScrollPosition !== false);
      };
    }

    // If deactivating immediately (i.e., active=false re-run)
    // perform a release now
    if (!active) {
      releaseBodyLock(options.preserveScrollPosition !== false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

// ---------------------------- Release helper ---------------------------------

function releaseBodyLock(preserveScroll: boolean) {
  if (!isClient()) return;

  const body = document.body;
  if (!body) return;

  if (lockCount > 0) {
    lockCount -= 1;
  }

  // Only when the very last lock is gone do we restore styles/scroll
  if (lockCount === 0) {
    // Restore original inline styles
    body.style.overflow = originalOverflow;
    body.style.paddingRight = originalPaddingRight;
    body.style.position = originalPosition;
    body.style.top = originalTop;
    body.style.width = originalWidth;

    body.removeAttribute("data-scroll-locked");

    // If we used fixed positioning (iOS strategy), restore scroll position
    if (usedFixedPosition && preserveScroll) {
      // Parse the stored top offset (e.g., "-123px")
      const y = savedScrollY || Math.abs(toPxNumber(originalTop)) || 0;
      window.scrollTo(0, y);
    }

    // Clear saved state (defensive)
    savedScrollY = 0;
    usedFixedPosition = false;
  }
}

export default useBodyScrollLock;
