/**
 * Packages Library — Public Barrel
 * =============================================================================
 * A single import surface for the packages module. This file re-exports
 * the stable public API: schemas (SSOT), types, mappers, adapters,
 * utilities (pricing / cta / jsonld), and optional helpers.
 *
 * Example usage:
 *   import {
 *     // SSOT types/schemas
 *     PackageSchema,
 *     type Package,
 *     type Money,
 *
 *     // Pricing utilities
 *     startingAtLabel,
 *     formatMoney,
 *
 *     // CTA + routes
 *     CTA_LABEL,
 *     ROUTES,
 *
 *     // Adapters / mappers
 *     toPackageCard,
 *     toCard,
 *     toOverview,
 *     toExtras,
 *
 *     // JSON-LD
 *     buildServiceJsonLd,
 *     emitServiceJsonLd,
 *   } from "@/packages/lib";
 */

// ---------------------------------------------------------------------------
// SSOT: runtime schemas & runtime types
// ---------------------------------------------------------------------------
export * from "./package-schema";
export * from "./package-types";

// ---------------------------------------------------------------------------
// Authoring / narrative (optional public)
// ---------------------------------------------------------------------------
export * from "./authoring-rules";
export * from "./narrative";

// ---------------------------------------------------------------------------
// Pricing utilities (single source of truth for price formatting/predicates)
// ---------------------------------------------------------------------------
export * from "./pricing";

// ---------------------------------------------------------------------------
// Data loading (I/O + validation) — if your project exposes this publicly
// ---------------------------------------------------------------------------
export * from "./loader";

// ---------------------------------------------------------------------------
// Copy/CTA policy & routes (centralized labels/links used by UI)
// If your code uses `ROUTES`, `CTA_LABEL`, etc., they should be exported here.
// ---------------------------------------------------------------------------
export * from "./copy";
export * from "./cta";

// ---------------------------------------------------------------------------
// Band (variant resolver for price bands) — optional
// ---------------------------------------------------------------------------
export * from "./band";

// ---------------------------------------------------------------------------
// View-model adapters (domain → UI props) — thin, UI-agnostic
// ---------------------------------------------------------------------------
export * from "./adapters";

// ---------------------------------------------------------------------------
// UI mappers (structured outputs consumed by components/sections)
// ---------------------------------------------------------------------------
export * from "./mappers/to-card";
export * from "./mappers/to-overview";
export * from "./mappers/to-extras";

// ---------------------------------------------------------------------------
// Registry mappers (CTA builders, includes-table fallback, etc.)
// ---------------------------------------------------------------------------
export * from "./registry/mappers";

// ---------------------------------------------------------------------------
// SEO: JSON-LD builders + emit helper for React templates
// ---------------------------------------------------------------------------
export * from "./seo/jsonld";
