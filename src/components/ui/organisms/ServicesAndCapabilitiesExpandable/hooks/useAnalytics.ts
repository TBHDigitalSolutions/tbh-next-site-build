"use client";

type AnalyticsSink = (eventName: string, payload?: Record<string, any>) => void;

export type UseAnalyticsOptions = {
  /** optional namespace (e.g., "services:applications") */
  namespace?: string;
  /**
   * custom sink for events; defaults to:
   * - window.dataLayer.push({...}) if available
   * - window.dispatchEvent(new CustomEvent(...)) otherwise
   */
  sink?: AnalyticsSink;
  /** static context merged into each payload */
  context?: Record<string, any>;
};

function defaultSink(eventName: string, payload?: Record<string, any>) {
  // Google Tag Manager dataLayer if present
  const w = typeof window !== "undefined" ? (window as any) : undefined;
  if (w?.dataLayer && typeof w.dataLayer.push === "function") {
    w.dataLayer.push({ event: eventName, ...payload });
    return;
  }
  // Fallback to DOM CustomEvent (developers can listen)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload ?? {} }));
  }
}

/**
 * Lightweight analytics helper:
 * - provides a `track()` function
 * - convenience methods: `trackView`, `trackExpand`, `trackCTA`
 */
export function useAnalytics(opts: UseAnalyticsOptions = {}) {
  const { namespace, sink = defaultSink, context = {} } = opts;

  function qualify(name: string) {
    return namespace ? `${namespace}:${name}` : name;
  }

  function track(eventName: string, payload?: Record<string, any>) {
    sink(qualify(eventName), { ...context, ...payload });
  }

  function trackView(section: string, extra?: Record<string, any>) {
    track("view", { section, ...extra });
  }

  function trackExpand(itemId: string, isOpen: boolean, index: number, extra?: Record<string, any>) {
    track("expand", { itemId, isOpen, index, ...extra });
  }

  function trackCTA(label: string, href?: string, extra?: Record<string, any>) {
    track("cta", { label, href, ...extra });
  }

  return { track, trackView, trackExpand, trackCTA };
}
