// src/components/sections/Web-Dev/PortfolioDemo/hooks/useKeyPress.ts
"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * useKeyPress
 * ----------------------------------------------------------------------------
 * A production-ready keyboard hook for listening to single keys or combos.
 * - Works with strings ("Escape"), arrays (["Control","K"]), or a predicate.
 * - SSR-safe (no-ops on server), cleans up listeners reliably.
 * - Ignores IME composition, optional "ignore input fields" behavior.
 * - Supports modifiers, exact matching, capture/passive, and custom targets.
 *
 * Example:
 *   useKeyPress(["Control","k"], (e) => {
 *     e.preventDefault();
 *     openCommandPalette();
 *   }, { ignoreInput: true });
 */

export type KeyFilter = string | string[] | ((event: KeyboardEvent) => boolean);

export type UseKeyPressOptions = {
  /** Which keyboard event to invoke the handler on (default: 'keydown') */
  event?: "keydown" | "keyup" | "keypress";
  /** Target element/ref to attach listeners to. Defaults to document. */
  target?: Document | Window | HTMLElement | React.RefObject<Document | Window | HTMLElement | null>;
  /** Enable/disable the listener without unmounting. */
  enabled?: boolean;
  /** Prevent default when the filter matches (default: false) */
  preventDefault?: boolean;
  /** Stop propagation when the filter matches (default: false) */
  stopPropagation?: boolean;
  /** Use capture phase (default: false) */
  capture?: boolean;
  /** Use passive listener (default: !preventDefault) */
  passive?: boolean;
  /**
   * When true, ignores key presses that originate from editable elements
   * (input, textarea, select, contenteditable), except Escape.
   * Default: true
   */
  ignoreInput?: boolean;
  /**
   * For array filters, require an exact set of pressed keys (no extras).
   * Default: false (subset match)
   */
  exactMatch?: boolean;
  /**
   * Whether modifier keys must be present in the filter to count (Ctrl, Meta, Alt, Shift).
   * Default: true — i.e., combos consider modifiers from the event.
   */
  modifierAware?: boolean;
  /**
   * Invoke at most once; listener is removed after first match.
   * Default: false
   */
  once?: boolean;
};

type CanonicalKey =
  | "escape"
  | "enter"
  | "space"
  | "tab"
  | "backspace"
  | "delete"
  | "arrowup"
  | "arrowdown"
  | "arrowleft"
  | "arrowright"
  | "home"
  | "end"
  | "pageup"
  | "pagedown"
  | "insert"
  | "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7" | "f8" | "f9" | "f10" | "f11" | "f12"
  | "control"
  | "meta"
  | "alt"
  | "shift"
  | string; // letters, digits, punctuation (normalized to lowercase)

/* ----------------------------- Internals ---------------------------------- */

const ALIAS: Record<string, CanonicalKey> = {
  esc: "escape",
  escape: "escape",
  return: "enter",
  enter: "enter",
  " ": "space",
  space: "space",
  spacebar: "space",
  tab: "tab",
  backspace: "backspace",
  del: "delete",
  delete: "delete",
  left: "arrowleft",
  arrowleft: "arrowleft",
  right: "arrowright",
  arrowright: "arrowright",
  up: "arrowup",
  arrowup: "arrowup",
  down: "arrowdown",
  arrowdown: "arrowdown",
  home: "home",
  end: "end",
  pageup: "pageup",
  pagedown: "pagedown",
  ins: "insert",
  insert: "insert",
  cmd: "meta",
  command: "meta",
  meta: "meta",
  win: "meta",
  super: "meta",
  ctrl: "control",
  control: "control",
  alt: "alt",
  option: "alt",
  shift: "shift",
};

const isClient = () => typeof window !== "undefined" && typeof document !== "undefined";

const isEditable = (el: EventTarget | null): boolean => {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  const role = node.getAttribute?.("role");
  if (role === "textbox") return true;
  const ce = node.getAttribute?.("contenteditable");
  return ce === "" || ce === "true";
};

const normalizeKey = (raw: string): CanonicalKey => {
  const k = (raw || "").toLowerCase();
  if (ALIAS[k]) return ALIAS[k];
  // Map function keys like "F1", keep letters/digits/punct as-is lowercased
  if (/^f\d{1,2}$/.test(k)) return k as CanonicalKey;
  return k as CanonicalKey;
};

const resolveTarget = (
  t?: UseKeyPressOptions["target"]
): Document | Window | HTMLElement | null => {
  if (!t) return isClient() ? document : null;
  if (typeof (t as React.RefObject<any>)?.current !== "undefined") {
    return (t as React.RefObject<any>).current || null;
  }
  return (t as Document | Window | HTMLElement) || null;
};

/**
 * Build a set of currently pressed keys for matching.
 * Uses a persistent Set (downKeysRef) to support combos with multiple non-modifier keys.
 */
const buildActiveKeySet = (
  e: KeyboardEvent,
  down: Set<CanonicalKey>,
  modifierAware: boolean
): Set<CanonicalKey> => {
  const keys = new Set<CanonicalKey>(down);
  // Ensure the event.key itself is present
  keys.add(normalizeKey(e.key));

  // Sync modifiers from the event (more reliable than relying on down set alone)
  if (modifierAware) {
    if (e.ctrlKey) keys.add("control");
    else keys.delete("control");
    if (e.metaKey) keys.add("meta");
    else keys.delete("meta");
    if (e.altKey) keys.add("alt");
    else keys.delete("alt");
    if (e.shiftKey) keys.add("shift");
    else keys.delete("shift");
  }
  return keys;
};

const arraysEqualAsSets = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));

/* -------------------------------- Hook ------------------------------------ */

export function useKeyPress(
  filter: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: UseKeyPressOptions = {}
) {
  const {
    event = "keydown",
    target,
    enabled = true,
    preventDefault = false,
    stopPropagation = false,
    capture = false,
    passive = preventDefault ? false : true,
    ignoreInput = true,
    exactMatch = false,
    modifierAware = true,
    once = false,
  } = options;

  // Normalize the filter to a canonical representation for stable comparisons
  const normalizedFilter = useMemo(() => {
    if (typeof filter === "function") return filter;
    const arr = Array.isArray(filter) ? filter : [filter];
    const canon = arr.map((k) => normalizeKey(k));
    return canon;
  }, [filter]);

  // Track keys currently held down to support multi-key combos
  const downKeysRef = useRef<Set<CanonicalKey>>(new Set());
  const onceRef = useRef<boolean>(once); // ensure we can stop after first match

  useEffect(() => {
    if (!isClient() || !enabled) return;

    const targetEl = resolveTarget(target) || document;
    const supportsPassive = (() => {
      let supported = false;
      try {
        const opts = Object.defineProperty({}, "passive", {
          get() {
            supported = true;
            return true;
          },
        });
        window.addEventListener("test", () => {}, opts);
        window.removeEventListener("test", () => {});
      } catch {
        // ignore
      }
      return supported;
    })();

    const listenerOptions: AddEventListenerOptions | boolean = supportsPassive
      ? { capture, passive }
      : capture;

    const onKeyDown = (e: KeyboardEvent) => {
      // Always maintain the down set on keydown
      downKeysRef.current.add(normalizeKey(e.key));
      if (modifierAware) {
        if (e.ctrlKey) downKeysRef.current.add("control");
        if (e.metaKey) downKeysRef.current.add("meta");
        if (e.altKey) downKeysRef.current.add("alt");
        if (e.shiftKey) downKeysRef.current.add("shift");
      }

      if (event !== "keydown") return; // only fire handler on configured event
      handleEvent(e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      // Remove from down set on keyup
      const key = normalizeKey(e.key);
      downKeysRef.current.delete(key);
      // Modifiers clear when keyup of the modifier itself
      if (modifierAware) {
        if (key === "control") downKeysRef.current.delete("control");
        if (key === "meta") downKeysRef.current.delete("meta");
        if (key === "alt") downKeysRef.current.delete("alt");
        if (key === "shift") downKeysRef.current.delete("shift");
      }

      if (event !== "keyup") return;
      handleEvent(e);
    };

    const onKeyPress = (e: KeyboardEvent) => {
      if (event !== "keypress") return;
      handleEvent(e);
    };

    const matchesFilter = (e: KeyboardEvent): boolean => {
      if (typeof normalizedFilter === "function") {
        return normalizedFilter(e);
      }

      // Build active set for this event
      const activeSet = buildActiveKeySet(e, downKeysRef.current, modifierAware);

      // Canonical required keys
      const requiredArr = normalizedFilter as CanonicalKey[];
      const required = new Set<CanonicalKey>(requiredArr);

      if (exactMatch) {
        return arraysEqualAsSets(new Set([...required].map(String)), new Set([...activeSet].map(String)));
      }
      // Subset match
      for (const k of required) {
        if (!activeSet.has(k)) return false;
      }
      return true;
    };

    const handleEvent = (e: KeyboardEvent) => {
      if (onceRef.current === true) return;
      if (e.isComposing) return; // ignore IME
      if (ignoreInput && isEditable(e.target) && normalizeKey(e.key) !== "escape") return;

      if (!matchesFilter(e)) return;

      if (preventDefault && !passive) e.preventDefault();
      if (stopPropagation) e.stopPropagation();

      handler(e);

      if (once) {
        onceRef.current = true;
        detach(); // remove listeners eagerly after first match
      }
    };

    const attach = () => {
      targetEl.addEventListener("keydown", onKeyDown, listenerOptions as any);
      targetEl.addEventListener("keyup", onKeyUp, listenerOptions as any);
      targetEl.addEventListener("keypress", onKeyPress, listenerOptions as any);
    };

    const detach = () => {
      targetEl.removeEventListener("keydown", onKeyDown as any, listenerOptions as any);
      targetEl.removeEventListener("keyup", onKeyUp as any, listenerOptions as any);
      targetEl.removeEventListener("keypress", onKeyPress as any, listenerOptions as any);
    };

    attach();
    return () => {
      detach();
      // Clear pressed set on unmount/disable to avoid stale keys
      downKeysRef.current.clear();
      onceRef.current = once; // reset "once" behavior when deps change
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    event,
    target,
    enabled,
    preventDefault,
    stopPropagation,
    capture,
    passive,
    ignoreInput,
    exactMatch,
    modifierAware,
    handler,
    normalizedFilter,
    once,
  ]);
}

export default useKeyPress;
