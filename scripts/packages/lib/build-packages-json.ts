// scripts/packages/lib/build-packages-json.ts
//
// Aggregate all service package arrays (e.g., video-production-packages.ts)
// into a single JSON catalog: src/data/packages/packages.json
//
// Finds (glob):
//   src/data/packages/*/*-packages.ts      ← only service subfolders
//
// Writes:
//   src/data/packages/packages.json
//
// Usage:
//   npx tsx scripts/packages/lib/build-packages-json.ts
//
// Optional flags:
//   --globs "src/data/packages/*/*-packages.ts"   // comma-separated if multiple
//   --out   "src/data/packages/packages.json"

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import fg from "fast-glob";

type AnyRecord = Record<string, unknown>;

type Pkg = {
  id: string;
  service: string;
  name: string;
  tier: string;
  summary?: string;
  idealFor?: string;
  outcomes?: string[];
  features?: Array<{ label: string; detail?: string }>;
  price?: AnyRecord;
  badges?: string[];
  sla?: string;
  popular?: boolean;
};

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i];
  const v = process.argv[i + 1];
  if (k?.startsWith("--") && typeof v === "string") args.set(k.slice(2), v);
}

const DEFAULT_GLOB = "src/data/packages/*/*-packages.ts";
const GLOB_PATTERNS = (args.get("globs") ?? DEFAULT_GLOB)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const OUT_PATH = args.get("out") ?? "src/data/packages/packages.json";

function isPkgArray(value: unknown): value is Pkg[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p === "object" &&
        "id" in p &&
        "service" in p &&
        "name" in p &&
        "tier" in p
    )
  );
}

async function readModules(files: string[]): Promise<Pkg[]> {
  const all: Pkg[] = [];

  for (const file of files) {
    const url = pathToFileURL(path.resolve(file)).href;
    const mod: Record<string, unknown> = await import(url);

    let arr: unknown =
      Array.isArray((mod as any).default) ? (mod as any).default : undefined;

    if (!arr) {
      const candidates = Object.values(mod).filter(isPkgArray);
      if (candidates.length > 0) arr = candidates[0];
    }

    if (!arr || !isPkgArray(arr)) {
      console.warn(`⚠️  No package array export found in ${file} (skipped)`);
      continue;
    }

    all.push(...(arr as Pkg[]));
  }

  return all;
}

function dedupeAndSort(pkgs: Pkg[]): Pkg[] {
  const byId = new Map<string, Pkg>();
  const dupes: string[] = [];

  for (const p of pkgs) {
    if (byId.has(p.id)) {
      dupes.push(p.id);
      continue;
    }
    byId.set(p.id, p);
  }

  if (dupes.length) {
    console.error(
      `❌ Duplicate package ids detected (${dupes.length}): ${Array.from(
        new Set(dupes)
      ).slice(0, 10).join(", ")}${dupes.length > 10 ? "…" : ""}`
    );
    process.exit(1);
  }

  const TIER_ORDER = new Map<string, number>([
    ["Essential", 0],
    ["Professional", 1],
    ["Enterprise", 2],
  ]);

  return Array.from(byId.values()).sort((a, b) => {
    const sa = String(a.service ?? "");
    const sb = String(b.service ?? "");
    if (sa !== sb) return sa.localeCompare(sb);

    const ta = TIER_ORDER.get(String(a.tier)) ?? 99;
    const tb = TIER_ORDER.get(String(b.tier)) ?? 99;
    if (ta !== tb) return ta - tb;

    return String(a.name ?? "").localeCompare(String(b.name ?? ""));
  });
}

async function writeJson(outPath: string, data: unknown) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  const files = await fg(GLOB_PATTERNS, { absolute: false, dot: false });
  if (!files.length) {
    console.error(
      `❌ No *-packages.ts files found for patterns: ${GLOB_PATTERNS.join(", ")}`
    );
    process.exit(1);
  }

  const pkgs = await readModules(files);

  const invalid = pkgs.filter((p) => !p.id || !p.service || !p.name || !p.tier);
  if (invalid.length) {
    console.error(
      `❌ ${invalid.length} packages missing required fields (id, service, name, tier).`
    );
    process.exit(1);
  }

  const final = dedupeAndSort(pkgs);

  await writeJson(OUT_PATH, final);

  const byService = final.reduce<Record<string, number>>((acc, p) => {
    acc[p.service] = (acc[p.service] ?? 0) + 1;
    return acc;
  }, {});

  console.log(
    [
      "📦 Build Packages Catalog",
      `• Source files:   ${files.length}`,
      `• Packages found: ${pkgs.length}`,
      `• Written:        ${final.length}`,
      `• By service:     ${Object.entries(byService)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`,
      `• Output:         ${OUT_PATH}`,
    ].join("\n")
  );

  if (final.length === 0) process.exitCode = 2;
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ build-packages-json failed:\n", err);
    process.exit(1);
  });
}
