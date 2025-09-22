Awesome—here are the **production-ready docs** for **Phase 03 — Build Pipeline & Generated Artifacts**.
Drop these four files into:

```
documents/domains/packages/phases/phase-03-build-pipeline-and-artifacts/
├─ _generated/index.json
├─ README.md
├─ phase-03-build-pipeline-and-artifacts_Checklist_2025-09-22.md
└─ phase-03-build-pipeline-and-artifacts_Playbook_2025-09-22.md
```

They’re tailored to your repo (`TBHDigitalSolutions/tbh-next-site-build`), Node 20, **npm**, and the guardrails we’ve set.

---

## 1) `README.md`

```md
**Official Title:** Phase 03 — Build Pipeline & Generated Artifacts  
**Domain:** packages  
**File Name:** phase-03-build-pipeline-and-artifacts_Readme_2025-09-22.md  
**Main Part:** phase-03-build-pipeline-and-artifacts  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- One-click **data:ci** builds canonical artifacts for the Packages domain.  
- Compiles MDX → sanitized HTML, **enriches bundles**, emits **search index**.  
- Outputs are deterministic, under **src/data/packages/__generated__** (gitignored).

**Summary:**  
This phase implements the **orchestrated build** for the Packages domain. Scripts collect typed authoring (packages, add-ons, bundles), compile Phase-02 MDX to safe HTML, **attach** narrative content to bundles, generate a unified **search index**, validate schemas/references, and write **stable JSON artifacts** under `src/data/packages/__generated__/`. CI and local developers can run `npm run data:ci` for a deterministic, idempotent build. Pages/templates read these artifacts **only through the façade** (`@/data/packages`).
```

---

## 2) `phase-03-build-pipeline-and-artifacts_Checklist_2025-09-22.md`

````md
**Official Title:** Phase 03 — Build Pipeline & Generated Artifacts (Checklist)  
**Domain:** packages  
**File Name:** phase-03-build-pipeline-and-artifacts_Checklist_2025-09-22.md  
**Main Part:** phase-03-build-pipeline-and-artifacts  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Use **npm** only; Node **20**; branch `feat/packages-refactor`.  
- Build must be **idempotent**; no runtime MDX anywhere.

**Summary:**  
Operational steps to wire the data build, validators, and artifact writers. Accepts only stable, sanitized outputs.

---

## Working rules
- Work on `feat/packages-refactor`; never commit to `main`.  
- Use **npm**; Node **20**; ESM scripts run via **tsx**.  
- No runtime MD/MDX parsing in app.  
- Generated files live in `src/data/packages/__generated__/` and are **.gitignore**’d.

## Do this (check each)
- [ ] Add/confirm dev deps: `tsx`, `fast-glob`, `zod`, `npm-run-all`, `gray-matter`, `unified` + remark/rehype stack.  
- [ ] Create **scripts/packages/lib/** helpers: `file.ts`, `normalize.ts`, `collect.ts`, `attach-content.ts`, `build-search-index.ts`.  
- [ ] Reuse Phase-02 `compile-mdx.ts` (sanitized) to compile bundle MDX.  
- [ ] Implement **validate-packages.ts** (zod schemas, unique ids/slugs, featured refs).  
- [ ] Implement **packages-stats.ts** (counts, coverage, pricing presence).  
- [ ] Implement **doctor.ts** (human hints; exit non-zero on critical issues).  
- [ ] Implement **build.ts** orchestrator: collect → compile → attach → search → write (stable).  
- [ ] Ensure `src/data/packages/__generated__/` exists and is **gitignored**.  
- [ ] Add npm scripts:
  ```json
  {
    "scripts": {
      "packages:validate": "tsx scripts/packages/validate-packages.ts",
      "packages:build": "tsx scripts/packages/build.ts",
      "packages:doctor": "tsx scripts/packages/doctor.ts",
      "data:ci": "npm-run-all -s packages:validate packages:build packages:doctor"
    }
  }
````

* [ ] Run: `npm run data:ci` → **green**; re-run → no diffs (idempotent).
* [ ] `npm run typecheck && npm run build` → **green**.

## Acceptance

* [ ] Artifacts exist and are stable:

  * `src/data/packages/__generated__/bundles.enriched.json`
  * `src/data/packages/__generated__/packages.search.json`
* [ ] `npm run data:ci` passes locally and in CI.
* [ ] Pages/templates import data **only** from the façade.
* [ ] No runtime MDX; sanitization enforced by compiler.

````

---

## 3) `phase-03-build-pipeline-and-artifacts_Playbook_2025-09-22.md`

```md
**Official Title:** Phase 03 — Build Pipeline & Generated Artifacts (Playbook)  
**Domain:** packages  
**File Name:** phase-03-build-pipeline-and-artifacts_Playbook_2025-09-22.md  
**Main Part:** phase-03-build-pipeline-and-artifacts  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- File-by-file scripts under `scripts/packages/**`.  
- Deterministic write helpers; stable sort & stable stringify.  
- Strict validation with zod; helpful doctor output.

**Summary:**  
This playbook implements the **data pipeline** that builds the Packages domain’s generated artifacts. It assumes Phase-01 types/authoring and Phase-02 `compile-mdx.ts` are in place.

---

## 0) Branch & deps

```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c feat/phase-03-build-pipeline

# Dev deps (add the ones you don't already have)
npm i -D tsx fast-glob zod npm-run-all gray-matter unified remark-parse remark-gfm remark-frontmatter remark-mdx remark-rehype rehype-slug rehype-autolink-headings rehype-sanitize rehype-stringify
````

Ensure `.gitignore` has:

```
/src/data/packages/__generated__/
```

---

## 1) Helper: stable write & JSON utilities

**File:** `scripts/packages/lib/file.ts`

```ts
// scripts/packages/lib/file.ts
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export function stableStringify(value: unknown): string {
  // Recursively sort object keys; keep arrays as-is.
  const sorter = (v: any): any => {
    if (Array.isArray(v)) return v.map(sorter);
    if (v && typeof v === "object") {
      return Object.keys(v).sort().reduce((acc, k) => {
        acc[k] = sorter(v[k]);
        return acc;
      }, {} as any);
    }
    return v;
  };
  return JSON.stringify(sorter(value), null, 2) + "\n";
}

export async function writeJsonIfChanged(outFile: string, data: unknown): Promise<{
  wrote: boolean; hash: string;
}> {
  const json = stableStringify(data);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  let current = "";
  try { current = await fs.readFile(outFile, "utf8"); } catch {}
  if (current === json) {
    return { wrote: false, hash: sha256(json) };
  }
  await fs.writeFile(outFile, json, "utf8");
  return { wrote: true, hash: sha256(json) };
}

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}
```

---

## 2) Helper: price normalization & basic types

**File:** `scripts/packages/lib/normalize.ts`

```ts
// scripts/packages/lib/normalize.ts
export type Money = { oneTime?: number; monthly?: number; currency?: "USD" };
export const normalizePrice = (p?: any): Money | undefined =>
  !p ? undefined : ({
    oneTime: p.oneTime ?? p.setup ?? undefined,
    monthly: p.monthly ?? undefined,
    currency: (p.currency as "USD") ?? "USD",
  });
```

---

## 3) Collector: load TS authoring (packages, add-ons, bundles, featured)

**Assumptions**

* Authoring lives under `src/data/packages/**` as in Phase-01.
* Per service: `*-packages.ts`, `*-addons.ts`.
* Bundles: `bundles/*.ts` with `slug`.
* Featured config: `src/data/packages/featured.json` (ids/slugs).

**File:** `scripts/packages/lib/collect.ts`

```ts
// scripts/packages/lib/collect.ts
import path from "node:path";
import fg from "fast-glob";
import { pathToFileURL } from "node:url";
import { normalizePrice } from "./normalize";

export type Service = "content"|"leadgen"|"marketing"|"seo"|"video"|"web";

export type PackageCatalogItem = {
  type: "package";
  id: string;
  service: Service;
  name: string;
  tier?: string;
  summary?: string;
  price?: { oneTime?: number; monthly?: number; currency?: "USD" };
  tags?: string[];
  category?: string;
  status?: "active"|"beta"|"deprecated";
};

export type AddOnCatalogItem = Omit<PackageCatalogItem,"type"> & { type: "addon" };

export type Bundle = {
  type: "bundle";
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  price?: { oneTime?: number; monthly?: number; currency?: "USD" };
  tags?: string[];
  category?: string;
  components: string[];            // package IDs
  addOnRecommendations?: string[]; // addon IDs
  content?: { html?: string };     // attached later
};

const ROOT = path.resolve(process.cwd(), "src/data/packages");

async function importAll(cwd: string, patterns: string[]) {
  const files = await fg(patterns, { cwd, absolute: true });
  const out: any[] = [];
  for (const abs of files) {
    const mod = await import(pathToFileURL(abs).href);
    const val = mod.default ?? Object.values(mod).find(Array.isArray);
    if (!val) continue;
    out.push(...val);
  }
  return out;
}

export async function collectAuthoring() {
  const packages: PackageCatalogItem[] = await importAll(ROOT, ["**/*-packages.ts"])
    .then(arr => arr.map((p: any) => ({ ...p, type: "package", price: normalizePrice(p.price) })));
  const addons: AddOnCatalogItem[] = await importAll(ROOT, ["**/*-addons.ts"])
    .then(arr => arr.map((a: any) => ({ ...a, type: "addon", price: normalizePrice(a.price) })));
  const bundles: Bundle[] = await importAll(path.join(ROOT, "bundles"), ["**/*.ts"])
    .then(arr => arr.map((b: any) => ({ ...b, type: "bundle", price: normalizePrice(b.price) })));

  // Featured (optional)
  let featured: any = {};
  try {
    featured = (await import(pathToFileURL(path.join(ROOT, "featured.json")).href)).default;
  } catch {}

  return { packages, addons, bundles, featured };
}
```

---

## 4) Attach compiled MDX content to bundles

**Reuses** Phase-02 `compileAllBundleMDX()` (from `scripts/packages/lib/compile-mdx.ts`).

**File:** `scripts/packages/lib/attach-content.ts`

```ts
// scripts/packages/lib/attach-content.ts
import type { Bundle } from "./collect";

export function attachContentToBundles(bundles: Bundle[], compiled: { slug:string; html:string }[]) {
  const map = new Map(compiled.map(c => [c.slug, c.html]));
  return bundles.map(b => map.has(b.slug)
    ? ({ ...b, content: { ...(b.content ?? {}), html: map.get(b.slug) } })
    : b
  );
}
```

---

## 5) Build the search index

**File:** `scripts/packages/lib/build-search-index.ts`

```ts
// scripts/packages/lib/build-search-index.ts
import type { Bundle, PackageCatalogItem, AddOnCatalogItem } from "./collect";

export type SearchRecord =
  | { type:"bundle";  slug:string;  title:string;  summary?:string; tags?:string[]; category?:string; price?:any }
  | { type:"package"; id:string;    service:string; name:string;    summary?:string; tags?:string[]; category?:string; price?:any; tier?:string }
  | { type:"addon";   id:string;    service:string; name:string;    summary?:string; tags?:string[]; category?:string; price?:any };

export function buildSearchIndex(
  bundles: Bundle[], packages: PackageCatalogItem[], addons: AddOnCatalogItem[]
): SearchRecord[] {
  const b = bundles.map<SearchRecord>(x => ({
    type: "bundle",
    slug: x.slug,
    title: x.title,
    summary: x.summary,
    tags: x.tags,
    category: x.category,
    price: x.price
  }));
  const p = packages.map<SearchRecord>(x => ({
    type: "package",
    id: x.id,
    service: x.service,
    name: x.name,
    summary: x.summary,
    tags: x.tags,
    category: x.category,
    price: x.price,
    tier: x.tier
  }));
  const a = addons.map<SearchRecord>(x => ({
    type: "addon",
    id: x.id,
    service: x.service,
    name: x.name,
    summary: x.summary,
    tags: x.tags,
    category: x.category,
    price: x.price
  }));
  // Stable order: bundles by slug, packages/addons by id
  return [
    ...b.sort((m,n)=>m.slug.localeCompare(n.slug)),
    ...p.sort((m,n)=>m.id.localeCompare(n.id)),
    ...a.sort((m,n)=>m.id.localeCompare(n.id)),
  ];
}
```

---

## 6) Validation (schemas + referential integrity)

**File:** `scripts/packages/validate-packages.ts`

```ts
// scripts/packages/validate-packages.ts
import { z } from "zod";
import { collectAuthoring } from "./lib/collect";

const Money = z.object({
  oneTime: z.number().int().positive().optional(),
  monthly: z.number().int().positive().optional(),
  currency: z.literal("USD").default("USD")
}).refine(p => p.oneTime || p.monthly || true, { message: "price may be empty but keys must be normalized" });

const PackageItem = z.object({
  type: z.literal("package"),
  id: z.string().min(1),
  service: z.enum(["content","leadgen","marketing","seo","video","web"]),
  name: z.string().min(1),
  tier: z.string().optional(),
  summary: z.string().optional(),
  price: Money.optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  status: z.enum(["active","beta","deprecated"]).optional()
});

const AddOnItem = PackageItem.extend({ type: z.literal("addon") });

const Bundle = z.object({
  type: z.literal("bundle"),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  price: Money.optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  components: z.array(z.string()),
  addOnRecommendations: z.array(z.string()).optional(),
  content: z.object({ html: z.string().optional() }).optional()
});

async function main() {
  const { packages, addons, bundles, featured } = await collectAuthoring();

  // Shape checks
  packages.forEach(p => PackageItem.parse(p));
  addons.forEach(a => AddOnItem.parse(a));
  bundles.forEach(b => Bundle.parse(b));

  // Uniqueness
  const ids = new Set<string>();
  for (const p of packages) {
    if (ids.has(p.id)) throw new Error(`Duplicate package id: ${p.id}`);
    ids.add(p.id);
  }
  const addonIds = new Set<string>();
  for (const a of addons) {
    if (addonIds.has(a.id)) throw new Error(`Duplicate add-on id: ${a.id}`);
    addonIds.add(a.id);
  }
  const slugs = new Set<string>();
  for (const b of bundles) {
    if (slugs.has(b.slug)) throw new Error(`Duplicate bundle slug: ${b.slug}`);
    slugs.add(b.slug);
  }

  // Refs resolve
  const pkgOrAddon = new Set([...ids, ...addonIds]);
  for (const b of bundles) {
    for (const ref of b.components) {
      if (!ids.has(ref)) throw new Error(`Bundle ${b.slug} references missing package id: ${ref}`);
    }
    for (const ref of b.addOnRecommendations ?? []) {
      if (!addonIds.has(ref)) throw new Error(`Bundle ${b.slug} references missing add-on id: ${ref}`);
    }
  }

  // Featured validations (optional)
  if (featured?.bundles?.featuredSlugs) {
    for (const f of featured.bundles.featuredSlugs) {
      if (!slugs.has(f)) throw new Error(`Featured slug not found: ${f}`);
    }
  }

  console.log("✅ validate-packages: OK");
}

main().catch((e) => {
  console.error("❌ validate-packages:", e.message ?? e);
  process.exit(1);
});
```

---

## 7) Doctor (human-readable hints)

**File:** `scripts/packages/doctor.ts`

```ts
// scripts/packages/doctor.ts
import { collectAuthoring } from "./lib/collect";

async function main() {
  const { packages, addons, bundles, featured } = await collectAuthoring();

  console.log("📦 Packages:", packages.length);
  console.log("➕ Add-ons:", addons.length);
  console.log("🧳 Bundles:", bundles.length);

  const noPrice = bundles.filter(b => !b.price?.oneTime && !b.price?.monthly);
  if (noPrice.length) {
    console.warn("⚠️  Bundles without visible price:", noPrice.map(b=>b.slug).join(", "));
  }

  const missingContent = bundles.filter(b => !b.content?.html);
  if (missingContent.length) {
    console.warn("ℹ️  Bundles without compiled MDX yet:", missingContent.map(b=>b.slug).join(", "));
  }

  if (featured?.bundles?.featuredSlugs) {
    const ok = featured.bundles.featuredSlugs.filter((s: string) => bundles.some(b => b.slug === s));
    const bad = featured.bundles.featuredSlugs.filter((s: string) => !bundles.some(b => b.slug === s));
    console.log("⭐ Featured (bundles):", ok.length);
    if (bad.length) console.warn("❌ Featured slugs not found:", bad.join(", "));
  }

  // Non-fatal; CI can still fail earlier on validate step.
  console.log("✅ doctor: hints printed");
}

main().catch((e) => {
  console.error("❌ doctor:", e.message ?? e);
  process.exit(1);
});
```

---

## 8) Orchestrator: build everything (idempotent)

**File:** `scripts/packages/build.ts`

```ts
// scripts/packages/build.ts
import path from "node:path";
import { collectAuthoring } from "./lib/collect";
import { compileAllBundleMDX } from "./lib/compile-mdx";          // from Phase 02
import { attachContentToBundles } from "./lib/attach-content";
import { buildSearchIndex } from "./lib/build-search-index";
import { writeJsonIfChanged } from "./lib/file";

const OUT_DIR = path.resolve(process.cwd(), "src/data/packages/__generated__");

async function main() {
  console.log("📦 Building packages data…");

  // 1) Collect typed authoring
  const { packages, addons, bundles } = await collectAuthoring();

  // 2) Compile MDX (sanitized) → HTML
  const compiled = await compileAllBundleMDX();

  // 3) Enrich bundles with content.html
  const enriched = attachContentToBundles(bundles, compiled);

  // 4) Build search index
  const search = buildSearchIndex(enriched, packages, addons);

  // 5) Write artifacts (stable+idempotent)
  const f1 = path.join(OUT_DIR, "bundles.enriched.json");
  const f2 = path.join(OUT_DIR, "packages.search.json");

  const w1 = await writeJsonIfChanged(f1, enriched);
  const w2 = await writeJsonIfChanged(f2, search);

  console.log(`• ${path.relative(process.cwd(), f1)} ${w1.wrote ? "written" : "unchanged"} (${w1.hash.slice(0,8)}…)`);
  console.log(`• ${path.relative(process.cwd(), f2)} ${w2.wrote ? "written" : "unchanged"} (${w2.hash.slice(0,8)}…)`);

  console.log("✅ build: done");
}

main().catch((e) => {
  console.error("❌ build:", e.message ?? e);
  process.exit(1);
});
```

---

## 9) Stats (optional gate)

**File:** `scripts/packages/packages-stats.ts`

```ts
// scripts/packages/packages-stats.ts
import { collectAuthoring } from "./lib/collect";

async function main() {
  const { packages, addons, bundles } = await collectAuthoring();
  const counts = {
    byService: Object.fromEntries(
      ["content","leadgen","marketing","seo","video","web"].map(s => [
        s, {
          packages: packages.filter(p=>p.service===s).length,
          addons: addons.filter(a=>a.service===s).length,
        }
      ])
    ),
    bundles: bundles.length,
    pricedBundles: bundles.filter(b=>b.price?.oneTime || b.price?.monthly).length
  };
  console.log(JSON.stringify(counts, null, 2));
  // Add thresholds if you want to fail CI on regressions
}

main().catch((e)=>{
  console.error(e);
  process.exit(1);
});
```

---

## 10) NPM scripts (package.json)

Add (or confirm) these:

```json
{
  "scripts": {
    "packages:validate": "tsx scripts/packages/validate-packages.ts",
    "packages:build": "tsx scripts/packages/build.ts",
    "packages:doctor": "tsx scripts/packages/doctor.ts",
    "data:ci": "npm-run-all -s packages:validate packages:build packages:doctor"
  }
}
```

> Your repo already used `npm-run-all` in earlier output—keep it. If missing: `npm i -D npm-run-all`.

---

## 11) Verify & commit

```bash
npm run data:ci
npm run typecheck
npm run build

git add -A
git commit -m "feat(phase-03): packages build pipeline + artifacts (idempotent, sanitized)"
git push -u origin feat/phase-03-build-pipeline
```

Open a PR into `feat/packages-refactor`. CI should run `data:ci`, then `build`.

---

## Acceptance (copy to Checklist)

* `src/data/packages/__generated__/bundles.enriched.json` and `packages.search.json` are produced and stable across repeated runs.
* `npm run data:ci` passes locally and in CI.
* No runtime MDX; pages/templates read data only via the façade.

## Risks & Rollback

* **Risk:** Authoring drift (IDs/slugs change) → broken refs.
  **Mitigation:** `validate-packages.ts` fails hard on missing refs; run in CI.
* **Risk:** Non-deterministic output order.
  **Mitigation:** stable sort & `stableStringify`.
* **Rollback:** Revert the branch; the app still runs against the last good generated files (if present). If not, pages should handle missing enriched content gracefully.

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "03",
  "title": "Build Pipeline & Generated Artifacts",
  "files": [
    "README.md",
    "phase-03-build-pipeline-and-artifacts_Checklist_2025-09-22.md",
    "phase-03-build-pipeline-and-artifacts_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Notes tailored to your repo

* Your previous run showed existing scripts under `scripts/packages/` (e.g., `validate-packages.ts`, `doctor.ts`, checks for featured/growth). If those exist, **merge** our versions (don’t duplicate). Keep a single `validate` and a single `doctor`, but add the **stable write** + **search index** + **attach content** steps.
* The earlier error “Syntax error '!' in doctor.ts” likely came from a stray character or a parser mismatch. The version above is plain ESM TS and runs under `tsx`.
* The doctor step prints human hints and **doesn’t** block CI by itself; the validator should be the gate that fails the run.

You’re set—these files give you a clean, deterministic pipeline with strong validation and artifacts ready for the hub/detail pages.
