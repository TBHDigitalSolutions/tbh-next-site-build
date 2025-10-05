// src/data/packages/index.ts
/**
 * AUTO-GENERATED data façade for package pages.
 * Exposes BUNDLES, getBundleBySlug, and ADDONS_BY_ID.
 * This file is intentionally tiny; it only re-exports from the manifest.
 */
/* eslint-disable */
import { REGISTRY as __REGISTRY } from "@/packages/registry/manifest";

// Array of validated package objects (friendly shape used by pages and templates)
export const BUNDLES = [...__REGISTRY];

// Convenience: lookup by slug
export function getBundleBySlug(slug: string) {
  return BUNDLES.find((b) => b.slug === slug);
}

// Optional add-ons map. If you don't maintain add-ons yet, keep it empty.
export const ADDONS_BY_ID: Record<string, unknown> = {};
