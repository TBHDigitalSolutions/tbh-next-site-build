// ============================================================================
// /src/data/packages/_validators/packages.validate.ts
// ----------------------------------------------------------------------------
// Production-ready validation helpers for the Packages domain.
// - Uses Zod schemas from ./schema for structural validation
// - Adds opinionated business rules (IDs, slugs, pricing sanity, refs)
// - Framework-agnostic; safe to run in build/CI
// ============================================================================

import {
  ServicePackage as ZServicePackage,
  PackageBundle as ZPackageBundle,
} from "./schema";

import type {
  ServicePackage as PkgT,
  PackageBundle as BunT,
} from "../_types/packages.types";

import { coerceSlug } from "../_utils/slugs";
import {
  isKebabId,
  indexById,
} from "../_utils/ids";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  level: IssueLevel;
  kind:
    | "schema"
    | "id-format"
    | "id-duplicate"
    | "slug-duplicate"
    | "slug-empty"
    | "slug-mismatch"
    | "pricing"
    | "bundle-components";
  id?: string;
  field?: string;
  message: string;
  context?: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  errors: number;
  warnings: number;
}

// ----------------------------------------------------------------------------
// Internal utils
// ----------------------------------------------------------------------------

function makeReport(issues: ValidationIssue[]): ValidationReport {
  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.filter((i) => i.level === "warning").length;
  return { issues, errors, warnings };
}

function pushIssues(
  store: ValidationIssue[],
  items: ValidationIssue[] | undefined,
) {
  if (items?.length) store.push(...items);
}

function nonNeg(n: unknown) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

// ----------------------------------------------------------------------------
// Package validation
// ----------------------------------------------------------------------------

/**
 * Validate package objects against schema + business rules.
 * - Zod schema (shape)
 * - id format (kebab-case)
 * - duplicate ids
 * - pricing sanity (non-negative)
 */
export function validatePackages(packages: PkgT[]): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1) Schema validation
  for (const p of packages) {
    const r = ZServicePackage.safeParse(p);
    if (!r.success) {
      issues.push({
        level: "error",
        kind: "schema",
        id: p?.id,
        message: r.error.issues.map((i) => i.message).join("; "),
      });
    }
  }

  // 2) ID format + duplicates
  const seenIds = new Set<string>();
  for (const p of packages) {
    if (!p?.id) continue;

    if (!isKebabId(p.id)) {
      issues.push({
        level: "error",
        kind: "id-format",
        id: p.id,
        message: `Package id must be kebab-case (a–z, 0–9, hyphens): "${p.id}"`,
      });
    }

    if (seenIds.has(p.id)) {
      issues.push({
        level: "error",
        kind: "id-duplicate",
        id: p.id,
        message: `Duplicate package id "${p.id}"`,
      });
    } else {
      seenIds.add(p.id);
    }
  }

  // 3) Pricing sanity (non-negative; warn if absent)
  for (const p of packages) {
    const price = p?.price;
    if (!price || (price.oneTime == null && price.monthly == null)) {
      issues.push({
        level: "warning",
        kind: "pricing",
        id: p.id,
        message: `No public price set (allowed, but UI will show "Contact for pricing")`,
      });
      continue;
    }
    if (price.oneTime != null && !nonNeg(price.oneTime)) {
      issues.push({
        level: "error",
        kind: "pricing",
        id: p.id,
        field: "price.oneTime",
        message: `One-time price must be a non-negative number`,
      });
    }
    if (price.monthly != null && !nonNeg(price.monthly)) {
      issues.push({
        level: "error",
        kind: "pricing",
        id: p.id,
        field: "price.monthly",
        message: `Monthly price must be a non-negative number`,
      });
    }
  }

  return makeReport(issues);
}

// ----------------------------------------------------------------------------
// Bundle validation
// ----------------------------------------------------------------------------

/**
 * Validate bundles against schema + business rules.
 * - Zod schema (shape)
 * - slug presence/format + duplicate slugs
 * - id format + duplicate ids
 * - component references exist in packages
 * - compareAt >= price checks (when applicable)
 */
export function validateBundles(
  bundles: BunT[],
  packagesById: Record<string, PkgT>,
): ValidationReport {
  const issues: ValidationIssue[] = [];

  // 1) Schema validation
  for (const b of bundles) {
    const r = ZPackageBundle.safeParse(b);
    if (!r.success) {
      issues.push({
        level: "error",
        kind: "schema",
        id: b?.id,
        message: r.error.issues.map((i) => i.message).join("; "),
      });
    }
  }

  // 2) ID / slug checks + duplicates
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const b of bundles) {
    // id format & dups
    if (!b?.id) {
      issues.push({
        level: "error",
        kind: "id-format",
        message: "Bundle missing id",
      });
    } else {
      if (!isKebabId(b.id)) {
        issues.push({
          level: "error",
          kind: "id-format",
          id: b.id,
          message: `Bundle id must be kebab-case: "${b.id}"`,
        });
      }
      if (seenIds.has(b.id)) {
        issues.push({
          level: "error",
          kind: "id-duplicate",
          id: b.id,
          message: `Duplicate bundle id "${b.id}"`,
        });
      } else {
        seenIds.add(b.id);
      }
    }

    // slug presence & dups (coerce when missing)
    const slug = coerceSlug(b.id ?? "", b.slug);
    if (!slug) {
      issues.push({
        level: "error",
        kind: "slug-empty",
        id: b.id,
        message: `Bundle slug missing and id could not coerce`,
      });
    } else {
      if (seenSlugs.has(slug)) {
        issues.push({
          level: "error",
          kind: "slug-duplicate",
          id: b.id,
          message: `Duplicate bundle slug "${slug}"`,
        });
      } else {
        seenSlugs.add(slug);
      }
      if (b.slug && b.slug !== slug) {
        issues.push({
          level: "warning",
          kind: "slug-mismatch",
          id: b.id,
          message: `Bundle slug "${b.slug}" differs from canonical "${slug}"`,
        });
      }
    }
  }

  // 3) Component references
  for (const b of bundles) {
    const missing: string[] = [];
    for (const id of b.components ?? []) {
      if (!packagesById[id]) missing.push(id);
    }
    if (missing.length) {
      issues.push({
        level: "error",
        kind: "bundle-components",
        id: b.id,
        message: `Missing component package ids: ${missing.join(", ")}`,
      });
    }
  }

  // 4) Basic pricing sanity: compareAt >= price (if same dimension)
  for (const b of bundles) {
    const p = b.price;
    const c = b.compareAt;

    if (p && c) {
      // Check only like-with-like, warn if compareAt lower than price
      if (
        p.oneTime != null &&
        c.oneTime != null &&
        nonNeg(p.oneTime) &&
        nonNeg(c.oneTime) &&
        c.oneTime < p.oneTime
      ) {
        issues.push({
          level: "warning",
          kind: "pricing",
          id: b.id,
          message: `compareAt.oneTime (${c.oneTime}) is less than price.oneTime (${p.oneTime})`,
        });
      }
      if (
        p.monthly != null &&
        c.monthly != null &&
        nonNeg(p.monthly) &&
        nonNeg(c.monthly) &&
        c.monthly < p.monthly
      ) {
        issues.push({
          level: "warning",
          kind: "pricing",
          id: b.id,
          message: `compareAt.monthly (${c.monthly}) is less than price.monthly (${p.monthly})`,
        });
      }
    }

    // Warn if bundle has neither oneTime nor monthly — allowed but noisy for storefronts
    if (!p || (p.oneTime == null && p.monthly == null)) {
      issues.push({
        level: "warning",
        kind: "pricing",
        id: b.id,
        message:
          'No bundle price set (allowed). UI will show "Contact for pricing" unless suppressed.',
      });
    } else {
      if (p.oneTime != null && !nonNeg(p.oneTime)) {
        issues.push({
          level: "error",
          kind: "pricing",
          id: b.id,
          field: "price.oneTime",
          message: `One-time price must be a non-negative number`,
        });
      }
      if (p.monthly != null && !nonNeg(p.monthly)) {
        issues.push({
          level: "error",
          kind: "pricing",
          id: b.id,
          field: "price.monthly",
          message: `Monthly price must be a non-negative number`,
        });
      }
    }
  }

  return makeReport(issues);
}

// ----------------------------------------------------------------------------
// Consolidated API
// ----------------------------------------------------------------------------

/** Validate both collections with cross-refs. */
export function validateAll(
  packages: PkgT[],
  bundles: BunT[],
): ValidationReport {
  const pkgReport = validatePackages(packages);
  const byId = indexById(packages);
  const bunReport = validateBundles(bundles, byId);
  return makeReport([...pkgReport.issues, ...bunReport.issues]);
}

/** Throw on any errors (keep warnings). */
export function assertValid(report: ValidationReport): void {
  if (report.errors > 0) {
    const lines = report.issues
      .filter((i) => i.level === "error")
      .map((i) => `• [${i.kind}] ${i.message}${i.id ? ` (id: ${i.id})` : ""}`)
      .join("\n");
    throw new Error(
      `Packages validation failed (${report.errors} error${
        report.errors === 1 ? "" : "s"
      }):\n${lines}`,
    );
  }
}

/** Pretty printer for local dev / CI logs. */
export function logValidationReport(report: ValidationReport): void {
  // eslint-disable-next-line no-console
  console.log("\n📦 Packages Validation Report");
  // eslint-disable-next-line no-console
  console.log(`   Errors:   ${report.errors}`);
  // eslint-disable-next-line no-console
  console.log(`   Warnings: ${report.warnings}`);
  if (report.issues.length) {
    // eslint-disable-next-line no-console
    console.log("");
    for (const i of report.issues) {
      const icon = i.level === "error" ? "❌" : "⚠️";
      // eslint-disable-next-line no-console
      console.log(
        `${icon} ${i.kind}: ${i.message}${
          i.id ? `  (id: ${i.id}${i.field ? ` · ${i.field}` : ""})` : ""
        }`,
      );
    }
  }
}

/** Convenience runner for scripts: validate, log, and throw on errors. */
export function runValidation(packages: PkgT[], bundles: BunT[]): void {
  const report = validateAll(packages, bundles);
  logValidationReport(report);
  assertValid(report);
}
