// scripts/services/lint-services-seo.ts
/* eslint-disable no-console */
/* npm run lint:services:seo */
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

// ---- config you will likely NOT need to change
const ROOT = process.cwd();
const BRAND = "TBH Digital Solutions"; // change to your brand string
const PAGES_ROOT = path.join(ROOT, "src/data/page/services-pages");

// ---- import your taxonomy (TS is fine under tsx)
import { servicesTree } from "../../src/data/taxonomy/servicesTree";
import type {
  AnyServiceNode,
  HubNode,
  ServiceNode,
  SubServiceNode,
} from "../../src/types/servicesTaxonomy.types";

// ---- shared helpers
type NodeKind = "hub" | "service" | "subservice";

type PageModule = {
  meta?: { title?: string; description?: string };
  hero?: { content?: { title?: string } };
};

function titleCase(s: string) {
  return s.replace(/(^|[-\s])\w/g, (m) => m.toUpperCase());
}

function expectedFor(node: AnyServiceNode): { level: "L2" | "L3" | "L4"; expH1: string; expTitle: string; pagePath: string } {
  if (node.kind === "hub") {
    // L2 hub (ends with -services in URL, but taxonomy slug may be without -services in some repos)
    const hubSlug = (node as HubNode).slug.endsWith("-services")
      ? (node as HubNode).slug
      : `${(node as HubNode).slug}-services`;
    const expH1 = `${node.title} Services`;
    const expTitle = `${node.title} Services | ${BRAND}`;
    const pagePath = path.join(PAGES_ROOT, hubSlug, "index.ts");
    return { level: "L2", expH1, expTitle, pagePath };
  }
  if (node.kind === "service") {
    const svc = node as ServiceNode;
    const parent = (svc as any).parent ?? null; // optional, not required
    const expH1 = `${svc.title} Services`;
    const expTitle = `${svc.title} Services | ${BRAND}`;
    const pagePath = path.join(PAGES_ROOT, svc.path.replace(/^\/services\//, ""), "index.ts");
    return { level: "L3", expH1, expTitle, pagePath };
  }
  // subservice
  const sub = node as SubServiceNode;
  const expH1 = sub.title; // no "Services" at L4
  const expTitle = `${sub.title} | ${BRAND}`;
  const pagePath = path.join(PAGES_ROOT, sub.path.replace(/^\/services\//, ""), "index.ts");
  return { level: "L4", expH1, expTitle, pagePath };
}

function flatten(n: AnyServiceNode): AnyServiceNode[] {
  const out: AnyServiceNode[] = [n];
  if ("children" in n && Array.isArray(n.children)) {
    for (const c of n.children) out.push(...flatten(c as AnyServiceNode));
  }
  return out;
}

async function loadPageModule(abs: string): Promise<PageModule | null> {
  try {
    const stat = await fs.stat(abs).catch(() => null);
    if (!stat || !stat.isFile()) return null;
    // dynamic import TS with tsx runner
    const mod = (await import(pathToFileURL(abs).href)) as PageModule;
    return mod ?? null;
  } catch {
    return null;
  }
}

type Problem =
  | { type: "missing-file"; level: string; path: string }
  | { type: "missing-exports"; level: string; path: string; missing: string[] }
  | { type: "mismatch"; level: string; path: string; field: "H1" | "title"; expected: string; actual: string | undefined };

async function main() {
  const nodes = flatten(servicesTree as AnyServiceNode).filter((n) => n.slug !== "services");
  const problems: Problem[] = [];

  for (const node of nodes) {
    const { level, expH1, expTitle, pagePath } = expectedFor(node);

    const mod = await loadPageModule(pagePath);
    if (!mod) {
      problems.push({ type: "missing-file", level, path: pagePath });
      continue;
    }

    const missing: string[] = [];
    const actualH1 = mod?.hero?.content?.title;
    const actualTitle = mod?.meta?.title;

    if (actualH1 == null) missing.push("hero.content.title");
    if (actualTitle == null) missing.push("meta.title");

    if (missing.length) {
      problems.push({ type: "missing-exports", level, path: pagePath, missing });
      continue;
    }

    if (actualH1 !== expH1) {
      problems.push({
        type: "mismatch",
        level,
        path: pagePath,
        field: "H1",
        expected: expH1,
        actual: actualH1,
      });
    }
    if (actualTitle !== expTitle) {
      problems.push({
        type: "mismatch",
        level,
        path: pagePath,
        field: "title",
        expected: expTitle,
        actual: actualTitle,
      });
    }
  }

  if (problems.length === 0) {
    console.log("✅ Services SEO lint passed: H1/title match taxonomy & level rules.");
    process.exit(0);
  }

  // pretty report
  console.log("❌ Services SEO lint found issues:\n");
  for (const p of problems) {
    if (p.type === "missing-file") {
      console.log(`• [${p.level}] Missing page data file: ${p.path}`);
    } else if (p.type === "missing-exports") {
      console.log(`• [${p.level}] Missing exports in ${p.path}: ${p.missing.join(", ")}`);
    } else {
      console.log(`• [${p.level}] ${p.field} mismatch in ${p.path}`);
      console.log(`    expected: ${p.expected}`);
      console.log(`    actual:   ${p.actual ?? "(undefined)"}`);
    }
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error in lint-services-seo:", err);
  process.exit(2);
});