// src/packages/lib/registry/types.ts
import type { Money } from "@/packages/lib/pricing";

export type Service =
  | "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";

export type IncludesGroup = { title: string; items: string[] };

export type PriceBandCopy = {
  tagline?: string;                  // detail only; never fallback to summary
  baseNote?: "proposal" | "final";   // optional override
  finePrint?: string;                // detail only
};

export type PackageAuthoringBase = {
  id: string;
  slug: string;
  name: string;
  summary?: string;              // used on card + headline; not for band tagline
  description?: string;          // longer body copy for details
  service: Service;
  tier?: string | null;
  badges?: string[];
  image?: { src: string; alt?: string } | null;
  includes: IncludesGroup[];
  outcomes?: string[];
  tags?: string[];
  price: Money;                  // canonical price only
  priceBand?: PriceBandCopy;     // NEW: explicit band copy container
  notes?: string | string[] | null; // small-print (table area); not the band finePrint
};