/**
 * scripts/packages/build-catalog-json.ts
 * Build JSON snapshots from the TS SSOT facade for:
 *  - service bundles (and cross-service bundles)
 *  - service packages (+ under $1k slice)
 *  - service add-ons
 *  - featured (per-service)
 *
 * Output directory:
 *   src/data/packages/__generated__/catalog/
 *
 * Usage:
 *   npx tsx scripts/packages/build-catalog-json.ts
 */

import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

// ------------------------------------------------------------------
// Small FS helpers
// ------------------------------------------------------------------
async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}
async function writeJson(file: string, data: unknown) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

const OUT_DIR = "src/data/packages/__generated__/catalog";
const OUT = {
  ALL_BUNDLES: path.join(OUT_DIR, "bundles.all.json"),
  SERVICE_BUNDLES: path.join(OUT_DIR, "bundles.service.json"),
  CROSS_BUNDLES: path.join(OUT_DIR, "bundles.cross-service.json"),
  SERVICE_PACKAGES: path.join(OUT_DIR, "packages.services.json"),
  UNDER_1K: path.join(OUT_DIR, "packages.under-1k.json"),
  SERVICE_ADDONS: path.join(OUT_DIR, "addons.services.json"),
  FEATURED: path.join(OUT_DIR, "featured.json"),
  NOTE: path.join(OUT_DIR, "README.catalog.txt"),
};

type AnyObj = Record<string, any>;

async function main() {
  // 1) Load the **TS facade** (ALL_* exports, maps, etc.)
  const facadeUrl = pathToFileURL(path.resolve("src/data/packages/index.ts")).href;
  const facade: AnyObj = await import(facadeUrl);

  // Expected exports (from your updated facade)
  const {
    SERVICE_BUNDLES = [],
    GROWTH_BUNDLES = [],
    ALL_BUNDLES = [],
    SERVICE_PACKAGES = {},
    ALL_PACKAGES = [],
    SERVICE_ADDONS = {},
    ALL_ADDONS = [],
    UNDER_1K_PACKAGES = [],
  } = facade;

  // 2) Featured (optional): try Featured/index or use global FEATURED_BUNDLE_SLUGS
  let FEATURED: Record<string, string[]> = {};
  try {
    const featuredUrl = pathToFileURL(
      path.resolve("src/data/packages/Featured/index.ts")
    ).href;
    const mod: AnyObj = await import(featuredUrl);
    // Expect either default export of a map, or named FEATURED
    FEATURED = (mod.default as Record<string, string[]>) ?? (mod.FEATURED as Record<string, string[]>) ?? {};
  } catch {
    const slugs = (facade.FEATURED_BUNDLE_SLUGS as string[]) ?? [];
    FEATURED = { global: slugs };
  }

  // 3) Write all catalog slices
  await writeJson(OUT.ALL_BUNDLES, ALL_BUNDLES);
  await writeJson(OUT.SERVICE_BUNDLES, SERVICE_BUNDLES);
  await writeJson(OUT.CROSS_BUNDLES, GROWTH_BUNDLES);
  await writeJson(OUT.SERVICE_PACKAGES, SERVICE_PACKAGES);
  await writeJson(OUT.UNDER_1K, UNDER_1K_PACKAGES);
  await writeJson(OUT.SERVICE_ADDONS, SERVICE_ADDONS);
  await writeJson(OUT.FEATURED, FEATURED);

  // 4) Write a small breadcrumb/readme
  const note = [
    "Catalog JSON (generated from TS SSOT):",
    `• bundles.all.json            (${ALL_BUNDLES.length})`,
    `• bundles.service.json        (services: ${Object.keys(SERVICE_BUNDLES).length || "—"})`,
    `• bundles.cross-service.json  (${GROWTH_BUNDLES.length})`,
    `• packages.services.json      (services: ${Object.keys(SERVICE_PACKAGES).length})`,
    `• packages.under-1k.json      (${UNDER_1K_PACKAGES.length})`,
    `• addons.services.json        (services: ${Object.keys(SERVICE_ADDONS).length})`,
    `• featured.json               (keys: ${Object.keys(FEATURED).join(", ") || "—"})`,
    "",
    "Source of truth: src/data/packages/index.ts (TypeScript)",
  ].join("\n");
  await ensureDir(OUT_DIR);
  await fs.writeFile(OUT.NOTE, note + "\n", "utf8");

  console.log("📦 Built catalog JSON →", OUT_DIR);
}

main().catch((err) => {
  console.error("❌ build-catalog-json failed\n", err);
  process.exit(1);
});
