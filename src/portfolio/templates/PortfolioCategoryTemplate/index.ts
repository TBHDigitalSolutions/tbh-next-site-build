// /src/portfolio/templates/PortfolioCategoryTemplate/index.ts

// Component (default)
export { default } from "./PortfolioCategoryTemplate";

// Types (explicit, no `any`)
export type {
  PortfolioCategoryTemplateProps,
  CategoryPageData,
  CategoryLayoutOptions,
  CategoryAnalyticsOptions,
  CategoryMetrics,
  ToolItem,
  CaseStudy,
  PackageRef,
} from "./PortfolioCategoryTemplate.types";

// Safe defaults (handy for callers)
export {
  DEFAULT_CATEGORY_LAYOUT,
  DEFAULT_CATEGORY_ANALYTICS,
} from "./PortfolioCategoryTemplate.types";

// If you later add a validator utility, re-export it here:
// export { validateCategoryTemplateProps } from "./utils/categoryTemplateValidator";
