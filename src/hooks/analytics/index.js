/**
 * Analytics Hooks
 * 
 * This module exports hooks related to analytics tracking and URL sharing.
 * These hooks provide a unified interface for tracking events across different
 * analytics providers and sharing functionality.
 * 
 * @module shared-ui/hooks/analytics
 */

export { default as useAnalytics } from './useAnalytics';
export { default as useShareUrl } from './useShareUrl';

// Type exports for TypeScript
export type { 
  MediaEventAction,
  MediaEventProps,
  TrackEventProps
} from './useAnalytics';

export type {
  UTMOptions,
  UseShareUrlResult
} from './useShareUrl';