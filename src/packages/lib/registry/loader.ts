// src/packages/lib/registry/loader.ts
/**
 * Registry Loader (master)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * A minimal, framework-agnostic loader for your **package registry** that:
 *   1) discovers `content.generated.json` files under `src/packages/registry/**`
 *   2) reads + parses JSON
 *   3) validates the result against the **single source of truth** runtime schema
 *      via `parsePackage` (from `src/packages/lib/package-schema.ts`)
 *
 * This module **replaces** the broader `src/packages/lib/registry.ts` concerns.
 * Keep "service directories, featured, marketing helpers, etc." elsewhere.
 *
 * Why keep this small?
 * -----------------------------------------------------------------------------
 * - The loader is used by build/SSG—stability and clarity matter more than features.
 * - The SSOT for content shape is enforced centrally in `package-schema.ts`.
 * - Separation-of-concerns: this file does *I/O + validation*, nothing else.
 *
 * Typical usage
 * -----------------------------------------------------------------------------
 *   import {
 *     discoverPackageEntries,
 *     loadAllPackages,
 *     loadPackageBySlug,
 *     collectPackageRoutes
 *   } from "@/packages/lib/registry/loader";
 *
 *   // SSG (Next.js)
 *   export async function generateStaticParams() {
 *     return collectPackageRoutes().then((slugs) => slugs.map((slug) => ({ slug })));
 *   }
 *
 *   // Build-time indexer
 *   const { items, errors } = await loadAllPackages();
 *   if (errors.length) { ...report... }
 *
 * Design rules
 * -----------------------------------------------------------------------------
 * - **No React**. Pure Node-compatible TypeScript.
 * - **No schema duplication**. Validation uses `parsePackage` only.
 * - **Pure I/O** + light metadata parsing. No presentation, no pricing logic.
 * - **Helpful errors** with clear file paths and schema paths when available.
 */

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { parsePackage, type PackageSchemaType } from "@/packages/lib/package-schema";

/* =============================================================================
 * Constants & types
 * ============================================================================= */

/** Default registry root. Override via function options if your tree differs. */
export const DEFAULT_REGISTRY_ROOT = path.resolve(
  process.cwd(),
  "src/packages/registry"
);

/**
 * Our registry convention is:
 *   src/packages/registry/<service-dir>/<slug>/content.generated.json
 * e.g.
 *   src/packages/registry/lead-generation-packages/lead-routing-distribution/content.generated.json
 */
export const REGISTRY_FILENAME = "content.generated.json";

/** Glob used to find all package records. */
export function buildGlobPattern(registryRoot = DEFAULT_REGISTRY_ROOT) {
  // Ensure POSIX separators for fast-glob
  const rootPosix = path
    .resolve(registryRoot)
    .split(path.sep)
    .join(path.posix.sep);
  return `${rootPosix}/**/${REGISTRY_FILENAME}`;
}

/** A discovered package entry on disk (metadata about the file location). */
export type RegistryEntry = {
  /** Absolute path to the JSON file. */
  jsonPath: string;
  /** Directory that contains the JSON (i.e., slug folder). */
  dir: string;
  /** E.g., "lead-generation-packages" (first directory after /registry). */
  serviceDir: string;
  /** Final directory name; we treat it as the slug. */
  slug: string;
};

/** Result shape for bulk loading (keeps successes and detailed errors). */
export type BulkLoadResult = {
  items: Array<{ entry: RegistryEntry; data: PackageSchemaType }>;
  errors: Array<{
    entry?: RegistryEntry;
    file?: string;
    message: string;
    zodIssues?: unknown;
  }>;
};

/* =============================================================================
 * Path parsing helpers
 * ============================================================================= */

/**
 * Given an absolute path to a `content.generated.json`, derive:
 *   - containing directory
 *   - serviceDir (first directory after "registry")
 *   - slug     (last directory name)
 */
export function parseEntryFromPath(jsonPath: string): RegistryEntry {
  const abs = path.resolve(jsonPath);
  const dir = path.dirname(abs);

  // Expect segments: .../src/packages/registry/<serviceDir>/<slug>/content.generated.json
  const parts = abs.split(path.sep);
  const i = parts.lastIndexOf("registry");
  if (i === -1 || i + 3 >= parts.length) {
    // Fall back: try to glean slug from parent
    const slugFallback = path.basename(path.dirname(abs));
    return {
      jsonPath: abs,
      dir,
      serviceDir: "unknown",
      slug: slugFallback || "unknown",
    };
  }

  const serviceDir = parts[i + 1] ?? "unknown";
  const slug = parts[i + 2] ?? path.basename(dir) ?? "unknown";

  return { jsonPath: abs, dir, serviceDir, slug };
}

/* =============================================================================
 * Discovery
 * ============================================================================= */

/**
 * Discover all `content.generated.json` files in the registry tree.
 * Returns deterministic, sorted entries across platforms.
 */
export async function discoverPackageEntries(
  opts: { registryRoot?: string } = {}
): Promise<RegistryEntry[]> {
  const pattern = buildGlobPattern(opts.registryRoot);
  const files = await fg(pattern, { dot: false, onlyFiles: true });
  const entries = files.map(parseEntryFromPath);
  // Sort stable: by serviceDir, then slug
  entries.sort((a, b) =>
    a.serviceDir === b.serviceDir
      ? a.slug.localeCompare(b.slug)
      : a.serviceDir.localeCompare(b.serviceDir)
  );
  return entries;
}

/* =============================================================================
 * JSON reading + validation
 * ============================================================================= */

/** Read a file as UTF-8; throw with a helpful message on failure. */
async function readFileUtf8(file: string): Promise<string> {
  try {
    return await fs.readFile(file, "utf8");
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    throw new Error(`Failed to read file: ${file}\n${msg}`);
  }
}

/** Parse JSON with a friendly error that includes the path. */
function parseJsonSafe<T = unknown>(raw: string, file: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    throw new Error(`Invalid JSON (${file}): ${msg}`);
  }
}

/**
 * Validate an unknown object as a runtime package using the SSOT schema.
 * We expose this tiny wrapper so all errors are consistently shaped.
 */
function validatePackageOrThrow(obj: unknown, file: string): PackageSchemaType {
  try {
    return parsePackage(obj);
  } catch (err: any) {
    // If this is a ZodError, surface issues in a structured way.
    const issues = err?.issues ?? undefined;
    const header = `Schema validation failed for: ${file}`;
    const details =
      issues && Array.isArray(issues)
        ? issues
            .map((it: any, i: number) => {
              const path = (it.path ?? []).join(" → ") || "(root)";
              return `  [${i + 1}] ${path}: ${it.message}`;
            })
            .join("\n")
        : (err?.message ?? String(err));
    const e = new Error(`${header}\n${details}`);
    (e as any).issues = issues;
    throw e;
  }
}

/* =============================================================================
 * Public loader APIs
 * ============================================================================= */

/**
 * Load & validate a single package by absolute JSON path.
 * Use this if you already know the file location on disk.
 */
export async function loadPackageByFile(
  jsonPath: string
): Promise<{ entry: RegistryEntry; data: PackageSchemaType }> {
  const entry = parseEntryFromPath(jsonPath);
  const raw = await readFileUtf8(entry.jsonPath);
  const obj = parseJsonSafe(raw, entry.jsonPath);
  const data = validatePackageOrThrow(obj, entry.jsonPath);
  return { entry, data };
}

/**
 * Load & validate by `(serviceDir, slug)` pair using the registry convention.
 * Example:
 *   await loadPackageBySlug("lead-generation-packages", "lead-routing-distribution")
 */
export async function loadPackageBySlug(
  serviceDir: string,
  slug: string,
  opts: { registryRoot?: string } = {}
): Promise<{ entry: RegistryEntry; data: PackageSchemaType }> {
  const registryRoot = path.resolve(opts.registryRoot ?? DEFAULT_REGISTRY_ROOT);
  const jsonPath = path.join(registryRoot, serviceDir, slug, REGISTRY_FILENAME);
  return loadPackageByFile(jsonPath);
}

/**
 * Load & validate the first package found across **any** serviceDir for a given slug.
 * This is handy for callers that know the slug but not the exact serviceDir.
 * If multiple packages share a slug, the first discovered is returned.
 */
export async function loadBySlugAcrossServices(
  slug: string,
  opts: { registryRoot?: string } = {}
): Promise<{ entry: RegistryEntry; data: PackageSchemaType } | undefined> {
  const entries = await discoverPackageEntries(opts);
  const match = entries.find((e) => e.slug === slug);
  if (!match) return undefined;
  return loadPackageByFile(match.jsonPath);
}

/**
 * Bulk loader:
 * - discovers all registry entries
 * - loads, parses, and validates each
 * - returns successes and a **detailed** list of errors instead of throwing
 *
 * Typical for build scripts and SSG preloaders.
 */
export async function loadAllPackages(
  opts: { registryRoot?: string } = {}
): Promise<BulkLoadResult> {
  const entries = await discoverPackageEntries(opts);

  const items: BulkLoadResult["items"] = [];
  const errors: BulkLoadResult["errors"] = [];

  for (const entry of entries) {
    try {
      const raw = await readFileUtf8(entry.jsonPath);
      const obj = parseJsonSafe(raw, entry.jsonPath);
      const data = validatePackageOrThrow(obj, entry.jsonPath);
      items.push({ entry, data });
    } catch (err: any) {
      errors.push({
        entry,
        file: entry.jsonPath,
        message: err?.message ?? String(err),
        zodIssues: err?.issues,
      });
    }
  }

  return { items, errors };
}

/* =============================================================================
 * Small helpers commonly used by app/SSG code
 * ============================================================================= */

/**
 * Return just the list of slugs discovered in the registry.
 * Useful for `generateStaticParams` in Next.js.
 */
export async function collectPackageSlugs(
  opts: { registryRoot?: string } = {}
): Promise<string[]> {
  const entries = await discoverPackageEntries(opts);
  // Deduplicate while preserving discovery order
  return Array.from(new Set(entries.map((e) => e.slug)));
}

/**
 * Tiny helper that returns strings such as `/packages/[slug]` → slugs array.
 * Your SSG routing can map these to `{ params: { slug } }` as needed.
 */
export async function collectPackageRoutes(
  opts: { registryRoot?: string } = {}
): Promise<string[]> {
  const slugs = await collectPackageSlugs(opts);
  return slugs.map((s) => `/packages/${s}`);
}

/**
 * Quick index by slug for fast lookups in scripts.
 * Useful when you need O(1) get-by-slug on a small dataset.
 */
export async function indexBySlug(
  opts: { registryRoot?: string } = {}
): Promise<Record<string, PackageSchemaType>> {
  const { items } = await loadAllPackages(opts);
  const map: Record<string, PackageSchemaType> = {};
  for (const { entry, data } of items) map[entry.slug] = data;
  return map;
}

/* =============================================================================
 * Optional in-memory cache (opt-in)
 * =============================================================================
 * Caching is intentionally simple—clear whenever your build regenerates
 * `content.generated.json` files. Callers opt in per invocation.
 */

const _cache = new Map<string, PackageSchemaType>();

/**
 * Load with a simple in-memory cache keyed by absolute JSON path.
 * Safe to use in build scripts to avoid re-reading unchanged files.
 */
export async function loadPackageByFileCached(
  jsonPath: string
): Promise<{ entry: RegistryEntry; data: PackageSchemaType }> {
  const entry = parseEntryFromPath(jsonPath);
  const key = entry.jsonPath;
  const hit = _cache.get(key);
  if (hit) return { entry, data: hit };
  const result = await loadPackageByFile(jsonPath);
  _cache.set(key, result.data);
  return result;
}

/** Clear the loader's in-memory cache. */
export function clearLoaderCache() {
  _cache.clear();
}

/* =============================================================================
 * End of file
 * =============================================================================
 */
