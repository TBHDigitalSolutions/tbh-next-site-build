// src/booking/components/SchedulerEmbed/SchedulerEmbed.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

type Provider = "cal" | "calendly" | "acuity" | "custom";

export interface SchedulerEmbedProps {
  /** Which scheduler to embed */
  provider: Provider;

  /** (Optional) Fully-qualified URL to use verbatim. If present, overrides all builder params below. */
  url?: string;

  /** ---- Builder params (used when `url` is not provided) ---- */
  // Cal.com
  cal?: {
    /** username or organization slug (e.g. "acme") */
    userOrOrg?: string;
    /** event type slug/id (e.g. "intro-call") */
    eventType?: string;
    /** cal.com root, defaults to https://cal.com */
    baseUrl?: string;
  };

  // Calendly
  calendly?: {
    /** e.g. https://calendly.com/acme/intro-call */
    pageUrl?: string;
  };

  // Acuity
  acuity?: {
    /** Numeric owner id (required) */
    ownerId: string | number;
    /** Optional appointment type id */
    appointmentTypeId?: string | number;
  };

  /** Common options */
  locale?: string;             // e.g. "en", "en-US"
  timezone?: string;           // IANA tz like "America/New_York"
  prefill?: Record<string, string | number | boolean>;
  /** Theme: "light" | "dark" or a map (converted into provider query params where possible) */
  theme?: "light" | "dark" | Record<string, string>;

  /** Sizing */
  height?: number | "auto";    // default "auto"
  minHeight?: number;          // default 680

  /** Behavior */
  autoFocus?: boolean;         // focus iframe on load
  className?: string;
  style?: React.CSSProperties;
  title?: string;              // iframe title (a11y)

  /** Lifecycle + analytics */
  onLoad?: () => void;
  onError?: (err: Error) => void;
  onSchedule?: (payload: unknown) => void;
  onTrack?: (event: string, props?: Record<string, unknown>) => void;

  /** Network/timeout */
  loadTimeoutMs?: number;      // default 12000
  retry?: { attempts?: number; backoffMs?: number }; // default {1, 1000}
}

/** Imperative API (optional) */
export interface SchedulerEmbedHandle {
  reload: () => void;
  getIframe: () => HTMLIFrameElement | null;
}

function toSearchParams(obj?: Record<string, any>): URLSearchParams {
  const sp = new URLSearchParams();
  if (!obj) return sp;
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  return sp;
}

function normalizeTheme(provider: Provider, theme?: SchedulerEmbedProps["theme"]) {
  if (!theme) return {};
  if (theme === "light" || theme === "dark") {
    // Mapped to common provider params
    if (provider === "cal") return { theme: theme };
    if (provider === "calendly") return { background_color: theme === "dark" ? "1e293b" : "ffffff", text_color: theme === "dark" ? "e5e7eb" : "0f172a" };
    if (provider === "acuity") return { theme: theme }; // not official but harmless
  }
  // Arbitrary map
  return theme as Record<string, string>;
}

function buildUrl(props: SchedulerEmbedProps): string {
  if (props.url) return props.url;

  const { provider, locale, timezone, prefill, theme } = props;
  const common = toSearchParams({
    locale,
    timezone,
    // Prefill fields vary by provider; pass-through for custom handling upstream
    ...prefill,
    ...normalizeTheme(provider, theme),
  });

  if (provider === "cal") {
    const base = props.cal?.baseUrl ?? "https://cal.com";
    const who = props.cal?.userOrOrg ?? "book";
    const event = props.cal?.eventType ? `/${props.cal.eventType}` : "";
    // cal.com supports embed params:
    // - embed_type=Iframe, hide_landing_page=true, primary_color, etc.
    const url = new URL(`${base.replace(/\/+$/, "")}/${who}${event}`);
    url.searchParams.set("embed_type", "Iframe");
    url.searchParams.set("hide_landing_page", "true");
    // Merge user params last
    for (const [k, v] of common.entries()) url.searchParams.set(k, v);
    return url.toString();
  }

  if (provider === "calendly") {
    // Calendly inline embed prefers `embed_domain` and `embed_type=Inline`
    const page = props.calendly?.pageUrl ?? "https://calendly.com/";
    const url = new URL(page);
    url.searchParams.set("embed_domain", typeof window !== "undefined" ? window.location.hostname : "localhost");
    url.searchParams.set("embed_type", "Inline");
    for (const [k, v] of common.entries()) url.searchParams.set(k, v);
    return url.toString();
  }

  if (provider === "acuity") {
    // https://app.acuityscheduling.com/schedule.php?owner=XXXX&appointmentType=YYYY
    const base = "https://app.acuityscheduling.com/schedule.php";
    const url = new URL(base);
    url.searchParams.set("owner", String(props.acuity?.ownerId ?? ""));
    if (props.acuity?.appointmentTypeId) {
      url.searchParams.set("appointmentType", String(props.acuity.appointmentTypeId));
    }
    for (const [k, v] of common.entries()) url.searchParams.set(k, v);
    return url.toString();
  }

  if (provider === "custom") {
    if (!props.url) {
      throw new Error("custom provider requires a `url` prop.");
    }
    return props.url;
  }

  throw new Error("Unsupported provider");
}

function originFromUrl(u: string) {
  try {
    return new URL(u).origin;
  } catch {
    return "*";
  }
}

const SchedulerEmbed = forwardRef<SchedulerEmbedHandle, SchedulerEmbedProps>(
  function SchedulerEmbed(
    {
      provider,
      url,
      cal,
      calendly,
      acuity,
      locale,
      timezone,
      prefill,
      theme,
      className,
      style,
      title = "Scheduler",
      autoFocus,
      onLoad,
      onError,
      onSchedule,
      onTrack,
      height = "auto",
      minHeight = 680,
      loadTimeoutMs = 12000,
      retry = { attempts: 1, backoffMs: 1000 },
    },
    ref
  ) {
    const [src, setSrc] = useState<string>(() => {
      try {
        return buildUrl({
          provider,
          url,
          cal,
          calendly,
          acuity,
          locale,
          timezone,
          prefill,
          theme,
          height,
          minHeight,
        });
      } catch {
        return "";
      }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [frameHeight, setFrameHeight] = useState<number>(typeof height === "number" ? height : minHeight);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const timerRef = useRef<number | null>(null);
    const attemptsRef = useRef(0);

    const allowedOrigin = useMemo(() => originFromUrl(src), [src]);

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const beginLoadTimer = useCallback(() => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        const err = new Error("Scheduler failed to load (timeout).");
        setError(err.message);
        setLoading(false);
        onError?.(err);
        onTrack?.("scheduler_timeout", { provider, src });
      }, loadTimeoutMs);
    }, [loadTimeoutMs, onError, onTrack, provider, src]);

    const handleLoaded = useCallback(() => {
      clearTimer();
      setLoading(false);
      setError(null);
      if (autoFocus) iframeRef.current?.focus();
      onLoad?.();
      onTrack?.("scheduler_loaded", { provider, src });
      // If auto height, request initial height (many providers post an initial resize soon after)
      if (height === "auto") {
        // no-op here; we rely on postMessage. Fallback: set a minimum.
        setFrameHeight((h) => Math.max(h, minHeight));
      }
    }, [autoFocus, onLoad, onTrack, provider, src, height, minHeight]);

    const handleRetry = useCallback(() => {
      if (attemptsRef.current >= (retry.attempts ?? 1)) return;
      attemptsRef.current += 1;
      setLoading(true);
      setError(null);
      onTrack?.("scheduler_retry", { attempt: attemptsRef.current, provider });
      // small backoff then reload
      const backoff = retry.backoffMs ?? 1000;
      window.setTimeout(() => {
        try {
          const rebuilt = buildUrl({
            provider,
            url,
            cal,
            calendly,
            acuity,
            locale,
            timezone,
            prefill,
            theme,
            height,
            minHeight,
          });
          setSrc(rebuilt);
          iframeRef.current?.contentWindow?.location.reload();
          beginLoadTimer();
        } catch (e) {
          const err = e instanceof Error ? e : new Error("Failed to build scheduler URL.");
          setError(err.message);
          setLoading(false);
          onError?.(err);
        }
      }, backoff);
    }, [
      provider,
      url,
      cal,
      calendly,
      acuity,
      locale,
      timezone,
      prefill,
      theme,
      height,
      minHeight,
      retry.attempts,
      retry.backoffMs,
      onTrack,
      beginLoadTimer,
      onError,
    ]);

    // Expose imperative API
    useImperativeHandle(
      ref,
      (): SchedulerEmbedHandle => ({
        reload: () => {
          attemptsRef.current = 0;
          handleRetry();
        },
        getIframe: () => iframeRef.current,
      }),
      [handleRetry]
    );

    // Start timeout when src changes
    useEffect(() => {
      if (!src) return;
      setLoading(true);
      setError(null);
      beginLoadTimer();
      return clearTimer;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    // postMessage listener for resize/events
    useEffect(() => {
      function onMessage(ev: MessageEvent<any>) {
        // Strict origin check
        if (allowedOrigin !== "*" && ev.origin !== allowedOrigin) return;

        const data = ev.data || ev; // some providers post primitives
        // --- Height auto-resize ---
        // Calendly emits {event: 'calendly:frame:resize', height: number}
        // Cal.com emits {type: 'cal:resize', height: number} (varies by version)
        const maybeHeight =
          (typeof data === "object" && (data.height ?? data?.detail?.height)) ||
          (typeof data?.message === "object" && data.message?.height);
        if (height === "auto" && typeof maybeHeight === "number" && isFinite(maybeHeight)) {
          setFrameHeight(Math.max(minHeight, Math.round(maybeHeight)));
        }

        // --- Scheduled event detection ---
        // Calendly: {event: 'calendly.event_scheduled', payload: {...}}
        // Cal.com:  {type: 'cal:eventScheduled', payload: {...}} or {event: 'bookingSuccessful', ...}
        // Acuity:   {event: 'acuity.schedule.completed', ...}
        const eventName =
          data?.event || data?.type || data?.message?.event || data?.name || "";

        const looksScheduled =
          typeof eventName === "string" &&
          /scheduled|bookingSuccessful|schedule\.completed/i.test(eventName);

        if (looksScheduled) {
          onTrack?.("scheduler_event_scheduled", { provider, event: eventName });
          onSchedule?.(data);
        }
      }

      window.addEventListener("message", onMessage);
      return () => window.removeEventListener("message", onMessage);
    }, [allowedOrigin, height, minHeight, onSchedule, onTrack, provider]);

    // Compute sandbox + permissions (tight but workable)
    const sandbox =
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox";
    const allow =
      "camera *; microphone *; autoplay *; clipboard-write; encrypted-media *";

    const mergedStyle: React.CSSProperties = {
      width: "100%",
      border: 0,
      background: "transparent",
      height: typeof height === "number" ? height : frameHeight,
      minHeight,
      ...style,
    };

    return (
      <div
        className={className}
        style={{
          // nice defaults that align with the rest of the booking UI
          background: "var(--bg-surface, #fff)",
          border: "1px solid var(--border-subtle, #e5e5e5)",
          borderRadius: "var(--radius-lg, 12px)",
          boxShadow: "var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.1))",
          overflow: "hidden",
          position: "relative",
        }}
        aria-busy={loading || undefined}
      >
        {/* Loading overlay */}
        {loading && !error && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(0deg, rgba(248,249,250,0.8), rgba(248,249,250,0.8))",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "3px solid var(--border-subtle, #e5e5e5)",
                borderTopColor: "var(--accent-primary, #0ea5e9)",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            role="alert"
            style={{
              padding: 16,
              color: "var(--text-danger, #dc2626)",
              background: "var(--bg-elevated, #f8f9fa)",
              borderBottom: "1px solid var(--border-subtle, #e5e5e5)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              We couldn’t load the scheduler.
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
              {error}
            </div>
            <button
              type="button"
              onClick={handleRetry}
              style={{
                appearance: "none",
                borderRadius: 8,
                border: "1px solid var(--border-strong, #d1d5db)",
                padding: "8px 12px",
                background: "var(--bg-surface, #fff)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          title={title}
          src={src}
          style={mergedStyle}
          loading="lazy"
          sandbox={sandbox}
          allow={allow}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={handleLoaded}
          onError={() => {
            const err = new Error("Scheduler failed to load.");
            setError(err.message);
            setLoading(false);
            onError?.(err);
            onTrack?.("scheduler_error", { provider, src });
          }}
        />
      </div>
    );
  }
);

export default SchedulerEmbed;
