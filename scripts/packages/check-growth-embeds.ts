#!/usr/bin/env tsx
// scripts/packages/check-growth-embeds.ts
/**
 * Growth Embeds Sanity Check
 * --------------------------
 * Validates the FIRST N featured bundles (defaults to 3) that power the
 * GrowthPackagesSection cards. We check:
 *  - Each featured slug resolves to a bundle
 *  - Uniqueness among the first N (no dupes)
 *  - Minimum total feature count (sum of includes[].items) per bundle
 *  - Badge rule for isMostPopular (exactly one by default)
 *  - Price presence (setup and/or monthly) for nice card rendering
 *
 * Usage:
 *   pnpm tsx scripts/packages/check-growth-embeds.ts
 *
 * Options:
 *   --dir=<path>                 Base directory (default: src/data/packages)
 *   --bundles=<filename>         Bundles JSON filename (default: bundles.json)
 *   --featured=<filename>        Featured JSON filename (default: featured.json)
 *   --count=<n>                  Number of featured to validate (default: 3)
 *   --min-features=<n>           Minimum total features per bundle (default: 6)
 *   --badge=<rule>               Badge rule: one | at-least-one | none (default: one)
 *   --strict                     Fail build on warnings as well as errors
 *
 * Exit codes:
 *   0  OK
 *   1  Errors found
 *   2  Warnings (when not --strict)
 */

import * as fs from "node:fs/promises";
import * as fssync from "node:fs";
import * as path from "node:path";
import process from "node:process";

type Bundle = {
  slug: string;
  name?: string;
  description?: string;
  price?: { oneTime?: number; monthly?: number; currency?: string };
  includes?: Array<{ section: string; items: string[] }>;
  isMostPopular?: boolean;
  [k: string]: unknown;
};

type Featured = { slugs: string[]; [k: string]: unknown };

type Cli = {
  dir: string;
  bundles: string;
  featured: string;
  count: number;
  minFeatures: number;
  badge: "one" | "at-least-one" | "none";
  strict: boolean;
};

const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

function parseArgs(): Cli {
  const argv = process.argv.slice(2);
  const get = (key: string, def?: string) => {
    const hit = argv.find((a) => a.startsWith(`${key}=`));
    return hit ? hit.split("=", 2)[1] : def;
  };
  return {
    dir: get("--dir", path.join("src", "data", "packages"))!,
    bundles: get("--bundles", "bundles.json")!,
    featured: get("--featured", "featured.json")!,
    count: Number(get("--count", "3")),
    minFeatures: Number(get("--min-features", "6")),
    badge: (get("--badge", "one") as Cli["badge"]) || "one",
    strict: argv.includes("--strict"),
  };
}

function rel(p: string) {
  return path.relative(process.cwd(), p).replaceAll(path.sep, "/");
}

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

function sumFeatures(b: Bundle): number {
  const sections = Array.isArray(b.includes) ? b.includes : [];
  return sections.reduce((n, sec) => n + (Array.isArray(sec.items) ? sec.items.length : 0), 0);
}

function priceState(b: Bundle): { hasSetup: boolean; hasMonthly: boolean } {
  const p = b.price || {};
  return { hasSetup: typeof p.oneTime === "number", hasMonthly: typeof p.monthly === "number" };
}

function uniqOrder<T>(arr: T[]) {
  const seen = new Set<T>();
  const dups: T[] = [];
  const unique: T[] = [];
  for (const x of arr) {
    if (seen.has(x)) dups.push(x);
    else {
      seen.add(x);
      unique.push(x);
    }
  }
  return { unique, duplicates: Array.from(new Set(dups)) };
}

async function main() {
  const opts = parseArgs();

  const baseDir = path.resolve(process.cwd(), opts.dir);
  const bundlesPath = path.join(baseDir, opts.bundles);
  const featuredPath = path.join(baseDir, opts.featured);

  if (!fssync.existsSync(bundlesPath)) {
    throw new Error(`Bundles file not found: ${rel(bundlesPath)}`);
  }
  if (!fssync.existsSync(featuredPath)) {
    throw new Error(`Featured file not found: ${rel(featuredPath)}`);
  }

  const bundles = await readJson<Bundle[]>(bundlesPath);
  const featured = await readJson<Featured>(featuredPath);

  if (!Array.isArray(bundles)) throw new Error(`Expected array in ${rel(bundlesPath)}`);
  if (!featured || !Array.isArray(featured.slugs))
    throw new Error(`Expected { slugs: string[] } in ${rel(featuredPath)}`);

  console.log(C.bold(`\n🔎 Checking growth embeds (first ${opts.count})`));
  console.log(`• Bundles:  ${C.cyan(String(bundles.length))} (${rel(bundlesPath)})`);
  console.log(`• Featured: ${C.cyan(String(featured.slugs.length))} (${rel(featuredPath)})`);
  console.log("");

  // Resolve FIRST N featured (unique order-preserving)
  const { unique: featuredUnique } = uniqOrder(featured.slugs);
  const firstN = featuredUnique.slice(0, opts.count);

  // Map slugs → bundles
  const bySlug = new Map<string, Bundle>(bundles.map((b) => [b.slug, b]));
  const resolved: Array<{ slug: string; bundle?: Bundle }> = firstN.map((slug) => ({
    slug,
    bundle: bySlug.get(slug),
  }));

  // Errors
  const missing = resolved.filter((r) => !r.bundle).map((r) => r.slug);
  const dupedWithinN = firstN.length !== new Set(firstN).size;

  // Per-bundle checks
  const rows = resolved
    .filter((r) => !!r.bundle)
    .map((r) => {
      const b = r.bundle!;
      const features = sumFeatures(b);
      const badge = !!b.isMostPopular;
      const price = priceState(b);
      return {
        slug: r.slug,
        features,
        badge,
        price,
      };
    });

  // Badge rule evaluation
  const badgeCount = rows.filter((r) => r.badge).length;
  let badgeError = false;
  let badgeWarning = false;
  if (opts.badge === "one") {
    if (badgeCount === 0) badgeError = true;
    else if (badgeCount > 1) badgeWarning = true;
  } else if (opts.badge === "at-least-one") {
    if (badgeCount === 0) badgeError = true;
  } // "none" => no check

  // Feature count issues
  const tooThin = rows.filter((r) => r.features < opts.minFeatures);

  // Price issues (cards look better with both setup & monthly)
  const priceMissingBoth = rows.filter((r) => !r.price.hasSetup && !r.price.hasMonthly);
  const priceMissingEither = rows.filter(
    (r) => (r.price.hasSetup ? 0 : 1) + (r.price.hasMonthly ? 0 : 1) === 1
  );

  // Report
  if (missing.length) {
    console.error(C.red(`✖ Missing bundle(s) for slugs: ${missing.map((s) => `"${s}"`).join(", ")}`));
  } else {
    console.log(C.green("✓ All featured slugs resolve to bundles"));
  }

  if (dupedWithinN) {
    console.error(C.red(`✖ First ${opts.count} featured must be unique`));
  } else {
    console.log(C.green(`✓ First ${opts.count} featured are unique`));
  }

  if (tooThin.length) {
    console.warn(
      C.yellow(
        `⚠️  Some featured bundles have < ${opts.minFeatures} total features (cards may look sparse): ${tooThin
          .map((r) => `${r.slug} (${r.features})`)
          .join(", ")}`
      )
    );
  } else {
    console.log(C.green(`✓ Each featured bundle has ≥ ${opts.minFeatures} features`));
  }

  if (opts.badge !== "none") {
    if (badgeError) {
      console.error(
        C.red(
          `✖ Badge rule violated (${opts.badge}). isMostPopular in first ${opts.count}: ${badgeCount}`
        )
      );
    } else if (badgeWarning) {
      console.warn(
        C.yellow(
          `⚠️  Multiple isMostPopular=true among first ${opts.count} (recommended: exactly one)`
        )
      );
    } else {
      console.log(C.green(`✓ Badge rule satisfied (${opts.badge})`));
    }
  }

  if (priceMissingBoth.length) {
    console.warn(
      C.yellow(
        `⚠️  No price shown for: ${priceMissingBoth.map((r) => r.slug).join(", ")} (setup/monthly both missing)`
      )
    );
  } else {
    console.log(C.green("✓ Each featured bundle has at least one price (setup or monthly)"));
  }

  if (priceMissingEither.length) {
    console.log(
      C.dim(
        `• Heads-up: only one price present for ${priceMissingEither
          .map((r) => r.slug)
          .join(", ")} (this is OK but cards look richer with both)`
      )
    );
  }

  // Decide exit code
  const hasErrors = missing.length > 0 || dupedWithinN || badgeError;
  const hasWarnings = tooThin.length > 0 || badgeWarning || priceMissingBoth.length > 0;

  console.log("");

  if (hasErrors) {
    console.error(C.red("❌ Growth embeds check failed\n"));
    process.exit(1);
  }

  if (hasWarnings) {
    if (opts.strict) {
      console.error(C.red("❌ Warnings treated as errors due to --strict\n"));
      process.exit(1);
    }
    console.warn(C.yellow("⚠️  Growth embeds check passed with warnings\n"));
    process.exit(2);
  }

  console.log(C.green("✅ Growth embeds check passed\n"));
  process.exit(0);
}

main().catch((err) => {
  console.error(C.red(`\n✖ Error: ${err?.message || err}\n`));
  process.exit(1);
});
