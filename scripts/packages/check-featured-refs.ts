// scripts/packages/check-featured-refs.ts
// scripts/packages/check-featured-refs.ts
/**
 * Check Featured References
 * -------------------------
 * Verifies that every slug in `src/data/packages/featured.json` resolves to an
 * existing bundle in `src/data/packages/bundles.json`. Warns about duplicates
 * (order-preserving) and invalid slug formats. Optionally auto-fixes duplicates.
 *
 * Usage:
 *   pnpm tsx scripts/packages/check-featured-refs.ts
 *
 * Options:
 *   --dir=<path>                Base directory for packages data (default: src/data/packages)
 *   --bundles=<filename>        Bundles JSON filename (default: bundles.json)
 *   --featured=<filename>       Featured JSON filename (default: featured.json)
 *   --fix                       Write back a de-duplicated `featured.json` (keeps original order)
 *   --require=<n>               Require exactly N featured slugs; error if not met
 *   --fail-on-duplicate         Exit non-zero when duplicates are detected
 *
 * Exit codes:
 *   0  OK (no errors)
 *   1  Errors (missing slugs, bad JSON, invalid slug format, wrong count)
 *   2  Warnings only (duplicates) when --fail-on-duplicate is NOT set
 */

import * as fs from "node:fs/promises";
import * as fssync from "node:fs";
import * as path from "node:path";
import process from "node:process";

type Bundle = { slug: string; [k: string]: unknown };
type FeaturedJson = { slugs: string[]; [k: string]: unknown };

const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

type CliOpts = {
  dir: string;
  bundles: string;
  featured: string;
  fix: boolean;
  require?: number;
  failOnDuplicate: boolean;
};

function parseArgs(): CliOpts {
  const argv = process.argv.slice(2);
  const get = (k: string, def?: string) => {
    const hit = argv.find((a) => a.startsWith(`${k}=`));
    return hit ? hit.split("=", 2)[1] : def;
  };
  const dir = get("--dir", path.join("src", "data", "packages"))!;
  const bundles = get("--bundles", "bundles.json")!;
  const featured = get("--featured", "featured.json")!;
  const fix = argv.includes("--fix");
  const requireN = get("--require");
  const failOnDuplicate = argv.includes("--fail-on-duplicate");
  return {
    dir,
    bundles,
    featured,
    fix,
    require: requireN ? Number(requireN) : undefined,
    failOnDuplicate,
  };
}

function rel(p: string) {
  return path.relative(process.cwd(), p).replaceAll(path.sep, "/");
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

async function readJson<T = unknown>(file: string): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: any) {
    throw new Error(`Failed to read/parse JSON: ${rel(file)}\n${err?.message || err}`);
  }
}

function uniqOrder<T>(arr: T[]): { unique: T[]; duplicates: T[] } {
  const seen = new Set<T>();
  const dups: T[] = [];
  const unique: T[] = [];
  for (const item of arr) {
    if (seen.has(item)) {
      dups.push(item);
    } else {
      seen.add(item);
      unique.push(item);
    }
  }
  return { unique, duplicates: Array.from(new Set(dups)) };
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function writeJson(file: string, obj: unknown) {
  const content = JSON.stringify(obj, null, 2) + "\n";
  await fs.writeFile(file, content, "utf8");
}

async function main() {
  const opts = parseArgs();

  const baseDir = path.resolve(process.cwd(), opts.dir);
  const bundlesPath = path.join(baseDir, opts.bundles);
  const featuredPath = path.join(baseDir, opts.featured);

  if (!fssync.existsSync(bundlesPath)) {
    throw new Error(`Bundles file not found at ${rel(bundlesPath)}`);
  }
  if (!fssync.existsSync(featuredPath)) {
    throw new Error(`Featured file not found at ${rel(featuredPath)}`);
  }

  const bundlesJson = await readJson<Bundle[]>(bundlesPath);
  const featuredJson = await readJson<FeaturedJson>(featuredPath);

  if (!Array.isArray(bundlesJson)) {
    throw new Error(`Expected an array in ${rel(bundlesPath)}`);
  }
  if (!featuredJson || !isStringArray((featuredJson as any).slugs)) {
    throw new Error(`Expected shape { slugs: string[] } in ${rel(featuredPath)}`);
  }

  const allSlugs = new Set(bundlesJson.map((b) => b.slug));
  const { unique: featuredUnique, duplicates: duplicateList } = uniqOrder(featuredJson.slugs);

  // Validate slug format
  const invalidFormat = featuredUnique.filter((s) => !KEBAB.test(s));
  // Validate existence
  const missing = featuredUnique.filter((s) => !allSlugs.has(s));

  // Optional: require exact N
  const wrongCount =
    typeof opts.require === "number" ? featuredUnique.length !== opts.require : false;

  // Report
  console.log(C.bold(`\n🔎 Checking featured references`));
  console.log(`• Bundles:  ${C.cyan(String(bundlesJson.length))} (${rel(bundlesPath)})`);
  console.log(`• Featured: ${C.cyan(String(featuredJson.slugs.length))} (${rel(featuredPath)})\n`);

  if (duplicateList.length) {
    console.warn(
      C.yellow(
        `⚠️  Duplicates in featured list (order-preserving): ${duplicateList
          .map((s) => `"${s}"`)
          .join(", ")}`
      )
    );
  } else {
    console.log(C.green("✓ No duplicate featured slugs"));
  }

  if (invalidFormat.length) {
    console.error(
      C.red(
        `✖ Invalid slug format (must be kebab-case [a-z0-9-]): ${invalidFormat
          .map((s) => `"${s}"`)
          .join(", ")}`
      )
    );
  } else {
    console.log(C.green("✓ Featured slug format OK"));
  }

  if (missing.length) {
    console.error(
      C.red(
        `✖ Missing bundles for featured slugs: ${missing.map((s) => `"${s}"`).join(", ")}`
      )
    );
  } else {
    console.log(C.green("✓ All featured slugs resolve to bundles"));
  }

  if (typeof opts.require === "number") {
    if (wrongCount) {
      console.error(
        C.red(
          `✖ Featured count is ${featuredUnique.length}, but --require=${opts.require} was specified`
        )
      );
    } else {
      console.log(C.green(`✓ Featured count = ${featuredUnique.length} (as required)`));
    }
  }

  // Optional fix: write back a deduped file (preserves original order)
  if (opts.fix && duplicateList.length) {
    const next: FeaturedJson = { ...featuredJson, slugs: featuredUnique };
    await writeJson(featuredPath, next);
    console.log(C.green(`🛠  Wrote de-duplicated featured list → ${rel(featuredPath)}`));
  }

  // Decide exit code
  const hasErrors =
    invalidFormat.length > 0 || missing.length > 0 || (wrongCount ? true : false);
  const hasWarnings = duplicateList.length > 0;

  if (hasErrors) {
    console.log("");
    console.error(C.red("❌ Featured references check failed\n"));
    process.exit(1);
  }

  if (hasWarnings && opts.failOnDuplicate) {
    console.log("");
    console.error(C.red("❌ Duplicates found and --fail-on-duplicate was set\n"));
    process.exit(1);
  }

  if (hasWarnings) {
    console.log("");
    console.warn(C.yellow("⚠️  Featured references check passed with warnings\n"));
    process.exit(2);
  }

  console.log("");
  console.log(C.green("✅ Featured references check passed\n"));
  process.exit(0);
}

main().catch((err) => {
  console.error(C.red(`\n✖ Error: ${err?.message || err}\n`));
  process.exit(1);
});
