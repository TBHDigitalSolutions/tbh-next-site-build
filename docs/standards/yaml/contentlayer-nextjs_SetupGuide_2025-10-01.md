---
title: "Contentlayer + Next.js Setup Guide"
domain: "documentation"
file: "contentlayer-nextjs_SetupGuide_2025-10-01.md"
main: "contentlayer-nextjs"
qualifier: "SetupGuide"
date: "2025-10-01"
time: "16:45"
status: "Draft"
owners:
  - "@conorhovis1"
tags:
  - "nextjs"
  - "contentlayer"
  - "documentation"
  - "mdx"
  - "zod"
  - "setup"
spotlight:
  - "Shows how to configure Contentlayer with Next.js and MDX"
  - "Defines schema using Zod for strong typing"
  - "Provides example MDX with YAML frontmatter"
  - "Explains how to render docs in Next.js App Router"
  - "Includes best practices for dates, times, links, and validation"
summary: "A clean, copy-pasteable guide to setting up Contentlayer with Next.js. Covers schema definition with Zod, authoring MDX docs with frontmatter, rendering with the App Router, and best practices for metadata consistency. Includes code samples for config, pages, and validation helpers."
links:
  related:
    - title: "Git Daily Workflow Guide"
      href: "./git-workflow_Guide_2025-10-01.md"
    - title: "Frontmatter Template (Team Use)"
      href: "./frontmatter-template.md"
    - title: "Git Docs Index"
      href: "./git-docs_Index_2025-10-01.md"
---

Totally—here’s a clean, copy-pasteable **Contentlayer + Next.js** setup showing what your **frontmatter** looks like, how to **type it with Zod**, and how to **render** it. It uses the structured `links.related` object style (`{ title, href }`) so you can reliably query and display it.

---

# Contentlayer + Next.js Setup Guide

## 🎯 Purpose & Application

**Purpose**
This document exists to give you a **repeatable, production-friendly pattern** for wiring up **Contentlayer** with **Next.js** when building a documentation or knowledge site. It provides both the **schema definition** (with Zod typing for safety) and the **practical steps** to create, author, and render MDX documents with structured frontmatter.

**Why this matters**
Without a consistent schema and frontmatter standard, your docs become messy: inconsistent fields, broken related links, and difficult-to-parse metadata. By following this setup, you ensure that every `.mdx` file:

* Has a predictable structure (`title`, `summary`, `tags`, `links`, etc.)
* Can be validated automatically at build-time
* Works across tools (Next.js, Contentlayer, Obsidian, SiYuan, Notion exports)
* Produces clean indexes, related-links panels, and consistent UI across all docs

**When to apply it**
Use this setup whenever you are:

* **Starting a new Next.js documentation site** and need a strong metadata schema.
* **Migrating existing Markdown/MDX docs** into a structured format with validation.
* **Adding a new document type** (like Guides, Tools, Indexes) that needs metadata for navigation and related links.
* **Ensuring consistency across a team** so all contributors write frontmatter the same way.

**Practical tip**
Draft your frontmatter in the **Markdown human-readable format** (Official Title, Spotlight, Summary, etc.) when collaborating in chat, docs, or planning. Then convert it into **YAML frontmatter** before committing to the repo. This workflow balances clarity for humans and strictness for machines.

---

# 1) Contentlayer config (schema)

`/contentlayer.config.ts`

```ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import { z } from "zod";

const Links = z.object({
  related: z.array(
    z.object({
      title: z.string(),
      href: z.string(), // allow relative or absolute URL
    })
  ).default([]),
});

export const Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `**/*.md?(x)`, // all .md and .mdx in /content
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    domain: { type: "string", default: "docs" },
    file: { type: "string", required: false },        // optional if you want to mirror filename
    main: { type: "string", required: true },
    qualifier: { type: "string", required: true },    // e.g., Guide, Index, Tool
    date: { type: "date", required: true },           // ISO yyyy-mm-dd
    time: { type: "string", required: false },        // "14:30" (24h) or "11:47am | 11:47"
    status: { type: "string", default: "Draft" },
    owners: { type: "list", of: { type: "string" }, default: ["@conorhovis1"] },
    tags: { type: "list", of: { type: "string" }, default: [] },
    spotlight: { type: "list", of: { type: "string" }, default: [] },
    summary: { type: "string", required: true },
    // Store `links` as JSON so we can validate with Zod:
    links: {
      type: "json",
      required: false,
      description: "Related links (arrays of {title, href})",
    },
  },
  // run-time validation/normalization with Zod:
  extensions: {
    computedFields: {
      slug: {
        type: "string",
        resolve: (doc) =>
          doc._raw.flattenedPath.replace(/^content\//, "").replace(/\/index$/, ""),
      },
    },
  },
  // Validate the links shape after parsing:
  // (Contentlayer doesn’t run Zod here directly; you can normalize in `onBeforeWrite`)
}));

export default makeSource({
  contentDirPath: "content", // where your md/mdx files go
  documentTypes: [Doc],
});
```

> Tip: If you want stricter runtime validation of `links`, keep the `json` type in Contentlayer and validate/normalize it in your rendering code (or switch to Content Collections in Astro-style; for Next+Contentlayer this pattern is common).

---

# 2) Example MDX with frontmatter (your authors write this)

`/content/github/git-workflow_Guide_2025-10-01.mdx`

```mdx
---
title: "Git Daily Workflow"
domain: "docs"
file: "git-workflow_Guide_2025-10-01.md"
main: "git-workflow"
qualifier: "Guide"
date: "2025-10-01"
time: "14:30"
status: "Approved"
owners:
  - "@conorhovis1"
tags:
  - "git"
  - "github"
  - "workflow"
  - "vs-code"
spotlight:
  - "Day-to-day Git commands from VS Code terminal"
  - "Explains origin vs upstream and push variants"
summary: "A practical, step-by-step guide for daily Git use—status, stage, commit, push, upstream setup, and common fixes."
links:
  related:
    - { title: "Git Workflow Cheat Sheet", href: "./git-workflow_CheatSheet_2025-10-01.md" }
    - { title: "Git Health Tool", href: "./git-health_Tool_2025-10-01.md" }
    - { title: "Git Glossary", href: "./git-glossary_Reference_2025-10-01.md" }
---

# Git Daily Workflow

…your MDX content here…
```

> Note the `links.related` items use the **object style** (`{ title, href }`) so your UI can render a tidy “Related” panel without parsing Markdown.

---

# 3) Rendering in Next.js (App Router)

Fetch and list docs:

`/app/docs/page.tsx`

```tsx
import { allDocs, Doc } from "contentlayer/generated";
import Link from "next/link";

export default function DocsIndexPage() {
  const docs = allDocs.sort((a, b) => (a.date > b.date ? -1 : 1));
  return (
    <main className="prose">
      <h1>Docs</h1>
      <ul>
        {docs.map((d: Doc) => (
          <li key={d._id}>
            <Link href={`/docs/${d.slug}`}>{d.title}</Link>
            <div className="text-sm text-gray-500">{d.summary}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

Render a single doc (+ “Related” links):

`/app/docs/[slug]/page.tsx`

```tsx
import { allDocs } from "contentlayer/generated";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";

export async function generateStaticParams() {
  return allDocs.map((d) => ({ slug: d.slug }));
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const doc = allDocs.find((d) => d.slug === params.slug);
  if (!doc) return notFound();

  const MDX = useMDXComponent(doc.body.code);

  const related = (doc.links?.related ?? []) as { title: string; href: string }[];

  return (
    <main className="prose mx-auto py-8">
      <h1>{doc.title}</h1>
      <p className="text-sm text-gray-500">
        {doc.date} {doc.time ? `• ${doc.time}` : ""} • {doc.qualifier}
      </p>

      <MDX />

      {related.length > 0 && (
        <>
          <h2>Related</h2>
          <ul>
            {related.map((item) => (
              <li key={item.href}>
                {/* If you mix internal & external links, add a check for absolute URLs */}
                <Link href={item.href}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
```

---

# 4) Optional: type-safe helper for related links

If you want stronger typing when reading `links`:

```ts
type RelatedLink = { title: string; href: string };

function getRelated(doc: any): RelatedLink[] {
  const raw = doc?.links?.related;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x: any) => x && typeof x.title === "string" && typeof x.href === "string")
    .map((x: any) => ({ title: x.title, href: x.href }));
}
```

---

# 5) Notes & best practices

* **Dates**: keep `date` ISO (`YYYY-MM-DD`) so you can sort easily.
* **Times**: use `"HH:MM"` 24-hour (your Time Field Standard); if you must preserve 12-hour, store `"11:47am | 11:47"`.
* **Frontmatter keys**: avoid nested Markdown strings; prefer structured JSON (`links.related`) for rendering.
* **Relative links**: using `./file.md(x)` works; you can also precompute clean slugs in `computedFields` if you want `/docs/...` links.

If you want, I can adapt this template to your exact fields (owners/tags/spotlight) and wire a small `<RelatedLinks />` React component to reuse across pages.

---

Yes — you’ve got the right idea. A Next.js + Contentlayer setup like the one I showed is a solid, production-friendly way to build a documentation site.

Here’s a quick ✅ checklist to make sure it all clicks:

# 1) Install the pieces

```bash
npm i contentlayer next-contentlayer @types/node
npm i -D esbuild zod
```

If you’re using MDX:

```bash
npm i -D @mdx-js/react
```

# 2) Wire Contentlayer into Next

**`contentlayer.config.ts`** — define your document schema (fields like `title`, `summary`, `links.related: [{title, href}]`, etc).
**`next.config.mjs`** — wrap with the Contentlayer plugin:

```js
import { withContentlayer } from "next-contentlayer";
const nextConfig = { reactStrictMode: true };
export default withContentlayer(nextConfig);
```

# 3) Put your docs in `/content`

Example: `/content/github/git-workflow_Guide_2025-10-01.mdx` with the YAML frontmatter we discussed. Keep your date/time formats consistent with your Time Field Standard.

# 4) Create pages to render docs

* **Index** (lists docs): `/app/docs/page.tsx`
* **Doc page** (renders one doc): `/app/docs/[slug]/page.tsx`
* Use `useMDXComponent(doc.body.code)` to render MDX.
* Render `links.related` as a “Related” section.

# 5) Add build/dev scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "contentlayer build && next build",
    "start": "next start",
    "content": "contentlayer build --watch"
  }
}
```

Contentlayer runs automatically during `next dev`, but keeping an explicit script helps in CI.

# 6) Slugs & links

* Compute a `slug` in `computedFields` (e.g., from the path/filename).
* In `links.related`, use structured objects `{ title, href }` so you can render a clean Related list.
* Use relative links (e.g., `./git-workflow_Guide_2025-10-01.md`) or map to route paths (e.g., `/docs/git-workflow-guide`). If you prefer pretty URLs, compute and store a `route` in `computedFields`.

# 7) Deploy (e.g., Vercel)

* Your `build` script already triggers `contentlayer build` → `next build`.
* Push to GitHub; connect repo to Vercel; it just works.

# Common pitfalls (and quick fixes)

* **MDX fails to render** → make sure you import `useMDXComponent` from `next-contentlayer/hooks` and your page is a Client Component only if needed (most doc pages can be server components; the MDX renderer is server-safe).
* **Dates don’t sort correctly** → use ISO `YYYY-MM-DD` in frontmatter (Contentlayer parses as Date if the field type is `date`).
* **Frontmatter validation** → keep `links` as JSON in frontmatter; optionally validate with Zod in your render helper.
* **Broken relative links** → if you stick with `./file.md`, either resolve to your routing scheme at render time or set a `permalink`/`route` field in `computedFields`.

If you want, I can generate:

* a ready-to-drop **`contentlayer.config.ts`** tailored to your exact fields,
* the **`/app/docs`** pages, and
* a small `<RelatedLinks />` component that cleanly handles internal vs external URLs.
