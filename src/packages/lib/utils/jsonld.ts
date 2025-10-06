/**
 * JSON-LD builders (POJO only)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Build **plain objects** that conform to Schema.org JSON-LD. Callers decide
 * where/how to inject them (<script> tag on the client, server-rendered, etc.).
 *
 * Scope
 * -----------------------------------------------------------------------------
 * - ItemList (for hubs/rails)
 * - Service (for package detail), with optional Offers when pricing exists
 *
 * Design rules
 * -----------------------------------------------------------------------------
 * - No React/JSX; no I/O; deterministic builders.
 * - Use the runtime package shape for accuracy.
 */

import type { PackageSchemaType as Package } from "@/packages/lib/package-schema";

/* =============================================================================
 * ItemList
 * ============================================================================= */

export type ItemListEntry = { name: string; url: string };

/** Build an ItemList JSON-LD object. */
export function buildItemListJsonLd(items: ItemListEntry[]) {
  const listItems = items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    url: it.url,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listItems,
  } as const;
}

/* =============================================================================
 * Service (detail)
 * ============================================================================= */

type SimplePrice = { monthly?: number; oneTime?: number; currency?: string };

function normalizePrice(pkg: Package): SimplePrice | undefined {
  const m = pkg.price?.monthly;
  const o = pkg.price?.oneTime;
  const hasM = typeof m === "number" && Number.isFinite(m);
  const hasO = typeof o === "number" && Number.isFinite(o);
  if (!hasM && !hasO) return undefined;
  return {
    monthly: hasM ? (m as number) : undefined,
    oneTime: hasO ? (o as number) : undefined,
    currency: (pkg.price?.currency as string) ?? "USD",
  };
}

function metaFromPackage(pkg: Package) {
  const name = pkg.name ?? pkg.slug ?? "Package";
  const description = pkg.summary ?? pkg.description ?? "";
  const url = `/packages/${encodeURIComponent(pkg.slug)}`;
  return { name, description, url };
}

/** Build a Service JSON-LD object with optional Offers (when price exists). */
export function buildServiceJsonLd(pkg: Package) {
  const meta = metaFromPackage(pkg);
  const price = normalizePrice(pkg);
  const currency = (price?.currency ?? "USD") as string;

  const offers: Array<Record<string, unknown>> = [];

  if (price?.monthly != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(price.monthly),
      availability: "https://schema.org/InStock",
      description: `${meta.name} — monthly`,
      url: meta.url,
    });
  }

  if (price?.oneTime != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(price.oneTime),
      availability: "https://schema.org/InStock",
      description: `${meta.name} — setup`,
      url: meta.url,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: meta.name,
    description: meta.description,
    url: meta.url,
    ...(offers.length ? { offers } : {}),
  } as const;
}

/* =============================================================================
 * Optional helper — safe stringify for <script> injection
 * ============================================================================= */

/**
 * Escape `<` so JSON can be safely embedded in a `<script>` tag without
 * prematurely closing it. Consumers may still choose their own injection method.
 */
export function safeStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
