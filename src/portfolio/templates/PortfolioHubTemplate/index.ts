// /src/portfolio/templates/PortfolioHubTemplate/index.ts

// Component (default export)
export { default } from "./PortfolioHubTemplate";

// Types (explicit; zero `any`)
export type {
  PortfolioHubTemplateProps,
  HubSection,
  HubSectionVariant,
  HubMeta,
  HubFeatures,
  HubAnalyticsOptions,
  HeroButton,
} from "./PortfolioHubTemplate.types";

// Safe defaults (handy for callers)
export {
  DEFAULT_HUB_FEATURES,
  DEFAULT_HUB_ANALYTICS,
  DEFAULT_HUB_META,
} from "./PortfolioHubTemplate.types";

// If you later add a validator utility, re-export it here:
// export { validateHubTemplateProps } from "./utils/hubTemplateValidator";
