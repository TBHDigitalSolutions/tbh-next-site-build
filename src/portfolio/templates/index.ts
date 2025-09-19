// /src/portfolio/templates/index.ts

/* -------------------------------------------------------------------------- */
/* Portfolio Hub Template                                                      */
/* -------------------------------------------------------------------------- */

export { default as PortfolioHubTemplate } from "./PortfolioHubTemplate";
export type {
  PortfolioHubTemplateProps,
  HubSection,
  HubSectionVariant,
  HubMeta,
  HubFeatures,
  HubAnalyticsOptions,
  HeroButton,
} from "./PortfolioHubTemplate";
export {
  DEFAULT_HUB_FEATURES,
  DEFAULT_HUB_ANALYTICS,
  DEFAULT_HUB_META,
} from "./PortfolioHubTemplate";
// Optional future utility re-export:
// export { validateHubTemplateProps } from "./PortfolioHubTemplate/utils/hubTemplateValidator";

/* -------------------------------------------------------------------------- */
/* Portfolio Category Template                                                 */
/* -------------------------------------------------------------------------- */

export { default as PortfolioCategoryTemplate } from "./PortfolioCategoryTemplate";
export type {
  PortfolioCategoryTemplateProps,
  CategoryPageData,
  CategoryLayoutOptions,
  CategoryAnalyticsOptions,
  CategoryMetrics,
  ToolItem,
  CaseStudy,
  PackageRef,
} from "./PortfolioCategoryTemplate";
export {
  DEFAULT_CATEGORY_LAYOUT,
  DEFAULT_CATEGORY_ANALYTICS,
} from "./PortfolioCategoryTemplate";
// Optional future utility re-export:
// export { validateCategoryTemplateProps } from "./PortfolioCategoryTemplate/utils/categoryTemplateValidator";
