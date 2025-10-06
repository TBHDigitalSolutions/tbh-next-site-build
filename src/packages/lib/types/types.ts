/**
 * UI Types — Core (thin, SSOT-aware)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Provide *UI-only* type aliases and helpers that reference (but do not copy)
 * the canonical runtime package schema. These types are safe for components,
 * pages, and adapters without dragging in business logic or values.
 *
 * Design rules
 * -----------------------------------------------------------------------------
 * - **No value exports** (constants, functions) — types only.
 * - **No schema duplication** — import runtime types from package-schema.ts.
 * - **Framework-agnostic** — no React types here.
 */

import type { z } from "zod";
import type {
  PackageSchema as _RuntimePackageSchema,
  PackageSchemaType as RuntimePackage,
  MoneySchemaType as RuntimeMoney,
} from "@/packages/lib/package-schema";

/* =============================================================================
 * Opaque/string brands & small aliases (UI sugar)
 * ============================================================================= */

/** Opaque-ish slug brand for editor signal (still a string at runtime). */
export type Slug = string & { __brand?: "Slug" };

/** Href brand (documentation only). */
export type Href = string & { __brand?: "Href" };

/** Currency code derived from the runtime Money schema. */
export type CurrencyCode = RuntimeMoney["currency"];

/** Canonical service slug union (directly from the runtime SSOT). */
export type ServiceSlug = RuntimePackage["service"];

/** Alias for the full runtime package type (for convenience). */
export type PackageRuntime = RuntimePackage;

/* =============================================================================
 * UI-facing picks from the runtime schema (no duplication)
 * ============================================================================= */

/**
 * Identity/metadata commonly used by UI surfaces (cards, headers, breadcrumbs).
 * Reference-only: kept in sync with the SSOT by using `Pick<RuntimePackage, …>`.
 */
export type PackageIdentity = Pick<
  RuntimePackage,
  "id" | "slug" | "service" | "name" | "summary" | "tags" | "tier"
>;

/**
 * A single "What’s included" group (section title + bullet items) as authored.
 * Pulled from the runtime schema to avoid re-defining the structure.
 */
export type IncludeGroup = NonNullable<RuntimePackage["includes"]>[number];

/** Convenience alias for authored includes array. */
export type IncludeGroups = RuntimePackage["includes"];

/** Runtime pricing payload (money) used by bands/cards; SSOT-derived. */
export type Money = RuntimeMoney;

/** Optional band microcopy (runtime-provided); see `types/band.ts` for UI band types. */
export type PriceBand = RuntimePackage["priceBand"];

/* =============================================================================
 * View-model placeholders (UI-local, not part of SSOT)
 * ============================================================================= */

/**
 * A minimal bundle used in list/grid contexts or scripts *when you are NOT*
 * passing the full runtime package around. This is NOT the SSOT; it’s a
 * lightweight projection safe for UI consumption.
 *
 * When possible, prefer using `PackageRuntime` directly.
 */
export type PackageBundle = {
  slug: Slug;
  name: string;
  description?: string;
  price?: Money;
  /** Optional service tags for filtering UIs. */
  services?: ServiceSlug[] | string[];
  /** Structured inclusions grouped by section (UI-local shape). */
  includes?: Array<{ section: string; items: string[] }>;
  /** Grid decorators */
  isMostPopular?: boolean;
  /** Optional related add-on slugs. */
  addOnSlugs?: Slug[];
};
