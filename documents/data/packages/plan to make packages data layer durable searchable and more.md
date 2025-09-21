Here’s a clear plan to make your “Packages” data layer durable, searchable, and easy to author—while keeping the human-readable .md files that marketing likes.

---

# Executive summary

* **Keep TS/JSON as the Single Source of Truth (SSOT)** for all **machine-critical** fields (IDs, slugs, prices, tiers, service slugs, relationships).
* **Use Markdown/MDX for long-form, human text** (package narratives, rationale, FAQs, change logs).
* **Do not read .md files directly at runtime**. Instead, compile them at build time into a **generated content map** keyed by slug.
* **Wire everything through Zod + validators** you already have, and extend the **scripts/packages** pipeline to:

  1. validate JSON/TS,
  2. compile MD/MDX to HTML (or MDX AST) per slug,
  3. **attach compiled content** to the corresponding package/bundle,
  4. **emit a search index** (minisearch) with the structured fields + text.

This gets you consistent UI, strong typing, editor-friendly .md, and great search—without runtime MD parsing or data drift.

---

# What’s working today

* ✅ Strong type foundations: `src/data/packages/_types`, `_utils`, `_validators` (nice).
* ✅ Domain validators & CLI checks (`validate-packages.ts`, `check-featured-refs.ts`, `check-growth-embeds.ts`, `packages-stats.ts`, `doctor.ts`).
* ✅ Structured JSON/TS for **bundles**, **addOns**, **featured**.
* ✅ App pages and components already consume typed data arrays (and you’ve fixed pathing issues like the `bridge-growth` import).

---

# The pain points

1. **Duplication + drift risk:** You have both `.md` and `.ts` files per package/service. Without a binding step, content can go stale.
2. **.md is not compiled or surfaced** in UI consistently (no unified way to display narrative content on detail pages).
3. **Search** has to span structured fields (service, price, tier) **and** free text (narratives, includes)—you need a derived index.
4. **Featured & cross-refs** live in multiple places (.ts, .json), so it’s easy to introduce subtle mismatches.

---

# Recommended directory layout

Keep **structured data** in `src/data/packages/…`. Move **authoring markdown** to a separate, content-focused tree:

```
src/
  data/
    packages/
      _types/
      _utils/
      _validators/
      addOns.json
      featured.json
      bundles.json
      index.ts
      recommendations.ts
      ...service folders with TS only (remove md here)
  content/
    packages/
      bundles/
        digital-transformation-starter.mdx
        ecommerce-accelerator.mdx
        event-launch-domination.mdx
        local-business-growth.mdx
        thought-leadership-authority.mdx
      services/
        seo/
          seo-services-packages.mdx
          seo-services-featured.mdx
        webdev/
          web-development-packages.mdx
          web-development-featured.mdx
        ... (mirrors the services)
```

Why?

* **Separation of concerns**: `data = SSOT` (typed), `content = prose` (authoring).
* **Cleaner reviews**: Marketing edits `.mdx` without wading into TypeScript.
* **Build step compiles content**, attaches to the data via slug → no runtime MD parsing.

> If you prefer to keep `.md` under `src/data/packages`, it will still work—just make the build script read from there. But long-term, `src/content/packages` is cleaner.

---

# How the build should work (high level)

Extend your existing `scripts/packages/build.ts` (you already have a scaffold) to:

1. **Read structured data** (bundles/addOns/featured + typed service TS).
2. **Parse MD/MDX** with frontmatter (using `gray-matter`) from `src/content/packages/...`.
3. **Compile** the body to HTML (or MDX) once at build time (e.g., `@mdx-js/mdx` or `next-mdx-remote/rsc` in a Node context).
4. **Attach** compiled content to the matching bundle/service by `slug`.

   * New field on bundle: `content?: { html: string; excerpt?: string; wordCount: number; updatedAt?: string }`
5. **Emit a search index** JSON (minisearch) with carefully chosen fields:

   * `id, slug, service, tier, title/name, summary, highlights, includesText (flattened), contentText (md stripped), price bands`
   * Write it to `public/search/packages.json` (or behind a route).
6. Run validators **after** attachment to ensure everything still matches (e.g., featured slugs exist, pricing sanity, etc.).

This keeps UI rendering fast (no MD parsing at runtime) and makes search instant.

---

# Markdown/MDX frontmatter template

Use the slug as the binding key. Keep frontmatter **minimal**—don’t repeat machine fields (price, service, tier) already in TS/JSON.

```md
---
slug: digital-transformation-starter
title: "Digital Transformation Starter"
summary: "Kickstart your modern stack with a pragmatic, measurable plan."
updatedAt: "2025-02-01"
# (optional) tags: ["webdev", "seo"]
# (optional) heroImage: "/images/packages/dts-hero.jpg"
---

We begin with discovery and a technical baseline. Expect a clear roadmap, early wins,
and a foundation that compounds over time.

## What’s inside

- Architecture review & plan
- Analytics baseline, dashboards, KPI instrumentation
- Accessibility & performance pass
```

At build time:

* **Frontmatter** is parsed and put on `bundle.content.meta` (title/summary override if you want).
* **Body** becomes `bundle.content.html` (or `mdxSource`).

---

# How to display the MD content

In your package detail page (`app/packages/[bundle]/page.tsx`), just render the compiled HTML when present:

```tsx
// inside BundleDetailPage
{bundle.content?.html && (
  <FullWidthSection constrained containerSize="wide" padded>
    <Container size="wide" tone="surface" padded>
      <article className="prose prose-slate max-w-none" 
               dangerouslySetInnerHTML={{ __html: bundle.content.html }} />
    </Container>
    <Divider variant="constrained" />
  </FullWidthSection>
)}
```

If you prefer MDX components (shortcodes, custom components), you can emit an MDX-compiled tree instead of HTML and render with your MDX runtime—just still **compile at build**.

---

# Search: what to index & how

Create `scripts/packages/build-search-index.ts` or fold into your existing `build.ts`:

* Use `minisearch` server-side to compute the index:

  * `fields`: `name`, `summary`, `highlights`, `includesText`, `contentText` (stripped MD), `service`, `tier`, `keywords`.
  * `storeFields`: `id`, `slug`, `service`, `tier`, `price`, `badge`, `excerpt`.
* Write to `public/search/packages.json`.
* Client side: your search UI imports this single JSON; no expensive processing in the browser.

---

# Should we store .md files here—or in docs?

* **For package marketing copy that appears on the site**, keep it in **`src/content/packages`** and compile into the app.
* **For internal documentation only** (process notes, internal pricing worksheets), use `/docs` or a separate Knowledge Base—**do not ship** to the app bundle.
* Avoid a half-way state where `.md` tries to be data (prices, tiers). The authoritative machine fields already exist in TS/JSON.

---

# Concrete action items

1. **Move prose** to `src/content/packages/...` (or keep in place temporarily but plan to move).
2. **Add/extend build step** (you already have `scripts/packages/build.ts`):

   * Parse MDX via `gray-matter`, compile to HTML/MDX.
   * Attach to bundles by `slug`.
   * Emit `public/search/packages.json`.
3. **Update bundle type** to include content:

   ```ts
   // src/data/packages/_types/packages.types.ts
   export type PackageContent = {
     html: string;
     excerpt?: string;
     updatedAt?: string;
     wordCount?: number;
   };

   export interface IntegratedBundle {
     id: string;
     slug: string;
     title: string;
     // ...
     content?: PackageContent; // ← new
   }
   ```
4. **Render content** on the bundle detail page when available (as above).
5. **Keep validators** as the gatekeepers:

   * featured slugs exist → `check-featured-refs.ts`
   * growth embed sanity → `check-growth-embeds.ts`
   * schema + cross-refs → `validate-packages.ts`
6. **(Optional)** add a **sync checker** that warns if a bundle has MD frontmatter fields that try to override SSOT fields (e.g., price or tier) and blocks it—prevent drift.

---

# Example: tiny build helper (Node)

Below is a trimmed utility you can fold into `scripts/packages/build.ts` (you already have the CLI scaffolding). It compiles `.mdx` to HTML and returns a content map keyed by slug.

```ts
// scripts/packages/lib/compile-mdx.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { rehype } from "rehype";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

export type CompiledContent = {
  html: string;
  excerpt?: string;
  updatedAt?: string;
  wordCount?: number;
  meta?: Record<string, unknown>;
};

export function compileMdxDir(dir: string): Record<string, CompiledContent> {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  const out: Record<string, CompiledContent> = {};

  for (const file of files) {
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, "utf8");
    const fm = matter(raw, { excerpt_separator: "<!-- more -->" });

    // compile md → html (no custom components in this minimal sample)
    const html = rehype()
      .data("settings", { fragment: true })
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync(fm.content).toString();

    const slug = (fm.data.slug as string) ?? path.basename(file, path.extname(file));
    const wordCount = fm.content.trim().split(/\s+/).length;

    out[slug] = {
      html,
      excerpt: typeof fm.excerpt === "string" ? fm.excerpt : undefined,
      updatedAt: typeof fm.data.updatedAt === "string" ? fm.data.updatedAt : undefined,
      wordCount,
      meta: fm.data as Record<string, unknown>,
    };
  }
  return out;
}
```

And in your build:

```ts
// scripts/packages/build.ts (excerpt)
import path from "node:path";
import { compileMdxDir } from "./lib/compile-mdx";
import bundles from "../../src/data/packages/bundles.json";

const CONTENT_DIR = path.resolve("src/content/packages/bundles");
const contentBySlug = compileMdxDir(CONTENT_DIR);

const enriched = bundles.map((b: any) => ({
  ...b,
  content: contentBySlug[b.slug] ? {
    html: contentBySlug[b.slug].html,
    excerpt: contentBySlug[b.slug].excerpt,
    updatedAt: contentBySlug[b.slug].updatedAt,
    wordCount: contentBySlug[b.slug].wordCount,
  } : undefined
}));

// write optional generated file if you want
// fs.writeFileSync("src/data/packages/bundles.enriched.json", JSON.stringify(enriched, null, 2), "utf8");
```

This is minimal—feel free to upgrade to `@mdx-js/mdx` if you need MDX components.

---

# Is displaying `.md` better than `.ts`?

* For **long-form narrative**: **Yes**—MD/MDX is better. Editors can write. You can style via `.prose` classes.
* For **structured fields** (price, tier, service slug, IDs, relationships, featured order): **No**—**TS/JSON** must remain the source of truth. Your validators & code depend on that consistency.

The hybrid approach above gives you both strengths without the drift.

---

## TL;DR next steps

1. Adopt `src/content/packages/**` for all authoring markdown.
2. Extend `scripts/packages/build.ts` to compile & attach markdown to bundles and emit a search index.
3. Render `bundle.content.html` on bundle pages.
4. Keep TS/JSON as authoritative for data, and run your validators as CI gates.

If you want, I can furnish the full upgraded `build.ts` with MDX compilation + minisearch indexing wired into your current CLI output.
