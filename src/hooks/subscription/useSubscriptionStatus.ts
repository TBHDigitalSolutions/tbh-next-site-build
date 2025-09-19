// shared-ui/hooks/useSubscriptionStatus.ts
/**
 * useSubscriptionStatus
 *
 * Phase 1: This dev-mode implementation overrides real subscription checking
 * and always returns `isSubscribed: true`.
 *
 * Once login/accounts are implemented (Phase 2), you can restore the original SWR-based
 * logic to check against `/api/subscription-status`.
 *
 * @returns { isLoading, isSubscribed, isError }
 */

export function useSubscriptionStatus() {
  // ✅ DEV OVERRIDE — all users are treated as subscribed
  return {
    isLoading: false,
    isSubscribed: true,
    isError: false,
  };
}

/**
 * 🔒 ORIGINAL IMPLEMENTATION (preserved for Phase 2 rollout)
 * 
 * import useSWR from "swr";
 * 
 * interface SubscriptionResponse {
 *   subscribed: boolean;
 * }
 * 
 * // Simple JSON fetcher
 * const fetcher = (url: string) =>
 *   fetch(url, { credentials: "include" }).then((res) => {
 *     if (!res.ok) throw new Error("Network response was not ok");
 *     return res.json() as Promise<SubscriptionResponse>;
 *   });
 * 
 * export function useSubscriptionStatus() { 
 *   const { data, error } = useSWR<SubscriptionResponse>(
 *     "/api/subscription-status",
 *     fetcher
 *   );
 * 
 *   return {
 *     isLoading: !error && !data,
 *     isSubscribed: data?.subscribed ?? false,
 *     isError: !!error,
 *   };
 * }
 */
