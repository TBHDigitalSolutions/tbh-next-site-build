// scripts/packages/mirror-docs-to-registry.ts
/**
 * mirror-docs-to-registry.ts
 * =============================================================================
 * PURPOSE
 * -----------------------------------------------------------------------------
 * Mirror the docs package catalog (MDX) into the runtime **registry** structure
 * by generating (or refreshing):
 *   - src/packages/registry/<service>-packages/<slug>/base.ts
 *   - src/packages/registry/<service>-packages/<slug>/index.ts
 *
 * The generated `index.ts` prefers `./content.generated.json` (written by your
 * MDX pipeline) and falls back to the generated `base.ts`. This guarantees each
 * package folder is runnable in dev even before the MDX JSON exists.
 *
 * WHY
 * -----------------------------------------------------------------------------
 * - Keep docs MDX as the authoring source.
 * - Ensure registry packages are present and consistent (one folder per package).
 * - Standardize loader logic across all packages.
 *
 * WHAT THIS DOES
 * -----------------------------------------------------------------------------
 * 1) Finds every `public.mdx` under docs (supports nested "subservice" folders).
 * 2) Parses & validates frontmatter against the *author-facing* schema:
 *      `PackageMarkdownSchema` from "@/packages/lib/mdx-frontmatter-schema"
 * 3) Extracts/compiles a "Purpose" section to HTML (fallback: whole body).
 * 4) Writes a strongly-typed `base.ts` from that data (safe JSON → TS).
 * 5) Writes an `index.ts` that imports `content.generated.json` (if present)
 *    or fallback `base.ts`, and validates with the *runtime* schema:
 *      `PackageSchema` from "@/packages/lib/package-schema"
 *
 * NON-GOALS
 * -----------------------------------------------------------------------------
 * - Does not generate `content.generated.json` (that is done by your MDX script).
 * - Does not generate the manifest or data façade (use the generator I gave you:
 *   `scripts/packages/generate-registry-manifest.ts`).
 *
 * USAGE
 * -----------------------------------------------------------------------------
 *   # Mirror everything (common case)
 *   npx tsx scripts/packages/mirror-docs-to-registry.ts
 *
 *   # Be noisy
 *   npx tsx scripts/packages/mirror-docs-to-registry.ts --verbose
 *
 *   # Dry run (see what would change)
 *   npx tsx scripts/packages/mirror-docs-to-registry.ts --dry-run
 *
 *   # Force overwrite existing base/index
 *   npx tsx scripts/packages/mirror-docs-to-registry.ts --force
 *
 * DEFAULT PATHS
 * -----------------------------------------------------------------------------
 *   DOCS root     : ./docs/packages/catalog
 *   REGISTRY root : ./src/packages/registry
 *
 * DEPENDENCIES (already in your repo)
 * -----------------------------------------------------------------------------
 *   - unified, remark-parse, remark-gfm, remark-rehype, rehype-stringify
 *   - fast-glob, gray-matter
 *   - Type schemas you already have:
 *       - "@/packages/lib/mdx-frontmatter-schema" (exports PackageMarkdownSchema)
 *       - "@/packages/lib/package-schema"        (exports PackageSchema)
 */

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Root, Content, Heading } from "mdast";

import { PackageMarkdownSchema } from "@/packages/lib/schemas/mdx-frontmatter-schema";
import { PackageSchema } from "@/packages/lib/schemas/package-schema";

/* =============================================================================
 * CLI
 * ============================================================================= */

type Cli = {
  force?: boolean;
  dry?: boolean;
  verbose?: boolean;
  docsRoot?: string;
  registryRoot?: string;
};

function parseArgs(argv = process.argv.slice(2)): Cli {
  const cli: Cli = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const v = argv[i + 1];
    if (a === "--force") cli.force = true;
    if (a === "--dry-run" || a === "--dry") cli.dry = true;
    if (a === "--verbose") cli.verbose = true;
    if (a === "--docsRoot") { cli.docsRoot = v; i++; }
    if (a === "--registryRoot") { cli.registryRoot = v; i++; }
  }
  return cli;
}

const ROOT = process.cwd();
const DEFAULT_DOCS_ROOT = path.resolve(ROOT, "docs/packages/catalog");
const DEFAULT_REGISTRY_ROOT = path.resolve(ROOT, "src/packages/registry");

const cli = parseArgs();

/* =============================================================================
 * Utilities
 * ============================================================================= */

async function exists(file: string) {
  try { await fs.access(file); return true; } catch { return false; }
}

/** Read utf8 with a nice error. */
async function readText(file: string) {
  try { return await fs.readFile(file, "utf8"); }
  catch (e: any) { throw new Error(`Failed to read ${file}: ${e?.message || e}`); }
}

/** Write only when changed (keeps git clean). */
async function writeIfChanged(file: string, next: string, dry = false) {
  const prev = await (exists(file) ? fs.readFile(file, "utf8") : "");
  if (prev === next) return false;
  if (dry) return true;
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, next, "utf8");
  return true;
}

/** Slugify a label for ids. */
function idify(s: string, fallback = "id") {
  const base = (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

/** Minimal HTML compiler for a markdown slice (no JSX). */
async function mdToHtml(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(file);
}

/**
 * Extract the "Purpose" section (by heading text), else return the whole body.
 * Matches common headings like "Purpose", "Why you need this", etc.
 */
async function extractPurposeHtml(md: string): Promise<string> {
  const tree = unified().use(remarkParse).parse(md) as Root;
  const wanted = new Set(["purpose", "why you need this", "what good looks like"]);

  let startIndex = -1;
  let startDepth = 0;

  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i] as Content;
    if (node.type === "heading") {
      const h = node as Heading;
      const text = (h.children || [])
        .filter((c) => c.type === "text")
        .map((c: any) => String(c.value ?? ""))
        .join("")
        .trim()
        .toLowerCase();
      if (wanted.has(text)) {
        startIndex = i;
        startDepth = h.depth;
        break;
      }
    }
  }

  if (startIndex === -1) {
    // Fall back: compile the entire body
    return mdToHtml(md);
  }

  const slice: Content[] = [];
  for (let i = startIndex; i < tree.children.length; i++) {
    const node = tree.children[i] as Content;
    if (i > startIndex && node.type === "heading" && (node as Heading).depth <= startDepth) break;
    slice.push(node);
  }

  const html = await unified()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .stringify({ type: "root", children: slice } as any);

  return String(html);
}

/** Map the internal short service code → docs/registry dir slug. */
function serviceDirFromCode(code: string): string {
  switch (code) {
    case "webdev": return "web-development";
    case "video": return "video-production";
    case "content": return "content-production";
    case "leadgen": return "lead-generation";
    case "seo": return "seo";
    case "marketing": return "marketing";
    default: return idify(code);
  }
}

/** Normalize a table-like includes shape into the strict runtime shape. */
function normalizeIncludesTableLike(pkgName: string, like: any | undefined) {
  if (!like || !Array.isArray(like.rows) || like.rows.length === 0) return undefined;
  const columnLabels = Array.isArray(like.columns) && like.columns.length > 0 ? like.columns : [pkgName];
  const columns = columnLabels.map((label: string, i: number) => ({
    id: `c${i}-${idify(label, `c${i}`)}`,
    label,
  }));
  const rows = (like.rows as any[])
    .map((r, i) => {
      const cells = Array.isArray(r) ? r : r?.cells;
      if (!cells || cells.length === 0) return null;
      const rawLabel = String(cells[0] ?? "").trim();
      if (!rawLabel) return null;
      const values: Record<string, boolean | string> = {};
      for (let j = 1; j < cells.length && j <= columns.length; j++) {
        const raw = cells[j];
        const truthy =
          raw === true ||
          (typeof raw === "string" && raw.trim() !== "" && raw.toLowerCase() !== "false" && raw !== "0");
        if (truthy) values[columns[j - 1].id] = true;
      }
      return { id: `row-${i}-${idify(rawLabel, "row")}`, label: rawLabel, values };
    })
    .filter(Boolean);
  return { caption: like.caption ?? "What’s included", columns, rows };
}

/** Render `base.ts` content from MDX frontmatter + compiled purposeHtml. */
function renderBaseTs(front: any, purposeHtml?: string) {
  // NOTE: we keep the object JSON-like to avoid TypeScript syntax pitfalls.
  // The index.ts performs validation with PackageSchema at import time.
  const includes = Array.isArray(front.includes) ? front.includes : front.includesGroups;
  const includesTable = includes ? undefined : normalizeIncludesTableLike(front.name, front.includesTable);

  // Normalize FAQs ⇒ { id, question, answer }
  const faqs = Array.isArray(front.faqs)
    ? front.faqs.map((f: any) => ({
        id: f.id ?? undefined,
        question: f.question ?? f.q,
        answer: f.answer ?? f.a,
      }))
    : [];

  const requirements = front.extras?.requirements ?? front.requirements;
  const timeline = front.extras?.timeline ?? front.timeline;
  const ethics = front.extras?.ethics ?? front.ethics;

  const runtimeCandidate = {
    id: front.id,
    slug: front.slug,
    service: front.service,           // short code ("leadgen", "seo", etc.)
    category: front.category,         // optional
    name: front.name,
    tier: front.tier,
    tags: front.tags ?? [],
    badges: front.badges ?? [],
    summary: front.summary,
    description: front.description,
    image: front.image,
    price: front.price,
    priceBand: front.priceBand,
    painPoints: front.painPoints,
    purposeHtml: front.purposeHtml ?? purposeHtml,
    icp: front.icp,
    outcomes: front.outcomes ?? [],
    features: front.features ?? [],
    includes: includes ?? [],
    includesTable,
    deliverables: front.deliverables ?? [],
    requirements,
    timeline,
    ethics,
    notes: front.notes,
    faqs,
    relatedSlugs: front.crossSell ?? front.relatedSlugs ?? [],
    addOnRecommendations: front.addOns ?? front.addOnRecommendations ?? [],
    seo: front.seo,
    copy: front.copy,
  };

  // Pretty JSON with stable keys
  const json = JSON.stringify(runtimeCandidate, null, 2);

  const banner =
    `/**\n` +
    ` * AUTO-GENERATED base.ts from docs public.mdx\n` +
    ` * Source of truth: docs frontmatter (+ compiled Purpose HTML)\n` +
    ` * Regenerate with: npx tsx scripts/packages/mirror-docs-to-registry.ts\n` +
    ` */\n\n` +
    `/* eslint-disable */\n`;

  // Keep this file minimal; validation happens in the loader.
  return `${banner}export const base = ${json} as const;\n`;
}

/** Render per-package loader index.ts that prefers JSON and falls back to base.ts. */
function renderIndexTs(prefer: "json" | "base") {
  const banner =
    `/**\n` +
    ` * AUTO-GENERATED loader\n` +
    ` * Prefers ./content.generated.json (from MDX pipeline), falls back to ./base.ts\n` +
    ` * Regenerate with: npx tsx scripts/packages/mirror-docs-to-registry.ts\n` +
    ` */\n\n` +
    `/* eslint-disable */\n`;

  if (prefer === "json") {
    return (
      banner +
      `import content from "./content.generated.json";\n` +
      `import { PackageSchema } from "@/packages/lib/package-schema";\n\n` +
      `const pkg = PackageSchema.parse(content);\n` +
      `export default pkg;\n` +
      `export type PackageRecord = typeof pkg;\n`
    );
  }
  return (
    banner +
    `import { base } from "./base";\n` +
    `import { PackageSchema } from "@/packages/lib/package-schema";\n\n` +
    `const pkg = PackageSchema.parse(base);\n` +
    `export default pkg;\n` +
    `export type PackageRecord = typeof pkg;\n`
  );
}

/* =============================================================================
 * Main
 * ============================================================================= */

async function main() {
  const DOCS_ROOT = path.resolve(ROOT, cli.docsRoot || DEFAULT_DOCS_ROOT);
  const REGISTRY_ROOT = path.resolve(ROOT, cli.registryRoot || DEFAULT_REGISTRY_ROOT);

  // Support both <service>/<slug>/public.mdx and <service>/<subservice>/<slug>/public.mdx
  const pattern = path.posix.join(
    path.relative(ROOT, DOCS_ROOT).split(path.sep).join(path.posix.sep),
    "**",
    "public.mdx"
  );

  const files = await fg(pattern, { dot: false });
  if (!files.length) {
    console.warn(`No MDX files found under ${DOCS_ROOT}`);
    return;
  }

  let written = 0;
  for (const rel of files) {
    const abs = path.resolve(ROOT, rel);
    const dir = path.dirname(abs);

    const raw = await readText(abs);
    const { data: rawFront, content: mdBody } = matter(raw);

    // Validate writer-facing frontmatter (friendly errors if it fails)
    let front: any;
    try {
      front = PackageMarkdownSchema.parse(rawFront);
    } catch (err: any) {
      console.error(`✖ Frontmatter invalid: ${abs}`);
      if (err?.issues && Array.isArray(err.issues)) {
        for (const [i, issue] of err.issues.entries()) {
          const where = issue.path?.length ? issue.path.join(" → ") : "(root)";
          console.error(`  [${i + 1}] ${where}: ${issue.message}`);
        }
      } else {
        console.error(err?.message || err);
      }
      continue;
    }

    // Derive runtime purposeHtml (prefer frontmatter.purposeHtml if given)
    const purposeHtml = front.purposeHtml ?? (await extractPurposeHtml(mdBody));

    // Determine registry folder
    const svcDir = serviceDirFromCode(front.service);                 // e.g., "lead-generation"
    const registryDir = path.resolve(REGISTRY_ROOT, `${svcDir}-packages`, front.slug);

    // Generate base.ts content
    const baseTs = renderBaseTs(front, purposeHtml);

    // Generate index.ts content (prefer JSON if exists)
    const hasJson = await exists(path.resolve(registryDir, "content.generated.json"));
    const indexTs = renderIndexTs(hasJson ? "json" : "base");

    // Write files (unless existing and no --force)
    const baseFile = path.resolve(registryDir, "base.ts");
    const indexFile = path.resolve(registryDir, "index.ts");

    if (cli.force || !(await exists(baseFile))) {
      const changed = await writeIfChanged(baseFile, baseTs, !!cli.dry);
      if (cli.verbose) {
        console.log(`${changed ? (cli.dry ? "[DRY] would write" : "wrote") : "kept"} ${path.relative(ROOT, baseFile)}`);
      }
      if (changed && !cli.dry) written++;
    } else if (cli.verbose) {
      console.log(`kept ${path.relative(ROOT, baseFile)} (exists; use --force to overwrite)`);
    }

    if (cli.force || !(await exists(indexFile))) {
      const changed = await writeIfChanged(indexFile, indexTs, !!cli.dry);
      if (cli.verbose) {
        console.log(`${changed ? (cli.dry ? "[DRY] would write" : "wrote") : "kept"} ${path.relative(ROOT, indexFile)}`);
      }
      if (changed && !cli.dry) written++;
    } else if (cli.verbose) {
      console.log(`kept ${path.relative(ROOT, indexFile)} (exists; use --force to overwrite)`);
    }
  }

  console.log(`✅ Mirror complete. ${written} file(s) ${cli.dry ? "would be " : ""}written.`);
}

main().catch((err) => {
  console.error("❌ mirror-docs-to-registry failed:");
  console.error(err?.stack || err?.message || err);
  process.exit(1);
});