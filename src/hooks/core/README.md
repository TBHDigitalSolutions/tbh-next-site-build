# Core Hooks

A collection of fundamental React hooks that provide essential functionality for building modern web applications.

## Overview

The core hooks directory contains basic, widely-used hooks that serve as building blocks for higher-level components and features. These hooks handle common needs like clipboard operations, debouncing, device detection, viewport tracking, and theming.

## Available Hooks

| Hook | Description |
|------|-------------|
| `useClipboard` | Manages clipboard operations with success state feedback |
| `useDebounce` | Delays the update of a value until a specified time has passed |
| `useDeviceType` | Detects device type, screen size, and orientation |
| `useInView` | Tracks when an element enters or exits the viewport |
| `useTheme` | Manages light/dark theme with system preference support |

## Installation

These hooks are part of the shared-ui package and don't need separate installation. However, some hooks may have dependencies on browser APIs that should be properly polyfilled for older browsers.

## API Reference

### useClipboard

```typescript
function useClipboard(resetAfterMs?: number): {
  copy: (text: string) => Promise<boolean>;
  read: () => Promise<string | null>;
  isCopied: boolean;
  reset: () => void;
};
```

**Parameters:**
- `resetAfterMs` (optional): Time in milliseconds after which the `isCopied` state resets (default: 3000)

**Returns:**
- `copy`: Function to copy text to clipboard
- `read`: Function to read text from clipboard
- `isCopied`: Whether the last copy operation succeeded
- `reset`: Function to manually reset the copied state

### useDebounce

```typescript
function useDebounce<T>(
  value: T,
  delay?: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
): T;
```

**Parameters:**
- `value`: The value to debounce
- `delay` (optional): Delay in milliseconds (default: 300)
- `options` (optional):
  - `leading`: If true, update value immediately on first change
  - `trailing`: If true, update value after the delay on last change

**Returns:**
- The debounced value

### useDeviceType

```typescript
function useDeviceType(debounceMs?: number): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  orientation: "portrait" | "landscape";
  isTouchDevice: boolean;
};
```

**Parameters:**
- `debounceMs` (optional): Debounce time for resize events in milliseconds (default: 100)

**Returns:**
- Device information object containing:
  - `isMobile`: True if screen width is less than 768px
  - `isTablet`: True if screen width is between 768px and 1024px
  - `isDesktop`: True if screen width is greater than 1024px
  - `breakpoint`: Current breakpoint according to Tailwind CSS breakpoints
  - `orientation`: Current device orientation
  - `isTouchDevice`: Whether the device supports touch input

### useInView

```typescript
function useInView(options?: IntersectionObserverInit): {
  ref: React.RefObject<any>;
  isInView: boolean;
  hasBeenInView: boolean;
};
```

**Parameters:**
- `options` (optional): IntersectionObserver options object

**Returns:**
- `ref`: Ref to attach to the element you want to observe
- `isInView`: Whether the element is currently in the viewport
- `hasBeenInView`: Whether the element has ever been in the viewport

### useTheme

```typescript
function useTheme(): {
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
};
```

**Returns:**
- `theme`: Current theme preference ("light", "dark", or "system")
- `resolvedTheme`: Actual applied theme ("light" or "dark")
- `setTheme`: Function to set theme preference
- `toggleTheme`: Function to toggle between light and dark themes

## Usage Examples

### Clipboard Operations

```tsx
import { useClipboard } from '@/shared-ui/hooks/core';

function CopyButton({ text }) {
  const { copy, isCopied } = useClipboard();
  
  return (
    <button onClick={() => copy(text)}>
      {isCopied ? 'Copied!' : 'Copy to Clipboard'}
    </button>
  );
}
```

### Search Input with Debounce

```tsx
import { useState } from 'react';
import { useDebounce } from '@/shared-ui/hooks/core';

function SearchInput() {
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 500);
  
  // This effect will only run when the debounced value changes
  useEffect(() => {
    // Perform search with debounced value
    if (debouncedValue) {
      performSearch(debouncedValue);
    }
  }, [debouncedValue]);
  
  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Responsive Component with Device Detection

```tsx
import { useDeviceType } from '@/shared-ui/hooks/core';

function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop, orientation } = useDeviceType();
  
  return (
    <div>
      {isMobile && (
        <div className="mobile-layout">Mobile Content</div>
      )}
      
      {isTablet && (
        <div className="tablet-layout">Tablet Content</div>
      )}
      
      {isDesktop && (
        <div className="desktop-layout">Desktop Content</div>
      )}
      
      <div>Current orientation: {orientation}</div>
    </div>
  );
}
```

### Lazy Loading with InView

```tsx
import { useInView } from '@/shared-ui/hooks/core';

function LazyImage({ src, alt }) {
  const { ref, isInView } = useInView({
    threshold: 0.1, // 10% of the element is visible
    rootMargin: '100px', // Start loading 100px before the element is visible
  });
  
  return (
    <div ref={ref}>
      {isInView ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="placeholder" />
      )}
    </div>
  );
}
```

### Theme Toggle Button

```tsx
import { useTheme } from '@/shared-ui/hooks/core';

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {resolvedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
```

## Best Practices

### useClipboard

- Always provide user feedback when clipboard operations occur
- Handle errors gracefully if clipboard API is not available
- Consider accessibility implications for copy/paste operations

### useDebounce

- Use appropriate delay times based on the use case:
  - Search inputs: 300-500ms
  - Form validation: 500-800ms
  - Resize handlers: 100-200ms
- Use the leading option for immediate first-input feedback
- Consider using a shorter delay on faster devices

### useDeviceType

- Don't assume device capabilities based solely on screen size
- Use feature detection (`isTouchDevice`) rather than device detection where possible
- Consider server-side rendering implications

### useInView

- Use appropriate thresholds for your use case:
  - Lazy loading images: 0-0.1
  - Animations: 0.1-0.2
  - Content visibility: 0.5-1.0
- Add sufficient rootMargin for preloading/buffering
- Handle server-side rendering properly

### useTheme

- Ensure proper default themes for first-time visitors
- Apply theme changes immediately for better UX
- Use semantic color variables rather than hardcoded light/dark values
- Respect user system preferences when possible