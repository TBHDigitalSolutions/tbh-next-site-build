// src/packages/lib/jsonld.tsx
"use client";

import * as React from "react";
import type { PackageBundle } from "@/packages/lib/types";

/**
 * Safely stringify JSON for embedding inside a <script> tag.
 * Escapes `<` to avoid prematurely closing the script.
 */
function safeStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/* ----------------------------------------------------------------------------
 * Public: ItemList (for hubs / rails)
 * ---------------------------------------------------------------------------- */

export type ItemListEntry = { name: string; url: string };

/** Build the ItemList object (handy for tests or server utilities). */
export function buildItemListJsonLd(items: ItemListEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  } as const;
}

/** Emit a <script> tag with ItemList JSON-LD. */
export function emitItemListJsonLd(items: ItemListEntry[]) {
  const obj = buildItemListJsonLd(items);
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeStringify(obj) }}
    />
  );
}

/* ----------------------------------------------------------------------------
 * Public: Service (bundle detail page)
 * - Includes `offers` only when price exists
 * ---------------------------------------------------------------------------- */

/** Minimal, tolerant price shape used for JSON-LD offers. */
type SimplePrice = { monthly?: number; oneTime?: number; currency?: string };

/** Try to parse a human price string like "$7,500/mo" → 7500. */
function parseMoneyLike(input?: unknown): number | undefined {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input !== "string") return undefined;
  const digits = input.replace(/[^\d.]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Derive a simple price from common tiered pricing shapes when bundle.price
 * isn’t present. Looks for:
 * - `pricing.tiers[].price.monthly` / `pricing.tiers[].price.setup`
 * - or `pricing.tiers[].price` + `pricing.tiers[].period` ("month" / "one-time" / "setup")
 * Picks the MIN value for each dimension as the “starting price”.
 */
function derivePriceFromTiers(bundle: any): SimplePrice | undefined {
  const tiers = bundle?.pricing?.tiers;
  if (!Array.isArray(tiers)) return undefined;

  let monthly: number | undefined;
  let oneTime: number | undefined;

  for (const t of tiers) {
    // Case A: structured price object
    const pm = parseMoneyLike(t?.price?.monthly);
    const po = parseMoneyLike(t?.price?.setup ?? t?.price?.oneTime);
    if (pm != null) monthly = monthly == null ? pm : Math.min(monthly, pm);
    if (po != null) oneTime = oneTime == null ? po : Math.min(oneTime, po);

    // Case B: flat price + period
    const flat = parseMoneyLike(t?.price);
    const period = String(t?.period ?? "").toLowerCase();
    if (flat != null) {
      if (period.includes("month")) {
        monthly = monthly == null ? flat : Math.min(monthly, flat);
      }
      if (period.includes("one-time") || period.includes("one time") || period.includes("setup")) {
        oneTime = oneTime == null ? flat : Math.min(oneTime, flat);
      }
    }
  }

  if (monthly == null && oneTime == null) return undefined;
  return { monthly, oneTime, currency: "USD" };
}

/** Resolve a normalized price from a bundle (explicit price wins). */
function resolvePrice(bundle: any): SimplePrice | undefined {
  if (bundle?.price && (bundle.price.monthly != null || bundle.price.oneTime != null)) {
    return {
      monthly: typeof bundle.price.monthly === "number" ? bundle.price.monthly : parseMoneyLike(bundle.price.monthly),
      oneTime: typeof bundle.price.oneTime === "number" ? bundle.price.oneTime : parseMoneyLike(bundle.price.oneTime),
      currency: (bundle.price.currency ?? "USD") as string,
    };
  }
  return derivePriceFromTiers(bundle);
}

/** Extract best-available name/description from mixed bundle shapes. */
function coerceMeta(b: any): { name: string; description: string; url?: string } {
  const name = b?.name ?? b?.title ?? b?.hero?.content?.title ?? "Package";
  const description =
    b?.description ?? b?.summary ?? b?.subtitle ?? b?.hero?.content?.subtitle ?? "";
  const url = b?.slug ? `/packages/${b.slug}` : undefined;
  return { name, description, url };
}

export function hasServicePrice(bundle: PackageBundle): boolean {
  const price = resolvePrice(bundle);
  return price != null && (price.monthly != null || price.oneTime != null);
}

/** Build the Service JSON-LD object. Only include `offers` when pricing exists. */
export function buildServiceJsonLd(bundle: PackageBundle) {
  const meta = coerceMeta(bundle as any);
  const price = resolvePrice(bundle);
  const currency = (price?.currency ?? "USD") as string;

  const offers: Array<Record<string, unknown>> = [];
  if (price?.monthly != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(price.monthly),
      availability: "https://schema.org/InStock",
      description: `${meta.name} — monthly`,
      ...(meta.url ? { url: meta.url } : {}),
    });
  }
  if (price?.oneTime != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(price.oneTime),
      availability: "https://schema.org/InStock",
      description: `${meta.name} — setup`,
      ...(meta.url ? { url: meta.url } : {}),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: meta.name,
    description: meta.description,
    ...(meta.url ? { url: meta.url } : {}),
    ...(offers.length ? { offers } : {}),
  } as const;
}

/** Emit a <script> tag with Service JSON-LD (offers only if price exists). */
export function emitServiceJsonLd(bundle: PackageBundle) {
  if (!hasServicePrice(bundle)) return null;
  const obj = buildServiceJsonLd(bundle);
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeStringify(obj) }}
    />
  );
}
