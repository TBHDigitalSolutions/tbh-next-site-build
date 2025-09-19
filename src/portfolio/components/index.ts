// ===================================================================
// /src/components/portfolio/index.ts
// ===================================================================
// Single entrypoint for the Portfolio component suite.
// - Re-exports presentational components (no data imports).
// - Re-exports types + adapters per module.
// - Keeps validation colocated within each module namespace.
// - Tree-shaking friendly, no default export at the top level.
// ===================================================================

// -------------------------------------------------------------------
// Shared presentational types (safe to import across components)
// -------------------------------------------------------------------
export * from "./types";

// -------------------------------------------------------------------
// Orchestrator (Hub) – thin client + adapters
// -------------------------------------------------------------------
export { default as PortfolioHubClient } from "./PortfolioHubClient";
export * from "./PortfolioHubClient.types";
export {
  // Hub adapters / helpers
  makePortfolioHubClientProps,
  performGlobalSearch,
  toCategoryMeta,
  toCategoryHighlight,
  buildCategoryHighlights,
} from "./adapters";

// -------------------------------------------------------------------
// ModalShell (generic modal container used by portfolio modals)
// -------------------------------------------------------------------
export { default as ModalShell } from "./ModalShell/ModalShell";
export type { ModalShellProps, ModalShellSize } from "./ModalShell/ModalShell.types";

// -------------------------------------------------------------------
// Media Viewers (image/video/interactive/pdf) + registry
// -------------------------------------------------------------------
export * from "./mediaViewers"; // { ImageViewer, VideoViewer, InteractiveViewer, PDFViewer, getMediaViewer, mediaViewerRegistry, ViewerProps }

// -------------------------------------------------------------------
// Portfolio Modal (single item modal)
// -------------------------------------------------------------------
export * from "./PortfolioModal"; // { PortfolioModal, adapters, types, validator }

// -------------------------------------------------------------------
// Universal Portfolio Modal (domain-wide, mixed media)
// -------------------------------------------------------------------
export * from "./UniversalPortfolioModal"; // { UniversalPortfolioModal, adapters, types, validator }

// -------------------------------------------------------------------
// Overview Section (text + stats composition)
// -------------------------------------------------------------------
export * from "./PortfolioOverviewSection"; // { PortfolioOverviewSection, adapters, types, validator }

// -------------------------------------------------------------------
// Overview Text (copy block)
// -------------------------------------------------------------------
export * from "./PortfolioOverviewText"; // { PortfolioOverviewText, adapters, types, validator }

// -------------------------------------------------------------------
// Stats Section (computed stats display)
// -------------------------------------------------------------------
export * from "./PortfolioStatsSection"; // { PortfolioStatsSection, adapters, types }

// -------------------------------------------------------------------
// Standard Gallery (cards/grid)
// -------------------------------------------------------------------
export * from "./StandardPortfolioGallery"; // { StandardPortfolioGallery, adapters, types, validator }
