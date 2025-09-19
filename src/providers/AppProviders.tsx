// shared-ui/providers/AppProviders.tsx

"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { MediaProvider } from "@/contexts/MediaContext";
// import { CookieConsentProvider } from "./CookieConsentProvider"; // Optional: Uncomment if using

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <MediaProvider>
        {/* <CookieConsentProvider> */}
        {children}
        {/* </CookieConsentProvider> */}
      </MediaProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
