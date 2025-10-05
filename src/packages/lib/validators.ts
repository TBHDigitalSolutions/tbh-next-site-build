// src/packages/lib/validators.ts
// Runtime validation for Packages SSOT using zod + cross-reference checks.
// Framework-agnostic (no React). Safe to run in node/edge/SSR.

import { z } from "zod";
import type { AddOn as TAddOn, PackageBundle as TBundle, PackageInclude as TInclude, Price as TPrice } from "./types/types";
import { constraints, isKnownServiceSlug, normalizeServiceSlug } from "./registry";

/* ----------------------------------------------------------------------------
 * Zod Schemas (public)
 * ---------------------------------------------------------------------------- */

// Accept any 3+ uppercase letters for currency; default elsewhere is "USD".
export const CurrencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3,}$/u, { message: "currency must be an ISO-like uppercase code (e.g., USD)" });

export const PriceSchema = z
  .object({
    oneTime: z.number().nonnegative().finite().optional(),
    monthly: z.number().nonnegative().finite().optional(),
    currency: CurrencyCodeSchema.optional(),
  })
  .refine((p) => p.oneTime != null || p.monthly != null, {
    message: "at least one of oneTime or monthly must be provided",
    path: ["oneTime"],
  });

export const PackageIncludeSchema = z.object({
  section: z.string().min(1, "section is required"),
  items: z.array(z.string().min(1, "feature text cannot be empty")).min(1, "must include at least one item"),
});

export const PackageBundleSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: PriceSchema,
  services: z.array(z.string().min(1)).optional(),
  includes: z.array(PackageIncludeSchema).min(1, "includes must have at least one section"),
  addOnSlugs: z.array(z.string().min(1)).optional(),
  idealFor: z.array(z.string().min(1)).optional(),
  timeline: z.string().min(1).optional(),
  isMostPopular: z.boolean().optional(),
});

export const AddOnSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: PriceSchema.optional(),
  category: z.string().min(1).optional(),
});

export type Price = z.infer<typeof PriceSchema> & TPrice;
export type PackageInclude = z.infer<typeof PackageIncludeSchema> & TInclude;
export type PackageBundle = z.infer<typeof PackageBundleSchema> & TBundle;
export type AddOn = z.infer<typeof AddOnSchema> & TAddOn;

/* ----------------------------------------------------------------------------
 * Issues & Reports
 * ---------------------------------------------------------------------------- */

export type IssueLevel = "error" | "warning";
export type IssueCode =
  | "schema"
  | "duplicate_slug"
  | "missing_addon_ref"
  | "unknown_service"
  | "noncanonical_service"
  | "thin_features"
  | "currency_format";

export type ValidationIssue = {
  level: IssueLevel;
  code: IssueCode;
  message: string;
  slug?: string; // bundle/addon slug where applicable
  path?: string[]; // zod path for schema issues
};

export type ValidationReport = {
  ok: boolean; // convenience flag (no errors)
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

const emptyReport: ValidationReport = { ok: true, errors: [], warnings: [] };

/* ----------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------- */

function fromZod(pathPrefixSlug: string | undefined, e: z.ZodError): ValidationIssue[] {
  return e.issues.map((iss) => ({
    level: "error" as const,
    code: "schema" as const,
    message: iss.message,
    slug: pathPrefixSlug,
    path: iss.path.map(String),
  }));
}

function uniq<T>(xs: T[]): T[] { return Array.from(new Set(xs)); }

function flattenIncludesFeatureCount(b: PackageBundle): number {
  return (b.includes ?? []).reduce((acc, s) => acc + (s.items?.length ?? 0), 0);
}

/* ----------------------------------------------------------------------------
 * Single entity validators
 * ---------------------------------------------------------------------------- */

export function validateBundle(input: unknown): { data?: PackageBundle; issues: ValidationIssue[] } {
  const parsed = PackageBundleSchema.safeParse(input);
  if (!parsed.success) return { issues: fromZod((input as any)?.slug, parsed.error) };

  const b = parsed.data as PackageBundle;
  const issues: ValidationIssue[] = [];

  // Currency format warning (if present and not uppercase)
  if (b.price.currency && !/^[A-Z]{3,}$/.test(b.price.currency)) {
    issues.push({ level: "warning", code: "currency_format", message: `currency should be uppercase (got: ${b.price.currency})`, slug: b.slug });
  }

  // Services checks
  for (const s of b.services ?? []) {
    const norm = normalizeServiceSlug(s);
    if (!isKnownServiceSlug(norm)) {
      issues.push({ level: "warning", code: "unknown_service", message: `unknown service slug: ${s}`, slug: b.slug });
    } else if (norm !== s) {
      issues.push({ level: "warning", code: "noncanonical_service", message: `non-canonical service slug: ${s} → ${norm}`, slug: b.slug });
    }
  }

  // Feature density warning
  const minFeatures = constraints().minFeatureCountForCard;
  const count = flattenIncludesFeatureCount(b);
  if (count < minFeatures) {
    issues.push({ level: "warning", code: "thin_features", message: `bundle has only ${count} feature(s); recommended ≥ ${minFeatures}`, slug: b.slug });
  }

  return { data: b, issues };
}

export function validateAddOn(input: unknown): { data?: AddOn; issues: ValidationIssue[] } {
  const parsed = AddOnSchema.safeParse(input);
  if (!parsed.success) return { issues: fromZod((input as any)?.slug, parsed.error) };

  const a = parsed.data as AddOn;
  const issues: ValidationIssue[] = [];
  if (a.price?.currency && !/^[A-Z]{3,}$/.test(a.price.currency)) {
    issues.push({ level: "warning", code: "currency_format", message: `currency should be uppercase (got: ${a.price.currency})`, slug: a.slug });
  }
  return { data: a, issues };
}

/* ----------------------------------------------------------------------------
 * Collections & Cross-reference validation
 * ---------------------------------------------------------------------------- */

export type ValidateAllInput = {
  bundles: unknown[]; // typically parsed JSON
  addOns?: unknown[];
};

export function validateAll(input: ValidateAllInput): ValidationReport {
  if (!input || !Array.isArray(input.bundles)) return { ok: false, errors: [{ level: "error", code: "schema", message: "bundles must be an array" }], warnings: [] };

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // 1) Schema & per-entity warnings
  const bundles: PackageBundle[] = [];
  for (const raw of input.bundles) {
    const { data, issues } = validateBundle(raw);
    (issues ?? []).forEach((it) => (it.level === "error" ? errors : warnings).push(it));
    if (data) bundles.push(data);
  }

  const addOns: AddOn[] = [];
  if (Array.isArray(input.addOns)) {
    for (const raw of input.addOns) {
      const { data, issues } = validateAddOn(raw);
      (issues ?? []).forEach((it) => (it.level === "error" ? errors : warnings).push(it));
      if (data) addOns.push(data);
    }
  }

  // 2) Duplicate slugs
  const bundleSlugs = bundles.map((b) => b.slug);
  const dupBundles = bundleSlugs.filter((s, i) => bundleSlugs.indexOf(s) !== i);
  if (dupBundles.length) {
    uniq(dupBundles).forEach((s) => errors.push({ level: "error", code: "duplicate_slug", message: `duplicate bundle slug: ${s}`, slug: s }));
  }

  const addOnSlugs = addOns.map((a) => a.slug);
  const dupAddOns = addOnSlugs.filter((s, i) => addOnSlugs.indexOf(s) !== i);
  if (dupAddOns.length) {
    uniq(dupAddOns).forEach((s) => errors.push({ level: "error", code: "duplicate_slug", message: `duplicate add-on slug: ${s}`, slug: s }));
  }

  // 3) Cross-refs: bundle.addOnSlugs must exist
  if (addOns.length) {
    const set = new Set(addOnSlugs);
    for (const b of bundles) {
      for (const s of b.addOnSlugs ?? []) {
        if (!set.has(s)) {
          errors.push({ level: "error", code: "missing_addon_ref", message: `bundle references missing add-on: ${s}`, slug: b.slug });
        }
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

/* ----------------------------------------------------------------------------
 * Utility: throw on invalid
 * ---------------------------------------------------------------------------- */

export function assertValid(report: ValidationReport): void {
  if (report.errors.length === 0) return;
  const msgs = report.errors.map((e) => `• [${e.code}] ${e.slug ? `${e.slug}: ` : ""}${e.message}`).join("\n");
  throw new Error(`Packages validation failed (errors: ${report.errors.length})\n${msgs}`);
}

/* ----------------------------------------------------------------------------
 * Convenience parsers for JSON files (optionally strict)
 * ---------------------------------------------------------------------------- */

export function parseBundlesJSON(json: unknown, strict = false): PackageBundle[] {
  if (!Array.isArray(json)) throw new Error("bundles JSON must be an array");
  const out: PackageBundle[] = [];
  for (const raw of json) {
    const res = PackageBundleSchema.safeParse(raw);
    if (!res.success) {
      if (strict) throw res.error; else continue;
    }
    out.push(res.data as PackageBundle);
  }
  return out;
}

export function parseAddOnsJSON(json: unknown, strict = false): AddOn[] {
  if (!Array.isArray(json)) throw new Error("addOns JSON must be an array");
  const out: AddOn[] = [];
  for (const raw of json) {
    const res = AddOnSchema.safeParse(raw);
    if (!res.success) {
      if (strict) throw res.error; else continue;
    }
    out.push(res.data as AddOn);
  }
  return out;
}
