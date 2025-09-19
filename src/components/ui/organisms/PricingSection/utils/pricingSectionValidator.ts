// src/components/ui/organisms/PricingSection/utils/pricingSectionValidator.ts
// ----------------------------------------------------------------------------------
// Runtime validation for PricingSection orchestration
// - Primary: validate *presentational* props for <PricingTiers /> after adapters run
// - Optional: lenient checks for raw service pricing data during migration
// ----------------------------------------------------------------------------------

import type {
  PricingTiersProps,
  TierCard,
  TierFeature,
} from "@/components/ui/organisms/PricingTiers/PricingTiers";

// ----------------------------------------
// Small helpers (no external deps)
// ----------------------------------------
type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === "boolean";
const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

function pushErr(
  errs: string[],
  path: string,
  expected: string,
  actual: unknown
): void {
  const show =
    actual === undefined
      ? "undefined"
      : actual === null
      ? "null"
      : Array.isArray(actual)
      ? "array"
      : typeof actual === "object"
      ? "object"
      : typeof actual;
  errs.push(`${path}: expected ${expected}, got ${show}`);
}

// ----------------------------------------
// Validate TierFeature (presentational)
// ----------------------------------------
function validateTierFeature(
  feature: unknown,
  path: string,
  errs: string[]
): feature is TierFeature {
  if (!isObj(feature)) return pushErr(errs, path, "object TierFeature", feature), false;

  if (!isStr(feature.id)) pushErr(errs, `${path}.id`, "string", feature["id"]);
  if (!isStr(feature.label)) pushErr(errs, `${path}.label`, "string", feature["label"]);

  if ("included" in feature && !isBool((feature as any).included)) {
    pushErr(errs, `${path}.included`, "boolean", (feature as any).included);
  }
  if ("note" in feature && (feature as any).note != null && !isStr((feature as any).note)) {
    pushErr(errs, `${path}.note`, "string | undefined", (feature as any).note);
  }
  return true;
}

// ----------------------------------------
// Validate TierCard (presentational)
// ----------------------------------------
function validateTierCard(
  tier: unknown,
  index: number,
  errs: string[]
): tier is TierCard {
  const path = `tiers[${index}]`;
  if (!isObj(tier)) return pushErr(errs, path, "object TierCard", tier), false;

  if (!isStr(tier.id)) pushErr(errs, `${path}.id`, "string", tier["id"]);
  if (!isStr(tier.name)) pushErr(errs, `${path}.name`, "string", tier["name"]);

  // price
  if (!isObj(tier.price)) {
    pushErr(errs, `${path}.price`, "object { amount:number; interval?:string; ... }", tier["price"]);
  } else {
    const price = tier.price as any;
    if (!isNum(price.amount)) pushErr(errs, `${path}.price.amount`, "number", price.amount);
    if (price.interval != null && !isStr(price.interval))
      pushErr(errs, `${path}.price.interval`, "string | undefined", price.interval);
    if (price.currency != null && !isStr(price.currency))
      pushErr(errs, `${path}.price.currency`, "string | undefined", price.currency);
    if (price.originalAmount != null && !isNum(price.originalAmount))
      pushErr(errs, `${path}.price.originalAmount`, "number | undefined", price.originalAmount);
  }

  // optional fields
  if ("badge" in tier && (tier as any).badge != null && !isStr((tier as any).badge)) {
    pushErr(errs, `${path}.badge`, "string | undefined", (tier as any).badge);
  }
  if ("description" in tier && (tier as any).description != null && !isStr((tier as any).description)) {
    pushErr(errs, `${path}.description`, "string | undefined", (tier as any).description);
  }
  if ("highlighted" in tier && (tier as any).highlighted != null && !isBool((tier as any).highlighted)) {
    pushErr(errs, `${path}.highlighted`, "boolean | undefined", (tier as any).highlighted);
  }

  // features
  if ("features" in tier) {
    const list = (tier as any).features;
    if (list != null) {
      if (!Array.isArray(list)) {
        pushErr(errs, `${path}.features`, "array<TierFeature> | undefined", list);
      } else {
        list.forEach((f: unknown, i: number) => validateTierFeature(f, `${path}.features[${i}]`, errs));
      }
    }
  }

  // cta
  if ("cta" in tier) {
    const cta = (tier as any).cta;
    if (cta != null) {
      if (!isObj(cta)) {
        pushErr(errs, `${path}.cta`, "object { label:string; href:string; ... } | undefined", cta);
      } else {
        if (!isStr(cta.label)) pushErr(errs, `${path}.cta.label`, "string", cta.label);
        if (!isStr(cta.href)) pushErr(errs, `${path}.cta.href`, "string", cta.href);
        if (cta.target != null && !isStr(cta.target))
          pushErr(errs, `${path}.cta.target`, "string | undefined", cta.target);
        if (cta.rel != null && !isStr(cta.rel))
          pushErr(errs, `${path}.cta.rel`, "string | undefined", cta.rel);
        if (cta.variant != null && !isStr(cta.variant))
          pushErr(errs, `${path}.cta.variant`, "string | undefined", cta.variant);
      }
    }
  }

  return true;
}

// ----------------------------------------
// Primary: validate final PricingTiersProps
// ----------------------------------------
export function validatePricingTiersProps(
  input: unknown
): ValidationResult<PricingTiersProps> {
  const errs: string[] = [];
  const path = "PricingTiersProps";

  if (!isObj(input)) {
    pushErr(errs, path, "object PricingTiersProps", input);
    return { ok: false, errors: errs };
  }

  const tiers = (input as any).tiers;
  if (!Array.isArray(tiers)) {
    pushErr(errs, `${path}.tiers`, "TierCard[]", tiers);
  } else if (tiers.length === 0) {
    errs.push(`${path}.tiers: must contain at least one tier`);
  } else {
    tiers.forEach((t: unknown, i: number) => validateTierCard(t, i, errs));
  }

  const layout = (input as any).layout;
  if (layout != null && !["grid", "list"].includes(layout)) {
    pushErr(errs, `${path}.layout`, `"grid" | "list" | undefined`, layout);
  }

  const showBillingToggle = (input as any).showBillingToggle;
  if (showBillingToggle != null && !isBool(showBillingToggle)) {
    pushErr(errs, `${path}.showBillingToggle`, "boolean | undefined", showBillingToggle);
  }

  return errs.length ? { ok: false, errors: errs } : { ok: true, value: input as PricingTiersProps };
}

export function assertPricingTiersProps(input: unknown): asserts input is PricingTiersProps {
  const res = validatePricingTiersProps(input);
  if (!res.ok) {
    // Throw a compact error for DX; callers can catch and render nicer copies
    const msg = ["Invalid PricingTiersProps:", ...res.errors].join("\n - ");
    throw new Error(msg);
  }
}

// ----------------------------------------
// Optional: lenient checks for *raw* service pricing data
// (You can delete this once all pages are migrated.)
// ----------------------------------------
export function validateRawServicePricingData(input: unknown): ValidationResult<any> {
  // Intentionally VERY lenient; only checks the common "tiers" container exists.
  const errs: string[] = [];
  if (!isObj(input)) {
    pushErr(errs, "RawServicePricingData", "object", input);
    return { ok: false, errors: errs };
  }
  const tiers = (input as any).tiers;
  if (!Array.isArray(tiers)) {
    pushErr(errs, "RawServicePricingData.tiers", "array", tiers);
  }
  return errs.length ? { ok: false, errors: errs } : { ok: true, value: input };
}

export function assertRawServicePricingData(input: unknown): void {
  const res = validateRawServicePricingData(input);
  if (!res.ok) {
    const msg = ["Invalid RawServicePricingData:", ...res.errors].join("\n - ");
    throw new Error(msg);
  }
}
