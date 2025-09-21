#!/usr/bin/env tsx
// scripts/packages/validate-packages.ts
/**
 * Validate Packages Data
 * ----------------------
 * Performs schema validation (via Zod) and cross-reference checks across:
 *   • src/data/packages/bundles.json
 *   • src/data/packages/addOns.json
 *   • src/data/packages/featured.json
 *
 * Checks:
 *   - JSON schema validity (shape & required fields)
 *   - Kebab-case slug format
 *   - Duplicate slugs (bundles/addOns/featured)
 *   - Cross-refs:
 *       * featured.slugs all resolve to bundles
 *       * each bundle.addOnSlugs[] exists in addOns.json
 *   - Canonical service slugs (warn on non-canonical)
 *   - Thin bundles (very low total features)
 *
 * Usage:
 *   pnpm tsx scripts/packages/validate-packages.ts
 *
 * Options:
 *   --dir=<path>                 Base directory (default: src/data/packages)
 *   --bundles=<filename>         Bundles JSON filename (default: bundles.json)
 *   --addons=<filename>          Add-ons JSON filename (default: addOns.json)
 *   --featured=<filename>        Featured JSON filename (default: featured.json)
 *   --min-features=<n>           Warn if bundle has < n total features (default: 3)
 *   --services=<csv>             Canonical services list (default: content,leadgen,marketing,seo,webdev,video)
 *   --json                       Also print a machine-readable JSON summary line
 *   --strict                     Treat warnings as errors (exit 1)
 *
 * Exit codes:
 *   0 OK
 *   2 Warnings (non-strict)
 *   1 Errors (or warnings when --strict)
 */

import * as fs from "node:fs/promises";
import * as fssync from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { z } from "zod";
import {
  BundlesSchema,
  AddOnsSchema,
  FeaturedSchema,
} from "../../src/data/packages/_validators/schema";
import {
  SERVICE_SLUGS,
  isServiceSlug,
} from "../../src/data/packages/_utils/slugs";

// ----------------------------- Types & Colors ------------------------------

type Bundle = z.infer<typeof BundlesSchema>[number];
type AddOn = z.infer<typeof AddOnsSchema>[number];
type Featured = z.infer<typeof FeaturedSchema>;

const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
};

// --------------------------------- CLI -------------------------------------

type Cli = {
  dir: string;
  bundles: string;
  addons: string;
  featured: string;
  minFeatures: number;
  services: string[];
  json: boolean;
  strict: boolean;
};

function parseArgs(): Cli {
  const argv = process.argv.slice(2);
  const get = (k: string, d?: string) => {
    const hit = argv.find((a) => a.startsWith(`${k}=`));
    return hit ? hit.split("=", 2)[1] : d;
  };
  const servicesCsv =
    get("--services") ?? "content,leadgen,marketing,seo,webdev,video";
  return {
    dir: get("--dir", path.join("src", "data", "packages"))!,
    bundles: get("--bundles", "bundles.json")!,
    addons: get("--addons", "addOns.json")!,
    featured: get("--featured", "featured.json")!,
    minFeatures: Number(get("--min-features", "3")),
    services: servicesCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    json: argv.includes("--json"),
    strict: argv.includes("--strict"),
  };
}

function rel(p: string) {
  return path.relative(process.cwd(), p).replaceAll(path.sep, "/");
}

// ------------------------------ Utilities ----------------------------------

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function duplicates<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const dups = new Set<T>();
  for (const v of arr) {
    if (seen.has(v)) dups.add(v);
    else seen.add(v);
  }
  return Array.from(dups);
}

function isKebabCase(s: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

function sumFeatures(b: Bundle): number {
  const sections = Array.isArray(b.includes) ? b.includes : [];
  return sections.reduce(
    (n, sec) => n + (Array.isArray(sec.items) ? sec.items.length : 0),
    0
  );
}

function formatZodIssues(issues: z.ZodIssue[]): string[] {
  return issues.map((i) => {
    const path = i.path?.length ? ` at ${i.path.join(".")}` : "";
    return `${i.message}${path}`;
  });
}

// --------------------------------- Main ------------------------------------

async function main() {
  const cli = parseArgs();

  const base = path.resolve(process.cwd(), cli.dir);
  const bundlesPath = path.join(base, cli.bundles);
  const addonsPath = path.join(base, cli.addons);
  const featuredPath = path.join(base, cli.featured);

  console.log(C.bold("\n🧪 Validating packages data"));
  console.log(`• Data dir: ${C.cyan(rel(base))}\n`);

  // Ensure files exist
  const missingFiles: string[] = [];
  if (!fssync.existsSync(bundlesPath)) missingFiles.push(rel(bundlesPath));
  if (!fssync.existsSync(addonsPath)) missingFiles.push(rel(addonsPath));
  if (!fssync.existsSync(featuredPath)) missingFiles.push(rel(featuredPath));
  if (missingFiles.length) {
    console.error(C.red(`✖ Required file(s) missing:\n  - ${missingFiles.join("\n  - ")}`));
    process.exit(1);
  }

  // Load JSON
  const rawBundles = await readJson<unknown>(bundlesPath);
  const rawAddOns = await readJson<unknown>(addonsPath);
  const rawFeatured = await readJson<unknown>(featuredPath);

  const errors: string[] = [];
  const warnings: string[] = [];

  // Zod schema validation
  console.log(C.bold("Schema validation:"));
  const bundlesParsed = BundlesSchema.safeParse(rawBundles);
  if (!bundlesParsed.success) {
    const msgs = formatZodIssues(bundlesParsed.error.issues);
    errors.push(...msgs.map((m) => `bundles.json: ${m}`));
    console.error(C.red("  ✖ bundles.json invalid"));
  } else {
    console.log(C.green("  ✓ bundles.json OK"));
  }

  const addOnsParsed = AddOnsSchema.safeParse(rawAddOns);
  if (!addOnsParsed.success) {
    const msgs = formatZodIssues(addOnsParsed.error.issues);
    errors.push(...msgs.map((m) => `addOns.json: ${m}`));
    console.error(C.red("  ✖ addOns.json invalid"));
  } else {
    console.log(C.green("  ✓ addOns.json OK"));
  }

  const featuredParsed = FeaturedSchema.safeParse(rawFeatured);
  if (!featuredParsed.success) {
    const msgs = formatZodIssues(featuredParsed.error.issues);
    errors.push(...msgs.map((m) => `featured.json: ${m}`));
    console.error(C.red("  ✖ featured.json invalid"));
  } else {
    console.log(C.green("  ✓ featured.json OK"));
  }
  console.log("");

  if (!bundlesParsed.success || !addOnsParsed.success || !featuredParsed.success) {
    // Hard stop: without correct shapes, cross-refs could be noisy
    reportAndExit(errors, warnings, cli);
    return;
  }

  const bundles: Bundle[] = bundlesParsed.data;
  const addOns: AddOn[] = addOnsParsed.data;
  const featured: Featured = featuredParsed.data;

  // Kebab-case slug checks + duplicates
  console.log(C.bold("Slug format & duplicates:"));
  const bundleSlugs = bundles.map((b) => b.slug);
  const addOnSlugs = addOns.map((a) => a.slug);
  const badBundleSlugs = bundleSlugs.filter((s) => !isKebabCase(s));
  const badAddOnSlugs = addOnSlugs.filter((s) => !isKebabCase(s));

  if (badBundleSlugs.length) {
    errors.push(
      `bundles.json: invalid kebab-case slug(s): ${badBundleSlugs.map((s) => `"${s}"`).join(", ")}`
    );
    console.error(C.red("  ✖ Invalid bundle slugs (kebab-case)"));
  } else {
    console.log(C.green("  ✓ Bundle slugs kebab-case OK"));
  }

  if (badAddOnSlugs.length) {
    errors.push(
      `addOns.json: invalid kebab-case slug(s): ${badAddOnSlugs.map((s) => `"${s}"`).join(", ")}`
    );
    console.error(C.red("  ✖ Invalid add-on slugs (kebab-case)"));
  } else {
    console.log(C.green("  ✓ Add-on slugs kebab-case OK"));
  }

  const dupBundleSlugs = duplicates(bundleSlugs);
  const dupAddOnSlugs = duplicates(addOnSlugs);
  const dupFeatured = duplicates(featured.slugs || []);

  if (dupBundleSlugs.length) {
    errors.push(`bundles.json: duplicate slug(s): ${dupBundleSlugs.join(", ")}`);
    console.error(C.red("  ✖ Duplicate bundle slugs"));
  } else {
    console.log(C.green("  ✓ No duplicate bundle slugs"));
  }

  if (dupAddOnSlugs.length) {
    errors.push(`addOns.json: duplicate slug(s): ${dupAddOnSlugs.join(", ")}`);
    console.error(C.red("  ✖ Duplicate add-on slugs"));
  } else {
    console.log(C.green("  ✓ No duplicate add-on slugs"));
  }

  if (dupFeatured.length) {
    warnings.push(`featured.json: duplicate slugs (will be de-duped at runtime): ${dupFeatured.join(", ")}`);
    console.warn(C.yellow("  ▲ Duplicate featured entries (warning)"));
  } else {
    console.log(C.green("  ✓ No duplicate featured entries"));
  }
  console.log("");

  // Cross-refs: featured → bundles
  console.log(C.bold("Cross-reference checks:"));
  const bundleSet = new Set(bundleSlugs);
  const addOnSet = new Set(addOnSlugs);
  const missingFeatured = (featured.slugs || []).filter((s) => !bundleSet.has(s));
  if (missingFeatured.length) {
    errors.push(
      `featured.json: slugs not found in bundles.json: ${missingFeatured.join(", ")}`
    );
    console.error(C.red("  ✖ Some featured slugs do not resolve to bundles"));
  } else {
    console.log(C.green("  ✓ All featured slugs resolve to bundles"));
  }

  // Cross-refs: bundle.addOnSlugs → addOns
  const badAddOnRefs: string[] = [];
  bundles.forEach((b) => {
    const refs = Array.isArray((b as any).addOnSlugs) ? (b as any).addOnSlugs : [];
    refs.forEach((s: string) => {
      if (!addOnSet.has(s)) badAddOnRefs.push(`${b.slug} → ${s}`);
    });
  });
  if (badAddOnRefs.length) {
    errors.push(`bundles.json: references to missing addOns: ${badAddOnRefs.join(", ")}`);
    console.error(C.red("  ✖ Bundles reference non-existent add-ons"));
  } else {
    console.log(C.green("  ✓ All bundle addOnSlugs resolve to add-ons"));
  }

  // Canonical services check
  const nonCanonical: Array<{ slug: string; service: string }> = [];
  bundles.forEach((b) => {
    const svcs = Array.isArray(b.services) ? b.services : [];
    svcs.forEach((s) => {
      if (!isServiceSlug(s)) nonCanonical.push({ slug: b.slug, service: s });
    });
  });
  if (nonCanonical.length) {
    const preview = nonCanonical
      .slice(0, 12)
      .map((r) => `${r.slug}(${r.service})`)
      .join(", ");
    warnings.push(
      `bundles.json: non-canonical services detected (first shown) → ${preview}${
        nonCanonical.length > 12 ? " …" : ""
      } • Allowed: ${SERVICE_SLUGS.join(", ")}`
    );
    console.warn(C.yellow("  ▲ Non-canonical service slugs found (warning)"));
  } else {
    console.log(C.green("  ✓ Service slugs are canonical"));
  }

  // Thin bundles (visual quality)
  const thin = bundles
    .map((b) => ({ slug: b.slug, features: sumFeatures(b) }))
    .filter((x) => x.features < cli.minFeatures);
  if (thin.length) {
    const list = thin.map((t) => `${t.slug}(${t.features})`).slice(0, 12).join(", ");
    warnings.push(
      `bundles.json: some bundles are thin (< ${cli.minFeatures} total includes items): ${list}${
        thin.length > 12 ? " …" : ""
      }`
    );
    console.warn(C.yellow(`  ▲ Thin bundles detected (warning)`));
  } else {
    console.log(C.green(`  ✓ Each bundle has ≥ ${cli.minFeatures} total includes items`));
  }
  console.log("");

  // Summary
  console.log(C.bold("Summary:"));
  console.log(
    `  Bundles:  ${C.cyan(String(bundles.length))}   Add-ons: ${C.cyan(
      String(addOns.length)
    )}   Featured: ${C.cyan(String((featured.slugs || []).length))}\n`
  );

  // Optional JSON payload (one-line)
  if (cli.json) {
    const payload = {
      ok: errors.length === 0 && (!cli.strict || warnings.length === 0),
      counts: {
        bundles: bundles.length,
        addOns: addOns.length,
        featured: (featured.slugs || []).length,
      },
      errors,
      warnings,
    };
    console.log(C.dim("JSON: " + JSON.stringify(payload)));
  }

  // Exit code policy
  reportAndExit(errors, warnings, cli);
}

function reportAndExit(errors: string[], warnings: string[], cli: Cli) {
  if (errors.length) {
    console.error(C.red("\n❌ Validation failed\n"));
    errors.slice(0, 50).forEach((e) => console.error("  - " + e));
    if (errors.length > 50) console.error(`  … and ${errors.length - 50} more`);
    process.exit(1);
  }
  if (warnings.length) {
    const msg = cli.strict
      ? C.red("\n❌ Warnings treated as errors (--strict)\n")
      : C.yellow("\n⚠️  Validation completed with warnings\n");
    console[cli.strict ? "error" : "warn"](msg);
    warnings.slice(0, 100).forEach((w) => console.warn("  - " + w));
    if (warnings.length > 100) console.warn(`  … and ${warnings.length - 100} more`);
    process.exit(cli.strict ? 1 : 2);
  }
  console.log(C.green("✅ Validation passed\n"));
  process.exit(0);
}

main().catch((err) => {
  console.error(C.red(`\n✖ Error: ${err?.message || err}\n`));
  process.exit(1);
});
