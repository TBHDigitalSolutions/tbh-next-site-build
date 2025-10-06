// scripts/packages/build.ts
// scripts/packages/build.ts
/**
 * Packages Build Orchestrator (single entry point)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Run the entire packages pipeline *in order* with clean logs and fail-fast
 * behavior (optionally configurable). This script is intentionally small and
 * framework-agnostic; it only shells out to the real workers.
 *
 * Default pipeline (all steps enabled):
 *   1) mdx-to-registry               (optional if you author JSON directly)
 *   2) validate.ts --schema --featured --growth
 *   3) generate-registry-manifest.ts
 *   4) build-catalog-json.ts
 *   5) build-unified-search.ts
 *   6) packages-stats.ts
 *
 * Why a runner orchestrator?
 * -----------------------------------------------------------------------------
 * - Keeps business logic in the individual scripts (small, testable units)
 * - Provides a single, documented entry point for CI and local dev
 * - Adds consistent logging, timing, and error/exit behavior
 *
 * Usage
 * -----------------------------------------------------------------------------
 *   # Run full pipeline (recommended):
 *   pnpm tsx scripts/packages/build.ts
 *
 *   # Skip the MDX stage (when registry JSON is already generated):
 *   pnpm tsx scripts/packages/build.ts --skip=mdx
 *
 *   # Run only a subset (comma-separated step names):
 *   pnpm tsx scripts/packages/build.ts --only=validate,manifest
 *
 *   # Continue after failures (aggregate and report at the end):
 *   pnpm tsx scripts/packages/build.ts --continue-on-error
 *
 *   # Dry-run (print what would run, without executing):
 *   pnpm tsx scripts/packages/build.ts --dry-run
 *
 *   # Force runner: tsx (default) or node
 *   pnpm tsx scripts/packages/build.ts --runner=tsx
 *   pnpm tsx scripts/packages/build.ts --runner=node
 *
 * Environment knobs
 * -----------------------------------------------------------------------------
 *   PACKAGES_RUNNER=tsx|node     # same as --runner
 *   PACKAGES_SKIP=mdx,stats      # same as repeated --skip=...
 *   PACKAGES_ONLY=validate,...   # same as --only
 *   PACKAGES_CONTINUE=1          # same as --continue-on-error
 *   PACKAGES_DRY_RUN=1           # same as --dry-run
 *   OUT_JSON=path/to/stats.json  # forwarded to packages-stats.ts (optional)
 *
 * Notes
 * -----------------------------------------------------------------------------
 * - This orchestrator expects each worker script to return a proper exit code:
 *     0 = success, non-zero = failure
 * - We favor the `tsx` runner for TypeScript sources. If you compile to JS,
 *   switch the runner to `node` via flag or env.
 */

import { execa } from "execa";
import path from "node:path";
import process from "node:process";

/* =============================================================================
 * Little ANSI color helpers (no dependency on chalk)
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
 * CLI args & env parsing
 * ============================================================================= */

type BuildArgs = {
  only?: string[];                // explicit subset of steps
  skip?: string[];                // steps to skip
  continueOnError: boolean;       // do not stop the pipeline on first failure
  dryRun: boolean;                // skip executing; log planned commands
  runner: "tsx" | "node";         // command used to execute scripts
};

function parseArgs(): BuildArgs {
  const argv = process.argv.slice(2);
  const get = (k: string) => {
    const prefix = `--${k}=`;
    const found = argv.find((a) => a.startsWith(prefix));
    return found ? found.slice(prefix.length) : undefined;
  };
  const has = (k: string) => argv.includes(`--${k}`);

  const envOnly = (process.env.PACKAGES_ONLY ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const envSkip = (process.env.PACKAGES_SKIP ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const only = (get("only") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const skip = (get("skip") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const runnerEnv = (process.env.PACKAGES_RUNNER as "tsx" | "node" | undefined);
  const runnerArg = (get("runner") as "tsx" | "node" | undefined);

  return {
    only: (only.length ? only : envOnly.length ? envOnly : undefined),
    skip: skip.length ? skip : envSkip.length ? envSkip : undefined,
    continueOnError: has("continue-on-error") || process.env.PACKAGES_CONTINUE === "1",
    dryRun: has("dry-run") || process.env.PACKAGES_DRY_RUN === "1",
    runner: runnerArg ?? runnerEnv ?? "tsx",
  };
}

/* =============================================================================
 * Pipeline definition
 * ============================================================================= */

type StepName = "mdx" | "validate" | "manifest" | "catalog" | "search" | "stats";

type Step = {
  name: StepName;
  title: string;
  script: string;     // relative to repo root
  args?: string[];    // script args
  env?: Record<string, string | undefined>;
  required?: boolean; // if true, failure forces non-zero exit even with --continue-on-error
};

// Maintain deterministic order here.
const PIPELINE: Step[] = [
  {
    name: "mdx",
    title: "Convert MDX → registry JSON",
    script: "scripts/packages/mdx-to-registry.ts",
    required: false, // optional stage; often skipped when authoring JSON directly
  },
  {
    name: "validate",
    title: "Validate schema + featured + growth",
    script: "scripts/packages/validate.ts",
    args: ["--schema", "--featured", "--growth"],
    required: true,
  },
  {
    name: "manifest",
    title: "Generate registry manifest",
    script: "scripts/packages/generate-registry-manifest.ts",
    required: true,
  },
  {
    name: "catalog",
    title: "Build catalog JSON",
    script: "scripts/packages/build-catalog-json.ts",
    required: true,
  },
  {
    name: "search",
    title: "Build unified search index",
    script: "scripts/packages/build-unified-search.ts",
    required: true,
  },
  {
    name: "stats",
    title: "Compute package stats",
    script: "scripts/packages/packages-stats.ts",
    // OUT_JSON can be provided by env—pass through transparently:
    env: { OUT_JSON: process.env.OUT_JSON },
    required: false,
  },
];

/* =============================================================================
 * Execution helpers
 * ============================================================================= */

type StepResult = {
  name: StepName;
  title: string;
  skipped: boolean;
  success: boolean;
  code: number;
  ms: number;
  error?: unknown;
};

function now() {
  return Number(process.hrtime.bigint() / 1000000n); // ms
}

function shouldRunStep(step: Step, args: BuildArgs): boolean {
  if (args.only && args.only.length > 0) {
    return args.only.includes(step.name);
  }
  if (args.skip && args.skip.length > 0) {
    return !args.skip.includes(step.name);
  }
  return true;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  return `${s.toFixed(s >= 10 ? 0 : 1)}s`;
}

/* =============================================================================
 * Main
 * ============================================================================= */

(async () => {
  const args = parseArgs();

  const summary: StepResult[] = [];
  const root = process.cwd();

  const header = `${color.bold("Packages build pipeline")} ${color.dim(
    `(runner: ${args.runner}${args.dryRun ? ", dry-run" : ""}${
      args.continueOnError ? ", continue-on-error" : ""
    })`
  )}`;
  console.log(header);

  for (const step of PIPELINE) {
    const run = shouldRunStep(step, args);
    if (!run) {
      summary.push({
        name: step.name,
        title: step.title,
        skipped: true,
        success: true,
        code: 0,
        ms: 0,
      });
      continue;
    }

    const cmd = args.runner; // "tsx" for TS source, or "node" for compiled JS
    const stepArgs = [path.resolve(root, step.script), ...(step.args ?? [])];

    const pretty = `${cmd} ${path.relative(root, step.script)}${step.args?.length ? " " + step.args.join(" ") : ""}`;
    console.log(`\n${color.cyan("→")} ${step.title} ${color.gray(`(${pretty})`)}`);

    const t0 = now();

    if (args.dryRun) {
      summary.push({
        name: step.name,
        title: step.title,
        skipped: true,
        success: true,
        code: 0,
        ms: 0,
      });
      continue;
    }

    try {
      await execa(cmd, stepArgs, {
        stdio: "inherit",
        env: step.env,
      });
      const dt = now() - t0;
      console.log(`${color.green("✔")} ${step.title} ${color.dim(`in ${formatMs(dt)}`)}`);
      summary.push({
        name: step.name,
        title: step.title,
        skipped: false,
        success: true,
        code: 0,
        ms: dt,
      });
    } catch (err: any) {
      const dt = now() - t0;
      const exitCode = typeof err?.exitCode === "number" ? err.exitCode : 1;
      console.error(`${color.red("✖")} ${step.title} ${color.dim(`failed in ${formatMs(dt)}`)}`);
      if (!args.continueOnError || step.required) {
        // Fail fast OR required step failed — exit immediately with the failing code.
        printSummary(summary.concat([{
          name: step.name,
          title: step.title,
          skipped: false,
          success: false,
          code: exitCode,
          ms: dt,
          error: err,
        }]));
        process.exit(exitCode || 1);
      }
      // Record the failure and continue to next steps.
      summary.push({
        name: step.name,
        title: step.title,
        skipped: false,
        success: false,
        code: exitCode,
        ms: dt,
        error: err,
      });
    }
  }

  // All steps attempted (or skipped) — print summary and exit with aggregate code.
  printSummary(summary);
  const failed = summary.some((s) => !s.skipped && !s.success);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  // Catch-all for unexpected orchestrator errors.
  console.error(color.red("✖ Orchestrator crashed"), err);
  process.exit(1);
});

/* =============================================================================
 * Summary printer
 * ============================================================================= */

function printSummary(results: StepResult[]) {
  console.log(`\n${color.bold("Summary")}`);
  const rows = results.map((r) => {
    const status = r.skipped
      ? color.gray("skipped")
      : r.success
      ? color.green("ok")
      : color.red("fail");
    const name = r.name.padEnd(9);
    const time = r.ms ? color.dim(formatMs(r.ms).padStart(6)) : color.dim("   —  ");
    return `  ${status}  ${name}  ${r.title}  ${time}`;
  });
  console.log(rows.join("\n"));

  const ok = results.filter((r) => !r.skipped && r.success).length;
  const skipped = results.filter((r) => r.skipped).length;
  const fail = results.filter((r) => !r.skipped && !r.success).length;

  const footer =
    (fail ? `${color.red(`${fail} failed`)}, ` : "") +
    `${color.green(`${ok} ok`)}` +
    (skipped ? `, ${color.gray(`${skipped} skipped`)}` : "");
  console.log(`\n${footer}\n`);
}
