// shared-ui/providers/index.ts

export { default as AppProviders } from "./AppProviders";
export { default as ThemeProvider } from "./ThemeProvider";
export { default as CookieConsentProvider } from "./CookieConsentProvider";

// MediaContext is defined in /contexts, but exported here for provider composition
export { MediaProvider } from "../contexts/MediaContext";
