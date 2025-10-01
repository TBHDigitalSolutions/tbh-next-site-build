---
title: "Frontmatter Template"
domain: "documentation"
file: "frontmatter-template_2025-10-01.md"
main: "frontmatter-template"
qualifier: "Template"
date: "2025-10-01"
time: "5:47pm"
status: "Approved"
owners: ["@TBH_DigitalSolutions"]
tags: ["frontmatter","metadata","yaml","standards","templates"]
spotlight:
  - "Shows how to draft metadata in Markdown and convert to YAML frontmatter"
  - "Defines canonical schema for all documentation files"
  - "Explains when to use human-readable vs machine-readable formats"
summary: "This template provides a standard method for generating frontmatter headers in two formats: Markdown metadata for human drafting and YAML frontmatter for machine parsing. Use it to ensure all documentation files are consistent, discoverable, and compatible with Next.js, Contentlayer, Obsidian, and SiYuan."
links:
  related:
    - title: "Git Docs Index"
      href: "./git-docs_Index_2025-10-01.md"
---

# 📄 `docs/frontmatter-template.md`

# Frontmatter Template (Team Use)

This file shows how to capture and structure document metadata in two ways:
1. **Markdown Metadata (Human-Readable)** → use this format when drafting new docs, sharing in chat, or collaborating in plain English.
2. **YAML Frontmatter (Machine-Readable)** → use this format at the top of `.md`/`.mdx` files so our site generators (Next.js + Contentlayer, Obsidian, SiYuan, etc.) can parse the data.

---

## ✍️ Step 1: Draft in Human-Readable Markdown

```markdown
**Official Title:** Project Documents Handbook  
**Domain:** project  
**File Name:** project-documents_Handbook_2025-09-21.md  
**Main Part:** project-documents  
**Qualifier:** Handbook  
**Date:** 2025-09-21  
**Time:** 12:02pm  

**Spotlight Comments:**
- Canonical rules for structure, naming, headers, and cross-linking  
- Basis for docs validation and generated indexes  
- Pairs with the Indexing & Linking Standard  

**Summary:**  
This handbook defines our documentation operating model: folder roles, filename conventions, required headers, linking rules, lifecycle and status. It is the **single source of truth** for authors and reviewers.  

**See also:**  
- [Indexing & Linking Standard](./documents-indexing-linking_Standard_2025-09-21.md)  
- [Refactor Plan & Ideal Structure](./documents-directory_RefactorPlan_2025-09-21.md)  
```
---

## ⚙️ Step 2: Convert to YAML Frontmatter (Final Output)

Paste this block at the top of your `.md` or `.mdx` file (between `---` fences):

```yaml
---
title: "Project Documents Handbook"
domain: "project"
file: "project-documents_Handbook_2025-09-21.md"
main: "project-documents"
qualifier: "Handbook"
date: "2025-09-21"
time: "12:02pm"
status: "Approved"
owners: ["@conor"]
tags: ["docs","standards","indexing"]
spotlight:
  - "Canonical rules for structure, naming, headers, and cross-linking"
  - "Basis for docs validation and generated indexes"
  - "Pairs with the Indexing & Linking Standard"
summary: "This handbook defines our documentation operating model: folder roles, filename conventions, required headers, linking rules, lifecycle and status. It is the **single source of truth** for authors and reviewers."
links:
  related:
    - title: "Indexing & Linking Standard"
      href: "./documents-indexing-linking_Standard_2025-09-21.md"
    - title: "Refactor Plan & Ideal Structure"
      href: "./documents-directory_RefactorPlan_2025-09-21.md"
---
````

---

## 📌 When to Use Each

* ✅ **Markdown Metadata (Step 1)**
  Use when brainstorming, drafting, or collaborating (e.g., Slack, Notion, Google Docs). It’s quick, readable, and non-technical teammates can edit it.

* ✅ **YAML Frontmatter (Step 2)**
  Use when committing to the repo in `.md` or `.mdx` files. This is required for parsing by site generators (Next.js + Contentlayer), and knowledge tools (Obsidian, SiYuan).

---

👉 Workflow Recommendation:

1. Draft **Markdown metadata** in discussions or proposals.
2. Once finalized, convert it into **YAML frontmatter** and paste it at the top of the doc before committing.

```

---

Would you like me to also include a **checklist** at the bottom of this template (like “Did you add owners? Did you set status? Did you add related links?”) so contributors don’t miss fields?

