// shared-ui/hooks/analytics/useShareUrl.ts
"use client";

import { useEffect, useState } from "react";

interface UTMOptions {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

interface UseShareUrlResult {
  url: string;
  copyToClipboard: () => Promise<boolean>;
  shareNative: (options: ShareData) => Promise<void>;
  buildUrlWithUTM: (params: UTMOptions) => string;
}

/**
 * useShareUrl
 *
 * Provides tools for sharing the current page URL, including:
 * - Native Web Share API support
 * - Copy-to-clipboard function
 * - UTM parameter builder
 *
 * @returns { url, copyToClipboard, shareNative, buildUrlWithUTM }
 */
const useShareUrl = (): UseShareUrlResult => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  // 📋 Copy to clipboard utility
  const copyToClipboard = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  };

  // 📱 Web Share API integration
  const shareNative = async (options: ShareData): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share(options);
      } catch (err) {
        console.warn("Web Share API failed:", err);
      }
    } else {
      console.warn("Web Share API not supported in this browser.");
    }
  };

  // 🔗 UTM builder (basic)
  const buildUrlWithUTM = (params: UTMOptions = {}): string => {
    if (!url) return "";

    const urlObj = new URL(url);

    if (params.source) urlObj.searchParams.set("utm_source", params.source);
    if (params.medium) urlObj.searchParams.set("utm_medium", params.medium);
    if (params.campaign) urlObj.searchParams.set("utm_campaign", params.campaign);
    if (params.content) urlObj.searchParams.set("utm_content", params.content);
    if (params.term) urlObj.searchParams.set("utm_term", params.term);

    return urlObj.toString();
  };

  return {
    url,
    copyToClipboard,
    shareNative,
    buildUrlWithUTM,
  };
};

export default useShareUrl;
