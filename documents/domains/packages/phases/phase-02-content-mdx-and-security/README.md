Perfect—here are the **production-ready docs** for **Phase 02 — Content MDX & Security**.
They’re written to drop straight into:

```
documents/domains/packages/phases/phase-02-content-mdx-and-security/
├─ _generated/index.json
├─ README.md
├─ phase-02-content-mdx-and-security_Checklist_2025-09-22.md
└─ phase-02-content-mdx-and-security_Playbook_2025-09-22.md
```

If any file already exists, merge carefully rather than overwrite.

---

## 1) `README.md`

```md
**Official Title:** Phase 02 — Content Authoring (MDX) & Security  
**Domain:** packages  
**File Name:** phase-02-content-mdx-and-security_Readme_2025-09-22.md  
**Main Part:** phase-02-content-mdx-and-security  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Author bundle narratives in MDX; sanitize and compile to HTML at build.  
- Keep prices/IDs in TypeScript SSOT only (no pricing in MDX).  
- No runtime MDX parsing—compile during `data:ci` / build.

**Summary:**  
This phase establishes the **MDX authoring surface** for bundle narratives under `src/content/packages/**`, and introduces a **locked-down sanitization pipeline** so MDX is compiled into safe HTML at build time. Authoring remains prose-only (Markdown + GFM); **no JSX components** in MDX. Output HTML is stored by the Phase 03 build in `src/data/packages/__generated__/bundles.enriched.json` and rendered by the bundle detail template. Security hardening includes a strict `rehype-sanitize` allowlist, safe links (`rel="noopener noreferrer"`), and local (or HTTPS-only) assets.
```

---

## 2) `phase-02-content-mdx-and-security_Checklist_2025-09-22.md`

```md
**Official Title:** Phase 02 — Content Authoring (MDX) & Security (Checklist)  
**Domain:** packages  
**File Name:** phase-02-content-mdx-and-security_Checklist_2025-09-22.md  
**Main Part:** phase-02-content-mdx-and-security  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Pin these rules in Codex while implementing.  
- MDX → sanitized HTML at build; no runtime parsing.

**Summary:**  
Tight, operational list to stand up MDX authoring and the sanitization config used by Phase 03.

---

## Working rules
- Work only on `feat/packages-refactor`; use **npm**; Node **20**.  
- **No runtime MD/MDX parsing**.  
- Narrative only in MDX (Markdown + GFM); **no JSX components, no scripts, no inline styles**.  
- Images/videos use `/public/...` or **HTTPS only**; prefer local assets.

## Do this (check each)
- [ ] Create content roots: `src/content/packages/bundles/` and per-service notes folders if needed.
- [ ] Add initial MDX files for **every existing bundle slug** with **`slug:` frontmatter**.
- [ ] Add **sanitization schema**: `scripts/packages/lib/sanitize-schema.ts`.
- [ ] Add **compiler lib** used by Phase 03: `scripts/packages/lib/compile-mdx.ts`.
- [ ] (Optional dev tool) Add `scripts/packages/dev/preview-mdx.ts` to test one file quickly.
- [ ] Ensure all image refs point to `/public/...` (or https). Create `/public/images/packages/bundles/<slug>/...` as needed.
- [ ] Run `npm run data:ci` (it may still call the Phase 03 build; OK as long as sanitized pipeline compiles).
- [ ] `npm run typecheck && npm run build` pass with **no runtime MDX**.

## Acceptance
- [ ] `src/content/packages/bundles/<slug>.mdx` exists for each bundle with correct `slug` frontmatter.  
- [ ] Sanitization allowlist present and used by the compiler lib.  
- [ ] No JSX/inline scripts/styles in MDX.  
- [ ] `data:ci` compiles content to HTML (Phase 03 will attach to bundles).  
- [ ] `next build` succeeds; pages do **not** parse MDX at runtime.
```

---

## 3) `phase-02-content-mdx-and-security_Playbook_2025-09-22.md`

````md
**Official Title:** Phase 02 — Content Authoring (MDX) & Security (Playbook)  
**Domain:** packages  
**File Name:** phase-02-content-mdx-and-security_Playbook_2025-09-22.md  
**Main Part:** phase-02-content-mdx-and-security  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Exact folder structure and file stubs for MDX content.  
- Hardened sanitize+compile pipeline (unified/rehype).  
- Dev helper to preview compiled HTML for a single MDX.

**Summary:**  
Follow these steps to add MDX authoring and a safe compile pipeline that Phase 03 will call to produce `content.html` for bundles.

---

## 0) Branch
```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c feat/phase-02-content-mdx-and-security
````

---

## 1) Folders & dependencies

```bash
# Content roots
mkdir -p src/content/packages/bundles

# Public asset roots (used by MDX)
mkdir -p public/images/packages/bundles

# Dev deps for compile + sanitize
npm i -D unified remark-parse remark-gfm remark-frontmatter remark-mdx remark-rehype rehype-slug rehype-autolink-headings rehype-sanitize rehype-stringify gray-matter fast-glob
```

> We compile **Markdown + GFM** safely to HTML. MDX is supported syntactically, but **JSX is disallowed** via sanitization. No runtime parsing.

---

## 2) Authoring rules (apply to all MDX)

* File path: `src/content/packages/bundles/<slug>.mdx`
* Frontmatter is **required** and must include **`slug`** that matches the bundle `slug` in `src/data/packages/bundles/*.ts`.
* **Markdown/GFM only**: headings, lists, links, tables, images, code blocks.
* **Disallowed**: `<script>`, inline `<style>`, raw HTML passthrough, JSX components, iframes unless explicitly allowed by schema (we *don’t* allow in Phase 02).
* Image refs: prefer `/images/packages/bundles/<slug>/<file>.<ext>`.

**Starter MDX example**

```mdx
---
slug: "ecommerce-accelerator"
title: "E-Commerce Accelerator"
---

## Why this bundle
An all-in-one program to grow marketplace and DTC revenue with SEO + video + paid.

### What you can expect
- Editorial calendar within 2 weeks
- First live campaign ≤ 30 days
- Weekly progress summary

> Want a custom variation? Ask for a scoped add-on.

### FAQs
**How long is onboarding?** Typically 1–2 weeks once inputs are provided.
```

---

## 3) Sanitization schema

**File:** `scripts/packages/lib/sanitize-schema.ts`

```ts
// scripts/packages/lib/sanitize-schema.ts
import type { Schema } from "hast-util-sanitize";
import { defaultSchema } from "hast-util-sanitize";

// Extend default safe schema: allow GFM tables, code, images, headings.
// NO script, NO style, NO dangerous HTML, NO iframe by default.
const schema: Schema = structuredClone(defaultSchema);

// Allow anchors with target+rel restrictions
schema.attributes = {
  ...(schema.attributes || {}),
  a: [
    ...(schema.attributes?.a || []),
    ["target", "_blank"], // only allow _blank
    ["rel", "noopener noreferrer"]
  ],
  img: [
    ...(schema.attributes?.img || []),
    ["src", /^(https?:)?\/\//], // https or protocol-relative
    ["src", /^\/[a-zA-Z0-9/_\-.]+$/], // or local /...
    ["alt", true],
    ["title", true],
    ["width", true],
    ["height", true],
    ["loading", /^(lazy|eager|auto)$/]
  ],
  code: [...(schema.attributes?.code || []), ["className", true]],
  pre: [...(schema.attributes?.pre || []), ["className", true]]
};

// Enable table elements if not already present
schema.tagNames = Array.from(
  new Set([...(schema.tagNames || []), "table", "thead", "tbody", "tr", "th", "td"])
);

// DO NOT allow style or script or on* attributes
schema.clobberPrefix = "mdx-"; // avoid id collisions

export const sanitizeSchema = schema;
```

---

## 4) MDX compiler lib (used by Phase 03 build)

**File:** `scripts/packages/lib/compile-mdx.ts`

```ts
// scripts/packages/lib/compile-mdx.ts
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { sanitizeSchema } from "./sanitize-schema";

type Compiled = { slug: string; html: string };

const CONTENT_DIR = path.resolve(process.cwd(), "src/content/packages/bundles");

export async function compileAllBundleMDX(): Promise<Compiled[]> {
  const files = await fg(["**/*.mdx"], { cwd: CONTENT_DIR, dot: false });
  const results: Compiled[] = [];

  for (const rel of files) {
    const abs = path.join(CONTENT_DIR, rel);
    const raw = await fs.readFile(abs, "utf8");
    const { content, data } = matter(raw);

    const slug = String(data?.slug || "").trim();
    if (!slug) throw new Error(`Missing required 'slug' frontmatter in ${abs}`);

    // Build: Markdown/GFM → HAST → sanitized HTML
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkFrontmatter, ["yaml"])
      .use(remarkMdx) // syntax ok, but we don't allow JSX through sanitize
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: "wrap" })
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeStringify)
      .process(content);

    const html = String(file.value);
    results.push({ slug, html });
  }

  return results;
}
```

> Phase 03 will import `compileAllBundleMDX()` and **attach** `html` to matching bundles as `content.html` in the generated JSON. Pages must never run this at runtime.

---

## 5) (Optional) Dev preview tool

**File:** `scripts/packages/dev/preview-mdx.ts`
**Purpose:** Quickly compile a single MDX to HTML during authoring.

```ts
// scripts/packages/dev/preview-mdx.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { sanitizeSchema } from "../lib/sanitize-schema";

async function main() {
  const rel = process.argv[2];
  if (!rel) {
    console.error("Usage: tsx scripts/packages/dev/preview-mdx.ts <relative-mdx-path>");
    process.exit(1);
  }
  const abs = path.resolve(process.cwd(), rel);
  const raw = await fs.readFile(abs, "utf8");
  const { content, data } = matter(raw);
  if (!data?.slug) {
    console.error("Missing 'slug' in frontmatter");
    process.exit(1);
  }

  const file = await (await import("unified")).unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkMdx)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(content);

  console.log(String(file.value));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Run locally:

```bash
npx tsx scripts/packages/dev/preview-mdx.ts src/content/packages/bundles/ecommerce-accelerator.mdx > /tmp/out.html
open /tmp/out.html
```

---

## 6) Seed MDX files for current bundles

List existing bundle slugs from the authoring TS (quick grep):

```bash
# macOS/Linux: extracts slugs from TS bundle files
grep -Rho "slug:\s*['\"][a-z0-9-]\+['\"]" src/data/packages/bundles \
  | sed -E "s/.*['\"]([a-z0-9-]+)['\"].*/\1/" \
  | sort -u
```

For each slug, create `src/content/packages/bundles/<slug>.mdx` with the **starter MDX** (Section 2) and update prose as needed.

---

## 7) Public assets (images)

Create per-bundle folders under `/public` when images are referenced:

```bash
mkdir -p public/images/packages/bundles/<slug>
# copy images into that folder, then reference in MDX as:
# ![alt text](/images/packages/bundles/<slug>/hero.png)
```

Prefer `loading="lazy"` for large images (sanitizer allows `loading` attribute).

---

## 8) Wire into build (Phase 03 will call the compiler)

Phase 03 orchestrator (`scripts/packages/build.ts`) will:

1. Collect authoring TS (bundles, packages, add-ons).
2. **Call** `compileAllBundleMDX()`.
3. Attach the `html` to matching bundles (`content: { html }`).
4. Write `src/data/packages/__generated__/bundles.enriched.json`.

For Phase 02, ensure the compiler **builds successfully** and that **no runtime MDX** is used in pages/templates.

---

## 9) Verify

```bash
# Full data pipeline (this likely calls the Phase 03 build already in your repo)
npm run data:ci

# Typecheck & build
npm run typecheck
npm run build
```

**Pass conditions**

* No sanitizer/compile errors.
* The app builds without attempting to parse MDX at runtime.
* (If Phase 03 is wired) `bundles.enriched.json` includes `content.html` for each MDX file.

---

## 10) Commit

```bash
git add -A
git commit -m "feat(phase-02): MDX authoring surface + sanitize+compile pipeline (no runtime MDX)"
git push -u origin feat/phase-02-content-mdx-and-security
```

Open a PR into `feat/packages-refactor` and ensure CI is ✅.

---

## Risks & Rollback

* **Risk:** Author adds JSX/HTML in MDX → sanitizer drops it silently → missing content.
  **Mitigation:** Lint MDX in Phase 03 or add a check rejecting MDX containing `<` tags not in allowlist.

* **Risk:** External images break CSP/perf.
  **Mitigation:** Prefer local `/public/...`; if external, use HTTPS and small sizes.

* **Rollback:** Revert this branch; MDX files remain authored but unused; pages keep rendering (no runtime MDX).

---

## Acceptance (copy to Checklist)

* MDX exists per bundle with `slug` frontmatter.
* Sanitizer schema + compiler lib present; compiler outputs HTML for all MDX.
* No runtime MD/MDX; build passes.

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "02",
  "title": "Content Authoring (MDX) & Security",
  "files": [
    "README.md",
    "phase-02-content-mdx-and-security_Checklist_2025-09-22.md",
    "phase-02-content-mdx-and-security_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### That’s it

You now have the **authoring surface**, a **locked-down sanitize+compile pipeline**, and a **clean checklist** to enforce no runtime MDX. Phase 03 will plug this compiler into the build to attach `content.html` to bundles.
