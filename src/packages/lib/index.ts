/**
 * Packages Library — Public Barrel
 * =============================================================================
 * A single import surface for the packages module. This file re-exports
 * the **stable public API**: schemas (SSOT), registry loader (I/O + validation),
 * mappers (runtime → UI props), adapters (view-models), utilities (copy/CTA/pricing/jsonld),
 * and UI-only type aliases.
 *
 * Example usage:
 *   import {
 *     parsePackage,
 *     loadAllPackages,
 *     buildPackageCardProps,
 *     cardCtas,
 *     formatMoney,
 *     type PackageSchemaType,
 *   } from "@/packages/lib";
 */

// ---------------------------
// SSOT Schemas (runtime)
// ---------------------------
export * from "./package-schema";
export * from "./mdx-frontmatter-schema";

// ---------------------------
// Registry loader (I/O + validation)
// ---------------------------
export * from "./registry/loader";

// ---------------------------
// Mappers (runtime → UI props)
// ---------------------------
export * from "./mappers/package-mappers";

// ---------------------------
// Adapters (component-agnostic view-models)
// ---------------------------
export * from "./adapters/index";
export * from "./adapters/growth";

// ---------------------------
// Utilities (pure helpers)
// ---------------------------
// copy (labels + aria helpers)
export * from "./utils/copy";
// CTA policy + routes
export * from "./utils/cta";
// Pricing normalization, predicates & formatting
export * from "./utils/pricing";
// JSON-LD builders (POJOs)
export * from "./utils/jsonld";

// ---------------------------
// UI-only type aliases (barrel)
// ---------------------------
export * from "./types";
