#!/usr/bin/env node
/**
 * Validate that /public matches the mirrored structure derived from src/data/*.
 * - Reports MISSING directories under mirrored roots.
 * - Reports EXTRA files/dirs under mirrored roots (drift).
 * - Optionally requires README.md in each mirrored directory (--readme).
 *
 * Node: >= 18
 *
 * Flags:
 *   --json     : machine-readable output
 *   --verbose  : extra logging
 *   --readme   : require README.md in every mirrored directory
 */

const fs = require("fs");
const path = require("path");

const args = new Set(process.argv.slice(2));
const JSON_OUT = args.has("--json");
const VERBOSE = args.has("--verbose");
const REQUIRE_README = args.has("--readme");

const ROOT = process.cwd();
const SRC = path.resolve(ROOT, "src/data");
const PUBLIC = path.resolve(ROOT, "public");

// These must match mirror-public.js
const DATA_ROOTS = [
  "booking",
  "caseStudies",
  "composers",
  "modules",
  "packages",
  "page",
  "portfolio",
  "taxonomy",
  "testimonials",
];

function log(...m) {
  if (VERBOSE) console.log(...m);
}

function* walkDirs(absDir) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  yield absDir;
  for (const e of entries) {
    if (e.isDirectory()) yield* walkDirs(path.join(absDir, e.name));
  }
}

function relFromData(absUnderSrcData) {
  const rel = path.relative(path.resolve(ROOT, "src/data"), absUnderSrcData);
  return rel.replace(/\\/g, "/");
}

function listExpected(REQUIRE_README_FLAG) {
  const expectedDirs = new Set();
  const expectedFiles = new Set();

  for (const root of DATA_ROOTS) {
    const abs = path.join(SRC, root);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) continue;

    for (const d of walkDirs(abs)) {
      const rel = relFromData(d); // e.g. "packages/seo-services"
      expectedDirs.add(rel);
      if (REQUIRE_README_FLAG) {
        expectedFiles.add(path.join(rel, "README.md").replace(/\\/g, "/"));
      }
    }
  }
  return { expectedDirs, expectedFiles };
}

function listExistingUnderMirroredRoots() {
  // Return two sets: existingDirs and existingFiles (relative to /public)
  const existingDirs = new Set();
  const existingFiles = new Set();

  for (const top of DATA_ROOTS) {
    const absTop = path.join(PUBLIC, top);
    if (!fs.existsSync(absTop)) continue;

    (function walk(p, relBase) {
      const entries = fs.readdirSync(p, { withFileTypes: true });
      existingDirs.add(relBase); // the folder itself
      for (const e of entries) {
        const rel = path.join(relBase, e.name).replace(/\\/g, "/");
        const abs = path.join(PUBLIC, rel);
        if (e.isDirectory()) {
          walk(abs, rel);
        } else {
          existingFiles.add(rel);
        }
      }
    })(absTop, top);
  }

  // Remove the empty string (root) if ever added
  existingDirs.delete("");
  return { existingDirs, existingFiles };
}

function main() {
  const result = {
    missingDirs: [],
    missingFiles: [],
    extraDirs: [],
    extraFiles: [],
    ok: false,
  };

  if (!fs.existsSync(PUBLIC) || !fs.statSync(PUBLIC).isDirectory()) {
    if (JSON_OUT) {
      result.ok = false;
      result.missingDirs = Array.from(listExpected(REQUIRE_README).expectedDirs);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error("❌ /public does not exist.");
    }
    process.exit(1);
  }

  const { expectedDirs, expectedFiles } = listExpected(REQUIRE_README);
  const { existingDirs, existingFiles } = listExistingUnderMirroredRoots();

  // MISSING: expected dirs/files not present
  for (const d of expectedDirs) {
    if (!existingDirs.has(d)) result.missingDirs.push(d);
  }
  for (const f of expectedFiles) {
    if (!existingFiles.has(f)) result.missingFiles.push(f);
  }

  // EXTRA: anything under mirrored roots that isn't expected
  for (const d of existingDirs) {
    if (!expectedDirs.has(d)) result.extraDirs.push(d);
  }
  for (const f of existingFiles) {
    if (!expectedFiles.has(f)) {
      // If README not required, allow README.md to exist without failing
      if (!REQUIRE_README && f.endsWith("/README.md")) continue;
      result.extraFiles.push(f);
    }
  }

  result.ok =
    result.missingDirs.length === 0 &&
    result.missingFiles.length === 0 &&
    result.extraDirs.length === 0 &&
    result.extraFiles.length === 0;

  if (JSON_OUT) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  if (result.ok) {
    console.log("✅ /public mirror matches src/data (no missing or extra paths).");
    process.exit(0);
  }

  // Human-readable report
  if (result.missingDirs.length) {
    console.error("\n❌ Missing directories in /public:");
    for (const d of result.missingDirs.sort()) console.error(" -", d);
  }
  if (result.missingFiles.length) {
    console.error("\n❌ Missing files in /public:");
    for (const f of result.missingFiles.sort()) console.error(" -", f);
  }
  if (result.extraDirs.length) {
    console.error("\n❌ Extra directories in /public (not expected):");
    for (const d of result.extraDirs.sort()) console.error(" -", d);
  }
  if (result.extraFiles.length) {
    console.error("\n❌ Extra files in /public (not expected):");
    for (const f of result.extraFiles.sort()) console.error(" -", f);
  }

  console.error("\nTip: run `npm run mirror:public:prune:dry` to preview deletions,");
  console.error("     then `npm run mirror:public:prune` to apply.");
  process.exit(1);
}

main();
