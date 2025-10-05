// scripts/build-packages.ts
/**
 * Build a catalog of author packages from MDX (frontmatter + body) into a
 * lightweight JSON dataset used by search/UIs:
 *
 *   docs/.../public.mdx ──► src/data/packages/__generated__/
 *     • <slug>.external.json  (public subset per package)
 *     • index.json            (small catalog index)
 *
 * This **does not** produce the registry runtime JSON (that’s handled by
 * `scripts/packages/mdx-to-registry.ts`). Instead, this script builds a
 * separate, public-facing dataset (search, directory pages, etc.).
 *
 * KEY CHANGES
 * -----------------------------------------------------------------------------
 * - Updated imports to the new, canonical schemas:
 *     • PackageMarkdownSchema, InternalPricingSchema → "@/packages/lib/mdx-frontmatter-schema"
 * - Uses alias imports so `tsx` + tsconfig paths resolve cleanly.
 * - Markdown → HTML pipeline includes `rehype-raw` for inline HTML.
 * - Stronger error handling & logs.
 *
 * Run:
 *   npx tsx scripts/build-packages.ts
 */

import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

// ✅ New canonical schema location
import {
  PackageMarkdownSchema,
  InternalPricingSchema,
} from "@/packages/lib/schemas/mdx-frontmatter-schema";

const DOCS_ROOT = path.resolve("docs/packages/catalog");
const OUT_ROOT  = path.resolve("src/data/packages/__generated__");
const OUT_PACKS = path.join(OUT_ROOT, "packages");

function serviceFromPath(abs: string) {
  // Expect: .../docs/packages/catalog/<service>/<slug>/public.mdx
  // Some repos use <service>/<subservice>/<slug>. We handle both.
  const rel = path.relative(DOCS_ROOT, abs);
  const parts = rel.split(path.sep).filter(Boolean);
  // At minimum: [<service>, <slug>, "public.mdx"]
  const service = parts[0] ?? "misc";
  const subservice = parts.length === 4 ? parts[1] : undefined;
  const slug = parts.length === 4 ? parts[2] : parts[1] ?? "unknown";
  return { service, subservice, slug };
}

async function compileHtml(md: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(file);
}

async function readInternalJSON(dir: string) {
  // Optional per-package internal pricing knobs (not shipped publicly)
  try {
    const raw = await fs.readFile(path.join(dir, "internal.json"), "utf8");
    return InternalPricingSchema.parse(JSON.parse(raw || "{}"));
  } catch {
    return InternalPricingSchema.parse({});
  }
}

async function main() {
  // 1) Find all public.mdx files
  const pattern = `${DOCS_ROOT.replace(/\\/g, "/")}/**/public.mdx`;
  const files = await fg(pattern, { dot: false });

  if (!files.length) {
    console.warn("No public.mdx files found.");
    return;
  }

  // 2) Ensure output dirs
  await fs.mkdir(OUT_PACKS, { recursive: true });

  const index: Array<{
    slug: string;
    title: string;
    service: string;
    subservice?: string;
    tags: string[];
    hasPrice: boolean;
    monthly?: number;
    oneTime?: number;
  }> = [];

  for (const abs of files) {
    const dir = path.dirname(abs);
    const { service, subservice, slug } = serviceFromPath(abs);

    // 3) Parse frontmatter + body
    const src = await fs.readFile(abs, "utf8");
    const fm = matter(src);
    const fmData = {
      // Auto-fill from path if missing
      service: fm.data.service ?? service,
      subservice: fm.data.subservice ?? subservice,
      slug: fm.data.slug ?? slug,
      id: fm.data.id ?? `${service}-${slug}`,
      ...fm.data,
    };

    try {
      // 4) Validate frontmatter (author surface)
      const data = PackageMarkdownSchema.parse(fmData);

      // 5) Compile body → HTML narrative (whole body by default)
      const narrativeHtml = await compileHtml(fm.content);

      // 6) Pull optional internal tiers (not shipped publicly)
      const internal = await readInternalJSON(dir);
      void internal; // reserved for future ops tooling

      // 7) External/public JSON shape
      const external = {
        id: data.id,
        slug: data.slug,
        service: data.service,
        subservice: data.subservice,
        subsubservice: data.subsubservice,
        seo: data.seo,
        title: data.title ?? data.id.replace(/-/g, " "), // prefer explicit title if authored
        summary: data.summary,
        description: data.description,
        icp: data.icp,
        painPoints: data.painPoints,
        purposeHtml: data.purposeHtml,
        outcomes: data.outcomes,
        features: data.features,
        includesGroups: data.includesGroups,
        includesTable: data.includesTable,
        deliverables: data.deliverables,
        notes: data.notes,
        price: data.price,
        priceBand: data.priceBand,
        extras: data.extras,
        faqs: data.faqs,
        crossSell: data.crossSell,
        addOns: data.addOns,
        tags: data.tags,
        badges: data.badges,
        // compiled narrative (whole mdx body)
        narrativeHtml,
        // bookkeeping
        authoredAt: data.authoredAt,
        templateVersion: data.templateVersion,
      };

      // 8) Write per-package public JSON
      const outFile = path.join(OUT_PACKS, `${data.slug}.external.json`);
      await fs.writeFile(outFile, JSON.stringify(external, null, 2), "utf8");

      // 9) Index row (small catalog)
      index.push({
        slug: data.slug,
        title: external.title,
        service: data.service,
        subservice: data.subservice,
        tags: data.tags,
        hasPrice: !!(data.price?.monthly || data.price?.oneTime),
        monthly: data.price?.monthly,
        oneTime: data.price?.oneTime,
      });
    } catch (err: any) {
      // Report which file failed and continue others (non-fatal per-file).
      console.error(`✖ Failed to build ${abs}`);
      if (err?.issues && Array.isArray(err.issues)) {
        for (const [i, issue] of err.issues.entries()) {
          const where = issue.path?.length ? issue.path.join(" → ") : "(root)";
          console.error(`  [${i + 1}] ${where}: ${issue.message}`);
        }
      } else {
        console.error(err?.message ?? err);
      }
    }
  }

  // 10) Write small catalog index
  await fs.writeFile(
    path.join(OUT_ROOT, "index.json"),
    JSON.stringify({ updatedAt: new Date().toISOString(), items: index }, null, 2),
    "utf8"
  );

  console.log(`✅ Built ${files.length} package(s). Index at ${path.join(OUT_ROOT, "index.json")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/* =============================================================================
 * RUNBOOK
 * -----------------------------------------------------------------------------
 * 1) Build:
 *    npx tsx scripts/build-packages.ts
 *
 * 2) Output:
 *    - src/data/packages/__generated__/packages/<slug>.external.json
 *    - src/data/packages/__generated__/index.json
 *
 * 3) Notes:
 *    - This script validates **frontmatter** only (author surface).
 *    - For **runtime/registry** JSON used by UI loaders, run:
 *        npx tsx scripts/packages/mdx-to-registry.ts --all
 *    - Ensure "@/packages/lib/mdx-frontmatter-schema" exports BOTH
 *      `PackageMarkdownSchema` and `InternalPricingSchema`.
 * =============================================================================
 */