// /src/data/packages/_validators/packages.validate.ts
// Dev-time validation: ids, pricing sanity, cross-references, and coverage.

import type {
  Package,
  AddOn,
  FeaturedCard,
  IntegratedBundle,
  Tier,
} from "../_types/packages.types";
import { isValidPackageId, extractServiceFromId } from "../_utils/ids";
import { SERVICE_SLUGS } from "../_utils/slugs";

export interface ValidationError {
  type: "error" | "warning";
  message: string;
  context?: string;
}

const REQUIRED_TIERS: readonly Tier[] = ["Essential", "Professional", "Enterprise"] as const;

/** Ensure featured cards reference existing packages. */
export function validateFeaturedRefs(
  packages: Package[],
  featured: FeaturedCard[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const pkgIds = new Set(packages.map(p => p.id));

  for (const card of featured) {
    if (!pkgIds.has(card.packageId)) {
      errors.push({
        type: "error",
        message: `Featured card "${card.id}" references missing packageId "${card.packageId}"`,
        context: `service: ${card.service}`,
      });
    }
  }
  return errors;
}

/** Numeric pricing sanity checks (setup/monthly ≥ 0; warn when both missing). */
export function validatePricingNumbers(item: Package | AddOn): ValidationError[] {
  const errors: ValidationError[] = [];
  const { setup, monthly } = item.price ?? {};

  if (setup !== undefined && (typeof setup !== "number" || !Number.isFinite(setup) || setup < 0)) {
    errors.push({
      type: "error",
      message: `${item.id}: setup must be a non-negative number`,
      context: `service: ${item.service}`,
    });
  }
  if (monthly !== undefined && (typeof monthly !== "number" || !Number.isFinite(monthly) || monthly < 0)) {
    errors.push({
      type: "error",
      message: `${item.id}: monthly must be a non-negative number`,
      context: `service: ${item.service}`,
    });
  }
  if ((setup == null) && (monthly == null)) {
    errors.push({
      type: "warning",
      message: `${item.id}: no pricing set (setup or monthly)`,
      context: `service: ${item.service}`,
    });
  }
  return errors;
}

/** Ensure ids are unique across collections. */
export function validateUniqueIds(
  packages: Package[],
  addOns: AddOn[],
  featured: FeaturedCard[],
  bundles: IntegratedBundle[] = [],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Set<string>();

  const check = (id: string, label: string, ctx?: string) => {
    if (seen.has(id)) {
      errors.push({ type: "error", message: `Duplicate ${label} ID: ${id}`, context: ctx });
    } else {
      seen.add(id);
    }
  };

  packages.forEach(p => check(p.id, "package", `service: ${p.service}`));
  addOns.forEach(a => check(a.id, "add-on", `service: ${a.service}`));

  // Featured use separate namespace; still prevent internal dupes
  const featuredSeen = new Set<string>();
  featured.forEach(f => {
    if (featuredSeen.has(f.id)) {
      errors.push({ type: "error", message: `Duplicate featured card ID: ${f.id}`, context: `service: ${f.service}` });
    } else {
      featuredSeen.add(f.id);
    }
  });

  const bundleSeen = new Set<string>();
  bundles.forEach(b => {
    if (bundleSeen.has(b.id)) {
      errors.push({ type: "error", message: `Duplicate bundle ID: ${b.id}` });
    } else {
      bundleSeen.add(b.id);
    }
  });

  return errors;
}

/** Kebab-case id format + service prefix alignment. */
export function validateIdFormats(items: (Package | AddOn | FeaturedCard)[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const item of items) {
    const svcFromId = extractServiceFromId(item.id);

    if (!isValidPackageId(item.id)) {
      errors.push({
        type: "error",
        message: `Invalid ID format: ${item.id} (must be kebab-case)`,
        context: `service: ${item.service}`,
      });
    }
    if (!svcFromId) {
      errors.push({
        type: "error",
        message: `Invalid ID: ${item.id} (should start with a service slug)`,
        context: `expected service: ${item.service}`,
      });
    } else if (svcFromId !== item.service) {
      errors.push({
        type: "error",
        message: `ID service mismatch: ${item.id} starts with "${svcFromId}" but service is "${item.service}"`,
        context: `item: ${item.id}`,
      });
    }
  }
  return errors;
}

/** Each service should have exactly 3 featured cards (strict merchandising rule). */
export function validateFeaturedCount(featured: FeaturedCard[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const counts = new Map<string, number>();
  for (const f of featured) counts.set(f.service, (counts.get(f.service) ?? 0) + 1);

  for (const svc of SERVICE_SLUGS) {
    const n = counts.get(svc) ?? 0;
    if (n !== 3) {
      errors.push({
        type: "error",
        message: `Service "${svc}" has ${n} featured cards; expected exactly 3`,
        context: `service: ${svc}`,
      });
    }
  }
  return errors;
}

/** Warn when a service is missing any of the standard tiers. */
export function validateTierCoverage(packages: Package[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const byService = new Map<string, Set<Tier>>();
  for (const p of packages) {
    const set = byService.get(p.service) ?? new Set<Tier>();
    set.add(p.tier);
    byService.set(p.service, set);
  }
  for (const [svc, tiers] of byService.entries()) {
    for (const t of REQUIRED_TIERS) {
      if (!tiers.has(t)) {
        errors.push({
          type: "warning",
          message: `Service "${svc}" missing ${t} tier`,
          context: `service: ${svc}`,
        });
      }
    }
  }
  return errors;
}

/** Add-on references: dependencies must exist (in packages or add-ons). */
export function validateAddOnDependencies(packages: Package[], addOns: AddOn[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const known = new Set<string>([...packages.map(p => p.id), ...addOns.map(a => a.id)]);
  for (const a of addOns) {
    for (const dep of a.dependencies ?? []) {
      if (!known.has(dep)) {
        errors.push({
          type: "error",
          message: `Add-on "${a.id}" depends on missing id "${dep}"`,
          context: `service: ${a.service}`,
        });
      }
    }
  }
  return errors;
}

/** Pairs-best-with tiers must be valid. (Schema enforces this, but double-check.) */
export function validateAddOnPairs(addOns: AddOn[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const valid = new Set<Tier>(REQUIRED_TIERS as unknown as Tier[]);
  for (const a of addOns) {
    for (const t of a.pairsBestWith ?? []) {
      if (!valid.has(t)) {
        errors.push({
          type: "error",
          message: `Add-on "${a.id}" has invalid pairsBestWith tier "${t}"`,
          context: `service: ${a.service}`,
        });
      }
    }
  }
  return errors;
}

/** Run all validations and return consolidated results. */
export function validateAll(
  packages: Package[],
  addOns: AddOn[],
  featured: FeaturedCard[],
  bundles: IntegratedBundle[] = [],
): ValidationError[] {
  const errors: ValidationError[] = [];

  errors.push(...validateUniqueIds(packages, addOns, featured, bundles));
  errors.push(...validateIdFormats([...packages, ...addOns, ...featured]));
  errors.push(...validateFeaturedRefs(packages, featured));
  errors.push(...validateFeaturedCount(featured));
  errors.push(...validateTierCoverage(packages));
  errors.push(...validateAddOnDependencies(packages, addOns));
  errors.push(...validateAddOnPairs(addOns));

  // Pricing checks for packages + add-ons
  for (const it of [...packages, ...addOns]) {
    errors.push(...validatePricingNumbers(it));
  }

  return errors;
}

/** Utility: summarize counts (handy for CI logs). */
export function summarize(results: ValidationError[]) {
  const errorCount = results.filter(r => r.type === "error").length;
  const warningCount = results.filter(r => r.type === "warning").length;
  return { errorCount, warningCount, total: results.length };
}

/** Utility: throw on errors to fail CI. */
export function assertValid(results: ValidationError[]) {
  const { errorCount } = summarize(results);
  if (errorCount > 0) {
    const lines = results
      .filter(r => r.type === "error")
      .map(r => `• ${r.message}${r.context ? `\n    ↳ ${r.context}` : ""}`)
      .join("\n");
    throw new Error(`Packages data validation failed (${errorCount} error${errorCount === 1 ? "" : "s"})\n${lines}`);
  }
}

/** Pretty console logging for local dev. */
export function logValidationResults(results: ValidationError[]): void {
  const { errorCount, warningCount } = summarize(results);
  if (results.length === 0) {
    // eslint-disable-next-line no-console
    console.log("✅ Packages data validation passed (no issues)");
    return;
  }
  // eslint-disable-next-line no-console
  console.log("\n📦 Packages Data Validation");
  // eslint-disable-next-line no-console
  console.log(`   Errors:   ${errorCount}`);
  // eslint-disable-next-line no-console
  console.log(`   Warnings: ${warningCount}\n`);
  for (const r of results) {
    // eslint-disable-next-line no-console
    console.log(`${r.type === "error" ? "❌" : "⚠️"} ${r.message}${r.context ? `\n   • ${r.context}` : ""}`);
  }
  if (errorCount > 0) {
    // eslint-disable-next-line no-console
    console.log("\n💡 Fix errors before deploying to production.");
  }
}
