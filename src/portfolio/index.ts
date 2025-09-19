// /src/portfolio/index.ts
export * as PortfolioTypes from "./lib/types";
export * from "./lib/adapters";
export { default as PortfolioSection } from "./sections/PortfolioSection/PortfolioSection";
export { default as PortfolioHubTemplate } from "./templates/PortfolioHubTemplate";
export { default as PortfolioCategoryTemplate } from "./templates/PortfolioCategoryTemplate";
// Optional: re-export viewers if you want public access
export { StandardPortfolioGallery } from "./components/StandardPortfolioGallery/StandardPortfolioGallery";
// /src/portfolio/index.ts - Corrected barrel exports
export * as PortfolioTypes from "./lib/types";
export * from "./lib/adapters";

// Main orchestrator and templates
export { default as PortfolioSection } from "./sections/PortfolioSection/PortfolioSection";
export { default as PortfolioHubTemplate } from "./templates/PortfolioHubTemplate";
export { default as PortfolioCategoryTemplate } from "./templates/PortfolioCategoryTemplate";

// Section components
export { default as PortfolioOverviewSection } from "./sections/PortfolioOverviewSection";
export { default as PortfolioStatsSection } from "./sections/PortfolioStatsSection";

// Individual gallery components (if needed externally)
export { default as StandardPortfolioGallery } from "./components/StandardPortfolioGallery";
export { default as VideoPortfolioGallery } from "./components/VideoPortfolioGallery";
export { default as PortfolioDemo } from "./components/PortfolioDemo/PortfolioDemoClient";

// Modal components
export { default as PortfolioModal } from "./components/PortfolioModal";
export { default as UniversalPortfolioModal } from "./components/UniversalPortfolioModal";
export { default as ModalShell } from "./components/ModalShell/ModalShell";

// Media viewers
export * from "./components/mediaViewers";

// Hub client (for advanced usage)
export { default as PortfolioHubClient } from "./components/PortfolioHubClient";