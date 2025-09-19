// /src/portfolio/lib/registry.ts
import type { MediaType } from './types';

/**
 * Media viewer registry for dynamic imports
 */
export const mediaViewerRegistry = {
  image: () => import('../components/mediaViewers/ImageViewer'),
  video: () => import('../components/mediaViewers/VideoViewer'),  
  interactive: () => import('../components/mediaViewers/InteractiveViewer'),
  pdf: () => import('../components/mediaViewers/PDFViewer')
} as const;

/**
 * Get appropriate media viewer component
 */
export async function getMediaViewer(type: MediaType) {
  const loader = mediaViewerRegistry[type];
  if (!loader) {
    console.warn(`No media viewer found for type: ${type}`);
    return null;
  }
  
  try {
    const module = await loader();
    return module.default;
  } catch (error) {
    console.error(`Failed to load media viewer for type: ${type}`, error);
    return null;
  }
}

/**
 * Portfolio component variant registry
 */
export const portfolioComponentRegistry = {
  gallery: () => import('../components/StandardPortfolioGallery'),
  video: () => import('../components/VideoPortfolioGallery'),
  interactive: () => import('../components/PortfolioDemo')
} as const;

---

import type { PortfolioVariant, MediaType } from './types';

/**
 * Component registry for dynamic loading
 */
export const portfolioComponentRegistry = {
  gallery: () => import('../components/StandardPortfolioGallery'),
  video: () => import('../components/VideoPortfolioGallery'),
  interactive: () => import('../components/PortfolioDemo/PortfolioDemoClient')
} as const;

/**
 * Media viewer registry
 */
export const mediaViewerRegistry = {
  image: () => import('../components/mediaViewers/ImageViewer'),
  video: () => import('../components/mediaViewers/VideoViewer'),
  interactive: () => import('../components/mediaViewers/InteractiveViewer'),
  pdf: () => import('../components/mediaViewers/PDFViewer')
} as const;

/**
 * Get portfolio component dynamically
 */
export async function getPortfolioComponent(variant: PortfolioVariant) {
  try {
    const module = await portfolioComponentRegistry[variant]();
    return module.default;
  } catch (error) {
    console.error(`Failed to load portfolio component: ${variant}`, error);
    return null;
  }
}

/**
 * Get media viewer component dynamically  
 */
export async function getMediaViewer(type: MediaType) {
  try {
    const module = await mediaViewerRegistry[type]();
    return module.default;
  } catch (error) {
    console.error(`Failed to load media viewer: ${type}`, error);
    return null;
  }
}