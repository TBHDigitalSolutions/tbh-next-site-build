// src/packages/lib/loader.ts
import { PackageSchema } from "./package-schema";
import type { Package } from "./package-types";

/**
 * Accepts already-camelCase JSON and validates it.
 * If you ever need to accept a legacy snake_case payload, you can add a
 * transform step here (snake → camel) before parsing.
 */
export function loadPackage(json: unknown): Package {
  return PackageSchema.parse(json);
}

export function safeLoadPackage(json: unknown) {
  return PackageSchema.safeParse(json);
}
