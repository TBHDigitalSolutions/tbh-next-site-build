// src/components/sections/Web-Dev/PortfolioDemo/hooks/useFocusTrap.ts
"use client";

import { useEffect, useRef } from "react";

/**
 * useFocusTrap
 * ----------------------------------------------------------------------------
 * Traps keyboard focus within a container when `active` is true.
 * - SSR-safe (no-ops on server)
 * - Restores previously focused element on cleanup (configurable)
 * - Resilient: if there are no tabbables, focuses the container itself
 * - Handles Tab / Shift+Tab looping and stray focus (focusin guard)
 *
 * Usage:
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   useFocusTrap(containerRef, isOpen, { initialFocus: "first" });
 *
 * Options:
 *   - initialFocus:
 *       "first"      -> first tabbable (default)
 *       "container"  -> the container element itself (container will get tabIndex=-1)
 *       HTMLElement  -> a specific element to focus
 *       React.RefObject<HTMLElement>
 *   - restoreFocus:   restore the previously focused element on cleanup (default: true)
 *   - onEscape:       optional callback if Escape is pressed (does not auto-close)
 */

type TargetLike = HTMLElement | { current?: HTMLElement | null } | null | undefined;

type Options = {
  initialFocus?: "first" | "container" | TargetLike;
  restoreFocus?: boolean;
  onEscape?: () => void;
};

function isClient() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isHidden(el: Element): boolean {
  // hidden if not connected or not visible in layout
  if (!(el as HTMLElement).offsetParent && getComputedStyle(el as HTMLElement).position !== "fixed") {
    // If position is fixed, offsetParent can be null even when visible.
    // Use bounding rect as a secondary check:
    const rect = (el as HTMLElement).getBoundingClientRect?.();
    if (!rect || (rect.width === 0 && rect.height === 0)) return true;
  }
  const style = getComputedStyle(el as HTMLElement);
  return style.visibility === "hidden" || style.display === "none";
}

function isDisabled(el: Element): boolean {
  const htmlEl = el as HTMLElement & { disabled?: boolean };
  if (htmlEl.hasAttribute("disabled") || htmlEl.getAttribute("aria-disabled") === "true") return true;
  const tabindex = htmlEl.getAttribute("tabindex");
  if (tabindex !== null && Number(tabindex) < 0) return true;
  return false;
}

function isFocusable(el: Element): boolean {
  const node = el as HTMLElement;
  if (!node || isHidden(node) || isDisabled(node)) return false;

  const tag = node.tagName.toLowerCase();
  const focusableTags = ["input", "select", "textarea", "button"];
  if (focusableTags.includes(tag)) return true;
  if (tag === "a" || tag === "area") return !!(node as HTMLAnchorElement).href;
  if (node.hasAttribute("contenteditable")) return true;

  const tabindex = node.getAttribute("tabindex");
  return tabindex !== null && Number(tabindex) >= 0;
}

function getTabbables(container: HTMLElement): HTMLElement[] {
  // Broad selector first, then filter strictly via helpers above
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "area[href]",
        "input:not([type='hidden']):not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "button:not([disabled])",
        "iframe",
        "audio[controls]",
        "video[controls]",
        "[contenteditable]:not([contenteditable='false'])",
        "[tabindex]",
      ].join(",")
    )
  );
  return nodes.filter(isFocusable);
}

function resolveTarget(target: TargetLike): HTMLElement | null {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  if (typeof target === "object" && "current" in target) return target.current ?? null;
  return null;
}

export function useFocusTrap<T extends HTMLElement>(
  containerRef: React.RefObject<T>,
  active: boolean,
  options: Options = {}
): void {
  const {
    initialFocus = "first",
    restoreFocus = true,
    onEscape,
  } = options;

  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const lastTabDirectionRef = useRef<"forward" | "backward">("forward");

  useEffect(() => {
    if (!isClient()) return;
    const container = containerRef.current;
    if (!container) return;

    if (!active) return;

    // Save the currently focused element to restore later
    previouslyFocusedRef.current = (document.activeElement as HTMLElement) ?? null;

    // Calculate tabbables now (may change; we also re-evaluate on focus wrap)
    const focusFirst = () => {
      const tabbables = getTabbables(container);
      if (tabbables.length > 0) {
        tabbables[0].focus();
        return true;
      }
      return false;
    };

    const focusLast = () => {
      const tabbables = getTabbables(container);
      if (tabbables.length > 0) {
        tabbables[tabbables.length - 1].focus();
        return true;
      }
      return false;
    };

    // Ensure the container is programmatically focusable if needed
    const ensureContainerFocusable = () => {
      const el = container as HTMLElement;
      if (!isFocusable(el)) {
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      }
    };

    // Initial focus strategy
    const focusInitial = () => {
      // HTMLElement / Ref case
      const resolved = resolveTarget(initialFocus as TargetLike);
      if (resolved && container.contains(resolved) && isFocusable(resolved)) {
        resolved.focus();
        return;
      }

      // "container"
      if (initialFocus === "container") {
        ensureContainerFocusable();
        container.focus();
        return;
      }

      // default -> "first"
      if (!focusFirst()) {
        // Fallback to container if no tabbables
        ensureContainerFocusable();
        container.focus();
      }
    };

    // Keydown: trap Tab
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && typeof onEscape === "function") {
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;

      const tabbables = getTabbables(container);
      if (tabbables.length === 0) {
        // No tabbables: keep focus on the container itself
        ensureContainerFocusable();
        e.preventDefault();
        container.focus();
        return;
      }

      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        lastTabDirectionRef.current = "backward";
        if (!current || current === first || !container.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        lastTabDirectionRef.current = "forward";
        if (!current || current === last || !container.contains(current)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // focusin: if focus somehow escapes, pull it back inside
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!container.contains(target)) {
        // Return focus to an edge based on last Tab direction
        if (lastTabDirectionRef.current === "backward") {
          focusLast() || container.focus();
        } else {
          focusFirst() || container.focus();
        }
      }
    };

    // mousedown/touchstart outside: do nothing (modal backdrop click should be
    // handled by the modal itself); focus trap only manages focus.
    const doc = document;
    doc.addEventListener("keydown", onKeyDown, true);
    doc.addEventListener("focusin", onFocusIn, true);

    // Kick off initial focus AFTER listeners are attached to catch stray focus
    // (Use a microtask to ensure DOM is ready)
    Promise.resolve().then(focusInitial);

    return () => {
      doc.removeEventListener("keydown", onKeyDown, true);
      doc.removeEventListener("focusin", onFocusIn, true);

      // Restore previous focus if requested
      if (restoreFocus) {
        const prev = previouslyFocusedRef.current;
        // Only restore if still in the document and focusable-ish
        if (prev && prev.focus) {
          try {
            prev.focus();
          } catch {
            // ignore
          }
        }
      }
    };
  }, [active, containerRef, initialFocus, restoreFocus, onEscape]);
}

export default useFocusTrap;
