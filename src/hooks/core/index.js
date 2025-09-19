/**
 * Core Hooks
 * 
 * This module exports fundamental React hooks that provide essential
 * functionality for building modern web applications.
 * 
 * @module shared-ui/hooks/core
 */

// Hook exports
export { default as useClipboard } from './useClipboard';
export { default as useDebounce } from './useDebounce';
export { default as useDeviceType } from './useDeviceType';
export { default as useInView } from './useInView';
export { default as useTheme } from './useTheme';

// Type exports
export type { UseClipboard } from './useClipboard';
export type { DeviceType } from './useDeviceType';