// src/packages/lib/mappers/to-card.ts
import type { CardModel, Package } from "../package-types";

/** Flatten union features to plain strings for compact card displays. */
function stringFeatures(pkg: Package, max = 5): string[] {
  const out: string[] = [];

  // 1) use explicit `features` first (prefer author intent)
  if (Array.isArray(pkg.features)) {
    for (const f of pkg.features) {
      if (typeof f === "string") out.push(f);
      else if (f && typeof f === "object" && "label" in f && typeof f.label === "string") out.push(f.label);
      if (out.length >= max) return out;
    }
  }

  // 2) fallback: take items from the first include group
  if (out.length < max && Array.isArray(pkg.includes) && pkg.includes.length > 0) {
    for (const item of pkg.includes[0].items) {
      if (typeof item === "string") out.push(item);
      else if (item && typeof item === "object" && "label" in item && typeof item.label === "string") out.push(item.label);
      if (out.length >= max) break;
    }
  }

  return out;
}

/**
 * Build a minimal, UI-agnostic card model.
 * NOTE: We DO NOT pass priceBand copy to cards (detail-only invariant).
 */
export function toCard(pkg: Package): CardModel {
  return {
    slug: pkg.slug,
    name: pkg.name,
    summary: pkg.summary,
    description: pkg.description,
    service: pkg.service,
    tier: pkg.tier,
    tags: pkg.tags,
    badges: pkg.badges,
    image: pkg.image,
    price: pkg.price, // SSOT Money; PackageCard will render band/label itself
    features: stringFeatures(pkg, 5),
  };
}
