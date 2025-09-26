/**
 * scripts/packages/build-unified-search.ts
 *
 * Build a single search index across:
 *  - Bundles (service + cross-service), using enriched HTML when present
 *  - Service packages (flattened) + Under-1K slice
 *  - Service add-ons
 *  - Featured lists (resolved to bundles when possible)
 *
 * Output:
 *   src/data/packages/__generated__/search/unified.search.json
 *
 * Usage:
 *   npx tsx scripts/packages/build-unified-search.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import { decode } from "he";
import { pathToFileURL } from "node:url";

const GEN_DIR = "src/data/packages/__generated__";
const CATALOG_DIR = path.join(GEN_DIR, "catalog");

const PATHS = {
  ENRICHED_BUNDLES: path.join(GEN_DIR, "bundles.enriched.json"),
  SERVICE_BUNDLES: path.join(CATALOG_DIR, "bundles.service.json"),
  CROSS_BUNDLES: path.join(CATALOG_DIR, "bundles.cross-service.json"),
  ALL_BUNDLES: path.join(CATALOG_DIR, "bundles.all.json"),
  SERVICE_PACKAGES: path.join(CATALOG_DIR, "packages.services.json"),
  UNDER_1K: path.join(CATALOG_DIR, "packages.under-1k.json"),
  SERVICE_ADDONS: path.join(CATALOG_DIR, "addons.services.json"),
  FEATURED: path.join(CATALOG_DIR, "featured.json"),
  OUT: path.join(GEN_DIR, "search/unified.search.json"),
};

type AnyRec = Record<string, any>;

async function readJson<T = unknown>(p: string): Promise<T> {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as T;
}
async function writeJson(p: string, data: unknown) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function htmlToText(html?: string): string {
  if (!html) return "";
  let s = String(html);
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<\/(p|div|section|article|li|pre|blockquote|h[1-6])>/gi, "\n");
  s = s.replace(/<(br)\s*\/?>/gi, "\n");
  s = s.replace(/<\/?[^>]+>/g, " ");
  s = decode(s);
  s = s.replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

type SearchDoc = {
  id: string;              // e.g., "bundle:slug" | "package:id" | "addon:id" | "featured:slug"
  docType: "bundle" | "package" | "addon" | "featured";
  slug?: string;           // primary for routing (bundles)
  title: string;
  subtitle?: string;
  summary?: string;
  service?: string;
  tags?: string[];
  category?: string;
  price?: AnyRec;
  contentText: string;     // text blob for index
};

function uniq<T>(arr: T[]) { return Array.from(new Set(arr)); }

async function main() {
  // 1) Load TS facade to help resolve slugs → bundles (full objects)
  const facadeUrl = pathToFileURL(path.resolve("src/data/packages/index.ts")).href;
  const facade: AnyRec = await import(facadeUrl);
  const { BUNDLES_BY_SLUG = {}, PACKAGES_BY_ID = {}, ADDONS_BY_ID = {} } = facade;

  // 2) Load catalog JSON (generated in step #1)
  const [
    enrichedBundles,
    serviceBundles,
    crossBundles,
    allBundles,
    packagesByService,
    under1kPackages,
    addonsByService,
    featuredMap,
  ] = await Promise.all([
    readJson<any[]>(PATHS.ENRICHED_BUNDLES).catch(() => []),
    readJson<any[]>(PATHS.SERVICE_BUNDLES).catch(() => []),
    readJson<any[]>(PATHS.CROSS_BUNDLES).catch(() => []),
    readJson<any[]>(PATHS.ALL_BUNDLES).catch(() => []),
    readJson<Record<string, any[]>>(PATHS.SERVICE_PACKAGES).catch(() => ({})),
    readJson<any[]>(PATHS.UNDER_1K).catch(() => []),
    readJson<Record<string, any[]>>(PATHS.SERVICE_ADDONS).catch(() => ({})),
    readJson<Record<string, string[]>>(PATHS.FEATURED).catch(() => ({})),
  ]);

  // Index helpers
  const enrichedBySlug = new Map(
    Array.isArray(enrichedBundles) ? enrichedBundles.map((b) => [b.slug ?? b.id, b]) : []
  );

  const docs: SearchDoc[] = [];

  // 3) Bundles (use enriched HTML when available)
  for (const b of allBundles as any[]) {
    const slug = b.slug ?? b.id;
    const enriched = enrichedBySlug.get(slug);
    const html = enriched?.content?.html ?? "";
    const contentText = htmlToText(html);
    const title = b.title ?? b.name ?? slug;
    docs.push({
      id: `bundle:${slug}`,
      docType: "bundle",
      slug,
      title,
      subtitle: b.subtitle,
      summary: b.summary,
      service: b.service,
      tags: b.tags ?? [],
      category: b.category,
      price: b.price,
      contentText,
    });
  }

  // 4) Packages (flatten per service)
  for (const [service, pkgs] of Object.entries(packagesByService)) {
    for (const p of pkgs) {
      const text = [
        p.summary,
        ...(p.includes?.flatMap((s: any) => [s.title, ...(s.items ?? []).map((i: any) => `${i.label} ${i.note ?? ""}`)]) ?? []),
        ...(p.outcomes?.items?.map((i: any) => `${i.label} ${i.value ?? ""}`) ?? []),
        ...(p.faq?.faqs?.map((f: any) => `${f.question} ${f.answer}`) ?? []),
      ].filter(Boolean).join(" ");
      docs.push({
        id: `package:${p.id}`,
        docType: "package",
        title: p.name ?? p.id,
        summary: p.summary,
        service,
        tags: p.tags ?? [],
        price: p.price,
        contentText: text,
      });
    }
  }

  // 5) Under-$1K slice (tag as package docs; de-dup by id)
  const underIds = new Set<string>();
  for (const p of under1kPackages as any[]) {
    if (underIds.has(p.id)) continue;
    underIds.add(p.id);
    const text = [p.summary].filter(Boolean).join(" ");
    docs.push({
      id: `package:${p.id}`,
      docType: "package",
      title: p.name ?? p.id,
      summary: p.summary,
      service: p.service,
      tags: uniq([...(p.tags ?? []), "under-1k"]),
      price: p.price,
      contentText: text,
    });
  }

  // 6) Add-ons (flatten per service)
  for (const [service, addons] of Object.entries(addonsByService)) {
    for (const a of addons) {
      const text = [
        a.description,
        ...(a.bullets ?? []),
        a.priceNote,
      ].filter(Boolean).join(" ");
      docs.push({
        id: `addon:${a.id}`,
        docType: "addon",
        title: a.name ?? a.id,
        summary: a.description,
        service,
        tags: a.tags ?? [],
        price: a.price,
        contentText: text,
      });
    }
  }

  // 7) Featured (resolve slugs to bundles where possible)
  for (const [key, slugs] of Object.entries(featuredMap)) {
    for (const slug of slugs) {
      const bundle = BUNDLES_BY_SLUG[slug];
      const title = (bundle?.title ?? bundle?.name ?? slug) as string;
      const text = [bundle?.summary, ...(bundle?.tags ?? [])].filter(Boolean).join(" ");
      docs.push({
        id: `featured:${slug}`,
        docType: "featured",
        slug,
        title: `[Featured] ${title}`,
        summary: bundle?.summary,
        service: bundle?.service,
        tags: bundle?.tags ?? [],
        price: bundle?.price,
        contentText: text,
      });
    }
  }

  // 8) Deterministic sort: bundles → packages → add-ons → featured
  const order: Record<SearchDoc["docType"], number> = {
    bundle: 0, package: 1, addon: 2, featured: 3,
  };
  docs.sort((a, b) => {
    const oa = order[a.docType], ob = order[b.docType];
    if (oa !== ob) return oa - ob;
    return String(a.title).localeCompare(String(b.title));
  });

  await writeJson(PATHS.OUT, docs);
  console.log(
    [
      "🔎 Built unified search index",
      `• Bundles:     ${allBundles.length}`,
      `• Packages:    ${Object.values(packagesByService).reduce((n: number, arr: any[]) => n + arr.length, 0)}`,
      `• Under-1K:    ${under1kPackages.length}`,
      `• Add-ons:     ${Object.values(addonsByService).reduce((n: number, arr: any[]) => n + arr.length, 0)}`,
      `• Featured:    ${Object.values(featuredMap).reduce((n: number, arr: string[]) => n + arr.length, 0)}`,
      `• Docs total:  ${docs.length}`,
      `• Output:      ${PATHS.OUT}`,
    ].join("\n")
  );
}

main().catch((err) => {
  console.error("❌ build-unified-search failed\n", err);
  process.exit(1);
});
