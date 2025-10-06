// scripts/packages/validate.ts
/**
 * Packages Validator (schema + featured + growth)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Run multiple integrity checks for the Packages registry:
 *   • --schema   Validate all registry JSON against the SSOT Zod schema
 *   • --featured Verify that featured slugs (env/config) exist in the registry
 *   • --growth   Verify that growth embed configs reference valid slugs
 *
 * Exit codes
 * -----------------------------------------------------------------------------
 *   0  success (all requested checks passed or were intentionally skipped)
 *   1  failure (one or more requested checks failed)
 *
 * Typical usage
 * -----------------------------------------------------------------------------
 *   # All checks:
 *   pnpm tsx scripts/packages/validate.ts --all
 *
 *   # Specific checks:
 *   pnpm tsx scripts/packages/validate.ts --schema --featured
 *
 *   # With explicit paths:
 *   pnpm tsx scripts/packages/validate.ts \
 *     --schema \
 *     --featured --featured-file=config/featured.json \
 *     --growth --growth-file=config/growth-embeds.json
 *
 * Supported config sources
 * -----------------------------------------------------------------------------
 * FEATURED:
 *   • ENV (comma lists):
 *       NEXT_PUBLIC_PACKAGES_FEATURED_GLOBAL
 *       NEXT_PUBLIC_PACKAGES_FEATURED_SEO
 *       NEXT_PUBLIC_PACKAGES_FEATURED_MARKETING
 *       NEXT_PUBLIC_PACKAGES_FEATURED_CONTENT
 *       NEXT_PUBLIC_PACKAGES_FEATURED_WEB
 *       NEXT_PUBLIC_PACKAGES_FEATURED_VIDEO
 *       NEXT_PUBLIC_PACKAGES_FEATURED_LEADGEN
 *     (Any env that starts with NEXT_PUBLIC_PACKAGES_FEATURED_ is read.)
 *   • File (JSON): see `readFeaturedConfig()`. Example shape:
 *       {
 *         "global": ["seo-starter"],
 *         "seo-services": ["seo-starter", "local-seo-pro"]
 *       }
 *
 * GROWTH:
 *   • File (JSON): see `readGrowthConfig()`. Tolerant shapes:
 *       { "slugs": ["p1","p2"] }
 *       { "sectionA": ["p1"], "sectionB": ["p2"] }
 *       ["p1","p2"]
 *       [{ "slugs": ["p1"] }, { "slugs": ["p2"] }]
 *
 * Notes
 * -----------------------------------------------------------------------------
 * - Uses the registry loader to discover+validate packages (SSOT schema).
 * - Prints Zod issues with file paths and schema paths: "path → nested → field".
 * - Designed for CI/CD and local dev. Deterministic logs.
 */

import { loadAllPackages, indexBySlug } from "@/packages/lib/registry/loader";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/* =============================================================================
 * Tiny color helpers (no chalk dependency)
 * ============================================================================= */
const color = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/* =============================================================================
 * CLI args
 * ============================================================================= */

type Args = {
  schema: boolean;
  featured: boolean;
  growth: boolean;
  all: boolean;
  registryRoot?: string;
  configDir?: string;
  featuredFile?: string;
  growthFile?: string;
  quiet: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);

  const has = (flag: string) => argv.includes(flag);
  const get = (key: string) => {
    const p = `--${key}=`;
    const hit = argv.find((a) => a.startsWith(p));
    return hit ? hit.slice(p.length) : undefined;
  };

  const schema = has("--schema") || has("--all");
  const featured = has("--featured") || has("--all");
  const growth = has("--growth") || has("--all");

  return {
    schema,
    featured,
    growth,
    all: has("--all"),
    registryRoot: get("registry-root") || process.env.PACKAGES_REGISTRY_ROOT,
    configDir: get("config-dir") || process.env.PACKAGES_CONFIG_DIR,
    featuredFile: get("featured-file") || process.env.PACKAGES_FEATURED_FILE,
    growthFile: get("growth-file") || process.env.PACKAGES_GROWTH_FILE,
    quiet: has("--quiet") || process.env.PACKAGES_QUIET === "1",
  };
}

/* =============================================================================
 * Helpers: IO + parsing
 * ============================================================================= */

async function readJsonFile<T = unknown>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

/** Flatten array-like or object-like values into an array of strings. */
function flattenStringValues(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap((x) => flattenStringValues(x));
  if (typeof input === "object") {
    const out: string[] = [];
    for (const v of Object.values(input as Record<string, unknown>)) {
      out.push(...flattenStringValues(v));
    }
    return out;
  }
  if (typeof input === "string") return [input];
  return [];
}

/* ---- FEATURED config readers --------------------------------------------- */

type FeaturedConfig = { [k: string]: string[] | undefined } & { global?: string[] };

/**
 * Read featured slugs from environment variables.
 * Any env var starting with NEXT_PUBLIC_PACKAGES_FEATURED_ is parsed as CSV.
 */
function readFeaturedFromEnv(): FeaturedConfig {
  const cfg: FeaturedConfig = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (!k.startsWith("NEXT_PUBLIC_PACKAGES_FEATURED_")) continue;
    if (!v) continue;
    const key = k.replace("NEXT_PUBLIC_PACKAGES_FEATURED_", "").toLowerCase();
    const values = v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    // Map some common aliases to canonical keys:
    const canonical =
      key === "seo" ? "seo-services" :
      key === "marketing" ? "marketing-services" :
      key === "content" ? "content-services" :
      key === "web" ? "web-development" :
      key === "video" ? "video-production" :
      key === "leadgen" ? "lead-generation" :
      key; // e.g., "global"
    cfg[canonical] = values;
  }
  return cfg;
}

/**
 * Read featured slugs from a JSON file (if present).
 * Shape can be:
 *   { "global": [...], "seo-services": ["slug-a", "slug-b"], ... }
 */
async function readFeaturedFromFile(featuredFile?: string, configDir?: string): Promise<FeaturedConfig | undefined> {
  const file =
    featuredFile ??
    (configDir ? path.join(configDir, "featured.json") : "config/featured.json");
  try {
    const obj = await readJsonFile<FeaturedConfig>(file);
    return obj ?? undefined;
  } catch {
    return undefined;
  }
}

/** Combine env and file sources; file values win if both define the same key. */
async function readFeaturedConfig(featuredFile?: string, configDir?: string) {
  const envCfg = readFeaturedFromEnv();
  const fileCfg = await readFeaturedFromFile(featuredFile, configDir);
  return { ...envCfg, ...(fileCfg ?? {}) } as FeaturedConfig;
}

/* ---- GROWTH config readers ----------------------------------------------- */

/**
 * Read growth embed slugs from JSON file (tolerant shapes):
 *   • { "slugs": ["p1","p2"] }
 *   • { "sectionA": ["p1"], "sectionB": ["p2"] }
 *   • ["p1","p2"]
 *   • [{ "slugs": ["p1"] }, { "slugs": ["p2"] }]
 */
async function readGrowthConfig(growthFile?: string, configDir?: string): Promise<string[] | undefined> {
  const file =
    growthFile ??
    (configDir ? path.join(configDir, "growth-embeds.json") : "config/growth-embeds.json");
  try {
    const obj = await readJsonFile<unknown>(file);
    if (!obj) return [];
    // Extract strings from any of the tolerated shapes
    if (Array.isArray(obj)) {
      // Array of strings, or array of objects with { slugs }
      if (obj.every((x) => typeof x === "string")) return obj as string[];
      const merged = (obj as any[]).flatMap((o) => (Array.isArray(o?.slugs) ? o.slugs : []));
      return merged;
    }
    if (typeof obj === "object") {
      const o = obj as any;
      if (Array.isArray(o.slugs)) return o.slugs as string[];
      // Object of sections -> arrays
      return flattenStringValues(o);
    }
    return [];
  } catch {
    return undefined;
  }
}

/* =============================================================================
 * Checkers
 * ============================================================================= */

async function checkSchema(registryRoot?: string, quiet = false): Promise<{ ok: boolean; count: number; duplicates: string[] }> {
  const t0 = Date.now();
  const { items, errors } = await loadAllPackages({ registryRoot });

  // Detect duplicate slugs across registry tree (same slug under different dirs)
  const seen = new Map<string, number>();
  const dups: string[] = [];
  for (const it of items) {
    const n = (seen.get(it.entry.slug) ?? 0) + 1;
    seen.set(it.entry.slug, n);
  }
  for (const [slug, n] of seen.entries()) if (n > 1) dups.push(slug);

  if (errors.length === 0 && dups.length === 0) {
    if (!quiet) {
      console.log(`${color.green("✔")} Schema OK ${color.dim(`(${items.length} packages in ${Date.now() - t0}ms)`)}`);
    }
    return { ok: true, count: items.length, duplicates: [] };
  }

  if (errors.length) {
    console.error(color.red("✖ Schema validation errors"));
    for (const e of errors) {
      console.error(`  • ${color.bold(e.file ?? e.entry?.jsonPath ?? "(unknown file)")}`);
      const messageLines = String(e.message || "").split("\n").map((l) => l.trimEnd());
      for (const line of messageLines) console.error(color.gray(`    ${line}`));
      if (Array.isArray(e.zodIssues)) {
        for (const [i, issue] of (e.zodIssues as any[]).entries()) {
          const p = Array.isArray(issue.path) ? issue.path.join(" → ") : "(root)";
          console.error(`    ${color.yellow(`#${i + 1}`)} ${p}: ${issue.message}`);
        }
      }
    }
  }

  if (dups.length) {
    console.error(color.red("✖ Duplicate slugs found (appear in multiple registry folders):"));
    for (const s of dups) console.error(`  • ${s}`);
  }

  return { ok: false, count: items.length, duplicates: dups };
}

async function checkFeatured(
  registryRoot?: string,
  featuredFile?: string,
  configDir?: string,
  quiet = false,
): Promise<{ ok: boolean; missing: string[]; referenced: number }> {
  const cfg = await readFeaturedConfig(featuredFile, configDir);
  const allFeatured = new Set<string>();
  for (const value of Object.values(cfg)) {
    (value ?? []).forEach((s) => allFeatured.add(s));
  }
  if (allFeatured.size === 0) {
    if (!quiet) console.log(`${color.yellow("⚠")} No featured config found (env nor file). Skipping.`);
    return { ok: true, missing: [], referenced: 0 };
  }

  const bySlug = await indexBySlug({ registryRoot });
  const missing = [...allFeatured].filter((s) => !bySlug[s]);

  if (missing.length) {
    console.error(color.red("✖ Featured references missing:"));
    missing.forEach((s) => console.error(`  • ${s}`));
    return { ok: false, missing, referenced: allFeatured.size };
  }

  if (!quiet) console.log(`${color.green("✔")} Featured references OK ${color.dim(`(${allFeatured.size} slugs)`)}`);
  return { ok: true, missing: [], referenced: allFeatured.size };
}

async function checkGrowth(
  registryRoot?: string,
  growthFile?: string,
  configDir?: string,
  quiet = false,
): Promise<{ ok: boolean; missing: string[]; referenced: number }> {
  const slugs = await readGrowthConfig(growthFile, configDir);
  if (!slugs || slugs.length === 0) {
    if (!quiet) console.log(`${color.yellow("⚠")} No growth embeds config found. Skipping.`);
    return { ok: true, missing: [], referenced: 0 };
  }

  const bySlug = await indexBySlug({ registryRoot });
  const missing = slugs.filter((s) => !bySlug[s]);

  if (missing.length) {
    console.error(color.red("✖ Growth embeds reference missing slugs:"));
    missing.forEach((s) => console.error(`  • ${s}`));
    return { ok: false, missing, referenced: slugs.length };
  }

  if (!quiet) console.log(`${color.green("✔")} Growth embeds OK ${color.dim(`(${slugs.length} slugs)`)}`);
  return { ok: true, missing: [], referenced: slugs.length };
}

/* =============================================================================
 * Main
 * ============================================================================= */

(async () => {
  const args = parseArgs();
  const tasks: Array<Promise<{ name: string; ok: boolean }>> = [];
  let failed = false;

  // Schema
  if (args.schema) {
    tasks.push(
      (async () => {
        const r = await checkSchema(args.registryRoot, args.quiet);
        if (!r.ok) failed = true;
        return { name: "schema", ok: r.ok };
      })(),
    );
  }

  // Featured
  if (args.featured) {
    tasks.push(
      (async () => {
        const r = await checkFeatured(args.registryRoot, args.featuredFile, args.configDir, args.quiet);
        if (!r.ok) failed = true;
        return { name: "featured", ok: r.ok };
      })(),
    );
  }

  // Growth
  if (args.growth) {
    tasks.push(
      (async () => {
        const r = await checkGrowth(args.registryRoot, args.growthFile, args.configDir, args.quiet);
        if (!r.ok) failed = true;
        return { name: "growth", ok: r.ok };
      })(),
    );
  }

  if (tasks.length === 0) {
    console.log(`${color.yellow("ℹ")} Nothing to validate. Pass flags like --schema, --featured, --growth, or --all.`);
    process.exit(0);
  }

  await Promise.all(tasks);

  if (!failed) {
    console.log(color.bold(color.green("✔ All requested checks passed")));
  } else {
    console.error(color.bold(color.red("✖ One or more checks failed")));
  }

  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error(color.red("✖ Validator crashed"), err);
  process.exit(1);
});
