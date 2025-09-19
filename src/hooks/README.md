Shared UI Hooks
A collection of reusable React hooks for building modern, interactive, and performant web applications.
Overview
The shared-ui/hooks directory provides a modular set of React hooks organized into four categories: analytics, core, subscription, and ui. These hooks address common needs in web development, such as analytics tracking, clipboard operations, subscription management, and UI patterns like pagination and modals. Designed with TypeScript for type safety, these hooks are optimized for use in Next.js applications but can be adapted for other React environments.
Directory Structure
The hooks are organized into the following subdirectories:

analytics: Hooks for tracking events and sharing URLs.
core: Fundamental utilities for clipboard, debouncing, device detection, viewport tracking, and theming.
subscription: Hooks for managing subscription status.
ui: Hooks for interactive UI patterns like filtering, modals, pagination, and table of contents.

Each subdirectory contains:

An index.js file for exporting hooks.
A README.md file with detailed documentation.
Individual hook files (TypeScript, *.ts or *.tsx).

Available Hooks



Category
Hook
Description



Analytics
useAnalytics
Tracks events across multiple analytics providers (Plausible, Google Analytics, PostHog).


Analytics
useShareUrl
Provides tools for sharing URLs, including clipboard copying and Web Share API integration.


Core
useClipboard
Manages clipboard copy and read operations with success state feedback.


Core
useDebounce
Delays value updates to prevent excessive renders or API calls.


Core
useDeviceType
Detects device type, screen size, and orientation.


Core
useInView
Tracks when an element enters or exits the viewport using IntersectionObserver.


Core
useTheme
Manages light/dark theme preferences with system preference support.


Subscription
useSubscriptionStatus
Fetches and manages user subscription status from an API endpoint.


UI
useFilters
Manages filter state with URL sync and localStorage persistence.


UI
useModal
Controls modal state and visibility using a context-based approach.


UI
usePagination
Handles pagination for offset-based and infinite scroll patterns.


UI
useScrollRestoration
Preserves and restores scroll position during navigation.


UI
useScrollSpy
Tracks active headings based on scroll position.


UI
useTOC
Generates and manages a table of contents from document headings.


Installation
The hooks are part of the shared-ui package and do not require separate installation. However, some hooks have external dependencies:

swr: Required for useSubscriptionStatus. Install via:npm install swr


Next.js: Many hooks (e.g., useFilters, useScrollRestoration) leverage Next.js APIs (useRouter, usePathname). Ensure your project uses Next.js if these hooks are needed.
Browser APIs: Hooks like useClipboard, useInView, and useTOC rely on browser APIs (e.g., navigator.clipboard, IntersectionObserver). Polyfills may be required for older browsers.

To use the hooks, import them from the shared-ui/hooks directory:
import { useClipboard, useAnalytics } from '@/shared-ui/hooks';

Usage Examples
Tracking Analytics Events
import { useAnalytics } from '@/shared-ui/hooks';

function VideoPlayer({ videoId, url }) {
  const { trackMediaEvent } = useAnalytics();

  const handlePlay = () => {
    trackMediaEvent({
      action: 'play',
      mediaType: 'video',
      url,
      metadata: { videoId }
    });
  };

  return (
    <video onPlay={handlePlay} src={url} controls />
  );
}

Copying to Clipboard
import { useClipboard } from '@/shared-ui/hooks';

function CopyButton({ text }) {
  const { copy, isCopied } = useClipboard();

  return (
    <button onClick={() => copy(text)}>
      {isCopied ? 'Copied!' : 'Copy to Clipboard'}
    </button>
  );
}

Checking Subscription Status
import { useSubscriptionStatus } from '@/shared-ui/hooks';

function PremiumContent() {
  const { isLoading, isSubscribed, isError } = useSubscriptionStatus();

  if (isLoading) return <div>Loading...</div>;
  if (isError || !isSubscribed) {
    return <div>Subscribe to access premium content!</div>;
  }

  return <div>Exclusive Premium Content</div>;
}

Filtering a Product List
import { useFilters } from '@/shared-ui/hooks';

function ProductList({ products }) {
  const { filters, isActive, toggleFilter, getFilteredResults } = useFilters({
    initialFilters: { category: [] },
    syncToQueryParams: true,
    filterFn: (product, filters) => {
      return filters.category.length ? filters.category.includes(product.category) : true;
    }
  });

  const filteredProducts = getFilteredResults(products);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isActive('category', 'electronics')}
          onChange={() => toggleFilter('category', 'electronics')}
        />
        Electronics
      </label>
      <div>
        {filteredProducts.map(product => (
          <div key={product.id}>{product.name}</div>
        ))}
      </div>
    </div>
  );
}

Managing a Modal
import { useModal, ModalProvider } from '@/shared-ui/hooks';

function App() {
  return (
    <ModalProvider>
      <ModalManager />
      <Content />
    </ModalProvider>
  );
}

function ModalManager() {
  const { modalType, modalProps, isOpen, closeModal } = useModal();
  if (!isOpen || !modalType) return null;

  const ModalComponent = modals[modalType];
  return (
    <div className="modal">
      <ModalComponent {...modalProps} onClose={closeModal} />
    </div>
  );
}

function Content() {
  const { openModal } = useModal();
  return (
    <button onClick={() => openModal('login', { redirect: '/dashboard' })}>
      Open Login Modal
    </button>
  );
}

Best Practices
General

Type Safety: Leverage TypeScript types provided by the hooks to ensure robust code.
Error Handling: Always handle loading and error states, especially for hooks like useSubscriptionStatus and usePagination.
SSR Considerations: For Next.js applications, use server-side rendering strategies (e.g., getServerSideProps) to pre-fetch data for hooks like useSubscriptionStatus.

Analytics

Configure analytics providers (Plausible, Google Analytics, PostHog) before using useAnalytics.
Use consistent event schemas to ensure accurate tracking across providers.

Core

Provide user feedback for clipboard operations (useClipboard) and theme changes (useTheme).
Use appropriate debounce delays in useDebounce based on the use case (e.g., 300ms for search inputs, 100ms for resize handlers).

Subscription

Secure the /api/subscription-status endpoint with authentication and proper CORS settings.
Cache API responses using SWR to minimize network requests.

UI

Ensure accessibility for interactive elements (e.g., modals, TOC links) by adding ARIA attributes and keyboard navigation.
Optimize performance for useScrollSpy and useTOC on long pages by debouncing or throttling scroll events.

Troubleshooting
Hooks Not Working in SSR

Ensure the "use client" directive is respected in Next.js. For SSR, pre-fetch data or use default states.
Check for typeof window guards in hooks relying on browser APIs.

API Errors in useSubscriptionStatus

Verify the /api/subscription-status endpoint is accessible and returns { "subscribed": boolean }.
Check for CORS or authentication issues in the fetcher.

Performance Issues

For useScrollSpy or useTOC, reduce the number of observed elements or increase debounce delays.
In usePagination, ensure fetchFn is optimized to avoid excessive API calls.

Dependencies

swr: Required for useSubscriptionStatus.
Next.js: Optional but recommended for hooks like useFilters, useScrollRestoration, and useModal.
Browser APIs: Ensure polyfills for IntersectionObserver, navigator.clipboard, etc., in older browsers.

Notes

The hooks are designed for client-side rendering due to their reliance on browser APIs. For SSR, additional setup may be required.
Extend hooks like useSubscriptionStatus or useAnalytics to support additional features (e.g., subscription plans, custom event types) as needed.
Refer to individual README.md files in each subdirectory for detailed documentation and advanced usage.

