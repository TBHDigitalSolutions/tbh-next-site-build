/**
 * scripts/packages/lib/attach-content.ts
 *
 * Attach compiled page content (by slug) onto base bundle records and write:
 *   src/data/packages/__generated__/bundles.enriched.json
 *
 * Inputs:
 *  - Base bundles JSON:                  src/data/packages/bundles.json
 *  - Compiled MDX content map (by slug): src/data/packages/__generated__/content.map.json
 *
 * For each bundle with a matching `slug`, sets:
 *   bundle.content = { html, excerpt, wordCount, updatedAt }
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/packages/lib/attach-content.ts
 *
 * Optional flags:
 *   --bundles  src/data/packages/bundles.json
 *   --content  src/data/packages/__generated__/content.map.json
 *   --out      src/data/packages/__generated__/bundles.enriched.json
 */

import fs from "node:fs/promises";
import path from "node:path";

/* ----------------------------------------------------------------------------
 * CLI args
 * --------------------------------------------------------------------------*/

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i];
  const v = process.argv[i + 1];
  if (k?.startsWith("--") && typeof v === "string") args.set(k.slice(2), v);
}

const BUNDLES_RAW =
  args.get("bundles") ?? "src/data/packages/bundles.json";
const CONTENT_MAP =
  args.get("content") ?? "src/data/packages/__generated__/content.map.json";
const OUT_PATH =
  args.get("out") ?? "src/data/packages/__generated__/bundles.enriched.json";

/* ----------------------------------------------------------------------------
 * Minimal runtime types
 * --------------------------------------------------------------------------*/

type ContentPick = {
  slug: string;
  html: string;
  excerpt: string;
  wordCount: number;
  updatedAt: string; // expected "YYYY-MM-DD" (but accept any string here)
};

type BundleBase = {
  slug: string;
  [key: string]: unknown;
};

type EnrichedBundle = BundleBase & {
  content?: {
    html: string;
    excerpt: string;
    wordCount: number;
    updatedAt: string;
  };
};

/* ----------------------------------------------------------------------------
 * IO helpers
 * --------------------------------------------------------------------------*/

async function readJson<T = unknown>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${file}\n${(e as Error).message}`);
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** Narrow compiled-map entries to the fields we guarantee to attach. */
function pickContentShape(slug: string, doc: any): ContentPick | null {
  if (!doc || typeof doc !== "object") return null;
  const { html, excerpt, wordCount, updatedAt } = doc as Record<string, unknown>;
  if (
    typeof slug === "string" &&
    typeof html === "string" &&
    typeof excerpt === "string" &&
    typeof wordCount === "number" &&
    typeof updatedAt === "string"
  ) {
    return { slug, html, excerpt, wordCount, updatedAt };
  }
  return null;
}

/* ----------------------------------------------------------------------------
 * Core logic
 * --------------------------------------------------------------------------*/

export async function attachContent(): Promise<void> {
  // 1) Load inputs
  const [bundles, contentMap] = await Promise.all([
    readJson<unknown>(BUNDLES_RAW),
    readJson<Record<string, any>>(CONTENT_MAP),
  ]);

  if (!Array.isArray(bundles)) {
    throw new Error(`Expected an array in ${BUNDLES_RAW}`);
  }
  if (!contentMap || typeof contentMap !== "object") {
    throw new Error(`Expected an object (keyed by slug) in ${CONTENT_MAP}`);
  }

  // 2) Build lookup: slug → ContentPick
  const contentBySlug = new Map<string, ContentPick>();
  for (const [slug, doc] of Object.entries(contentMap)) {
    const picked = pickContentShape(slug, doc);
    if (picked) contentBySlug.set(slug, picked);
  }

  // 3) Enrich bundles
  let attached = 0;
  const missingSlugs: string[] = [];
  const invalidBundles: number[] = [];

  const enriched: EnrichedBundle[] = bundles.map((b, i) => {
    if (!b || typeof b !== "object" || typeof (b as any).slug !== "string") {
      invalidBundles.push(i);
      return b as EnrichedBundle;
    }

    const slug = (b as BundleBase).slug;
    const hit = contentBySlug.get(slug);
    if (!hit) {
      missingSlugs.push(slug);
      return b as EnrichedBundle;
    }

    attached++;
    const { html, excerpt, wordCount, updatedAt } = hit;
    return {
      ...(b as BundleBase),
      content: { html, excerpt, wordCount, updatedAt },
    };
  });

  // 4) Write output
  await writeJson(OUT_PATH, enriched);

  // 5) Console summary
  const lines = [
    "🔗 Attach content → bundles.enriched.json",
    `• Bundles input:    ${BUNDLES_RAW}`,
    `• Content map:      ${CONTENT_MAP}`,
    `• Output written:   ${OUT_PATH}`,
    `• Total bundles:    ${bundles.length}`,
    `• Attached content: ${attached}`,
  ];

  if (missingSlugs.length) {
    lines.push(`• No content match: ${missingSlugs.length}`);
    // Show a small sample to keep logs readable
    const sample = missingSlugs.slice(0, 10);
    lines.push(`  ↳ Missing slugs (sample): ${sample.join(", ")}${missingSlugs.length > sample.length ? " …" : ""}`);
  }
  if (invalidBundles.length) {
    lines.push(`• Invalid bundle entries (no slug): ${invalidBundles.length}`);
  }

  // eslint-disable-next-line no-console
  console.log(lines.join("\n"));

  // Optional: exit non-zero if nothing attached (commented to avoid breaking local dev)
  // if (attached === 0) process.exitCode = 2;
}

/* ----------------------------------------------------------------------------
 * CLI
 * --------------------------------------------------------------------------*/

if (require.main === module) {
  attachContent().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("❌ attach-content failed:\n", err);
    process.exit(1);
  });
}
