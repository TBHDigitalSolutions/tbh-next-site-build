// scripts/packages/doctor.ts
#!/usr/bin/env tsx
// scripts/packages/doctor.ts
/**
 * Packages Doctor
 * ---------------
 * Orchestrates all packages-domain checks with a clean, colorized summary.
 *
 * Runs in order:
 *   1) build.ts (default: MODE=check — non-destructive)
 *   2) validate-packages.ts
 *   3) check-featured-refs.ts
 *   4) check-growth-embeds.ts
 *   5) packages-stats.ts
 *
 * Usage:
 *   pnpm tsx scripts/packages/doctor.ts
 *
 * Common flags:
 *   --write                   Run build in write mode (MODE=create-or-update). Default is check.
 *   --strict                  Treat warnings as errors (affects featured/growth checks).
 *   --dir=src/data/packages   Override data directory root (default shown)
 *   --bundles=bundles.json    Override bundles file name
 *   --featured=featured.json  Override featured file name
 *   --count=3                 First N featured to validate for growth embeds
 *   --min-features=6          Minimum feature count per bundle for growth embeds
 *   --badge=one               Badge rule: one | at-least-one | none
 *   --json                    Emit a machine-readable JSON summary to stdout (in addition to text)
 *   --no-build                Skip the build step
 *
 * Exit codes:
 *   0 = All good
 *   1 = One or more steps failed (or warnings treated as errors with --strict)
 *   2 = Steps succeeded with warnings (non-strict mode)
 */

import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import process from "node:process";

type StepResult = {
  id: string;
  title: string;
  code: number;        // 0 OK, 1 ERR, 2 WARN
  durationMs: number;
  stdout: string;
  stderr: string;
};

type Cli = {
  write: boolean;
  strict: boolean;
  json: boolean;
  noBuild: boolean;
  dir: string;
  bundles: string;
  featured: string;
  count: number;
  minFeatures: number;
  badge: "one" | "at-least-one" | "none";
};

const C = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
};

function parseArgs(): Cli {
  const argv = process.argv.slice(2);
  const get = (key: string, def?: string) => {
    const hit = argv.find((a) => a.startsWith(`${key}=`));
    return hit ? hit.split("=", 2)[1] : def;
  };
  return {
    write: argv.includes("--write"),
    strict: argv.includes("--strict"),
    json: argv.includes("--json"),
    noBuild: argv.includes("--no-build"),
    dir: get("--dir", path.join("src", "data", "packages"))!,
    bundles: get("--bundles", "bundles.json")!,
    featured: get("--featured", "featured.json")!,
    count: Number(get("--count", "3")),
    minFeatures: Number(get("--min-features", "6")),
    badge: (get("--badge", "one") as Cli["badge"]) || "one",
  };
}

/**
 * Resolve the tsx runner. Preference order:
 *  1) local node_modules/.bin/tsx
 *  2) global "tsx" on PATH
 *  3) node --loader tsx (fallback)
 */
function resolveTsxRunner(): { cmd: string; args: string[] } {
  const localTsx = path.resolve(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "tsx.cmd" : "tsx");
  if (fs.existsSync(localTsx)) return { cmd: localTsx, args: [] };
  // Try global
  return { cmd: "tsx", args: [] };
}

function rel(p: string) {
  return path.relative(process.cwd(), p).replaceAll(path.sep, "/");
}

function runScript(scriptPath: string, args: string[], env?: Record<string, string | undefined>): Promise<StepResult> {
  const { cmd, args: runnerArgs } = resolveTsxRunner();
  const title = path.basename(scriptPath);
  const id = title.replace(/\.ts$/, "");
  const full = path.resolve(process.cwd(), scriptPath);

  return new Promise<StepResult>((resolve) => {
    const start = Date.now();
    let stdout = "";
    let stderr = "";

    const child = spawn(cmd, [...runnerArgs, full, ...args], {
      env: { ...process.env, ...(env || {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("close", (code) => {
      resolve({
        id,
        title,
        code: code ?? 1,
        durationMs: Date.now() - start,
        stdout,
        stderr,
      });
    });
  });
}

function statusIcon(code: number) {
  if (code === 0) return C.green("✔");
  if (code === 2) return C.yellow("▲");
  return C.red("✖");
}

function statusLabel(code: number) {
  if (code === 0) return C.green("OK");
  if (code === 2) return C.yellow("WARN");
  return C.red("FAIL");
}

function ms(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  const s = (ms / 1000).toFixed(2);
  return `${s}s`;
}

async function main() {
  const cli = parseArgs();

  console.log(C.bold("\n🩺  Packages Doctor"));
  console.log(`• Root: ${C.cyan(process.cwd())}`);
  console.log(`• Data: ${C.cyan(rel(path.join(process.cwd(), cli.dir)))}`);
  console.log(`• Mode: ${C.cyan(cli.write ? "write" : "check-only")}${cli.strict ? C.yellow(" (strict)") : ""}\n`);

  const steps: Array<Promise<StepResult>> = [];

  if (!cli.noBuild) {
    steps.push(
      runScript("scripts/packages/build.ts", [], {
        MODE: cli.write ? "create-or-update" : "check",
      })
    );
  }

  steps.push(runScript("scripts/packages/validate-packages.ts", []));

  const commonArgs = [
    `--dir=${cli.dir}`,
    `--bundles=${cli.bundles}`,
    `--featured=${cli.featured}`,
  ];

  steps.push(
    runScript(
      "scripts/packages/check-featured-refs.ts",
      [
        ...commonArgs,
        "--require=3",
        ...(cli.strict ? ["--fail-on-duplicate"] : []),
      ],
    )
  );

  steps.push(
    runScript(
      "scripts/packages/check-growth-embeds.ts",
      [
        ...commonArgs,
        `--count=${cli.count}`,
        `--min-features=${cli.minFeatures}`,
        `--badge=${cli.badge}`,
        ...(cli.strict ? ["--strict"] : []),
      ],
    )
  );

  steps.push(runScript("scripts/packages/packages-stats.ts", commonArgs));

  // Run sequentially to keep logs readable
  const results: StepResult[] = [];
  for (const p of steps) {
    const r = await p;
    const icon = statusIcon(r.code);
    const label = statusLabel(r.code);
    console.log(`${icon} ${C.bold(r.title)} ${C.gray(`(${ms(r.durationMs)})`)}`);
    if (r.stdout.trim()) console.log(C.dim(r.stdout.trim()) + "\n");
    if (r.stderr.trim()) console.error(r.stderr.trim() + "\n");
    results.push(r);
  }

  // Summary table
  console.log(C.bold("Summary:\n"));
  const rows = results.map((r) => {
    const s = statusLabel(r.code).padEnd(6, " ");
    return `  ${statusIcon(r.code)} ${r.title.padEnd(30, " ")}  ${s}  ${C.gray(ms(r.durationMs))}`;
  });
  console.log(rows.join("\n") + "\n");

  // Overall exit code
  const hasFail = results.some((r) => r.code === 1);
  const hasWarn = results.some((r) => r.code === 2);

  if (cli.json) {
    const payload = {
      ok: !hasFail && (!hasWarn || !cli.strict),
      strict: cli.strict,
      results: results.map((r) => ({
        id: r.id,
        title: r.title,
        code: r.code,
        durationMs: r.durationMs,
      })),
    };
    // Print as a single line to keep CI logs tidy
    console.log(C.dim(`JSON: ${JSON.stringify(payload)}`));
  }

  if (hasFail || (cli.strict && hasWarn)) {
    console.error(C.red("❌ Doctor found issues. See logs above.\n"));
    process.exit(1);
  }

  if (hasWarn) {
    console.warn(C.yellow("⚠️  Doctor completed with warnings.\n"));
    process.exit(2);
  }

  console.log(C.green("✅ All checks passed.\n"));
  process.exit(0);
}

main().catch((err) => {
  console.error(C.red(`\n✖ Doctor crashed: ${err?.message || err}\n`));
  process.exit(1);
});
