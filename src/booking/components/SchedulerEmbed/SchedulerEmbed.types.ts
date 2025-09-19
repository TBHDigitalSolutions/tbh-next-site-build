// src/booking/components/SchedulerEmbed/SchedulerEmbed.types.ts

/**
 * Supported scheduling providers.
 */
export type Provider = "cal" | "calendly" | "acuity" | "custom";

/**
 * Basic retry configuration for the embedded scheduler load.
 */
export interface RetryConfig {
  /** Number of additional attempts after the first load. Default: 1 */
  attempts?: number;
  /** Backoff in milliseconds between attempts. Default: 1000 */
  backoffMs?: number;
}

/**
 * Theme value can be a simple preset ("light" / "dark") or a provider-param map.
 * When a map is provided, it will be passed through to provider query params
 * when supported (e.g., `primary_color`, `background_color`, etc.).
 */
export type SchedulerTheme = "light" | "dark" | Record<string, string>;

/**
 * Provider-specific builder options
 */
export interface CalBuilderOptions {
  /** username or organization slug (e.g. "acme") */
  userOrOrg?: string;
  /** event type slug/id (e.g. "intro-call") */
  eventType?: string;
  /** cal.com root, defaults to https://cal.com */
  baseUrl?: string;
}

export interface CalendlyBuilderOptions {
  /** Full page URL, e.g., https://calendly.com/acme/intro-call */
  pageUrl?: string;
}

export interface AcuityBuilderOptions {
  /** Numeric owner id (required by Acuity) */
  ownerId: string | number;
  /** Optional appointment type id */
  appointmentTypeId?: string | number;
}

/**
 * PostMessage event payloads we listen for from providers.
 * These are intentionally broad to accommodate provider differences.
 */
export interface SchedulerMessageBase {
  /** Generic event/type field used by various providers */
  event?: string;
  type?: string;
  name?: string;
  /** Nested detail/message envelopes used by some providers */
  detail?: Record<string, unknown>;
  message?: { event?: string; [k: string]: unknown } & Record<string, unknown>;
  /** Height supplied by provider for auto-resize */
  height?: number;
  /** Arbitrary additional data */
  [k: string]: unknown;
}

/**
 * “Event scheduled” style messages detected by the component.
 * Not all providers send identical structures, so we allow unknown payload.
 */
export interface SchedulerScheduledMessage extends SchedulerMessageBase {
  /** Best-effort canonical flag set by the component when a scheduled event is detected */
  __scheduled__?: true;
  /** Provider-specific payload */
  payload?: unknown;
}

/**
 * Analytics callback signature used by the component.
 */
export type SchedulerTrackFn = (
  event: string,
  props?: Record<string, unknown>
) => void;

/**
 * Public props for SchedulerEmbed component.
 */
export interface SchedulerEmbedProps {
  /** Which scheduler to embed */
  provider: Provider;

  /**
   * Fully-qualified URL to use verbatim. If present, this overrides builder params.
   * Required when `provider` is "custom".
   */
  url?: string;

  /** ---- Builder params (used when `url` is not provided) ---- */
  cal?: CalBuilderOptions;
  calendly?: CalendlyBuilderOptions;
  acuity?: AcuityBuilderOptions;

  /** Common options */
  /** BCP-47 locale (e.g. "en", "en-US") */
  locale?: string;
  /** IANA timezone like "America/New_York" */
  timezone?: string;
  /** Provider prefill params (passed through when supported) */
  prefill?: Record<string, string | number | boolean>;
  /** Theme preference/palette */
  theme?: SchedulerTheme;

  /** Sizing */
  /** Explicit height in px or "auto" (postMessage-based). Default: "auto" */
  height?: number | "auto";
  /** Minimum height used with auto-resize. Default: 680 */
  minHeight?: number;

  /** Behavior & presentation */
  /** Autofocus the iframe after it loads */
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible title for the iframe. Default: "Scheduler" */
  title?: string;

  /** Lifecycle & analytics */
  onLoad?: () => void;
  onError?: (err: Error) => void;
  /** Fired when a “scheduled” event is detected via postMessage */
  onSchedule?: (payload: unknown) => void;
  /** Optional analytics hook */
  onTrack?: SchedulerTrackFn;

  /** Networking / timeout */
  /** Load timeout in ms before showing an error. Default: 12000 */
  loadTimeoutMs?: number;
  /** Retry/backoff configuration */
  retry?: RetryConfig;
}

/**
 * Optional imperative handle exposed by the component via ref.
 */
export interface SchedulerEmbedHandle {
  /** Programmatically reload the embed (resets retry counter). */
  reload: () => void;
  /** Access the underlying iframe element, if mounted. */
  getIframe: () => HTMLIFrameElement | null;
}
