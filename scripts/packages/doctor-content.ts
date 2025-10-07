// scripts/packages/doctor-content.ts
/**
 * Doctor (authoring linter) — fast, fail-early feedback for content authors
 * =============================================================================
 * WHAT THIS DOES
 * -----------------------------------------------------------------------------
 * - Scans package MDX and reports common authoring issues BEFORE the build fails
 * - Does NOT write outputs; intended for local dev + CI preflight
 *
 * KEY CHECKS
 * -----------------------------------------------------------------------------
 * - Slug matches folder
 * - "## Purpose" section present in MDX body
 * - Hero summary present
 * - Includes: must have either includesGroups OR includesTable
 * - NEW: notes must be a STRING (warn if array; builder will auto-normalize)
 *
 * USAGE
 * -----------------------------------------------------------------------------
 *   tsx scripts/packages/doctor-content.ts [--strict]
 *   --strict → exit(1) if any warnings are found
 */

import fs from "node:fs/promises";
import glob from "fast-glob";
import matter from "gray-matter";
import { PKG_CFG } from "./packages.config.js";

const STRICT = process.argv.includes("--strict");
let warnCount = 0;

async function main() {
  const files = await glob(PKG_CFG.contentGlob);

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const { data: fm, content } = matter(raw);

    const slugFromPath = file.split("/").at(-2);

    // Slug consistency
    if (fm.slug && fm.slug !== slugFromPath) {
      console.warn(`⚠️  Slug mismatch: frontmatter="${fm.slug}" path="${slugFromPath}" (${file})`);
      warnCount++;
    }

    // Purpose section required
    if (!/^\s*##\s+Purpose\b/im.test(content)) {
      console.warn(`⚠️  Missing "## Purpose" section in ${file}`);
      warnCount++;
    }

    // Hero summary required
    if (!fm.summary) {
      console.warn(`⚠️  Missing hero.summary in ${file}`);
      warnCount++;
    }

    // Includes guardrail: must have groups OR table
    const hasGroups = Array.isArray(fm.includesGroups) && fm.includesGroups.length > 0;
    const hasTable  = !!fm.includesTable;
    if (!hasGroups && !hasTable) {
      console.warn(`⚠️  Add "includesGroups" or "includesTable" in ${file}`);
      warnCount++;
    }
    if (hasGroups && hasTable) {
      console.warn(`⚠️  Both includesGroups & includesTable present in ${file} (prefer groups)`);
      warnCount++;
    }

    // NEW: Notes should be a single string (not an array)
    if (Array.isArray(fm.notes)) {
      console.warn(
        `⚠️  notes should be a single string in ${file}. ` +
        `Use a YAML block scalar (>) or join with bullets (e.g., " • "). ` +
        `The builder will auto-normalize, but please fix at authoring time.`
      );
      warnCount++;
    }
  }

  if (STRICT && warnCount) {
    console.error(`❌ doctor found ${warnCount} warning(s) in --strict mode`);
    process.exit(1);
  } else if (warnCount) {
    console.log(`ℹ︎ doctor finished with ${warnCount} warning(s).`);
  } else {
    console.log("✓ doctor found no issues.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
