// src/packages/lib/package-types.ts
import { z } from "zod";
import {
  PackageSchema,
  MoneySchema,
  PriceBandSchema,
  IncludeGroupSchema,
  IncludesTableSchema,
  FaqSchema,
  PhaseCopySchema,
} from "./package-schema";

/** Primary runtime type (what the app consumes). */
export type Package = z.infer<typeof PackageSchema>;

/** Shared atoms (exported for UI/runtime). */
export type Money = z.infer<typeof MoneySchema>;
export type PriceBand = z.infer<typeof PriceBandSchema>;
export type IncludeGroup = z.infer<typeof IncludeGroupSchema>;
export type IncludesTable = z.infer<typeof IncludesTableSchema>;
export type Faq = z.infer<typeof FaqSchema>;
export type PhaseCopy = z.infer<typeof PhaseCopySchema>;

/** Minimal, UI-agnostic card model built from a Package (mapper output). */
export type CardModel = {
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  service: Package["service"];
  tier?: string;
  tags?: string[];
  badges?: string[];
  image?: { src: string; alt: string };
  price?: Money;
  /** Up to 5 human-readable highlights for compact displays. */
  features?: string[];
};
