// scripts/packages/mdx-to-registry.ts
/**
 * MDX → JSON → Zod validation → Registry artifact
 * =============================================================================
 * PURPOSE
 * -----------------------------------------------------------------------------
 * Converts author-friendly MDX (frontmatter + markdown body) into a **validated**
 * JSON artifact that your runtime loader imports:
 *
 *   docs/.../public.mdx           ──►  content.generated.json (validated)
 *                                     (imported by src/packages/registry/.../index.ts)
 *
 * WHY THIS EXISTS
 * -----------------------------------------------------------------------------
 * - Keeps **content** in human-readable MDX.
 * - Ensures **runtime safety** by validating the generated JSON against the
 *   canonical Zod schema (`src/packages/lib/package-schema.ts`).
 * - Decouples authoring from UI components via a **schema-driven pipeline**.
 *
 * WHAT THIS SCRIPT DOES
 * -----------------------------------------------------------------------------
 * 1) Reads one or more `public.mdx` files (glob or explicit `--in`).
 * 2) Extracts frontmatter, compiles the Markdown body (or “Purpose” section)
 *    to HTML (for `purposeHtml`), and maps to the **schema shape**.
 * 3) Validates with Zod (throws on mismatch).
 * 4) Writes `content.generated.json` next to each registry loader.
 *
 * USAGE
 * -----------------------------------------------------------------------------
 * # Build a single package (explicit in/out)
 *   pnpm tsx scripts/packages/mdx-to-registry.ts \
 *     --in docs/packages/catalog/lead-generation/lead-routing-distribution/public.mdx \
 *     --out src/packages/registry/lead-generation-packages/lead-routing-distribution/content.generated.json
 *
 * # Build all packages under docs/*-/* -/public.mdx (default glob)
 *   pnpm tsx scripts/packages/mdx-to-registry.ts --all
 *
 * # Optional flags
 *   --verbose       : extra logging
 *   --docsRoot      : root folder for MDX documents (default: docs/packages/catalog)
 *   --registryRoot  : root folder for registry outputs (default: src/packages/registry)
 *
 * REQUIREMENTS
 * -----------------------------------------------------------------------------
 * - Run with a TS runtime that honors tsconfig path aliases (e.g., `tsx`).
 * - `tsconfig.json` should define the "@/..." alias (already used in imports).
 * - Node 18+ recommended.
 */

import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import fg from "fast-glob";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Root, Content, Heading } from "mdast";

import { PackageSchema } from "@/packages/lib/package-schema";

/* ========================================================================== *
 * CLI & config
 * ========================================================================== */

type CliOptions = {
  in?: string;
  out?: string;
  all?: boolean;
  verbose?: boolean;
  docsRoot?: string;     // where author MDX lives
  registryRoot?: string; // where validated JSON should be written
};

function parseArgs(argv = process.argv.slice(2)): CliOptions {
  const opts: CliOptions = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const v = argv[i + 1];
    switch (a) {
      case "--in": opts.in = v; i += 1; break;
      case "--out": opts.out = v; i += 1; break;
      case "--all": opts.all = true; break;
      case "--verbose": opts.verbose = true; break;
      case "--docsRoot": opts.docsRoot = v; i += 1; break;
      case "--registryRoot": opts.registryRoot = v; i += 1; break;
      default: break;
    }
  }
  return opts;
}

/** Default folders. Adjust here if your repo layout changes. */
const DEFAULT_DOCS_ROOT = path.resolve(process.cwd(), "docs/packages/catalog");
const DEFAULT_REGISTRY_ROOT = path.resolve(process.cwd(), "src/packages/registry");

/* ========================================================================== *
 * Markdown helpers
 * ========================================================================== */

/**
 * Compile a markdown string (MDX without JSX) into an HTML string.
 * We use a conservative remark/rehype pipeline for predictable output.
 */
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
 * Extract a **single section** by heading text (case-insensitive) from an MDX
 * body and compile it to HTML. If the heading does not exist, falls back to
 * compiling the entire body.
 *
 * Example: extractSectionHtml(md, ["purpose", "why you need this"])
 */
async function extractSectionHtml(md: string, headings: string[]): Promise<string> {
  const tree = unified().use(remarkParse).parse(md) as Root;
  const wanted = new Set(headings.map((h) => h.trim().toLowerCase()));

  // Find the first heading that matches any of the requested titles.
  let startIndex = -1;
  let startDepth = 0;

  for (let i = 0; i < tree.children.length; i += 1) {
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

  // If not found, compile whole body.
  if (startIndex === -1) return mdToHtml(md);

  // Collect nodes until the next heading of depth <= startDepth.
  const slice: Content[] = [];
  for (let i = startIndex; i < tree.children.length; i += 1) {
    const node = tree.children[i] as Content;
    if (i > startIndex && node.type === "heading" && (node as Heading).depth <= startDepth) {
      break;
    }
    slice.push(node);
  }

  const sectionMd = await unified()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .stringify({ type: "root", children: slice } as any);

  return String(sectionMd);
}

/* ========================================================================== *
 * Mapping: frontmatter → PackageSchema shape
 * ========================================================================== */

/**
 * Normalize a loosely-authored "includesTable" (if the frontmatter uses a
 * simple table-like shape) into the strict `PackageSchema.includesTable`.
 *
 * Supported authoring shape:
 *   includesTable:
 *     caption: "What's included"
 *     columns: [{ id: "pkg", label: "Lead Routing & Distribution" }]
 *     rows:
 *       - { id: "...", label: "...", values: { pkg: true } }
 *     # OR legacy:
 *     columns: ["Lead Routing & Distribution"]
 *     rows:
 *       - ["Territory-based distribution", "✓"]
 */
function coerceIncludesTable(input: any): any | undefined {
  if (!input) return undefined;

  // If it already matches the strict shape, return as-is.
  if (Array.isArray(input.columns) && input.columns.length > 0 && input.rows?.[0]?.values) {
    return input;
  }

  // Legacy authoring: columns: string[], rows: Array<string[]>
  if (Array.isArray(input.columns) && typeof input.columns[0] === "string") {
    const cols = input.columns as string[];
    const columns = cols.map((label: string, i: number) => ({
      id: `c${i}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label,
    }));

    const rows = (input.rows as Array<string[] | { cells: string[] }>)
      .map((raw: any, i: number) => {
        const cells = Array.isArray(raw) ? raw : raw?.cells;
        if (!Array.isArray(cells) || cells.length === 0) return null;

        const label = String(cells[0] ?? "").trim();
        if (!label) return null;

        const values: Record<string, boolean | string> = {};
        for (let j = 1; j < cells.length && j <= columns.length; j += 1) {
          const v = cells[j];
          // truthy if non-empty/true/yes/✓/1
          const truthy =
            v === true ||
            (typeof v === "string" &&
              v.trim() !== "" &&
              !/^false$/i.test(v) &&
              !/^0$/.test(v));
          if (truthy) values[columns[j - 1].id] = true;
        }
        return {
          id: `row-${i}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "row"}`,
          label,
          values,
        };
      })
      .filter(Boolean);

    return {
      caption: input.caption ?? "What’s included",
      columns,
      rows,
    };
  }

  // Unknown shape → return as-is (schema will reject if invalid).
  return input;
}

/**
 * Optional image URL normalization:
 * - If author sets a relative path (e.g. "./assets/card.png"), we *may* map it
 *   to a stable public URL (e.g., `/packages/<service>/<slug>-card.png`).
 * - If author already set an absolute `/...` path, we keep it.
 */
function normalizeImage(
  img: any,
  service?: string,
  slug?: string
): { src: string; alt: string } | undefined {
  if (!img || !img.src) return img;
  const alt = img.alt ?? "";
  const src = String(img.src);
  if (src.startsWith("/")) return { src, alt };
  // Try to derive a canonical path if possible
  const ext = path.extname(src) || ".png";
  const svc = (service ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  const s = (slug ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (svc && s) {
    return { src: `/packages/${svc}/${s}-card${ext}`, alt };
  }
  return { src, alt };
}

/**
 * Map MDX frontmatter + compiled HTML body into the strict schema shape.
 * - Merges `extras.*` into the top-level canonical fields when present.
 * - Supports both `includes` and `includesGroups` authoring keys.
 * - Coerces legacy `includesTable` shapes when needed.
 */
function mapFrontmatterToSchema(front: any, purposeHtml?: string) {
  return {
    /* identity */
    id: front.id,
    slug: front.slug,
    service: front.service,
    category: front.category,
    name: front.name,
    tier: front.tier,
    tags: front.tags ?? [],
    badges: front.badges ?? [],

    /* hero */
    summary: front.summary,
    description: front.description,
    image: normalizeImage(front.image, front.service, front.slug),

    /* pricing */
    price: front.price, // { oneTime?, monthly?, currency: "USD" }
    priceBand: front.priceBand,

    /* phase 2 (why) */
    painPoints: front.painPoints,
    purposeHtml,
    icp: front.icp,
    outcomes: front.outcomes,

    /* phase 3 (what) */
    features: front.features,
    includes: front.includes ?? front.includesGroups ?? [],
    includesTable: coerceIncludesTable(front.includesTable),
    deliverables: front.deliverables,

    /* phase 4 (details & trust) */
    requirements: front.extras?.requirements ?? front.requirements,
    timeline: front.extras?.timeline ?? front.timeline,
    ethics: front.extras?.ethics ?? front.ethics,
    notes: front.notes,

    /* phase 5 (next) */
    faqs: front.faqs,
    relatedSlugs: front.crossSell ?? front.relatedSlugs ?? [],
    addOnRecommendations: front.addOns ?? front.addOnRecommendations ?? [],

    /* meta */
    seo: front.seo,
    copy: front.copy,
  };
}

/* ========================================================================== *
 * IO helpers
 * ========================================================================== */

async function readFileSafe(file: string): Promise<string> {
  try {
    return await fs.readFile(file, "utf8");
  } catch (err: any) {
    throw new Error(`Failed to read file: ${file}\n${err?.message ?? err}`);
  }
}

async function writeJsonPretty(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

function registryOutPathFor(mdxPath: string, docsRoot: string, registryRoot: string, front?: any): string {
  // Prefer frontmatter (service/slug). Otherwise derive from path segments.
  const service = front?.service
    ?? mdxPath.replace(docsRoot, "").split(path.sep).filter(Boolean)[0] // e.g., "lead-generation"
    ?? "misc";
  const slug = front?.slug
    ?? mdxPath.replace(docsRoot, "").split(path.sep).filter(Boolean)[1] // e.g., "lead-routing-distribution"
    ?? "unknown";

  // Registry convention: <service>-packages/<slug>/content.generated.json
  const serviceDir = `${service}-packages`;
  return path.join(registryRoot, serviceDir, slug, "content.generated.json");
}

/* ========================================================================== *
 * Build one MDX file
 * ========================================================================== */

async function buildOne(mdxPath: string, outPath?: string, verbose = false) {
  if (verbose) console.log(`→ Reading MDX: ${mdxPath}`);

  const raw = await readFileSafe(mdxPath);
  const parsed = matter(raw);

  // Strategy:
  // - If a "Purpose" section exists, compile just that section to HTML.
  // - Otherwise compile the entire body (short is recommended).
  const purposeHtml = await extractSectionHtml(parsed.content, [
    "purpose",
    "why you need this",
    "what good looks like",
  ]);

  const mapped = mapFrontmatterToSchema(parsed.data, purposeHtml);

  // Validate
  const validated = PackageSchema.parse(mapped);

  // Determine output path if not explicitly provided
  const out = outPath ?? registryOutPathFor(
    mdxPath,
    path.resolve(process.cwd(), "docs/packages/catalog"),
    DEFAULT_REGISTRY_ROOT,
    parsed.data
  );

  await writeJsonPretty(out, validated);
  console.log(`✔ Wrote ${out}`);
}

/* ========================================================================== *
 * Build many (glob)
 * ========================================================================== */

async function buildAll(opts: { docsRoot: string; registryRoot: string; verbose?: boolean }) {
  const { docsRoot, registryRoot, verbose } = opts;
  // Glob: <docsRoot>/*/*/public.mdx
  const pattern = path.posix.join(
    path.relative(process.cwd(), docsRoot).split(path.sep).join(path.posix.sep),
    "*",
    "*",
    "public.mdx"
  );

  const files = await fg(pattern, { dot: false });
  if (files.length === 0) {
    console.warn(`No MDX files found for pattern: ${pattern}`);
    return;
  }

  console.log(`Found ${files.length} MDX file(s).`);
  for (const rel of files) {
    const abs = path.resolve(process.cwd(), rel);
    const raw = await readFileSafe(abs);
    const parsed = matter(raw);

    const purposeHtml = await extractSectionHtml(parsed.content, [
      "purpose",
      "why you need this",
      "what good looks like",
    ]);
    const mapped = mapFrontmatterToSchema(parsed.data, purposeHtml);
    const validated = PackageSchema.parse(mapped);

    const out = registryOutPathFor(abs, docsRoot, registryRoot, parsed.data);
    await writeJsonPretty(out, validated);
    if (verbose) console.log(`✔ Wrote ${out}`);
  }
}

/* ========================================================================== *
 * Entrypoint
 * ========================================================================== */

async function main() {
  const args = parseArgs();
  const docsRoot = args.docsRoot ? path.resolve(process.cwd(), args.docsRoot) : DEFAULT_DOCS_ROOT;
  const registryRoot = args.registryRoot ? path.resolve(process.cwd(), args.registryRoot) : DEFAULT_REGISTRY_ROOT;

  // Mode 1: single file (explicit paths)
  if (args.in && args.out) {
    await buildOne(path.resolve(process.cwd(), args.in), path.resolve(process.cwd(), args.out), !!args.verbose);
    return;
  }

  // Mode 2: single file (implicit out path, derived from MDX + frontmatter)
  if (args.in && !args.out) {
    await buildOne(path.resolve(process.cwd(), args.in), undefined, !!args.verbose);
    return;
  }

  // Mode 3: build all discovered packages
  if (args.all || (!args.in && !args.out)) {
    await buildAll({ docsRoot, registryRoot, verbose: !!args.verbose });
    return;
  }
}

main().catch((err) => {
  console.error("❌ mdx-to-registry failed:");
  // Improve readability for Zod errors (common during authoring).
  if (err?.issues && Array.isArray(err.issues)) {
    for (const [i, issue] of err.issues.entries()) {
      const where = issue.path?.length ? issue.path.join(" → ") : "(root)";
      console.error(`  [${i + 1}] ${where}: ${issue.message}`);
    }
  } else {
    console.error(err);
  }
  process.exit(1);
});
