// src/packages/lib/authoring-rules.ts
import type { Package } from "./package-types";

export type Issue = {
  level: "error" | "warn";
  code: string;
  message: string;
  path?: (string | number)[];
};

export const MSG = {
  PURPOSE_REQUIRED: "Missing Purpose narrative (purposeHtml).",
  INCLUDES_REQUIRED: "Provide either includes (groups) or includesTable.",
  INCLUDES_BOTH: "Both includes (groups) and includesTable present; choose one.",
  PRICING_REQUIRED: "Price must include monthly > 0 or oneTime > 0.",
  SLUG_REQUIRED: "Slug is required.",
  NAME_REQUIRED: "Name is required.",
  OUTCOMES_MIN: "Outcomes should include at least 3 items (recommended).",
} as const;

/** error if purpose missing (we keep schema optional to allow phased adoption) */
export function checkPurpose(pkg: Package): Issue[] {
  return pkg.purposeHtml ? [] : [{ level: "error", code: "purpose", message: MSG.PURPOSE_REQUIRED, path: ["purposeHtml"] }];
}

export function checkIncludes(pkg: Package): Issue[] {
  const hasGroups = Array.isArray(pkg.includes) && pkg.includes.length > 0;
  const hasTable = !!pkg.includesTable;
  if (!hasGroups && !hasTable) return [{ level: "error", code: "includes", message: MSG.INCLUDES_REQUIRED, path: ["includes"] }];
  if (hasGroups && hasTable) return [{ level: "warn", code: "includes", message: MSG.INCLUDES_BOTH, path: ["includes"] }];
  return [];
}

export function checkPricing(pkg: Package): Issue[] {
  const p = pkg.price;
  const one = Number(p?.oneTime ?? 0);
  const mon = Number(p?.monthly ?? 0);
  return one > 0 || mon > 0
    ? []
    : [{ level: "error", code: "price", message: MSG.PRICING_REQUIRED, path: ["price"] }];
}

export function checkIdentity(pkg: Package): Issue[] {
  const out: Issue[] = [];
  if (!pkg.slug?.trim()) out.push({ level: "error", code: "slug", message: MSG.SLUG_REQUIRED, path: ["slug"] });
  if (!pkg.name?.trim()) out.push({ level: "error", code: "name", message: MSG.NAME_REQUIRED, path: ["name"] });
  return out;
}

export function checkOutcomes(pkg: Package): Issue[] {
  const n = pkg.outcomes?.length ?? 0;
  return n > 0 && n < 3 ? [{ level: "warn", code: "outcomes", message: MSG.OUTCOMES_MIN, path: ["outcomes"] }] : [];
}

/** Convenience aggregator for CI/doctor. */
export function runAuthoringChecks(pkg: Package): Issue[] {
  return [
    ...checkIdentity(pkg),
    ...checkPurpose(pkg),
    ...checkIncludes(pkg),
    ...checkPricing(pkg),
    ...checkOutcomes(pkg),
  ];
}
