// ============================================================================
// /src/data/packages/_adapters/normalize.ts
// SSOT normalizers for Packages domain (TS-first; no MDX).
// - Normalizes ServicePackage, PackageBundle, AddOn, and Featured lists
// - Accepts flexible/legacy inputs and outputs strict SSOT shapes
// - Enforces kebab-case IDs, stable slugs, and USD currency
// - Public price policy: exactly ONE visible price; derives from "Starter" tier
// ============================================================================

import type {
  Money,
  ServicePackage,
  PackageBundle,
  AddOn,
  FAQBlock,
  IncludesSection,
  OutcomesBlock,
} from "../_types/packages.types";
import { coerceSlug } from "../_utils/slugs";
import { assertId } from "../_utils/ids";

// -----------------------------
// Constants & small predicates
// -----------------------------
export const DEFAULT_CURRENCY: Money["currency"] = "USD";

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const asStr = (v: unknown): string | undefined => (isStr(v) ? v.trim() : undefined);
const uniq = <T,>(arr: T[]): T[] => Array.from(new Set(arr));

/** Return [] if v is falsy or not an array. */
export function normalizeArray<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : [];
}

/** Return Money only if at least one numeric field present; otherwise undefined. */
export function coerceMoney(m?: Partial<Money> | null): Money | undefined {
  if (!m || (m.oneTime == null && m.monthly == null)) return undefined;
  const oneTime = isNum(m.oneTime) ? m.oneTime : undefined;
  const monthly = isNum(m.monthly) ? m.monthly : undefined;
  if (oneTime == null && monthly == null) return undefined;
  return { oneTime, monthly, currency: (m.currency as Money["currency"]) ?? DEFAULT_CURRENCY };
}

/** Legacy helper: from { setup, monthly, currency } */
export function coerceLegacyMoney(raw?: { setup?: number; monthly?: number; currency?: Money["currency"] } | null): Money | undefined {
  if (!raw) return undefined;
  const m: Partial<Money> = { oneTime: raw.setup, monthly: raw.monthly, currency: raw.currency };
  return coerceMoney(m);
}

// --------------------------------------
// Includes / Outcomes / FAQ normalizers
// --------------------------------------
type LooseIncludeItem =
  | string
  | { label?: string; note?: string }
  | { title?: string; description?: string };

function toIncludeItem(x: LooseIncludeItem): { label: string; note?: string } | null {
  if (isStr(x)) return { label: x.trim() };
  if (x && typeof x === "object") {
    const label = asStr((x as any).label) ?? asStr((x as any).title);
    const note = asStr((x as any).note) ?? asStr((x as any).description);
    if (label) return { label, note };
  }
  return null;
}

type LooseIncludesSection =
  | { title?: string; items?: LooseIncludeItem[] }
  | { heading?: string; items?: LooseIncludeItem[] }
  | { title?: string; list?: LooseIncludeItem[] };

export function normalizeIncludesSection(sec?: LooseIncludesSection): IncludesSection | undefined {
  if (!sec || typeof sec !== "object") return undefined;
  const title = asStr((sec as any).title) ?? asStr((sec as any).heading);
  const rawItems: LooseIncludeItem[] =
    normalizeArray((sec as any).items) ?? normalizeArray((sec as any).list);
  const items = rawItems.map(toIncludeItem).filter(Boolean) as IncludesSection["items"];
  if (!items.length && !title) return undefined;
  return { title, items };
}

type LooseOutcomeItem = string | { label?: string; value?: string; metric?: string };

function toOutcomeItem(x: LooseOutcomeItem): { label: string; value?: string } | null {
  if (isStr(x)) return { label: x.trim() };
  if (x && typeof x === "object") {
    const label = asStr((x as any).label);
    const value = asStr((x as any).value) ?? asStr((x as any).metric);
    if (label) return { label, value };
  }
  return null;
}

export function normalizeOutcomesBlock(o?: Partial<OutcomesBlock> | { title?: string; items?: LooseOutcomeItem[] }): OutcomesBlock | undefined {
  if (!o || typeof o !== "object") return undefined;
  const title = asStr((o as any).title);
  const items = normalizeArray((o as any).items).map(toOutcomeItem).filter(Boolean) as OutcomesBlock["items"];
  if (!items.length && !title) return undefined;
  return { title, items };
}

type LooseFaqItem =
  | { id?: string | number; q?: string; a?: string; question?: string; answer?: string }
  | { question: string; answer: string };

export function normalizeFAQBlock(f?: Partial<FAQBlock> | { faqs?: LooseFaqItem[] } | LooseFaqItem[]): FAQBlock | undefined {
  if (!f) return undefined;

  const arr = Array.isArray(f) ? f : normalizeArray((f as any).faqs);
  const faqs = arr
    .map((it, i) => {
      if (!it || typeof it !== "object") return null;
      const question = asStr((it as any).question) ?? asStr((it as any).q);
      const answer = asStr((it as any).answer) ?? asStr((it as any).a);
      if (!question || !answer) return null;
      return { id: String((it as any).id ?? i), question, answer };
    })
    .filter(Boolean) as FAQBlock["faqs"];

  const title = !Array.isArray(f) ? asStr((f as any).title) : undefined;
  if (!faqs.length && !title) return undefined;
  return { title, faqs };
}

// --------------------------------------
// Public price derivation (policy)
// --------------------------------------
/**
 * Respect "one public price":
 * - If raw.price exists → normalize & return.
 * - Else, if _internal.pricing.tiers exists → pick "Starter" (case-insensitive)
 *   or the lowest-priced tier; return normalized Money.
 */
export function derivePublicPrice(raw: any): Money | undefined {
  const direct = coerceMoney(raw?.price) ?? coerceLegacyMoney(raw?.price);
  if (direct) return direct;

  const tiers: any[] | undefined = raw?._internal?.pricing?.tiers ?? raw?.pricing?.tiers;
  if (!Array.isArray(tiers) || !tiers.length) return undefined;

  // Prefer tier named "Starter", else choose tier with lowest monthly/oneTime.
  const pickByName =
    tiers.find((t) => isStr(t?.name) && t.name.toLowerCase() === "starter") ?? null;

  const toMoneyFromTier = (t: any): Money | undefined =>
    coerceMoney({ monthly: t?.price?.monthly, oneTime: t?.price?.oneTime, currency: t?.price?.currency }) ??
    coerceLegacyMoney(t?.price);

  if (pickByName) {
    const m = toMoneyFromTier(pickByName);
    if (m) return m;
  }

  // Fallback: choose the tier with the smallest numeric (monthly or oneTime)
  let best: { tier: any; score: number } | null = null;
  for (const t of tiers) {
    const m = toMoneyFromTier(t);
    if (!m) continue;
    const score = isNum(m.monthly) ? m.monthly! : isNum(m.oneTime) ? m.oneTime! : Number.POSITIVE_INFINITY;
    if (!best || score < best.score) best = { tier: t, score };
  }
  return best ? toMoneyFromTier(best.tier) : undefined;
}

// -----------------------------
// Normalizers (public objects)
// -----------------------------
/** Normalize a ServicePackage (strict SSOT shape). */
export function normalizeServicePackage(raw: Partial<ServicePackage> & Record<string, any>): ServicePackage {
  if (!raw?.id) throw new Error("ServicePackage missing id");
  assertId(raw.id, "package id");
  const slug = coerceSlug(raw.id, raw.slug);

  const price = derivePublicPrice(raw);
  if (!price) {
    // Enforce presence of a public price in production data
    throw new Error(`ServicePackage "${raw.id}" has no public price (price or Starter tier required).`);
  }

  const includes = normalizeArray(raw.includes)
    .map(normalizeIncludesSection)
    .filter(Boolean) as IncludesSection[];

  const outcomes = normalizeOutcomesBlock(raw.outcomes);
  const faq = normalizeFAQBlock(raw.faq);
  const content = isStr(raw?.content?.html) ? { html: raw.content!.html } : undefined;

  return {
    id: raw.id,
    slug,
    service: asStr(raw.service) ?? "content",
    name: asStr(raw.name) ?? raw.id,
    summary: asStr(raw.summary),
    tier: asStr(raw.tier), // informational; not presented as public tiers
    tags: uniq(normalizeArray(raw.tags ?? [])),
    badges: normalizeArray(raw.badges ?? []),
    price,
    includes: includes.length ? includes : undefined,
    outcomes,
    faq,
    content,
    addOnRecommendations: normalizeArray(raw.addOnRecommendations ?? []),
    cardImage: raw.cardImage,
    // Note: we deliberately do NOT surface multi-tier pricing publicly.
    // Any internal tiers may stay on raw._internal; adapters should ignore them.
  };
}

/** Normalize a PackageBundle (strict SSOT shape). */
export function normalizeBundle(raw: Partial<PackageBundle> & Record<string, any>): PackageBundle {
  if (!raw?.id) throw new Error("Bundle missing id");
  assertId(raw.id, "bundle id");
  const slug = coerceSlug(raw.id, raw.slug);

  const price = coerceMoney(raw.price) ?? coerceLegacyMoney(raw.price);
  if (!price) {
    throw new Error(`Bundle "${raw.id}" missing price (Money).`);
  }

  const compareAt = coerceMoney(raw.compareAt) ?? coerceLegacyMoney(raw.compareAt);

  const includes = normalizeArray(raw.includes)
    .map(normalizeIncludesSection)
    .filter(Boolean) as IncludesSection[];

  const outcomes = normalizeOutcomesBlock(raw.outcomes);
  const faq = normalizeFAQBlock(raw.faq);
  const content = isStr(raw?.content?.html) ? { html: raw.content!.html } : undefined;

  return {
    id: raw.id,
    slug,
    service: asStr(raw.service) ?? undefined, // optional hint for filters
    name: asStr(raw.name) ?? raw.id,
    subtitle: asStr(raw.subtitle) ?? asStr(raw.summary),
    summary: asStr(raw.summary),
    price,
    compareAt,
    components: normalizeArray(raw.components ?? []),
    badges: normalizeArray(raw.badges ?? []),
    tags: uniq(normalizeArray(raw.tags ?? [])),
    includes: includes.length ? includes : undefined,
    outcomes,
    faq,
    content,
    cardImage: raw.cardImage,
  };
}

/** Normalize an AddOn. Accepts legacy keys (`deliverables`, `bullets`, `setup`). */
export function normalizeAddOn(raw: Partial<AddOn> & Record<string, any>): AddOn {
  // Accept `id` or `slug` for identifier.
  const id = asStr(raw.id) ?? asStr(raw.slug);
  if (!id) throw new Error("AddOn missing id/slug");
  assertId(id, "addon id");

  const price =
    coerceMoney(raw.price) ??
    coerceLegacyMoney(raw.price) ??
    coerceMoney({
      // legacy helpers (support { setup, monthly })
      oneTime: isNum(raw.setup) ? raw.setup : undefined,
      monthly: isNum(raw.monthly) ? raw.monthly : undefined,
      currency: raw.currency,
    });

  // Normalize bullets/deliverables to simple bullets list (labels only).
  const deliverables = normalizeArray(raw.deliverables);
  const bullets = normalizeArray(raw.bullets).concat(
    deliverables
      .map((d: any) => (isStr(d?.label) ? d.label : isStr(d) ? d : undefined))
      .filter(Boolean) as string[],
  );
  const bulletsUniq = uniq(bullets).filter(isStr) as string[];

  return {
    id,
    service: asStr(raw.service) ?? undefined,
    name: asStr(raw.name) ?? id,
    description: asStr(raw.description) ?? asStr(raw.summary),
    bullets: bulletsUniq.length ? bulletsUniq : undefined,
    price: price ?? undefined,
    priceNote: asStr(raw.priceNote) ?? asStr(raw.priceMeta?.note),
    billing: (raw.billing as AddOn["billing"]) ?? (price?.oneTime && price?.monthly ? "hybrid" : price?.monthly ? "monthly" : "one-time"),
    popular: Boolean(raw.popular),
    pairsBestWith: normalizeArray(raw.pairsBestWith ?? []),
  };
}

/** Dedupe & sanitize lists of featured slugs (presentation-only). */
export function normalizeFeaturedList(slugs: unknown): string[] {
  if (!Array.isArray(slugs)) return [];
  return uniq(
    slugs
      .map((s) => (isStr(s) ? s : undefined))
      .filter(Boolean) as string[],
  );
}

// -----------------------------------
// Convenience presentation mappers
// -----------------------------------
/** Minimal bundle → card-friendly shape (keeps naming parity with adapters). */
export function toPackageBundle(b: PackageBundle): PackageBundle {
  // Already normalized; return as-is (helper kept for back-compat parity).
  return b;
}
