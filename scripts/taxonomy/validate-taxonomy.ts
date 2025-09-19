#!/usr/bin/env tsx
/**
 * Validate services taxonomy integrity against a few invariants:
 * - Canonical L1 hub slugs are unique.
 * - No subservice uses the reserved slug "packages".
 * - Each node has minimal hero fields required by templates.
 *
 * Exit codes:
 *   0 = OK, 1 = validation errors, 2 = unexpected crash
 */
import { logger, exitOk, exitFail } from "../_shared/logger";
import { servicesTree } from "../../src/data/taxonomy/servicesTree";
import type {
  AnyServiceNode,
  HubNode,
  ServiceNode,
  SubServiceNode,
} from "../../src/types/servicesTaxonomy.types";

type Issue = { level: "error" | "warn"; path: string; msg: string };
const issues: Issue[] = [];

function push(level: Issue["level"], path: string, msg: string) {
  issues.push({ level, path, msg });
}

function hasHero(n: { hero?: any; title?: string }, path: string) {
  if (!n.hero || !n.hero.content || !n.hero.content.title) {
    push("error", path, "Missing hero.content.title");
  }
}

function unique<T>(arr: T[]) {
  return new Set(arr).size === arr.length;
}

function validate(tree: AnyServiceNode) {
  const hubs = (tree.children || []) as HubNode[];

  // L1: hub slugs unique
  const hubSlugs = hubs.map((h) => h.slug);
  if (!unique(hubSlugs)) {
    push("error", "/services", "Duplicate hub slugs detected");
  }
  hubs.forEach((hub) => {
    const hubPath = `/services/${hub.slug}`;
    hasHero(hub, hubPath);

    // L2: service slugs unique per hub
    const svcs = (hub.children || []) as ServiceNode[];
    const svcSlugs = svcs.map((s) => s.slug);
    if (!unique(svcSlugs)) {
      push("error", hubPath, "Duplicate service slugs detected");
    }
    svcs.forEach((svc) => {
      const svcPath = `${hubPath}/${svc.slug}`;
      hasHero(svc, svcPath);

      // L3: subservices
      const subs = (svc.children || []) as SubServiceNode[];
      const subSlugs = subs.map((s) => s.slug);
      if (!unique(subSlugs)) {
        push("error", svcPath, "Duplicate subservice slugs detected");
      }
      subs.forEach((sub) => {
        const subPath = `${svcPath}/${sub.slug}`;
        hasHero(sub, subPath);

        if (sub.slug === "packages") {
          push("error", subPath, 'Reserved slug "packages" is not allowed at L3');
        }
      });
    });
  });
}

try {
  logger.debug("Loaded servicesTree with %d hubs", (servicesTree.children || []).length);
  validate(servicesTree);

  const errors = issues.filter(i => i.level === "error");
  const warns  = issues.filter(i => i.level === "warn");

  if (errors.length === 0) {
    logger.info("✅ Taxonomy valid.");
    if (warns.length) logger.warn("⚠️ Warnings:", warns);
    exitOk();
  } else {
    logger.error("❌ Taxonomy errors:");
    for (const e of errors) logger.error(`- [${e.path}] ${e.msg}`);
    if (warns.length) {
      logger.warn("\nWarnings:");
      for (const w of warns) logger.warn(`- [${w.path}] ${w.msg}`);
    }
    exitFail();
  }
} catch (err) {
  logger.error("💥 Unexpected error:", err);
  process.exit(2);
}