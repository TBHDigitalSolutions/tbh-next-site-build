// scripts/packages/build.ts
// scripts/packages/build.ts
/**
 * Packages Data Build
 * -------------------
 * Generates/refreshes typed data entrypoints for the packages domain:
 *  - Ensures service folders exist (content/leadgen/marketing/seo/webdev/video)
 *  - Scaffolds missing service data files: *-packages.ts|md, *-addons.ts|md, *-featured.ts|md
 *  - Writes/refreshes `src/data/packages/index.ts` (central barrel + helpers)
 *  - Writes/refreshes `src/data/packages/recommendations.ts` (curated/top-N feed)
 *
 * Design:
 *  - Non-destructive: existing files are kept; missing files are scaffolded.
 *  - Idempotent: files are only written when content actually changes.
 *  - Formatting: uses Prettier when available; otherwise writes raw TS.
 *
 * Usage:
 *   pnpm tsx scripts/packages/build.ts
 *   node --loader tsx scripts/packages/build.ts
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type WriteMode = "create-or-update" | "check";
const MODE: WriteMode = (process.env.MODE as WriteMode) || "create-or-update";
const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, "src", "data", "packages");
const BUNDLES_DIR = path.join(DATA_ROOT, "bundles");

// Canonical service folders used in this repo
const SERVICES = [
  { key: "content", dir: "content-production", prefix: "content-production" },
  { key: "leadgen", dir: "lead-generation", prefix: "lead-generation" },
  { key: "marketing", dir: "marketing-services", prefix: "marketing-services" },
  { key: "seo", dir: "seo-services", prefix: "seo-services" },
  { key: "webdev", dir: "web-development", prefix: "web-development" },
  { key: "video", dir: "video-production", prefix: "video-production" },
] as const;

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function sha256(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function maybeFormatTS(content: string): Promise<string> {
  try {
    // Prettier is optional — do not hard-depend
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const prettier = await import("prettier");
    return await prettier.format(content, { parser: "typescript" });
  } catch {
    return content;
  }
}

async function writeIfChanged(filePath: string, next: string) {
  const formatted = await maybeFormatTS(next);
  const nextHash = sha256(formatted);

  if (await fileExists(filePath)) {
    const current = await fs.readFile(filePath, "utf8");
    if (sha256(current) === nextHash) {
      log(`UNCHANGED ${rel(filePath)}`);
      return false;
    }
  }

  if (MODE === "check") {
    log(`CHANGED (check only) ${rel(filePath)}`);
    return true;
  }

  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, formatted, "utf8");
  success(`WROTE ${rel(filePath)}`);
  return true;
}

function rel(p: string) {
  return path.relative(ROOT, p).replaceAll(path.sep, "/");
}

function log(msg: string) {
  console.log(`• ${msg}`);
}

function success(msg: string) {
  console.log(`✅ ${msg}`);
}

function warn(msg: string) {
  console.warn(`⚠️  ${msg}`);
}

function header(comment: string[]) {
  return `/*\n${comment.map((l) => ` * ${l}`).join("\n")}\n */\n/* eslint-disable */\n`;
}

// -------------------------------------------
// Scaffolds
// -------------------------------------------

function scaffoldServiceMd(title: string, description: string) {
  return `# ${title}

${description}

> This file is optional helper content for editors/PMs. Keep pricing numeric in TS; format in UI.
`;
}

function scaffoldPackagesTs(prefix: string) {
  return `import type { Package, FeatureItem, Price } from "@/data/packages/_types/packages.types";

/**
 * ${prefix}-packages.ts
 * Define three tiered packages for this service (Essential/Professional/Enterprise).
 * Keep pricing numeric; UI will format currency.
 */

const features = (items: string[]): FeatureItem[] => items.map((label) => ({ label }));

export const ${toVar(prefix)}Packages: Package[] = [
  {
    id: "${prefix}-essential",
    service: "${serviceKeyFromPrefix(prefix)}",
    name: "Essential",
    tier: "Essential",
    summary: "Foundational scope to start delivering outcomes quickly.",
    outcomes: [
      "Baseline performance and tracking in place",
      "Clear next-step roadmap",
      "Early quick wins identified",
    ],
    features: features([
      "Core implementation",
      "Monthly reporting",
      "Priority support SLAs",
    ]),
    price: { setup: 2500, monthly: 1000 },
    badges: ["Starter"],
    popular: false,
  },
  {
    id: "${prefix}-professional",
    service: "${serviceKeyFromPrefix(prefix)}",
    name: "Professional",
    tier: "Professional",
    summary: "Expanded scope with deeper strategy and experimentation.",
    outcomes: [
      "Consistent month-over-month improvements",
      "Experiments feeding roadmap",
      "Better attribution and insights",
    ],
    features: features([
      "Everything in Essential",
      "Increased velocity",
      "Quarterly strategy workshops",
    ]),
    price: { setup: 5000, monthly: 2500 },
    badges: ["Most Popular"],
    popular: true,
  },
  {
    id: "${prefix}-enterprise",
    service: "${serviceKeyFromPrefix(prefix)}",
    name: "Enterprise",
    tier: "Enterprise",
    summary: "Maximum scope, cross-functional alignment, and premium SLAs.",
    outcomes: [
      "Aggressive velocity across workstreams",
      "Executive-level reporting",
      "Roadmaps across teams",
    ],
    features: features([
      "Everything in Professional",
      "Cross-team coordination",
      "Premium SLAs",
    ]),
    price: { setup: 12000, monthly: 6000 },
    badges: ["Best Value"],
    popular: false,
  },
];

export default ${toVar(prefix)}Packages;
`;
}

function scaffoldAddonsTs(prefix: string) {
  return `import type { AddOn, FeatureItem, Price } from "@/data/packages/_types/packages.types";

/**
 * ${prefix}-addons.ts
 * Define optional scope add-ons attachable to packages. Pricing can be partial; leave undefined for custom.
 */

const features = (items: string[]): FeatureItem[] => items.map((label) => ({ label }));

export const ${toVar(prefix)}AddOns: AddOn[] = [
  {
    id: "${prefix}-audit",
    service: "${serviceKeyFromPrefix(prefix)}",
    name: "Deep-Dive Audit",
    description: "Comprehensive audit with prioritized recommendations.",
    deliverables: features([
      "Technical review",
      "Scorecard + roadmap",
      "Executive summary",
    ]),
    billing: "one-time",
    price: { setup: 1500 },
    popular: true,
  },
  {
    id: "${prefix}-training",
    service: "${serviceKeyFromPrefix(prefix)}",
    name: "Team Training",
    description: "Hands-on training session for your team.",
    deliverables: features([
      "Customized curriculum",
      "Live workshop",
      "Follow-up Q&A",
    ]),
    billing: "hourly",
    price: { notes: "Quoted per session" },
    popular: false,
  },
];

export default ${toVar(prefix)}AddOns;
`;
}

function scaffoldFeaturedTs(prefix: string) {
  return `import type { FeaturedCard } from "@/data/packages/_types/packages.types";

/**
 * ${prefix}-featured.ts
 * Three featured cards for this service (used on service pages).
 */

export const ${toVar(prefix)}Featured: FeaturedCard[] = [
  {
    id: "${prefix}-featured-starter",
    service: "${serviceKeyFromPrefix(prefix)}",
    packageId: "${prefix}-essential",
    headline: "Kickstart Growth",
    highlights: ["Rapid setup", "Early wins", "Clear roadmap"],
    startingAt: 2500,
    badge: "Great Value",
    ctaLabel: "See Package",
  },
  {
    id: "${prefix}-featured-pro",
    service: "${serviceKeyFromPrefix(prefix)}",
    packageId: "${prefix}-professional",
    headline: "Scale with Confidence",
    highlights: ["More velocity", "Quarterly strategy", "Data insights"],
    startingAt: 5000,
    badge: "Most Popular",
    ctaLabel: "See Package",
  },
  {
    id: "${prefix}-featured-enterprise",
    service: "${serviceKeyFromPrefix(prefix)}",
    packageId: "${prefix}-enterprise",
    headline: "Enterprise Execution",
    highlights: ["Premium SLAs", "Cross-team", "Aggressive roadmap"],
    startingAt: 12000,
    badge: "Best Value",
    ctaLabel: "See Package",
  },
];

export default ${toVar(prefix)}Featured;
`;
}

function toVar(prefix: string) {
  // e.g., "seo-services" -> "seoServices"
  return prefix.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
}

function serviceKeyFromPrefix(prefix: string) {
  // Map folder prefixes back to ServiceSlug for data (_types) layer
  if (prefix.startsWith("content")) return "content";
  if (prefix.startsWith("lead-generation")) return "leadgen";
  if (prefix.startsWith("marketing")) return "marketing";
  if (prefix.startsWith("seo")) return "seo";
  if (prefix.startsWith("web-development")) return "webdev";
  if (prefix.startsWith("video")) return "video";
  return "marketing";
}

// -------------------------------------------
// Generators: index.ts & recommendations.ts
// -------------------------------------------

function indexTsContent() {
  return header([
    "AUTO-GENERATED by scripts/packages/build.ts",
    "Do not edit by hand — your changes may be overwritten.",
  ]) + `
// src/data/packages/index.ts
import type { PackageBundle } from "@/src/packages/lib/types";
import { bundleToGrowthPackage, type GrowthPackage } from "@/src/packages/lib/bridge-growth";

// JSON data (ensure tsconfig: \"resolveJsonModule\": true)
import addOnsJson from "./addOns.json";
import bundlesJson from "./bundles.json";
import featuredJson from "./featured.json";

// --- Local types -------------------------------------------------------------

export type RawAddOn = {
  slug: string;
  name: string;
  description: string;
  price?: { oneTime?: number; monthly?: number; currency?: "USD" };
  category?: string;
};

// --- Canonical data exports --------------------------------------------------

export const ADD_ONS: RawAddOn[] = addOnsJson as RawAddOn[];
export const BUNDLES: PackageBundle[] = bundlesJson as PackageBundle[];
export const FEATURED_BUNDLE_SLUGS: string[] = Array.from(
  new Set((featuredJson as { slugs: string[] }).slugs ?? []),
);

// --- Lookups & search --------------------------------------------------------

export function getBundleBySlug(slug: string): PackageBundle | undefined {
  return BUNDLES.find((b) => b.slug === slug);
}

export function getAddOnBySlug(slug: string) {
  return ADD_ONS.find((a) => a.slug === slug);
}

export function getBundlesByService(serviceSlug: string): PackageBundle[] {
  return BUNDLES.filter((b) => (b.services ?? []).includes(serviceSlug));
}

export function searchBundles(query: string): PackageBundle[] {
  const q = query.trim().toLowerCase();
  if (!q) return BUNDLES;
  return BUNDLES.filter((b) =>
    [b.name, b.description, ...(b.includes ?? []).flatMap((s) => s.items)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

// --- Growth adapters ---------------------------------------------------------

export function toGrowthPackages(bundles: PackageBundle[]): GrowthPackage[] {
  return bundles.map(bundleToGrowthPackage);
}

export function topNForService(serviceSlug: string, n = 3): GrowthPackage[] {
  const subset = getBundlesByService(serviceSlug).slice(0, n);
  return toGrowthPackages(subset);
}

export function isAddOnUsed(slug: string): boolean {
  return BUNDLES.some((b) => (b.addOnSlugs ?? []).includes(slug));
}

export type { GrowthPackage } from "@/src/packages/lib/bridge-growth";
`;
}

function recommendationsTsContent() {
  return header([
    "AUTO-GENERATED by scripts/packages/build.ts",
    "Do not edit by hand — your changes may be overwritten.",
  ]) + `
// src/data/packages/recommendations.ts
import {
  BUNDLES,
  FEATURED_BUNDLE_SLUGS,
  getBundleBySlug,
} from "./index";
import { bundleToGrowthPackage, type GrowthPackage } from "@/src/packages/lib/bridge-growth";

/** Back-compat alias for components that import \`type Package\` from here. */
export type Package = GrowthPackage;

/** Strategy: prefer curated FEATURED_BUNDLE_SLUGS; fallback to first N bundles. */
export function getRecommendedPackages(n = 3): GrowthPackage[] {
  const curated = FEATURED_BUNDLE_SLUGS
    .map(getBundleBySlug)
    .filter(Boolean) as NonNullable<ReturnType<typeof getBundleBySlug>>[];

  const deduped = new Map<string, GrowthPackage>();
  for (const b of curated) {
    if (deduped.size >= n) break;
    deduped.set(b.slug, bundleToGrowthPackage(b));
  }
  if (deduped.size < n) {
    for (const b of BUNDLES) {
      if (deduped.size >= n) break;
      if (!deduped.has(b.slug)) deduped.set(b.slug, bundleToGrowthPackage(b));
    }
  }
  return Array.from(deduped.values()).slice(0, n);
}

/** Recommendations filtered to a given service page slug (e.g., "seo-services"). */
export function getRecommendedForService(serviceSlug: string, n = 3): GrowthPackage[] {
  const curated = FEATURED_BUNDLE_SLUGS
    .map(getBundleBySlug)
    .filter((b): b is NonNullable<ReturnType<typeof getBundleBySlug>> => !!b && (b.services ?? []).includes(serviceSlug));

  const deduped = new Map<string, GrowthPackage>();
  for (const b of curated) {
    if (deduped.size >= n) break;
    deduped.set(b.slug, bundleToGrowthPackage(b));
  }

  if (deduped.size < n) {
    for (const b of BUNDLES) {
      if (deduped.size >= n) break;
      if ((b.services ?? []).includes(serviceSlug) && !deduped.has(b.slug)) {
        deduped.set(b.slug, bundleToGrowthPackage(b));
      }
    }
  }

  return Array.from(deduped.values()).slice(0, n);
}

/** Map a list of bundle slugs to GrowthPackage cards. */
export function mapBundlesToGrowthPackages(slugs: string[]): GrowthPackage[] {
  return slugs
    .map(getBundleBySlug)
    .filter(Boolean)
    .map((b) => bundleToGrowthPackage(b as NonNullable<ReturnType<typeof getBundleBySlug>>));
}
`;
}

// -------------------------------------------
// Build workflow
// -------------------------------------------

async function scaffoldServices() {
  for (const svc of SERVICES) {
    const dir = path.join(DATA_ROOT, svc.dir);
    await ensureDir(dir);

    const mdPackages = path.join(dir, `${svc.prefix}-packages.md`);
    const tsPackages = path.join(dir, `${svc.prefix}-packages.ts`);
    const mdAddons = path.join(dir, `${svc.prefix}-addons.md`);
    const tsAddons = path.join(dir, `${svc.prefix}-addons.ts`);
    const mdFeatured = path.join(dir, `${svc.prefix}-featured.md`);
    const tsFeatured = path.join(dir, `${svc.prefix}-featured.ts`);

    // MD helper files
    if (!(await fileExists(mdPackages))) {
      await writeIfChanged(mdPackages, scaffoldServiceMd("Packages", `Author notes for ${svc.dir} packages.`));
    } else {
      log(`EXISTS ${rel(mdPackages)}`);
    }
    if (!(await fileExists(mdAddons))) {
      await writeIfChanged(mdAddons, scaffoldServiceMd("Add-ons", `Author notes for ${svc.dir} add-ons.`));
    } else {
      log(`EXISTS ${rel(mdAddons)}`);
    }
    if (!(await fileExists(mdFeatured))) {
      await writeIfChanged(mdFeatured, scaffoldServiceMd("Featured", `Author notes for ${svc.dir} featured cards.`));
    } else {
      log(`EXISTS ${rel(mdFeatured)}`);
    }

    // TS data files
    if (!(await fileExists(tsPackages))) {
      await writeIfChanged(tsPackages, scaffoldPackagesTs(svc.prefix));
    } else {
      log(`EXISTS ${rel(tsPackages)}`);
    }
    if (!(await fileExists(tsAddons))) {
      await writeIfChanged(tsAddons, scaffoldAddonsTs(svc.prefix));
    } else {
      log(`EXISTS ${rel(tsAddons)}`);
    }
    if (!(await fileExists(tsFeatured))) {
      await writeIfChanged(tsFeatured, scaffoldFeaturedTs(svc.prefix));
    } else {
      log(`EXISTS ${rel(tsFeatured)}`);
    }
  }
}

async function ensureBundlesDir() {
  await ensureDir(BUNDLES_DIR);
  log(`OK ${rel(BUNDLES_DIR)}`);
}

async function writeIndexFiles() {
  const indexTs = indexTsContent();
  const recsTs = recommendationsTsContent();

  await writeIfChanged(path.join(DATA_ROOT, "index.ts"), indexTs);
  await writeIfChanged(path.join(DATA_ROOT, "recommendations.ts"), recsTs);
}

async function main() {
  console.log("\n📦 Building packages data…\n");

  await ensureDir(DATA_ROOT);
  await ensureBundlesDir();
  await scaffoldServices();
  await writeIndexFiles();

  console.log("\n✨ Done.\n");
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exitCode = 1;
});
