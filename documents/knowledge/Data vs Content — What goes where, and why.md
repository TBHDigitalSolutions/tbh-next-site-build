# Data vs Content — What goes where, and why

This doc explains **why we keep two separate trees** (`src/data/**` and `src/content/**`), what belongs in each, and how **MDX vs MD** fits into the plan. Keep this nearby when adding new packages, bundles, or long-form copy.

---

## The two trees (at a glance)

### `src/data/**` → **Structured, machine-critical data (SSOT)**

Use this for anything your UI/business logic depends on programmatically.

**What belongs here**

* **IDs, slugs, tiers, prices** (one-time/monthly), services, relationships.
* Lists used for logic: featured slugs, add-on references, recommendations.
* Type definitions (TS), validation (zod), small JSON blobs, helper utilities.
* **Generated artifacts** consumed at runtime (e.g., enriched JSON & search index).

**Traits**

* **Stable, typed**: lives under version control; validated in CI.
* **Queryable**: functions like `getBundleBySlug`, `getPackagesByService`.
* Drives cards, pricing tables, routing, search, and cross-refs.

**Never put here**

* Long-form narrative copy meant for humans to edit (that goes in `src/content/**`).

---

### `src/content/**` → **Editorial copy (author-friendly)**

Use this for **long-form narrative**: bundle overviews, service notes, “why it matters,” examples, FAQs, etc.

**What belongs here**

* **MDX files** with a tiny frontmatter to link back to data **by `slug`**:

  ```mdx
  ---
  slug: digital-transformation-starter
  title: Digital Transformation Starter
  summary: A pragmatic 90-day playbook to modernize your stack.
  ---
  # Digital Transformation Starter
  …
  ```

**Traits**

* **Flexible prose** (headings, lists, images). Optionally MDX shortcodes/components later.
* **No machine-critical fields** (no prices, IDs, SKUs).
* Compiled **at build time** → attached to structured data by `slug`.

**Never put here**

* Authoritative prices, SKUs, programmatic relationships. (They go in `src/data/**`.)

> **TL;DR**
> **`data`** is the *source of truth for structure and logic*.
> **`content`** is the *human prose* that we attach to data via a shared `slug`.

---

## Why two trees?

1. **Safety & clarity:** Business-critical fields (IDs/prices) are typed, validated, and tested. They don’t get “lost” in prose files.
2. **Author experience:** Non-devs (or future you) can edit narratives in MDX without touching TypeScript.
3. **Performance & SEO:** We compile MDX at **build time** (not at request time) and attach HTML to data. Pages render fast; no runtime MDX parsing.
4. **Flexibility:** You can evolve prose independently from the data model.

---

## MDX vs MD

* **MDX** = Markdown + optional JSX. You can embed shortcodes/components (now or later).
* **MD** = plain Markdown. Simpler, but no JSX.

**Our rule:** Default to **`.mdx`**. You can write plain markdown inside MDX today and add shortcodes in the future without migrations.

---

## How the pieces connect

1. You author MDX in `src/content/**` with a **frontmatter `slug`**.
2. The build script compiles MDX → **HTML**, extracts an **excerpt/wordCount**, and attaches it to the matching item in `src/data/**` (by `slug`).
3. Pages/components read **enriched data** (e.g., `bundle.content.html`) and render it inside a styled `<article className="prose">…`.

**Example render**

```tsx
// inside a bundle detail page
{bundle.content?.html && (
  <article
    className="prose prose-slate max-w-none"
    dangerouslySetInnerHTML={{ __html: bundle.content.html }}
  />
)}
```

---

## Do / Don’t quick rules

**Do (data)**

* Keep prices, tiers, IDs, relationships, featured slugs.
* Validate with zod schemas; add CI checks.
* Expose read functions (`getBundleBySlug`, `getAddOnsForService`).

**Don’t (data)**

* Don’t store long narrative descriptions intended for authoring.

**Do (content)**

* Write narratives in MDX with a `slug` in frontmatter.
* Use headings, lists, images from `public/`.
* Keep copy *descriptive*, not *authoritative* (no prices).

**Don’t (content)**

* Don’t duplicate machine-critical fields.
* Don’t invent new slugs that don’t exist in data.

---

## Minimal authoring checklist

* [ ] **Does the MDX file have a `slug`** that matches a real bundle/package?
* [ ] Is the content **free of prices/IDs**?
* [ ] Images referenced from `/public/images/...`?
* [ ] Headings use a sensible hierarchy (`#`, `##`, `###`)?
* [ ] Links use absolute or safe relative paths?

---

## When to choose MD instead of MDX?

* If you are 100% certain you will never need components/shortcodes and you want the tiniest dependency surface.
* That said, **using `.mdx` everywhere is fine**; it compiles the same and gives you future flexibility.

---

## Common pitfalls

* **Mismatched slugs:** Content won’t attach; you’ll see “no content” on pages. Fix: align `slug` and rebuild.
* **Copying prices into MDX:** Leads to drift. Keep all prices in TS/JSON under `src/data/**`.
* **Runtime MDX imports:** Don’t import MDX in components; **we compile at build time**.

---

## FAQ

**Q: Can I show MDX components (shortcodes) inside content later?**
A: Yes. Because we compile MDX at build time, you can add a safe, whitelisted set of shortcodes. Keep them purely presentational; no business logic.

**Q: Where do generated files live?**
A: `src/data/packages/__generated__/…` and they’re gitignored. They’re created by the build script.

**Q: Can I search content?**
A: Yes. We build a **search index** from structured fields + stripped content text. Use the generated `packages.search.json`.

---

## One-page reminder

* \*\*`src/data/**` = the truth (typed, validated).
* \*\*`src/content/**` = the story (MDX with `slug`).
* Build step compiles & attaches content → pages render enriched data.
* Keep prices/IDs out of MDX. Keep narratives out of TS.
