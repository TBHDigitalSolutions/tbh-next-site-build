// shared-ui/providers/CookieConsentProvider.tsx

"use client";

import { ReactNode } from "react";
import { CookieConsentProvider as BaseProvider } from "@/contexts/CookieConsentContext";

/**
 * 🔐 CookieConsentProvider
 * Wraps your app in cookie consent logic, providing access to:
 * - consent status ("granted", "denied", "unset")
 * - interaction state
 * - setConsent handler
 *
 * This component is meant to be used in a unified AppProviders setup.
 */
const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  return <BaseProvider>{children}</BaseProvider>;
};

export default CookieConsentProvider;
