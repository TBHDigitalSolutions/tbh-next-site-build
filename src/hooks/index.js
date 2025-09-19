/**
 * Shared UI Hooks
 * 
 * This module re-exports all hooks from the analytics, core, subscription, and ui subdirectories.
 * 
 * @module shared-ui/hooks
 */

// Analytics hooks
export { default as useAnalytics } from './analytics/useAnalytics';
export { default as useShareUrl } from './analytics/useShareUrl';
export type { MediaEventAction, MediaEventProps, TrackEventProps } from './analytics/useAnalytics';
export type { UTMOptions, UseShareUrlResult } from './analytics/useShareUrl';

// Core hooks
export { default as useClipboard } from './core/useClipboard';
export { default as useDebounce } from './core/useDebounce';
export { default as useDeviceType } from './core/useDeviceType';
export { default as useInView } from './core/useInView';
export { default as useTheme } from './core/useTheme';
export type { UseClipboard } from './core/useClipboard';
export type { DeviceType } from './core/useDeviceType';

// Subscription hooks
export { default as useSubscriptionStatus } from './subscription/useSubscriptionStatus';

// UI hooks
export { default as useFilters } from './ui/useFilters';
export { default as useModal, ModalProvider } from './ui/useModal';
export { default as usePagination } from './ui/usePagination';
export { default as useScrollRestoration } from './ui/useScrollRestoration';
export { default as useScrollSpy } from './ui/useScrollSpy';
export { default as useTOC } from './ui/useTOC';
export type { ModalType, ModalContextType } from './ui/useModal';
export type { UsePaginationOptions, UsePagination } from './ui/usePagination';
export type { TOCItem, UseTOCResult } from './ui/useTOC';