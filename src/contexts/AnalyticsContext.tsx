// shared-ui/contexts/AnalyticsContext.tsx

"use client";

import React, { createContext, useContext } from "react";

type AnalyticsProvider = "plausible" | "gtag" | "posthog";

interface AnalyticsContextValue {
  provider: AnalyticsProvider;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  provider: "plausible", // default fallback
});

export const AnalyticsProvider = ({
  children,
  provider = "plausible",
}: {
  children: React.ReactNode;
  provider?: AnalyticsProvider;
}) => {
  return (
    <AnalyticsContext.Provider value={{ provider }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => useContext(AnalyticsContext);
