/**
 * scripts/packages/lib/compile-mdx.ts
 *
 * Scan MD and MDX files for the packages domain and emit a content map keyed by `slug`.
 * Extracts: html, excerpt (~first paragraph or ~160 chars), wordCount, updatedAt,
 * and headings (with ids when present).
 *
 * Output file:
 *   src/data/packages/__generated__/content.map.json
 *
 * Source locations (recursive):
 *   - src/content/packages/bundles
 *   - src/content/packages/overviews
 *   - src/content/packages/services
 *   (exact glob patterns are defined in the CONTENT_GLOBS constant below)
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/packages/lib/compile-mdx.ts
 *
 * Optional flags:
 *   --out  src/data/packages/__generated__/content.map.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

type Frontmatter = {
  slug?: string;
  title?: string;
  summary?: string;
  lastUpdated?: string; // "YYYY-MM-DD" preferred (ISO also accepted)
};

type Heading = { depth: number; text: string; id?: string };

type ContentEntry = {
  slug: string;
  title?: string;
  summary?: string;
  html: string;
  excerpt: string;
  wordCount: number;
  updatedAt: string; // "YYYY-MM-DD"
  headings: Heading[];
};

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i];
  const v = process.argv[i + 1];
  if (k?.startsWith("--") && typeof v === "string") args.set(k.slice(2), v);
}

const OUT_PATH =
  args.get("out") ?? "src/data/packages/__generated__/content.map.json";

const CONTENT_GLOBS = [
  "src/content/packages/bundles/**/*.{md,mdx}",
  "src/content/packages/overviews/**/*.{md,mdx}",
  "src/content/packages/services/**/*.{md,mdx}",
] as const;

/* ----------------------------------------------------------------------------
 * AST helpers
 * --------------------------------------------------------------------------*/

type Node = any;

function textFromNode(node: Node): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.type === "text") return String(node.value ?? "");
  const kids = Array.isArray(node.children) ? node.children : [];
  return kids.map(textFromNode).join("");
}

function firstHeadingText(mdast: Node): string | undefined {
  if (!mdast || !Array.isArray(mdast.children)) return undefined;
  for (const child of mdast.children) {
    if (child.type === "heading" && typeof child.depth === "number" && child.depth === 1) {
      const s = textFromNode(child).trim().replace(/\s+/g, " ");
      if (s) return s;
    }
  }
  return undefined;
}

function firstParagraphText(mdast: Node): string {
  if (!mdast || !Array.isArray(mdast.children)) return "";
  for (const child of mdast.children) {
    if (child.type === "paragraph") {
      const s = textFromNode(child).trim().replace(/\s+/g, " ");
      if (s) return s;
    }
  }
  return "";
}

/** Count words from mdast while skipping code/inlineCode and MDX nodes. */
function countWordsFromMdast(mdast: Node): number {
  function collect(n: Node, acc: string[]) {
    if (!n || typeof n !== "object") return;
    const t = n.type;
    if (
      t === "code" ||
      t === "inlineCode" ||
      t === "mdxJsxFlowElement" ||
      t === "mdxJsxTextElement" ||
      t === "mdxFlowExpression" ||
      t === "mdxTextExpression" ||
      t === "mdxjsEsm"
    ) return;

    if (t === "text") {
      acc.push(String(n.value ?? ""));
      return;
    }
    const kids = Array.isArray(n.children) ? n.children : [];
    for (const k of kids) collect(k, acc);
  }
  const parts: string[] = [];
  collect(mdast, parts);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function trimExcerpt(s: string, limit = 160): string {
  if (!s) return "";
  if (s.length <= limit) return s;
  const cut = s.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > 80 ? cut.slice(0, lastSpace) : cut;
  return `${head}…`;
}

/**
 * Remove MDX JSX/ESM nodes that can't be rendered as static HTML.
 * Keeps surrounding markdown content intact.
 */
function remarkStripMdx() {
  return (tree: Node) => {
    function strip(node: Node): Node | null {
      if (!node || typeof node !== "object") return node;
      const t = node.type;
      if (
        t === "mdxJsxFlowElement" ||
        t === "mdxJsxTextElement" ||
        t === "mdxFlowExpression" ||
        t === "mdxTextExpression" ||
        t === "mdxjsEsm"
      ) {
        return null;
      }
      const kids = Array.isArray(node.children) ? node.children : [];
      const kept = [];
      for (const k of kids) {
        const res = strip(k);
        if (res) kept.push(res);
      }
      node.children = kept;
      return node;
    }
    return strip(tree);
  };
}

/* ----------------------------------------------------------------------------
 * Date helpers
 * --------------------------------------------------------------------------*/

async function fileMtimeYYYYMMDD(file: string): Promise<string> {
  const stat = await fs.stat(file);
  return new Date(stat.mtime).toISOString().slice(0, 10);
}

function normalizeDateYYYYMMDD(input?: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isFinite(d.getTime())) return d.toISOString().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  return m ? input.trim() : null;
}

/* ----------------------------------------------------------------------------
 * Core compile
 * --------------------------------------------------------------------------*/

async function compileOne(file: string): Promise<ContentEntry> {
  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  const fm = (data ?? {}) as Frontmatter;

  // Build mdast once
  const mdast = unified().use(remarkParse).use(remarkGfm).use(remarkMdx).parse(content);

  // Derive fields when frontmatter is missing
  const derivedTitle = firstHeadingText(mdast);
  const derivedSummary = firstParagraphText(mdast);

  const slug =
    (fm.slug ?? path.basename(file, path.extname(file))).toString().trim();
  if (!slug) throw new Error(`Missing resolvable slug for ${file}`);

  const title = (fm.title ?? derivedTitle ?? slug).toString().trim();
  const summary = (fm.summary ?? derivedSummary ?? "").toString().trim();

  const updatedAt =
    normalizeDateYYYYMMDD(fm.lastUpdated) ?? (await fileMtimeYYYYMMDD(file));

  const wordCount = countWordsFromMdast(mdast);
  const excerpt = trimExcerpt(derivedSummary || summary || title, 160);

  // Rehype pipeline with MDX stripping + slug to get ids
  const rehypeTree: any = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkStripMdx)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .run(
      unified().use(remarkParse).use(remarkGfm).use(remarkMdx).parse(content)
    );

  // Extract headings (h1–h6) with ids after rehypeSlug
  const headings: Heading[] = [];
  (function walk(node: any) {
    if (!node || typeof node !== "object") return;
    const tag = node.tagName;
    if (tag && /^h[1-6]$/.test(tag)) {
      const depth = Number(tag.slice(1));
      const id =
        node.properties && typeof node.properties.id === "string"
          ? node.properties.id
          : undefined;
      const text = textFromNode(node).trim().replace(/\s+/g, " ");
      if (text) headings.push({ depth, text, id });
    }
    const kids = Array.isArray(node.children) ? node.children : [];
    for (const k of kids) walk(k);
  })(rehypeTree);

  // HTML output
  const html = String(
    unified()
      .use(rehypeStringify, { allowDangerousHtml: true })
      // @ts-ignore unified types accept hast as input to stringify
      .stringify(rehypeTree)
  );

  return {
    slug,
    title,
    summary,
    html,
    excerpt,
    wordCount,
    updatedAt,
    headings,
  };
}

/* ----------------------------------------------------------------------------
 * Runner
 * --------------------------------------------------------------------------*/

async function main() {
  const files = await fg(CONTENT_GLOBS, {
    onlyFiles: true,
    unique: true,
    dot: false,
    followSymbolicLinks: true,
  });

  if (files.length === 0) {
    console.warn("⚠️  No MDX/MD files found in packages content globs.");
  }

  const map: Record<string, ContentEntry> = Object.create(null);
  let compiled = 0;
  let skipped = 0;
  const dupes = new Set<string>();

  for (const file of files) {
    try {
      const entry = await compileOne(file);
      if (map[entry.slug]) dupes.add(entry.slug);
      map[entry.slug] = entry;
      compiled++;
    } catch (err) {
      skipped++;
      console.error(`❌ Failed to compile ${file}\n`, err);
    }
  }

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(map, null, 2) + "\n", "utf8");

  const lines = [
    "🧩 Compile MDX → content.map.json",
    `• Files scanned:    ${files.length}`,
    `• Compiled:         ${compiled}`,
    `• Skipped:          ${skipped}`,
    `• Output:           ${OUT_PATH}`,
  ];
  if (dupes.size) lines.push(`• Duplicated slugs: ${Array.from(dupes).join(", ")}`);
  console.log(lines.join("\n"));

  if (compiled === 0) process.exitCode = 2;
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ compile-mdx failed:\n", err);
    process.exit(1);
  });
}

export {};
