Subscription Hooks
A collection of React hooks for managing subscription status in web applications.
Overview
The subscription hooks directory provides utilities for fetching and managing subscription-related data. These hooks are designed to integrate seamlessly with APIs to check user subscription status, making it easy to implement subscription-based features such as premium content access or paywalls.
Available Hooks



Hook
Description



useSubscriptionStatus
Fetches and manages the user's subscription status from an API endpoint


Installation
These hooks are part of the shared-ui package and do not require separate installation. However, they depend on the swr library for data fetching. Ensure swr is installed in your project:
npm install swr

Additionally, the useSubscriptionStatus hook assumes the presence of an API endpoint at /api/subscription-status that returns a JSON response with a subscribed boolean field.
API Reference
useSubscriptionStatus
function useSubscriptionStatus(): {
  isLoading: boolean;
  isSubscribed: boolean;
  isError: boolean;
};

Returns:

isLoading: true if the subscription status is being fetched, false otherwise.
isSubscribed: true if the user is subscribed, false otherwise or if data is not yet available.
isError: true if an error occurred while fetching the subscription status, false otherwise.

Dependencies:

Uses useSWR from the swr library for data fetching and caching.
Assumes an API endpoint at /api/subscription-status with the following response format:{ "subscribed": boolean }



Usage Examples
Displaying Subscription Status
import { useSubscriptionStatus } from '@/shared-ui/hooks/subscription';

function SubscriptionBanner() {
  const { isLoading, isSubscribed, isError } = useSubscriptionStatus();

  if (isLoading) {
    return <div>Loading subscription status...</div>;
  }

  if (isError) {
    return <div>Error fetching subscription status</div>;
  }

  return (
    <div className="subscription-banner">
      {isSubscribed ? (
        <p>Welcome, Premium Member!</p>
      ) : (
        <p>Upgrade to Premium for exclusive content!</p>
      )}
    </div>
  );
}

Conditional Rendering for Premium Content
import { useSubscriptionStatus } from '@/shared-ui/hooks/subscription';

function PremiumContent() {
  const { isLoading, isSubscribed, isError } = useSubscriptionStatus();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !isSubscribed) {
    return (
      <div className="paywall">
        <p>This content is exclusive to Premium members.</p>
        <a href="/subscribe">Subscribe Now</a>
      </div>
    );
  }

  return (
    <div className="premium-content">
      <h2>Exclusive Premium Content</h2>
      <p>Enjoy your premium benefits!</p>
    </div>
  );
}

Best Practices
API Endpoint

Ensure the /api/subscription-status endpoint is secure and requires authentication (e.g., includes credentials via credentials: "include").
The endpoint should return a consistent response format: { "subscribed": boolean }.
Handle rate-limiting and caching appropriately to avoid excessive API calls.

Error Handling

Display user-friendly error messages when isError is true.
Consider implementing a retry mechanism for failed requests (SWR provides built-in retry options).

Loading States

Always provide feedback during loading states to improve user experience.
Use skeleton screens or placeholders for content that depends on subscription status.

SSR Considerations

The useSubscriptionStatus hook is client-side only due to its dependency on useSWR. For server-side rendering (SSR) with Next.js, consider pre-fetching subscription status using getServerSideProps or getStaticProps and passing it as props.

Troubleshooting
Common Issues
API Request Fails

Verify that the /api/subscription-status endpoint is accessible and returns the expected response format.
Check that credentials are properly included if authentication is required (credentials: "include").
Ensure the network request is not blocked by CORS or other security policies.

Loading State Persists

Confirm that the API endpoint responds promptly. Slow responses may cause prolonged loading states.
Check for errors in the browser console that might indicate issues with the fetcher.

Subscription Status Not Updating

Ensure SWR’s cache is not stale. You can trigger a revalidation by calling mutate from useSWR.
Verify that the API endpoint reflects the latest subscription status.

Dependencies

swr: Used for data fetching and caching. Install via npm install swr.
Next.js (optional): If using in a Next.js application, ensure compatibility with client-side rendering.

Notes

The useSubscriptionStatus hook is designed for simplicity but can be extended to support additional subscription metadata (e.g., plan type, expiration date) by modifying the SubscriptionResponse interface.
For advanced use cases, consider integrating with a state management library or additional SWR configuration options (e.g., revalidation, deduping).

