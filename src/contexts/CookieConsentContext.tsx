// shared-ui/contexts/CookieConsentContext.tsx

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ConsentStatus = "granted" | "denied" | "unset";

interface CookieConsentContextProps {
  consent: ConsentStatus;
  setConsent: (status: ConsentStatus) => void;
  hasInteracted: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextProps | undefined>(undefined);

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsentState] = useState<ConsentStatus>("unset");
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load stored consent from localStorage
  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent") as ConsentStatus | null;
    if (storedConsent === "granted" || storedConsent === "denied") {
      setConsentState(storedConsent);
      setHasInteracted(true);
    }
  }, []);

  // Update and persist user consent
  const setConsent = (status: ConsentStatus) => {
    setConsentState(status);
    setHasInteracted(true);
    try {
      localStorage.setItem("cookieConsent", status);
    } catch (error) {
      console.warn("Failed to save cookie consent:", error);
    }
  };

  return (
    <CookieConsentContext.Provider value={{ consent, setConsent, hasInteracted }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = (): CookieConsentContextProps => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
};
