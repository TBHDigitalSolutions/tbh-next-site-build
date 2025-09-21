// scripts/packages/packages-stats.ts
#!/usr/bin/env tsx
// scripts/packages/packages-stats.ts
/**
 * Packages Stats
 * --------------
 * Produces a concise, colorized snapshot of your packages data:
 *  - Totals and service coverage
 *  - Feature density (sum of includes[].items)
 *  - Price bands for setup & monthly (handles tiered pricing strings)
 *  - Add-on coverage (how many addOns are actually referenced by bundles)
 *  - Featured overview (how many featured slugs exist & resolve)
 *
 * Usage:
 *   pnpm tsx scripts/packages/packages-stats.ts
 *
 * Options:
 *   --dir=<path>                 Base directory (default: src/data/packages)
 *   --bundles=<filename>         Bundles JSON filename (default: bundles.json)
 *   --addons=<filename>          Add-ons JSON filename (default: addOns.json)
 *   --featured=<filename>        Featured JSON filename (default: featured.json)
 *   --services=<csv>             Canonical services list (default: content,leadgen,marketing,seo,webdev,video)
 *   --price-bands=<csv>          Price thresholds (numbers) used for banding (default: 0,2000,5000,10000)
 *   --min-service=0              Warn if a service has ≤ this many bundles (default: 0 → warn when 0)
 *   --min-addon-coverage=0.2     Warn if < this fraction of addOns are referenced (default: 0.2)
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

type Bundle = {
  slug: string;
  services?: string[];
  includes?: Array<{ section: string; items: string[] }>;
  price?: { oneTime?: number; monthly?: number; currency?: string };
  pricing?: any; // supports tiered pricing { kind: "tiers", tiers: [{ price, period, ...}] }
  isMostPopular?: boolean;
  [k: string]: unknown;
};

type FeaturedJson = { slugs: string[]; [k: string]: unknown };
type AddOnJson = Array<{ slug: string; [k: string]: unknown }>;

const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
};

type Cli = {
  dir: string;
  bundles: string;
  addons: string;
  featured: string;
  services: string[];
  bands: number[]; // e.g., [0, 2000, 5000, 10000]
  minService: number;
  minAddonCoverage: number; // 0..1
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
  const bandsCsv = get("--price-bands") ?? "0,2000,5000,10000";
  return {
    dir: get("--dir", path.join("src", "data", "packages"))!,
    bundles: get("--bundles", "bundles.json")!,
    addons: get("--addons", "addOns.json")!,
    featured: get("--featured", "featured.json")!,
    services: servicesCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    bands: bandsCsv
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b),
    minService: Number(get("--min-service", "0")),
    minAddonCoverage: Number(get("--min-addon-coverage", "0.2")),
    json: argv.includes("--json"),
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
  return sections.reduce(
    (n, sec) => n + (Array.isArray(sec.items) ? sec.items.length : 0),
    0
  );
}

/** Extract numeric price from strings like "$2,500", "2500/mo", "USD 1,000" */
function parsePriceLike(input: unknown): number | undefined {
  if (typeof input === "number") return input;
  if (typeof input !== "string") return undefined;
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function extractSetupMonthly(b: Bundle): { setup?: number; monthly?: number } {
  // New shape: tiered pricing
  if (
    b?.pricing &&
    typeof b.pricing === "object" &&
    b.pricing.kind === "tiers" &&
    Array.isArray(b.pricing.tiers) &&
    b.pricing.tiers.length > 0
  ) {
    // Heuristic: use the minimum numeric price across tiers as "setup" (or monthly if period suggests)
    const nums = b.pricing.tiers
      .map((t: any) => parsePriceLike(t.price))
      .filter((n: number | undefined): n is number => typeof n === "number")
      .sort((a: number, b: number) => a - b);
    if (nums.length) {
      // Without strong semantics, treat as "setup" for banding purposes.
      return { setup: nums[0] };
    }
  }

  // Classic shape: price.oneTime / price.monthly
  const setup =
    typeof b.price?.oneTime === "number" ? b.price?.oneTime : undefined;
  const monthly =
    typeof b.price?.monthly === "number" ? b.price?.monthly : undefined;
  return { setup, monthly };
}

function bandLabel(thresholds: number[], value: number): string {
  // thresholds sorted ascending; build ranges: [t0..t1), [t1..t2), ..., [last..∞)
  if (thresholds.length === 0) return "all";
  for (let i = 0; i < thresholds.length; i++) {
    const lower = thresholds[i];
    const upper = thresholds[i + 1];
    if (upper == null) {
      return `$${lower.toLocaleString()}+`;
    }
    if (value >= lower && value < upper) {
      return `$${lower.toLocaleString()}–$${(upper - 1).toLocaleString()}`;
    }
  }
  // smaller than first threshold
  return `<$${thresholds[0].toLocaleString()}`;
}

function pushCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr: number[]) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function printTable(rows: Array<string[]>) {
  const widths: number[] = [];
  rows.forEach((r) =>
    r.forEach((cell, i) => (widths[i] = Math.max(widths[i] || 0, cell.length)))
  );
  for (const r of rows) {
    const line = r
      .map((c, i) => c.padEnd(widths[i], " "))
      .join("  ");
    console.log(line);
  }
}

async function main() {
  const cli = parseArgs();

  const base = path.resolve(process.cwd(), cli.dir);
  const bundlesPath = path.join(base, cli.bundles);
  const addonsPath = path.join(base, cli.addons);
  const featuredPath = path.join(base, cli.featured);

  if (!fssync.existsSync(bundlesPath)) {
    throw new Error(`Bundles file not found: ${rel(bundlesPath)}`);
  }

  const bundles = await readJson<Bundle[]>(bundlesPath);
  const featured = fssync.existsSync(featuredPath)
    ? await readJson<FeaturedJson>(featuredPath)
    : { slugs: [] };
  const addons = fssync.existsSync(addonsPath)
    ? await readJson<AddOnJson>(addonsPath)
    : [];

  if (!Array.isArray(bundles)) {
    throw new Error(`Expected array in ${rel(bundlesPath)}`);
  }

  console.log(C.bold(`\n📊 Packages Stats`));
  console.log(`• Bundles:  ${C.cyan(String(bundles.length))} (${rel(bundlesPath)})`);
  console.log(
    `• Featured: ${C.cyan(String((featured.slugs || []).length))} (${rel(
      featuredPath
    )})`
  );
  console.log(
    `• Add-ons:  ${C.cyan(String(addons.length))} (${rel(addonsPath)})\n`
  );

  // --- Service coverage ------------------------------------------------------
  const svcCounts = new Map<string, number>();
  bundles.forEach((b) => {
    const svcs = Array.isArray(b.services) ? b.services : [];
    if (!svcs.length) pushCount(svcCounts, "(none)");
    svcs.forEach((s) => pushCount(svcCounts, s));
  });

  console.log(C.bold("Service coverage:"));
  const svcRows: string[][] = [["Service", "Bundles"]];
  for (const svc of cli.services) {
    const n = svcCounts.get(svc) || 0;
    const label = n <= cli.minService ? C.yellow(String(n)) : C.green(String(n));
    svcRows.push([svc, label]);
  }
  // Include any unexpected service keys
  for (const [svc, n] of svcCounts) {
    if (!cli.services.includes(svc) && svc !== "(none)") {
      svcRows.push([`${svc} ${C.gray("(non-canonical)")}`, String(n)]);
    }
  }
  printTable(svcRows);
  console.log("");

  // --- Feature density -------------------------------------------------------
  const featureCounts = bundles.map((b) => sumFeatures(b));
  const totalFeatures = featureCounts.reduce((a, b) => a + b, 0);
  console.log(C.bold("Feature density:"));
  printTable([
    ["Total includes items", String(totalFeatures)],
    ["Avg per bundle", featureCounts.length ? avg(featureCounts).toFixed(1) : "0"],
    ["Median per bundle", featureCounts.length ? String(median(featureCounts)) : "0"],
    [
      "Bundles with 0 features",
      String(featureCounts.filter((n) => n === 0).length),
    ],
  ]);
  console.log("");

  // --- Price bands -----------------------------------------------------------
  const setupBands = new Map<string, number>();
  const monthlyBands = new Map<string, number>();
  let setupVals: number[] = [];
  let monthlyVals: number[] = [];

  bundles.forEach((b) => {
    const { setup, monthly } = extractSetupMonthly(b);
    if (typeof setup === "number") {
      setupVals.push(setup);
      pushCount(setupBands, bandLabel(cli.bands, setup));
    }
    if (typeof monthly === "number") {
      monthlyVals.push(monthly);
      pushCount(monthlyBands, bandLabel(cli.bands, monthly));
    }
  });

  const bandHeader = ["Band", "Count"];
  console.log(C.bold("Setup price bands:"));
  const setupRows: string[][] = [bandHeader];
  // Print bands in ascending order (deterministic)
  const setupOrder = Array.from(setupBands.keys()).sort((a, b) => {
    // sort by first numeric in label
    const na = Number((a.match(/\d[\d,]*/)?.[0] || "0").replace(/,/g, ""));
    const nb = Number((b.match(/\d[\d,]*/)?.[0] || "0").replace(/,/g, ""));
    return na - nb;
  });
  setupOrder.forEach((k) => setupRows.push([k, String(setupBands.get(k) || 0)]));
  if (setupRows.length === 1) setupRows.push(["(none)", "0"]);
  printTable(setupRows);
  if (setupVals.length) {
    console.log(
      C.dim(
        `  avg=${avg(setupVals).toFixed(0)}  median=${median(setupVals).toFixed(
          0
        )}  min=${Math.min(...setupVals)}  max=${Math.max(...setupVals)}`
      )
    );
  }
  console.log("");

  console.log(C.bold("Monthly price bands:"));
  const monthlyRows: string[][] = [bandHeader];
  const monthlyOrder = Array.from(monthlyBands.keys()).sort((a, b) => {
    const na = Number((a.match(/\d[\d,]*/)?.[0] || "0").replace(/,/g, ""));
    const nb = Number((b.match(/\d[\d,]*/)?.[0] || "0").replace(/,/g, ""));
    return na - nb;
  });
  monthlyOrder.forEach((k) =>
    monthlyRows.push([k, String(monthlyBands.get(k) || 0)])
  );
  if (monthlyRows.length === 1) monthlyRows.push(["(none)", "0"]);
  printTable(monthlyRows);
  if (monthlyVals.length) {
    console.log(
      C.dim(
        `  avg=${avg(monthlyVals).toFixed(0)}  median=${median(monthlyVals).toFixed(
          0
        )}  min=${Math.min(...monthlyVals)}  max=${Math.max(...monthlyVals)}`
      )
    );
  }
  console.log("");

  // --- Add-on coverage -------------------------------------------------------
  // Consider a bundle "references" addOns when it has `addOnSlugs` (classic shape)
  const referenced = new Set<string>();
  bundles.forEach((b) => {
    const slugs = Array.isArray((b as any).addOnSlugs) ? (b as any).addOnSlugs : [];
    slugs.forEach((s) => referenced.add(String(s)));
  });
  const addonSlugs = new Set(addons.map((a) => a.slug));
  const used = Array.from(addonSlugs).filter((s) => referenced.has(s));
  const unused = Array.from(addonSlugs).filter((s) => !referenced.has(s));

  const coverage = addonSlugs.size ? used.length / addonSlugs.size : 0;
  console.log(C.bold("Add-on coverage:"));
  printTable([
    ["Total add-ons", String(addonSlugs.size)],
    ["Referenced in bundles", String(used.length)],
    ["Coverage", addonSlugs.size ? `${(coverage * 100).toFixed(0)}%` : "0%"],
  ]);

  if (unused.length) {
    const preview = unused.slice(0, 10).join(", ");
    console.log(C.dim(`  Unused (first 10): ${preview}${unused.length > 10 ? " …" : ""}`));
  }
  console.log("");

  // --- Featured overview -----------------------------------------------------
  const bySlug = new Map(bundles.map((b) => [b.slug, b]));
  const featuredCount = (featured?.slugs || []).length;
  const resolveOk = (featured?.slugs || []).filter((s) => bySlug.has(s)).length;
  const resolveRate = featuredCount ? resolveOk / featuredCount : 0;

  console.log(C.bold("Featured overview:"));
  printTable([
    ["Total featured slugs", String(featuredCount)],
    ["Resolve to bundles", String(resolveOk)],
    ["Resolution rate", featuredCount ? `${(resolveRate * 100).toFixed(0)}%` : "0%"],
  ]);
  console.log("");

  // --- Warnings / Errors policy ---------------------------------------------
  const serviceWarnings = cli.services.filter(
    (s) => (svcCounts.get(s) || 0) <= cli.minService
  );
  const addonCoverageWarn =
    addonSlugs.size > 0 && coverage < cli.minAddonCoverage;

  let hasWarnings = false;
  let hasErrors = false;

  if (serviceWarnings.length) {
    hasWarnings = true;
    console.warn(
      C.yellow(
        `⚠️  Low service coverage (≤ ${cli.minService} bundles): ${serviceWarnings.join(
          ", "
        )}`
      )
    );
  }

  if (addonCoverageWarn) {
    hasWarnings = true;
    console.warn(
      C.yellow(
        `⚠️  Add-on coverage below threshold: ${(coverage * 100).toFixed(
          0
        )}% < ${(cli.minAddonCoverage * 100).toFixed(0)}%`
      )
    );
  }

  if (!bundles.length) {
    hasErrors = true;
    console.error(C.red("✖ No bundles loaded"));
  }

  // --- Optional JSON line for CI --------------------------------------------
  if (cli.json) {
    const jsonOut = {
      totals: {
        bundles: bundles.length,
        featuresTotal: totalFeatures,
      },
      services: Object.fromEntries(Array.from(svcCounts.entries())),
      price: {
        setup: {
          avg: Number(avg(setupVals).toFixed(2)),
          median: Number(median(setupVals).toFixed(2)),
          min: setupVals.length ? Math.min(...setupVals) : 0,
          max: setupVals.length ? Math.max(...setupVals) : 0,
          bands: Object.fromEntries(setupBands),
        },
        monthly: {
          avg: Number(avg(monthlyVals).toFixed(2)),
          median: Number(median(monthlyVals).toFixed(2)),
          min: monthlyVals.length ? Math.min(...monthlyVals) : 0,
          max: monthlyVals.length ? Math.max(...monthlyVals) : 0,
          bands: Object.fromEntries(monthlyBands),
        },
      },
      addons: {
        total: addonSlugs.size,
        used: used.length,
        coverage,
        unused: unused.slice(0, 50), // cap to keep logs short
      },
      featured: {
        total: featuredCount,
        resolveOk,
        resolutionRate: resolveRate,
      },
      warnings: {
        lowServices: serviceWarnings,
        lowAddonCoverage: addonCoverageWarn,
      },
      ok: !hasErrors && (!hasWarnings || !cli.strict),
    };
    console.log(C.dim("JSON: " + JSON.stringify(jsonOut)));
  }

  // --- Exit codes ------------------------------------------------------------
  if (hasErrors || (cli.strict && hasWarnings)) {
    console.error(C.red("\n❌ Stats check failed\n"));
    process.exit(1);
  }
  if (hasWarnings) {
    console.warn(C.yellow("\n⚠️  Stats check completed with warnings\n"));
    process.exit(2);
  }
  console.log(C.green("\n✅ Stats check passed\n"));
  process.exit(0);
}

main().catch((err) => {
  console.error(C.red(`\n✖ Error: ${err?.message || err}\n`));
  process.exit(1);
});
