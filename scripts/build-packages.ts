// scripts/build-packages.ts
// Run: npx -y tsx scripts/build-packages.ts
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
import { PackageMarkdownSchema, InternalPricingSchema } from "../src/packages/lib/registry/schemas.js";

const DOCS_ROOT = path.resolve("docs/packages/catalog");
const OUT_ROOT  = path.resolve("src/data/packages/__generated__");
const OUT_PACKS = path.join(OUT_ROOT, "packages");

function serviceFromPath(abs: string) {
  // .../docs/packages/catalog/<service>/<subservice>/<slug>/public.mdx
  const parts = abs.split(path.sep);
  const i = parts.lastIndexOf("catalog");
  return { service: parts[i+1], subservice: parts[i+2], slug: parts[i+3] };
}

async function compileHtml(md: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(md);
  return String(file);
}

async function readInternalJSON(dir: string) {
  try {
    const raw = await fs.readFile(path.join(dir, "internal.json"), "utf8");
    return InternalPricingSchema.parse(JSON.parse(raw || "{}"));
  } catch {
    return InternalPricingSchema.parse({});
  }
}

async function main() {
  // 1) Find all public.mdx files
  const files = await fg(`${DOCS_ROOT.replace(/\\/g, "/")}/**/public.mdx`, { dot: false });
  if (!files.length) throw new Error("No public.mdx files found.");

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

    // 3) Parse frontmatter + body sections
    const src = await fs.readFile(abs, "utf8");
    const fm = matter(src);
    const fmData = {
      // auto-fill from path if missing
      service: fm.data.service ?? service,
      subservice: fm.data.subservice ?? subservice,
      slug: fm.data.slug ?? slug,
      id: fm.data.id ?? `${service}-${slug}`,
      ...fm.data
    };

    // 4) Validate frontmatter
    const data = PackageMarkdownSchema.parse(fmData);

    // 5) Compile body → HTML narrative blocks (by headings if you want; simplest: whole body)
    // If you want smarter section extraction, split by ### Phase N headings, then compile each.
    const narrativeHtml = await compileHtml(fm.content);

    // 6) Pull internal tiers (for later toggle; not shipped by default)
    const internal = await readInternalJSON(dir);

    // 7) External JSON shape (public)
    const external = {
      id: data.id,
      slug: data.slug,
      service: data.service,
      subservice: data.subservice,
      subsubservice: data.subsubservice,
      seo: data.seo,
      title: data.id.replace(/-/g, " "),  // or store name in frontmatter if you prefer
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
      // compiled narrative (whole mdx body or per-section if you extract)
      narrativeHtml,
      // bookkeeping
      authoredAt: data.authoredAt,
      templateVersion: data.templateVersion
    };

    // 8) Write per-package JSON
    const outFile = path.join(OUT_PACKS, `${data.slug}.external.json`);
    await fs.writeFile(outFile, JSON.stringify(external, null, 2), "utf8");

    // 9) Index row
    index.push({
      slug: data.slug,
      title: external.title,
      service: data.service,
      subservice: data.subservice,
      tags: data.tags,
      hasPrice: !!(data.price?.monthly || data.price?.oneTime),
      monthly: data.price?.monthly,
      oneTime: data.price?.oneTime
    });
  }

  // 10) Write small catalog index
  await fs.writeFile(
    path.join(OUT_ROOT, "index.json"),
    JSON.stringify({ updatedAt: new Date().toISOString(), items: index }, null, 2),
    "utf8"
  );

  console.log(`✅ Built ${files.length} packages. Index at ${path.join(OUT_ROOT, "index.json")}`);
}

main().catch((e) => { console.error(e); process.exit(1); });