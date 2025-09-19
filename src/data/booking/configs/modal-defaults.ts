// src/data/booking/configs/modal-defaults.ts
// Central modal defaults for /book (tokens + a11y + responsive-friendly)

export type CanonicalService =
  | 'content-production-services'
  | 'lead-generation-services'
  | 'marketing-services'
  | 'seo-services'
  | 'video-production-services'
  | 'web-development-services';

export type ModalTheme = 'light' | 'dark';
export type ModalVariant = 'modal' | 'drawer';

export interface BookingModalOptions {
  service?: CanonicalService;
  theme: ModalTheme;
  variant: ModalVariant;
  prefill?: Record<string, unknown>;
}

export interface ModalBehavior {
  closeOnOverlayClick: boolean;
  closeOnEscapeKey: boolean;
  preventDocumentScroll: boolean;
  trapFocus: boolean;
  autoFocusFirst: boolean;
  persistOnRouteChange: boolean;
  animationMs: number;
}

export const DEFAULT_MODAL_BEHAVIOR: ModalBehavior = {
  closeOnOverlayClick: true,
  closeOnEscapeKey: true,
  preventDocumentScroll: true,
  trapFocus: true,
  autoFocusFirst: true,
  persistOnRouteChange: false,
  animationMs: 220,
};

export interface ModalLayout {
  // Use tokens + clamp for responsive sizing
  maxWidth: string;
  maxHeight: string;
  minWidth: string;
  minHeight: string;
  padding: string;
  borderRadius: string;
  zIndexVar: string;
  position: 'center' | 'top' | 'bottom';
}

export const DEFAULT_MODAL_LAYOUT: ModalLayout = {
  maxWidth: 'min(900px, 96vw)',
  maxHeight: 'min(90vh, 100svh)',
  minWidth: '320px',
  minHeight: '360px',
  padding: 'clamp(16px, 2.4vw, 24px)',
  borderRadius: 'var(--radius-2xl, 16px)',
  zIndexVar: 'var(--z-index-modal, 1000)',
  position: 'center',
};

export interface ModalThemeTokens {
  bg: string;
  text: string;
  overlay: string;
  border: string;
  shadow: string;
  primary: string;
  danger: string;
  success: string;
}

export const LIGHT_THEME: ModalThemeTokens = {
  bg: 'var(--bg-surface)',
  text: 'var(--text-primary)',
  overlay: 'color-mix(in oklab, black 55%, transparent)',
  border: 'var(--border-subtle)',
  shadow: 'var(--shadow-lg)',
  primary: 'var(--brand-blue)',
  danger: 'var(--danger)',
  success: 'var(--success)',
};

export const DARK_THEME: ModalThemeTokens = {
  bg: 'var(--bg-elevated)',
  text: 'var(--text-primary)',
  overlay: 'color-mix(in oklab, black 70%, transparent)',
  border: 'color-mix(in oklab, var(--border-subtle) 60%, transparent)',
  shadow: 'var(--shadow-lg)',
  primary: 'var(--brand-blue)',
  danger: 'var(--danger)',
  success: 'var(--success)',
};

export const SERVICE_MODAL_DEFAULTS: Record<CanonicalService, Partial<BookingModalOptions>> = {
  'web-development-services': { theme: 'light', variant: 'modal', prefill: { notes: 'Web development' } },
  'video-production-services': { theme: 'light', variant: 'modal', prefill: { notes: 'Video production' } },
  'seo-services': { theme: 'light', variant: 'modal', prefill: { notes: 'SEO' } },
  'marketing-services': { theme: 'light', variant: 'modal', prefill: { notes: 'Marketing' } },
  'lead-generation-services': { theme: 'light', variant: 'modal', prefill: { notes: 'Lead generation' } },
  'content-production-services': { theme: 'light', variant: 'modal', prefill: { notes: 'Content production' } },
};

export const INITIAL_MODAL_STATE = {
  isOpen: false,
  step: 'service-selection' as
    | 'service-selection'
    | 'intake-form'
    | 'calendar'
    | 'confirmation'
    | 'success'
    | 'error',
  loading: false,
  error: undefined as string | undefined,
};

export const MODAL_ANIMATIONS = {
  fadeScale: {
    in: { opacity: [0, 1], transform: ['scale(.96)', 'scale(1)'], duration: 220 },
    out: { opacity: [1, 0], transform: ['scale(1)', 'scale(.96)'], duration: 180 },
  },
  slideUp: {
    in: { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'], duration: 240 },
    out: { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-8px)'], duration: 180 },
  },
} as const;

export const MODAL_A11Y = {
  aria: {
    modal: 'Booking modal',
    close: 'Close booking modal',
    title: 'Booking dialog title',
    content: 'Booking dialog content',
  },
  focus: {
    initialSelector: '[data-autofocus]',
    returnFocus: true,
  },
};

export const MODAL_ERRORS = {
  PROVIDER_UNAVAILABLE: 'The booking system is temporarily unavailable. Please try again later.',
  CALENDAR_LOAD_ERROR: 'Unable to load availability. Please refresh.',
  VALIDATION_ERROR: 'Please check the required fields and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

export function getThemeTokens(theme: ModalTheme): ModalThemeTokens {
  return theme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

export function createDefaultModalOptions(
  service?: CanonicalService,
  overrides?: Partial<BookingModalOptions>
): BookingModalOptions {
  const base: BookingModalOptions = { theme: 'light', variant: 'modal', service, prefill: {} };
  const svc = service ? SERVICE_MODAL_DEFAULTS[service] : {};
  return { ...base, ...svc, ...overrides };
}

export default {
  behavior: DEFAULT_MODAL_BEHAVIOR,
  layout: DEFAULT_MODAL_LAYOUT,
  themes: { light: LIGHT_THEME, dark: DARK_THEME },
  createDefaultModalOptions,
  serviceDefaults: SERVICE_MODAL_DEFAULTS,
  a11y: MODAL_A11Y,
  animations: MODAL_ANIMATIONS,
  errors: MODAL_ERRORS,
};
