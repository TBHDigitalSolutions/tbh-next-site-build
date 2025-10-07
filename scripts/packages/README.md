Awesome — here’s a **complete, production-ready `scripts/packages` toolchain** (core + optional) you can paste straight into your repo. It generates **all** artifacts under `src/data/packages/__generated__/**` and maintains the `src/packages/registry/**` stubs.

> Runner: **npm + tsx** (ESM).
> Requires: `gray-matter fast-glob fs-extra marked zod` and dev deps `tsx typescript @types/node`.

---

# Directory

```
scripts/
  packages/
    README.md
    packages.config.ts
    build-package-data.ts
    build-routes.ts
    build-cards.ts
    build-unified-search.ts
    validate-package-data.ts
    doctor-content.ts              # optional authoring lint
    changed-slugs.ts               # optional: speed partial builds
    registry/
      sync-registry.ts
      prune-registry.ts
      check-registry.ts
      scaffold-registry.ts         # optional: create new registry entries
```

---

# 1) `scripts/packages/README.md`

````md
# Packages build toolchain (npm + tsx)

**SSOT**: Authors only edit `content/packages/catalog/**/public.mdx`.  
**Outputs**: `src/data/packages/__generated__/**` (machine-written).  
**Schema**: `src/packages/lib/package-schema.ts` (Zod).

## What these scripts produce

- `__generated__/packages/<slug>.json` – per-package JSON (snake_case)
- `__generated__/index.json` – lightweight catalog for hub/search
- `__generated__/routes.json` – slug → `@/packages/registry/<service>/<slug>/base`
- `__generated__/cards.json` – precomputed card props (hub grid)
- `__generated__/search/unified.search.json` – tiny inverted index
- `__generated__/health.json` – authoring warnings/errors
- `__generated__/hashes.json` – incremental build cache

## Commands (add to package.json)

```json
{
  "scripts": {
    "data:build": "tsx scripts/packages/build-package-data.ts",
    "routes:build": "tsx scripts/packages/build-routes.ts",
    "cards:build": "tsx scripts/packages/build-cards.ts",
    "search:build": "tsx scripts/packages/build-unified-search.ts",
    "data:validate": "tsx scripts/packages/validate-package-data.ts",
    "registry:sync": "tsx scripts/packages/registry/sync-registry.ts",
    "registry:prune": "tsx scripts/packages/registry/prune-registry.ts",
    "registry:check": "tsx scripts/packages/registry/check-registry.ts",
    "doctor": "tsx scripts/packages/doctor-content.ts",
    "data:all": "npm run data:build && npm run routes:build && npm run cards:build && npm run search:build && npm run data:validate && npm run registry:sync && npm run registry:prune && npm run registry:check"
  }
}
````

## Flags

* `--strict` – treat warnings as errors (builder/doctor)
* `--slug <slug>` – operate on one package (where supported)
* `--changed` – builder uses `hashes.json` to skip unchanged

````

---

# 2) `scripts/packages/packages.config.ts`

```ts
export const PKG_CFG = {
  // Content
  contentGlob: "content/packages/catalog/**/public.mdx",

  // Outputs
  outRoot:      "src/data/packages/__generated__",
  outPackages:  "src/data/packages/__generated__/packages",
  outIndex:     "src/data/packages/__generated__/index.json",
  outRoutes:    "src/data/packages/__generated__/routes.json",
  outCards:     "src/data/packages/__generated__/cards.json",
  outHealth:    "src/data/packages/__generated__/health.json",
  outHashes:    "src/data/packages/__generated__/hashes.json",
  outSearchDir: "src/data/packages/__generated__/search",

  // Registry base path template (ESM import path used by app)
  toRegistryImport(service: string, slug: string) {
    return `@/packages/registry/${service}/${slug}/base`;
  },

  // Behavior toggles
  includeHashes: true,
  includeHealth: true,
} as const;
````

---

# 3) `scripts/packages/build-package-data.ts`

```ts
/**
 * MDX → JSON builder (incremental, strict authoring guardrails)
 */
import path from "node:path";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import fse from "fs-extra";
import glob from "fast-glob";
import matter from "gray-matter";
import { marked } from "marked";
import { PKG_CFG } from "./packages.config.js";

const STRICT = process.argv.includes("--strict");
const ONLY_CHANGED = process.argv.includes("--changed");
const slugArgIndex = process.argv.indexOf("--slug");
const ONLY_SLUG = slugArgIndex > -1 ? process.argv[slugArgIndex + 1] : undefined;

const readJson = async <T>(f: string, fb: T) => { try { return JSON.parse(await fs.readFile(f,"utf8")) as T; } catch { return fb; } };
const writeJson = async (f: string, d: any) => { await fse.ensureDir(path.dirname(f)); await fs.writeFile(f, JSON.stringify(d, null, 2), "utf8"); };
const mdToHtml = (md?: string) => md?.trim() ? (marked.parse(md) as string) : undefined;
const md5 = (buf: string | Buffer) => createHash("md5").update(buf).digest("hex");

function section(md: string, heading: string) {
  const lines = md.split("\n");
  const target = `## ${heading}`.toLowerCase();
  const start = lines.findIndex(l => l.trim().toLowerCase() === target);
  if (start < 0) return undefined;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (lines[i].trim().startsWith("## ")) { end = i; break; }
  const slice = lines.slice(start + 1, end).join("\n").trim();
  return slice || undefined;
}

function fmToBranches(fm: any) {
  return {
    meta: {
      id: fm.id,
      slug: fm.slug ?? fm.id,
      service: fm.service,
      subservice: fm.subservice,
      category: fm.category,
      name: fm.name,
      tier: fm.tier,
      badges: fm.badges ?? [],
      tags: fm.tags ?? [],
    },
    hero: {
      summary: fm.summary,
      description: fm.description,
      image: fm.image, // { src, alt }
      ctas: fm.ctas,   // { details, book_a_call, request_proposal }
      seo: fm.seo,     // { title, description }
    },
    why_you_need_this: {
      icp: fm.icp,
      pain_points: fm.painPoints ?? [],
      outcomes: fm.outcomes ?? [],
    },
    what_you_get: {
      features: fm.features ?? [],
      includes: fm.includesGroups,
      includes_table: fm.includesTable,
      deliverables: fm.deliverables ?? [],
    },
    details_and_trust: {
      pricing: fm.price && {
        one_time: fm.price.oneTime ?? null,
        monthly:  fm.price.monthly ?? null,
        currency: fm.price.currency ?? "USD",
      },
      price_band: fm.priceBand && {
        tagline: fm.priceBand.tagline,
        base_note: fm.priceBand.baseNote, // "proposal" | "final"
        fine_print: fm.priceBand.finePrint,
      },
      timeline: fm.timeline,
      requirements: fm.requirements ?? [],
      ethics: fm.ethics ?? [],
      limits: fm.limits ?? fm.caveats ?? [],
      caveats: fm.caveats,
      notes: fm.notes,
    },
    next_step: {
      faqs: fm.faqs,
      cross_sell: { related: fm.crossSell, add_ons: fm.addOns },
      related_slugs: fm.relatedSlugs,
      add_on_recommendations: fm.addOnRecommendations,
    },
    copy: fm.copy && {
      phase1: fm.copy.phase1,
      phase2: fm.copy.phase2,
      phase3: fm.copy.phase3 && {
        title: fm.copy.phase3.title,
        tagline: fm.copy.phase3.tagline,
        includes_title: fm.copy.phase3.includesTitle,
        includes_subtitle: fm.copy.phase3.includesSubtitle,
        highlights_title: fm.copy.phase3.highlightsTitle,
        highlights_tagline: fm.copy.phase3.highlightsTagline,
      },
      phase4: fm.copy.phase4,
      phase5: fm.copy.phase5,
    },
    extras: fm.extras,
  };
}

type Issue = { level: "warn" | "error"; message: string };

function authoringIssues(file: string, pkg: any, narrative: any): Issue[] {
  const out: Issue[] = [];
  if (!pkg.meta?.slug) out.push({ level: "error", message: `Missing frontmatter "slug" in ${file}` });
  if (!pkg.hero?.summary) out.push({ level: "error", message: `Missing "summary" in ${file}` });

  const hasGroups = Array.isArray(pkg.what_you_get?.includes) && pkg.what_you_get.includes.length > 0;
  const hasTable  = !!pkg.what_you_get?.includes_table;
  if (!hasGroups && !hasTable) out.push({ level: "error", message: `Add "includesGroups" or "includesTable" in ${file}` });
  if (hasGroups && hasTable)   out.push({ level: "warn",  message: `Both includesGroups & includesTable in ${file} (prefer groups)` });

  const p = pkg.details_and_trust?.pricing;
  const one = Number(p?.one_time ?? 0), mon = Number(p?.monthly ?? 0);
  if (!p || (one <= 0 && mon <= 0)) out.push({ level: "error", message: `Invalid pricing in ${file} (one_time or monthly must be > 0)` });

  if (!narrative?.purpose_html) out.push({ level: "error", message: `Missing "## Purpose" section in ${file}` });

  const oc = pkg.why_you_need_this?.outcomes ?? [];
  if (oc.length && oc.length < 3) out.push({ level: "warn", message: `Only ${oc.length} outcomes (recommended ≥3) in ${file}` });

  return out;
}

async function main() {
  const files = await glob(PKG_CFG.contentGlob);
  await fse.ensureDir(PKG_CFG.outPackages);

  const prevHashes = PKG_CFG.includeHashes ? await readJson<Record<string,string>>(PKG_CFG.outHashes, {}) : {};
  const nextHashes: Record<string,string> = {};
  const health = { summary: { errors: 0, warnings: 0 }, items: [] as Array<{slug:string;file:string;errors:string[];warnings:string[]}> };
  const catalog: Array<any> = [];
  let hadErrors = false;

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const [service, slugFromPath] = (() => {
      const parts = file.split("/"); return [parts.at(-3)!, parts.at(-2)!];
    })();

    if (ONLY_SLUG && slugFromPath !== ONLY_SLUG) continue;

    const mdxHash = md5(raw);
    nextHashes[slugFromPath] = mdxHash;

    if (ONLY_CHANGED && prevHashes[slugFromPath] === mdxHash) {
      // still read fm for index freshness
      const { data: fm, content } = matter(raw);
      const mapped = fmToBranches(fm);
      const narrative = {
        overview_html: mdToHtml(section(content,"Overview")),
        purpose_html:  mdToHtml(section(content,"Purpose")),
        notes_html:    mdToHtml(section(content,"Notes")),
        faq_html:      mdToHtml(section(content,"FAQ")),
      };
      const pkg = { ...mapped, narrative };
      const price = pkg.details_and_trust?.pricing ?? {};
      const has_price = !!((price.one_time ?? 0) > 0 || (price.monthly ?? 0) > 0);
      catalog.push({
        id: mapped.meta.id, slug: mapped.meta.slug ?? slugFromPath, service: mapped.meta.service ?? service,
        name: mapped.meta.name, tier: mapped.meta.tier, summary: mapped.hero?.summary,
        tags: mapped.meta.tags ?? [], badges: mapped.meta.badges ?? [], has_price,
      });
      console.log(`↷ unchanged ${slugFromPath}, skipped emit`);
      continue;
    }

    const { data: fm, content } = matter(raw);
    const mapped = fmToBranches(fm);
    const narrative = {
      overview_html: mdToHtml(section(content,"Overview")),
      purpose_html:  mdToHtml(section(content,"Purpose")),
      notes_html:    mdToHtml(section(content,"Notes")),
      faq_html:      mdToHtml(section(content,"FAQ")),
    };

    const pkg = { ...mapped, narrative };

    const issues = authoringIssues(file, pkg, narrative);
    const errors = issues.filter(i=>i.level==="error").map(i=>i.message);
    const warns  = issues.filter(i=>i.level==="warn").map(i=>i.message);
    if (errors.length) hadErrors = true;

    health.summary.errors   += errors.length;
    health.summary.warnings += warns.length;
    health.items.push({ slug: pkg.meta?.slug ?? slugFromPath, file, errors, warnings: warns });

    if (STRICT && (errors.length || warns.length)) {
      console.error(`--strict: halting on ${errors.length} error(s), ${warns.length} warning(s) in ${file}`);
      process.exit(1);
    }

    const slug = pkg.meta?.slug ?? slugFromPath;
    const outFile = path.join(PKG_CFG.outPackages, `${slug}.json`);
    await writeJson(outFile, pkg);
    console.log("✔ built", outFile);

    const price = pkg.details_and_trust?.pricing ?? {};
    const has_price = !!((price.one_time ?? 0) > 0 || (price.monthly ?? 0) > 0);
    catalog.push({
      id: pkg.meta.id, slug, service: pkg.meta.service ?? service, name: pkg.meta.name, tier: pkg.meta.tier,
      summary: pkg.hero?.summary, tags: pkg.meta.tags ?? [], badges: pkg.meta.badges ?? [], has_price,
    });
  }

  await writeJson(PKG_CFG.outIndex, catalog);
  if (PKG_CFG.includeHealth) await writeJson(PKG_CFG.outHealth, health);
  if (PKG_CFG.includeHashes) await writeJson(PKG_CFG.outHashes, nextHashes);

  if (hadErrors) { console.error("❌ Authoring errors found (see health.json)."); process.exit(1); }
}
main().catch(e => { console.error(e); process.exit(1); });
```

---

# 4) `scripts/packages/build-routes.ts`

```ts
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
import fse from "fs-extra";
import { PKG_CFG } from "./packages.config.js";

async function main() {
  const files = await glob(path.join(PKG_CFG.outPackages, "*.json"));
  const routes: Record<string, string> = {};
  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    routes[data.meta.slug] = PKG_CFG.toRegistryImport(data.meta.service, data.meta.slug);
  }
  await fse.ensureDir(path.dirname(PKG_CFG.outRoutes));
  await fs.writeFile(PKG_CFG.outRoutes, JSON.stringify(routes, null, 2), "utf8");
  console.log("✔ built", PKG_CFG.outRoutes);
}
main().catch(e => { console.error(e); process.exit(1); });
```

---

# 5) `scripts/packages/build-cards.ts`

```ts
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
import fse from "fs-extra";
import { PKG_CFG } from "./packages.config.js";

type Card = {
  slug: string;
  title: string;
  summary?: string;
  badges?: string[];
  tags?: string[];
  image?: { src: string; alt: string };
  priceTeaser?: string;
};

function priceTeaser(p?: { one_time?: number|null; monthly?: number|null }) {
  if (!p) return;
  const one = p.one_time ?? 0, mon = p.monthly ?? 0;
  if (one > 0 && mon > 0) return `From $${one.toLocaleString()} + $${mon.toLocaleString()}/mo`;
  if (one > 0) return `From $${one.toLocaleString()}`;
  if (mon > 0) return `From $${mon.toLocaleString()}/mo`;
}

async function main() {
  const files = await glob(path.join(PKG_CFG.outPackages, "*.json"));
  const rows: Card[] = [];

  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    rows.push({
      slug: data.meta.slug,
      title: data.meta.name,
      summary: data.hero?.summary,
      badges: data.meta.badges,
      tags: data.meta.tags,
      image: data.hero?.image,
      priceTeaser: priceTeaser(data.details_and_trust?.pricing),
    });
  }

  await fse.ensureDir(path.dirname(PKG_CFG.outCards));
  await fs.writeFile(PKG_CFG.outCards, JSON.stringify(rows, null, 2), "utf8");
  console.log("✔ built", PKG_CFG.outCards);
}
main().catch(e => { console.error(e); process.exit(1); });
```

---

# 6) `scripts/packages/build-unified-search.ts` (optional)

```ts
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
import fse from "fs-extra";
import { PKG_CFG } from "./packages.config.js";

type Doc = {
  id: string; slug: string; service?: string; name?: string;
  summary?: string; tags?: string[]; badges?: string[];
};
type Index = { vocab: Record<string, number[]>; docs: Doc[] };

function tokenize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

async function main() {
  const files = await glob(path.join(PKG_CFG.outPackages, "*.json"));
  const docs: Doc[] = [];
  const vocab: Record<string, number[]> = {};

  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    const d: Doc = {
      id: data.meta.id,
      slug: data.meta.slug,
      service: data.meta.service,
      name: data.meta.name,
      summary: data.hero?.summary,
      tags: data.meta.tags ?? [],
      badges: data.meta.badges ?? [],
    };
    const idx = docs.push(d) - 1;

    const bag: string[] = [
      data.meta.name,
      data.hero?.summary ?? "",
      ...(data.meta.tags ?? []),
      ...(data.meta.badges ?? []),
      ...(data.what_you_get?.features ?? []).map((x:any)=> typeof x==="string" ? x : x?.label).filter(Boolean),
      ...(data.what_you_get?.includes ?? []).flatMap((g:any)=> g.items).map((x:any)=> typeof x==="string" ? x : x?.label).filter(Boolean),
    ].filter(Boolean);

    for (const t of new Set(bag.flatMap(tokenize))) (vocab[t] ||= []).push(idx);
  }

  const outFile = path.join(PKG_CFG.outSearchDir, "unified.search.json");
  await fse.ensureDir(path.dirname(outFile));
  await fs.writeFile(outFile, JSON.stringify(<Index>{ vocab, docs }, null, 2), "utf8");
  console.log("✔ built", outFile);
}
main().catch(e => { console.error(e); process.exit(1); });
```

---

# 7) `scripts/packages/validate-package-data.ts`

```ts
/**
 * Validates all generated per-slug JSON files with Zod (runtime contract).
 */
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
// Path alias '@/*' should resolve via tsconfig
import { PackageSchema } from "@/packages/lib/package-schema";

async function main() {
  const files = await glob("src/data/packages/__generated__/packages/*.json");
  let failing = false;

  for (const f of files) {
    try {
      const data = JSON.parse(await fs.readFile(f, "utf8"));
      PackageSchema.parse(data);
      console.log("✔ validated", path.basename(f));
    } catch (e: any) {
      console.error("❌ schema validation failed for", f);
      console.error(e?.issues ?? e);
      failing = true;
    }
  }
  if (failing) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
```

---

# 8) `scripts/packages/doctor-content.ts` (optional)

```ts
/**
 * Fast authoring lint (does not write outputs).
 */
import fs from "node:fs/promises";
import glob from "fast-glob";
import matter from "gray-matter";
import { PKG_CFG } from "./packages.config.js";

const STRICT = process.argv.includes("--strict");
let warns = 0;

async function main() {
  const files = await glob(PKG_CFG.contentGlob);

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const { data: fm, content } = matter(raw);

    const slugFromPath = file.split("/").at(-2);
    if (fm.slug && fm.slug !== slugFromPath) {
      console.warn(`⚠️  Slug mismatch: frontmatter="${fm.slug}" path="${slugFromPath}" (${file})`); warns++;
    }
    if (!/^\s*##\s+Purpose\b/im.test(content)) {
      console.warn(`⚠️  Missing "## Purpose" section in ${file}`); warns++;
    }
    if (!fm.summary) {
      console.warn(`⚠️  Missing hero.summary in ${file}`); warns++;
    }
    const hasGroups = Array.isArray(fm.includesGroups) && fm.includesGroups.length > 0;
    const hasTable  = !!fm.includesTable;
    if (!hasGroups && !hasTable) {
      console.warn(`⚠️  Add "includesGroups" or "includesTable" in ${file}`); warns++;
    }
  }

  if (STRICT && warns) {
    console.error(`❌ doctor found ${warns} warning(s) in --strict mode`);
    process.exit(1);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
```

---

# 9) `scripts/packages/changed-slugs.ts` (optional)

```ts
/**
 * Print slugs that changed vs. main, to speed partial builds.
 * Usage: node/tsx scripts/packages/changed-slugs.ts | xargs -I{} npm run data:build -- --slug {}
 */
import { execSync } from "node:child_process";

function main() {
  const diff = execSync("git diff --name-only origin/main...HEAD", { stdio: ["ignore","pipe","ignore"] }).toString();
  const lines = diff.split("\n").filter(Boolean);
  const slugs = new Set<string>();
  for (const l of lines) {
    const m = l.match(/content\/packages\/catalog\/([^/]+)\/([^/]+)\/public\.mdx$/);
    if (m) slugs.add(m[2]);
  }
  process.stdout.write(Array.from(slugs).join("\n"));
}
main();
```

---

# 10) Registry helpers

## `scripts/packages/registry/scaffold-registry.ts` (optional)

```ts
/**
 * Create a new registry stub folder for a given service/slug.
 * Usage: tsx scripts/packages/registry/scaffold-registry.ts --service seo --slug keyword-audits
 */
import path from "node:path";
import fs from "node:fs/promises";
import fse from "fs-extra";

const svcIdx = process.argv.indexOf("--service");
const slugIdx = process.argv.indexOf("--slug");
const service = svcIdx > -1 ? process.argv[svcIdx + 1] : undefined;
const slug    = slugIdx > -1 ? process.argv[slugIdx + 1] : undefined;

if (!service || !slug) {
  console.error('Usage: --service <service> --slug <slug>');
  process.exit(1);
}

async function main() {
  const dir = path.join("src/packages/registry", service, slug);
  await fse.ensureDir(dir);
  const base = `import json from "@/data/packages/__generated__/packages/${slug}.json";\nimport { PackageSchema } from "@/packages/lib/package-schema";\nexport default PackageSchema.parse(json);\n`;
  await fs.writeFile(path.join(dir, "base.ts"), base, "utf8");

  const cards = `import base from "./base";\nexport default {\n  slug: base.meta.slug,\n  title: base.meta.name,\n  summary: base.hero?.summary,\n  badges: base.meta.badges,\n  tags: base.meta.tags,\n  image: base.hero?.image,\n} as const;\n`;
  await fs.writeFile(path.join(dir, "cards.ts"), cards, "utf8");

  console.log("✔ scaffolded", dir);
}
main().catch(e => { console.error(e); process.exit(1); });
```

## `scripts/packages/registry/sync-registry.ts`

```ts
/**
 * Ensure base.ts exists (always refreshed) & cards.ts exists (if missing).
 */
import path from "node:path";
import fs from "node:fs/promises";
import fse from "fs-extra";
import glob from "fast-glob";

async function main() {
  const files = await glob("src/data/packages/__generated__/packages/*.json");
  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    const { service, slug } = data.meta;
    const dir = path.join("src/packages/registry", service, slug);
    await fse.ensureDir(dir);

    const baseContent =
`import json from "@/data/packages/__generated__/packages/${slug}.json";
import { PackageSchema } from "@/packages/lib/package-schema";
const base = PackageSchema.parse(json);
export default base;
`;

    await fs.writeFile(path.join(dir, "base.ts"), baseContent, "utf8");

    const cardsPath = path.join(dir, "cards.ts");
    const hasCards = await fse.pathExists(cardsPath);
    if (!hasCards) {
      const cardsContent =
`import base from "./base";
const card = {
  slug: base.meta.slug,
  title: base.meta.name,
  summary: base.hero?.summary,
  badges: base.meta.badges,
  tags: base.meta.tags,
  image: base.hero?.image,
} as const;
export default card;
`;
      await fs.writeFile(cardsPath, cardsContent, "utf8");
    }

    console.log("✔ synced", dir);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
```

## `scripts/packages/registry/prune-registry.ts`

```ts
/**
 * Remove registry folders without a generated JSON counterpart.
 */
import path from "node:path";
import fs from "node:fs/promises";
import fse from "fs-extra";
import glob from "fast-glob";

async function main() {
  const jsonFiles = await glob("src/data/packages/__generated__/packages/*.json");
  const valid = new Set(jsonFiles.map(f => f.split("/").at(-1)!.replace(".json","")));

  const regRoots = await glob("src/packages/registry/*", { onlyDirectories: true });
  for (const serviceDir of regRoots) {
    const slugs = await glob(path.join(serviceDir, "*"), { onlyDirectories: true });
    for (const slugDir of slugs) {
      const slug = slugDir.split("/").at(-1)!;
      if (!valid.has(slug)) {
        await fse.remove(slugDir);
        console.log("🗑  pruned", slugDir);
      }
    }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
```

## `scripts/packages/registry/check-registry.ts`

```ts
/**
 * CI parity check: registry slugs exactly match generated slugs.
 */
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";

async function main() {
  const jsonFiles = await glob("src/data/packages/__generated__/packages/*.json");
  const generated = new Set(jsonFiles.map(f => f.split("/").at(-1)!.replace(".json","")));

  const regSlugs: string[] = [];
  const regRoots = await glob("src/packages/registry/*", { onlyDirectories: true });
  for (const serviceDir of regRoots) {
    const slugs = await glob(path.join(serviceDir, "*"), { onlyDirectories: true });
    regSlugs.push(...slugs.map(s => s.split("/").at(-1)!));
  }
  const reg = new Set(regSlugs);

  const missing = [...generated].filter(s => !reg.has(s));
  const extra   = [...reg].filter(s => !generated.has(s));

  if (missing.length || extra.length) {
    console.error("❌ Registry check failed");
    if (missing.length) console.error("Missing in registry:", missing.join(", "));
    if (extra.length)   console.error("Extra in registry:", extra.join(", "));
    process.exit(1);
  }
  console.log("✔ registry matches generated slugs");
}
main().catch(e => { console.error(e); process.exit(1); });
```

---

## Done ✅

Drop these files into `scripts/packages/`, install the deps, add the `package.json` scripts, and run:

```bash
npm run data:all
```

That will create the full `src/data/packages/__generated__/**` tree (per-slug JSON, index, routes, cards, search, health, hashes) and ensure your `src/packages/registry/**` stubs are in sync.
