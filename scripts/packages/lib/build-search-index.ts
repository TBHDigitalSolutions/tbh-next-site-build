/**
 * scripts/packages/lib/build-search-index.ts
 *
 * Build a consolidated search index for Packages content.
 *
 * Inputs:
 *   - src/data/packages/__generated__/bundles.enriched.json  (bundle objects with `.content`)
 *   - src/data/packages/__generated__/content.map.json       (slug → { html, excerpt, wordCount, updatedAt, headings })
 *
 * Output:
 *   - src/data/packages/__generated__/packages.search.json
 *
 * Behavior:
 *   • Indexes all bundles (uses enriched `.content.html` when available).
 *   • Also indexes non-bundle docs from the content map (services, overviews, etc.).
 *   • Produces plain-text `contentText` for search; keeps useful metadata.
 *
 * Usage:
 *   npx tsx scripts/packages/lib/build-search-index.ts
 *   # or:
 *   npx ts-node --transpile-only scripts/packages/lib/build-search-index.ts
 *
 * Optional flags:
 *   --bundles      path/to/bundles.enriched.json
 *   --content      path/to/content.map.json
 *   --out          path/to/packages.search.json
 *   --includeDocs  "1" | "0"   (default "1")
 */

import fs from "node:fs/promises";
import path from "node:path";
import { decode } from "he";

/* ----------------------------------------------------------------------------
 * CLI args
 * --------------------------------------------------------------------------*/

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i];
  const v = process.argv[i + 1];
  if (k?.startsWith("--") && typeof v === "string") args.set(k.slice(2), v);
}

const BUNDLES_PATH =
  args.get("bundles") ?? "src/data/packages/__generated__/bundles.enriched.json";
const CONTENT_MAP_PATH =
  args.get("content") ?? "src/data/packages/__generated__/content.map.json";
const OUT_PATH =
  args.get("out") ?? "src/data/packages/__generated__/packages.search.json";
const INCLUDE_DOCS = (args.get("includeDocs") ?? "1") !== "0";

/* ----------------------------------------------------------------------------
 * Minimal runtime types
 * --------------------------------------------------------------------------*/

type BundleContent = {
  html?: string;
  excerpt?: string;
  wordCount?: number;
  updatedAt?: string; // "YYYY-MM-DD"
};

type EnrichedBundle = {
  slug: string;
  id?: string;
  title?: string;     // optional in some datasets
  subtitle?: string;
  summary?: string;
  category?: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags?: string[];
  content?: BundleContent;
  // some datasets use "name" or "description" instead of title/summary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
};

type ContentMapEntry = {
  slug: string;
  title: string;
  summary?: string;
  html: string;
  excerpt: string;
  wordCount: number;
  updatedAt: string; // "YYYY-MM-DD"
  headings?: Array<{ depth: number; text: string; id?: string }>;
};

type SearchDoc = {
  id: string;                // e.g., "bundle:local-business-growth" or "doc:seo-services-featured"
  docType: "bundle" | "doc"; // used for filtering/boosting
  slug: string;
  title: string;
  summary?: string;
  subtitle?: string;         // bundles only
  category?: string;         // bundles only
  tags?: string[];           // bundles only
  excerpt?: string;
  updatedAt?: string;        // "YYYY-MM-DD"
  wordCount?: number;
  headings?: string[];       // flattened heading texts
  contentText: string;       // full plain text for indexing
};

/* ----------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------*/

/** Strip HTML to text: remove scripts/styles, preserve some boundaries, decode entities. */
function htmlToText(html?: string): string {
  if (!html) return "";
  let s = String(html);

  // Remove script/style blocks
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

  // Add line breaks around block-level elements to keep some structure
  s = s.replace(/<\/(p|div|section|article|li|pre|blockquote|h[1-6])>/gi, "\n");
  s = s.replace(/<(br)\s*\/?>/gi, "\n");

  // Strip remaining tags
  s = s.replace(/<\/?[^>]+>/g, " ");

  // Decode entities
  s = decode(s);

  // Normalize whitespace
  s = s.replace(/\u00A0/g, " "); // nbsp
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/** Return YYYY-MM-DD if valid-like, else undefined. */
function safeDate(d?: string): string | undefined {
  if (!d) return undefined;
  const t = new Date(d);
  if (Number.isFinite(t.getTime())) return t.toISOString().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  return m ? d : undefined;
}

async function readJson<T = unknown>(p: string): Promise<T> {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson(outPath: string, data: unknown) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function makeDocId(docType: "bundle" | "doc", slug: string): string {
  return `${docType}:${slug}`;
}

/* ----------------------------------------------------------------------------
 * Build index
 * --------------------------------------------------------------------------*/

function buildIndex(
  bundles: EnrichedBundle[],
  contentMap: Record<string, ContentMapEntry>,
  includeDocs: boolean
): SearchDoc[] {
  const bySlug = new Map<string, ContentMapEntry>(
    Object.entries(contentMap).map(([slug, entry]) => [slug, entry])
  );

  const docs: SearchDoc[] = [];
  const seen = new Set<string>();

  // 1) Index bundles
  for (const b of bundles) {
    const compiled = bySlug.get(b.slug);
    const content = b.content ?? {};

    // Prefer enriched HTML; fall back to compiled when missing
    const html = content.html ?? compiled?.html ?? "";
    const contentText = htmlToText(html);

    const headings =
      compiled?.headings?.map((h) => h.text.trim()).filter(Boolean) ?? [];

    // FALLBACKS requested:
    // - title: b.title ?? b.name ?? compiled.title ?? b.slug
    // - summary: b.summary ?? b.description ?? compiled.summary ?? compiled.excerpt
    const title =
      (b.title as string | undefined) ??
      (b.name as string | undefined) ??
      compiled?.title ??
      b.slug;

    const summary =
      (b.summary as string | undefined) ??
      (b.description as string | undefined) ??
      compiled?.summary ??
      compiled?.excerpt;

    const doc: SearchDoc = {
      id: makeDocId("bundle", b.slug),
      docType: "bundle",
      slug: b.slug,
      title,
      subtitle: b.subtitle,
      summary,
      category: b.category,
      tags: Array.isArray(b.tags) ? b.tags : [],
      excerpt: content.excerpt ?? compiled?.excerpt ?? undefined,
      updatedAt: safeDate(content.updatedAt ?? compiled?.updatedAt),
      wordCount: content.wordCount ?? compiled?.wordCount ?? undefined,
      headings,
      contentText,
    };

    if (!seen.has(doc.id)) {
      docs.push(doc);
      seen.add(doc.id);
    }
  }

  // 2) Index non-bundle docs (services, overviews, etc.)
  if (includeDocs) {
    const bundleSlugs = new Set(bundles.map((b) => b.slug));
    for (const entry of Object.values(contentMap)) {
      if (bundleSlugs.has(entry.slug)) continue; // already covered above

      const contentText = htmlToText(entry.html);
      const headings = entry.headings?.map((h) => h.text.trim()).filter(Boolean) ?? [];

      const doc: SearchDoc = {
        id: makeDocId("doc", entry.slug),
        docType: "doc",
        slug: entry.slug,
        title: entry.title,
        summary: entry.summary ?? entry.excerpt,
        excerpt: entry.excerpt,
        updatedAt: safeDate(entry.updatedAt),
        wordCount: entry.wordCount,
        headings,
        contentText,
      };

      if (!seen.has(doc.id)) {
        docs.push(doc);
        seen.add(doc.id);
      }
    }
  }

  // 3) Deterministic sort: bundles first (by category then title), then docs (by title)
  //    Make null-safe by coercing to String() before localeCompare.
  docs.sort((a, b) => {
    if (a.docType !== b.docType) return a.docType === "bundle" ? -1 : 1;
    if (a.docType === "bundle" && b.docType === "bundle") {
      const ca = String(a.category ?? "").localeCompare(String(b.category ?? ""));
      if (ca !== 0) return ca;
      return String(a.title ?? "").localeCompare(String(b.title ?? ""));
    }
    return String(a.title ?? "").localeCompare(String(b.title ?? ""));
  });

  return docs;
}

/* ----------------------------------------------------------------------------
 * Main
 * --------------------------------------------------------------------------*/

async function main() {
  const [bundles, contentMap] = await Promise.all([
    readJson<EnrichedBundle[]>(BUNDLES_PATH).catch((e) => {
      throw new Error(
        `Failed to read enriched bundles JSON at ${BUNDLES_PATH}\n${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }),
    readJson<Record<string, ContentMapEntry>>(CONTENT_MAP_PATH).catch((e) => {
      throw new Error(
        `Failed to read content map JSON at ${CONTENT_MAP_PATH}\n${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }),
  ]);

  if (!Array.isArray(bundles)) {
    throw new Error(`Enriched bundles JSON did not contain an array at ${BUNDLES_PATH}`);
  }
  if (typeof contentMap !== "object" || contentMap === null) {
    throw new Error(`Content map JSON did not contain an object at ${CONTENT_MAP_PATH}`);
  }

  const index = buildIndex(bundles, contentMap, INCLUDE_DOCS);
  await writeJson(OUT_PATH, index);

  // eslint-disable-next-line no-console
  console.log(
    [
      "🔎 Build Packages Search Index",
      `• Bundles loaded:   ${bundles.length}`,
      `• Content entries:  ${Object.keys(contentMap).length}`,
      `• Indexed docs:     ${index.length}`,
      `• Include docs:     ${INCLUDE_DOCS ? "yes" : "no"}`,
      `• Output:           ${OUT_PATH}`,
    ].join("\n")
  );

  if (index.length === 0) process.exitCode = 2;
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("❌ build-search-index failed:\n", err);
    process.exit(1);
  });
}
