#!/usr/bin/env tsx
/**
 * Validate that services pages data exists for each L1 hub (and optionally L2):
 * - Each canonical hub from taxonomy should have a folder under:
 *   src/data/page/services-pages/<hub-slug>
 * - (Optional) If an index.ts is expected, verify it exists (toggle with --require-index).
 *
 * Exit codes:
 *   0 = OK, 1 = validation errors, 2 = unexpected crash
 */
import fs from "node:fs";
import path from "node:path";
import { logger, exitOk, exitFail } from "../_shared/logger";
import { servicesTree } from "../../src/data/taxonomy/servicesTree";
import type { HubNode, ServiceNode } from "../../src/types/servicesTaxonomy.types";

const argv = process.argv.slice(2);
const REQUIRE_INDEX = argv.includes("--require-index"); // stricter mode
const CHECK_L2 = argv.includes("--check-l2"); // also verify L2 folders exist

const ROOT = path.resolve(process.cwd(), "src/data/page/services-pages");

function expectDir(p: string, label: string, errs: string[]) {
  if (!fs.existsSync(p) || !fs.statSync(p).isDirectory()) {
    errs.push(`${label} missing: ${path.relative(process.cwd(), p)}`);
  } else {
    logger.debug("exists:", path.relative(process.cwd(), p));
  }
}

function expectFile(p: string, label: string, errs: string[]) {
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) {
    errs.push(`${label} missing: ${path.relative(process.cwd(), p)}`);
  } else {
    logger.debug("exists:", path.relative(process.cwd(), p));
  }
}

try {
  const hubs = (servicesTree.children || []) as HubNode[];

  const errors: string[] = [];

  // Ensure services-pages root exists
  expectDir(ROOT, "services-pages root", errors);

  hubs.forEach((hub) => {
    const hubDir = path.join(ROOT, hub.slug);
    expectDir(hubDir, `Hub folder for "${hub.slug}"`, errors);

    if (REQUIRE_INDEX) {
      const hubIndex = path.join(hubDir, "index.ts");
      expectFile(hubIndex, `Hub index for "${hub.slug}"`, errors);
    }

    if (CHECK_L2) {
      const svcs = (hub.children || []) as ServiceNode[];
      svcs.forEach((svc) => {
        const svcDir = path.join(hubDir, svc.slug);
        expectDir(svcDir, `Service folder for "${hub.slug}/${svc.slug}"`, errors);
        if (REQUIRE_INDEX) {
          const svcIndex = path.join(svcDir, "index.ts");
          expectFile(svcIndex, `Service index for "${hub.slug}/${svc.slug}"`, errors);
        }
      });
    }
  });

  if (errors.length === 0) {
    logger.info("✅ Services pages data present for all required hubs" + (CHECK_L2 ? " and services." : "."));
    exitOk();
  } else {
    logger.error("❌ Services pages data issues:");
    for (const e of errors) logger.error("- " + e);
    exitFail();
  }
} catch (err) {
  logger.error("💥 Unexpected error:", err);
  process.exit(2);
}